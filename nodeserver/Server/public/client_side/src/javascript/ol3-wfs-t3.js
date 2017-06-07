

controlMousePos = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(4),
});
  var insertts = function(btn_name,btn_hit_time,map_display_time,before_removing_vector_layer_time,after_removing_vector_layer_time,
                        before_adding_vector_layer_time,after_adding_vector_layer_time){
    client = new wps.client({
        servers: {
            local: 'http://localhost:8080/geoserver/wps'
        }
    });
    var futurests = client.getProcess('local', 'py:futurests');
    futurests.configure({
        inputs: {
            btn_name:btn_name,
            btn_hit_time: btn_hit_time,
            before_removing_vector_layer_time:before_removing_vector_layer_time,
            after_removing_vector_layer_time:after_removing_vector_layer_time,
            before_adding_vector_layer_time:before_adding_vector_layer_time,
            after_adding_vector_layer_time:after_adding_vector_layer_time,
            map_display_time: map_display_time
        }
    });


    futurests.execute({
        inputs: {
            btn_name:btn_name,
            btn_hit_time: btn_hit_time,
            before_removing_vector_layer_time:before_removing_vector_layer_time,
            after_removing_vector_layer_time:after_removing_vector_layer_time,
            before_adding_vector_layer_time:before_adding_vector_layer_time,
            after_adding_vector_layer_time:after_adding_vector_layer_time,
            map_display_time: map_display_time
        },
        success: function (outputs) {
            // outputs.result is a feature or an array of features for spatial processes.
            console.log("Executed");
        }
    });

}

var selectedfeature ="a";

var probablity= function(probab,tid){
    tid= selectedfeature;
    console.log(tid);

// create a new WPS client
    client = new wps.client({
        servers: {
            local: 'http://localhost:8080/geoserver/wps'
        }
    });
    var futuresnew = client.getProcess('local', 'py:futuresnew');
    futuresnew.configure({
        inputs: {
            probab: probab,
            tid:tid
        }
    });


    futuresnew.execute({
        inputs: {
            probab: probab,
            tid:tid
        },
        success: function (outputs) {
            // outputs.result is a feature or an array of features for spatial processes.
            console.log(outputs);
            console.log("Sucessfully Done");

        }
    });
}

var inserttsinit = function(btn_hit_time,map_display_time){
    client = new wps.client({
        servers: {
            local: 'http://localhost:-8080/geoserver/wps'
        }
    });
    var futurests = client.getProcess('local', 'py:futurestsinit');
    futurests.configure({
        inputs: {
            btn_hit_time: btn_hit_time,
            map_display_time: map_display_time
        }
    });

    futurests.execute({
        inputs: {
            btn_hit_time: btn_hit_time,
            map_display_time:map_display_time
        },
        success: function (outputs) {
            // outputs.result is a feature or an array of features for spatial processes.
            console.log("Executed");
        }
    });

}

var dateGetter= function(){
    var now = new Date();
    var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    utc = utc.toString();
    utc =utc.substring(0,24);
    utc = utc + ":" + now.getMilliseconds().toString();
    return utc;
}

popup = document.getElementById('popup');
$('#popup-closer').on('click', function () {
    var probab = $('input[id="popup-value"]').val();
    console.log(probab);

    probablity(String(probab),String(1));

    overlayPopup.setPosition(undefined);

});

overlayPopup = new ol.Overlay({
    element: popup
});

//hover highlight
selectPointerMove = new ol.interaction.Select({
    condition: ol.events.condition.pointerMove
});

var format = 'image/jpeg';

var layerGSMap = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        ratio: 1,
        url: 'http://localhost:8080/geoserver/asheville/wms',
        params: {
            'FORMAT': format,
            'VERSION': '1.1.1',
            LAYERS: 'asheville:cnty37i',
            STYLES: '',
        }
    })
});

var layerGSMap2 = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        ratio: 1,
        url: 'http://localhost:8080/geoserver/asheville/wms',
        params: {
            'FORMAT': format,
            'VERSION': '1.1.1',
            LAYERS: 'asheville:cnty37f',
            STYLES: '',
        }
    })
});

