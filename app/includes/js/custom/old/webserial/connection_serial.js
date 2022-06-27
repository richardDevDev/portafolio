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
let owl_serial_port;
/**
 * Store a reader of serial
 */
let owl_serial_reader;
/**
 * Input (reader) Once the connection terminated
 */
let owl_serial_input_done;
/**
 * Output (writer) Once the connection terminated
 */
let owl_serial_output_done;
/**
 * Input (reader) Once the connection is established
 */
let owl_serial_input_stream;
/**
 * Output (writer) Once the connection is established
 */
let owl_serial_output_stream;
/**
 * Keep the reading until we want to break it
 * @type {boolean}
 */
let owl_serial_keep_reading = true;
/**
 * Save data incoming from serial device
 * @type {Uint8Array}
 */
let owl_serial_incoming = new Uint8Array(0);
/**
 * Min response length of bytes
 * @type {number}
 */
const owl_serial_min_response_length = 14;
/**
 * Constant connection bytes with device
 * @type {number[]}
 */
const owl_serial_bytes_connection = [0xF1, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF2, 0xF8];
/**
 * Filters for found device
 * @type {{usbProductId: number, usbVendorId: number}[]}
 */
const owl_serial_filters = [
    {usbVendorId: 1027, usbProductId: 24577},
];
/**
 * Configuration of port
 * @type {{baudRate: number, stopBits: number, parity: string, dataBits: number, flowControl: string, bufferSize: number}}
 */
