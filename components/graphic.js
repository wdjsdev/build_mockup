function Graphic(data)
{
	this.code = data.name.replace(vestigialAppendagePat,"");
	this.styleNumber = this.code.substring(this.code.lastIndexOf("-")+1,this.code.length);
	this.name = this.code.replace(nameNumberPat,"fdsp-fdsn").replace(/-$,_/);
	
	this.file = this.getFile();
	this.colors;
	this.size;



	this.getFile = function()
	{
		var result;
		var folder = locateGraphicFolder(this.name);

		if(folder)
		{
			alert("got the folder:\n" + folder.fsName);
		}
	}
	
}