import $http from '@/lib/axios';

export function loginByEmail({ commit }, { email, password, remember }) {
	const credits = { email, password };

	return $http.post('v1/users/login/email', credits).then(response => {
		commit('SET_ACCOUNT', response['user']);
		commit('SET_TOKEN', response['access_token']);

		if (remember) {
			commit('SET_APIKEY', response['apikey']);
		}

		return response;
	});
}

export function loginByApiKey({ commit }, apikey) {
	return $http.post('v1/users/login/apikey', { apikey }).then(response => {
		commit('SET_ACCOUNT', response['user']);
		commit('SET_TOKEN', response['access_token']);
		commit('SET_APIKEY', response['api_key'] || response['apikey'] || apikey);

		return response;
	});
}

export function refreshToken({ commit, state }) {
	const apikey = state.apikey;

	if (!apikey) {
		return [false, 'apikey unavailable'];
	}

	return loginByApiKey({ commit }, apikey);
}

export function refresh({ commit }) {
	return $http.get('v1/users/me').then(result => {
		commit('SET_ACCOUNT', result);
		return result;
	});
}

export function logout({ commit, dispatch }) {
	// flush user state
	commit('FLUSH_STATE');

	// redirect to login > and fulsh another modules
	dispatch('flushStorage', null, { root: true });
}
