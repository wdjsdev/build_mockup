/*
	Component Name: get save location
	Author: William Dowling
	Creation Date: 17 June, 2020
	Description: 
		prompt the user for a location to
		save the master file(s)
		if the user selects a valid folder,
		overwrite the global saveLoc variable
		with the selected file path
	Arguments
		none
	Return value
		void

*/

function getSaveLocation()
{
	var userSelection = desktopFolder.selectDlg("Where do you want your master files saved?");
	if(userSelection)
	{
		saveLoc = userSelection.fullName;
	}
	else
	{
		saveLoc = desktopPath;
	}

	saveLoc = saveLoc.replace(/~\/|.*users/i,homeFolderPath) + "/";
	alert("Master files will be saved here:\n" + saveLoc);

	localJobFolder = Folder(saveLoc);

	writeDatabase(saveLocPrefFile.fullName,saveLoc);
}