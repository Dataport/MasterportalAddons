# Masterportal Addons

## Beschreibung der Addons

| Addon | Beschreibung | Kompatibilität |
|-------|--------------|----------------|
| gfiPie | Tortendiagramm zur Darstellung von Feature Attributen | 2.X |
| vas | ... | 2.X |

## Dokumentation für die Einbindung der zusätzlichen Addons

### 1. Gewünschte Tools in den Addons-Ordner des Masterportals kopieren.
### 2. addonsConf.json erweitern

Für jedes manuell hinzugefügte Addon wird in der addonsConf.json ein Eintrag erstellt.
Nicht benötigte Addons können hier gelöscht werden.

#### Beispiel für addonsConf.json:
```
"vas": "model.js",
"gfiPie": {
    "path": "gfiThemes/gfiPie",
    "type": "gfiTheme"
}
```
### 3. config.js des Portals anpassen

In der config.js des Portals muss als nächstes der in der addonsConf.json verwendete Key (z.B. "gfiPie") eingetragen werden.

#### Beispiel in config.js:
```
addons: ["gfiPie", "vas", "obliqueViewer", "trinkwasser"],
```

### 4. Alle nicht benötigten Addons aus dem Addons-Ordner löschen.

### 5. In den Addons-Ordner navigieren und "npm i" ausführen.

### 6. Bauen der Portale mit dem Befehl "npm run build" innerhalb des Masterportal-Ordners.

### 7. Im Ordner "dist" befinden sich nun die gebauten Portale.
