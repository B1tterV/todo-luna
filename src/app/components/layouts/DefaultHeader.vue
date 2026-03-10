<script setup lang="ts">
// Icons
import ArrowsLeftRightIcon from '@/assets/icons/common/arrows-left-right.svg'
// Components
import ThemeSwitcher from '~/components/common/ThemeSwitcher.vue';

const isSidebarOpen = useSidebarOpen()
const { tabletWindow } = useWindow()
</script>

<template>
    <div class="default-header">
        <div class="default-header__left">
            <div
                v-if="tabletWindow"
                class="toggle"
                :class="{ open: isSidebarOpen }"
                @click="isSidebarOpen = !isSidebarOpen"
            >
                <ArrowsLeftRightIcon filled />
            </div>
        </div>
        <div class="default-header__right">
            <ThemeSwitcher class="header-item" />
            <div class="user-logo header-item">
                <img src="/images/memoji_20.png" alt="user">
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.default-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;
    background: var(--gray);
    border-bottom: 1px solid color-mix(var(--placeholder) 10%, transparent);
    padding: 0 20px;

    &__right {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .header-item:not(:last-child) {
            padding-right: 10px;
            border-right: 1px solid var(--line);
        }
        .user-logo {
            cursor: pointer;
            width: 32px;
            height: 32px;
            border-radius: 100%;
            overflow: hidden;
            background: var(--menu-back-reverse);
            border: 1px solid var(--line);

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }
    }

    .toggle.open {
        svg {
            transform: rotateY(180deg);
        }
    }
}
</style>