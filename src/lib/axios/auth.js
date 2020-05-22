import axios from 'axios';
import _get from 'lodash/get';
import store from '@/store';

export default function(http) {
	let isAlreadyFetchingAccessToken = false;
	let subscribers = [];

	http.interceptors.request.use(setupJWT);
	http.interceptors.response.use(null, (error) => {
		const errorResponse = error.response;

		if (isTokenExpiredError(errorResponse)) {
			return resetTokenAndReattemptRequest(error);
		}

		return Promise.reject(error);
	});

	async function resetTokenAndReattemptRequest(error) {
		const { response: errorResponse } = error;

		const retryOriginalRequest = new Promise(resolve => {
			subscribers.push(() => {
				const request = errorResponse.config;
				console.warn('[auth] retry request', request.url, request);

				setupJWT(request);
				resolve(axios(request));
			});
		});

		if (!isAlreadyFetchingAccessToken) {
			isAlreadyFetchingAccessToken = true;

			return store.dispatch('user/refreshToken').then(() => {
				isAlreadyFetchingAccessToken = false;
				subscribers.forEach(callback => callback());
				subscribers = [];

				return retryOriginalRequest;
			}).catch(err => {
				isAlreadyFetchingAccessToken = false;
				return Promise.reject(err);
			});
		}

		return retryOriginalRequest;
	}
}

function setupJWT(config) {
	if (!isAuthRequired(config)) {
		return config;
	}

	const token = _get(store, 'state.user.token');

	if (token) {
		config.headers.Authorization = `JWT ${token}`;
	}

	return config;
}

function isAuthRequired(config) {
	return config.auth !== false;
}

function isTokenExpiredError(response) {
	const errCode = _get(response, 'data.code');

	return (
		errCode === 'TOKEN_EXPIRED_ERROR' ||
		errCode === 'TOKEN_VALIDATION_ERROR'
	);
}
