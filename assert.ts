import {contextChecks, getContextName, type ContextName} from './index.js';

type ExtendedContextName = ContextName | `not ${ContextName}`;

/**
Throws if the current context doesn't match the expected one. Prefix the context name with `not ` to assert the opposite.

@example
assertContext('background');
assertContext('not contentScript');
*/
export function assertContext(assertion: ExtendedContextName): void {
	const isNegated = assertion.startsWith('not ');
	const expectedContext = (isNegated ? assertion.slice('not '.length) : assertion) as ContextName;

	if (contextChecks[expectedContext]() === isNegated) {
		throw new Error(`Expected context ${isNegated ? 'not ' : ''}to be "${expectedContext}", but the current context is "${getContextName()}"`);
	}
}
