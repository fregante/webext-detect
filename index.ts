/* eslint-disable @typescript-eslint/naming-convention */
declare const WEBEXT_WEB_PAGE: boolean | undefined;
declare const WEBEXT_EXTENSION_CONTEXT: boolean | undefined;
declare const WEBEXT_CONTENT_SCRIPT: boolean | undefined;
declare const WEBEXT_BACKGROUND: boolean | undefined;
declare const WEBEXT_BACKGROUND_PAGE: boolean | undefined;
declare const WEBEXT_BACKGROUND_WORKER: boolean | undefined;
declare const WEBEXT_OPTIONS_PAGE: boolean | undefined;
declare const WEBEXT_DEV_TOOLS_PAGE: boolean | undefined;
/* eslint-enable @typescript-eslint/naming-convention */

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
export const isWebPage = typeof WEBEXT_WEB_PAGE === 'boolean'
	? () => WEBEXT_WEB_PAGE
	: once((): boolean =>
		globalThis.location?.protocol.startsWith('http'),
	);

/** Indicates whether the code is being run in extension contexts that have access to the chrome API */
export const isExtensionContext = typeof WEBEXT_EXTENSION_CONTEXT === 'boolean'
	? () => WEBEXT_EXTENSION_CONTEXT
	: once((): boolean =>
		typeof globalThis.chrome?.extension === 'object',
	);

/** Indicates whether the code is being run in a content script */
export const isContentScript = typeof WEBEXT_CONTENT_SCRIPT === 'boolean'
	? () => WEBEXT_CONTENT_SCRIPT
	: once((): boolean =>
		isExtensionContext() && isWebPage(),
	);

/** Indicates whether the code is being run in a background context */
export const isBackground = typeof WEBEXT_BACKGROUND === 'boolean'
	? () => WEBEXT_BACKGROUND
	: (): boolean => isBackgroundPage() || isBackgroundWorker();

/** Indicates whether the code is being run in a background page */
export const isBackgroundPage = typeof WEBEXT_BACKGROUND_PAGE === 'boolean'
	? () => WEBEXT_BACKGROUND_PAGE
	: once((): boolean => {
		const manifest = getManifest(2);

		if (
			manifest
		&& isCurrentPathname(manifest.background_page || manifest.background?.page)
		) {
			return true;
		}

		return Boolean(
			manifest?.background?.scripts
		&& isCurrentPathname('/_generated_background_page.html'),
		);
	});

/** Indicates whether the code is being run in a background worker */
export const isBackgroundWorker = typeof WEBEXT_BACKGROUND_WORKER === 'boolean'
	? () => WEBEXT_BACKGROUND_WORKER
	: once(
		(): boolean => isCurrentPathname(getManifest(3)?.background?.service_worker),
	);

/** Indicates whether the code is being run in an options page. This only works if the current page’s URL matches the one specified in the extension's `manifest.json` */
export const isOptionsPage = typeof WEBEXT_OPTIONS_PAGE === 'boolean'
	? () => WEBEXT_OPTIONS_PAGE
	: once((): boolean => {
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
export const isDevToolsPage = typeof WEBEXT_DEV_TOOLS_PAGE === 'boolean'
	? () => WEBEXT_DEV_TOOLS_PAGE
	: once((): boolean => {
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
