export function isBackgroundPage(): boolean {
	return location.pathname === '/_generated_background_page.html' &&
		!location.protocol.startsWith('http') &&
		Boolean(typeof chrome === 'object' && chrome.runtime);
}

export function isContentScript(): boolean {
	return location.protocol.startsWith('http') &&
		Boolean(typeof chrome === 'object' && chrome.runtime);
}

export function isOptionsPage(): boolean {
	if (typeof chrome !== 'object' || !chrome.runtime) {
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
