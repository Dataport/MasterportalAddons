#### Portalconfig.menu.tool.exporter

The exporter tool allows exporting vector layers from different sources, i.e. WFS.

The basic tool configurations apply. Following additional properties can be set in config.json:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|supportedExportFormats|no|String[]|["geojson", "gml", "shp", "gpkg"]|List of supported export formats. Only formats that appear in this list will be provided as option. Currently supported formats: "geojson", "gml", "shp", "gpkg".|false|
