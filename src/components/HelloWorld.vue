<template>
    <div class="main-page">
        <div class="part-1">
            <slider class="slider-out" :auto="0" :continuous="true" :show-indicators="true" :defaultIndex="0">
                <slider-item class="item-1">111</slider-item>
                <slider-item class="item-2">222</slider-item>
                <slider-item class="item-3">333</slider-item>
            </slider>
        </div>
    </div>
</template>

<script>
    import Slider from './widgets/Slider.vue';
    import SliderItem from './widgets/SliderItem.vue';

    export default {
        name: 'HelloWorld',

        components: {
            Slider: Slider,
            SliderItem: SliderItem,
        },
    }
</script>

<style scoped>
    .part-1 {
        height: 200px;
    }
    .item-1 {
        background-color: #0089dc;
        color: #fff;
    }
    .item-2 {
        background-color: #ffd705;
        color: #000;
    }
    .item-3 {
        background-color: #ff2d4b;
        color: #fff;
    }
</style>
