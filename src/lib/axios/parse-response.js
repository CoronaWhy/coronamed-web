import _get from 'lodash/get';
import ApiError from '@/errors/ApiError';
import { INVALIND_RESPONSE } from '@/constants/api-errors';

export default function(http) {
	http.interceptors.response.use(onResponse, onError);
}

function onResponse(response) {
	const payload = response.data;
	const data   = _get(payload, 'data', null);
	const error  = _get(payload, 'error', false);

	if (error) {
		return onError({ response });
	}

	if (data && typeof data === 'object') {
		definePayload(data, payload);
	}

	return data;
}

function onError(error) {
	const { response: errorResponse } = error;
	const request = errorResponse.config;

	const payload = Object.assign(
		{
			error: true,
			code: INVALIND_RESPONSE.code,
			messages: [INVALIND_RESPONSE.message],
			status: INVALIND_RESPONSE.status
		},
		_get(errorResponse, 'data') || {}
	);

	const apiErr = errorParser(payload);
	apiErr.request = request;

	return Promise.reject(apiErr);
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
