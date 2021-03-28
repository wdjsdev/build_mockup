function copyArtToMaster(art,destDoc,destLay,pos)
{
	var result = art.duplicate(destDoc);
	result.moveToBeginning(destLay);
	// destDoc.artboards.setActiveArtboardIndex(destAbIndex);
	result.left = pos[0];
	result.top = pos[1];

	return result;
}