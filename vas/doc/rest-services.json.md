>Zurück zur **[Dokumentation Masterportal](doc.md)**.

# rest-services.json

Das in der *config.js* erzeugte Objekt enthält den Key *restConf*, dessen Value auf einen Pfad zu einer JSON – Datei verweist. Dieser Pfad wird initial ausgewertet und die Datei unter der entsprechenden URL geladen, ausgewertet und im Hauptspeicher abgelegt. Einzelne Module lesen die Webservice-Definition aus dieser Datei aus.

In dieser Datei werden alle Service-URLs definiert und gebündelt, die nicht vom Typ WFS oder WMS sind, also nicht für die visuelle Darstellung von Informationen herangezogen werden. Hier geht es zu einem **[Beispiel](https://bitbucket.org/geowerkstatt-hamburg/masterportal-config-public/src/master/rest-services-internet.json)**.

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|id|ja|String||String als eindeutiger Identifikator dieses Eintrags in der rest-services.json.|`"1"`|
|name|ja|String||Die Bezeichung des Services.|`"CSW Summary"`|
|typ|ja|String||Der Typ des Services.|`"CSW"`|
|url|ja|String||Die URL des Webservices.|`"http://metaver.de/trefferanzeige?docuuid="`|

**Vienna Address Service**

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|id|ja|String||String als eindeutiger Identifikator dieses Eintrags in der `rest-services.json`.|`"1"`|
|typ|ja|String||Der Typ des Services.|`"GeoJSON"`|
|name|ja|String||Die Bezeichnung des Services.|`"Vienna Address Service"`|
|url|ja|String||Die URL des Webservices.|`"https://data.wien.gv.at/daten/OGDAddressService.svc/GetAddressInfo?Address="`|