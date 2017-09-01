/*
	Component Name: usrPrompt
	Author: William Dowling
	Creation Date: 29 March, 2017
	Description: 
		Prompt the user to select the correct file or folder from a list
	Arguments
		matches- an array of files or folders
		inputMsg- the title and message to be displayed on the dialog window.
		garmentCode- the FD or BM code associated with the current garment
	Return value
		a string containing the file or folder path.
		the return value should be converted to a file/folder object from wherever
		this function is called.

*/


//usrPrompt Function Description
//prompt the user for the correct folder.
function usrPrompt(matches,inputMsg,garmentCode)
{
	var result;

	var clickedCancel = false;

	var w = new Window("dialog",inputMsg);
		var txtGroup = w.add("group");
			var topTxt = txtGroup.add("statictext", undefined, inputMsg);
		
		var boxGroup = w.add("group");
			var box = boxGroup.add("listbox",undefined,matches)
			box.maximumSize.height = 600;
			box.minimumSize.width = 100;
	
		var errMsgGroup = w.add("group");
	
		var btnGroup = w.add("group");
			var submit = btnGroup.add("button", undefined, "Submit");
				submit.onClick = function()
				{
					if(!box.selection)
					{
						log.l("User submitted the dialog with nothing selected. Displaying error message.");
						var err = "You must make a selection.";
						if(errMsgGroup.subGroup)
						{
							rmError(errMsgGroup);
						}
						displayError(err,errMsgGroup);
						clickedCancel = false;
					}
					else
					{	
						result = box.selection.text;
						log.l("User submitted form. Returning " + result);
						w.close();
					}
				}
			var cancel = btnGroup.add("button", undefined, "Cancel");
				cancel.onClick = function()
				{
					if(!clickedCancel)
					{
						log.l("User clicked cancel. Asking them to confirm cancel.");
						var err = "If you cancel, the " + garmentCode + " garment will be ignored.";
						if(errMsgGroup.subGroup)
						{
							rmError(errMsgGroup);
						}
						displayError(err,errMsgGroup);
						clickedCancel = true;
					}
					else
					{
						log.l("User confirmed cancellation. Skipping " + garmentCode);
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

	


	return result;
}
