const isExtensionContext = typeof chrome === 'object' && chrome && typeof chrome.extension === 'object';
const globalWindow = typeof window === 'object' ? window : undefined;
const isWeb = typeof location === 'object' && location.protocol.startsWith('http');

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

export const isContentScript = once((): boolean => {
	return isExtensionContext && isWeb;
});

export const isBackgroundPage = once((): boolean => {
	return isExtensionContext && (
		location.pathname === '/_generated_background_page.html' ||
		chrome.extension?.getBackgroundPage?.() === globalWindow
	);
});

export const isOptionsPage = once((): boolean => {
	if (!isExtensionContext || !chrome.runtime.getManifest) {
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
