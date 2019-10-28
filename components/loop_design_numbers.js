/*
	Component Name: loop_design_numbers
	Author: William Dowling
	Creation Date: 18 October, 2019
	Description: 
		process each design number to determine all the relevant
		garment information. push all garment info (including necessary graphics)
		to the global garmentsNeeded array as an object in the following format
	Arguments
		none
	Return value
		void

*/

function loopDesignNumbers()
{
	var curBuilderData,curDesignNumber;
	var config,curGarment;

	for(var dn=0,len=designNumbers.length;dn<len;dn++)
	{
		curDesignNumber = designNumbers[dn];
		curBuilderData = undefined;
		curBuilderData = getBuilderData(curDesignNumber);
		if(!curBuilderData)
		{
			errorList.push("Failed to find the builder data for design number: " + curDesignNumber);
			errorList.push("This design number has been skipped.");
			continue;
		}

		config = curBuilderData.config;
		processConfig(config);

		if(curBuilderData.configReverse)
		{
			processConfig(curBuilderData.configReverse);
		}

		//temporary exit
		break;
	}

	function processConfig(config)
	{
		if(config.top)
		{
			newGarment(config,config.top,curDesignNumber);
		}
		if(config.bottom)
		{
			newGarment(config,config.bottom,curDesignNumber);
		}
	}
	

}