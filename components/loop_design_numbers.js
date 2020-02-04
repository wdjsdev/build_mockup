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
		if(curDesignNumber === "")
		{
			continue;
		}
		curBuilderData = undefined;
		curBuilderData = getBuilderData(curDesignNumber);
		if(!curBuilderData)
		{
			errorList.push("Netsuite did not respond with any data. Please try again in a minute.");
			errorList.push(curDesignNumber + " has been skipped.");
			continue;
		}

		config = curBuilderData.config;
		processConfig(config);

		if(curBuilderData.configReverse)
		{
			processConfig(curBuilderData.configReverse);
		}
	}

	function processConfig(config)
	{
		if(config.top)
		{
			// newGarment(config,config.top,curDesignNumber);
			curGarment = new Garment(config,config.top,curDesignNumber);
			curGarment.init();
			garmentsNeeded.push(curGarment);
		}
		if(config.bottom)
		{
			// newGarment(config,config.bottom,curDesignNumber);
			curGarment = new Garment(config,config.bottom,curDesignNumber);
			curGarment.init();
			garmentsNeeded.push(curGarment);
		}
	}
	

}