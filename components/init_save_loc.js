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

	// if(designNumberOnly)
	// {
	// 	localJobFolder = Folder.selectDialog("Where do you want to save your mockup?");
	// 	if(localJobFolder)
	// 	{
	// 		saveLoc = localJobFolder.fullName.replace(userPathRegex,homeFolderPath);
	// 	}
	// }
	// else
	// {
		saveLocPrefFile.open("r");
		saveLoc = saveLocPrefFile.read();
		saveLocPrefFile.close();

		if(saveLoc === "")
		{
			getSaveLocation();
		}

		localJobFolderPath = saveLoc;
		localJobFolder = Folder(localJobFolderPath);	
	// }
	
	log.l("saveLoc = " + saveLoc);
}