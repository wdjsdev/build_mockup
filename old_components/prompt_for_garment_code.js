/*
	Component Name: prompt_for_garment_code
	Author: William Dowling
	Creation Date: 10 April, 2017
	Description: 
		Prompt the user to enter the correct garment code
	Arguments
		garment name
	Return value
		string value of the correct garment code


*/


//promptForgarmentCode Function Description
//prompt the user for the garmentCode
function promptForGarmentCode(name)
{
	var result;

	var clickedCancel = false;

	var w = new Window("dialog","Enter the Garment Code");
		var txtGroup = w.add("group");
			txtGroup.orientation = "column";
			var topTxt = txtGroup.add("statictext", undefined, "Enter garment code for " + name);
			var topTxt2 = txtGroup.add("statictext", undefined, "Select FD or BM.");
			var topTxt3 = txtGroup.add("statictext", undefined, "Then type the garment code number.");
			var topTxt4 = txtGroup.add("statictext", undefined, "**Do not include the style number.**");
	
		var radioGroup = w.add("group");
			var fd = radioGroup.add("radiobutton", undefined, "FD");
			var ba = radioGroup.add("radiobutton", undefined, "BM");
			var ps = radioGroup.add("radiobutton", undefined, "PS")
			//attempt to automatically set the radio button
			if(name.indexOf("BA-")>-1 || name.indexOf("BM-")>-1)
			{
				ba.value = true;
			}
			else
			{
				fd.value = true;
			}
		var inputGroup = w.add("group");
			var inputTxt = inputGroup.add("edittext",undefined,"eg. 163 or 4404W");
				inputTxt.characters = 25;

		var errMsgGroup = w.add("group");
	
		var btnGroup = w.add("group");
			var submit = btnGroup.add("button", undefined, "Submit");
				submit.onClick = function()
				{
					clickedCancel = false;
					if(inputTxt.text.indexOf("eg.")>-1 || inputTxt.text == "")
					{
						var err = "You must enter a valid garment Code.";
						if(errMsgGroup.subGroup)
						{
							rmError(errMsgGroup);
						}
						displayError(err,errMsgGroup);
					}
					else
					{
						var userInput = inputTxt.text;
						var validatedInput = validateInput(userInput);
						result = getSelected(radioGroup) + "-" + validatedInput;
						w.close();
					}
				}
			var cancel = btnGroup.add("button", undefined, "Cancel");
				cancel.onClick = function()
				{
					if(!clickedCancel)
					{
						log.l("User clicked cancel. Asking them to confirm cancel.");
						var err = "If you cancel, the " + name + " garment will be ignored.";
						if(errMsgGroup.subGroup)
						{
							rmError(errMsgGroup);
						}
						displayError(err,errMsgGroup);
						clickedCancel = true;
					}
					else
					{
						log.l("User confirmed cancellation. Skipping " + name);
						result = undefined;
						w.close();
					}
				}
	w.show();
	
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

	function getSelected(radioGroup)
	{
		for(var gs=0;gs<radioGroup.children.length;gs++)
		{
			var thisChild = radioGroup.children[gs];
			if(thisChild.value)
			{
				return thisChild.text;
			}
		}
	}

	function validateInput(input)
	{
		var result = input;
		//let's try to make this idiot proof, eh?
		//welllll... idiot resistant at least.
		//if the user typed FD or BM, we'll fix it for em
		//so it doesn't return "BM-BM-4404W" or something.
		if(input.indexOf("-") > -1)
		{
			result = input.substring(input.indexOf("-")+1,input.length);
		}
		else if(input.indexOf("_") > -1)
		{
			result = input.substring(input.indexOf("_")+1,input.length);
		}

		return result;
	}

	return result;
}