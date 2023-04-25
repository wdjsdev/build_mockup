function updateInfoFrames ( label, newContents )
{
    var doc = app.activeDocument;
    var layers = afc( doc, "layers" );

    layers.forEach( function ( layer )
    {
        var infoLay = findSpecificLayer( layer, label );
        if ( !infoLay )
        {
            return;
        }
        var infoFrames = afc( infoLay, "textFrames" ).filter( function ( frame )
        {
            return frame.name.match( new RegExp( label, "i" ) );
        } );
        infoFrames.forEach( function ( frame )
        {
            frame.contents = newContents;
        } )
    } )
}