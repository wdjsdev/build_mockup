/*
	Component Name: check_for_mid_garment_relationship
	Author: William Dowling
	Creation Date: 18 October, 2019
	Description: 
		
	Arguments
		garment
			the verbose/descriptive garment code
			i.e. the "garment code" for FD-161 is "FD-SLOW-SS"
	Return value
		mid value


*/

function checkForMidGarmentRelationship(garment)
{
	var result;
	eval("#include \"" + MGR + "\"");

	if(midRelationships[garment])
	{
		return midRelationships[garment];
	}
	
	//no relationship previously established. prompt the user
	//and then overwrite the database to include the new relationship.
	var midRelationshipDialog = new Window("dialog","Enter Garment Code for: " + garment);
		var inputGroup = UI.group(midRelationshipDialog);
			inputGroup.orientation = "column";
			var topTxt = UI.static(inputGroup,"Please enter the appropriate garment code for " + garment + ".");
			var input = UI.edit(inputGroup,"e.g. FD-161",10);
				input.addEventListener("keydown",function(k)
				{
					if(k.keyName === "Enter")
					{
						submitFunction();
					}
				})
		var btnGroup = UI.group(midRelationshipDialog);
			btnGroup.orientation = "row";
			var submit = UI.button(btnGroup,"Submit",submitFunction);
	midRelationshipDialog.show();

	midRelationships[garment] = result;
	writeDatabase(MGR,"var midRelationships = " + JSON.stringify(midRelationships));

	return result;

	function submitFunction()
	{
		var properGarmentCodeRegex = /[FPB][DSM][-_][\d]{3,}/;
		if(!properGarmentCodeRegex.test(input.text))
		{
			alert("Incorrect garment code format. Please try again.");
		}
		else
		{
			result = input.text.toUpperCase().replace("_","-");
			midRelationshipDialog.close();
		}
	}
	
}