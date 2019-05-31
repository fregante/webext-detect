# webext-detect-page

> Detects where the current browser extension code is being run. Compatibile with Firefox, Chrome and derivates.

[![Travis build status](https://api.travis-ci.org/bfred-it/webext-detect-page.svg?branch=master)](https://travis-ci.org/bfred-it/webext-detect-page)
[![npm version](https://img.shields.io/npm/v/webext-detect-page.svg)](https://www.npmjs.com/package/webext-detect-page)

## Install

You can just include the file `webext-detect-page.js` in your `manifest.json`, or:

```sh
npm install --save webext-detect-page
```

```js
import {
	isBackgroundPage,
	isContentScript,
	isOptionsPage
} from 'webext-detect-page';
```

```js
const {
	isBackgroundPage,
	isContentScript,
	isOptionsPage
} = require('webext-detect-page');
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

* [`webext-options-sync`](https://github.com/bfred-it/webext-options-sync): Automatically add content scripts to existing tabs when your extension is installed
* [`Awesome WebExtensions`](https://github.com/bfred-it/Awesome-WebExtensions): A curated list of awesome resources for Web Extensions development

## License

MIT © Federico Brigante — [Twitter](http://twitter.com/bfred_it)
