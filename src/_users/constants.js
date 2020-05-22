export const DEF_AVATAR_URL = '/img/user.png';
export const DEF_ROLE = 'ROLE_USER';

export const ROLE_OPTIONS = [
		{ text: 'Admin', value: 'ROLE_ADMIN' },
		{ text: 'Table Editor', value: 'ROLE_SHEET_EDIT' },
		{ text: 'Regular', value: 'ROLE_USER' },
];

export const USER_CARD_PROPS = [
	{ title: 'ID', key: '_id' },
	{ title: 'Name', key: 'name' },
	{ title: 'Email', key: 'email' },
	{ title: 'Roles', key: 'roles' }
];

export const BASE_MODEL = {
	name: '',
	email: '',
	password: '',
	disabled: false,
	roles: [DEF_ROLE]
};
