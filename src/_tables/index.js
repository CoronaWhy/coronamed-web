export const container = 'panel';

export const routes = [{
	path: '/tables',
	name: 'tables',
	component: () => import(/* webpackChunkName: "tables" */ './TablesPage.vue'),
	meta: { title: 'Tables' },
	children: [{
		path: ':id',
		name: 'tables.view',
		component: () => import(/* webpackChunkName: "table-view" */ './TableViewPage.vue'),
		meta: {
			showPublicUrl: true
		}
	}, {
		path: ':id/public',
		name: 'tables.view.public',
		component: () => import(/* webpackChunkName: "table-view" */ './TableViewPage.vue'),
		meta: { tableTransform: 'public' },
	}]
}, {
	path: '/interactive-tables',
	name: 'tables.interactive',
	component: () => import(/* webpackChunkName: "tables" */ './InteractiveTablesPage.vue'),
	meta: { title: 'Interactive Tables' }
}];
