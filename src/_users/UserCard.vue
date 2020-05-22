<template lang="pug">
	.card(v-if='user')
		.card-header
			.pull-right
				ladda.btn.btn-primary(:loading='isLoading', data-style='zoom-out', @click='refresh')
					i.fa.fa-refresh
			h1.h5.m-0 {{ user.name }}
		.card-body
			dl.row
				template(v-for='item in properties')
					dt.col-sm-3 {{ item.title }}
					dd.col-sm-9
						span(v-if='!item.to') {{ item.value }}
						router-link(v-else='', :to='{ name: item.to, params: { id: item.value } }')
							| {{ item.value }}
</template>

<script>
import _get from 'lodash/get';
import { USER_CARD_PROPS } from './constants';

export default {
	name: 'UserCard',
	props: ['user', 'isLoading'],
	computed: {
		properties() {
			const list = [];

			USER_CARD_PROPS.forEach(item => {
				let value = _get(this.user, item.key);

				if (Array.isArray(value)) {
					value = value.join(', ');
				} else if (value === null || value === undefined) {
					return;
				}

				list.push({ value, title: item.title, to: item.to });
			});

			return list;
		}
	},
	methods: {
		refresh() {
			this.$emit('onRefresh');
		}
	}
};
</script>
