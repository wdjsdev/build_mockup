
function inputNewLogoText(frame,newContents)
{
	function style() {
		this.leading = undefined;
		this.size = undefined;
		this.case = undefined;
		this.baselineShift = undefined;
		this.horizontalScale = undefined;
		this.verticalScale = undefined;
		this.tracking = undefined;

		this.init = function(range)
		{
			this.leading = range.leading;
			this.size = range.size;
			this.case = getCase(range);
			this.baselineShift = range.baselineShift;
			this.horizontalScale = range.horizontalScale;
			this.verticalScale = range.verticalScale;
			this.tracking = range.tracking;
		}
	};

	function getCase(range)
	{
		if(range.contents.toUpperCase() == range.contents)
		{
			return "cap";
		}
		else
		{
			return "low";
		}
	}

	function applyStyle(range,style)
	{
		if(style.case === "cap")
		{
			range.contents = range.contents.toUpperCase();
		}
		else
		{
			range.contents = range.contents.toLowerCase();
		}
		for(var prop in style)
		{
			range[prop] = style[prop];
		}

	}

	function resizeArchedText(frame)
	{
		function isOverset(frame)
		{
			if (frame.kind == TextType.POINTTEXT)
			{
				return false;
			}
			if (frame.lines.length == 1 && frame.paragraphs.length == 1)
			{
				// single line
				if (frame.lines[0].characters.length < frame.characters.length)
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
				var allContentArr = frame.contents.split(/[\x03\r\n]/g);
				var allContentReturnsLength = allContentArr.length;
				var lastLineContent = frame.lines[lineLength - 1].contents;
				var lastAllContentContent = allContentArr[allContentReturnsLength - 1];
				return !(allContentReturnsLength == lineLength && (lastLineContent == lastAllContentContent));
			}
			return false;
		};

		function shrinkOversetText(frame)
		{
			var fontShrinkPercentage = 2;
			var textShrinkAmt = (fontShrinkPercentage / 100) * frame.textRange.characters[0].characterAttributes.horizontalScale;
			if (isOverset(frame))
			{
				while (isOverset(frame))
				{
					frame.textRange.characterAttributes.horizontalScale = frame.textRange.characterAttributes.horizontalScale - textShrinkAmt;
				}
			}
		};

		shrinkOversetText(frame);
	}

	//get the attributes of the first character in the frame
	var firstChar = new style();
	firstChar.init(frame.textRanges[0]);
	
	//get the attributes of the last character in the frame
	var lastChar = new style();
	lastChar.init(frame.textRanges[frame.textRanges.length-1]);
	
	//get the attributes of the character in the middle of the frame
	var middleChar = new style();
	middleChar.init(frame.textRanges[Math.floor(frame.textRanges.length/2)]);
	

	frame.contents = newContents;


	var range,prevSpace;
	for(var x=0;x<frame.textRanges.length;x++)
	{
		range = frame.textRanges[x];
		if(range.contents == " ")
		{
			prevSpace = true;
			continue;
		}
		if(x===0 || prevSpace)
		{
			applyStyle(range,firstChar);
			prevSpace = false;
		}
		else if(x === frame.textRanges.length - 1)
		{
			applyStyle(range,lastChar);
		}
		else
		{
			applyStyle(range,middleChar);
		}
	}
	resizeArchedText(frame);

}