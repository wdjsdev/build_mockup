#target Illustrator

function BuildMockupBatch()
{

	var valid = true;
	var scriptName = "build_mockup_batch";

	app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;


	eval("#include \"~/Desktop/automation/utilities/Utilities_Container.js\"");


	//set batch mode to true
	//this will disable any file/folder select dialogs
	//and suppress any messaging from the script
	//to prevent any holdups from stopping the batch
	//it's better to have 20% of orders that are incomplete
	//if it rmeans that 80% were built properly without
	//any interaction.
	const BATCH_MODE = true;


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
	var orderNumber;
	var teamName;
	var orderData;
	var garmentsNeeded = [];
	var curGarmentIndex = 1;
	var designNumbers = [];
	var designNumberOnly = false; //if the user wants just one design number instead of a whole order
	var orderNumberAndTeamNames = []; //array of strings like this: "1234567_Team Name"


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
	var vestigialAppendagePat = /cb|pnt|ll|ls|rl|rs|b$/i;

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


	var rushMode = false; //currently processing rush orders?
	var rushPrefix = "_RUSH_"


	//
	//Gather and include the components
	//



	function getBatchOrders()
	{

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
		var orderNumPat = /([\d]{7})/;


		var garmentsProcessed = 0;
		var graphicsProcessed = 0;
		var ordersProcessed = 0;



		var scriptResults;

		//this represents any orders that already exist
		//in the dest folder
		var existingOrders = [];

		var exFolderPath = "/Volumes/Customization/1_Active Orders/1_Mockup IN PROGRESS/_Mockup_Asset_Folders_/";
		var exFolder = Folder(exFolderPath);
		var localExFolderPath = desktopPath + "boombah/mockup_builder/";
		var localExFolder = Folder(localExFolderPath);
		var exFiles = exFolder.getFiles();
		var localExFiles = localExFolder.getFiles();

		//rush order pattern
		var rushPat = /_rush_/i;
		var leadUnderscorePat = /^_/;

		var onPat = /[\d]{7}/

		//trim out any existing orders
		var curOn;
		for (var x = 0; x < exFiles.length; x++)
		{
			curOn = exFiles[x].name.match(onPat);
			if (curOn)
			{
				existingOrders.push(curOn[0]);
			}
			else
			{
				log.l(exFiles[x].name + " didn't have a proper order number???::curOn = " + curOn);
			}
			// existingOrders.push(exFiles[x].name.replace(rushPat,"").replace(leadUnderscorePat,"").substring(0, 7));

		}

		for (var x = 0; x < localExFiles.length; x++)
		{
			curOn = localExFiles[x].name.match(onPat);
			if (curOn)
			{
				existingOrders.push(curOn[0]);
			}
			else
			{
				log.l(localExFiles[x].name + " didn't have a proper order number???::curOn = " + curOn);
			}
			// existingOrders.push(localExFiles[x].name.substring(0,7));
		}

		//strip out any duplicates from the existingOrders array
		existingOrders = getUnique(existingOrders);



		function getFilesFromFolder(folder)
		{
			var salesOrders = folder.getFiles("*.pdf");
			totalNeedsMockOrders += salesOrders.length;
			var curON;
			for (var x = 0; x < salesOrders.length; x++)
			{
				curFile = salesOrders[x];
				// $.writeln("Processing " + curFile.name);
				if (orderPdfPat.test(curFile.name))
				{
					curOrderNum = curFile.name.match(orderNumPat);
					if (curOrderNum && curOrderNum.length && curOrderNum.length > 1)
					{
						curOrderNum = curOrderNum[1];
					}

					if (curOrderNum.indexOf("_") > -1)
					{
						curOrderNum = curFile.name.substring(1, 8);
					}
					if (existingOrders.indexOf(curOrderNum) > -1)
					{
						log.l(curOrderNum + " already exists in the folder. skipping it.");
						continue;
					}
					ordersNeeded.push(curOrderNum);

					teamName = decodeURI(curFile.name);
					teamName = teamName.replace(/^.*[\d]{7}_/, "");

					teamName = teamName.replace(".pdf", "");


					teamNames.push(teamName);
				}


			}


		}


		function processOrders(ordersNeeded, teamNames)
		{
			for (var x = 0; x < ordersNeeded.length; x++)
			{
				orderNumber = ordersNeeded[x];
				teamName = teamNames[x];
				batchTimer.beginTask(orderNumber + "_" + teamName);
				log.l("\n*****\n");
				log.l("Processing: " + orderNumber + "_" + teamName);
				log.l("This is batch order number #" + x);
				log.l("\n*****\n");

				scriptResults = exec(orderNumber, teamName);

				garmentsProcessed += scriptResults.garmentCount;
				graphicsProcessed += scriptResults.graphicCount;
				ordersProcessed++;

				log.h("Finished batching order # " + x);

				batchTimer.endTask(orderNumber + "_" + teamName);
			}
		}

		var totalNeedsMockOrders = 0;

		//process the rush orders, if any
		getFilesFromFolder(rushFolder);

		var onLen = ordersNeeded.length;

		if (ordersNeeded.length)
		{
			log.h("Batching " + ordersNeeded.length + " rush orders.::teamNames = " + teamNames.join(", "));
			rushMode = true;
			processOrders(ordersNeeded, teamNames);
			copyOrdersToAssetFolder();
			ordersNeeded = [];
			teamNames = [];
			rushMode = false;
		}


		//process the regular needs mockup folder 
		getFilesFromFolder(needMockFolder);

		log.h("We are " + (totalNeedsMockOrders - garmentsNeeded.length) + " orders ahead of the mockup artists.");

		if (ordersNeeded.length)
		{
			var numBatchOrders;
			if (ordersNeeded.length > 10)
			{
				var w = new Window("dialog");
				var numOrdersMsg = UI.static(w, "There are " + ordersNeeded.length + " orders.");
				var promptMsg = UI.static(w, "How many orders do you want to batch?");
				var input = UI.edit(w, (ordersNeeded.length >= 20 ? 20 : ordersNeeded.length) + "", 4);
				var submit = UI.button(w, "Let's Go!!", submitDlg)


				input.addEventListener("keydown", function(k)
				{
					if (k.keyName == "Enter")
					{
						submitDlg()
					}
				});

				function submitDlg()
				{
					if (input.text === "")
					{
						alert("enter a number");
						return;
					}

					numBatchOrders = parseInt(input.text);
					ordersNeeded = ordersNeeded.slice(0, numBatchOrders);
					teamNames = teamNames.slice(0, numBatchOrders);
					w.close();
				}



				w.show();
			}
			log.h("Batching " + ordersNeeded.length + " orders.::teamNames = " + teamNames.join(", "));
			processOrders(ordersNeeded, teamNames);
			copyOrdersToAssetFolder();
			ordersNeeded = [];
			teamNames = [];
		}



		batchTimer.endTask("batchOrders");

		if (errorList.length)
		{
			log.e("Script errors: ::" + errorList.join("\n"));
		}

		errorList = [];

		log.l("Script built " + garmentsNeeded.length + " garments and opened " + graphicsOpened + " graphics.");

		log.h("Batched " + ordersProcessed + " orders.::Processed " + garmentsProcessed + " garments.::Processed " + graphicsProcessed + " graphics.::")


	}



	function exec(orderNumber, teamName)
	{

		orderNumberAndTeamNames.push(orderNumber + "_" + teamName);
		orderData = undefined;
		garmentsNeeded = [];
		curGarmentIndex = 1;
		designNumbers = [];
		designNumberOnly = false; //if the user wants just one design number instead of a whole order



		saveLoc = undefined;
		localJobFolder = undefined;
		localJobFolderPath = undefined;
		localGraphicsFolderPath = undefined;
		localGraphicsFolder = undefined;
		curOrderFolder = undefined;
		curOrderFolderPath = undefined;
		currentMockup = undefined;
		filesToClose = [];
		graphicsOpened = 0;

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



		//log the stats for this order

		var statsPath = desktopPath + "automation/build_mockup/stats.js";
		eval("#include \"" + statsPath + "\"");

		stats.totalOrders++;
		stats.totalGarments += garmentsNeeded.length;
		stats.totalGraphics += graphicsOpened;
		stats.averageGraphicsPerGarment = stats.totalGraphics / stats.totalGarments;
		stats.averageOrdersPerDay = stats.totalOrders/stats.totalDays;

		var curDate = getDate();
		if (!stats.dates[curDate])
		{
			stats.totalDays++;
			stats.dates[curDate] = {
				"ordersProcessed": [], //orderNumber_teamName
				"totalOrders": 0,
				"totalGarments": 0,
				"totalGraphics": 0,
				"averageGraphicsPerGarment": 0
			}
		}

		stats.dates[curDate].totalOrders++;
		stats.dates[curDate].totalGarments += garmentsNeeded.length;
		stats.dates[curDate].totalGraphics += graphicsOpened;
		stats.dates[curDate].averageGraphicsPerGarment = stats.dates[curDate].totalGraphics / stats.dates[curDate].totalGarments;
		stats.dates[curDate].ordersProcessed.push(orderNumber + "_" + teamName);

		writeDatabase(statsPath, "var stats = " + JSON.stringify(stats));


		return {
			garmentCount: garmentsNeeded.length,
			graphicCount: graphicsOpened
		};

	}



	getBatchOrders();



	scriptTimer.endTask("BuildMockup");

	scriptTimer.beginTask("printLog");
	printLog();
	scriptTimer.endTask("printLog");

	copyOrdersToAssetFolder();

	alert("all done.");

	for(var x=app.documents.length-1;x>=0;x--)
	{
		app.documents[x].close(SaveOptions.DONOTSAVECHANGES);
	}
}	



BuildMockupBatch();