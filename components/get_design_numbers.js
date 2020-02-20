/*
	Component Name: get_design_numbers
	Author: William Dowling
	Creation Date: 17 October, 2019
	Description: 
		curl the sales order data from netsuite
		parse the data that comes back and dig for all design numbers
		build an array of unique design numbers (no duplicates)
		return array of design numbers.
	Arguments
		none
	Return value
		array of design numbers

*/

function getDesignNumbers()
{
	log.h("Beginning execution of getDesignNumbers function.");
	var result;
	var tmpDesignNumbers = [];
	var curLine,lineOptions,curOption;

	for(var odl=0,len=orderData.lines.length;odl<len;odl++)
	{
		curLine = orderData.lines[odl];
		lineOptions = curLine.options;
		for(var lo=0,optLen=lineOptions.length;lo<optLen;lo++)
		{
			curOption = lineOptions[lo];
			if(curOption.name && curOption.name === "Design" && curOption.value && curOption.value !== "")
			{
				tmpDesignNumbers.push(curOption.value);
			}
		}
	}

	try
	{
		result = getUnique(tmpDesignNumbers);
	}
	catch(e)
	{
		log.e("Failed to get the unique items from tmpDesignNumbers.::e = " + e + "::tmpDesignNumbers = " + tmpDesignNumbers);
		errorList.push("Failed while parsing the design numbers.");
	}

	//prompt the user to choose which design numbers
	//they want to process
	result = chooseDesignNumbers(result);
	
	return result;
}