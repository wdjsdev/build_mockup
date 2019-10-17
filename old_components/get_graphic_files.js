/*
	Component Name: get_graphics
	Author: William Dowling
	Creation Date: 24 March, 2017
	Description: 
		find the location of, and get the file for
		the given graphic object
	Arguments
		graphic object
		string representing style number
	Return value
		success boolean

*/

function getGraphicFiles(graphicObj,styleNo)
{
	var result = true;
	
	log.h("Beginning execution of getGraphicFiles function for " + graphicObj.name);

	var graphicCode = graphicObj.name.substring(0,graphicObj.name.indexOf("-"));

	//determine the graphic folder
	var folder;

	switch(graphicCode.toLowerCase())
	{
		case "fds":
			//check whether this graphic is a ghosted mascot
			if(styleNo.toLowerCase().indexOf("g")>-1)
			{
				log.l("This graphic is a ghosted mascot. Setting the folder to " + lib.ghostedMascotsPath + ".");
				log.l("Trimming the \"G\" from the style number.");
				folder = new Folder(lib.ghostedMascotsPath);
				styleNo = styleNo.substring(0,styleNo.toLowerCase().indexOf("g"));
			}
			//check whether the style number has PNT on the end of it
			//if so, trim it off
			else
			{
				if(styleNo.toLowerCase().indexOf("pnt")>-1)
				{
					log.l("This graphic is a pnt graphic. Trimming the PNT from the style number");
					styleNo = styleNo.substring(0,styleNo.toLowerCase().indexOf("pnt"));
				}
				folder = new Folder(lib.subGraphicsPath);
			}
			break;
	
		case "fdsn":
		case "fdsp":
			folder = new Folder(lib.subNameNumbersPath);

			////////////////////////
			////////ATTENTION://////
			//
			//		update this graphic code to use hyphens instead of underscores
			//		whenever the graphics library is updated
			//
			////////////////////////
			graphicCode = "FDSP_FDSN_";
			break;

		case "fdsm":
			folder = new Folder(lib.mascotsPath);
			break;

		case "spressn8":
			graphicObj.pressNumSize = "8";
			folder = new Folder(lib.authenticPressNumbersPath);
			break;

		case "spressn6":
			graphicObj.pressNumSize = "6";
			folder = new Folder(lib.authenticPressNumbersPath);
			break;

		case "bauspgr":
			folder = new Folder(lib.authenticSPGraphicsPath);
			break;

		case "bautwgr":
			folder = new Folder(lib.authenticTWGraphicsPath);
			break;

		case "bautwnum":
			folder = new Folder(lib.authenticTWNumbersPath);
			break;

		case "bauembgr":
			folder = new Folder(lib.authenticEMBGraphicsPath);
			break;

		default:
			log.e("the code: " + code + " was not found in the switch statement. Skipping " + name + ".");
			result = false;
			errorList.push("Failed to determine the folder location for " + graphicCode + ".");
	}

	log.l("End of get folder switch statement. folder = " + folder);

	if(valid)
	{
		var specMsg = "Please select the correct graphic file for " + graphicCode + "_" + styleNo + ".";

		////////////////////////
		////////ATTENTION://////
		//
		//		before sending this live, fix all the graphic file naming conventions
		//		to match the garments naming convention, ie. FDS_1003 or FDSN-FDSP_1005
		//		all style numbers should be preceded by an underscore, not a hyphen
		//
		////////////////////////

		//check whether this graphic is a screen pressed number
		//if so, update the search term as necessary to avoid dialog
		if(!graphicObj.pressNumSize)
		{
			var searchTerm = "_" + styleNo + ".";
		}
		else if(graphicObj.pressNumSize == "6")
		{
			var searchTerm = "N6_" + styleNo + ".";

			log.l("This graphic is a 6 inch press number. Setting the search term to " + searchTerm);
		}
		else if(graphicObj.pressNumSize = "8")
		{
			var searchTerm = "N8_" + styleNo + ".";

			log.l("This graphic is an 8 inch press number. Setting the search term to " + searchTerm);
		}

		var graphicFile = getMatches(folder,searchTerm,"file",graphicCode,true,styleNo,specMsg)


		if(!graphicFile)
		{
			log.e("getMatches function returned false. " + graphicCode + "_ " + styleNo + " has been skipped.")
			result = false;
		}
		else
		{
		 	graphicObj.files.push(graphicFile.fullName);
		 	log.l("Successfully set the graphic file to " + graphicFile.fullName);
		}
	}


	return result;

}
