/*
	Component Name: get_design_number
	Author: William Dowling
	Creation Date: 07 March, 2017
	Updated: 28 April, 2017
		Adding ability to include multiple design numbers
	Description: 
		Prompt user for a design number
		Validate input
	Arguments
		None
	Return value
		success boolean

*/



//getDesignNumber Function Description
//prompt the user for the design number
//validate the submission on submit
//do not continue unless valid
//on cancel, return undefined
function getDesignNumber()
{
	//result is a validated string containing the design number
	var result = true;

	#include "/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.js";

	var designNumbersArray = [];

	log.h("Beginning execution of getDesignNumber function.");

	//make scriptUI window
	var w = new Window("dialog", "Enter the Design Number:");

		//message group
		var msgGroup = w.add("group");
			var topTxt = msgGroup.add("statictext", undefined, "Please enter the Design Number:");
				topTxt.characters = 50;
				topTxt.justify = "center";

		//designNumbersAdded group
		var dsgnNumGroup = w.add("group");
		
		//errorMessageGroup
		var errMsgGroup = w.add("group");

		//input group
		var inputGroup = w.add("edittext", undefined, "Enter Design Number:");
			inputGroup.characters = 21;
			inputGroup.active = true;
			//add event listener to submit on enter keypress
			inputGroup.addEventListener("keydown",function(k)
			{
				if(k.keyName == "Enter")
				{
					submit();
				}
			});

		//button group
		var btnGroup = w.add("group");
			var addAnother = btnGroup.add("button", undefined, "Add");
				addAnother.onClick = function()
				{
					validate();
				}
			var submitButton = btnGroup.add("button", undefined, "Submit");
				submitButton.onClick = submit;
			var cancelButton = btnGroup.add("button", undefined, "Cancel");
				cancelButton.onClick = cancel;

	
	function submit()
	{
		if(inputGroup.text != "" && inputGroup.text != "Enter Design Number:")
		{
			if(validate())
			{
				finishUp();
			}
		}
		else
		{
			finishUp();
		}
	}

	function removeDuplicateDesignNumbers(dna)
	{
		var uniqueArray = [];
		for(var x=0;x<dna.length;x++)
		{
			var dup = false;
			var thisNum = dna[x];
			for(var u=0;u<uniqueArray.length;u++)
			{
				var thisUnique = uniqueArray[u];
				if(thisNum == thisUnique)
				{
					dup = true;
					continue;
				}
			}
			if(!dup)
			{
				uniqueArray.push(thisNum);
			}
		}
		return uniqueArray;
	}

	function finishUp()
	{
		designNumbersArray = removeDuplicateDesignNumbers(designNumbersArray);
		if(designNumbersArray.length > 0)
		{
			lib.designNumbers = designNumbersArray;
			w.close();
		}
		else
		{
			var msg = "You must enter at least one design number.";
			displayError(msg,errMsgGroup);
		}
	}

	function validate()
	{
		var valid;
		var input = inputGroup.text;

		log.l("Validating user input.::The user entered: " + input);

		//check whether input was valid
		var vPat = /^[a-z0-9]{12}$/i;


		if(!vPat.test(input))
		{
			log.l("User input was invalid. Displaying error message and requesting retry.\n")
			var err = "Invalid design number format. Please try again."
			displayError(err,errMsgGroup);
			valid = false;
		}
		else
		{
			log.l("User input was VALID.");
			designNumbersArray.push(input);

			displayDsgnNums(designNumbersArray,dsgnNumGroup);
			displayError("",errMsgGroup);

			valid = true;
		}
		return valid;
	}

	function cancel()
	{
		log.l("User cancelled dialog.");
		result = false;
		w.close();
	}

	function rmError(eGroup)
	{
		var err = eGroup.subGroup.errorMsg;
		eGroup.remove(err.parent);
		w.layout.layout(true);
	}

	function displayError(msg,eGroup)
	{
		if(eGroup.subGroup)
		{
			rmError(eGroup);
		}
		// errMsgGroup.remove(eGroup.parent);
		eGroup.subGroup = eGroup.add("group");
		eGroup.subGroup.errorMsg = eGroup.subGroup.add("statictext", undefined, msg);
		// errMsg = "test";
		w.layout.layout(true);
	}

	function rmDsgnAdded(dispGroup)
	{
		var disp = dispGroup.subGroup.displayMsg;
		dispGroup.remove(disp.parent);
		w.layout.layout(true);
	}

	function displayDsgnNums(nums,dispGroup)
	{
		if(dispGroup.subGroup)
		{
			rmDsgnAdded(dispGroup);
		}
		dispGroup.subGroup = dispGroup.add("group");
		dispGroup.subGroup.displayMsg = dispGroup.subGroup.add("statictext", undefined, "The following design numbers will be processed.");
		dispGroup.subGroup.addedDesignNumbers = dispGroup.subGroup.add("statictext",undefined,nums.join(", "));
		dispGroup.subGroup.orientation = "column";
		inputGroup.text = "";
		w.layout.layout(true);
	}


	w.show();

	log.l("End of getDesignNumber function. Return value: " + result);
	return result;
}


// getDesignNumber();sssssssssss