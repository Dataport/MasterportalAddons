#### Portalconfig.menu.tool.wfstUploader

Addon that enables user to upload features on configured wfst layer by selecting features from vector layers. Intended use case is to upload features from imported geopackages or shapefile, so the importer addon is integrated in this addon and must be configured as well. 
The importer addon can be found here https://github.com/terrestris/masterportal-addons/tree/main. The importer addon configuration should include geojson, shapezip and/or geopackage as supported import formats. WMS and WFS will be not useful in this context.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|description|no|string|additional:modules.tools.wfstUploader.description|Will be displayed as description for the addon|false|
|icon|no|string|bi-upload|CSS class of the Bootstrap Icon. Will be displayed in front of the tool name.|false|
|name|no|string|additional:modules.tools.wfstUploader.title|Will be displayed as name for the addon|false|
|type|yes|string||ID of the addon|false|
|wfstLayers|yes||List of wfst layers that can be chosen for a feature upload|false|

**Example:**

```json
{
  "type": "wfstUploader",
  "name": "Neues Objekt hochladen",
	"description": "Speichern von hochgeladenen Geometrien als Objekte",
  "wfstLayers": ["ensemble_elemente", "fundplatz_elemente", "polygon_wfst"],
  "wfstAttributesForInput": ["kategorie", "uuid"]
}

```

**URL Parameters**

Some parameters can be preset for this addon via the URL.

|Name|Description|Example|
|-|-|-|
|UPLOADLAYERID|The id of the layer that should be preset as upload layer in the input formular. The upload layer must be visible in the portal. |`&UPLOADLAYERID=layer_id`|
|UUIDPROPERTY|The identifier attribute name for the feature that will be uploaded. If not set, "uuid" will be assumed as property name.|`&UUIDPROPERTY=UUID`|
|UUID|The value that will be set as preset for the uuid property in the input field.|`&UUIDVALUE=123-abc-456`|