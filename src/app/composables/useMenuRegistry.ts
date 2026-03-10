const activeMenuId = ref<string | null>(null)

export function useMenuRegistry() {
  const registerMenu = (id: string) => {
    activeMenuId.value = id
  }

  const closeAllMenus = () => {
    activeMenuId.value = null
  }

  const isMenuOpen = (id: string) => activeMenuId.value === id

  return {
    activeMenuId,
    registerMenu,
    closeAllMenus,
    isMenuOpen
  }
}