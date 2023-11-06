### Portalconfig.searchBar

Erweiterung der Konfiguration der Searchbar.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|vas|nein|**[vas](#markdown-header-portalconfigsearchbarvas)**||Konfiguration des Vienna Address Service (VAS) Suchdienstes.|false|


#### Portalconfig.searchbar.vas ####

Konfiguration des **[Vienna Address Services](https://www.data.gv.at/katalog/dataset/c223b93a-2634-4f06-ac73-8709b9e16888)** für die Suche nach Adressen der Stadt Wien.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Number|3|Mindestanzahl an Zeichen im Suchstring, bevor die Suche initiiert wird.|false|
|serviceId|ja|String||Gibt die ID für die URL in der **[rest-services.json](rest-services.json.md)** vor.|false|
|useProxy|ja|Boolean||Legt fest, ob für die Suchanfrage ein Proxy verwendet werden soll|false|

**Beispiel**

```
#!json

"vas": {
    "minChars": 3,
    "serviceId": "1373",
    "useProxy": false
}
```

***