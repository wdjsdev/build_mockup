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