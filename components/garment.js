//config is the entire config or configReverse object
//data is the top or bottom object
function Garment ( config, data, designNumber )
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
	this.adultInfoLayer;
	this.youthInfoLayer;

	this.paramLayer;

	this.graphicXPosition = 0;
	this.graphicYPosition = 0;
	this.youthXOffset = 0;

	var deltaXPosition = 0;
	const GRAPHIC_SPACING = 50;



	this.init = function ()
	{
		log.l( "Initializing garment object." );
		this.setGarmentCodes();
		this.setStyleNumber();
		this.getGarments();
		this.getGraphics();
	}





	this.processGarment = function ()
	{
		var necessaryLayers = [ [ "MockupLayer", "Mockup" ], [ "ArtworkLayer", "Artwork Layer" ], [ "InfoLayer", "Information" ] ];
		if ( this.adultGarmentFile )
		{
			this.openCT( this.adultGarmentFile );
			this.mockupDocument = app.activeDocument;


			var adultLayer = findSpecificLayer( this.mockupDocument, this.adultGarmentCode.replace( /.*[-_]/i, "" ), "any" );
			if ( adultLayer )
			{
				adultLayer.locked = false;
				adultLayer.visible = true;
				//locate or initialize the necessary layers
				necessaryLayers.forEach( function ( nl )
				{
					var lay = findSpecificLayer( adultLayer, nl[ 1 ], "any" ) || adultLayer.layers.add();
					lay.name = nl[ 1 ];
					lay.locked = false;
					lay.visible = true;
					curGarment[ "adult" + nl[ 0 ] ] = lay;
				} )
				this.adultPlacementGuides = findSpecificLayer( this.adultInfoLayer, "Placement Guides" );
				this.adultMockupArtboard = this.mainMockupArtboard = this.mockupDocument.artboards[ 0 ];
				this.mainMockupLayer = this.adultMockupLayer;

			}

		}
		if ( this.youthGarmentFile )
		{
			this.openCT( this.youthGarmentFile );
			var youthDoc = app.activeDocument;

			//if there's and audult and youth, merge the youth file into the adult file
			if ( this.adultGarmentFile )
			{
				mergeTemplate( this.mockupDocument );
				this.adultInfoLayer.locked = false;
				filesToClose.push( youthDoc );
				this.mockupDocument.activate();
				app.executeMenuCommand( "fitall" );
				this.mockupDocument.artboards.setActiveArtboardIndex( 0 );
				app.redraw();
			}
			else
			{
				this.mockupDocument = app.activeDocument;
			}

			var youthLayer = findSpecificLayer( this.mockupDocument.layers, this.youthGarmentCode.replace( /.*[-_]/i, "" ), "any" );
			if ( youthLayer )
			{
				youthLayer.locked = false;
				youthLayer.visible = true;

				//locate or initialize the necessary layers
				necessaryLayers.forEach( function ( nl )
				{
					var lay = findSpecificLayer( youthLayer, nl[ 1 ], "any" ) || youthLayer.layers.add();
					lay.name = nl[ 1 ];
					lay.locked = false;
					lay.visible = true;
					curGarment[ "youth" + nl[ 0 ] ] = lay;
				} )
				this.youthPlacementGuides = findSpecificLayer( this.youthInfoLayer, "Placement Guides" );
				this.youthMockupArtboard = this.mockupDocument.artboards[ this.adultGarmentFile ? 1 : 0 ];
			}

			if ( this.youthMockupArtboard && this.adultMockupArtboard )
			{
				this.youthXOffset = this.youthMockupArtboard.artboardRect[ 0 ] - this.adultMockupArtboard.artboardRect[ 0 ];
			}

			if ( !this.adultMockupLayer )
			{
				this.mainMockupLayer = this.youthMockupLayer;
				this.mainMockupArtboard = this.youthMockupArtboard;
			}

			this.mainMockupLayer.locked = false;
			this.mainMockupLayer.visible = true;
		}

		if ( !this.adultGarmentFile && !this.youthGarmentFile )
		{
			log.e( "No youth or adult garment file found?" )
			errorList.push( "Failed to find a file for the garment: " + ( this.garmentCode || this.youthGarmentCode || undefined ) );
			return;
		}
		else if ( !this.mainMockupLayer )
		{
			log.e( "No mockup layer found?" );
			errorList.push( "Failed to find a garment layer for the garment: " + this.garmentCode );
			return;
		}
		else
		{
			this.mockupDocument = currentMockup = app.activeDocument;
			this.mainMockupLayer.locked = false;
			this.mainMockupLayer.visible = true;
			this.graphicYPosition = this.mockupDocument.artboards[ 0 ].artboardRect[ 1 ];
			this.processMockup( this.mockupDocument )
		}


	}

	this.openCT = function ( file )
	{
		this.openFile( file );
		app.executeMenuCommand( "fitall" );
	}


	this.processMockup = function ( file )
	{
		this.saveFile = this.getSaveFile();

		app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
		currentMockup.saveAs( this.saveFile );
		app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
		curGarmentIndex++;

		//add the design number to the mockup(s)
		[ this.adultInfoLayer, this.youthInfoLayer ].forEach( function ( il, index )
		{
			if ( !il ) return;

			var docArtboards = afc( curGarment.mockupDocument, "artboards" );
			var onFrame; //order number text frame
			var curArtboard = docArtboards[ index ] || docArtboards[ 0 ];
			var abRect = curArtboard.artboardRect;
			onFrame = findSpecificPageItem( il, "Order Number", "any" );
			if ( !onFrame )
			{
				afc( il, "textFrames" ).forEach( function ( tf )
				{
					if ( tf.contents.match( /order.*team/i ) )
					{
						onFrame = tf;
					}
				} );
				onFrame = onFrame || il.textFrames.add();
				onFrame.contents = "Order Number_Team Name";

				onFrame.position = [ abRect[ 0 ] + 110, abRect[ 1 ] - 10 ];
			}

			docArtboards.forEach( function ( ab )
			{
				if ( isContainedWithin( onFrame, ab ) )
				{
					curArtboard = ab;
					abRect = ab.artboardRect;
				}
			} );
			onFrame.name = "Order Number";
			onFrame.contents = orderNumber + " " + teamName;

			var dnFrame; //design number text frame
			dnFrame = onFrame.duplicate();
			dnFrame.name = "Design ID";
			dnFrame.contents = designNumber;
			dnFrame.position = [ onFrame.left, onFrame.top - dnFrame.height ];

			var initialsFrame = findSpecificPageItem( il, "initials", "any" );
			if ( !initialsFrame )
			{
				var frames = afc( il, "textFrames" ).filter( function ( tf ) { return tf.contents.match( /^ABC/i ); } );
				if ( frames.length )
				{
					initialsFrame = frames[ 0 ];
				}
			}
			if ( !initialsFrame )
			{
				initialsFrame = il.textFrames.add();
				initialsFrame.name = "ABC " + getDate();
				initialsFrame.position = [ abRect[ 2 ] - 275, abRect[ 1 ] - 15 ];
			}

			initialsFrame.contents = ( BATCH_MODE ? "ABC" : getUserInitials() ) + " " + getDate();


			var code = curGarment[ ( index === 0 ? "adult" : "youth" ) + "GarmentCode" ].toLowerCase();
			var ageGender = { "y": "YOUTH", "w": "WOMENS", "g": "GIRLS", "m": "MENS" }[ code.match( /y|w|g/i ) ? code.match( /y|w|g/i )[ 0 ] : "m" ]
			var ageGenderLabelFrame = il.textFrames.add();
			ageGenderLabelFrame.name = "Mockup Label";
			ageGenderLabelFrame.contents = ageGender;
			ageGenderLabelFrame.textRange.characterAttributes.size = 40;
			ageGenderLabelFrame.textRange.fillColor = makeNewSpotColor( "CUT LINE" ).color;
			ageGenderLabelFrame.textRange.strokeColor = makeNewSpotColor( "CUT LINE" ).color;
			ageGenderLabelFrame.position = [ abRect[ 0 ], abRect[ 1 ] + 60 ];

			[ onFrame, dnFrame, initialsFrame ].forEach( function ( tf )
			{
				tf.textRange.fillColor = makeNewSpotColor( "Info B" ).color;
				tf.textRange.fillColor.tint = 0;
				tf.textRange.strokeColor = new NoColor();
			} )

		} );

		if ( this.mainMockupLayer )
		{
			this.recolorGarment( this.garmentColors );
		}
		else
		{
			log.e( "No mockup layer found. Skipping recolorGarment function." );
		}

		if ( this.saveFile )
		{
			app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
			this.mockupDocument.save();
			app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
		}

		//check to see whether this graphic is relevant....
		//if placement guides exist, 
		//check to see if the locs listed in curGraphic.locations are in the placement guides
		//else if no placementGuides
		//if it's a bottom graphic (i.e. graphic location starts with a "b"), and the garment is a top, skip it
		//and vice versa..
		var relevantGraphics = getRelevantGraphics( this ); //array of graphics that are relevant to the current garment 

		if ( !relevantGraphics.length )
		{
			//none of the graphics are relevant to this garment, so skip it
			return;
		}


		//make a graphics folder to save the recolored graphics
		localGraphicsFolderPath = curOrderFolderPath + "/" + this.designNumber + "_assets";
		localGraphicsFolder = Folder( localGraphicsFolderPath );
		if ( !localGraphicsFolder.exists )
		{
			log.l( "Creating localGraphicsFolder here: " + localGraphicsFolderPath );
			localGraphicsFolder.create();
		}


		log.h( "Looping graphics for the mockup: " + this.saveFile.name );
		relevantGraphics.forEach( function ( curGraphic )
		{
			var curGraphic, graphicSaveFile, graphicSaveFileName, curGraphicDoc;
			var curAppendage;
			var graphicAppendagePat = /_[\d].ai$/;
			var numPat = /fdsn/i;
			var namePat = /fdsp/i;

			log.l( "Processing graphic: " + curGraphic.name );

			//input name number logo callouts on info layer
			var infoLabel = curGraphic.locations.indexOf( "TFCC" ) > -1 ? "Front Graphic" : curGraphic.type;
			updateInfoFrames( infoLabel, curGraphic.name )


			if ( curGraphic.file )
			{
				log.l( "full file name = " + curGraphic.file.fullName );
				curGarment.openFile( curGraphic.file );
				curGraphicDoc = app.activeDocument;
				curGarment.recolorGraphic( curGraphic.colors, curGraphic.type );

				curGarment.processGraphic( curGraphic );

				graphicsOpened++;

				graphicSaveFileName = localGraphicsFolderPath + "/" + curGraphic.name + ".ai"
				graphicSaveFile = File( graphicSaveFileName );
				while ( graphicSaveFile.exists )
				{
					if ( graphicAppendagePat.test( graphicSaveFileName ) )
					{
						curAppendage = graphicSaveFileName.substring( graphicSaveFileName.lastIndexOf( "_" ) + 1, graphicSaveFileName.indexOf( ".ai" ) );
						curAppendage = parseInt( curAppendage );
						graphicSaveFileName = graphicSaveFileName.replace( graphicAppendagePat, "_" + ( curAppendage + 1 ) );
					}
					else
					{
						graphicSaveFileName = graphicSaveFileName.replace( ".ai", "_2.ai" )
					}
					graphicSaveFile = File( decodeURI( graphicSaveFileName ) );
				}

				app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
				curGraphicDoc.saveAs( graphicSaveFile );
				app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
				log.l( "Successfully opened, recolored, and saved: " + curGraphic.name + ", as " + decodeURI( graphicSaveFile.fullName ) );

			}
		} );



	}

	this.setGarmentCodes = function ()
	{
		log.l( "setting garment codes" )
		if ( !data.mid )
		{
			log.l( "No mid value.. trying to parse it from the verbose garment code" );
			//strip the style number from the garment code
			var verboseGarmentCode = data.garment.replace( data.styleNo, "" );
			verboseGarmentCode = verboseGarmentCode.substring( 0, verboseGarmentCode.lastIndexOf( "-" ) );
			data.mid = checkForMidGarmentRelationship( verboseGarmentCode );
			log.l( "set data.mid to " + data.mid );
		}

		this.adultGarmentCode = data.mid;

		this.adultGarmentCode = garmentCodeConverter[ this.adultGarmentCode ] || this.adultGarmentCode;

		this.adultGarmentCode = this.adultGarmentCode.replace( /se$/i, "" );


		//if this garment is a "single wearer" don't build the corresponding youth/adult to match.
		//just build this garment without merging anything else into it.
		var singleWearerGarments = [ "FD-5060", "FD-5060G", "FD-5060Y", "FD-5060W", "FD-5070", "FD-5070G", "FD-5070Y", "FD-5070W", "FD-5077", "FD-5077W", "FD-5077Y", "FD-5077G", "PS-5075", "PS-5075G", "PS-5075Y", "PS-5075W", "PS-5082", "PS-5082G", "PS-5082Y", "PS-5082W", "PS-5094", "PS-5094G", "PS-5094Y", "PS-5094W", "PS-5095", "PS-5095G", "PS-5095Y", "PS-5095W", "PS-5098", "PS-5098G", "PS-5098Y", "PS-5098W", "PS-5105", "PS-5105G", "PS-5105Y", "PS-5105W", "PS-5106", "PS-5106G", "PS-5106Y", "PS-5106W" ];
		var isSingleWearerGarment = singleWearerGarments.indexOf( this.adultGarmentCode ) > -1 ? true : false;

		if ( womensCodePat.test( this.adultGarmentCode ) )
		{
			this.garmentWearer = "W";

			this.youthGarmentCode = isSingleWearerGarment ? undefined : this.adultGarmentCode.replace( womensCodePat, "G" );
			if ( this.youthGarmentCode )
			{
				this.youthGarmentCode = garmentCodeConverter[ this.youthGarmentCode ] || this.youthGarmentCode;
			}

			this.bigLogoSize = 1.15;
			this.smallLogoSize = .3;
		}
		else if ( girlsCodePat.test( this.adultGarmentCode ) )
		{
			this.garmentWearer = "G";
			this.youthGarmentCode = this.adultGarmentCode;

			this.adultGarmentCode = isSingleWearerGarment ? undefined : this.youthGarmentCode.replace( girlsCodePat, "W" );

			this.bigLogoSize = .95;
			this.smallLogoSize = .3;
		}
		else if ( youthCodePat.test( this.adultGarmentCode ) )
		{
			this.garmentWearer = "Y";
			this.youthGarmentCode = this.adultGarmentCode;

			this.adultGarmentCode = isSingleWearerGarment ? undefined : this.youthGarmentCode.replace( youthCodePat, "" );

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
		log.l( "set adultGarmentCode to " + this.adultGarmentCode );
		log.l( "set youthGarmentCode to " + this.youthGarmentCode );

	}

	this.setStyleNumber = function ()
	{
		this.styleNumber = data.styleNo;

		//check for an alphabetic style number
		var alphaStyleNumPat = /^[a-z]*[\d]?$/i;
		this.styleNumber = this.styleNumber.replace( alphaStyleNumPat, "1000" )

		//check for a style number with one or more letters appended to the end
		//example: FD-5060_1007A
		var appendedLetterPat = /([\d]*)[a-z]*/i;
		var appendageMatch = this.styleNumber.match( appendedLetterPat );
		if ( appendageMatch && appendageMatch.length && appendageMatch.length > 1 )
		{
			this.styleNumber = appendageMatch[ 1 ];
		}

		log.l( "Successfully set style number. Converted: " + data.styleNo + " to " + this.styleNumber );

	}

	this.recolorGarment = function ( colors )
	{
		log.l( "Recoloring garment." );
		var doc = app.activeDocument;
		doc.selection = null;
		doc.defaultFillColor = new NoColor();
		doc.defaultStrokeColor = new NoColor();


		hidePPLay();
		var curGStyle, patternFile;
		// var placeholderPrefix = topOrBottomSwatches();
		var placeholderPrefix = "C";

		//clear out any existing placeholder graphic styles
		var placeholderGraphicStylePat = /[cb][\d]{1,2}/i;
		for ( var gs = doc.graphicStyles.length - 1; gs >= 0; gs-- )
		{
			if ( doc.graphicStyles[ gs ].name.match( placeholderGraphicStylePat ) )
			{
				doc.graphicStyles[ gs ].remove();
			}
		}


		//check for paramcolors on the mockup layer.
		//if they don't exist yet, create them.
		//just set a boolean variable to determine whether
		//to add param blocks while recoloring the garment
		//to ensure that the mockup exporter can work properly

		this.paramLayer = findSpecificLayer( this.mainMockupLayer, "paramcolors" );

		if ( this.paramLayer )
		{
			this.paramLayer.remove();
		}

		this.paramLayer = this.mainMockupLayer.layers.add();
		this.paramLayer.name = "paramcolors";


		var graphicStyleName;
		for ( var ph in colors )
		{
			if ( /_[\d]*_/.test( ph ) || colors[ ph ].colorCode === "" )
			{
				//wonky data.. ignore it.
				continue;
			}


			colors[ ph ].swatchName = BUILDER_COLOR_CODES[ colors[ ph ].colorCode ];
			updateInfoFrames( ph, colors[ ph ].swatchName );
			graphicStyleName = placeholderPrefix + ph.substring( 1, ph.length );
			colors[ ph ].id = graphicStyleName;
			curGStyle = new GraphicStyle( colors[ ph ] );

			curGStyle.exec();
			currentMockup.activate();


			updateInfoColorCallouts( graphicStyleName, colors[ ph ].swatchName );





			log.l( "Recoloring " + ph + " with " + colors[ ph ].swatchName );



			//applyGraphicStyleArguments:
			//graphicStyleName = the name of the swatch to change
			//graphicStyleName = the name of the graphic style to apply
			this.applyGraphicStyle( graphicStyleName );

			log.l( "created graphic style: " + graphicStyleName );
		}
		this.garmentColors = data.colors;
	}

	this.applyGraphicStyle = function ( placeholderName )
	{
		log.l( "Applying graphic style: " + placeholderName );
		var doc = app.activeDocument;
		var colorName = this.garmentColors[ placeholderName ].swatchName;
		var newSpotSwatch = makeNewSpotColor( colorName );
		var newSpotColor = newSpotSwatch.color;

		var phSwatches = [ placeholderName, placeholderName.replace( "C", "B" ) ];

		phSwatches.forEach( function ( ph )
		{
			var phSwatch = makeNewSpotColor( ph );
			doc.selection = null;
			doc.defaultFillColor = phSwatch.color;
			app.executeMenuCommand( "Find Fill Color menu item" );
			changeThemColors( ph.replace( "B", "C" ) );
		} );






		function changeThemColors ( phName )
		{
			try
			{
				gs = doc.graphicStyles[ phName ];
				for ( var cc = 0, len = doc.selection.length; cc < len; cc++ )
				{
					dig( doc.selection[ cc ] );
				}
			}
			catch ( e )
			{
				doc.defaultFillColor = newSpotColor;
			}
		}


		function dig ( curItem )
		{
			if ( curItem.typename === "PathItem" )
			{
				gs.applyTo( curItem );
			}
			else if ( curItem.typename === "CompoundPathItem" && curItem.pathItems.length )
			{
				gs.applyTo( curItem.pathItems[ 0 ] );
			}
			else if ( curItem.typename === "GroupItem" )
			{
				for ( var g = 0, len = curItem.pageItems.length; g < len; g++ )
				{
					dig( curItem.pageItems[ g ] );
				}
			}
		}



	}

	this.recolorGraphic = function ( colors, graphicType )
	{
		log.l( "Recoloring graphic" );
		var doc = app.activeDocument;
		var swatches = [];

		for ( var s = 0, len = doc.swatches.length; s < len; s++ )
		{
			swatches.push( doc.swatches[ s ] );
		}




		var phNumber, phSwatches, curPhSwatch;
		for ( var ph in colors )
		{
			if ( /_[\d]*_/.test( ph ) )
			{
				//wonky data.. ignore it.
				continue;
			}
			phNumber = ph.replace( /[a-z]/gi, "" );

			phSwatches = findPHSwatch( phNumber, colors[ ph ] );

			if ( !colors[ ph ].swatchName || colors[ ph ].swatchName === "" )
			{
				log.e( "colors[" + ph + "] has no swatch data." );
				continue;
			}
			for ( var x = 0; x < phSwatches.length; x++ )
			{
				curPhSwatch = phSwatches[ x ]
				if ( graphicType === "name" && curPhSwatch.name.toLowerCase().indexOf( "name" ) > -1 )
				{
					mergeSwatches( curPhSwatch.name, colors[ ph ].swatchName );
				}
				else if ( graphicType === "number" && curPhSwatch.name.toLowerCase().indexOf( "num" ) > -1 )
				{
					mergeSwatches( curPhSwatch.name, colors[ ph ].swatchName );
				}
				else if ( graphicType === "logo" )
				{
					mergeSwatches( curPhSwatch.name, colors[ ph ].swatchName );
				}
			}


			log.l( "Recolored " + ph + " with " + colors[ ph ].swatchName );
		}

		function findPHSwatch ( num, color )
		{
			var result = [];
			color.swatchName = BUILDER_COLOR_CODES[ color.colorCode ];
			var swatchName;
			for ( var s = 0, len = swatches.length; s < len; s++ )
			{
				swatchName = swatches[ s ].name.replace( /[a-z]/gi, "" );
				if ( swatchName == num )
				{
					result.push( swatches[ s ] )
				}
			}
			return result;
		}
	}

	this.processGraphic = function ( curGraphic )
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

		log.h( "Processing graphic: " + curGraphic.name + " in locations: " + curGraphic.locations.join( ", " ) );

		var doc = app.activeDocument;
		var layers = doc.layers;
		var noteLayer, artLayer;
		var noteGroup, adultMasterNoteGroup, youthMasterNoteGroup;
		var scaleLogo = true;
		var newScale = 100; //used for logo scaling. this represents a percentage
		var deltaX;

		curGraphic.type = curGraphic.name.match( /fdsp/i ) ? "name" : ( curGraphic.name.match( /fdsn/i ) ? "number" : "logo" );



		//check to see whether this is a background graphic or ghosted graphic
		//if so.. don't scale it
		if ( /(bg)|(g$)/i.test( curGraphic.name ) || curGraphic.type.match( /name|number/i ) )
		{
			scaleLogo = false;
			log.l( "setting scaleLogo to false" );
		}


		var prodLayer = findSpecificLayer( layers, "PRODUCTION" );
		if ( !prodLayer )
		{
			log.e( "The graphic file: " + curGraphic.name + " is missing the PRODUCTION layer." );
			errorList.push( "No PRODUCTION layer found for graphic: " + curGraphic.name );
			return undefined;
		}

		artLayer = findSpecificLayer( prodLayer, curGraphic.name.replace( "_", "-" ) ) || findSpecificLayer( prodLayer, curGraphic.name.replace( "-", "_" ) );
		noteLayer = findSpecificLayer( prodLayer, "notes", "any" );

		log.l( "prodLayer: " + prodLayer );
		log.l( "artLayer: " + artLayer );
		log.l( "noteLayer: " + noteLayer );

		if ( !artLayer )
		{
			log.l( "No art layer found for graphic: " + curGraphic.name );
			// log.l( "Attempting to swap the hyphen for an underscore in the graphic name." );
			// artLayer = findSpecificLayer( prodLayer, curGraphic.name.replace( "-", "_" ) );
			if ( !artLayer )
			{
				//check to see whether there are specific "wearer" layers
				//options are "MENS", "WOMENS", "YOUTH";
				//if these layers exist, determine which is the correct one
				//and use that layer as the artLayer
				var mensLayer = findSpecificLayer( prodLayer, "MENS", "imatch" );
				var womensLayer = findSpecificLayer( prodLayer, "WOMENS", "imatch" );
				var youthLayer = findSpecificLayer( prodLayer, "YOUTH" );

				if ( mensLayer || womensLayer || youthLayer )
				{
					log.l( "Found mens/womens/youth layers." )
					scaleLogo = false;
					log.l( curGraphic.name + " has artwork sublayers." );
					if ( this.garmentWearer && this.garmentWearer === "W" )
					{
						artLayer = womensLayer;
						noteLayer = findSpecificLayer( artLayer, "notes", "any" );

					}
					else if ( this.garmentWearer && this.garmentWearer.match( /[yg]/i ) )
					{
						artLayer = youthLayer;
						noteLayer = findSpecificLayer( artLayer, "notes", "any" );
					}
					else
					{
						artLayer = mensLayer;
						noteLayer = findSpecificLayer( artLayer, "notes", "any" );
					}



				}


			}
		}

		//still no art layer?
		if ( !artLayer )
		{
			log.e( "The graphic file: " + curGraphic.name + " is missing an artwork layer." );
			return undefined;
		}


		//art layer successfully found, 
		artLayer.name = curGraphic.name;
		log.l( "artLayer successfully found. artLayer.name = " + artLayer.name );

		//if there's a notes layer, make a noteGroup
		if ( noteLayer )
		{
			log.l( "set noteLayer to " + noteLayer.name );
			noteGroup = ( function ()
			{
				noteLayer.locked = false;
				noteLayer.visible = true;
				var exNoteGroup = findSpecificPageItem( noteLayer, artLayer.name + "_notes", "any" );
				if ( !exNoteGroup )
				{
					var newGroup = group( afc( noteLayer, "pageItems" ), noteLayer );
					if ( newGroup && newGroup.pageItems && newGroup.pageItems.length )
					{
						newGroup.name = artLayer.name + "_notes";
						log.l( "Made a noteGroup for " + artLayer.name );
						return newGroup;
					}
				}
				log.l( "Found an existing noteGroup for " + artLayer.name );
				return exNoteGroup;
			} )();

			if ( noteGroup && noteGroup.pageItems.length )
			{
				if ( this.adultMockupLayer )
				{
					adultMasterNoteGroup = findSpecificPageItem( this.adultMockupLayer, "graphic notes", "any" );
					if ( !adultMasterNoteGroup )
					{
						adultMasterNoteGroup = this.adultMockupLayer.groupItems.add();
						adultMasterNoteGroup.name = "graphic notes";
						log.l( "Making an adultMasterNoteGroup" );
					}
				}
				if ( this.youthMockupLayer )
				{
					youthMasterNoteGroup = findSpecificPageItem( this.youthMockupLayer, "graphic notes", "any" );
					if ( !youthMasterNoteGroup )
					{
						youthMasterNoteGroup = this.youthMockupLayer.groupItems.add();
						youthMasterNoteGroup.name = "graphic notes";
						log.l( "Making a youthMasterNoteGroup" );
					}
				}

			}
		}


		//loop each location needed for this artwork
		//and get the appropriately sized number
		var curLoc, curAdultGuide, curYouthGuide, curLabel, curLocSize;
		var guideSizePt, guideSizeIn;
		var numberFrame, numberCopy;
		var adultArt, youthArt, logoArt, noteGroupParent;

		var defaultLogoSize;
		var defaultNameSize;
		var defaultNumberSize;
		var dbLabel;

		var youthNameSize = sizingDb[ "Y" ][ "name" ];
		var youthSmallNumberSize = sizingDb[ "Y" ][ "smallNum" ];
		var youthBigNumberSize = sizingDb[ "Y" ][ "bigNum" ];
		var mensNameSize = sizingDb[ "M" ][ "name" ];
		var mensSmallNumberSize = sizingDb[ "M" ][ "smallNum" ];
		var mensBigNumberSize = sizingDb[ "M" ][ "bigNum" ];
		var womensNameSize = sizingDb[ "W" ][ "name" ];
		var womensSmallNumberSize = sizingDb[ "W" ][ "smallNum" ];
		var womensBigNumberSize = sizingDb[ "W" ][ "bigNum" ];

		log.l( "curGraphic.type = " + curGraphic.type );

		if ( curGraphic.type === "name" )
		{
			curLabel = "name_" + ( this.garmentWearer.match( /[wg]$/i ) ? womensNameSize : mensNameSize );
			adultArt = this.adultArtworkLayer ? findSpecificPageItem( artLayer, curLabel, "imatch" ) : undefined;
			curLabel = "name_" + youthNameSize;
			youthArt = this.youthArtworkLayer ? findSpecificPageItem( artLayer, curLabel, "imatch" ) : undefined;
		}
		else if ( curGraphic.type === "number" )
		{
			curLabel = "number_" + ( this.garmentWearer.match( /[wg]$/i ) ? womensBigNumberSize : mensBigNumberSize );
			adultArt = this.adultArtworkLayer ? findSpecificPageItem( artLayer, curLabel, "imatch" ) : undefined;
			curLabel = "number_" + youthBigNumberSize;
			youthArt = this.youthArtworkLayer ? findSpecificPageItem( artLayer, curLabel, "imatch" ) : undefined;
		}
		else if ( curGraphic.type === "logo" )
		{
			logoArt = findSpecificPageItem( artLayer, artLayer.name, "imatch" );
			if ( !logoArt && artLayer.pageItems.length )
			{
				logoArt = group( afc( artLayer, "pageItems" ), artLayer );
				logoArt.name = artLayer.name;
			}
			else
			{
				errorList.push( artLayer.name + " is improperly formatted and can't be imported." );
				return;
			}

			if ( curGraphic.teamNames && curGraphic.teamNames.length )
			{
				var logoDuplicate = logoArt.duplicate();
				logoDuplicate.left += logoArt.width + 20;
				updateGraphicText( curGraphic.teamNames, logoArt, curGraphic );
			}

			if ( logoArt )
			{
				adultArt = this.adultArtworkLayer ? logoArt : undefined;
				youthArt = this.youthArtworkLayer ? logoArt.duplicate() : undefined;
				if ( youthArt )
				{
					youthArt.name = youthArt.name + "Y";
				}
			}
			else
			{
				errorList.push( "Could not find logo art for " + curGraphic.name );
			}


		}

		log.l( "adultArt = " + adultArt );
		log.l( "youthArt = " + youthArt );


		var mockupDocument = this.mockupDocument;
		mockupDocument.activate();

		if ( adultArt )
		{
			var adultMockupLayer = this.adultMockupLayer;
			var adultArtworkLayer = this.adultArtworkLayer;
			adultArt.name = curGraphic.name;
			processArt( curGraphic, adultArt, noteGroup, "adult", this.adultPlacementGuides, scaleLogo );
		}
		if ( youthArt )
		{
			youthArt.name = curGraphic.name + "Y";
			var youthMockupLayer = this.youthMockupLayer;
			var youthArtworkLayer = this.youthArtworkLayer;
			var youthMockupArtboard = this.youthMockupArtboard;
			processArt( curGraphic, youthArt, noteGroup, "youth", this.youthPlacementGuides, scaleLogo );
		}

		deltaXPosition += deltaX;


		//processArt function:
		//
		//curGraphic is the graphic object from the config.
		//art is a groupItem of the artwork
		//noteGroup is the note group..
		//age is whether the garment is adult or youth
		//guides is the placement guides layer
		//scale is a boolean to determine whether to scale the art
		//artLocs is an array of strings representing the builder graphic locations
		//eg ["TFCC","TBPL"];
		function processArt ( curGraphic, art, noteGroup, age, guidesLayer, scale )
		{
			log.l( "processing art: " + art.name );
			log.l( "args:\n curGraphic: " + curGraphic.name + "\n art: " + art.name + "\n noteGroup: " + noteGroup + "\n age: " + age + "\n guidesLayer: " + guidesLayer + "\n scale: " + scale );
			var mockArtLay = age.match( /^a/i ) ? adultArtworkLayer : youthArtworkLayer;
			var mockLay = age.match( /^a/i ) ? adultMockupLayer : youthMockupLayer;
			var masterNoteGroup = age.match( /^a/i ) ? adultMasterNoteGroup : youthMasterNoteGroup;
			var mockAb = mockupDocument.artboards;
			var mabRect = mockAb[ 0 ].artboardRect;
			var noteGroupDup; //duplicate of noteGroup to be duplicated inside the artwork group.
			var newScale;
			var guides; //array of guide objects on the placement guides layer.
			var masterArt; //the artwork that gets duplicated from the source file to the mockup layer


			if ( scale )
			{
				newScale = ( function ()
				{
					var maxWidthIn = age.match( /^a/i ) ? 13 : 10.5
					var maxWidth = 13 * 7.2; //13 inches at scale

					var artBounds = art.visibleBounds;
					var abw = artBounds[ 2 ] - artBounds[ 0 ];
					var abh = artBounds[ 1 ] - artBounds[ 3 ];
					log.l( "artBounds = " + artBounds );
					log.l( "abw = " + abw + ": abh = " + abh );

					var artDim = abw > abh ? abw : abh;
					log.l( "artDim = " + artDim );

					return ( maxWidth / artDim ) * 100;
				} )();
				log.l( "newScale = " + newScale );
			}

			if ( art.typename !== "GroupItem" ) 
			{
				log.l( "making a groupItem from art" );
				var name = art.name;
				art = group( [ art ], art.parent );
				art.name = name;

			}
			if ( noteGroup ) 
			{
				noteGroupDup = noteGroup.duplicate( art );
			}

			//import the artwork to the mockup
			log.l( "moving artwork to mockup document" );
			masterArt = art.duplicate( mockupDocument );
			masterArt.moveToBeginning( mockLay );




			if ( scale )
			{
				log.l( "scaling artwork to " + newScale + " percent" );
				masterArt.resize( newScale, newScale, true, true, true, true, newScale );
				log.l( "new artwork size is - w:" + masterArt.width / 7.2 + ", h:" + masterArt.height / 7.2 );
			}

			masterArt.position = [ mabRect[ 0 ] + deltaXPosition, mabRect[ 3 ] - GRAPHIC_SPACING ];

			if ( !deltaX )
			{
				deltaX = masterArt.width + GRAPHIC_SPACING;
			}

			if ( age.match( /^y/i ) && adultArt )
			{
				//this is a youth graphic and there is an adult graphic
				//move the youth graphic to the the top of the youth artboard.
				masterArt.left = mockAb[ 1 ].artboardRect[ 0 ] + deltaXPosition;
			}



			if ( noteGroup )
			{
				//extract the note group to the master note group
				noteGroupDup.remove();
				noteGroupDup = findSpecificPageItem( masterArt, "note", "any" );
				noteGroupDup.moveToBeginning( masterNoteGroup );
			}

			if ( guidesLayer )
			{
				//placement guides exist.. get the guides
				guidesLayer.locked = false;
				guidesLayer.visible = true;
				log.l( "guides layer exists: " + guidesLayer.name );
				guides = afc( guidesLayer, "pageItems" );
				var trimmedGuides = [];

				//loop each graphic location and align the art to the appropriate guides
				curGraphic.locations.forEach( function ( curLoc )
				{
					log.l( "Processing location: " + curLoc );
					trimmedGuides = guides.filter( function ( guide )
					{
						return guide.name.match( curLoc );
					} );

					log.l( "trimmedGuides = " + trimmedGuides.join( ", " ) );

					//trimmed the guides array so that we only have
					//the guides that match the current location
					trimmedGuides.forEach( function ( guide )
					{
						guide.locked = false;
						guide.hidden = false;
						var dupGraphic;
						var scaleToFitGuides = true;
						var curGuide = guide.duplicate();
						curGuide.guides = false;
						var maxDim = getMaxDimension( curGuide ) / 7.2;
						var gDim;
						var decimal = maxDim - Math.floor( maxDim );
						if ( decimal > .35 && decimal < .65 )
						{
							gDim = Math.floor( maxDim ) + 0.5;
						}
						else
						{
							gDim = Math.round( maxDim )
						}
						curGuide.remove();

						if ( ( curGraphic.type.match( /name/i ) && curLoc.match( /tbpl/i ) ) || ( curGraphic.type.match( /number/i ) ) )
						{
							log.l( "disabling scale to fit guides" )
							var presizedArt = findSpecificPageItem( artLayer, "number_" + gDim );
							scaleToFitGuides = false;
						}
						if ( !presizedArt )
						{
							dupGraphic = masterArt.duplicate();
						}
						else
						{
							log.l( "found presized art: " + presizedArt.name );
							dupGraphic = presizedArt.duplicate( mockupDocument );
						}

						dupGraphic.moveToBeginning( mockArtLay );
						alignArtToGuides( dupGraphic, guide, scaleToFitGuides );
					} );
				} );
			}





		}

	}




	this.getGarments = function ()
	{
		log.l( "Getting garments." );
		scriptTimer.beginTask( "getGarments" );
		this.adultGarmentFolder = this.adultGarmentCode ? locateCTFolder( this.adultGarmentCode ) : undefined;

		//if this garment is a bag, there's no youth sizing.. skip this part.
		this.youthGarmentFolder = data.garment.match( /bag/i ) ? undefined : ( locateCTFolder( this.youthGarmentCode ) || undefined );

		if ( this.adultGarmentFolder && this.adultGarmentCode )
		{
			this.adultGarmentFile = getFile( this.adultGarmentFolder, this.styleNumber, this.adultGarmentCode + "_" + this.styleNumber + this.fileSuffix );
		}

		if ( this.youthGarmentFolder && this.youthGarmentCode )
		{
			this.youthGarmentFile = getFile( this.youthGarmentFolder, this.styleNumber, this.youthGarmentCode + "_" + this.styleNumber + this.fileSuffix );
		}

		log.l( "adult garment file: " + this.adultGarmentFile );
		log.l( "youth garment file: " + this.youthGarmentFile );

		scriptTimer.endTask( "getGarments" );
	}

	this.getSaveFile = function ()
	{
		var fileName = curOrderFolderPath + "/" + orderNumber + "_Master_" + designNumber + this.suffix + ".ai"
		log.l( "this.saveFile = " + fileName );
		return File( fileName );
	}

	this.getGraphics = function ()
	{
		log.h( "Getting Graphics." );
		scriptTimer.beginTask( "getGraphics" );
		var curGraphic, colorCode, skipThisGraphic;
		var skipGraphics = [ "provided", "custom", "onfile", "fullcustom" ];

		//include the fds graphics file name library
		eval( "#include \"" + dataPath + "build_mockup_data/fds_graphics_file_names.js" + "\"" );

		for ( var g in this.graphics )
		{

			curGraphic = this.graphics[ g ];
			//check first to see if this graphic is something worth grabbing at all..
			//check for PROVIDED, CUSTOM, or ONFILE

			log.l( "processing graphic: " + curGraphic.name );

			skipGraphics.forEach( function ( sg, curGarment )
			{
				if ( skipThisGraphic ) return;
				var pat = new RegExp( sg, "i" );
				if ( curGraphic.name.match( pat ) )
				{
					skipThisGraphic = true;
					log.l( curGraphic.name + " was in the skip list." );
					curGraphic.file = undefined;
				}
				else if ( curGarment.top && !curGraphic.locations.filter( function ( l ) { return l.match( /^t/i ) } ).length )
				{
					skipThisGraphic = true;
					log.l( "curGarment is a top but " + curGraphic.name + " has no top locations." );
					curGraphic.file = undefined;
				}
				else if ( curGarment.bottom && !curGraphic.locations.filter( function ( l ) { return l.match( /^b/i ) } ).length )
				{
					skipThisGraphic = true;
					log.l( "curGarment is a bottom but " + curGraphic.name + " has no bottom locations." );
					curGraphic.file = undefined;
				}
			} )

			if ( skipThisGraphic )
			{
				skipThisGraphic = false;
				continue;
			}

			curGraphic.type = curGraphic.name.match( /fdsp/i ) ? "name" : ( curGraphic.name.match( /fdsn/i ) ? "number" : "logo" );


			log.l( "Fixing: " + curGraphic.name );


			//if the graphic is a name or number && it hasn't been updated yet
			//update the code
			// if ( !/fdsp-fdsn_/i.test( curGraphic.name ) )
			// {
			// 	curGraphic.name = curGraphic.name.replace( nameNumberPat, "fdsp-fdsn_" );
			// }


			//strip out any vestigial appendages
			curGraphic.name = curGraphic.name.replace( vestigialAppendagePat, "" );

			log.l( "After fixing curGraphic.name = " + curGraphic.name );


			//get the style number for this graphic
			curGraphic.styleNumber = this.getGraphicStyleNumber( curGraphic.name );
			if ( !curGraphic.styleNumber )
			{
				log.e( "Failed to get the style number for " + curGraphic.name );
				errorList.push( "Failed to get the style number for the graphic: " + curGraphic.name );
				continue;
			}

			if ( /emb/i.test( curGraphic.name ) )
			{
				curGraphic.name = curGraphic.name.replace( /^.*\-/, "EMB-" );
				curGraphic.lib = "embroidery";
			}



			curGraphic.folder = locateGraphicFolder( curGraphic.name.replace( /fds[np][-_]/i, "FDSP-FDSN_" ), curGraphic.lib );
			if ( curGraphic.folder )
			{
				// curGraphic.file = this.getFile(curGraphic.folder,this.getGraphicStyleNumber(curGraphic.name));
				if ( curGraphic.name.match( /^fds[-_]/i ) )
				{
					curGraphic.name = fdsFileNames[ curGraphic.styleNumber ] || curGraphic.name;
				}

				curGraphic.file = getFile( curGraphic.folder, curGraphic.styleNumber, curGraphic.name.replace( /fds[np][-_]/i, "FDSP-FDSN_" ) );
				log.l( "curGraphic.file = " + curGraphic.file );
			}
			else
			{
				curGraphic.file = undefined;
				log.l( "failed to find a graphic file for " + curGraphic.name );
				continue;
			}
			for ( var c in curGraphic.colors )
			{
				colorCode = curGraphic.colors[ c ].colorCode;
				curGraphic.colors[ c ].swatchName = BUILDER_COLOR_CODES[ colorCode ];
			}
		}

		scriptTimer.endTask( "getGraphics" );
	}



	this.getGraphicStyleNumber = function ( name )
	{
		// return name.substring(name.lastIndexOf("-")+1,name.length);

		// var pat = /[_-]([\d]*([hgbmsrftl]{1,4})?\d*$)/i;
		var pat = /[-_]([hgbmsrftlo\d]*)/i;
		var result = name.match( pat ) || [];

		return result[ 1 ] || undefined;
	}

	this.openFile = function ( file )
	{
		app.open( file );
		app.executeMenuCommand( "fitall" );
		return app.activeDocument;
	}

}
