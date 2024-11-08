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
function getManifest(version: 2): chrome.runtime.ManifestV2 | undefined;
function getManifest(version: 3): chrome.runtime.ManifestV3 | undefined;
function getManifest(): chrome.runtime.Manifest | undefined;
function getManifest(_version?: 2 | 3): chrome.runtime.Manifest | undefined {
	return globalThis.chrome?.runtime?.getManifest?.();
}

/* @__PURE__ */
function once(function_: () => boolean): () => boolean {
	let result: boolean;
	return () => {
		if (!cache || result === undefined) {
			result = function_();
		}

		return result;
	};
}

/** Indicates whether the code is being run on http(s):// pages (it could be in a content script or regular web context) */
export const isWebPage = once((): boolean =>
	['about:', 'http:', 'https:'].includes(location.protocol),
);

/** Indicates whether you're in extension contexts that have access to the chrome API */
export const isExtensionContext = once((): boolean =>
	typeof globalThis.chrome?.runtime?.id === 'string',
);

/** Indicates whether you're in a sandboxed page (-extension:// URL protocol, but no chrome.* API access) */
export const isSandboxedPage = once((): boolean => location.protocol.endsWith('-extension:') && !isExtensionContext());

/** Indicates whether you're in a content script. Note that the MAIN world is not considered a content script. */
export const isContentScript = once((): boolean =>
	isExtensionContext() && isWebPage(),
);

/** Indicates whether you're in a background context */
export const isBackground = (): boolean => isBackgroundPage() || isBackgroundWorker();

/** Indicates whether you're in a background page */
export const isBackgroundPage = once((): boolean => {
	const manifest = getManifest(2);
	if (!manifest) {
		return false;
	}

	if (isCurrentPathname(manifest.background_page ?? manifest.background?.page)) {
		return true;
	}

	return Boolean(
		manifest.background?.scripts
		&& isCurrentPathname('/_generated_background_page.html'),
	);
});

/** Indicates whether you're in a background worker */
export const isBackgroundWorker = once(
	(): boolean => isCurrentPathname(getManifest(3)?.background?.service_worker),
);

/** Indicates whether you're in a persistent background page (as opposed to an Event Page or Background Worker, both of which can be unloaded by the browser) */
export const isPersistentBackgroundPage = once((): boolean =>
	isBackgroundPage()
	&& getManifest(2)?.manifest_version === 2 // Firefox can have a background page on MV3, but can't be persistent
	&& getManifest(2)?.background?.persistent !== false,
);

/** Indicates whether you're in an options page. This only works if the current page’s URL matches the one specified in the extension's `manifest.json` */
export const isOptionsPage = once((): boolean => isCurrentPathname(getManifest()?.options_ui?.page));

/** Indicates whether you're in a side panel. This only works if the current page’s URL matches the one specified in the extension's `manifest.json` */
export const isSidePanel = once((): boolean =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Not yet in @types/chrome
	isCurrentPathname(getManifest(3)?.['side_panel']?.default_path),
);

/** Indicates whether you're in the main dev tools page, the one specified in the extension's `manifest.json` `devtools_page` field. */
export const isMainDevToolsPage = once((): boolean =>
	isExtensionContext()
		&& Boolean(chrome.devtools)
		&& isCurrentPathname(getManifest()?.devtools_page),
);

// TODO: When dropping this, also rename the `devToolsPage` context name below
/** @deprecated Use `isMainDevToolsPage` instead */
export const isDevToolsPage = isMainDevToolsPage;

/** Indicates whether you're in the dev tools page. Unlike `isDevToolsPage`, this works in any page that has the `chrome.devTools` API */
export const isDevTools = () => Boolean(globalThis.chrome?.devtools);

/** Indicates whether you're in a document created via chrome.offscreen */
export const isOffscreenDocument = once((): boolean =>
	isExtensionContext()
		&& 'document' in globalThis
		&& globalThis.chrome?.extension === undefined,
);

/** Loosely detect Firefox via user agent */
export const isFirefox = () => globalThis.navigator?.userAgent.includes('Firefox');

/** Loosely detect Chrome via user agent (might also include Chromium and forks like Opera) */
export const isChrome = () => globalThis.navigator?.userAgent.includes('Chrome');

/** Loosely detect Safari via user agent */
export const isSafari = () => !isChrome() && globalThis.navigator?.userAgent.includes('Safari');

/** Loosely detect Mobile Safari via user agent */
export const isMobileSafari = () => isSafari() && globalThis.navigator?.userAgent.includes('Mobile');

const contextChecks = {
	contentScript: isContentScript,
	background: isBackground,
	options: isOptionsPage,
	sidePanel: isSidePanel,
	devTools: isDevTools,
	devToolsPage: isDevToolsPage,
	offscreenDocument: isOffscreenDocument,
	extension: isExtensionContext,
	sandbox: isSandboxedPage,
	web: isWebPage,
} as const;

export type ContextName = keyof typeof contextChecks;
export const contextNames = Object.keys(contextChecks) as ContextName[];

type BooleanFunction = () => boolean;

/** Returns the first matching context among those defined in `ContextName`, depending on the current context. Returns "unknown" if no match is found. */
export function getContextName(): ContextName | 'unknown' {
	for (const [name, test] of Object.entries(contextChecks) as Array<[ContextName, BooleanFunction]>) {
		if (test()) {
			return name;
		}
	}

	return 'unknown';
}
