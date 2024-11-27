###### portalConfig.menu.searchBar.searchInterfaces.wiengaz
Konfiguration des Adresservice der Stadt Wien als Addon.

**ACHTUNG: Backend benötigt!**
**Eine gespeicherte Abfrage eines WFS mit vordefinierten Parametern wird abgefragt.**

Das in Wiengaz genutzte Backend benötigt für eine Hausnummernsuche eine in Straßennamen nicht verwendete Nummer, weswegen bei konfiguriertem `expandToHouseNumberSearch: true` eine ' 0' an die URL angehängt wird.


|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|serviceId|ja|String||Id des Suchdienstes. Wird aufgelöst in der **[rest-services.json](rest-services.json.de.md)**.|false|
|type|ja|String||Typ der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|false|
|icon|nein|String|"bi-signpost-2"|Gibt das icon für den Suchdienst an|false|
|displayNameSourceProperty|nein|String|"name"|Eigenschaft des Suchergebnis, das als Ergebnis ausgegeben werden soll|false|
|tooltipSourceProperty|nein|String|displayNameSourceProperty|Eigenschaft des Suchergebnis, die als Tooltip angezeigt werden soll|false|
|categorySourceProperty|nein|String|""|Eigenschaft des Suchergebnis, das als Kategorie benutzt werden soll|false|
|pathToCrsSourceProperty|nein|String|""|Pfad zur Angabe des Koordinatenreferenzsystems im Response des Suchdienstes|false|
|epsg|nein|String|"EPSG:3857"|Das Koordinatenreferenzsystem des Suchdienstes|false|
|expandToHouseNumberSearch|nein|String|false|Definiert ob Hausnummernsuche durchgeführt werden soll wenn nur ein Straßenname angegeben wird|false|


**Beispiel**

```json
{
    "serviceId": "91",
    "type": "wiengaz",
    "zoomLevel": 15,
    "icon": "bi-signpost-2",
    "displayNameSourceProperty": "Adresse",
    "tooltipSourceProperty": "Adresse",
    "categorySourceProperty": "Kategorie",
    "pathToCrsSourceProperty": "@crs.properties.name",
    "expandToHouseNumberSearch": "true"
}
```
