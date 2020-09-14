/*
	Component Name: verify_graphic_info
	Author: William Dowling
	Creation Date: 14 April, 2017
	Description: 
		verify the graphic info for each graphic in the given config object
		find graphic files in the library
		push files to lib.filesToOpen array
	Arguments
		config object
		config name ("config" or "configReverse")
	Return value
		success boolean

*/

function verifyGraphicInfo(config,prop)
{
	log.h("Beginning execution of verifyGraphicInfo function." + 
		"::Beginning execution of verifyGraphicInfo function." + 
		"::Beginning execution of verifyGraphicInfo function.");
	var result = true;

	var graphics = config.graphics;

	//verify the graphics object exists
	//this should never fail, an empty graphics object is created even if
	//no graphics are chosen in the builder. but let's be safe, eh?
	if(graphics)
	{
		//graphics object exists. loop the graphics in the object
		//and try to get a file for each.
		for(var thisGraphic in graphics)
		{
			log.l("::Starting loop for " + prop + ".graphics." + thisGraphic);

			var graphicObj = graphics[thisGraphic];	
			var styleNo = graphicObj.name.substring(graphicObj.name.indexOf("-")+1,graphicObj.name.length);

			//determine whether the graphic is needed
			var graphicNeeded = true;

			switch(styleNo.toLowerCase())
			{
				case "onfile":
				case "provided":
				case "custom":
					graphicNeeded = false;
					msgList.push("Sorry, the graphic " + thisGraphic + " is up to you.");
					break;
				default:
					log.l(thisGraphic + " is a stock graphic. Proceeding to look for this file in the library.");
			}

			if(!graphicNeeded)
			{
				log.l("This graphic is the responsibility of the artist.");
				continue;
			}
			else
			{
				graphicObj.files = [];
				if(!getGraphicFiles(graphicObj,styleNo))
				{
					log.e("getGraphicFiles function returned false.");
					continue;
				}
			}


			//commenting the below for testing on split filesToOpen arrays
			//one for mockups and another for graphics
			// lib.filesToOpen.push(graphicObj);
			lib.graphicsToOpen.push(graphicObj);
			
		}
	}
	else
	{
		log.e("No graphics object found in lib." + prop + ".");
		errorList.push("Something was wrong with the data. The graphics data is missing.");
		errorList.push("Please let William know about this issue.");
		result = false;
	}


	return result;
}
