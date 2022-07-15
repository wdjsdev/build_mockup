function alignArtToGuides(art,guide,scale)
{

	log.l("aligning art to guides: " + art.name + " to " + guide.name + "... scale: " + scale);
	//make sure the placement guides layer and info layer are not locked
	var guidesLay = guide.parent;
	guidesLay.locked = false;
	guidesLay.parent.locked = false;

	
	// var dupArt = art.duplicate(destLayer);
	var dupGuide = guide.duplicate();
	dupGuide.guides = false;

	

	if (scale) 
	{
		var gDim = getMaxDimension(dupGuide);
		var aDim = art.name.match(/name|number/i) ? (art.width > art.height ? art.width : art.height) : getMaxDimension(art);
		var scaleFactor = aDim > gDim ? (gDim / aDim) * 100 : 100;
		log.l("scaling art to " + scaleFactor + "%");
		art.resize(scaleFactor, scaleFactor, true, true, true, true, scaleFactor, Transformation.CENTER);
	}

	//align the art
	log.l("Aligning the art horizontally to the guide...");
	hAlignCenter(dupGuide,[art]);
	if(guide.name.match(/(tbnm|tfcc|tfur|tful|tflr|tflc|tfrl)/i))
	{
		log.l("aligning top.")
		vAlignTop(dupGuide, [art]);
	}
	else
	{
		log.l("aligning bottom.")
		vAlignBottom(dupGuide, [art]);
	}
	
	
	dupGuide.remove();
}