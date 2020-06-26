function getFile(folder,style)
{
	var file;
	log.l("Beginning of getFile function:");
	log.l("folder = " + folder);
	log.l("style = " + style + "::::");
	var searchStr = "*-" + style + "*";
	var files = folder.getFiles(function(file)
		{
			var result;
			var pat = new RegExp("^[^\.].*[-_]" + style + ".*" + "\.ai[t]?$");
			return pat.test(file.name);
		});
	

	if(files.length === 1)
	{
		file = files[0];
	} 
	else if(files.length > 1)
	{
		file = chooseFile(files);
	}
	else
	{
		if(os === "windows")
		{
			file = folder.openDlg("Select the file matching the style number: " + style);
		}
		else
		{
			file = folder.openDlg("Select the file matching the style number: " + style,isAiFileOrFolder);	
		}
		
	}

	log.l("file = " + file);
	return file;


	//give the user a button for each file matching
	//the given style number. return the text of that button
	function chooseFile(files)
	{
		var result;
		log.l("multiple files found matching the style number: " + style + ". Prompting user.");
		log.l("files found: ::" + files.join("::"));
		var cf = new Window("dialog","Choose the correct graphic.");
			var topTxt = UI.static(cf,"The following files match the style number: " + style);
			var topTxt2 = UI.static(cf,"Please select the appropriate file.");

			var btns = [];
			var btnGroup = UI.group(cf);
				var curBtn;
				for(var f=0,len=files.length;f<len;f++)
				{
					if(files[f].name.indexOf("._")>-1)
					{
						continue;
					}
					curBtn = UI.button(btnGroup,files[f].name,function()
					{
						result = this.file;
						cf.close();
					})
					curBtn.file = files[f];
				}
		cf.show();
		return result;
	}
}