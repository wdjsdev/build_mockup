#target Illustrator
function BuildMockup()
{
	var valid = true;
	var scriptName = "build_mockup";

	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.jsxbin\"");

	logDest.push(getLogDest());
	
	/*****************************************************************************/

	///////Begin/////////
	///Logic Container///
	/////////////////////

		//sendErrors Function Description
		//Display any errors to the user in a preformatted list
		function sendErrors(errorList)
		{
			var errorString = "The Following Errors Occurred:\n";
			errorString += errorList.join("\n");
			alert(errorString);
		}

		//sendMsgs Function Description
		//Display any non-error messages to the user
		function sendMsgs(msgList)
		{
			var msgString = "Non-Error Script Messages:\n";
			msgString += msgList.join("\n");
			alert(msgString);
		}


		//testFunction Function Description
		//run a specific test on a given function
		//Just manually pass the values that would be expected
		function testFunction()
		{
			//testing getSport function
			var localValid;
			log.h("Beginning test function.");

			if(!designNumber)
			{
				getDesignNumber();
			}
			else
			{
				lib.designNumber = designNumber;
			}
			getJson(lib.designNumber);
			var valid = preValidateJson(lib.json);
			if(valid)
			{
				for(var prop in lib.json)
				{
					if(prop.indexOf("config")>-1)
					{
						localValid = verifyGarInfo(lib.json[prop],prop);
						if(localValid)
						{
							
						}
					}
				}
			}

			return localValid;
		}

		var devPath = "~/Desktop/automation/build_mockup/components";
		var prodPath = "/Volumes/Customization/Library/Scripts/Script Resources/components/mockup_builder/";

		var componentFiles = includeComponents(devPath,prodPath);

		if(componentFiles)
		{
			for(var f=0;f<componentFiles.length;f++)
			{
				var thisComponent = componentFiles[f];
				eval("#include \"" + thisComponent + "\"");
			}
		}
		else
		{
			valid = false;
		}



	////////End//////////
	///Logic Container///
	/////////////////////

	/*****************************************************************************/

	///////Begin////////
	////Data Storage////
	////////////////////

		//global variables

		//non-error messages
		var msgList = [];

		//general library information
		//this is agnostic of the garments involved
		//it just stores static paths to network folders
		//and the returned design number for the current job
		var lib = 
		{
			designNumbers : [], 
			designFilePath : "",
			subGraphicsPath : "",
			subNameNumbersPath : "",
			patternFillsPath : "",
			mascotsPath : "",
			prepressPath : "",
			json : {},
			validated : {},
			filesToOpen: [],
			mockupsToOpen: [],
			curatedMockups: [],
			graphicsToOpen: [],
			curatedGraphics: [],
			reversible: false,
			adult:undefined,
			youth:undefined,
			possibleGarments : ["top", "bottom"],
			possibleSizes : ["adult", "youth"],
			sports : ["ACCESSORIES","BAGS","BASKETBALL","COMPRESSION","DIAMOND SPORTS","FOOTBALL","FOOTBALL 7 ON 7","LACROSSE","SOCCER","SPIRITWEAR","VOLLEYBALL"]
		}

		//set some file path constants
		if($.os.match("Windows"))
		{
			//PC
			
			// lib.designFilePath = "\"N:\\Library\\Scripts\\Script Resources\\Data\\json_design_files";
			errorList.push("Sorry, this script doesn't currently work on PC.");
			log.e("User is on a PC.::This script is not yet designed to work on PC.");
			sendErrors(errorList);
			printLog();
			valid = false;
		} 
		else 
		{
			// MAC
			lib.designFilePath = "/Volumes/Customization/Library/Scripts/Script Resources/Data/json_design_files";
			lib.subGraphicsPath = "/Volumes/Customization/Library/Graphics/Sublimation/";
			lib.subNameNumbersPath = "/Volumes/Customization/Library/Graphics/Sublimation_Name_Numbers/";
			lib.authenticPressNumbersPath = "/Volumes/Customization/Library/Graphics/Authentics/NUMBERS/_SCREEN PRESSED/";
			lib.authenticSPGraphicsPath = "/Volumes/Customization/Library/Graphics/Authentics/LOGOS/_SCREEN PRINT/";
			lib.authenticTWGraphicsPath = "/Volumes/Customization/Library/Graphics/Authentics/LOGOS/_TWILL/";
			lib.authenticTWNumbersPath = "/Volumes/Customization/Library/Graphics/Authentics/NUMBERS/_TWILL/";
			lib.authenticEMBGraphicsPath = "/Volumes/Customization/Library/Graphics/Authentics/LOGOS/_EMBROIDERY/";
			lib.patternFillsPath = "/Volumes/Customization/Library/Pattern Fills/";
			lib.mascotsPath = "/Volumes/Customization/Library/Mascots/";
			lib.ghostedMascotsPath = "/Volumes/Customization/Library/Mascots/_Ghosted Mascots/";
			lib.prepressPath = "/Volumes/Customization/Library/cads/prepress/";
		}

		

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


	for(var ftc = filesToClose.length - 1; ftc>=0; ftc--)
	{
		filesToClose[ftc].activate();
		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	}
	

	printLog();
	
}


BuildMockup();
