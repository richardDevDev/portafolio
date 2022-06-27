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


 const master_machine_select = 1;
// chrome app id

let ccv_jofemar_id_app = "aiebceoilmbhbfneknjkeadccjdijgjb";

// Show errors, logs, warns, debug in console?

const ccv_jofemar_console_active = true;

// A maximum amount must be given for the nayax credit

let ccv_jofemar_nayax_max_pre_credit = 0;

// if the connection is lost, the reconnection interval starts

let ccv_jofemar_interval = undefined;

// time for responses to arrive

let ccv_jofemar_time_response = 3000;

// time for the responses of the motors, if it is by sensor they should be approx 15sec

let ccv_jofemar_time_response_engines = 15000;

// time for reconnection

let ccv_jofemar_time_reconnect = 7000;

// interval for product sensing

let ccv_jofemar_waiting_for_sense = undefined;

// Dispense status

let ccv_jofemar_status_dispensing = undefined;

// generate the connection with the application (open a port)
let ccv_jofemar_port_app = chrome.runtime.connect(ccv_jofemar_id_app, {name: 'jofemar'});

// stores the change to return

let ccv_jofemar_exchange = 0;

// stores the amount of money inserted per session

let ccv_jofemar_amount_inserted = 0;

// stores the price of the product being purchased

let ccv_jofemar_price = undefined;

// stores the timeout to perform an operation in case the response does not return in given time

let ccv_jofemar_timer_to_response = undefined;

// store the arr hex code in connection
let ccv_jofemar_code_connection_expected = ["0x02", "0x30", "0x30", "0x81", "0x53", "0xFF", "0xFF", "0xF4", "0x3F", "0x03"];

// store number of engine (dec 110 - 180 esplus)
let ccv_jofemar_test_engine_number = undefined;

// Stores the last recorded error

let ccv_jofemar_last_error = {

    "message": null,

    "handler": null,

    "code": null,

    "no_code": 666,

};

// Array of inserted coins, differentiating where it was sent (box / tubes)

