<style lang="scss" scoped>

</style>

<template>
    <div class="calendar">
        <div class="header" v-if="currentPage === 'time'">
            <a @click="currentPanel = 'date'">{{ now.toLocalDateString() }}</a>
        </div>
        <div class="header" v-else>
            <a class="prev-icon" @click="changeYear(-1)">&laquo;</a>
            <a class="prev-icon" v-show="currentPanel === 'date'" @click="changeMonth(-1)">&lsaquo;</a>
            <a class="next-icon" @click="changeYear(1)">&raquo;</a>
            <a class="next-icon" v-show="currentPage === 'date'" @click="changeMonth(1)">&rsaquo;</a>
            <a class="currnet-month" @click="showMonths">{{ months[currnetMonth] }}</a>
            <a class="currnet-year" @click="showYears">{{ currentYear }}</a>
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
                        <td v-for="cell in row" :title="ccell.title" :class="getDateClasses(cell)" @click="selectDate(cell)">{{ cell.day }}</td>
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
                    :style="{ width: 100 / time.length + '%' }"
                    v-for="(item, index) in times"
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
                            {{ num || timeText} }
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

        // TODO: propTypes
        props: {
            startAt: null,
            endAt: null,
            value: null,
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
                months: '',
                dates: [], // 日历面板
                years: [], // 年份面板
                now: new Date(),
                currentPanel: 'date',
                times: times,
            };
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

            timeselectOptions() {
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

        },
    }
</script>
