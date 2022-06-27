/*!
 * Weblinker v2.0 - web serial
 * @author danidoble
 * @year 2021
 * Copyright 2020-2022 Owl desarrollos
 * Copyright 2020-2022 Coin city mexico.
 */
"use strict"; //if you have problems with this you can comment it with -> //


if(typeof __demo === 'undefined'){
    let __demo = false;
}

let last_change_coin_purse = 0;

let owl_no_dispense_all_money = false;
/**
 * bytes to make connection with the device
 * @type {string[]}
 */
const owl_bytes_connection = ["F1", "06", "00", "00", "00", "00", "00", "00", "00", "00", "F2", "F8"];
/**
 * if the connection get lost the interval of reconnection start
 * @type {number}
 */
let owl_interval = undefined;
/**
 * time for response of engines, if its by sensor must be 15 seconds approx
 * @type {number}
 */
let owl_time_response_engines = 15e3;
/**
 * time for receive answers
 * @type {number}
 */
let owl_time_response_general = 3e3;
/**
 * store the timeout to realize an operation in case of response not return in some time
 * @type {undefined|number}
 */
let owl_timer_until_response = undefined;
/**
 * nayax give a max authorized pre-credit, must be specified to prevent errors in payments
 * @type {number}
 */
let owl_nayax_max_pre_credit = 0;
/**
 * aux iteration for test function
 * @type {number}
 */
let owl_aux_iteration = 10;
/**
 * store the price of product being purchased
 * @type {undefined}
 */
let owl_price = undefined;
/**
 * store the change to return
 * @type {number}
 */
let owl_change = 0;
/**
 * If the machine use ICT Recycler
 * @type {boolean}
 */
let owl_ict = true;
/**
 * Type of banknote currency to Recycler in ICT
 * @type {boolean}
 */
let owl_ict_bill = 1;
/**
 * store the quantity of money inserted per session
 * @type {number}
 */
let owl_amount_inserted = 0;


let owl_amount_retired = 0;
/**
 * interval for sense of product
 * @type {undefined}
 */
let owl_waiting_for_sense = undefined;
/**
 * status of dispense
 * @type {undefined|boolean}
 */
let owl_status_dispense = undefined;
/**
 * Store the reads of temperatures
 * @type {*[]}
 */
let owl_arr_log_temperature = [];
/**
 * Store the last error registered
 * @type {{handler: null|string, code: null|*[], no_code: number, message: null|string}}
 */
let owl_last_error = {
    "message": null,
    "handler": null,
    "code": null,
    "no_code": 666,
};
/**
 * Stop the sending commands until receive response
 * @type {undefined|number}
 */
let owl_wait_until_last_command_returns = undefined;
/**
 * Commands in queue to send to device serial
 * @type {array}
 */
let owl_queue_commands = [];
/**
 * Array of coins inserted, differentiating where gone (box/tube)
 * @type {{P1: number, P2: number, total: number, G50: number, P5: number, tubes: {P1: number, P2: number, G50: number, P5: number, P10: number, C50: number}, box: {P1: number, P2: number, G50: number, P5: number, P10: number, C50: number}, P10: number, C50: number}}
 */
