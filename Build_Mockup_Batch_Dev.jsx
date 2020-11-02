#target Illustrator

function BuildMockupBatch(orderNumber, teamName)
{

	var valid = true;
	var scriptName = "build_mockup_batch";


	
	eval("#include \"~/Desktop/automation/utilities/Utilities_Container.js\"");


	logDest.push(getLogDest())


	LIVE_LOGGING = false;

	if (user === "will.dowling")
	{
		DEV_LOGGING = true;
	}



	scriptTimer.beginTask("BuildMockup");


	scriptTimer.beginTask("getComponents");

	//get the components
	var devComponents = desktopPath + "automation/build_mockup/components";
	var prodComponents = componentsPath + "build_mockup";

	var compFiles = includeComponents(devComponents, prodComponents, true);
	if (compFiles && compFiles.length)
	{
		var curComponent;
		for (var cf = 0, len = compFiles.length; cf < len; cf++)
		{
			curComponent = compFiles[cf].fullName;
			eval("#include \"" + curComponent + "\"");
			log.l("included: " + compFiles[cf].name);
		}
	}
	else if (!compFiles)
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



	//Global Variables
	// var orderNumber;
	// var teamName;
	var orderData;
	var garmentsNeeded = [];
	var curGarmentIndex = 1;
	var designNumbers = [];
	var designNumberOnly = false; //if the user wants just one design number instead of a whole order



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



	//
	//regexes
	//

	//regex to remove superfluous appendages from graphic codes
	//for example, the builder occasionally uses a code like: FDS-325LS
	//even though the graphic is identical to FDS-325
	//the builder needs to label the graphic codes this way to facilitate
	//grouping certain graphics together for use on specific garments..
	//but for our purposes.. we don't want to do that in art. identical
	//graphics should have identical codes.
	var vestigialAppendagePat = /cb|pnt|([^b^h]g)|ll|ls|rl|rs|b$/i;

	//regex for name and number graphics
	//the graphic code will come through with one or the other
	//but the files are named with both prefixes.
	//for example, a number code might be FDSN-1001...
	//but the artwork file for that number will include the player name
	//graphic as well. As such the file would be named FDSP-FDSN_1001
	//so the graphic code needs to be updated to include both prefixes
	var nameNumberPat = /(fdsn|fdsp)[-_]/i;

	var womensCodePat = /w$/i;
	var youthCodePat = /y$/i;
	var girlsCodePat = /g$/i;


	//
	//regexes
	//



	//
	//folder paths
	//

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
	//folder paths
	//



	//initialize the save location preference file
	var prefPath = documentsPath + "build_mockup_prefs/"
	var saveLocPrefFile = File(prefPath + "save_loc_pref.txt");
	var saveLocPrefFolder = Folder(prefPath);
	if (!saveLocPrefFolder.exists)
	{
		saveLocPrefFolder.create();
		log.l("Created a saveLocPrefFolder");
	}



	//
	//Gather and include the components
	//



	//set batch mode to true
	//this will disable any file/folder select dialogs
	//and suppress any messaging from the script
	//to prevent any holdups from stopping the batch
	//it's better to have 20% of orders that are incomplete
	//if it means that 80% were built properly without
	//any interaction.
	const BATCH_MODE = true;

	// var orderNumberFile = File("~/Desktop/order_number.txt");
	// orderNumberFile.open("r");
	// orderNumber = orderNumberFile.read();
	// orderNumberFile.close();

	// orderNumber = orderNumber.replace(/\s/g, "");


	// if (!orderNumber)
	// {
	// 	log.e("Failed to get an order number from the text file.");
	// 	valid = false;
	// }




	//if designNumbers.length > 0 then the user opted not to
	//build an entire order, but rather a single design number
	//as such, we don't need to get the order data
	if (valid && !designNumberOnly)
	{
		getOrderData(orderNumber);
	}

	if (valid && !designNumberOnly)
	{
		designNumbers = getDesignNumbers();
	}


	if (valid)
	{
		initSaveLoc();
	}

	if (valid)
	{
		createOrderFolder();
	}


	//
	//loop each design number to gather the garments and graphics needed
	//
	if (valid)
	{
		loopDesignNumbers();
	}

	if (valid)
	{
		loopGarmentsNeeded();
		if (garmentsNeeded.length && garmentsNeeded[0].mockupDocument)
		{
			garmentsNeeded[0].mockupDocument.activate();
			garmentsNeeded[0].mockupDocument.save();
		}
	}



	// for(var ftc = filesToClose.length - 1; ftc>=0; ftc--)
	// {
	// 	filesToClose[ftc].close(SaveOptions.DONOTSAVECHANGES);
	// }


	// while(app.documents.length)
	// {
	// 	app.documents[app.documents.length-1].close(SaveOptions.DONOTSAVECHANGES);
	// }

	// endLog();

	if (errorList.length)
	{
		sendErrors(errorList);
	}

	log.l("Script built " + garmentsNeeded.length + " garments and opened " + graphicsOpened + " graphics.");

	scriptTimer.endTask("BuildMockup");
	scriptTimer.beginTask("printLog");
	printLog();
	scriptTimer.endTask("printLog");


	return {garmentCount:garmentsNeeded.length,graphicCount:graphicsOpened};


}

