
//Description: 
function test()
{
	var obj = {};
	var arr = [];
	var folder = new Folder("~/Desktop/automation/javascript/_new_cad_workflow/build_mockup/comp_bin");
	var files = folder.getFiles();
	var writeFile = new File("~/Desktop/automation/javascript/_new_cad_workflow/build_mockup/evaled_bin/components_bin.jsx");

	var result = "";

	for(var x=0;x<files.length;x++)
	{
		var thisFile = files[x];
		thisFile.open();
		result += "eval(\"" + thisFile.read() + "\")";
	}

	writeFile.open("w");
	writeFile.write(result);
	writeFile.close();
}
test();