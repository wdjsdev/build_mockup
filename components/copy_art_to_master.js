function copyArtToMaster(art,destDoc,destLay,destAbRect)
{
	// var copyGroup = art.parent.groupItems.add();
	// for(var x = artArray.length - 1; x>=0;x--)
	// {
	// 	artArray[x].moveToBeginning(copyGroup);
	// }
	var result = art.duplicate(destDoc);
	result.moveToBeginning(destLay);
	// destDoc.selection = null;
	// result.selected = true;
	// app.executeMenuCommand("ungroup");
	return result;
}