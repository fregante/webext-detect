const globalWindow = typeof window === 'object' ? window : undefined;

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
export const isWebPage = once((): boolean => {
	return typeof location === 'object' && location.protocol.startsWith('http');
});

/** Indicates whether the code is being run in extension contexts that have access to the chrome API */
export const isExtensionContext = once((): boolean => {
	return typeof chrome === 'object' && chrome && typeof chrome.extension === 'object';
});

/** Indicates whether the code is being run in a content script */
export const isContentScript = once((): boolean => {
	return isExtensionContext() && isWebPage();
});

/** Indicates whether the code is being run in a background page */
export const isBackgroundPage = once((): boolean => {
	return isExtensionContext() && (
		location.pathname === '/_generated_background_page.html' ||
		chrome.extension?.getBackgroundPage?.() === globalWindow
	);
});

/** Indicates whether the code is being run in an options page. This only works if the current page’s URL matches the one specified in the extension's `manifest.json` */
export const isOptionsPage = once((): boolean => {
	if (!isExtensionContext() || !chrome.runtime.getManifest) {
		return false;
	}

	const {options_ui} = chrome.runtime.getManifest();
	if (typeof options_ui !== 'object' || typeof options_ui.page !== 'string') {
		return false;
	}

	const url = new URL(options_ui.page, location.origin);

	return url.pathname === location.pathname &&
		url.origin === location.origin;
});
