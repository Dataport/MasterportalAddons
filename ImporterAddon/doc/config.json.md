#### Portalconfig.menu.tool.importerAddon

The importerAddon tool allows importing layer from different sources, i.e. WMS, WFS.

The basic tool configurations apply. Following additional properties can be set in config.json:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|wfsExampleBase|no|String|"https://ows-demo.terrestris.de/geoserver/osm/wfs"|The base Url for the example Url for a WFS GetCapabilities request.|false|
|wfsExampleQuery|no|String|"?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetCapabilities"|The query part for the example Url for a WFS GetCapabilities request.|false|
|wmsExampleBase|no|String|"https://ows.terrestris.de/osm/service"|The base Url for the example Url for a WMS GetCapabilities request.|false|
|wmsExampleQuery|no|String|"?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities"|The query part for the example Url for a WMS GetCapabilities request.|false|
|styleFillColor|no|Array|[104, 170, 204, 1]|The RGBA color to use as default fill color|false|
|styleStrokeColor|no|Array|[153, 153, 153, 1]|The RGBA color to use as default stroke color|false|
|styleStrokeWidth|no|Array|5|The width in pixels to use as default stroke width|false|
|styleCircleRadius|no|Array|10|The radius in pixels to use as default circle radius|false|
|supportedImportWorkflows|no|Array|["wfs", "wms", "geojson", "shapezip", "geopackage"]|The supported workflows/formats that will be provided as import options.|false|
|fileUploadIcon|no|String|bi bi-cloud-arrow-up-fill|Icon library string for the file upload icon|false|
|removeFileIcon|no|String|bi bi-x-circle-fill|Icon library string for the remove file icon|false|
