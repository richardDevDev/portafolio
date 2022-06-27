/*!

  * Weblinker - Jofemar

  * Author Daniel Sandoval aka danidoble (https://github.com/danidoble)

  * Copyright 2011-2021 OWL Desarrollos, Coin City México

  * This file is property of OWL Desarrollos and Coin City México No redistribute

  */



'use strict'; //if this makes errors with your application comment it with -> //



/**

 * This file contains communication with the Chrome extension so it would be a good idea

 * -------------------------------

 * --- DO NOT MODIFY THIS FILE --- so that the changes can be replicated in other projects without the need

 * -------------------------------

 * starting from 0

 *

 * RECOMMENDATIONS:

 * - Use the additional file to make the changes

 * - If there is an error in this file please report it to the developer @author or the company for correction.

 * - Do not change the app ID

 * - Do not delete comments

 */



// chrome app id

let ccv_slave_jofemar_id_app = "iccdaggpmmepkpfpgjckkehfdkngkdgd";

// Show errors, logs, warns, debug in console?

const ccv_slave_jofemar_console_active = true;

// A maximum amount must be given for the nayax credit

let ccv_slave_jofemar_nayax_max_pre_credit = 0;

// if the connection is lost, the reconnection interval starts

let ccv_slave_jofemar_interval = undefined;

// time for responses to arrive

let ccv_slave_jofemar_time_response = 3000;

// time for the responses of the motors, if it is by sensor they should be approx 15sec

let ccv_slave_jofemar_time_response_engines = 15000;

// time for reconnection

let ccv_slave_jofemar_time_reconnect = 7000;

// interval for product sensing

let ccv_slave_jofemar_waiting_for_sense = undefined;

// Dispense status

let ccv_slave_jofemar_status_dispensing = undefined;

// generate the connection with the application (open a port)

let ccv_slave_jofemar_port_app = chrome.runtime.connect(ccv_slave_jofemar_id_app, {name: 'jofemar'});

// stores the change to return

let ccv_slave_jofemar_exchange = 0;

// stores the amount of money inserted per session

let ccv_slave_jofemar_amount_inserted = 0;

// stores the price of the product being purchased

let ccv_slave_jofemar_price = undefined;

// stores the timeout to perform an operation in case the response does not return in given time

let ccv_slave_jofemar_timer_to_response = undefined;

// store the arr hex code in connection

let ccv_slave_jofemar_code_connection_expected = ["0x02", "0x30", "0x30", "0x82", "0x56", "0xFF", "0xFF", "0xF8", "0x3F", "0x03"];

// store number of engine (dec 110 - 180 esplus)
let ccv_slave_jofemar_test_engine_number = undefined;

// Stores the last recorded error

let ccv_slave_jofemar_last_error = {

    "message": null,

    "handler": null,

    "code": null,

    "no_code": 666,

};

// Array of inserted coins, differentiating where it was sent (box / tubes)

let ccv_slave_jofemar_arr_coins = {

    "tubes": {

        "G50": 0,

        "C50": 0,

        "P1": 0,

        "P2": 0,

        "P5": 0,

        "P10": 0

    },

    "box": {

        "G50": 0,

        "C50": 0,

        "P1": 0,

        "P2": 0,

        "P5": 0,

        "P10": 0

    },

    "G50": 0,

    "C50": 0,

    "P1": 0,

    "P2": 0,

    "P5": 0,

    "P10": 0,

    "total": 0,

};

// Array of inserted bills, differentiating where it is sent (stacker / recycler)

let ccv_slave_jofemar_arr_bills = {

    "stacker": {

        "P20": 0,

        "P50": 0,

        "P100": 0,

        "P200": 0,

        "P500": 0,

        "P1000": 0,

    },

    "recycler": {

        "P20": 0,

        "P50": 0,

        "P100": 0,

        "P200": 0,

        "P500": 0,

        "P1000": 0,

    },

    "P20": 0,

    "P50": 0,

    "P100": 0,

    "P200": 0,

    "P500": 0,

    "P1000": 0,

    "total": 0,

}



// array of bills in the stacker, to fill it the corresponding function must be executed

let ccv_slave_jofemar_arr_bills_stacker = {

    "P20": 0, "P50": 0, "P100": 0, "P200": 0, "P500": 0, "P1000": 0,

}

// array of coins in the tubes, to fill it the corresponding function must be executed

let ccv_slave_jofemar_arr_coins_tubes = {

    "C50": 0, "G50": 0, "P1": 0, "P2": 0, "P5": 0, "P10": 0

};

// store temperature readings

let ccv_slave_jofemar_temperature_log_arr = [];

// scrow enable or disable, by default disable

let ccv_slave_jofemar_scrow = "00";



// helps to know if the system is in CONTROL, to do functions only for this place

let ccv_slave_jofemar_control = false;



// just to identify the active page

let ccv_slave_jofemar_control_page = undefined;



// if it is true, a full screen message will be displayed if the device is not connected

let ccv_slave_jofemar_show_no_device = true;



// auxiliary variable for process iteration

let ccv_slave_jofemar_aux_iteration = undefined;



// Route where is the image to be shown if the device is not detected

//let ccv_slave_jofemar_cod_img_no_detected = "/app/includes/images/linkers/machine_disconnected.gif";
//let ccv_slave_jofemar_cod_img_door_open = "/app/includes/images/linkers/machine_door_open.png";
//let ccv_slave_jofemar_cod_img_door_closed = "/app/includes/images/linkers/machine_ok.png";



// time for the interval between the sensing check, default 500ms

let ccv_slave_jofemar_sense_interval = 500;



// time to reload the page once the sensing result is obtained, default 2000ms

let ccv_slave_jofemar_time_to_reload = 2000;



// if it is required to reload the page once the product is delivered, change to true

let cvv_slave_jofemar_reload_when_finish = false;



// code to insert below all the html code once the page is loaded
/*
let ccv_slave_jofemar_code_device = '' +

    '<div id="ccv_slave_jofemar_device_not_detected" class="ccv_jofemar_device_not_detected" style="display: none">' +

    '<img src="' + ccv_jofemar_cod_img_no_detected + '" alt="' + ccv_jofemar_lang.extension.display.device_disconnected + '" ' +

    'class="ccv-jofemar-w-100 ccv-jofemar-p-4 ccv-jofemar-max-h-80vh"><div style="font-size:2rem;color:#fff">Máquina 2 no conectada</div>' +

    '<a href="' + location.toString() + '" class="ccv-jofemar-btn ccv-jofemar-btn-link ccv-jofemar-fixed-bottom">'

    + ccv_jofemar_lang.extension.display.reload + '</a></div>';
    */


    let ccv_slave_jofemar_channel_start_verification = 110;
let ccv_slave_jofemar_channel_stop_verification = 239;
    let ccv_slave_jofemar_channel_start_verification_original = 110;
let ccv_slave_jofemar_channel_stop_verification_original = 239;

/******************************************************/

/* CONSTANTS OF THE VARIABLES STORE A STATIC VALUE TO */

/* RESTORE THE VARIABLES AND NOT HAVE TO RELOAD THE   */

/* COMPLETE PAGE                                      */

/******************************************************/



const ccv_slave_jofemar_interval_original = undefined;

const ccv_slave_jofemar_waiting_for_sense_original = undefined;

const ccv_slave_jofemar_price_original = undefined;

const ccv_slave_jofemar_timer_to_response_original = undefined;

const ccv_slave_jofemar_code_connection_expected_original = ["0x02", "0x30", "0x30", "0x81", "0x56", "0xFF", "0xFF", "0xF7", "0x3F", "0x03"];

const ccv_slave_jofemar_status_dispensing_original = undefined;

const ccv_slave_jofemar_exchange_original = 0;

const ccv_slave_jofemar_amount_inserted_original = 0;

const ccv_slave_jofemar_aux_iteration_original = 10;

const ccv_slave_jofemar_time_response_original = 3000;

const ccv_slave_jofemar_time_response_engines_original = 15000;

const ccv_slave_jofemar_time_reconnect_original = 7000;

const ccv_slave_jofemar_temperature_log_arr_original = []; // is an empty array

const ccv_slave_jofemar_last_error_original = {"message": null, "handler": null, "code": null, "no_code": 666,};

const ccv_slave_jofemar_arr_coins_original = {

    "tubes": {"G50": 0, "C50": 0, "P1": 0, "P2": 0, "P5": 0, "P10": 0},

    "box": {"G50": 0, "C50": 0, "P1": 0, "P2": 0, "P5": 0, "P10": 0},

    "G50": 0,

    "C50": 0,

    "P1": 0,

    "P2": 0,

    "P5": 0,

    "P10": 0,

    "total": 0,

};