function getBatchOrders()
{
	#include "~/Desktop/automation/utilities/Utilities_Container.js";
	DEV_LOGGING = true;

	//make a new stopwatch object specifically
	//for measuring the time to batch
	var batchTimer = new Stopwatch();
	batchTimer.beginTask("batchOrders");


	var needMockPath = "/Volumes/Customization/Design Mockups/Needs Mockup/";
	var rushFolderPath = needMockPath + "_Paid Rush/";
	var needMockFolder = Folder(needMockPath);
	var rushFolder = Folder(rushFolderPath);

	//orders found in the rush folder and needs mockup folder
	var ordersNeeded = [];
	var teamNames = [];
	var orderPdfPat = /([\d]{7})*\.pdf/i;


	var garmentsProcessed = 0;
	var graphicsProcessed = 0;
	var ordersProcessed = 0;


	

	function getFilesFromFolder(folder)
	{
		var rushFiles = folder.getFiles();
		var curON;
		for (var x = 0; x < rushFiles.length; x++)
		{
			curFile = rushFiles[x];
			// $.writeln("Processing " + curFile.name);
			if (orderPdfPat.test(curFile.name))
			{
				curOrderNum = curFile.name.substring(0, 7);
				if (curOrderNum.indexOf("_") > -1)
				{
					curOrderNum = curFile.name.substring(1, 8);
				}
				ordersNeeded.push(curOrderNum);

				teamName = decodeURI(curFile.name);
				teamName = teamName.replace(/^.*[\d]{7}_/, "");

				teamName = teamName.replace(".pdf", "");


				teamNames.push(teamName);
			}


		}
	}
	

	getFilesFromFolder(rushFolder);
	getFilesFromFolder(needMockFolder);




	//this represents any orders that already exist
	//in the dest folder
	var existingOrders = [];

	var exFolderPath = "/Volumes/Customization/1_Active_Orders/1_Mockup IN PROGRESS/_Mockup_Asset_Folders_/";
	var exFolder = Folder(exFolderPath);
	var localExFolderPath = "~/Desktop/boombah/mockup_builder/";
	var localExFolder = Folder(localExFolderPath);
	var exFiles = exFolder.getFiles();
	exFiles.concat(localExFolder.getFiles());



	for (var x = 0; x < exFiles.length; x++)
	{
		existingOrders.push(exFiles[x].name.substring(0, 7));


		//trim out any existing orders
		var matchIndex;
		for (var x = existingOrders.length - 1; x >= 0; x--)
		{
			matchIndex = ordersNeeded.indexOf(existingOrders[x]);
			if (matchIndex > -1)
			{
				ordersNeeded.splice(matchIndex,1);
			}
		}
		
	}

	
	var scriptResults;
	var curOrderNumber,curTeamName;
	for(var x=0;x<10;x++)
	{
		if(x === ordersNeeded.length)
		{
			break;
		}
		curOrderNumber = ordersNeeded[x];
		curTeamName = teamNames[x];
		batchTimer.beginTask(curOrderNumber + "_" + curTeamName);
		$.writeln("\n*****\n");
		$.writeln("Procoessing: " + curOrderNumber + "_" + curTeamName);
		$.writeln("\n*****\n");

		scriptResults = BuildMockupBatch(curOrderNumber, curTeamName);	

		garmentsProcessed += scriptResults.garmentCount;
		graphicsProcessed += scriptResults.graphicCount;

		batchTimer.endTask(curOrderNumber + "_" + curTeamName);
	}

	batchTimer.endTask("batchOrders");

	log.h("end of batch.::Processed " + garmentsProcessed + " garments.::Processed " + graphicsProcessed + " graphics.::Batc")

}
getBatchOrders();