var format1 = new ol.format.WFS({
    featureNS: 'asheville',
    featureType: 'futures_poly',
    srsName: 'EPSG:3857'
});

// Source retrieving WFS data in shapefile format using AJAX
// Source retrieving WFS data in GML format using AJAX
var vectorSource = new ol.source.Vector({
    format: format1,
    loader: function (extent, resolution, projection) {
        var url = 'http://localhost:8080/geoserver/asheville/ows?' +
            'service=WFS&request=GetFeature&' +
            'version=1.1.0&typename=asheville:futures_poly&' +
            'srsname=EPSG:3857&' +
            'bbox=' + extent.join(',');

        $.ajax({
            url: url
        })
            .done(function (response) {
                featuresa = format1.readFeatures(response,
                    {featureProjection: 'EPSG:3857'});
                vectorSource.addFeatures(featuresa);
            });
    },
    strategy: ol.loadingstrategy.tile(new ol.tilegrid.XYZ({
        maxZoom: 19
    })),
    // strategy: ol.loadingstrategy.bbox,
    projection: 'EPSG:3857'
});

// Vector layer
var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'green',
            width: 2
        })
    })
});

// Map
var map = new ol.Map({
    target: 'map',
    overlays: [overlayPopup],
    controls: [controlMousePos],
    renderer: 'canvas',
    layers: [layerGSMap, vectorLayer],
    view: new ol.View({
        center: [839740, 1203095],//ol.proj.transform([-75.923853, 45.428736], 'EPSG:4326', 'EPSG:3857'),
        // minZoom: 9,
        maxZoom: 19,
        zoom: 10.7
    })
});

map.addInteraction(selectPointerMove);

//function getCenterOfExtent(extent){
//	x = extent[0] + (extent[2] - extent[0]) / 2;
//	y = extent[1] + (extent[3] - extent[1]) / 2;
//	return [x, y];
//	}

var interaction;
var select = new ol.interaction.Select({
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#FF2828'
        })
    })
});

//wfs-t
var dirty = {};
// var formatWFS = new ol.format.WFS();
var formatGML = new ol.format.GML({
    featureNS: 'asheville',
    featureType: 'futures_poly',
    srsName: 'EPSG:3857'
});

var transactWFS = function (p, f) {
    switch (p) {
        case 'insert':
            node = format1.writeTransaction([f], null, null, formatGML);
            break;
        case 'update':
            node = format1.writeTransaction(null, [f], null, formatGML);
            break;
        case 'delete':
            node = format1.writeTransaction(null, null, [f], formatGML);
            break;
    }
    s = new XMLSerializer();
    str = s.serializeToString(node);
    console.log(str);
    var aaa = $.ajax('http://localhost:8080/geoserver/asheville/ows', {
        type: 'POST',
        dataType: 'xml',
        processData: false,
        contentType: 'text/xml',
        data: str
    }).done();
    console.log(aaa);
}

$('.btn-floating').hover(
    function () {
        $(this).addClass('darken-2');
    },
    function () {
        $(this).removeClass('darken-2');
    }
);

