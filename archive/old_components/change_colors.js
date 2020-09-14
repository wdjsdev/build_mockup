/*
	Component Name: change_colors
	Author: William Dowling
	Creation Date: 03 April, 2017
	Description: 
		swap all the placeholder colors (C1, C2 etc) with appropriate boombah swatches
	Arguments
		colors object for the current graphic
	Return value
		success boolean

*/

//changeColors Function Description
//
function changeColors(colors)
{

	var result = true;	

	var docRef = app.activeDocument;
	var swatches = docRef.swatches;
	var layers = docRef.layers;

	//make sure that layer[0] is not locked or hidden;
	layers[0].locked = false;
	layers[0].visible = true;

	docRef.selection = null;

	//swatch name to hex converter
	var swatchHexConverter = 
	{
		"Black B": "426c61636b2042",
		"White B": "57686974652042",
		"Gray 2 B": "4772617920322042",
		"Steel B": "537465656c2042",
		"Navy 2 B": "4e61767920322042",
		"Royal Blue B": "526f79616c20426c75652042",
		"Columbia B": "436f6c756d6269612042",
		"Cyan B": "4379616e2042",
		"Teal B": "5465616c2042",
		"Dark Green B": "4461726b20477265656e2042",
		"Kelly Green B": "4b656c6c7920477265656e2042",
		"Lime Green B": "4c696d6520477265656e2042",
		"Yellow B": "59656c6c6f772042",
		"Optic Yellow B": "4f707469632059656c6c6f772042",
		"Athletic Gold B": "4174686c6574696320476f6c642042",
		"Vegas Gold B": "566567617320476f6c642042",
		"Orange B": "4f72616e67652042",
		"Texas Orange B": "5465786173204f72616e67652042",
		"Red B": "5265642042",
		"Cardinal B": "43617264696e616c2042",
		"Maroon B": "4d61726f6f6e2042",
		"Hot Pink B": "486f742050696e6b2042",
		"Pink B": "50696e6b2042",
		"Soft Pink B": "536f66742050696e6b2042",
		"Purple B": "507572706c652042",
		"Flesh B": "466c6573682042",
		"Dark Flesh B": "4461726b20466c6573682042",
		"Brown B": "42726f776e2042",
		"FLO ORANGE B": "464c4f204f52414e47452042",
		"FLO YELLOW B": "464c4f2059454c4c4f572042",
		"FLO PINK B": "464c4f2050494e4b2042",
		"Twitch B": "5477697463682042",
		"MINT B": "4d494e542042",
		"NEON CORAL B": "4e454f4e20434f52414c2042",
		"FLAME B": "464c414d452042",
		"Magenta B": "4d6167656e74612042",
		"BRIGHT PURPLE B": "42524947485420505552504c452042",
		"Dark Charcoal B": "4461726b2043686172636f616c2042"
	}

	log.l("Looping the colors object:")
	for(var thisColor in colors)
	{
		log.l("beginning loop for " + thisColor);

		var curColor = colors[thisColor];
		var colorCode = curColor.colorCode;
		var swatchName = swatchLibrary[colorCode].name;

		log.l("swatchName = " + swatchName);

		verifySwatch(swatchName);
		verifySwatch(thisColor);

		var len = swatchName.length;
		var swatchHexValue = swatchHexConverter[swatchName];

		if(!swatchHexValue)
		{
			log.e("failed to get a proper hex value for: " + swatchName);
			errorList.push("Failed to change the color for " + thisColor);
			continue;
		}

		//create a temporary rectangle to facilitate selecting all of a particular color
		var tempRect = docRef.pathItems.rectangle(0,0,5,5);
		tempRect.stroked = false;
		tempRect.fillColor = swatches[thisColor].color;

		//select same fill color
		app.executeMenuCommand("Find Fill Color menu item");

		//create an action that sets the fill color of all
		//currently selected objects to swatchName
		createApplySwatchAction(swatchHexValue,len);

		app.doScript("merge","Apply Swatch");

		//delete temporary rectangle
		tempRect.remove();
		docRef.selection = null;

		try
		{
			app.unloadAction("Apply Swatch","");
		}
		catch(e)
		{
			log.l("Failed to unload the apply swatch action.. That probably means the action didn't get created properly..");
		}

	}
	log.l("end of colors loop.\n");
	

	//applySwatchAction Function Description
	//build a dyanmic action to apply a particular swatch
	//to the selected art.
	function createApplySwatchAction(swatchHexValue,len)
	{
		var localValid = true;

		var dest = new Folder("~/Documents");
		var actionFile = new File(dest + "/merge_swatches.aia" );

		var actionString =
		[
			"/version 3",
			"/name [ 12",
			"4170706c7920537761746368",
			"]",
			"/isOpen 1",
			"/actionCount 1",
			"/action-1 {",
			"/name [ 5",
			"6d65726765",
			"]",
			"/keyIndex 0",
			"/colorIndex 0",
			"/isOpen 1",
			"/eventCount 1",
			"/event-1 {",
			"/useRulersIn1stQuadrant 0",
			"/internalName (ai_plugin_swatches)",
			"/localizedName [ 8",
			"5377617463686573",
			"]",
			"/isOpen 0",
			"/isOn 1",
			"/hasDialog 0",
			"/parameterCount 1",
			"/parameter-1 {",
			"/key 1937204072",
			"/showInPalette 4294967295",
			"/type (ustring)", 
			"/value [ " + len,
			//this is the value to change for each swatch
			swatchHexValue,
			"]",
			"}",
			"}",
			"}"
		].join("\n");

		actionFile.open("w");
		actionFile.write(actionString);
		actionFile.close();
		

		app.loadAction(actionFile);

		return localValid
	}

	//verifySwatch Function Description
	//check that this swatch exists in the swatches panel.
	//if not, create one.
	function verifySwatch(swatchName)
	{
		log.l("beginning of verifySwatch function.");
		try
		{
			log.l(swatchName + " swatch already existed.");
			swatches.getByName(swatchName);
		}
		catch(e)
		{
			log.l(swatchName + " did not exist. Creating the swatch.");
			var swatchInfo = swatchLibrary[colorCode];
			var newSwatchColor = new CMYKColor();
			newSwatchColor.cyan = swatchInfo.c;
			newSwatchColor.magenta = swatchInfo.m;
			newSwatchColor.yellow = swatchInfo.y;
			newSwatchColor.black = swatchInfo.k;

			var newSpot = docRef.spots.add();
			newSpot.name = swatchName;
			newSpot.color = newSwatchColor;

			var newSwatch = new SpotColor();
			newSwatch.colorType = ColorModel.SPOT;
			newSwatch.spot = newSpot;
		}
	}


	docRef = null;
	swatches = null;

	return result;





	//////////////////
	//Legacy Version//
	////Do Not Use////
	//////////////////
		//deprecating the below because it fails if two separate placeholder
		//swatches need to have the same production swatch applied, this
		//method fails because it attempts to rename the second placeholder
		//swatch with a swatch name that already exists.
		//opting for a dynamic action that mimics the merge swatches functionality.

		// for(var color in colors)
		// {
		// 	var thisColor = colors[color];
		// 	var colorCode = thisColor.colorCode;
		// 	var libraryInfo = swatchLibrary[colorCode];

		// 	try
		// 	{
		// 		//get the placeholder swatch from the swatches panel
		// 		var thisSwatch = swatches[color];
		// 	}
		// 	catch(e)
		// 	{
		// 		log.l(color + " swatch didn't exist. Alerting the user and continuing.");
		// 		errorList.push("Tried to change the swatch " + color + ", but it didn't exist.. " + color + " has been skipped.");
		// 		continue;
		// 	}
		// 	try
		// 	{
		// 		//rename the swatch
		// 		thisSwatch.name = libraryInfo.name;	
		// 	}
		// 	catch(e)
		// 	{
		// 		errorList.push("Failed to change the color for " + color);
		// 		errorList.push(libraryInfo.name + " already exists in the swatches panel, so a new swatch can't be made with that name.");
		// 		errorList.push("The mockup file will need to be manually fixed so this will work in the future.");
		// 		log.e(libraryInfo.name + " already existed in the swatches panel, therefore the existing " + color + " swatch couldn't be renamed.");
		// 		continue;
		// 	}
			
			
		// 	colorInfo = thisSwatch.color.spot.color;
		// 	colorInfo.cyan = libraryInfo.c;
		// 	colorInfo.magenta = libraryInfo.m;
		// 	colorInfo.yellow = libraryInfo.y;
		// 	colorInfo.black = libraryInfo.k;

		// 	log.l("Successfully set the name of " + color + " swatch to " + thisSwatch.name);

		// }
	//////////////////
	//Legacy Version//
	////Do Not Use////
	//////////////////
}