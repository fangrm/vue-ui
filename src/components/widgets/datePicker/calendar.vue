<style lang="scss" scoped>
    @import "../../../style/widget/datepicker";
</style>

<template>
    <div class="calendar">
        <div class="header" v-if="currentPanel === 'time'">
            <a @click="currentPanel = 'date'">{{ now.toLocalDateString() }}</a>
        </div>
        <div class="header" v-else>
            <a class="prev-icon" @click="changeYear(-1)">&laquo;</a>
            <a class="prev-icon" v-show="currentPanel === 'date'" @click="changeMonth(-1)">&lsaquo;</a>
            <a class="next-icon" @click="changeYear(1)">&raquo;</a>
            <a class="next-icon" v-show="currentPanel === 'date'" @click="changeMonth(1)">&rsaquo;</a>
            <a class="current-month" @click="showMonths">{{ months[currentMonth] }}</a>
            <a class="current-year" @click="showYears">{{ currentYear }}</a>
        </div>

        <div class="content">
            <table class="calendar-table" v-show="currentPanel === 'date'">
                <thead>
                    <tr>
                        <th v-for="(day, index) in days" :key="index">{{ day }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in dates">
                        <td v-for="cell in row" :title="cell.title" :class="getDateClasses(cell)" @click="selectDate(cell)">{{ cell.day }}</td>
                    </tr>
                </tbody>
            </table>
            <div class="calendar-year" v-show="currentPanel === 'years'">
                <a v-for="year in years" @click="selectYear(year)" :class="{'current': currentYear === year}">{{ year }}</a>
            </div>
            <div class="calendar-month" v-show="currentPanel === 'months'">
                <a v-for="(month, index) in months" @click="selectMonth(index)" :class="{'current': currentMonth === index}">{{ month }}</a>
            </div>
            <div class="calendar-time" v-show="currentPanel === 'time'">
                <div class="time-list-wrapper" v-if="timeSelectOptions.length > 0">
                    <ul class="time-list">
                        <li
                            class="time-item time-picker-item"
                            :class="getTimeClasses(item.value.hours * 60 + item.value.minutes, -1)"
                            @click="pickTime(item.value)"
                            v-for="item in timeSelectOptions"
                        >
                            {{ item.label }}
                        </li>
                    </ul>
                </div>
                <div
                    class="time-list-wrapper"
                    v-else
                    :style="{ width: 100 / times.length + '%' }"
                    v-for="(time, index) in times"
                    :key="index"
                >
                    <ul class="time-list">
                        <li
                            class="time-item"
                            v-for="num in time"
                            :class="getTimeClasses(num, index)"
                            :key="num"
                            @click="selectTime(num, index)"
                        >
                            {{ num | timeText}}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    /**
     * @description 生成一个时间数组
     * @param len 时间序列长度
     * @param step 时间间隔
     */
    const getTimeArray = (len, step = 1) => {
        let length = parseInt(len / step);
        return Array.apply(null, {length}).map((v, i) => i * step);
        // Array.apply(null, {length}), length为特殊字段，意思是生成一个长度为length的数组，由于没赋值，所以都是undefined
        // Array.map() 返回计算后的新数组
    };

    const parseTime = (time) => {
        const values = (time || '').split(':');
        if (values.length >=  2) {
            const hours = parseInt(values[0], 10);
            const minutes = parseInt(values[1], 10);
            return {
                hours,
                minutes
            }
        }
        return null;
    };

    const formatTime = (time, type = '24') => {
        let hours = time.hours;
        hours = type === '24'? hours : (hours % 12 || 12);
        hours = hours < 10? '0' + hours : hours;
        let minutes = time.minutes < 10? '0' + time.minutes : time.minutes;
        let result = hours + ':' + minutes;
        if (type === '12') {
            result += time.hours >= 12? ' pm' : ' am';
        }
        return result;
    };

    export default {
        name: 'calendar',

        // TODO: propTypes
        props: {
            startAt: null,
            endAt: null,
            value: null, // 要显示的时间值
            show: Boolean,
        },

        data() {
            let translation = this.$parent.translation; // 多语言文本
            let minuteStep = this.$parent.minuteStep; // 时间间隔
            let times = [getTimeArray(24, 1), getTimeArray((60, minuteStep || 1))];
            // TODO: 这块做什么的？
            if (minuteStep === 0) {
                times.push(getTimeArray(60, 1));
            }
            return {
                months: translation.months,
                dates: [], // 日历面板
                years: [], // 年份面板
                now: new Date(),
                currentPanel: 'date',
                times: times,
            };
        },

        methods: {
            updateNow() {
                this.now = this.value? new Date(this.value) : new Date();
            },

            // 更新面板选择时间
            updateCalendar() {
                const getCalendar = (time, firstDay, length, classes) => {
                    return Array.apply(null, { length }).map((v, i) => {
                        let day = firstDay + i;
                        let date = new Date(time.getFullYear(), time.getMonth(), day, 0, 0, 0);
                        date.setDate(day);
                        return {
                            title: date.toLocaleDateString(),
                            date,
                            day,
                            classes
                        };
                    });
                };

                let firstDayOfWeek = this.$parent.firstDayOfWeek;
                let time = new Date(this.now);
                time.setDate(0); // 把时间切换成上个月的最后一天
                let lastMonthLength = (time.getDay() + 7 - firstDayOfWeek) % 7 + 1;
                let lastMonthFirstDay = time.getDate() - (lastMonthLength - 1);
                let lastMonth = getCalendar(time, lastMonthFirstDay, lastMonthLength, 'lastMonth');

                time.setMonth(time.getMonth() + 2, 0); // 切换到这个月的最后一天
                let curMonthLength = time.getDate();
                let curMonth = getCalendar(time, 1, curMonthLength, 'curMonth');

                time.setMonth(time.getMonth() + 1, 1);
                let nextMonthLength = 42 - (lastMonthLength + curMonthLength);
                let nextMonth = getCalendar(time, 1,nextMonthLength, 'nextMonth');

                let index = 0,
                    resIndex = 0;
                let arr = lastMonth.concat(curMonth, nextMonth);
                let result = new Array(6);
                while (index < 42) {
                    result[resIndex++] = arr.slice(index, (index += 7));
                }
                this.dates = result;
            },

            getDateClasses(cell) {
                let classes = [];
                let cellTime = new Date(cell.date).setHours(0, 0, 0, 0);
                let cellEndTime = new Date(cell.date).setHours(23, 59, 59, 999);
                let curTime = this.value? new Date(this.value).setHours(0, 0, 0, 0) : 0;
                let startTime = this.startAt? new Date(this.startAt).setHours(0, 0, 0, 0) : 0;
                let endTime = this.endAt? new Date(this.endAt).setHours(0, 0, 0, 0) : 0;
                let today = new Date().setHours(0, 0, 0, 0);

                if (
                    this.$parent.disabledDays.some(v => new Date(v).setHours(0, 0, 0, 0) === cellTime)
                    || (this.$parent.notBefore !== '' && cellEndTime < new Date(this.$parent.notBefore).getTime())
                    || (this.$parent.notAfter !== '' && cellTime > new Date(this.$parent.notAfter).getTime())
                ) {
                    return 'disabled'
                }

                classes.push(cell.classes);
                if (cellTime === today) {
                    classes.push('today');
                }

                if (cellTime === curTime) {
                    classes.push('current');
                } else if (startTime) {
                    if (cellTime < startTime) {
                        classes.push('disabled');
                    } else if (curTime && cellTime <= curTime) {
                        classes.push('inrange');
                    }
                } else if (endTime) {
                    if (cellTime > endTime) {
                        classes.push('disabled');
                    } else if (curTime && cellTime >= curTime) {
                        classes.push('inrange');
                    }
                }
                return classes.join(' ');
            },

            getTimeClasses(value, index) {
                let curValue;
                let cellTime;
                const startTime = this.startAt? new Date(this.startAt) : 0;
                const endTime = this.endAt? new Date(this.endAt) : 0;
                const classes = [];
                switch (index) {
                    case -1:
                        curValue = this.curHour * 60 + this.curMinute;
                        cellTime = new Date(this.now).setHours(Math.floor(value / 60), value % 60, 0);
                        break;
                    case 0:
                        curValue = this.curHour;
                        cellTime = new Date(this.now).setHours(value);
                        break;
                    case 1:
                        curValue = this.curMinute;
                        cellTime = new Date(this.now).setMinutes(value);
                        break;
                    case 2:
                        curValue = this.curSecond;
                        cellTime = new Date(this.now).setSeconds(value);
                        break;
                }
                if (
                    (this.$parent.notBefore !== '' &&
                        cellTime < new Date(this.$parent.notBefore).getTime()) ||
                    (this.$parent.notAfter !== '' &&
                        cellTime > new Date(this.$parent.notAfter).getTime())
                ) {
                    return 'disabled';
                }

                if (value === curValue) {
                    classes.push('cur-time');
                } else if (startTime) {
                    if (cellTime < startTime) {
                        classes.push('disabled');
                    }
                } else if (endTime) {
                    if (cellTime > endTime) {
                        classes.push('disabled');
                    }
                }
                return classes.join(' ');
            },

            showMonths() {
                if (this.currentPanel === 'months') {
                    this.currentPanel = 'date'
                } else {
                    this.currentPanel = 'months'
                }
            },

            showYears() {
                if (this.currentPanel === 'years') {
                    this.currentPanel = 'date';
                } else {
                    let firstYear = Math.floor(this.now.getFullYear() / 10) * 10;
                    let years = [];
                    for (let i = 0; i < 10; i++) {
                        years.push(firstYear + i)
                    }
                    this.years = years;
                    this.currentPanel = 'years';
                }
            },

            // 前进或后退一年
            changeYear(flag) {
                if (this.currentPanel === 'years') {
                    this.years = this.years.map(v => v + flag * 10);
                } else {
                    let now = new Date(this.now);
                    now.setFullYear(now.getFullYear() + flag, now.getMonth(), 1);
                    this.now = now;
                }
            },
            changeMonth(flag) {
                let now = new Date(this.now);
                now.setMonth(now.getMonth() + flag, 1);
                this.now = now;
            },

            selectDate(cell) {
                let classes = this.getDateClasses(cell);
                if (classes.indexOf('disable') !== -1) return;

                let date = new Date(cell.date);
                if (this.$parent.type === 'datetime') {
                    if (this.value instanceof Date) {
                        date.setHours(this.value.getHours(), this.value.getMinutes(), this.value.getSeconds());
                    }
                    if (this.startAt && date.getTime() < new Date(this.startAt).getTime()) {
                        date = new Date(this.startAt)
                    } else if (this.endAt && date.getTime() > new Date(this.endAt).getTime()) {
                        date = new Date(this.endAt);
                    }
                    // TODO: ?
                    this.currentPanel = 'time';
                    this.$nextTick(() => {
                        Array.prototype.forEach.call(
                            this.$el.querySelectorAll('.time-list-wrapper'),
                            (el) => {
                                this.scrollIntoView(el, el.querySelector('.cur-time'))
                            }
                        )
                    });
                }

                this.now = date;
                this.$emit('input', date);
                this.$emit('select');
            },
            selectYear(year) {
                let now = new Date(this.now);
                now.setFullYear(year);
                this.now = now;
                if (this.value) {
                    this.$emit('input', now);
                    this.emit('select', true);
                }
                this.currentPanel = 'months';
            },
            selectMonth(month) {
                let now = new Date(this.now);
                now.setMonth(month);
                this.now = now;
                if (this.value) {
                    this.$emit('input', now);
                    this.$emit('select', true);
                }
                this.currentPanel = 'date';
            },

            selectTime() {
                let classes = this.getTimeClasses(value, index);
                if (classes.indexOf('disabled') !== -1) {
                    return
                }
                let date = new Date(this.now);
                if (index === 0) {
                    date.setHours(value);
                } else if (index === 1) {
                    date.setMinutes(value);
                } else if (index === 2) {
                    date.setSeconds(value);
                }
                this.now = date;
                this.$emit('input', date);
                this.$emit('select');
            },
            pickTime(value) {
                const classes = this.getTimeClasses(value.hours * 60 + value.minutes, -1);
                if (classes.indexOf('disabled') !== -1) {
                    return
                }
                const date = new Date(this.now);
                date.setHours(value.hours, value.minutes, 0);
                this.now = date;
                this.$emit('input', date);
                this.$emit('select');
            },

        },

        computed: {
            // ?
            days() {
                let days = this.$parent.translation.days;
                let firstDay = +this.$parent.firstDayOfWeek;
                return days.concat(days).slice(firstDay, firstDay + 7);
            },

            timeType() {
                return /h+/.test(this.$parent.format)? '12' : '24';
            },

            timeSelectOptions() {
                let result = [];
                let options = this.$parent.timePickerOptions;
                if (!options) {
                    return [];
                }

                let start = parseTime(options.start),
                    end = parseTime(options.end),
                    step = parseTime(option.step);
                if (start && end && step) {
                    let startMinutes = start.minutes + start.hours * 60;
                    let endMinutes = end.minutes + end.hour * 60;
                    let stepMinutes = step.minutes + step.hour * 60;
                    let len = Math.floor((endMinutes - startMinutes) / stepMinutes);
                    for (let i = 0; i <= len; i++) {
                        let timeMinutes = startMinutes + i * stepMinutes;
                        let hours = Math.floor(timeMinutes / 60);
                        let minutes = timeMinutes % 60;
                        let value = {
                            hours,
                            minutes,
                        };
                        result.push({
                            value,
                            label: formatTime(value, this.timeType),
                        });
                    }
                }
                return result;
            },

            currentYear() {
                return this.now.getFullYear()
            },
            currentMonth() {
                return this.now.getMonth()
            },
            curHour() {
                return this.now.getHours()
            },
            curMinute() {
                return this.now.getMinutes()
            },
            curSecond() {
                return this.now.getSeconds()
            },
        },

        watch: {
            // TODO: 这里没理解，这种写法
            show(val) {
                if (val) {
                    this.currentPanel = 'date';
                    this.updateNow();
                }
            },
            value: {
                handler: 'updateNow',
                immediate: true,
            },
            now: 'updateCalendar',
        },

        filters: {
            timeText(value) {
                return ('00' + value).slice(String(value).length);
            }
        },
    }
</script>
