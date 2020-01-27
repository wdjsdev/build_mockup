/*
	Component Name: get_garment_code
	Author: William Dowling
	Creation Date: 08 March, 2017
	Description: 
		take the garment name and find the appropriate bm/fd code from the midtable
	Arguments
		garObj
			the top or bottom object for the current config object
		thisGarment
			a string representing the current garment (top or bottom)
		prop
			a string representing the config object (either config or configReverse)

	Return value
		success boolean

*/

//getGarmentCode Function Description
//search midtable for a garment code that matches the garment name
//check whether the garment code is style number specific 
	//(i.e. slowpitch could be FD-161 or FD-163 depending upon style number.)
function getGarmentCode(garObj,thisGarment,prop)
{
	var result = true;
	var garmentCode,name,styleNo;

	log.h("Beginning execution of getGarmentCode function.::prop = " + prop + "::thisGarment = " + thisGarment);

	//trim the style number from the garment if it's full dye
	//otherwise leave it alone
	if(garObj.garment.indexOf("FD")==0)
	{
		name = garObj.garment.substring(0,garObj.garment.lastIndexOf("-"))
	}
	else
	{
		name = garObj.garment;
	}
	styleNo = garObj.styleNo;

	//if this is an authentic garment, but not a PS pant
	//skip the midtable and just use the style number
	if(name.indexOf("BA")==0 && name.indexOf("PS")==-1)
	{
		log.l("Garment is authentic, and not PS pants. Using the style number: BM-" + styleNo + " as the garment code.")
		garmentCode = "BM-" + styleNo;
	}
	else if(midTable[name])
	{
		garmentCode = midTable[name];
		if(garmentCode == "no mockup")
		{
			msgList.push("No mockup needed for " + name + ". This garment has been skipped.");
			log.l("No mockup needed for " + name + ". This garment has been skipped.");
			result = false;
		}
		else
		{
			log.l("Successfully found garment code for " + name + " in midTable. garmentCode has been set to " + garmentCode);
		}
	}
	else
	{
		log.e("midTable did not contain the name " + name + ".::designNumber = " + lib.designNumbers[dn]);
		log.l("Prompting user for correct garment code.");
		garmentCode = promptForGarmentCode(name)
		if(!garmentCode)
		{
			// log.e("User cancelled dialog. This garment will be skipped.");
			errorList.push("The garment code for " + garObj.garment + " could not be determined. This garment has been skipped.");
			result = false;
		}
		else
		{
			msgList.push("Sorry you had to see the dialog box for " + name + ". Please enjoy a cup of coffee from the break room, free of charge, as a token of my apology.");
			log.l("Prompted user. Garment code has been set to " + garmentCode);
		}

	}

	if(result && garmentCode.indexOf("/")>-1)
	{
		var subStyle = getSubStyle(name,styleNo);
		if(!subStyle)
		{
			log.e("Failed to get the correct garment code from the getSubStyle function for " + 
				prop + "." + thisGarment + "::Passed in the following arguments: ::garmentCode: " 
				+ garmentCode + "::styleNo: " + styleNo);
			log.l("Prompting user for correct garment Code");
			subStyle = promptForGarmentCode(name);
			if(!subStyle)
			{
				// log.e("User cancelled dialog. Skipping " + name);
				errorList.push("Failed to get the appropriate garment code for " + name + ".");
				result = false;
			}
			else
			{
				msgList.push("Sorry you had to see the dialog box for " + name + ". Please enjoy a cup of coffee from the break room, free of charge, as a token of my apology.");
			}

		}
		garmentCode = subStyle;

	}
	if(result)
	{
		garObj.garmentCode = garmentCode;
	}
	
	log.l("End of getGarmentCode function. Returning " + result);
	return result;
}

