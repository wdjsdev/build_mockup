/*

Script Name: Build_Mockup
Author: William Dowling
Build Date: 03 February, 2017
Description: Open a converted template from the library, change the placeholder colors to match the paramcolors from the builder json, 
				import the necessary graphics (logos, names, numbers, pattern fills) from the library
				change the text of the logo to match team name
Build number: 2.0

Progress:

	Version 2.001
		03 February, 2017
		Initial build
		Wrote getDesignNumber function to prompt user for a design number and then validate their input
	
	Version 2.002
		03 February, 2017
		Continuing initial build
		Added file paths to common customization library locations
		Wrote readJson function to find json file on network and parse the contents

	Version 2.003
		03 February, 2017
		Continuing initial build
		Created garment object to hold relevant info pulled from lib.json
		Added a testing function to test individual functions
		Added a list of possible config.name properties
			This list will be replaced with a more reliable value: config.top.garment
		Tested briefly and working on select json files (so long as the expected config.top.garment property exists.)
			successfully gets the garment name and style number from the builder generated json object.
			Still needs conditional handling for the builder generated json missing properties that are necessary
				this may be the case on older orders with the old builder, or design id's that are not for tops..
*/

function container()
{

	/*****************************************************************************/

	///////Begin/////////
	///Logic Container///
	/////////////////////

	//sendErrors Function Description
	//Display any errors to the user in a preformatted list
	function sendErrors(errorList)
	{
		alert(errorList.join("\n"));
	}


	//testFunction Function Description
	//run a specific test on a given function
	//Just manually pass the values that would be expected
	function testFunction()
	{
		//testing getStyleNum function
		getStyleNum("FD-FAST-SL-1066");
		alert(garment.styleNum);
	}


	//getDesignNumber Function Description
	//Prompt the user to paste the design number into the dialog
	function getDesignNumber()
	{
		var localValid = true;

		var validationPattern = /^[a-z0-9]{12}$/i;
	
		var w = new Window("dialog", "Paste the design number.")
			var txt = w.add("statictext", undefined, "Copy the design number from the sales order and paste it below.")
			var input = w.add("edittext", undefined, "Th6qpCtyrGHI");
			input.characters = 13;
			input.active = true;

			var buttonGroup = w.add("group");
				//user submits form
				var okButton = buttonGroup.add("button", undefined, "Submit");
				okButton.onClick = validateSubmission;

				//user cancels
				var cancelButton = buttonGroup.add("button", undefined, "Cancel");
				cancelButton.onClick = function()
				{
					localValid = false;
					log.e("User pressed cancel. Exiting script.");
					w.close();
				}

				w.addEventListener("keydown",function(k)
				{
					if(k.keyName == "Enter")
					{
						validateSubmission();
					}
				});


		w.show();


		function validateSubmission()
		{
			var usrInput = input.text;
			if(usrInput != "" && usrInput != null && usrInput != undefined && validationPattern.test(usrInput))
			{
				//this input passes validation.
				//save the input to the global library object
				lib.designNumber = usrInput;
			}
			else
			{
				//this input does not pass validation
				localValid = false;
				errorList.push("You didn't enter a valid design number. Please try again.")
				log.e("User did not enter a valid design number.::getDesignNumber function returned false.::User input value = " + usrInput);
			}
			w.close();
		}
	
	
		return localValid
	}

	
	//readJson Function Description
	//search the designFilePath for the design number entered by the user
	//if the file does not exist throw a descriptive error
	//if the file does exist save the evaluated JSON data in the lib object
	//args:
		//path = hard coded path to the script resources folder
		//num = design number entered by user
	function readJson(path,num)
	{
		var localValid = true;
		

		var theFile = new File(path + "/" + num + ".json");

		if(!theFile.exists)
		{
			//no file using this design number exists.
			errorList.push("Sorry. That design number was not found..");
			log.e("The design number: " + num + " was not found in the script resources folder.");
			localValid = false;
		}
		else
		{
			//design id was found.
			//read and eval the contents
			//save the contents to the lib.json object.
			theFile.open();
			var contents = "(" + theFile.read() + ")";
			theFile.close();

			contents = eval(contents);
			lib.json = contents;
		}
	
	
		return localValid
	}



	//getPrepressSubFolder Function Description
	//get the subfolder (typically a sport, i.e. BASKETBALL)
	//and append the proper string to the lib.prepressPath string
	function getPrepressSubFolder(garName)
	{
		var localValid = true;
	
		//localStorage
		#include "~/Desktop/automation/javascript/utilities/bm_code_converter/bm_code_converter.js";

		alert(ss);
	
	
		return localValid
	}



	//getStyleNum Function Description
	//extract the style number from the nameString and
	//add the style number to the garment object
	//nameString could be the garment code or a graphic code
	//ex. FD-FAST-2B-SS-1066 or FDSP-1032
	function getStyleNum(nameString)
	{
		var localValid = true;
		
		//format of styleNum should be 3 or 4 digits only
		var correctFormat = /\d{3,4}/;

		try
		{
			var styleNum = nameString.substring(nameString.lastIndexOf("-") + 1, nameString.length);
			if(correctFormat.test(styleNum))
			{
				garment.styleNum = styleNum;
			}
			else
			{
				errorList.push("Style number was not returned in the proper format.");
				log.e("Style number didn't match the correct format.::styleNum was returned as: " + styleNum);
				localValid = false;
			}
				
		}
		catch(e)
		{
			errorList.push("Failed to properly read the style number from the builder info. =(")
			log.e("styleNum could not be determined properly.::argument passed to function was " + nameString + "::and the returned result was " + styleNum);
			localValid = false;
		}
	
	
		return localValid
	}



	//getGarName Function Description
	//get the garment name from the nameString
	//garment name should be everything up to the style number
	function getGarName(nameString)
	{
		var localValid = true;
		
		//format of garName should be a series of chunks of a-zA-Z delimited by hyphens
		var correctFormat = /^([a-z]*-)+/i;

		try
		{
			var garName = nameString.substring(0, nameString.lastIndexOf("-"));

			if(correctFormat.test(garName))
			{
				garment.name = garName;
			}
			else
			{
				errorList.push("Garment Name was not returned in the proper format.");
				log.e("garName did not match the correct format.::garName was returned as: " + garName);
				localValid = false;
			}
		}

		catch(e)
		{
			errorList.push("Failed to properly identify the garment name.")
			log.e("garName could not be determined properly.::argument passed to function was " + nameString + "::and the returned result was " + garName);
			localValid = false;
		}
		
		
		
	
	
		return localValid
	}
	



	////////End//////////
	///Logic Container///
	/////////////////////

	/*****************************************************************************/

	///////Begin////////
	////Data Storage////
	////////////////////


	var lib = 
	{
		designNumber : "", 
		designFilePath : "",
		subGraphicsPath : "",
		subNameNumbersPath : "",
		patternFillsPath : "",
		mascotsPath : "",
		prepressPath : "",
		json : {}
	}



	var garment = {};


	//fetch the utilities container for logging
	//set the file path to the script resources folder 

	if($.os.match('Windows'))
	{
		//PC
		eval("#include \"N:\\Library\\Scripts\\Script Resources\\Data\\Utilities_Container.js\"");
		lib.designFilePath = "\"N:\\Library\\Scripts\\Script Resources\\Data\\json_design_files";
	} 
	else 
	{
		// MAC
		eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.js\"");
		lib.designFilePath = "/Volumes/Customization/Library/Scripts/Script Resources/Data/json_design_files";
		lib.subGraphicsPath = "/Volumes/Customization/Library/Graphics/Sublimation/";
		lib.subNameNumbersPath = "/Volumes/Customization/Library/Graphics/Sublimation_Name_Numbers/";
		lib.patternFillsPath = "/Volumes/Customization/Library/Pattern Fills/";
		lib.mascotsPath = "/Volumes/Customization/Library/Mascots/";
		lib.prepressPath = "/Volumes/Customization/Library/cads/prepress/";
	}




	////////End/////////
	////Data Storage////
	////////////////////

	/*****************************************************************************/

	///////Begin////////
	///Function Calls///
	////////////////////

	var errorList = [];

	var valid = true;

	/////////////////////
	////TEST FUNCTION////
	/////////////////////

		// testFunction();

	/////////////////////
	////TEST FUNCTION////
	/////////////////////

	log.h("Beginning execution of getDesignNumber function.")
	if(getDesignNumber())
	{
		log.l("getDesignNumber function returned true. Set value of lib.designNumber to " + lib.designNumber);
	}
	else
	{
		valid = false;
	}

	if(valid)
	{
		log.h("Beginning execution of readJson function.");
		if(readJson(lib.designFilePath, lib.designNumber))
		{
			log.l("readJson function returned true. Set value of lib.json to contents of the fetched json file.")
		}
		else
		{
			valid = false;
		}
	}
	
	if(valid)
	{
		log.h("Beginning execution of getStyleNum function.");
		if(getStyleNum(lib.json.config.top.garment))
		{
			log.l("getStyleNum function returned true. Set value of garment.styleNum to " + garment.styleNum)
		}
		else
		{
			valid = false;
		}
	}

	if(valid)
	{
		log.h("Beginning execution of getGarName function.");
		if(getGarName(lib.json.config.top.garment))
		{
			log.l("getGarName function returned true. Set value of garment.name to " + garment.name);
		}
		else
		{
			valid = false;
		}
	}

	var blah = garment;



	////////End/////////
	///Function Calls///
	////////////////////

	/*****************************************************************************/

	//output the results of the script to the log file
	printLog();

	if(errorList.length>0)
	{
		sendErrors(errorList);
	}
	return valid

}
container();