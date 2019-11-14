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
	var saveLoc;
	var prefPath = documentsPath + "/build_mockup_prefs/"
	var saveLocPrefFile = File(prefPath + "save_loc_pref.txt");
	var saveLocPrefFolder = Folder(prefPath);
	if(!saveLocPrefFolder)
	{
		saveLocPrefFolder.create();
	}
	
	saveLocPrefFile.open("r");
	saveLoc = saveLocPrefFile.read();
	saveLocPrefFile.close();

	if(saveLoc === "")
	{
		saveLoc = desktopFolder.selectDlg("Select a default save location for your orders.").fsName;
		writeDatabase(saveLocPrefFile.fullName,saveLoc)
	}

	if(!saveLoc)
	{
		localJobFolder = desktopFolder;
	}
	else
	{
		localJobFolder = Folder(saveLoc);
	}
	

}