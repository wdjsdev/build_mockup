/*
	Component Name: new_garment
	Author: William Dowling
	Creation Date: 18 October, 2019
	Description: 
		create a new garment object for adult and youth, then push each to garmentsNeeded
	Arguments
		data
			JSON object from the builder data
			it will be a config.top or configReverse.bottom object etc
	Return value
		void

*/

function newGarment(config,data,designNumber)
{
	var womensCodePat = /w$/i;

	var adultGarment = {
		designNumber:"",
		code:"",
		style:"",
		colors:{}, //this comes straight from the config
		graphics:{} //this comes straight from the config
	}
	var youthGarment = {
		designNumber:"",
		code:"",
		style:"",
		colors:{}, //this comes straight from the config
		graphics:{} //this comes straight from the config
	}

	//if the config data does not have a mid value, check the missingMid object
	//to see if a relationship has been established between the "garment" property
	//of the config[top/bottom] object and a mid value.
	//if no relationship has been established, prompt the user for the mid value that
	//matches, and then save that relationship to the missingMid object for future use.
	if(!data.mid)
	{
		//strip the style number from the garment code
		var verboseGarmentCode = data.garment.replace(data.styleNo,"");
		verboseGarmentCode = verboseGarmentCode.substring(0,verboseGarmentCode.lastIndexOf("-"));
		data.mid = checkForMidGarmentRelationship(verboseGarmentCode);
	}
	
	adultGarment.style = youthGarment.style = data.styleNo;
	adultGarment.colors = youthGarment.colors = data.colors;
	adultGarment.graphics = youthGarment.graphics = config.graphics;
	adultGarment.designNumber = youthGarment.designNumber = designNumber;
	adultGarment.code = data.mid;
	if(womensCodePat.test(data.mid))
	{
		youthGarment.code = data.mid.replace(womensCodePat,"G");
	}
	else
	{
		youthGarment.code = data.mid + "Y";
	}

	//locate the mockup/ct folders
	adultGarment.folder = locateCTFolder(adultGarment.code);
	youthGarment.folder = locateCTFolder(youthGarment.code);

	//push the garment to garmentsNeeded
	if(adultGarment.folder)
	{
		garmentsNeeded.push(adultGarment);
	}
	else
	{
		errorList.push("Failed to find a Converted Templates folder or a Mockup folder for " + adultGarment.code);
	}

	if(adultGarment.folder)
	{
		garmentsNeeded.push(youthGarment);
	}
	else
	{
		errorList.push("Failed to find a Converted Templates folder or a Mockup folder for " + youthGarment.code);
	}
}