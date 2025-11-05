# MarineForecastTheme

Ein benutzerdefiniertes GFI (GetFeatureInfo) Theme für die Anzeige von Meeresvorhersagedaten im Masterportal.

## Überblick

Das MarineForecastTheme ist eine Vue.js-Komponente, die speziell für die Darstellung von Meeresvorhersagedaten entwickelt wurde. Es verarbeitet HTML-Inhalte von WFS-Services und Feature-Eigenschaften und zeigt sie in einem benutzerfreundlichen, gestalteten Format an.

## Funktionen

- **Automatische Inhaltserkennung**: Erkennt automatisch ob HTML-Inhalte oder Feature-Eigenschaften angezeigt werden sollen
- **Intelligente Darstellung**: Verwendet entweder ein iframe oder direkte HTML-Einbindung je nach Inhaltstyp
- **Meeresvorhersage-spezifische Gestaltung**: Spezielle Formatierung für Windvorhersagen, Wassertemperatur, Wasserstände, etc.
- **Responsive Design**: Passt sich automatisch an verschiedene Bildschirmgrößen an
- **Menü-Integration**: Stellt automatisch die Breite des sekundären Menüs ein

## Verwendung

Das Theme wird automatisch verwendet, wenn es in der Masterportal-Konfiguration für einen Layer spezifiziert ist:

```json
{
  "gfiTheme": "marineForecast"
}
```

### Theme-Parameter

- `forceIframe` (Boolean): Erzwingt die Verwendung eines iframes auch für WFS/JSON-Inhalte

## Unterstützte Datentypen

### HTML-Inhalte (text/html)
- Direkte Anzeige von HTML-Inhalten aus WFS GetFeatureInfo-Antworten
- Vollständige Isolierung in einem iframe mit benutzerdefinierten Styles

### Feature-Eigenschaften (WFS/JSON)
Das Theme erkennt und formatiert spezielle Meeresvorhersage-Eigenschaften:

- **windvorhersage**: DWD Windvorhersagen
- **temp_vs**: Wasseroberflächentemperaturvorhersage  
- **ws_vorhersage**: Wasserstandsvorhersage
- **mondereignisse**: Mondphasen und -ereignisse
- **sonnenereignisse**: Sonnenauf- und -untergänge

### Automatische Formatierung

Die Komponente erstellt automatisch:
- Stationsüberschriften mit Namen und Position
- Sektionsüberschriften für verschiedene Vorhersagetypen
- Formatierte Tabellen mit abwechselnden Zeilenfarben
- Responsive Gestaltung für mobile Geräte

## Styling

### Iframe-Styling
```css
body { 
  color: #000; 
  background: #e9e9e9; 
  text-align: center; 
  margin: 0; 
  padding: 10px; 
}

table.featureInfo tbody td:first-child {
  color: #e1e1e1; 
  background: #4070a0; 
  font-weight: bold;
}
```

### Inline-HTML-Styling
- Automatische Spaltenbreite (`width: max-content`)
- Scrollbare Bereiche bei Überlauf
- Maximale Höhe von 80% der Viewport-Höhe

## Technische Details

### Vue.js Eigenschaften

- **Props**: `feature` (Object, required) - Das Feature-Objekt mit den anzuzeigenden Daten
- **Computed Properties**: 
  - `mimeType`: Erkennt den MIME-Type des Inhalts
  - `htmlContent`: Verarbeitet und formatiert die HTML-Inhalte
  - `renderInIframe`: Entscheidet über die Darstellungsmethode

### Lifecycle Hooks

- **mounted**: Setzt die Menübreite und injiziert HTML-Inhalte
- **unmounted**: Stellt die ursprüngliche Menübreite wieder her
- **watch**: Überwacht Änderungen am Feature-Objekt

### Methoden

- `injectHtmlContent()`: Hauptfunktion zum Einsetzen von HTML-Inhalten in das iframe

## Beispiel-Ausgabe

```html
<h3>Eckernförde</h3>
<span>(54°28'00''N   09°50'42''E)</span>

<h4>DWD Windvorhersagen (Stand: 05.09. 06:52 Uhr)</h4>
<table class="featureInfo">
  <tbody>
    <tr>
      <td>Tag</td>
      <td>Fr 05.09.</td>
      <td>Fr 05.09.</td>
      <!-- ... weitere Spalten ... -->
    </tr>
    <!-- ... weitere Zeilen ... -->
  </tbody>
</table>
```