let ccv_jofemar_arr_coins = {

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

let ccv_jofemar_arr_bills = {

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

let ccv_jofemar_arr_bills_stacker = {

    "P20": 0, "P50": 0, "P100": 0, "P200": 0, "P500": 0, "P1000": 0,

}

// array of coins in the tubes, to fill it the corresponding function must be executed

let ccv_jofemar_arr_coins_tubes = {

    "C50": 0, "G50": 0, "P1": 0, "P2": 0, "P5": 0, "P10": 0

};

// store temperature readings

let ccv_jofemar_temperature_log_arr = [];

// scrow enable or disable, by default disable

let ccv_jofemar_scrow = "00";



// helps to know if the system is in CONTROL, to do functions only for this place

let ccv_jofemar_control = false;



// just to identify the active page

let ccv_jofemar_control_page = undefined;



// if it is true, a full screen message will be displayed if the device is not connected

let ccv_jofemar_show_no_device = true;



// auxiliary variable for process iteration

let ccv_jofemar_aux_iteration = undefined;



// Route where is the image to be shown if the device is not detected

let ccv_jofemar_cod_img_no_detected = "/app/includes/images/linkers/machine_disconnected.gif";
let ccv_jofemar_cod_img_door_open = "/app/includes/images/linkers/machine_door_open.png";
let ccv_jofemar_cod_img_door_closed = "/app/includes/images/linkers/machine_ok.png";

let ccv_slave_jofemar_cod_img_no_detected = "/app/includes/images/linkers/machine_disconnected.gif";
let ccv_slave_jofemar_cod_img_door_open = "/app/includes/images/linkers/machine_door_open.png";
let ccv_slave_jofemar_cod_img_door_closed = "/app/includes/images/linkers/machine_ok.png";

let ccv_ext_cod_img_disconnected="/app/includes/images/linkers/central_error.png";
let ccv_ext_cod_img_connected="/app/includes/images/linkers/central_ok.gif";

let ccv_jofemar_modal_error_img_x = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NTEuNzQgNDUxLjc0Ij48cGF0aCBkPSJNNDQ2LjMyNCAzNjcuMzgxTDI2Mi44NTcgNDEuNjkyYy0xNS42NDQtMjguNDQ0LTU4LjMxMS0yOC40NDQtNzMuOTU2IDBMNS40MzUgMzY3LjM4MWMtMTUuNjQ0IDI4LjQ0NCA0LjI2NyA2NCAzNi45NzggNjRoMzY1LjUxMWMzNC4xMzMtMS40MjIgNTQuMDQ0LTM1LjU1NiAzOC40LTY0eiIgZmlsbD0iI2UyNGM0YiIvPjxwYXRoIGQ9Ik0yMjUuODc5IDYzLjAyNWwxODMuNDY3IDMyNS42ODlINDIuNDEzTDIyNS44NzkgNjMuMDI1eiIgZmlsbD0iI2ZmZiIvPjxnIGZpbGw9IiMzZjQ0NDgiPjxwYXRoIGQ9Ik0xOTYuMDEzIDIxMi4zNTlsMTEuMzc4IDc1LjM3OGMxLjQyMiA4LjUzMyA4LjUzMyAxNS42NDQgMTguNDg5IDE1LjY0NCA4LjUzMyAwIDE3LjA2Ny03LjExMSAxOC40ODktMTUuNjQ0bDExLjM3OC03NS4zNzhjMi44NDQtMTguNDg5LTExLjM3OC0zNC4xMzMtMjkuODY3LTM0LjEzMy0xOC40OS0uMDAxLTMxLjI5IDE1LjY0NC0yOS44NjcgMzQuMTMzeiIvPjxjaXJjbGUgY3g9IjIyNS44NzkiIGN5PSIzMzYuMDkyIiByPSIxNy4wNjciLz48L2c+PC9zdmc+";
let ccv_jofemar_modal_warning_img_x = "https://thumbs.gfycat.com/UniqueSizzlingFinwhale-max-1mb.gif";

let ccv_jofemar_img_reload_modal = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyLjAxOSA1MTIuMDE5Ij48cGF0aCBkPSJNNDYzLjQ4OSAyODcuOTkzaC02NC4zMmMtOC4zNTIgMC0xNC43ODQgNi41Ni0xNS43NDQgMTQuODQ4LTguNDggNzMuMTUyLTc4Ljg0OCAxMjcuNjQ4LTE1Ny4yNDggMTA5LjY5Ni00Ni4yMDgtMTAuNTkyLTgzLjc0NC00OC4wNjQtOTQuNC05NC4yNC0xOS4yOTYtODMuNjggNDQuMDY0LTE1OC4zMDQgMTI0LjUxMi0xNTguMzA0djQ4YzAgNi40NjQgMy45MDQgMTIuMzIgOS44ODggMTQuNzg0czEyLjgzMiAxLjA4OCAxNy40NC0zLjQ4OGw5Ni05NmM2LjI0LTYuMjQgNi4yNC0xNi4zODQgMC0yMi42MjRsLTk2LTk2Yy00LjYwOC00LjU0NC0xMS40NTYtNS45Mi0xNy40NC0zLjQ1NnMtOS44ODggOC4zMi05Ljg4OCAxNC43ODR2NDhjLTEyNC42MDggMC0yMjUuNzYgMTAyLjI0LTIyMy45NjggMjI3LjI2NCAxLjY5NiAxMTguODQ4IDEwMS43MjggMjE4Ljk0NCAyMjAuNTc2IDIyMC43MzYgMTE5LjM5MiAxLjc5MiAyMTguMDgtOTAuMzY4IDIyNi43ODQtMjA3LjE2OC42NzItOS4xMi03LjA0LTE2LjgzMi0xNi4xOTItMTYuODMyeiIgZmlsbD0iI2Q5ZDlkOSIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIi8+PC9zdmc+";

let ccv_jofemar_read_temperature = true;

let ccv_jofemar_modal_active_channels_selection = ''+
'<div class="modal" data-backdrop="static" tabindex="-1" role="dialog" id="ccv-jofemar-modal-selection">'+
  '<div class="modal-dialog" role="document">'+
    '<div class="modal-content">'+
      '<div class="modal-header">'+
        '<h5 class="modal-title">Asignando Motores Activos</h5>'+
      '</div>'+
      '<div class="modal-body">'+
        '<p class="w-100 text-center">Porcentaje.<br><span id="ccv-jofemar-modal-selection-span" style="font-size:4rem;">0%</span></p>'+
        '<div class="progress">'+
            '<div id="ccv-jofemar-modal-selection-progressbar" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 75%"></div>'+
        '</div>'+
        '<p>Espera se estan asignando los canales activos!. Este mensaje se cerrará cuando termine.</p>'+
      '</div>'+
    '</div>'+
  '</div>'+
'</div>'+
'<!--Errors-->'+
'<div class="modal fade" id="ccv_jofemar_errors_modal" tabindex="-1" aria-labelledby="ccv_jofemar_errors_modalLabel" aria-hidden="true" data-backdrop="static">'+
'<div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">'+
  '<div class="modal-content border-0 shadow">'+
    '<div class="modal-header border-0 bg-white">'+
      '<h5 class="modal-title w-100 h1 text-center" id="ccv_jofemar_errors_modal_title">Error</h5>'+
    '</div>'+
    '<div class="modal-body border-0 bg-white h3 text-center" id="ccv_jofemar_errors_modal_content"></div>'+
    '<div class="modal-body border-0 bg-white text-center">'+
    '<button type="button" class="btn btn-info" id="btn-reset-errors-jof-modal" onclick="ccvJofemarCheckErr()">Reiniciar errores</button><br>'+
    '<div id="text-waiting-reset-errors-jof-modal"></div>'+
    '</div>'+
    '<div class="modal-footer border-0 bg-white">'+
        '<img id="ccv_jofemar_errors_modal_img" class="w-100" style="max-width:100px;" src="'+ccv_jofemar_modal_error_img_x+'" alt="Error">'+
    '</div>'+
    '<div class="modal-footer border-0 bg-white">'+
        '<a href="'+location.href+'" class="w-100 text-dark">Recargar</a>'+
    '</div>'+
  '</div>'+
'</div>'+
'</div>';

// time for the interval between the sensing check, default 500ms

let ccv_jofemar_sense_interval = 500;



// time to reload the page once the sensing result is obtained, default 2000ms

let ccv_jofemar_time_to_reload = 2000;



// if it is required to reload the page once the product is delivered, change to true

let cvv_jofemar_reload_when_finish = false;



// code to insert below all the html code once the page is loaded

let ccv_jofemar_code_device = '';


    let ccv_jofemar_channel_start_verification = 110;
let ccv_jofemar_channel_stop_verification = 239;
    let ccv_jofemar_channel_start_verification_original = 110;
let ccv_jofemar_channel_stop_verification_original = 239;


/******************************************************/

/* CONSTANTS OF THE VARIABLES STORE A STATIC VALUE TO */

/* RESTORE THE VARIABLES AND NOT HAVE TO RELOAD THE   */

/* COMPLETE PAGE                                      */

/******************************************************/



const dd_creator = "Q3JlYXRlZCBieSBkYW5pZG9ibGUgKGh0dHBzOi8vZ2l0aHViLmNvbS9kYW5pZG9ibGUp";

const dd_copy = "LyoqCiAqIENyZWF0ZWQgYnkgZGFuaWRvYmxlIChodHRwczovL2dpdGh1Yi5jb20vZGFuaWRvYmxlKQogKiBAYXV0aG9yIERhbmllbCBTYW5kb3ZhbCBBS0EgZGFuaWRvYmxlCiAqIEB5ZWFyIDIwMjEKICogQHdlYnNpdGUgaHR0cHM6Ly9kYW5pZG9ibGUuY29tCiAqCiAqIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uKgogKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICoKICogICAgICAjIyMgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyMgICAgICAgICAgICMjIyAgICAgICMjICAgICAgICAgICAqCiAqICAgICAgIyMjICAgICMjIyMjIyAgICAgICAgICAjIyAgICAgIyMjICAgICAgICAgICAjIyMgICAgICAjIyAgICAgICAgICAgKgogKiAgICAgICMjIyAgICAgICAgIyMgICMjICAgICAgICAgICAgICMjIyAgICAgICAgICAgIyMjICAgICAgIyMgICAgICAgICAgICoKICogICAjIyMjIyMgICAgIyMjIyMjICAjIyMjIyMgICMjICAjIyMjIyMgICAjIyMjIyAgICMjIyMjIyAgICMjICAjIyMjIyMjICAqCiAqICAjIyAgICMjICAgIyMgICAjIyAgIyMgICMjICAjIyAjIyAgICMjICAjIyAgICMjICAjIyMgICAjIyAjIyAgIyMjIyAgICAgKgogKiAgICMjIyMjIyAgICAjIyMjIyMgICMjICAjIyAgIyMgICMjIyMjIyAgICMjIyMjICAgIyMjIyMjIyAgIyMgICMjIyMjIyMgICoKICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqCiAqIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uKgogKiAqLw==";

const ccv_jofemar_interval_original = undefined;

const ccv_jofemar_waiting_for_sense_original = undefined;

const ccv_jofemar_price_original = undefined;

const ccv_jofemar_timer_to_response_original = undefined;

const ccv_jofemar_code_connection_expected_original = ["0x02", "0x30", "0x30", "0x81", "0x56", "0xFF", "0xFF", "0xF7", "0x3F", "0x03"];

const ccv_jofemar_status_dispensing_original = undefined;

const ccv_jofemar_exchange_original = 0;

const ccv_jofemar_amount_inserted_original = 0;

const ccv_jofemar_aux_iteration_original = 10;

const ccv_jofemar_time_response_original = 3000;

const ccv_jofemar_time_response_engines_original = 15000;

const ccv_jofemar_time_reconnect_original = 7000;

const ccv_jofemar_temperature_log_arr_original = []; // is an empty array

const ccv_jofemar_last_error_original = {"message": null, "handler": null, "code": null, "no_code": 666,};

const ccv_jofemar_arr_coins_original = {

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

const ccv_jofemar_arr_bills_original = {

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

const ccv_jofemar_arr_bills_stacker_original = {"P20": 0, "P50": 0, "P100": 0, "P200": 0, "P500": 0, "P1000": 0,}

const ccv_jofemar_arr_coins_tubes_original = {"C50": 0, "G50": 0, "P1": 0, "P2": 0, "P5": 0, "P10": 0};



/**

 * Restores the variables to their initial state, it is useful to avoid having to reload the page and also

 * to avoid errors in the application

 * @return void

 */

function ccvJofemarSoftReload() {

    // THE VARIABLES ARE EMPTYED SO THAT ERRORS ARE NOT GENERATED.

    // IT IS ASSIGNED THE DEFAULT VALUE THAT IS SAVED IN CONSTANTS WITH THE SAME NAME + "_original"

    ccv_jofemar_interval = ccv_jofemar_interval_original;

    ccv_jofemar_waiting_for_sense = ccv_jofemar_waiting_for_sense_original;

    ccv_jofemar_price = ccv_jofemar_price_original;

    ccv_jofemar_timer_to_response = ccv_jofemar_timer_to_response_original;

    ccv_jofemar_code_connection_expected = ccv_jofemar_code_connection_expected_original;

    ccv_jofemar_status_dispensing = ccv_jofemar_status_dispensing_original;

    ccv_jofemar_exchange = ccv_jofemar_exchange_original;

    ccv_jofemar_amount_inserted = ccv_jofemar_amount_inserted_original;

    ccv_jofemar_aux_iteration = ccv_jofemar_aux_iteration_original;

    ccv_jofemar_time_response = ccv_jofemar_time_response_original;

    ccv_jofemar_time_reconnect = ccv_jofemar_time_reconnect_original;

    ccv_jofemar_temperature_log_arr = ccv_jofemar_temperature_log_arr_original;

    ccv_jofemar_last_error = ccv_jofemar_last_error_original;

    ccv_jofemar_arr_coins = ccv_jofemar_arr_coins_original;

    ccv_jofemar_arr_bills = ccv_jofemar_arr_bills_original;

    ccv_jofemar_arr_bills_stacker = ccv_jofemar_arr_bills_stacker_original;

    ccv_jofemar_arr_coins_tubes = ccv_jofemar_arr_coins_tubes_original;

    ccv_jofemar_time_response_engines = ccv_jofemar_time_response_engines_original;

    ccv_jofemar_channel_start_verification = ccv_jofemar_channel_start_verification_original;
    ccv_jofemar_channel_stop_verification = ccv_jofemar_channel_stop_verification_original;


    /* Another function is called where the variables used in the project can also be cleaned,

     * for example if an id is saved, it can be cleaned so as not to create any duplicate or error

     */

    ccvJofemarExtSoftReload();

}





/****************************/

/**  Chrome App Listeners  **/

/****************************/

// if the port is disconnected or if the application has an error, it also happens if the application

// is restarting and the page is already loaded.

ccv_jofemar_port_app.onDisconnect.addListener(obj => {

    ccv_jofemar_last_error["message"] = ccv_jofemar_lang.linker.status.app.lost_connection.message;

    ccv_jofemar_last_error["handler"] = null;

    ccv_jofemar_last_error["code"] = null;

    ccv_jofemar_last_error["no_code"] = 667;



    if (chrome.runtime.lastError) {

        //console.log(chrome.runtime.lastError);
        addLog('log',chrome.runtime.lastError)

    }

    ccvJofemarExtConnectionLost();

});



// When the application responds something this listener gets the data

ccv_jofemar_port_app.onMessage.addListener(function (ccv_jofemar_msg) {

    // the response is in JSON format so it is transformed into an object for better handling

    let ccv_jofemar_unparsed = JSON.parse(ccv_jofemar_msg.msjBD);

    // if the code is 0 = message from the application

    // if the code is an array of X positions = device message

    // a function is called for each response code to process the responses and assign the results

    if (ccv_jofemar_unparsed.code === 0) {

        ccvJofemarProcessMessage(ccv_jofemar_unparsed);

    } else if (ccv_jofemar_unparsed.code && ccv_jofemar_unparsed.code.length > 0) {

        // STOPPING THE REPETITION IN CASE THE RECONNECTION IS IN PROCESS

        if (ccv_jofemar_interval !== undefined) {

            clearInterval(ccv_jofemar_interval);

            ccv_jofemar_interval = undefined;

        }

        ccvJofemarProcessData(ccv_jofemar_unparsed);

    } else {

        ccvJofemarExtCodeDivided(ccv_jofemar_unparsed.code);

    }

    //console.log(ccv_jofemar_unparsed);

});



function ccvJofemarOtherResponses(unparsed) {

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

        additional.machine.dec = (ccvJofemarHexToDec(code_hex[1]) - 128);

    }



    switch (code_hex[2].toString().toUpperCase()) {

        case '54':

            //tecla pulsada en la maquina

            additional.key = {

                'hex': code_hex[3],

                'dec': ccvJofemarHexToDec(code_hex[3]),

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

            ccvJofemarExtEventMachine({

                'event': 'keypress',

                'code': JSON.stringify(code_hex),

                'additional': additional

            });

            break;

        case '50':

            //Puerta abierta/cerrada

            switch (code_hex[3].toString().toUpperCase()) {

                case '4F':
                    ccvJofemarExtNoDeviceConnected('open');
                    //puerta abierta

                    data.message = ccv_jofemar_lang.jofemar.other.door.open.message;

                    data.description = ccv_jofemar_lang.jofemar.other.door.open.description.replaceAll('{no_machine}', additional.machine.dec);

                    data.code = 6102;
                    additional.door = {};
                    additional.door.status = 'open';

                    break;

                case '43':
                    ccvJofemarExtDeviceConnected('close');
                    //puerta cerrada

                    data.message = ccv_jofemar_lang.jofemar.other.door.close.message;

                    data.description = ccv_jofemar_lang.jofemar.other.door.close.description.replaceAll('{no_machine}', additional.machine.dec);

                    data.code = 6103;
                    additional.door = {};
                    additional.door.status = 'closed';

                    break;

            }

            ccvJofemarExtEventMachine({'event': 'door', 'code': JSON.stringify(code_hex), 'additional': additional});

            break;

        case '43'://[2]
            switch (code_hex[3].toString().toUpperCase()){
                case '43':
                    switch (code_hex[4].toString().toUpperCase()){
                        case '43':
                        case '41':
                        case '44':
                        default:
                            data.code = 6115;
                            if(code_hex[5].toString().toUpperCase() === "FD"){ // channel disconnected
                                data.message = ccv_jofemar_lang.jofemar.other.channel.disconnected.message;
                                data.description = ccv_jofemar_lang.jofemar.other.channel.disconnected.description;
                                additional.machine.channel = ccv_jofemar_test_engine_number;
                                additional.machine.status = 0;
                            }
                            else if(code_hex[5].toString().toUpperCase() === "FC"){ // channel connected
                                data.message = ccv_jofemar_lang.jofemar.other.channel.connected.message;
                                data.description = ccv_jofemar_lang.jofemar.other.channel.connected.description;
                                additional.machine.channel = ccv_jofemar_test_engine_number;
                                additional.machine.status = 1;
                            }
                            else{ // chanel sold out
                                data.message = ccv_jofemar_lang.jofemar.other.channel.sold_out.message;
                                data.description = ccv_jofemar_lang.jofemar.other.channel.sold_out.description;
                                additional.machine.channel = ccv_jofemar_test_engine_number;
                                additional.machine.status = 1;
                            }
                            data.additional = JSON.stringify(additional);
                            break;
                    }
                    break;
                case '54':
                    additional.working_temp = code_hex[4];
                    additional.temp = (ccvJofemarHexToDec(code_hex[4]) - ccvJofemarHexToDec('80'))/2;
                    extJofWorkingTemperature(additional);
                    /**
                     * -----------------------------------------------------------------------
                        TEMPERATURA DE CORTE

                        [0]  =  02 -> comienzo del mensaje
                        [1]  =  81 -> direccion de la maquina (respuesta - 80 hex)
                        [2]  =  43 -> checking 
                        [3]  =  54 -> identificador de temperatura de corte

                        [4]  =  8F -> temperatura de corte ((resultado - 80)/2) = xgrados celcius

                        [5]  =  F9 -> checksum 1
                        [6]  =  AF -> checksum 2
                        [7]  =  03 -> fin del mensaje


                        (8f - 80) = 0F = 15 (15/2) = 7.5grados celcius 
                     */
                    break;
                case '74'://[3] temperatura actual
                    
                    switch((code_hex[4]).toString().toUpperCase()){
                        case '2B':
                            additional.sign = '+';
                            break;
                        case '2E':
                            additional.sign = '-';
                            break;
                        case '20':
                        default:
                            additional.sign = null;
                            break;
                    }
                    switch((code_hex[5]).toString().toUpperCase()){
                        case '30':case '31':case '32':case '33':case '34':case '35':case '36':case '37':case '38':case '39':
                            additional.temp_tens = ccvJofemarHexToDec(code_hex[5]) - 48;
                            break;
                        case '2A':    
                        default:
                            additional.temp_tens = null;
                            break;
                    }
                    switch((code_hex[6]).toString().toUpperCase()){
                        case '30':case '31':case '32':case '33':case '34':case '35':case '36':case '37':case '38':case '39':
                            additional.temp_units = ccvJofemarHexToDec(code_hex[6]) - 48;
                            break;
                        case '2A':    
                        default:
                            additional.temp_units = null;
                            break;
                    }

                    additional.dec_point = '?';
                    if((code_hex[7]).toString().toUpperCase() == '2E'){
                        additional.dec_point = '.';
                    }
                    
                    switch((code_hex[8]).toString().toUpperCase()){
                        case '30':case '31':case '32':case '33':case '34':case '35':case '36':case '37':case '38':case '39':
                            additional.temp_decimals = ccvJofemarHexToDec(code_hex[8]) - 48;
                            break;
                        case '2A':    
                        default:
                            additional.temp_decimals = null;
                            break;
                    }

                    additional.degradees = '?';
                    if((code_hex[9]).toString().toUpperCase() == '7F'){
                        additional.degradees = '°';
                    }

                    additional.type_degradees = '?';
                    if((code_hex[10]).toString().toUpperCase() == '43'){
                        additional.type_degradees = 'C';
                    }
                    else if((code_hex[10]).toString().toUpperCase() == '46'){
                        additional.type_degradees = 'F';
                    }

                    additional.str = additional.sign+additional.temp_tens+additional.temp_units+additional.dec_point+additional.temp_decimals+additional.degradees+additional.type_degradees;

                    extJofCurrentTemperature(additional);

                    //console.log(additional);
                    /**
                     [0] =  02 -> comienzo del mensaje
                     [1] =  81 -> direccion de la maquina
                     [2] =  43 -> checking
                     [3] =  74 -> identificador de consulta de la temperatura actual

                     [4] =  2b -> 0x20 = '' error en el termometro, 0x2b = '+', 0x2e = '-'
                     [5] =  34 -> 0x2a = '*' error en el termometro, 0x30-0x39 decenas del valor de la temp
                     [6] =  37 -> 0x2a = '*' error en el termometro, 0x30-0x39 unidades del valor de la temp
                     [7] =  2e -> 0x2e = punto decimal
                     [8] =  33 -> 0x2a = '*' error en el termometro, 0-9 decimales del valor de la temp
                     [9] =  7f -> 0x7f = '°' = grados
                     [10] =  46 -> 0x43 = celsius, 0x46 = fahrenheit
                     
                     [11] =  f6 -> checksum 1
                     [12] =  ff -> checksum 2
                     [13] =  03 -> fin del mensaje
                     */
                    break;
            }
            break;

    }

    return data;

}



function ccvJofemarStatus(unparsed) {

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

            //ccvJofemarCleanSenseProduct

            if(ccv_jofemar_interval_to_check_matrix_dispense !== undefined){

                ccv_jofemar_status_dispensing = true;

                clearInterval(ccv_jofemar_interval_to_check_matrix_dispense);

                ccv_jofemar_interval_to_check_matrix_dispense = undefined;

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

            break;

        case '33':

            data.message = ccv_jofemar_lang.jofemar.status.h32.message;

            data.description = ccv_jofemar_lang.jofemar.status.h32.description;

            data.code = 6013;

            if(ccv_jofemar_interval_to_check_matrix_dispense !== undefined){

                ccv_jofemar_status_dispensing = false;
                //alert('Bandeja no valida');
                //console.error('Bandeja no valida');
                addLog('error','Bandeja no valida')

                clearInterval(ccv_jofemar_interval_to_check_matrix_dispense);

                ccv_jofemar_interval_to_check_matrix_dispense = undefined;

            }

            break;

        case '34':

            data.message = ccv_jofemar_lang.jofemar.status.h34.message;

            data.description = ccv_jofemar_lang.jofemar.status.h34.description;

            data.code = 6014;

            

            if(ccv_jofemar_interval_to_check_matrix_dispense !== undefined){

                ccv_jofemar_status_dispensing = false;

                clearInterval(ccv_jofemar_interval_to_check_matrix_dispense);

                ccv_jofemar_interval_to_check_matrix_dispense = undefined;

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

            if(ccv_jofemar_interval_to_check_matrix_dispense !== undefined){

                ccv_jofemar_status_dispensing = false;

                clearInterval(ccv_jofemar_interval_to_check_matrix_dispense);

                ccv_jofemar_interval_to_check_matrix_dispense = undefined;

                ccvJofemarCollectProduct(1);

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

        

            if(ccv_jofemar_interval_to_check_matrix_dispense !== undefined){

                ccv_jofemar_status_dispensing = true;

                clearInterval(ccv_jofemar_interval_to_check_matrix_dispense);

                ccv_jofemar_interval_to_check_matrix_dispense = undefined;

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

            if(ccv_jofemar_interval_to_check_matrix_dispense !== undefined){

                ccv_jofemar_status_dispensing = false;

                clearInterval(ccv_jofemar_interval_to_check_matrix_dispense);

                ccv_jofemar_interval_to_check_matrix_dispense = undefined;

                ccvJofemarCollectProduct(1);

            }

            break;

        case '4F':

            data.message = ccv_jofemar_lang.jofemar.status.h4F.message;

            data.description = ccv_jofemar_lang.jofemar.status.h4F.description;

            data.code = 6035;

            if(ccv_jofemar_interval_to_check_matrix_dispense !== undefined){

                ccv_jofemar_status_dispensing = true;

                clearInterval(ccv_jofemar_interval_to_check_matrix_dispense);

                ccv_jofemar_interval_to_check_matrix_dispense = undefined;

                ccvJofemarCollectProduct(1);
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
    ccvJofemarErrorDisplay(1,code_hex[1].toString().toUpperCase())

    return data;

}



// make the connection to the device

function ccvJofemarConnect(machine = 1) {

    //ccvJofemarConnectMachine(machine);


    ccvJofemarExtMessageConnection();
    ccvJofemarSendMessage(JSON.stringify("connect"));

    setTimeout(()=>{
        //ccvJofemarStatusMachine(1);
    },300)//
    

}



// Assign variable of connection for machine, by default loads with 0x81 = 1st machine

// @param machine is a decimal number between 1 and 31

function ccvJofemarConnectMachine(machine = 1) {

    if (parseInt(machine) < 1 || parseInt(machine) > 31) {

        alert(ccv_jofemar_lang.app.error.machine_unknown);

    }

    let hex_machine = (128 + parseInt(machine)).toString(16);

    let f_hex = ['02', '30', '30', hex_machine, '53', 'FF', 'FF'];

    ccvJofemarMakeSendData(f_hex, 'const_conn_machine');

}



// reconnect to device if disconnected

function ccvJofemarReconnect() {

    ccvJofemarExtMessageReconnection();

    ccvJofemarConnect();

}



// perform a safe and authorized disconnection of the device

function ccvJofemarDisconnect() {

    ccvJofemarSendMessage(JSON.stringify("disconnect"));

}



// Send messages to the application
function ccvJofemarSendMessage(instruction, cod) {
     
    if (cod === undefined) {

        cod = JSON.stringify("");

    } else {

        ccvJofemarExtDisplayCode(instruction, cod);

    }
    //console.log(instruction,cod);
    addLog("log",instruction,cod);

    ccv_jofemar_port_app.postMessage({toDo: instruction, code: cod});
    



    if (JSON.parse(instruction) === "enginesMatrix") {

        // Start waiting for a response from the engines

        // The time of the motors can be configured, also dispense can be with sensor

        // The response time may vary, so it is advisable to customize it

        ccv_jofemar_timer_to_response = setTimeout(function () {

            ccvJofemarTimerNoResponse(cod, instruction);

        }, ccv_jofemar_time_response_engines);

    } else {

        // Starts a X second count, where if the answer is not presented the function will be called

        ccv_jofemar_timer_to_response = setTimeout(function () {

            ccvJofemarTimerNoResponse(cod, instruction);

        }, ccv_jofemar_time_response);

    }

}



// Generates the sum of hexadecimals and returns the value in hexadecimal

function ccvJofemarSumHex(arr) {

    //arr[1]+arr[2]+arr[3]+arr[4]+arr[5]+arr[6]+arr[7]+arr[8]+arr[9]+arr[10]...

    let sum = 0;

    arr.forEach((value, index) => {

        sum += parseInt(value, 16);

    });

    return sum.toString(16);

}



// Add 0x before each value in an array. | 00 => 0x00

function ccvJofemarAdd0x(cod) {

    let code = [];

    cod.forEach((value, index) => {

        code[index] = "0x" + value;

    });

    return code;

}



// convert a decimal value to hexadecimal

function ccvJofemarDecToHex(val) {

    return parseInt(val).toString(16).toUpperCase();

}



// convert a hexadecimal value to decimal

function ccvJofemarHexToDec(val) {

    return parseInt(val, 16);

}



// convert a hexadecimal array to a decimal array

function ccvJofemarArrDecToHex(arr) {

    let new_arr = [];

    arr.forEach((value, index) => {

        new_arr[index] = ccvJofemarDecToHex(value);

    });

    return new_arr;

}



// convert a decimal array to a hexadecimal array

function ccvJofemarArrHexToDec(arr) {

    let new_arr = [];

    arr.forEach((value, index) => {

        new_arr[index] = ccvJofemarHexToDec(value);

    });

    return new_arr;

}



// TIMEOUT if no response is presented for a certain time that the request was sent

function ccvJofemarTimerNoResponse(code, handler) {

    ccv_jofemar_last_error["message"] = ccv_jofemar_lang.linker.status.response.timeout;

    ccv_jofemar_last_error["handler"] = JSON.parse(handler);

    ccv_jofemar_last_error["code"] = JSON.parse(code);

    clearTimeout(ccv_jofemar_timer_to_response);

    if (ccv_jofemar_last_error["handler"] === "connect") {

        ccvJofemarExtNoDeviceConnected();

        ccvJofemarReconnect();

    }



    ccvJofemarExtTimeout();

}



// clean the last error

function ccvJofemarCleanErrors() {

    ccv_jofemar_last_error = ccv_jofemar_last_error_original;

}



// Responses of the application (not of the device)

function ccvJofemarProcessMessage(unparsed) {

    clearTimeout(ccv_jofemar_timer_to_response);

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

            ccvJofemarExtNoDeviceConnected();

            if (ccv_jofemar_interval === undefined) {

                // X seconds between each reconnection attempt

                ccv_jofemar_interval = setInterval(ccvJofemarReconnect, ccv_jofemar_time_reconnect);

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

            ccvJofemarExtNoDeviceConnected();

            // connection not completed

            if (ccv_jofemar_interval === undefined) {

                // X seconds between each reconnection attempt

                ccv_jofemar_interval = setInterval(ccvJofemarReconnect, ccv_jofemar_time_reconnect);

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



    ccvJofemarExtMessageApplication(obj);

}



function ccvJofemarCleanSenseProduct() {

    clearInterval(ccv_jofemar_waiting_for_sense);

    ccv_jofemar_waiting_for_sense = ccv_jofemar_waiting_for_sense_original;

    ccv_jofemar_status_dispensing = ccv_jofemar_status_dispensing_original;

}



// reload when an operation completes

function ccvJofemarReload(hard) {

    // hard = hard reload

    // if the constant is true it will enter

    if (cvv_jofemar_reload_when_finish) {

        // if hard is different from undefined and hard is true

        if (hard !== undefined && hard) {

            location.reload();

        }// if the hard is undefined, it will only do a soft reload, (an internal reload of the variables)

        else {

            ccvJofemarSoftReload();

        }

    }

}



// Performs a hexadecimal check, they must always be 2 characters

function ccvJofemarCheckHexMaker(hex) {

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

        if (ccv_jofemar_console_active) {

            //console.log(data);
            addLog("log",data);

        }

    }

}



// Show in console the warns

if (typeof window.consoleWarn === 'undefined') {

    window.consoleWarn = function (...data) {

        if (ccv_jofemar_console_active) {

            //console.warn(data);
            addLog("warn",data);

        }

    }

}



// Show in console the errors

if (typeof window.consoleError === 'undefined') {

    window.consoleError = function (...data) {

        if (ccv_jofemar_console_active) {

            //console.error(data);
            addLog("error",data);

        }

    }

}



// Show in console the debug data

if (typeof window.consoleDebug === 'undefined') {

    window.consoleDebug = function (...data) {

        if (ccv_jofemar_console_active) {

            //console.debug(data);
            addLog("debug",data);
        }

    }

}



// process the code that came from the device and identify what it means

function ccvJofemarProcessData(unparsed) {

    clearTimeout(ccv_jofemar_timer_to_response);

    ccv_jofemar_timer_to_response = undefined;



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

                processed_information = ccvJofemarOtherResponses(unparsed);

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
            ccvJofemarExtDeviceConnected();

            if (code_hex[1] && !code_hex[2]) {

                processed_information = ccvJofemarStatus(unparsed);

            }

            else if(!code_hex[1]){

                

                processed_information.message = ccv_jofemar_lang.jofemar.alone.message;

                processed_information.description = ccv_jofemar_lang.jofemar.alone.description;

                processed_information.request = null;// "Variable that saves the last request that was sent"

                processed_information.code = 6001;

                processed_information.additional = ccv_jofemar_lang.jofemar.alone.additional;



                //console.log(ccv_jofemar_lang.jofemar.alone);
                addLog("log",ccv_jofemar_lang.jofemar.alone);

                

                if(ccv_jofemar_interval_to_check_matrix_dispense !== undefined){

                    ccv_jofemar_status_dispensing = false;

                    clearInterval(ccv_jofemar_interval_to_check_matrix_dispense);

                    ccv_jofemar_interval_to_check_matrix_dispense = undefined;

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

    ccvJofemarExtResponses(obj);

}



function ccvJofemarCalcCheckSums(val) {

    val = ccvJofemarAdd0x([ccvJofemarDecToHex(parseInt(val))]);

    let f_ck = [];

    f_ck.push((((val & 0xFF) | 0xF0).toString(16)).toUpperCase());

    f_ck.push((((val & 0xFF) | 0x0F).toString(16)).toUpperCase());

    return f_ck;

}



function ccvJofemarMakeSendData(f_hex, f_to_do) {

    let f_dec = ccvJofemarHexToDec(ccvJofemarSumHex(f_hex));

    let f_ck = ccvJofemarCalcCheckSums(f_dec);

    for (let j = 0; j < 2; j++) {

        f_hex.push(f_ck[j]);

    }

    f_hex.push('03');

    f_hex = ccvJofemarAdd0x(f_hex);



    if (f_to_do === 'const_conn_machine') {

        ccv_jofemar_code_connection_expected = f_hex;

    }

    //addLog('log','send jofemar',f_to_do,f_hex);
    ccvJofemarSendMessage(JSON.stringify(f_to_do), JSON.stringify(f_hex));

}





/**

 * Functions for jofemar machines

 *

 * machine must be a decimal number between 1 and 31

 * in all next functions

 */



// dispense products

let ccv_jofemar_interval_to_check_matrix_dispense = undefined;

function ccvJofemarEnginesMatrix(machine = 1, tray, channel) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '56', tray.toString(), channel.toString()]

    ccvJofemarMakeSendData(f_hex, 'enginesMatrix');

    
    setTimeout(()=>{
        ccv_jofemar_interval_to_check_matrix_dispense = setInterval(()=>{
            ccvJofemarStatusMachine(machine);
        },2000);
    },4000)

}



// collect product

function ccvJofemarCollectProduct(machine = 1) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '4E', 'FF', 'FF'];

    ccvJofemarMakeSendData(f_hex, 'collect');

}



//reset

function ccvJofemarReset(machine = 1, param) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '52', param, 'FF'];

    ccvJofemarMakeSendData(f_hex, 'reset');

}



//Lights

function ccvJofemarLights(machine = 1, param) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '4C', param, 'FF'];

    ccvJofemarMakeSendData(f_hex, 'light');

}



//program

function ccvJofemarProgramMachine(machine = 1, param1, param2) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '50', param1, param2];

    ccvJofemarMakeSendData(f_hex, 'program');

}



//motor voltage

function ccvJofemarVoltage(machine = 1, param1, param2) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '47', param1, param2];

    ccvJofemarMakeSendData(f_hex, 'voltage');

}



