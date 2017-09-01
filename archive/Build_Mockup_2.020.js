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

	Version 2.007
		07 February, 2017
		Adding openConvertedTemplate function
		Currently working to parse JSON, get the garment information and open the file
			Universal functionality of this relies on standardization of folder structure and file naming conventions

	Version 2.008
		07 February, 2017
		Adding getGraphics function
		Successfully pulling the graphic data from the json object and pushing it to the garmentGraphics object.
			Still need to add validation to make sure values are as expected
			Still need to add color info
	
	Version 2.009
		08 February, 2017
		Added getGraphicPath function
			This function finds the correct network paths to the parent folders of the graphics for the shirt.
		Currently working to open a converted template and correctly identify folder paths to graphics.

	Version 2.010
		09 February, 2017
		Added openGraphics function
		Currently working to open front logos, names and numbers (not tested yet on mascots, but that should be no different.);

	Version 2.011
		09 February, 2017
		Removed some alerts and $.writelns that were just for testing/verification purposes.
		Fixed bug in getGarmentFolder function that caused a runtime error if more than one match was found in the garments folder.
		Adding a generic dialog function to temporarily solve the issue of multiple matches
		Adding temporary listbox dialog instead of simple prompt for testing of multiple design numbers easily.
		Everything is currently working as long as the design number is for a top garment (no pants or shorts yet) and
			the library file paths are as expected and converted template file names have a 4 digit postfix (ie. FD-163_1003);

	Version 2.012
		15 February, 2017
		Adding a pre-validation function to ensure the JSON data is read properly.
		Currently working to determine whether a design number refers to a top, bottom or both.
		correctly throws errors if neither top or bottom are identified.
		Made fixes to bm_code_converter because slowpitch 161/163 objects were incorrect.
		Added logic in the getBMCode function to determine whether a slowpitch shirt is regular or raglan (161 or 163);

	Version 2.013
		Adding logic to use garmentsNeeded array to conditionally look for files and folders
		Also save all file openings till the end so the script doesn't open 2 or 3 files and then throw a fatal error.
			All errors should be handled before anything is opened.
		Rewrote getStyleNum function to simply pull existing styleNumber from builer generated JSON.
		Began including function calls to master loop.

	Version 2.014
		Continuing to migrate function calls into masterInfoLoop
		Tidying up error logging.
		Building logic to verify the existence of files before attempting to open them.
		Added the ability to find the correct converted template file regardless of whether a 3 digit or 4 digit style number is used in the filename

	Version 2.015
		22 February, 2017
		Fixed up function calls and corrected arguments.
		Tested and working for graphics and converted templates even if the converted template uses a 3 digit style number in the filename.
		Crossing fingers.
		Distributing this to the mockup artists for beta testing.

	Version 2.016
		23 February, 2017
		Changed value of topbot string for bottoms to "bottom" rather than "bot".
			//**ATTENTION//
				//need to verify that this will always be correct.
				//I seem to remember seeing "bot" used, but perhaps i made that up..
			//**ATTENTION//

	Version 2.017
		23 February, 2017
		Adding validation to graphics options
			need to make sure that at least one location exists
				if no location exists, the graphic has been overridden, don't open it
			if name/number style is the same, don't open duplicate copies of the name/number file.
		Updated getGraphics function to look for graphics with no locations
		Updated getGraphics to ignore multiple instances of the same graphic
		Tested and working

	Version 2.018
		23 February, 2017
		Fixing bug wherein script does not open any files if custom/provided/onfile graphics are called for.
		Tested and working to ignore non-stock graphics.

	Version 2.019
		24 February, 2017
		Adding mens_or_youth.js external function to determine whether or not roster information needs to be looked at
		Added checkRoster function to pull out the necessary sizes for the order and save to garment.sizes
		Added getSizes function to determine whether the  user needs adult, youth or both
			save the values to roster.mens and roster.youth respectively;
			boolean values are saved as garment.adult and garment.youth
		Tested and working for design numbers that contain a bm code that could refer to mens or youth.

	Version 2.020
		01 March, 2017
		Ceasing development of version 2.
		Starting fresh in version 3.0 with more concise garments object
			and better running flag validation.
*/

