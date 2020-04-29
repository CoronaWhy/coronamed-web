import _set from 'lodash/set';

export function SET(state, [path, value]) {
	_set(state, path, value);
}

export function SET_PAGE_LOADER_STATE(state, value) {
	state.pageLoader = !!value;
}
