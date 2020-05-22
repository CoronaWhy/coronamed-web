<template lang="pug">
	#user_info(v-if='user')
		.row
			.col-md-6
				user-card(:user='user', :isLoading="isPageLoading", @onRefresh="refresh")
</template>

<script>
import { mapGetters } from 'vuex';
import UserCard from './UserCard.vue';

export default {
	name: 'UserView',
	components: { UserCard },
	data: () => ({
		user: null
	}),
	watch: {
		userId: {
			immediate: true,
			handler: 'refresh'
		}
	},
	computed: {
		...mapGetters(['isPageLoading']),
		userId() {
			return this.$route.params.id;
		}
	},
	methods: {
		refresh() {
			this.$store.dispatch('pageLoader', true);

			this.$http.get('v1/admin/users/' + this.userId).then(result => {
				this.user = result;
				this.$store.dispatch('pageLoader', false);
			}).catch(err => {
				this.$swal.showError('User fetching error', err.message);
				this.$store.dispatch('pageLoader', false);
			});
		}
	},
	mounted() {
		this.$on('refresh', this.refresh.bind(this));
	}
};
</script>
