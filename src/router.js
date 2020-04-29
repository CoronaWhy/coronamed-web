import Vue from 'vue';
import Router from 'vue-router';
import store from './store';

Vue.use(Router);

const DEF_CONTAINER = 'common';

const ACTIVATE_PAGE_LOADER = (to, from, next) => {
	store.dispatch('pageLoader', true);
	next();
};

// defined containters
const MAP_ROUTE_CONTAINTERS = {
	panel: {
		component: () => import('@/containers/Panel.vue'),
		path: '/',
		children: [
			{ path: '/', component: () => import('@/views/Welcome.vue') }
		],
		meta: { title: 'Panel' }
	},
	common: {
		component: () => import('@/containers/Common.vue'),
		path: '/',
		children: [
			{ path: '*', component: () => import('@/views/Page404.vue') }
		]
	}
};

// load app modules and attach to defined container
process.env.VUE_APP_MODULES
	.split(',')
	.filter(v => v && v.length)
	.forEach(initAppModule);

const router = new Router({
	mode: 'history',
	base: process.env.BASE_URL,
	linkActiveClass: 'active',
	routes: Object.values(MAP_ROUTE_CONTAINTERS)
});

router.beforeEach(ACTIVATE_PAGE_LOADER);

export default router;

function initAppModule(moduleName) {
	let {
		container: moduleContainer,
		routes: moduleRoutes
	} = require(`@/${moduleName}/index.js`);

	if (!moduleRoutes || !moduleRoutes.length) {
		throw new TypeError(`AppModule "${moduleName}" has no exported routes.`);
	}

	if (!moduleContainer) {
		moduleContainer = DEF_CONTAINER;
	}

	const container = MAP_ROUTE_CONTAINTERS[moduleContainer];

	if (!container) {
		throw new TypeError(
			`AppModule "${moduleName}" has unknown container "${moduleContainer}".`
		);
	}

	container.children.unshift(...moduleRoutes);
}
