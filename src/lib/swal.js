import _get from 'lodash/get';
import VueSweetalert2 from 'vue-sweetalert2';
import swal from 'sweetalert2/dist/sweetalert2.min.js';

const lite = (title, html, type = 'success') => swal({ title, html, type, heightAuto: false });

const api = {
	success: (title, message) => lite(title, message, 'success'),
	error:   (title, message) => lite(title, message, 'error'),
	warning: (title, message) => lite(title, message, 'warning'),
	warn:    (title, message) => lite(title, message, 'warning'),
	info:    (title, message) => lite(title, message, 'info'),

	dialog: (opts = {}, cb) => {
		const i = swal({
			title: opts.label || 'Are you sure?',
			html: opts.html || opts.title || '',
			type: opts.type || 'warning',
			heightAuto: false,
			showCancelButton: true,
			confirmButtonText: opts.confirm || 'Yes, I\'m Sure',
			preConfirm: opts.preConfirm
		});

		return new Promise((resolve, reject) => {
			i.then(r => {
				if (opts.preventCancel !== false && r.dismiss === 'cancel') return;
				if (cb) cb(r);

				return resolve(r);
			}).catch(reject);
		});
	},

	showError: function(title, err, opts) {
		opts = opts || { displayHandled: false };

		if (arguments.length === 1) {
			err = title;
			title = 'Something went wrong';
		}

		let message = '';

		if (typeof err === 'string') {
			message = err;
		} else if (err.message) {
			message = err.message;
		}

		if (!opts.displayHandled && _get(err, 'handled')) {
			console.warn('suppressed error display', err);
			return;
		}

		lite(title, message, 'error');
	},

	install: (Vue, options) => {
		// call orign install
		VueSweetalert2.install(Vue, options);

		// extended swal api interface
		Object.assign(Vue.swal, api);
	}
};

export default api;
