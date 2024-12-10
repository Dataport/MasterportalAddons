#### Portalconfig.menu.tools.children

List of all configurable tools. Each tool inherits from **[tool](#markdown-header-portalconfigmenutool)** and can/must therefore also have the attributes specified there configured.

|Name|Required|Typ|Default|Description|Expert|
|----|-------------|---|-------|------------|------|
|bulkDownload|no|**[bulkDownload](#markdown-header-portalconfigmenutoolbulkDownload)**||Tool to request data by selecting a specific area by drawing a geometry.|true|

***

#### Portalconfig.menu.tool.bulkDownload

[inherits]: # (Portalconfig.menu.tool)

Bulk download tool for requesting data from areas using various geometries.

To add layers as download layers to the bulkdownload addon, the value `bulkDownload: true` must be added for the respective layer in the layer configuration in `services-internet.json` or alternatively in `config.json`.

**Attention: Backend required!**

**A backend is used to request whether data is available for download in the drawn area. If this is the case, a download of this data is provided based on an ID.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|backendUrl|yes|String||URL for Backend Request. |false|
|confirmationUrl|yes|String||URL for the Download|false|

**Beispiel Bulk Download**
```json
    {
      "type": "bulkDownload",
      "backendUrl": "some-backend-url.de",
      "confirmationUrl": "some-confirmation-url-for-downloading-data"
    },
```

#### Backend Requests and Responses

The backend requests and responses for which the addon was developed are described below.

##### Requests

|Parameter|Type|Beschreibung|
|----|-------------|-------------|
|coords|Array[]|Coordinates of the .|
|dataset| String| Name of the Dataset to request the data from.|
|option| Number (0, 1, 2)| The backend uses the number to assign which data is requested. 0 stands for point clouds and image data, 1 for point clouds only, 2 for image data only. |

** Example Request**
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

##### Responses

|Parameter|Type|Description|
|----|-------------|-------------|
|status|Number|Http Status Code|
|items| Object| Object that contains information about the requested data |
|items.size| Number| Size des data packet. |
|items.confirmation | String | String that is appended to the confirmation URL to obtain a download link to the requested data. |
|error| Object | If the request has failed, an error object is sent in the response. |
|error.message| String | Error message that describes the reason for the failure. | 
|time|Number|ime that has passed until the response.|

*** Example Response for a successful Request ***
```
{
  "status": 200,
  "items": {
    "size": 209,
    "confirmation": "a184b5b8-ba06-493c-8772-aa8e303a68f5"
  }
}
```

*** Example Response for a failed Request ***
```
{
  "status": 413,
    "error": {
        "message": "Die Auswahl ist mit 318 GB zu groß.\n                                                        Bitte wählen Sie einen kleineren Bereich mit maximal 80 GB"
    },
    "time": 4390
}
``` 
##### Hartkodierte Teile im Code

Um das Addon in Ihrer eigenen Umgebung nutzen zu können müssen einige Stellen im Code, die zurzeit noch hartkodiert sind, angepasst werden. Dies betrifft einige `data` Elemente in BulkDownload.vue (`selectedDataset`, `mapProjection`, `downloadLayerProjection`) und die Layernamen für Punktwolken sowie Bilddaten in der action `initializeLayerForDownload` in der actionsBulkDownload.js.