// push out product

function ccvJofemarPushOutProduct(machine = 1, param1, param2) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '4F', param1, param2];

    ccvJofemarMakeSendData(f_hex, 'push_out');

}



// after dispensing

function ccvJofemarAfterDispensing(machine = 1, param1, param2) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '45', param1, param2];

    ccvJofemarMakeSendData(f_hex, 'after_dispensing');

}



// consult data of machine

function ccvJofemarConsultData(machine = 1, param1, param2 = 'FF') {
    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '43', param1, param2];

    ccvJofemarMakeSendData(f_hex, 'check_data');

}



// diplay, param2 must be an array

function ccvJofemarDisplayConfig(machine = 1, param1, param2) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '44', param1];

    for (let i = 0; i < param2.length; i++) {

        f_hex.push(param2[i]);

    }

    ccvJofemarMakeSendData(f_hex, 'display');

}



// watch

function ccvJofemarWatch(machine = 1, param) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '72'];

    param.split(' ').forEach((value) => {

        f_hex.push(value);

    });

    ccvJofemarMakeSendData(f_hex, 'watch');

}



// enable or disable event status

function ccvJofemarEventStatus(machine = 1, param) {

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '41', '41', param];

    ccvJofemarMakeSendData(f_hex, 'event-status');

}



// estatus

