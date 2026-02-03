#### Portalconfig.menu.tools.children

Liste aller konfigurierbaren Werkzeuge. Jedes Werkzeug erbt von **[tool](#markdown-header-portalconfigmenutool)** und kann/muss somit auch die dort angegebenen attribute konfiguriert bekommen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|bulkDownload|nein|**[bulkDownload](#markdown-header-portalconfigmenutoolbulkDownload)**||Werkzeug um Daten über eine zu zeichnende Geometrie abfragen zu können.|true|

***

#### Portalconfig.menu.tool.bulkDownload

[inherits]: # (Portalconfig.menu.tool)

Bulk Download Tool zur Daten-Abfrage von Gebieten anhand verschiedener Geometrien.

Um Layer als Download Layer zu dem Bulkdownload Addon hinzuzufügen, muss für den jeweiligen Layer bei der Layer Konfiguration in der `services-internet.json` oder alternativ in der `config.json` der Wert `bulkDownload: true` hinzugefügt werden.

**ACHTUNG: Backend notwendig!**

**Es wird über ein Backend abgefragt, ob in der gezeichneten Geometrie Daten zum Download bereitstehen. Wenn dies der Fall ist wird anhand einer ID ein Download dieser Daten bereitgestellt.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|backendUrl|ja|String||URL für Backend Request. |false|
|confirmationUrl|ja|String||URL für den Download|false|

**Beispiel Bulk Download**
```json
    {
      "type": "bulkDownload",
      "backendUrl": "some-backend-url.de",
      "confirmationUrl": "some-confirmation-url-for-downloading-data"
    },
```

##### Backend Requests und Responses

Im folgenden werden die Backend Requests und Responses beschrieben, für die das Addon entwickelt wurde.

###### Requests

|Parameter|Typ|Beschreibung|
|----|-------------|-------------|
|coords|Array[]|Koordinaten der gezeichneten Geometrie, die die Fläche umschließt, von der Daten abgefragt werden sollen.|
|dataset| String| Name des Datasets, von dem Daten angefragt werden.|
|option| Number (0, 1, 2)| Über die Nummer ordnet das Backend zu, welche Daten angefragt werden. 0 steht für Punktwolken und Bilddaten, 1 für ausschließlich Punktwolken, 2 für ausschließlich Bilddaten. |

** Beispiel Request**
```
data: {
  coords: [
    [
        796.2987097707316,
        342589.9341972079
    ],
    [
        1038.6696766804087,
        342443.7094687754
    ],
    [
        764.4331963429676,
        342310.1435978273
    ],
    [
        796.2987097707316,
        342589.9341972079
    ]
],
  dataset: "KAPPAZUNDER 2020",
  option: 2
}
```

###### Responses

|Parameter|Typ|Beschreibung|
|----|-------------|-------------|
|status|Number|Http Status Code|
|items| Object| Objekt, das Informationen über die angefragten Daten enthält. |
|items.size| Number| Größe des Datenpackets. |
|items.confirmation | String | String, der an die confirmation URL angehängt wird, um einen Download Link zu den angefragten Daten zu erhalten. |
|error| Object | Wenn der Request fehlgeschlagen ist, wird in der Response ein Error-Objekt mitgeschickt. |
|error.message| String | Fehlermeldung, die den Grund für das Fehlschlagen beschreibt. | 
|time|Number|Zeit die bis zur Response vergangen ist.|

*** Beispiel Response für einen erfolgreichen Request ***
```
{
  "status": 200,
  "items": {
    "size": 209,
    "confirmation": "a184b5b8-ba06-493c-8772-aa8e303a68f5"
  }
}
```

*** Beispiel Response für einen fehlgeschlagenen Request ***
```
{
  "status": 413,
    "error": {
        "message": "Die Auswahl ist mit 318 GB zu groß.\n                                                        Bitte wählen Sie einen kleineren Bereich mit maximal 80 GB"
    },
    "time": 4390
}
``` 

##### Harcoded Parts in the code

To make the addon work in your own environment, some parts of the code that are still hardcoded must be replaced with the appropriate information. This concerns some data in the BulkDownload.vue (`selectedDataset`, `mapProjection`, `downloadLayerProjection`) and layer names for point clouds and image data in `initializeLayerForDownload` in the actionsBulkDownload.js.
