<template lang="pug">
	#users
		router-view
		user-create-modal(@submit="refresh")
		user-edit-modal(v-model="editbleAccount", @onUpdated="onAccountUpdated")

		h3.title.mb-3(v-if='showList') Users list
		.card(v-if='showList')
			.card-body
				.row
					.col-sm.mb-2
						.input-group
							input.form-control(type='text', placeholder='Type for search', v-model='filter.q')
							.input-group-prepend
								ladda.btn.btn-primary(:loading='isPageLoading', data-style='zoom-out', @click='refresh')
									i.fa.fa-refresh
					.col-sm-auto.mb-2
						b-form-select(v-model="filter.roles", :options="rolesOptions", :disabled="isPageLoading")
					.col-12.text-right
						button.btn.btn-success(@click="createAccount")
							i.fa.fa-plus.mr-2
							| Create Account
			.card-block
				table.table.table-responsive-xl(v-if='!isPageLoading || hasResult')
					thead
						tr
							th
							th Name
							th Email
							th Roles
							th
					tbody
						user-column(
							v-for='item in displayList',
							:key='item._id',
							:user='item',
							@onEdit="editAccount",
							@onRemove="removeAccount"
						)
				h4.text-info.text-center.p-4(v-else) Loading...
			.card-footer
				pagination-more(:pipe='fetchUsers', v-model='displayList', ref='pagin')

</template>

<script>
import { mapGetters } from 'vuex';
import PaginationMore from '@/components/PaginationMore.vue';
import searchMixin from '@/mixins/search';
import UserColumn from './UserColumn';
import UserCreateModal from './UserCreateModal';
import UserEditModal from './UserEditModal';

import { ROLE_OPTIONS } from './constants';

export default {
	name: 'UsersPage',
	components: {
		PaginationMore,
		UserColumn,
		UserCreateModal,
		UserEditModal
	},
	mixins: [searchMixin],
	data: () => ({
		filter: {
			q: '',
			roles: ''
		},
		displayList: [],
		rolesOptions: [
			{ text: 'All users', value: '' },
			...ROLE_OPTIONS
		],
		editbleAccount: null
	}),
	computed: {
		...mapGetters(['isPageLoading']),
		showList() {
			return this.$route.name === 'users';
		},
		hasResult() {
			return this.displayList.length > 0;
		}
	},
	watch: {
		showList(newValue) {
			if (newValue) this.refresh();
		}
	},
	methods: {
		createAccount() {
			this.$root.$emit('bv::show::modal', 'user__new_account');
		},
		editAccount(account) {
			this.editbleAccount = account;
			this.$root.$emit('bv::show::modal', 'user__edit_account');
		},
		removeAccount(account) {
			this.$swal.dialog({
				title: `You wanna remove ${account.name} account?`,
				preConfirm: () => {
					this.$store.dispatch('pageLoader', true);
					return this.$http.delete(`v1/admin/users/${account._id}`);
				}
			}).then(() => {
				this.$store.dispatch('pageLoader', false);
				this.refresh();
				this.$swal.success('Success', `${account.name} successfully removed`);
			}).catch(err => {
				if (err === 'cancel') return;
				this.$swal.showError('Account removing error', err);
				this.$store.dispatch('pageLoader', false);
			});
		},
		onAccountUpdated(account) {
			if (!this.editbleAccount) return;

			Object.assign(this.editbleAccount, account);
			this.editbleAccount = null;
		},
		refresh() {
			console.debug('refresh');

			if (this.$refs.pagin) {
				this.$refs.pagin.reset();
				this.$refs.pagin.fetch();
			}
		},
		fetchUsers({ _page, _limit }) {
			this.$store.dispatch('pageLoader', true);

			const params = Object.assign({ limit: _limit, page: _page },
				this.filterCriteria);

			return this.$http.get('v1/admin/users', { params }).then(result => {
				this.$store.dispatch('pageLoader', false);
				return result;
			}).catch(err => {
				this.$swal.showError('Users fetching error', err);
				this.$store.dispatch('pageLoader', false);
			});
		}
	}
};
</script>