const ccv_slave_jofemar_arr_bills_original = {

    "stacker": {"P20": 0, "P50": 0, "P100": 0, "P200": 0, "P500": 0, "P1000": 0,},

    "recycler": {"P20": 0, "P50": 0, "P100": 0, "P200": 0, "P500": 0, "P1000": 0,},

    "P20": 0,

    "P50": 0,

    "P100": 0,

    "P200": 0,

    "P500": 0,

    "P1000": 0,

    "total": 0,

}

const ccv_slave_jofemar_arr_bills_stacker_original = {"P20": 0, "P50": 0, "P100": 0, "P200": 0, "P500": 0, "P1000": 0,}

const ccv_slave_jofemar_arr_coins_tubes_original = {"C50": 0, "G50": 0, "P1": 0, "P2": 0, "P5": 0, "P10": 0};



/**

 * Restores the variables to their initial state, it is useful to avoid having to reload the page and also

 * to avoid errors in the application

 * @return void

 */

function ccvSlaveJofemarSoftReload() {

    // THE VARIABLES ARE EMPTYED SO THAT ERRORS ARE NOT GENERATED.

    // IT IS ASSIGNED THE DEFAULT VALUE THAT IS SAVED IN CONSTANTS WITH THE SAME NAME + "_original"

    ccv_slave_jofemar_interval = ccv_slave_jofemar_interval_original;

    ccv_slave_jofemar_waiting_for_sense = ccv_slave_jofemar_waiting_for_sense_original;

    ccv_slave_jofemar_price = ccv_slave_jofemar_price_original;

    ccv_slave_jofemar_timer_to_response = ccv_slave_jofemar_timer_to_response_original;

    ccv_slave_jofemar_code_connection_expected = ccv_slave_jofemar_code_connection_expected_original;

    ccv_slave_jofemar_status_dispensing = ccv_slave_jofemar_status_dispensing_original;

    ccv_slave_jofemar_exchange = ccv_slave_jofemar_exchange_original;

    ccv_slave_jofemar_amount_inserted = ccv_slave_jofemar_amount_inserted_original;

    ccv_slave_jofemar_aux_iteration = ccv_slave_jofemar_aux_iteration_original;

    ccv_slave_jofemar_time_response = ccv_slave_jofemar_time_response_original;

    ccv_slave_jofemar_time_reconnect = ccv_slave_jofemar_time_reconnect_original;

    ccv_slave_jofemar_temperature_log_arr = ccv_slave_jofemar_temperature_log_arr_original;

    ccv_slave_jofemar_last_error = ccv_slave_jofemar_last_error_original;

    ccv_slave_jofemar_arr_coins = ccv_slave_jofemar_arr_coins_original;

    ccv_slave_jofemar_arr_bills = ccv_slave_jofemar_arr_bills_original;

    ccv_slave_jofemar_arr_bills_stacker = ccv_slave_jofemar_arr_bills_stacker_original;

    ccv_slave_jofemar_arr_coins_tubes = ccv_slave_jofemar_arr_coins_tubes_original;

    ccv_slave_jofemar_time_response_engines = ccv_slave_jofemar_time_response_engines_original;

    ccv_slave_jofemar_channel_start_verification = ccv_slave_jofemar_channel_start_verification_original;
    ccv_slave_jofemar_channel_stop_verification = ccv_slave_jofemar_channel_stop_verification_original;


    /* Another function is called where the variables used in the project can also be cleaned,

     * for example if an id is saved, it can be cleaned so as not to create any duplicate or error

     */

    ccvSlaveJofemarExtSoftReload();

}





/****************************/

/**  Chrome App Listeners  **/

/****************************/

// if the port is disconnected or if the application has an error, it also happens if the application

// is restarting and the page is already loaded.

ccv_slave_jofemar_port_app.onDisconnect.addListener(obj => {

    ccv_slave_jofemar_last_error["message"] = ccv_jofemar_lang.linker.status.app.lost_connection.message;

    ccv_slave_jofemar_last_error["handler"] = null;

    ccv_slave_jofemar_last_error["code"] = null;

    ccv_slave_jofemar_last_error["no_code"] = 667;



    ccvSlaveJofemarExtConnectionLost();
    if (chrome.runtime.lastError) {

        //console.log(chrome.runtime.lastError);
        addLog("log",chrome.runtime.lastError);

    }

});



// When the application responds something this listener gets the data

ccv_slave_jofemar_port_app.onMessage.addListener(function (ccv_slave_jofemar_msg) {

    // the response is in JSON format so it is transformed into an object for better handling

    let ccv_slave_jofemar_unparsed = JSON.parse(ccv_slave_jofemar_msg.msjBD);

    // if the code is 0 = message from the application

    // if the code is an array of X positions = device message

    // a function is called for each response code to process the responses and assign the results

    if (ccv_slave_jofemar_unparsed.code === 0) {

        ccvSlaveJofemarProcessMessage(ccv_slave_jofemar_unparsed);

    } else if (ccv_slave_jofemar_unparsed.code && ccv_slave_jofemar_unparsed.code.length > 0) {

        // STOPPING THE REPETITION IN CASE THE RECONNECTION IS IN PROCESS

        if (ccv_slave_jofemar_interval !== undefined) {

            clearInterval(ccv_slave_jofemar_interval);

            ccv_slave_jofemar_interval = undefined;

        }

        ccvSlaveJofemarProcessData(ccv_slave_jofemar_unparsed);

    } else {

        ccvSlaveJofemarExtCodeDivided(ccv_slave_jofemar_unparsed.code);

    }

    //console.log(ccv_slave_jofemar_unparsed);

});



function ccvSlaveJofemarOtherResponses(unparsed) {

    let code_hex = unparsed.code;

    let data = {

        'message': null,

        'description': null,

        'request': 'event',

        'code': 6100,

        'additional': null,

    };



    let additional = {

        "machine": {

            "hex": null,

            "desc": null,

        }

    };



    if (code_hex[1]) {

        additional.machine.hex = code_hex[1];

        additional.machine.dec = (ccvSlaveJofemarHexToDec(code_hex[1]) - 128);

    }



    switch (code_hex[2].toString().toUpperCase()) {

        case '54':

            //tecla pulsada en la maquina

            additional.key = {

                'hex': code_hex[3],

                'dec': ccvSlaveJofemarHexToDec(code_hex[3]),

                'ascii': null,

            }

            switch (code_hex[3].toString().toUpperCase()) {

                case '31':

                    additional.key.ascii = '1';

                    break;

                case '32':

                    additional.key.ascii = '2';

                    break;

                case '33':

                    additional.key.ascii = '3';

                    break;

                case '34':

                    additional.key.ascii = '4';

                    break;

                case '35':

                    additional.key.ascii = '5';

                    break;

                case '36':

                    additional.key.ascii = '6';

                    break;

                case '37':

                    additional.key.ascii = '7';

                    break;

                case '38':

                    additional.key.ascii = '8';

                    break;

                case '39':

                    additional.key.ascii = '9';

                    break;

                case '30':

                    additional.key.ascii = '0';

                    break;

                case '2A':

                    additional.key.ascii = '*';

                    break;

                case '23':

                    additional.key.ascii = '#';

                    break;

                case '41':

                    additional.key.ascii = 'A';

                    break;

                case '42':

                    additional.key.ascii = 'B';

                    break;

                case '43':

                    additional.key.ascii = 'C';

                    break;

                case '44':

                    additional.key.ascii = 'D';

                    break;



            }



            data.message = ccv_jofemar_lang.jofemar.other.keypress.message;

            let desc = ccv_jofemar_lang.jofemar.other.keypress.description;

            desc = desc.replaceAll('{pressed_key}', additional.key.ascii);

            desc = desc.replaceAll('{no_machine}', additional.machine.dec);

            data.description = desc;

            data.additional = ccv_jofemar_lang.jofemar.other.keypress.additional + ' ' + JSON.stringify(code_hex);

            data.code = 6101;

            ccvSlaveJofemarExtEventMachine({

                'event': 'keypress',

                'code': JSON.stringify(code_hex),

                'additional': additional

            });

            break;

        case '50':

            //Puerta abierta/cerrada

            switch (code_hex[3].toString().toUpperCase()) {

                case '4F':
                    ccvSlaveJofemarExtNoDeviceConnected('open');
                    //puerta abierta

                    data.message = ccv_jofemar_lang.jofemar.other.door.open.message;

                    data.description = ccv_jofemar_lang.jofemar.other.door.open.description.replaceAll('{no_machine}', additional.machine.dec);

                    data.code = 6102;
                    additional.door = {};
                    additional.door.status = 'open';

                    break;

                case '43':
                    ccvSlaveJofemarExtDeviceConnected('closed');
                    //puerta cerrada

                    data.message = ccv_jofemar_lang.jofemar.other.door.close.message;

                    data.description = ccv_jofemar_lang.jofemar.other.door.close.description.replaceAll('{no_machine}', additional.machine.dec);

                    data.code = 6103;
                    additional.door = {};
                    additional.door.status = 'closed';

                    break;

            }

            ccvSlaveJofemarExtEventMachine({'event': 'door', 'code': JSON.stringify(code_hex), 'additional': additional});

            break;

            case '43':
            switch (code_hex[3].toString().toUpperCase()){
                case '43':
                    switch (code_hex[4].toString().toUpperCase()){
                        case '43':
                        case '44':
                        default:
                            data.code = 6115;
                            if(code_hex[5].toString().toUpperCase() === "FE"){ // channel disconnected
                                data.message = ccv_jofemar_lang.jofemar.other.channel.disconnected.message;
                                data.description = ccv_jofemar_lang.jofemar.other.channel.disconnected.description;
                                additional.machine.channel = ccv_slave_jofemar_test_engine_number;
                                additional.machine.status = 0;
                            }
                            else if(code_hex[5].toString().toUpperCase() === "FD"){ // channel connected
                                data.message = ccv_jofemar_lang.jofemar.other.channel.connected.message;
                                data.description = ccv_jofemar_lang.jofemar.other.channel.connected.description;
                                additional.machine.channel = ccv_slave_jofemar_test_engine_number;
                                additional.machine.status = 1;
                            }
                            else{ // chanel sold out
                                data.message = ccv_jofemar_lang.jofemar.other.channel.sold_out.message;
                                data.description = ccv_jofemar_lang.jofemar.other.channel.sold_out.description;
                                additional.machine.channel = ccv_slave_jofemar_test_engine_number;
                                additional.machine.status = 1;
                            }
                            data.additional = JSON.stringify(additional);
                            break;
                    }
                    break;
            }
            break;
    }

    return data;

}



