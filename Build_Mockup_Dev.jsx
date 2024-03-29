#target Illustrator
function BuildMockup ()
{
	var valid = true;
	var scriptName = "build_mockup";
	const BATCH_MODE = false;


	function getUtilities ()
	{
		var dataResourcePath = customizationPath + "Library/Scripts/Script_Resources/Data/";
		var devUtilPath = "~/Desktop/automation/utilities/";
		var utilPath = dataResourcePath + "Utilities_Container.jsxbin";
		var batchPath = dataResourcePath + "Batch_Framework.jsxbin";
		var utilFilePaths = [utilPath]; //array of util files
		var devUtilitiesPreferenceFile = File( "~/Documents/script_preferences/dev_utilities.txt" );
		function readDevPref ( dp ) { dp.open( "r" ); var contents = dp.read() || ""; dp.close(); return contents; }
		if ( devUtilitiesPreferenceFile.exists && readDevPref( devUtilitiesPreferenceFile ).match( /true/i ) )
		{
			utilFilePaths = [ devUtilPath + "Utilities_Container.js", devUtilPath + "Batch_Framework.js" ];
			return utilFilePaths;
		}

		if(!File(utilFilePaths[0]).exists)
		{
			alert("Could not find utilities. Please ensure you're connected to the appropriate Customization drive.");
			return [];
		}

		return utilFilePaths;

	}
	var utilities = getUtilities();

	for ( var u = 0, len = utilities.length; u < len && valid; u++ )
	{
		eval( "#include \"" + utilities[ u ] + "\"" );
	}

	if ( !valid || !utilities.length) return;



	////////////////////////
	////////ATTENTION://////
	//
	//		temporary live logging
	//		turn off before distribution
	//
	////////////////////////	

	LIVE_LOGGING = false;

	if ( user === "will.dowling" )
	{
		DEV_LOGGING = true;
	}

	////////////////////////
	////////ATTENTION://////
	//
	//		temporary live logging
	//		turn off before distribution
	//
	////////////////////////	



	scriptTimer.beginTask( "BuildMockup" );


	scriptTimer.beginTask( "getComponents" );

	//get the components
	var devComponentsPath = desktopPath + "automation/build_mockup/components";
	var prodComponentsPath = componentsPath + "build_mockup";

	var compPath = $.fileName.match( /dev/i ) ? devComponentsPath : prodComponentsPath;

	var compFiles = getComponents( compPath );
	log.l( "Using compPath: " + compPath );
	if ( !compFiles.length )
	{
		log.e( "No components were found at: " + compPath );
		errorList.push( "Failed to find the components..." );
		sendErrors( errorList );
		valid = false;
		return valid;
	}

	//build the list of components to include
	var evalStr = "";
	compFiles.forEach( function ( cf )
	{
		evalStr += "#include \"" + cf.fullName + "\";\n";
	} )

	log.h( "including the following components:\nevalStr =\n" + evalStr );

	//eval the string of all include statements to actually include the components
	eval( evalStr );
	scriptTimer.endTask( "getComponents" );



	app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;

	//Global Variables
	var orderNumber;
	var teamName;
	var orderData;
	var garmentsNeeded = [];
	var curGarmentIndex = 1;
	var curGarment; //the garment object currently being processed
	var designNumbers = [];
	var designNumberOnly = false; //if the user wants just one design number instead of a whole order
	var rushMode = false;

	var womensCodePat = /w$/i;
	var youthCodePat = /y$/i;
	var girlsCodePat = /g$/i;

	var saveLoc;
	var localJobFolder;
	var localJobFolderPath;
	var localGraphicsFolderPath;
	var localGraphicsFolder;
	var curOrderFolder;
	var curOrderFolderPath;
	var currentMockup;
	var filesToClose = [];
	var graphicsOpened = 0;
	var curDesignNumber;

	//regex to remove superfluous appendages from graphic codes
	//for example, the builder occasionally uses a code like: FDS-325LS
	//even though the graphic is identical to FDS-325
	//the builder needs to label the graphic codes this way to facilitate
	//grouping certain graphics together for use on specific garments..
	//but for our purposes.. we don't want to do that in art. identical
	//graphics should have identical codes.
	var vestigialAppendagePat = /cb|pnt|ll|ls|rl|rs|b$/i;

	//regex for name and number graphics
	//the graphic code will come through with one or the other
	//but the files are named with both prefixes.
	//for example, a number code might be FDSN-1001...
	//but the artwork file for that number will include the player name
	//graphic as well. As such the file would be named FDSP-FDSN_1001
	//so the graphic code needs to be updated to include both prefixes
	var nameNumberPat = /(fdsn|fdsp)[-_]/i;


	//mid/garment relationship database
	var MGR = midGarmentRelationshipDatabasePath = dataPath + "build_mockup_data/mid_garment_relationship_database.js";




	//known converted_template folder locations database
	//database to keep track of the exact folder locations for a given
	//garment code so we don't need to dig for them on each execution.
	var CTFL = convertedTemplateFolderLocationsDatabasePath = dataPath + "build_mockup_data/converted_template_locations_database.js";
	// var CTFL = convertedTemplateFolderLocationsDatabasePath = desktopPath + "temp/converted_template_locations_database.js";




	//pattern id-style number relationships
	var PSN = patternIdStyleNumberRlationshipsDatabasePath = dataPath + "build_mockup_data/pattern_id_style_nymber_database.js";
	// var PSN = patternIdStyleNumberRlationshipsDatabasePath = desktopPath + "temp/build_mockup_data/pattern_id_style_nymber_database.js";


	//this is for getting the data by "graphic code".
	//if we can't find it here.. then default to the library option below
	var GCL = dataPath + "build_mockup_data/graphic_locations_database.js";

	//this one is for getting the data by "graphic library"
	var GLL = grahpicFolderLocationsDatabasePath = dataPath + "build_mockup_data/graphic_folder_locations_database.js";




	//
	//Gather and include the components
	//

	logDest.push( getLogDest() )
	// initLog();




	////////////////////////
	////////ATTENTION://////
	//
	//		test function call
	//
	////////////////////////


	// testFunction();

	//
	//

	//initialize the save location preference file
	var prefPath = documentsPath + "build_mockup_prefs/"
	var saveLocPrefFile = File( prefPath + "save_loc_pref.txt" );
	var saveLocPrefFolder = Folder( prefPath );
	if ( !saveLocPrefFolder.exists )
	{
		saveLocPrefFolder.create();
		log.l( "Created a saveLocPrefFolder" );
	}

	//
	//Gather the order data
	//

	if ( user === "will.dowling" && $.fileName.indexOf( "_Dev" ) > -1 )
	{
		//for development,use these instead of entering the same info
		//into the dialog each time. plus this could serve as a
		//method of batching orders later
		//


		// designNumbers.push( "WLLeTvuiDWmv" ); // - complex. logo, name, multiple number locations, locker tag, sleeve logo and number
		// designNumbers.push( "WXZsf9XTmmap" ); // - simple. logo, name, number, plain fills
		// designNumbers.push( "rAOEEUzX8kGa" );


		orderNumber = "3855157";
		// designNumbers.push( "ONF3GNLwZ58d" );

		teamName = "TEST_graphics";
		orderNumber = orderNumber || "1234567";
	}

	if ( valid && !orderNumber && designNumbers.length === 0 )
	{
		getOrderNumber();
	}
	else if ( designNumbers.length > 0 )
	{
		designNumberOnly = true;
	}



	//if designNumbers.length > 0 then the user opted not to
	//build an entire order, but rather a single design number
	//as such, we don't need to get the order data
	if ( valid && !designNumberOnly )
	{
		getOrderData();
	}

	if ( valid && !designNumberOnly )
	{
		designNumbers = getDesignNumbers();
	}


	if ( valid )
	{
		initSaveLoc();
	}

	if ( valid )
	{
		createOrderFolder();
	}


	//
	//loop each design number to gather the garments and graphics needed
	//
	if ( valid )
	{
		loopDesignNumbers();
	}


	if ( valid )
	{
		loopGarmentsNeeded();
		if ( garmentsNeeded.length && garmentsNeeded[ 0 ].mockupDocument )
		{
			garmentsNeeded[ 0 ].mockupDocument.activate();
			garmentsNeeded[ 0 ].mockupDocument.save();
		}
	}



	for ( var ftc = filesToClose.length - 1; ftc >= 0; ftc-- )
	{
		filesToClose[ ftc ].close( SaveOptions.DONOTSAVECHANGES );
	}

	// endLog();

	if ( errorList.length )
	{
		sendErrors( errorList );
	}

	log.l( "Script built " + garmentsNeeded.length + " garments and opened " + graphicsOpened + " graphics." );

	scriptTimer.endTask( "BuildMockup" );
	scriptTimer.beginTask( "printLog" );
	printLog();
	scriptTimer.endTask( "printLog" );

}


BuildMockup();
