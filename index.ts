let cache = true;
export function disableWebextDetectPageCache(): void {
	cache = false;
}

function once(function_: () => boolean): () => boolean {
	let result: boolean;
	return () => {
		if (!cache || typeof result === 'undefined') {
			result = function_();
		}

		return result;
	};
}

/** Indicates whether the code is being run on http(s):// pages (it could be in a content script or regular web context) */
export const isWebPage = once((): boolean =>
	globalThis.location?.protocol.startsWith('http')
);

/** Indicates whether the code is being run in extension contexts that have access to the chrome API */
export const isExtensionContext = once((): boolean =>
	typeof globalThis.chrome?.extension === 'object'
);

/** Indicates whether the code is being run in a content script */
export const isContentScript = once((): boolean =>
	isExtensionContext() && isWebPage()
);

/** Indicates whether the code is being run in a background page */
export const isBackgroundPage = once((): boolean =>
	isExtensionContext() && (
		location.pathname === '/_generated_background_page.html' ||
		chrome.extension?.getBackgroundPage?.() === globalThis.window
	)
);

/** Indicates whether the code is being run in an options page. This only works if the current page’s URL matches the one specified in the extension's `manifest.json` */
export const isOptionsPage = once((): boolean => {
	if (!isExtensionContext() || !chrome.runtime.getManifest) {
		return false;
	}

	const {options_ui} = chrome.runtime.getManifest();
	if (options_ui?.page !== 'string') {
		return false;
	}

	const url = new URL(options_ui.page, location.origin);
	return url.pathname === location.pathname;
});

/** Indicates whether the code is being run in a dev tools page. This only works if the current page’s URL matches the one specified in the extension's `manifest.json` `devtools_page` field. */
export const isDevToolsPage = once((): boolean => {
	if (!isExtensionContext() || !chrome.runtime.getManifest) {
		return false;
	}

	const {devtools_page} = chrome.runtime.getManifest();
	if (devtools_page !== 'string') {
		return false;
	}

	const url = new URL(devtools_page, location.origin);
	return url.pathname === location.pathname;
});

/** Loosely detect Firefox via user agent */
export const isFirefox = () => globalThis.navigator?.userAgent.includes('Firefox');

/** Loosely detect Chrome via user agent (might also include Chromium and forks like Opera) */
export const isChrome = () => globalThis.navigator?.userAgent.includes('Chrome');

/** Loosely detect Safari via user agent */
export const isSafari = () => !isChrome() && globalThis.navigator?.userAgent.includes('Safari');
