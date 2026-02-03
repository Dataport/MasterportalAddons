# marineForecast gfiTheme

## Beschreibung

Das `marineForecast` gfiTheme ist eine spezialisierte Komponente zur Darstellung von marinen Vorhersagedaten und Pegelstationsinformationen. Es wurde entwickelt, um HTML-Tabellen aus WMS- und WFS-Diensten in einem einheitlichen Format anzuzeigen.

### Hauptfunktionen

- **Automatische HTML-Tabellen-Erkennung**: Erkennt Properties, die HTML-Tabellen mit `class="featureInfo"` enthalten
- **Konfigurierbare Property-Mappings**: Ermöglicht die Anpassung von Titeln und Zeitstempel-Verknüpfungen für verschiedene Datenquellen
- **Rückwärtskompatibilität**: Funktioniert auch ohne Konfiguration mit Standard-Mappings
- **Flexibles Rendering**: Unterstützt sowohl Iframe- als auch Inline-HTML-Darstellung

## Konfiguration in services-internet.json

### Grundlegende Konfiguration

Die einfachste Konfiguration verwendet nur den Theme-Namen. In diesem Fall werden die Standard-Property-Mappings verwendet:

```json
{
  "id": "6000",
  "name": "Pegelstationen Nordsee",
  "url": "https://www.geoseaportal.de/geoserver/Meeresinformation/wms",
  "typ": "WMS",
  "layers": "Stationen_Nordsee",
  "gfiAttributes": "showAll",
  "gfiTheme": {
    "name": "marineForecast"
  },
  "infoFormat": "text/html"
}
```

### Erweiterte Konfiguration mit benutzerdefinierten Parameters

Für maximale Flexibilität können Sie alle Aspekte der Darstellung konfigurieren:

```json
{
  "id": "6001",
  "name": "Pegelstationen Ostsee WFS",
  "url": "https://gdi.bsh.de/mapservice_gs/Meeresinformation/wfs",
  "typ": "WFS",
  "featureType": "Stationen_Ostsee",
  "gfiAttributes": "showAll",
  "gfiTheme": {
    "name": "marineForecast",
    "params": {
      "stationNameProperty": "stationbf",
      "textVersionProperty": "text_link",
      "fontFamily": "Calibri, Arial, sans-serif",
      "fontSize": "14px",
      "tableFontSize": "12px",
      "headerFontSize": "1.5em",
      "subHeaderFontSize": "1.2em",
      "backgroundColor": "#ffffff",
      "tableRowEvenColor": "#f9f9f9",
      "tableHeaderColor": "#4070a0",
      "tableHeaderTextColor": "#ffffff",
      "tableBorderSpacing": "2px",
      "propertyMappings": {
        "windvorhersage": {
          "title": "DWD Windvorhersagen",
          "timestampProperty": "stand_wind"
        },
        "temp_vs": {
          "title": "Wasseroberflächentemperaturvorhersage",
          "timestampProperty": "wtemp_stand"
        },
        "ws_vorhersage": {
          "title": "Wasserstandsvorhersage",
          "timestampProperty": "stand"
        },
        "mondereignisse": {
          "title": "Mondereignisse"
        },
        "sonnenereignisse": {
          "title": "Sonnenereignisse"
        }
      }
    }
  },
  "infoFormat": "text/html"
}
```

## Konfigurations-Parameter

### `stationNameProperty` (optional)

- **Typ**: String
- **Standard**: `"stationbf"`
- **Beschreibung**: Der Name des Properties, das den Stationsnamen enthält. Falls nicht vorhanden, wird auf `"name"` zurückgegriffen.

**Beispiel:**
```json
"stationNameProperty": "station_name"
```

### `textVersionProperty` (optional)

- **Typ**: String
- **Standard**: `"text_link"`
- **Beschreibung**: Der Name des Properties, das einen Link zur Textversion der Vorhersage enthält. Falls dieses Property nicht vorhanden ist, wird der Link automatisch aus dem `stationNameProperty` generiert mit dem Muster: `https://marineforecast.bsh.de/Meeresinformationen/bf/{stationbf}.html`. Der Link wird als "Link zur Textversion" unterhalb des Stationskopfes angezeigt.

**Beispiel:**
```json
"textVersionProperty": "text_url"
```

### `propertyMappings` (optional)

- **Typ**: Object
- **Standard**: Vordefinierte Mappings für deutsche Marinestation-Properties
- **Beschreibung**: Ein Objekt, das die Zuordnung von Property-Namen zu Anzeigeinformationen definiert.

Jedes Property-Mapping kann folgende Attribute enthalten:

#### `title` (erforderlich)

- **Typ**: String
- **Beschreibung**: Der anzuzeigende Titel für diese Datenkategorie.

#### `timestampProperty` (optional)

- **Typ**: String
- **Beschreibung**: Der Name eines anderen Properties, das einen Zeitstempel enthält, der zusammen mit dem Titel angezeigt werden soll.

**Beispiel für ein vollständiges Property-Mapping:**
```json
"propertyMappings": {
  "wind_forecast": {
    "title": "Wind Forecast",
    "timestampProperty": "forecast_time"
  },
  "wave_height": {
    "title": "Wave Height Prediction"
  }
}
```

### Styling-Parameter (optional)

Die folgenden Parameter ermöglichen die vollständige Anpassung des visuellen Erscheinungsbilds:

#### `fontFamily` (optional)

- **Typ**: String
- **Standard**: `"Arial, sans-serif"`
- **Beschreibung**: Schriftart für alle Textelemente. Mehrere Schriftarten können als Fallback angegeben werden.

**Beispiel:**
```json
"fontFamily": "Calibri, Arial, sans-serif"
```

#### `fontSize` (optional)

- **Typ**: String
- **Standard**: `"14px"`
- **Beschreibung**: Basis-Schriftgröße für normalen Text und Paragraphen.

**Beispiel:**
```json
"fontSize": "16px"
```

#### `tableFontSize` (optional)

- **Typ**: String
- **Standard**: Gleicher Wert wie `fontSize` (falls nicht angegeben)
- **Beschreibung**: Schriftgröße speziell für Tabelleninhalte. Ermöglicht es, die Tabellenschriftgröße unabhängig von anderen Textelementen zu steuern.

**Beispiel:**
```json
"tableFontSize": "12px"
```

#### `headerFontSize` (optional)

- **Typ**: String
- **Standard**: `"1.35em"`
- **Beschreibung**: Schriftgröße für die Stationsnamen-Überschrift (H3).

**Beispiel:**
```json
"headerFontSize": "1.5em"
```

#### `subHeaderFontSize` (optional)

- **Typ**: String
- **Standard**: `"1.1em"`
- **Beschreibung**: Schriftgröße für Abschnittsüberschriften (H4).

**Beispiel:**
```json
"subHeaderFontSize": "1.2em"
```

#### `backgroundColor` (optional)

- **Typ**: String (Hex-Farbcode)
- **Standard**: `"#ffffff"`
- **Beschreibung**: Haupthintergrundfarbe für den Inhalt und ungerade Tabellenzeilen.

**Beispiel:**
```json
"backgroundColor": "#f5f5f5"
```

#### `tableRowOddColor` (optional)

- **Typ**: String (Hex-Farbcode)
- **Standard**: `"#e9e9e9"`
- **Beschreibung**: Hintergrundfarbe für ungerade Tabellenzeilen. Falls nicht angegeben, wird der gleiche Wert wie `backgroundColor` verwendet.

**Beispiel:**
```json
"tableRowOddColor": "#f0f0f0"
```

#### `tableRowEvenColor` (optional)

- **Typ**: String (Hex-Farbcode)
- **Standard**: `"#e9e9e9"`
- **Beschreibung**: Hintergrundfarbe für gerade Tabellenzeilen (für bessere Lesbarkeit durch alternierende Farben).

**Beispiel:**
```json
"tableRowEvenColor": "#e8e8e8"
```

#### `tableHeaderColor` (optional)

- **Typ**: String (Hex-Farbcode)
- **Standard**: `"#4070a0"`
- **Beschreibung**: Hintergrundfarbe für Tabellenköpfe (erste Spalte).

**Beispiel:**
```json
"tableHeaderColor": "#0066cc"
```

#### `tableHeaderTextColor` (optional)

- **Typ**: String (Hex-Farbcode)
- **Standard**: `"#e1e1e1"`
- **Beschreibung**: Textfarbe für Tabellenköpfe.

**Beispiel:**
```json
"tableHeaderTextColor": "#ffffff"
```

#### `tableBorderSpacing` (optional)

- **Typ**: String
- **Standard**: `"0"`
- **Beschreibung**: Abstand zwischen Tabellenzeilen. "0" für keine Lücken, oder z.B. "2px" für kleine Abstände.

**Beispiel:**
```json
"tableBorderSpacing": "2px"
```

## Standard Property-Mappings

Wenn keine `propertyMappings` konfiguriert sind, werden folgende Standardwerte verwendet:

