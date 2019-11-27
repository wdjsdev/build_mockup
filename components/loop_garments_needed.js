/*
	Component Name: loop_garments_needed
	Author: William Dowling
	Creation Date: 11 November, 2019
	Description: 
		loop the garmentsNeeded array and open each garment
		and its necessary graphics, recolor the artwork
		and then compile the art into a mockup file.
	Arguments
		none
	Return value
		success boolean

*/

function loopGarmentsNeeded()
{
	log.h("Beginning of loopGarmentsNeeded()");
	for(var g=0,len=garmentsNeeded.length;g<len;g++)
	{
		garmentsNeeded[g].processGarment();
		curGarmentIndex++;
	}
}