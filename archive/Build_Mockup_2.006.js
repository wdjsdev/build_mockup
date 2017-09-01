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

	Version 2.004
		06 February, 2017
		Continuing build
		Added getPrepressSubFolder function
		Currently working to get the correct BM Code. 
		Changing name of getPrepressSubFolder to getBMCode
		Removing the string concatenation from getBMCode function.
			path to correct prepress folder will be concatenated elsewhere

	Version 2.005
		06 February, 2017
		Adding function to find the correct parent folder for a given BM code.
		Successfully determining the BM code. Still needs more testing though.
			Some changes may need to be made to bm_code_converter.js if necessary.

	Version 2.006
		06 February, 2017
		Added getSport function to determine which folder in the prepress folder to use.
		Adding findGarmentFolder function to comb the directories in the garment.sport folder
			and look for the correct garment folder.
		Currently working to determine correct subfolder from the sport folder
			Still needs logic to handle multiple matches (like FD-161, FD-161W and FD-161Y)
		Still needs to be tested on many more design numbers and conditions need to be put in
			to look out for undesirably formatted design numbers.
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



	//getBMCode Function Description
	//get the subfolder (typically a sport, i.e. BASKETBALL)
	//and append the proper string to the lib.prepressPath string
	function getBMCode()
	{
		var localValid = true;
	
		//localStorage
		#include "~/Desktop/automation/javascript/utilities/bm_code_converter/bm_code_converter.js";

		try
		{
			var mid = midTable[garment.name];

			if(mid)
			{
				garment.bmCode = mid;
			}
			else
			{
				errorList.push("That garment isn't in the conversion table.");
				log.e("Could not find the proper BM Code for " + garment.name);
				localValid = false;
			}
		}
		catch(e)
		{
			errorList.push("Failed to get the correct prepress path.");
			log.e("Failed to get the correct prepress path.::The subStyle returned was " + mid + "::and the concatenated path resulted in " + garment.prepressLoc)
		}
	
	
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



	//getSport Function Description
	//Determine which prepress subfolder to use for the given bmCode
	function getSport(bmCode)
	{
		var localValid = true;
		
		switch(bmCode)
		{
			case "FD-137W":
			case "FD-137Y":
			case "FD-137":
			case "FD-210":
			case "FD-210Y":
			case "FD-215":
			case "FD-215W":
			case "FD-215Y":
			case "FD-217W":
			case "FD-217Y":
			case "FD-217":
			case "FD-220W":
			case "FD-622W":
			case "FD-622Y":
			case "FD-622":
				garment.sport = "BASKETBALL";
				break;

			case "FD-1000Y":
			case "FD-1000":
			case "FD-161W":
			case "FD-161Y":
			case "FD-161":
			case "FD-163W":
			case "FD-163Y":
			case "FD-163":
			case "FD-230Y":
			case "FD-230":
			case "FD-233Y":
			case "FD-233":
			case "FD-234Y":
			case "FD-234":
			case "FD-240W":
			case "FD-243W":
			case "FD-246W":
			case "FD-3417":
			case "FD-3417Y":
			case "FD-400W":
			case "FD-4416W":
			case "FD-500W":
			case "FD-505W":
			case "FD-5060W":
			case "FD-609W":
			case "FD-609Y":
			case "FD-609":
			case "PS-5014W":
			case "PS-5014Y":
			case "PS-5014":
			case "PS-5075W":
				garment.sport = "DIAMOND SPORTS";
				break;

			case "FD-250Y": 
			case "FD-250": 
			case "FD-251": 
			case "FD-5064Y": 
			case "FD-5064": 
			case "FD-5080Y": 
			case "FD-5080": 
			case "FD-5411Y": 
			case "FD-5411": 
				garment.sport = "FOOTBALL";
				break;

			case "FD-2000Y":
			case "FD-2000":
			case "FD-2020Y":
			case "FD-2020":
			case "FD-260Y":
			case "FD-260":
			case "FD-261Y":
			case "FD-261":
			case "FD-3007Y":
			case "FD-3007":
			case "FD-3011W":
			case "FD-3015W":
			case "FD-3019W":
			case "FD-3024Y":
			case "FD-3027":
			case "FD-3038Y":
			case "FD-3042":
			case "FD-3045W":
			case "FD-3047W":
			case "FD-3050Y":
			case "FD-3050":
			case "FD-4004W":
			case "FD-4014W":
				garment.sport = "LACROSSE";
				break;

			case "FD-3037W":
			case "FD-3048W":
			case "FD-3061Y":
			case "FD-3061":
			case "FD-3062Y":
			case "FD-3062":
			case "FD-3063Y":
			case "FD-3063":
			case "FD-3064Y":
			case "FD-3064":
			case "FD-3090W":
			case "FD-3092Y":
			case "FD-3092":
			case "FD-4005W":
			case "FD-857Y":
			case "FD-857":
			case "FD-858Y":
			case "FD-858":
				garment.sport = "SOCCER";
				break;

			case "FD-101":
			case "FD-161":
			case "FD-163":
			case "FD-164W":
			case "FD-164Y":
			case "FD-164":
			case "FD-1873W":
			case "FD-1873Y":
			case "FD-1873":
			case "FD-2042W":
			case "FD-2044W":
			case "FD-211Y":
			case "FD-211":
			case "FD-3069":
			case "FD-3070":
			case "FD-3089W":
			case "FD-3099W":
			case "FD-4009Y":
			case "FD-4010Y":
			case "FD-4018W":
			case "FD-477Y":
			case "FD-477":
			case "FD-486W":
			case "FD-486Y":
			case "FD-486":
			case "FD-487Y":
			case "FD-487":
			case "FD-5029W":
			case "FD-5036W":
			case "FD-5054":
			case "FD-597":
			case "FD-597Y":
			case "FD-597W":
			case "FD-6002W":
			case "FD-6003Y":
			case "FD-6003Y":
			case "FD-6003":
			case "FD-6004W":
			case "FD-6061W":
			case "FD-6061Y":
			case "FD-6061":
			case "FD-6062W":
			case "FD-6062Y":
			case "FD-6062":
			case "FD-6063W":
			case "FD-6063Y":
			case "FD-6063":
			case "FD-611":
			case "FD-611Y":
			case "FD-617Y":
			case "FD-617":
			case "FD-622":
			case "FD-634":
			case "FD-634Y":
			case "FD-648W":
			case "FD-648Y":
			case "FD-648":
			case "FD-659Y":
			case "FD-659":
			case "FD-682W":
			case "FD-682Y":
			case "FD-682":
			case "FD-692W":
			case "FD-692Y":
			case "FD-692":
			case "FD-7018W":
			case "FD-7020W":
			case "FD-7025Y":
			case "FD-7025":
			case "FD-706W":
			case "FD-762W":
			case "FD-828Y":
			case "FD-828":
			case "FD-829W":
			case "FD-842W":
			case "FD-842Y":
			case "FD-842":
			case "FD-862W":
			case "FD-862Y":
			case "FD-862":
			case "FD-863W":
			case "FD-863Y":
			case "FD-863":
			case "FD-872W":
			case "FD-872Y":
			case "FD-872":
				garment.sport = "SPIRITWEAR";
				break;

			case "FD-281":
			case "FD-3003":
			case "FD-3184W":
			case "FD-3185W":
				garment.sport = "VOLLEYBALL";


		}
		
		if(!garment.sport)
		{
			errorList.push("Couldn't determine the correct subfolder from the prepress folder.");
			log.e("bmCode did not match any of the cases in the switch statement.::bmCode used was " + garment.bmCode);
			localValid = false;
		}
	
	
		return localValid
	}



	//findGarmentFolder Function Description
	//comb through the sub folders of the 
	function findGarmentFolder(sport)
	{
		var localValid = true;


	
		try
		{
			var thePath = lib.prepressPath + sport;
			var sportFolder = new Folder(thePath);
			var subFolderList = sportFolder.getFiles();
			var codeMatches = [];

			for(var sf=0;sf<subFolderList.length;sf++)
			{
				var thisSubFolder = subFolderList[sf];
				if(thisSubFolder.name.indexOf(garment.bmCode)>-1)
				{
					codeMatches.push(thisSubFolder);
				}
			}

			if(codeMatches.length==1)
			{
				garment.folder = codeMatches[0];
			}
			else if(codeMatches.length == 0)
			{
				errorList.push("None of the folders inside this sport folder matched the desired BM Code.");
				log.e("The bmCode: " + garment.bmCode + " was not found in the sport folder: " + garment.sport);
				localValid = false;
			}
			else if(codeMatches.length > 1)
			{
				//do something to determine the correct code
				//this condition will occur when the code is "FD-161" and there also exist folders
				//folders named "FD-161W" and "FD-161Y"
				log.i("there are multiple folders in the sport folder that contain the BM Code " + garment.bmCode);
			}
		}
		catch(e)
		{
			errorList.push("Failed to find the correct garment folder inside the sport folder.");
		
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

	if(valid)
	{
		log.h("Beginning execution of getBMCode function.");
		if(getBMCode())
		{
			log.l("getBMCode function returned true. Set value of garment.bmCode" + garment.bmCode);
		}
		else
		{
			valid = false;
		}
	}

	if(valid)
	{
		log.h("Beginning execution of getSport function.");
		if(getSport(garment.bmCode))
		{
			log.l("getSport function returned true. Set value of garment.sport to " + garment.sport);
		}
		else
		{
			valid = false;
		}
	}

	if(valid)
	{
		log.h("Beginning execution of findGarmentFolder function.")
		if(findGarmentFolder(garment.sport))
		{
			log.l("findGarmentFolder function returned true. Set value of garment.folder to " + garment.folder);
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