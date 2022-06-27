/*!
 * Weblinker v2.0 - web serial
 * @author danidoble
 * @website https://github.com/danidoble
 * @year 2021
 * Copyright 2020-2022 Owl desarrollos
 * Copyright 2020-2022 Coin city mexico.
 */
'use strict';

/**
 * Store the port of serial device
 */
let owl_lock1_serial_port;
/**
 * Aux to detect if its connected
 * @type {boolean}
 * @private
 */
let _su_lock1_connected = false;
/**
 * Store a reader of serial
 */
let owl_lock1_serial_reader;
/**
 * Input (reader) Once the connection terminated
 */
let owl_lock1_serial_input_done;
/**
 * Output (writer) Once the connection terminated
 */
let owl_lock1_serial_output_done;
/**
 * Input (reader) Once the connection is established
 */
let owl_lock1_serial_input_stream;
/**
 * Output (writer) Once the connection is established
 */
let owl_lock1_serial_output_stream;
/**
 * Keep the reading until we want to break it
 * @type {boolean}
 */
let owl_lock1_serial_keep_reading = true;
/**
 * Save data incoming from serial device
 * @type {Uint8Array}
 */
let owl_lock1_serial_incoming = new Uint8Array(0);
/**
 * Min response length of bytes
 * @type {number}
 */
const owl_lock1_serial_min_response_length = 14;
/**
 * Constant connection bytes with device
 * @type {number[]}
 */
//02 06 00 03 03 1D F8 1B 03 F9
const owl_lock1_serial_bytes_connection = [0x02, 0x06, 0x00, 0x03, 0x03, 0x1D, 0xF8, 0x1B, 0x03, 0xF9];
/**
 * Filters for found device
 * @type {{usbProductId: number, usbVendorId: number}[]}
 */
const owl_lock1_serial_filters = [
    //{usbVendorId: 1027, usbProductId: 24577},//cable azul FTDI
    {usbVendorId: 1659, usbProductId: 8963},//cable negro doble //Prolific
];
let owl_lock1_serial_time_until_send_bytes = undefined;

/**
 * Configuration of port
 * @type {{baudRate: number, stopBits: number, parity: string, dataBits: number, flowControl: string, bufferSize: number}}
 */
const owl_lock1_serial_config_port ={
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: "none",
    bufferSize: 32768,
    flowControl: "none",
};
/**
 * element for put the log of received bytes
 * @type {HTMLElement}
 */
const owl_lock1_serial_el_log = document.getElementById('owl_lock1_serial_log_serial');
/**
 * btn element to listen click and connect to serial
 * @type {NodeListOf<Element>}
 */
let owl_lock1_serial_btn_connect_serial = document.querySelectorAll('.owl_lock1_serial_btn_connect_serial');
/**
 * Aux to select port 
 * @type {number}
 * @private
 */
let __lock1_port__cat = 0;
/**
 * When content of page is loaded start the magic
 */
/*
document.addEventListener('DOMContentLoaded', () => {
    // for every element that has the class add an listener to connect
    for (let i = 0; i < owl_lock1_serial_btn_connect_serial.length; i++) {
        owl_lock1_serial_btn_connect_serial[i].addEventListener('click', serialOwlLock1ClickConnect);
    }

    // element that contains an error unsupported navigator
    const owl_lock1_serial_navigator_not_supported = document.getElementById('owl_lock1_serial_navigator_not_supported');
    // Show or hide a banner of error, navigator is not supported
    owl_lock1_serial_navigator_not_supported.classList.toggle('hidden', 'serial' in navigator);

    // try to connect
    serialOwlLock1Connect().then(() => {
        //when finish the connection
    });
});
*/
/**
 * @name serialOwlLock1Connect
 * Opens a Web Serial connection to serial device and sets up the input and
 * output stream.
 */
