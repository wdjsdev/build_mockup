 /*

 Script Name: Build_Mockup
 Author: William Dowling
 Build Date: 07 March, 2016
 Description: Rebuilding with a clearer road map

 Build number: 3.0

 Progress:

 	Version 3.001
 		07 March, 2016
 		Initial rebuild. populating global variables and data storage

 	Version 3.002
 		Adding getDesignNumber function.
 		Prompt user with scriptUI dialog and validate input on submit.
 			if not valid, add statictext to the dialog to alert the user of the error and allow them to continue.
	
 	Version 3.003
 		Finished rebuild. Tested and working on everything except reversibles.
 		Distributing this version to the artists.

	Version 3.004
		Adding a check to see whether the garment is reversible

 */

function container(designNumber)
{

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

		//development prompt to verify which components should be used
		//only will.dowling will be prompted here, other artists
		//will always get the production components.
		function componentPrompt()
		{
			var components =
			{
				regDev : new Folder("~/Desktop/automation/javascript/_new_cad_workflow/build_mockup/components/"),
				binDev : new Folder("~/Desktop/automation/javascript/_new_cad_workflow/build_mockup/comp_bin/"),
				prod: new Folder("/Volumes/Customization/Library/Scripts/Script Resources/components/mockup_builder/")
			}

			var result;

			var w = new Window("dialog","Which components do you want to use?");
				var txtGroup = w.add("group");
					var topTxt = txtGroup.add("statictext", undefined, "Select the component group.");

				var btnGroup = w.add("group");
					btnGroup.orientation = "column";
					var regDev = btnGroup.add("button", undefined, "Regular Development");
						regDev.onClick = function()
						{
							result = components.regDev;
							w.close();
						}
					var binDev = btnGroup.add("button", undefined, "Binary Development");
						binDev.onClick = function()
						{
							result = components.binDev;
							w.close();
						}
					var production = btnGroup.add("button", undefined, "Production Components");
						production.onClick = function()
						{
							result = components.prod;
							w.close();
						}
					var cancel = btnGroup.add("button", undefined, "Cancel");
						cancel.onClick = function()
						{
							result = false;
							w.close();
						}
			w.show();

			return result;
		}

		var user = $.getenv("USER");

		if(user == "will.dowling")
		{
			//prompt for correct component folder
			var path = componentPrompt();
			if(!path)
			{
				return;
			}
		}
		else
		{
			//network storage
			var path = Folder("/Volumes/Customization/Library/Scripts/Script Resources/components/mockup_builder/");
		}
		
		
		//get the files from the correct component folder
		var files = path.getFiles();

		//this file isn't a component for this specific script, so it lives somehwere else..
		//no problem, just add it to the end of the list
		//push the utilities container file to files as well
		files.push(File("/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.js"));

		for(var f=0;f<files.length;f++)
		{
			var thisComponent = files[f];
			eval("#include \"" + thisComponent + "\"");
		}

		// #include "~/Desktop/automation/javascript/_new_cad_workflow/build_mockup/comp_mini/generate_json.js";

		// alert("success");
		// return;



	////////End//////////
	///Logic Container///
	/////////////////////

	/*****************************************************************************/

	///////Begin////////
	////Data Storage////
	////////////////////

		//global variables

		//running flag validation variable
		var valid = true;

		//errors
		var errorList = [];

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
			sports : ["ACCESSORIES","BAGS","BASKETBALL","COMPRESSION","DIAMOND SPORTS","FOOTBALL","LACROSSE","SOCCER","SPIRITWEAR","VOLLEYBALL"]
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

		//if user is will.dowling set logDest to local development log
		//so the main user log isn't cluttered up by my testing
		//otherwise, set logDest to buildMockLog
		if(user == "will.dowling")
		{
			logDest.push(new File("~/Desktop/automation/javascript/_new_cad_workflow/build_mockup/logs/build_mockup_dev_log.txt"));
		}
		else
		{
			logDest.push(buildMockLog);
		}

		

	////////End/////////
	////Data Storage////
	////////////////////

	/*****************************************************************************/

	///////Begin////////
	///Function Calls///
	////////////////////

	
		/////////////////////
		////TEST FUNCTION////
		/////////////////////

			// valid = testFunction();

			// if(errorList.length>0)
			// {
			// 	sendErrors(errorList);
			// }
			// if(msgList.length>0)
			// {
			// 	sendMsgs(msgList);
			// }

			// printLog();
			// return valid;

		/////////////////////
		////TEST FUNCTION////
		/////////////////////

	if(valid && !designNumber)
	{
		//prompt user for design number and validate the format of their input
		if(!getDesignNumber())
		{
			valid = false;
		}
	}
	else
	{
		//a design number was passed in, don't prompt the user
		lib.designNumbers.push(designNumber);
		log.h("designNumber = " + designNumber);
	}

	log.h("The user entered the following design numbers: ::" + lib.designNumbers.join("::"));
	
	//loop the lib.designNumbers array
	for(var dn=0;dn<lib.designNumbers.length;dn++)
	{
		//reset mockupsToOpen array
		lib.mockupsToOpen = [];

		var thisDesignNumber = lib.designNumbers[dn];

		log.h("Beginning design numbers loop for design number: ::" + thisDesignNumber);
		if(valid)
		{
			//search for a file that matches the design number the user entered
			//save result to lib.json
			if(!getJson(thisDesignNumber))
			{
				valid = false;
			}
		}
		

		if(valid)
		{
			//check that the json data is in the correct format
			//i.e. not created with the old builder.
			if(!preValidateJson(lib.json))
			{
				valid = false;
			}
		}


		if(valid)
		{
			//check to see whether this is a reversible garment
			if(!checkForReversible(lib.json))
			{
				valid = false;
			}

		}

		if(valid)
		{
			var successCounter = 0;
			//loop the properties of lib.json
			//for each config object, run verifyGarInfo and verifyGraphicInfo functions
			for(var prop in lib.json)
			{
				if(prop.indexOf("config")>-1)
				{
					log.l("Beginning loop for lib.json." + prop);
					if(!verifyGarInfo(lib.json[prop],prop))
					{
						log.l("Failed to correctly verify the garment info for " + prop + ". Skipping this garment.");
						continue;
					}
					if(!verifyGraphicInfo(lib.json[prop],prop))
					{
						log.l("Failed to correctly verify the graphic(s) info for " + prop);
						continue;
					}
					successCounter++;

				}
			}
			if(successCounter == 0)
			{
				valid = false;
				log.e("Failed to successfully process any config objects. Exiting script.");
			}
		}

		if(valid)
		{
			//remove duplicate mockup files only from this design number
			//any duplicate mockups that come from a different design number should still be opened.
			//push unique files to lib.filesToOpen array.
			log.h("Beginning execution of removeDuplicates function for the mockupFiles for design number: " + thisDesignNumber);
			removeDuplicates(lib.mockupsToOpen,"mockups");
		}
	}

	if(valid)
	{
		//remove all duplicate graphics
		//push unique files to lib.filesToOpen array
		log.h("Beginning execution of removeDuplicates for all graphic files.");
		if(!removeDuplicates(lib.graphicsToOpen,"graphics"))
		{
			valid = false;
		}
	}
	
	

	if(valid)
	{
		openFiles(lib.curatedMockups,lib.curatedGraphics);
	}

	
	////////End/////////
	///Function Calls///
	////////////////////

	/*****************************************************************************/

	if(errorList.length>0)
	{
		sendErrors(errorList);
		log.e("The following error messages were sent to the user: ::::" + errorList.join("::"));	
	}

	if(msgList.length>0)
	{
		if(user != "will.dowling")
		{
			sendMsgs(msgList);
		}
		log.h("The following script messages were sent to the user: ::::" + msgList.join("::"));	
		
	}

	log.h("End of Build_Mockup script. Returning " + valid);

	//print the log file(s)
	printLog();



	return valid;

}


container();
