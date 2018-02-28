<template>
    <div class="slider">
        <div class="slide-show">
            <ul class="el-container">
                <li class="img-wrapper" v-for="(img, index) in imgArray" :key="index">
                    <a href="###">
                        <img :src="img" alt="aaa">
                    </a>
                </li>
            </ul>
        </div>
        <div class="bar">
            <span class="bar-icon" v-for="(item, index) in imgArray" :key="index"></span>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Slider',
        data () {
            return {
                imgArray: [
                    '111',
                    '222',
                    '333',
                ],
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h1, h2 {
        font-weight: normal;
    }
    ul {
        list-style-type: none;
        padding: 0;
    }
    li {
        display: inline-block;
        margin: 0 10px;
    }
    a {
        color: #42b983;
    }
</style>
