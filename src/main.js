import Vue from 'vue';
import VueAxios from 'vue-axios';
import VueMaterial from 'vue-material';
import VueShortkey from 'vue-shortkey';

import VueSweetAlert from '@/lib/swal';
import VeeValidate from '@/lib/validator';
import axios from '@/lib/axios';
import '@/lib/data';

import PaginationMore from '@/components/PaginationMore';
import LocalPagination from '@/components/LocalPagination';
import SlideLoader from '@/components/SlideLoader';
import Ladda from '@/components/Ladda';

import pageTitleMixin from '@/mixins/pageTitle';

import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

Vue.use(VueMaterial);
Vue.use(VueShortkey);
Vue.use(VeeValidate, { locale: 'en', events: 'input' });
Vue.use(VueSweetAlert, { heightAuto: false });
Vue.use(VueAxios, axios);

Vue.mixin(pageTitleMixin);

Vue.component('LocalPagination', LocalPagination);
Vue.component('PaginationMore', PaginationMore);
Vue.component('SlideLoader', SlideLoader);
Vue.component('Ladda', Ladda);

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app');
