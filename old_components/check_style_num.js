/*
	Component Name: check_style_num
	Author: William Dowling
	Creation Date: 10 April, 2017
	Description: 
		check to see whether the style number needs to be fixed up
		for example if the styleNo starts with BA, we need to drop that off
		so it's just the real style number.
	Arguments
		garment object
			this will be the "top" or "bottom" object for the current config object
		thisGarment
			a string containing the current "possibleGarments" value. usually "top" or "bottom"
		prop
			a string containing the name of the current config object. should be either "config" or "configReverse"
			this just lets me know whether i'm looking at the "outside" or "inside" of a garment
				a reversible garment will have a "configReverse" object that contains the info for the inside of the garment.
				"config" will always refert to the "outside"
	Return value
		success boolean

*/

//checkStyleNum Function Description
//check the style number. if it starts with
//BM, trim it down so the style number is just the number
function checkStyleNum(garObj,thisGarment,prop)
{
	var result = true;

	log.h("Beginning of checkStyleNum function for " + prop + "." + thisGarment + "::Style number is " + garObj.styleNo);

	if(!garObj.styleNo)
	{
		result = false;
		log.e("Failed to find a style number for " + garObj.garment);
		errorList.push("Sorry. Failed to find the style number for " + thisGarment);
	}
	else
	{
		if(garObj.styleNo.indexOf("B")==0)
		{
			garObj.styleNo = fixStyleNum(garObj.styleNo);
		}
		else
		{
			log.l("No need to update style number.");
		}
	}

	function fixStyleNum(num)
	{
		log.l("Updating styleNo. styleNo was " + num);
		num = num.substring(num.indexOf("B")+2,num.length);
		log.l("Changed styleNo to " + num);
		return num;
	}



	return result;
}