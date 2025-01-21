import {contextChecks, getContextName, type ContextName} from './index.js';

type ExtendedContextName = ContextName | `not ${ContextName}`;

export function assertContext(assertion: ExtendedContextName): void {
	const {groups} = /^(?<not>not )?(?<expectedContext>[a-z]+)$/i.exec(assertion)!;
	const matchesContext = contextChecks[groups?.['expectedContext'] as ContextName]();
	if (matchesContext) {
		if (groups?.['not']) {
			const currentContext = getContextName();
			throw new Error(`Expected context to not match ${getContextName(groups?.['expectedContext'])}, but it did match ${currentContext}`);
		}
	} else {
		if (groups?.['not']) {
			throw new Error(`Expected context to match ${getContextName(groups?.['expectedContext'])}`);
	}
}
