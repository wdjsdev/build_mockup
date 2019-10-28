/*
	Component Name: get_order_number
	Author: William Dowling
	Creation Date: 17 October, 2019
	Description: 
		prompt the user for the order number and validate response
	Arguments
		none
	Return value
		string representing order number
		or undefined if user cancels

*/

function getOrderNumber()
{
	var result,proceed = true;
	var validOrderNumberRegex = /[\d]{7}/;

	while(proceed)
	{
		result = uiPrompt("Enter the Order Number","Order Number");
		if(!result)
		{
			valid = false;
			proceed = false;
		}
		else
		{
			if(!validOrderNumberRegex(result))
			{
				alert("Invalid order number. Try again.");
			}
			else
			{
				proceed = false;
			}
		}
	}

	return result;
}