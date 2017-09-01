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
			var errorString = "The Following Errors Occurred:\n";
			errorString += errorList.join("\n");
			alert(errorString);
		}


		//testFunction Function Description
		//run a specific test on a given function
		//Just manually pass the values that would be expected
		function testFunction()
		{
			//testing getSport function
			var localValid;

			getSport("FD-1663");

			printLog();

			return localValid;
		}



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

		//garments holds up to two objects
		//one for top and one for bottom
		var garments = {
			top : 
			{
				name : "",
				adult : false,
				bmCode : "",
				youth : false,
				bmCodeYouth : "",
				styleNum : "",
				youthFolder : null,
				adultFolder : null,
			},
			bottom : 
			{
				name : "",
				adult : false,
				bmCode : "",
				youth : false,
				bmCodeYouth : "",
				styleNum : "",
				youthFolder : null,
				adultFolder : null,
			}
		};

		//general library information
		//this is agnostic of the garments involved
		//it just stores static paths to network folders
		//and the returned design number for the current job
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

		//set some file path constants
		if($.os.match('Windows'))
		{
			//PC
			// eval("#include \"N:\\Library\\Scripts\\Script Resources\\Data\\Utilities_Container.js\"");
			// lib.designFilePath = "\"N:\\Library\\Scripts\\Script Resources\\Data\\json_design_files";
			errorList.push("Sorry, this script doesn't currently work on PC.");
			log.e("User is on a PC.::This script is not yet designed to work on PC.");
			valid = false;
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

	
		/////////////////////
		////TEST FUNCTION////
		/////////////////////

			// valid = testFunction();

			// if(errorList.length>0)
			// {
			// 	sendErrors(errorList);
			// }

			// printLog();
			// return valid;

		/////////////////////
		////TEST FUNCTION////
		/////////////////////



	
	



	////////End/////////
	///Function Calls///
	////////////////////

	/*****************************************************************************/

	if(errorList.length>0)
	{
		sendErrors(errorList);
	}
	return valid;

}
container();