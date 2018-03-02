<style lang="scss" scoped>
    @import "../../style/widget/slider.scss";
</style>

<template>
    <div class="slider">
        <div class="slide-item-wrapper">
            <slot></slot>
        </div>
        <div class="slider-indicator-wrapper">
            <span class="indicator-icon"
                  v-for="(item, $index) in pages" :key="$index"
                  :class="{ 'active': $index === index }" @click="goto($index)"></span>
        </div>
    </div>
</template>

<script>
    /**
     * @description 轮播图外层组件
     */
    import { addClass, removeClass, once } from '../../utils';

    export default {
        name: 'slider',

        created() {
            this.dragState = {};
        },

        destroyed() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
            if (this.reInitTimer) {
                clearTimeout(this.reInitTimer);
                this.reInitTimer = null;
            }
        },

        data () {
            return {
                ready: false,
                dragging: false,
                userScrolling: false,
                animating: false, // 是否正在执行动画效果
                index: 0,
                pages: [],
                timer: null,
                reInitTimer: null,
                noDrag: false,
            }
        },

        props: {
            speed: {
                type: Number,
                default: 300
            },

            defaultIndex: {
                type: Number,
                default: 0
            },
            // 是否可操作？
            disabled: {
                type: Boolean,
                default: false,
            },

            auto: {
                type: Number,
                default: 3000,
            },
            // 是否循环
            continuous: {
                type: Boolean,
                default: true,
            },
            // 是否显示轮播图指示器
            showIndicators: {
                type: Boolean,
                default: true,
            },

            noDragWhenSingle: {
                type: Boolean,
                default: true,
            },
            // ?
            prevent: {
                type: Boolean,
                default: false,
            },
            // 事件是否冒泡
            propagation: {
                type: Boolean,
                default: false,
            }
        },

        methods: {
            sliderItemCreated() {
                if (!this.ready) return;

                clearTimeout(this.reInitTimer);
                this.reInitTimer = setTimeout(() => {
                    this.reInitPages();
                }, 100);
            },

            sliderItemDestroyed() {
                if (!this.ready) return;

                clearTimeout(this.reInitTimer);
                this.reInitTimer = setTimeout(() => {
                    this.reInitPages();
                }, 100);
            },

            reInitPages() {
                let children = this.$children;
                this.noDrag = children.length === 1 && this.noDragWhenSingle;

                let _pages = [];
                this.index = this.defaultIndex;

                children.forEach((child, index) => {
                    _pages.push(child.$el);

                    removeClass(child.$el, 'active');
                    if (index === this.defaultIndex) {
                        addClass(child.$el, 'active');
                    }
                });

                this.pages = _pages;
            },

            /**
             * @description 负责移动元素
             * @param element
             * @param offset
             * @param speed 控制元素动画速度，如果没有则不显示动画
             * @param callback
             */
            translate(element, offset, speed, callback) {
                if (speed) {
                    this.animating = true;
                    element.style.webkitTransition = '-webkit-transform ' + speed + 'ms ease-in-out';
                    setTimeout(() => {
                        element.style.webkitTransform = `translate3d(${offset}px, 0, 0)`;
                    }, 50);

                    let _called = false;
                    let transitionEndCallback = () => {
                        if (_called) return;
                        _called = true;
                        this.animating = false;
                        element.style.webkitTransition = '';
                        element.style.webkitTransform = '';
                        if (callback) {
                            callback.apply(this, arguments);
                        }
                    };

                    once(element, 'webkitTransitionEnd', transitionEndCallback);
                    setTimeout(transitionEndCallback, speed + 100); // webkitTransitionEnd maybe not fire on lower version android.
                } else {
                    element.style.webkitTransition = '';
                    element.style.webkitTransform = `translate3d(${offset}px, 0, 0)`;
                }
            },

            /**
             * @description 接受各种命令
             * @param towards 移动方向，null || 'prev' || 'next' || 'goto'
             * @param options
             */
            doAnimate(towards, options) {
                if (this.$children.length === 0) return;
                if (!options && this.$children.length <2) return;

                /*if (towards === 'next') {
                    prevPage = pages[index - 1];
                    nextPage = pages[index + 1];

                    if (this.continuous && pages.length > 1) {
                        if (!prevPage) {
                            prevPage = pages[pages.length - 1];
                        } else if (!nextPage) {
                            nextPage = pages[0];
                        }
                    }
                }*/

                /** ---- **/

                // 处理当前页、下一页、上一页
                let prevPage, nextPage, currentPage, pageWidth, offsetLeft;
                let speed = this.speed || 30,
                    index = this.index,
                    pages = this.pages,
                    pageCount = pages.length;

                // 处理 towards 为 'prev' || ''next' || 'goto'
                if (towards !== null) {
                    options = options || {};
                    pageWidth = this.$el.clientWidth;
                    currentPage = pages[index];

                    if (towards === 'goto') {
                        prevPage = options.prevPage;
                        nextPage = options.nextPage;
                    } else {
                        prevPage = pages[index - 1];
                        nextPage = pages[index + 1];
                        if (this.continuous && pages.length > 1) {
                            if (!prevPage) {
                                prevPage = pages[pages.length - 1];
                            }
                            if (!nextPage) {
                                nextPage = pages[0];
                            }
                        }
                    }
                    // 将上一页和下一页的位置调整好
                    if (prevPage) {
                        prevPage.style.display = 'block';
                        this.translate(prevPage, -pageWidth);
                    }
                    if (nextPage) {
                        nextPage.style.display = 'block';
                        this.translate(nextPage, pageWidth);
                    }
                } else {
                    prevPage = options.prevPage;
                    currentPage = options.currentPage;
                    nextPage = options.nextPage;
                    pageWidth = options.pageWidth;
                    offsetLeft = options.offsetLeft;
                }

                let newIndex;
                let oldPage = this.$children[index].$el;

                // 改变当前 index
                if (towards === 'prev') {
                    if (index > 0) {
                        newIndex = index -1;
                    }
                    if (this.continuous && index === 0) {
                        newIndex = pageCount - 1;
                    }
                } else if (towards === 'next') {
                    if (index < pageCount - 1) {
                        newIndex = index + 1;
                    }
                    if (this.continuous && index === pageCount - 1) {
                        newIndex = 0;
                    }
                } else if (towards === 'goto') {
                    if (options.newIndex > -1 && options.newIndex < pageCount) {
                        newIndex = options.newIndex;
                    }
                }

                let callback = () => {
                    if (newIndex !== undefined) {
                        let newPage = this.$children[newIndex].$el;
                        removeClass(oldPage, 'active');
                        addClass(newPage, 'active');

                        this.index = newIndex;
                        // 通知组件状态更新
                        this.$emit('change', newIndex, index);
                    }

                    // 隐藏前后页
                    if (prevPage) {
                        prevPage.style.display = '';
                    }
                    if (nextPage) {
                        nextPage.style.display = '';
                    }
                };

                // 移动相应元素
                setTimeout(() => {
                    if (towards === 'next') {
                        this.translate(currentPage, -pageWidth, speed, callback);
                        if (nextPage) {
                            this.translate(nextPage, 0, speed);
                        }
                    } else if (towards === 'prev') {
                        this.translate(currentPage, pageWidth, speed, callback);
                        if (prevPage) {
                            this.translate(prevPage, 0, speed);
                        }
                    } else if (towards === 'goto') {
                        if (prevPage) {
                            this.translate(currentPage, pageWidth, speed, callback);
                            this.translate(prevPage, 0, speed);
                        } else if (nextPage) {
                            this.translate(currentPage, -pageWidth, speed, callback);
                            this.translate(nextPage, 0, speed);
                        }
                    } else {
                        this.translate(currentPage, 0, speed, callback());
                        // 处理拖拽或触摸移动偏移
                        if (typeof offsetLeft !== 'undefined') {
                            if (prevPage && offsetLeft > 0) {
                                this.translate(prevPage, pageWidth * -1, speed);
                            }
                            if (nextPage && offsetLeft < 0) {
                                this.translate(nextPage, pageWidth, speed);
                            }
                        } else {
                            if (prevPage) {
                                this.translate(prevPage, pageWidth * -1, speed);
                            }
                            if (nextPage) {
                                this.translate(nextPage, pageWidth, speed);
                            }
                        }
                    }
                }, 10);
            },

            next() {
                this.doAnimate('next');
            },
            prev() {
                this.doAnimate('prev');
            },

            /**
             * @description 轮播图跳转
             */
            goto(newIndex) {
                if (this.index === newIndex) return;
                if (newIndex < this.index) {
                    this.doAnimate('goto', {
                        newIndex,
                        prevPage: this.pages[newIndex],
                    });
                } else {
                    this.doAnimate('goto', {
                        newIndex,
                        nextPage: this.pages[newIndex],
                    });
                }
            },

            // TODO: 轮播图拖动时间函数
            doOnTouchStart(event) {
                if (this.noDrag || this.disabled) return;

                let element = this.$el;
                let dragState = this.dragState;
                let touch = event.changedTouches? event.changedTouches[0] : event;

                dragState.startTime = new Date();
                dragState.startLeft = touch.pageX;
                dragState.startTop = touch.pageY;
                dragState.startTopAbsolute = touch.clientY;

                dragState.pageWidth = element.offsetWidth;
                dragState.pageHeight = element.offsetHeight;
            },

            /***** PC端用户拖动时间 *****/
            dragStartEvent(event) {
                if (this.prevent) {
                    event.preventDefault();
                }
                if (this.animating) return;
                this.dragging = true;
                this.userScrolling = false;
                this.doOnTouchStart(event);
            }
        },

        mounted() {
            this.ready = true;

            if (this.auto > 0) {
                this.timer = setInterval(() => {
                    if (!this.dragging && !this.animating) {
                        this.next();
                    }
                }, this.auto);
            }

            this.reInitPages();

            // TODO: 轮播图拖动事件绑定

        }
    }
</script>

