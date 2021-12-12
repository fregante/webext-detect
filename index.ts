let cache = true;
export function disableWebextDetectPageCache(): void {
	cache = false;
}

function isCurrentPathname(path?: string): boolean {
	if (!path) {
		return false;
	}

	try {
		const {pathname} = new URL(path, location.origin);
		return pathname === location.pathname;
	} catch {
		return false;
	}
}

/** Internal utility just to get the right manifest type. Chrome seems to accept workers even on v2 */
function getManifest(version: 2): chrome.runtime.ManifestV2 | void;
function getManifest(version: 3): chrome.runtime.ManifestV3 | void;
function getManifest(_version?: 2 | 3): chrome.runtime.Manifest | void {
	return globalThis.chrome?.runtime?.getManifest?.();
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
	globalThis.location?.protocol.startsWith('http'),
);

/** Indicates whether the code is being run in extension contexts that have access to the chrome API */
export const isExtensionContext = once((): boolean =>
	typeof globalThis.chrome?.extension === 'object',
);

/** Indicates whether the code is being run in a content script */
export const isContentScript = once((): boolean =>
	isExtensionContext() && isWebPage(),
);

/** Indicates whether the code is being run in a background context */
export const isBackground = (): boolean => isBackgroundPage() || isBackgroundWorker();

/** Indicates whether the code is being run in a background page */
export const isBackgroundPage = once((): boolean => {
	const manifest = getManifest(2);

	if (manifest && isCurrentPathname(manifest.background_page || manifest.background?.page)) {
		return true;
	}

	return Boolean(manifest?.background?.scripts && isCurrentPathname('/_generated_background_page.html'));
});

/** Indicates whether the code is being run in a background worker */
export const isBackgroundWorker = once((): boolean => isCurrentPathname(getManifest(3)?.background?.service_worker));

/** Indicates whether the code is being run in an options page. This only works if the current page’s URL matches the one specified in the extension's `manifest.json` */
export const isOptionsPage = once((): boolean => {
	if (!isExtensionContext() || !chrome.runtime.getManifest) {
		return false;
	}

	const {options_ui: optionsUi} = chrome.runtime.getManifest();
	if (typeof optionsUi?.page !== 'string') {
		return false;
	}

	const url = new URL(optionsUi.page, location.origin);
	return url.pathname === location.pathname;
});

/** Indicates whether the code is being run in a dev tools page. This only works if the current page’s URL matches the one specified in the extension's `manifest.json` `devtools_page` field. */
export const isDevToolsPage = once((): boolean => {
	if (!isExtensionContext() || !chrome.devtools) {
		return false;
	}

	const {devtools_page: devtoolsPage} = chrome.runtime.getManifest();
	if (typeof devtoolsPage !== 'string') {
		return false;
	}

	const url = new URL(devtoolsPage, location.origin);
	return url.pathname === location.pathname;
});

/** Loosely detect Firefox via user agent */
export const isFirefox = () => globalThis.navigator?.userAgent.includes('Firefox');

/** Loosely detect Chrome via user agent (might also include Chromium and forks like Opera) */
export const isChrome = () => globalThis.navigator?.userAgent.includes('Chrome');

/** Loosely detect Safari via user agent */
export const isSafari = () => !isChrome() && globalThis.navigator?.userAgent.includes('Safari');

const contextNames = {
	contentScript: isContentScript,
	background: isBackground,
	options: isOptionsPage,
	devToolsPage: isDevToolsPage,
	extension: isExtensionContext,
	web: isWebPage,
} as const;

type ContextName = keyof typeof contextNames;
type BooleanFunction = () => boolean;

export function getContextName(): ContextName | 'unknown' {
	for (const [name, test] of Object.entries(contextNames) as Array<[ContextName, BooleanFunction]>) {
		if (test()) {
			return name;
		}
	}

	return 'unknown';
}
