let logger_navigator = [];
function addLog(type = "log",...data){
    let date = new Date();
    let unix_time = date.getTime();//unix
    let day = hexMaker(date.getDate());//day
    let year = date.getFullYear();//year
    let month = hexMaker(date.getMonth()+1);

    let hours = hexMaker(date.getHours());
    let minutes = hexMaker(date.getMinutes());
    let seconds = hexMaker(date.getSeconds());
    let miliseconds = date.getMilliseconds();

    if(data.length === 1){
        data = data[0];
    }

    data = _cmakeLog_(type,data);

    let host = new URL(window.location);

    let time_obj = {
        unix:unix_time,
        date:year+"-"+month+"-"+day,
        time:hours+":"+minutes+":"+seconds+"."+miliseconds,
        uri: host.href
    };

    let obj = {
        object:data,
        date:time_obj,
    };

    logger_navigator.push(obj);

    if(logger_navigator.length >= 100){
        sendLog('saveLogDay',JSON.stringify(logger_navigator),JSON.stringify(time_obj));
        console.clear();
        logger_navigator = [];
    }

    switch(type){
        case "debug":
            console.debug(data.console);
            break;
        case "warn":
            console.warn(data.console);
            break;
        case "error":
            console.error(data.console);
            break;
        case "log":
        default:
            console.log(data.console);
            break;
    }
}

function sendLog(handler,data,time){
    let form = new FormData();
    form.append('handler',handler);
    form.append('json',data);
    form.append('time',time);
    $.ajax({
        url: BASE_URL + '/app/handlers/ajax.handler.class.php',
        type: 'POST',
        dataType: "html",
        data: form,
        processData: false,
        contentType: false,
        cache: false,
        beforeSend: function () {

        },
        error: function () {

        }
        ,
        success: function (response) {

        }
    });
}


/**
 * Style hex data to make uniform and pretty
 * @name hexMaker
 * @param val hexadecimal number
 * @param min length required of string
 * @returns {string}
 */
function hexMaker(val, min = 2) {
    let missing = (min - (val.toString().length));
    if (missing > 0) {
        for (let i = 0; i < missing; i++) {
            val = "0" + val;
        }
    }
    return val;
}

/**
 * Make an error to see all trace of log, warn, error, and debug. This will be shown in debug or verbose option
 * console
 * ```
 * let data = 'your information to show in console debug'
 * let result = dd._cmakeLog_('log', data);
 * //result: {
 * //    "__trace__": [
 * //        "log: \"your information to show in console debug\"",
 * //        "at _cmakeLog_ (https://localhost/webserial/dd/gf.js:73:21)",
 * //        "at <anonymous>:2:17"
 * //    ],
 * //    "info": "your information to show in console debug"
 * //}
 * ```
 * @author danidoble <Daniel Sandoval>
 * @function
 * @param {string} type type of log (Log, Warn, Debug, Error, Your own custom name)
 * @param {array|string} data your data to show (object, array, string, number, etc.)
 * @returns {object}
 */
function _cmakeLog_(type, data) {
    let r = null;
    let error = new Error();
    try {
        error.name = type.toLowerCase();
        error.message = data;
    } catch (e) {
        r = e;
    } finally {
        if (r === null) {
            r = error;
        }
        console.debug("_trace_real_", type + ": ", data, r);
    }
    return {
        type: type,
        console: data,
        __trace__: (r.stack.toString()).split("\n    ")
    };
}

//Save log before reload or go of page
window.onbeforeunload = function(){
    let date = new Date();
    let unix_time = date.getTime();//unix
    let day = hexMaker(date.getDate());//day
    let year = date.getFullYear();//year
    let month = hexMaker(date.getMonth()+1);

    let hours = hexMaker(date.getHours());
    let minutes = hexMaker(date.getMinutes());
    let seconds = hexMaker(date.getSeconds());
    let miliseconds = date.getMilliseconds();

    let host = new URL(window.location);

    let time_obj = {
        unix:unix_time,
        date:year+"-"+month+"-"+day,
        time:hours+":"+minutes+":"+seconds+"."+miliseconds,
        uri: host.href
    };


    sendLog('saveLogDay',JSON.stringify(logger_navigator),JSON.stringify(time_obj));
    console.clear();
    logger_navigator = [];

};


window.errorextension = false;
function dontCry(e){
    if(e.toString().includes('Attempting to use a disconnected port object')){
        addLog('error',{"error":"Una extensión no esta cargada y se está intentando mandar información a ella.","message":"Extensión no cargada, revisa que todas las extensiones esten correctamente instaladas y recarga la página. Error irreparable, la aplicación no cargará.","jquery":e});
        //alert("Una extensión no esta cargada y se está intentando mandar información a ella.");


        window.errorextension = true;
    }else{
        addLog('error',e)
    }
}