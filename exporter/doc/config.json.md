#### Portalconfig.menu.tool.exporter

The exporter tool allows exporting vector layers from different sources, i.e. WFS.

The basic tool configurations apply. Following additional properties can be set in config.json:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|downloadProjection|no|String|"mapProjection"|Optional projection mode used only for "shp" and "gpkg" download output. Supported values: "mapProjection" and EPSG codes such as "EPSG:4326" or "EPSG:25832". If omitted or invalid, the current map projection is used.|false|
|icon|no|string|bi-download|CSS class of the Bootstrap Icon. Will be displayed in front of the tool name.|false|
|name|no|string|additional:modules.tools.exporter.title|Will be displayed as name for the addon|false|
|projectionWkts|no|Object|{}|Optional WKT definitions by projection code for shapefile .prj metadata. Values may be strings or string arrays. Single quotes are converted to double quotes. Required for correct shapefile projection metadata when exporting projections other than EPSG:4326. If no WKT is configured for the selected non-EPSG:4326 projection, the shapefile export falls back to EPSG:4326 (with a warning in the console) to avoid mismatched .prj metadata. This fallback only affects the "shp" format; "gpkg" uses the spatial reference system from `Config.namedProjections`.|false|
|supportedExportFormats|no|String[]|["geojson", "gml", "shp", "gpkg"]|List of supported export formats. Only formats that appear in this list will be provided as option. Currently supported formats: "geojson", "gml", "shp", "gpkg".|false|
|type|yes|string||ID of the addon|false|

**Example:**

```json
{
  "type": "exporter",
  "name": "additional:modules.tools.exporter.title",
  "icon": "bi-download",
  "downloadProjection": "mapProjection",
  "projectionWkts": {
    "EPSG:25832": [
      "PROJCS['ETRS89 / UTM zone 32N'",
      "GEOGCS['ETRS89'",
      "DATUM['European_Terrestrial_Reference_System_1989'",
      "SPHEROID['GRS 1980',6378137,298.257222101]]",
      "PRIMEM['Greenwich',0]",
      "UNIT['degree',0.0174532925199433]]",
      "PROJECTION['Transverse_Mercator']",
      "PARAMETER['latitude_of_origin',0]",
      "PARAMETER['central_meridian',9]",
      "PARAMETER['scale_factor',0.9996]",
      "PARAMETER['false_easting',500000]",
      "PARAMETER['false_northing',0]",
      "UNIT['metre',1]",
      "AUTHORITY['EPSG','25832']]"
    ]
  },
  "supportedExportFormats": [
    "geojson",
    "gml",
    "shp",
    "gpkg"
  ]
}
```
