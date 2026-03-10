export function useVisualViewport() {
  const viewportHeight = ref('100dvh')

  const updateHeight = () => {
    if (window.visualViewport) {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        window.scrollTo(0, 0)
      }
      viewportHeight.value = `${window.visualViewport.height}px`
    }
  }

  onMounted(() => {
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateHeight)
      window.visualViewport.addEventListener('scroll', updateHeight)
      document.body.classList.add('modal-open')
      updateHeight()
    }
  })

  onUnmounted(() => {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', updateHeight)
      window.visualViewport.removeEventListener('scroll', updateHeight)
      document.body.classList.remove('modal-open')
    }
  })

  return { viewportHeight }
}