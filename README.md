# Masterportal Addons

## Beschreibung der Addons

| Addon | Beschreibung | Kompatibilität |
|-------|--------------|----------------|
| gfiPie | Tortendiagramm zur Darstellung von Feature Attributen | 2.49.X, 3.X         |
| vas | Wiener Suchdienst zum Einbinden ins Masterportal | 2.X            |
| wiengaz | Addressuchdienst der Stadt Wien | 3.X            |
| bulkDownload| Layerabhängige Datendownloadanfrage an Backend | 3.X            |
| wfs-SumQuery | Attibutsanzeige und Summierung von grafisch selektierten Features | 3.X            |

## Dokumentation für die Einbindung der zusätzlichen Addons

### 1. Gewünschte Tools in den Addons-Ordner des Masterportals kopieren.
### 2. addonsConf.json erweitern

Für jedes manuell hinzugefügte Addon wird in der addonsConf.json ein Eintrag erstellt.
Nicht benötigte Addons können hier gelöscht werden.

#### Beispiel für addonsConf.json in v2:
```
"vas": "model.js",
"gfiPie": {
    "path": "gfiThemes/gfiPie",
    "type": "gfiTheme"
}
```
#### Beispiel für addonsConf.json in v3:
```
"wiengaz": {
  "type": "searchInterface",
  "path": "searchInterfaces/wiengaz"
},
"bulkDownload": {
  "type": "tool"
}
"wfsSumQuery": {
  "type": "tool"
},
"gfiPie": {
    "path":"gfiThemes/gfiPie",
    "type": "gfiTheme"
},
```

### 3. config.js des Portals anpassen

In der config.js des Portals muss als nächstes der in der addonsConf.json verwendete Key (z.B. "gfiPie") eingetragen werden.

#### Beispiel in config.js:
```
addons: ["gfiPie", "vas", "obliqueViewer", "trinkwasser"],
```

### 4. Alle nicht benötigten Addons aus dem Addons-Ordner löschen.

### 5. config.json des Portals anpassen

Für einige Addons werden Konfigurationsparameter benötigt, damit diese funktionieren. Diese können der Dokumentation in den Addons entnommen werden.

#### Beispiel in config.json:
```
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

### 6. In den Addons-Ordner navigieren und "npm i" ausführen.

### 7. Bauen der Portale mit dem Befehl "npm run build" innerhalb des Masterportal-Ordners.

### 8. Im Ordner "dist" befinden sich nun die gebauten Portale.