let owl_arr_coins = {
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
/**
 * Array of banknotes inserted, differentiating where gone (stacker/recycler)
 * @type {{P500: number, stacker: {P500: number, P1000: number, P100: number, P200: number, P50: number, P20: number}, P1000: number, total: number, P100: number, P200: number, P50: number, recycler: {P500: number, P1000: number, P100: number, P200: number, P50: number, P20: number}, P20: number}}
 */
let owl_arr_bills = {
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
    "recyclerOut": {
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
/**
 * Time to try reconnect
 * @type {number}
 */
let owl_time_to_reconnect = 7e3;
/**
 * Array of banknotes in stacker, to fill this must be executed the @ function
 * @type {{P500: number, P1000: number, P100: number, P200: number, P50: number, P20: number}}
 */
let owl_arr_bills_recycler = {
    "P20": 0, "P50": 0, "P100": 0, "P200": 0, "P500": 0, "P1000": 0,
}
/**
 * Array of coins in the tubes, to fill this must be executed the @ function
 * @type {{P1: number, P2: number, G50: number, P5: number, P10: number, C50: number}}
 */
let owl_arr_coins_tubes = {
    "C50": 0, "G50": 0, "P1": 0, "P2": 0, "P5": 0, "P10": 0
};
/**
 * scrow of bill purse, default -> disable "00"
 * @type {string}
 */
let owl_scrow = "00";
/**
 * Help to now if the system is in "/control", to do functions only for that place
 * @type {boolean}
 */
let owl_control = false;
/**
 * Only for identify the active page
 * @type {undefined}
 */
let owl_control_page = undefined;
/**
 * If is true will shown a message in full screen if the serial device is not connected
 * @type {boolean}
 */
let owl_show_without_device = true;
/**
 * Route or base64 URL of image to show if device is not detected
 * @name owl_image_not_device_detected
 * @type {string}
 */
let owl_image_not_device_detected = "data:image/svg+xml;base64,PHN2ZyBpZD0iX3gzMV9feDJDXzUiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTEyLjE4OSAxOC4yNSA1LjU2MSA1LjU2MSAyLjA2MS0yLjA2MS01LjAzLTUuMDNjLS4xNDYtLjE0Ni0uMzM4LS4yMi0uNTMtLjIycy0uMzg0LjA3My0uNTMuMjJ6IiBmaWxsPSIjY2ZkOGRjIi8+PHBhdGggZD0ibTguNDY4IDYuOTg4LTEuNTkyLTEuNTkyYy0uNjg4LS42ODktMS45MjQtLjY4OC0yLjYxMSAwbC0yLjg3MiAyLjg3MmMtLjM0NC4zNDQtLjU0Mi44Mi0uNTQyIDEuMzA2cy4xOTguOTYyLjU0MSAxLjMwNWwxLjU5MiAxLjU5M2MuMTE1LjExNS4yNzIuMTguNDM1LjE4cy4zMi0uMDY1LjQzNS0uMThsNC42MTMtNC42MTNjLjExNS0uMTE1LjE4LS4yNzIuMTgtLjQzNXMtLjA2My0uMzIxLS4xNzktLjQzNnoiIGZpbGw9IiNjZmQ4ZGMiLz48cGF0aCBkPSJtMTUuMDE4IDEzLjQ3My0uOTc3LS45NzctLjE4NS0xLjY5Yy0uMDUxLS41NzYtLjMxMS0xLjEyNC0uNzMtMS41NDNsLTIuMjgxLTIuMjgxYy0uNjA5LS42MS0xLjY5LS42MS0yLjMgMGwtNS41NjMgNS41NjJjLS4zMDUuMzA0LS40NzMuNzEzLS40NzMgMS4xNTFzLjE2OC44NDcuNDczIDEuMTVsMi4yOCAyLjI4MWMuNDE5LjQxOS45NjcuNjc4IDEuNTI5LjcyOGwxLjcwNC4xODcuOTc3Ljk3N2MuMzA1LjMwNS43MTMuNDczIDEuMTUuNDczcy44NDUtLjE2OCAxLjE1LS40NzNsMy4yNDUtMy4yNDRjLjMwNS0uMzA0LjQ3My0uNzEzLjQ3My0xLjE1MXMtLjE2OC0uODQ2LS40NzItMS4xNXoiIGZpbGw9IiM2MDdkOGIiLz48cGF0aCBkPSJtMjMuMjUgMTAuMzE1YzAgLjUyLS40My45NS0uOTYuOTVoLTEwLjU4Yy0uNTMgMC0uOTYtLjQzLS45Ni0uOTUgMC0uMTkuMDUtLjM2LjE0LS41bDUuMjktOC41OWMuMTctLjI4LjQ3LS40Ni44Mi0uNDZzLjY1LjE4LjgyLjQ2bDUuMjkgOC41OWMuMDkuMTQxLjE0LjMxLjE0LjV6IiBmaWxsPSIjZmZjMTA3Ii8+PHBhdGggZD0ibTMuMTMgMTMuNWMtLjE5MiAwLS4zODQtLjA3My0uNTMtLjIybC0xLjk0LTEuOTRjLS40MTktLjQxOC0uNjYtLjk5Ny0uNjYtMS41OXMuMjQxLTEuMTcyLjY2MS0xLjU5MWwzLjQ5OS0zLjQ5OWMuODM2LS44MzggMi4zNDMtLjgzOSAzLjE4MS4wMDFsMS45MzkgMS45MzljLjI5My4yOTMuMjkzLjc2OCAwIDEuMDYxcy0uNzY4LjI5My0xLjA2MSAwbC0xLjk0LTEuOTM5Yy0uMjgxLS4yODMtLjc3OC0uMjgyLTEuMDU3LS4wMDJsLTMuNTAxIDMuNTAxYy0uMTQxLjE0LS4yMjEuMzMzLS4yMjEuNTI5cy4wOC4zODkuMjIuNTI4bDEuOTQgMS45NDFjLjI5My4yOTMuMjkzLjc2OCAwIDEuMDYxLS4xNDYuMTQ3LS4zMzkuMjItLjUzLjIyeiIvPjxwYXRoIGQ9Im0xMC43NSAyMGMtLjQ3MSAwLS45MTEtLjE4MS0xLjI0LS41MWwtMS4wNTQtMS4wNTQtMS44MzctLjIwMWMtLjYwNi0uMDU0LTEuMTk3LS4zMzMtMS42NDktLjc4NWwtMi40Ni0yLjQ2Yy0uMzI5LS4zMjktLjUxLS43NjktLjUxLTEuMjRzLjE4MS0uOTExLjUxLTEuMjRsNi02Yy4yOTMtLjI5My43NjgtLjI5MyAxLjA2MSAwcy4yOTMuNzY4IDAgMS4wNjFsLTYgNmMtLjAzMi4wMzItLjA3LjA5LS4wNy4xOHMuMDM4LjE0Ny4wNy4xOGwyLjQ2IDIuNDZjLjIwMS4yMDEuNDcuMzMuNzM2LjM1NGwyLjExNC4yMzFjLjE3LjAxOS4zMjguMDk0LjQ0OS4yMTVsMS4yNCAxLjI0Yy4wNjQuMDY0LjI5NS4wNjQuMzU5IDBsMy41LTMuNWMuMDMyLS4wMzIuMDctLjA5LjA3LS4xOHMtLjAzOC0uMTQ3LS4wNy0uMThjLS4yOTMtLjI5My0uMjkzLS43NjggMC0xLjA2MXMuNzY4LS4yOTMgMS4wNjEgMGMuMzI5LjMyOS41MS43Ny41MSAxLjI0cy0uMTgxLjkxMS0uNTEgMS4yNGwtMy41IDMuNWMtLjMyOS4zMjktLjc2OS41MS0xLjI0LjUxeiIvPjxwYXRoIGQ9Im0xOS4yNSAyMmMtLjE5MiAwLS4zODQtLjA3My0uNTMtLjIybC01LTVjLS4yOTMtLjI5My0uMjkzLS43NjggMC0xLjA2MXMuNzY4LS4yOTMgMS4wNjEgMGw1IDVjLjI5My4yOTMuMjkzLjc2OCAwIDEuMDYxLS4xNDcuMTQ3LS4zMzkuMjItLjUzMS4yMnoiLz48cGF0aCBkPSJtMTcuMjUgMjRjLS4xOTIgMC0uMzg0LS4wNzMtLjUzLS4yMmwtNS01Yy0uMjkzLS4yOTMtLjI5My0uNzY4IDAtMS4wNjFzLjc2OC0uMjkzIDEuMDYxIDBsNSA1Yy4yOTMuMjkzLjI5My43NjggMCAxLjA2MS0uMTQ3LjE0Ny0uMzM5LjIyLS41MzEuMjJ6Ii8+PHBhdGggZD0ibTMuMjUgMTBjLS4xOTIgMC0uMzg0LS4wNzMtLjUzLS4yMmwtMS4zMS0xLjMxYy0uMjkzLS4yOTMtLjI5My0uNzY4IDAtMS4wNjFzLjc2OC0uMjkzIDEuMDYxIDBsMS4zMSAxLjMxYy4yOTMuMjkzLjI5My43NjggMCAxLjA2MS0uMTQ3LjE0Ny0uMzM5LjIyLS41MzEuMjJ6Ii8+PHBhdGggZD0ibTUuMjUgOGMtLjE5MiAwLS4zODQtLjA3My0uNTMtLjIybC0xLjMxLTEuMzFjLS4yOTMtLjI5My0uMjkzLS43NjggMC0xLjA2MXMuNzY4LS4yOTMgMS4wNjEgMGwxLjMxIDEuMzFjLjI5My4yOTMuMjkzLjc2OCAwIDEuMDYxLS4xNDcuMTQ3LS4zMzkuMjItLjUzMS4yMnoiLz48cGF0aCBkPSJtMjIuMjg4IDEyaC0xMC41NzZjLS45NDQgMC0xLjcxMi0uNzY1LTEuNzEyLTEuNzA0IDAtLjMzNS4wOTQtLjY1MS4yNzItLjkxNmw1LjI3MS04LjU2NWMuMjk1LS40OTkuODU1LS44MTUgMS40NTctLjgxNXMxLjE2Mi4zMTYgMS40NjMuODI3bDUuMjgxIDguNTc4Yy4xNjIuMjQuMjU2LjU1Ni4yNTYuODkxIDAgLjkzOS0uNzY4IDEuNzA0LTEuNzEyIDEuNzA0em0tNS4yODgtMTAuNWMtLjA4OCAwLS4xNDcuMDQ4LS4xNzIuMDg5bC01LjMyOCA4LjcwN2MwIC4xMS4wOTcuMjA0LjIxMi4yMDRoMTAuNTc2Yy4xMTUgMCAuMjEyLS4wOTQuMjEyLS4yMDQgMC0uMDMzLS4wMDYtLjA2My0uMDE3LS4wNzhsLTUuMzA1LTguNjE2Yy0uMDMxLS4wNTQtLjA5LS4xMDItLjE3OC0uMTAyeiIvPjxwYXRoIGQ9Im0xNyA3LjVjLS40MTQgMC0uNzUtLjMzNi0uNzUtLjc1di0yYzAtLjQxNC4zMzYtLjc1Ljc1LS43NXMuNzUuMzM2Ljc1Ljc1djJjMCAuNDE0LS4zMzYuNzUtLjc1Ljc1eiIvPjxjaXJjbGUgY3g9IjE3IiBjeT0iOSIgcj0iLjc1Ii8+PC9zdmc+";
/**
 * Route or base64 URL of image to show if device is not detected
 * @name owl_image_reload
 * @type {string}
 */
let owl_image_reload = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIj48cGF0aCBkPSJNNDYzLjcwMiAxNjIuNjU1TDQ0Mi40OTEgMTQuMTY0Yy0xLjc0NC0xMi4xNzQtMTYuNzA3LTE3LjIzMy0yNS40NTktOC40ODFsLTMwLjg5NCAzMC44OTRDMzQ2LjQxMSAxMi42MTIgMzAxLjMwOSAwIDI1NC45MzIgMCAxMTUuNDY0IDAgMy40OTEgMTA5LjE2LjAwNSAyNDguNTExYy0uMTkgNy42MTcgNS4zNDcgMTQuMTUgMTIuODc2IDE1LjIzNGw1OS45NDEgOC41NjljOC45MzYgMS4zMDQgMTcuMjQ5LTUuNzEyIDE3LjEyNS0xNS4wNThDODguNzA0IDE2NS4yODYgMTYyLjk4NiA5MCAyNTQuOTMyIDkwYzIyLjI2NSAwIDQ0LjI2NyA0LjUyNiA2NC42IDEzLjE4M2wtMjkuNzggMjkuNzhjLTguNjk3IDguNjk3LTMuNzYxIDIzLjcwNiA4LjQ4MSAyNS40NTlsMTQ4LjQ5MSAyMS4yMTFjOS43ODQgMS40NzUgMTguMzgxLTcuMDM0IDE2Ljk3OC0xNi45Nzh6TTQ5OS4xMTcgMjQ5LjQxMmwtNTkuODk3LTguNTU1Yy03LjczOC0uOTgtMTcuMTI0IDUuNjUxLTE3LjEyNCAxNi4xNDMgMCA5MC45ODEtNzQuMDE5IDE2NS0xNjUgMTY1YTE2NS4yMDcgMTY1LjIwNyAwIDAxLTY0LjMwNi0xMy4wNTJsMjguODI4LTI4LjgyOGM4LjY5Ny04LjY5NyAzLjc2MS0yMy43MDYtOC40ODEtMjUuNDU5TDY0LjY0NiAzMzMuNDM1Yy05Ljc1My0xLjM5My0xOC4zOSA2Ljk3MS0xNi45NzggMTYuOTc4bDIxLjIxIDE0OC40OTJjMS43NDYgMTIuMTg3IDE2LjY5NiAxNy4yMTIgMjUuNDU5IDguNDgxbDMxLjY0MS0zMS42MjZDMTY1LjUxNCA0OTkuNTA1IDIxMC41ODcgNTEyIDI1Ny4wOTYgNTEyYzEzOC43OTQgMCAyNTAuNzUyLTEwOC42MTggMjU0Ljg5Ny0yNDcuMjguMjItNy42MzItNS4zMTctMTQuMjI0LTEyLjg3Ni0xNS4zMDh6IiBmaWxsPSIjZmZmIiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz48L3N2Zz4=";
/**
 * Code to display message in screen if device is not detected
 * @name owl_code_not_device_detected
 * @type {string}
 */
let owl_code_not_device_detected = '' +
    '<div id="owl_device_not_detected" class="owl_device_not_detected" style="display: none">' +
    '<img src="' + owl_image_not_device_detected + '" alt="' + __("Device disconnected") + '" ' +
    'class="owl-w-100 owl-p-4 owl-max-h-80vh">' +
    '<a href="' + location.toString() + '" class="owl-btn owl-btn-link owl-fixed-bottom">' +
    '<img src="' + owl_image_reload + '" style="max-width:60px;margin:0 auto;" alt="'+ __("Reload") + '">'+
    '</a></div>';

/**
 * Code to allow show a modal asking for the permissions of serial devices
 * @type {string}
 */
let owl_code_permissions_serial_devices = "" +
    "<div class=\"fixed z-40 inset-0 overflow-y-auto hidden\" id=\"container-warning-modal-permission\">\n" +
    "        <button id=\"btn-open-warning-modal-permission\" class=\"hidden\"></button>\n" +
    "        <div class=\"flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0\">\n" +
    "            <div class=\"fixed inset-0 transition-opacity\" aria-hidden=\"true\"><div class=\"absolute inset-0 bg-gray-800 opacity-75\"></div></div>\n" +
    "            <span class=\"hidden sm:inline-block sm:align-middle sm:h-screen\" aria-hidden=\"true\">​</span>\n" +
    "            <div class=\"inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"modal-headline\">\n" +
    "                <div>\n" +
    "                    <div class=\"mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100\">\n" +
    "                        <svg class=\"h-5 w-5 text-red-400\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 20\" fill=\"currentColor\" aria-hidden=\"true\"><path fill-rule=\"evenodd\" d=\"M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z\" clip-rule=\"evenodd\"></path></svg>\n" +
    "                    </div>\n" +
    "                    <div class=\"mt-3 text-center sm:mt-5\">\n" +
    "                        <h3 class=\"text-lg leading-6 font-medium text-gray-900\" id=\"modal-headline\">" + __('You must allow the access to yours serial devices') + "</h3>\n" +
    "                        <div class=\"mt-2\"><p class=\"text-sm text-gray-500\">" + __('Please click the button below, and choose the device you want to use.') + "</p></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"mt-5 sm:mt-6\">" +
    "<button type=\"button\" id=\"btn-choose-serial-modal\" class=\"hidden\"></button>"+
    "<button type=\"button\" class=\"owl_serial_btn_connect_serial inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm\">" + __('Choose a serial port') + "</button></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>";

/**
 * Constant section
 ******************************************
 * All constant or variable starting with
 * original_owl_ is for soft reload page
 ******************************************
 */
const original_last_change_coin_purse = 0;
const original_owl_interval = undefined;
const original_owl_waiting_for_sense = undefined;
const original_owl_price = undefined;
const original_owl_timer_until_response = undefined;
const original_owl_status_dispense = undefined;
const original_owl_change = 0;
const original_owl_amount_inserted = 0;
const original_owl_amount_retired = 0;
const original_owl_aux_iteration = 10;
const original_owl_time_response_general = 3000;
const original_owl_time_response_engines = 15000;
const original_owl_time_to_reconnect = 7000;
const original_owl_arr_log_temperature = []; // it's an empty array
const original_owl_last_error = {"message": null, "handler": null, "code": null, "no_code": 666,};
const original_owl_arr_coins = {
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
const original_owl_arr_bills = {
    "stacker": {"P20": 0, "P50": 0, "P100": 0, "P200": 0, "P500": 0, "P1000": 0,},
    "recycler": {"P20": 0, "P50": 0, "P100": 0, "P200": 0, "P500": 0, "P1000": 0,},
    "recyclerOut": {"P20": 0, "P50": 0, "P100": 0, "P200": 0, "P500": 0, "P1000": 0,},
    "P20": 0,
    "P50": 0,
    "P100": 0,
    "P200": 0,
    "P500": 0,
    "P1000": 0,
    "total": 0,
}
const original_owl_arr_bills_recycler = {"P20": 0, "P50": 0, "P100": 0, "P200": 0, "P500": 0, "P1000": 0,}
const original_owl_arr_coins_tubes = {"C50": 0, "G50": 0, "P1": 0, "P2": 0, "P5": 0, "P10": 0};


/**
 * Soft reload the page, for some problems reloading and more speed
 * @name owlSoftReload
 */
function owlSoftReload() {
    /**
     * Set to undefined all variables
     */
     owl_no_dispense_all_money = false;
    owl_interval = undefined;
    owl_waiting_for_sense = undefined;
    owl_price = undefined;
    owl_timer_until_response = undefined;
    owl_status_dispense = undefined;
    owl_change = undefined;
    owl_amount_inserted = undefined;
    owl_amount_retired = 0;
    last_change_coin_purse = 0;
    owl_aux_iteration = undefined;
    owl_time_response_general = undefined;
    owl_time_to_reconnect = undefined;
    owl_arr_log_temperature = undefined;
    owl_last_error = undefined;
    owl_arr_coins = undefined;
    owl_arr_bills = undefined;
    owl_arr_bills_recycler = undefined;
    owl_arr_coins_tubes = undefined;
    owl_time_response_engines = undefined;

    /**
     * Assign value default using const original values
     */
    owl_interval = original_owl_interval;
    owl_waiting_for_sense = original_owl_waiting_for_sense;
    owl_price = original_owl_price;
    owl_timer_until_response = original_owl_timer_until_response;
    owl_status_dispense = original_owl_status_dispense;
    owl_change = original_owl_change;
    owl_amount_inserted = original_owl_amount_inserted;
    owl_amount_retired = original_owl_amount_retired;
    owl_aux_iteration = original_owl_aux_iteration;
    owl_time_response_general = original_owl_time_response_general;
    owl_time_to_reconnect = original_owl_time_to_reconnect;
    owl_arr_log_temperature = original_owl_arr_log_temperature;
    owl_last_error = original_owl_last_error;
    owl_arr_coins = original_owl_arr_coins;
    owl_arr_bills = original_owl_arr_bills;
    owl_arr_bills_recycler = original_owl_arr_bills_recycler;
    owl_arr_coins_tubes = original_owl_arr_coins_tubes;
    owl_time_response_engines = original_owl_time_response_engines;
    last_change_coin_purse = original_last_change_coin_purse;

    /**
     * Call another function to clean variables used in each project without modify the source
     */
    extOwlSoftReload();
}

/**
 * Get the type of response
 * @name owlGetResponse
 * @param code array|int
 * @param data {null|object}
 */
function owlGetResponse(code, data = null) {
    if (code === 0) {
        owlAppMessage(data);
    } else if (code && code.length === 14) {
        if (owl_interval !== undefined) {
            clearInterval(owl_interval);
            owl_interval = undefined;
        }
        clearTimeout(owl_timer_until_response);
        owl_timer_until_response = undefined;
        extOwlWithDevice();
        owlSerialMessage(code);
    } else {
        owlDividedCodeMessage();
    }
}

/**
 * Show the bytes sended to the serial device
 * @name owlSendedBytes
 * @param bytes
 */
function owlSendedBytes(bytes) {
    extOwlSendedBytes(bytes)
}

let timeout_check_coins_dispensed = undefined;
/**
 * Info received from serial device
 * @name owlSerialMessage
 * @param code
 */
function owlSerialMessage(code) {
    let message = {};
    let additional = {};


    switch (code[1].toString().toUpperCase()) {
        case "6":
            owlDeviceConnected();
            extOwlDefaultLoad();
            // Device connected
            message.name = __("Connection with the serial device completed.");
            message.description = __("Your connection with the serial device was successfully completed.");
            message.request = __("connect");
            message.no_code = 200;
            console.log("conexion completa");
            addLog("log",message.name);
            break;

        case "A0":
            // Coin inserted
            message.name = __("Coin Inserted");
            message.request = __("insert coin");


            additional.tube = "tube";
            additional.box = "profit box";
            additional.where = "";
            additional.coin = "0";

            switch (code[2].toString()) {
                //Reject lever
                case "1":
                    message.name = __("Coin Inserted");
                    message.description = __("Reject lever");
                    message.no_code = 210;
                    break;
                //Reset of coin purse
                case "2":
                    message.name = __("Reset coin purse");
                    message.description = __("The configuration of coin purse was reset")
                    message.no_code = 211;
                    break;

                //coin in box profit
                case "40":
                    message.name = __("Coin inserted in " + additional.box)
                    message.description = __("50 pennies (the big one)")
                    additional.coin = "G50";
                    message.no_code = 212;
                    additional.where = "box";
                    break;
                case "41":
                    message.name = __("Coin inserted in " + additional.box)
                    message.description = __("50 pennies (the little one)")
                    additional.coin = "C50";
                    message.no_code = 213;
                    additional.where = "box";
                    break;
                case "42":
                    message.name = __("Coin inserted in " + additional.box)
                    message.description = __("1 peso");
                    additional.coin = "P1";
                    message.no_code = 214;
                    additional.where = "box";
                    break;
                case "43":
                    message.name = __("Coin inserted in " + additional.box)
                    message.description = __("2 pesos");
                    additional.coin = "P2";
                    message.no_code = 215;
                    additional.where = "box";
                    break;
                case "44":
                    message.name = __("Coin inserted in " + additional.box)
                    message.description = __("5 pesos");
                    additional.coin = "P5";
                    message.no_code = 216;
                    additional.where = "box";
                    break;
                case "45":
                    message.name = __("Coin inserted in " + additional.box)
                    message.description = __("10 pesos");
                    additional.coin = "P10";
                    message.no_code = 217;
                    additional.where = "box";
                    break;
                case "46":
                    message.name = __("Coin inserted in " + additional.box)
                    message.description = __("Undefined value:") + " ¿46?";
                    message.no_code = 218;
                    additional.where = "box";
                    break;
                case "47":
                    message.name = __("Coin inserted in " + additional.box)
                    message.description = __("Undefined value:") + " ¿47?";
                    message.no_code = 219;
                    additional.where = "box";
                    break;

                // coin in tube
                case "50":
                    message.name = __("Coin inserted in " + additional.tube)
                    message.description = __("50 pennies (the big one)");
                    additional.coin = "G50";
                    message.no_code = 220;
                    additional.where = "tube";
                    break;
                case "51":
                    message.name = __("Coin inserted in " + additional.tube)
                    message.description = __("50 pennies (the little one)");
                    additional.coin = "C50";
                    message.no_code = 221;
                    additional.where = "tube";
                    break;
                case "52":
                    message.name = __("Coin inserted in " + additional.tube)
                    message.description = __("1 peso");
                    additional.coin = "P1";
                    message.no_code = 222;
                    additional.where = "tube";
                    break;
                case "53":
                    message.name = __("Coin inserted in " + additional.tube)
                    message.description = __("2 pesos");
                    additional.coin = "P2";
                    message.no_code = 223;
                    additional.where = "tube";
                    break;
                case "54":
                    message.name = __("Coin inserted in " + additional.tube)
                    message.description = __("5 pesos");
                    additional.coin = "P5";
                    message.no_code = 224;
                    additional.where = "tube";
                    break;
                case "55":
                    message.name = __("Coin inserted in " + additional.tube)
                    message.description = __("10 pesos");
                    additional.coin = "P10";
                    message.no_code = 225;
                    additional.where = "tube";
                    break;
                case "56":
                    message.name = __("Coin inserted in " + additional.tube)
                    message.description = __("Undefined value:") + " ¿56?";
                    message.no_code = 226;
                    additional.where = "tube";
                    break;
                case "57":
                    message.name = __("Coin inserted in " + additional.tube)
                    message.description = __("Undefined value:") + " ¿57?";
                    message.no_code = 227;
                    additional.where = "tube";
                    break;

                default:
                    message.name = __("Coin inserted")
                    message.description = __("Undefined status. Without information of this coin");
                    message.no_code = 228;
                    break;
            }
            
            owlCountMoney(additional.coin, additional.where);
            
            break;

        case "B0":
            // bank note inserted
            message.request = __("Bank note inserted");
            additional.aux_name = "";
            additional.bill = "0";
            additional.value;
            additional.inserted = __("Bank note in pre-stacker, waiting instruction of banknote");
            additional.rejected = __("Bank note rejected");
            additional.accepted = __("Bank note accepted");
            additional.bill_stacker = __("Bank note inserted in stacker");
            additional.bill_recycler = __("Bank note inserted in recycler");
            additional.where = "";

            additional.bills = {
                "b20": "20 pesos",
                "b50": "50 pesos",
                "b100": "100 pesos",
                "b200": "200 pesos",
                "b500": "500 pesos",
                "b1000": "1000 pesos"
            };

            additional.billRetire = {
                "r20": "20 pesos",
                "r50": "50 pesos",
                "r100": "100 pesos",
                "r200": "200 pesos",
                "r500": "500 pesos",
                "r1000": "1000 pesos"
            };

            // bill inserted
            switch (code[2].toString()) {
                // bills accepted  (80 - 87)
                // bill inserted in stacker
                case "80"://20 pesos
                    additional.value = additional.bills["b20"];
                    additional.aux_name = additional.bill_stacker;
                    additional.bill = "P20";
                    message.no_code = 229;
                    additional.where = "stacker";
                    break;
                case "81"://50 pesos
                    additional.value = additional.bills["b50"];
                    additional.aux_name = additional.bill_stacker;
                    additional.bill = "P50";
                    message.no_code = 230;
                    additional.where = "stacker";
                    break;
                case "82"://100 pesos
                    additional.value = additional.bills["b100"];
                    additional.aux_name = additional.bill_stacker;
                    additional.bill = "P100";
                    message.no_code = 231;
                    additional.where = "stacker";
                    break;
                case "83"://200 pesos
                    additional.value = additional.bills["b200"];
                    additional.aux_name = additional.bill_stacker;
                    additional.bill = "P200";
                    message.no_code = 232;
                    additional.where = "stacker";
                    break;
                case "84"://500 pesos
                    additional.value = additional.bills["b500"];
                    additional.aux_name = additional.bill_stacker;
                    additional.bill = "P500";
                    message.no_code = 233;
                    additional.where = "stacker";
                    break;
                case "85"://?? pesos
                    additional.value = __("Unknown value:") + " ¿85?";
                    additional.aux_name = additional.bill_stacker;
                    message.no_code = 234;
                    additional.where = "stacker";
                    break;
                case "86"://?? pesos
                    additional.value = __("Unknown value:") + " ¿86?";
                    additional.aux_name = additional.bill_stacker;
                    message.no_code = 235;
                    additional.where = "stacker";
                    break;
                case "87"://?? pesos
                    additional.value = __("Unknown value:") + " ¿87?";
                    additional.aux_name = additional.bill_stacker;
                    message.no_code = 236;
                    additional.where = "stacker";
                    break;


                // banknotes inserted in pre stacker
                case "90"://20 pesos
                    additional.value = additional.bills["b20"];
                    additional.aux_name = additional.inserted;
                    message.no_code = 237;
                    break;
                case "91"://50 pesos
                    additional.value = additional.bills["b50"];
                    additional.aux_name = additional.inserted;
                    message.no_code = 238;
                    break;
                case "92"://100 pesos
                    additional.value = additional.bills["b100"];
                    additional.aux_name = additional.inserted;
                    message.no_code = 239;
                    break;
                case "93"://200 pesos
                    additional.value = additional.bills["b200"];
                    additional.aux_name = additional.inserted;
                    message.no_code = 240;
                    break;
                case "94"://500 pesos
                    additional.value = additional.bills["b500"];
                    additional.aux_name = additional.inserted;
                    message.no_code = 241;
                    break;
                case "95"://?? pesos
                    additional.value = __("Unknown value:") + " ¿95?";
                    additional.aux_name = additional.inserted;
                    message.no_code = 242;
                    break;
                case "96"://?? pesos
                    additional.value = __("Unknown value:") + " ¿96?";
                    additional.aux_name = additional.inserted;
                    message.no_code = 243;
                    break;
                case "97"://?? pesos
                    additional.value = __("Unknown value:") + " ¿97?";
                    additional.aux_name = additional.inserted;
                    message.no_code = 244;
                    break;


                // bills rejected (ejected)
                case "a0"://20 pesos
                    additional.value = additional.bills["b20"];
                    additional.aux_name = additional.rejected;
                    message.no_code = 245;
                    break;
                case "a1"://50 pesos
                    additional.value = additional.bills["b50"];
                    additional.aux_name = additional.rejected;
                    message.no_code = 246;
                    break;
                case "a2"://100 pesos
                    additional.value = additional.bills["b100"];
                    additional.aux_name = additional.rejected;
                    message.no_code = 247;
                    break;
                case "a3"://200 pesos
                    additional.value = additional.bills["b200"];
                    additional.aux_name = additional.rejected;
                    message.no_code = 248;
                    break;
                case "a4"://500 pesos
                    additional.value = additional.bills["b500"];
                    additional.aux_name = additional.rejected;
                    message.no_code = 249;
                    break;
                case "a5"://?? pesos
                    additional.value = __("Unknown value:") + " ¿a5?";
                    additional.aux_name = additional.rejected;
                    message.no_code = 250;
                    break;
                case "a6"://?? pesos
                    additional.value = __("Unknown value:") + " ¿a6?";
                    additional.aux_name = additional.rejected;
                    message.no_code = 251;
                    break;
                case "a7"://?? pesos
                    additional.value = __("Unknown value:") + " ¿a7?";
                    additional.aux_name = additional.rejected;
                    message.no_code = 252;
                    break;

                // bill inserted in the recycler
                case "b0"://20 pesos
                    additional.value = additional.bills["b20"];
                    additional.aux_name = additional.bill_recycler;
                    additional.bill = "P20";
                    message.no_code = 253;
                    additional.where = "recycler";
                    break;
                case "b1"://50 pesos
                    additional.value = additional.bills["b50"];
                    additional.aux_name = additional.bill_recycler;
                    additional.bill = "P50";
                    message.no_code = 254;
                    additional.where = "recycler";
                    break;
                case "b2"://100 pesos
                    additional.value = additional.bills["b100"];
                    additional.aux_name = additional.bill_recycler;
                    additional.bill = "P100";
                    message.no_code = 255;
                    additional.where = "recycler";
                    break;
                case "b3"://200 pesos
                    additional.value = additional.bills["b200"];
                    additional.aux_name = additional.bill_recycler;
                    additional.bill = "P200";
                    message.no_code = 256;
                    additional.where = "recycler";
                    break;
                case "b4"://500 pesos
                    additional.value = additional.bills["b500"];
                    additional.aux_name = additional.bill_recycler;
                    additional.bill = "P500";
                    message.no_code = 257;
                    additional.where = "recycler";
                    break;
                case "b5"://?? pesos
                    additional.value = __("Unknown value:") + " ¿a5";
                    additional.aux_name = additional.bill_recycler;
                    message.no_code = 258;
                    additional.where = "recycler";
                    break;
                case "b6"://?? pesos
                    additional.value = __("Unknown value:") + " ¿a6";
                    additional.aux_name = additional.bill_recycler;
                    message.no_code = 259;
                    additional.where = "recycler";
                    break;
                case "b7"://?? pesos
                    additional.value = __("Unknown value:") + " ¿a7";
                    additional.aux_name = additional.bill_recycler;
                    message.no_code = 260;
                    additional.where = "recycler";
                    break;


                case "2a"://?? pesos
                    additional.value = additional.billRetire["r50"];
                    additional.aux_name = additional.billRetire;
                    additional.bill="R50";
                    message.no_code = 260;
                    additional.where = "recyclerOut";
                    break;
            }
            message.name = additional.aux_name;
            message.description = additional.value;
            owlCountMoney(additional.bill, additional.where);
            break;

        case "D0":
            // status of coin purse
            message.request = __("Config coin purse");

            additional.message1 = "";
            additional.message2 = "";
            switch (code[2].toString()) {
                case "1":
                    additional.message1 = __("Coin purse enabled");
                    additional.message2 = __("Configuration complete");
                    message.no_code = 261;
                    break;
                case "0":
                    additional.message1 = __("Coin purse disabled");
                    additional.message2 = __("Disabled by system request");
                    message.no_code = 262;
                    break;
                default:
                    additional.message1 = __("Status unknown");
                    additional.message2 = __("The response of coin purse doesn't identify successfully");
                    message.no_code = 263;
                    break;
            }
            message.name = __(additional.message1);
            message.description = __(additional.message2);
            break;

        case "D1":
            // status of coin purse enable request
            message.request = __("Configure bill purse");
            additional.status_pre_scrow = "";

            switch (code[2].toString()) {
                case "0":
                    //pre scroll disabled
                    additional.status_pre_scrow = __("Configuration pre scroll disabled, bank note received automatic");
                    message.no_code = 265;
                    break;
                case "1":
                    //pre scroll enabled
                    additional.status_pre_scrow = __("Configuration pre scroll enabled");
                    message.no_code = 266;
                    break;
            }
            switch (code[3].toString()) {
                case "0":
                    additional.message1 = __("Bill purse disabled");
                    break;
                case "1":
                    additional.message1 = __("Bill purse enabled");
                    break;
            }
            if (code[3].toString() === "0") {
                additional.status_pre_scrow = "";
                message.no_code = 264;
            }

            message.name = additional.message1;
            message.description = additional.status_pre_scrow;
            break;

        case "D2":
            // send of result of quantity coins reading in coin purse tubes
            message.request = __("read tubes");
            message.no_code = 267;

            additional.coins = {
                "c50c": code[2],
                "c50g": code[3],
                "p1": code[4],
                "p2": code[5],
                "p5": code[6],
                "p10": code[7],
            };


            owl_arr_coins_tubes["C50"] = additional.coins.c50c;
            owl_arr_coins_tubes["G50"] = additional.coins.c50c;
            owl_arr_coins_tubes["P1"] = additional.coins.p1;
            owl_arr_coins_tubes["P2"] = additional.coins.p2;
            owl_arr_coins_tubes["P5"] = additional.coins.p5;
            owl_arr_coins_tubes["P10"] = additional.coins.p10;

            message.name = __("read tubes");
            message.description = __("Quantity of coins approx");

            // execute function to get a percentage approx of tubes
            owlPercentageTubes();
            break;

        case "D3":
            // result of read of bill purse in recycler
            message.request = __("read bank notes");
            message.no_code = 268;
            additional.bills = {
                "b20": code[2],
                "b50": code[3],
                "b100": code[4],
                "b200": code[5],
                "b500": code[6],
                "b1000": code[7]
            };

            owl_arr_bills_recycler["P20"] = owlHexToDec(additional.bills.b20);
            owl_arr_bills_recycler["P50"] = owlHexToDec(additional.bills.b50);
            owl_arr_bills_recycler["P100"] = owlHexToDec(additional.bills.b100);
            owl_arr_bills_recycler["P200"] = owlHexToDec(additional.bills.b200);
            owl_arr_bills_recycler["P500"] = owlHexToDec(additional.bills.b500);
            owl_arr_bills_recycler["P1000"] = owlHexToDec(additional.bills.b1000);


            owl_arr_bills.recycler.P20 = owlHexToDec(additional.bills.b20);
            owl_arr_bills.recycler.P50 = owlHexToDec(additional.bills.b50);
            owl_arr_bills.recycler.P100 = owlHexToDec(additional.bills.b100);
            owl_arr_bills.recycler.P200 = owlHexToDec(additional.bills.b200);
            owl_arr_bills.recycler.P500 = owlHexToDec(additional.bills.b500);
            owl_arr_bills.recycler.P1000 = owlHexToDec(additional.bills.b1000);

        


            addLog("log","bills_recycler",owl_arr_bills_recycler);
            message.name = __("Quantity of bank notes");
            message.description =
                __("Quantity of bank notes approx:") +
                " 20 pesos = " + additional.bills.b20 + " " + __("bank notes") +
                " 50 pesos = " + additional.bills.b50 + " " + __("bank notes") +
                " 100 pesos = " + additional.bills.b100 + " " + __("bank notes") +
                " 200 pesos = " + additional.bills.b200 + " " + __("bank notes") +
                " 500 pesos = " + additional.bills.b500 + " " + __("bank notes") +
                " 1000 pesos = " + additional.bills.b1000 + " " + __("bank notes") +
                __("Quantity of bank notes approx:") + " "

            break;

        case "D4":
            // status of instruction scrow, accepted or rejected bank note
            message.request = __("bank note status");
            additional.status_bill = "";

            switch (code[2].toString()) {
                case "1":
                    additional.status_bill = __("Bank note accepted");
                    message.no_code = 269;
                    break;
                case "0":
                    additional.status_bill = __("Bank note rejected");
                    message.no_code = 270;
                    break;
                default:
                    additional.status_bill = __("Unknown status bank note");
                    message.no_code = 271;
                    break;
            }
            message.name = additional.status_bill;
            message.description = "";
            break;

        case "D5":
            // status of payout, shown the number of bank notes dispensed
            message.request = __("bank notes dispensed");
            message.no_code = 272;

            additional.bills = {
                "b20cc": parseInt(code[2], 16),//20
                "b50cc": parseInt(code[3], 16),//50
                "b100cc": parseInt(code[4], 16),//100
                "b200cc": parseInt(code[5], 16),//200
                "b500cc": parseInt(code[6], 16),//500
                "b1000cc": parseInt(code[7], 16),//1000
            }
            additional.quantity_dispensed = (additional.bills.b20cc * 20) + (additional.bills.b50cc * 50) + (additional.bills.b100cc * 100) + (additional.bills.b200cc * 200) + (additional.bills.b500cc * 500) + (additional.bills.b1000cc * 1000);


            additional.message1 = __("Dispensed") + "  " + additional.quantity_dispensed + " pesos";
            additional.message2 = __("Quantity approx.") + " $20x" + additional.bills.b20cc + ". $50x" + additional.bills.b50cc + ". $100x" + additional.bills.b100cc + ". $200x" + additional.bills.b200cc + ". $500x" + additional.bills.b500cc + ". $1000x" + additional.bills.b1000cc;
            if (additional.quantity_dispensed === 0) {
                additional.message1 = __("No money dispensed");
                additional.message2 = __("Probably bill purse is empty");
                message.no_code = 273;
            }
            message.name = additional.message1;
            message.description = additional.message2;
            break;

        case "D6":
            // status of dispense coin, shown the number of coin dispensed
            message.request = __("coins dispensed");
            message.no_code = 274;
            message.name = __("coins dispensed");
            message.description = "";
            //owlReloadPage();
            if(isNaN(last_change_coin_purse)){
                Swal.fire('El precio de la ultima lectura del monedero no se tiene registrada correctamente')
            }
            console.warn(last_change_coin_purse,'1020 linker.js');
            owl_amount_retired-=last_change_coin_purse;
            if(timeout_check_coins_dispensed === undefined){
                timeout_check_coins_dispensed = setTimeout(function(){
                    extOwlRetireBill();
                    clearTimeout(timeout_check_coins_dispensed);
                    timeout_check_coins_dispensed= undefined;
                },500);
            }
            break;

        case "D7":
            // report the status of the action move engine, if product was dispensed or not
            message.request = __("status of dispense product");
            additional.status_dispense = "";

            switch (code[5].toString()) {
                case "1":
                    additional.status_dispense = __("Product not delivered");
                    additional.message2 = __("The product requested wasn't delivered");
                    message.no_code = 275;
                    owl_status_dispense = false;
                    break;
                case "0":
                    additional.status_dispense = __("Product delivered");
                    additional.message2 = __("The product requested was delivered") + ": " + parseInt(code[2], 16);
                    message.no_code = 276;
                    owl_status_dispense = true;
                    break;
                default:
                    additional.status_dispense = __("Status unknown");
                    additional.message2 = __("Error");
                    message.no_code = 277;
                    owl_status_dispense = false;
                    break;
            }
            message.name = additional.status_dispense;
            message.description = additional.message2;
            break;

        case "D8":
            // status door, open or close
            message.request = __("status door");
            message.no_code = 211;

            additional.status = "";


            switch (code[13]) {
                case "db":
                    additional.status = __("Door closed");
                    message.no_code = 278;
                    break;
                case "dc":
                    additional.status = __("Door open");
                    message.no_code = 279;
                    break;
                default:
                    additional.status = __("Status unknown");
                    message.no_code = 280;
                    break;
            }

            message.name = additional.status;
            message.description = "";
            break;

        case "D9":
            // send the temperature of sensor
            message.request = __("temperature status");
            message.no_code = 281;
            additional.temp_high = parseInt(code[2], 16);
            additional.temp_low = parseInt(code[3], 16);
            message.name = __("Status of temperature");
            message.description =
                __("Temperature high") + ": " + additional.temp_high + ". " +
                __("Temperature low") + ": " + additional.temp_low;

            owl_arr_log_temperature.push({
                "high": additional.temp_high,
                "low": additional.temp_low,
            });

            break;

        case "DA":
            // request of command read or shutdown relay
            message.request = __("Relay status");
            message.no_code = 213;
            if (code[2].toString() === "1") {
                message.name = __("Relay on");
                message.no_code = 282;
            } else if (code[2].toString() === "0") {
                message.name = __("Relay off");
                message.no_code = 283;
            } else {
                message.name = __("Status unknown");
                message.no_code = 284;
            }
            message.description = "";

            break;

        case "DB":
            // response to command save memory bill purse
            message.request = __("Save memory bill purse");
            message.no_code = 285;
            message.name = __("Status unknown");
            message.description = __("Without information");
            break;

        case "DC":
            // response to command read memory bill purse
            message.request = __("Read memory bill purse");
            message.no_code = 295;
            message.name = __("Status unknown");
            message.description = __("Without information");
            break;

        case "DD":
            // report status of cards reader [accepted, rejected, canceled or without nayax]
            message.request = __("Card reader status");
            switch (code[2].toString().toUpperCase()) {
                case "0":
                    // nayax not detected?
                    message.no_code = 505;
                    message.name = __("Nayax disabled");
                    message.description = __("The Nayax device was disabled successfully");
                    //message.no_code = 516;
                    //message.name = __("Nayax not detected");
                    //message.description = __("The Nayax device was not detected");
                    break;
                case "1":
                    // nayax enabled
                    message.no_code = 506;
                    message.name = __("Nayax enabled");
                    message.description = __("The Nayax device now is enabled");
                    // nayax disabled
                    //message.no_code = 505;
                    //message.name = __("Nayax disabled");
                    //message.description = __("The Nayax device was disabled successfully");
                    break;
                case "2":
                    // nayax enabled
                    message.no_code = 506;
                    message.name = __("Nayax enabled");
                    message.description = __("The Nayax device now is enabled");
                    break;
                case "3":
                    // pre authorized credit
                    message.no_code = 507;
                    message.name = __("Pre authorized credit");
                    message.description = __("The pre credit was authorized successfully");
                    break;
                case "4":
                    // request of cancel
                    message.no_code = 508;
                    message.name = __("Cancellation in progress");
                    message.description = __("Cancellation request done successfully");
                    break;
                case "5":
                    // sell approved, starting dispense product
                    message.no_code = 509;
                    message.name = __("Sell approved");
                    message.description = __("Sell approved, starting dispense product");
                    break;
                case "6":
                    // sell denied
                    message.no_code = 510;
                    message.name = __("Sell denied");
                    message.description = __("This sell was denied, try again");
                    break;
                case "7":
                    // end of session
                    message.no_code = 511;
                    message.name = __("Session ended");
                    message.description = __("The session ended");
                    break;
                case "8":
                    // cancelled
                    message.no_code = 512;
                    message.name = __("Cancelled");
                    message.description = __("Cancellation complete");
                    break;
                case "A":
                    // end of dispense, status of dispense
                    switch (code[8]) {
                        case "1":
                            // no dispensed
                            message.no_code = 513;
                            message.name = __("Product not dispensed");
                            message.description = __("Product not dispensed, payed with nayax device");
                            break;
                        case "0":
                            // product dispensed
                            message.no_code = 514;
                            message.name = __("Product dispensed");
                            message.description = __("The process of dispensing product ended successfully");
                            break;
                        default:
                            message.no_code = 515;
                            message.name = __("Status unknown");
                            message.description = __("No more information about dispense status");
                            break;
                    }
                    break;
                default:
                    message.no_code = 516;
                    message.name = __("Status unknown");
                    message.description = __("The status of card reader does not identified correctly");
                    break;
            }
            break;
        default:
            message.request = __("undefined");
            message.name = __("Response unrecognized");
            message.description = __("The response of application was received, but dont identify with any of current parameters");
            message.no_code = 404;
            break;
    }

    /**
     * This info is send to a function in other file to make more easy the manipulation and integration
     */
    extOwlSerialMessage({
        "code": code,
        "message": message.name,
        "description": message.description,
        "request": message.request,
        "no_code": message.no_code
    });
}

/**
 * @name owlDividedCodeMessage
 * @void
 */
function owlDividedCodeMessage() {

}

/**
 * @name owlAppMessage
 * @void
 * @param data
 */
function owlAppMessage(data) {
    clearTimeout(owl_timer_until_response);
    let message = {};

    message.name = "";
    message.description = "";
    // responses generic of application
    switch (data.no_code) {
        case 700:
            message.name = data.message;
            message.description = __("The application connect successfully with website");
            break;
        case 701:
            message.name = data.message;
            message.description = __("The connection with the serial device was ended by system request");
            break;
        case 702:
            message.name = data.message;
            message.description = __("The last instruction is not compatible with this version of the application");
            break;
        case 703:
            extOwlWithoutDevice();
            if (owl_interval === undefined) {
                // x seconds between each try to reconnect
                owl_interval = setInterval(owlReconnect, owl_time_to_reconnect);
            }
            message.name = __("Serial device disconnected");
            message.description = data.description;
            break;
        case 704:
            // port disconnected
            message.name = data.message;
            message.description = data.description;
            break;
        case 705:
            extOwlWithoutDevice();
            // connection not completed
            if (owl_interval === undefined) {
                // x seconds between each try to reconnect
                owl_interval = setInterval(owlReconnect, owl_time_to_reconnect);
            }
            message.name = __("Connection with the serial device is not complete");
            message.description = __("Check the device is connected correctly");
            break;
        case 706:
            message.name = data.message;
            message.description = __("The port was not linked to the serial device, so we closed");
            break;
        case 707:
            message.name = data.message;
            message.description = __("The response was not received in the time specified by the application");
            break;
        case 708:
        default:
            message.name = data.message;
            message.description = __("Oops! you ran into an unknown error");
            break;
    }

    extOwlAppMessage({
        "message": message.name,
        "description": message.description,
        "no_code": data.no_code
    });
}

/**
 * @name owlDeviceConnected
 * @void
 */
function owlDeviceConnected() {

}

/**
 * @name owlReloadPage
 * @void
 */
function owlReloadPage() {

}

/**
 * Convert arr of hex string to arr bytes string and send to device
 * @name owlPreSendBytes
 * @param arr
 * @param to_do
 */
function owlPreSendBytes(arr, to_do = "") {
    let bytes = [];
    arr.forEach((val) => {
        bytes.push(owlHexMaker(val));
    });
    bytes[11] = owlHexMaker(owlSumHex(bytes));
    bytes = owlAdd0x(bytes);

    addLog("log",bytes,to_do);

    /**
     * Waits for the response
     */
    if (owl_timer_until_response !== undefined) {
        owl_queue_commands.push({'bytes':bytes,'to_do':to_do});
        addLog("warn",__("You send a new command to serial device before have an answer") + ". " + __("Commands in queue:") + " " + owl_queue_commands.length);
        owl_wait_until_last_command_returns = setInterval(() => {
            if (owl_timer_until_response === undefined && owl_queue_commands.length > 0) {
                addLog("log",__("Sending in delay mode") + ". " + __("Commands in queue:") + " " + owl_queue_commands.length);
                clearInterval(owl_wait_until_last_command_returns);
                owl_wait_until_last_command_returns = undefined;
                owl_timer_until_response = setTimeout(() => {
                    owlTimerNoResponse(owl_queue_commands[0].bytes, owl_queue_commands[0].to_do);
                }, (owl_queue_commands[0].to_do === "dispense" ? owl_time_response_engines : owl_time_response_general));

                serialOwlWriteToSerial(owl_queue_commands[0].bytes);
                owl_queue_commands = owl_queue_commands.splice(1);
            }
        }, 500)
    } else {
        owl_queue_commands = [];
        owl_timer_until_response = setTimeout(() => {
            owlTimerNoResponse(bytes, to_do);
        }, (to_do === "dispense" ? owl_time_response_engines : owl_time_response_general));

        serialOwlWriteToSerial(bytes);
    }
}

/**
 * Makes a connection with the device, and Send bytes to serial
 * @name owlConnect
 */
function owlConnect() {
    owlPreSendBytes(owl_bytes_connection, 'connect');
}

/**
 * Reconnection if devices is lost
 * @name owlReconnect
 * @deprecated WebSerial detect if a device was connected previously and in connection file makes a reconnection
 * if detects a plug serial, so you don't need use an a reconnect function
 */
function owlReconnect() {
    extOwlReconnectionMessage();
    owlConnect();
}

/**
 * Style hex data to make uniform and pretty
 * @name owlHexMaker
 * @param val hexadecimal number
 * @param min length required of string
 * @returns {string}
 */
function owlHexMaker(val, min = 2) {
    let missing = (min - (val.toString().length));
    if (missing > 0) {
        for (let i = 0; i < missing; i++) {
            val = "0" + val;
        }
    }
    return val;
}

/**
 * Configure the coin purse
 * @name owlConfigCoinPurse
 * @param status Enable or disable
 * @param high Mount high
 * @param low mount low
 */
function owlConfigCoinPurse(status = "00", high = "FF", low = "FF") {
    let bytes = ["F1", "C1", status, high, low, "00", "00", "00", "00", "00", "F2", "00"];
    owlPreSendBytes(bytes, (status.toString() === "01" ? 'Coin purse enabled' : 'Coin purse disabled'));
}

/**
 * Read the quantity of coins in tubes (approx)
 * @name owlReadTubes
 */
function owlReadTubes() {
    let bytes = ["F1", "C2", "00", "00", "00", "00", "00", "00", "00", "00", "F2", "00"];
    owlPreSendBytes(bytes, 'read tubes');
}

/**
 * Dispense coins
 * @name owlDispenseCoins
 * @param pennie50 Quantity of $50 pennies (the big one)
 * @param peso1 Quantity of $1 peso
 * @param peso2 Quantity of $2 pesos
 * @param peso5 Quantity of $5 pesos
 * @param peso10 Quantity of $10 pesos
 */
function owlDispenseCoins(pennie50, peso1, peso2, peso5, peso10) {
    let bytes = ["F1", "C6", pennie50, peso1, peso2, peso5, peso10, "00", "00", "00", "F2", "00"];
    owlPreSendBytes(bytes, 'coins dispensed');
}

/**
 * Config bill purse
 * @name owlConfigBillPurse
 * @param status enable or disable
 * @param scrow enable or disable
 */
function owlConfigBillPurse(scrow = "00", status = "00") {
    let bytes = ["F1", "C0", status, scrow, "00", "00", "00", "00", "00", "00", "F2", "00"];
    owlPreSendBytes(bytes, (status.toString() === "01" ? 'Bill purse enabled' : 'Bill purse disabled'));
}

/**
 * Dispense banknotes
 * @name owlDispenseBanknotes
 * @param peso20
 * @param peso50
 * @param peso100
 * @param peso200
 * @param peso500
 * @param peso1000
 */
function owlDispenseBanknotes(peso20, peso50, peso100, peso200, peso500, peso1000) {
    let bytes = ["F1", "C5", peso20, peso50, peso100, peso200, peso500, peso1000, "00", "00", "F2", "00"];
    owlPreSendBytes(bytes, 'bank note dispensed');
}

/**
 * Dispense banknotes with ICT
 * @name owlDispenseBanknoteICT
 * @param currency 0=$20, 1=$50, 2=$100, 3=$200, 4=$500
 * @param quantity 
 */
function owlDispenseBanknoteICT(currency,quantity){
    let bytes = ["F1", "C5", currency, quantity, "00", "00", "00", "00", "00", "00", "F2", "00"];
    owlPreSendBytes(bytes, 'bank note dispensed');
}

/**
 * Active engines to dispense and deliver a product
 * @name owlEnginesMatrix
 * @param product1
 * @param product2
 * @param type time or sensor (00)
 */
function owlEnginesMatrix(product1, product2 = "00", type = "00") {
    let bytes = ["F1", "C7", product1, product2, type, "00", "00", "00", "00", "00", "F2", "00"];
    owlPreSendBytes(bytes, 'dispense');
}

/**
 * Activate or deactivate cooling relay
 * @name owlCoolingRelay
 * @param status
 */
function owlCoolingRelay(status = "00") {
    let bytes = ["F1", "CC", status, "00", "00", "00", "00", "00", "00", "00", "F2", "00"];
    owlPreSendBytes(bytes, (status.toString() === "01" ? 'Relay on' : 'Relay off'));
}

/**
 * Disable nayax device
 * @name owlDisableNayax
 */
function owlDisableNayax() {
    let bytes = ["F1", "CD", "00", "00", "00", "00", "00", "00", "00", "00", "F2", "00"];
    owlPreSendBytes(bytes, 'Nayax disabled');
}

/**
 * Enable coin purse
 * @name owlEnableCoinPurse
 */
function owlEnableCoinPurse() {
    owlConfigCoinPurse('01')
}

/**
 * Disable coin purse
 * @name owlDisableCoinPurse
 */
function owlDisableCoinPurse() {
    owlConfigCoinPurse();
}

/**
 * Enable bill purse
 * @name owlEnableBillPurse
 * @param scrow requires validation of banknote before accept it
 */
function owlEnableBillPurse(scrow) {
    //owlConfigBillPurse('01', 'FF');
    if(owl_ict){
        owlConfigBillPurse('FF', 'FF');
    }else{
        owlConfigBillPurse('01', scrow);
    }
}

/**
 * Disable bill purse
 * @name owlDisableBillPurse
 */
function owlDisableBillPurse() {
    owlConfigBillPurse();
}

/**
 * Test engines matrix
 * @name owlExecuteTestEnginesMatrix
 */
function owlExecuteTestEnginesMatrix(motors) {
    if (owl_aux_iteration === 90) {
        owl_aux_iteration = 10;
        return;
    }
    setTimeout(() => {
        let engine1 = owlDecToHex(owl_aux_iteration - 1);
        let engine2 = "00";
        if (motors === true) {
            engine2 = owlDecToHex(owl_aux_iteration);
        }
        setTimeout(() => {
            owlEnginesMatrix(engine1, engine2, "04");
        }, 500);
        if (owl_aux_iteration < 90) {
            owlExecuteTestEnginesMatrix();
        }
        owl_aux_iteration++;
    }, 1000)
}

/**
 * Sum of hexadecimals and return the value (in hexadecimal)
 * @name owlSumHex
 * @param arr must be an array of values in hexadecimal (Ex. ['02','f4'])
 * @returns {string} value in hex
 */
function owlSumHex(arr) {
    let sum = 0;
    arr.forEach((value, index) => {
        if (index !== 0 && index !== 11) {
            sum += parseInt(value, 16);
        }
    });
    return sum.toString(16);
}

/**
 * Adds 0x before each value in array
 * Example 00 => 0x00
 * @param bytes
 * @returns {[]}
 */
function owlAdd0x(bytes) {
    let new_bytes = [];
    bytes.forEach((value, index) => {
        new_bytes[index] = "0x" + value;
    });
    return new_bytes;
}

/**
 * Parse decimal to hexadecimal
 * @param val
 * @returns {string}
 */
function owlDecToHex(val) {
    return parseInt(val).toString(16);
}

/**
 * Parse hexadecimal value to decimal
 * @param val
 * @returns {number}
 */
function owlHexToDec(val) {
    return parseInt(val, 16);
}

/**
 * Timeout, when a response is not obtained in time, or just its not obtained at all
 * @param code {[]}
 * @param to_do {string}
 */
function owlTimerNoResponse(code, to_do) {
    owl_last_error.message = __("Operation response timed out.");
    owl_last_error.handler = to_do;
    owl_last_error.code = code;
    clearTimeout(owl_timer_until_response);
    owl_timer_until_response = undefined;
    if (owl_last_error["handler"] === "connect") {
        extOwlWithoutDevice();
        owlReconnect();
    }

    extOwlTimeout();
}

/**
 * @name owlPercentageTubes
 * coins of 10 = 72
 * coins of 1  = 100
 * coins of 2  = 92
 * coins of 5  = 80
 */
function owlPercentageTubes() {
    let obj = {
        "p10": (owlHexToDec(owl_arr_coins_tubes.P10) / 58 * 100).format(0, 3, ',', '.'),
        "p5": (owlHexToDec(owl_arr_coins_tubes.P5) / 69 * 100).format(0, 3, ',', '.'),
        "p2": (owlHexToDec(owl_arr_coins_tubes.P2) / 78 * 100).format(0, 3, ',', '.'),
        "p1": (owlHexToDec(owl_arr_coins_tubes.P1) / 90 * 100).format(0, 3, ',', '.'),
        "c50": (owlHexToDec(owl_arr_coins_tubes.G50) / 78 * 100).format(0, 3, ',', '.'),
    };
    extOwlPercentageTubes(obj);
}

/**
 * Count the money inserted in coin and bill purse per session
 * @name owlCountMoney
 * @param f_money
 * @param f_where
 */
let timer_executed = false;
function owlCountMoney(f_money, f_where) {
    let do_nothing = false;
    switch (f_money.toUpperCase()) {
        //coins
        case "G50":
            if (f_where === "tube") {
                owl_arr_coins.tubes.G50 += 1;
            } else {
                owl_arr_coins.box.G50 += 1;
            }
            owl_arr_coins.G50 += 1;
            owl_amount_inserted += .5;
            break;
        case "C50":
            if (f_where === "tube") {
                owl_arr_coins.tubes.C50 += 1;
            } else {
                owl_arr_coins.box.C50 += 1;
            }
            owl_arr_coins.C50 += 1;
            owl_amount_inserted += .5;
            break;
        case "P1":
            if (f_where === "tube") {
                owl_arr_coins.tubes.P1 += 1;
            } else {
                owl_arr_coins.box.P1 += 1;
            }
            owl_arr_coins.P1 += 1;
            owl_amount_inserted += 1;
            break;
        case "P2":
            if (f_where === "tube") {
                owl_arr_coins.tubes.P2 += 1;
            } else {
                owl_arr_coins.box.P2 += 1;
            }
            owl_arr_coins.P2 += 1;
            owl_amount_inserted += 2;
            break;
        case "P5":
            if (f_where === "tube") {
                owl_arr_coins.tubes.P5 += 1;
            } else {
                owl_arr_coins.box.P5 += 1;
            }
            owl_arr_coins.P5 += 1;
            owl_amount_inserted += 5;
            break;
        case "P10":
            if (f_where === "tube") {
                owl_arr_coins.tubes.P10 += 1;
            } else {
                owl_arr_coins.box.P10 += 1;
            }
            owl_arr_coins.P10 += 1;
            owl_amount_inserted += 10;
            break;
        //billetes
        case "P20":
            if (f_where === "stacker") {
                owl_arr_bills.stacker.P20 += 1;
            } else {
                owl_arr_bills.recycler.P20 += 1;
            }
            owl_arr_bills.P20 += 1;
            owl_amount_inserted += 20;
            break;
        case "P50":
            if (f_where === "stacker") {
                owl_arr_bills.stacker.P50 += 1;
            } else {
                owl_arr_bills.recycler.P50 += 1;
            }
            owl_arr_bills.P50 += 1;
            owl_amount_inserted += 50;
            break;
        case "P100":
            if (f_where === "stacker") {
                owl_arr_bills.stacker.P100 += 1;
            } else {
                owl_arr_bills.recycler.P100 += 1;
            }
            owl_arr_bills.P100 += 1;
            owl_amount_inserted += 100;
            break;
        case "P200":
            if (f_where === "stacker") {
                owl_arr_bills.stacker.P200 += 1;
            } else {
                owl_arr_bills.recycler.P200 += 1;
            }
            owl_arr_bills.P200 += 1;
            owl_amount_inserted += 200;
            break;
        case "P500":
            if (f_where === "stacker") {
                owl_arr_bills.stacker.P500 += 1;
            } else {
                owl_arr_bills.recycler.P500 += 1;
            }
            owl_arr_bills.P500 += 1;
            owl_amount_inserted += 500;
            break;
        case "P1000":
            if (f_where === "stacker") {
                owl_arr_bills.stacker.P1000 += 1;
            } else {
                owl_arr_bills.recycler.P1000 += 1;
            }
            owl_arr_bills.P1000 += 1;
            owl_amount_inserted += 1000;
            break;
        case "R50":
            //console.log("retirando billete");
            addLog('log',"retirando billete");
            if (f_where === "recyclerOut") {
                owl_arr_bills.recyclerOut.P50 += 1;
            }
            owl_arr_bills.P50 += 1;
            owl_amount_retired -= 50;
            break;
        default:
            do_nothing = true;
            // Dont sum to arrays
            break;
    }
    owl_arr_bills.total = owl_amount_inserted;

    switch(f_money.toUpperCase()){
        case "R20":
        case "R50":
        case "R100":
            extOwlRetireBill();
        break;

        default:
            if(do_nothing){
                if(!timer_executed){
                    cancelarProcesoDePagoPalanca();
                }
            }else{
                extOwlMoneySession();
            }
        break;
    }
    
    /**
     * The arrays of coins and bills save information of each session
     *
     * Uncomment line below to show in console the money of session
     */
    //addLog("log",JSON.parse(JSON.stringify({"bills":owl_arr_bills,"coins":owl_arr_coins})));
}

function owlConnectionLost(event) {
    addLog("warn",event);
    extOwlConnectionLost(event);
}

/**
 * Makes a disconnection of device
 * @name owlDisconnect
 */
function owlDisconnect() {
    serialOwlDisconnect().then(r => {
        addLog("log",r);
    });
}

/**
 * Makes and send bytes custom and send to device
 * @name owlCustomCode
 * @param arr array with hex code
 */
function owlCustomCode(arr) {
    owlPreSendBytes(arr, 'custom code');
}

/**
 * Accept banknote that is in pre stacker
 * @name owlAcceptBanknote
 */
function owlAcceptBanknote() {
    let bytes = ["F1", "C4", "01", "00", "00", "00", "00", "00", "00", "00", "F2", "00"];
    owlPreSendBytes(bytes, 'Bank note accepted');
}

/**
 * Reject banknote that is in pre stacker
 * @name owlRejectBanknote
 */
function owlRejectBanknote() {
    let bytes = ["F1", "C4", "00", "00", "00", "00", "00", "00", "00", "00", "F2", "00"];
    owlPreSendBytes(bytes, 'Bank note rejected');
}

/**
 * Read temperature
 * @name owlReadTemperature
 */
function owlReadTemperature() {
    let bytes = ["F1", "CB", "00", "00", "00", "00", "00", "00", "00", "00", "F2", "00"];
    owlPreSendBytes(bytes, 'temperature status');
}

/**
 * Save memory of bill purse (not tested)
 * 03 => enable
 * 00 => disable channel
 * @name owlSaveMemoryBillPurse
 * @param channel byte channel configuration
 * @param peso20
 * @param peso50
 * @param peso100
 * @param peso200
 * @param peso500
 * @param peso1000
 */
function owlSaveMemoryBillPurse(channel, peso20, peso50, peso100, peso200, peso500, peso1000) {
    let bytes = ["F1", "C8", channel, "00", peso20, peso50, peso100, peso200, peso500, peso1000, "F2", "00"];
    owlPreSendBytes(bytes, 'Save memory bill purse');
}

/**
 * Read memory bill purse
 * @name owlReadMemoryBillPurse
 */
function owlReadMemoryBillPurse() {
    let bytes = ["F1", "C9", "00", "00", "00", "00", "00", "00", "00", "00", "F2", "00"];
    owlPreSendBytes(bytes, 'Read memory bill purse');
}

/**
 * Engines matrix with sensor only
 * @name owlEnginesMatrixSensor
 * @param product1
 * @param product2
 */
function owlEnginesMatrixSensor(product1, product2) {
    owlEnginesMatrix(product1, product2, "00");
}

/**
 * Engines matrix with time only (default 3 seconds)
 * @name owlEnginesMatrixTime
 * @param product1
 * @param product2
 * @param time
 */
function owlEnginesMatrixTime(product1, product2, time) {
    if (owlHexMaker(time.toString(), 2) === "00") {
        time = "1E"; //3 seconds
    }
    owlEnginesMatrix(product1, product2, time);
}

/**
 * Enable cooling relay
 * @name owlEnableCoolingRelay
 */
function owlEnableCoolingRelay() {
    owlCoolingRelay('01');
}

/**
 * Disable cooling relay
 * @name owlDisableCoolingRelay
 */
function owlDisableCoolingRelay() {
    owlCoolingRelay();
}

/**
 * Nayax cashless dispense
 * @name owlNayaxCashless
 * @param status enable or disable nayax
 * @param product1 product 1
 * @param product2 product 2 (default 00)
 * @param type time or sensor=00
 * @param high amount high part
 * @param low amount low part
 */
function owlNayaxCashless(status, product1, product2, type, high, low) {
    if (owlHexMaker(status.toString()) === "00") {
        owlDisableNayax();
        return;
    }

    // for validation is needed give a max amount of pre-credit authorized by nayax
    if (owl_nayax_max_pre_credit === 0) {
        extOwlNayaxPreCreditFail('define')
    } else {
        let calc = (owlHexToDec(high) * 256) + owlHexToDec(low);
        if (!isNaN(calc) && owl_nayax_max_pre_credit >= calc) {
            let bytes = ["F1", "CD", status, product1, product2, type, high, low, "00", "00", "F2", "00"];
            owlPreSendBytes(bytes, 'Nayax enabled');
        } else {
            extOwlNayaxPreCreditFail('amount')
        }
    }
}

/**
 * Calc the price given in decimal and return the 2 hex values required in command owlNayaxCashless
 * @name owlCalcNayaxPrice
 * @param decimal
 * @returns {{high: string, low: string}}
 */
function owlCalcNayaxPrice(decimal) {
    decimal = parseInt(decimal);
    let residue = Math.floor(decimal / 256)
    let high = owlHexMaker(owlDecToHex(0)).toUpperCase();
    if (residue >= 1) {
        high = owlHexMaker(owlDecToHex(residue)).toUpperCase();
    }
    let low = owlHexMaker(owlDecToHex(decimal - (256 * residue))).toUpperCase();

    return {high, low};
}


/**
 * Return change (money), this function is only when the coin purse and bill purse can return change
 * The bill purse must return banknote otherwise use @owlReturnChangeCoinPurse
 * @name owlReturnChange
 */
function owlReturnChange() {
    last_change_coin_purse = 0; // reset to zero

    let coins_quantity_amount = 
        (owlHexToDec(owl_arr_coins_tubes.G50)*.5)+
        (owlHexToDec(owl_arr_coins_tubes.P1)*1)+
        (owlHexToDec(owl_arr_coins_tubes.P2)*2)+
        (owlHexToDec(owl_arr_coins_tubes.P5)*5)+
        (owlHexToDec(owl_arr_coins_tubes.P10)*10);
    let totalMonedasTubos=coins_quantity_amount;
	let bills_quantity_amount = 
        (owl_arr_bills_recycler.P20*20)+
        (owl_arr_bills_recycler.P50*50);
    let totalBilletesRecycler = bills_quantity_amount;
    //alert('dinero con billetes dispensar = '+bills_quantity_amount)

    addLog("log",owl_change);
    addLog("log","billetes disponibles");
    addLog("log",owl_arr_bills_recycler);

    addLog("log","Monedas disponibles (hex)");
    addLog("log",owl_arr_coins_tubes);
    
    let money = {
        "coins": {
            "c50": 0,
            "p1": 0,
            "p2": 0,
            "p5": 0,
            "p10": 0,
        },
        "bills": {
            "b20": 0,
            "b50": 0,
            "b100": 0,
            "b200": 0,
            "b500": 0,
            "b1000": 0,
            "total_to_dispense": 0,
        }
    };

    let change_new = owl_change;
    let notifyChangeNotDispensed = false;

    if (owl_change > 0) {
        let breakit = false;

        for (let i = 0; i < 20; i++) {
            // if change is 0 ends cycle for
            if (change_new === 0) {
                break;
            }

            // banknotes
            if ((change_new - 1000) >= 0 && owl_arr_bills_recycler.P1000 > money.bills.b1000) {
                money.bills.b1000++;
                money.bills.total_to_dispense += 1000;
                change_new -= 1000;
            } else if ((change_new - 500) >= 0 && owl_arr_bills_recycler.P500 > money.bills.b500) {
                money.bills.b500++;
                money.bills.total_to_dispense += 500;
                change_new -= 500;
            } else if ((change_new - 200) >= 0 && owl_arr_bills_recycler.P200 > money.bills.b200) {
                money.bills.b200++;
                money.bills.total_to_dispense += 200;
                change_new -= 200;
            } else if ((change_new - 100) >= 0 && owl_arr_bills_recycler.P100 > money.bills.b100) {
                money.bills.b100++;
                money.bills.total_to_dispense += 100;
                change_new -= 100;
            } else if ((change_new - 50) >= 0 && owl_arr_bills_recycler.P50 > money.bills.b50) {
                money.bills.b50++;
                money.bills.total_to_dispense += 50;
                change_new -= 50;
            } else if ((change_new - 20) >= 0 && owl_arr_bills_recycler.P20 > money.bills.b20) {
                money.bills.b20++;
                money.bills.total_to_dispense += 20;
                change_new -= 20;
            }
            // coins
            else if ((change_new - 10) >= 0 && owlHexToDec(owl_arr_coins_tubes.P10) > money.coins.p10) {
                money.coins.p10++;
                change_new -= 10;
            } else if ((change_new - 5) >= 0 && owlHexToDec(owl_arr_coins_tubes.P5) > money.coins.p5) {
                money.coins.p5++;
                change_new -= 5;
            } else if ((change_new - 2) >= 0 && owlHexToDec(owl_arr_coins_tubes.P2) > money.coins.p2) {
                money.coins.p2++;
                change_new -= 2;
            } else if ((change_new - 1) >= 0 && owlHexToDec(owl_arr_coins_tubes.P1) > money.coins.p1) {
                money.coins.p1++;
                change_new -= 1;
            } else if ((change_new - .5) >= 0 && owlHexToDec(owl_arr_coins_tubes.G50) > money.coins.c50) {
                money.coins.c50++;
                change_new -= .5;
            }
            // reset the counter if the change doesn't complete
            if (i === 19 && change_new > 0) {
                i = 0;
                if(breakit){
                    notifyChangeNotDispensed = true;
                    break;
                }
                breakit = true;
            }
        }
    } else {
        // the change is in zeros, nothing is return
    }

    let str = JSON.stringify({
        "coins": {
            "c50": money.coins.c50,
            "p1": money.coins.p1,
            "p2": money.coins.p2,
            "p5": money.coins.p5,
            "p10": money.coins.p10
        },
        "bills": {
            "p20": money.bills.b20,
            "p50": money.bills.b50,
            "p100": money.bills.b100,
            "p200": money.bills.b200,
            "p500": money.bills.b500,
            "p1000": money.bills.b1000
        },
        "change": owl_change
    });

    change_returned_verified = owl_change;
    if(owl_change > (totalMonedasTubos)+totalBilletesRecycler){	
        change_returned_verified = (totalMonedasTubos)+totalBilletesRecycler;
    	addLog("warn","El cambio es mas de lo que se puede entregar");
	}else if(notifyChangeNotDispensed){
        addLog("warn","El cambio es mas de lo que se puede entregar, mostrando alerta en pantalla");
        owl_no_dispense_all_money = true;
        extOwlRetireBill(true);
    }


    let obj = JSON.parse(str);

    if (obj.change > 0) {
        // evaluate if banknotes will be dispensed
        let dispense_banknotes = false;
        Object.keys(obj.bills).forEach((value) => {
            if (!dispense_banknotes && obj.bills[value] > 0) {
                dispense_banknotes = true;
            }
        });

        // evaluate if coins will be dispensed
        let dispense_coins = false;
        Object.keys(obj.coins).forEach((value) => {
            if (!dispense_coins && obj.coins[value] > 0) {
                dispense_coins = true;
            }
        });

        addLog("log",obj);
        addLog("log",'billetines',dispense_banknotes);
        addLog("log",'moneditas',dispense_coins);

        if(dispense_banknotes){
            if(owl_ict === true){
                let qant = 0;
                if(owl_ict_bill === 0){
                    qant =(money.bills.b20)
                }
                else if(owl_ict_bill === 1){
                    qant =(money.bills.b50)
                    //qant =(bills_quantity_amount/50)
                }
                else if(owl_ict_bill === 2){
                    qant =(money.bills.b100)
                    //qant =(bills_quantity_amount/100)
                }
                else if(owl_ict_bill === 3){
                    qant =(money.bills.b200)
                    //qant =(bills_quantity_amount/200)
                }
                else if(owl_ict_bill === 4){
                    qant =(money.bills.b500)
                    //qant =(bills_quantity_amount/500)
                }
                else if(owl_ict_bill === 5){
                    qant =(money.bills.b1000)
                    //qant =(bills_quantity_amount/1000)
                }

                //alert('dispensando: '+qant+' billetes');
                owlDispenseBanknoteICT(owl_ict_bill,owlDecToHex(qant));
            }else{
                let db_banknotes = {
                    "b20": (obj.bills.p20).toString(16),
                    "b50": (obj.bills.p50).toString(16),
                    "b100": (obj.bills.p100).toString(16),
                    "b200": (obj.bills.p200).toString(16),
                    "b500": (obj.bills.p500).toString(16),
                    "b1000": (obj.bills.p1000).toString(16),
                };
                
                owlDispenseBanknotes(db_banknotes.b20, db_banknotes.b50, db_banknotes.b100, db_banknotes.b200, db_banknotes.b500, db_banknotes.b1000);
            }
        }

        
        if (dispense_coins) {
            if(owlHexToDec(owl_arr_coins_tubes.G50) >= obj.coins.c50){
                last_change_coin_purse += (obj.coins.c50*.5)
            }else{
                last_change_coin_purse += (owlHexToDec(owl_arr_coins_tubes.G50)*.5)
            }

            
            if(owlHexToDec(owl_arr_coins_tubes.P1) >= obj.coins.p1){
                last_change_coin_purse += (obj.coins.p1*1)
            }else{
                last_change_coin_purse += (owlHexToDec(owl_arr_coins_tubes.P1)*1)
            }


            if(owlHexToDec(owl_arr_coins_tubes.P2) >= obj.coins.p2){
                last_change_coin_purse += (obj.coins.p2*2)
            }else{
                last_change_coin_purse += (owlHexToDec(owl_arr_coins_tubes.P2)*2)
            }


            if(owlHexToDec(owl_arr_coins_tubes.P5) >= obj.coins.p5){
                last_change_coin_purse += (obj.coins.p5*5)
            }else{
                last_change_coin_purse += (owlHexToDec(owl_arr_coins_tubes.P5)*5)
            }
            
            
            if(owlHexToDec(owl_arr_coins_tubes.P10) >= obj.coins.p10){
                last_change_coin_purse += (obj.coins.p10*10)
            }else{
                last_change_coin_purse += (owlHexToDec(owl_arr_coins_tubes.P10)*10)
            }
            

            console.error(last_change_coin_purse)

            let db_coins = {
                "c50": (obj.coins.c50).toString(16),
                "p1": (obj.coins.p1).toString(16),
                "p2": (obj.coins.p2).toString(16),
                "p5": (obj.coins.p5).toString(16),
                "p10": (obj.coins.p10).toString(16),
            };
            setTimeout(function(){
                owlDispenseCoins(db_coins.c50, db_coins.p1, db_coins.p2, db_coins.p5, db_coins.p10)
            },1500);
        }

    } else {
        // theres no change to return
    }
}

/**
 * Return change (money), this function is only when the coin purse and bill purse can return change
 * The bill purse must return banknote otherwise use @owlReturnChangeCoinPurse
 * @name owlReturnChangeComprobator
 */
function owlReturnChangeComprobator(change) {
    var notifyChangeNotDispensedComp=false;
    let coins_quantity_amount = 
        (owlHexToDec(owl_arr_coins_tubes.G50)*.5)+
        (owlHexToDec(owl_arr_coins_tubes.P1)*1)+
        (owlHexToDec(owl_arr_coins_tubes.P2)*2)+
        (owlHexToDec(owl_arr_coins_tubes.P5)*5)+
        (owlHexToDec(owl_arr_coins_tubes.P10)*10);
    let totalMonedasTubos=coins_quantity_amount;
    let bills_quantity_amount = 
        (owl_arr_bills_recycler.P20*20)+
        (owl_arr_bills_recycler.P50*50);
    let totalBilletesRecycler = bills_quantity_amount;
    //alert('dinero con billetes dispensar = '+bills_quantity_amount)

    addLog("log","billetes disponibles");
    addLog("log",owl_arr_bills_recycler);

    addLog("log","Monedas disponibles (hex)");
    addLog("log",owl_arr_coins_tubes);
    
    let money = {
        "coins": {
            "c50": 0,
            "p1": 0,
            "p2": 0,
            "p5": 0,
            "p10": 0,
        },
        "bills": {
            "b20": 0,
            "b50": 0,
            "b100": 0,
            "b200": 0,
            "b500": 0,
            "b1000": 0,
            "total_to_dispense": 0,
        }
    };

    let change_new = change;

    if (change > 0) {
        let breakit = false;

        for (let i = 0; i < 20; i++) {
            // if change is 0 ends cycle for
            if (change_new === 0) {
                break;
            }

            // banknotes
            if ((change_new - 1000) >= 0 && owl_arr_bills_recycler.P1000 > money.bills.b1000) {
                money.bills.b1000++;
                money.bills.total_to_dispense += 1000;
                change_new -= 1000;
            } else if ((change_new - 500) >= 0 && owl_arr_bills_recycler.P500 > money.bills.b500) {
                money.bills.b500++;
                money.bills.total_to_dispense += 500;
                change_new -= 500;
            } else if ((change_new - 200) >= 0 && owl_arr_bills_recycler.P200 > money.bills.b200) {
                money.bills.b200++;
                money.bills.total_to_dispense += 200;
                change_new -= 200;
            } else if ((change_new - 100) >= 0 && owl_arr_bills_recycler.P100 > money.bills.b100) {
                money.bills.b100++;
                money.bills.total_to_dispense += 100;
                change_new -= 100;
            } else if ((change_new - 50) >= 0 && owl_arr_bills_recycler.P50 > money.bills.b50) {
                money.bills.b50++;
                money.bills.total_to_dispense += 50;
                change_new -= 50;
            } else if ((change_new - 20) >= 0 && owl_arr_bills_recycler.P20 > money.bills.b20) {
                money.bills.b20++;
                money.bills.total_to_dispense += 20;
                change_new -= 20;
            }
            // coins
            else if ((change_new - 10) >= 0 && owlHexToDec(owl_arr_coins_tubes.P10) > money.coins.p10) {
                money.coins.p10++;
                change_new -= 10;
            } else if ((change_new - 5) >= 0 && owlHexToDec(owl_arr_coins_tubes.P5) > money.coins.p5) {
                money.coins.p5++;
                change_new -= 5;
            } else if ((change_new - 2) >= 0 && owlHexToDec(owl_arr_coins_tubes.P2) > money.coins.p2) {
                money.coins.p2++;
                change_new -= 2;
            } else if ((change_new - 1) >= 0 && owlHexToDec(owl_arr_coins_tubes.P1) > money.coins.p1) {
                money.coins.p1++;
                change_new -= 1;
            } else if ((change_new - .5) >= 0 && owlHexToDec(owl_arr_coins_tubes.G50) > money.coins.c50) {
                money.coins.c50++;
                change_new -= .5;
            }
            // reset the counter if the change doesn't complete
             if (i === 19 && change_new > 0) {
                i = 0;
                if(breakit){
                    notifyChangeNotDispensedComp = true;
                    break;
                }
                breakit = true;
            }
        }
    } else {
        return false;
        // the change is in zeros, nothing is return
    }


    change_returned_verified = owl_change;
    if(owl_change > (totalMonedasTubos)+totalBilletesRecycler){ 
        return false;
        addLog("warn","El cambio es mas de lo que se puede entregar");
    }else if(notifyChangeNotDispensedComp){
       return false;
    }else{
        return true;
    }



}

/**
 * Return change (money), this function only return change with the coin purse
 * @name owlReturnChangeCoinPurse
 */
function owlReturnChangeCoinPurse() {
    let money = {
        "coins": {
            "c50": 0,
            "p1": 0,
            "p2": 0,
            "p5": 0,
            "p10": 0,
        }
    };

    let change_new = owl_change;

    if (owl_change > 0) {

        for (let i = 0; i < 20; i++) {
            // if change is 0 ends cycle for
            if (change_new === 0) {
                break;
            }

            // coins
            else if ((change_new - 10) >= 0) {
                money.coins.p10++;
                change_new -= 10;
            } else if ((change_new - 5) >= 0) {
                money.coins.p5++;
                change_new -= 5;
            } else if ((change_new - 2) >= 0) {
                money.coins.p2++;
                change_new -= 2;
            } else if ((change_new - 1) >= 0) {
                money.coins.p1++;
                change_new -= 1;
            } else if ((change_new - .5) >= 0) {
                money.coins.c50++;
                change_new -= .5;
            }
            // reset the counter if the change doesn't complete
            if (i === 19 && change_new > 0) {
                i = 0;
            }
        }
    } else {
        // the change is in zeros, nothing is return
    }

    let str = JSON.stringify({
        "coins": {
            "c50": money.coins.c50,
            "p1": money.coins.p1,
            "p2": money.coins.p2,
            "p5": money.coins.p5,
            "p10": money.coins.p10
        },
        "change": owl_change
    });

    let obj = JSON.parse(str);

    if (obj.change > 0) {
        // evaluate if coins will be dispensed
        let dispense_coins = false;
        Object.keys(obj.coins).forEach((value) => {
            if (!dispense_coins && obj.coins[value] > 0) {
                dispense_coins = true;
            }
        });

        addLog("log",obj);


        if (dispense_coins) {
            let db_coins = {
                "c50": (obj.coins.c50).toString(16),
                "p1": (obj.coins.p1).toString(16),
                "p2": (obj.coins.p2).toString(16),
                "p5": (obj.coins.p5).toString(16),
                "p10": (obj.coins.p10).toString(16),
            };
            owlDispenseCoins(db_coins.c50, db_coins.p1, db_coins.p2, db_coins.p5, db_coins.p10);
        }

    } else {
        // theres no change to return
    }
}

/**
 * Return change (money), this function only return change with the bill purse
 * @name owlReturnChangeBillPurse
 */
function owlReturnChangeBillPurse() {
    $("#divRetireNow").fadeIn();
    addLog("log","regresando billete");
    let money = {
        "bills": {
            "b20": 0,
            "b50": 0,
            "b100": 0,
            "b200": 0,
            "b500": 0,
            "b1000": 0,
        }
    };

    let change_new = owl_change;

    if (owl_change > 0) {

        for (let i = 0; i < 20; i++) {
            // if change is 0 ends cycle for
            if (change_new === 0) {
                break;
            }

            // banknotes
            if ((change_new - 1000) >= 0) {
                money.bills.b1000++;
                change_new -= 1000;
            } else if ((change_new - 500) >= 0) {
                money.bills.b500++;
                change_new -= 500;
            } else if ((change_new - 200) >= 0) {
                money.bills.b200++;
                change_new -= 200;
            } else if ((change_new - 100) >= 0) {
                money.bills.b100++;
                change_new -= 100;
            } else if ((change_new - 50) >= 0) {
                money.bills.b50++;
                change_new -= 50;
            } else if ((change_new - 20) >= 0) {
                money.bills.b20++;
                change_new -= 20;
            }

            // reset the counter if the change doesn't complete
            if (i === 19 && change_new > 0) {
                i = 0;
            }
        }
    } else {
        // the change is in zeros, nothing is return
    }

    let str = JSON.stringify({
        "bills": {
            "p20": money.bills.b20,
            "p50": money.bills.b50,
            "p100": money.bills.b100,
            "p200": money.bills.b200,
            "p500": money.bills.b500,
            "p1000": money.bills.b1000
        },
        "change": owl_change
    });

    let obj = JSON.parse(str);

    if (obj.change > 0) {
        // evaluate if banknotes will be dispensed
        let dispense_banknotes = false;
        let bills_quantity_amount = 0;
        Object.keys(obj.bills).forEach((value) => {
            if (!dispense_banknotes && obj.bills[value] > 0) {
                if(value === "p20"){
                    bills_quantity_amount += 20*obj.bills[value];
                }
                else if(value === "p50"){
                    bills_quantity_amount += 50*obj.bills[value];
                }
                else if(value === "p100"){
                    bills_quantity_amount += 100*obj.bills[value];
                }
                else if(value === "p200"){
                    bills_quantity_amount += 200*obj.bills[value];
                }
                else if(value === "p500"){
                    bills_quantity_amount += 500*obj.bills[value];
                }
                else if(value === "p1000"){
                    bills_quantity_amount += 1000*obj.bills[value];
                }
                dispense_banknotes = true;
            }
        });

        addLog("log",obj);

        if(owl_ict === true){
            let qant = 0;
            if(owl_ict_bill === 0){
                qant =(bills_quantity_amount/20)
            }
            else if(owl_ict_bill === 1){
                qant =(bills_quantity_amount/50)
            }
            else if(owl_ict_bill === 2){
                qant =(bills_quantity_amount/100)
            }
            else if(owl_ict_bill === 3){
                qant =(bills_quantity_amount/200)
            }
            else if(owl_ict_bill === 4){
                qant =(bills_quantity_amount/500)
            }
            else if(owl_ict_bill === 5){
                qant =(bills_quantity_amount/1000)
            }

            owlDispenseBanknoteICT(owl_ict_bill,owlDecToHex(qant));
            if(!owl_control){
                let denomi = '50';
                switch(owl_ict_bill){
                    case 0:
                        denomi = '20';
                        break;    
                    case 1:
                        denomi = '50';
                        break;
                    case 2:
                        denomi = '100';
                        break;
                    case 3:
                        denomi = '200';
                        break;
                    case 4:
                        denomi = '500';
                        break;
                    case 5:
                        denomi = '1000';
                        break;
                }

                /*send('dineroRegresadoArr',JSON.stringify({
                    "movimiento":_sup_id_movimiento_,
                    "ubicacion": "null",
                    "efectivo": {
                        "1000":owl_arr_bills.stacker.P1000+owl_arr_bills.recycler.P1000,
                        "500":owl_arr_bills.stacker.P500+owl_arr_bills.recycler.P500,
                        "200":owl_arr_bills.stacker.P200+owl_arr_bills.recycler.P200,
                        "100":owl_arr_bills.stacker.P100+owl_arr_bills.recycler.P100,
                        "50":owl_arr_bills.stacker.P50+owl_arr_bills.recycler.P50,
                        "20":owl_arr_bills.stacker.P20+owl_arr_bills.recycler.P20,
                    },
                    'cantidad':qant,
                    'denominacion':denomi
                }));*/
            }
        }else{
            let db_banknotes = {
                "b20": (obj.bills.p20).toString(16),
                "b50": (obj.bills.p50).toString(16),
                "b100": (obj.bills.p100).toString(16),
                "b200": (obj.bills.p200).toString(16),
                "b500": (obj.bills.p500).toString(16),
                "b1000": (obj.bills.p1000).toString(16),
            };
            
            owlDispenseBanknotes(db_banknotes.b20, db_banknotes.b50, db_banknotes.b100, db_banknotes.b200, db_banknotes.b500, db_banknotes.b1000);
        }

    } else {
        // theres no change to return
    }
}

/**
 * Parse an array of hex values to an array of dec values
 * @param arr
 * @returns {[]}
 */
function owlArrDecToHex(arr) {
    let arr_new = [];
    arr.forEach((value, index) => {
        arr_new[index] = owlDecToHex(value);
    });
    return arr_new;
}

/**
 * Parse an array of dec values to an array of hex values
 * @param arr
 * @returns {[]}
 */
function owlArrHexToDec(arr) {
    let arr_new = [];
    arr.forEach((value, index) => {
        arr_new[index] = owlHexToDec(value);
    });
    return arr_new;
}

/**
 * Calc change
 * @returns {{error: string}|{change: number, error: number}}
 */
function owlCalcChange() {
    if (owl_price !== undefined) {
        return {"error": __("The price it is not defined, can not make a calc with a undefined value")};
    }

    if (owl_amount_inserted === owl_price) {// if mount is equal to price
        owl_change = 0;
    } else if (owl_amount_inserted > owl_price) {// if mount is superior to price
        owl_change = owl_amount_inserted - owl_price;
    } else { // if mount is minus to price
        return {"error": __("The amount to be collected has not been covered")};
    }
    return {
        "change": owl_change,
        "error": 0,
    };
}

/**
 * Clean the last error
 */
function owlClearErrors() {
    owl_last_error = original_owl_last_error;
}

/**
 * Clean the interval of sense product
 * @name owlClearSenseProduct
 */
function owlClearSenseProduct() {
    clearInterval(owl_waiting_for_sense);
    owl_waiting_for_sense = undefined;
    owl_status_dispense = undefined;
}

/**
 * Reload when ends something
 * @param hard {boolean} force the reload of page
 */
function owlReload(hard = false) {
    // if the const is true
    if (typeof ext_owl_reload_when_finished === "undefined") {
        addLog("error",__("You must declare a 'ext_owl_reload_when_finished' as a constant in your 'ext.js' file"));
    } else {
        if (ext_owl_reload_when_finished) {
            if (hard === true) {
                location.reload();
            } else {
                owlSoftReload();
            }
        }
    }
}

/**
 * Get all the errors in the app not handled
 * @name owlErrors
 * @param error
 */
function owlErrors(error) {
    extOwlErrors(error);
}

function owlInitSerial() {
    // element that contains an error unsupported navigator
    const owl_serial_navigator_not_supported = document.getElementById('owl_serial_navigator_not_supported');
    // Show or hide a banner of error, navigator is not supported
    owl_serial_navigator_not_supported.classList.toggle('hidden', 'serial' in navigator);

    // try to connect
    serialOwlConnect().then(() => {
        //when finish the connection
    });


    document.querySelector('#boardroid-container').innerHTML += owl_code_not_device_detected + owl_code_permissions_serial_devices;

    document.getElementById('btn-open-warning-modal-permission').addEventListener('click', (e) => {
        document.getElementById('container-warning-modal-permission').classList.remove('hidden');
    });
    document.getElementById('btn-choose-serial-modal').addEventListener('click', (e) => {
        document.getElementById('container-warning-modal-permission').classList.add('hidden');
    });


    owl_serial_btn_connect_serial = document.querySelectorAll('.owl_serial_btn_connect_serial');
    // for every element that has the class add an listener to connect
    for (let i = 0; i < owl_serial_btn_connect_serial.length; i++) {
        owl_serial_btn_connect_serial[i].addEventListener('click', serialOwlClickConnect);
    }

    /**
     * Listener for connections of serial devices
     */
    navigator.serial.addEventListener("connect", (event) => {
        addLog("debug",__("Serial device detected again."), event);
        // TODO: Automatically open event.target or warn user a port is available.
        serialOwlConnect().then(() => {
            //when finish the connection
        });
        extOwlWithDevice();
    });

    /**
     * Listener for disconnections of serial devices
     */
    navigator.serial.addEventListener("disconnect", (event) => {
        // If the serial port was opened, a stream error would be observed as well.
        owlConnectionLost(event);
    });

}

function owlHasToReturnChange(price_to_eval) {
    let coins_quantity_amount = 
        (owlHexToDec(owl_arr_coins_tubes.G50)*.5)+
        (owlHexToDec(owl_arr_coins_tubes.P1)*1)+
        (owlHexToDec(owl_arr_coins_tubes.P2)*2)+
        (owlHexToDec(owl_arr_coins_tubes.P5)*5)+
        (owlHexToDec(owl_arr_coins_tubes.P10)*10);
    let totalMonedasTubos=coins_quantity_amount;
	let bills_quantity_amount = 
        (owl_arr_bills_recycler.P20*20)+(owl_arr_bills_recycler.P50*50);
    let totalBilletesRecycler = bills_quantity_amount;
    addLog("log",{'price_to_eval':price_to_eval,"available_bills":owl_arr_bills_recycler,"available_coins_hex":owl_arr_coins_tubes});
    
    let money = {
        "coins": {"c50": 0,"p1": 0,"p2": 0,"p5": 0,"p10": 0},
        "bills": {"b20": 0,"b50": 0,"b100": 0,"b200": 0,"b500": 0,"b1000": 0,"total_to_dispense": 0}
    };

    let change_new = price_to_eval;
    let notifyChangeNotDispensed = false;
    if (price_to_eval > 0) {
        let breakit = false;
        for (let i = 0; i < 20; i++) {
            // if change is 0 ends cycle for
            if (change_new === 0) {
                break;
            }
            // banknotes
            if ((change_new - 1000) >= 0 && owl_arr_bills_recycler.P1000 > money.bills.b1000) {
                money.bills.b1000++;
                money.bills.total_to_dispense += 1000;
                change_new -= 1000;
            } else if ((change_new - 500) >= 0 && owl_arr_bills_recycler.P500 > money.bills.b500) {
                money.bills.b500++;
                money.bills.total_to_dispense += 500;
                change_new -= 500;
            } else if ((change_new - 200) >= 0 && owl_arr_bills_recycler.P200 > money.bills.b200) {
                money.bills.b200++;
                money.bills.total_to_dispense += 200;
                change_new -= 200;
            } else if ((change_new - 100) >= 0 && owl_arr_bills_recycler.P100 > money.bills.b100) {
                money.bills.b100++;
                money.bills.total_to_dispense += 100;
                change_new -= 100;
            } else if ((change_new - 50) >= 0 && owl_arr_bills_recycler.P50 > money.bills.b50) {
                money.bills.b50++;
                money.bills.total_to_dispense += 50;
                change_new -= 50;
            } else if ((change_new - 20) >= 0 && owl_arr_bills_recycler.P20 > money.bills.b20) {
                money.bills.b20++;
                money.bills.total_to_dispense += 20;
                change_new -= 20;
            }
            // coins
            else if ((change_new - 10) >= 0 && owlHexToDec(owl_arr_coins_tubes.P10) > money.coins.p10) {
                money.coins.p10++;
                change_new -= 10;
            } else if ((change_new - 5) >= 0 && owlHexToDec(owl_arr_coins_tubes.P5) > money.coins.p5) {
                money.coins.p5++;
                change_new -= 5;
            } else if ((change_new - 2) >= 0 && owlHexToDec(owl_arr_coins_tubes.P2) > money.coins.p2) {
                money.coins.p2++;
                change_new -= 2;
            } else if ((change_new - 1) >= 0 && owlHexToDec(owl_arr_coins_tubes.P1) > money.coins.p1) {
                money.coins.p1++;
                change_new -= 1;
            } else if ((change_new - .5) >= 0 && owlHexToDec(owl_arr_coins_tubes.G50) > money.coins.c50) {
                money.coins.c50++;
                change_new -= .5;
            }
            // reset the counter if the change doesn't complete
            if (i === 19 && change_new > 0) {
                i = 0;
                if(breakit){
                    notifyChangeNotDispensed = true;
                    break;
                }
                breakit = true;
            }
        }
    } else {
        // the change is in zeros, nothing is return
    }
    if((price_to_eval > (totalMonedasTubos)+totalBilletesRecycler) || (notifyChangeNotDispensed)){	
    	addLog("warn","El cambio es mas de lo que se puede entregar");
        return false;
	}
    return true;
}


/**
 * @author danidoble
 * @date 2021-03
 * This function translate the content put inside of key
 * @name __
 * @param key string in some language to translate to other language
 * @returns {string|*}
 *
 */
function __(key = "") {
    return (typeof dd_lang === "undefined" || !dd_lang[key]) ? key : dd_lang[key];
    /*if (typeof dd_lang === "undefined") {
        return key;
    }
    if (dd_lang[key]) {
        return dd_lang[key];
    }
    return key;*/
}