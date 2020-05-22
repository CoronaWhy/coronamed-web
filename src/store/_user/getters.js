import _get from 'lodash/get';

export function account(state) {
	return state.account;
}

export function accountId(state) {
	return state.account ? state.account._id : null;
}

export function isAuth(state) {
	return !!state.auth;
}

export function roles(state) {
	return state.account.roles || [];
}

export function isAdmin(state) {
	const roles = state.account.roles || [];
	return roles.indexOf('ROLE_ADMIN') > -1;
}

export function isCoach(state) {
	const roles = state.account.roles || [];
	return roles.indexOf('ROLE_COACH') > -1;
}

export function isManager(state) {
	const roles = state.account.roles || [];
	return roles.indexOf('ROLE_MANAGER') > -1;
}

export function isStaffAccount(state) {
	const roles = state.account.roles || [];

	return ['ROLE_ADMIN']
		.some(role => roles.indexOf(role) > -1);
}

export function coachReferralLink(state) {
	if (!state.auth) {
		return null;
	}

	const accountName = _get(state, 'account.name');

	if (!accountName) {
		return null;
	}

	const safeName = encodeURIComponent(accountName);

	return `https://services445932.typeform.com/to/VemI8l?referral_name=${safeName}`;
}
