#target Illustrator
function test()
{
	var valid = true;
	//Production Utilities
	//eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.jsxbin\"");
	//eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Batch_Framework.jsxbin\"");
	
	//Dev Utilities
	eval("#include \"/Volumes/Macintosh HD/Users/will.dowling/Desktop/automation/utilities/Utilities_Container.js\"");
	eval("#include \"/Volumes/Macintosh HD/Users/will.dowling/Desktop/automation/utilities/Batch_Framework.js\"");




	//
	//general functions
	//

	//listbox = listbox object
	//items = array of strings
	function populateListbox(listbox,items)
	{
		//clear out the garment codes listbox
		for(var lb = listbox.items.length - 1; lb>=0; lb--)
		{
			listbox.remove(listbox.items[lb]);
		}

		items = getUnique(items);
		//add new garment codes
		for(var lb=0,len=items.length;lb<len;lb++)
		{
			listbox.add("item",items[lb]);
		}
	}

	function addGarmentCode()
	{
		var newGarmentCode;

		var gc = new Window("dialog","Enter the new garment code.");
			gc.orientation = "column";
			var topTxt = UI.static(gc,"Enter the garment code:");
			var gcInput = UI.edit(gc,"FD-1234",20);

			//cancel and submit buttons	
			var closeBtnGroup = UI.closeButtonGroup(gc,
				//submit button function
				function()
				{
					newGarmentCode = validateGarmentCode(gcInput.text);
					if(newGarmentCode)
					{
						gc.close();
					}
				},
				//cancel button function
				function()
				{
					newGarmentCode = undefined;
					gc.close();
				})

		gc.show();

		return newGarmentCode;
	}

	function addArtworkLocation()
	{
		for(var loc in BUILDER_GRAPHIC_LOCATION_CODES)
		{
			artworkLocations.push(loc);
		}
		var newArtworkLocation;
		
		var al = new Window("dialog","Enter the artwork sizing standards.");
			al.orientation = "column";

			var topTxt = UI.static(al,"Enter the artwork sizing standards in inches:");

			var inputGroup = UI.group(al);
				var ddGroup = UI.group(inputGroup);
					ddGroup.orientation = "row";
					var locDropdownTxt = UI.static(ddGroup,"Select a Location:");
					var locDropdown = UI.dropdown(ddGroup,artworkLocations);
						locDropdown.selection = 0;

				var dimGroup = UI.group(inputGroup);
					dimGroup.orientation = "column";
					var wGroup = UI.group(dimGroup);
						wGroup.orientation = "row";
						var wLabel = UI.static(wGroup,"Standard Width:")
						var widthInput = UI.edit(wGroup,"12",4)

					var hGroup = UI.group(dimGroup);
						hGroup.orientation = "row";
						var hLabel = UI.static(hGroup,"Standard Height:");
						var heightInput = UI.edit(hGroup,"12",4);

			var closeButtonGroup = UI.closeButtonGroup(al,
				//submit function
				function()
				{
					if(!locDropdown.selection)
					{
						alert("Please select an artwork location from the dropdown list.");
						return;
					}
					if(!widthInput || !heightInput)
					{
						alert("Please enter standard width and height.");
						return;
					}
					newArtworkLocation = validateLocationInput(locDropdown.selection.text,widthInput.text,heightInput.text);

					if(newArtworkLocation)
					{
						al.close();
					}

				},
				//cancel function
				function()
				{
					newArtworkLocation = undefined;
					al.close();
				})

		al.show();

		return newArtworkLocation;
	}

	function validateGarmentCode(input)
	{
		var result;
		var pat = /[fpb][dsm][-_][\d]{3,}[a-z]*/i;
		if(pat.test(input))
		{
			result = input;
			result = result.replace("_","-").toUpperCase()
		}
		else
		{
			alert("Please enter a valid garment code.\neg. FD-5411, FD-161G, PS-5075Y");
		}
		return result;

	}

	function validateLocationInput(locLabel,w,h)
	{
		var newLoc = {};
		newLoc.label = locLabel;
		newLoc.w = w.replace(/[a-z]/ig,"");
		newLoc.h = h.replace(/[a-z]/ig,"");
		newLoc.code = BUILDER_GRAPHIC_LOCATION_CODES[locLabel];
		return newLoc;
	}




	function submitDialog()
	{
		if(overwriteDatabase)
		{
			alert("Database successfully overwritten.");
		}
		glw.close();
	}

	function closeDialog()
	{
		glw.close();
	}









	var overwriteDatabase = false;
	
	var sportsArray = [];
	var garmentCodes = [];
	var artworkLocations = [];

	const LISTBOX_DIMENSIONS = [0,0,200,200];

	// var databasePath = dataPath + "build_mockup_data/graphic_locations_and_sizing_database.js";
	var databasePath = desktopPath + "automation/build_mockup/resources/graphic_locations_and_sizing_database.js";
	eval("#include \"" + databasePath + "\"");

	//shortened variable for ease of use
	var db = graphicLocationsAndSizing;

	for(var prop in db)
	{
		sportsArray.push(prop);
	}

	for(var prop in db["ACCESSORIES"])
	{
		garmentCodes.push(prop);
	}

	//dialog definition
	var glw = UI.window("dialog","Graphic Locations and Sizing Database");
		
		var sportGroup = UI.group(glw);
			sportGroup.orientation = "row";

			var sportLabelTxt = UI.static(sportGroup,"Sport: ");
			//select the sport
			var sportDropdown = UI.dropdown(sportGroup,sportsArray);
				sportDropdown.selection = 0;
		
		UI.hseparator(glw);
		
		//group for everything between the sport dropdown and the button group at the bottom
		var mainBodyGroup = UI.group(glw);
			mainBodyGroup.orientation = "row";


			//listbox of garment codes for the given sport
			var garmentCodesGroup = UI.group(mainBodyGroup);
				garmentCodesGroup.orientation = "column";
				var garmentCodesListbox = UI.listbox(garmentCodesGroup,LISTBOX_DIMENSIONS,garmentCodes);
				var addGarmentCodeBtn = UI.button(garmentCodesGroup,"Add",function()
				{
					//add a new garment code to the list
					//open a dialig prompting user for the new element
					//validate the response and if valid, trigger database
					//overwrite and close dialog.
					//add the new element to the garmentCodes listbox



					//check that the necessary selections have been made
					if(!sportDropdown.selection)
					{
						alert("Please select a sport from the dropdown at the top")
					}

					var curSport = sportDropdown.selection.text;

					var newGarmentCode = addGarmentCode();
					if(newGarmentCode)
					{
						db[sportDropdown.selection.text][newGarmentCode] = {};
						writeDatabase(databasePath,"var graphicLocationsAndSizing = " + JSON.stringify(db));
						garmentCodes.push(newGarmentCode);
						populateListbox(garmentCodesListbox,garmentCodes);
						overwriteDatabase = true;
					}
				})


			//listbox of art locations for 
			var artworkLocationsGroup = UI.group(mainBodyGroup);
				artworkLocationsGroup.orientation = "column";
				var artworkLocationsListbox = UI.listbox(artworkLocationsGroup,LISTBOX_DIMENSIONS,artworkLocations);
				var addArtworkLocationBtn = UI.button(artworkLocationsGroup,"Add",function()
				{
					//add a new style to the list
					//open a dialig prompting user for the new element
					//validate the response and if valid, trigger database
					//overwrite and close dialog.
					//add the new element to the artworkLocationsListbox
				

					//check that the necessary selections have been made
					if(!sportDropdown.selection)
					{
						alert("Please select a sport from the dropdown at the top");
						return;
					}
					if(!garmentCodesListbox.selection)
					{
						alert("Please select a garment code.");
						return;
					}

					var curGarmentCode = garmentCodesListbox.selection.text;
					var curSport = sportDropdown.selection.text;

					var newArtworkLocation = addArtworkLocation();
					if(!newArtworkLocation)
					{
						return;
					}

					db[curSport][curGarmentCode][newArtworkLocation.code] = newArtworkLocation;
					writeDatabase(databasePath,"var graphicLocationsAndSizing = " + JSON.stringify(db));
					overwriteDatabase = true;
					artworkLocations.push(newArtworkLocation.label);
					populateListbox(artworkLocationsListbox,artworkLocations);
				})

		//group for the buttons at the bottom of the dialog. the main control buttons, if you will.
		var btnGroup = UI.closeButtonGroup(glw,submitDialog,closeDialog);







	//event listeners
	sportDropdown.onChange = function()
	{
		if(!sportDropdown.selection)
		{
			return;
		}
		garmentCodes = [];

		
		var text = sportDropdown.selection.text;
		
		for(var code in db[text])
		{
			garmentCodes.push(code);
		}

		populateListbox(garmentCodesListbox,garmentCodes);
	}

	garmentCodesListbox.onChange = function()
	{
		if(!garmentCodesListbox.selection)
		{
			return;
		}
		artworkLocations = [];

		var sportText = sportDropdown.selection.text;
		var garmentCode = garmentCodesListbox.selection.text;
		for(loc in db[sportText][garmentCode])
		{
			if(db[sportText][garmentCode].hasOwnProperty)
			{
				artworkLocations.push(db[sportText][garmentCode][loc].label);
			}
		}
		populateListbox(artworkLocationsListbox,artworkLocations);

	}

	artworkLocationsListbox.onChange = function()
	{
		alert("artwork locations listbox onChange");
	}





	


	//display the dialog
	glw.show();
}
test();