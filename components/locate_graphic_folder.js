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

function locateGraphicFolder ( graphicCode, lib )
{
	lib = lib.toLowerCase();
	graphicCode = graphicCode.toLowerCase();
	log.h( "Beginning execution of locateGraphicFolder(" + graphicCode + ")" );


	scriptTimer.beginTask( "locateGraphicFolder_" + graphicCode );
	var curGraphicFolder, parentFolder, gfFiles, exit = false;
	var maxDepth = 1;
	var curDepth = 0;

	//include the database
	eval( "#include \"" + GCL + "\"" );



	log.l( "Checking graphic locations database for " + graphicCode );
	if ( graphicLocations[ graphicCode ] )
	{
		log.l( graphicCode + " found: " + graphicsPath + graphicLocations[ graphicCode ] );
		curGraphicFolder = Folder( graphicsPath + graphicLocations[ graphicCode ] );
	}


	if ( !curGraphicFolder || !curGraphicFolder.exists )
	{

		//there's STILL no graphic folder.. couldn't find it in either database..
		//just ask ths user to locate it manually
		//"why don't you just tell me the name of the movie you want to see?!" -kramer


		//disabling recursive search because it's too expensive time wise
		//just ask the user where the file is and be done with it.
		// digForGraphic(graphicsFolder);

		if ( !curGraphicFolder )
		{
			curGraphicFolder = graphicsFolder.selectDlg( orderNumber + "_" + curDesignNumber + ": Which folder has the artwork for " + graphicCode + "?" );
		}

		//if there's a graphic folder, save the folder path to the database
		//else, return undefined.

		if ( curGraphicFolder )
		{
			graphicLocations[ graphicCode ] = decodeURI( curGraphicFolder.fullName ).replace( /^.*graphics\//i, "" ) + "/";
			writeDatabase( GCL, "var graphicLocations = " + JSON.stringify( graphicLocations ) );
			log.l( "Added {" + lib + "," + curGraphicFolder.fullName + " to graphicLocations database." );
		}

	}

	scriptTimer.endTask( "locateGraphicFolder_" + graphicCode );
	return curGraphicFolder;
}