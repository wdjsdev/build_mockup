function copyArtToMaster(art,dest)
{
	var result = art.duplicate(dest.parent.parent);
	result.moveToBeginning(dest);
	return result;
}