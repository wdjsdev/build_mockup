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

function locateGraphicFolder(graphicCode, lib) {
	lib = lib.toLowerCase();
	graphicCode = graphicCode.toLowerCase();
	log.h("Beginning execution of locateGraphicFolder(" + graphicCode + ")");


	scriptTimer.beginTask("locateGraphicFolder_" + graphicCode);
	var graphicFolder, parentFolder, gfFiles, exit = false;
	var maxDepth = 1;
	var curDepth = 0;

	//include the database
	if(File(GCL).exists) {
		eval("#include \"" + GCL + "\"");
		log.l("Found the graphic folder location database.");
	}
	else {
		var dbFile = File(GCL);
		dbFile.open("w");
		dbFile.write("var graphicLocations = {};");
		dbFile.close();
		eval("#include \"" + GCL + "\"");
		log.l("No graphic folder location database existed. Created a new one.");
	}
	
	if(File(GLL).exists) {
		eval("#include \"" + GLL + "\"");
	}
	else
	{
		var dbFile = File(GLL);
		dbFile.open("w");
		dbFile.write("var graphicLibraryLocations = {};");
		dbFile.close();
		eval("#include \"" + GLL + "\"");
	}
		


	log.l("Checking graphic locations database for " + graphicCode);
	if (graphicLocations[graphicCode]) {
		log.l(graphicCode + " found: " + graphicsPath + graphicLocations[graphicCode]);
		graphicFolder = Folder(graphicsPath + graphicLocations[graphicCode]);
	}
	else if (graphicLibraryLocations[lib]) {
		//"graphic library" database

		log.l(lib + " found: " + graphicLibraryLocations[lib]);
		graphicFolder = Folder(graphicsPath + graphicLibraryLocations[lib]);
		if (graphicFolder.exists) {
			graphicLibraryLocations[graphicCode] = curFolder.fullName.replace(/^.*graphics\//i, "") + "/";
			writeDatabase(GLL, "var graphicLibraryLocations = " + JSON.stringify(graphicLocations));
		}
	}
	

	if(!graphicFolder || !graphicFolder.exists) {

		//there's STILL no graphic folder.. couldn't find it in either database..
		//just ask ths user to locate it manually
		//"why don't you just tell me the name of the movie you want to see?!" -kramer


		//disabling recursive search because it's too expensive time wise
		//just ask the user where the file is and be done with it.
		// digForGraphic(graphicsFolder);

		if (!graphicFolder) {
			graphicFolder = graphicsFolder.selectDlg(orderNumber + "_" + curDesignNumber + ": Which folder has the artwork for " + graphicCode + "?");
		}

		//if there's a graphic folder, save the folder path to the database
		//else, return undefined.

		if (graphicFolder) {
			graphicLocations[graphicCode] = decodeURI(graphicFolder.fullName).replace(/^.*graphics\//i, "") + "/";
			writeDatabase(GCL, "var graphicLocations = " + JSON.stringify(graphicLocations));
			log.l("Added {" + lib + "," + graphicFolder.fullName + " to graphicLocations database.");
		}

	}

	scriptTimer.endTask("locateGraphicFolder_" + graphicCode);
	return graphicFolder;

	function digForGraphic(loc) {
		log.l("Digging for " + graphicCode + " in " + loc.fullName);
		var files = loc.getFiles("*" + graphicCode + "*");
		if (files.length) {
			graphicFolder = loc;
		}
		else {
			files = loc.getFiles();
		}
		var curFile
		for (var f = 0, len = files.length; f < len && !graphicFolder && curDepth < maxDepth; f++) {
			curFile = files[f];
			if (curFile instanceof Folder) {
				curDepth++;
				digForGraphic(files[f]);
			}
			else {
				if (curFile.name.toLowerCase().indexOf(graphicCode.toLowerCase) > -1) {
					graphicFolder = curFile;
					log.l("Found graphic folder here: ");
					log.l(graphicFolder.fullName);
				}
			}
		}
		curDepth--;
	}
}