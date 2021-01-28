//config is the entire config or configReverse object
//data is the top or bottom object
function Garment(config,data,designNumber)
{
	this.designNumber = designNumber;
	this.garmentCode = "";
	this.garmentWearer = ""; //this is either M, W, or Y 
	this.bigLogoSize = 1.3; //default is 13 inches at 10% scale
	this.smallLogoSize = .4; // default is 4 inches at 10% scale
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
			mergeTemplate(this.mockupDocument);
			this.youthMockupLayer = findSpecificLayer(this.mockupDocument.layers[1],"Mockup");
			filesToClose.push(youthDoc);
			currentMockup.activate();
			app.executeMenuCommand("fitall");
			app.redraw();
		}
		
		this.adultMockupLayer = findSpecificLayer(this.mockupDocument.layers[0],"Mockup");
		if(!this.adultMockupLayer)
		{
			this.adultMockupLayer = this.mockupDocument.layers.add();
			this.adultMockupLayer.name = "Mockup";
		}

		this.adultArtworkLayer = findSpecificLayer(this.mockupDocument.layers[0],"Artwork Layer");
		if(!this.adultArtworkLayer)
		{
			this.adultArtworkLayer = this.mockupDocument.layers.add();
			this.adultArtworkLayer.name = "Artwork";
		}
		
		this.adultMockupArtboard = this.mockupDocument.artboards[0];
		

		// this.mockupDocument.rulerOrigin = [this.adultMockupArtboard.artboardRect[0],this.adultMockupArtboard.artboardRect[1]];


		this.saveFile = this.getSaveFile();

		currentMockup.saveAs(this.saveFile);
		curGarmentIndex++;
		
		if(this.adultMockupLayer)
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
			// curGraphic.name = g;

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

		if(this.adultGarmentCode == "FD-500" || this.adultGarmentCode == "FD-400")
		{
			this.adultGarmentCode += "W";
		}


		if(womensCodePat.test(this.adultGarmentCode))
		{
			this.garmentWearer = "W";
			this.youthGarmentCode = this.adultGarmentCode.replace(womensCodePat,"G");
			this.bigLogoSize = 1.15;
			this.smallLogoSize = .3;
		}
		else if(girlsCodePat.test(this.adultGarmentCode))
		{
			this.garmentWearer = "G";
			this.youthGarmentCode = this.adultGarmentCode;
			this.adultGarmentCode = this.youthGarmentCode.replace(girlsCodePat,"W");
			this.bigLogoSize = .95;
			this.smallLogoSize = .3;
		}
		else if(youthCodePat.test(this.adultGarmentCode))
		{
			this.garmentWearer = "Y";
			this.youthGarmentCode = this.adultGarmentCode;
			this.adultGarmentCode = this.youthGarmentCode.replace(youthCodePat,"");
			this.bigLogoSize = .95;
			this.smallLogoSize = .3;
		}
		else
		{
			this.garmentWearer = "M";
			this.youthGarmentCode = this.adultGarmentCode + "Y";
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
		var noteGroup,masterNoteGroup;
		var artItem;
		var curLay,curName;
		var scaleLogo = true;


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
			masterNoteGroup = findSpecificPageItem(this.adultMockupLayer,"graphic notes","any");
			if(!masterNoteGroup)
			{
				masterNoteGroup = this.adultMockupLayer.groupItems.add();
				masterNoteGroup.name = "graphic notes";
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
				return newGroup;
			})();
		}

		//container group for all artwork that will be
		//duplicated to the master file. this whole group
		//will be placed and positioned, then split into its
		//component parts.
		artCopyGroup = artLayer.groupItems.add();
		


		if(curGraphic.type === "name")
		{

			////////////////////////
			////////ATTENTION://////
			//
			//		add logic here to get the correct size name
			//		according to the wearer.. mens/womens/youth
			//
			////////////////////////
			
			//turn off for production
			//the graphic files need fixing before importing the notes for name/number files
			// if(noteGroup)
			// {
			// 	noteGroup = noteGroup.duplicate(artCopyGroup);
			// }
			var nameLabel = "2";
			if(this.garmentWearer === "Y")
			{
				nameLabel = "1.5";
			}

			var nameFrame = artLayer.pageItems["name_" + nameLabel];
			nameFrame.duplicate(artCopyGroup);

			var adultName = copyArtToMaster(artCopyGroup, this.mockupDocument, this.adultArtworkLayer);
			adultName.left = this.adultMockupArtboard.artboardRect[0] + this.graphicXPosition;
			adultName.top = this.adultMockupArtboard.artboardRect[1] + artCopyGroup.height + 50;

			ungroup(adultName);
			
			// if(noteGroup)
			// {
			// 	adultName.pageItems[noteGroup.name].moveToBeginning(masterNoteGroup);
			// }

			this.graphicXPosition += artCopyGroup.width + 50;
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
			var smallLabel, bigLabel;

			if(this.garmentWearer === "W")
			{
				smallLabel = "3";
				bigLabel = "8";
			}
			else if(this.garmentWearer === "Y" ||  this.garmentWearer === "G")
			{
				smallLabel = "3";
				bigLabel = "8";
			}
			else
			{
				smallLabel = "4";
				bigLabel = "9";
			}


			//turn off for production
			//the graphic files need fixing before importing the notes for name/number files
			// if(noteGroup)
			// {
			// 	noteGroup = noteGroup.duplicate(artCopyGroup);
			// }

			smallNum = artLayer.pageItems["number_" + smallLabel];

			smallNum = smallNum.duplicate(artCopyGroup);

			var frontNum = copyArtToMaster(artCopyGroup, this.mockupDocument, this.adultArtworkLayer);
			frontNum.left = this.adultMockupArtboard.artboardRect[0] + this.graphicXPosition;
			frontNum.top = this.adultMockupArtboard.artboardRect[1] + artCopyGroup.height + 50;

			this.graphicXPosition += artCopyGroup.width + 50;

			ungroup(frontNum);

			// if(noteGroup)
			// {
			// 	frontNum.pageItems[noteGroup.name].moveToBeginning(masterNoteGroup);
			// }



			artCopyGroup = artLayer.groupItems.add();
			

			artLayer.pageItems["number_" + bigLabel].duplicate(artCopyGroup);
			// bigNum = artLayer.pageItems["number_" + largeLabel].duplicate(artCopyGroup);

			var backNum = copyArtToMaster(artCopyGroup,this.mockupDocument,this.adultArtworkLayer);
			backNum.left = this.adultMockupArtboard.artboardRect[0] + this.graphicXPosition;
			backNum.top = this.adultMockupArtboard.artboardRect[1] + artCopyGroup.height + 50;
			
			this.graphicXPosition += artCopyGroup.width + 50;
			
			ungroup(backNum);
			
			

			// if(noteGroup)
			// {
			// 	frontNum.pageItems[noteGroup.name].moveToBeginning(masterNoteGroup);	
			// }

		}
		else if(curGraphic.type === "logo")
		{
			app.selection = null;
			artCopyGroup.name = artLayer.name;

			for(var x = artLayer.pageItems.length-1;x>=1;x--)
			{
				artLayer.pageItems[x].duplicate(artCopyGroup);
				app.redraw();
			}



			////////////////////////
			////////ATTENTION://////
			//
			//		this needs fixin. look at artpackmaker to try and
			//		reuse code for updating text without breaking character styles
			//
			////////////////////////
			//try to update graphic text...
			if(curGraphic.teamNames)
			{
				var curFrame,curText;
				for(var n=0;n < curGraphic.teamNames.length;n++)
				{

					////////////////////////
					////////ATTENTION://////
					//
					//		
					//
					//add some logic here to check the first and second character
					//of the given text to see whether it's uppercase, titlecase, or lowercase
					//......kind of.... this might work as a temporary patch until i get the 
					//artpackmaker logic sorted out.
					////////////////////////



					curText = curGraphic.teamNames[n].toUpperCase();
					curFrame = findSpecificPageItem(artCopyGroup,"graphic_text_" + (n+1));
					if(curFrame)
					{
						curFrame.contents = curText;
						log.l("Updated contents of graphic_text_" + (n+1) + " to " + curText);
					}
					else
					{
						log.e(curGraphic.name + " is missing graphic_text_" + (n+1) + " textFrame.");
					}
					curFrame = undefined;
					curText = undefined;
					// try
					// {
					// 	artCopyGroup.pageItems["graphic_text_" + (n + 1)].contents = curGraphic.teamNames[n].toUpperCase();
					// 	log.l("Changed graphic_text_" + (n+1) + " to " + curGraphic.teamNames[n].toUpperCase());
					// }
					// catch(e)
					// {
					// 	log.e(curGraphic.name + " needs to be updated to accept logo text::logo_text_fix");
					// }
				}
			}
			
			var newScale = 100;
			
			
			if(scaleLogo)
			{
				var aw = artCopyGroup.width;
				var ah = artCopyGroup.height;

				//logo is bigger than 1.3"
				//scale it to 1.3
				if(aw > this.bigLogoSize *72 || ah > this.bigLogoSize *72)
				{
					if(aw > ah)
					{
						newScale = ((this.bigLogoSize  * 72) / aw);	
					}
					else
					{
						newScale = ((this.bigLogoSize  * 72) / ah);
					}
					newScale *= 100;
				}
				//else if the graphic is approximately 4" wide (at .1 scale)
				//28 points = ~.4 inches
				else
				{
					if(this.garmentWearer === "W" || this.garmentWearer === "Y")
					{
						//scale to this.smallLogoSize inches at max dimension
						newScale = (this.smallLogoSize * 72) / (aw > ah ? aw : ah);
						newScale *= 100;
					}
				}
				
			}

			if(noteGroup)
			{
				noteGroup.moveToBeginning(artCopyGroup);
			}

			log.l("Resizing logo. newScale = " + newScale)
			artCopyGroup.resize(newScale,newScale,true,true,true,true,newScale,Transformation.CENTER);
			


			//copy the artwork group 
			var adultNewGroup = copyArtToMaster(artCopyGroup,this.mockupDocument,this.adultArtworkLayer);
			adultNewGroup.left = this.adultMockupArtboard.artboardRect[0] + this.graphicXPosition;
			adultNewGroup.top = this.adultMockupArtboard.artboardRect[1] + adultNewGroup.height + 50;

			this.graphicXPosition += adultNewGroup.width + 50;
			
			if(noteGroup)
			{
				adultNewGroup.pageItems[noteGroup.name].moveToBeginning(masterNoteGroup);
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
