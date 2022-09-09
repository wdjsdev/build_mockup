//arr = array of graphic_text strings in the data
//group = group of all front logo assets

//dig recursively to find all necessary frames
//labeled "graphic_text_[sequence number]"
// and update textframe contents accordingly.
function updateGraphicText ( arr, group, curGraphic )
{
	//
	//attention:
	//implement this, would ya?
	//need to add a check for the graphic code so that we only use
	//this logic on appropriate graphics with tails or other such glyphs
	//
	//this logic preserves alternate glyphs like tails
	//for front logo fonts that use a different font/glyph for the tail

	// var frame = layers[0].pageItems[0];
	// var range = frame.textRanges[frame.textRanges.length - 1];
	// var rangeContents = range.contents;
	// $.writeln("rangeContents = " + rangeContents);

	// var attr = range.characterAttributes;
	// var myStyle = createCharacterStyle("test", attr);
	// frame.contents = "Wesley" + rangeContents;
	// myStyle.applyTo(frame.textRanges[frame.textRanges.length - 1], true);


	//this logic preserves alternate glyphs like tails
	//for front logo fonts that use a different font/glyph for the tail
	//
	//attention:
	//



	dig( group );



	function dig ( inGroup )
	{
		var arrIndex;
		var tmpName;
		var curItem;
		var inGroupFrames = afc( inGroup, "textFrames" );
		var inGroupSubGroups = afc( inGroup, "groupItems" );

		inGroupFrames.forEach( function ( frame )
		{
			var name = frame.name;
			if ( name.match( /graphic_text_\d/i ) )
			{
				arrIndex = parseInt( name.match( /graphic_text_(\d)/i )[ 1 ] ) - 1;
				if ( arr[ arrIndex ] )
				{
					inputNewLogoText( frame, arr[ arrIndex ], curGraphic );
				}
				else
				{
					errorList.push( curGraphic.name + " is missing team name data for logo graphic text." )
				}

			}
		} )

		inGroupSubGroups.forEach( function ( subGroup )
		{
			dig( subGroup );
		} );

		// for ( var d = 0; d < inGrovup.pageItems.length; d++ )
		// {
		// 	curItem = inGroup.pageItems[ d ];
		// 	log.l( "curItem.typename = " + curItem.typename );
		// 	if ( curItem.typename === "TextFrame" && curItem.name.match( /graphic_text_\d/i ) )
		// 	{
		// 		tmpName = curItem.name.match( /graphic_text_(\d)/ )[ 0 ];

		// 		if ( arr[ tmpName ] )
		// 		{
		// 			inputNewLogoText( curItem, arr[ arrIndex ], curGraphic );
		// 		}
		// 		else
		// 		{
		// 			log.e( "Design Number: " + curDesignNumber + " is missing data for " + tmpName );
		// 			curItem.contents = "";
		// 		}

		// 	}
		// 	else if ( curItem.typename === "GroupItem" )
		// 	{
		// 		dig( curItem );
		// 	}
		// }
	}

}

// updateGraphicText(["one","two","three"],app.activeDocument.selection[0]);