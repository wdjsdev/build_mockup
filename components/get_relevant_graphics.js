function getRelevantGraphics ( curGarment )
{
    var relevantGraphics = [];
    var placementGuides = curGarment.adultPlacementGuides || curGarment.youthPlacementGuides || undefined;
    var pgArr = afc( placementGuides, "pageItems" ).map( function ( i ) { return i.name } );

    var topRegex = /^t/i;
    var botRegex = /^b/i;



    afo( curGarment.graphics ).forEach( function ( curGraphic )
    {
        var result = false;

        var relevantLocations = curGraphic.locations.filter( function ( loc )
        {
            return curGarment.top ? topRegex.test( loc ) : botRegex.test( loc );
        } );

        if ( relevantLocations.length > 0 )
        {
            relevantGraphics.push( curGraphic );
        }


        // curGraphic.locations.forEach( function ( loc )
        // {
        //     if(result)return;

        //     var locRegex = new RegExp( loc, "i" );
        //     if ( ( curGarment.top && loc.match( botRegex ) ) || ( curGarment.bot && loc.match( topRegex ) ) )
        //     {
        //         return;
        //     }
        //     if ( pgArr.length )
        //     {
        //         pgArr.forEach( function ( pg )
        //         {
        //             if ( pg.match( locRegex ) )
        //             {
        //                 result = true;
        //             }
        //         } );
        //     }
        //     else
        //     {
        //         result = true;
        //     }

        // } )
        // if ( result )
        // {
        //     relevantGraphics.push( curGraphic );
        // }
    } )
    return relevantGraphics;
}