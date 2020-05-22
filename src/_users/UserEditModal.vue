<template lang="pug">
	b-modal#user__edit_account(size="md", :no-close-on-backdrop="true", :title="modalTitle", @shown="onShown")
		transition(name="slide-fade")
			.user__new(v-if="value")
				user-form(v-model="value", ref="form")

				.mt-2.text-danger(v-if="errMsg") {{ errMsg }}

		template(slot="modal-footer")
			.col-12
				.row
					.col-md.mb-2
					.col-md-auto.mb-2
						ladda.btn.btn-info(
							:loading="isSaving",
							@click="saveSubmit",
							data-style="zoom-out"
						) UPDATE ACCOUNT

</template>

<script>
import UserForm from './UserForm.vue';

export default {
	name: 'UserEditModal',
	components: { UserForm },
	props: ['value'],
	data: () => ({
		errMsg: null,
		isSaving: false
	}),
	computed: {
		userId() {
			if (!this.value) return;

			return this.value._id;
		},
		modalTitle() {
			if (!this.value) {
				return 'Update account';
			}

			return `Update: ${this.value.name}`;
		}
	},
	methods: {
		onShown() {
			this.errMsg = null;
			this.isSaving = false;

			if (this.$refs.form) {
				this.$refs.form.$validator.reset();
				this.$refs.form.errors.clear();
			}
		},
		async saveSubmit() {
			const model = await this.$refs.form.validate();
			if (!model) return;

			this.isSaving = true;

			return this.$http.put(`v1/admin/users/${this.userId}`, model).then((result) => {
				this.isSaving = false;
				this.$emit('submit');
				this.close();
				this.$swal.info('Updated', 'Account successful updated');
				this.$emit('onUpdated', result);
			}).catch(err => {
				this.errMsg = err.message;
				this.isSaving = false;
			});
		},
		close() {
			this.$root.$emit('bv::hide::modal', 'user__edit_account');
		}
	}
};
</script>

<style scoped>
</style>
