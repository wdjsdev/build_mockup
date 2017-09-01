/*
	Component Name: get_sub_style
	Author: William Dowling
	Creation Date: 10 April, 2017
	Description: 
		If the garment code has two possible options, determine the correct one
		based on the style number. for example:
		FD-161/FD-163
		Both of these garment codes refer to a Slowpitch short sleeve jersey, but the
			jersey could be either one depending on the style number.
			style number 1001 would be 163, but style number 1004 would be 161
	Arguments
		garment code
		style number
	Return value
		a string representing the correct garment code

*/

	function getSubStyle(itemName, style)
	{
		var subStyle;

		log.l("::Beginning getSubStyle function with arguments: :: 	itemName = " + itemName + ":: 	style = " + style);

		var fdSlowSS = {"1000":"FD-163", "1001":"FD-163", "1002":"FD-163", "1003":"FD-163", "1005":"FD-163", "1006":"FD-163", "1007":"FD-163", "1009":"FD-163", "1010":"FD-163", "1011":"FD-163", "1012":"FD-163", "1013":"FD-163", "1014":"FD-163", "1015":"FD-163", "1017":"FD-163", "1018":"FD-163", "1019":"FD-163", "1020":"FD-163", "1022":"FD-163", "1023":"FD-163", "1024":"FD-163", "1025":"FD-163", "1030":"FD-163", "1035":"FD-163", "1036":"FD-163", "1037":"FD-163", "1040":"FD-163", "1041":"FD-163", "1042":"FD-163", "1043":"FD-163", "1044":"FD-163", "1045":"FD-163", "1046":"FD-163", "1047":"FD-163", "1048":"FD-163", "1049":"FD-163", "1052":"FD-163", "1053":"FD-163", "1054":"FD-163", "1056":"FD-163", "1059":"FD-163", "1062":"FD-163", "1063":"FD-163", "1064":"FD-163", "1065":"FD-163", "1066":"FD-163", "1067":"FD-163", "1068":"FD-163","1004":"FD-161", "1008":"FD-161", "1016":"FD-161", "1021":"FD-161", "1026":"FD-161", "1029":"FD-161", "1031":"FD-161", "1032":"FD-161", "1033":"FD-161", "1034":"FD-161", "1038":"FD-161", "1039":"FD-161", "1050":"FD-161", "1055":"FD-161", "1057":"FD-161", "1058":"FD-161", "1060":"FD-161", "1061":"FD-161", "1069":"FD-161", "1070":"FD-161", "1071":"FD-161"};
		var fdFastSS = {"1000"	:"FD-163W", "1001":"FD-163W", "1002":"FD-163W", "1003":"FD-163W", "1005":"FD-163W", "1006":"FD-163W", "1007":"FD-163W", "1009":"FD-163W", "1010":"FD-163W", "1011":"FD-163W", "1012":"FD-163W", "1013":"FD-163W", "1014":"FD-163W", "1015":"FD-163W", "1017":"FD-163W", "1018":"FD-163W", "1019":"FD-163W", "1020":"FD-163W", "1022":"FD-163W", "1023":"FD-163W", "1024":"FD-163W", "1025":"FD-163W", "1030":"FD-163W", "1035":"FD-163W", "1036":"FD-163W", "1037":"FD-163W", "1040":"FD-163W", "1041":"FD-163W", "1042":"FD-163W", "1043":"FD-163W", "1044":"FD-163W", "1045":"FD-163W", "1046":"FD-163W", "1047":"FD-163W", "1048":"FD-163W", "1049":"FD-163W", "1052":"FD-163W", "1053":"FD-163W", "1054":"FD-163W", "1056":"FD-163W", "1059":"FD-163W", "1062":"FD-163W", "1063":"FD-163W", "1064":"FD-163W", "1065":"FD-163W", "1066":"FD-163W", "1067":"FD-163W", "1068":"FD-163W","1004":"FD-161W", "1008":"FD-161W", "1016":"FD-161W", "1021":"FD-161W", "1026":"FD-161W", "1029":"FD-161W", "1031":"FD-161W", "1032":"FD-161W", "1033":"FD-161W", "1034":"FD-161W", "1038":"FD-161W", "1039":"FD-161W", "1050":"FD-161W", "1055":"FD-161W", "1057":"FD-161W", "1058":"FD-161W", "1060":"FD-161W", "1061":"FD-161W", "1069":"FD-161W", "1070":"FD-161W", "1071":"FD-161W"};
		var fdSlowySS = {"1000":"FD-163Y", "1001":"FD-163Y", "1002":"FD-163Y", "1003":"FD-163Y", "1005":"FD-163Y", "1006":"FD-163Y", "1007":"FD-163Y", "1009":"FD-163Y", "1010":"FD-163Y", "1011":"FD-163Y", "1012":"FD-163Y", "1013":"FD-163Y", "1014":"FD-163Y", "1015":"FD-163Y", "1017":"FD-163Y", "1018":"FD-163Y", "1019":"FD-163Y", "1020":"FD-163Y", "1022":"FD-163Y", "1023":"FD-163Y", "1024":"FD-163Y", "1025":"FD-163Y", "1030":"FD-163Y", "1035":"FD-163Y", "1036":"FD-163Y", "1037":"FD-163Y", "1040":"FD-163Y", "1041":"FD-163Y", "1042":"FD-163Y", "1043":"FD-163Y", "1044":"FD-163Y", "1045":"FD-163Y", "1046":"FD-163Y", "1047":"FD-163Y", "1048":"FD-163Y", "1049":"FD-163Y", "1052":"FD-163Y", "1053":"FD-163Y", "1054":"FD-163Y", "1056":"FD-163Y", "1059":"FD-163Y", "1062":"FD-163Y", "1063":"FD-163Y", "1064":"FD-163Y", "1065":"FD-163Y", "1066":"FD-163Y", "1067":"FD-163Y", "1068":"FD-163Y","1004":"FD-161Y", "1008":"FD-161Y", "1016":"FD-161Y", "1021":"FD-161Y", "1026":"FD-161Y", "1029":"FD-161Y", "1031":"FD-161Y", "1032":"FD-161Y", "1033":"FD-161Y", "1034":"FD-161Y", "1038":"FD-161Y", "1039":"FD-161Y", "1050":"FD-161Y", "1055":"FD-161Y", "1057":"FD-161Y", "1058":"FD-161Y", "1060":"FD-161Y", "1061":"FD-161Y", "1069":"FD-161Y", "1070":"FD-161Y", "1071":"FD-161Y"};
		var fdLaxRSS = {"1000":"FD-260","1001":"FD-260","1002":"FD-260","1003":"FD-260","1004":"FD-260","1005":"FD-3007","1006":"FD-3007","1007":"FD-3007","1008":"FD-3007","1017":"FD-260","1018":"FD-260","1019":"FD-260","1020":"FD-3007","1021":"FD-3007","1022":"FD-3007"}
		var fdLaxSS = {"1000":"FD-260","1001":"FD-260","1002":"FD-260","1003":"FD-260","1004":"FD-260","1005":"FD-3007","1006":"FD-3007","1007":"FD-3007","1008":"FD-3007","1017":"FD-260","1018":"FD-260","1019":"FD-260","1020":"FD-3007","1021":"FD-3007","1022":"FD-3007"};	
		var fdLaxWSS = {"1000":"FD-3011W","1001":"FD-3047W","1002":"FD-3047W","1003":"FD-3047W","1004":"FD-3047W","1005":"FD-3047W","1006":"FD-3047W","1007":"FD-3047W","1008":"FD-3047W","1009":"FD-3011W","1010":"FD-3011W","1011":"FD-3011W","1012":"FD-3011W","1013":"FD-3011W","1014":"FD-3011W","1015":"FD-3011W","1016":"FD-3011W","1017":"FD-3011W"};
		var fdSpSS = {"1000":"FD-163","1003":"FD-163","1004":"FD-139","1007":"FD-163","1008":"FD-139","1012":"FD-163","1015":"FD-163","1043":"FD-163","1065":"FD-163","1066":"FD-163"};
		var fdSpHD = {"1000":"FD-872","1001":"FD-692","1002":"FD-692","1003":"FD-692","1004":"FD-692","1006":"FD-872","1007":"FD-872","1008":"FD-872","1009":"FD-872","1010":"FD-872","1011":"FD-872","1012":"FD-872","1013":"FD-872","1014":"FD-872","1015":"FD-872","1016":"FD-872","1017":"FD-872","1018":"FD-872","1019":"FD-872","1022":"FD-872"};
		var fdSpwSS = {"1001":"FD-163W","1003":"FD-163W","1004":"FD-139W","1007":"FD-163W","1008":"FD-139W","1012":"FD-163W","1015":"FD-163W","1043":"FD-163W","1065":"FD-163W","1066":"FD-163W"};
		var fdSpwHD = {"1000":"FD-872W","1001":"FD-692W","1002":"FD-692W","1003":"FD-692W","1004":"FD-692W","1006":"FD-872W","1007":"FD-872W","1008":"FD-872W","1009":"FD-872W","1010":"FD-872W","1011":"FD-872W","1012":"FD-872W","1013":"FD-872W","1014":"FD-872W","1015":"FD-872W","1016":"FD-872W","1017":"FD-872W","1018":"FD-872W","1019":"FD-872W","1022":"FD-872W"};
		var fdFastSL = {"1000":"FD-500W","1001":"FD-500W","1002":"FD-500W","1003":"FD-500W","1004":"FD-500W","1005":"FD-500W","1006":"FD-500W","1007":"FD-500W","1008":"FD-500W","1009":"FD-500W","1010":"FD-500W","1011":"FD-500W","1012":"FD-500W","1013":"FD-500W","1014":"FD-500W","1015":"FD-500W","1016":"FD-500W","1017":"FD-500W","1018":"FD-500W","1019":"FD-500W","1020":"FD-500W","1021":"FD-500W","1022":"FD-500W","1023":"FD-500W","1024":"FD-500W","1025":"FD-500W","1026":"FD-500W","1027":"FD-500W","1052":"FD-500W","1053":"FD-500W","1054":"FD-500W","1055":"FD-500W","1057":"FD-500W","1058":"FD-500W","1059":"FD-500W","1060":"FD-500W","1061":"FD-500W","1062":"FD-500W","1062":"FD-500W","1063":"FD-500W","1064":"FD-500W","1065":"FD-500W","1066":"FD-500W","1067":"FD-500W"}
		var fdSocSS = {"1000":"FD-858","1001":"FD-858","1002":"FD-858","1003":"FD-858","1004":"FD-858","1005":"FD-3061","1006":"FD-3061","1007":"FD-3061","1008":"FD-3062","1009":"FD-3062","1010":"FD-3062","1011":"FD-3063","1012":"FD-3063","1013":"FD-3063","1014":"FD-3063","1015":"FD-3063","1016":"FD-3064","1017":"FD-3064","1018":"FD-3064","1019":"FD-3064","1020":"FD-3064"};
		var fdSocWomensSS = {"1000":"FD-3037W","1001":"FD-3037W","1002":"FD-3037W","1003":"FD-3037W","1004":"FD-3048W","1005":"FD-3048W","1006":"FD-3048W","1007":"FD-3048W"};


		switch(itemName)
		{
			case 'FD-SLOW-SS':
			case 'FD-SLOW-SS-DE':
			case 'FD-SLOW-SS-MM':
			case 'FD-BASE-SS':
			case 'FD-SP-SS':
			case 'FD-BASE-SS':
				subStyle = fdSlowSS[style];
				break;

			//removing this block becuase FD-BASE-SS should be treated as FD-SLOW-SS
			// case 'FD-BASE-SS':
			// 	subStyle = fdBaseSS[style];
			// 	break;
			case 'FD-FAST':
				subStyle = fdSlowwSS[style];
				break;
			case 'FD-FAST-SS':
				subStyle = fdFastSS[style];
				break; 
			case 'FD-FAST-SL':
				subStyle = fdFastSL[style];
				break;
			case 'FD-LAX-RSS':
				subStyle = fdLaxRSS[style];
				break;
			case 'FD-LAX-SS':
				subStyle = fdLaxSS[style];
				break;
			case 'FD-LAXW-SS':
				subStyle = fdLaxWSS[style];
				break;
			
			//removing this block because FD-SP-SS should be treated as FD_slow
			// case 'FD-SP-SS':
			// 	subStyle = fdSpSS[style];
			// 	break;
			case 'FD-SP-HD':
				subStyle = fdSpHD[style];
				break;
			case 'FD-SPW-SS':
				subStyle = fdSpwSS[style];
				break;
			case 'FD-SPW-HD':
				subStyle = fdSpwHD[style];
				break;
			case 'FD-SOC-SS':
				subStyle = fdSocSS[style];
				break;
			case 'FD-SOCW-SS':
				subStyle = fdSocWomensSS[style];
				break;
			default:
				subStyle = undefined;
				log.e(itemName + " does not exist in the subStyle switch statement.");
				break;

		}

		log.l("End of getSubStyle function returning " + subStyle);
		return subStyle;
	}