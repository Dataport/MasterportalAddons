#### Portalconfig.menu.tool.importerAddon

The importer tool allows importing layer from different sources, i.e. WMS, WFS.

The basic tool configurations apply. Following additional properties can be set in config.json:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|styleFillColor|no|Array|[104, 170, 204, 1]|The RGBA color to use as default fill color|false|
|styleStrokeColor|no|Array|[153, 153, 153, 1]|The RGBA color to use as default stroke color|false|
|styleStrokeWidth|no|Array|5|The width in pixels to use as default stroke width|false|
|styleCircleRadius|no|Array|10|The radius in pixels to use as default circle radius|false|
|supportedImportWorkflows|no|Array|["wfs", "wms", "geojson", "shapezip", "geopackage"]|The supported workflows/formats that will be provided as import options.|false|
|fileUploadIcon|no|String|bi bi-cloud-arrow-up-fill|Icon library string for the file upload icon|false|
|removeFileIcon|no|String|bi bi-x-circle-fill|Icon library string for the remove file icon|false|


**Example:**

```json
{
  "type": "importer",
  "name": "additional:modules.tools.importerAddon.title",
  "icon": "bi-upload",
  "fileUploadIcon": "bi-cloud-arrow-up",
  "removeFileIcon": "bi bi-x-circle-fill",
  "supportedImportWorkflows": 
  [
    "wms",
    "wfs",
    "geojson",
    "shapezip",
    "geopackage"
  ],
  "styleFillColor": [255, 192, 203, 1],
  "styleStrokeColor": [199, 21, 133, 1]
}
```