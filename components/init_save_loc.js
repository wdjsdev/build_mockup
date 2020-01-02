/*
	Component Name: init_save_loc
	Author: William Dowling
	Creation Date: 12 November, 2019
	Description: 
		check for pref file
		if exists, include it and save contents to gobal variable
		else prompt the user and create the pref file
	Arguments
		none
	Return value
		void

*/

function initSaveLoc()
{
	log.h("Beginning execution of initSaveLoc()");
	var saveLoc;
	var prefPath = documentsPath + "/build_mockup_prefs/"
	var saveLocPrefFile = File(prefPath + "save_loc_pref.txt");
	var saveLocPrefFolder = Folder(prefPath);
	if(!saveLocPrefFolder.exists)
	{
		saveLocPrefFolder.create();
		log.l("Created a saveLocPrefFolder");
	}
	
	saveLocPrefFile.open("r");
	saveLoc = saveLocPrefFile.read();
	saveLocPrefFile.close();

	if(saveLoc === "")
	{
		var w = new Window("dialog");
			var msg = UI.static(w,"Please choose the location where you would like");
			var msg2 = UI.static(w,"all of your job folders to be automatically saved.");
			var btn = UI.button(w,"Ok",function()
			{
				w.close();
			})
		w.show();
		saveLoc = desktopFolder.selectDlg("Select a default save location for your orders.").fsName;
		writeDatabase(saveLocPrefFile.fullName,saveLoc);
	}

	if(!saveLoc)
	{
		localJobFolder = desktopFolder;
	}
	else
	{
		localJobFolder = Folder(saveLoc.replace(/.*users/i,"/Volumes/Macintosh HD/Users/"));
	}
	

}