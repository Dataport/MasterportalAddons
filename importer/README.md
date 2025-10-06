# Importer Addon

## Installation

### Basic
1. Copy the folder to your `addons` folder within your masterportal project.
2. Run `npm i` within the specific addon folder: `addons/importer`
3. Adapt the `addons/addons.conf` by adding:
```json
{
  "importer": {
    "type": "tool"
  }
}
```
4. Refer the new addon in your portal's `config.js`:
```json
addons: [
  "importer"
]
```
5. Configure the addon in your portal's `config.json`. See an example in `/doc/config.json.md`.

For more information, please check the official [Masterportal documentation](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/doc/addOnsVue.md).

### GeoPackage Support
1. Download and safe the GeoPackage library code and Web Assembly version of `Sql.js` to your portals resource folder, cf. `https://www.npmjs.com/package/@ngageoint/geopackage`.
   - `geopackage.min.js` ➡ `myportal/resources/geopackage.min.js`
   - `sql-wasm.wasm` ➡ `myportal/resources/sql-wasm.wasm`
2. Add the following import to your `index.html`:
   - `<script src="./resources/geopackage.min.js"></script>`
3. Verify, that the GeoPackage is defined as `supportedImportWorkflows` in your `config.json.md`.

## Notes

This plugin was developed for Masterportal v3.13.0.
