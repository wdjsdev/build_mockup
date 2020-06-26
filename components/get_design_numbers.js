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
	var fillinDesignNumbers = []; //list of design numbers that were identified as fillins
	var curLine,lineOptions,curOption,previousDesignNumber,curDesignNumber;

	for(var odl=0,len=orderData.lines.length;odl<len;odl++)
	{
		curLine = orderData.lines[odl];
		if(curLine.item.toLowerCase().indexOf("fillin")>-1)
		{
			if(previousDesignNumber)
			{
				fillinDesignNumbers.push(previousDesignNumber);
			}
			previousDesignNumber = undefined;
			continue;
		}
		lineOptions = curLine.options;
		for(var lo=0,optLen=lineOptions.length;lo<optLen;lo++)
		{
			curOption = lineOptions[lo];
			if(curOption.name && curOption.name === "Design" && curOption.value && curOption.value !== "")
			{
				curDesignNumber = curOption.value;
				// tmpDesignNumbers.push(curOption.value);
			}
		}
		if(curDesignNumber)
		{
			tmpDesignNumbers.push(curDesignNumber);
			previousDesignNumber = curDesignNumber;
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

	//trim any fillin design numbers
	for(var f = result.length - 1; f>=0; f--)
	{
		if(fillinDesignNumbers.indexOf(result[f])>-1)
		{
			result.splice(f,1);
		}
	}
	

	//prompt the user to choose which design numbers
	//they want to process
	result = chooseDesignNumbers(result);
	
	return result;
}