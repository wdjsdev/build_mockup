/*
	Component Name: open_files
	Author: William Dowling
	Creation Date: 24 March, 2017
	Description: 
		open each file in the lib.(curatedMockups/curatedGraphics) arrays
		these arrays hold the "curated" files, i.e. duplicates stripped out. 
		this should be the last step after all of the files are identified and validated.
	Arguments
		array of mockups
			lib.curatedMockups
		array of graphics
			lib.curatedGraphics
	Return value
		success boolean

*/


//openFiles Function Description
//open each file needed
function openFiles(mockupFiles,graphicFiles)
{
	var result = true;
	var localValid = true;

	var enableMerge = false;

	log.h("Beginning execution of openFiles function.");

	if(enableMerge)
	{
		log.h("Opening files with merge template functionality enabled.");

		//open the mockups and merge them to the master file

		var masterFile;

		//open the mockups
		for(var mf=0;mf<mockupFiles.length;mf++)
		{
			var thisMockup = mockupFiles[mf];
			log.l("Attempting to open " + thisMockup.name);
			if(!masterFile)
			{
				try
				{
					log.l("setting " + thisMockup.name + " as the master file.");
					app.open(thisMockup);
					masterFile = app.activeDocument;
					log.l(thisMockup.name + " successfully opened and set as master file.");
				}
				catch(e)
				{
					log.e("Failed while attempting to open the file: " + thisMockup.name + "::Error code was: " + e);
					errorList.push("Failed to open the mockup file:" + thisMockup.name + ". =(");
					continue;
				}
			}
			else
			{
				try
				{
					app.open(thisMockup);
					log.l("Successfully opened " + thisMockup.name);
				}
				catch(e)
				{
					log.e("Failed while opening " + thisMockup.name + "::Error code was: " + e);
					errorList.push("Failed to open the mockup file: " + thisMockup.name + ". =(");
					continue;
				}
				try
				{
					mergeTemplate(masterFile);
					log.l("Successfully merged " + thisMockup.name + " to " + masterFile.name)
				}
				catch(e)
				{
					log.e("Failed to merge " + thisMockup.name + " to the master file, which is " + masterFile.name + "::Error code was: " + e);
				}
			}

			////////////////////////
			////////ATTENTION://////
			//
			//		Future home of changeColors function call.
			//		This will require a change to the way the files are pushed to the arrays
			//		colors object needs to be included with the file
			//		possible format: 
			//			{"file":File("path/to/file"),"colors":{"C1":{"colorCode":"CB"}, ...}}
			//
			////////////////////////
		}

		//open the graphics
		for(var gf=0;gf<graphicFiles.length;gf++)
		{
			var thisGraphic = graphicFiles[gf];
			try
			{	
				app.open(thisGraphic);
				log.l("Successfully opened " + thisGraphic.name);
			}
			catch(e)
			{
				log.e("Failed while trying to open " + thisGraphic.name + "::Error code was: " + e);
				errorList.push("Failed to open the graphic file: " + thisGraphic.name + ". =(");
			}

			////////////////////////
			////////ATTENTION://////
			//
			//		Future home of changeColors function call.
			//		This will require a change to the way the files are pushed to the arrays
			//		colors object needs to be included with the file
			//		possible format: 
			//			{"file":File("path/to/file"),"colors":{"C1":{"colorCode":"CB"}, ...}}
			//
			////////////////////////
		}
	}
	else
	{
		log.h("Opening files with merge template functionality disabled.");
		//open each mockup file
		for(var fto=0;fto<mockupFiles.length;fto++)
		{
			var thisFile = mockupFiles[fto];
			app.open(thisFile);
			log.l("Opened " + thisFile.name);
		}

		//open each graphic file
		for(var fto=0;fto<graphicFiles.length;fto++)
		{
			var thisFile = graphicFiles[fto];
			app.open(thisFile);
			log.l("Opened " + thisFile.name);
		}
	}

	log.l("End of openFiles function.");

	return result;
}