function ccvJofemarStatusMachine(machine = 1){

    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '53', 'FF', 'FF'];

    ccvJofemarMakeSendData(f_hex, 'status');

}



// Code to send custom hexadecimals to device

// @var code must be a STRING with full hexadecimals using 1 space of separation, don't include 0x before of each byte

// Example: 02 00 00 00 00 00 00 00 00 00 03

function ccvJofemarCustomCode(str) {

    let f_hex = [];

    let arr_code = str.split(' ');

    for (let i = 0; i < arr_code.length; i++) {

        f_hex.push(ccvJofemarCheckHexMaker(arr_code[i]));

    }

    ccvJofemarMakeSendData(f_hex, 'custom');

}



// calculate change

function ccvJofemarCalculateChange() {

    if (ccv_jofemar_price !== undefined) {

        return {"error": ccv_jofemar_lang.app.price.undefined};

    }

    // If the amount inserted is equal to the price

    if (ccv_jofemar_amount_inserted === ccv_jofemar_price) {

        ccv_jofemar_exchange = 0;

    } else if (ccv_jofemar_amount_inserted > ccv_jofemar_price) {

        ccv_jofemar_exchange = ccv_jofemar_amount_inserted - ccv_jofemar_price;

    } else {

        return {"error": ccv_jofemar_lang.app.price.missing_amount};

    }

    return {

        "exchange": ccv_jofemar_exchange,

        "error": 0,

    };

}



