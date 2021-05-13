import { Store } from '@/store';

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $store: Store;
    }
}

declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        store?: Store<any>;
    }
}

declare module "vue/types/vue" {
    interface Vue {
        $store: Store<AppState>; // and adding the interface manually...
    }
}