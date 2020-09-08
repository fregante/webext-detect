const isExtensionContext = typeof chrome === 'object' && chrome && typeof chrome.extension === 'object';
const globalWindow = typeof window === 'object' ? window : undefined;
const isWeb = typeof location === 'object' && location.protocol.startsWith('http');

export function isContentScript(): boolean {
	return isExtensionContext && isWeb;
}

export function isBackgroundPage(): boolean {
	return isExtensionContext &&
		chrome.extension.getBackgroundPage?.() === globalWindow;
}

export function isOptionsPage(): boolean {
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
}
