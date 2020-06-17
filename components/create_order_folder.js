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
	var userInitials = user.charAt(0) + user.charAt(user.indexOf(".")+1);
	userInitials = userInitials.toUpperCase();

	if(!teamName)
	{
		teamName = "Team Name";
	}

	var folderString = orderNumber + "_" + teamName + " " + userInitials + "~N";
	curOrderFolder = Folder(localJobFolder.fullName + "/" + folderString);
	if(!curOrderFolder.exists)
	{
		curOrderFolder.create();
	}
}