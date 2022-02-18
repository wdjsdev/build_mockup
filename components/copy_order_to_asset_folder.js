function copyOrderToAssetFolder(folderPath)
{
	//trim out any trailing slash to avoid trying to sync 
	//the job folder with the mockup asset folder.
	//we only want to put the job folder INSIDE mockup assets.
	folderPath = folderPath.replace(/\/$/,"");


	const spacePat = /\s/g;
	const hardSpace = "\\\\ ";
	var assetFolderPath = "/Volumes/Customization/1_Active Orders/1_Mockup IN PROGRESS/_Mockup_Asset_Folders_/";
	assetFolderPath = assetFolderPath.replace(spacePat,hardSpace);
	folderPath = folderPath.replace(spacePat,hardSpace);
	var shellScriptText = "rsync -vr " + folderPath + " " + assetFolderPath;
	genericShellScript(shellScriptText);
	
}