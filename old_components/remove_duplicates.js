/*
	Component Name: remove_duplicates
	Author: William Dowling
	Creation Date: 28 April, 2017
	Description: 
		At the end of processing for each design number,
		remove any duplicates from the array passed in.
	Arguments
		array of file objects
	Return value
		an array with the duplicates stripped out.

*/

function removeDuplicates(files,type)
{
	var result = true;
	var duplicatesRemoved = [];

	for(var df = files.length-1;df >-1; df--)
	{
		var thisObj = files[df];
		for(var tof = thisObj.files.length-1;tof >-1; tof--)
		{
			var thisFile = thisObj.files[tof];
			thisFile = new File(thisFile);
			if(!existsInArray(thisFile,duplicatesRemoved))
			{
				duplicatesRemoved.push(thisFile);
				log.l("Added " + thisFile + " to duplicatesRemoved array because it's unique.");
			}
			else
			{
				log.l("Removed " + thisFile + " because it was a duplicate.");
			}
		}
		
	}


	for(var uf = duplicatesRemoved.length-1;uf >-1; uf--)
	{
		// lib.filesToOpen.push(duplicatesRemoved[uf]);

		if(type=="mockups")
		{
			lib.curatedMockups.push(duplicatesRemoved[uf]);
		}
		else if(type == "graphics")
		{
			lib.curatedGraphics.push(duplicatesRemoved[uf])
		}
	}

	log.l("End of removeDuplicates function.");


	function existsInArray(thisFile,duplicatesRemoved)
	{
		var result = false;
		for(var fo=0;fo<duplicatesRemoved.length;fo++)
		{
			var thisOpenedFile = duplicatesRemoved[fo];
			if(thisFile.fullName == thisOpenedFile.fullName)
			{
				result = true;
				continue;
			}	
		}

		return result;
	}


	return true;
}