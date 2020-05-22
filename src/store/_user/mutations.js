import defaultState from './state';

export function SET_TOKEN(state, token) {
	state.token = token;
	state.auth = !!token;

	document.cookie = `sid=${token}`;
}

export function SET_ACCOUNT(state, account) {
	state.account = account;
}

export function SET_APIKEY(state, apikey) {
	state.apikey = apikey;
}

export function FLUSH_STATE(state) {
	const defState = defaultState();

	Object.assign(state, defState);
	Object.keys(state).forEach(stateName => {
		if (!defState.hasOwnProperty(stateName)) {
			delete state[stateName];
		}
	});

	document.cookie = '';
}
