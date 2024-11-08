/* eslint-disable import/no-unassigned-import */
import * as detect from '../index.ts';
import './init/context-menu.js';
import './init/devtools-tab.js';
import './init/offscreen.js';

const table = Object.entries(detect)
	.filter(([key, exported]) => typeof exported === 'function' && key !== 'disableWebextDetectPageCache')
	.map(([key, detection]) => [key, detection()])
	.sort(([keyA, resultA], [keyB, resultB]) => {
		if (resultA === resultB) {
			return keyA.localeCompare(keyB);
		}

		return resultA === true ? -1 : 1;
	});

console.table(table);

if ('document' in globalThis) {
	globalThis.document.body.insertAdjacentHTML('beforeend', `
		<fieldset>
			<legend>${detect.getContextName()}</legend>
			<ul>
				${table.map(([key, result]) => `
					<li>
						<span>
							${result === true ? '✅' : (result === false ? '❌' : '')}
							${key}
							${typeof result === 'string' ? `: ${result}` : ''}
						</span>
					</li>
				`).join('')}
			</ul>
		</fieldset>
	`);
}