function ccvSlaveJofemarStatus(unparsed) {

    let code_hex = unparsed.code;

    let data = {

        'message': null,

        'description': null,

        'request': unparsed.request,

        'code': 5999,

        'additional': null,

    };



    switch (code_hex[1].toString().toUpperCase()) {

        case '30':

            data.message = ccv_jofemar_lang.jofemar.status.h30.message;

            data.description = ccv_jofemar_lang.jofemar.status.h30.description;

            data.code = 6010;

            if(ccv_slave_jofemar_interval_to_check_matrix_dispense !== undefined){

                ccv_slave_jofemar_status_dispensing = true;

                clearInterval(ccv_slave_jofemar_interval_to_check_matrix_dispense);

                ccv_slave_jofemar_interval_to_check_matrix_dispense = undefined;

            }

            break;

        case '31':

            data.message = ccv_jofemar_lang.jofemar.status.h31.message;

            data.description = ccv_jofemar_lang.jofemar.status.h31.description;

            data.code = 6011;

            break;

        case '32':

            data.message = ccv_jofemar_lang.jofemar.status.h32.message;

            data.description = ccv_jofemar_lang.jofemar.status.h32.description;

            data.code = 6012;

            if(ccv_slave_jofemar_interval_to_check_matrix_dispense !== undefined){
                //alert('Bandeja no valida');
                //console.error('Bandeja no valida')
                addLog("error",'Bandeja no valida')

                ccv_slave_jofemar_status_dispensing = false;

                clearInterval(ccv_slave_jofemar_interval_to_check_matrix_dispense);

                ccv_slave_jofemar_interval_to_check_matrix_dispense = undefined;

            }

            break;

        case '33':

            data.message = ccv_jofemar_lang.jofemar.status.h32.message;

            data.description = ccv_jofemar_lang.jofemar.status.h32.description;

            data.code = 6013;

            if(ccv_slave_jofemar_interval_to_check_matrix_dispense !== undefined){
                alert('Canal no valido');
                ccv_slave_jofemar_status_dispensing = false;

                clearInterval(ccv_slave_jofemar_interval_to_check_matrix_dispense);

                ccv_slave_jofemar_interval_to_check_matrix_dispense = undefined;

            }

            break;

        case '34':

            data.message = ccv_jofemar_lang.jofemar.status.h34.message;

            data.description = ccv_jofemar_lang.jofemar.status.h34.description;

            data.code = 6014;


            if(ccv_slave_jofemar_interval_to_check_matrix_dispense !== undefined){
                
                ccv_slave_jofemar_status_dispensing = false;

                clearInterval(ccv_slave_jofemar_interval_to_check_matrix_dispense);

                ccv_slave_jofemar_interval_to_check_matrix_dispense = undefined;

            }

            break;

        case '35':

            data.message = ccv_jofemar_lang.jofemar.status.h35.message;

            data.description = ccv_jofemar_lang.jofemar.status.h35.description;

            data.code = 6015;

            break;

        case '36':

            data.message = ccv_jofemar_lang.jofemar.status.h36.message;

            data.description = ccv_jofemar_lang.jofemar.status.h36.description;

            data.code = 6016;

            break;

        case '37':

            data.message = ccv_jofemar_lang.jofemar.status.h37.message;

            data.description = ccv_jofemar_lang.jofemar.status.h37.description;

            data.code = 6017;

            break;

        case '38':

            data.message = ccv_jofemar_lang.jofemar.status.h38.message;

            data.description = ccv_jofemar_lang.jofemar.status.h38.description;

            data.code = 6018;

            break;

        case '39':

            data.message = ccv_jofemar_lang.jofemar.status.h39.message;

            data.description = ccv_jofemar_lang.jofemar.status.h39.description;

            data.code = 6019;


            if(ccv_slave_jofemar_interval_to_check_matrix_dispense !== undefined){
                
                ccv_slave_jofemar_status_dispensing = true;

                clearInterval(ccv_slave_jofemar_interval_to_check_matrix_dispense);

                ccv_slave_jofemar_interval_to_check_matrix_dispense = undefined;

                ccvSlaveJofemarCollectProduct(2);

            }

            break;

        case '40':

            data.message = ccv_jofemar_lang.jofemar.status.h40.message;

            data.description = ccv_jofemar_lang.jofemar.status.h40.description;

            data.code = 6020;

            break;

        case '41':

            data.message = ccv_jofemar_lang.jofemar.status.h41.message;

            data.description = ccv_jofemar_lang.jofemar.status.h41.description;

            data.code = 6021;

            if(ccv_slave_jofemar_interval_to_check_matrix_dispense !== undefined){
                
                ccv_slave_jofemar_status_dispensing = true;

                clearInterval(ccv_slave_jofemar_interval_to_check_matrix_dispense);

                ccv_slave_jofemar_interval_to_check_matrix_dispense = undefined;

            }


            break;

        case '42':

            data.message = ccv_jofemar_lang.jofemar.status.h42.message;

            data.description = ccv_jofemar_lang.jofemar.status.h42.description;

            data.code = 6022;

            break;

        case '43':

            data.message = ccv_jofemar_lang.jofemar.status.h43.message;

            data.description = ccv_jofemar_lang.jofemar.status.h43.description;

            data.code = 6023;

            break;

        case '44':

            data.message = ccv_jofemar_lang.jofemar.status.h44.message;

            data.description = ccv_jofemar_lang.jofemar.status.h44.description;

            data.code = 6024;

            break;

        case '45':

            data.message = ccv_jofemar_lang.jofemar.status.h45.message;

            data.description = ccv_jofemar_lang.jofemar.status.h45.description;

            data.code = 6025;

            break;

        case '46':

            data.message = ccv_jofemar_lang.jofemar.status.h46.message;

            data.description = ccv_jofemar_lang.jofemar.status.h46.description;

            data.code = 6026;

            break;

        case '47':

            data.message = ccv_jofemar_lang.jofemar.status.h47.message;

            data.description = ccv_jofemar_lang.jofemar.status.h47.description;

            data.code = 6027;

            break;

        case '48':

            data.message = ccv_jofemar_lang.jofemar.status.h48.message;

            data.description = ccv_jofemar_lang.jofemar.status.h48.description;

            data.code = 6028;

            break;

        case '49':

            data.message = ccv_jofemar_lang.jofemar.status.h49.message;

            data.description = ccv_jofemar_lang.jofemar.status.h49.description;

            data.code = 6029;

            break;

        case '4A':

            data.message = ccv_jofemar_lang.jofemar.status.h4A.message;

            data.description = ccv_jofemar_lang.jofemar.status.h4A.description;

            data.code = 6030;

            break;

        case '4B':

            data.message = ccv_jofemar_lang.jofemar.status.h4B.message;

            data.description = ccv_jofemar_lang.jofemar.status.h4B.description;

            data.code = 6031;

            break;

        case '4C':

            data.message = ccv_jofemar_lang.jofemar.status.h4C.message;

            data.description = ccv_jofemar_lang.jofemar.status.h4C.description;

            data.code = 6032;

            break;

        case '4D':

            data.message = ccv_jofemar_lang.jofemar.status.h4D.message;

            data.description = ccv_jofemar_lang.jofemar.status.h4D.description;

            data.code = 6033;

            break;

        case '4E':

            data.message = ccv_jofemar_lang.jofemar.status.h4E.message;

            data.description = ccv_jofemar_lang.jofemar.status.h4E.description;

            data.code = 6034;
            
            if(ccv_slave_jofemar_interval_to_check_matrix_dispense !== undefined){
                
                ccv_slave_jofemar_status_dispensing = true;

                clearInterval(ccv_slave_jofemar_interval_to_check_matrix_dispense);

                ccv_slave_jofemar_interval_to_check_matrix_dispense = undefined;

                ccvSlaveJofemarCollectProduct(2);

            }

            break;

        case '4F':

            data.message = ccv_jofemar_lang.jofemar.status.h4F.message;

            data.description = ccv_jofemar_lang.jofemar.status.h4F.description;

            data.code = 6035;

            if(ccv_slave_jofemar_interval_to_check_matrix_dispense !== undefined){
                
                ccv_slave_jofemar_status_dispensing = true;

                clearInterval(ccv_slave_jofemar_interval_to_check_matrix_dispense);

                ccv_slave_jofemar_interval_to_check_matrix_dispense = undefined;

                ccvSlaveJofemarCollectProduct(2);
            }

            break;

        case '50':

            data.message = ccv_jofemar_lang.jofemar.status.h50.message;

            data.description = ccv_jofemar_lang.jofemar.status.h50.description;

            data.code = 6036;

            break;

        case '51':

            data.message = ccv_jofemar_lang.jofemar.status.h51.message;

            data.description = ccv_jofemar_lang.jofemar.status.h51.description;

            data.code = 6037;

            break;

    }

    return data;

}



