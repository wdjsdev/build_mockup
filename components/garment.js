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
		this.adultArtworkLayer = findSpecificLayer(this.mockupDocument.layers[0],"Artwork Layer");
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
		log.h("Looping graphics for the mockup: " + this.saveFile.name);
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

				try
				{
					this.processGraphic(curGraphic);	
				}
				catch(e)
				{
					log.e("Failed to process " + curGraphic.name + "::e = " + e + "::e.line = " + e.line);

					log.e("_FIX_GRAPHIC_FILE_" + curGraphic.file.fullName);
				}
				
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
			this.adultGarmentCode = this.youthGarmentCode.replace(girlsCodePat,"W");
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
		log.l("Recoloring garment.");
		var doc = app.activeDocument;
		hidePPLay();
		var curGStyle,patternFile;
		// var placeholderPrefix = topOrBottomSwatches();
		var placeholderPrefix = "C";


		//check for paramcolors on the mockup layer.
		//if they don't exist yet, create them.
		//just set a boolean variable to determine whether
		//to add param blocks while recoloring the garment
		//to ensure that the mockup exporter can work properly

		var needsParam = findSpecificLayer(this.adultMockupLayer,"paramcolors") ? false : true;

		if(needsParam)
		{
			var paramLayer = this.adultMockupLayer.layers.add();
			paramLayer.name = "paramcolors";
			var paramIndex = 0;
			var paramBlock;
		}

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

			if(needsParam)
			{
				paramBlock = paramLayer.pathItems.rectangle(0,0,5,5);
				paramBlock.filled = true;
				paramBlock.fillColor = makeNewSpotColor(ph).color;
				paramBlock.name = "paramcolor-" + curPlaceholderName;
				paramBlock.left = this.mockupDocument.artboards[0].artboardRect[0] - 5;
				paramBlock.top = this.mockupDocument.artboards[0].artboardRect[1] - (5 * paramIndex);
				paramIndex++;
			}

			log.l("Recoloring " + ph + " with " + colors[ph].swatchName);



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
		log.l("Recoloring graphic");
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
		noteLayer = findSpecificLayer(prodLayer,"notes");
		artLayer = findSpecificLayer(prodLayer,curGraphic.key.replace("_","-"));

		if(!artLayer)
		{
			artLayer = findSpecificLayer(prodLayer,curGraphic.key.replace("-","_"));
		}

		
		if(!prodLayer || !artLayer)
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

		


		if(curGraphic.type === "name")
		{
			artItem = artLayer.pageItems["name_2"];
			if(this.adultArtworkLayer)
			{
				var adultName = copyArtToMaster(artItem, this.mockupDocument, this.adultArtworkLayer);
				adultName.left = this.adultMockupArtboard.artboardRect[0] + this.graphicXPosition;
				adultName.top = this.adultMockupArtboard.artboardRect[1] + 50;
			}

			this.graphicXPosition += artItem.width + 50
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
			var smallNumLabel, bigNumLabel;

			//this is effectively the "size" of the graphic
			//for mens, we want a 4" small num and a 9" big num and a 2" name
			//for womens/youth, 3" small and 8" big num and a 1.5" name
			// smallNumLabel = 
			// bigNumLabel = 


			if(this.adultArtworkLayer)
			{
				smallNum = artLayer.pageItems["number_4"];
				var frontNum = copyArtToMaster(smallNum, this.mockupDocument, this.adultArtworkLayer);
				frontNum.left = this.adultMockupArtboard.artboardRect[0] + this.graphicXPosition;
				frontNum.top = this.adultMockupArtboard.artboardRect[1] + frontNum.height + 50;

				this.graphicXPosition += frontNum.width + 50;

				bigNum = artLayer.pageItems["number_9"];
				var backNum = copyArtToMaster(bigNum,this.mockupDocument,this.adultArtworkLayer);
				backNum.left = this.adultMockupArtboard.artboardRect[0] + this.graphicXPosition;
				backNum.top = this.adultMockupArtboard.artboardRect[1] + backNum.height + 50;

				this.graphicXPosition += backNum.width + 50;
				
			}
			// if(this.youthMockupLayer)
			// {
			// 	artItem = nameLay.pageItems["number_3"]
			// 	var youthName = copyArtToMaster(artItem,this.mockupDocument, this.youthMockupLayer);
			// 	youthName.left = this.youthMockupArtboard.artboardRect[1] + this.graphicXPosition;
			// 	youthName.top = this.youthMockupArtboard.artboardRect[1] + 50;
			// }

			
		}
		else if(curGraphic.type === "logo")
		{
			
			doc.selection = null;
			artLayer.hasSelectedArtwork = true;
			

			app.executeMenuCommand("group");
			if(doc.selection.length)
			{
				var newGroup = doc.selection[0].duplicate();
				newGroup.top += newGroup.height + 50;
			}


			//try to update graphic text...
			if(curGraphic.teamNames)
			{
				for(var n=0;n < curGraphic.teamNames.length;n++)
				{
					try
					{
						newGroup.pageItems["graphic_text_" + (n + 1)].contents = curGraphic.teamNames[n].toUpperCase();
					}
					catch(e)
					{
						// oh well..
						//fix this later...
					}
				}
			}
			
			var newScale;
			if(this.adultArtworkLayer)
			{
				
				newGroup.name = artLayer.name
				if(newGroup.width > newGroup.height)
				{
					newScale = ((13 * 7.2) / newGroup.width);	
				}
				else
				{
					newScale = ((13 * 7.2) / newGroup.height);
				}
				newScale *= 100; //convert to percentage
				
				newGroup.resize(newScale,newScale,true,true,true,true,newScale,Transformation.CENTER);

				var adultNewGroup = copyArtToMaster(newGroup,this.mockupDocument,this.adultArtworkLayer);

				////////////////////////
				////////ATTENTION://////
				//
				//		FIGURE OUT A WAY TO INCORPORATE THE NOTES TOO...
				//
				////////////////////////

				//check to see if the whole group is bigger than 2 inches (at full scale)
				//7.2 is 72 points per inch at 10% scale

				// if(adultNewGroup.width > (5 * 7.2))
				// {
				// 	var newScale = adultNewGroup.width * (13 * 7.2);
				// 	adultNewGroup.resize(newScale,newScale,false,true,true,true);
				// }
				adultNewGroup.left = this.adultMockupArtboard.artboardRect[1] + this.graphicXPosition;
				adultNewGroup.top = this.adultMockupArtboard.artboardRect[0] + adultNewGroup.height + 50;
			}
			// if(this.youthMockupLayer)
			// {
			// 	var youthNewGroup = copyArtToMaster(newGroup,this.mockupDocument,this.youthMockupLayer)
			// 	youthNewGroup.left = this.youthMockupArtboard.artboardRect[1] + this.graphicXPosition;
			// 	youthNewGroup.top = this.youthMockupArtboard.artboardRect[0] + youthNewGroup.height + 50;
			// }

			this.graphicXPosition += newGroup.width + 50;
		}



		
		

		 

		 
		 
	}

	this.applyGraphicStyle = function(placeholder,graphicStyleName)
	{
		log.l ("Applying graphic style: " + placeholder);
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
