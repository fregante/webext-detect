/* eslint-disable import/no-unassigned-import */
import * as detect from '../index.ts';
import './init/context-menu.js';
import './init/devtools-tab.js';
import './init/offscreen.js';

const results = Object.entries(detect)
	.filter(([key, exported]) => typeof exported === 'function' && key !== 'disableWebextDetectPageCache' && key !== 'getContextName')
	.map(([key, detection]) => [key, detection()])
	.sort(([, a], [, b]) => a === b ? 0 : (a ? -1 : 1))
	.map(([key, result]) => result === true ? `✅ ${key}` : (result === false ? `❌ ${key}` : `${key}(): ${result}`));

console.group(`contextName: ${detect.getContextName()}`);
for (const result of results) {
	console.log(result);
}

console.groupEnd();

if ('document' in globalThis) {
	globalThis.document.body.insertAdjacentHTML('beforeend', `
		<fieldset>
			<legend>contextName: ${detect.getContextName()}</legend>
			<ul>
				${results.map(result => `<li>${result}</li>`).join('')}
			</ul>
		</fieldset>
	`);
}
