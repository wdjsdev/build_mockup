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
	
	result = promptWindow();

	scriptTimer.endTask("getOrderNumber");
	return;

	function promptWindow()
	{
		var inputResult = {orderNumber:"",teamName:""};
		var w = new Window("dialog","Enter the Order Number and Team Name");
			var msg = UI.static(w,"Enter Order Info:");
			var fullOrderGroup = UI.group(w);
				var fullOrderInputGroup = UI.group(fullOrderGroup);
					fullOrderInputGroup.orientation = "column";
					var onGroup = UI.group(fullOrderInputGroup);
						onGroup.orientation = "row";
						var onMsg = UI.static(onGroup,"Order Number: ");
						var onInput = UI.edit(onGroup,"1234567",10);
							onInput.active = true;
					var tnGroup = UI.group(fullOrderInputGroup);
						tnGroup.orientation = "row";
						var tnMsg = UI.static(tnGroup,"Team Name: ");
						var tnInput = UI.edit(tnGroup,"Bandits",20);

				var submit = UI.button(fullOrderGroup ,"Build This Order",submitOrderNumberFunction);

			UI.hseparator(w,400);

			var designNumberOnlyGroup = UI.group(w);
				var dnGroup = UI.group(designNumberOnlyGroup);
					dnGroup.orientation = "row";
					var dnMsg = UI.static(dnGroup,"Design Number: ");
					var dnInput = UI.edit(dnGroup,"tvXGyTwqKmGn",13);
					var dnBtn = UI.button(dnGroup,"Create This Design",submitDesignNumberFunction);

			UI.hseparator(w,400);
			
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
				


		onInput.addEventListener("keydown",function(k)
		{
			if(k.keyName == "Enter")
			{
				submitOrderNumberFunction();
			}
		});
		dnInput.addEventListener("keydown",function(k)
		{
			if(k.keyName == "Enter")
			{
				submitDesignNumberFunction();
			}
		});

		w.show();

		function submitDesignNumberFunction()
		{
			var dnPat = /[\da-z]{12}/i;
			var validDesignNumber = false;

			if(dnPat.test(dnInput.text))
			{
				validDesignNumber = true;
				designNumbers.push(dnInput.text);
				teamName = "TEAMNAME";
				orderNumber = "ORDERNUMBER";
				designNumberOnly = true;
				w.close();
			}
			else
			{
				alert("Invalid design number.");
			}
		}

		function submitOrderNumberFunction()
		{
			var onPat = /[\d]{7}/i;
			var validOrderNumber = false;
			
			if(onPat.test(onInput.text) && tnInput.text !== "")
			{
				validOrderNumber = true;
				orderNumber = onInput.text;
				teamName = tnInput.text
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