function container()
{

	var scriptVersion = "2.020";
	var scriptName = "Build Mockup";

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
		//testing getSport function
		var localValid;

		getSport("FD-1663");

		printLog();

		return localValid;
	}


	//getDesignNumber Function Description
	//Prompt the user to paste the design number into the dialog
	function getDesignNumber()
	{
		var localValid = true;

		var validationPattern = /^[a-z0-9]{12}$/i;
	
		var w = new Window("dialog", "Paste the design number.")
			var txt = w.add("statictext", undefined, "Copy the design number from the sales order and paste it below.")
			var input = w.add("edittext", undefined, "cI3xop6JZc4T");
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
	
	
		return localValid;
	}

	//////////////////
	//Legacy Version//
	////Do Not Use////
	//////////////////
		//getDesignNumber Function Description
		//this version of getDesignNumber is just for testing
		//so i can easily choose different design numbers to hunt
		//for bugs rather than going to the folder location and
		//copying/pasting different design numbers
		// function getDesignNumber()
		// {
		// 	var localValid = true;

		// 	var folder = new Folder(lib.designFilePath);

		// 	var filesArr = folder.getFiles();

		// 	var files = [];

		// 	for(var fa=0;fa<filesArr.length;fa++)
		// 	{
		// 		var thisFile = filesArr[fa];
		// 		files.push(thisFile.name.substring(0,thisFile.name.indexOf(".json")));
		// 	}
		
		// 	var w = new Window("dialog", "choose a design");
				

		// 		var btnGroup = w.add("group");
		// 			var submit = btnGroup.add("button", undefined, "Submit");
		// 				submit.onClick = function()
		// 				{
		// 					lib.designNumber = box.selection.text;
		// 					w.close();
		// 				}
		// 			var cancel = w.add("button", undefined, "Cancel");
		// 				cancel.onClick = function()
		// 				{
		// 					localValid = false;
		// 					log.e("cancelled getDesignNumber function. exiting script.");
		// 					w.close();
		// 				}
		// 		var txt = w.add("statictext", undefined, "choose a design");
		// 		var box = w.add("listbox", undefined, files);
		// 	w.onShow = function()
		// 	{
		// 		w.size = {width:300,height:400}
		// 	}
		// 	w.show();
		
		// 	alert(lib.designNumber)
		// 	return localValid;
		// }
	//////////////////
	//Legacy Version//
	////Do Not Use////
	//////////////////

	
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
	
	
		return localValid;
	}



	//preValidate Function Description
	//read through the json data and determine how to handle the rest of the script
	//find out whether the garment is a top or bottom
	//look at the available properties and ensure that the script does not attempt to
	//access non existent properties later that may cause runtime errors.
	function preValidate(json)
	{
		var localValid = true;
	
		//check for valid json format
		//make sure this json wasn't created with 
		//the format from the old builder.
		if(json.config == undefined)
		{
			errorList.push("Sorry. Looks like this design ID is in an old format. You're on your own for this order. =(");
			log.e("json data was in the wrong format and can't be properly read. exiting script.");
			localValid = false;
		}

		//check whether garment is a top or bottom
		if(localValid && json.config.top)
		{
			garmentsNeeded.push("top");
		}
		if(localValid && json.config.bottom)
		{
			garmentsNeeded.push("bottom");
		}


		//check that there is at least one
		//top or bottom.
		if(localValid && garmentsNeeded.length == 0)
		{
			errorList.push("There were no proper garments found in the builder data. Please alert William of this error.");
			log.e("No valid garments were found for design number: " + lib.designNumber);
			localValid = false;
		}

	
	
		return localValid;
	}



	/////////////////////////////
	//Garment Related Functions//
	/////////////////////////////


		//getBMCode Function Description
		//get the subfolder (typically a sport, i.e. BASKETBALL)
		//and append the proper string to the lib.prepressPath string
		function getBMCode()
		{
			var localValid = true;
		

			//**ATTENTION**//
				//this needs to be changed before distributing the script to the artists.
			//**ATTENTION**//

			//localStorage
			// #include "~/Desktop/automation/javascript/utilities/bm_code_converter/bm_code_converter.js";

			//network storage
			if($.os.match('Windows')){
				//PC
				eval("#include \"N:\\Library\\Scripts\\Script Resources\\Data\\bm_code_converter.js\"");
				
			} else {
				// MAC
				eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/bm_code_converter.js\"");
			}

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

				if(garment.bmCode.indexOf("/")>-1)
				{
					var subStyle = getSubStyle(garment.name,garment.styleNum);
					if(subStyle != undefined)
					{
						garment.bmCode = subStyle;
					}
				}

			}
			catch(e)
			{
				errorList.push("Failed to properly read the BM Code.");
				log.e("Failed to get the correct BM Code.::Look for " + garment.name + " in midTable.");
			}
		
		
			return localValid;
		}

		//findMensOrYouth Function Description
		//read the bm code and determine whether the script 
		//should attempt to determine whether to check for
		//mens or youth sizes needed based on roster.
		//if roster has no players, prompt the user
		function findMensOrYouth(bmCode)
		{

			//boolean to decide whether or not to look
			//at roster info to determine mens/youth/both
			var lookAtRoster = false;


			//list all of the garments that could be mens or youth....
			//this could take a while..
			//if the bmCode matches any of these,
			//then search the roster for size info and determine
			//that 

			switch(bmCode)
			{
				//basketball
				case "FD-137":
				case "FD-210":
				case "FD-211":
				case "FD-215":
				case "FD-217":
				case "FD-622":

				//compression
				case "FD-410":
				case "FD-412":
				case "FD-415":
				case "FD-420":
				case "FD-425":
				case "FD-430":

				//diamond sports
				case "FD-1000":
				case "FD-161":
				case "FD-163":
				case "FD-230":
				case "FD-233":
				case "FD-234":
				case "FD-3417":
				case "FD-609":
				case "FD-5014":
				
				//football
				case "FD-250":
				case "FD-5064":
				case "FD-5080":
				case "FD-5411":
				
				//lacrosse
				case "FD-2000":
				case "FD-2020":
				case "FD-260":
				case "FD-261":
				case "FD-3007":
				case "FD-3027":
				case "FD-3050":

				//soccer
				case "FD-3061":
				case "FD-3062":
				case "FD-3063":
				case "FD-3064":
				case "FD-3092":
				case "FD-857":
				case "FD-858":

				//spiritwear
				case "FD-164":
				case "FD-1873":
				case "FD-211":
				case "FD-477":
				case "FD-486":
				case "FD-487":
				case "FD-597":
				case "FD-6003":
				case "FD-6061":
				case "FD-6062":
				case "FD-6063":
				case "FD-611":
				case "FD-617":
				case "FD-648":
				case "FD-659":
				case "FD-682":
				case "FD-692":
				case "FD-7025":
				case "FD-828":
				case "FD-842":
				case "FD-862":
				case "FD-863":
				case "FD-872":

					lookAtRoster = true;
					break;
			}


			return lookAtRoster;
		}

		//checkRoster Function Description
		//loop through the items of the roster object and log the needed sizes
		//then return an object that contains the sizes needed for top and/or bottom
		function checkRoster(roster)
		{
			var localValid = true;
		
			var sizesNeeded = {top:null,bot:null};

			//loop each roster object in the roster array
			//and log a new property to sizesNeeded if it
			//doesn't yet exist.
			for(var cr=0;cr<roster.length;cr++)
			{
				var thisRosterItem = roster[cr];
				
				//log top sizes information
				if(thisRosterItem.topSize)
				{
					if(!sizesNeeded.top)
					{
						sizesNeeded.top = {};
						sizesNeeded.top[thisRosterItem.topSize] = thisRosterItem.topSize;
					}
					else
					{
						sizesNeeded.top[thisRosterItem.topSize] = thisRosterItem.topSize;
					}
				}

				//log bottom sizes information
				if(thisRosterItem.waistSize)
				{
					if(!sizesNeeded.bot)
					{
						sizesNeeded.bot = {};
						sizesNeeded.bot[thisRosterItem.waistSize] = thisRosterItem.waistSize;
					}
					else
					{
						sizesNeeded.bot[thisRosterItem.waistSize] = thisRosterItem.waistSize;
					}
				}

			}
			
			garment.sizes = sizesNeeded;
		
			return localValid
		}

		//getSizes Function Description
		//take the garment.sizes object and determine whether adult, youth or both
		//scripted templates are needed.
		function getSizes(sizes)
		{
			var localValid = true;
			
			var result = {adult:false,youth:false};

			switchSizes(sizes.top,result);
			switchSizes(sizes.bot,result);

			

			//switchSizes Function Description
			//check the sizes needed and set boolean values as necessary
			function switchSizes(sizeObj,result)
			{
				var localValid = true;
				
				if(sizeObj == null)
				{
					localValid = false;
				}
				if(localValid)
				{
					for(var size in sizeObj)
					{
						if(result.adult && result.youth)
						{
							break;
						}
						switch(size)
						{
							case "Y2XS":
							case "YXXS":
							case "YXS":
							case "YS":
							case "YM":
							case "YL":
							case "YXL":
							case "Y2XL":
							case "Y3XL":
								result.youth = true;
								break;

							case "XS":
							case "S":
							case "M":
							case "L":
							case "XL":
							case "2XL":
							case "XXL":
							case "3XL":
							case "XXXL":
							case "4XL":
							case "XXXXL":
							case "5XL":
							case "XXXXXL":
								result.adult = true;
						}
					}
				}
				return localValid
			}
			
			
			garment.adult = result.adult;
			garment.youth = result.youth;
		
			return localValid
		}


		//////////////////
		//Legacy Version//
		////Do Not Use////
		//////////////////

			// 	//commenting the below in favor of using the existing style number information in the JSON data
			// 	//style number located here:
			// 	//json.config.[top|bottom].styleNo

			//getStyleNum Function Description
			//extract the style number from the nameString and
			//add the style number to the garment object
			//nameString could be the garment code or a graphic code
			//ex. FD-FAST-2B-SS-1066 or FDSP-1032
			// function getStyleNum(nameString)
			// {
			// 	var localValid = true;

			// 	//format of styleNum should be 3 or 4 digits only
			// 	// var correctFormat = /\d{3,4}/;

			// 	// try
			// 	// {
			// 	// 	var styleNum = nameString.substring(nameString.lastIndexOf("-") + 1, nameString.length);
			// 	// 	if(correctFormat.test(styleNum))
			// 	// 	{
			// 	// 		garment.styleNum = styleNum;
			// 	// 	}
			// 	// 	else
			// 	// 	{
			// 	// 		errorList.push("Style number was not returned in the proper format.");
			// 	// 		log.e("Style number didn't match the correct format.::styleNum was returned as: " + styleNum);
			// 	// 		localValid = false;
			// 	// 	}
						
			// 	// }
			// 	// catch(e)
			// 	// {
			// 	// 	errorList.push("Failed to properly read the style number from the builder info. =(")
			// 	// 	log.e("styleNum could not be determined properly.::argument passed to function was " + nameString + "::and the returned result was " + styleNum);
			// 	// 	localValid = false;
			// 	// }

			
			// 	return localValid;
			// }

		//////////////////
		//Legacy Version//
		////Do Not Use////
		//////////////////


		//getStyleNum Function Description
		//read the json data and pull out the stylenum
		function getStyleNum(topbot)
		{
			var localValid = true;
		
			
			//Try/Catch Description:
			//try to pull the style number from builder json data
			try
			{
				garment.styleNum = lib.json.config[topbot].styleNo;
				if(garment.styleNum == undefined)
				{
					log.e("styleNum was returned undefined.");
					errorList.push("Failed to correctly identify the style number for " + json.config[topbot].garment + ".");
					localValid = false;
				}

			}
			catch(e)
			{
				errorList.push("Failed to correctly identify the style number for " + json.config[topbot].garment + ".");
				log.e("Try statement failed. Proceeded to catch.::Failed to correctly identify the styleNumber.::Did not find a styleNo property in json." + topbot + ".styleNo");
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
			
			
			
		
		
			return localValid;
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
				case "FD-163W/FD-161W":
				case "FD-163Y/FD-161Y":
				case "FD-163/FD-161":
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
					break;

				default:
					garment.sport = undefined;
			}


			
			if(!garment.sport)
			{	

				//prompt user for correct Sport
				var userInput = prompt("Enter the sport.", "eg. DIAMOND SPORTS or SPIRITWEAR");

				log.e("****NOT A FATAL ERROR****::Please add " + garment.bmCode + " to getSport switch statement.")
				log.h("bmCode did not match any of the cases in the switch statement.::bmCode used was " + garment.bmCode + 
						"::Prompted user for sport and they typed " + userInput);

				userInput = userInput.toUpperCase();

				var possibleSports = ["ACCESSORIES","BAGS","BASKETBALL","COMPRESSION","DIAMOND SPORTS","FOOTBALL","LACROSSE","SOCCER","SPIRITWEAR","VOLLEYBALL"];

				var validInput = false;

				for(var ps=0;ps<possibleSports.length;ps++)
				{
					var thisSport = possibleSports[ps];
					if(userInput == thisSport)
					{
						validInput = true;
						break;
					}
				}

				if(validInput)
				{
					garment.sport = userInput;
					alert(garment.sport);
				}
				else
				{
					errorList.push("Couldn't determine the correct sport subfolder.");
					log.e("Could not correctly identify the sport folder.");
					localValid = false;
				}
				
				
			}
		
		
			return localValid;
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
					errorList.push("None of the folders inside this sport folder matched the sdesired BM Code.");
					log.e("The bmCode: " + garment.bmCode + " was not found in the sport folder: " + garment.sport);
					localValid = false;
				}
				else if(codeMatches.length > 1)
				{
					//do something to determine the correct code
					//this condition will occur when the code is "FD-161" and there also exist folders
					//folders named "FD-161W" and "FD-161Y"


					//////////////////
					//Legacy Version//
					////Do Not Use////
					//////////////////
						//commenting these lines in favor of testing with a dialog that allows the user to select the correct folder path
						//eventually this should be done automatically
						// errorList.push("There are multiple folders that match that BM Code.");
						// log.e("there are multiple folders in the sport folder that contain the BM Code " + garment.bmCode);
						// localValid = false;


						//commenting this dialog function in favor of an automatic solution
						// garment.folder = (whichOptionDialog(codeMatches,"Please select the correct garment."));
					//////////////////
					//Legacy Version//
					////Do Not Use////
					//////////////////

					//loop the codeMatches array and get the substring from
					//0 to first index of an underscore and see if that matches garment.bmCode;
					//if so that's the correct directory
					for(var cm=0;cm<codeMatches.length;cm++)
					{
						var thisMatch = codeMatches[cm];
						if(thisMatch.name.substring(0,thisMatch.name.indexOf("_")) == garment.bmCode)
						{
							garment.folder = thisMatch;
							log.l("set the garment.folder property to: " + garment.folder);
						}
						else if(thisMatch.name.substring(0,thisMatch.name.indexOf("_")) == garment.bmCode +"Y")
						{
							log.l("There was a youth folder for the bm code: " + garment.bmCode);
							garment.youthFolder = thisMatch;
							log.l("Saved the following folder to the garment.youthFolder property: " + garment.youthFolder);
						}
					}

					if(garment.folder == undefined)
					{
						localValid = false;
						errorList.push("Couldn't identify the correct Converted_Templates Folder. Please try again.");
						log.e("User cancelled whichOptionDialog. Exiting script.");
					}
				}
			}
			catch(e)
			{
				errorList.push("Failed to find the correct garment folder inside the sport folder.");
				log.e("Failed to find the correct garment folder inside the sport folder.");
			}
		
		
			return localValid;
		}



		//getConvertedTemplateFile Function Description
		//verify the existence of a proper converted template file
		//if exists, save it to the garment object
		//else throw an error.
		function getConvertedTemplateFile()
		{
			var localValid = true;

			var cont = true;
			var bmCode = garment.bmCode;

			while(cont)
			{
				
				var sportFolder = garment.folder;
				var files = sportFolder.getFiles();

				//array to hold the directories inside sportFolder that
				//are converted templates folders.
				var convertedFolders = [];

				//variable to hold the converted templates folder
				var ctFolder;

				//check to make sure there's a converted template folder
				for(var ct=0;ct<files.length;ct++)
				{
					var thisFile = files[ct];
					if(thisFile.name.indexOf("onverted")>-1)
					{
						convertedFolders.push(thisFile);
					}
				}

				if(convertedFolders.length == 0)
				{
					//no converted templates folder found
					errorList.push("There is no converted templates folder here. It appears this garment has not yet been converted.");
					log.e("There is no converted templates folder for " + garment.name + ". Most likely this means the garment has not been converted.");
					localValid = false;
				}
				else if(convertedFolders.length > 1)
				{
					//too many converted temlpates folders found
					errorlist.push("There is more than 1 converted templates folder for the garment: " + garment.name);
					errorList.push("Please determine the correct converted templates folder and remove the incorrect one, then try again.");
					log.e("There is more than 1 converted templates folder for garment: " + garment.name);
					localValid = false;
				}
				else
				{
					//one converted templates folder exists
					//set the ctFolder variable to this folder
					ctFolder = convertedFolders[0];
				}

				if(localValid)
				{
					files = ctFolder.getFiles();

					//array to hold files that match the style number
					var fileMatches = [];

					//loop the file sin the ctFolder to find those that match the style number
					//and push results to fileMatches array.
					for(var ctf=0;ctf<files.length;ctf++)
					{
						var thisFile = files[ctf];

						//this condition is for 4 digit style numbers
						if(thisFile.name.substring(thisFile.name.lastIndexOf("_")+1,thisFile.name.length - 4) == garment.styleNum)
						{
							fileMatches.push(thisFile);
						}

						//if the above is false, we'll try to find a file that doesn't include the leading 1 in the style number
						//eg instead of searching for FD-161_1003.ait we'll look for a file called FD-161_003.ait
						else if(thisFile.name.substring(thisFile.name.lastIndexOf("_")+1,thisFile.name.length - 4) == garment.styleNum.substring(1,garment.styleNum.length))
						{
							fileMatches.push(thisFile);
						}
					}

					if(fileMatches.length == 1)
					{
						garment.ctFile = fileMatches[0];
					}
					else if(fileMatches.length == 0)
					{
						errorList.push("No converted template file was found for the garment: " + garment.bmCode + "_" + garment.styleNum);
						log.e("No converted template file was found for the garment: " + garment.bmCode + "_" + garment.styleNum + 
							"::Searched for file in this directory: " + garment.folder + "/" + ctFolder.name);
						localValid = false;
					}
					else if(fileMatches.length > 1)
					{
						errorList.push("There is more than one converted template file found in the library.");
						log.e("More than one converted template file was found in the ctFolder.::Files found: " + fileMatches);
						localValid = false;
					}
				}
			}

		
		
			return localValid
		}



		//openConvertedTemplate Function Description
		//look for a file in the garment folder that matches the style number
		//if it exists, open it and set docRef = activeDocument
		//if it doens't exist, alert the user and exit.
		
		//commenting this function declaration in favor of one that accepts the validatedInfo object instead
		// function openConvertedTemplate(folder)

		function openConvertedTemplate(validatedInfo)
		{
			var localValid = true;
			
			//////////////////
			//Legacy Version//
			////Do Not Use////
			//////////////////	
				/*
					var containedFiles = folder.getFiles();

					var convertedFolders = [];

					//get converted_templates folder(s) and push to convertedFolders array.
					for(var ct=0;ct<containedFiles.length;ct++)
					{
						var thisFile = containedFiles[ct];
						if(thisFile.name.indexOf("onverted")>-1)
						{
							convertedFolders.push(thisFile);
						}
					}

					//check that the length of convertedFolders is only 1
					//less than 1 means this garment has not yet been converted
					//exactly 1 means we can proceed to open the file
					//more than one means something is awry and we need to figure out which is the correct folder..

					if(convertedFolders.length == 1)
					{
						var styleNumMatches = [];
						ctPath = new Folder(folder + "/" + convertedFolders[0].name);
						containedFiles = ctPath.getFiles();

						//loop each file in the converted templates folder and look for any files
						//that match the style number of the desired garment. push results to styleNumMatches array
						for(var ct=0;ct<containedFiles.length;ct++)
						{
							var thisFile = containedFiles[ct];
							if(thisFile.name.indexOf(garment.styleNum)>-1)
							{
								styleNumMatches.push(thisFile);
							}
						}

						//check the length of styleNumMatches
						//less than 1 means no file that contained the styleNum exists
						//exactly one means we found the file we needed. open it
						//more than 1 means either that the styleNum overlaps the bm code or there are 
						//multiple files with the same style number (reversible jerseys for example);
						if(styleNumMatches.length == 1)
						{
							docRef = open(styleNumMatches[0]);
						}
						else if(styleNumMatches.length == 0)
						{
							errorList.push("There was no file in the converted templates folder that matched the style number " + garment.styleNum);
							log.e("No file with the styleNum " + garment.styleNum + " exists in the converted templates folder.::Searching inside " + ctPath);
							localValid = false;
						}
						else if(styleNumMatches.length > 1)
						{
							errorList.push("There are multiple files in this folder that match that style number.");
							errorList.push("Bear with me. I'm working on how to handle that issue.");
							log.e("There are " + styleNumMatches.length + " files with the style number " + garment.styleNum + "in the converted templates folder.::\
								More logic is necessary to handle this contingency.");
							localValid = false;
						}
					}
				*/
			//////////////////
			//Legacy Version//
			////Do Not Use////
			//////////////////
		
		

			for(var ct in validatedInfo)
			{
				var thisGarment = validatedInfo[ct];
				if(thisGarment.ctFile == undefined)
				{
					errorList.push("No converted template file was found for " + thisGarment.bmCode);
					log.e("No converted template file was found for " + thisGarment.bmCode + "::this error shoudl have been caught in the getConvertedTemplateFile function....");
					localValid = false;
				}
				else
				{
					docRef = open(thisGarment.ctFile);
					log.l("Successfully opened " + thisGarment.bmCode + " converted template.");
				}
			}

			return localValid;

		}


	

	/////////////////////////////
	//Graphic Related Functions//
	/////////////////////////////

		//getGraphics Function Description
		//get the information from each graphic in the lib.json
		//and save the information into garmentGraphics object
		function getGraphics()
		{
			var localValid = true;
		
			try
			{
				var graphicOptions = lib.json.config.graphics;

				for(var prop in graphicOptions)
				{	
					//get the styleNumber for this particular graphic
					var styleNum = prop.substring(prop.lastIndexOf("-")+1, prop.length);
					//check whether a location/placement exists for this graphic
					if(graphicOptions[prop].locations.length == 0)
					{
						log.l("The graphic: " + prop + " did not have any locations associated with it. Skipping this one.");
						continue;
					}
					
					log.l("The graphic: " + prop + " has at least one valid location, checking whether this graphic has already been added to the garmentGraphics object.");

					//check whether this graphic has already been added
					if(prop.toLowerCase().indexOf("fdsp")>-1) 
					{
						log.l("This graphic is a player name. Checking if a player number graphic has already been added to garmentGraphics.::Looking for FDSN-" + styleNum + ".");
						if(garmentGraphics["FDSN-" + styleNum])
						{
							log.l("A player number graphic with that styleNumber already existed. Skipping this graphic.")
							continue;
						}
					}
					else if(prop.toLowerCase().indexOf("fdsn")>-1)
					{
						log.l("This graphic is a player number. Checking if a player name graphic has already been added to garmentGraphics.::Looking for FDSP-" + styleNum + ".");
						if(garmentGraphics["FDSP-" + styleNum])
						{
							log.l("A player name graphic with that styleNumber already existed. Skipping this graphic.")
							continue;
						}
					}


					if(garmentGraphics[prop] == undefined)
					{
						log.l(prop + " did not already exist in the garmentGraphics object. Adding it now.");
						garmentGraphics[prop] = graphicOptions[prop];
						garmentGraphics[prop].styleNum = styleNum;
						log.l("Successfully added " + prop + " to garmentGraphics.");
					}
				}

			}
			catch(e)
			{
				errorList.push("Failed while getting the graphic information from the builder data for designId: " + lib.designNumber);
				errorList.push("Please let William know so he can analyze the data.");
				log.e("Failed to get graphic information from lib.json.::designNumber is: " + lib.designNumber + "::Continuing with execution of script\
					since this is not integral to the function of the other aspects of the script.::System error was: " + e);
			}
		
		
			return localValid;

		}




		//getGraphicPath Function Description
		//determine the path to the directory that holds the graphic
		function getGraphicPath(code,obj)
		{
			var localValid = true;

			var codeOnly = code.substring(0,code.indexOf("-")).toLowerCase();
			var codelc = code.toLowerCase();

			var styleNum = code.substring(code.lastIndexOf("-")+1,code.length);

			var searchTerm;
			
			try
			{
				switch(codeOnly)
				{
					case "fds":
						if(codelc.indexOf("ustom")>-1 || codelc.indexOf("rovided")>-1 || codelc.indexOf("nfile")>-1)
						{
							log.l("This graphic is custom/provided/onfile. It's up to the artist to handle this one.");
							obj.getItYourself = true;
						}
						else{
							obj.folder = new Folder(lib.subGraphicsPath);
							searchTerm = "FDS-" + styleNum;
							log.l("This graphic is a regular stock graphic.'")
						}
						break;
					
					case "fdsp":
					case "fdsn":
						obj.folder = new Folder(lib.subNameNumbersPath);
						searchTerm = "FDSP_FDSN_" + styleNum;
						break;

					case "fdsm":
						obj.folder = new Folder(lib.mascotsPath);
						searchTerm = "fdsm-" + styleNum;
						break;

					default:
						obj.folder = undefined;
				}

				
				if(obj.getItYourself)
				{
					obj.grFile = "getItYourself";
					log.l("This graphic is custom/provided/onfile. User is on their own for this one.");
					// localValid = false;
				}
				else if(obj.folder == undefined)
				{
					errorList.push("The library path for the graphic: " + code + " was returned undefined.");
					log.e(code + " folder path was returned undefined.::codeOnly variable = " + codeOnly);
					localValid = false;
				}

				if(!obj.getItYourself)
				{
					//verify the existence of the graphic in the folder
					//if exists, save the file to the garmentGraphics[current graphic] object

					//array to hold files that match the graphic style number
					var graphicMatches = [];

					var files = obj.folder.getFiles();
					//loop files array to find code matches
					//push results to graphicMatches
					for(var gm=0;gm<files.length;gm++)
					{
						var thisFile = files[gm];
						if(thisFile.name == searchTerm + ".ait")
						{
							graphicMatches.push(thisFile);
						}
					}

					if(graphicMatches.length == 1)
					{
						//only one graphic was found
						//save the file to the graphic object
						obj.grFile = graphicMatches[0];
					}
					else if(graphicMatches.length == 0)
					{
						errorList.push("No graphics in the library matched the code " + code);
						log.e("No graphics in the library matched the code " + code + "::searched in the following directory:::" + obj.folder + "::searchTerm used was: " + searchTerm);
						localValid = false;
					}
					else if(graphicMatches.length > 1)
					{
						errorList.push("There was more than one file in the library that matched the code: " + code);
						log.e("Multiple matches for the graphic: " + code + "::matches are: " + graphicMatches + "::searched in the following directory:::" + obj.folder + "::searchTerm used was: " + searchTerm);
						localValid = false;
					}
				}


			}
			catch(e)
			{
				errorList.push("Failed while trying to determine the library location of the graphic: " + code);
				errorList.push("Please let William know about this error. Then please add the necessary graphic manually until the issue is fixed.");
				log.e("Failed while trying to determine the library location of the graphic: " + code +
					"::Continuing execution of script because this was not integral to the execution of the rest of the script.");

			}
		
		
			return localValid;
		}



	//openGraphics Function Description
	//loop the elements of the garmentGraphics object and open
	//each graphic from it's respective location in the library
	function openGraphics(graphics)
	{
		var localValid = true;

		//////////////////
		//Legacy Version//
		////Do Not Use////
		//////////////////
			//commenting the below in favor of simply opening the file stored
			//in garmentGraphics[thisGraphic].grFile

			// //loop each graphic and determine the correct file to open
			// for (var g in graphics)
			// {
			// 	var graphicMatches = [];
			// 	var theFolder = new Folder(graphics[g].folder);
			// 	var containedFiles = theFolder.getFiles();

			// 	//loop the containedFiles array and look for files that match the graphic code
			// 	for(var gc=0;gc<containedFiles.length;gc++)
			// 	{
			// 		var thisFile = containedFiles[gc];
			// 		if(thisFile.name.indexOf(graphics[g].styleNum)>-1)
			// 		{
			// 			graphicMatches.push(thisFile);
			// 		}
			// 	}

			// 	//check how many matches there were
			// 	//if 1, open the file
			// 	//if 0, report the error and proceed
			// 	//if more than one, report the error and proceed.
			// 	if(graphicMatches.length == 1)
			// 	{
			// 		var theFile = new File(graphics[g].folder + "/" + graphicMatches[0].name)
			// 		graphics[g].openedFile = open(theFile);
			// 	}
			// 	else if(graphicMatches.length == 0)
			// 	{
			// 		//didn't find the correct graphic. logging the error
			// 		errorList.push("Could not find a graphic that matched: " + g);
			// 		log.e("There was no graphic in " + graphics[g].folder + " matching the code: " + g + "::Continuing execution of the script\
			// 			since this is not integral to the execution of the other aspects of the script.");
			// 	}
			// 	else if(graphicMatches.length > 1)
			// 	{
			// 		//too many graphics were found in the folder
					
			// 		//commenting these lines in favor of a dialog to prompt the user for the correct graphic
			// 		// errorList.push("Too many graphics were found in the graphics folder matching the code: " + g)
			// 		// errorList.push("Please let William know about this error and pull the graphic manually until the issue is fixed.")
			// 		// log.e("There were too many matching graphics in the folder.::Continuing execution since this is not integral to the function of the other aspects of the script.");

			// 		log.e("There were too many matching graphics in the folder.::Prompting user for the correct graphic.");

			// 		whichOptionDialog(graphicMatches,"Please select the correct graphic.");
			// 	}
			// }
		//////////////////
		//Legacy Version//
		////Do Not Use////
		//////////////////

		for(var gr in graphics)
		{
			var thisGraphic = graphics[gr];
			if(thisGraphic.getItYourself)
			{
				continue;
			}
			else if(thisGraphic.grFile == undefined)
			{
				errorList.push("The graphic " + thisGraphic.name + " was not found...");
				log.e(thisGraphic.name + " was not found in " + thisGraphic.folder + "::this error should have been caught in the getGraphicPath function....");
				localValid = false;
			}
			else
			{
				docRef = open(thisGraphic.grFile);
				log.l("Sucessfully opened " + thisGraphic.name + " graphic file.");
			}
			
		}
	
	
		return localValid;
	}

	//masterInfoLoop Function Description
	//loop the garmentsNeeded array and get the garment and graphic info for each garment
	//store the result so that the openFiles function can access the data 
	function masterInfoLoop(json)
	{
		var localValid = true;
	
		//begin master loop
		//find all info for top or bottom or both
		for(var ml=0;ml<garmentsNeeded.length;ml++)
		{
			log.l("Beginning execution of master loop number " + (ml + 1));

			//reset garment object to blank object
			garment = {};

			//thisGarment should either be "top" or "bot"
			var thisGarment = garmentsNeeded[ml];

			log.l("thisGarment is " + thisGarment)

			//get stylenumber
			if(localValid)
			{
				log.h("Beginning execution of getStyleNum function.");
				if(getStyleNum(thisGarment))
				{
					log.l("getStyleNum function returned true. Set value of garment.styleNum to " + garment.styleNum)
				}
				else
				{
					localValid = false;
				}
			}

			//get garment name
			if(localValid)
			{
				log.h("Beginning execution of getGarName function.");
				if(getGarName(lib.json.config[thisGarment].garment))
				{
					log.l("getGarName function returned true. Set value of garment.name to " + garment.name);
				}
				else
				{
					localValid = false;
				}
			}



			//get bm code
			if(localValid)
			{
				log.h("Beginning execution of getBMCode function.");
				if(getBMCode())
				{
					log.l("getBMCode function returned true. Set value of garment.bmCode" + garment.bmCode);
				}
				else
				{
					localValid = false;
				}
			}


			if(localValid)
			{
				log.h("Checking to see whether this garment could be either mens or youth.::\
					In which case run another function to determine whether mens, youth or both templates are needed")
				if(findMensOrYouth(garment.bmCode))
				{
					garment.mensOrYouth = true;
					log.l(garment.bmCode + " could be mens or youth. Setting garment.mensOrYouth to " + garment.mensOrYouth);
				}
				else
				{
					log.l(garment.bmCode + " should be a womens or else not offered for mens and youth. Setting garment.mensOrYouth to " + garment.mensOrYouth);	
				}
			}



			if(localValid && garment.mensOrYouth)
			{
				log.h("Beginning execution of checkRoster function.");
				if(checkRoster(json.config.roster))
				{
					log.l("checkRoster function returned true");
					// log.l("garment.mens = " + garment.mens);
					// log.l("garment.youth = " + garment.youth);
					log.l("garment.sizes = " + garment.sizes);
				}
				else
				{
					localValid = false;
				}
			}

			if(localValid && garment.mensOrYouth)
			{
				log.h("Beginning execution of getSizes function.");
				if(getSizes(garment.sizes))
				{
					log.l("getSizes function returned true.");
					log.l("garment.mens = " + garment.mens);
					log.l("garment.youth = " + garment.youth);
				}
				else
				{
					localValid = false;
				}
			}


			//get sport
			if(localValid)
			{
				log.h("Beginning execution of getSport function.");
				if(getSport(garment.bmCode))
				{
					log.l("getSport function returned true. Set value of garment.sport to " + garment.sport);
				}
				else
				{
					localValid = false;
				}
			}


			//get prepress subfolder
			if(localValid)
			{
				log.h("Beginning execution of findGarmentFolder function.")
				if(findGarmentFolder(garment.sport))
				{
					log.l("findGarmentFolder function returned true. Set value of garment.folder to " + garment.folder);
				}
				else
				{
					localValid = false;
				}
			}


			//get converted template file
			if(localValid)
			{
				log.h("Beginning execution of getConvertedTemplateFile function.");
				if(getConvertedTemplateFile())
				{
					log.l("getConvertedTemplateFile function returned true.");
					log.l("A converted template file for the garment " + garment.name + " exists and is located here:::" + garment.path);
				}
				else
				{
					localValid = false;
				}
			}

			//push the validated information to validatedInfo object
			//all information pushed here has been pre validated
			//so there should be no chance of a runtime error when trying
			//to open files from the network.... in theory.
			validatedInfo["garment" + (ml+1)] = garment;	
		}
	
		

		return localValid;
	}


	/////////////////////
	//Generic Functions//
	/////////////////////

		//whichOptionDialog Function Description
		//take the matches array (which contains more than 1 item)
		//and create a dialog to prompt the user for the correct item
		function whichOptionDialog(matches, msg)
		{
		
			var result;

			var buttons = [];

			//create the dialog window
			var w = new Window("dialog", msg)
				var txt = w.add("statictext", undefined, msg);
				
				var btnGroup = w.add("group");
				btnGroup.orientation = "column";

				for(var num=0;num<matches.length;num++)
				{
					makeButton(matches[num].name,num)
				}

				var cancel = btnGroup.add("button", undefined, "Cacnel");
					cancel.onClick = function()
					{
						result = null;
						w.close();
					}
			w.show();

				
			//makeButton Function Description
			//generic button maker to use
			//inside loop
			function makeButton(txt,num)
			{
				buttons[num] = btnGroup.add("button", undefined, txt);
				buttons[num].onClick = function()
				{
					result = matches[num];
					w.close();
				}
			}


			return result;
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

	var garmentsNeeded = [];
	var graphicsNeeded = [];

	var garment = {};

	var garmentGraphics = {};

	//this object holds the compiled objects for each necessary garment.
	//the info has been validated and 
	var validatedInfo = {};

	var errorList = [];

	var valid = true;

	var docRef;


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

	//log the beginning of the script
	log.h("Beginning execution of Build_Mockup script.::Version: " + scriptVersion);
	//set logDest variable to buildMockLog
	logDest = buildMockLog;

	/////////////////////
	////TEST FUNCTION////
	/////////////////////

		// valid = testFunction();
		// sendErrors(errorList);
		// printLog();
		// return valid;

	/////////////////////
	////TEST FUNCTION////
	/////////////////////




	///////////////////////////////////////////////
	//search for design number and read json data//
	///////////////////////////////////////////////

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
			log.h("Beginning execution of preValidate function.");
			if(preValidate(lib.json))
			{
				log.l("preValidate function returned true.");
				log.l("garmentsNeeded array = " + garmentsNeeded);
			}
			else
			{
				valid = false;
			}
		}
	

	//////////////////////////////////////////////////////////////////////
	//loop the garmentsNeeded array and get info for each needed garment//
	//////////////////////////////////////////////////////////////////////

		//double check to make sure that at least one garment is found.
		//this should have been checked in the validation function, but just to be safe..
		if(garmentsNeeded.length < 1)
		{
			valid = false;
			log.e("No garments were found in the json data.::preValidate function did not catch this error for some reason....");
		}
		else if(valid)
		{
			log.h("json data has been read and validated.::Beginning master loop to find info " +
					"for each garment.");
			if(masterInfoLoop(lib.json))
			{
				log.l("masterInfoLoop function returned true. All garment info has been successfully obtained.");
			}
			else
			{
				valid = false;
			}
		}



	///////////////////////////
	//get graphic information//
	///////////////////////////

		//get graphics
		if(valid)
		{
			log.h("Beginning execution of getGraphics function.");
			if(getGraphics())
			{
				log.l("getGraphics function returned true.");
				for(var graphic in garmentGraphics)
				{
					log.l("Added " + garmentGraphics[graphic].name + " to garmentGraphics object.");
				}
			}
			else
			{
				valid = false;
			}
		}


		//get graphic path
		if(valid)
		{
			log.h("Beginning loop to get location of each graphic application.")

			for(var gl in garmentGraphics)
			{
				log.h("Beginning execution of getGraphicPath function for graphic: " + gl);
				if(getGraphicPath(gl,garmentGraphics[gl]))
				{
					log.l("getGraphicPath function for " + gl + " returned true. Set garmentGraphics[" + gl + "].folder to " + garmentGraphics[gl].folder);
				}
				else
				{
					valid = false;
				}
			}
		}


	/////////////////////////////
	//open files function calls//
	/////////////////////////////

		if(valid)
		{
			log.h("Beginning execution of openConvertedTemplate function.");
			if(openConvertedTemplate(validatedInfo))
			{
				log.l("openConvertedTemplate function returned true. The necessary document has been opened and saved into the docRef variable.")
			}
			else
			{
				valid = false;
			}
		}

		if(valid)
		{
			log.h("Beginning execution of openGraphics function.");
			if(openGraphics(garmentGraphics))
			{
				log.l("openGraphics function returned true. The necessary documents have been opened.")
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