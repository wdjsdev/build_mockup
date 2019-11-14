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

function locateGraphicFolder(graphicCode)
{
	log.h("Beginning execution of locateGraphicFolder(" + graphicCode + ")");
	var graphicFolder,parentFolder,gfFiles,exit = false;
	var maxDepth = 2;
	var curDepth = 0;
	var nameNumberPat = /(FDSN|FDSP)[-_]/i;
	graphicCode = graphicCode.replace(nameNumberPat,"FDSP-FDSN_");

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
		dbFile.write("var graphicLocations = {};");
		dbFile.close();
		eval("#include \"" + GFL + "\"");
		log.l("No graphic folder location database existed. Created a new one.");
	}


	log.l("Checking database for " + graphicCode);
	if(graphicLocations[graphicCode])
	{
		log.l(graphicCode + " found: " + graphicLocations[graphicCode]);
		graphicFolder = Folder(graphicLocations[graphicCode]);
	}
	else
	{
		log.l(graphicCode + " NOT found.");
		digForGraphic(graphicsFolder);

		if(!graphicFolder)
		{
			graphicFolder = graphicsFolder.selectDlg("Select Graphic Folder for " + graphicCode + ".");
		}

		//if there's a graphic folder, save the folder path to the database
		//else, return undefined.

		if(graphicFolder)
		{
			graphicLocations[graphicCode] = graphicFolder.fsName;
			writeDatabase(GFL,"var graphicLocations = " + JSON.stringify(graphicLocations));
		}

	}


	return graphicFolder;

	function digForGraphic(loc)
	{	
		log.l("Digging for " + graphicCode + " in " + loc.fsName);
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
					log.l(graphicFolder.fsName);
				}
			}
		}
		curDepth--;
	}
}