// make the connection to the device

function ccvSlaveJofemarConnect(machine = 2) {

    //ccvSlaveJofemarConnectMachine(machine);

    ccvSlaveJofemarExtMessageConnection();
    ccvSlaveJofemarSendMessage(JSON.stringify("connect"));

    setTimeout(()=>{
        //ccvSlaveJofemarStatusMachine(2);
    },300)//

}



// Assign variable of connection for machine, by default loads with 0x81 = 1st machine

// @param machine is a decimal number between 1 and 31

function ccvSlaveJofemarConnectMachine(machine) {

    if (parseInt(machine) < 1 || parseInt(machine) > 31) {

        alert(ccv_jofemar_lang.app.error.machine_unknown);

    }

    let hex_machine = (128 + parseInt(machine)).toString(16);

    let f_hex = ['02', '30', '30', hex_machine, '56', 'FF', 'FF'];

    ccvSlaveJofemarMakeSendData(f_hex, 'const_conn_machine');

}



// reconnect to device if disconnected

function ccvSlaveJofemarReconnect() {

    ccvSlaveJofemarExtMessageReconnection();

    ccvSlaveJofemarConnect();

}



// perform a safe and authorized disconnection of the device

function ccvSlaveJofemarDisconnect() {

    ccvSlaveJofemarSendMessage(JSON.stringify("disconnect"));

}



// Send messages to the application

function ccvSlaveJofemarSendMessage(instruction, cod) {

    if (cod === undefined) {

        cod = JSON.stringify("");

    } else {

        ccvSlaveJofemarExtDisplayCode(instruction, cod);

    }

    ccv_slave_jofemar_port_app.postMessage({toDo: instruction, code: cod});



    if (JSON.parse(instruction) === "enginesMatrix") {

        // Start waiting for a response from the engines

        // The time of the motors can be configured, also dispense can be with sensor

        // The response time may vary, so it is advisable to customize it

        ccv_slave_jofemar_timer_to_response = setTimeout(function () {

            ccvSlaveJofemarTimerNoResponse(cod, instruction);

        }, ccv_slave_jofemar_time_response_engines);

    } else {

        // Starts a X second count, where if the answer is not presented the function will be called

        ccv_slave_jofemar_timer_to_response = setTimeout(function () {

            ccvSlaveJofemarTimerNoResponse(cod, instruction);

        }, ccv_slave_jofemar_time_response);

    }

}



// Generates the sum of hexadecimals and returns the value in hexadecimal

function ccvSlaveJofemarSumHex(arr) {

    //arr[1]+arr[2]+arr[3]+arr[4]+arr[5]+arr[6]+arr[7]+arr[8]+arr[9]+arr[10]...

    let sum = 0;

    arr.forEach((value, index) => {

        sum += parseInt(value, 16);

    });

    return sum.toString(16);

}



// Add 0x before each value in an array. | 00 => 0x00

function ccvSlaveJofemarAdd0x(cod) {

    let code = [];

    cod.forEach((value, index) => {

        code[index] = "0x" + value;

    });

    return code;

}



// convert a decimal value to hexadecimal

function ccvSlaveJofemarDecToHex(val) {

    return parseInt(val).toString(16).toUpperCase();

}



// convert a hexadecimal value to decimal

function ccvSlaveJofemarHexToDec(val) {

    return parseInt(val, 16);

}



// convert a hexadecimal array to a decimal array

function ccvSlaveJofemarArrDecToHex(arr) {

    let new_arr = [];

    arr.forEach((value, index) => {

        new_arr[index] = ccvSlaveJofemarDecToHex(value);

    });

    return new_arr;

}



// convert a decimal array to a hexadecimal array

function ccvSlaveJofemarArrHexToDec(arr) {

    let new_arr = [];

    arr.forEach((value, index) => {

        new_arr[index] = ccvSlaveJofemarHexToDec(value);

    });

    return new_arr;

}



// TIMEOUT if no response is presented for a certain time that the request was sent

function ccvSlaveJofemarTimerNoResponse(code, handler) {

    ccv_slave_jofemar_last_error["message"] = ccv_jofemar_lang.linker.status.response.timeout;

    ccv_slave_jofemar_last_error["handler"] = JSON.parse(handler);

    ccv_slave_jofemar_last_error["code"] = JSON.parse(code);

    clearTimeout(ccv_slave_jofemar_timer_to_response);

    if (ccv_slave_jofemar_last_error["handler"] === "connect") {

        ccvSlaveJofemarExtNoDeviceConnected();

        ccvSlaveJofemarReconnect();

    }



    ccvSlaveJofemarExtTimeout();

}



// clean the last error

function ccvSlaveJofemarCleanErrors() {

    ccv_slave_jofemar_last_error = ccv_slave_jofemar_last_error_original;

}



// Responses of the application (not of the device)

function ccvSlaveJofemarProcessMessage(unparsed) {

    clearTimeout(ccv_slave_jofemar_timer_to_response);

    let message_to_show = "";

    let description_to_show = "";

    switch (unparsed.no_code) {

        case 700:

            message_to_show = unparsed.message;

            description_to_show = ccv_jofemar_lang.app.response.connected;

            break;

        case 701:

            message_to_show = unparsed.message;

            description_to_show = ccv_jofemar_lang.app.response.disconnected_by_system;

            break;

        case 702:

            message_to_show = unparsed.message;

            description_to_show = ccv_jofemar_lang.app.response.not_compatible;

            break;

        case 703:

            ccvSlaveJofemarExtNoDeviceConnected();

            if (ccv_slave_jofemar_interval === undefined) {

                // X seconds between each reconnection attempt

                ccv_slave_jofemar_interval = setInterval(ccvSlaveJofemarReconnect, ccv_slave_jofemar_time_reconnect);

            }

            message_to_show = ccv_jofemar_lang.app.response.disconnected;

            description_to_show = unparsed.description;

            break;

        case 704:

            // port disconnected

            message_to_show = unparsed.message;

            description_to_show = unparsed.description;

            break;

        case 705:

            ccvSlaveJofemarExtNoDeviceConnected();

            // connection not completed

            if (ccv_slave_jofemar_interval === undefined) {

                // X seconds between each reconnection attempt

                ccv_slave_jofemar_interval = setInterval(ccvSlaveJofemarReconnect, ccv_slave_jofemar_time_reconnect);

            }

            message_to_show = ccv_jofemar_lang.app.response.device_not_connected;

            description_to_show = ccv_jofemar_lang.app.response.check_device_plug;

            break;

        case 706:

            message_to_show = unparsed.message;

            description_to_show = ccv_jofemar_lang.app.response.port_unused_closed;

            break;

        case 707:

            message_to_show = unparsed.message;

            description_to_show = ccv_jofemar_lang.app.response.timeout;

            break;

        case 7000:

            message_to_show = unparsed.message;

            description_to_show = unparsed.description;

            break;



        case 708:

        default:

            message_to_show = unparsed.message;

            description_to_show = ccv_jofemar_lang.app.response.unknown;

            break;

    }

    let obj = JSON.stringify({

        "message": message_to_show,

        "description": description_to_show,

        "no_code": unparsed.no_code

    });



    ccvSlaveJofemarExtMessageApplication(obj);

}



