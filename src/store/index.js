import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import defaultState from './state';

import userModule from './_user';

Vue.use(Vuex);

export default new Vuex.Store({
	actions,
	getters,
	mutations,
	state: defaultState(),
	strict: process.env.NODE_ENV !== 'production',
	plugins: [
		createPersistedState({ key: process.env.VUE_APP_PERSISTED_STATE_KEY })
	],
	modules: {
		user: userModule
	}
});
