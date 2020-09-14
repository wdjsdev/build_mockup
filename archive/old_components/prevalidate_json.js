/*
	Component Name: prevalidate_json
	Author: William Dowling
	Creation Date: 08 March, 2017
	Description: 
		Check the json data to ensure it is formatted properly.
		Design numbers from the old builder will be invalid
		Loop all the properties of the object and then attempt to verify
			any property that contains the string "config".
	Arguments
		the builder generated json object
	Return value
		success boolean

*/

//preValidateJson Function Description
//read through the json data and determine how to handle the rest of the script
//find out whether the garment is a top or bottom
//look at the available properties and ensure that the script does not attempt to
//access non existent properties later that may cause runtime errors.
function preValidateJson(json)
{
	var result = true;

	log.h("Beginning execution of preValidateJson function.");

	//this is a counter variable to
	//determine whether at least one
	//config object was found in the json
	var configFound = 0;

	for(var prop in json)
	{
		if(prop.indexOf("onfig")>-1)
		{
			log.l("Beginning verify function for " + prop);
			if(!verify(json[prop]))
			{
				log.e("No garments were found for " + prop);
				if(prop == "config")
				{
					errorList.push("No garments were found for this design number.");
				}
				else if(prop == "configReverse")
				{
					errorList.push("No garments were found for the \"inside\" of this reversible jersey");
				}
				continue;
			}
			configFound++;
		}
	}

	if(configFound == 0)
	{
		log.e("Either the data is not in the correct format or no garments were found.");
		errorList.push("Sorry. This data is invalid. It appears this design number was generated with the old builder.::Please let William know about this issue.");
		result = false;
	}


	//verify Function Description
	//check that at least one garment is found in
	//the config object. Set boolean properties accordingly.
	function verify(config)
	{
		var localValid = true;

		var garmentsFound = 0;

		for(var pg=0;pg<lib.possibleGarments.length;pg++)
		{
			var thisGarment = lib.possibleGarments[pg];
			if(config[thisGarment])
			{
				config["needs" + thisGarment] = true;
				garmentsFound++;
			}
			else
			{
				config["needs" + thisGarment] = false;
			}
			log.l("needs" + thisGarment + " = " + config["needs" + thisGarment]);
		}

		if(garmentsFound == 0)
		{
			localValid = false
		}
	
		return localValid;
	}
	//check for valid json format
	//make sure this json wasn't created with 
	//the format from the old builder.

	//////////////////
	//Legacy Version//
	////Do Not Use////
	//////////////////
	//the below has been deprecated in favor of a more versatile loop
	//that will allow for reversible uniforms to be handled properly
		/*
		if(json.config)
		{
			//json is valid
			//check for top/bottom needed
			if(!json.config.top)
			{
				log.l("No top was found for this design number. Setting json.config.needsTop to false.");
				json.config.needsTop = false;
			}
			if(!json.config.bottom)
			{
				log.l("No bottom was found for this design number. Setting json.config.needsBottom to false.");
				result.bottom = false;
			}
			if(!json.config.needsTop && !json.config.needsBottom)
			{
				errorList.push("There were no proper garments found in the builder data. Please alert William of this error.");
				log.e("No valid garments were found for design number: " + lib.designNumber);
				result.valid = false;
			}
			else
			{
				log.l("Json is valid and at least one garment was found.")
				log.l("json.config.top = " + json.config.top);
				log.l("json.config.bottom = " + json.config.bottom);
				result.valid = true;
			}
		}
		else
		{
			errorList.push("Sorry, the data for that design number is not valid. It's likely from the old builder. You're on your own for this one.");
			log.e("This json is not valid. It was likely generated from the old builder. Cannot proceed.")
			result.valid = false
		}*/
	//////////////////
	//Legacy Version//
	////Do Not Use////
	//////////////////

	log.l("End of preValidateJson function.::Returning " + result + "\n");
	return result;
}