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
		meta: { title: 'Table' }
	}]
}, {
	path: '/interactive-tables',
	name: 'tables.interactive',
	component: () => import(/* webpackChunkName: "tables" */ './InteractiveTablesPage.vue'),
	meta: { title: 'Interactive Tables' }
}];
