//config is the entire config or configReverse object
//data is the top or bottom object
function Garment(config,data,designNumber)
{
	this.designNumber = designNumber;
	this.garmentCode = "";
	this.garmentFolder;
	this.garmentFile;
	this.styleNumber = "";
	this.garmentColors = data.colors;
	this.graphics = config.graphics;
	this.saveFile;
	this.mockupDocument;




	this.init = function()
	{
		this.setGarmentCodes();
		this.setStyleNumber();
		this.getGarments();
		this.getGraphics();
	}





	this.processGarment = function()
	{
		this.makeMockup(this.garmentFile);
		if(this.youthGarmentFile)
		{
			this.makeMockup(this.youthGarmentFile);
		}
	}


	this.makeMockup = function(file)
	{
		this.openFile(file);
		currentMockup = this.mockupDocument = app.activeDocument;
		currentMockup.saveAs(this.getSaveFile());
		curGarmentIndex++;
		this.recolorGarment(this.garmentColors)

		for(var g in this.graphics)
		{
			if(this.graphics[g].file)
			{
				this.openFile(this.graphics[g].file);
				this.recolorGraphic(this.graphics[g].colors);
			}
		}

	}

	this.setGarmentCodes = function()
	{
		if(!data.mid)
		{
			//strip the style number from the garment code
			var verboseGarmentCode = data.garment.replace(data.styleNo,"");
			verboseGarmentCode = verboseGarmentCode.substring(0,verboseGarmentCode.lastIndexOf("-"));
			data.mid = checkForMidGarmentRelationship(verboseGarmentCode);
		}

		this.adultGarmentCode = data.mid;

		if(womensCodePat.test(data.mid))
		{
			this.youthGarmentCode = data.mid.replace(womensCodePat,"G");
		}
		else
		{
			this.youthGarmentCode = data.mid + "Y";
		}
	}

	this.setStyleNumber = function()
	{
		this.styleNumber = data.styleNo;
	}

	this.recolorGarment = function(colors)
	{
		var doc = app.activeDocument;
		var curGStyle,patternFile;
		var placeholderPrefix = topOrBottomSwatches();
		var curPlaceholderName;
		for(var ph in colors)
		{
			colors[ph].swatchName = BUILDER_COLOR_CODES[colors[ph].colorCode];
			curPlaceholderName = placeholderPrefix + ph.substring(1,ph.length);
			colors[ph].id = curPlaceholderName;
			curGStyle = new GraphicStyle(colors[ph]);
			curGStyle.init();
			currentMockup.activate();
			this.applyGraphicStyle(curPlaceholderName,curGStyle.style)
		}
		this.garmentColors = data.colors;
	}

	this.recolorGraphic = function(colors)
	{
		var doc = app.activeDocument;
		var swatches = doc.swatches;


		var phNumber,phSwatch;
		for(var ph in colors)
		{
			phNumber = ph.replace(/[a-z]/gi,"");
			phSwatch = findPHSwatch(phNumber,colors[ph]);
		}

		function findPHSwatch(num,color)
		{
			var swatchName;
			for(var s=0,len=swatches.length;s<len;s++)
			{
				swatchName = swatches[s].name.replace(/[a-z]/gi,"");
				if(swatchName == num)
				{
					mergeSwatches(swatches[s].name,color.swatchName);
				}
			}
		}
	}

	this.applyGraphicStyle = function(placeholder)
	{
		var doc = app.activeDocument;
		doc.selection = null;
		doc.defaultFillColor = makeNewSpotColor(placeholder).color;
		app.executeMenuCommand("Find Fill Color menu item");

		function dig(curItem)
		{
			if(curItem.typename === "PathItem")
			{
				gs.applyTo(curItem);
			}
			else if(curItem.typename === "CompoundPathItem" && curItem.pathItems.length)
			{
				gs.applyTo(curItem.pathItems[0]);
			}
			else if(curItem.typename === "GroupItem")
			{
				for(var g=0,len=curItem.pageItems.length;g<len;g++)
				{
					dig(curItem.pageItems[g]);
				}
			}
		}


		try
		{
			var gs = doc.graphicStyles[placeholder];
			for(var cc=0,len=doc.selection.length;cc<len;cc++)
			{
				dig(doc.selection[cc]);
			}
		}
		catch(e)
		{
			doc.defaultFillColor = makeNewSpotColor(this.garmentColors[placeholder].swatchName).color;
		}
	}

	this.getGarments = function()
	{
		this.adultGarmentFolder = locateCTFolder(this.adultGarmentCode);
		
		//if this garment is a bag, there's no youth sizing.. skip this part.
		if(data.garment.toLowerCase().indexOf("bag") === -1)
		{
			this.youthGarmentFolder = locateCTFolder(this.youthGarmentCode);
		}
		if(this.adultGarmentFolder)
		{
			this.garmentFile = this.getFile(this.adultGarmentFolder,this.styleNumber);
		}
		if(this.youthGarmentFolder)
		{
			this.youthGarmentFile = this.getFile(this.youthGarmentFolder,this.styleNumber);
		}
	}

	this.getSaveFile = function()
	{
		return File(curOrderFolder.fsName + "/" + orderNumber + "_MASTER_" + curGarmentIndex + ".ai");
	}

	this.getFile = function(folder,style)
	{
		var searchStr = "*-" + style + "*";
		var files = folder.getFiles(searchStr);
		var file;
		if(!files.length)
		{
			searchStr = searchStr.replace("-","_");
			files = folder.getFiles(searchStr);
			if(files.length)
			{
				file = files[0];
			}

		}
		else
		{
			file = files[0];
		}
		return file;
	}

	this.getGraphics = function()
	{
		var curGraphic,colorCode;

		for(var g in this.graphics)
		{
			curGraphic = this.graphics[g];
			curGraphic.folder = locateGraphicFolder(curGraphic.name,curGraphic.lib);
			if(curGraphic.folder)
			{
				curGraphic.file = this.getFile(curGraphic.folder,this.getGraphicStyleNumber(curGraphic.name));
			}
			for(var c in curGraphic.colors)
			{
				colorCode = curGraphic.colors[c].colorCode;
				curGraphic.colors[c].swatchName = BUILDER_COLOR_CODES[colorCode];
			}
		}
	}

	

	this.getGraphicStyleNumber = function(name)
	{
		return name.substring(name.lastIndexOf("-")+1,name.length);
	}

	this.openFile = function(file)
	{
		app.open(file);
	}

}