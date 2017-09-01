/*
	Component Name: check_for_duplicates
	Author: William Dowling
	Creation Date: 17 April, 2017
	Description: 
		Loop the lib.filesToOpen array and check for duplicate files.
		remove any duplicates so that multiple copies of the same file are not opened.
	Arguments
		lib.filesToOpen array of objects
	Return value
		success boolean

*/
function checkForDuplicates(filesToOpen)
{
	log.h("Beginning execution of checkForDuplicates function.");
	var result = true;

	var uniqueFiles = [];



	//loop the files array and check each file for a match in the uniqueFiles array
	//if there is a match, splice the current file from it's respective files array
	for(var fto=0;fto<filesToOpen.length;fto++)
	{
		log.h("Starting loop on filesToOpen[" + fto + "]");
		var fileObj = filesToOpen[fto];

		//loop the files array in fileObj object
		for(var uf = fileObj.files.length-1;uf >-1; uf--)
		{
			log.l("starting interior loop on fileObj.files[" + uf + "]");
			var thisFile = fileObj.files[uf];
			//look for matches in the uniqueFiles array
			//if match exists, splice thisFile
			if(!isUnique(thisFile,uniqueFiles))
			{
				fileObj.files.splice(uf,1);
				log.l("Spliced the file at index " + uf);
			}
			else
			{
				uniqueFiles.push(thisFile);
			}
		}
		
	}


	function isUnique(name,uniqueFiles)
	{
		var result = true;

		for(var iu=0;iu<uniqueFiles.length;iu++)
		{
			var uFile = uniqueFiles[iu];
			if(name == uFile)
			{
				result = false;
				break;
			}
		}
		log.l("end of isUnique function. returning " + result);
		return result;
	}

	// lib.filesToOpen = filesToOpen;

	return result;
}