let ccv_jofemar_counter_active_channels_current = 0;
function ccvJofemarAssignActiveChannels(machine = 1){
    let f_total = ccv_jofemar_channel_stop_verification - ccv_jofemar_channel_start_verification_original;//80
    let f_percentage = (ccv_jofemar_counter_active_channels_current * 100 / f_total);
    
    $('#ccv-jofemar-modal-selection-span').text(f_percentage.format(0, 3, ',', '.')+"%");
        $('#ccv-jofemar-modal-selection-progressbar').css('width',f_percentage.format(0, 3, ',', '.')+"%");
        $('#ccv-jofemar-modal-selection').modal('show');
    /*
    if(typeof swal === "function"){
        if(!swal.isVisible()){
            //swal.close();
        }
        Swal.fire({
            title: "En proceso!",
            text: "Espera se estan asignando los canales activos!. Este mensaje se cerrará cuando termine",
            icon: "warning",
            buttons: [],
        });
    }*/
    if(ccv_jofemar_channel_start_verification <= ccv_jofemar_channel_stop_verification){
        ccv_jofemar_test_engine_number = ccv_jofemar_channel_start_verification;
        ccvJofemarConsultData(machine = 1,'43',(ccv_jofemar_channel_start_verification).toString(16))
        setTimeout(()=>{
            ccv_jofemar_channel_start_verification++;
            ccv_jofemar_counter_active_channels_current++;
            ccvJofemarAssignActiveChannels(machine);
        },700)//
    }else{
        ccv_jofemar_channel_start_verification = ccv_jofemar_channel_start_verification_original;
        ccv_jofemar_test_engine_number = undefined;
        ccv_jofemar_counter_active_channels_current=0;
        
        $('#ccv-jofemar-modal-selection').modal('hide');
        $('#ccv-jofemar-modal-selection-span').text('0%');
        $('#ccv-jofemar-modal-selection-progressbar').css('width',"0%");

        /*
        if(typeof swal === "function"){
            if(swal.isVisible()){
                swal.close();
            }
        }*/
    }
}

