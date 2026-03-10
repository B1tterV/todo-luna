<script setup lang="ts">
// Icons
// import ChevronDownIcon from '@/assets/icons/common/chevron-down.svg'

import { gsap } from 'gsap'

const { t, locales, locale, setLocale } = useI18n()

defineProps({
  showText: { type: Boolean, default: true },
})

type LocalesTypes = 'EN' | 'RU' | 'FR' | 'IT' | 'DE'

interface LocaleInterface {
  value: LocalesTypes;
  label: string;
}

const languages = [
    { value: locales.value[0]!.code, label: 'English' },
    { value: locales.value[1]!.code, label: 'Русский' },
    { value: locales.value[2]!.code, label: 'Français' },
    { value: locales.value[3]!.code, label: 'Italiano' },
    { value: locales.value[4]!.code, label: 'Deutschland' },
] as LocaleInterface[]

const selectedLanguage = ref(languages.find(l => l.value === locale.value))

const getIcon = (code: LocalesTypes) => {
  switch (code) {
    case 'EN':
      return 'us'
    case 'RU':
      return 'ru'
    case 'FR':
      return 'fr'
    case 'IT':
      return 'it'
    case 'DE':
      return 'de'
    default:
      return 'us'
  }
}

/**
 * Select language
 * @param language (EN, RU, FR, IT, DE)
 */
const selectLanguage = async (language: LocaleInterface) => {
  if (language) {
    selectedLanguage.value = language
    if (selectedLanguage.value?.value.toUpperCase() !== locale.value) {
      await setLocale(selectedLanguage.value?.value.toUpperCase() as LocalesTypes)
    }
  }
  popupIsOpen.value = false
}

const popupIsOpen = ref<boolean>(false);

const onEnter = (el: Element, done: () => void) => {
  gsap.fromTo(el, 
      {
          opacity: 0,
          x: -10
      },
      {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: "power2.out",
          onComplete: done
      }
  )
}

const onLeave = (el: Element, done: () => void) => {
  gsap.to(el, {
      opacity: 0,
      x: -10,
      duration: 0.2,
      ease: "power2.in",
      onComplete: done
  })
}
</script>

<template>
    <div class="lang-selector">
        <div
            class="lang-selector__current"
            @click="popupIsOpen = !popupIsOpen"
        >
            <ClientOnly>
                <span :class="`fi fi-${getIcon(selectedLanguage!.value)}`"/>
                <transition
                    @enter="onEnter"
                    @leave="onLeave"
                    :css="false"
                >
                  <div clas="text" v-if="showText">
                      {{ selectedLanguage?.label }}
                      <ChevronDownIcon :class="{ 'rotate' : popupIsOpen }" filled />
                  </div>
                </transition>
            </ClientOnly>
        </div>
        <div
            v-if="popupIsOpen"
            v-click-outside="() => popupIsOpen = false"
            class="lang-selector__menu"

        >
            <div
                v-for="language in languages"
                :key="`language-${language.value}`"
                class="lang"
                :class="{ 'active': selectedLanguage?.value === language.value }"
                @click="selectLanguage(language)"
            >
                <span :class="`fi fi-${getIcon(language.value)}`"/>
                {{ language.label }}
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.lang-selector {
    position: relative;

    &__current{
      @include NP-14-400;
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        color: $white;
        white-space: nowrap;

        .fi {
          min-width: 22px;
          width: 22px;
        }

        svg {
          width: 12px;
          height: 12px;
          margin-top: 1px !important;
          margin-left: 3px !important;

          &.rotate {
            transform: rotate(180deg);
          }
        }
    }

    &__menu {
        @include no-select;
        position: absolute;
        box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.25);
        background: var(--blue-logo);
        border-radius: 10px;
        z-index: 1000;
        bottom: 25px;
        padding: 12px 16px;
        
        .lang {
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 7px 0;
            color: $white;
            &:not(:last-child) {
                border-bottom: 1px solid color-mix(in srgb, var(--gray), transparent 80%);
            }

            &:hover {
                color: var(--active-icon);
            }
        }
    }
}
</style>