function ccvSlaveJofemarCleanSenseProduct() {

    clearInterval(ccv_slave_jofemar_waiting_for_sense);

    ccv_slave_jofemar_waiting_for_sense = ccv_slave_jofemar_waiting_for_sense_original;

    ccv_slave_jofemar_status_dispensing = ccv_slave_jofemar_status_dispensing_original;

}



// reload when an operation completes

function ccvSlaveJofemarReload(hard) {

    // hard = hard reload

    // if the constant is true it will enter

    if (cvv_slave_jofemar_reload_when_finish) {

        // if hard is different from undefined and hard is true

        if (hard !== undefined && hard) {

            location.reload();

        }// if the hard is undefined, it will only do a soft reload, (an internal reload of the variables)

        else {

            ccvSlaveJofemarSoftReload();

        }

    }

}



// Performs a hexadecimal check, they must always be 2 characters

function ccvSlaveJofemarCheckHexMaker(hex) {

    let valid = '00';

    if (hex.length < 2) {

        switch (hex.length) {

            case 1:

                valid = '0' + hex;

                break;

            case 0:

            default:

                valid = '00';

                break;

        }

    } else if (hex.length > 2) {

        valid = '' + hex[0] + hex[1];

    } else if (hex.length === 2) {

        valid = hex;

    }

    return valid;

}



// Format the numbers

Number.prototype.format = function (decimals, every_thousands_sep, thousands_sep, dec_point) {

    let re = '\\d(?=(\\d{' + (every_thousands_sep || 3) + '})+' + (decimals > 0 ? '\\D' : '$') + ')',

        num = this.toFixed(Math.max(0, ~~decimals));

    return (dec_point ? num.replace('.', dec_point) : num).replace(new RegExp(re, 'g'), '$&' + (thousands_sep || ','));

};



// Show in console the logs

if (typeof window.consoleLog === 'undefined') {

    window.consoleLog = function (...data) {

        if (ccv_slave_jofemar_console_active) {

            //console.log(data);
            addLog("log",data);
        }

    }

}



// Show in console the warns

if (typeof window.consoleWarn === 'undefined') {

    window.consoleWarn = function (...data) {

        if (ccv_slave_jofemar_console_active) {

            //console.warn(data);
            addLog("warn",data);
        }

    }

}



// Show in console the errors

if (typeof window.consoleError === 'undefined') {

    window.consoleError = function (...data) {

        if (ccv_slave_jofemar_console_active) {

            //console.error(data);
            addLog("error",data);

        }

    }

}



// Show in console the debug data

if (typeof window.consoleDebug === 'undefined') {

    window.consoleDebug = function (...data) {

        if (ccv_slave_jofemar_console_active) {

            //console.debug(data);
            addLog("debug",data);
        }

    }

}



// process the code that came from the device and identify what it means

function ccvSlaveJofemarProcessData(unparsed) {

    clearTimeout(ccv_slave_jofemar_timer_to_response);

    ccv_slave_jofemar_timer_to_response = undefined;



    let code_hex = unparsed.code;

    let processed_information = {

        "message": null,

        "description": null,

        "request": null,

        "code": null,

        "additional": null,

    };

    switch (code_hex[0].toString().toUpperCase()) {

        case "2":

            if (code_hex[1] && code_hex[2]) {

                processed_information = ccvSlaveJofemarOtherResponses(unparsed);

            } else {

                processed_information.message = ccv_jofemar_lang.jofemar.alone.message;

                processed_information.description = ccv_jofemar_lang.jofemar.alone.description;

                processed_information.request = null;// "Variable that saves the last request that was sent"

                processed_information.code = 6001;

                processed_information.additional = ccv_jofemar_lang.jofemar.alone.additional;

                //console.log(ccv_jofemar_lang.jofemar.alone);
                addLog("log",ccv_jofemar_lang.jofemar.alone);

            }

            break;

        //CheckSum correct (ACK)

        case "6":
            ccvSlaveJofemarExtDeviceConnected();
            if (code_hex[1] && !code_hex[2]) {

                processed_information = ccvSlaveJofemarStatus(unparsed);

            }

            else if(!code_hex[1]){

                

                processed_information.message = ccv_jofemar_lang.jofemar.alone.message;

                processed_information.description = ccv_jofemar_lang.jofemar.alone.description;

                processed_information.request = null;// "Variable that saves the last request that was sent"

                processed_information.code = 6001;

                processed_information.additional = ccv_jofemar_lang.jofemar.alone.additional;



                //console.log(ccv_jofemar_lang.jofemar.alone);
                addLog("log",ccv_jofemar_lang.jofemar.alone);

                

                if(ccv_slave_jofemar_interval_to_check_matrix_dispense !== undefined){

                    ccv_slave_jofemar_check_matrix_dispensed = false;

                    clearInterval(ccv_slave_jofemar_interval_to_check_matrix_dispense);

                    ccv_slave_jofemar_interval_to_check_matrix_dispense = undefined;

                }

            }

            else {

                processed_information.message = ccv_jofemar_lang.jofemar.alone.message;

                processed_information.description = ccv_jofemar_lang.jofemar.alone.description;

                processed_information.request = null;// "Variable that saves the last request that was sent"

                processed_information.code = 6001;

                processed_information.additional = ccv_jofemar_lang.jofemar.alone.additional;



                //console.log(ccv_jofemar_lang.jofemar.alone);
                addLog("log",ccv_jofemar_lang.jofemar.alone);

            }

            break;

        //CheckSum incorrect (NAK)

        case "15":

            processed_information.message = ccv_jofemar_lang.jofemar.status.nak.message;

            processed_information.description = ccv_jofemar_lang.jofemar.status.nak.description;

            processed_information.request = null;// "Variable that saves the last request that was sent"

            processed_information.code = 6000;

            processed_information.additional = ccv_jofemar_lang.jofemar.status.nak.additional;

            break;

        //None of the above

        default:

            processed_information.message = ccv_jofemar_lang.linker.status.response.unknown.message;

            processed_information.description = ccv_jofemar_lang.linker.status.response.unknown.description;

            processed_information.request = ccv_jofemar_lang.linker.status.response.unknown.request;

            processed_information.code = 404;

            processed_information.additional = null;

            break;



    }



    let obj = {

        "code": code_hex,

        "message": processed_information.message,

        "description": processed_information.description,

        "request": processed_information.request,

        "additional": processed_information.additional,

        "no_code": processed_information.code,

    };



    /* The message that was created is sent to a function of the file 'extension' and the modifications will be made

     * there, so that the communication file (this file) does not receive so many changes (if possible, do not modify

     * this file) so it can be understood what changes are made in the integration.

     */

    ccvSlaveJofemarExtResponses(obj);

}



function ccvSlaveJofemarCalcCheckSums(val) {

    val = ccvSlaveJofemarAdd0x([ccvSlaveJofemarDecToHex(parseInt(val))]);

    let f_ck = [];

    f_ck.push((((val & 0xFF) | 0xF0).toString(16)).toUpperCase());

    f_ck.push((((val & 0xFF) | 0x0F).toString(16)).toUpperCase());

    return f_ck;

}



function ccvSlaveJofemarMakeSendData(f_hex, f_to_do) {

    let f_dec = ccvSlaveJofemarHexToDec(ccvSlaveJofemarSumHex(f_hex));

    let f_ck = ccvSlaveJofemarCalcCheckSums(f_dec);

    for (let j = 0; j < 2; j++) {

        f_hex.push(f_ck[j]);

    }

    f_hex.push('03');

    f_hex = ccvSlaveJofemarAdd0x(f_hex);



    if (f_to_do === 'const_conn_machine') {

        ccv_slave_jofemar_code_connection_expected = f_hex;

    }


    ccvSlaveJofemarSendMessage(JSON.stringify(f_to_do), JSON.stringify(f_hex));

}





