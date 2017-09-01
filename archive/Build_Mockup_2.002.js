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