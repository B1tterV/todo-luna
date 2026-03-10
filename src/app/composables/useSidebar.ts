export const useSidebarOpen = () => {
    const isSidebarOpen = useState('sidebarOpen', () => true)
    const { tabletWindow } = useWindow()

    if (import.meta.client) {
        watch(tabletWindow, (isTablet) => {
            if (isTablet) isSidebarOpen.value = false
        }, { immediate: true })
    }

    return isSidebarOpen
}