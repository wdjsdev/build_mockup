/*
	Component Name: locate_graphic_folder
	Author: William Dowling
	Creation Date: 06 November, 2019
	Description: 
		check to see if a folder location has been established for
		the given graphic code.
		if so, return the folder object
		if not, dig recursively through the graphics folder until the correct
			grahpic folder is found, save the folder to the database, then return the folder object
	Arguments
		graphicCode
			string representing graphic code. i.e. "FDS-1005"
	Return value
		Folder object

*/

function locateGraphicFolder(graphicCode,lib)
{
	graphicCode = graphicCode.toLowerCase();
	log.h("Beginning execution of locateGraphicFolder(" + graphicCode + ")");


	scriptTimer.beginTask("locateGraphicFolder_" + graphicCode);
	var graphicFolder,parentFolder,gfFiles,exit = false;
	var maxDepth = 1;
	var curDepth = 0;

	//include the database
	try
	{
		eval("#include \"" + GFL + "\"");
		log.l("Found the graphic folder location database.");	
	}
	catch(e)
	{
		var dbFile = File(GFL);
		dbFile.open("w");
		dbFile.write("var graphicLibraryLocations = {};");
		dbFile.close();
		eval("#include \"" + GFL + "\"");
		log.l("No graphic folder location database existed. Created a new one.");
	}


	var lowerLib = lib.toLowerCase();
	log.l("Checking database for " + lowerLib);
	if(graphicLibraryLocations[lowerLib.toLowerCase()])
	{
		log.l(lowerLib + " found: " + graphicLibraryLocations[lowerLib]);
		graphicFolder = Folder(graphicLibraryLocations[lowerLib]);
	}
	else
	{
		log.l(graphicCode + " NOT found.");

		
		//disabling recursive search because it's too expensive time wise
		//just ask the user where the file is and be done with it.
		// digForGraphic(graphicsFolder);

		if(!graphicFolder)
		{
			graphicFolder = graphicsFolder.selectDlg("Which folder has the artwork for " + graphicCode + "?");
		}

		//if there's a graphic folder, save the folder path to the database
		//else, return undefined.

		if(graphicFolder)
		{
			graphicLibraryLocations[lowerLib] = graphicFolder.fullName;
			writeDatabase(GFL,"var graphicLibraryLocations = " + JSON.stringify(graphicLibraryLocations));
			log.l("Added {" + lowerLib + "," + graphicFolder.fullName + " to graphicLibraryLocations database.");
		}

	}

	scriptTimer.endTask("locateGraphicFolder_" + graphicCode);
	return graphicFolder;

	function digForGraphic(loc)
	{	
		log.l("Digging for " + graphicCode + " in " + loc.fullName);
		var files = loc.getFiles("*" + graphicCode + "*");
		if(files.length)
		{
			graphicFolder = loc;
		}
		else
		{
			files = loc.getFiles();
		}
		var curFile
		for(var f=0,len=files.length;f<len && !graphicFolder && curDepth < maxDepth;f++)
		{
			curFile = files[f];
			if(curFile instanceof Folder)
			{
				curDepth++;
				digForGraphic(files[f]);
			}
			else
			{
				if(curFile.name.toLowerCase().indexOf(graphicCode.toLowerCase)>-1)
				{
					graphicFolder = curFile;
					log.l("Found graphic folder here: ");
					log.l(graphicFolder.fullName);
				}
			}
		}
		curDepth--;
	}
}