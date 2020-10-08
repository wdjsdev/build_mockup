/*
	Component Name: get_order_data
	Author: William Dowling
	Creation Date: 18 October, 2019
	Description: 
		curl order data from netsuite and save result to global orderData variable
	Arguments
		none
	Return value
		void

*/

function getOrderData()
{
	scriptTimer.beginTask("getOrderData");
	orderData = curlData(NOD,orderNumber);
	if(!orderData)
	{
		log.e("Failed to get the sales order data for order number: " + orderNumber);
		errorList.push("Failed to get the sales order data for order number: " + orderNumber);
		valid = false;
	}
	else if(!orderData.lines)
	{
		log.e("orderData is formatted incorrectly.::orderData = " + JSON.stringify(orderData));
		errorList.push("The sales order data from netsuite was not in the correct format.")
		valid = false;
	}
	scriptTimer.endTask("getOrderData");
}