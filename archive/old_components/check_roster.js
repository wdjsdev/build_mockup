/*
	Component Name: check_roster
	Author: William Dowling
	Creation Date: 13 March, 2017
	Description: 
		checkRoster Function Description
		read the garment code and determine whether the script 
		should attempt to determine whether to check for
		mens or youth sizes needed based on roster.
		if roster has no players, prompt the user
	Arguments
		garment object
			this will be the "top" or "bottom" object for the current config object
		thisGarment
			a string representing the current garment (top or bottom or perhaps arm sleeve or something in the future?)
		prop
			a string representing the current config object (config or configReverse)
	Return value
		success boolean

*/


function checkRoster(garObj,thisGarment,prop)
{
	log.l("::Beginning execution of checkRoster function on " + prop + "." + thisGarment);
	//boolean to decide whether or not to look
	//at roster info to determine mens/youth/both
	var lookAtRoster = false;
	var result = true;

	var garmentCode = garObj.garmentCode;
	log.l("Beginning switch statement with garmentCode: " + garmentCode);
	//list all of the garments that could be mens or youth....
	//if the garmentCode matches any of these,
	//then search the roster for size info and determine
	//whether mens, youth, or both are needed.
	switch(garmentCode)
	{
		//basketball
		case "FD-137":
		case "FD-210":
		case "FD-211":
		case "FD-215":
		case "FD-217":
		case "FD-622":
		case "FD-215_FD-219":

		//compression
		case "FD-410":
		case "FD-412":
		case "FD-415":
		case "FD-420":
		case "FD-425":
		case "FD-430":

		//diamond sports
		
		//removing FD-1000 because builder
		//already differentiates between mens and youth
		// case "FD-1000":
		case "FD-161":
		case "FD-163":
		case "FD-230":
		case "FD-233":
		case "FD-234":
		case "FD-3417":
		case "FD-609":

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
		case "FD-1874":
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

		case "FD-5014":
			garments[gar].adult = true;
			break;
		
		case "FD-5014Y":
			garments[gar].youth = true;
			garments[gar].garmentCodeYouth = garmentCode;
			break;
	}

	if(lookAtRoster)
	{
		var roster = lib.json[prop].roster;
		
		//check whether this is the inside of a reversible uniform
		//in which case it will not have a roster object.
		if(lib.reversible && prop == "configReverse")
		{
			log.l("This is the inside of a reversible. there will be no roster object.::Using the data collected on the outside of the uniform.");
			garObj.adult = lib.adult;
			garObj.youth = lib.youth;
		}
		
		else if(!roster || roster.length == 0)
		{
			log.l("lookAtRoster = true.");
			//garment could be adult or youth.
			//check the roster 
			log.l("Unable to automatically determine roster info.::Prompting user.");
			var usrInput = promptForNeeded(garmentCode);
			if(!usrInput)
			{
				log.e("User cancelled promptForNeeded dialog.::Unable to identify adult or youth garments needed.");
				result = false;
			}
			else
			{
				msgList.push("Sorry you had to see the dialog box regarding whether you needed mens or youth...");
				msgList.push("My shame will live eternally.")
				log.l("promptForNeeded function returned the following values: ::adult: " + usrInput.adult + "::youth: " + usrInput.youth);
				garObj.adult = usrInput.adult;
				garObj.youth = usrInput.youth;
				lib.adult = usrInput.adult;
				lib.youth = usrInput.youth;

			}
		}
		else
		{
			for(var r=0;r<roster.length;r++)
			{
				var thisPlayer = roster[r];
				if(garObj.adult && garObj.youth)
				{
					break;
				}
				if(thisGarment == "top")
				{
					var size = thisPlayer.topSize;
				}
				else if(thisGarment == "bottom")
				{
					var size = thisPlayer.waistSize;
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
						garObj.youth = true;
						lib.youth = true;
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
						garObj.adult = true;
						lib.adult = true;
						break;

					default:
						log.e("The size " + size + " was not found in the switch statement.");
				}
			}
		}
	}
	else
	{
		log.l("lookAtRoster = false.");
		garObj.adult = true;
		lib.adult = true;
	}


	function promptForNeeded(garmentCode)
	{
		log.h("Beginning excution of promptForNeeded function.")
		var usrInput = {};

		//variable to determine whether the user really wants to cancel.
		//when they press cancel once, this variable will be set to true
		//then if they press cancel again, function will return null and script will exit.
		var clickedCancel = false;

		//open a scriptUI dialog that contains checkboxes for
		//adult and youth. User will select one or both
		//return value is an object containing booleans for adult and youth

		var w = new Window("dialog","Check the sizes needed: " + garmentCode);
			var txtGroup = w.add("group");
				var topTxt = txtGroup.add("statictext", undefined, "Please check the boxes for the sizes needed:");
			var chkBoxGroup = w.add("group");
				var aBox = chkBoxGroup.add("checkbox", undefined, "Adult");
					aBox.value = true;
				var yBox = chkBoxGroup.add("checkbox", undefined, "Youth");

			var errMsgGroup = w.add("group");

			var btnGroup = w.add("group");
				var submit = btnGroup.add("button", undefined, "Submit");
					submit.onClick = function()
					{
						if(!aBox.value && !yBox.value)
						{
							var err = "You must select at least one option.";
							if(errMsgGroup.subGroup)
							{
								rmError(errMsgGroup);
							}
							displayError(err,errMsgGroup);
						}
						else
						{
							usrInput.adult = aBox.value;
							usrInput.youth = yBox.value;
							log.l("User clicked submit.::aBox.value= " + aBox.value + "::yBox.value = " + yBox.value);
							w.close();
						}
					}
				var cancel = btnGroup.add("button", undefined, "Cancel");
					cancel.onClick = function()
					{
						log.l("User clicked cancel in promptForNeeded dialog.");
						if(!clickedCancel)
						{
							log.l("This is the first time the user cancelled. Prompting them to confirm the decision to cancel.");
							clickedCancel = true;
							if(errMsgGroup.subGroup)
							{
								rmError(errMsgGroup);
							}

							var msg = "Are you sure you want to cancel?";
							displayError(msg,errMsgGroup);
						}
						else
						{
							log.l("User clicked cancel for a second time.");
							usrInput = null;
							w.close();
						}
					}
		w.show();

		log.l("End of promptForNeeded function. Returning: ::usrInput.adult = " + usrInput.adult + "::usrInput.youth = " + usrInput.youth);
		return usrInput;


		function rmError(eGroup)
		{
			var err = eGroup.subGroup.errorMsg;
			eGroup.remove(err.parent);
			w.layout.layout(true);
		}

		function displayError(msg,eGroup)
		{
			// errMsgGroup.remove(eGroup.parent);
			eGroup.subGroup = eGroup.add("group");
			eGroup.subGroup.errorMsg = eGroup.subGroup.add("statictext", undefined, msg);
			w.layout.layout(true);
		}

	}

	log.l("End of checkRoster function. Returning " + result);
	log.l("Values set to: ::garObj.adult = " + garObj.adult + "::garObj.youth = " + garObj.youth);

	return result;
}