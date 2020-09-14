/*
	Component Name: check_for_reversible
	Author: William Dowling
	Creation Date: 20 April, 2017
	Description: 
		Check the json for a configReverse property
		If it exists, the garment is reversible
		set the lib.reversible boolean to true
	Arguments
		lib.json
	Return value
		success boolean

*/

function checkForReversible(json)
{
	log.h("Beginning execution of checkForReversible function.");
	var result = true;

	try
	{
		if(json.configReverse)
		{
			lib.reversible = true;
			log.l("This garment is reversible. Set lib.reversible to " + lib.reversible);
		}
		else
		{
			log.l("This garment is NOT reversible. lib.reversible = " + lib.reversible);
		}
	}
	catch(e)
	{
		errorList.push("An unknown error occurred.\nRef: Reversible Data Checker")
		log.e("The json data was invalid.");
		result = false;
	}

	log.l("End of checkForReversible function. Returning " + result);
	return result;
}