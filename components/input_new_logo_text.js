
function inputNewLogoText ( frame, newContents, curGraphic )
{
	function style ()
	{
		this.leading = undefined;
		this.size = undefined;
		this.case = undefined;
		this.baselineShift = undefined;
		this.horizontalScale = undefined;
		this.verticalScale = undefined;
		this.tracking = undefined;

		this.init = function ( range )
		{
			this.leading = range.leading;
			this.size = range.size;
			this.case = getCase( range );
			this.baselineShift = range.baselineShift;
			this.horizontalScale = range.horizontalScale;
			this.verticalScale = range.verticalScale;
			this.tracking = range.tracking;
		}
	};


	var frameIndex = frame.name.match( /\d+/ )[ 0 ];
	if ( !newContents || newContents.match( /^\s*$/ ) )
	{
		errorList.push( "Missing logo text data for " + curGraphic.name );
		log.e( curGraphic.name + " is missing logo text data for " + frame.name );
		return;
	}







	function getCase ( range )
	{
		if ( range.contents.toUpperCase() == range.contents )
		{
			return "cap";
		}
		else
		{
			return "low";
		}
	}

	function applyStyle ( range, style )
	{
		if ( style.case === "cap" )
		{
			range.contents = range.contents.toUpperCase();
		}
		else
		{
			range.contents = range.contents.toLowerCase();
		}
		for ( var prop in style )
		{
			range[ prop ] = style[ prop ];
		}

	}

	function resizeArchedText ( frame )
	{
		function isOverset ( frame )
		{
			if ( frame.kind == TextType.POINTTEXT )
			{
				return false;
			}
			if ( frame.lines.length == 1 && frame.paragraphs.length == 1 )
			{
				// single line
				if ( frame.lines[ 0 ].characters.length < frame.characters.length )
				{
					return true;
				}
				else
				{
					return false;
				}
			}
			else
			{
				// multiline

				var lineLength = frame.lines.length;
				var allContentArr = frame.contents.split( /[\x03\r\n]/g );
				var allContentReturnsLength = allContentArr.length;
				var lastLineContent = frame.lines[ lineLength - 1 ].contents;
				var lastAllContentContent = allContentArr[ allContentReturnsLength - 1 ];
				return !( allContentReturnsLength == lineLength && ( lastLineContent == lastAllContentContent ) );
			}
			return false;
		};

		function shrinkOversetText ( frame )
		{
			var fontShrinkPercentage = 2;
			var textShrinkAmt = ( fontShrinkPercentage / 100 ) * frame.textRange.characters[ 0 ].characterAttributes.horizontalScale;
			if ( isOverset( frame ) )
			{
				while ( isOverset( frame ) )
				{
					frame.textRange.characterAttributes.horizontalScale = frame.textRange.characterAttributes.horizontalScale - textShrinkAmt;
				}
			}
		};

		shrinkOversetText( frame );
	}

	function makeStyle ( range, name )
	{
		var attr = range.characterAttributes;
		var style = createCharacterStyle( name, attr );
		return style;
	}

	if ( curGraphic.name.replace( /.*[-_]/, "" ).match( /2840|2833|2638|2526|2515|2514|2389|2388|2035|1038/ ) )
	{
		//
		//attention:
		//implement this, would ya?
		//need to add a check for the graphic code so that we only use
		//this logic on appropriate graphics with tails or other such glyphs
		//
		//this logic preserves alternate glyphs like tails
		//for front logo fonts that use a different font/glyph for the tail
		var graphicHasTail = true;
		var lastCharacterTextRange = frame.textRanges[ frame.textRanges.length - 1 ];
		var tailRangeContents = lastCharacterTextRange.contents;
		var tailRangeAttr = lastCharacterTextRange.characterAttributes;
		var tailStyle = makeStyle( lastCharacterTextRange, "tail_style_" + frameIndex );
		var tailFont = lastCharacterTextRange.characterAttributes.textFont;
		frame.contents = frame.contents.replace( tailRangeContents, "" );

	}

	//get the attributes of the first character in the frame
	var firstChar = new style();
	firstChar.init( frame.textRanges[ 0 ] );

	//get the attributes of the last character in the frame
	var lastChar = new style();
	lastChar.init( frame.textRanges[ frame.textRanges.length - 1 ] );

	//get the attributes of the character in the middle of the frame
	var middleChar = new style();
	var middleRange = frame.textRanges[ Math.floor( frame.textRanges.length / 2 ) ].contents == " " ? frame.textRanges[ Math.floor( frame.textRanges.length / 2 ) - 1 ] : frame.textRanges[ Math.floor( frame.textRanges.length / 2 ) ];
	middleChar.init( middleRange );

	// //get the attributes of the first character in the frame
	// var firstCharStyle = makeStyle( frame.textRanges[ 0 ], "graphicFirstChar_" + frameIndex );

	// //get the attributes of the last character in the frame
	// var lastCharStyle = makeStyle( frame.textRanges[ frame.textRanges.length - 1 ], "graphicLastChar_" + frame.name.match( /.*_[\d]/ )[ 0 ] );

	// var midRange = frame.textRanges[ Math.floor( frame.textRanges.length / 2 ) ];
	// if ( midRange.contents == " " )
	// {
	// 	midRange = frame.textRanges[ Math.floor( frame.textRanges.length / 2 ) ] - 1;
	// }
	// var middleCharStyle = makeStyle( midRange, "graphicMiddleChar_" + frameIndex );

	log.l( "updating old contents: " + frame.contents + ", to: " + newContents );
	frame.contents = trimSpaces( newContents );

	var ranges = afc( frame, "textRanges" );
	var rangeLength = ranges.length;
	var lastIndex = rangeLength - 1;
	var prevSpace = false;
	ranges.forEach( function ( range, i )
	{
		if ( range.contents.match( /\s/ ) )
		{
			prevSpace = true;
			return;
		}
		var style = ( i == 0 || prevSpace ) ? firstChar : i == lastIndex ? lastChar : middleChar;
		prevSpace = false;

		// style.applyTo( range );
		applyStyle( range, style );
		app.redraw();
	} );
	if ( graphicHasTail )
	{
		frame.contents += tailRangeContents;
		frame.textRanges[ frame.textRanges.length - 1 ].characterAttributes.textFont = tailFont;
		// tailStyle.applyTo( frame.textRanges[ frame.textRanges.length - 1 ] );
	}

	// if ( frame.contents !== " " && frame.contents !== "" )
	// {

	// 	var range, prevSpace;
	// 	for ( var x = 0; x < frame.textRanges.length; x++ )
	// 	{
	// 		range = frame.textRanges[ x ];
	// 		if ( range.contents == " " )
	// 		{
	// 			prevSpace = true;
	// 			continue;
	// 		}
	// 		if ( x === 0 || prevSpace )
	// 		{
	// 			firstCharStyle.applyTo( range );
	// 			prevSpace = false;
	// 		}
	// 		else if ( x === frame.textRanges.length - 1 )
	// 		{
	// 			lastCharStyle.applyTo( range );
	// 			if ( graphicHasTail )
	// 			{
	// 				frame.contents += tailRangeContents;
	// 				tailStyle.applyTo( frame.textRanges[ frame.textRanges.length - 1 ] );
	// 			}
	// 		}
	// 		else
	// 		{
	// 			middleCharStyle.applyTo( range );
	// 		}
	// 	}
	// }

	try
	{
		resizeArchedText( frame );
	}
	catch ( e )
	{
		log.e( "Failed to resize arched text.::e = " + e + "::e.line = " + e.line );
	}
}