/*
	Component Name: get_json
	Author: William Dowling
	Creation Date: 08 March, 2017
	Description: 
		Check lib.designFilePath folder for the existence of
		a json file that matches the desired design number.
		save eval'd json to lib.json
	Arguments
		design number
	Return value
		success boolean

*/


function getJson(num)
{
	var result = true;

	var path = lib.designFilePath;

	log.h("Beginning execution of getJson function with the design number: " + num);
	

	var theFile = new File(path + "/" + num + ".json");


	if(!theFile.exists)
	{
		//no file using this design number exists.
		errorList.push("Sorry. That design number was not found..");
		log.e("The design number: " + num + " was not found in the script resources folder.");
		result = false;

		//////////////////
		//Legacy Version//
		////Do Not Use////
		//////////////////
		//this method of automatically generating the json data works fine locally, but did not work in production
		//fswatch on the hot folder only worked when i made a change to the hot folder. changes by other users were ignored.. =(
			// errorList.push("I attempted to create the necessary design file. Please try again.");
			// generateJson(num);
		

	}
	else
	{
		//design id was found.
		//read and eval the contents
		//save the contents to result.
		theFile.open();
		var contents = "(" + theFile.read() + ")";
		theFile.close();

		contents = eval(contents);
		lib.json = contents;
		log.l("json file exists and was successfully evaluated.");
	}

	log.l("End of getJson function, returning " + result);
	return result;
}
