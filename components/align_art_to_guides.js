function alignArtToGuides(art,loc,guide,destLayer)
{
	//make sure the placement guides layer and info layer are not locked
	var guidesLay = guide.parent;
	guidesLay.locked = false;
	guidesLay.parent.locked = false;

	
	var dupArt = art.duplicate(destLayer);
	var dupGuide = guide.duplicate();
	dupGuide.guides = false;
	hAlignCenter(dupGuide,[dupArt]);
	vAlignTop(dupGuide,[dupArt]);
	dupGuide.remove();

	guidesLay.parent.locked = true;
}