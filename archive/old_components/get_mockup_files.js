/*
	Component Name: get_mockup_files
	Author: William Dowling
	Creation Date: 15 March, 2017
	Description: 
		get the file paths to the mockup files for the necessary garmentCodes
		update the garmentFolder properties in the garments object
	Arguments
		
	Return value
		

*/

function getMockupFiles(garments)
{
	log.h("Beginning execution of getMockupFiles function.");
	var result = true;
	var garmentCode;
	var folder;
	var authentic = false;

	var mockupsAdded = 0;

	//loop each garment
	for(gar in garments)
	{
		log.l("Beginning loop for " + gar);
		if(!garments[gar])
		{
			log.l("garments." + gar + " not needed. skipping it.")
			continue;
		}

		//set the style number
		var styleNum = garments[gar].styleNum;

		//loop once for each possible "size"
		var possibleSizes = ["adult","youth"];
		for(var ay=0;ay<possibleSizes.length;ay++)
		{
			var thisSize = possibleSizes[ay];
			log.l("Beginning loop for " + thisSize + " " + gar);
			if(!garments[gar][thisSize])
			{
				log.l("garments." + gar + "." + thisSize + " not needed.");
				continue;
			}

			//determine whether we're looking or adult or youth to properly set the folder
			switch(thisSize)
			{
				case "adult":
					folder = garments[gar].adultFolder;
					garmentCode = garments[gar].garmentCode;
					break;
				case "youth":
					folder = garments[gar].youthFolder;
					garmentCode = garments[gar].garmentCodeYouth;
					break;

				default :
					errorList.push("Failed while getting the mockup file for the " + thisSize + " " + garments[gar].garmentCode);
					log.e("Swich statement failed while trying to get adult or youth.::thisSize = " + thisSize);
					continue;
			}

			//get the sport and set the folder location
			var sport = getSport(garmentCode);

			if(!sport)
			{
				// result = false;
				log.e("sport was not identified. Skipping this garment.");
				errorList.push("Could not identify the mockup files folder for " + garmentCode);
				errorList.push(garmentCode + " has been skipped.");
				continue;
			}
			else
			{
				folder = new Folder(lib.prepressPath + sport);
			}





			log.l("Successfully set sport folder to " + folder + "::Now attempting to find a folder that matches " + garmentCode);

			//check the folder for a subfolder matching the garmentCode
			
			if(garmentCode.indexOf("BM")==0)
			{
				folder = new Folder(folder + "/Authentic");
				authentic = true;
				log.l("This garment is an authentic garment.::Successfully set the garment folder to: " + folder);
				//updating styleNum to include a hyphen between the BM and the actual style number.
				styleNum = "BM-" + styleNum.substring(styleNum.indexOf("BM")+2,styleNum.length);
			}
			else
			{
				var folderMatches = getMatches(folder,garmentCode + "_");


				//check whether folderMatches.length > 1.
				//if so, prompt the user for the correct one.
				if(folderMatches.length>1)
				{
					var msg = "Please select the correct folder.";
					var usrInput = usrPrompt(folderMatches,msg,garmentCode);
					if(!usrInput)
					{
						log.e("usrPrompt function returned undefined.::User cancelled dialog.::Skipping this garment");
						folder = undefined;
						continue;
					}
					else
					{
						folder = new Folder(folder + "/" + usrInput);
						log.l("successfully set folder to: " + folder);
					}
				}
				else if(folderMatches.length == 0)
				{
					log.e("Found no folder matches for " + garmentCode + " in foler: ::" + folder);
					log.l("prompting user for correct garment folder.");
					var msg = "Please select the correct folder for " + garmentCode;
					var folderContents = folder.getFiles();
					var usrInput = usrPrompt(folderContents,msg,garmentCode);

					//validate the result
					if(!usrInput)
					{
						log.e("usrPrompt returned undefined.::User cancelled dialog.::Skipping " + garmentCode);
						errorList.push("Sorry. Couldn't determine the correct folder location for " + garmentCode);
						errorList.push(garmentCode + " has been skipped.");
						continue;
					}
					else
					{
						// folder = new Folder(folder + "/" + usrInput);
						folder = new Folder(usrInput);
						log.l("successfully set folder to: " + folder);
					}
				}
				else
				{
					// folder = new Folder(folder + "/" + folderMatches[0].name);
					folder = folderMatches[0];
					log.l("successfully set folder to: " + folder);
				}
			}






			log.l("Successfully set garment folder for " + garmentCode);

			if(!authentic)
			{
				log.l("Garment is not authentic. Looking for a Mockups folder or Converted Templates folder.");
				folderContents = folder.getFiles();
				folderMatches = getMatches(folder,"onvert")

				if(folderMatches.length == 0)
				{
					mockupFolderMatches = getMatches(folder,"ockup");
					if(mockupFolderMatches.length == 0)
					{
						log.e("No converted templates folder was found for " + garmentCode);
						errorList.push("Sorry. No converted templates folder was found for " + garmentCode + ".");
						continue;
					}
					else if(mockupFolderMatches.length > 1)
					{
						log.l("More than one mockup folder found. Prompting user for correct one.");
						var msg = "Please select the correct Mockups folder.";
						var usrInput = usrPrompt(mockupFolderMatches,msg,garmentCode)
					}
					else
					{
						folder = mockupFolderMatches[0];
						log.l("Only one mockup folder found. setting folder to: " + folder + ".");
					}
				}
				else if(folderMatches.length > 1)
				{
					log.l("More than one converted templates folder found. Prompting user.");
					var msg = "Please select the correct Converted Templates folder.";
					var usrInput = usrPrompt(folderMatches,msg,garmentCode);

					//validate input
					if(!usrInput)
					{
						log.e("usrPrompt returned undefined.::User cancelled dialog.::skipping " + garmentCode);
						errorList.push("Sorry. Couldn't determine the correct converted templates folder for " + garmentCode);
						errorList.push(garmentCode + " has been skipped.");
						continue;
					}
					else
					{
						folder = new Folder(folder + "/" + usrInput);
						log.l("successfully set folder to " + folder);
					}
				}
				else
				{
					// folder = new Folder(folder + "/" + folderMatches[0]);
					folder = folderMatches[0];
					log.l("successfully set folder to " + folder);
				}

				log.l("Successfully set mockups folder for " + garmentCode + "::Now attempting to find a mockup file.");
			}
			else
			{
				log.l("Garment is authentic. Using current folder instead of looking for a mockup folder or converted templates folder.")
			}


			var mockMatches = getMatches(folder,styleNum);

			if(mockMatches == null)
			{
				errorList.push("There was a problem getting a mockup for " + garmentCode + "_" + styleNum);
				errorList.push("There were no files or folders found in " + folder);
				errorList.push("This either means the wrong folder was searched, or the necessary files are missing.");
				log.e("No files or folders found in " + folder);
				continue;
			}

			if(mockMatches.length == 0 || mockMatches.length > 1)
			{
				log.e("Mockup file was not automatically found for " + garmentCode + "_" + styleNum + ". Prompting user.");
				var msg = "Please select the correct Mockup file for: " + garmentCode + "_" + styleNum;
				if(mockMatches.length > 1)
				{
					var usrInputMockup = usrPrompt(mockMatches,msg,garmentCode);
				}
				else if(mockMatches.length == 0 )
				{
					var usrInputMockup = usrPrompt(folder.getFiles(),msg,garmentCode);
				}

				//validate user input
				if(!usrInputMockup)
				{
					log.e("userPrompt returned undefined. User cancelled dialog. Skipping " + garmentCode);
					errorList.push("Sorry. Coudldn't determine the mockup file for " + garmentCode);
					errorList.push(garmentCode + " has been skipped.");
					garments[gar][thisSize + "Mockup"] = null;
					continue;
				}
				else
				{
					//usrPropmt returns a string
					//need to convert it to a file object
					usrInputMockup = new File(usrInputMockup);
					garments[gar][thisSize + "Mockup"] = usrInputMockup;
					log.l("Successfully set the mockup file for " + garmentCode + " to " + usrInputMockup);
					mockupsAdded++;
				}
			}
			else
			{
				garments[gar][thisSize + "Mockup"] = mockMatches[0];
				mockupsAdded++;
			}


			lib.filesToOpen.push(garments[gar][thisSize + "Mockup"]);

		}

		
	}




	//validate the output.
	//if no mockups were successfully set,
	//log the error, but don't return false.
	//Script should continue on and open up graphics if possible, 
	//even if no mockups are opened.
	if(mockupsAdded == 0)
	{
		log.e("No mockups were found.");
		errorList.push("Sorry. It looks like no mockup files were found for this design number.");
		errorList.push("Please let William know about this issue.");
	}

	//getSport Function Description
	//Determine which prepress subfolder to use for the given garmentCode
	function getSport(garmentCode)
	{
		var sport;

		var sports = ["ACCESSORIES","BAGS","BASKETBALL","COMPRESSION","DIAMOND SPORTS","FOOTBALL","LACROSSE","SOCCER","SPIRITWEAR","VOLLEYBALL"];

		switch(garmentCode)
		{
			case "FD-137W":
			case "FD-137Y":
			case "FD-137":
			case "FD-210":
			case "FD-210Y":
			case "FD-211":
			case "FD-211Y":
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
				sport = "BASKETBALL";
				break;

			case "FD-105":
			case "FD-4054W":
			case "FD-4061W":
			case "FD-410":
			case "FD-410Y":
			case "FD-412":
			case "FD-412Y":
			case "FD-415":
			case "FD-415Y":
			case "FD-420":
			case "FD-420Y":
			case "FD-425Y":
			case "FD-430Y":
			case "FD-430":
			case "FD-436":
			case "FD-5038W":
			case "FD-5071":
			case "FD-5072W":
			case "FD-5074Y":
			case "FD-750W":
			case "FD-751W":
			case "FD-752W":
			case "FD-753W":
				sport = "COMPRESSION";
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
			case "PS-5075":
			case "BM-235":
			case "BM-236":
			case "BM-3401":
			case "BM-3402":
			case "BM-3403":
			case "BM-3404":
			case "BM-3405":
			case "BM-3406":
			case "BM-3407":
			case "BM-3408":
			case "BM-3409":
			case "BM-3410":
			case "BM-3411":
			case "BM-3412":
			case "BM-3413":
			case "BM-3414":
			case "BM-3415":
			case "BM-3416":
			case "BM-3417":
			case "BM-3418":
			case "BM-3419":
			case "BM-4401W":
			case "BM-4402W":
			case "BM-4403W":
			case "BM-4404W":
			case "BM-4405W":
			case "BM-4406W":
			case "BM-4407W":
			case "BM-4408W":
			case "BM-4409W":
			case "BM-4410W":
			case "BM-4411W":
			case "BM-4412W":
			case "BM-4413W":
			case "BM-4414W":
			case "BM-4415W":
			case "BM-4416W":
			case "BM-4417W":
			case "BM-4418W":
			case "BM-4419W":
			case "BM-4420W":
			case "BM-500T":
			case "BM-501S":
			case "BM-501T":
			case "BM-502T":
			case "BM-503T":
			case "BM-504T":


				sport = "DIAMOND SPORTS";
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
			case "BM-5401":
			case "BM-5402":
			case "BM-5403":
			case "BM-5404":
			case "BM-5405":
			case "BM-5406":
			case "BM-5407":
			case "BM-5408":
			case "BM-5409":
			case "BM-5801":
			case "BM-5802":
			case "BM-5803":
			case "BM-5804":
			case "BM-5805":
			case "BM-5806":
			case "BM-5807":
			case "BM-5808":
			case "BM-5809":
				sport = "FOOTBALL";
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
				sport = "LACROSSE";
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
				sport = "SOCCER";
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
			// case "FD-211Y":
			// case "FD-211":
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
			case "BM-162W":
			case "BM-162":
			case "BM-163W":
			case "BM-163":
			case "BM-3001W":
			case "BM-3001":
			case "BM-3002":
			case "BM-3085":
			case "BM-3099W":
			case "BM-3099":
			case "BM-3100W":
			case "BM-3100":
			case "BM-3111":
			case "BM-340W":
			case "BM-340":
			case "BM-342":
			case "BM-345W":
			case "BM-345":
			case "BM-346":
			case "BM-4025":
			case "BM-4026":
			case "BM-4027":
			case "BM-4028":
			case "BM-4029":
			case "BM-4030":
			case "BM-4045":
			case "BM-466":
			case "BM-475":
			case "BM-477W":
			case "BM-477":
			case "BM-487W":
			case "BM-487":
			case "BM-593W":
			case "BM-593":
			case "BM-594W":
			case "BM-594":
			case "BM-595":
			case "BM-596W":
			case "BM-596":
			case "BM-6000":
			case "BM-6001W":
			case "BM-6003":
			case "BM-6017W":
			case "BM-6017":
			case "BM-6019":
			case "BM-6025W":
			case "BM-6025":
			case "BM-6027":
			case "BM-6043":
			case "BM-6061W":
			case "BM-6061":
			case "BM-609":
			case "BM-611W":
			case "BM-611":
			case "BM-652":
			case "BM-659":
			case "BM-682W":
			case "BM-682":
			case "BM-706W":
			case "BM-807W":
			case "BM-807":
			case "BM-842W":
			case "BM-842":
			case "BM-862W":
			case "BM-862":
			case "BM-868W":
			case "BM-868":
			case "BM-869W":
			case "BM-869":
			case "BM-872W":
			case "BM-872":
				sport = "SPIRITWEAR";
				break;

			case "FD-281":
			case "FD-3003":
			case "FD-3184W":
			case "FD-3185W":
				sport = "VOLLEYBALL";
				break;

			default:
				sport = undefined;
		}

		if(!sport)
		{	
			log.e("****NOT A FATAL ERROR****::Please add " + garmentCode + " to getSport switch statement.");
			log.l("sport was not automatically determined. prompting user for the correct sport.");

			var msg = "Please select the correct sport corresponding to: " + garmentCode;
			

			usrPrompt(sports,msg,garmentCode);
			
			//deprecated
			//using the above usrPrompt function call instead
				// var clickedCancel = false;

				// var w = new Window("dialog","Select sport.");
				// 	var txtGroup = w.add("group");
				// 		var topTxt = txtGroup.add("statictext", undefined, "Select the sport corresponding to: " + garmentCode);
					
				// 	var boxGroup = w.add("group");
				// 		var box = boxGroup.add("listbox", undefined, sports);
				
				// 	var errMsgGroup = w.add("group");
				
				// 	var btnGroup = w.add("group");
				// 		var submit = btnGroup.add("button", undefined, "Submit");
				// 			submit.onClick = function()
				// 			{
				// 				if(!box.selection)
				// 				{
				// 					log.l("user submitted the form without selecting a sport.::displaying error msg");
				// 					var err = "You must select a sport.";
				// 					if(errMsgGroup.subGroup)
				// 					{
				// 						rmError(errMsgGroup);
				// 					}
				// 					displayError(err,errMsgGroup);
				// 					clickedCancel = false;
				// 				}
				// 				else
				// 				{
				// 					sport = box.selection.text;
				// 					log.l("user selected: " + box.selection.text);
				// 					w.close();
				// 				}
				// 			}
				// 		var cancel = btnGroup.add("button", undefined, "Cancel");
				// 			cancel.onClick = function()
				// 			{
				// 				if(!clickedCancel)
				// 				{
				// 					clickedCancel = true;
				// 					log.l("user clicked cancel.::verifying they really want to quit.");
				// 					var err = "If you cancel, this garment will be ignored if you cancel..";
				// 					if(errMsgGroup.subGroup)
				// 					{
				// 						rmError(errMsgGroup);
				// 					}
				// 					displayError(err,errMsgGroup);
				// 				}
				// 				else
				// 				{
				// 					sport = undefined;
				// 					log.l("user cancelled the dialog. exiting script.");
				// 					w.close();
				// 				}
				// 			}
				// w.show();
				
				// function rmError(eGroup)
				// {
				// 	var err = eGroup.subGroup.errorMsg;
				// 	eGroup.remove(err.parent);
				// 	w.layout.layout(true);
				// }
				
				// function displayError(msg,eGroup)
				// {
				// 	// errMsgGroup.remove(eGroup.parent);
				// 	eGroup.subGroup = eGroup.add("group");
				// 	eGroup.subGroup.errorMsg = eGroup.subGroup.add("statictext", undefined, msg);
				// 	w.layout.layout(true);
				// }

			
			
		}


		return sport;
	}

	
	
	
	return result;
}