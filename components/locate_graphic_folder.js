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
	var lowerLib = lib.toLowerCase();
	var lowGraphicCode = graphicCode.toLowerCase();
	log.h("Beginning execution of locateGraphicFolder(" + graphicCode + ")");


	scriptTimer.beginTask("locateGraphicFolder_" + graphicCode);
	var graphicFolder,parentFolder,gfFiles,exit = false;
	var maxDepth = 1;
	var curDepth = 0;

	//include the database
	// try
	// {

	// 	//"graphic code" database
	// 	eval("#include \"" + GCL + "\"");
	// 	log.l("Found the graphic code location database.");
	// }
	// catch(e)
	// {
	// 	var dbFile = File(GFL);
	// 	dbFile.open("w");
	// 	dbFile.write("var graphicLocations = {};");
	// 	dbFile.close();
	// 	eval("#include \"" + GFL + "\"");
	// 	log.l("No graphic folder location database existed. Created a new one.");
	// }

	//library of graphic locations by graphic code
	eval("#include \"" + dataPath + "build_mockup_data/graphic_locations_database.js\"");

	//library of graphic locations by "graphic library"
	eval("#include \"" + GLL + "\"");


	if(graphicLocations[lowGraphicCode])
	{
		log.l("Found graphic code: " + graphicCode + " in database at::" + graphicLocations[lowGraphicCode]);
		graphicFolder = Folder(graphicsPath + graphicLocations[lowGraphicCode]);
	}
	
	else if(graphicLibraryLocations[lowerLib.toLowerCase()])
	{
		//"graphic library" database
		
		log.l(lowerLib + " found: " + graphicLibraryLocations[lowerLib]);
		graphicFolder = Folder(graphicsPath + graphicLibraryLocations[lowerLib]);
		if(graphicFolder.exists)
		{
			graphicLocations[lowGraphicCode] = curFolder.fullName.replace(/^.*graphics\//i,"") + "/";
			writeDatabase(GCL, "var graphicLocations = " + JSON.stringify(graphicLocations));
		}
	}
	

	if(!graphicFolder || !graphicFolder.exists)
	{
		log.l(graphicCode + " folder NOT found.");

		
		//disabling recursive search because it's too expensive time wise
		//just ask the user where the file is and be done with it.
		// digForGraphic(graphicsFolder);

		if(!graphicFolder)
		{
			graphicFolder = graphicsFolder.selectDlg(orderNumber + "_" + curDesignNumber + ": Which folder has the artwork for " + graphicCode + "?");
		}

		//if there's a graphic folder, save the folder path to the database
		//else, return undefined.
		
		if(graphicFolder)
		{
			graphicLocations[lowGraphicCode] = graphicFolder.fullName.replace(/^.*graphics\//i,"");
			writeDatabase(GCL,"var graphicLocations = " + JSON.stringify(graphicLocations));

			if(!graphicLibraryLocations[lowerLib])
			{
				graphicLibraryLocations[lowerLib] = graphicFolder.fullName.replace(/^.*graphics\//i,"");
				writeDatabase(GLL,"var graphicLibraryLocations = " + JSON.stringify(graphicLibraryLocations))
			}
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