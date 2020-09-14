/*
	Component Name: get_matches
	Author: William Dowling
	Creation Date: 29 March, 2017
	Description: 
		get the files in the folder
		and search for any files whose name contains the serchTerm
		validate the result and prompt user if necessary
	Arguments
		a folder
		a search term (typically style number)
		a string representing the kind of object to be searching for (file or folder)
		the garment code
		promptUser boolean
			in the event a file/folder is not found, check this value
				if true, prompt the user to choose a file/folder
				if false, just return false
		styleNo
		optional special message
	Return value
		a file or folder object

*/


function getMatches(searchFolder,searchTerm,desiredType,garmentCode,promptUser,styleNo,specialMessage)
{
	var msg,result;

	//this validation block is for my own development and debugging
	//it should not be an issue once distributed.
	if(desiredType != "file" && desiredType != "folder")
	{
		alert("desiredType argument was missing!!!");
		return false;
	}

	if(specialMessage)
	{
		msg = specialMessage;
	}
	else
	{
		if(desiredType == "file")
		{
			msg = "Please select the correct " + desiredType + " for " + garmentCode + "_" + styleNo;
		}
		else
		{
			msg = "Please select the correct " + desiredType + " for " + garmentCode;
		}
	}
	log.l("beginning getMatches function with arguments: ::searchFolder = " + searchFolder + "::searchTerm = " + searchTerm);
	var matches = [];

	var contents = searchFolder.getFiles();

	if(contents.length > 0)
	{
		for(var fc=0;fc<contents.length;fc++)
		{
			var thisFile = contents[fc];
			if(thisFile.name.indexOf(searchTerm)>-1)
			{
				matches.push(thisFile);
			}
		}

		if(matches.length == 1)
		{
			result = matches[0];
			log.l("Only one match found. Set " + desiredType + " to: " + result);
		}
		else if(promptUser)
		{
			log.l(matches.length + " " + desiredType + "s found for " + garmentCode + ". Propmting user.");
			if(matches.length > 1)
			{
				var usrInput = usrPrompt(matches,msg,garmentCode);
			}
			else if(matches.length == 0)
			{
				var usrInput = usrPrompt(searchFolder.getFiles(),msg,garmentCode);
			}

			//verify that the user made a valid selection
			if(!usrInput)
			{
				log.e("User cancelled dialog. Skipping " + garmentCode);
				errorList.push("Failed to find a " + desiredType + " for " + garmentCode + ". This garment has been skipped.");
				result = false;
			}
			else
			{
				result = usrInput;
			}
		}
		else
		{
			result = false;
		}

		if(result)
		{
			if(desiredType == "file")
			{
				result = new File(result);
			}
			else if(desiredType == "folder")
			{
				result = new Folder(result);
			}
		}
	}
	else
	{
		log.e("No files or folders were found in " + searchFolder);
		errorList.push(searchFolder + " was empty. There do not appear to be any mockup files for this garment. Please let William know about this issue.");
	}

	log.l("End of getMatches function. Returning " + result);
	return result;
}