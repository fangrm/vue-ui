<template>
    <div class="slider-item">
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: 'slider-item',

        mounted() {
            this.$parent && this.$parent.sliderItemCreated(this);
        },

        destroyed() {
            this.$parent && this.$parent.sliderItemDestroyed(this);
        }
    };
</script>
