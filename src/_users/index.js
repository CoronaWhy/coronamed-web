export const container = 'panel';

export const routes = [{
	path: '/users',
	name: 'users',
	component: () => import(/* webpackChunkName: "users" */ './UsersPage.vue'),
	meta: { title: 'Users' },
	children: [{
		path: ':id',
		name: 'users.view',
		component: () => import(/* webpackChunkName: "users" */ './UserView.vue'),
		meta: { title: 'User Review' }
	}]
}];
