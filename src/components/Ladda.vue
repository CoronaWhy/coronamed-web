<template>
	<button
		ref="ladda"
		class="ladda-button"
		:data-style="dataStyle"
		:data-size="dataSize"
		@click="handleClick"
	>
		<span class="ladda-label"><slot>Submit</slot></span>
	</button>
</template>

<script>
import 'ladda/css/ladda.scss';
import * as Ladda from 'ladda/js/ladda';

export default {
	name: 'VueLadda',
	props: {
		// use vue props validation to make sure "data-style" is given. (ladda need it)
		dataStyle: {
			type: String,
			default: 'expand-left'
		},
		dataSize: {
			type: String,
			default: 'md'
		},
		// loading prop to change the status of this component.
		loading: {
			type: Boolean,
			required: true
		},
		progress: {
			validator: function(progress) {
				return progress >= 0 && progress <= 1;
			},
			default: 0
		}
	},
	watch: {
		loading: function(loading) {
			loading ? this.ladda.start() : this.ladda.stop();
		},
		progress: function(progress) {
			this.ladda.setProgress(progress);
		}
	},
	mounted: function() {
		const l = Ladda.create(this.$refs.ladda);

		this.ladda = l;
		this.loading ? this.ladda.start() : this.ladda.stop();
	},
	beforeDestroy: function() {
		this.ladda.remove();
	},
	methods: {
		handleClick: function(e) {
			this.$emit('click', e);
		}
	}
};
</script>
