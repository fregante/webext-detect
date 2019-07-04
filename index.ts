const isExtensionContext = typeof chrome === 'object' && chrome && typeof chrome.runtime === 'object';
const isWeb = location.protocol.startsWith('http');

export function isContentScript(): boolean {
	return isExtensionContext && isWeb;
}

export function isBackgroundPage(): boolean {
	return isExtensionContext && !isWeb &&
		location.pathname === '/_generated_background_page.html';
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
