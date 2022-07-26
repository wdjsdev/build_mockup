#target Illustrator
function BuildMockup()
{
	var valid = true;
	var scriptName = "build_mockup";
	const BATCH_MODE = false;

	
	function getUtilities()
	{
		var result = [];
		var utilPath = "/Volumes/Customization/Library/Scripts/Script_Resources/Data/";
		var ext = ".jsxbin"

		//check for dev utilities preference file
		var devUtilitiesPreferenceFile = File("~/Documents/script_preferences/dev_utilities.txt");

		if(devUtilitiesPreferenceFile.exists)
		{
			devUtilitiesPreferenceFile.open("r");
			var prefContents = devUtilitiesPreferenceFile.read();
			devUtilitiesPreferenceFile.close();

			if(prefContents.match(/true/i))
			{
				utilPath = "~/Desktop/automation/utilities/";
				ext = ".js";
			}
		}

		if($.os.match("Windows"))
		{
			utilPath = utilPath.replace("/Volumes/","//AD4/");
		}

		result.push(utilPath + "Utilities_Container" + ext);
		result.push(utilPath + "Batch_Framework" + ext);
		return result;

	}

	var utilities = getUtilities();
	if(utilities)
	{
		for(var u=0,len=utilities.length;u<len;u++)
		{
			eval("#include \"" + utilities[u] + "\"");	
		}
	}
	else
	{
		alert("Failed to find the utilities..");
		return false;	
	}



	////////////////////////
	////////ATTENTION://////
	//
	//		temporary live logging
	//		turn off before distribution
	//
	////////////////////////	

	LIVE_LOGGING = false;

	if(user === "will.dowling")
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



	scriptTimer.beginTask("BuildMockup");


	scriptTimer.beginTask("getComponents");

	//get the components
	var devComponents = desktopPath + "automation/build_mockup/components";
	var prodComponents = componentsPath + "build_mockup";

	var compFiles = includeComponents(devComponents,prodComponents,true);
	if(compFiles && compFiles.length)
	{
		var curComponent;
		for(var cf=0,len=compFiles.length;cf<len;cf++)
		{
			curComponent = compFiles[cf].fullName;
			eval("#include \"" + curComponent + "\"");
			log.l("included: " + compFiles[cf].name);
		}
	}
	else if(!compFiles)
	{
		valid = false;
		return valid;
	}
	else
	{
		errorList.push("Failed to find any components.");
		log.e("No components were found.");
		valid = false;
		return valid;
	}

	scriptTimer.endTask("getComponents");

	app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;

	//Global Variables
	var orderNumber;
	var teamName;
	var orderData;
	var garmentsNeeded = [];
	var curGarmentIndex = 1;
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

	logDest.push(getLogDest())
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
	var saveLocPrefFile = File(prefPath + "save_loc_pref.txt");
	var saveLocPrefFolder = Folder(prefPath);
	if(!saveLocPrefFolder.exists)
	{
		saveLocPrefFolder.create();
		log.l("Created a saveLocPrefFolder");
	}

	//
	//Gather the order data
	//

	if(user === "will.dowling" && $.fileName.indexOf("_Dev")>-1)
	{
		//for development,use these instead of entering the same info
		//into the dialog each time. plus this could serve as a
		//method of batching orders later
		//
		orderNumber = "3721191";

		// designNumbers.push("Gutds5cHJMdI");
		// designNumbers.push("b9GQWFp9dn6T");
		
		teamName = "TEST_graphics";
	}

	if(valid && !orderNumber && designNumbers.length === 0)
	{
		getOrderNumber();
	}
	else if (designNumbers.length > 0)
	{
		designNumberOnly = true;
	}



	//if designNumbers.length > 0 then the user opted not to
	//build an entire order, but rather a single design number
	//as such, we don't need to get the order data
	if(valid && !designNumberOnly)
	{
		getOrderData();
	}

	if(valid && !designNumberOnly)
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
		if(garmentsNeeded.length && garmentsNeeded[0].mockupDocument)
		{
			garmentsNeeded[0].mockupDocument.activate();
			garmentsNeeded[0].mockupDocument.save();
		}
	}

	

	for(var ftc = filesToClose.length - 1; ftc>=0; ftc--)
	{
		filesToClose[ftc].close(SaveOptions.DONOTSAVECHANGES);
	}
	
	// endLog();
	
	if(errorList.length)
	{
		sendErrors(errorList);
	}

	log.l("Script built " + garmentsNeeded.length + " garments and opened " + graphicsOpened + " graphics.");

	scriptTimer.endTask("BuildMockup");
	scriptTimer.beginTask("printLog");
	printLog();
	scriptTimer.endTask("printLog");
	
}


BuildMockup();
