import _set from 'lodash/set';
import defaultState from './state';

export function SET(state, [path, value]) {
	_set(state, path, value);
}

export function SET_PAGE_LOADER_STATE(state, value) {
	state.pageLoader = !!value;
}

export function SET_LEFT_SIDEBAR_SHOW_STATE(state, value) {
	state.isSidebarShow = state.isSidebarShow || {};
	state.isSidebarShow.left = !!value;
}

export function SET_RIGHT_SIDEBAR_SHOW_STATE(state, value) {
	state.isSidebarShow = state.isSidebarShow || {};
	state.isSidebarShow.right = !!value;
}

export function SET_LEFT_SIDEBAR_SHOW_CUSTOM_COMPONENT_STATE(state, value) {
	state.isSidebarShowCustomComponent = state.isSidebarShowCustomComponent || {};
	state.isSidebarShowCustomComponent.left = !!value;
}

export function SET_RIGHT_SIDEBAR_SHOW_CUSTOM_COMPONENT_STATE(state, value) {
	state.isSidebarShowCustomComponent = state.isSidebarShowCustomComponent || {};
	state.isSidebarShowCustomComponent.right = !!value;
}

export function SCHEDULED_MESSAGES_REFRESH(state) {
	state.scheduledMessagesRefreshCount++;
}

export function FLUSH_STATE(state) {
	const defState = defaultState();
	const modulesMap = {};

	Object.keys(this._modulesNamespaceMap)
		.map(v => v.substr(0, v.length - 1))
		.forEach(moduleName => modulesMap[moduleName] = true);

	Object.assign(state, defState);
	Object.keys(state).forEach(stateName => {
		if (!defState.hasOwnProperty(stateName) && !modulesMap[stateName]) {
			delete state[stateName];
		}
	});
}
