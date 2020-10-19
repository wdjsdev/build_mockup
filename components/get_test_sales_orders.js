/*
	Component Name: get_test_sales_orders
	Author: William Dowling
	Creation Date: 19 October, 2018
	Description: 
		check a local folder for all pdf files and
		display them in a listbox. when a selection
		is made, isolate the order number and return
		a 7 digit number as a string
	Arguments
		none
	Return value
		string representing the order number
		or undefined

*/

function getTestSalesOrders()
{
	var folderLoc = "~/Desktop/build_mockup_test_orders/";
	var files = Folder(folderLoc).getFiles();

	var fileNames = [];

	for(var f=0,len=files.length;f<len;f++)
	{
		if(files[f].name.indexOf(".pdf")>-1)
		{
			fileNames.push(files[f].name);	
		}
		
	}

	var result = chooseFromListbox(fileNames,"Choose an order.",[50,50,400,300]);

	if(result)
	{
		result = result[0].text;
		result = result.substring(0,result.indexOf("_"));
	}
	return result;
}