## portalConfig.secondaryMenu.sections.wfsSumQuery

Module for recording attributes of selected features from a selected WFS layer. If the attributes are numbers, they are added together. The result is displayed as a table, which can also be downloaded as a CSV file.

The module includes

* the selection of features of a selected layer via polygon, rectangle or circle
* the selection of attributes to be displayed
* displaying the selected attributes in table form
* downloading the table as a CSV file


***


### WFS-SumQuery - Configuration

The addon must be configured in config.json as described below. The layers whose ids are listed in `layerIdsForSelection` must have been configured accordingly for the masterportal beforehand. Also, they must be configured with a styleId. Without this, the highlighting of the selected feature will not work.

|Name|Mandatory|Type|Default|Description|Expert|
|----|-------------|---|-------|------------|------|
|type|yes|String|"wfsSumQuery"|The type used to identify the module.|false|
|name|yes|String|"WFS-SumQuery"|The title of the module or the entry in the menu.|false|
|layerIdsForSelection|yes|Array|[]|The layer ids of the layers which should be available for the tool. Can be specified as an object to indicate the server of the service. The default for the server is “deegree”. Esri is not supported yet. |false|
|highlightVectorRulesPointLine|no|Object|{fill: {color: "rgba(255,0,0)"},stroke: {color: "rgb(177,18,37)", width: 5}}|The highlight coloring for points and linestrings.|false|
|highlightVectorRulesPolygon|no|Object|{fill: {color: "rgba(255,0,0)"},stroke: {color: "rgb(177,18,37)", width: 5}}|The highlight coloring for polygons.|false|


**Example**
```json
{
    "name": "WFS-SumQuery",
    "type": "wfsSumQuery",
    "layerIdsForSelection": ["129", "122333", "123333", {"id": "333333", "type": "qgis"}],
    "highlightVectorRulesPointLine": {
        "fill": {
            "color": [255, 0, 255, 0.9]
        },
       "stroke": {
            "width": 8,
            "color": [255, 0, 255, 0.9]
        }
    },
    "highlightVectorRulesPolygon": {
        "fill": {
            "color": [255, 0, 255, 0.9]
        },
        "stroke": {
            "width": 8,
            "color": [255, 0, 255, 0.9]
        }
    },
}
```

***
