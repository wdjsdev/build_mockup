//arr = array of graphic_text strings in the data
//group = group of all front logo assets

//dig recursively to find all necessary frames
//labeled "graphic_text_[sequence number]"
// and update textframe contents accordingly.
function updateGraphicText(arr, group)
{	
	
	dig(group);


	
	function dig(inGroup)
	{
		var arrIndex;
		var tmpName;
		var curItem;
		for(var d=0;d<inGroup.pageItems.length;d++)
		{
			curItem = inGroup.pageItems[d];
			log.l("curItem.typename = " + curItem.typename);
			if(curItem.typename === "TextFrame" && curItem.name.toLowerCase().indexOf("graphic_text")>-1)
			{
				tmpName = curItem.name;
				arrIndex = parseInt(tmpName.substring(tmpName.length-1,tmpName.length)) - 1;
				arrIndex = parseInt(tmpName.charAt(tmpName.length-1)) -1;

				if(arr[arrIndex])
				{
					inputNewLogoText(curItem,arr[arrIndex]);	
				}
				else
				{
					log.e("Design Number: " + curDesignNumber + " is missing data for " + tmpName);
					curItem.contents = "";
				}
				
			}
			else if(curItem.typename === "GroupItem")
			{
				dig(curItem);
			}
		}
	}

}

// updateGraphicText(["one","two","three"],app.activeDocument.selection[0]);