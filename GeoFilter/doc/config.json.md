#### Portalconfig.menu.tool.geoFilter

The geofilter allows to filter a WFS Layer (target layer) with another layer, WFS or imported, that contains polygon features (filter layer). As a result all features that lie within or intersect the polygons on the filter layer will be returned on a new layer. To use Imported layers the importerAddon has to be configured as well (link to repo).



|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|no|string|additional:modules.tools.geoFilter.title|Will be displayed as name for the addon|false|
|description|no|string|additional:modules.tools.geoFilter.description|Will be displayed as description for the addon|false|
|targetLayerIds|no|Array|[]|List of layer ids of layers that can be used as target layers.|false|
|filterLayerTypes|no|Array|["GeoJSON", "WFS"]|List of layer types that can be used as filter layers.|false|




```json
{
  "type": "geoFilter",
  "name": "additional:modules.tools.geoFilter.title",
  "description": "Spatial Filtering happening here",
  "targetLayerIds": ["ensemble_elemente", "fundplatz_elemente"],
  "filterLayerTypes": ["GeoJSON"]
},
```