if(typeof window.ccvJofemarApplyChannelActives === "undefined"){
    window.ccvJofemarApplyChannelActives = function (data) {
        //consoleLog(data);
        addLog("log",data);
        let form = new FormData();
        form.append('handler','enableChannelMachine');
        form.append('arr_obj', JSON.stringify(data));
        //send by ajax
        if(typeof send === "function"){
            send(form);
        }else{
            //console.error('Modify your ajax request, "send" it´s not a function');
            addLog("error",'Modify your ajax request, "send" it´s not a function');
        }
    }
}

function ccvJofemarRemoveErrorDisplay(){
    $('#ccv_jofemar_errors_modal').modal('hide');
}
function ccvJofemarErrorDisplay(f_machine,f_error,use_warnings=false){
    f_machine = parseInt(f_machine);
    f_error = f_error.toString().toUpperCase();
    let m = $('#ccv_jofemar_errors_modal');
    let t = $('#ccv_jofemar_errors_modal_title');
    let c = $('#ccv_jofemar_errors_modal_content');
    let i = $('#ccv_jofemar_errors_modal_img');
    
    let is_err = false;
    let is_warn = false;
    /** 
     * Errors
     */
    switch(f_error){
        case '35':
            is_err=true;
            c.text('Avería en el motor del ascensor, (posible atasco)');
            break;
        case '37':
            is_err=true;
            c.text('Avería en alguno de los fototransistores de la cuba');
            break;
        case '38':
            is_err=true;
            c.text('Ningún canal detectado');
            break;
        case '44':
            is_err=true;
            c.text('Avería en la botonera');
            break;
        case '45':
            is_err=true;
            c.text('ERROR DE ESCRITURA EN EEPROM');
            break;
        case '4A':
            is_err=true;
            c.text('ERROR EN DETECCION DE CONSUMO DEL EXTRACTOR');
            break;
        case '4C':
            is_err=true;
            c.text('ERROR BUSQUEDA BOCA DE SALIDA DE PRODUCTO');
            break;
        case '4D':
            is_err=true;
            c.text('INTERIOR DEL ASCENSOR BLOQUEADO');
            break;
        case '4E':
            is_err=true;
            c.text('ERROR EN VERIFICADOR DE DETECTOR DE PRODUCTO');
            break;
    }

    if(use_warnings){
        if(is_err){
            t.text('ERROR EN MÁQUINA '+f_machine);
            t.addClass('text-danger').removeClass('text-warning');
            i.attr('src',ccv_jofemar_modal_error_img_x);
        }else{
            t.text('Advertencia en máquina '+f_machine);
            t.addClass('text-warning').removeClass('text-danger');
            i.attr('src',ccv_jofemar_modal_warning_img_x);
        }
    
        /**
         * Warnings
         */
        switch(f_error){
            case '32':
                is_warn = true;
                c.text('Esta bandeja no es válida');
                break;
            case '33':
                is_warn = true;
                c.text('canal no válido');
                break;
            case '34':
                is_warn = true;
                c.text('canal vácio');
                break;
            case '39':
                is_warn = true;
                c.text('Averia en el detector de producto');
                break;
            case '41':
                is_warn = true;
                c.text('Averia en el bus 485 (si no tiene display ignorar)');
                break;
            case '43':
                is_warn = true;
                c.text('Alarma de ajuste del ascensor a 24v');
                break;
            case '46':
                is_warn = true;
                c.text('ERROR DE COMUNICACIÓN CON EL CTRL. TEMPERATURA');
                break;
            case '47':
                is_warn = true;
                c.text('TERMOMETRO DESCONECTADO');
                break;
            case '48':
                is_warn = true;
                c.text('TERMOMETRO DESCONFIGURADO');
                break;
            case '49':
                is_warn = true;
                c.text('TERMOMETRO AVERIADO');
                break;
            case '4B':
                is_warn = true;
                c.text('ERROR BUSQUEDA DE CANAL');
                break;
            case '50':
                is_warn = true;
                c.text('PRODUCTO CADUCADO POR TEMPERATURA');
                break;
        }        
    }else{
        if(is_err){
            t.text('ERROR EN MÁQUINA '+f_machine);
            t.addClass('text-danger').removeClass('text-warning');
            i.attr('src',ccv_jofemar_modal_error_img_x);
        }
    }
    if(is_err || is_warn){
        m.modal('show');
    }
}