/**

 * Functions for jofemar machines

 *

 * machine must be a decimal number between 1 and 31

 * in all next functions

 */



// dispense products
let ccv_slave_jofemar_interval_to_check_matrix_dispense = undefined;

let ccv_slave_jofemar_check_matrix_dispensed = false;

function ccvSlaveJofemarEnginesMatrix(machine, tray, channel) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '56', tray.toString(), channel.toString()]
    ccvSlaveJofemarMakeSendData(f_hex, 'dispense');

    setTimeout(()=>{
        ccv_slave_jofemar_interval_to_check_matrix_dispense = setInterval(()=>{

            ccvSlaveJofemarStatusMachine(machine);

        },2000);
    },2000)

}



// collect product

function ccvSlaveJofemarCollectProduct(machine) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '4E', 'FF', 'FF'];

    ccvSlaveJofemarMakeSendData(f_hex, 'collect');

}



//reset

function ccvSlaveJofemarReset(machine, param) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '52', param, 'FF'];

    ccvSlaveJofemarMakeSendData(f_hex, 'reset');

}



//Lights

function ccvSlaveJofemarLights(machine, param) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '4C', param, 'FF'];

    ccvSlaveJofemarMakeSendData(f_hex, 'light');

}



//program

function ccvSlaveJofemarProgramMachine(machine, param1, param2) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '50', param1, param2];

    ccvSlaveJofemarMakeSendData(f_hex, 'program');

}



//motor voltage

function ccvSlaveJofemarVoltage(machine, param1, param2) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '47', param1, param2];

    ccvSlaveJofemarMakeSendData(f_hex, 'voltage');

}



// push out product

function ccvSlaveJofemarPushOutProduct(machine, param1, param2) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '4F', param1, param2];

    ccvSlaveJofemarMakeSendData(f_hex, 'push_out');

}



// after dispensing

function ccvSlaveJofemarAfterDispensing(machine, param1, param2) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '45', param1, param2];

    ccvSlaveJofemarMakeSendData(f_hex, 'after_dispensing');

}



// consult data of machine

function ccvSlaveJofemarConsultData(machine, param1, param2 = 'FF') {
    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '43', param1, param2];

    ccvSlaveJofemarMakeSendData(f_hex, 'check_data');

}



// diplay, param2 must be an array

function ccvSlaveJofemarDisplayConfig(machine, param1, param2) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '44', param1];

    for (let i = 0; i < param2.length; i++) {

        f_hex.push(param2[i]);

    }

    ccvSlaveJofemarMakeSendData(f_hex, 'display');

}



// watch

function ccvSlaveJofemarWatch(machine, param) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '72'];

    param.split(' ').forEach((value) => {

        f_hex.push(value);

    });

    ccvSlaveJofemarMakeSendData(f_hex, 'watch');

}



// enable or disable event status

function ccvSlaveJofemarEventStatus(machine, param) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '41', '41', param];

    ccvSlaveJofemarMakeSendData(f_hex, 'event-status');

}



// estatus

function ccvSlaveJofemarStatusMachine(machine) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '53', 'FF', 'FF'];
    ccvSlaveJofemarMakeSendData(f_hex, 'status');

}



// Code to send custom hexadecimals to device

// @var code must be a STRING with full hexadecimals using 1 space of separation, don't include 0x before of each byte

// Example: 02 00 00 00 00 00 00 00 00 00 03

function ccvSlaveJofemarCustomCode(str) {

    let f_hex = [];

    let arr_code = str.split(' ');

    for (let i = 0; i < arr_code.length; i++) {

        f_hex.push(ccvSlaveJofemarCheckHexMaker(arr_code[i]));

    }

    ccvSlaveJofemarMakeSendData(f_hex, 'custom');

}



// calculate change

function ccvSlaveJofemarCalculateChange() {

    if (ccv_slave_jofemar_price !== undefined) {

        return {"error": ccv_jofemar_lang.app.price.undefined};

    }

    // If the amount inserted is equal to the price

    if (ccv_slave_jofemar_amount_inserted === ccv_slave_jofemar_price) {

        ccv_slave_jofemar_exchange = 0;

    } else if (ccv_slave_jofemar_amount_inserted > ccv_slave_jofemar_price) {

        ccv_slave_jofemar_exchange = ccv_slave_jofemar_amount_inserted - ccv_slave_jofemar_price;

    } else {

        return {"error": ccv_jofemar_lang.app.price.missing_amount};

    }

    return {

        "exchange": ccv_slave_jofemar_exchange,

        "error": 0,

    };

}

let ccv_slave_jofemar_counter_active_channels_current = 0;
function ccvSlaveJofemarAssignActiveChannels(machine){
    let f_total = ccv_slave_jofemar_channel_stop_verification - ccv_slave_jofemar_channel_start_verification_original;//80
    let f_percentage = (ccv_slave_jofemar_counter_active_channels_current * 100 / f_total);
    

    $('#ccv-jofemar-modal-selection-span').text(f_percentage.format(0, 3, ',', '.')+"%");
    $('#ccv-jofemar-modal-selection-progressbar').css('width',f_percentage.format(0, 3, ',', '.')+"%");
    $('#ccv-jofemar-modal-selection').modal('show');

    if(ccv_slave_jofemar_channel_start_verification <= ccv_slave_jofemar_channel_stop_verification){
        ccv_slave_jofemar_test_engine_number = ccv_slave_jofemar_channel_start_verification;
        ccvSlaveJofemarConsultData(machine,'43',(ccv_slave_jofemar_channel_start_verification).toString(16))
        setTimeout(()=>{
            ccv_slave_jofemar_channel_start_verification++;
            ccv_slave_jofemar_counter_active_channels_current++;
            ccvSlaveJofemarAssignActiveChannels(machine);
        },700)//
    }else{
        ccv_slave_jofemar_channel_start_verification = ccv_slave_jofemar_channel_start_verification_original;
        ccv_slave_jofemar_test_engine_number = undefined;
        ccv_slave_jofemar_counter_active_channels_current=0;
        

        $('#ccv-jofemar-modal-selection').modal('hide');
        $('#ccv-jofemar-modal-selection-span').text('0%');
        $('#ccv-jofemar-modal-selection-progressbar').css('width',"0%");
    }
}


function ccvSlaveJofemarDeprecationAlertFunctions() {

    alert('¡Vaya!, esta función no es compatible con esta máquina, lo sentimos.');

}





/**

 * Created by danidoble (https://github.com/danidoble)

 * @author Daniel Sandoval AKA danidoble

 * @year 2021

 * @website https://danidoble.com

 */





/**

 * @Deprecated

 *

 * From this point to below the functions are unused because the machine doesn't support it

 *

 */





/** @deprecated for incompatibility

 * Config the coin purse*/

function ccvSlaveJofemarConfigCoinPurse() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Read the tubes in coin purse*/

function ccvSlaveJofemarReadTubes() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Dispense coins*/

function ccvSlaveJofemarCoinsOut() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Config bill purse*/

function ccvSlaveJofemarConfigBill() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Accept bill in recycler*/

function ccvSlaveJofemarAcceptBill() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Reject bill in recycler*/

function ccvRejectBill() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Dispense bills*/

function ccvSlaveJofemarBillsOut() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Read temperature of the machine*/

function ccvSlaveJofemarReadTemperature() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Enable or disable cooling relay*/

function ccvSlaveJofemarCoolingRelay() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Save memory bill*/

function ccvSlaveJofemarSaveMemoryBill() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * read memory bill*/

function ccvSlaveJofemarReadMemoryBill() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Disable nayax*/

function ccvSlaveJofemarDisableNayax() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Enable coin purse*/

function ccvSlaveJofemarEnableCoinPurse() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Disable coin purse*/

function ccvSlaveJofemarDisableCoinPurse() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Enable bill purse*/

function ccvSlaveJofemarEnableBillPurse() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Disable bill purse*/

function ccvSlaveJofemarDisableBillPurse() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Dispense with sensor*/

function ccvSlaveJofemarDispenseWithSensor() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Dispense with time to X seconds*/

function ccvSlaveJofemarDispenseWithTimer() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Enable cooling relay*/

function ccvSlaveJofemarEnableCoolingRelay() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Disable cooling relay*/

function ccvSlaveJofemarDisableCoolingRelay() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Return change, this function is for when the coin purse and the bill purse are working

 * The bill purse must be able to dispense bills otherwise use the function to return change only with coins

 * */

