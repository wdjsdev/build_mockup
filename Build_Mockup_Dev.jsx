#target Illustrator
function BuildMockup()
{
	var valid = true;
	var scriptName = "build_mockup";

	//Utilities
	// //Production Utilities
	// eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.jsxbin\"");
	// eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Batch_Framework.jsxbin\"");
	
	//Dev Utilities
	eval("#include \"/Volumes/Macintosh HD/Users/will.dowling/Desktop/automation/utilities/Utilities_Container.js\"");
	eval("#include \"/Volumes/Macintosh HD/Users/will.dowling/Desktop/automation/utilities/Batch_Framework.js\"");
	
	if(!valid)
	{
		return valid;
	}


	//Global Variables
	var orderNumber;
	var teamName;
	var orderData;
	var garmentsNeeded = [];
	var curGarmentIndex = 1;
	var designNumbers = [];
	var womensCodePat = /w$/i;
	var localJobFolder;
	var curOrderFolder;
	var currentMockup;
	var filesToClose = [];

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
	var GFL = grahpicFolderLocationsDatabasePath = dataPath + "build_mockup_data/graphic_locations_database.js";

	var tempPatternFillPath = libraryPath + "";

	//
	//Gather and include the components
	//

	logDest.push(getLogDest())

	var devComponents = desktopPath + "automation/build_mockup/components";
	var prodComponents = componentsPath + "build_mockup";

	var compFiles = includeComponents(devComponents,prodComponents,true);
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

	// function testFunction()
	// {
	// 	designNumbers = ["c1CCb5ANIO6Z"];
	// 	// designNumbers = ["PzSXPLCa1Tzm"];
	// 	// designNumbers = ["AgOkmOQX5xBA"];
	// 	orderNumber = "1234567";
	// 	// initSaveLoc();
	// 	// createOrderFolder();
	// 	loopDesignNumbers();
	// 	$.writeln(JSON.stringify(garmentsNeeded));
	// 	loopGarmentsNeeded();
	// 	valid = false;
	// 	printLog();
	// 	if(errorList.length)
	// 	{
	// 		sendErrors(errorList);
	// 	}
	// }
	

	////////////////////////
	////////ATTENTION://////
	//
	//		test function call
	//
	////////////////////////
	

	testFunction();

	//
	//


	//
	//Gather the order data
	//
	if(valid)
	{
		orderNumber = getOrderNumber();
	}

	if(valid)
	{
		designNumbers = getDesignNumbers();
	}


	//
	//loop each design number to gather the garments and graphics needed
	//
	if(valid)
	{
		loopDesignNumbers();
	}


	for(var ftc = filesToClose.length - 1; ftc>=0; ftc--)
	{
		filesToClose[ftc].activate();
		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	}
	

	printLog();
	
}


BuildMockup();