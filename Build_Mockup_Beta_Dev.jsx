#target Illustrator
function BuildMockup()
{
	var valid = true;
	var scriptName = "build_mockup_beta";

	var devUtilities = true;
	if($.getenv("USER").indexOf("dowling") === -1)
	{
		devUtilities = false;
	}

	//Utilities
	if(!devUtilities)
	{
		// //Production Utilities
		eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.jsxbin\"");
		eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Batch_Framework.jsxbin\"");
	}
	else
	{
		//Dev Utilities
		eval("#include \"/Volumes/Macintosh HD/Users/will.dowling/Desktop/automation/utilities/Utilities_Container.js\"");
		eval("#include \"/Volumes/Macintosh HD/Users/will.dowling/Desktop/automation/utilities/Batch_Framework.js\"");
	}
	
	if(!valid)
	{
		return valid;
	}

	////////////////////////
	////////ATTENTION://////
	//
	//		temporary live logging
	//		turn off before distribution
	//
	////////////////////////	

	LIVE_LOGGING = false;
	// DEV_LOGGING = true;

	////////////////////////
	////////ATTENTION://////
	//
	//		temporary live logging
	//		turn off before distribution
	//
	////////////////////////	

	//Global Variables
	var orderNumber;
	var teamName;
	var orderData;
	var garmentsNeeded = [];
	var curGarmentIndex = 1;
	var designNumbers = [];

	var womensCodePat = /w$/i;
	var youthCodePat = /y$/i;
	var girlsCodePat = /g$/i;

	var localJobFolder;
	var curOrderFolder;
	var currentMockup;
	var filesToClose = [];

	//regex to remove superfluous appendages from graphic codes
	//for example, the builder occasionally uses a code like: FDS-325LS
	//even though the graphic is identical to FDS-325
	//the builder needs to label the graphic codes this way to facilitate
	//grouping certain graphics together for use on specific garments..
	//but for our purposes.. we don't want to do that in art. identical
	//graphics should have identical codes.
	var vestigialAppendagePat = /bg|cb|pnt|g|ll|ls|rl|rs|b$/i;

	//regex for name and number graphics
	//the graphic code will come through with one or the other
	//but the files are named with both prefixes.
	//for example, a number code might be FDSN-1001...
	//but the artwork file for that number will include the player name
	//graphic as well. As such the file would be named FDSP-FDSN_1001
	//so the graphic code needs to be updated to include both prefixes
	var nameNumberPat = /(FDSN|FDSP)[-_]/i;


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




	//known graphic folder locations database
	//database to keep track of exact folder locations for a given graphic
	// var GFL = grahpicFolderLocationsDatabasePath = desktopPath + "temp/graphic_locations_database.js";
	var GFL = grahpicFolderLocationsDatabasePath = dataPath + "build_mockup_data/graphic_folder_locations_database.js";
	// var GFL = grahpicFolderLocationsDatabasePath = desktopPath + "automation/build_mockup/resources/graphic_folder_locations_database.js";

	var GLS = graphicLocationAndSizingDatabasePath = dataPath + "build_mockup_data/graphic_locations_and_sizing_database.js";


	//
	//Gather and include the components
	//

	logDest.push(getLogDest())
	// initLog();

	var devComponents = desktopPath + "automation/build_mockup/components";
	var prodComponents = componentsPath + "build_mockup_beta";

	var compFiles = includeComponents(devComponents,prodComponents,false);
	if(compFiles)
	{
		for(var cf=0,len=compFiles.length;cf<len;cf++)
		{
			eval("#include \"" + compFiles[cf] + "\"");
		}
	}
	else
	{
		errorList.push("Failed to find the necessary components.");
		log.e("Failed to find the components.");
		valid = false;
		return valid;
	}
	

	////////////////////////
	////////ATTENTION://////
	//
	//		test function call
	//
	////////////////////////
	

	// testFunction();

	//
	//


	//
	//Gather the order data
	//
	if(valid)
	{
		getOrderNumber();
	}

	if(valid)
	{
		getOrderData();
	}

	if(valid)
	{
		designNumbers = getDesignNumbers();
	}

	if(valid)
	{
		initSaveLoc();
	}

	if(valid)
	{
		createOrderFolder();
	}


	//
	//loop each design number to gather the garments and graphics needed
	//
	if(valid)
	{
		loopDesignNumbers();
	}

	if(valid)
	{
		loopGarmentsNeeded();
	}

	if(garmentsNeeded.length && garmentsNeeded[0].mockupDocument)
	{
		garmentsNeeded[0].mockupDocument.activate();
	}

	for(var ftc = filesToClose.length - 1; ftc>=0; ftc--)
	{
		// filesToClose[ftc].activate();
		// app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
		filesToClose[ftc].close(SaveOptions.DONOTSAVECHANGES);
	}
	
	// endLog();
	printLog();
	if(errorList.length)
	{
		sendErrors(errorList);
	}
	
}


BuildMockup();