/*
	Component Name: generate_json
	Author: William Dowling
	Creation Date: 27 March, 2017
	Description: 
		If no json data was found in the design files folder,
		create a new file with the desired design number in the
		hot folder and then pause to see whether the json file is
		properly downloaded and saved.
	Arguments
		design number
	Return value
		the desired json file
		or null if no file was generated

*/

//generateJson Function Description
//
function generateJson(designNumber)
{

	var result = false;

	var hotFolder = new Folder("/Volumes/Customization/Library/Scripts/Script Resources/Data/json_hotfolder");
	var newFile = new File(hotFolder + "/" + designNumber);
	newFile.open("w");
	newFile.write(designNumber);
	newFile.close();
	
}
// generateJson("Je11vwfUuBFS");