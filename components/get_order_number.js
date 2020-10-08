/*
	Component Name: get_order_number
	Author: William Dowling
	Creation Date: 17 October, 2019
	Description: 
		prompt the user for the order number and validate response
	Arguments
		none
	Return value
		void

*/

function getOrderNumber()
{
	scriptTimer.beginTask("getOrderNumber");
	
	var proceed = true;

	while(proceed)
	{
		result = promptWindow();
	}

	scriptTimer.endTask("getOrderNumber");
	return;

	function promptWindow()
	{
		var inputResult = {orderNumber:"",teamName:""};
		var w = new Window("dialog","Enter the Order Number and Team Name");
			var msg = UI.static(w,"Enter Order Info:");
			var onGroup = UI.group(w);
				onGroup.orientation = "row";
				var onMsg = UI.static(onGroup,"Order Number: ");
				var onInput = UI.edit(onGroup,"1234567",10);
					onInput.active = true;
			var tnGroup = UI.group(w);
				tnGroup.orientation = "row";
				var tnMsg = UI.static(tnGroup,"Team Name: ");
				var tnInput = UI.edit(tnGroup,"Bandits",20);
			var btnGroup = UI.group(w);
				btnGroup.orientation = "row";
				var saveLocBtn = UI.button(btnGroup,"Update Save Location",function()
				{
					getSaveLocation();
				})
				var cancel = UI.button(btnGroup,"Cancel",function()
				{
					proceed = false;
					valid = false;
					w.close();
				})
				var submit = UI.button(btnGroup,"Submit",submitFunction);


		w.addEventListener("keydown",function(k)
		{
			if(k.keyName == "Enter")
			{
				submitFunction();
			}
		});

		w.show();

		function submitFunction()
		{
			var onPat = /[\d]{7}/i;
			var validOrderNumber = false;
			
			if(onPat.test(onInput.text) && tnInput.text !== "")
			{
				validOrderNumber = true;
				orderNumber = onInput.text;
				teamName = tnInput.text
				proceed = false;
				w.close();
			}
			else if(!onPat.test(onInput.text))
			{
				alert("Invalid Order Number. Please Try Again.");
			}
			else if(tnInput.text === "")
			{
				alert("Please enter a team name.");
			}
			
		}

	}
}