$('.btnMenu').on('click', function (event) {
    $('.btnMenu').removeClass('orange');
    $(this).addClass('orange');
    map.removeInteraction(interaction);
    select.getFeatures().clear();
    map.removeInteraction(select);
    switch ($(this).attr('id')) {

        case 'btnSelect':
            interaction = new ol.interaction.Select({
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({color: '#f50057', width: 2})
                })
            });
            map.addInteraction(interaction);
            interaction.getFeatures().on('add', function (e) {
                props = e.element.getProperties();
                if (e.element.id_){
                    selectedfeature =e.element.id_.substring(13);
                    //console.log(selectedfeature);
                }
                console.log(props);
                if (props.id) {
                    $('#popup-status').html(props.id);
                } else {
                    $('#popup-status').html('n/a');
                }
                if (props.geometry) {
                    $('#popup-tiendas').html('0');
                } else {
                    $('#popup-tiendas').html('n/a');
                }
                coord = $('.ol-mouse-position').html().split(',');
                overlayPopup.setPosition(coord);
            });
            break;

        case 'btnEdit':
            map.addInteraction(select);
            interaction = new ol.interaction.Modify({
                features: select.getFeatures()
            });
            map.addInteraction(interaction);

            snap = new ol.interaction.Snap({
                source: vectorLayer.getSource()
            });
            map.addInteraction(snap);

            dirty = {};
            select.getFeatures().on('add', function (e) {
                e.element.on('change', function (e) {
                    dirty[e.target.getId()] = true;
                });
            });
            select.getFeatures().on('remove', function (e) {
                f = e.element;
                if (dirty[f.getId()]) {
                    delete dirty[f.getId()];
                    featureProperties = f.getProperties();
                    delete featureProperties.boundedBy;
                    var clone = new ol.Feature(featureProperties);
                    clone.setId(f.getId());
                    transactWFS('update', clone);
                }
            });
            break;

        case 'btnDrawPoint':
            interaction = new ol.interaction.Draw({
                type: 'Point',
                source: vectorLayer.getSource()
            });
            map.addInteraction(interaction);
            interaction.on('drawend', function (e) {
                transactWFS('insert', e.feature);
            });
            break;

        case 'btnDrawLine':
            interaction = new ol.interaction.Draw({
                type: 'LineString',
                source: vectorLayer.getSource()
            });
            map.addInteraction(interaction);
            interaction.on('drawend', function (e) {
                transactWFS('insert', e.feature);
            });
            break;

        case 'btnDrawPoly':
            interaction = new ol.interaction.Draw({
                type: 'Polygon',
                source: vectorLayer.getSource()
            });
            map.addInteraction(interaction);
            interaction.on('drawend', function (e) {
                transactWFS('insert', e.feature);
            });
            break;

        case 'btnDelete':
            interaction = new ol.interaction.Select();
            map.addInteraction(interaction);
            interaction.getFeatures().on('change:length', function (e) {
                transactWFS('delete', e.target.item(0));
                interaction.getFeatures().clear();
                selectPointerMove.getFeatures().clear();
            });
            break;

        default:
            break;
    }
});

$('#btnZoomIn').on('click', function () {
    var view = map.getView();
    var newResolution = view.constrainResolution(view.getResolution(), 1);
    view.setResolution(newResolution);
});

$('#btnZoomOut').on('click', function () {
    var view = map.getView();
    var newResolution = view.constrainResolution(view.getResolution(), -1);
    view.setResolution(newResolution);
});

$('#btnPlay').on('click', function () {
    console.log("btn" +
        "Play")


    //button hit time
    var btn_hit_time_str = dateGetter();


    format = new ol.format.WKT();
    lineFeature = format.readFeature(
        'LINESTRING(117 22,112 18,118 13, 115 8)');
    lineFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

    format = new ol.format.WKT();
    polygonFeatures = format.readFeature(
        'POLYGON((110 20,120 20,120 10,110 10,110 20),(112 17,118 18,118 16,112 15,112 17))');
    polygonFeatures.getGeometry().transform('EPSG:4326', 'EPSG:3857');

// create a new WPS client
    client = new wps.client({
        servers: {
            local: 'http://localhost:8080/geoserver/wps'
        }
    });

    var futures4 = client.getProcess('local', 'py:futures4');
    futures4.configure({
        inputs: {
            lineFeature: lineFeature,
            polygonFeatures: polygonFeatures
        }
    });


    futures4.execute({
        inputs: {
            lineFeature: lineFeature,
            polygonFeatures: polygonFeatures
        },
        success: function (outputs) {
            // outputs.result is a feature or an array of features for spatial processes.
            console.log(outputs.result);
            map.removeLayer(layerGSMap);
            map.removeLayer(layerGSMap2);

            var before_removing_vector_layer_time = dateGetter();

            map.removeLayer(vectorLayer);

            var after_removing_vector_layer_time = dateGetter();

            // layerGSMap2.getSource().changed();
            var params = layerGSMap2.getSource().getParams();
            params.t = new Date().getMilliseconds();
            layerGSMap2.getSource().updateParams(params);

            map.addLayer(layerGSMap2);
            var before_adding_vector_layer_time= dateGetter();

            map.addLayer(vectorLayer);

            var after_adding_vector_layer_time = dateGetter();

            // result shown time
            var map_display_time_str = dateGetter();
            insertts("btn_Play",btn_hit_time_str,before_removing_vector_layer_time,after_removing_vector_layer_time,
                before_adding_vector_layer_time,after_adding_vector_layer_time,map_display_time_str);
            console.log("test text");


        }
    });

});

