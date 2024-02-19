/*
	Component Name: get_ct_folder_path
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

function getCTFolderPath ( mid )
{
	if ( !mid ) return;
	log.h( "Beginning execution of getCTFolderPath(" + mid + ")" );
	var ctFolderPath;

	//include the database
	try
	{
		eval( "#include \"" + CTFL + "\"" );
	}
	catch ( e )
	{
		var dbFile = File( CTFL );
		dbFile.open( "w" );
		dbFile.write( "var ctLocations = {};" );
		dbFile.close();
		eval( "#include \"" + CTFL + "\"" );
	}

	if ( ctLocations[ mid ] )
	{
		log.l( "Found an entry for " + mid + " in the database." )
		log.l( "CT folder path = " + ctLocations[ mid ] );

		if ( ctLocations[ mid ] === "no_youth_garment" || ctLocations[ mid ] === "no_mockup" )
		{
			ctFolderPath = undefined;
			log.l( mid + " is on the no_mockup list." );
		}
		else
		{
			ctFolderPath = prepressPath + ctLocations[ mid ];
		}

	}
	else
	{
		log.l( "Nothing in the database for " + mid + ". Beginning to dig through prepress folders." );

		var chosenFolder = prepressFolder.selectDlg( "Select Converted Template Folder or Mockup Folder for: " + mid + "." );
		if ( chosenFolder )
		{
			ctFolderPath = chosenFolder.fsName;
		}

		//if there is a ct folder, save the folder to the database. 
		//else, return undefined..

		if ( ctFolderPath )
		{
			//write the new ct/mockup folder to the database
			ctLocations[ mid ] = ctFolderPath.replace( /\\{2}/g, "/" ).replace( /^.*prepress\//i, "" );
			writeDatabase( CTFL, "var ctLocations = " + JSON.stringify( ctLocations, null, 4 ) );
			log.l( "added {" + mid + ", " + ctFolderPath + "} to ctLocations database." );
		}
		else
		{
			log.e( "Failed to find the proper ct folder.." );
		}


	}

	return ctFolderPath;

}