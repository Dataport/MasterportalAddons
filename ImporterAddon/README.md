# Importer Addon

## Installation

### Basic
1. Copy the folder to your `addons` folder within your masterportal project.
2. Run `npm i` within the specific addon folder: `addons/ImporterAddon`
3. Adapt the `addons/addons.conf` by adding:
```
{
  "ImporterAddon": {
    "type": "tool"
  }
}
```
4. Refer the new addon in your portal's `config.js`:
```
    addons: [
        "ImporterAddon"
]
```
5. Configure the addon in your portal's `config.json`. See an example in `/docs/config.json.md`.

For more information, please check the official [Masterportal documentation](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/doc/addOnsVue.md).

### GeoPackage Support
1. Download and safe the GeoPackage library code and Web Assembly version of `Sql.js` to your portals resource folder, cf. `https://www.npmjs.com/package/@ngageoint/geopackage`.
   - `geopackage.min.js` ➡ `myportal/resources/geopackage.min.js`
   - `sql-wasm.wasm` ➡ `myportal/resources/sql-wasm.wasm`
2. Add the following import to your `index.html`:
   - `<script src="./resources/geopackage.min.js"></script>`
3. Verify, that the GeoPackage is defined as `supportedImportWorkflows` in your `config.json.md`.

## Notes

As present, this plugin will only work for the tree type `custom`. In future, it will be adapted to new tree component (Masterportal Update v3).

This addon has been developed as part of the project `Erneuerung und Entwicklung des MDI-DE Portals`.
“Marine Data Infrastructure Germany (MDI-DE)” is jointly operated by three federal authorities and five state authorities of the coastal states of Mecklenburg-Vorpommern, Niedersachsen and Schleswig-Holstein.

[Further information about the MDI-DE Portal](https://projekt.mdi-de.org/)
