/* global chrome */
import mainHtmlUrl from 'url:../main.html';

globalThis.chrome?.offscreen?.createDocument({
	url: mainHtmlUrl,
	reasons: [chrome.offscreen.Reason.DOM_PARSER],
	justification: 'Testing',
}).catch(() => {}); // eslint-disable-line unicorn/prefer-top-level-await -- shh
