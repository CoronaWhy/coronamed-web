import store from '@/store';

const IF_NOT_AUTHENTICATED = (to, from, next) => {
	if (!store.getters['user/isAuth']) {
		return next();
	}

	next('/');
};

export const container = 'common';

export const routes = [{
	component: () => import(/* webpackChunkName: "auth" */ './LoginPage.vue'),
	path: '/login',
	name: 'login',
	beforeEnter: IF_NOT_AUTHENTICATED,
	meta: {
		title: 'Auth',
		appClass: 'common'
	}
}];
