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

function locateCTFolder ( mid )
{
	if ( !mid ) return;
	log.h( "Beginning execution of locateCTFolder(" + mid + ")" );
	var garmentFolder, mockupFolder, gfFiles, ctFolder, exit = false;
	var maxDepth = 2;
	var curDepth = 0;

	var youthPat = /[yg]$/i;

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
		log.l( "CT folder = " + ctLocations[ mid ] );

		if ( ctLocations[ mid ] === "no_youth_garment" || ctLocations[ mid ] === "no_mockup" )
		{
			ctFolder = undefined;
			log.l( mid + " is on the no_mockup list." );
		}
		else
		{
			ctFolder = Folder( prepressPath + ctLocations[ mid ] );
		}

	}
	else
	{
		log.l( "Nothing in the database for " + mid + ". Beginning to dig through prepress folders." );

		//disabling recursive search because it's too expensive time wise
		//just ask the user where the file is and be done with it.
		// digForFolders(prepressFolder);

		if ( !ctFolder )
		{
			//if it's a youth garment and nothing was found
			//automatically, assume there is no youth garment
			if ( !youthPat.test( mid ) )
			{
				ctFolder = prepressFolder.selectDlg( "Select Converted Template Folder or Mockup Folder for: " + mid + "." );
			}
		}

		//if there is a ct folder, save the folder to the database. 
		//else, return undefined..

		if ( ctFolder )
		{
			//write the new ct/mockup folder to the database
			ctLocations[ mid ] = ctFolder.fsName;
			writeDatabase( CTFL, "var ctLocations = " + JSON.stringify( ctLocations ) );
			log.l( "added {" + mid + ", " + ctFolder.fsName + "} to ctLocations database." );
		}
		else
		{
			log.e( "Failed to find the proper ct folder.." );
		}


	}

	return ctFolder;


	//recursive function for finding the proper CT folder in the prepress folder.

	function digForFolders ( loc )
	{
		log.l( "Digging for " + mid + " in " + loc.fsName );
		if ( curDepth == 0 )
		{
			var files = loc.getFiles();
		}
		else if ( curDepth === 1 )
		{
			var files = loc.getFiles( "*" + mid + "*" );
		}
		else
		{
			curDepth--;
			return;
		}
		for ( var f = 0, len = files.length; f < len && !ctFolder && !exit && curDepth < maxDepth; f++ )
		{
			if ( files[ f ] instanceof Folder )
			{
				if ( files[ f ].name.indexOf( mid + "_" ) > -1 )
				{
					garmentFolder = files[ f ];
					gfFiles = garmentFolder.getFiles();
					for ( var y = 0, gfLen = gfFiles.length; y < gfLen; y++ )
					{
						if ( gfFiles[ y ] instanceof Folder )
						{
							if ( gfFiles[ y ].name.toLowerCase().indexOf( "onvert" ) > -1 )
							{
								ctFolder = gfFiles[ y ];
								log.l( "Found the CT folder here:" );
								log.l( ctFolder.fsName );
							}
							else if ( gfFiles[ y ].name.toLowerCase().indexOf( "ockup" ) > -1 )
							{
								mockupFolder = gfFiles[ y ];
							}
						}
					}
					if ( mockupFolder && !ctFolder )
					{
						ctFolder = mockupFolder;
						log.l( "No ct folder. using the mockup folder instead." );
						log.l( "mockupFolder.fsName = " + mockupFolder.fsName );
					}
					if ( !ctFolder )
					{
						exit = true;
					}
				}
				else
				{
					curDepth++;
					digForFolders( files[ f ] );
				}
			}
		}
		curDepth--;
	}
}