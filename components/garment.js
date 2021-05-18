//config is the entire config or configReverse object
//data is the top or bottom object
function Garment(config,data,designNumber)
{
	this.designNumber = designNumber;
	this.adultGarmentCode = "";
	this.youthGarmentCode = "";
	this.garmentWearer = ""; //this is either M, W, or Y 
	this.bigLogoSize = 3; //default is 13 inches at 10% scale
	this.smallLogoSize = .4; // default is 4 inches at 10% scale
	this.garmentFolder;
	this.adultGarmentFile;
	this.youthGarmentFile;
	this.styleNumber = "";
	this.fileSuffix; //this is like a _A or _B for reversible garments
	this.garmentColors = data.colors;
	this.graphics = config.graphics;
	this.saveFile;
	this.mockupDocument;

	this.mainMockupLayer;
	this.adultMockupLayer;
	this.adultMockupArtboard;
	this.youthMockupLayer;
	this.youthMockupArtboard;

	this.graphicXPosition = 0;
	this.graphicYPosition = 0;
	this.youthXOffset = 0;



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
		if(this.adultGarmentFile)
		{
			this.openCT(this.adultGarmentFile);
			this.mockupDocument = app.activeDocument;
			
			var adultLayer = findSpecificLayer(this.mockupDocument,this.adultGarmentCode,"any");
			if(adultLayer)
			{
				this.adultMockupLayer = this.mainMockupLayer = findSpecificLayer(adultLayer,"Mockup");
				if(!this.adultMockupLayer)
				{
					this.adultMockupLayer = this.mockupDocument.layers.add();
					this.adultMockupLayer.name = "Mockup";
					this.mainMockupLayer = this.adultMockupLayer;
				}
				this.adultArtworkLayer = findSpecificLayer(adultLayer,"Artwork Layer");
				this.adultMockupArtboard = this.mainMockupArtboard = this.mockupDocument.artboards[0];
			}
			
			


			if(!this.adultMockupLayer)
			{
				this.adultMockupLayer = findSpecificLayer(this.mockupDocument,"Mockup","any");
				
				if(!this.adultMockupLayer)
				{
					this.adultMockupLayer = this.mockupDocument.layers.add();
					this.adultMockupLayer.name = "Mockup";	
				}
				this.mainMockupLayer = this.adultMockupLayer;
			}

			if(!this.adultArtworkLayer)
			{
				this.adultArtworkLayer = findSpecificLayer(this.mockupDocument,"Artwork Layer");
				
				if(!this.adultArtworkLayer)
				{
					this.adultArtworkLayer = this.mockupDocument.layers.add();
					this.adultArtworkLayer.name = "Artwork";	
				}
			}
		}
		if(this.youthGarmentFile)
		{
			this.openCT(this.youthGarmentFile);

			//if there's and audult and youth, merge the youth file into the adult file
			if(this.adultGarmentFile)
			{
				var youthDoc = this.openFile(this.youthGarmentFile);
				mergeTemplate(this.mockupDocument);
				filesToClose.push(youthDoc);
				this.mockupDocument.activate();
				app.executeMenuCommand("fitall");
				app.redraw();
			}
			else
			{
				this.mockupDocument = app.activeDocument;
			}

			var youthLayer = findSpecificLayer(this.mockupDocument.layers,this.youthGarmentCode,"any");
			if(youthLayer)
			{
				this.youthMockupLayer = findSpecificLayer(youthLayer,"Mockup");
				if(!this.youthMockupLayer)
				{
					this.youthMockupLayer = this.mockupDocument.layers.add();
					this.youthMockupLayer.name = "Mockup";
				}
				this.youthArtworkLayer = findSpecificLayer(youthLayer,"Artwork Layer");
				this.youthMockupArtboard = this.mockupDocument.artboards[this.adultGarmentFile ? 1 : 0];
			}

			if(this.youthMockupArtboard && this.adultMockupArtboard)
			{
				this.youthXOffset = this.youthMockupArtboard.artboardRect[0] - this.adultMockupArtboard.artboardRect[0];
			}

			if(!this.adultMockupLayer)
			{
				this.mainMockupLayer = this.youthMockupLayer;
				this.mainMockupArtboard = this.youthMockupArtboard;
			}

			

			if(!this.youthMockupLayer)
			{
				this.youthMockupLayer = findSpecificLayer(this.mockupDocument.layers,"Mockup","any");

				if(!this.youthMockupLayer)
				{
					this.youthMockupLayer = app.activeDocument.layers.add();
					this.youthMockupLayer.name = "Youth Mockup";	
				}
				
			}

			if(!this.youthArtworkLayer)
			{
				this.youthArtworkLayer = findSpecificLayer(this.mockupDocument.layers,"Artwork Layer","any");
				if(!this.youthArtworkLayer)
				{
					this.youthArtworkLayer = app.activeDocument.layers.add();
					this.youthArtworkLayer.name = "Youth Artwork";
				}
			}
		}

		if(!this.adultGarmentFile && !this.youthGarmentFile)
		{
			log.e("No youth or adult garment file found?")
			return;
		}
		else
		{
			this.mockupDocument = currentMockup = app.activeDocument;
			this.graphicYPosition = this.mockupDocument.artboards[0].artboardRect[1];
			this.processMockup(this.mockupDocument)	
		}
		
	}

	this.openCT = function(file)
	{
		this.openFile(file);
		app.executeMenuCommand("fitall");
	}


	this.processMockup = function(file)
	{
		this.saveFile = this.getSaveFile();

		currentMockup.saveAs(this.saveFile);
		curGarmentIndex++;
		
		if(this.mainMockupLayer)
		{
			this.recolorGarment(this.garmentColors);
		}
		else
		{
			log.e("No mockup layer found. Skipping recolorGarment function.");
		}

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
			curGraphic.name = g;

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
				log.l("full file name = " + curGraphic.file.fullName);
				this.openFile(curGraphic.file);
				this.recolorGraphic(curGraphic.colors,curGraphic.type);

				// try
				// {
					this.processGraphic(curGraphic);	
				// }
				// catch(e)
				// {
				// 	log.e("_FIX_GRAPHIC_FILE_::" + curGraphic.name + "::e = " + e + "::e.line = " + e.line);
				// }
				
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

		if(this.adultGarmentCode == "FD-500" || this.adultGarmentCode == "FD-400")
		{
			this.adultGarmentCode += "W";
		}

		this.adultGarmentCode = this.adultGarmentCode.replace(/se$/i,"");


		//if this garment is a "single wearer" don't build the corresponding youth/adult to match.
		//just build this garment without merging anything else into it.
		var singleWearerGarments = ["FD-5060","FD-5060G","FD-5060Y","FD-5060W","FD-5070","FD-5070G","FD-5070Y","FD-5070W","FD-5077","FD-5077G","FD-5077Y","FD-5077W","PS-5075","PS-5075G","PS-5075Y","PS-5075W","PS-5082","PS-5082G","PS-5082Y","PS-5082W","PS-5094","PS-5094G","PS-5094Y","PS-5094W","PS-5095","PS-5095G","PS-5095Y","PS-5095W","PS-5098","PS-5098G","PS-5098Y","PS-5098W","PS-5105","PS-5105G","PS-5105Y","PS-5105W","PS-5106","PS-510G6","PS-510Y6","PS-510W6"];
		var isSingleWearerGarment = singleWearerGarments.indexOf(this.adultGarmentCode) > -1 ? true : false;

		if(womensCodePat.test(this.adultGarmentCode))
		{
			this.garmentWearer = "W";

			this.youthGarmentCode = isSingleWearerGarment ? undefined : this.adultGarmentCode.replace(womensCodePat,"G");

			this.bigLogoSize = 1.15;
			this.smallLogoSize = .3;
		}
		else if(girlsCodePat.test(this.adultGarmentCode))
		{
			this.garmentWearer = "G";
			this.youthGarmentCode = this.adultGarmentCode;

			this.adultGarmentCode = isSingleWearerGarment ? undefined : this.youthGarmentCode.replace(girlsCodePat,"W");

			this.bigLogoSize = .95;
			this.smallLogoSize = .3;
		}
		else if(youthCodePat.test(this.adultGarmentCode))
		{
			this.garmentWearer = "Y";
			this.youthGarmentCode = this.adultGarmentCode;

			this.adultGarmentCode = isSingleWearerGarment ? undefined : this.youthGarmentCode.replace(youthCodePat,"");

			this.bigLogoSize = .95;
			this.smallLogoSize = .3;
		}
		else
		{
			this.garmentWearer = "M";
			this.youthGarmentCode = isSingleWearerGarment ? undefined : this.adultGarmentCode + "Y";
			this.bigLogoSize = 1.3;
			this.smallLogoSize = .4;

		}
		log.l("set adultGarmentCode to " + this.adultGarmentCode);
		log.l("set youthGarmentCode to " + this.youthGarmentCode);

	}

	this.setStyleNumber = function()
	{
		this.styleNumber = data.styleNo;

		//check for an alphabetic style number
		var alphaStyleNumPat = /^[a-z]*[\d]?$/i;
		this.styleNumber = this.styleNumber.replace(alphaStyleNumPat,"1000")

		//check for a style number with one or more letters appended to the end
		//example: FD-5060_1007A
		var appendedLetterPat = /([\d]*)[a-z]*/i;
		var appendageMatch = this.styleNumber.match(appendedLetterPat);
		if(appendageMatch && appendageMatch.length && appendageMatch.length > 1)
		{
			this.styleNumber = appendageMatch[1];
		}

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

		var paramLayer = findSpecificLayer(this.mainMockupLayer,"paramcolors");

		if(paramLayer)
		{
			paramLayer.remove();
		}

		paramLayer = this.mainMockupLayer.layers.add();
		paramLayer.name = "paramcolors";
		var paramIndex = 0;
		var paramBlock;


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


			updateInfoColorCallouts(curPlaceholderName,colors[ph].swatchName);


			paramBlock = paramLayer.pathItems.rectangle(0,0,5,5);
			paramBlock.filled = true;
			paramBlock.fillColor = makeNewSpotColor(ph).color;
			paramBlock.name = "paramcolor-" + curPlaceholderName;
			paramBlock.left = this.mockupDocument.artboards[0].artboardRect[0] - 5;
			paramBlock.top = this.mockupDocument.artboards[0].artboardRect[1] - (5 * paramIndex);
			paramIndex++;


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

	this.recolorGraphic = function(colors,graphicType)
	{
		log.l("Recoloring graphic");
		var doc = app.activeDocument;
		var swatches = [];

		for(var s=0,len=doc.swatches.length;s<len;s++)
		{
			swatches.push(doc.swatches[s]);
		}




		var phNumber,phSwatches,curPhSwatch;
		for(var ph in colors)
		{
			if(/_[\d]*_/.test(ph))
			{
				//wonky data.. ignore it.
				continue;
			}
			phNumber = ph.replace(/[a-z]/gi,"");

			phSwatches = findPHSwatch(phNumber,colors[ph]);

			if(!colors[ph].swatchName || colors[ph].swatchName === "")
			{
				log.e("colors[" + ph + "] has no swatch data.");
				continue;
			}
			for(var x=0;x<phSwatches.length;x++)
			{
				curPhSwatch = phSwatches[x]
				if(graphicType === "name" && curPhSwatch.name.toLowerCase().indexOf("name") > -1)
				{
					mergeSwatches(curPhSwatch.name,colors[ph].swatchName);
				}
				else if(graphicType === "number" && curPhSwatch.name.toLowerCase().indexOf("num") > -1 )
				{
					mergeSwatches(curPhSwatch.name,colors[ph].swatchName);
				}
				else if(graphicType === "logo")
				{
					mergeSwatches(curPhSwatch.name,colors[ph].swatchName);		
				}
			}

			
			log.l("Recolored " + ph + " with " + colors[ph].swatchName);
		}

		function findPHSwatch(num,color)
		{
			var result = [];
			color.swatchName = BUILDER_COLOR_CODES[color.colorCode];
			var swatchName;
			for(var s=0,len=swatches.length;s<len;s++)
			{
				swatchName = swatches[s].name.replace(/[a-z]/gi,"");
				if(swatchName == num)
				{
					result.push(swatches[s])
				}
			}
			return result;
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
		//youthGroup and adultGroup are groupItems that will be duplicated into the mockup file
		//and then placed next to the artboard
		var youthGroup,adultGroup;
		var noteLayer,artLayer,artCopyGroup;
		var noteGroup,adultMasterNoteGroup,youthMasterNoteGroup;
		var youthName,adultName,youthFrontNumber,youthBackNumber,adultFrontNumber,adultBackNumber;
		var youthLogo,adultLogo;
		var noteCopy;
		var artItem;
		var curLay,curName;
		var scaleLogo = true;

		

		var pos;



		//check to see whether this is a background graphic or ghosted graphic
		//if so.. don't scale it
		if(/(bg)|(g$)/i.test(curGraphic.name))
		{
			scaleLogo = false;
		}


		var prodLayer = findSpecificLayer(layers,"PRODUCTION");
		if(!prodLayer)
		{
			log.e("The graphic file: " + curGraphic.name + " is missing the PRODUCTION layer.");
			return undefined;
		}
		noteLayer = findSpecificLayer(prodLayer,"notes");
		artLayer = findSpecificLayer(prodLayer,curGraphic.name.replace("_","-"));

		if(!artLayer)
		{
			artLayer = findSpecificLayer(prodLayer,curGraphic.name.replace("-","_"));
			if(!artLayer)
			{
				//check to see whether there are specific "wearer" layers
				//options are "MENS", "WOMENS", "YOUTH";
				//if these layers exist, determine which is the correct one
				//and use that layer as the artLayer
				var mensLayer = findSpecificLayer(prodLayer,"MENS");
				var womensLayer = findSpecificLayer(prodLayer,"WOMENS");
				var youthLayer = findSpecificLayer(prodLayer,"YOUTH");

				if(mensLayer && womensLayer && youthLayer)
				{
					scaleLogo = false;
					log.l(curGraphic.name + " has artwork sublayers.");
					if(this.garmentWearer && this.garmentWearer === "W")
					{
						artLayer = womensLayer;
						noteLayer = findSpecificLayer(artLayer,"notes");
						
					}
					else
					{
						artLayer = mensLayer;
						noteLayer = findSpecificLayer(artLayer,"notes");
					}


					log.l("set artLayer to " + artLayer.name);
					log.l("set noteLayer to " + noteLayer.name);
				}
			}
		}

		//still no art layer?
		if(!artLayer)
		{
			log.e("The graphic file: " + curGraphic.name + " is missing an artwork layer.");
			return undefined;
		}

		artLayer.name = artLayer.name.replace(/_/g,"-");

		if(noteLayer)
		{
			if(this.adultMockupLayer)
			{
				adultMasterNoteGroup = findSpecificPageItem(this.adultMockupLayer,"graphic notes","any");
				if(!adultMasterNoteGroup)
				{
					adultMasterNoteGroup = this.adultMockupLayer.groupItems.add();
					adultMasterNoteGroup.name = "graphic notes";
				}
			}
			if(this.youthMockupLayer)
			{
				youthMasterNoteGroup = findSpecificPageItem(this.youthMockupLayer,"graphic notes","any");
				if(!youthMasterNoteGroup)
				{
					youthMasterNoteGroup = this.youthMockupLayer.groupItems.add();
					youthMasterNoteGroup.name = "graphic notes";
				}
			}
			

			noteGroup = (function()
			{
				noteLayer.locked = false;
				noteLayer.visible = true;
				var newGroup = noteLayer.groupItems.add();
				newGroup.name = artLayer.name + " notes";
				for(var x = noteLayer.pageItems.length-1;x>=1;x--)
				{
					noteLayer.pageItems[x].moveToBeginning(newGroup);
				}
				return newGroup.pageItems.length ? newGroup : undefined;
			})();
		}


		

		const GRAPHIC_SPACING = 50;


		if(curGraphic.type === "name")
		{			
			var adultNameLabel = this.garmentWearer.match(/[wg]$/) ? sizingDb["W"].name : sizingDb["M"].name;
			var youthNameLabel = this.garmentWearer.match(/[wg]$/) ? sizingDb["G"].name : sizingDb["Y"].name;
			var curWidth;
			if(this.adultArtworkLayer)
			{

				var adultNameFrame = findSpecificPageItem(artLayer,"name_" + adultNameLabel,"imatch");


				if(adultNameFrame)
				{
					artCopyGroup = artLayer.groupItems.add();
					if(noteGroup)
					{
						noteCopy = noteGroup.duplicate(artCopyGroup);
						hAlignCenter(adultNameFrame,[noteCopy]);
					}
					adultNameFrame.duplicate(artCopyGroup);
					pos  = [this.graphicXPosition, this.graphicYPosition + artCopyGroup.height + GRAPHIC_SPACING];
					
					curWidth = artCopyGroup.width;

					adultName = copyArtToMaster(artCopyGroup, this.mockupDocument, this.adultArtworkLayer,pos);


					if(noteGroup && noteGroup.pageItems.length)
					{
						adultName.pageItems[noteGroup.name].moveToBeginning(adultMasterNoteGroup);
					}

					ungroup(adultName);
				}
				else
				{
					log.e("Failed to find a player name matching: name_" + adultNameLabel + "::" + JSON.stringify(curGraphic));
					return undefined;
				}
				
			}

			if(this.youthArtworkLayer)
			{

				var youthNameFrame = findSpecificPageItem(artLayer,"name_" + youthNameLabel,"imatch");

				if(youthNameFrame)
				{
					artCopyGroup = artLayer.groupItems.add();
					if(noteGroup && noteGroup.pageItems.length)
					{
						noteCopy = noteGroup.duplicate(artCopyGroup);
						hAlignCenter(youthNameFrame,[noteCopy]);
					}
					youthNameFrame.duplicate(artCopyGroup);
					pos  = [this.graphicXPosition + this.youthXOffset,this.graphicYPosition +  artCopyGroup.height + GRAPHIC_SPACING];

					if(!curWidth)
					{
						curWidth = artCopyGroup.width;
					}

					youthName = copyArtToMaster(artCopyGroup, this.mockupDocument, this.youthArtworkLayer,pos);
					if(noteGroup && noteGroup.pageItems.length)
					{
						youthName.pageItems[noteGroup.name].moveToBeginning(youthMasterNoteGroup);
					}
					
					ungroup(youthName);
				}
				else
				{
					log.e("Failed to find a player name matching: name_" + adultNameLabel + "::" + JSON.stringify(curGraphic));
					return undefined;
				}


				

			}

			this.graphicXPosition += curWidth + GRAPHIC_SPACING;

			
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
			

			
			var adultFrontNumLabel = this.garmentWearer.match(/[wg]$/i) ? sizingDb["W"].smallNum : sizingDb["M"].smallNum;
			var youthFrontNumLabel = this.garmentWearer.match(/[wg]$/i) ? sizingDb["G"].smallNum : sizingDb["Y"].smallNum;
			var adultBackNumLabel = this.garmentWearer.match(/[wg]$/i) ? sizingDb["W"].bigNum : sizingDb["M"].bigNum;
			var youthBackNumLabel = this.garmentWearer.match(/[wg]$/i) ? sizingDb["G"].bigNum : sizingDb["Y"].bigNum;
			//go get the front number and copy it to the master.

			
			



			var deltaXPosition = 0;
			if(this.adultArtworkLayer)
			{
				var adultFrontNumberFrame = findSpecificPageItem(artLayer,"number_" + adultFrontNumLabel,"imatch");

				if(adultFrontNumberFrame)
				{
					artCopyGroup = artLayer.groupItems.add();
					if(noteGroup)
					{
						noteCopy = noteGroup.duplicate(artCopyGroup);
						hAlignCenter(adultFrontNumberFrame,[noteCopy]);
					}
					adultFrontNumberFrame.duplicate(artCopyGroup);
					pos = [this.graphicXPosition,this.graphicYPosition +  artCopyGroup.height + GRAPHIC_SPACING];
					adultFrontNumber = copyArtToMaster(artCopyGroup, this.mockupDocument, this.adultArtworkLayer,pos);

					this.graphicXPosition += artCopyGroup.width + GRAPHIC_SPACING;
					deltaXPosition += artCopyGroup.width + GRAPHIC_SPACING;
					if(noteGroup && noteGroup.pageItems.length)
					{
						adultFrontNumber.pageItems[noteGroup.name].moveToBeginning(adultMasterNoteGroup);
					}

					ungroup(adultFrontNumber);
				}



				//
				var adultBackNumberFrame = findSpecificPageItem(artLayer,"number_" + adultBackNumLabel,"imatch");
				if(adultBackNumberFrame)
				{
					artCopyGroup = artLayer.groupItems.add();
					if(noteGroup)
					{
						noteCopy = noteGroup.duplicate(artCopyGroup);
						hAlignCenter(adultBackNumberFrame,[noteCopy]);
					}
					adultBackNumberFrame.duplicate(artCopyGroup);
					pos = [this.graphicXPosition,this.graphicYPosition + artCopyGroup.height + GRAPHIC_SPACING];
					adultBackNumber = copyArtToMaster(artCopyGroup,this.mockupDocument,this.adultArtworkLayer,pos);

					this.graphicXPosition += artCopyGroup.width + GRAPHIC_SPACING;
					deltaXPosition += artCopyGroup.width + GRAPHIC_SPACING;

					if(noteGroup && noteGroup.pageItems.length)
					{
						adultBackNumber.pageItems[noteGroup.name].moveToBeginning(adultMasterNoteGroup);
					}
					
					ungroup(adultBackNumber);
				}

			}

			if(this.youthArtworkLayer)
			{
				
				var youthFrontNumberFrame = findSpecificPageItem(artLayer,"number_" + youthFrontNumLabel,"imatch");

				if(youthFrontNumberFrame)
				{
					artCopyGroup = artLayer.groupItems.add();
					if(noteGroup)
					{
						noteCopy = noteGroup.duplicate(artCopyGroup);
						hAlignCenter(youthFrontNumberFrame,[noteCopy]);
					}
					youthFrontNumberFrame.duplicate(artCopyGroup);
					pos = [this.graphicXPosition + this.youthXOffset - deltaXPosition,this.graphicYPosition + artCopyGroup.height + GRAPHIC_SPACING];
					youthFrontNumber = copyArtToMaster(artCopyGroup,this.mockupDocument,this.youthArtworkLayer,pos);


					//if there's an adult mockup in the master,
					//then we don't need to increment x position
					//since that would have been done in the adult condition above
					if(!this.adultArtworkLayer)
					{
						this.graphicXPosition += youthFrontNumberFrame.width + GRAPHIC_SPACING;	
					}

					deltaXPosition -= artCopyGroup.width + GRAPHIC_SPACING;
					
					if(noteGroup && noteGroup.pageItems.length)
					{
						youthFrontNumber.pageItems[noteGroup.name].moveToBeginning(youthMasterNoteGroup);
					}

					ungroup(youthFrontNumber);
				}


				var youthBackNumberFrame = findSpecificPageItem(artLayer,"number_" + youthBackNumLabel,"imatch");

				if(youthBackNumberFrame)
				{
					artCopyGroup = artLayer.groupItems.add();
					if(noteGroup)
					{
						noteCopy = noteGroup.duplicate(artCopyGroup);
						hAlignCenter(youthBackNumberFrame,[noteCopy]);
					}
					youthBackNumberFrame.duplicate(artCopyGroup);
					pos = [this.graphicXPosition + this.youthXOffset - deltaXPosition,this.graphicYPosition + artCopyGroup.height + GRAPHIC_SPACING];
					youthBackNumber = copyArtToMaster(artCopyGroup,this.mockupDocument,this.youthArtworkLayer,pos);

					
					//if there's an adult mockup in the master,
					//then we don't need to increment x position
					//since that would have been done in the adult condition above
					if(!this.adultArtworkLayer)
					{
						this.graphicXPosition += artCopyGroup.width + GRAPHIC_SPACING;	
					}

					if(noteGroup)
					{
						youthBackNumber.pageItems[noteGroup.name].moveToBeginning(youthMasterNoteGroup);
					}
					
					ungroup(youthFrontNumber);
				}

			}

			


			

		}
		else if(curGraphic.type === "logo")
		{
			var newScale = 100;
			app.selection = null;
			artCopyGroup = artLayer.groupItems.add();
			artCopyGroup.name = artLayer.name;
			var curWidth;
			var deltaXPosition = 0;

			//get the minimum and maximum dimensions of a logo
			//db has the sizes in inches at 10% scale. multiply by 72 to get the correct scale in points
			var maxAdultScaledDimension = this.garmentWearer.match(/[wg]$/) ? sizingDb["W"].bigLogo : sizingDb["M"].bigLogo * 72;
			var maxYouthScaledDimension = this.garmentWearer.match(/[wg]$/) ? sizingDb["G"].bigLogo : sizingDb["Y"].bigLogo * 72;
			var minAdultScaledDimension = this.garmentWearer.match(/[wg]$/) ? sizingDb["W"].smallLogo : sizingDb["M"].smallLogo * 72;
			var minYouthScaledDimension = this.garmentWearer.match(/[wg]$/) ? sizingDb["G"].smallLogo : sizingDb["Y"].smallLogo * 72;

			for(var x = artLayer.pageItems.length-1;x>=1;x--)
			{
				artLayer.pageItems[x].duplicate(artCopyGroup);
				app.redraw();
			}

			if(artCopyGroup && artCopyGroup.pageItems.length)
			{

				//try to update graphic text...
				if(curGraphic.teamNames && curGraphic.teamNames.length)
				{
					updateGraphicText(curGraphic.teamNames,artCopyGroup);
				}
			}

			if(!artCopyGroup.pageItems.length)
			{
				log.e("No logo artwork for " + artLayer.name);
				return;
			}


			if(this.adultArtworkLayer)
			{
				var adultLogoGroup = artCopyGroup.duplicate();

				if(scaleLogo)
				{
					if(adultLogoGroup.width > adultLogoGroup.height)
					{
						if(adultLogoGroup.width > maxAdultScaledDimension/2)
							newScale = (maxAdultScaledDimension / adultLogoGroup.width) * 100;
						else
							newScale = (minAdultScaledDimension / adultLogoGroup.width) * 100;
					}
					else
					{
						if(adultLogoGroup.height > maxAdultScaledDimension/2)
							newScale = (maxAdultScaledDimension / adultLogoGroup.height) * 100;
						else
							newScale = (minAdultScaledDimension / adultLogoGroup.height) * 100;
					}
					
				}

				if(noteGroup)
				{
					noteCopy = noteGroup.duplicate(adultLogoGroup);
					// alignObjectsToCenter(adultLogoGroup,[noteCopy]);
					hAlignCenter(adultLogoGroup,[noteCopy])
				}


				adultLogoGroup.resize(newScale,newScale,true,true,true,true,newScale,Transformation.CENTER);
				
				curWidth = adultLogoGroup.width;
				
				pos = [this.graphicXPosition,this.graphicYPosition + adultLogoGroup.height + GRAPHIC_SPACING];
				
				adultLogo = copyArtToMaster(adultLogoGroup,this.mockupDocument,this.adultArtworkLayer,pos);

				

				if(noteGroup)
				{
					adultLogo.pageItems[noteGroup.name].moveToBeginning(adultMasterNoteGroup);
				}

				
				deltaXPosition += curWidth + GRAPHIC_SPACING;

				this.graphicXPosition += curWidth + GRAPHIC_SPACING;

				ungroup(adultLogo);
				
			}

			if(this.youthArtworkLayer)
			{
				var youthLogoGroup = artCopyGroup.duplicate();

				if(scaleLogo)
				{
					if(youthLogoGroup.width > youthLogoGroup.height)
					{
						if(youthLogoGroup.width > maxYouthScaledDimension/2)
							newScale = (maxYouthScaledDimension / youthLogoGroup.width) * 100;
						else
							newScale = (minYouthScaledDimension / youthLogoGroup.width) * 100;
					}
					else
					{
						if(youthLogoGroup.height > maxYouthScaledDimension/2)
							newScale = (maxYouthScaledDimension / youthLogoGroup.height) * 100;
						else
							newScale = (minYouthScaledDimension / youthLogoGroup.height) * 100;
					}
					
				}

				if(noteGroup)
				{
					noteCopy = noteGroup.duplicate(youthLogoGroup);
					hAlignCenter(youthLogoGroup,[noteCopy]);
				}

				youthLogoGroup.resize(newScale,newScale,true,true,true,true,newScale,Transformation.CENTER);

				

				pos = [this.graphicXPosition + this.youthXOffset - deltaXPosition, this.graphicYPosition + youthLogoGroup.height + 50];
				youthLogo = copyArtToMaster(youthLogoGroup,this.mockupDocument,this.youthArtworkLayer,pos);

				if(!this.adultArtworkLayer)
				{
					this.graphicXPosition += youthLogoGroup.width + GRAPHIC_SPACING;
				}
				
				if(noteGroup)
				{
					youthLogo.pageItems[noteGroup.name].moveToBeginning(youthMasterNoteGroup);
				}				

				ungroup(youthLogo);
					
			}

			

			
		}

		if(artCopyGroup.pageItems.length === 0)
		{
			artCopyGroup.remove();
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
		this.adultGarmentFolder = this.adultGarmentCode ? locateCTFolder(this.adultGarmentCode) : undefined;
		
		//if this garment is a bag, there's no youth sizing.. skip this part.
		if(this.youthGarmentCode && data.garment.toLowerCase().indexOf("bag") === -1)
		{
			this.youthGarmentFolder = locateCTFolder(this.youthGarmentCode);
		}
		if(this.adultGarmentFolder && this.adultGarmentCode)
		{
			// this.adultGarmentFile = this.getFile(this.adultGarmentFolder,this.styleNumber);
			this.adultGarmentFile = getFile(this.adultGarmentFolder,this.styleNumber,this.adultGarmentCode + "_" + this.styleNumber + this.fileSuffix);
		}
		if(this.youthGarmentFolder && this.youthGarmentCode)
		{
			// this.youthGarmentFile = this.getFile(this.youthGarmentFolder,this.styleNumber);
			this.youthGarmentFile = getFile(this.youthGarmentFolder,this.styleNumber,this.youthGarmentCode + "_" + this.styleNumber + this.fileSuffix);
		}

		log.l("adult garment file: " + this.adultGarmentFile);
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
