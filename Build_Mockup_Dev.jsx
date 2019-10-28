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
	var orderData;
	var garmentsNeeded = [];
	var designNumbers = [];


	//mid/garment relationship database
	var MGR = midGarmentRelationshipDatabasePath = dataPath + "build_mockup_data/mid_garment_relationship_database.js";

	//known converted_template folder locations database
	//database to keep track of the exact folder locations for a given
	//garment code so we don't need to dig for them on each execution.
	// var CTFL = convertedTemplateFolderLocationsDatabasePath = dataPath + "build_mockup_data/converted_template_locations_database.js";
	var CTFL = convertedTemplateFolderLocationsDatabasePath = desktopPath + "temp/converted_template_locations_database.js";

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

	function testFunction()
	{
		designNumbers = ["SNcGTdJtrDQw"];
		loopDesignNumbers();
		$.writeln(JSON.stringify(garmentsNeeded));
		valid = false;
		printLog();
		if(errorList.length)
		{
			sendErrors(errorList);
		}
	}
	testFunction();


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


	printLog();
	
}


BuildMockup();