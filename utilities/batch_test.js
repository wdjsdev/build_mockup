function test()
{
	

	//loop variable
	var numLoops = 20;

	//loop [numLoops] random documents in the json_design_files folder and run the existing buildMockup script, then look at the log files.

	var folder = new Folder("/Volumes/Customization/Library/Scripts/Script Resources/Data/json_design_files");
	var dataFiles = folder.getFiles();

	var numFiles = dataFiles.length;
	$.writeln("numFiles = " + numFiles);

	#include "~/Desktop/automation/javascript/_new_cad_workflow/build_mockup/Build_Mockup_Dev.jsx";
	

	for(var x=0;x<numLoops;x++)
	{
		var rand = Math.floor(Math.random() * (numFiles - 0 + 1));
		var thisFile = dataFiles[rand];
		thisFile.open();
		var contents = "(" + thisFile.read() + ")";
		thisFile.close();

		$.writeln(contents);

		if(contents.indexOf("<html>")>-1)
		{
			$.writeln("this file is an html file. skipping it.");
			$.writeln("filename is " + thisFile.name);
			continue;
		}

		var json = eval(contents);

		if(!json.config)
		{
			$.writeln(thisFile.name + " is not in the correct format. skipping it.");
			continue;
		}

		var designNumber = json.designId;

		$.writeln("Starting container function on file number: " + x);
		$.writeln("Design number is: " + designNumber);
		
		container(designNumber);

	}
}
test();

