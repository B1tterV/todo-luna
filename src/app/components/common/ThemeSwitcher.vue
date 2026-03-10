<script setup lang="ts">
// Icons
import SunIcon from "@/assets/icons/theme/sun.svg"
import MoonIcon from "@/assets/icons/theme/moon.svg"

defineProps({
  showText: { type: Boolean, default: false },
})

const colorMode = useColorMode()

const changeColorMode = () => {
    colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
    <div
        class="theme-switcher"
        @click="changeColorMode"
    >
        <div class="theme-switcher__switcher">
            <div 
                class="switcher-circle" 
                :class="`switcher-circle--${colorMode.value}`"
            />
            <div
                class="switcher-item switcher-item--dark"
                :class="{'active': colorMode.value === 'dark' }" 
            >
                <MoonIcon filled />
            </div>
            <div class="switcher-item switcher-item--light">
                <SunIcon filled />
            </div>
        </div>
        <div v-if="showText" class="theme-switcher__text">
            {{ colorMode.value === 'light' ? 'Светлая тема' : 'Темная тема' }}
        </div>
    </div>
</template>

<style scoped lang="scss">
.theme-switcher {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    @include no-select;

    &__switcher{
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--dark-back);
        border-radius: 50px;
        padding: 1px 1px 1px 1px;
        width: 52px;
        min-width: 52px;
        height: 22px;

        .switcher-circle {
            position: absolute;
            left: 1px;
            top: 1px;
            width: 20px;
            height: 20px;
            border-radius: 100%;
            background: $light-blue-main;
            transition: transform 0.3s ease-in-out;
            
            &--light {
                transform: translateX(30px);
            }
            
            &--dark {
                transform: translateX(0px);
            }
        }

        .switcher-item {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            z-index: 1;

            &--dark.active {
                svg {
                    color: $dark-white;
                }
            }

            svg {
                color: #fff;
                width: 14px;
                height: 14px;
            }

            &.active {
                svg {
                    color: var(--white);
                }
            }
        }
    }

    &__text {
        @include NP-14-300;
        letter-spacing: 0.01em;
        color: $white;
        white-space: nowrap;
    }
}
</style>