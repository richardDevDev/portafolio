/*!
 * Weblinker v2.0 - web serial lockers
 * @author danidoble
 * @year 2021
 * Copyright 2020-2022 Owl desarrollos
 * Copyright 2020-2022 Coin city mexico.
 */
"use strict"; //if you have problems with this you can comment it with -> //

/**
 * reload when finish an operation
 * this is an a preventive data set to true to allow soft reload and hard reload
 * @name ext_owl_lock1_reload_when_finished
 * @type {boolean}
 */
const ext_owl_lock1_reload_when_finished = true;
/**
 * Time to interval between sense check, default 500ms
 * @name ext_owl_lock1_time_interval_sense
 * @type {number}
 */
const ext_owl_lock1_time_interval_sense = 500;
/**
 * Time until page reload once sense result is obtained, default 2000ms
 * @name owl_time_to_reload
 * @type {number}
 */
const ext_owl_lock1_time_to_reload = 2e3;
/**
 * If reload is required once product is dispensed
 * @name ext_owl_lock1_reload_when_finish
 * @type {boolean}
 */
const ext_owl_lock1_reload_when_finish = true;
/**
 * If is true will shown a message in full screen if the serial device is not connected
 * @name owl_lock1_show_without_device
 * @type {boolean}
 */
//owl_lock1_show_without_device = true;
/**
 * Route or base64 URL of image to show if device is not detected
 * @name owl_image_not_device_detected
 * @type {string}
 */
//owl_image_not_device_detected = "";
/**
 * Code to display message in screen if device is not detected
 * @name owl_code_not_device_detected
 * @type {string}
 */
//owl_code_not_device_detected = '';
/**
 * Reset all variables to default value after a process that need reload
 * @name extOwlLock1SoftReload
 * @void
 */
function extOwlLock1SoftReload() {
    /**
     * Put here all variables you want clear after process that require "reload" of "soft reload" ends.
     *
     * The next variables can let commented but if you need change to put another default value do it here.
     */

    /**
     * time for receive answers
     * @type {number}
     */
    //owl_time_response_general=3e3;
    /**
     * Time to try reconnect
     * @type {number}
     */
    //owl_time_to_reconnect = 7e3;

    /**
     * Add your own variables here to reset to default value
     */

}


/**
 * Responses of the serial device, includes the complete description of what means
 * @name extOwlLock1SerialMessage
 * @void
 * @param f_obj json data
 */
function extOwlLock1SerialMessage(f_obj) {
    /**
     * f_obj = {
     *   code
     *   message
     *   description
     *   request
     *   no_code
     * }
     * */
    console.log(f_obj);
}

/**
 * Timeout response not received in time
 * @name extOwlLock1Timeout
 * @void
 */
function extOwlLock1Timeout() {
    console.error(owl_lock1_last_error);
}

/**
 * Show an a in progress reconnection message
 * @name extOwlLock1ReconnectionMessage
 * @void
 */
function extOwlLock1ReconnectionMessage() {
    console.log(__("Trying reconnect"));
}

/**
 * Show an error device not detected
 * @name extOwlLock1WithoutDevice
 * @void
 */
function extOwlLock1WithoutDevice() {
    if (owl_lock1_show_without_device) {
        let f_device = document.getElementById('owl_lock1_device_not_detected');
        f_device.style.display = '';
        document.querySelector('body').classList.add('owl-overflow-hidden');
    }
}

/**
 * Show the bytes sent by the user to the serial device
 * @name extOwlLock1SentBytes
 * @param bytes
 */
function extOwlLock1SentBytes(bytes) {
    console.log(bytes);
}

/**
 * Hide the error device not detected
 * @name extOwlLock1WithDevice
 * @void
 */
function extOwlLock1WithDevice() {
    if (owl_lock1_show_without_device) {
        let f_device = document.getElementById('owl_lock1_device_not_detected');
        f_device.style.display = 'none';
        document.querySelector('body').classList.remove('owl-overflow-hidden');
    }
}

/**
 * Messages of application, not device serial
 * @name extOwlLock1AppMessage
 * @void
 */
function extOwlLock1AppMessage(obj) {
    console.log(obj);
}

function extOwlLock1ConnectionLost(event) {
    extOwlLock1WithoutDevice();
}

/**
 * Show the last error occurred in execution time
 * @param error
 * @void
 */
function extOwlLock1Errors(error) {
    console.log(error,"error");
    if (error.toString().includes("Failed to execute 'requestPort' on 'Serial': Must be handling a user gesture to show a permission request")) {
        document.getElementById('btn-open-warning-modal-permission').click();
    } else if (error.toString().includes("The port is already open.")) {
        console.debug(error);
        beautyWarn(__("Failed to open serial port. Trying again."));
        extOwlLock1WithoutDevice();
        owlLock1Disconnect();
        setTimeout(() => {
            // try to connect
            //console.log(__lock1_port__cat)
            __lock1_port__cat+=1;
            serialOwlLock1Connect().then((e) => {
                //when finish the connection
                beautyLog(e);
            });
        }, 500);
        document.getElementById('btn-open-warning-modal-permission').click();
    }
    else if (error.toString().includes("Failed to execute 'open' on 'SerialPort': A call to open() is already in progress.")) {
        console.warn(__("Failed to execute 'open' on 'SerialPort': A call to open() is already in progress."))
    } else if (error.toString().includes("The port is closed.")) {
        alert("port of "+i+" machine is closed")
        document.getElementById('btn-open-warning-modal-permission').click();
    } else if (error.toString().includes("Select another port please")) {
        document.getElementById('btn-open-warning-modal-permission').click();
    }
    else if (error.toString().includes("No port selected by the user")) {
        document.getElementById('btn-open-warning-modal-permission').click();
    } else if (error.toString().includes("Cannot read property 'writable' of null")) {
        //window["extOwlJof"+i+"WithoutDevice"]()
        document.getElementById('btn-open-warning-modal-permission').click();
    } else if (error.toString().includes("The device has been lost")) {
        extOwlLock1WithoutDevice();
        //document.getElementById('btn-open-warning-modal-permission').click();
    } else if (error.toString().includes("Failed to open serial port")) {
        beautyWarn(__("Failed to open serial port. Trying again."));
        extOwlLock1WithoutDevice();
        owlLock1Disconnect();
        setTimeout(() => {
            // try to connect
            window["serialJof"+i+"OwlConnect"]().then((e) => {
                //when finish the connection
                beautyLog(e);
            });
        }, 500);
    } else if(error.toString().includes("navigator.serial is undefined")){
        document.getElementById("webserial_not_supported").classList.remove('hidden')
    } else {
        beautyError(error)
    }
    //you can show all errors in console or just let unhandled errors
    //beautyError(error)
}

window.onload = ()=>{
    owlLock1InitSerial();
}