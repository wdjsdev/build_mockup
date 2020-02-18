function topOrBottomSwatches()
{
	var result;
	var tops = 0; //number of placholders that start with C
	var bots = 0; //number of placholders that start with B
	var pat = /[cb][\d]{1,}/i;

	var doc = app.activeDocument;
	var swatches = doc.swatches;
	for(var x=0,len=swatches.length;x<len;x++)
	{
		if (pat.test(swatches[x].name))
		{
			if(swatches[x].name.charAt(0) === "C")
			{
				tops++;
			}
			if(swatches[x].name.charAt(0) === "B")
			{
				bots++;
			}
		}
	}

	if(tops > 0 && bots > 0)
	{
		//this would be a mockup where there's a jersey and shorts
		//we need to weed these out...

		// ...... or apparently if the garments use bottom colors, but the paramcolors use top colors...
		// fml

		//just set the result to bottom colors for now.. it's more likely that there will be
		//top colors inside a file that utilizes bottom colors for the actual artwork than
		//a file that uses top colors but also has bottom colors.. idk. the files just need to be fixed
		result = "B";
	}
	else if(tops > 0)
	{
		result = "C";
	}
	else if(bots > 0)
	{
		result = "B";
	}

	return result;

}