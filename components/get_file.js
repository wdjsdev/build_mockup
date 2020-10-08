function getFile(folder,style,name)
{
	var file,files = [];
	log.l("Beginning of getFile function:");
	log.l("folder = " + folder);
	log.l("style = " + style + "::::");
	var searchStr = "*-" + style + "*";
	var pat = new RegExp("^[^\.].*[-_]" + style + ".*" + "\.ai[t]?$");


	////////////////////////
	////////ATTENTION://////
	//
	//		disabling this section
	//		trying to find a solution that doesn't
	//		use getFiles() because that takes 
	//		way too long over vpn
	//
	////////////////////////

		// scriptTimer.beginTask(folder + " getFiles");
		// var files = folder.getFiles();
		// scriptTimer.endTask(folder + " getFiles");
		
		// if(files.length)
		// {
		// 	for(var f=files.length-1;f>=0;f--)
		// 	{
		// 		if(!pat.test(files[f].name))
		// 		{
		// 			files.splice(f,1);
		// 		}
		// 	}
		// }

	//try to just get the file explicitly
	file = new File(folder.fullName + "/" + name + ".ait");

	//if no files matched the concatenated name,
	//get all the files in the folder and check against
	//the style numbers. put a big message here so you know 
	//to fix it later.
	if(!file.exists)
	{
		log.l("ATTN::::Why wasn't this file found?!? Figure it out!::" +  file.fullName);
		scriptTimer.beginTask(folder + ".getFiles()");
		files = folder.getFiles();
		
		
		if(files.length)
		{
			for(var f=files.length-1;f>=0;f--)
			{
				if(!pat.test(files[f].name))
				{
					files.splice(f,1);
				}
			}
		}
		scriptTimer.endTask(folder + ".getFiles()");
	}
	else
	{
		files = [file];
	}



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
		file = folder.openDlg("Select the file matching the style number: " + name + "_" + style);
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