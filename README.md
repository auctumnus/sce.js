# sce.js

A library for parsing and running Sound Change Engine (SCE) rules.

This is intended to be perfectly compatible with
[the current Python implementation], and the [documentation][py-docs] for it.

## Usage

Install through your favorite package manager:

```shell
$ npm install sce
$ yarn add sce
$ pnpm i sce
```

Or include it using [Unpkg]:
```html
<script src="//unpkg.com/sce@latest"></script>
```

(In the case of the Unpkg/UMD build, everything should be available
through the global `sce`.)


## License

[NVPLv7+]; however, the codebase that this is nominally a port of is [MIT]
(along with the [newer codebase] and [its license]).

[the current python implementation]: https://github.com/KathTheDragon/Conlanger
[py-docs]: http://www.dragonlinguistics.com/sce/doc.html
[nvplv7+]: https://thufie.lain.haus/NPL.html
[mit]: https://github.com/KathTheDragon/Conlanger/blob/master/license.txt
[newer codebase]: https://github.com/KathTheDragon/SCE
[its license]: https://github.com/KathTheDragon/SCE/blob/main/LICENSE
[Unpkg]: https://unpkg.com/