async function serialOwlLock1Connect() {
    console.debug("Open port with",owl_lock1_serial_bytes_connection);
    try {
        // store an array of serial ports connected previously
        const filters = owl_lock1_serial_filters;
        let owl_lock1_serial_ports = await navigator.serial.getPorts({filters});
        // if has at least 1 previous connected serial devices
        if (owl_lock1_serial_ports.length > 0) {
            try {
                //await serialOwlLock1Disconnect();
                beautyLog("__________",__lock1_port__cat);
                if (__lock1_port__cat < owl_lock1_serial_ports.length) {
                    let mc = __lock1_port__cat;
                    //if(owl_lock1_serial_ports[mc] !== undefined)console.log(owl_lock1_serial_ports[mc])
                    let inf = owl_lock1_serial_ports[mc].getInfo();
                    if (
                        (inf.usbProductId === filters[0].usbProductId) &&
                        (inf.usbVendorId === filters[0].usbVendorId)
                    ) {
                        // Request a port and open a connection.
                        owl_lock1_serial_port = owl_lock1_serial_ports[mc];
                        //__lock1_port__cat+=1;
                    }
                } else {
                    __lock1_port__cat = 0;
                    try {
                        owl_lock1_serial_port = await navigator.serial.requestPort({filters});
                    } catch (err) {
                        owlLock1Errors(err);
                        return;
                    }
                }
                if (!owl_lock1_serial_port) {
                    throw new Error("Select another port please");
                }
            } catch (err) {
                owlLock1Errors(err);
                return;
            }

            // Request a port and open a connection.
            //owl_lock1_serial_port = owl_lock1_serial_ports[0];
        }
        else {
            // Request a port and open a connection of an a list of devices.
            try {
                owl_lock1_serial_port = await navigator.serial.requestPort({filters});
            } catch (err) {
                owlLock1Errors(err);
                return;
            }
        }
    }catch (error) {
        owlLock1Errors(error);
    }


    try {
        SerialOwlLock1ToggleUIConnected(true);
        // Wait for the port to open.
        await owl_lock1_serial_port.open(owl_lock1_serial_config_port);
        //beautyLog(owl_br_serial_port);
        owl_lock1_serial_port.ondisconnect = function (event) {
            owlLock1DeviceDisconnected(event)
        };
        owl_lock1_serial_port.onconnect = function (event) {
            owlLock1DeviceConnected(event)
        };

        owl_lock1_queue_commands = [];
        owl_lock1_timer_until_response = setTimeout(() => {
            owlLock1TimerNoResponse(owl_lock1_serial_bytes_connection, "connect_start");
        }, owl_lock1_time_response_connect_start);

        serialOwlLock1WriteToSerial(owl_lock1_serial_bytes_connection);

        await serialOwlLock1ReadSerialLoop();

    } catch (error) {
        owlLock1Errors(error);
    }
}

/**
 * @name serialOwlLock1Disconnect
 * Closes the Web Serial connection.
 */
async function serialOwlLock1Disconnect() {
    // Close the input stream (owl_lock1_serial_reader).
    if (owl_lock1_serial_reader) {
        await owl_lock1_serial_reader.cancel();
        //await owl_lock1_serial_input_done.catch(() => {});
        await owl_lock1_serial_input_done;
        owl_lock1_serial_reader = null;
        owl_lock1_serial_input_done = null;
    }

    // Close the output stream.
    if (owl_lock1_serial_output_stream) {
        await owl_lock1_serial_output_stream.getWriter().close();
        await owl_lock1_serial_output_done;
        owl_lock1_serial_output_stream = null;
        owl_lock1_serial_output_done = null;
    }

    // Close the port.
    //await owl_lock1_serial_port.close();
    owl_lock1_serial_port = null;

}

/**
 * @name serialOwlLock1ClickConnect
 * Click handler for the connect/disconnect button.
 */
