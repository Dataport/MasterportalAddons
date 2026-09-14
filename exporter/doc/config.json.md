#### Portalconfig.menu.tool.exporter

The exporter tool allows exporting vector layers from different sources, i.e. WFS.

The basic tool configurations apply. Following additional properties can be set in config.json:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|downloadProjection|no|String|"mapProjection"|Optional projection mode used only for "shp" and "gpkg" download output. Supported values: "mapProjection" and EPSG codes such as "EPSG:4326" or "EPSG:25832". If omitted or invalid, the current map projection is used.|false|
|icon|no|string|bi-download|CSS class of the Bootstrap Icon. Will be displayed in front of the tool name.|false|
|name|no|string|additional:modules.tools.exporter.title|Will be displayed as name for the addon|false|
|supportedExportFormats|no|String[]|["geojson", "gml", "shp", "gpkg"]|List of supported export formats. Only formats that appear in this list will be provided as option. Currently supported formats: "geojson", "gml", "shp", "gpkg".|false|
|type|yes|string||ID of the addon|false|

**Example:**

```json
{
  "type": "exporter",
  "name": "additional:modules.tools.exporter.title",
  "icon": "bi-download",
  "downloadProjection": "mapProjection",
  "supportedExportFormats": [
    "geojson",
    "gml",
    "shp",
    "gpkg"
  ]
}
```
