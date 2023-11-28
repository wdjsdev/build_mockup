function updateInfoFrames ( label, newContents )
{
    if ( !label || !newContents ) return;
    var doc = app.activeDocument;
    var layers = afc( doc, "layers" );

    var matchedFrames = [];

    layers.forEach( function ( layer )
    {
        var infoLay = findSpecificLayer( layer, "Information" );
        if ( !infoLay )
        {
            return;
        }
        infoLay.locked = false;
        var infoFrames = afc( infoLay, "textFrames" );

        infoFrames.forEach( function ( frame )
        {
            if ( frame.name.match( /fabric type/i ) )
            {
                frame.remove();
                return;
            }
            if ( frame.name.match( new RegExp( label, "i" ) ) && !frame.name.match( /order/i ) )
            {
                matchedFrames.push( frame );
            }
        } );
        infoLay.locked = true;
    } )
    matchedFrames.forEach( function ( frame )
    {
        frame.contents = newContents.toUpperCase();
    } )
}