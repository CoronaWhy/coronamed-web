import _debounce from 'lodash/debounce';
import _has from 'lodash/has';

const PAGE_LOADER_DEBOUNCE = _debounce(function(commit, value) {
	commit('SET_PAGE_LOADER_STATE', value);
}, 300);

export function pageLoader({ commit, state }, value) {
	if (value && state.pageLoader) return;

	if (value) {
		commit('SET_PAGE_LOADER_STATE', true);
	} else {
		PAGE_LOADER_DEBOUNCE(commit, false);
	}
}

export function touch({ commit, state }, [path, defVaule]) {
	if (!_has(state, path)) {
		commit('SET', [path, defVaule]);
	}
}