$('#btnPlayNext').on('click', function () {
    console.log("btnPlayNext");

    //button hit time
    var btn_hit_time_str = dateGetter();


    client = new wps.client({
        servers: {
            local: 'http://localhost:8080/geoserver/wps'
        }
    });

    format = new ol.format.WKT();
    lineFeature = format.readFeature(
        'LINESTRING(117 22,112 18,118 13, 115 8)');
    lineFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

    format = new ol.format.WKT();
    polygonFeatures = format.readFeature(
        'POLYGON((110 20,120 20,120 10,110 10,110 20),(112 17,118 18,118 16,112 15,112 17))');
    polygonFeatures.getGeometry().transform('EPSG:4326', 'EPSG:3857');


    var futures3 = client.getProcess('local', 'py:futures3');
    futures3.configure({
        inputs: {
            lineFeature: lineFeature,
            polygonFeatures: polygonFeatures
        }
    });

    futures3.execute({
        inputs: {
            lineFeature: lineFeature,
            polygonFeatures: polygonFeatures
        },
        success: function (outputs) {
            // outputs.result is a feature or an array of features for spatial processes.
            console.log("btnPlayNext");
            map.removeLayer(layerGSMap);
            map.removeLayer(layerGSMap2);
            // Add new time stamp here
            var before_removing_vector_layer_time = dateGetter();

            map.removeLayer(vectorLayer);

            // Add new time stamp here
            var after_removing_vector_layer_time = dateGetter();

            // layerGSMap2.getSource().changed();
            var params = layerGSMap2.getSource().getParams();
            params.t = new Date().getMilliseconds();
            layerGSMap2.getSource().updateParams(params);

            map.addLayer(layerGSMap2);
            var before_adding_vector_layer_time= dateGetter();

            map.addLayer(vectorLayer);

            // Add new time stamp here
            var after_adding_vector_layer_time = dateGetter();

            //Map display time
            var map_display_time_str = dateGetter();
            insertts("btnPlayNext",btn_hit_time_str,before_removing_vector_layer_time,after_removing_vector_layer_time,
                before_adding_vector_layer_time,after_adding_vector_layer_time,map_display_time_str);
            console.log("test text");

        }
    });

});

$('#btnSkipPrev').on('click', function () {
    console.log("btnSkipPrev");
    //button hit time
    var btn_hit_time_str = dateGetter();

    client = new wps.client({
        servers: {
            local: 'http://localhost:8080/geoserver/wps'
        }
    });

    format = new ol.format.WKT();
    lineFeature = format.readFeature(
        'LINESTRING(117 22,112 18,118 13, 115 8)');
    lineFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

    format = new ol.format.WKT();
    polygonFeatures = format.readFeature(
        'POLYGON((110 20,120 20,120 10,110 10,110 20),(112 17,118 18,118 16,112 15,112 17))');
    polygonFeatures.getGeometry().transform('EPSG:4326', 'EPSG:3857');


    var futures5 = client.getProcess('local', 'py:futures5');
    futures5.configure({
        inputs: {
            lineFeature: lineFeature,
            polygonFeatures: polygonFeatures
        }
    });

    futures5.execute({
        inputs: {
            lineFeature: lineFeature,
            polygonFeatures: polygonFeatures
        },
        success: function (outputs) {
            // outputs.result is a feature or an array of features for spatial processes.
            console.log("btnSkipPrev");
            map.removeLayer(layerGSMap);
            map.removeLayer(layerGSMap2);
            // Add new time stamp here
            var before_removing_vector_layer_time = dateGetter();

            map.removeLayer(vectorLayer);

            // Add new time stamp here
            var after_removing_vector_layer_time = dateGetter();

            // layerGSMap2.getSource().changed();
            var params = layerGSMap2.getSource().getParams();
            params.t = new Date().getMilliseconds();
            layerGSMap2.getSource().updateParams(params);

            map.addLayer(layerGSMap2);
            var before_adding_vector_layer_time= dateGetter();

            map.addLayer(vectorLayer);

            // Add new time stamp here
            var after_adding_vector_layer_time = dateGetter();

            //Map display time
            var map_display_time_str = dateGetter();
            insertts("btnSkipPrev",btn_hit_time_str,before_removing_vector_layer_time,after_removing_vector_layer_time,
                before_adding_vector_layer_time,after_adding_vector_layer_time,map_display_time_str);
            console.log("test text");
        }
    });

});

