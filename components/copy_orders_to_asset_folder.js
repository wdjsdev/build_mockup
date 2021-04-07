function copyOrdersToAssetFolder()
{

	
	var localScriptPath = documentsPath + "mockup_batch/"
	var localScriptFolder = new Folder(localScriptPath);
	if(!localScriptFolder.exists)
	{
		localScriptFolder.create();
	}
	var scriptText = "do shell script \"cp -rn " + localJobFolderPath.replace(" ","\\\\ ") + "* /Volumes/Customization/1_Active\\\\ Orders/1_Mockup\\\\ IN\\\\ PROGRESS/_Mockup_Asset_Folders_\"";

	// alert(scriptText);
	// debugger;
	scriptFile = File(localScriptPath + "copy_orders_to_asset_folder.scpt");
	writeScriptFile(scriptFile,scriptText);
	executor = File(resourcePath + "copy_orders_to_asset_folder.app");

	var executor = File(resourcePath + "copy_orders_to_asset_folder.app");

	executor.execute();


	function writeScriptFile(file,txt)
	{
		file.open("w");
		file.write(txt);
		file.close();
	}
}

