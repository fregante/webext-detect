import mainHtmlUrl from 'url:../main.html';

globalThis.chrome?.devtools?.panels?.create(
	'WEBEXT-DETECT',
	'icon.png',
	mainHtmlUrl,
);
