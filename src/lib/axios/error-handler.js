import _get from 'lodash/get';
import Promise from 'bluebird';

import store from '@/store';
import swal from '@/lib/swal';
import ApiError from '@/errors/ApiError';

const isAuth = () => store.getters['user/isAuth'];
const logout = () => {
	if (isAuth()) {
		store.dispatch('user/logout');
	}
};

export default function(http) {
	http.interceptors.response.use(
		(response) => {
			if (response instanceof ApiError) {
				return errorHandler(response, http);
			}

			return response;
		},
		(error) => {
			return errorHandler(error, http);
		}
	);
}

function errorHandler(apiErr, http) {
	let handled = true;

	const request = _get(apiErr, 'request');
	const retryNum = _get(apiErr, 'request.retryNum') || 0;

	switch (true) {
		/* Token error */
		case
			apiErr.code === 'TOKEN_EXPIRED_ERROR' ||
			apiErr.code === 'TOKEN_VALIDATION_ERROR'
		:
			if (isAuth()) {
				swal.error('Session expired', 'Your session has expired, please login.');
			} else {
				handled = false;
			}

			logout();
			break;

		/* Unauthorized request  */
		case apiErr.statusCode === 401:
			if (isAuth()) {
				swal.error('Unauthorized', 'Unauthorized request.');
			} else {
				handled = false;
			}

			logout();
			break;

		/* Invalid response */
		case apiErr.code === 'INVALIND_RESPONSE' && retryNum < 2:
			request.retryNum = (request.retryNum || 0) + 1;

			console.warn(
				'[api: error handler] retry request attempt =',
				request.retryNum, request.url, request
			);

			if (request) {
				return Promise.delay(1000 * request.retryNum)
					.then(() => http(request));
			}

			handled = false;
			break;

		default:
			handled = false;
			break;
	}

	apiErr.handled = handled;
	return Promise.reject(apiErr);
}
