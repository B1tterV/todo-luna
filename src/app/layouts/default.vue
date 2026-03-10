<script setup lang="ts">
import DefaultSidebar from '~/components/layouts/DefaultSidebar.vue';
import DefaultHeader from '~/components/layouts/DefaultHeader.vue';
</script>

<template>
    <div class="main">
        <DefaultSidebar />
        <div class="main__content">
            <DefaultHeader />
            <div class="content">
                <slot />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.main {
    display: flex;
    height: 100dvh;
    width: 100dvw;
    overflow: hidden;

    &__content{
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 100dvh;
        width: 100%;
        overflow-x: hidden;

        .content {
            @include scroll;
            flex: 1;
            overflow: auto;
            height: 100%;
        }
    }
}
</style>