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
		Version 1.002: 24.11.15
			Continue with building script functions and determining areas of improvement
			with regards to file server and naming conventions etc. Currently the script 
			reads the builder JSON data and opens the necessary template file from the network.
			This file path is hard coded for now until the prepress folder is standardized.
		Version 1.003: 24.11.15
			Need to add script UI dialogs for boombah logo and collar info colors. Populate
			list of buttons with available document colors. 
			Script UI is up and running. Collar Info color does not change. Templates need
			to be updated such that collars have nice clean compound paths for collar info
			rather than the messy groups that exist currently. 
*/

function wrapper(){
	var orderNumber = prompt("Enter the order number","builder_json_001");
	var infoSrc = new Folder("~/Desktop/In Progress/~OLD/Automation/Javascript/_New CAD Workflow/CSV Testing/Mockup Creation/Txt Files");
	var orderInfo = getOrderInfo();
	var orderColors = [];
	var errorLog = [];


	//Swatch Info Container

	var boombahSwatches = {
		"B" : {"name":"Black B","c":25,"m":50,"y":75,"k":100},
		"W" : {"name":"White B","c":0,"m":0,"y":0,"k":0},
		"GY" : {"name":"Gray B","c":44,"m":40,"y":41,"k":3},
		"STL" : {"name":"Steel B","c":53,"m":49,"y":43,"k":10},
		"N" : {"name":"Navy B","c":83,"m":73,"y":53,"k":61},
		"RB" : {"name":"Royal Blue B","c":100,"m":89,"y":33,"k":23},
		"CB" : {"name":"Columbia B","c":68,"m":30,"y":5,"k":0},
		"CY" : {"name":"Cyan B","c":88,"m":48,"y":15,"k":1},
		"TL" : {"name":"Teal B","c":87,"m":40,"y":44,"k":11},
		"DG" : {"name":"Dark Green B","c":85,"m":48,"y":76,"k":54},
		"KG" : {"name":"Kelly Green B","c":94,"m":26,"y":87,"k":13},
		"LG" : {"name":"Lime Green B","c":51,"m":0,"y":87,"k":0},
		"YL" : {"name":"Yellow B","c":0,"m":0,"y":100,"k":0},
		"OY" : {"name":"Optic Yellow B","c":22,"m":2,"y":98,"k":0},
		"GD" : {"name":"Athletic Gold B","c":5,"m":40,"y":95,"k":0},
		"VG" : {"name":"Vegas Gold B","c":26,"m":31,"y":57,"k":1},
		"O" : {"name":"Orange B","c":11,"m":85,"y":100,"k":2},
		"TO" : {"name":"Texas Orange B","c":27,"m":78,"y":99,"k":20},
		"RD" : {"name":"Red B","c":22,"m":100,"y":93,"k":16},
		"CRD" : {"name":"Cardinal B","c":35,"m":95,"y":71,"k":44},
		"MRN" : {"name":"Maroon B","c":50,"m":76,"y":61,"k":57},
		"HP" : {"name":"Hot Pink B","c":35,"m":98,"y":31,"k":5},
		"PK" : {"name":"Pink B","c":11,"m":71,"y":17,"k":0},
		"SP" : {"name":"Soft Pink B","c":4,"m":30,"y":1,"k":0},
		"PU" : {"name":"Purple B","c":91,"m":99,"y":27,"k":15},
		"FL" : {"name":"Flesh B","c":7,"m":17,"y":34,"k":0},
		"DF" : {"name":"Dark Flesh B","c":24,"m":41,"y":51,"k":1},
		"BN" : {"name":"Brown B","c":43,"m":71,"y":81,"k":51},
		"FO" : {"name":"FLO ORANGE B","c":1,"m":72,"y":98,"k":0},
		"FY" : {"name":"FLO YELLOW B","c":3,"m":0,"y":100,"k":3},
		"FP" : {"name":"FLO PINK B","c":0,"m":100,"y":0,"k":0},
		"TW" : {"name":"Twitch B","c":15,"m":0,"y":97,"k":0},
		"MN" : {"name":"MINT B","c":57,"m":0,"y":62,"k":0},
		"NC" : {"name":"NEON CORAL B","c":0,"m":82,"y":57,"k":0},
		"FLM" : {"name":"FLAME B","c":0,"m":87,"y":100,"k":0},
		"MG" : {"name":"Magenta B","c":7,"m":100,"y":64,"k":26},
		"BPU" : {"name":"BRIGHT PURPLE B","c":40,"m":67,"y":1,"k":0},
		"DC" : {"name":"Dark Charcoal B","c":63,"m":62,"y":63,"k":51}
	}

	//Swatch Info Container


	//Shirt Style and Color options//
	var shirtInfo = orderInfo.topOptions;
	var fabric = shirtInfo.material;
	var styleNum = shirtInfo.selectedDesign.slice(1,shirtInfo.selectedDesign.length);
	var shirtStyle = convertShirtStyle(shirtInfo.style,orderInfo.params.product);
	var buttonColor = buttonInfo(shirtInfo.buttonColor);
	var templateFile = openTemplate(shirtStyle,styleNum);
	var docRef = app.activeDocument;
	var swatches = docRef.swatches
	var pushedColors = '';
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

	

	function layerVis(bool){
		docRef.layers[0].layers["Prepress"].visible = bool;
	}

	function openTemplate(shirtStyle,styleNum){
		//temporary hard coded path for testing. MUST standardize prepress folder for this to work universally.
		//this hard coded path for mens slowpitch only.
		var thePath = new Folder("/Volumes/Customization/Library/cads/prepress/FD_SLOW_SS/ConvertedTemplates/FD-SLOW-SS/");
		var theFile = new File(thePath + "/FD_SLOW_" + styleNum + ".ait");
		var docRef = open(theFile);
		// templateFile = app.activeDocument;
	}

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

	function makeSwatch(thisColor){
        var newSpot = docRef.spots.add();
        var newSwatch = new CMYKColor();
        newSwatch.cyan = thisColor.c;
        newSwatch.magenta = thisColor.m;
        newSwatch.yellow = thisColor.y;
        newSwatch.black = thisColor.k;
        try{
	        newSpot.name = thisColor.name;
	    }
	    catch(e){
	    	newSpot.remove();
	    	return;
	    }
        newSpot.colorType = ColorModel.SPOT;
        newSpot.color = newSwatch;
        var newSpotColor = new SpotColor();
        newSpotColor.spot = newSpot;
        // orderColors.push(newSpot);
    }

	function getShirtColors(shirtColors,color){
		var theColor = shirtColors["PARAMCOLOR_X5F_" + color];
		if(theColor != undefined){
			try{
				makeSwatch(boombahSwatches[theColor.baseColor]);
			}
			catch(e){
				errorLog.push("Couldn't create swatch: " + theColor.baseColor);
			}
			if(pushedColors.indexOf(theColor.baseColor)==-1){
				orderColors.push(theColor.baseColor);
				pushedColors += theColor.baseColor;
			}
			return theColor.baseColor;
		}
		else{
			return null;
		}
	}

	function getLogoColors(logoColors,color){
		var theColor = logoColors["paramcolor_x5F_" + color];
		if(theColor != undefined){
			return theColor;
		}
		else{
			return null;
		}
	}

	function changeTemplateColors(c1,c1Name,c2,c2Name,c3,c3Name,c4,c4Name,c5,c5Name,c6,c6Name,collar,collarName){
		layerVis(true);
		for(var a=0;a<arguments.length;a+=2){
			var curColor = arguments[a];
			var curCName = arguments[a+1];
			if(curColor!=null){
				var sel = docRef.selection;
				sel = null;
				var thisColor = swatches[arguments[a+1]];
				docRef.defaultFillColor = swatches[curCName].color;
				app.executeMenuCommand("Find Fill Color menu item");
				sel = docRef.selection;
				for(var b=0;b<sel.length;b++){
					if(sel[b].typename!='PathItem'){
						for(var c=0;c<sel[b].pathItems.length;c++){
							sel[b].pathItems[c].fillColor = swatches[boombahSwatches[curColor].name].color;
						}
					}
					else{
						sel[b].fillColor = swatches[boombahSwatches[curColor].name].color;
					}
				}
			}
			docRef.selection = null;
		}
	}

	function boomLogoAndInfoColors(boomLogo,boomLogoName,collarInfo,collarInfoName){
		for(var a=0;a<arguments.length;a+=2){
			var curColor = arguments[a];
			var curCName = arguments[a+1];
			if(curColor!=null && curColor!=undefined){
				var sel = docRef.selection;
				sel = null;
				var thisColor = swatches[arguments[a+1]];
				docRef.defaultFillColor = swatches[curCName].color;
				app.executeMenuCommand("Find Fill Color menu item");
				sel = docRef.selection;
				for(var b=0;b<sel.length;b++){
					if(sel[b].typename!='PathItem'){
						for(var c=0;c<sel[b].pathItems.length;c++){
							sel[b].pathItems[c].fillColor = swatches[boombahSwatches[curColor].name].color;
						}
					}
					else{
						sel[b].fillColor = swatches[boombahSwatches[curColor].name].color;
					}
				}
			}
			docRef.selection = null;
		}
		layerVis(false);
	}

	function getBoomLogoColor(){
		var result;
		var buttons = [];
		var boomColor = new Window("dialog", "What color should the Boombah Logo be?");
		var boomColorInfo = createBoomColorWindow();
		function createBoomColorWindow(){
			var textGroup = boomColor.add("group");
			textGroup.add("statictext", undefined, "What color should the Boombah logo be?");
			var buttonGroup = boomColor.add("group");
			buttonGroup.orientation = "column";
			for(var a=0;a<orderColors.length;a++){
				var thisColor = orderColors[a];
				addButton(a,thisColor);
			}
			function addButton(num,thisColor){
				buttons[num] = buttonGroup.add("button", undefined, boombahSwatches[thisColor].name);
				buttons[num].onClick = function(){
					result = thisColor;
					boomColor.close();
				}
			}
		}
		boomColor.show();
		return result;
	}

	function getCollarInfoColor(){
		var result;
		var buttons = [];
		var infoColor = new Window("dialog", "What color should the Collar Info be?");
		var collarInfoColorInfo = createCollarInfoColorWindow();
		function createCollarInfoColorWindow(){
			var textGroup = infoColor.add("group");
			textGroup.add("statictext", undefined, "What color should the Collar Info be?");
			var buttonGroup = infoColor.add("group");
			buttonGroup.orientation = "column";
			for(var a=0;a<orderColors.length;a++){
				var thisColor = orderColors[a];
				addButton(a,thisColor);
			}
			function addButton(num,thisColor){
				buttons[num] = buttonGroup.add("button",undefined, boombahSwatches[thisColor].name);
				buttons[num].onClick = function(){
					result = thisColor;
					infoColor.close();
				}
			}
		}
		infoColor.show();
		return result;
	}

	//Function Calls

	changeTemplateColors(c1,"C1",c2,"C2",c3,"C3",c4,"C4",c5,"C5",c6,"C6",collar,"Collar B");
	app.redraw();
	var boomLogoColor = getBoomLogoColor();
	var collarInfoColor = getCollarInfoColor();
	boomLogoAndInfoColors(boomLogoColor,"Boombah Logo B",collarInfoColor,"Collar Info B");
}
wrapper();