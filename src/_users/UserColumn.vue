<template lang="pug">
	tr
		td.user__avatar
			img(:src="avatarUrl")

		td
			router-link.btn-link(:to="{ name: 'users.view', params: { id: user._id } }", tag="button")
				| {{ user.name }}
			.small.text-muted ID: {{ user._id }}

		td {{ user.email }}
		td {{ user.roles.join(', ') }}

		td.text-right
			button.btn.btn-sm.btn-warning.mr-2(@click="edit")
				i.fa.fa-pencil

			button.btn.btn-sm.btn-danger(@click="remove")
				i.fa.fa-close
</template>

<script>
const ANON_AVATAR_URL = '/img/user.png';

export default {
	name: 'UserColumn',
	props: ['user'],
	data: () => ({
		isSubmit: false
	}),
	computed: {
		avatarUrl() {
			if (this.user.account && this.user.account.avatarUrl) {
				return this.user.account.avatarUrl;
			}

			return ANON_AVATAR_URL;
		}
	},
	methods: {
		edit() {
			this.$emit('onEdit', this.user);
		},
		remove() {
			this.$emit('onRemove', this.user);
		}
	}
};
</script>

<style lang="scss">
	.user__avatar {
		width: 75px;

		img {
			width: 40px;
			height: 40px;
		}
	}
</style>
