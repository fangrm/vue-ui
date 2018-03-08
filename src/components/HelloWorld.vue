<template>
    <div class="main-page">
        <div class="part-1">
            <slider class="slider-out" :auto="0" :continuous="true" :show-indicators="true" :defaultIndex="0" ref="slider">
                <slider-item class="item-1">111</slider-item>
                <slider-item class="item-2">222</slider-item>
                <slider-item class="item-3">333</slider-item>
                <slider-item class="item-4">444</slider-item>
            </slider>
            <button @click="prev()"></button>
            <button @click="next()"></button>
        </div>
        <div class="part-2">
            <date-picker v-model="value1" range lang="zh"></date-picker>
        </div>
    </div>
</template>

<script>
    import Slider from './widgets/Slider.vue';
    import SliderItem from './widgets/SliderItem.vue';
    import DatePicker from './widgets/datePicker/datePicker.vue';

    export default {
        name: 'HelloWorld',

        components: {
            Slider: Slider,
            SliderItem: SliderItem,
            DatePicker: DatePicker,
        },

        data() {
            return {
                value1: '',
            }
        },

        methods: {
            next() {
                this.$refs.slider.next();
            },

            prev() {
                this.$refs.slider.prev();
            },
        }
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
    .item-4 {
        background-color: #e2e2e2;
        color: #fff;
    }
</style>
