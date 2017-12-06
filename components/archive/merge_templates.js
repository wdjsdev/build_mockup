/*
	Component Name: merge_templates
	Author: William Dowling
	Creation Date: 02 May, 2017
	Description: 
		merge the mockup files and/or converted templates into a combined master file
	Arguments
		
	Return value
		

*/

function mergeTemplate(master)
{

	/*****************************************************************************/

	///////Begin/////////
	///Logic Container///
	/////////////////////,


	//isTemplate Function Description
	//check 
	function isTemplate(doc)
	{
		var localValid = true;
		var layers = doc.layers;

		var art;
		var info;
		var mock;
		
		//Try/Catch Description:
		//set variables for known template layers
		//if they don't exist, it's not a template
		try
		{
			art = layers[0].layers["Artwork Layer"];
			info = layers[0].layers["Information"];
			mock = layers[0].layers["Mockup"];
		}
		catch(e)
		{
			//this doc is not a converted template.
			//setting srcIsTemplate to false
			srcIsTemplate = false;

			log.h("Source Document is NOT a template.::Results of isTemplate function are as follows:");
			log.l("art = " + art);
			log.l("info = " + info);
			log.l("mock = " + mock + "\n\n");
		}
		
		return localValid
	}

	//containerLayer Function Description
	//create a container layer in the source document
	//merge all existing layers into the container layer for easy
	//transport to the master file.
	//arg = make or remove. if make, create container layer. else move all artwork back to previous location and remove container layer.
	function containerLayer(makeRemove,doc)
	{
		var localValid = true;
	
		if(makeRemove == "make")
		{	
			try
			{
				var name = prompt("Please enter the the garment code and style number of this garment.", "Example: FD_136W_023");
				log.l("Making a container layer in the source document called: " + name);
				var containerLayer = docRef.layers.add();
				containerLayer.name = "non-temp_" + name;

				log.l("Moving all existing layers into container layer.");
				var counter = 0;
				for(var a = doc.layers.length-1;a > 0; a--)
				{
					var thisLay = doc.layers[a];
					thisLay.moveToBeginning(containerLayer);
					counter++;
				}
				log.l("Sucessfully moved " + counter + " layers to container layer.");
			}
			catch(e)
			{
				log.e("Failed while creating a container layer.::Failed on line " + e.line);
				errorList.push("Failed while creating a temporary container layer. Sorry =(");
				localValid = false;
			}

		}

		else if(makeRemove == "remove")
		{
			try
			{
				var containerLayer = doc.layers[0]
				for(var a = containerLayer.layers.length-1;a >-1; a--)
				{
					var thisLay = containerLayer.layers[a];
					thisLay.moveToBeginning(doc);
				}
				containerLayer.remove();
			}
			catch(e)
			{
				log.e("Failed while removing the container layer.::Failed on line " + e.line);
				errorList.push("Failed while removing temporary container layer.");
			}
		}

		else
		{
			log.e("Incorrect argument was passed to containerLayer function. Aborting script.");
			errorList.push("William failed somehow in the execution of the containerLayer function. Please let him know.");
			localValid = false;
		}


	
	
		return localValid
	}

	//unlockSource Function Description
	//unlock all the layers, sublayers and objects in the source document
	//so that a copy and paste will work properly.
	function unlockSource(doc)
	{
		var localValid = true;
		var localErrors;
	
		var lay = doc.layers;

		log.l("Attempting to delete USA Collars layer.")
		//Try/Catch Description:
		//delete a USA collars layer if exists
		try
		{
			lay[0].layers["USA Collars"].visible = true;
			lay[0].layers["USA Collars"].remove();
			log.l("Successfully removed USA Collars layer.")
		}
		catch(e)
		{
			log.l("No USA Collars layer to remove.")
		}

		log.l("Running loop to unlock and unhide all top level layers.")

		for(var a=0;a<lay.length;a++)
		{
			lay[a].locked = false;
			lay[a].visible = true;
		}


		app.executeMenuCommand("showAll");
		app.executeMenuCommand("unlockAll");
		log.l("Sucessfully unlocked and unhid all elements.::unlockSource function returning " + localValid + "\n\n");
		
		
		
	
	
		return localValid
	}

	//getNewAbBounds Function Description
	//use the bkgrd layer to determine the size of the new artboard in the master file
	function getNewAbBounds(doc)
	{
		var localValid = true;

		var srcAb = doc.artboards[0].artboardRect;
		newAbWidth = srcAb[2] - srcAb[0];
		newAbHeight = srcAb[1] - srcAb[3];
		// var lay = doc.layers["BKGRD, do not unlock"];
		// var newGroup = doc.groupItems.add();
		// for(var a=0;a<lay.pageItems.length;a++)
		// {
		// 	var thisItem = lay.pageItems[a];
		// 	thisItem.duplicate(newGroup);
		// }
		// newAbWidth = newGroup.width;
		// newAbHeight = newGroup.height;
	
		// log.l("New artboard bounds = " + newGroup.visibleBounds);
		// newGroup.remove();

		return localValid
	}

	//copyArt Function Description
	//select all art from docRef and copy to clipboard
	function copyArt()
	{
		var localValid = true;

		curGarment = docRef.layers[0].name;
	
		try
		{
			app.executeMenuCommand("selectall");
			app.executeMenuCommand("copy");
			log.l("Art sucessfully copied.")
		}
		catch(e)
		{
			log.e("Failed while selecting and copying art from source document.....?");
			localValid = false;
		}

	
	
		return localValid
	}

	//unlockMaster Function Description
	//unlock the guides and bkgrd layers to accomodate incoming artwork
	function unlockMaster(doc)
	{
		var localValid = true;
		var guidesLayExist = false;
		var bkgrdLayExist = false;

		//check to see whether the master file has guides and bkgrd layers

		log.l("Verifying existence of guides layer.");
		try
		{
			var guides = doc.layers["Guides"];
			guidesLayExist = true;
			log.l("Guides layer exists. Sucessfully set guides variable.")
		}
		catch(e)
		{
			log.l("No Guides layer exists.");
		}

		log.l("Verifying Existence of BKGRD, do not unlock layer.");
		try
		{
			var bkrd = doc.layers["BKGRD, do not unlock"];
			bkgrdLayExist = true;
			log.l("BKGRD layer exists. sucessfully set bkrd variable.");
		}
		catch(e)
		{
			log.l("No BKGRD layer exists.")
		}

		if(guidesLayExist)
		{
			log.l("Attempting to unlock/unhide master file Guides layer.")
			try
			{
				guides.locked = false;
				guides.visible = true;
				log.l("Master file Guides layer succesfully unlocked/unhid.::Ready for art to be pasted.");
			}
			catch(e)
			{
				errorList.push("Failed while unlocking/unhiding Guides Layer.");
				log.e("Failed while unlocking/unhiding maaster file Guides layer.");
				localValid = false;
			}
		}
		if(bkgrdLayExist)
		{
			log.l("Attempting to unluck/unhide master file BKDRD, do not unlock layer.")
			try
			{
				bkrd.locked = false;
				bkrd.visible = true;
				log.l("Master file BKDRD, do not unlock layer succesfully unlocked/unhid.::Ready for art to be pasted.");
			}
			catch(e)
			{
				errorList.push("Failed while unlocking/unhiding BKGRD, do not unlock Layer.");
				log.e("Failed while unlocking/unhiding maaster file BKDRD, do not unlock layer.");
				localValid = false;
			}
		}

	
	
		return localValid
	}

	//checkLayerNames Function Description
	//Check whether the garment layer in the source document has the same name
	//as any existing layers in the master file. If so, append a sequential
	//letter to the end of the layer name so it doesn't get merged with
	//the existing layer in the master file.
	function checkLayerNames()
	{
		var localValid = true;
	
		
		var possibleLetters = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
		var srcName = docRef.layers[0].name;
		var updateSrcName = look(srcName);
		

		if(updateSrcName)
		{
			var pat = /_[A-Z]$/;
			if(pat.test(srcName))
			{
				docRef.layers[0].name = srcName.slice(0,srcName.length-2)
				srcName = srcName.slice(0,srcName.length-2)
			}
			log.l("docRef garment layer name exists in master file. Attempting to add a suffix letter.")
			var counter = 0;
			while(updateSrcName)
			{
				var newName = srcName + "_" + possibleLetters[counter];
				if(!look(newName))
				{
					docRef.layers[0].name = newName;
					updateSrcName = false;
					log.l("Found an appropriate name for the layer: " + newName);
					log.l("Updated layer name, proceeding with script.\n\n");
				}
				else
				{
					counter++;
					log.l("Checked master file for existence of a layer called: " + newName);
					log.l(newName + " exists in master file. trying again with a new letter.");
				}
				if(counter == possibleLetters.length-1)
				{
					log.l("Ran out of possible letters. There are too many garments in this document.");
					errorList.push("Looks like there are too many garments in this document. Please consider splitting up the master file.");
					localValid = false;
					break;
				}
			}
		}
	
		return localValid

		function look(name)
		{
			for(var a=0;a<master.layers.length;a++)
			{
				var thisLay = master.layers[a];
				if(thisLay.name == name)
				{
					return true;
				}
			}
			return false;
		}
	}

	//makeNewArtboard Function Description
	//create a new artboard in the master file
	function makeNewArtboard(master,w,h)
	{
		var localValid = true;

		var masterAb = master.artboards;
	
		var curAbCount = masterAb.length;
		log.l("Master file (" + master.name + ") has " + curAbCount + " artboards to start with.");
		var lastAb = masterAb[curAbCount-1];
		var rect = lastAb.artboardRect;
		var newAbBounds;
		var moveRight = 2100;
		var moveDown = 2600;

		switch(curAbCount)
		{
			case 1:
			case 2:
			case 3:
			case 5:
			case 6:
			case 7:
			case 9:
			case 10:
			case 11:
				//No need to make a new row. Just place a new artbooard to the right of the last existing artboard.
				var left = rect[0] + moveRight;
				var top = rect[1];
				var right = left + w;
				var bot = top - h;
				// newAbBounds = [rect[0]+moveRight,rect[1],rect[2]+moveRight,rect[3]];
				newAbBounds = [left,top,right,bot];
				log.l("Created a new artboard 2100pt to the right of the last artboard.")
				break;

			case 4:
				//Ran out of room in the first row. Make a new row and place this new artboard directly below the first one.
				rect = masterAb[0].artboardRect;
				var left = rect[0];
				var top = rect[1] - moveDown;
				var right = left + w;
				var bot = top - h;
				newAbBounds = [left,top,right,bot];
				// newAbBounds = [rect[0],rect[1]-moveDown,rect[2],rect[3]-moveDown];
				log.l("Started the second row of artboards.")
				break;

			case 8:
				//ran out of room in the second row. Make a new row and place this new artboard directly below the fifth one.
				rect = masterAb[0].artboardRect;
				newAbBounds = [rect[0],rect[1]-moveDown*2,rect[2],rect[3]-moveDown*2];
				log.l("Started the third row of artboards.");
				break;

			case 12:
				//too many artboards. Alert and abort.
				errorList.push("Sorry. You can't have more than 12 mockups in a single document.");
				log.e("There were already 12 artboards in the document. Can't do more than 12. Aborting script.");
				localValid = false;
		}

		if(localValid)
		{
			masterAb.add(newAbBounds);
			log.l("Successfully added a new artboard to the master file with bounds: " + newAbBounds);
		}
	
	
		return localValid
	}

	//pasteArt Function Description
	//paste the art on the clipboard into the master file
	function pasteArt()
	{
		var localValid = true;
	
		try
		{
			app.pasteRemembersLayers = true;
			app.executeMenuCommand("pasteInPlace");
			app.pasteRemembersLayers = false;
			master.layers[curGarment].zOrder(ZOrderMethod.SENDTOBACK);
			log.l("Sucessfully pasted artwork into master file.");
		}
		catch(e)
		{
			log.e("Failed while setting pasteRemembersLayers and pasting artwork.")
			errorList.push("Failed while trying to paste the artwork into the master file.. =(");
			localValid = false;
		}
	
	
		return localValid
	}

	//lockMaster Function Description
	//loop all layers in the master file and lock/hide the appropriate layers.
	function lockMaster()
	{
		var localValid = true;
	
		var masterLay = master.layers;
		// for(var a=0;a<masterLay.length;a++)
		for(var a = masterLay.length-1;a>-1;a--)
		{
			var thisLay = masterLay[a];
			if(thisLay.name == "Guides" || thisLay.name.indexOf("BKGRD")>-1)
			{
				thisLay.locked = false;
				thisLay.zOrder(ZOrderMethod.SENDTOBACK);
				thisLay.locked = true;
				log.l("Successfully locked the " + thisLay.name + " layer.");
			}
			else if(thisLay.name.indexOf("FD_")>-1 || thisLay.name.indexOf("FD-")>-1)
			{
				log.l(thisLay.name + " is likely a garment layer.\n")
				log.l("Attempting to lock the information layer.");
				try
				{
					thisLay.layers["Information"].locked = true;
					log.l("Successfully locked the information layer.");
				}
				catch(e)
				{
					log.l("Either the script failed while locking the info layer or it doesn't exist.");
				}

				log.l("Attempting to hide the prepress layer.");
				try
				{
					thisLay.layers["Prepress"].visible = false;
					log.l("Sucessfully hid the prepress layer.");
				}
				catch(e)
				{
					log.l("Either the script failed while hiding the prepress layer or it doesn't exist.");
				}

				log.l("Attempting to lock the 'Edges' group on the mockup layer.");
				try
				{
					thisLay.layers["Mockup"].groupItems["Edges"].locked = true;
					log.l("Sucessfully locked the edges group.");
				}
				catch(e)
				{
					log.l("Either the script failed while locking the edges group or it doesn't exist.");
				}
			}
		}
	
	
		return localValid
	}



	////////End//////////
	///Logic Container///
	/////////////////////

	/*****************************************************************************/

	///////Begin////////
	////Data Storage////
	////////////////////

	var lib = 
	{
		
	}

	


	////////End/////////
	////Data Storage////
	////////////////////

	/*****************************************************************************/

	///////Begin////////
	///Function Calls///
	////////////////////

	var scriptVersion = "4.001";

	var docRef = app.activeDocument;
	var newAbWidth;
	var newAbHeight;
	var srcIsTemplate = true;
	var errorList = [];


	//log the beginning of script executionn
	log.h("Begin Script.::" + user + " ran Merge_Templates version " + scriptVersion + "::docRef = " + docRef.name + "::this is the merge FROM file.");

	// var valid = getMaster();

	if(valid)
	{
		log.h("Beginning isTemplate function.");
		valid = isTemplate(docRef);
	}
	if(valid)
	{
		log.h("Beginning unlockSource function.");
		valid = unlockSource(docRef);
	}
	if(valid && !srcIsTemplate)
	{
		log.h("Source is not a template.::Running containerLayer function.")
		valid = containerLayer("make",docRef);
	}
	if(valid)
	{
		log.h("Beginning checkLayerNames function.");
		valid = checkLayerNames();
	}
	if(valid)
	{
		log.h("Beginning getNewAbBounds function.");
		valid = getNewAbBounds(docRef);
	}
	if(valid)
	{
		log.h("Beginning copyArt function.");
		valid = copyArt();
	}
	if(valid && !srcIsTemplate)
	{
		log.h("Beginning containerLayer function with argument \"remove\".")
		containerLayer("remove",docRef)
	}
	if(valid)
	{
		log.h("Beginning unlockMaster function.");
		valid = unlockMaster(master);
	}
	if(valid)
	{
		master.activate();
		log.h("Activated master file. Beginning makeNewArtboard function.")
		valid = makeNewArtboard(master,newAbWidth,newAbHeight);
	}
	if(valid)
	{
		log.h("Beginning pasteArt function.")
		valid = pasteArt();
	}
	if(valid)
	{
		log.h("Beginning lockMaster function.");
		valid = lockMaster();
	}

	app.selection = null;

	printLog();



	////////End/////////
	///Function Calls///
	////////////////////

	/*****************************************************************************/

	if(errorList.length>0)
	{
		sendErrors(errorList);
	}
	return valid

}
// container();