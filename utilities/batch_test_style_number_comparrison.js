function test()
{
	

	//loop variable
	var numLoops = 1;

	//loop [numLoops] random documents in the json_design_files folder and run the existing buildMockup script, then look at the log files.

	var folder = new Folder("/Volumes/Customization/Library/Scripts/Script Resources/Data/json_design_files");
	var dataFiles = folder.getFiles();

	var numFiles = dataFiles.length;
	$.writeln("numFiles = " + numFiles);


	//counter variable for non-matching style numbers
	var nonMatch = 0;

	// #include "~/Desktop/automation/javascript/_new_cad_workflow/build_mockup/Build_Mockup_Dev.jsx";
	

	// for(var x=0;x<numLoops;x++)
	for(var x=0;x<numFiles;x++)
	{
		// var rand = Math.floor(Math.random() * (numFiles - 0 + 1));
		// var thisFile = dataFiles[rand];
		var thisFile = dataFiles[x];
		thisFile.open();
		var contents = "(" + thisFile.read() + ")";
		thisFile.close();

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

		// $.writeln("Starting container function on file number: " + x);
		$.writeln("Design number is: " + designNumber);
		
		// container(designNumber);

		if(json.config.top)
		{
			// $.writeln("json.config.top.styleNo = " + json.config.top.styleNo);
			// $.writeln("json.config.top.garment = " + json.config.top.garment);
			var garNum = json.config.top.garment
			garNum = garNum.substring(garNum.lastIndexOf("-")+1,garNum.length);
			if(garNum != json.config.top.styleNo)
			{
				nonMatch++;
			}
			
		}

		if(json.config.bottom)
		{
			var garNum = json.config.bottom.garment
			garNum = garNum.substring(garNum.lastIndexOf("-")+1,garNum.length);
			if(garNum != json.config.bottom.styleNo)
			{
				nonMatch++;
			}
		}

	}

	$.writeln(nonMatch);
}
test();

