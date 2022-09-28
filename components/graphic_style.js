function GraphicStyle ( data )
{

	// "C1":
	// 	{
	// 		"id": "C1",
	// 		"colorCode": "RB",
	// 		"pattern":
	// 		{
	// 			"opacity": 1,
	// 			"scale": 1,
	// 			"horizontal": "0",
	// 			"vertical": "0",
	// 			"colorCode": "HP",
	// 			"id": "bricks"
	// 		}
	// 	}

	this.data = data;
	this.doc;
	this.swatches;
	this.plainFill = false;

	//this is the "C1" color code representing the placeholder swatch name
	//the swatch with this name will be replaced with the backgroundColor
	this.placeholderColor = this.data.id;
	this.placeholderSwatch;

	this.backgroundColor = BUILDER_COLOR_CODES[ this.data.colorCode ];
	this.backgroundSwatch;

	if ( this.data.gradient )
	{
		this.gradientColor = BUILDER_COLOR_CODES[ this.data.gradient.colorCode ];
		this.gradientID = this.data.gradient.id;
		this.gTop = this.data.gradient.top;
	}

	if ( this.data.pattern )
	{
		this.patternID = this.data.pattern.id;
		this.patternColor = BUILDER_COLOR_CODES[ this.data.pattern.colorCode ] || null;
		this.patternScale = this.data.pattern.scale * 100 || null;
		this.patternFolder;
		this.patternFile;
	}


	this.exec = function ()
	{
		if ( this.data.pattern || this.data.gradient )
		{
			this.patternStyleNumber = this.data.pattern ? patternStyleConverter( this.data.pattern.id ) : "0000";

			this.patternFolder = Folder( graphicsPath + "Pattern Fills/" );
			this.sourceFile = getFile( this.patternFolder, this.patternStyleNumber, "DSPATTERN-" + this.patternStyleNumber );
			if ( !this.sourceFile || !this.sourceFile.exists )
			{
				errorList.push( "Failed to find a source file for pattern/gradient style number: " + this.patternStyleNumber );
				return;
			}

			//source file exists, process it
			this.processGsFile();
		}
		else
		{
			this.placeholderSwatch = makeNewSpotColor( this.placeholderColor );
			curGarment.mockupDocument.selection = null;
			this.backgroundSwatch = makeNewSpotColor( this.backgroundColor );
			curGarment.mockupDocument.defaultFillColor = this.backgroundSwatch.color;
			var tmpRect = curGarment.mainMockupLayer.pathItems.rectangle( 0, 0, 5, 5 );
			tmpRect.selected = true;
			//create the graphic style
			createAction( "graphic_style_from_selection", GRAPHIC_STYLE_FROM_SELECTION_ACTION_STRING );
			app.doScript( "graphic_style_from_selection", "graphic_style_from_selection" );
			removeAction( "graphic_style_from_selection" );
			var graphicStyles = curGarment.mockupDocument.graphicStyles;
			var gs = graphicStyles[ graphicStyles.length - 1 ];
			gs.name = this.data.id;
			tmpRect.remove();

			curGarment.mockupDocument.selection = null;
			curGarment.mockupDocument.defaultFillColor = this.placeholderSwatch.color;
			app.executeMenuCommand( "Find Fill Color menu item" );
			afc( curGarment.mockupDocument, "selection" ).forEach( function ( item )
			{
				gs.applyTo( item );
			} )

		}

	}

	//gsFile is the pattern/gradient file from which we will build
	//the appropriate graphic style
	//open the file, swap the colors, identify the appropriate elements,
	//make a graphic style, apply it to the target block, then temporarily
	//duplicate the target block into the master file to import the graphic style
	// then delete the target block.
	this.processGsFile = function ()
	{
		app.open( this.sourceFile );
		this.doc = app.activeDocument;
		this.swatches = this.doc.swatches;
		this.doc.selection = null;
		this.doc.defaultFillColor = new NoColor();
		this.doc.defaultStrokeColor = new NoColor();

		var livePatternLayer = findSpecificLayer( this.doc.layers, "Live Pattern" );
		if ( !livePatternLayer )
		{
			errorList.push( "This pattern is not yet optimized for this script." );
			log.e( "Pattern file: " + this.sourceFile.toString() + ", does not contain a Pattern layer" );

			//attention
			//TODO
			//this is a good place for logic that sends info to a specific log file about garments/graphics
			//that need fixing.. Idk if it should be one file called "fixes needed"... Maybe a JSON file
			//containing the garment/graphic codes and an array of strings describing which fixes are necessary?
			//Then we could more easily track these kinds of issues and ensure that we are spending our time
			//fixing the files that are used most frequently and not wasting time on files that are rarely used.
			//attention

			filesToClose.push( this.doc );
			this.mockupDocument.activate();
			return;
		}

		//normalize the sublayer names to preclude spelling issues such as "bellow"...
		//loop the livePatternLayer's layers and fix the names
		gbp = findSpecificLayer( livePatternLayer, "bel", "any" );
		if ( gbp ) gbp.name = "Gradient_Below_Pattern";
		gap = findSpecificLayer( livePatternLayer, "abo", "any" );
		if ( gap ) gap.name = "Gradient_Above_Pattern";

		var gsType = ( this.data.pattern && this.data.gradient ) ? "both" : ( this.data.pattern ? "pattern" : "gradient" );



		//this will be whichever artwork is required.. 
		//gradient only, or pattern above/below gradient.
		var srcRect;




		//merge the colors
		mergeSwatches( "C1", this.backgroundColor );
		if ( this.patternColor ) mergeSwatches( "P1", this.patternColor );
		if ( this.gradientColor ) mergeSwatches( "G1", this.gradientColor );



		if ( gsType === "pattern" )
		{
			srcRect = findSpecificPageItem( livePatternLayer, "no_gradient", "any" );
			if ( !srcRect )
			{
				srcRect = livePatternLayer.pathItems.rectangle( 0, 0, 100, 100 );
				srcRect.stroked = false;
				srcRect.fillColor = this.backgroundSwatch.color;
				srcRect.selected = true;
				createAction( "add_new_fill", ADD_NEW_FILL_ACTION_STRING );
				app.doScript( "add_new_fill", "add_new_fill" );
				removeAction( "add_new_fill" );

				var patSwatch = findSpecificSwatch( this.doc, "DSPATTERN-" + this.patternStyleNumber );
				if ( !patSwatch )
				{
					patSwatch = findSpecificSwatch( this.doc, "DSPATTERN_" + this.patternStyleNumber );
				}
				if ( !patSwatch )
				{
					errorList.push( "Failed to find a pattern swatch for pattern style number: " + this.patternStyleNumber );
					return;
				}
				srcRect.fillColor = patSwatch.color;
			}
		}
		else 
		{
			gradientLayer = ( gap && gbp && this.gTop ? gap : gbp ) || findSpecificLayer( livePatternLayer, "no_pattern", "any" );
			if ( !gradientLayer )
			{
				errorList.push( "Failed to find the gradient only layer..?" );
				return;
			}

			srcRect = findSpecificPageItem( gradientLayer, this.gradientID, "any" );
		}

		if ( this.patternScale )
		{
			srcRect.resize( this.patternScale, this.patternScale, true, true, true, true, this.patternScale );
		}

		this.doc.selection = null;
		srcRect.selected = true;

		//create the graphic style
		createAction( "graphic_style_from_selection", GRAPHIC_STYLE_FROM_SELECTION_ACTION_STRING );
		app.doScript( "graphic_style_from_selection", "graphic_style_from_selection" );
		removeAction( "graphic_style_from_selection" );
		this.doc.graphicStyles[ this.doc.graphicStyles.length - 1 ].name = data.id;

		var dupTarget = srcRect.duplicate( curGarment.mainMockupLayer );
		dupTarget.remove();

		filesToClose.push( this.doc );
		currentMockup.activate();



		// //both pattern AND gradient
		// if ( data.pattern && data.gradient )
		// {
		// 	if ( data.gradient.top )
		// 	{
		// 		this.targetBlock = gap.pageItems[ data.gradient.id ];
		// 	}
		// 	else
		// 	{
		// 		this.targetBlock = gbp.pageItems[ data.gradient.id ];
		// 	}
		// }

		// //only a gradient
		// else if ( data.gradient )
		// {
		// 	this.targetBlock = livePatternLayer.layers[ "No_Pattern" ].pageItems[ data.gradient.id ];
		// }

		// // only a pattern
		// else if ( data.pattern )
		// {
		// 	this.targetBlock = findSpecificPageItem( livePatternLayer, "no_gradient" );
		// 	if ( !this.targetBlock )
		// 	{
		// 		this.targetBlock = livePatternLayer.pathItems.rectangle( 103, 710, 152, 152 );
		// 		this.targetBlock.stroked = false;
		// 		this.targetBlock.fillColor = this.backgroundSwatch.color;
		// 		this.targetBlock.selected = true;
		// 		createAction( "add_new_fill", ADD_NEW_FILL_ACTION_STRING );
		// 		app.doScript( "add_new_fill", "add_new_fill" );
		// 		removeAction( "add_new_fill" );
		// 		var patternSwatch;
		// 		var curSwatch;
		// 		var patternCodeRegex = /^dspattern[\s]*[-_]/i;
		// 		for ( var p = app.activeDocument.swatches.length - 1; p >= 0 && !patternSwatch; p-- )
		// 		{
		// 			curSwatch = app.activeDocument.swatches[ p ];
		// 			if ( patternCodeRegex.test( curSwatch.name ) && curSwatch.name.indexOf( this.patternStyleNumber ) > -1 )
		// 			{
		// 				patternSwatch = curSwatch;
		// 			}
		// 		}

		// 		if ( patternSwatch )
		// 		{
		// 			this.targetBlock.fillColor = patternSwatch.color;
		// 			this.targetBlock.name = "no_gradient";
		// 		}
		// 		else
		// 		{
		// 			errorList.push( "Failed to identify the correct pattern swatch for: DSPATTERN-" + this.patternStyleNumber );
		// 			log.e( "Failed to identify the correct pattern swatch for: DSPATTERN-" + this.patternStyleNumber );
		// 		}
		// 	}
		// }

		// //just a solid fill color
		// else
		// {
		// 	this.targetBlock = livePatternLayer.pathItems.rectangle( 103, 710, 152, 152 );
		// 	this.targetBlock.filled = true;
		// 	this.targetBlock.stroked = false;
		// 	this.targetBlock.fillColor = this.backgroundSwatch.color;
		// }



		// this.targetBlock.name = data.id;
		// this.doc.selection = null;
		// this.targetBlock.selected = true;
		// this.recolor( "C1" );
		// if ( this.patternScale )
		// {
		// 	this.targetBlock.resize( this.patternScale * 100, this.patternScale * 100, true, true, true, true );
		// }
		// filesToClose.push( this.doc );
		// currentMockup.layers[ 0 ].locked = false;
		// currentMockup.layers[ 0 ].visible = true;


		// if ( this.targetBlock )
		// {
		// 	//select the target block and create a new graphic style
		// 	this.doc.selection = null;
		// 	this.targetBlock.selected = true;
		// 	createAction( "graphic_style_from_selection", GRAPHIC_STYLE_FROM_SELECTION_ACTION_STRING );
		// 	app.doScript( "graphic_style_from_selection", "graphic_style_from_selection" );
		// 	removeAction( "graphic_style_from_selection" );
		// 	this.doc.graphicStyles[ this.doc.graphicStyles.length - 1 ].name = data.id;
		// 	var dupTarget = this.targetBlock.duplicate( currentMockup );
		// 	dupTarget.remove();
		// }

		// tmpLay.remove();
	}

	// this.recolor = function ( inputColor )
	// {
	// 	mergeSwatches( inputColor, this.backgroundColor );

	// 	if ( data.pattern )
	// 	{
	// 		this.processPattern();
	// 	}

	// 	if ( data.gradient )
	// 	{
	// 		this.processGradient();
	// 	}
	// }

	// this.processPattern = function ()
	// {

	// 	this.patternColor = BUILDER_COLOR_CODES[ data.pattern.colorCode ];
	// 	this.patternScale = data.pattern.scale;
	// 	mergeSwatches( "P1", this.patternColor );

	// }

	// this.processGradient = function ()
	// {
	// 	this.gradientColor = BUILDER_COLOR_CODES[ data.gradient.colorCode ];
	// 	mergeSwatches( "G1", this.gradientColor );
	// }

	// this.recolorGradients = function ()
	// {
	// 	var curGrad, curStop;
	// 	for ( var rg = 0, len = this.doc.gradients.length; rg < len; rg++ )
	// 	{
	// 		curGrad = this.doc.gradients[ rg ];
	// 		for ( var y = 0, yLen = curGrad.gradientStops.length; y < yLen; y++ )
	// 		{
	// 			curStop = curGrad.gradientStops[ y ];
	// 			curStop.color = this.swatches[ this.gradientColor ].color;
	// 		}
	// 	}
	// }

}