/*
	Component Name: get_gar_info
	Author: William Dowling
	Creation Date: 10 March, 2017
	Description: 
		Get the garment information from the lib.json object
		for each config object in lib.json
			Get values for style number and garment name
			Get garment code
			Get sport
			Check roster to see whether adult/youth/both are needed
	Arguments
		config object
		name of the current config object ("config" or "configReverse")
	Return value
		success boolean
*/

function verifyGarInfo(config,prop)
{
	log.h("Beginning execution of verifyGarInfo function." + 
		"::Beginning execution of verifyGarInfo function." + 
		"::Beginning execution of verifyGarInfo function.");
	var result = true;

	//counter variable to ensure that at least one garment code is found
	//if no garment codes are found, set result to false and alert user.
	var codesFound = 0;
	//counter variable to ensure at least one mockup is found
	//if no mockups are found, set result to false and alert user.
	var mockupsFound = 0;

	var sport;
	
	log.l("Starting possibleGarments loop for " + prop);
	for(var pg=0;pg<lib.possibleGarments.length;pg++)
	{
		var thisGarment = lib.possibleGarments[pg];
		if(config[thisGarment])
		{
			//validate the style number
			//reformat it if necessary
			if(!checkStyleNum(config[thisGarment],thisGarment,prop))
			{
				log.l(prop + "." + thisGarment + ".styleNo was not found. Skipping this garment.");
				continue;
			}
			

			//get the garment code
			if(!getGarmentCode(config[thisGarment],thisGarment,prop))
			{
				log.l(prop + "." + thisGarment + " garment code was not properly determined. Skipping this garment.");
				continue;
			}
			else
			{
				codesFound++;
			}

			//get the sport
			if(!getSport(config[thisGarment]))
			{
				log.l(prop + "." + thisGarment + " sport was not properly determined. Skipping this garment.");
				continue;
			}

			//check whether adult,youth or both are needed
			if(!checkRoster(config[thisGarment],thisGarment,prop))
			{
				log.l(prop + "." + thisGarment + " sizes (adult/youth) were not properly determined. Skipping this garment.");
				continue;
			}

			//get the mockup file(s)
			//loop the possible sizes. if a mockup is needed
			//for the current size, execute getMockupFiles
			for(var ps=0;ps<lib.possibleSizes.length;ps++)
			{
				var thisSize = lib.possibleSizes[ps];
				if(config[thisGarment][thisSize])
				{
					if(!getMockupFiles(config[thisGarment],thisSize,prop))
					{
						log.l("Failed to get a mockup file for " + prop + "." + thisGarment + "." + thisSize + ". Skipping this garment.");
					}
					else
					{
						//a mockup was found. increment the mockupsFound variable
						mockupsFound++;

						//commenting the below while testing split filesToOpen arrays
						//one array for garments, and one for graphics
						// //add this mockup to the files to open array
						// lib.filesToOpen.push(config[thisGarment]);
						lib.mockupsToOpen.push(config[thisGarment])
					}
				}
				else
				{
					log.l("No mockup needed for " + prop + "." + thisGarment + "." + thisSize);
				}
			}

		}
		else
		{
			log.l(thisGarment + " is not needed for this design id.");
		}
	}
	if(codesFound.length == 0)
	{
		log.e("No garment codes were found in the verifyGarInfo loop.");
		result = false;
	}

	log.l("End of verifyGarInfo function. Returning " + result);

	return result;
}