/*
	Component Name: get_mockup_files
	Author: William Dowling
	Creation Date: 15 March, 2017
	Rebuild Date: 12 April, 2017
	Description: 
		find the correct mockup for the given garmentCode and style number
	Arguments
		garment object (eg. config.top)
		thisSize (eg. adult or youth)
		prop (string representing the name of the current config object. either config or configReverse)
	Return value
		success boolean
*/

function getMockupFiles(garObj,thisSize,prop)
{
	log.h("Beginning execution of getMockupFiles function for " + garObj.garmentCode + ", size " + thisSize);
	var result = true;

	//mockup variable will ultimately hold the mockup/converted template file found for this garment
	var mockup;
	var authentic = false;
	var garmentCode = garObj.garmentCode;

	//make sure there's a files array in garObj
	if(!garObj.files)
	{
		garObj.files = [];
	}
	
	if(thisSize == "youth")
	{
		//check whether this is a reversible garment
		//if so, update the garment code accordingly
		//otherwise, just append a Y
		if(lib.reversible)
		{
			log.l("Garment is reversible updating the garment code.");
			var newGarmentCode = garObj.garmentCode.replace(/([_])/,"Y$1") + "Y";
			log.l("Garment code has been updated from " + garmentCode + " to " + newGarmentCode);
			garmentCode = newGarmentCode;
		}
		else
		{
			log.l("This garment is youth, but not reversible. Updating the garmentCode variable from " + garmentCode + " to " + garmentCode + "Y");
			garmentCode += "Y";	
		}
		
	}

	//////////////////////////
	//get the garment folder//
	//////////////////////////
	var folder = new Folder(lib.prepressPath + garObj.sport);
	//verify the sport folder exists
	if(folder.exists)
	{
		//check whether the garment is authentic.
		//if so, update the folder path and authentic variable
		if(garmentCode.indexOf("BM")==0)
		{
			folder = new Folder(folder + "/Authentic");
			log.l("Garment is authentic. Setting the folder location to " + folder);
			authentic = true;
		}
		//if garment is not authentic, it's full dye. proceed to look for a folder matching the garment code.
		else
		{
			log.l("::Garment is full dye. Looking for " + garObj.garmentCode + " in the " + garObj.sport + " folder.");
			//look for the folder for this garment code
			folder = getMatches(folder,garmentCode + "_","folder",garmentCode,true,garObj.styleNo);
			if(folder == false)
			{
				log.e("getMatches function returned false. Failed to find a folder matching the garment code in the sport folder.");
				result = false;
			}
			
			if(result)
			{
				// log.l("Successfully set folder to " + folder);
				log.l("::Now looking for a \"converted templates\" or \"mockups\" folder.");
				var convertedTemplatesFolder = getMatches(folder,"onvert","folder",garmentCode,false,garObj.styleNo);
				if(convertedTemplatesFolder)
				{
					folder = convertedTemplatesFolder;
				}
				else
				{
					var mockupFolder = getMatches(folder,"ockup","folder",garmentCode,false,garObj.styleNo);
					if(!mockupFolder)
					{
						log.e("No converted templates folder or mockup folder were found in " + folder + ".");
						errorList.push("No mockups folder or converted templates folder was found.");
						errorList.push(garmentCode + " has ben skipped.");
						result = false;
					}
					else
					{
						folder = mockupFolder;
					}
				}
			}
		}

		if(result)
		{
			// log.l("Successfully set folder to " + folder);
			log.l("::Now looking for a mockup file matching the style number " + garObj.styleNo);

			//get the correct search term. i.e. if the garment is reversible, we need to check
			//whether to append an _A or _B to the end of the styleNo.
			var searchTerm = "_" + garObj.styleNo;
			if(lib.reversible)
			{
				log.l("Garment is reversible. Updating the search term.")
				if(prop == "config")
				{
					searchTerm += "_A";
				}
				else if(prop == "configReverse")
				{
					searchTerm += "_B";
				}
				log.l("New search term = " + searchTerm);
			}

			var mockupFile = getMatches(folder,searchTerm,"file",garmentCode,true,garObj.styleNo);

			if(!mockupFile)
			{
				log.e("No mockups were found in " + folder + ".");
				errorList.push("No mockups matching the style number " + garObj.styleNo + " were found in the folder.");
				errorList.push(garmentCode + " has been skipped.");
				result = false;
			}
			else
			{
				garObj.files.push(mockupFile.fullName);
			}
		}
		
	}
	else
	{
		log.e("No sport folder exists for " + garObj.sport);
		errorList.push("Couldn't find the " + garObj.sport + " folder in the prepress folder.");
		result = false;
	}

	log.l("End of getMockupFiles function. Returning " + result);
	return result;
}