function ccvJofemarDeprecationAlertFunctions() {

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

function ccvJofemarConfigCoinPurse() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Read the tubes in coin purse*/

function ccvJofemarReadTubes() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Dispense coins*/

function ccvJofemarCoinsOut() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Config bill purse*/

function ccvJofemarConfigBill() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Accept bill in recycler*/

function ccvJofemarAcceptBill() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Reject bill in recycler*/

function ccvRejectBill() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Dispense bills*/

function ccvJofemarBillsOut() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Read temperature of the machine*/

function ccvJofemarReadTemperature() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Enable or disable cooling relay*/

function ccvJofemarCoolingRelay() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Save memory bill*/

function ccvJofemarSaveMemoryBill() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * read memory bill*/

function ccvJofemarReadMemoryBill() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Disable nayax*/

function ccvJofemarDisableNayax() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Enable coin purse*/

function ccvJofemarEnableCoinPurse() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Disable coin purse*/

function ccvJofemarDisableCoinPurse() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Enable bill purse*/

function ccvJofemarEnableBillPurse() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Disable bill purse*/

function ccvJofemarDisableBillPurse() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Dispense with sensor*/

function ccvJofemarDispenseWithSensor() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Dispense with time to X seconds*/

function ccvJofemarDispenseWithTimer() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Enable cooling relay*/

function ccvJofemarEnableCoolingRelay() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Disable cooling relay*/

function ccvJofemarDisableCoolingRelay() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Return change, this function is for when the coin purse and the bill purse are working

 * The bill purse must be able to dispense bills otherwise use the function to return change only with coins

 * */

function ccvJofemarGiveChange() {

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



    let f_new_exchange = ccv_jofemar_exchange;

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

        "exchange": ccv_jofemar_exchange

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

function ccvJofemarGiveChangeCoins() {

    let f_coin_50c = 0;

    let f_coin_1p = 0;

    let f_coin_2p = 0;

    let f_coin_5p = 0;

    let f_coin_10p = 0;

    let f_new_exchange = ccv_jofemar_exchange;

    if (ccv_jofemar_exchange > 0) {

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

        "exchange": ccv_jofemar_exchange

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

function ccvJofemarGiveChangeBills() {

    let f_bill_20p = 0;

    let f_bill_50p = 0;

    let f_bill_100p = 0;

    let f_bill_200p = 0;

    let f_bill_500p = 0;

    let f_bill_1000p = 0;



    let f_new_exchange = ccv_jofemar_exchange;

    let f_error = {"change": false, "missing": 0};

    if (ccv_jofemar_exchange > 0) {



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

        "exchange": ccv_jofemar_exchange,

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


function ccvJofemarCheckErr(){
    $('#btn-reset-errors-jof-modal').hide();
    $('#text-waiting-reset-errors-jof-modal').text('Espera se esta realizando el proceso');
    ccvResetAll();
    setTimeout(function(){
        ccvJofemarRemoveErrorDisplay();
        setTimeout(function(){
            ccvJofemarStatusMachine(1);
            $('#btn-reset-errors-jof-modal').show();
            $('#text-waiting-reset-errors-jof-modal').text('');
        },1e3);
    },20e3)
}


/** @deprecated for incompatibility

 * nayax cashless*/

function ccvJofemarNayaxCashless() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * Test engines*/

function ccvJofemarExecuteMatrixTest() {

    ccvJofemarDeprecationAlertFunctions()

}



/** @deprecated for incompatibility

 * counts the money that is entered into the bill purse and the coin purse per session*/

function ccvJofemarCountMoney(money, where) {

    ccvJofemarDeprecationAlertFunctions();

    return;

    /**

     * If you want use or adapt the code below remove 2 lines before this comment

     */



    switch (money.toUpperCase()) {

        //coins

        case "G50":

            if (where === "tube") {

                ccv_jofemar_arr_coins.tubes.G50 += 1;

            } else {

                ccv_jofemar_arr_coins.box.G50 += 1;

            }

            ccv_jofemar_arr_coins.G50 += 1;

            ccv_jofemar_amount_inserted += .5;

            break;

        case "C50":

            if (where === "tube") {

                ccv_jofemar_arr_coins.tubes.C50 += 1;

            } else {

                ccv_jofemar_arr_coins.box.C50 += 1;

            }

            ccv_jofemar_arr_coins.C50 += 1;

            ccv_jofemar_amount_inserted += .5;

            break;

        case "P1":

            if (where === "tube") {

                ccv_jofemar_arr_coins.tubes.P1 += 1;

            } else {

                ccv_jofemar_arr_coins.box.P1 += 1;

            }

            ccv_jofemar_arr_coins.P1 += 1;

            ccv_jofemar_amount_inserted += 1;

            break;

        case "P2":

            if (where === "tube") {

                ccv_jofemar_arr_coins.tubes.P2 += 1;

            } else {

                ccv_jofemar_arr_coins.box.P2 += 1;

            }

            ccv_jofemar_arr_coins.P2 += 1;

            ccv_jofemar_amount_inserted += 2;

            break;

        case "P5":

            if (where === "tube") {

                ccv_jofemar_arr_coins.tubes.P5 += 1;

            } else {

                ccv_jofemar_arr_coins.box.P5 += 1;

            }

            ccv_jofemar_arr_coins.P5 += 1;

            ccv_jofemar_amount_inserted += 5;

            break;

        case "P10":

            if (where === "tube") {

                ccv_jofemar_arr_coins.tubes.P10 += 1;

            } else {

                ccv_jofemar_arr_coins.box.P10 += 1;

            }

            ccv_jofemar_arr_coins.P10 += 1;

            ccv_jofemar_amount_inserted += 10;

            break;

        //bills

        case "P20":

            if (where === "stacker") {

                ccv_jofemar_arr_bills.stacker.P20 += 1;

            } else {

                ccv_jofemar_arr_bills.recycler.P20 += 1;

            }

            ccv_jofemar_arr_bills.P20 += 1;

            ccv_jofemar_amount_inserted += 20;

            break;

        case "P50":

            if (where === "stacker") {

                ccv_jofemar_arr_bills.stacker.P50 += 1;

            } else {

                ccv_jofemar_arr_bills.recycler.P50 += 1;

            }

            ccv_jofemar_arr_bills.P50 += 1;

            ccv_jofemar_amount_inserted += 50;

            break;

        case "P100":

            if (where === "stacker") {

                ccv_jofemar_arr_bills.stacker.P100 += 1;

            } else {

                ccv_jofemar_arr_bills.recycler.P100 += 1;

            }

            ccv_jofemar_arr_bills.P100 += 1;

            ccv_jofemar_amount_inserted += 100;

            break;

        case "P200":

            if (where === "stacker") {

                ccv_jofemar_arr_bills.stacker.P200 += 1;

            } else {

                ccv_jofemar_arr_bills.recycler.P200 += 1;

            }

            ccv_jofemar_arr_bills.P200 += 1;

            ccv_jofemar_amount_inserted += 200;

            break;

        case "P500":

            if (where === "stacker") {

                ccv_jofemar_arr_bills.stacker.P500 += 1;

            } else {

                ccv_jofemar_arr_bills.recycler.P500 += 1;

            }

            ccv_jofemar_arr_bills.P500 += 1;

            ccv_jofemar_amount_inserted += 500;

            break;

        case "P1000":

            if (where === "stacker") {

                ccv_jofemar_arr_bills.stacker.P1000 += 1;

            } else {

                ccv_jofemar_arr_bills.recycler.P1000 += 1;

            }

            ccv_jofemar_arr_bills.P1000 += 1;

            ccv_jofemar_amount_inserted += 1000;

            break;

        default:

            //will not be added to the arrays

            break;

    }

    /**

     * The coins and bills arrays store the information of each session

     * UNCOMMENT THE 2 LINES BELOW TO DISPLAY THE CURRENCIES OF THE ACTIVE SESSION IN THE CONSOLE.

     * The ccv_jofemar_console_active constant must be active (true)

     */



    //let f_money_in_session=JSON.stringify({"bills":ccv_jofemar_arr_bills,"coins":ccv_jofemar_arr_coins});

    //consoleLog(JSON.parse(f_money_in_session));

}



/** @deprecated for incompatibility

 * Percentage of coins in tubes of the coin purse*/

function ccvJofemarPercentage() {

    ccvJofemarDeprecationAlertFunctions();

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

    arr["10"] = ((ccv_jofemar_arr_coins.tubes.P10) / 58 * 100).format(0, 3, ',', '.');

    arr["5"] = ((ccv_jofemar_arr_coins.tubes.P5) / 69 * 100).format(0, 3, ',', '.');

    arr["2"] = ((ccv_jofemar_arr_coins.tubes.P2) / 78 * 100).format(0, 3, ',', '.');

    arr["1"] = ((ccv_jofemar_arr_coins.tubes.P1) / 85 * 100).format(0, 3, ',', '.');

    arr["50c"] = ((ccv_jofemar_arr_coins.tubes.G50) / 78 * 100).format(0, 3, ',', '.');

    ccvJofemarExtPercentageTubes(arr);

}

function ccvJofemarReadCurrentTemperature(machine = 1){
    //02 30 30 81 43 74 FF F9 9F 03
    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '43', '74', 'FF'];

    ccvJofemarMakeSendData(f_hex, 'current temperature');
}

function ccvJofemarReadWorkingTemperature(machine=1){
    //02 30 30 81 43 - 54 FF F9 7F 03
    let f_hex = ['02', '30', '30', (128 + parseInt(machine)).toString(16), '43', '54', 'FF'];
    ccvJofemarMakeSendData(f_hex, 'working temperature');
}

function ccvJofemarSetWorkingTemperature(machine=1){
    let temp = document.getElementById('program_param2').value;
    if(temp.trim() == ''){
        Swal.fire('Selecciona una opción antes de guardar');
        return;
    }
    ccvJofemarProgramMachine(machine,'54',temp)

    setTimeout(function(){
        ccvJofemarReadWorkingTemperature(1);
    },2000)
}

//assigned-working-temperature - div para poner el valor de la temperatura 











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

console.debug(atob(dd_creator));

console.debug(atob(dd_copy));



