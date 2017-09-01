
//Description: test a given script for #include or eval errors (typically missing semi colon);
function test()
{
	var obj = {};
	var arr = [];
	var folder = new Folder("~/Desktop/automation/javascript/_new_cad_workflow/build_mockup/comp_mini/");
	var files = folder.getFiles();

	var testFile;

	var w = new Window("dialog","Select Test File");
		var txtGroup = w.add("group");
			var topTxt = txtGroup.add("statictext", undefined, "Select the file you want to test");
		
		var listGroup = w.add("group");
			var box = listGroup.add("listbox",undefined,files);
	
		var errMsgGroup = w.add("group");
	
		var btnGroup = w.add("group");
			var submit = btnGroup.add("button", undefined, "Submit");
				submit.onClick = function()
				{
					if(!box.selection)
					{
						var err = "Make a selection";
						if(errMsgGroup.subGroup)
						{
							rmError(errMsgGroup);
						}
						displayError(err,errMsgGroup);
					}
					else
					{
						testFile = new File(box.selection.text);
						w.close();
					}
				}
			var cancel = btnGroup.add("button", undefined, "Cancel");
				cancel.onClick = function()
				{
					
					w.close();
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

	if(testFile)
	{
		try
		{
			eval("#include \"" + testFile + "\"");
		}
		catch(e)
		{
			alert("Failed to include " +  testFile.name + ".\n" + e);
		}
	}
	else
	{
		alert("no file selected");
	}

}
test();