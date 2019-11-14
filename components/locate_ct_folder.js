/*
	Component Name: locate_ct_folder
	Author: William Dowling
	Creation Date: 18 October, 2019
	Description: 
		check to see if a converted templates folder has been established for
		the given mid/garment code.
		if so, return the folder object
		if not, dig recursively through the prepress folder until the correct
			CT folder is found, save the folder to the database, then return the folder object
	Arguments
		mid
			string representing the garment code/mid value. i.e. "FD-163W"
	Return value
		Folder object

*/

function locateCTFolder(mid)
{
	log.h("Beginning execution of locateCTFolder(" + mid + ")");
	var garmentFolder,gfFiles,ctFolder,exit = false;
	var maxDepth = 2;
	var curDepth = 0;

	//include the database
	try
	{
		eval("#include \"" + CTFL + "\"");		
	}
	catch(e)
	{
		var dbFile = File(CTFL);
		dbFile.open("w");
		dbFile.write("var ctLocations = {};");
		dbFile.close();
		eval("#include \"" + CTFL + "\"");
	}
	
	if(ctLocations[mid])
	{
		log.l("Found an entry for " + mid + " in the database.")
		log.l("CT folder = " + ctLocations[mid]);
		ctFolder = Folder(ctLocations[mid]);
	}
	else
	{
		log.l("Nothing in the database for " + mid + ". Beginning to dig through prepress folders.");
		digForFolders(prepressFolder);
		if(!ctFolder)
		{
			ctFolder = prepressFolder.selectDlg("Select Converted Template Folder or Mockup Folder for: " + mid + ".");
		}

		//if there is a ct folder, save the folder to the database. 
		//else, return undefined..

		if(ctFolder)
		{
			//write the new ct/mockup folder to the database
			ctLocations[mid] = ctFolder.fsName;
			writeDatabase(CTFL,"var ctLocations = " + JSON.stringify(ctLocations));
		}

	}

	return ctFolder;


	//recursive function for finding the proper CT folder in the prepress folder.
	
	function digForFolders(loc)
	{	
		log.l("Digging for " + mid + " in " + loc.fsName);
		var files = loc.getFiles();
		for(var f=0,len=files.length;f<len && !ctFolder && !exit && curDepth < maxDepth;f++)
		{
			if(files[f] instanceof Folder)
			{
				if(files[f].name.indexOf(mid + "_") > -1)
				{
					garmentFolder = files[f];
					gfFiles = garmentFolder.getFiles();
					for(var y=0,gfLen=gfFiles.length;y<gfLen;y++)
					{
						if(gfFiles[y] instanceof Folder && gfFiles[y].name.indexOf("onvert")>-1)
						{
							ctFolder = gfFiles[y];
							log.l("Found the CT folder here:");
							log.l(ctFolder.fsName);
						}
					}
					if(!ctFolder)
					{
						exit = true;
					}
				}
				else
				{
					curDepth++;
					digForFolders(files[f]);
				}
			}
		}
		curDepth--;
	}
}