function ccvSlaveJofemarGiveChange() {

    // f = local variable function (just not to mix them with others that may arise and are global)

    // c = pennies

    // p = pesos / dollar depending on the configuration of the coin purse

    let f_coin_50c = 0;

    let f_coin_1p = 0;

    let f_coin_2p = 0;

    let f_coin_5p = 0;

    let f_coin_10p = 0;



    let f_bill_20p = 0;

    let f_bill_50p = 0;

    let f_bill_100p = 0;

    let f_bill_200p = 0;

    let f_bill_500p = 0;

    let f_bill_1000p = 0;



    let f_new_exchange = ccv_slave_jofemar_exchange;

    if (f_new_exchange > 0) {



        for (let i = 0; i < 20; i++) {

            //if the change is in 0 the for ends

            if (f_new_exchange === 0) {

                break;

            }



            //BILLS

            if ((f_new_exchange - 1000) >= 0) {

                f_bill_1000p++;

                f_new_exchange -= 1000;

            } else if ((f_new_exchange - 500) >= 0) {

                f_bill_500p++;

                f_new_exchange -= 500;

            } else if ((f_new_exchange - 200) >= 0) {

                f_bill_200p++;

                f_new_exchange -= 200;

            } else if ((f_new_exchange - 100) >= 0) {

                f_bill_100p++;

                f_new_exchange -= 100;

            } else if ((f_new_exchange - 50) >= 0) {

                f_bill_50p++;

                f_new_exchange -= 50;

            } else if ((f_new_exchange - 20) >= 0) {

                f_bill_20p++;

                f_new_exchange -= 20;

            }

            //##COINS

            else if ((f_new_exchange - 10) >= 0) {

                f_coin_10p++;

                f_new_exchange -= 10;

            } else if ((f_new_exchange - 5) >= 0) {

                f_coin_5p++;

                f_new_exchange -= 5;

            } else if ((f_new_exchange - 2) >= 0) {

                f_coin_2p++;

                f_new_exchange -= 2;

            } else if ((f_new_exchange - 1) >= 0) {

                f_coin_1p++;

                f_new_exchange -= 1;

            } else if ((f_new_exchange - .5) >= 0) {

                f_coin_1p++;

                f_new_exchange -= .5;

            }

            // RESET THE COUNTER IF THE CHANGE IS NOT COMPLETED

            if (i === 19 && f_new_exchange > 0) {

                i = 0;

            }

        }

    } else {

        // The change is in zeros, nothing is returned.

    }

    let obj = JSON.stringify({

        "coins": {

            "c50": f_coin_50c,

            "p1": f_coin_1p,

            "p2": f_coin_2p,

            "p5": f_coin_5p,

            "p10": f_coin_10p

        },

        "bills": {

            "p20": f_bill_20p,

            "p50": f_bill_50p,

            "p100": f_bill_100p,

            "p200": f_bill_200p,

            "p500": f_bill_500p,

            "p1000": f_bill_1000p

        },

        "exchange": ccv_slave_jofemar_exchange

    });

    let f_obj = JSON.parse(obj);



    if (f_obj.exchange > 0) {

        // evaluate if bills will be dispensed

        let dispense_bills = false;

        f_obj.bills.forEach((value) => {

            if (!dispense_bills && value > 0) {

                dispense_bills = true;

            }

        });



        // evaluate if coins will be dispensed

        let dispense_coins = false;

        f_obj.coins.forEach((value) => {

            if (!dispense_coins && value > 0) {

                dispense_coins = true;

            }

        });



        //console.log(f_obj);
        addLog("log",f_obj);



        if (dispense_bills) {

            alert('Replace this for a valid way to return bills');

            /*

            ccvBillsOut(f_obj.bills.p20.toString(16),

                f_obj.bills.p50.toString(16),

                f_obj.bills.p100.toString(16),

                f_obj.bills.p200.toString(16),

                f_obj.bills.p500.toString(16),

                f_obj.bills.p1000.toString(16));

             */

        }



        if (dispense_coins) {

            alert('Replace this for a valid way to return coins');

            /*

            ccvCoinsOut(f_obj.coins.c50.toString(16),

                f_obj.coins.p1.toString(16),

                f_obj.coins.p2.toString(16),

                f_obj.coins.p5.toString(16),

                f_obj.coins.p10.toString(16));

            */

        }

    } else {

        //There is no change to return

    }

}



/** @deprecated for incompatibility

 * Return change only with coin purse*/

function ccvSlaveJofemarGiveChangeCoins() {

    let f_coin_50c = 0;

    let f_coin_1p = 0;

    let f_coin_2p = 0;

    let f_coin_5p = 0;

    let f_coin_10p = 0;

    let f_new_exchange = ccv_slave_jofemar_exchange;

    if (ccv_slave_jofemar_exchange > 0) {

        for (let i = 0; i < 20; i++) {

            //if the change is in 0 the for ends

            if (f_new_exchange === 0) {

                break;

            } else if ((f_new_exchange - 10) >= 0) {

                f_coin_10p++;

                f_new_exchange -= 10;

            } else if ((f_new_exchange - 5) >= 0) {

                f_coin_5p++;

                f_new_exchange -= 5;

            } else if ((f_new_exchange - 2) >= 0) {

                f_coin_2p++;

                f_new_exchange -= 2;

            } else if ((f_new_exchange - 1) >= 0) {

                f_coin_1p++;

                f_new_exchange -= 1;

            } else if ((f_new_exchange - .5) >= 0) {

                f_coin_1p++;

                f_new_exchange -= .5;

            }



            // RESET THE COUNTER IF THE CHANGE IS NOT COMPLETED

            if (i === 19 && f_new_exchange > 0) {

                i = 0;

            }

        }



    } else {

        // The change is in zeros, nothing is returned.

    }



    let obj = JSON.stringify({

        "coins": {

            "c50": f_coin_50c,

            "p1": f_coin_1p,

            "p2": f_coin_2p,

            "p5": f_coin_5p,

            "p10": f_coin_10p

        },

        "exchange": ccv_slave_jofemar_exchange

    });

    let f_obj = JSON.parse(obj);



    if (f_obj.exchange > 0) {

        // evaluate if coins will be dispensed

        let dispense_coins = false;

        f_obj.coins.forEach((value, index) => {

            if (!dispense_coins && value > 0) {

                dispense_coins = true;

            }

        });



        //console.log(f_obj);
        addLog("log",f_obj);



        if (dispense_coins) {

            alert('Replace this for a valid way to return coins');

            /*

            ccvCoinsOut(f_obj.coins.c50.toString(16),

                f_obj.coins.p1.toString(16),

                f_obj.coins.p2.toString(16),

                f_obj.coins.p5.toString(16),

                f_obj.coins.p10.toString(16));

             */

        }

    } else {

        // There is no change to return

    }

}



/** @deprecated for incompatibility

 * Return change only with bill purse*/

function ccvSlaveJofemarGiveChangeBills() {

    let f_bill_20p = 0;

    let f_bill_50p = 0;

    let f_bill_100p = 0;

    let f_bill_200p = 0;

    let f_bill_500p = 0;

    let f_bill_1000p = 0;



    let f_new_exchange = ccv_slave_jofemar_exchange;

    let f_error = {"change": false, "missing": 0};

    if (ccv_slave_jofemar_exchange > 0) {



        for (let i = 0; i < 20; i++) {

            // if the change is in 0 the for ends

            if (f_new_exchange === 0) {

                break;

            } else if (f_new_exchange < 20) {

                f_error.change = true;

                f_error.missing = f_new_exchange;

                break;

            }



            if ((f_new_exchange - 1000) >= 0) {

                f_bill_1000p++;

                f_new_exchange -= 1000;

            } else if ((f_new_exchange - 500) >= 0) {

                f_bill_500p++;

                f_new_exchange -= 500;

            } else if ((f_new_exchange - 200) >= 0) {

                f_bill_200p++;

                f_new_exchange -= 200;

            } else if ((f_new_exchange - 100) >= 0) {

                f_bill_100p++;

                f_new_exchange -= 100;

            } else if ((f_new_exchange - 50) >= 0) {

                f_bill_50p++;

                f_new_exchange -= 50;

            } else if ((f_new_exchange - 20) >= 0) {

                f_bill_20p++;

                f_new_exchange -= 20;

            }



            // RESET THE COUNTER IF THE CHANGE IS NOT COMPLETED

            if (i === 19 && f_new_exchange > 0) {

                i = 0;

            }

        }



    } else {

        // The change is in zeros, nothing is returned.

    }

    if (f_error.change) {

        //consoleLog(ccv_jofemar_lang.app.console.log.change_not_completed.replaceAll('{quantity}', f_error.missing));
        addLog("log",ccv_jofemar_lang.app.console.log.change_not_completed.replaceAll('{quantity}', f_error.missing));

    }

    let obj = JSON.stringify({

        "bills": {

            "p20": f_bill_20p,

            "p50": f_bill_50p,

            "p100": f_bill_100p,

            "p200": f_bill_200p,

            "p500": f_bill_500p,

            "p1000": f_bill_1000p

        },

        "exchange": ccv_slave_jofemar_exchange,

        "error": f_error,

    });

    let f_obj = JSON.parse(obj);



    if (f_obj.exchange > 0) {

        // evaluate if bills will be dispensed

        let dispense_bills = false;

        f_obj.bills.forEach((value, index) => {

            if (!dispense_bills && value > 0) {

                dispense_bills = true;

            }

        });



        //console.log(f_obj);
        addLog("log",f_obj);



        if (dispense_bills) {

            alert('Replace this for a valid way to return bills');

            /*

            ccvBillsOut(f_obj.bills.p20.toString(16),

                f_obj.bills.p50.toString(16),

                f_obj.bills.p100.toString(16),

                f_obj.bills.p200.toString(16),

                f_obj.bills.p500.toString(16),

                f_obj.bills.p1000.toString(16));

             */

        }

    } else {

        // There is no change to return

    }

}



