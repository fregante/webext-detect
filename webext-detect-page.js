(function (exports) {
	'use strict';

	// https://github.com/bfred-it/webext-detect-page
	function isBackgroundPage() {
	    return location.pathname === '/_generated_background_page.html' &&
	        !location.protocol.startsWith('http') &&
	        Boolean(typeof chrome === 'object' && chrome.runtime);
	}
	function isContentScript() {
	    return location.protocol.startsWith('http') &&
	        Boolean(typeof chrome === 'object' && chrome.runtime);
	}
	function isOptionsPage() {
	    if (typeof chrome !== 'object' || !chrome.runtime) {
	        return false;
	    }
	    const { options_ui } = chrome.runtime.getManifest();
	    if (typeof options_ui !== 'object' || typeof options_ui.page !== 'string') {
	        return false;
	    }
	    const url = new URL(options_ui.page, location.origin);
	    return url.pathname === location.pathname &&
	        url.origin === location.origin;
	}

	exports.isBackgroundPage = isBackgroundPage;
	exports.isContentScript = isContentScript;
	exports.isOptionsPage = isOptionsPage;

}(this.window = this.window || {}));
