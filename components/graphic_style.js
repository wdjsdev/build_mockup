
	function GraphicStyle(data)
	{
		this.sourceFile;
		this.doc;
		this.swatches;
		this.validGraphicStyle = false;

		//targetBlock is the pre-built rectangle
		//with the correct appearance applied
		this.targetBlock;

		this.backgroundColor;

		this.gradientColor;
		this.gradientID;
		this.gradientOnTop;

		this.patternColor;
		this.patternScale;
		this.patternFile;

		if(data.pattern)
		{
			this.patternStyleNumber = patternStyleConverter(data.pattern.id);
		}
		else
		{
			this.patternStyleNumber = "0000_No_Pattern";
		}
		this.patternFolder = locateGraphicFolder("DSPATTERN-" + this.patternStyleNumber);

		this.init = function()
		{
			// this.getSourceFile();
			if(this.patternFolder)
			{
				this.sourceFile = getFile(this.patternFolder,this.patternStyleNumber);
			}
			if(this.sourceFile)
			{
				app.open(this.sourceFile);
				this.doc = app.activeDocument;
				this.swatches = this.doc.swatches;
				this.backgroundColor = BUILDER_COLOR_CODES[data.colorCode];

				var livePatternLayer = findSpecificLayer(this.doc.layers,"Live Pattern");
				if(!livePatternLayer)
				{
					errorList.push("This pattern is not yet optimized for this script.");
					log.e("Pattern file does not contain a Pattern layer");
					filesToClose.push(this.doc);
					return;
				}


				var gradientLayer;
				if(data.pattern && data.gradient)
				{
					if(data.gradient.top)
					{
						gradientLayer = livePatternLayer.layers["Gradient_Above_Pattern"];
					}
					else
					{
						gradientLayer = livePatternLayer.layers["Gradient_Below_Pattern"];	
					}
					this.targetBlock = gradientLayer.pageItems[data.gradient.id];
				}
				else if(data.gradient)
				{
					this.targetBlock = livePatternLayer.layers["No_Pattern"].pageItems[data.gradient.id];
				}
				else
				{
					this.targetBlock = livePatternLayer.pathItems.rectangle(103,710,152,152);
					this.targetBlock.filled = true;
					this.targetBlock.stroked = false;
					this.targetBlock.fillColor = makeNewSpotColor(this.backgroundColor).color;
				}

				if(data.pattern)
				{
					this.doc.selection = null;
					this.targetBlock.selected = true;
					createAction("add_new_fill",ADD_NEW_FILL_ACTION_STRING);
					app.doScript("add_new_fill","add_new_fill");
					removeAction("add_new_fill");

					for(var s=0,len=this.swatches.length;s<len;s++)
					{
						if(this.swatches[s].name.indexOf("DSPATTERN") === 0)
						{
							this.doc.defaultFillColor = this.swatches[s].color;
						}
					}
					
				}

				this.targetBlock.name = data.id;
				this.doc.selection = null;
				this.targetBlock.selected = true;
				app.executeMenuCommand("Inverse menu item");
				app.cut();
				this.recolor();
				this.targetBlock.selected = true;
				if(this.patternScale)
				{
					this.targetBlock.resize(this.patternScale*100,this.patternScale*100,true,true,true,true);
				}
				createAction("graphic_style_from_selection",GRAPHIC_STYLE_FROM_SELECTION_ACTION_STRING);
				app.doScript("graphic_style_from_selection","graphic_style_from_selection");
				removeAction("graphic_style_from_selection");
				this.doc.graphicStyles[this.doc.graphicStyles.length-1].name = data.id;
				filesToClose.push(this.doc);
				currentMockup.layers[0].locked = false;
				currentMockup.layers[0].visible = true;
				var dupTarget = this.targetBlock.duplicate(currentMockup);
				dupTarget.remove();
				this.validGraphicStyle = true;
			}
			else
			{
				errorList.push("Failed to find the graphic style source file.");
				log.e("Failed to find the graphic style source file.::data = " + JSON.stringify(data));
				return;
			}



			

			
		}

		this.recolor = function()
		{
			mergeSwatches("C1",this.backgroundColor);
			// this.backgroundSwatch = makeNewSpotColor(this.backgroundColor);
			// this.doc.selection = null;
			// this.doc.defaultFillColor = makeNewSpotColor(data.id).color;
			// app.executeMenuCommand("Find Fill Color menu item");
			// this.doc.defaultFillColor = this.backgroundSwatch.color;

			if(data.pattern)
			{
				this.processPattern();
			}

			if(data.gradient)
			{
				this.processGradient();
			}
		}

		// this.getSourceFile = function()
		// {
		// 	var id;
		// 	if(data.pattern)
		// 	{
		// 		id = data.pattern.id;
		// 	}
		// 	else
		// 	{
		// 		id = "NONE";
		// 	}
		// 	var patternStyleNumber = patternStyleConverter(id);
		// 	var patternFolder = locateGraphicFolder("DSPATTERN-" + patternStyleNumber);
		// 	var files = patternFolder.getFiles("*" + patternStyleNumber + "*");
		// 	if(files.length)
		// 	{
		// 		log.l("found " + files.length + " files matching the style number: " + patternStyleNumber);
		// 		log.l(files.join(", "));
		// 		this.sourceFile = files[0];
		// 	}
		// 	else
		// 	{	
		// 		log.e("found no pattern files matching the style number: " + patternStyleNumber);
		// 		errorList.push("Failed to find a pattern fill file for")
		// 	}


		// }

		this.processPattern = function()
		{

			this.patternColor = BUILDER_COLOR_CODES[data.pattern.colorCode];
			this.patternScale = data.pattern.scale;
			mergeSwatches("P1",this.patternColor);

		}  
		
		this.processGradient = function()
		{
			this.gradientColor = BUILDER_COLOR_CODES[data.gradient.colorCode];
			// makeNewSpotColor(this.gradientColor);
			// this.recolorGradients()
			mergeSwatches("G1",this.gradientColor);
		}

		this.recolorGradients = function()
		{
			var curGrad,curStop;
			for(var rg=0,len=this.doc.gradients.length;rg<len;rg++)
			{
				curGrad = this.doc.gradients[rg];
				for(var y=0,yLen=curGrad.gradientStops.length;y<yLen;y++)
				{
					curStop = curGrad.gradientStops[y];
					curStop.color = this.swatches[this.gradientColor].color;
				}
			}
		}

	}