/*
	Component Name: get_gar_info
	Author: William Dowling
	Creation Date: 10 March, 2017
	Description: 
		Get the garment information from the lib.json object
		Get values for style number and garment name
		Validate results
		Return object containing info for top and bottom
			null if not needed

	Arguments
		lib.json
	Return value
		success boolean
*/

function getGarInfo(json)
{
	log.h("Beginning execution of getGarInfo function.");
	var result = true;

	for(var prop in json)
	{
		if(prop.indexOf("onfig")>-1)
		{
			log.l("doing something")
		}
	}

	//////////////////
	//Legacy Version//
	////Do Not Use////
	//////////////////
	//commenting hte below in favor of a more inclusive strategy
	//that allows for reversible uniforms
		/*//loop to check json for data regarding top and bottom
		for(var topBot in result)
		{
			//check whether the json has an entry for topBot
			if(json.config[topBot])
			{
				//set the style number
				result[topBot].styleNum = json.config[topBot].styleNo;
				log.l("set result." + topBot + ".styleNum to " + json.config[topBot].styleNo);

				//set the garment name
				var thisName = json.config[topBot].garment;
				thisName = thisName.substring(0,thisName.lastIndexOf("-"));
				result[topBot].garName = thisName;
				log.l("set result." + topBot + ".garName to " + thisName);
			}
			else
			{
				log.l("no " + topBot + " needed. Setting result." + topBot + " to null and continuing.");
				result[topBot] = null;
				continue;
			}
		}*/
	//////////////////
	//Legacy Version//
	////Do Not Use////
	//////////////////

	if(!result.top && !result.bottom)
	{
		log.e("No top or bottom found. Setting result to undefined.::This error should have been caught in prevalidateJson function...");
		errorList.push("Sorry, it looks like no garments were found in the order data?");
		errorList.push("Alert William. Error occurred in getGarInfo.");
		result = undefined;
	}

	log.l("End of getGarInfo function. Returning " + result);

	return result;
}