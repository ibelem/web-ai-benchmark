import { persisted } from 'svelte-local-storage-store'

export const numberofrunsStore = persisted('numberofrunsStore', 1);
export const backendsStore = persisted('backendsStore', []);
export const dataTypesStore = persisted('dataTypesStore', []);
export const modelTypesStore = persisted('modelTypesStore', []);
export const modelsStore = persisted('modelsStore', []);
export const testQueueStore = persisted('testQueueStore', []);