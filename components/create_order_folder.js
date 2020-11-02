/*
	Component Name: create_order_folder
	Author: William Dowling
	Creation Date: 11 November, 2019
	Description: 
		create a new folder in the user's preferred location named
		with the order number and team name
	Arguments
		
	Return value
		

*/

function createOrderFolder()
{

	log.h("Beginning of createOrderFolder();");
	var folderString = "";


	if(BATCH_MODE)
	{
		var userInitials = "INITIALS";
	}
	else
	{
		var userInitials = user.charAt(0) + user.charAt(user.indexOf(".")+1);
		userInitials = userInitials.toUpperCase();	
	}
	

	if(!teamName)
	{
		teamName = "Team Name";
	}

	if(designNumberOnly)
	{
		folderString = designNumbers[0] + "_No_Order_Number";
	}
	else
	{
		folderString = orderNumber + "_" + teamName + " " + userInitials + "~N";	
	}
	
	curOrderFolderPath = saveLoc + folderString;
	log.l("curOrderFolderPath = " + curOrderFolderPath);

	curOrderFolder = Folder(curOrderFolderPath);
	if(!curOrderFolder.exists)
	{
		log.l("curOrderFolder did not exist. Creating one at " + curOrderFolderPath);
		curOrderFolder.create();
	}
	else
	{
		var files = curOrderFolder.getFiles();
		var subFiles;
		for(var f = files.length-1;f>=0;f--)
		{
			if(files[f].name.indexOf("assets")>-1)
			{
				subFiles = files[f].getFiles();
				for(var sf = subFiles.length-1;sf>=0;sf--)
				{
					subFiles[sf].remove();
				}
				files[f].remove();
			}
		}
	}
}