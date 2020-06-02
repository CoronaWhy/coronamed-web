<template lang="pug">
	.table-cell
		// Cord ref case
		template(v-if="cellType === 'cord_ref'")
			a(:href="cellData.link", target="_blank", v-if="cellData.link") {{ displayValue }}
			span(v-else) MISSED: {{ cellValue }}

		// Just url case
		template(v-else-if="cellType === 'url'")
			a(:href="cellValue", target="_blank") {{ displayValue }} *

		// Default case
		template(v-else)
			span {{ displayValue }}
</template>

<script>
import _get from 'lodash/get';
import moment from 'moment';

export default {
	name: 'TableCell',
	props: {
		cellValue:     { type: null, default: '' },
		cellType:      { type: String, default: 'string' },
		cellData:      { type: Object, default: () => ({ v: null, t: '' }) }
	},
	components: {
	},
	mixins: [],
	data: () => ({
		displayLength: 0,
	}),
	computed: {
		displayValue() {
			switch (this.cellType) {
				case 'date':
					return moment(this.cellValue).format('YYYY-MM-DD');

				case 'cord_ref':
					return _get(this.cellData, 'title') || 'link';

				case 'url':
					return _get(this.cellData, 'title') || 'link';

				default:
					return this.cellValue;
			}
		},
		displayValueLength() {
			return String(this.displayValue).length;
		}
	},
	watch: {
		displayValueLength: 'updateParentMinWidth'
	},
	mounted() {
		this.$nextTick(() => {
			this.updateParentMinWidth();
		});
	},
	methods: {
		updateParentMinWidth() {
			const parentName = this.$parent.$options.name;
			const parentEl   = this.$parent.$el;

			if (parentEl && parentName === 'MdTableCell') {
				const minWidth = 100 + Math.min(this.displayValueLength * 4, 540);
				parentEl.style.minWidth = Math.floor(minWidth) + 'px';
			}
		}
	}
};
</script>

<style lang="scss">
</style>
