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
	log.h("Beginning loopDesignNumbers()");
	var curBuilderData,curDesignNumber;
	var rev;
	var config;

	for(var dn=0,len=designNumbers.length;dn<len;dn++)
	{
		rev = false;
		curDesignNumber = designNumbers[dn];
		log.l("Processing design number: " + curDesignNumber);
		if(curDesignNumber === "")
		{
			log.l("Empty design number. skippit");
			continue;
		}
		curBuilderData = undefined;
		curBuilderData = getBuilderData(curDesignNumber);
		if(!curBuilderData)
		{
			log.e("Netsuite did not respond.");
			errorList.push("Netsuite did not respond with any data. Please try again in a minute.");
			errorList.push(curDesignNumber + " has been skipped.");
			continue;
		}

		if(curBuilderData.config && curBuilderData.configReverse)
		{
			log.l("This is a reversible garment.")
			rev = true;
		}

		config = curBuilderData.config;
		processConfig(config,"_A");

		if(curBuilderData.configReverse)
		{
			//set the mid values of the configReverse object
			//to match the mid values of the config object
			//for some reason the builder outputs incorrect
			//mid values (FD-219W) for some garments
			if(curBuilderData.configReverse.top)
			{
				curBuilderData.configReverse.top.mid = curBuilderData.config.top.mid;
			}
			if(curBuilderData.configReverse.bottom)
			{
				curBuilderData.configReverse.bottom.mid = curBuilderData.config.bottom.mid;
			}



			
			curBuilderData.configReverse.reverse = true;
			processConfig(curBuilderData.configReverse,"_B");
		}
	}

	function processConfig(config,fileSuffix)
	{
		var topGarment,bottomGarment;
		if(config.top)
		{
			topGarment = new Garment(config,config.top,curDesignNumber,fileSuffix);
			topGarment.fileSuffix = rev ? fileSuffix : "";
			topGarment.init();
			topGarment.suffix = getSuffix(config,"_Top");
			garmentsNeeded.push(topGarment);
		}
		if(config.bottom)
		{
			bottomGarment = new Garment(config,config.bottom,curDesignNumber,fileSuffix);
			bottomGarment.fileSuffix = rev ? fileSuffix : "";
			bottomGarment.init();
			bottomGarment.suffix = getSuffix(config,"_Bot");
			garmentsNeeded.push(bottomGarment);
		}
	}

	function getSuffix(config,topbot)
	{
		var suffix = "";
		var topAndBot = (config.top && config.bottom) ? topbot : "";
		var rev = config.reverse ? "_B" : "";
		suffix = topAndBot + rev;
		return suffix;
	}
	

}