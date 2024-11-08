/* global chrome */
import mainHtmlUrl from 'url:../main.html';
import {isChrome} from '../../index.ts';

if (globalThis.chrome?.contextMenus?.create) {
	chrome.contextMenus.removeAll();
	chrome.contextMenus.create({
		id: 'OPEN_ALL',
		title: 'Open all contexts',
		contexts: ['action'],
	});

	chrome.contextMenus.onClicked.addListener((info, tab) => {
		if (info.menuItemId === 'OPEN_ALL') {
			chrome.sidePanel?.open({
				windowId: tab.windowId,
			});
			chrome.runtime.openOptionsPage();
			chrome.tabs.create({
				url: mainHtmlUrl,
			});
			chrome.tabs.create({
				url: 'https://ephiframe.vercel.app/?iframe=' + chrome.runtime.getURL('sandbox.html'),
			});

			chrome.tabs.create({
				url: isChrome() ? 'chrome://extensions/' : 'about:debugging#/runtime/this-firefox',
			});
		}
	});
}
