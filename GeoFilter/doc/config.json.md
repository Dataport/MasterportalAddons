#### Portalconfig.menu.tool.geoFilter

The geofilter allows to filter a WFS Layer (target layer) with another layer, WFS or imported, that contains polygon features (filter layer). As a result all features that lie within or intersect the polygons on the filter layer will be returned on a new layer. The name of the new layer can be configured under `highlightedFeatures.layerName` (**[highlightedFeatures](#portalconfigtreehighlightedfeatures)**).
This addon uses the importer and exporter addon which must be configured as well to use the geoFilter addon. They can be found here https://github.com/terrestris/masterportal-addons/tree/main. The importer addon configuration should include geojson, shapezip and/or geopackage as supported import formats. WMS and WFS will be not useful in this context.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|description|no|string|additional:modules.tools.geoFilter.description|Will be displayed as description for the addon|false|
|filterLayerTypes|no|Array|["GeoJSON", "WFS"]|List of layer types that can be used as filter layers.|false|
|icon|no|string|bi-filter|CSS class of the Bootstrap Icon. Will be displayed in front of the tool name.|false|
|name|no|string|additional:modules.tools.geoFilter.title|Will be displayed as name for the addon|false|
|targetLayerIds|no|Array|[]|List of layer ids of layers that can be used as target layers.|false|
|type|yes|string||ID of the addon|false|

**Example:**

```json
{
  "type": "geoFilter",
  "name": "additional:modules.tools.geoFilter.title",
  "description": "Spatial Filtering happening here",
  "targetLayerIds": ["ensemble_elemente", "fundplatz_elemente"],
  "filterLayerTypes": ["GeoJSON"]
}
```