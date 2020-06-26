function chooseDesignNumbers(designNumbers)
{
	var result;

	var dn=UI.window("Choose Design Numbers");
		var topTxt = UI.static(dn,"Choose the design numbers you want to process.");
		var lb = UI.listbox(dn,[50,50,200,200],designNumbers,{multiselect:true});
		UI.hseparator(dn,150);
		var btnGroup = UI.group(dn);
			var cancelBtn = UI.button(btnGroup,"Cancel",function()
			{
				dn.close();
			})
			var submitBtn = UI.button(btnGroup,"Build Selected",function()
				{
					if(!lb.selection.length)
					{
						alert("Please select at least one design number.");
						return;
					}
					result = [];
					for(var r=0,len=lb.selection.length;r<len;r++)
					{
						result.push(lb.selection[r].text);
					}
					dn.close();
				});
			var buildAllBtn = UI.button(btnGroup,"Build All",function()
				{
					result = designNumbers;
					dn.close();
				});
	dn.show();

	if(!result)
	{
		valid = false;
		log.l("User cancelled choose design number dialog. exiting.");
	}
	return result;
}