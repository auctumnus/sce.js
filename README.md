# sce.js
![version](https://img.shields.io/npm/v/sce?style=flat-square) ![travis](https://img.shields.io/travis/auctumnus/sce.js?style=flat-square) ![license](https://img.shields.io/npm/l/sce?style=flat-square)

sce.js is a an implementation of SCE (Sound Change Engine) in Javascript and consumable for both Node and the browser.
The original (Python) implementation can be found [here](https://github.com/KathTheDragon/Conlanger).

## installation
sce.js can be added to a Node-based project by running
```bash
npm install sce
```
It can also be used in non-Node browser-based projects through [unpkg](https://unpkg.com), as so:
```html
<script src="unpkg.com/sce"></script>
```
See unpkg's documentation at the link above for more.

## usage
For projects using ES Module syntax for requiring packages (e.g. webpack), use the `import` syntax:
```js
import * as sce from 'sce'
```

Or, for usual Node syntax, just require():
```js
const sce = require('sce')
```