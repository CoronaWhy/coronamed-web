import VeeValidate, { Validator } from 'vee-validate';

const orgValidateAll = Validator.prototype.validateAll;

Validator.prototype.validateAll = function() {
	return orgValidateAll.apply(this, arguments).then(result => {
		if (!result) {
			const err = new Error('Form invalid');
			err.validation = true;
			throw err;
		}

		return result;
	});
};

export default VeeValidate;
