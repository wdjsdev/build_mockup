/*
	Component Name: pattern_style_converter
	Author: William Dowling
	Creation Date: 26 November, 2019
	Description: 
		convert "id" from builder data to 4 digit style number
		used in the library for easier location of pattern files
	Arguments
		id
			string representing the id code of the pattern from the builder
			i.e. "zig-zag-3v"
	Return value
		"1234"
			string representing 4 digit style number for the given graphic

*/

function patternStyleConverter(id)
{
	var result,dbFile,dbContents;

	//include the database
	try
	{
		eval("#include \"" + PSN + "\"");
		log.l("Found the pattern id style number database.");	
	}
	catch(e)
	{
		var dbFile = File(PSN);
		dbFile.open("w");
		dbFile.write("var patternIds = {};");
		dbFile.close();
		eval("#include \"" + PSN + "\"");
		log.l("No graphic folder location database existed. Created a new one.");
	}

	if(patternIds[id])
	{
		result = patternIds[id];
	}
	else
	{
		result = uiPrompt("Please enter the 4 digit style number for the pattern id: " + id);
		patternIds[id] = result;
		writeDatabase(PSN,"var patternIds = " + JSON.stringify(patternIds));
	}
	return result;

}