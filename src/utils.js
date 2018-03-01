
let hadClass = (element, className) => {
    className = className || '';
    if (className.replace(/\s/g, '').length === 0) return false;
    return new RegExp(' ' + className + ' ').test(' ' + element.className + ' ');
};

let addClass = (element, className) => {
    if (!hadClass(element, className)) {
        element.className = element.className === ''? className : element.className + ' ' + className;
    }
};

let removeClass = (element, className) => {
    if (hadClass(element, className)) {
        let newClass = ' ' + element.className.replace(/[\t\r\n]/g, '') + ' ';
        while (newClass.indexOf(' ' + className + ' ') >= 0) {
            newClass = newClass.replace(' ' + className + ' ', ' ');
        }

        element.className = newClass.replace(/^\s+|\s+$/g, '');
    }
};

// 只执行一次的绑定事件处理函数
let once = (dom, event, callback) => {
    let handle = () => {
        callback();
        dom.removeEventListener(event, handle);
    };

    dom.addEventListener(event, handle);
};

export { addClass, removeClass, once };
