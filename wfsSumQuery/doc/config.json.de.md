## portalConfig.secondaryMenu.sections.wfsSumQuery

Modul zur Erfassung von Attributen selektierter Features aus einem ausgewählten WFS Layer. Wenn es sich bei den Attributen um Zahlen handelt, werden diese summiert. Das Ergebnis wird als Tabelle dargestellt, welche auch als CSV Datei heruntergeladen werden kann.

Das Modul umfasst

* die Selektion von Features eines ausgewählten Layers über Polygon, Rechteck oder Kreis
* die Auswahl von Attributen, die dargestellt werden sollen
* die Darstellung der ausgewählten Attribute in Tabellenform
* das Herunterladen der Tabelle als CSV Datei


***


### WFS-SumQuery - Konfiguration

Das Addon muss in der config.json wie im Folgenden beschrieben konfiguriert werden. Dabei müssen die layer, deren ids in `layerIdsForSelection` aufgeführt werden, zuvor entsprechend für das Masterportal konfiguriert worden sein. Die Konfiguration muss außerdem eine styleId spezifiziern. Ohne diese wird das Highlighting der ausgewählten Feature nicht funktionieren.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|type|ja|String|"wfsSumQuery"|Der Typ zur Identifizierung des Modules.|false|
|name|ja|String|"WFS-SumQuery"|Der Titel des Moduls bzw. der Eintrag im Menü.|false|
|layerIdsForSelection|ja|Array|[]|Die ids der Layer, die für das Tool zur Verfügung stehen sollen. Können als Objekt angegeben werden, um den Server des Dienstes mit anzugeben. Default für den Server ist "deegree". Esri wird derzeit nicht unterstützt. |false|
|highlightVectorRulesPointLine|nein|Objekt|{fill: {color: "rgba(255,0,0)"},stroke: {color: "rgb(177,18,37)", width: 5}}|Die Farbgebung für das Hervorheben von Punkten und Linien.|false|
|highlightVectorRulesPolygon|nein|Objekt|{fill: {color: "rgba(255,0,0)"},stroke: {color: "rgb(177,18,37)", width: 5}}|Die Farbgebung für das Hervorheben von Polygonen.|false|


**Beispiel**
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
