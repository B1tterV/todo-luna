import { computed } from 'vue'

export const useWindow = () => {
  // девайс
  const viewport = useViewport()

  // проверяем: ширина экрана от 1439px (включительно) и выше
  const largeWindow = computed(() => viewport.isGreaterThan('desktop'))
  // проверяем: ширина экрана до 1439px (включительно)
  const middleWindow = computed(() => viewport.match('desktop'))
  // проверяем: ширина экрана до 1279 (включительно)
  const tabletWindow = computed(() => viewport.isLessThan('tablet'))
  // проверяем: ширина экрана до 960 (включительно)
  const smallWindow = computed(() => viewport.isLessThan('mobile'))

  return {
    largeWindow,
    middleWindow,
    tabletWindow,
    smallWindow,
  }
}