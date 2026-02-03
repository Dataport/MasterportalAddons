# Wiengfi

## Dokumentation für die Einbindung als gfiTheme.

1. Das Tool in den Addons-Ordner des Masterportals kopieren.
2. Anschließend wird das Tool in der addonsConf.json konfiguriert.

### Beispiel für addonsConf.json:

```
  "wiengfi": {
    "path":"gfiThemes/wiengfi",
    "type": "gfiTheme"
  },
```

3. In der config.js des Portals muss als nächstes der in der addonsConf.json verwendete Schlüssel ("wiengfi")
   eingetragen
   werden.

### Beispiel in config.js:

```
   addons:["wiengfi"],
```

4. Das Addon wird in der config.json den Layern zugewiesen, für die es verwendet werden soll:

### Beispiel in config.json:

```
        {
          "id": "12345",
          "name": "Layername",
          "gfiTheme": "wiengfi"
        },
```

**So zugewiesen wird die Standardkonfigurationen aus der `defaults.json` des Addons gelesen.**

Alternativ kann hier auch für jeden Layer einzeln ein Objekt mit folgenden Parametern übergeben werden:

| Parameter            | Optional | Type   | Beschreibung                                                                                                                                                                                                                                                            |
|----------------------|----------|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| name                 | nein     | String | Der Name des Addons.                                                                                                                                                                                                                                                    |
| paginationKey        | ja       | String | Attributschlüssel, dessen Wert für die Pagination verwendet wird. Alle Werte dieses Schlüssels müssen eine einzigartige ID beinhalten. Der konfigurierte Schlüssel muss ebenfalls in den Lokalisierungen hinterlegt werden (siehe **[übersetzungen](#übersetzungen)**). |
| matchAttributes      | ja       | Array  | Array mit Attributschlüsseln, deren Werte mit den Werten anderer ausgewählter Layer verglichen werden, um die Gruppierung vorzunehmen.                                                                                                                                  |
| tableAttributes      | ja       | Array  | Array mit Attributschlüsseln, die als Tabelle angezeigt werden. Für die Benennung der Zeilen müssen die konfigurierten Attributschlüssel ebenfalls in den Lokalisierungen hinterlegt werden (siehe **[übersetzungen](#übersetzungen)**).                                |
| dropDownAttributeKey | ja       | String | Attributschlüssel, der steuert welches Attribut als Dropdown angezeigt werden.                                                                                                                                                                                          |
| valueConverters      | ja       | Object | Objekt zum Umwandeln von Attributwerten mit der Struktur `{key: converterFunctionName}`. Der `key` muss ein Attributschlüssel sein und `converterFunctionName` muss als Funktion in der Datei `converters.js` exportiert werden.                                        |
| download             | ja       | Object | Objekt zur Konfiguration des Download-Buttons. Siehe **[gfiTheme.download](#gfithemedownload)**                                                                                                                                                                         |
| attributions         | ja       | Object | Objekt zur Konfiguration der Attributions. Siehe **[gfiTheme.attributions](#gfithemeattributions)**                                                                                                                                                                     |
| captions             | ja       | Array  | Array von Attributschlüsseln, die als Captions angezeigt werden.                                                                                                                                                                                                        |

**Nicht konfigurierte Parameter werden aus der `defaults.json` des Addons gelesen.**

### Beispiel einer umfangreichen Konfiguration in der config.json:

```
        {
          "id": "12345",
          "name": "layer_name",
          "gfiTheme": {
            "name": "wiengfi",
            "paginationKey": "attr0_with_uid",
            "tableAttributes": ["attr1", "attr2", "attr3", "attr4"],
            "matchAttributes": ["attr2", "attr5", "attr6"],
            "valueConverters": {
              "attr4": "convertBytesToKB"
            },
            "download": {
              "buttonTextAttribute": "attr7",
              "literal": "https://www.mydomain.de/mypath{attr8}{attr9}",
              "search": "\/search_regex\/",
              "replace": "/replace_string/"
            },
            "attributions": {
              "translationKey": "additional:modules.tools.gfi.themes.wiengfi.newTranslationKey",
              "replacements": [
                "attr9",
                "attr10"
              ]
            },
            "captions": ["attr12", "attr13"],
            "dropDownAttributeKey": "attr3"
          }
        },
```

### gfiTheme.download

| Parameter           | Optional | Type   | Beschreibung                                                                                                                                                                                                               |
|---------------------|----------|--------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buttonTextAttribute | nein     | String | Ein Attributschlüssel dessen Wert als Text im Button dargestellt wird.                                                                                                                                                     |
| literal             | nein     | String | Ein String-Literal, welches Ersetzungen durch Attributswerte erlaubt. Die Attributschlüssel müssen hierbei von doppelten geschweiften Klammer umschlossen sein. Beispiel: `"https://www.mydomain.de/mypath{attr8}{attr9}"` |
| search              | Ja       | String | Ein String der in ein RegEx umgewandelt wird, um mit Hilfe von `replace` gefundene Stellen im Link umzuschreiben.                                                                                                          |
| replace             | Ja       | String | Ein String der an den gefundenen Stellen von `search` eingesetzt wird.                                                                                                                                                     |

### gfiTheme.attributions

| Parameter      | Optional | Type   | Beschreibung                                                                                                                                                                                                                                                                                                                                                                      |
|----------------|----------|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| translationKey | nein     | String | Ein Schlüssel der in den Übersetzungsdateien gesucht wird um den Attributions-Text anzuzeigen. Der in den Übersetzungen hinterlegt Text kann HTML-Tags und Ersetzungen enthalten, die durch doppelte geschweifte Klammern gekennzeichnet sind. In diesm Fall müssen die Ersetzungen allerdings in `replacements` konfiguriert werden (siehe **[übersetzungen](#übersetzungen)**). |
| replacements   | Ja       | Array  | Ein Array an Attributschlüsseln, die für die Interpolations des Übersetzungstext verwendet werden (siehe **[übersetzungen](#übersetzungen)**).                                                                                                                                                                                                                                    |

### Übersetzungen

Die Übersetzungsdateien sind in den Unterordnern innerhalb des Ordners `locales` zu finden.

Ein Beispiel für die oben angegebene Beispielkonfiguration sieht wie folgt aus:

```
{
    "modules": {
        "tools": {
            "gfi": {
                "themes":{
                    "wiengfi": {
                        "attr1": "Label für Attribut 1",
                        "attr2": "Label für Attribut 2",
                        "attr3": "Label für Attribut 3",
                        "attr4": "Label für Attribut 4",
                        "attr7": "Label für Attribut 7",
                        "attr0_with_uuid": "Label für pagination",
                        "newTranslationKey": "Weiterführende Informationen zu {{attr9}} finden Sie <a href=\"https://{{attr10}}\" target=\"_blank\">hier</a>"
                    }
                }
            }
        }
    }
}
```

Wichtig ist, dass sich hier alle Attributschlüssel wiederfinden, die
in `tableAttributes`, `download.buttonTextAttribute` und `paginationKey` konfiguriert sind.
Außerdem bedarf in diesem Beispiel der Schlüssel `productAttributions` spezielle Beachtung:
Dieser wurde in **[gfiTheme.attributions](#gfithemeattributions)** unter dem `translationKey` hinterlegt und enthält die
genannten HTML-Tags und Ersetzungen.
