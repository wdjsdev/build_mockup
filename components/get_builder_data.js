/*
	Component Name: get_builder_data
	Author: William Dowling
	Creation Date: 18 October, 2019
	Description: 
		curl builder data from netsuite and return resulting object
	Arguments
		designNumber
			string representing the desired design number
	Return value
		builder data object

*/

function getBuilderData(designNumber)
{
	var result = curlData(NBD,designNumber);
	if(!result)
	{
		log.e("Failed to get the builder data for design number: " + designNumber);
		errorList.push("Failed to get the builder data for design number: " + designNumber);
		valid = false;
	}
	return result;
}