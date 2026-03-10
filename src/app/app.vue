<script setup>
const colorMode = useColorMode()

const themeColor = computed(() => {
  return colorMode.value === 'dark' ? '#181b1f' : '#ffffff'
})

useHead({
  meta: [
    {
      name: 'theme-color',
      content: themeColor
    }
  ]
})
</script>

<template>
  <NuxtLayout>
    <NuxtPwaManifest />
    <NuxtPage />
  </NuxtLayout>
</template>
