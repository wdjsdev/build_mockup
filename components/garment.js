//config is the entire config or configReverse object
//data is the top or bottom object
function Garment(config,data,designNumber)
{
	this.designNumber = designNumber;
	this.adultGarmentCode = "";
	this.adultGarmentFolder;
	this.adultGarmentFile;
	this.youthGarmentFolder;
	this.youthGarmentFile;
	this.youthGarmentCode = "";
	this.styleNumber = "";
	this.garmentColors = {};
	this.graphics = config.graphics;


	this.init = function()
	{
		this.setGarmentCodes();
		this.setStyleNumber();
		this.setGarmentColors();
		this.getGarments();
		this.getGraphics();
	}

	this.processGarments = function()
	{
		if(this.adultGarmentFile)
		{
			this.processCurGarment("Adult",this.adultGarmentFile);
		}
		if(this.youthGarmentFile)
		{
			this.processCurGarment("Youth",this.youthGarmentFile);
		}
	}


	this.recolor = function(doc,colors)
	{

	}

	this.processCurGarment = function(label,file)
	{
		this.openFile(file);
		this.recolor(thi)

		for(var g in this.graphics)
		{
			if(this.graphics[g].file)
			{
				this.openFile(this.graphics[g].file);
			}
		}
		// recolorArtwork(colors);
	}

	this.setGarmentCodes = function()
	{
		if(!data.mid)
		{
			//strip the style number from the garment code
			var verboseGarmentCode = data.garment.replace(data.styleNo,"");
			verboseGarmentCode = verboseGarmentCode.substring(0,verboseGarmentCode.lastIndexOf("-"));
			data.mid = checkForMidGarmentRelationship(verboseGarmentCode);
		}

		this.adultGarmentCode = data.mid;

		if(womensCodePat.test(data.mid))
		{
			this.youthGarmentCode = data.mid.replace(womensCodePat,"G");
		}
		else
		{
			this.youthGarmentCode = data.mid + "Y";
		}
	}

	this.setStyleNumber = function()
	{
		this.styleNumber = data.styleNo;
	}

	this.setGarmentColors = function()
	{
		var curColor;
		for(var ph in data.colors)
		{
			curColor = data.colors[ph];
			curColor.swatchName = BUILDER_COLOR_CODES[curColor.colorCode];
			if(curColor.pattern)
			{
				curColor.pattern.swatchName = BUILDER_COLOR_CODES[curColor.pattern.colorCode];

			}
			if(curColor.gradient)
			{
				curColor.gradient.swatchName = BUILDER_COLOR_CODES[curColor.gradient.colorCode];
			}
		}
		this.garmentColors = data.colors;
	}

	this.getGarments = function()
	{
		this.adultGarmentFolder = locateCTFolder(this.adultGarmentCode);
		
		//if this garment is a bag, there's no youth sizing.. skip this part.
		if(data.garment.toLowerCase().indexOf("bag") === -1)
		{
			this.youthGarmentFolder = locateCTFolder(this.youthGarmentCode);
		}
		if(this.adultGarmentFolder)
		{
			this.adultGarmentFile = this.getFile(this.adultGarmentFolder,this.styleNumber);
		}
		if(this.youthGarmentFolder)
		{
			this.youthGarmentFile = this.getFile(this.youthGarmentFolder,this.styleNumber);
		}
	}

	this.getFile = function(folder,style)
	{
		var files = folder.getFiles("*" + style + "*");
		if(!files.length)
		{
			return undefined;
		}
		else
		{
			return files[0];
		}
	}

	this.getGraphics = function()
	{
		var curGraphic,colorCode;

		for(var g in this.graphics)
		{
			curGraphic = this.graphics[g];
			curGraphic.folder = locateGraphicFolder(curGraphic.name,curGraphic.lib);
			if(curGraphic.folder)
			{
				curGraphic.file = this.getFile(curGraphic.folder,this.getGraphicStyleNumber(curGraphic.name));
			}
			for(var c in curGraphic.colors)
			{
				colorCode = curGraphic.colors[c].colorCode;
				curGraphic.colors[c].swatchName = BUILDER_COLOR_CODES[colorCode];
			}
		}
	}

	

	this.getGraphicStyleNumber = function(name)
	{
		return name.substring(name.lastIndexOf("-")+1,name.length);
	}

	this.openFile = function(file)
	{
		app.open(file);
	}

}