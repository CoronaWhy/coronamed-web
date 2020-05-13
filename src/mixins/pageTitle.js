export default {
	created() {
		if (this.pageTitle !== undefined) {
			console.debug('[page-title] enable watching for:', this.$options.name);

			this.$watch('pageTitle', (newValue) => {
				if (newValue === null) {
					return;
				}

				this.$root.$emit('page-title:set', newValue);
			}, { immediate: true });
		}
	}
};
