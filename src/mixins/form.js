export default {
	computed: {
		isFormValid() {
			return this.errors.items.length === 0;
		}
	},
	methods: {
		formValidate() {
			return this.$validator.validateAll()
				.then(() => true)
				.catch(() => false);
		},
		formValidationClass(param, baseClass = {}) {
			baseClass['is-invalid'] = this.errors.has(param);

			return baseClass;
		},
		throwFormValidation(msg) {
			const err = new Error(msg);
			err.validation = true;

			throw err;
		}
	}
};