$('#btnRewind').on('click', function () {
    console.log("btnRewind");
    //button hit time
    var btn_hit_time_str = dateGetter();

    client = new wps.client({
        servers: {
            local: 'http://localhost:8080/geoserver/wps'
        }
    });

    format = new ol.format.WKT();
    lineFeature = format.readFeature(
        'LINESTRING(117 22,112 18,118 13, 115 8)');
    lineFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

    format = new ol.format.WKT();
    polygonFeatures = format.readFeature(
        'POLYGON((110 20,120 20,120 10,110 10,110 20),(112 17,118 18,118 16,112 15,112 17))');
    polygonFeatures.getGeometry().transform('EPSG:4326', 'EPSG:3857');


    var futures6 = client.getProcess('local', 'py:futures6');
    futures6.configure({
        inputs: {
            lineFeature: lineFeature,
            polygonFeatures: polygonFeatures
        }
    });

    futures6.execute({
        inputs: {
            lineFeature: lineFeature,
            polygonFeatures: polygonFeatures
        },
        success: function (outputs) {
            // outputs.result is a feature or an array of features for spatial processes.
            console.log("btnRewind");
            map.removeLayer(layerGSMap);
            map.removeLayer(layerGSMap2);
            // Add new time stamp here
            var before_removing_vector_layer_time = dateGetter();

            map.removeLayer(vectorLayer);

            // Add new time stamp here
            var after_removing_vector_layer_time = dateGetter();

            // layerGSMap2.getSource().changed();
            var params = layerGSMap2.getSource().getParams();
            params.t = new Date().getMilliseconds();
            layerGSMap2.getSource().updateParams(params);

            map.addLayer(layerGSMap2);
            var before_adding_vector_layer_time= dateGetter();

            map.addLayer(vectorLayer);

            // Add new time stamp here
            var after_adding_vector_layer_time = dateGetter();

            //Map display time
            var map_display_time_str = dateGetter();
            insertts("btnRewind",btn_hit_time_str,before_removing_vector_layer_time,after_removing_vector_layer_time,
                before_adding_vector_layer_time,after_adding_vector_layer_time,map_display_time_str);
            console.log("test text");

        }
    });

});

var wpsinit = function () {
    //button hit time
    var btn_hit_time_str = dateGetter();
    client = new wps.client({
        servers: {
            local: 'http://localhost:8080/geoserver/wps'
        }
    });

    format = new ol.format.WKT();
    lineFeature = format.readFeature(
        'LINESTRING(117 22,112 18,118 13, 115 8)');
    lineFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

    format = new ol.format.WKT();
    polygonFeatures = format.readFeature(
        'POLYGON((110 20,120 20,120 10,110 10,110 20),(112 17,118 18,118 16,112 15,112 17))');
    polygonFeatures.getGeometry().transform('EPSG:4326', 'EPSG:3857');


    var futures2 = client.getProcess('local', 'py:futures2');
    futures2.configure({
        inputs: {
            lineFeature: lineFeature,
            polygonFeatures: polygonFeatures
        }
    });

    futures2.execute({
        inputs: {
            lineFeature: lineFeature,
            polygonFeatures: polygonFeatures
        },
        success: function (outputs) {
            // outputs.result is a feature or an array of features for spatial processes.
            //Map display time
            var map_display_time_str = dateGetter();
            inserttsinit(btn_hit_time_str,map_display_time_str);
            console.log("test text");
        }
    });
}


