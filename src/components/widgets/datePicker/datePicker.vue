<style lang="scss">

</style>

<template>
    <div class="datePicker">
        <input
            readonly
            name="date"
            :disabled="disabled"
            :class="inputClass"
            :value="text"
            :placeholder="innerPlaceholder"
            ref="input"
            @mouseenter="hoverIcon"
            @mouseleave="hoverIcon"
            @click="togglePopup"
            @mousedown="$event.preventDefault()"
        />
    </div>
</template>

<script>
    import Calendar from './calendar.vue';
    import Languages from './languages';

    export default {
        name: 'datePicker',

        component: { Calendar },

        props: {
            value: null,
            format: {
                type: String,
                default: 'yyyy-MM-dd',
            },
            range: {
                type: Boolean,
                default: false,
            },
            type: {
                type: String,
                default: 'data' // 'date' || 'datetime'
            },
            width: {
                type: [String, Number],
                default: 210,
            },
            placeholder: String,
            lang: {
                type: String,
                default: 'zh',
            },
            // ?
            shortcuts: {
                type: [Boolean, Array],
                default: true,
            },
            disabledDays: {
                type: Array,
                default: [],
            },
            notBefore: {
                default: '',
            },
            notAfter: {
                default: '',
            },
            firstDayOfWeek: {
                type: Number,
                default: 7,
                validator: val => val >= 1 && val <= 7,
            },
            minuteStep: {
                type: Number,
                default: 0,
                validator: val => val >= 0 && val <= 60,
            },
            timePickerOptions: {
                type: Object,
                default: {},
            },
            confirm: {
                type: Boolean,
                default: false,
            },
            inputClass: {
                type: String,
                default: 'datePicker-input',
            },
            confirmText: {
                type: String,
                default: 'OK',
            },
            disabled: {
                type: Boolean,
                default: false,
            },
        },

        data() {
            return {
                showPopup: false,
                showCloseIcon: false,
                currentValue: this.value,
                position: null,
                ranges: [],
            };
        },

        created() {
            this.initRanges()
        },

        watch: {
            value: {
                handler(val) {
                    if (!this.range) {
                        this.currentVaule = this.isVaildDate(val)? val : undefined;
                    } else {
                        this.currentVaule = this.isVaildRange(val)? val.slice(0, 2) : [undefined, undefined];
                    }
                },
                immediate: true,
            },

            showPopup(val) {
                if (val) {
                    this.$nickTick(this.displayPopup);
                }
            }
        },

        computed: {
            translation() {
                return Languages[this.lang] || Languages['zh'];
            },
            innerPlaceholder() {
                return (
                    this.placeholder || (this.range? this.translation.placeholder.dateRange : this,translation.placeholder.date)
                );
            },
            text() {
                if (this.range && this.isVaildDate(this.value)) {
                    return this.stringify(this.value);
                }
                if (this.range && this.isVaildRange(this.value)) {
                    return this.stringify(this.value[0]) + ' ~ ' + this.stringify(this.value[1])
                }
                return '';
            },
        },

        methods: {
            updateDate() {
                const val = this.currentValue;
                if ((!this.range && val) || (this.range && val[0] && val[1])) {
                    this.$emit('input', val);
                }
            },
            confirmDate() {
                this.updateDate();
                this.closePopup();
                this.$emit('confirm', this.currentValue);
            },
            selectDate(show = false) {
                if (!this.confirm && !this.disabled) {
                    this.updateDate();
                    if (!show && this.type === 'date' && !this.range) {
                        this.closePopup();
                    }
                }
            },
            closePopup() {
                this.showPopup = false;
            },
            togglePopup() {
                if (this.showPopup) {
                    this.$refs.input.blur();
                    this.showPopup = false;
                } else {
                    this.$refs.input.focus();
                }this.showPopup = true;
            },
            hoverIcon(e) {
                if (this.disabled) {
                    return
                }
                if (e.type === 'mouseenter' && this.text) {
                    this.showCloseIcon = true;
                }
                if (e.type === 'mouseleave') {
                    this.showCloseIcon = false;
                }
            },
            clickIcon() {

            }
        },
    };
</script>
