/*
	Component Name: get_sport
	Author: William Dowling
	Creation Date: 12 April, 2017
	Description: 
		determine the correct sport folder in the prepress folder.
		if the sport cannot be automatically determined, prompt the user
	Arguments
		garment object
	Return value
		a string representing the sport

*/

function getSport(garObj)
{
	log.h("Beginning execution of getSport function.");
	var result = true;
	var sport;

	var garmentCode = garObj.garmentCode;

	switch(garmentCode)
	{
		case "FD-137W":
		case "FD-137Y":
		case "FD-137":
		case "FD-210":
		case "FD-210Y":
		case "FD-211":
		case "FD-211Y":
		case "FD-215":
		case "FD-219":
		case "FD-215_FD-219":
		case "FD-215W":
		case "FD-215W_FD-219W":
		case "FD-215Y_FD-219Y":
		case "FD-215Y":
		case "FD-217W":
		case "FD-217Y":
		case "FD-217":
		case "FD-220W":
		case "FD-622W":
		case "FD-622Y":
		case "FD-622":
			sport = "BASKETBALL";
			break;

		case "FD-105":
		case "FD-4054W":
		case "FD-4061W":
		case "FD-410Y":
		case "FD-410":
		case "FD-412-412Y":
		case "FD-415-415Y":
		case "FD-415Y":
		case "FD-415":
		case "FD-420Y":
		case "FD-420":
		case "FD-425Y":
		case "FD-425":
		case "FD-430Y":
		case "FD-430":
		case "FD-436Y":
		case "FD-436":
		case "FD-439Y":
		case "FD-5038W":
		case "FD-5071":
		case "FD-5072W":
		case "FD-5074Y":
		case "FD-750W":
		case "FD-751W":
		case "FD-752W":
		case "FD-753W":
			sport = "COMPRESSION";
			break;

		case "FD-2040W":
		case "FD-2040Y":
		case "FD-3032W":
		case "FD-3032Y":
		case "FD-3033W":
		case "FD-3033Y":
		case "FD-3052W":
		case "FD-3052Y":
		case "FD-4040W":
		case "FD-4040Y":
		case "PS-2035W":
		case "PS-2035Y":
		case "PS-2036W":
		case "PS-2036Y":
		case "PS-2037W":
		case "PS-2037Y":
		case "PS-4048W":
		case "PS-4048Y":
		case "PS-4049W":
		case "PS-4049Y":
		case "PS-4070W":
		case "PS-4070Y":
			sport = "CHEERLEADING";
			break;

		case "FD-1000Y":
		case "FD-1000":
		case "FD-161W":
		case "FD-161Y":
		case "FD-161":
		case "FD-163W":
		case "FD-163Y":
		case "FD-163":
		case "FD-163W/FD-161W":
		case "FD-163Y/FD-161Y":
		case "FD-163/FD-161":
		case "FD-230Y":
		case "FD-230":
		case "FD-233Y":
		case "FD-233":
		case "FD-234Y":
		case "FD-234":
		case "FD-240W":
		case "FD-243W":
		case "FD-246W":
		case "FD-3417":
		case "FD-3417Y":
		case "FD-400W":
		case "FD-4416W":
		case "FD-500W":
		case "FD-505W":
		case "FD-5060W":
		case "FD-609W":
		case "FD-609Y":
		case "FD-609":
		case "PS-5014W":
		case "PS-5014Y":
		case "PS-5014":
		case "PS-5075W":
		case "PS-5075":
		case "BM-235":
		case "BM-236":
		case "BM-3401":
		case "BM-3402":
		case "BM-3403":
		case "BM-3404":
		case "BM-3405":
		case "BM-3406":
		case "BM-3407":
		case "BM-3408":
		case "BM-3409":
		case "BM-3410":
		case "BM-3411":
		case "BM-3412":
		case "BM-3413":
		case "BM-3414":
		case "BM-3415":
		case "BM-3416":
		case "BM-3417":
		case "BM-3418":
		case "BM-3419":
		case "BM-4401W":
		case "BM-4402W":
		case "BM-4403W":
		case "BM-4404W":
		case "BM-4405W":
		case "BM-4406W":
		case "BM-4407W":
		case "BM-4408W":
		case "BM-4409W":
		case "BM-4410W":
		case "BM-4411W":
		case "BM-4412W":
		case "BM-4413W":
		case "BM-4414W":
		case "BM-4415W":
		case "BM-4416W":
		case "BM-4417W":
		case "BM-4418W":
		case "BM-4419W":
		case "BM-4420W":
		case "BM-500T":
		case "BM-501S":
		case "BM-501T":
		case "BM-502T":
		case "BM-503T":
		case "BM-504T":
			sport = "DIAMOND SPORTS";
			break;

		case "FD-250Y": 
		case "FD-250": 
		case "FD-251": 
		case "FD-5064Y": 
		case "FD-5064": 
		case "FD-5080Y": 
		case "FD-5080": 
		case "FD-5411Y": 
		case "FD-5411": 
		case "BM-5401":
		case "BM-5402":
		case "BM-5403":
		case "BM-5404":
		case "BM-5405":
		case "BM-5406":
		case "BM-5407":
		case "BM-5408":
		case "BM-5409":
		case "BM-5801":
		case "BM-5802":
		case "BM-5803":
		case "BM-5804":
		case "BM-5805":
		case "BM-5806":
		case "BM-5807":
		case "BM-5808":
		case "BM-5809":
			sport = "FOOTBALL";
			break;

		case "FD-4017Y":
		case "FD-4017":
		case "FD-410Y":
		case "FD-410":
		case "FD-412Y":
		case "FD-412":
		case "FD-438Y":
		case "FD-438":
			sport = "FOOTBALL 7 ON 7";
			break;

		case "FD-2000Y":
		case "FD-2000":
		case "FD-2020Y":
		case "FD-2020":
		case "FD-260Y":
		case "FD-260":
		case "FD-261Y":
		case "FD-261":
		case "FD-3007Y":
		case "FD-3007":
		case "FD-3011W":
		case "FD-3015W":
		case "FD-3019W":
		case "FD-3024Y":
		case "FD-3027":
		case "FD-3038Y":
		case "FD-3042":
		case "FD-3045W":
		case "FD-3047W":
		case "FD-3050Y":
		case "FD-3050":
		case "FD-4004W":
		case "FD-4014W":
			sport = "LACROSSE";
			break;

		case "FD-3037W":
		case "FD-3048W":
		case "FD-3061Y":
		case "FD-3061":
		case "FD-3062Y":
		case "FD-3062":
		case "FD-3063Y":
		case "FD-3063":
		case "FD-3064Y":
		case "FD-3064":
		case "FD-3090W":
		case "FD-3092Y":
		case "FD-3092":
		case "FD-4005W":
		case "FD-857Y":
		case "FD-857":
		case "FD-858Y":
		case "FD-858":
			sport = "SOCCER";
			break;

		case "FD-101":
		case "FD-161":
		case "FD-163":
		case "FD-164W":
		case "FD-164Y":
		case "FD-164":
		case "FD-1873W":
		case "FD-1873Y":
		case "FD-1873":
		case "FD-1874W":
		case "FD-1874Y":
		case "FD-1874":
		case "FD-2042W":
		case "FD-2044W":
		// case "FD-211Y":
		// case "FD-211":
		case "FD-3069":
		case "FD-3070":
		case "FD-3089W":
		case "FD-3099W":
		case "FD-4009Y":
		case "FD-4010Y":
		case "FD-4018W":
		case "FD-477Y":
		case "FD-477":
		case "FD-486W":
		case "FD-486Y":
		case "FD-486":
		case "FD-487Y":
		case "FD-487":
		case "FD-5029W":
		case "FD-5036W":
		case "FD-5054":
		case "FD-597":
		case "FD-597Y":
		case "FD-597W":
		case "FD-6002W":
		case "FD-6003Y":
		case "FD-6003Y":
		case "FD-6003":
		case "FD-6004W":
		case "FD-6061W":
		case "FD-6061Y":
		case "FD-6061":
		case "FD-6062W":
		case "FD-6062Y":
		case "FD-6062":
		case "FD-6063W":
		case "FD-6063Y":
		case "FD-6063":
		case "FD-611":
		case "FD-611Y":
		case "FD-617Y":
		case "FD-617":
		case "FD-622":
		case "FD-634":
		case "FD-634Y":
		case "FD-648W":
		case "FD-648Y":
		case "FD-648":
		case "FD-659Y":
		case "FD-659":
		case "FD-682W":
		case "FD-682Y":
		case "FD-682":
		case "FD-692W":
		case "FD-692Y":
		case "FD-692":
		case "FD-7018W":
		case "FD-7020W":
		case "FD-7025Y":
		case "FD-7025":
		case "FD-706W":
		case "FD-762W":
		case "FD-828Y":
		case "FD-828":
		case "FD-829W":
		case "FD-842W":
		case "FD-842Y":
		case "FD-842":
		case "FD-862W":
		case "FD-862Y":
		case "FD-862":
		case "FD-863W":
		case "FD-863Y":
		case "FD-863":
		case "FD-872W":
		case "FD-872Y":
		case "FD-872":
		case "BM-162W":
		case "BM-162":
		case "BM-163W":
		case "BM-163":
		case "BM-3001W":
		case "BM-3001":
		case "BM-3002":
		case "BM-3085":
		case "BM-3099W":
		case "BM-3099":
		case "BM-3100W":
		case "BM-3100":
		case "BM-3111":
		case "BM-340W":
		case "BM-340":
		case "BM-342":
		case "BM-345W":
		case "BM-345":
		case "BM-346":
		case "BM-4025":
		case "BM-4026":
		case "BM-4027":
		case "BM-4028":
		case "BM-4029":
		case "BM-4030":
		case "BM-4045":
		case "BM-466":
		case "BM-475":
		case "BM-477W":
		case "BM-477":
		case "BM-487W":
		case "BM-487":
		case "BM-593W":
		case "BM-593":
		case "BM-594W":
		case "BM-594":
		case "BM-595":
		case "BM-596W":
		case "BM-596":
		case "BM-6000":
		case "BM-6001W":
		case "BM-6003":
		case "BM-6017W":
		case "BM-6017":
		case "BM-6019":
		case "BM-6025W":
		case "BM-6025":
		case "BM-6027":
		case "BM-6043":
		case "BM-6061W":
		case "BM-6061":
		case "BM-609":
		case "BM-611W":
		case "BM-611":
		case "BM-652":
		case "BM-659":
		case "BM-682W":
		case "BM-682":
		case "BM-706W":
		case "BM-807W":
		case "BM-807":
		case "BM-842W":
		case "BM-842":
		case "BM-862W":
		case "BM-862":
		case "BM-868W":
		case "BM-868":
		case "BM-869W":
		case "BM-869":
		case "BM-872W":
		case "BM-872":
			sport = "SPIRITWEAR";
			break;

		case "FD-2050Y":
		case "FD-2050":
		case "FD-2051Y":
		case "FD-2051":
		case "FD-2052Y":
		case "FD-2052":
		case "FD-2053W":
		case "FD-2053Y":
		case "FD-2054W":
		case "FD-2054Y":
		case "FD-4022W":
		case "FD-4023W":
		case "FD-4032Y":
		case "FD-4032":
		case "FD-4033Y":
		case "FD-4033":
		case "FD-4035Y":
		case "FD-4035":
			sport = "TRACK";
			break;

		case "FD-281":
		case "FD-3003":
		case "FD-3180W":
		case "FD-3181W":
		case "FD-3181Y":
		case "FD-3181":
		case "FD-3182W":
		case "FD-3182Y":
		case "FD-3182":
		case "FD-3183W":
		case "FD-3184W":
		case "FD-3185W":
		case "FD-4057Y":
		case "FD-4057":
			sport = "VOLLEYBALL";
			break;

		//these are authentic pants which do not get mockups
		case 'BM-1000':
		case 'BM-5002':
		case 'BM-5004':
		case 'BM-5005':
		case 'BM-5007':
		case 'BM-5012':
		case 'BM-5093W':
		case 'BM-5041W':
		case 'BM-5093W':
		case 'BM-5088W':
		case 'BM-5089W':
		case 'BM-5091W':
		case 'BM-5087W':
		case 'BM-5084W':
		case 'BM-5085W':
		case 'BM-5092W':
		case 'BM-5095W':
		case 'BM-5082W':
		case 'BM-5090W':
		case 'BM-5060W':
		case 'BM-5070W':
		case 'BM-5095W':
		case 'BM-5039W':
		case 'BM-5041W':
		case 'BM-5050W':
			sport = "no mockup";
			break;

		default:
			sport = undefined;
	}

	if(sport == "no mockup")
	{
		log.l("No mockup needed for " +  garmentCode);
		msgList.push("No mockup needed for " + garmentCode + ". This garment has been skipped.");
		result = false;
	}
	else if(!sport)
	{	
		log.e("****NOT A FATAL ERROR****::Please add " + garmentCode + " to getSport switch statement.");
		log.l("sport was not automatically determined. prompting user for the correct sport.");
		msgList.push("Looks like I was unable to automatically determine the sport folder for " + garmentCode + ".");
		msgList.push("You've earned one, deep, heartfelt apology from me, redeemable at a time of your choosing. (non-transferable, void where prohibited)");

		var msg = "Please select the correct sport corresponding to: " + garmentCode;
		

		sport = usrPrompt(lib.sports,msg,garmentCode);
		if(!sport)
		{
			log.e("User cancelled the dialog.::" + garmentCode + " will be skipped.");
			result = false;
		}

		
		
	}
	if(sport)
	{
		garObj.sport = sport;
	}

	log.l("End of getSport function. Returning " + result);
	return result;
}