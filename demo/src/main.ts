import { mount } from 'svelte'
import App from './App.svelte'
import { init } from '@wjfe/n-savant';
import { routingMode } from './lib/hash-routing';

init({
  hashMode: routingMode,
  trace: { routerHierarchy: true }
});
const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