const owl_serial_config_port ={
    baudRate: 115200,
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
const owl_serial_el_log = document.getElementById('owl_serial_log_serial');
/**
 * btn element to listen click and connect to serial
 * @type {NodeListOf<Element>}
 */
let owl_serial_btn_connect_serial = document.querySelectorAll('.owl_serial_btn_connect_serial');

/**
 * When content of page is loaded start the magic
 */
/*
document.addEventListener('DOMContentLoaded', () => {
    // for every element that has the class add an listener to connect
    for (let i = 0; i < owl_serial_btn_connect_serial.length; i++) {
        owl_serial_btn_connect_serial[i].addEventListener('click', serialOwlClickConnect);
    }

    // element that contains an error unsupported navigator
    const owl_serial_navigator_not_supported = document.getElementById('owl_serial_navigator_not_supported');
    // Show or hide a banner of error, navigator is not supported
    owl_serial_navigator_not_supported.classList.toggle('hidden', 'serial' in navigator);

    // try to connect
    serialOwlConnect().then(() => {
        //when finish the connection
    });
});
*/
/**
 * @name serialOwlConnect
 * Opens a Web Serial connection to serial device and sets up the input and
 * output stream.
 */
async function serialOwlConnect() {
    // store an array of serial ports connected previously
    const filters = owl_serial_filters;
    let owl_serial_ports = await navigator.serial.getPorts({filters});
    // if has at least 1 previous connected serial devices
    if (owl_serial_ports.length > 0) {
        // Request a port and open a connection.
        owl_serial_port = owl_serial_ports[0];
    } else {
        // Request a port and open a connection of an a list of devices.
        try{
            owl_serial_port = await navigator.serial.requestPort({filters});
        }catch(err){
            owlErrors(err);
            return;
        }
    }

    try{
        SerialOwlToggleUIConnected(true);

        // Wait for the port to open.
        await owl_serial_port.open(owl_serial_config_port);

        serialOwlWriteToSerial(owl_serial_bytes_connection);
        await serialOwlReadSerialLoop();
    }
    catch(error){
        owlErrors(error);
    }
}

/**
 * @name serialOwlDisconnect
 * Closes the Web Serial connection.
 */
async function serialOwlDisconnect() {
    // Close the input stream (owl_serial_reader).
    if (owl_serial_reader) {
        await owl_serial_reader.cancel();
        //await owl_serial_input_done.catch(() => {});
        await owl_serial_input_done;
        owl_serial_reader = null;
        owl_serial_input_done = null;
    }

    // Close the output stream.
    if (owl_serial_output_stream) {
        await owl_serial_output_stream.getWriter().close();
        await owl_serial_output_done;
        owl_serial_output_stream = null;
        owl_serial_output_done = null;
    }

    // Close the port.
    //await owl_serial_port.close();
    owl_serial_port = null;

}

/**
 * @name serialOwlClickConnect
 * Click handler for the connect/disconnect button.
 */
async function serialOwlClickConnect() {
    // disconnect.
    if (owl_serial_port) {
        await serialOwlDisconnect();
        SerialOwlToggleUIConnected(false);
        return;
    }

    // connect.
    await serialOwlConnect();
}

/**
 * @name serialOwlAppendBuffer
 * @param arraybuffer input of stream device
 * Resolves the breaking lines of bytes input stream
 */
function serialOwlAppendBuffer(arraybuffer) {
    if (arraybuffer !== undefined) {
        let tmp = new Uint8Array(owl_serial_incoming.length + arraybuffer.byteLength);
        tmp.set(owl_serial_incoming, 0);
        tmp.set(new Uint8Array(arraybuffer), owl_serial_incoming.length);
        owl_serial_incoming = tmp;
    }
}

/**
 * @name serialOwlReadSerialLoop
 * Reads data from the input stream and send to function parser.
 */
async function serialOwlReadSerialLoop() {
    while (owl_serial_port.readable && owl_serial_keep_reading) {
        owl_serial_reader = owl_serial_port.readable.getReader();
        try {
            while (true) {
                const {value, done} = await owl_serial_reader.read();
                if (done) {
                    owl_serial_reader.releaseLock();
                    owl_serial_keep_reading = false;
                    break;
                }
                serialOwlAppendBuffer(value);
                if (owl_serial_incoming.length === owl_serial_min_response_length) {
                    let final_hex = [];
                    for (let byte in owl_serial_incoming) {
                        final_hex.push(owl_serial_incoming[byte].toString(16));
                    }
                    if (owl_serial_incoming) {
                        owlGetResponse(final_hex);

                    }
                    owl_serial_incoming = new Uint8Array(0);
                } else if (owl_serial_incoming.length < owl_serial_min_response_length) {
                    setTimeout(function () {
                        // timeout
                    }, 1000);
                } else if (owl_serial_incoming.length > owl_serial_min_response_length) {
                    /**
                     * @description divide to send twice if needed
                     * First owl_serial_min_response_length
                     */
                    let owl_serial_superior_incoming = [];
                    for (let jk = 0; jk < owl_serial_min_response_length; jk++) {
                        owl_serial_superior_incoming[jk] = owl_serial_incoming[jk];
                    }
                    if (owl_serial_superior_incoming.length === owl_serial_min_response_length) {
                        let final_hex = [];
                        for (let byte in owl_serial_superior_incoming) {
                            final_hex.push(owl_serial_superior_incoming[byte].toString(16));
                        }
                        if (owl_serial_superior_incoming) {
                            owlGetResponse(final_hex);

                        }
                    }
                    owl_serial_superior_incoming = undefined;
                    owl_serial_superior_incoming = [];
                    /**
                     * @description owl_serial_min_response_length to forward until (owl_serial_min_response_length*2)
                     * @description owl_serial_min_response_length = 0
                     */
                    let aux_owl_serial_incoming = 9999;
                    if (owl_serial_incoming.length === (owl_serial_min_response_length * 2)) {
                        for (let jk = 14; jk < (owl_serial_min_response_length * 2); jk++) {
                            owl_serial_superior_incoming[(jk - owl_serial_min_response_length)] = owl_serial_incoming[jk];
                        }
                    }
                    /**
                     * @description if equals to owl_serial_min_response_length
                     * */
                    if (owl_serial_superior_incoming.length === owl_serial_min_response_length) {
                        let final_hex = [];
                        for (let byte in owl_serial_superior_incoming) {
                            final_hex.push(owl_serial_superior_incoming[byte].toString(16));
                        }

                        if (owl_serial_superior_incoming) {
                            owlGetResponse(final_hex);
                        }
                    }

                    owl_serial_superior_incoming = undefined;
                    owl_serial_superior_incoming = [];
                    owl_serial_incoming = new Uint8Array(0);
                    if (owl_serial_incoming.length === (owl_serial_min_response_length * 2)) {
                        /**
                         * @description reset the variable aux of solution to string divided
                         * */
                        owl_serial_incoming = new Uint8Array(0);

                    }
                    /**
                     * @description if is less than owl_serial_min_response_length
                     * */
                    if (aux_owl_serial_incoming !== 9999) {
                        //console.warn("The data dont makes 2 completes completes");
                        addLog("warn","The data dont makes 2 completes completes");
                        owl_serial_incoming = new Uint8Array(0);

                    }
                }

            }
        } catch (error) {
            owlErrors(error);
        } finally {
            // Allow the serial port to be closed later.
            owl_serial_reader.releaseLock();
        }
    }
    owl_serial_keep_reading = true;
    await owl_serial_port.close();
}

/**
 * @name serialOwlWriteToSerial
 * Gets a writer from the output stream and send the lines to the serial device
 * @param arr_bytes
 */
function serialOwlWriteToSerial(arr_bytes) {
    try{
        const bytes = new Uint8Array(arr_bytes);
        const writer = owl_serial_port.writable.getWriter();
        writer.write(bytes).then((r) => {});
        writer.releaseLock();
    }catch(error){
        owlErrors(error);
    }
}


function SerialOwlToggleUIConnected(connected) {
    let lbl = __('Connect');
    if (connected) {
        document.getElementById('btn-choose-serial-modal').click();
        lbl = __('Disconnect');
    }
    for (let i = 0; i < owl_serial_btn_connect_serial.length; i++) {
        owl_serial_btn_connect_serial[i].textContent = lbl;
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


