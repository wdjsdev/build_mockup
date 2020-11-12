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
	this.adultMockupLayer;
	this.adultMockupArtboard;
	this.youthMockupLayer;
	this.youthMockupArtboard;

	this.graphicXPosition = 0;




	this.init = function()
	{
		log.l("Initializing garment object.");
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
			// errorList.push("Failed to find a mockup or converted template file for: " + this.garmentCode + "_" + this.styleNumber);
			log.e("Failed to find a mockup or converted template file for: " + this.garmentCode + "_" + this.styleNumber);
		}
	}


	this.makeMockup = function(file)
	{
		this.openFile(file);
		this.mockupDocument = currentMockup = app.activeDocument;
		app.executeMenuCommand("fitall");
		this.adultMockupLayer = findSpecificLayer(this.mockupDocument.layers[0],"Mockup");
		this.adultMockupArtboard = this.mockupDocument.artboards[0];

		if(this.youthGarmentFile)
		{
			var youthDoc = this.openFile(this.youthGarmentFile);
			mergeTemplate(currentMockup);
			this.youthMockupLayer = findSpecificLayer(this.mockupDocument.layers[1],"Mockup");
			filesToClose.push(youthDoc);
			currentMockup.activate();
			app.executeMenuCommand("fitall");
			app.redraw();
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
		var numPat = /fdsn/i;
		var namePat = /fdsp/i;
		log.l("Looping graphics for the mockup: " + this.saveFile.name);
		for(var g in this.graphics)
		{
			log.l("Processing graphic: " + g);
			curGraphic = this.graphics[g];
			curGraphic.key = g;

			if(numPat.test(g))
			{
				curGraphic.type = "number";
			}
			else if(namePat.test(g))
			{
				curGraphic.type = "name";
			}
			else
			{
				curGraphic.type = "logo";
			}

			if(curGraphic.file)
			{
				this.openFile(curGraphic.file);
				this.recolorGraphic(curGraphic.colors);
				this.processGraphic(curGraphic);
				graphicsOpened++;

				graphicSaveFileName = localGraphicsFolderPath + "/" + curGraphic.name + ".ai"
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

		if(this.adultGarmentCode == "FD-500")
		{
			this.adultGarmentCode = "FD-500W";
		}

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

		var alphaStyleNumPat = /^[a-z]*[\d]?$/i;
		this.styleNumber = this.styleNumber.replace(alphaStyleNumPat,"1000")

		log.l("Successfully set style number. Converted: " + data.styleNo + " to " + this.styleNumber);

	}

	this.recolorGarment = function(colors)
	{
		log.h("Recoloring garment.");
		var doc = app.activeDocument;
		hidePPLay();
		var curGStyle,patternFile;
		// var placeholderPrefix = topOrBottomSwatches();
		var placeholderPrefix = "C";
		var curPlaceholderName,graphicStyleName;
		for(var ph in colors)
		{
			if(/_[\d]*_/.test(ph) || colors[ph].colorCode === "")
			{
				//wonky data.. ignore it.
				continue;
			}
			colors[ph].swatchName = BUILDER_COLOR_CODES[colors[ph].colorCode];
			curPlaceholderName = placeholderPrefix + ph.substring(1,ph.length);
			graphicStyleName = curPlaceholderName;
			colors[ph].id = curPlaceholderName;
			curGStyle = new GraphicStyle(colors[ph]);
			curGStyle.init();
			currentMockup.activate();

			//applyGraphicStyleArguments:
				//curPlaceholderName = the name of the swatch to change
				//graphicStyleName = the name of the graphic style to apply
			this.applyGraphicStyle(curPlaceholderName,graphicStyleName);

			//now, change any "B" colors.
			this.applyGraphicStyle(curPlaceholderName.replace("C","B"),graphicStyleName);

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
			log.l("Recolored " + ph + " with " + colors[ph].swatchName);
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

	this.processGraphic = function(curGraphic)
	{
		//first identify the type of graphic
		//for now, let's subdivide by
			// logos
				//for anything that is a logo, there should only be one option to grab
				//check the production layer and identify the layer that matches the
				//graphic code (i.e. FDS-1242)

				//when the logo layer is identified,
				//check the curGraphic.teamNames array to see whether any text needs to be changed
				//if so, dig recursively through
				//the layer to find any instances of textFrames labeled "graphic_text_#"
					//change the contents of the text frame per the matching
					//element of the curGraphic.teamNames array.
			// names/numbers
				//probably need a database of some kind to figure out which name/number instance
				//to grab for given locations.. 

		var doc = app.activeDocument;
		var layers = doc.layers;
		var prodLayer = findSpecificLayer(layers,"PRODUCTION");
		if(!prodLayer)
		{
			log.e("The graphic file: " + curGraphic + " is not optimized for the script yet.");
			return undefined;
		}

		//youthGroup and adultGroup are groupItems that will be duplicated into the mockup file
		//and then placed next to the artboard
		var youthGroup,adultGroup;
		var noteLayer,artLayer;
		var artItem;

		var curLay,curName;

		noteLayer = findSpecificLayer(prodLayer,"notes");
		artLayer = findSpecificLayer(prodLayer,curGraphic.key.replace("-","_"));

		if(!artLayer)
		{
			errorList.push("The graphic file: " + curGraphic.key + " is not optimized for the script yet.");
			log.e("The graphic file: " + curGraphic.key + " is not optimized for the script yet.");
		}

		if(curGraphic.type === "name")
		{
			artItem = artLayer.pageItems["name_2"];
			if(this.adultMockupLayer)
			{
				var adultName = copyArtToMaster(artItem, this.mockupDocument, ,this.adultMockupLayer);
				adultName.left = this.adultMockupArtboard.artboardRect[0] + this.graphicXPosition;
				adultName.top = this.adultMockupArtboard.artboardRect[1] + 50;
			}
			if(this.youthMockupLayer)
			{
				artItem = nameLay.pageItems["name_1.5"]
				var youthName = copyArtToMaster(artItem,this.mockupDocument, this.youthMockupLayer);
				youthName.left = this.youthMockupArtboard.artboardRect[1] + this.graphicXPosition;
				youthName.top = this.youthMockupArtboard.artboardRect[1] + 50;
			}
		}
		else if(curGraphic.type === "number")
		{
			////////////////////////
			////////ATTENTION://////
			//
			//	add some logic here to check the graphic locations against
			// 	a database to determine whether it's a "small number" (like a 
			//	front/sleeve of a tshirt) or a "big number" (like a back number)
			//
			////////////////////////
			
			

			var smallNum, bigNum;
			if(this.adultMockupLayer)
			{
				smallNum = artLayer.pageItems["number_4"]
				var frontNum = copyArtToMaster([artItem], this.mockupDocument, ,this.adultMockupLayer);
				frontNum.left = this.adultMockupArtboard.artboardRect[0] + this.graphicXPosition;
				frontNum.top = this.adultMockupArtboard.artboardRect[1] + 50;

				
			}
			if(this.youthMockupLayer)
			{
				artItem = nameLay.pageItems["number_3"]
				var youthName = copyArtToMaster(artItem,this.mockupDocument, this.youthMockupLayer);
				youthName.left = this.youthMockupArtboard.artboardRect[1] + this.graphicXPosition;
				youthName.top = this.youthMockupArtboard.artboardRect[1] + 50;
			}
		}
		else if(curGraphic.type === "logo")
		{

		}



		
		this.graphicXPosition += 50;

		 if(artLayer)

		 
		 
	}

	this.applyGraphicStyle = function(placeholder)
	{
		log.h ("Applying graphic style: " + placeholder);
		var doc = app.activeDocument;
		doc.selection = null;
		doc.defaultFillColor = makeNewSpotColor(placeholder).color;
		app.executeMenuCommand("Find Fill Color menu item");
		var gs;

		var newSpotColor = makeNewSpotColor(this.garmentColors[graphicStyleName].swatchName).color;

		changeThemColors();



		function changeThemColors()
		{
			try
			{
				gs = doc.graphicStyles[graphicStyleName];
				for(var cc=0,len=doc.selection.length;cc<len;cc++)
				{
					dig(doc.selection[cc]);
				}
			}
			catch(e)
			{
				doc.defaultFillColor = newSpotColor;
			}
		}
		

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
			

			log.l("Fixing: " + curGraphic.name);

			//if the graphic is a name or number && it hasn't been updated yet
			//update the code
			if(!/fdsp-fdsn_/i.test(curGraphic.name))
			{
				curGraphic.name = curGraphic.name.replace(nameNumberPat,"fdsp-fdsn_");
			}

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

			if(/emb/i.test(curGraphic.name))
			{
				curGraphic.name = curGraphic.name.replace(/^.*\-/,"EMB-");
				curGraphic.lib = "embroidery";
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

		var pat = /[_-]([\d]{1,}([hgbmsr]{1,3})?$)/i;
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
