import axios from 'axios';
import initAuth from './auth';
import initErrorHandler from './error-handler';
import initParseResponse from './parse-response';

/**
 * Fix double baseURL
 */
axios.interceptors.request.use((config) => {
	if (
		config.baseURL &&
		config.url &&
		config.url.substr(0, config.baseURL.length) === config.baseURL
	) {
		config.url = config.url.substr(config.baseURL.length);
	}

	return config;
});

const http = axios.create({
	baseURL: process.env.VUE_APP_API_ENDPOINT
});

// Plugins
initAuth(http);
initParseResponse(http);
initErrorHandler(http);

export default http;
