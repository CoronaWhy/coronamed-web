export default [{
	title: 'Tables',
	to: { name: 'tables' }
}, {
	title: 'Interactive Tables',
	to: { name: 'tables.interactive' }
}, {
	title: 'Users',
	to: { name: 'users' },
	roles: ['ROLE_ADMIN']
}, {
	title: 'Login',
	to: { name: 'login' },
	roles: ['ROLE_ANON']
}];
