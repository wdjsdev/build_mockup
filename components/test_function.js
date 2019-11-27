/*
	Component Name: test_function
	Author: William Dowling
	Creation Date: 27 November, 2019
	Description: 
		function for testing certain components in isolation
		a sandbox, if you will
	Arguments
		none
	Return value
		void

*/

function testFunction()
{
	designNumbers = ["c1CCb5ANIO6Z"];
	// designNumbers = ["PzSXPLCa1Tzm"];
	// designNumbers = ["AgOkmOQX5xBA"];
	orderNumber = "1234567";
	initSaveLoc();
	createOrderFolder();
	loopDesignNumbers();
	loopGarmentsNeeded();
	valid = false;
	printLog();
	if(errorList.length)
	{
		sendErrors(errorList);
	}
}