| Property-Name | Titel | Zeitstempel-Property |
|---------------|-------|----------------------|
| `windvorhersage` | DWD Windvorhersagen | `stand_wind` |
| `temp_vs` | Wasseroberflächentemperaturvorhersage | `wtemp_stand` |
| `ws_vorhersage` | Wasserstandsvorhersage | `stand` |
| `mondereignisse` | Mondereignisse | - |
| `sonnenereignisse` | Sonnenereignisse | - |

## Anwendungsbeispiele

### Einfache Verwendung (Standard-Konfiguration)

Für die Verwendung mit Standard-Property-Namen ohne weitere Anpassungen:

```json
"gfiTheme": {
  "name": "marineForecast"
}
```

Diese Minimalkonfiguration nutzt die Standard-Property-Mappings und das Standard-Styling.

### Anpassung von Daten-Properties

Falls Ihre Datenquelle andere Property-Namen verwendet oder Sie eigene Titel vergeben möchten:

```json
"gfiTheme": {
  "name": "marineForecast",
  "params": {
    "stationNameProperty": "station_name",
    "textVersionProperty": "text_url",
    "propertyMappings": {
      "wind_data": {
        "title": "Windvorhersage",
        "timestampProperty": "last_update"
      },
      "tide_data": {
        "title": "Gezeiteninformationen"
      }
    }
  }
}
```

**Hinweis:** Nicht konfigurierte Properties mit HTML-Tabellen werden automatisch mit dem Property-Namen (Unterstriche werden durch Leerzeichen ersetzt) angezeigt.

### Anpassung des Erscheinungsbilds

Für die vollständige Kontrolle über Schriftarten, Farben und Abstände:

```json
"gfiTheme": {
  "name": "marineForecast",
  "params": {
    "fontFamily": "Calibri, Arial, sans-serif",
    "fontSize": "15px",
    "tableFontSize": "13px",
    "headerFontSize": "1.6em",
    "subHeaderFontSize": "1.2em",
    "backgroundColor": "#ffffff",
    "tableRowEvenColor": "#f0f8ff",
    "tableHeaderColor": "#003366",
    "tableHeaderTextColor": "#ffffff",
    "tableBorderSpacing": "1px"
  }
}
```

Alle Styling-Parameter sind optional und können individuell kombiniert werden.

## Hinweise

- **HTML-Tabellen-Erkennung**: Das Theme erkennt nur Properties, die HTML-Code mit `<table` und `class="featureInfo"` enthalten
- **Automatisches Fallback**: Wenn ein Property HTML-Tabellen enthält, aber nicht in `propertyMappings` definiert ist, wird es trotzdem angezeigt
- **Flexibilität**: Sie können das Theme für beliebige WFS-/WMS-Dienste verwenden, solange diese HTML-Tabellen mit der entsprechenden Klasse zurückgeben
- **Stationsnamen-Formatierung**: Unterstriche in Stationsnamen werden automatisch durch Leerzeichen ersetzt
- **Koordinaten-Darstellung**: Die Position wird aus dem `position`-Property gelesen und in Klammern neben dem Stationsnamen angezeigt, z.B. "Kiel Holtenau (54°22'20\"N)"
- **Textausrichtung**: Alle Hauptinhalte (Überschriften, Text, Tabellen) sind linksbündig. Nur Erklärungstexte innerhalb von Tabellen (z.B. Mondphasen-Beschreibungen) sind zentriert
- **Styling**: Das Theme verwendet standardmäßig ein sauberes weißes Design mit alternierenden Tabellenzeilen für bessere Lesbarkeit. Alle Farben, Schriftarten und Abstände sind vollständig konfigurierbar
- **Link zur Textversion**: Falls das konfigurierte `textVersionProperty` keinen Wert enthält, wird der Link automatisch aus dem Stationsnamen mit dem Muster `https://marineforecast.bsh.de/Meeresinformationen/bf/{stationbf}.html` generiert

## Technische Details

### Unterstützte Dienst-Typen

- WMS mit `infoFormat: "text/html"`
- WFS mit HTML-Properties

### Rendering-Modi

1. **Iframe-Modus**: Für `text/html` MIME-Type und HTML-Tabellen in Properties
2. **Inline-Modus**: Für einfache Property-Anzeige ohne HTML-Tabellen

### Darstellung

- **Stationskopf**: Wird aus konfigurierbaren Properties zusammengesetzt
- **Abschnittstitel**: Werden aus `propertyMappings` oder automatisch generiert
- **Zeitstempel**: Werden automatisch an Titel angehängt, wenn konfiguriert
- **Tabellen-Styling**: Einheitliches Design mit alternierender Zeilenfärbung
