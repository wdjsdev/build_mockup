function alignArtToGuides ( art, guide, scale )
{

	log.l( "aligning art to guides: " + art.name + " to " + guide.name + "... scale: " + scale );
	//make sure the placement guides layer and info layer are not locked
	var guidesLay = guide.parent;
	guidesLay.locked = false;
	guidesLay.parent.locked = false;


	// var dupArt = art.duplicate(destLayer);
	var dupGuide = guide.duplicate();
	dupGuide.guides = false;



	if ( scale && !guide.name.match( /tbnm display/i ) ) 
	{
		var gDim = getMaxDimension( dupGuide );
		var aDim = getMaxDimension( art );
		var scaleFactor = ( gDim / aDim ) * 100;
		log.l( "scaling art to " + scaleFactor + "%" );
		art.resize( scaleFactor, scaleFactor, true, true, true, true, scaleFactor, Transformation.CENTER );
	}

	//align the art
	log.l( "Aligning the art horizontally to the guide..." );

	align( dupGuide, [ art ], "hcenter" )
	if ( guide.name.match( /display/i ) )
	{
		align( dupGuide, [ art ], "vcenter" )
	}
	else if ( guide.name.match( /(tbnm|tfcc|tfur|tful|tflr|tflc|tfrl|tblt)/i ) )
	{
		log.l( "aligning top." )
		align( dupGuide, [ art ], "vtop" )
	}
	else
	{
		log.l( "aligning bottom." )
		align( dupGuide, [ art ], "vbottom" )
	}


	dupGuide.remove();
}