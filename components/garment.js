//config is the entire config or configReverse object
//data is the top or bottom object
function Garment(config,data,designNumber)
{
	this.designNumber = designNumber;
	this.garmentCode = "";
	this.garmentFolder;
	this.garmentFile;
	this.styleNumber = "";
	this.fileSuffix; //this is like a _A or _B for reversible garments
	this.garmentColors = data.colors;
	this.graphics = config.graphics;
	this.saveFile;
	this.mockupDocument;




	this.init = function()
	{
		log.l("Initializing garmemnt object.");
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
		app.executeMenuCommand("fitall");

		if(this.youthGarmentFile)
		{
			var youthDoc = this.openFile(this.youthGarmentFile);
			mergeTemplate(currentMockup);
			filesToClose.push(youthDoc);
			currentMockup.activate();
			app.executeMenuCommand("fitall");
		}

		this.saveFile = this.getSaveFile();

		currentMockup.saveAs(this.saveFile);
		curGarmentIndex++;
		
		this.recolorGarment(this.garmentColors);

		if(this.saveFile)
		{
			this.mockupDocument.save();
		}

		//make a graphics folder to save the recolored graphics
		localGraphicsFolderPath = curOrderFolderPath + "/" + this.designNumber + "_assets";
		localGraphicsFolder = Folder(localGraphicsFolderPath);
		if(!localGraphicsFolder.exists)
		{
			log.l("Creating localGraphicsFolder here: " + localGraphicsFolderPath);
			localGraphicsFolder.create();
		}

		var curGraphic,graphicSaveFile,graphicSaveFileName;
		var curAppendage;
		var graphicAppendagePat = /_[\d].ai$/;
		log.l("Looping graphics for the mockup: " + this.saveFile.name);
		for(var g in this.graphics)
		{
			log.l("Processing graphic: " + g);
			curGraphic = this.graphics[g];

			if(this.graphics[g].file)
			{
				this.openFile(this.graphics[g].file);
				this.recolorGraphic(this.graphics[g].colors);
				graphicsOpened++;

				graphicSaveFileName = localGraphicsFolderPath + "/" + this.graphics[g].name + ".ai"
				graphicSaveFile = File(graphicSaveFileName);
				while(graphicSaveFile.exists)
				{
					if(graphicAppendagePat.test(graphicSaveFileName))
					{
						curAppendage = graphicSaveFileName.substring(graphicSaveFileName.lastIndexOf("_")+1,graphicSaveFileName.indexOf(".ai"));
						curAppendage = parseInt(curAppendage);
						graphicSaveFileName = graphicSaveFileName.replace(graphicAppendagePat,"_" + (curAppendage + 1));
					}
					else
					{
						graphicSaveFileName = graphicSaveFileName.replace(".ai","_2.ai")
					}
					graphicSaveFile = File(graphicSaveFileName);
				}

				app.activeDocument.saveAs(graphicSaveFile);
				log.l("Successfully opened, recolored, and saved: " + g + ", as " + graphicSaveFile.fullName);

			}
		}

	}

	this.setGarmentCodes = function()
	{
		log.l("setting garment codes")
		if(!data.mid)
		{
			log.l("No mid value.. trying to parse it from the verbose garment code");
			//strip the style number from the garment code
			var verboseGarmentCode = data.garment.replace(data.styleNo,"");
			verboseGarmentCode = verboseGarmentCode.substring(0,verboseGarmentCode.lastIndexOf("-"));
			data.mid = checkForMidGarmentRelationship(verboseGarmentCode);
			log.l("set data.mid to " + data.mid);
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
		else if(youthCodePat.test(this.adultGarmentCode))
		{
			this.youthGarmentCode = this.adultGarmentCode;
			this.adultGarmentCode = this.youthGarmentCode.replace(youthCodePat,"");
		}
		else
		{
			this.youthGarmentCode = this.adultGarmentCode + "Y";

		}
		log.l("set adultGarmentCode to " + this.adultGarmentCode);
		log.l("set youthGarmentCode to " + this.youthGarmentCode);

	}

	this.setStyleNumber = function()
	{
		this.styleNumber = data.styleNo;

		var fulldyeStyleNumPat = /full[\s]?dye$/i;

		this.styleNumber = this.styleNumber.replace(fulldyeStyleNumPat,"1000");

		log.l("Successfully set style number. Converted: " + data.styleNo + " to " + this.styleNumber);

	}

	this.recolorGarment = function(colors)
	{
		log.h("Recoloring garment.");
		var doc = app.activeDocument;
		hidePPLay();
		var curGStyle,patternFile;
		var placeholderPrefix = topOrBottomSwatches();
		// var placeholderPrefix = "C";
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
			this.applyGraphicStyle(curPlaceholderName)
			log.l("created graphic style: " + curPlaceholderName);
		}
		this.garmentColors = data.colors;
	}

	this.recolorGraphic = function(colors)
	{
		log.h("Recoloring graphic");
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
			log.l("Recolored " + ph + " with " + colors[ph]);
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
		log.h ("Applying graphic style: " + placeholder);
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
		log.l("Getting garments.");
		scriptTimer.beginTask("getGarments");
		this.adultGarmentFolder = locateCTFolder(this.adultGarmentCode);
		
		//if this garment is a bag, there's no youth sizing.. skip this part.
		if(data.garment.toLowerCase().indexOf("bag") === -1)
		{
			this.youthGarmentFolder = locateCTFolder(this.youthGarmentCode);
		}
		if(this.adultGarmentFolder)
		{
			// this.garmentFile = this.getFile(this.adultGarmentFolder,this.styleNumber);
			this.garmentFile = getFile(this.adultGarmentFolder,this.styleNumber,this.adultGarmentCode + "_" + this.styleNumber + this.fileSuffix);
		}
		if(this.youthGarmentFolder)
		{
			// this.youthGarmentFile = this.getFile(this.youthGarmentFolder,this.styleNumber);
			this.youthGarmentFile = getFile(this.youthGarmentFolder,this.styleNumber,this.youthGarmentCode + "_" + this.styleNumber + this.fileSuffix);
		}

		log.l("adult garment file: " + this.garmentFile);
		log.l("youth garment file: " + this.youthGarmentFile);

		scriptTimer.endTask("getGarments");
	}

	this.getSaveFile = function()
	{
		var fileName = curOrderFolderPath + "/" + orderNumber + "_Master_" + designNumber + this.suffix + ".ai"
		log.l("this.saveFile = " + fileName);
		return File(fileName);
	}

	this.getGraphics = function()
	{
		log.h("Getting Graphics.");
		scriptTimer.beginTask("getGraphics");
		var curGraphic,colorCode,skipThisGraphic;
		var skipGraphics = ["provided","custom","onfile","fullcustom"];

		for(var g in this.graphics)
		{

			curGraphic = this.graphics[g];
			//check first to see if this graphic is something worth grabbing at all..
			//check for PROVIDED, CUSTOM, or ONFILE

			log.l("processing graphic: " + curGraphic.name);
			
			for(var sg=0,len=skipGraphics.length;sg<len;sg++)
			{
				if(g.toLowerCase().indexOf(skipGraphics[sg])>-1)
				{
					log.l("skipping " + g)
					curGraphic.file = undefined;
					skipThisGraphic = true;
					break;
				}	
			}

			if(skipThisGraphic)
			{
				skipThisGraphic = false;
				continue;
			}
			
			//replace any hyphens with underscores
			// curGraphic.name = g.replace("-","_");

			log.l("Fixing: " + curGraphic.name);

			//if the graphic is a name or number, update the code
			curGraphic.name = curGraphic.name.replace(nameNumberPat,"fdsp-fdsn_");

			//strip out any vestigial appendages
			curGraphic.name = curGraphic.name.replace(vestigialAppendagePat,"");

			log.l("After fixing curGraphic.name = " + curGraphic.name);
			

			//get the style number for this graphic
			curGraphic.styleNumber = this.getGraphicStyleNumber(curGraphic.name);
			if(!curGraphic.styleNumber)
			{
				log.e("Failed to get the style number for " + curGraphic.name);
				errorList.push("Failed to get the style number for the graphic: " + curGraphic.name);
				continue;
			}

			

			curGraphic.folder = locateGraphicFolder(curGraphic.name,curGraphic.lib);
			if(curGraphic.folder)
			{
				// curGraphic.file = this.getFile(curGraphic.folder,this.getGraphicStyleNumber(curGraphic.name));
				curGraphic.file = getFile(curGraphic.folder,curGraphic.styleNumber,curGraphic.name);
				log.l("curGraphic.file = " + curGraphic.file);
			}
			else
			{
				curGraphic.file = undefined;
				log.l("failed to find a graphic file for " + curGraphic.name);
				continue;
			}
			for(var c in curGraphic.colors)
			{
				colorCode = curGraphic.colors[c].colorCode;
				curGraphic.colors[c].swatchName = BUILDER_COLOR_CODES[colorCode];
			}
		}

		scriptTimer.endTask("getGraphics");
	}

	

	this.getGraphicStyleNumber = function(name)
	{
		// return name.substring(name.lastIndexOf("-")+1,name.length);

		var pat = /[_-]([\d]{1,}([hgbms]{2})?$)/i;
		var result = name.match(pat);
		if(result && result.length)
		{
			return name.match(pat)[1];
		}
		else
		{
			return undefined;
		}
	}

	this.openFile = function(file)
	{
		app.open(file);
		app.executeMenuCommand("fitall");
		return app.activeDocument;
	}

}