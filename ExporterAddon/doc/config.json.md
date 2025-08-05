#### Portalconfig.menu.tool.exporterAddon

The exporterAddon tool allows exporting layer from different sources, i.e. WMS, WFS.

The basic tool configurations apply. Following additional properties can be set in config.json:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|supportedExportFormats|no|String[]|["geojson", "gml", "shp", "gpkg"]|List of supported export formats. Only formats that appear in this list will be provided as option. Currently supported formats: "geojson", "gml", "shp", "gpkg".|false|
