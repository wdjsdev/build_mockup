//ph = name of placeholder swatch as string. ie. "C2"
//val = name of boombah color that is replacing the placeholder. ie. "Royal Blue B"
function updateInfoColorCallouts(ph,val)
{
	var lays = app.activeDocument.layers;

	ph = ph.toLowerCase();
	var info,curFrame;
	for(var x=0;x<lays.length;x++)
	{
		info = findSpecificLayer(lays[x],"Info","any");
		if(!info)
		{
			continue;
		}

		for(var y=0;y<info.textFrames.length;y++)
		{
			curFrame = info.textFrames[y];
			if(curFrame.name.toLowerCase().indexOf(ph)>-1)
			{
				curFrame.contents = val;
			}
		}
	}
}