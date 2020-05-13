import axios from 'axios';
import _get from 'lodash/get';

import store from '@/store';
import swal from '@/lib/swal';

import ApiError from '@/errors/ApiError';
import { INVALIND_RESPONSE } from '@/constants/api-errors';

const isAuth = () => store.getters['user/isAuth'];

const http = axios.create({
	baseURL: process.env.VUE_APP_API_ENDPOINT
});

http.interceptors.request.use(function(config) {
	const token = _get(store, 'state.user.token');

	if (typeof token === 'string') {
		config.headers.Authorization = `JWT ${token}`;
	}

	return config;
}, function(err) {
	// Do something with request error
	return Promise.reject(err);
});

http.interceptors.response.use(function(response) {
	const payload = response.data;
	const data   = _get(payload, 'data', null);
	const error  = _get(payload, 'error', false);

	if (error) {
		const apiErr = errorParser(payload);
		errorHandler(apiErr);

		throw apiErr;
	}

	if (data && typeof data === 'object') {
		definePayload(data, payload);
	}

	return data;
}, function(err) {
	console.warn('[axios] error:', err);

	const payload = err.response.data;
	const apiErr = errorParser(payload);

	errorHandler(apiErr);

	return Promise.reject(apiErr);
});

function logout() {
	if (isAuth()) {
		store.dispatch('user/logout');
	}
}

function definePayload(obj, payload) {
	const safePayload = Object.assign({}, payload);
	delete safePayload.data;

	Object.defineProperty(obj, '_payload', {
		enumerable: false,
		writable: false,
		value: safePayload
	});

	return obj;
}

function errorParser(payload) {
	const apiErr = new ApiError(
		_get(payload, 'code', INVALIND_RESPONSE.code),
		_get(payload, 'messages', [INVALIND_RESPONSE.message]),
		_get(payload, 'status', INVALIND_RESPONSE.status)
	);

	apiErr.payload = payload;
	apiErr.handled = false;

	return apiErr;
}

function errorHandler(apiErr) {
	let handled = true;

	switch (apiErr.statusCode) {
		case 402:
			logout();
			break;

		case 401:
			if (isAuth()) {
				swal.error('Unauthorized', 'Unauthorized request.');
			} else {
				handled = false;
			}

			logout();
			break;

		case 405:
			if (isAuth()) {
				swal.error('Session expired', 'Your session has expired, please login.');
			} else {
				handled = false;
			}

			logout();
			break;

		case 400:
			swal.error('Bad request', apiErr.message);
			break;

		default:
			handled = false;
			break;
	}

	apiErr.handled = handled;
}

export default http;
