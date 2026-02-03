# GFI Torte
## Dokumentation für die Einbindung als gfiTheme.

1. Das Tool innerhalb des Addons-Ordners des Masterportals in den Ordner "gfiThemes" kopieren.
2. Anschließend wird das Tool in der addonsConf.json konfiguriert.

### Beispiel für addonsConf.json:
```
"gfiPie": {
    "path": "gfiThemes/gfiPie",
    "type": "gfiTheme"
}
```
3. In der config.js des Portals muss als nächstes der in der addonsConf.json verwendete Key ("gfiPie") eingetragen werden.
### Beispiel in config.js:
```
addons: ["gfiPie"],
```

4. Den betreffenden Layer in der config.json mit dem neuen Theme versehen und konfigurieren.

### Beispiel in der config.json
#### Für einen Layer mit einem / mehreren Feature(s).
```
"gfiTheme": {
    "name": "gfiPie",
    "title": {
        "prefix": "Mein Chart",
        "attributeValue": "featureAttribute",
        "suffix": "(tm)"
    },
    "width": "50vh",
    "height": "90vh",
    "showLabels": true,
    "parsingOptions": [
        {
            "replaceString": " kg/l",
            "withString": "",
            "replaceAll": false
        }
    ],
    "labelingOptions": [
        {
            "appendString": " Kg/l"
        }
    ],
    "params": {
        "featureAttribute": {
            "label": "Field Of The Feature Label",
            "color": "rgba(46, 138, 138, 1)"
        },
        "einWeiteresFeatureAttribute": {
            "label": "Field 2."
        }
    }
}
```
## Erklärung zu den Konfigurationsmöglichkeiten

### 1. "title"
Das Feld für die Benennung des Charts eines Features. Es handelt sich um ein `Objekt` mit folgenden Feldern:
```
"title": {
    "prefix": // Ein String, welcher an den Anfang des Titels angehängt wird
    "attributeValue": // Der Attributname, aus dem der Wert genommen werden soll
    "suffix": // Ein String, welcher an das Ende des Titels angehängt wird
},
```

### 2. "params"
Das Feld "params" ist ebenfalls ein `Objekt` mit Feldern der Form:
```
"key": // der Name des entsprechenden Attributes in einer Feature-Collection
{
    "label": // der Name, der statt dem "key" angezeigt wird (Default: "key")
    "color": // die Farbe des Attributes im Pie-Chart (Default: random color)
}
```

### 3. "width, height"
Breite und Höhe des Charts als `String`. Hier funktionieren Werte wie:
```
100
"100"
"100px"
"100vh"
"100em"
"100%"
```
#### Default: ```500```

### 4. "showLabels"
`Boolescher` Wert, der die Legende anzeigt. Hierzu gehören die unter 2. konfigurierten Label der Attribute sowie die zugehörigen Farben.
#### Default: ```true```

### 5. "parsingOptions"
Eine Liste (`Array`) von Regeln, welche die Attributwerte des Features verarbeiten, bevor sie als Chart angezeigt werden.
Nachdem ein Wert eines Features bearbeitet wurde, wird dieser zu einem Float umgewandelt.
Dies ermöglicht die Darstellung eines Chart welches von numerischen Strings gespeist wird.
Hiermit kann beispielsweise ein Wert mit einer Einheit auf einen numerischen Wert reduziert werden.
```
"parsingOptions": [
    {
        "replaceString": // Ein String, welcher durch einen anderen ersetzt wird (Default: "")
        "withString": // Ein String, welcher für "replaceString" eingesetzt wird (Default: "")
        "replaceAll": // Boolean, sollen alle Vorkommen des Strings behandelt werden, oder nur das erste? (Default: false)
    },
    ...
]
```
#### Beispiel für die Wandlung von Zahlen mit Einheit in ein JavaScript-Format:
```
"parsingOptions": [
    {
        "replaceString": " kg/l",
        "withString": ""
    }
]
```
``` "2,3 kg/l" -> 2.3 ``` Jetzt kann der Chart den Wert lesen und verarbeiten.

### 6. "germanNumbers"
`Boolescher` Wert, der steuert ob Zahlen als deutsche Komata-Zahlen angezeigt werden sollen.
#### Default: ```true```
``` 2.3 oder 2,3```

### 7. "labelingOptions"
Eine Liste von Regeln, welche die Werte des *Charts* bearbeitet. Also die Werte, welche nach dem Parsing als Tooltip beim Maus-Hovern über die Felder angezeigt werden sollen.
Hier werden Werte verarbeitet, welche als JavaScript typische Floats vorliegen. Es handelt sich hier also um Zahlen wie ```200``` oder ```2.3```.
```
"labelingOptions": [
    {
        "replaceString": // Ein String, welcher durch einen anderen ersetzt wird (Default: "")
        "withString": // Ein String, welcher für "replaceString" eingesetzt wird (Default: "")
        "replaceAll": // Boolean, sollen alle Vorkommen des Strings behandelt werden, oder nur das erste? (Default: false)
        "appendString": // Ein String, welcher angeghängt wird (Default: "")
    },
    ...
]
```
#### Beispiel für das Anzeigen als deutsche Komata-Zahlen, mit angehängter Einheit:
```
"labelingOptions": [
    {
        "appendString": " Kg/l"
    }
]
```
```2.3 -> "2,3 Kg/l"``` Hier wurde wieder eine Einheit für die Lesbarkeit angehängt.

