/*
	Component Name: merge_template
	Author: William Dowling
	Creation Date: 02 January, 2020
	Description: 
		include and run the merge template function on the active document
	Arguments
		masterFile
			file object
			this is the file to which the active document will be merged
	Return value
		void

*/

function mergeTemplate(masterFile)
{
	var mtPath = customizationPath + "Library/Scripts/mockup_scripts/Merge_Templates.jsx";

	//dev path
	// var mtPath = desktopPath + "automation/merge_templates/Merge_Templates_Dev.jsx";
	eval("#include \"" + mtPath + "\"");
}