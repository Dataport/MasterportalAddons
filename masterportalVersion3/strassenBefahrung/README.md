# Addon StrassenBefahrung (WIP)

Weiterentwicklung des Addons "StrassenBefahrung" aus
dem [Freiburger Masterportal](https://bitbucket.org/dominikfroehlich/masterportal/src/dev/).
Die hier vorliegende Version würde für den Betrieb mit einem Masterportal Version 3.x.x angepasst.
Aufgrund fehlender Zugangsdaten zur Infra3d-API wurde das Addon nicht abschließend getestet.

## Installation

1. Das Tool innerhalb des Addons-Ordners des Masterportals kopieren.
2. Innerhalb des Addon-Ordners `npm i` ausführen, um die Abhängigkeiten zu installieren.
3. Anschließend wird das Tool in der addonsConf.json konfiguriert.

### Beispiel für addonsConf.json:

```
"strassenBefahrung": {
    "type": "tool"
},
```

4. In der config.js des Portals muss als nächstes der in der addonsConf.json verwendete Key ("gfiPie") eingetragen
   werden.

### Beispiel in config.js:

```
addons: ["strassenBefahrung"],
```

5. Konfiguration des Addons in der config.json vornehmen.

### Beispiel für Bremen in der config.json

```
  {
    "name": "Panorama Viewer infra3D",
    "icon": "bi-camera",
    "coords": [
      487652.18,
      5881637.24
    ],
    "epsgNumber": 25832,
    "renderToWindow": false,
    "deactivateGFI": true,
    "resizableWindow": true,
    "user": "",
    "password": "",
    "markerStyleId": "strassenBefahrung_marker",
    "ennStyleId": "strassenBefahrung_EdgeNodeNetwork",
    "loadEdgeNodeNetwork": true,
    "type": "strassenBefahrung"
  },
```

