import {dotEnvConvict} from './convict';

export const CONFIG = dotEnvConvict({
	server: {
		port: {
			doc: 'server port',
			format: 'port',
			default: 8080,
			env: 'PORT',
		},
	},
	mugloar: {
		baseUrl: {
			doc: 'Mugloar API base URL',
			format: String,
			default: 'https://dragonsofmugloar.com/api/v2',
			env: 'MUGLOAR_BASE_URL',
		},
	},
});

CONFIG.validate({allowed: 'strict'});
