
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

				//variables to hold the above pattern or below pattern layers
				var gbp,gap;

				var livePatternLayer = findSpecificLayer(this.doc.layers,"Live Pattern");
				if(!livePatternLayer)
				{
					errorList.push("This pattern is not yet optimized for this script.");
					log.e("Pattern file does not contain a Pattern layer");
					filesToClose.push(this.doc);
					return;
				}
				else
				{
					//normalize the sublayer names to preclude spelling issues such as "bellow"...
					//loop the livePatternLayer's layers and fix the names
					var curLay;
					var belPat = /^.*_bel.*_.*/i;
					var aboPat = /^.*_abo.*_.*/i
					for(var n=0,len=livePatternLayer.layers.length;n<len;n++)
					{
						curLay = livePatternLayer.layers[n];
						curLay.name = curLay.name.replace(belPat,"Gradient_Below_Pattern");
						curLay.name = curLay.name.replace(aboPat,"Gradient_Above_Pattern");
						
						if(belPat.test(curLay.name))
						{
							gbp = curLay;
						}
						if(aboPat.test(curLay.name))
						{
							gap = curLay;
						}
					}
				}


				var gradientLayer;

				//both pattern AND gradient
				if(data.pattern && data.gradient)
				{
					if(data.gradient.top)
					{
						this.targetBlock = gap.pageItems[data.gradient.id];
					}
					else
					{
						this.targetBlock = gbp.pageItems[data.gradient.id];
					}
				}

				//only a gradient
				else if(data.gradient)
				{
					this.targetBlock = livePatternLayer.layers["No_Pattern"].pageItems[data.gradient.id];
				}
				
				// only a pattern
				else if(data.pattern)
				{
					try
					{
						this.targetBlock = livePatternLayer.pageItems["no_gradient"];
					}
					catch(e)
					{
						this.targetBlock = livePatternLayer.pathItems.rectangle(103,710,152,152);
						this.targetBlock.stroked = false;
						this.targetBlock.fillColor = makeNewSpotColor(this.backgroundColor).color;
						this.targetBlock.selected = true;
						createAction("add_new_fill",ADD_NEW_FILL_ACTION_STRING);
						app.doScript("add_new_fill","add_new_fill");
						removeAction("add_new_fill");
						var patternSwatch;
						var curSwatch;
						for(var p = app.activeDocument.swatches.length - 1; p>=0 && !patternSwatch; p--)
						{
							curSwatch = app.activeDocument.swatches[p];
							if(curSwatch.name.indexOf("DSPATTERN-") === 0)
							{
								patternSwatch = curSwatch;
							}
						}
						
						this.targetBlock.fillColor = patternSwatch.color;
						this.targetBlock.name = "no_gradient";
					}
				}

				//just a solid fill color
				else
				{
					this.targetBlock = livePatternLayer.pathItems.rectangle(103,710,152,152);
					this.targetBlock.filled = true;
					this.targetBlock.stroked = false;
					this.targetBlock.fillColor = makeNewSpotColor(this.backgroundColor).color;
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

			if(data.pattern)
			{
				this.processPattern();
			}

			if(data.gradient)
			{
				this.processGradient();
			}
		}

		this.processPattern = function()
		{

			this.patternColor = BUILDER_COLOR_CODES[data.pattern.colorCode];
			this.patternScale = data.pattern.scale;
			mergeSwatches("P1",this.patternColor);

		}  
		
		this.processGradient = function()
		{
			this.gradientColor = BUILDER_COLOR_CODES[data.gradient.colorCode];
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