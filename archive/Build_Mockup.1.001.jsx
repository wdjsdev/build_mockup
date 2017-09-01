/*
	Script Name: Mockup Builder 
	Author: William Dowling
	Creation Date: 23 Nov, 2015
	Description:
		Read online builder generated information and compile necessary
		artwork into the mockup file. Change necessary colors on template
		files and name/number styles.
	Version History:
		Original build: 23.11.15
		Version 1.001:
			Setup script functions and global variables. Basic first round setup to
			facilitate early testing.

*/

function wrapper(){
	var orderNumber = prompt("Enter the order number","builder_json_001");
	var infoSrc = new Folder("~/Desktop/In Progress/~OLD/Automation/Javascript/_New CAD Workflow/CSV Testing/Mockup Creation/Txt Files");
	var orderInfo = getOrderInfo();
	var templateFile;
	var errorLog = [];

	//Shirt Style and Color options//
	var shirtInfo = orderInfo.topOptions;
	var fabric = shirtInfo.material;
	var styleNum = shirtInfo.selectedDesign.slice(1,shirtInfo.selectedDesign.length);
	var shirtStyle = convertShirtStyle(shirtInfo.style,orderInfo.params.product);
	var buttonColor = buttonInfo(shirtInfo.buttonColor);
	var shirtColors = shirtInfo.colorBlocks;
	var c1 = getShirtColors(shirtColors,"C1");
	var c2 = getShirtColors(shirtColors,"C2");
	var c3 = getShirtColors(shirtColors,"C3");
	var c4 = getShirtColors(shirtColors,"C4");
	var c5 = getShirtColors(shirtColors,"C5");
	var c6 = getShirtColors(shirtColors,"C6");
	var collar = getShirtColors(shirtColors,"COLLAR");

	//Front Logo and Color options//
	var logoInfo = orderInfo.topDecorations;
	var logoStyle = logoInfo.logo;
	var logoColors = logoInfo.logoColors;
	var logoColor1 = getLogoColors(logoColors,"g1");
	var logoColor2 = getLogoColors(logoColors,"g2");
	var logoColor3 = getLogoColors(logoColors,"g3");
	var logoColor4 = getLogoColors(logoColors,"g4");

	function openTemplate(shirtStyle,styleNum){
		//temporary hard coded path for testing. MUST standardize prepress folder for this to work universally.
		//this hard coded path for mens slowpitch only.
		var thePath = new Folder("/Volumes/Customization/Library/cads/prepress/FD_SLOW_SS/ConvertedTemplates/FD-SLOW-SS/");
		var theFile = new File(thePath + "/FD_SLOW_" + styleNum + ".ait");
		alert(thePath + " FD_SLOW_" + styleNum + ".ait");
		var docRef = open(theFile);
		templateFile = theFile;

	}

	openTemplate(shirtStyle,styleNum);


	function getOrderInfo(){
		var theFile = new File(infoSrc + "/" + orderNumber + ".txt")
		theFile.open();
		var contents = "(" + theFile.read() + ")";
		theFile.close();

		var theObj = eval(contents);
		return theObj;
	}

	function convertShirtStyle(style,product){
		if(style == "SS" && product == "FD-SLOW"){
			return "FD_SLOW_";
		}
	}

	function buttonInfo(buttonColor){
		if(buttonColor != '' && shirtStyle.indexOf('FB')>-1){
			return buttonColor;
		}
		else if(buttonColor != '' && shirtstyle.indexOf('FB')==0){
			errorLog.push("Button color is called out but this shirt is not a button style.");
			return null;
		}
		else{
			return null;
		}
	}

	function getShirtColors(shirtColors,color){
		var theColor = shirtColors["PARAMCOLOR_X5F_" + color];
		if(theColor!= 'undefined'){
			return theColor;
		}
		else{
			return null;
		}
	}

	function getLogoColors(logoColors,color){
		var theColor = logoColors["paramcolor_x5F_" + color];
		if(theColor != 'undefined'){
			return theColor;
		}
		else{
			return null;
		}
	}
}
wrapper();