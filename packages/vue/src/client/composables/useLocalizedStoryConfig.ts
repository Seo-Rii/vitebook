import { computed, ComputedRef, shallowReadonly } from 'vue';

import type { VueStoryConfig } from '../types/story';
import { useRouteLocale } from './useRouteLocale';
import { useStoryConfig } from './useStoryConfig';

export type LocalizedStoryConfigRef = Readonly<
  ComputedRef<Readonly<VueStoryConfig> | undefined>
>;

export function useLocalizedStoryConfig(): LocalizedStoryConfigRef {
  const storyConfig = useStoryConfig();
  const routeLocale = useRouteLocale();
  return shallowReadonly(
    computed(() =>
      storyConfig.value
        ? shallowReadonly({
            ...storyConfig.value,
            ...storyConfig.value.locales?.[routeLocale.value]
          })
        : undefined
    )
  );
}
