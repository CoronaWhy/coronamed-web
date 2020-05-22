<template lang="pug">
	b-modal#user__new_account(size="md", :no-close-on-backdrop="true", title="Create Account", @shown="onShown")
		transition(name="slide-fade")
			.user__new(v-if="model")
				user-form(v-model="model", ref="form")

				.mt-2.text-danger(v-if="errMsg") {{ errMsg }}

		template(slot="modal-footer")
			.col-12
				.row
					.col-md.mb-2
					.col-md-auto.mb-2
						ladda.btn.btn-success(
							:loading="isSaving",
							@click="saveSubmit",
							data-style="zoom-out"
						) SAVE ACCOUNT

</template>

<script>
import { DEF_ROLE } from './constants';
import UserForm from './UserForm.vue';

export default {
	name: 'UserCreateModal',
	components: { UserForm },
	data: () => ({
		model: null,
		sendAccountCredentials: true,
		errMsg: null,
		isSaving: false
	}),
	methods: {
		onShown() {
			this.errMsg = null;
			this.isSaving = false;
			this.sendAccountCredentials = true;

			this.model = {
				role: DEF_ROLE,
				password: ''
			};

			if (this.$refs.form) {
				this.$refs.form.$validator.reset();
				this.$refs.form.errors.clear();
			}
		},
		async saveSubmit() {
			const model = await this.$refs.form.validate();
			if (!model) return;

			this.isSaving = true;

			const data = {
				account: model
			};

			return this.$http.post('v1/admin/users', data).then(() => {
				this.isSaving = false;
				this.$emit('submit');
				this.close();
				this.$swal.success('Saved', 'Account successful created');
			}).catch(err => {
				this.errMsg = err.message;
				this.isSaving = false;
			});
		},
		close() {
			this.$root.$emit('bv::hide::modal', 'user__new_account');
			this.model = null;
		}
	}
};
</script>

<style scoped>
	.custom-control-label {
		margin-top: 2px;
		color: #545454;
		font-size: 16px;
	}
</style>
