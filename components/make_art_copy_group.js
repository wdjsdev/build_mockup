
//art is an array of art items
function makeArtCopyGroup(parent,art)
{
	var newGroup = parent.groupItems.add();
	for(var x=art.length-1;x>=0;x--)
	{
		art[x].duplicate(newGroup)
	}
	return newGroup;
}