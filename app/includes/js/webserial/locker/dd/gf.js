/**
 * This function translate the content put inside of key
 * @author danidoble <Daniel Sandoval>
 * @name __
 * @param key string in some language to translate to other language
 * @function
 * @return {string|*}
 */
function __(key = "") {
    return (typeof dd_lang === "undefined" || !dd_lang[key]) ? key : dd_lang[key];
}

/**
 * Make format of numbers
 * @param decimals
 * @param every_thousands_sep
 * @param thousands_sep
 * @param dec_point
 * @returns {string}
 */
Number.prototype.format = function (decimals, every_thousands_sep, thousands_sep, dec_point) {
    let re = '\\d(?=(\\d{' + (every_thousands_sep || 3) + '})+' + (decimals > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~decimals));
    return (dec_point ? num.replace('.', dec_point) : num).replace(new RegExp(re, 'g'), '$&' + (thousands_sep || ','));
};

/**
 * Parse decimal to hexadecimal
 * @param val
 * @returns {string}
 */
function DecToHex(val) {
    return parseInt(val).toString(16).toUpperCase();
}

/**
 * Parse hexadecimal value to decimal
 * @param val
 * @returns {number}
 */
function HexToDec(val) {
    return parseInt(val, 16);
}

/**
 * Adds 0x before each value in array
 * Example 00 => 0x00
 * @param bytes
 * @returns {[]}
 */
function Add0x(bytes) {
    let new_bytes = [];
    bytes.forEach((value, index) => {
        new_bytes[index] = "0x" + value;
    });
    return new_bytes;
}

/**
 * Style hex data to make uniform and pretty
 * @name owlBRHexMaker
 * @param val hexadecimal number
 * @param min length required of string
 * @returns {string}
 */
function HexMaker(val, min = 2) {
    let missing = (min - (val.toString().length));
    if (missing > 0) {
        for (let i = 0; i < missing; i++) {
            val = "0" + val;
        }
    }
    return val;
}

/**
 * Parse an array of hex values to an array of dec values
 * @param arr
 * @returns {[]}
 */
function ArrDecToHex(arr) {
    let arr_new = [];
    arr.forEach((value, index) => {
        arr_new[index] = DecToHex(value);
    });
    return arr_new;
}


/**
 * Parse an array of dec values to an array of hex values
 * @param arr
 * @returns {[]}
 */
function ArrHexToDec(arr) {
    let arr_new = [];
    arr.forEach((value, index) => {
        arr_new[index] = DecToHex(value);
    });
    return arr_new;
}

function SumHex(arr) {
    //arr[1]+arr[2]+arr[3]+arr[4]+arr[5]+arr[6]+arr[7]+arr[8]+arr[9]+arr[10]...
    let sum = 0;
    arr.forEach((value) => {
        sum += parseInt(value, 16);
    });
    return sum.toString(16);
}

function owlBoardroidSumHex(arr) {
    let sum = 0;
    arr.forEach((value, index) => {
        if (index !== 0 && index !== 11) {
            sum += parseInt(value, 16);
        }
    });
    return sum.toString(16).toUpperCase();
}

function ddJofemarCalcCheckSums(val) {
    val = Add0x([DecToHex(parseInt(val))]);
    let f_ck = [];
    f_ck.push((((val & 0xFF) | 0xF0).toString(16)).toUpperCase());
    f_ck.push((((val & 0xFF) | 0x0F).toString(16)).toUpperCase());
    return f_ck;
}

if (typeof swal === "undefined") {
    window.swal = function () {
        alert(__("Install sweetalert to see correctly the messages"));
    }
}

function _cmakeLog_(type, ...data) {
    let r;
    data = data[0];

    try {
        let error = new Error();
        error.name = __(type.toLowerCase());
        error.message = JSON.stringify(data);
        throw error;
    } catch (e) {
        r = e;
    } finally {
        console.debug(type + ": ", data , r);
    }
    return {__trace__:(r.stack.toString()).split("\n    "),"info":data};
}

function beautyLog(...data) {
    console.log(_cmakeLog_('log', data));
}

function beautyError(...data) {
    let ori = data;
    let name = null;
    if (typeof data[0] !== "undefined") {
        name = data[0];
        delete data[0];
    }
    console.error(_cmakeLog_('error', name, data),ori);
}

function beautyDebug(...data) {
    let ori = data;
    let name = null;
    if (typeof data[0] !== "undefined") {
        name = data[0];
        delete data[0];
    }
    console.debug(_cmakeLog_('debug', name, data),ori);
}

function beautyWarn(...data) {
    let ori = data;
    let name = null;
    if (typeof data[0] !== "undefined") {
        name = data[0];
        delete data[0];
    }
    console.warn(_cmakeLog_('warn', name, data),ori);
}

// Function to set the constant of connection of every machine
function setBoardroidConnectionConstant(machine = 1) {
    let arr = ["F1", "06", "00", "00", "00", "00", "00", "00", "00", "00", "F2", "F8"];
    arr[1] = HexMaker(DecToHex(5 + machine));
    arr[11] = owlBoardroidSumHex(arr);
    return Add0x(arr);
}

// Function to set the constant of connection of every machine
function setJofemarConnectionConstant(machine = 1) {
    let arr = ['02', '30', '30', (128 + machine).toString(16), '53', 'FF', 'FF'];

    let bytes = [];
    arr.forEach((val) => {
        bytes.push(HexMaker(val));
    });

    let f_dec = HexToDec(SumHex(bytes));
    let f_ck = ddJofemarCalcCheckSums(f_dec);
    for (let j = 0; j < 2; j++) {
        bytes.push(f_ck[j]);
    }
    bytes.push('03');
    bytes = Add0x(bytes);

    return bytes;
}