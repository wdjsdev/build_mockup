//arr = array of graphic_text strings in the data
//group = group of all front logo assets

//dig recursively to find all necessary frames
//labeled "graphic_text_[sequence number]"
// and update textframe contents accordingly.
function updateGraphicText(arr, group)
{
	var newText;
	var curItem,arrIndex;
	for(var x=0;x < group.pageItems.length;x++)
	{
		curItem = group.pageItems[x];
		arrIndex = parseInt(curItem.name.substring(curItem.name.length-1,curItem.name.length)) - 1;
		if(curItem.typename === "TextFrame" && curItem.name.indexOf("graphic_text")>-1)
		{
			newText = arr[arrIndex];
			inputNewLogoText(curItem,newText);
		}
		else if(curItem.typename === "GroupItem")
		{
			dig(curItem);
		}
	}


	var tmpName,arrIndex;
	function dig(inGroup)
	{
		for(var d=0;d<inGroup.pageItems.length;d++)
		{
			if(inGroup.pageItems[d].typename === "TextFrame" && inGroup.pageItems[d].name.indexOf("graphic_text")>-1)
			{
				tmpName = inGroup.pageItems[d].name;
				arrIndex = parseInt(tmpName.substring(tmpName.length-1,tmpName.length)) - 1;
				inputNewLogoText(inGroup.pageItems[d],arr[arrIndex]);
			}
			else if(inGroup.pageItems[d].typename === "GroupItem")
			{
				dig(inGroup);
			}
		}
	}

}

// updateGraphicText(["one","two","three"],app.activeDocument.selection[0]);