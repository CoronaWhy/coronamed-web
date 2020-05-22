<template lang="pug">
	.input-simple-checkbox(@click="toogleValue", :class="{ 'active': model }")
		span {{ displayLabel }}
</template>

<script>
export default {
	name: 'InputSimpleCheckbox',
	props: {
		labelTrue:  { type: String, default: 'Yes' },
		labelFalse: { type: String, default: 'No' },
		value:      { type: null, default: null }
	},
	data: () => ({
		model: false
	}),
	computed: {
		displayLabel() {
			return this.model ? this.labelTrue : this.labelFalse;
		}
	},
	watch: {
		value: {
			immediate: true,
			handler(newValue) {
				this.model = !!newValue;
			}
		}
	},
	methods: {
		toogleValue() {
			this.model = !this.model;
			this.$emit('input', this.model);
			this.$emit('click');
		}
	}
};
</script>

<style lang="scss">
	.input-simple-checkbox {
		cursor: pointer;
	}

	.input-simple-checkbox.active {
		color: $blue;
	}
</style>