async function serialOwlLock1ClickConnect() {
    // disconnect.
    if (owl_lock1_serial_port) {
        await serialOwlLock1Disconnect();
        SerialOwlLock1ToggleUIConnected(false);
        return;
    }

    // connect.
    await serialOwlLock1Connect();
}

/**
 * @name serialOwlLock1AppendBuffer
 * @param arraybuffer input of stream device
 * Resolves the breaking lines of bytes input stream
 */
function serialOwlLock1AppendBuffer(arraybuffer) {
    if (arraybuffer !== undefined) {
        let tmp = new Uint8Array(owl_lock1_serial_incoming.length + arraybuffer.byteLength);
        tmp.set(owl_lock1_serial_incoming, 0);
        tmp.set(new Uint8Array(arraybuffer), owl_lock1_serial_incoming.length);
        owl_lock1_serial_incoming = tmp;
    }
}

/**
 * @name  serialLockOwlAppendBuffer
 * @param arraybuffer input of stream device
 * Resolves the breaking lines of bytes input stream
 */
function serialLockOwlAppendBuffer(arraybuffer) {
    if (arraybuffer !== undefined) {
        let tmp = new Uint8Array(owl_lock1_serial_incoming.length + arraybuffer.byteLength);
        tmp.set(owl_lock1_serial_incoming, 0);
        tmp.set(new Uint8Array(arraybuffer), owl_lock1_serial_incoming.length);
        owl_lock1_serial_incoming = tmp;
    }
}

/**
 * @name serialOwlLock1ReadSerialLoop
 * Reads data from the input stream and send to function parser.
 */
async function serialOwlLock1ReadSerialLoop() {
    while (owl_lock1_serial_port.readable && owl_lock1_serial_keep_reading) {
        owl_lock1_serial_reader = owl_lock1_serial_port.readable.getReader();
        try {
            while (true) {
                const {value, done} = await owl_lock1_serial_reader.read();
                if (done) {
                    owl_lock1_serial_reader.releaseLock();
                    owl_lock1_serial_keep_reading = false;
                    break;
                }
                serialLockOwlAppendBuffer(value);
                if (owl_lock1_serial_time_until_send_bytes !== undefined) {
                    clearTimeout(owl_lock1_serial_time_until_send_bytes);
                    owl_lock1_serial_time_until_send_bytes = undefined;
                }
                owl_lock1_serial_time_until_send_bytes = setTimeout((e) => {
                    let final_hex = [];
                    for (let byte in owl_lock1_serial_incoming) {
                        final_hex.push(owl_lock1_serial_incoming[byte].toString(16));
                    }
                    if (owl_lock1_serial_incoming) {
                        owlLock1GetResponse(final_hex);
                    }
                    owl_lock1_serial_incoming = new Uint8Array(0);
                }, 400);

            }
        } catch (error) {
            owlLock1Errors(error);
        } finally {
            // Allow the serial port to be closed later.
            owl_lock1_serial_reader.releaseLock();
        }
    }
    owl_lock1_serial_keep_reading = true;
    await owl_lock1_serial_port.close();
}

/**
 * @name serialOwlLock1WriteToSerial
 * Gets a writer from the output stream and send the lines to the serial device
 * @param arr_bytes
 */
function serialOwlLock1WriteToSerial(arr_bytes) {
    try{
        const bytes = new Uint8Array(arr_bytes);
        const writer = owl_lock1_serial_port.writable.getWriter();
        writer.write(bytes).then((r) => {});
        writer.releaseLock();
    }catch(error){
        owlLock1Errors(error);
    }
}


function SerialOwlLock1ToggleUIConnected(connected) {
    _su_lock1_connected = connected;
    let lbl = __('Connect');
    if (connected) {
        document.getElementById('btn-choose-serial-modal').click();
        lbl = __('Disconnect');
    }
    for (let i = 0; i < owl_lock1_serial_btn_connect_serial.length; i++) {
        owl_lock1_serial_btn_connect_serial[i].textContent = lbl;
    }
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