/** @deprecated for incompatibility

 * nayax cashless*/

function ccvSlaveJofemarNayaxCashless() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Test engines*/

function ccvSlaveJofemarExecuteMatrixTest() {

    ccvSlaveJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * counts the money that is entered into the bill purse and the coin purse per session*/

function ccvSlaveJofemarCountMoney(money, where) {

    ccvSlaveJofemarDeprecationAlertFunctions();

    return;

    /**

     * If you want use or adapt the code below remove 2 lines before this comment

     */



    switch (money.toUpperCase()) {

        //coins

        case "G50":

            if (where === "tube") {

                ccv_slave_jofemar_arr_coins.tubes.G50 += 1;

            } else {

                ccv_slave_jofemar_arr_coins.box.G50 += 1;

            }

            ccv_slave_jofemar_arr_coins.G50 += 1;

            ccv_slave_jofemar_amount_inserted += .5;

            break;

        case "C50":

            if (where === "tube") {

                ccv_slave_jofemar_arr_coins.tubes.C50 += 1;

            } else {

                ccv_slave_jofemar_arr_coins.box.C50 += 1;

            }

            ccv_slave_jofemar_arr_coins.C50 += 1;

            ccv_slave_jofemar_amount_inserted += .5;

            break;

        case "P1":

            if (where === "tube") {

                ccv_slave_jofemar_arr_coins.tubes.P1 += 1;

            } else {

                ccv_slave_jofemar_arr_coins.box.P1 += 1;

            }

            ccv_slave_jofemar_arr_coins.P1 += 1;

            ccv_slave_jofemar_amount_inserted += 1;

            break;

        case "P2":

            if (where === "tube") {

                ccv_slave_jofemar_arr_coins.tubes.P2 += 1;

            } else {

                ccv_slave_jofemar_arr_coins.box.P2 += 1;

            }

            ccv_slave_jofemar_arr_coins.P2 += 1;

            ccv_slave_jofemar_amount_inserted += 2;

            break;

        case "P5":

            if (where === "tube") {

                ccv_slave_jofemar_arr_coins.tubes.P5 += 1;

            } else {

                ccv_slave_jofemar_arr_coins.box.P5 += 1;

            }

            ccv_slave_jofemar_arr_coins.P5 += 1;

            ccv_slave_jofemar_amount_inserted += 5;

            break;

        case "P10":

            if (where === "tube") {

                ccv_slave_jofemar_arr_coins.tubes.P10 += 1;

            } else {

                ccv_slave_jofemar_arr_coins.box.P10 += 1;

            }

            ccv_slave_jofemar_arr_coins.P10 += 1;

            ccv_slave_jofemar_amount_inserted += 10;

            break;

        //bills

        case "P20":

            if (where === "stacker") {

                ccv_slave_jofemar_arr_bills.stacker.P20 += 1;

            } else {

                ccv_slave_jofemar_arr_bills.recycler.P20 += 1;

            }

            ccv_slave_jofemar_arr_bills.P20 += 1;

            ccv_slave_jofemar_amount_inserted += 20;

            break;

        case "P50":

            if (where === "stacker") {

                ccv_slave_jofemar_arr_bills.stacker.P50 += 1;

            } else {

                ccv_slave_jofemar_arr_bills.recycler.P50 += 1;

            }

            ccv_slave_jofemar_arr_bills.P50 += 1;

            ccv_slave_jofemar_amount_inserted += 50;

            break;

        case "P100":

            if (where === "stacker") {

                ccv_slave_jofemar_arr_bills.stacker.P100 += 1;

            } else {

                ccv_slave_jofemar_arr_bills.recycler.P100 += 1;

            }

            ccv_slave_jofemar_arr_bills.P100 += 1;

            ccv_slave_jofemar_amount_inserted += 100;

            break;

        case "P200":

            if (where === "stacker") {

                ccv_slave_jofemar_arr_bills.stacker.P200 += 1;

            } else {

                ccv_slave_jofemar_arr_bills.recycler.P200 += 1;

            }

            ccv_slave_jofemar_arr_bills.P200 += 1;

            ccv_slave_jofemar_amount_inserted += 200;

            break;

        case "P500":

            if (where === "stacker") {

                ccv_slave_jofemar_arr_bills.stacker.P500 += 1;

            } else {

                ccv_slave_jofemar_arr_bills.recycler.P500 += 1;

            }

            ccv_slave_jofemar_arr_bills.P500 += 1;

            ccv_slave_jofemar_amount_inserted += 500;

            break;

        case "P1000":

            if (where === "stacker") {

                ccv_slave_jofemar_arr_bills.stacker.P1000 += 1;

            } else {

                ccv_slave_jofemar_arr_bills.recycler.P1000 += 1;

            }

            ccv_slave_jofemar_arr_bills.P1000 += 1;

            ccv_slave_jofemar_amount_inserted += 1000;

            break;

        default:

            //will not be added to the arrays

            break;

    }

    /**

     * The coins and bills arrays store the information of each session

     * UNCOMMENT THE 2 LINES BELOW TO DISPLAY THE CURRENCIES OF THE ACTIVE SESSION IN THE CONSOLE.

     * The ccv_slave_jofemar_console_active constant must be active (true)

     */



    //let f_money_in_session=JSON.stringify({"bills":ccv_slave_jofemar_arr_bills,"coins":ccv_slave_jofemar_arr_coins});

    //consoleLog(JSON.parse(f_money_in_session));

}



/** @deprecated for incompatibility

 * Percentage of coins in tubes of the coin purse*/

function ccvSlaveJofemarPercentage() {

    ccvSlaveJofemarDeprecationAlertFunctions();

    return;

    /**

     * If you want use or adapt the code below remove 2 lines before this comment

     */



    /* coin purse capacity (approx)

        coins of 10 = 72

        coins of 1  = 100

        coins of 2  = 92

        coins of 5  = 80

    */

    let arr = [];

    arr["10"] = ((ccv_slave_jofemar_arr_coins.tubes.P10) / 58 * 100).format(0, 3, ',', '.');

    arr["5"] = ((ccv_slave_jofemar_arr_coins.tubes.P5) / 69 * 100).format(0, 3, ',', '.');

    arr["2"] = ((ccv_slave_jofemar_arr_coins.tubes.P2) / 78 * 100).format(0, 3, ',', '.');

    arr["1"] = ((ccv_slave_jofemar_arr_coins.tubes.P1) / 85 * 100).format(0, 3, ',', '.');

    arr["50c"] = ((ccv_slave_jofemar_arr_coins.tubes.G50) / 78 * 100).format(0, 3, ',', '.');

    ccvSlaveJofemarExtPercentageTubes(arr);

}





/**

 * Created by danidoble (https://github.com/danidoble)

 * @author Daniel Sandoval AKA danidoble

 * @year 2021

 * @website https://danidoble.com

 *

 * .......................................................................

 * .....|||...........................|||...........|||......||...........

 * .....|||....||||||..........||.....|||...........|||......||...........

 * .....|||........||..||.............|||...........|||......||...........

 * ..||||||....||||||..||||||..||..||||||...|||||...||||||...||..|||||||..

 * .||...||...||...||..||..||..||.||...||..||...||..|||...||.||..||||.....

 * ..||||||....||||||..||..||..||..||||||...|||||...|||||||..||..|||||||..

 * .......................................................................

 * */