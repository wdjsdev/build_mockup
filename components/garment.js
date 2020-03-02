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
		if(this.garmentFile)
		{
			this.makeMockup(this.garmentFile);
		}
		else
		{
			errorList.push("Failed to find a mockup or converted template file for: " + this.garmentCode + "_" + this.styleNumber);
			log.e("Failed to find a mockup or converted template file for: " + this.garmentCode + "_" + this.styleNumber);
		}
	}


	this.makeMockup = function(file)
	{
		this.openFile(file);
		this.mockupDocument = currentMockup = app.activeDocument;

		if(this.youthGarmentFile)
		{
			var youthDoc = this.openFile(this.youthGarmentFile);
			mergeTemplate(currentMockup);
			filesToClose.push(youthDoc);
			currentMockup.activate();
		}

		currentMockup.saveAs(this.getSaveFile());
		curGarmentIndex++;
		
		this.recolorGarment(this.garmentColors)

		for(var g in this.graphics)
		{
			curGraphic = this.graphics[g];

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

		if(womensCodePat.test(this.adultGarmentCode))
		{
			this.youthGarmentCode = this.adultGarmentCode.replace(womensCodePat,"G");
		}
		else if(girlsCodePat.test(this.adultGarmentCode))
		{
			this.youthGarmentCode = this.adultGarmentCode;
			this.adultGarmentCode = this.youthGarmentCode.replace(girlsCodePat,"");
		}
		else
		{
			this.youthGarmentCode = this.adultGarmentCode;
			this.adultGarmentCode = this.youthGarmentCode.replace(youthCodePat,"");
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
			if(/_[\d]*_/.test(ph))
			{
				//wonky data.. ignore it.
				continue;
			}
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
		var swatches = [];

		for(var s=0,len=doc.swatches.length;s<len;s++)
		{
			swatches.push(doc.swatches[s]);
		}




		var phNumber,phSwatch;
		for(var ph in colors)
		{
			if(/_[\d]*_/.test(ph))
			{
				//wonky data.. ignore it.
				continue;
			}
			phNumber = ph.replace(/[a-z]/gi,"");
			phSwatch = findPHSwatch(phNumber,colors[ph]);
		}

		function findPHSwatch(num,color)
		{
			color.swatchName = BUILDER_COLOR_CODES[color.colorCode];
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
			// this.garmentFile = this.getFile(this.adultGarmentFolder,this.styleNumber);
			this.garmentFile = getFile(this.adultGarmentFolder,this.styleNumber);
		}
		if(this.youthGarmentFolder)
		{
			// this.youthGarmentFile = this.getFile(this.youthGarmentFolder,this.styleNumber);
			this.youthGarmentFile = getFile(this.youthGarmentFolder,this.styleNumber);
		}
	}

	this.getSaveFile = function()
	{
		var reverse = config.reverse ? "_B" : "";
		return File(curOrderFolder.fsName + "/" + orderNumber + "_MASTER_" + designNumber + this.suffix + ".ai");
	}

	this.getGraphics = function()
	{
		var curGraphic,colorCode;

		for(var g in this.graphics)
		{
			curGraphic = this.graphics[g];

			//strip out any vestigial appendages
			curGraphic.name = curGraphic.name.replace(vestigialAppendagePat,"");

			//get the style number for this graphic
			curGraphic.styleNumber = this.getGraphicStyleNumber(curGraphic.name);

			//if the graphic is a name or number, update the code
			curGraphic.name = curGraphic.name.replace(nameNumberPat,"fdsp-fdsn_");

			curGraphic.folder = locateGraphicFolder(curGraphic.name,curGraphic.lib);
			if(curGraphic.folder)
			{
				// curGraphic.file = this.getFile(curGraphic.folder,this.getGraphicStyleNumber(curGraphic.name));
				curGraphic.file = getFile(curGraphic.folder,curGraphic.styleNumber);
			}
			else
			{
				curGraphic.file = undefined;
				continue;
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
		return app.activeDocument;
	}

}