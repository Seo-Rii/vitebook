<script context="module">
  let hasHydrated = false;
</script>

<script>
  import {
    COMPONENT_SSR_CTX_KEY,
    useAppContext,
    SSR_CTX_KEY,
  } from '@vitebook/client';
  import { onDestroy } from 'svelte';
  import { createApp, h } from 'vue';
  import * as App from ':virtual/vitebook/vue/app';

  const isSSR = import.meta.env.SSR;

  let target;
  let app;

  export let component;

  onDestroy(() => {
    destroy();
  });

  $: if (target) {
    mount(component);
  }

  async function createNewApp(component) {
    // @ts-expect-error - .
    app = createApp(h(App.default, { component }));
    await App.configureApp(app);
  }

  async function mount(component) {
    if (!component) return;
    destroy();
    await createNewApp(component);
    app.mount(target, import.meta.env.PROD && !hasHydrated);
    hasHydrated = true;
  }

  function destroy() {
    app?.unmount();
    app = undefined;
  }

  let ssrId = import.meta.env.SSR ? Math.random().toString(16).slice(2) : '';
  let ssrMarker = import.meta.env.SSR ? `<!--${ssrId}-->` : '';

  if (import.meta.env.SSR) {
    if (component) {
      const { renderToString } = require('vue/server-renderer');
      const appSSrContext = useAppContext(SSR_CTX_KEY);
      const ssrContext = useAppContext(COMPONENT_SSR_CTX_KEY);
      ssrContext[ssrId] = {
        // We pass this render function back up to the server entry file because top-level await
        // is not supported in Svelte yet.
        async render() {
          await createNewApp(component);
          const html = await renderToString(
            // Passing in app SSR context as Vue will automatically add component module id's
            // to the `module` set on it.
            app,
            appSSrContext,
          );
          return [ssrMarker, html];
        },
      };
    }
  }
</script>

<div bind:this={target}>
  {#if isSSR}
    {@html ssrMarker}
  {/if}
</div>
