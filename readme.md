# webext-detect-page [![](https://img.shields.io/npm/v/webext-detect-page.svg)](https://www.npmjs.com/package/webext-detect-page)

> Detects where the current browser extension code is being run. Chrome and Firefox.

## Install

You can just download the [standalone bundle](https://packd.fregante.now.sh/webext-detect-page@latest?name=window) (it might take a minute to download) and include the file in your `manifest.json`.

Or use `npm`:

```sh
npm install webext-detect-page
```

```js
 // This module is only offered as a ES Module
import {
	isBackgroundPage,
	isContentScript,
	isOptionsPage
} from 'webext-detect-page';
```

## Usage

```js
import {isBackgroundPage} from 'webext-detect-page';

if (isBackgroundPage()) {
	// Run background code, e.g.
	browser.runtime.onMessage.addListener(console.log);
} else if (isContentScript) {
	// Run content script code, e.g.
	browser.runtime.sendMessage('wow!');
}
```

## API

#### isBackgroundPage()

Returns a `boolean` that indicates whether the code is being run in a background page.

#### isContentScript()

Returns a `boolean` that indicates whether the code is being run in a content script.

#### isOptionsPage()

Returns a `boolean` that indicates whether the code is being run in an options page. This only works if the URL matches the one specified in the extension's `manifest.json`


## Related

* [webext-options-sync](https://github.com/fregante/webext-options-sync) - Helps you manage and autosave your extension's options.
* [webext-storage-cache](https://github.com/fregante/webext-storage-cache) - Map-like promised cache storage with expiration.
* [webext-domain-permission-toggle](https://github.com/fregante/webext-domain-permission-toggle) - Browser-action context menu to request permission for the current tab.
* [webext-dynamic-content-scripts](https://github.com/fregante/webext-dynamic-content-scripts) - Automatically inject your `content_scripts` on custom domains.
* [webext-content-script-ping](https://github.com/fregante/webext-content-script-ping) - One-file interface to detect whether your content script have loaded.
* [`Awesome WebExtensions`](https://github.com/fregante/Awesome-WebExtensions): A curated list of awesome resources for Web Extensions development

## License

MIT © [Federico Brigante](https://bfred.it)
