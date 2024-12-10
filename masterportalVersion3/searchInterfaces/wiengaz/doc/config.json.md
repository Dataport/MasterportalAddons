###### portalConfig.menu.searchBar.searchInterfaces.gfiOnAddressGaz
Configuration of the address search .

**ATTENTION: Backend required!**
**A stored query of a WFS with predefined parameters is queried.**

The backend used in Wiengaz requires a number not used in street names for a house number search, which is why a ' 0' is appended to the URL if `expandToHouseNumberSearch: true` is configured.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|serviceId|yes|String||ID of the search service. Resolved in the **[rest-services.json](rest-services.json.en.md)**.|false|
|type|yes|String||Type of search interface. Defines which search interface is configured.|
|icon|no|String|"bi-signpost-2"|Defines the icon for the searchbar|false|
|displayNameSourceProperty|no|String|"name"|Property of search result that is to be shown as result|false|
|tooltipSourceProperty|no|String|displayNameSourceProperty|Property of search result that is to be shown as tooltip|false|
|categorySourceProperty|no|String|""|Property of search result that is to be used as category|false|
|pathToCrsSourceProperty|no|String|""|Path to CRS in the response of the search service|false|
|epsg|no|String|"EPSG:3857"|The EPSG of the search service|false|
|expandToHouseNumberSearch|no|String|false|Defines if a house number search is performed when only a street name is given|false|

**Example**

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
