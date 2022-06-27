/*!
 * Weblinker v2.0 - web serial
 * @author danidoble
 * @year 2021
 * Copyright 2020-2022 Owl desarrollos
 * Copyright 2020-2022 Coin city mexico.
 */
"use strict"; //if you have problems with this you can comment it with -> //

const owl_lock1_pre_requisites_html = '<div id="boardroid-container"></div>\n' +
    '    <div id="owl_lock1_serial_navigator_not_supported" class="hidden max-w-7xl mb-4 w-full mx-auto">\n' +
    '        <div class="rounded-md bg-red-50 p-4">\n' +
    '            <div class="flex">\n' +
    '                <div class="flex-shrink-0">\n' +
    '                    <!-- Heroicon name: solid/x-circle -->\n' +
    '                    <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"\n' +
    '                         fill="currentColor" aria-hidden="true">\n' +
    '                        <path fill-rule="evenodd"\n' +
    '                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"\n' +
    '                              clip-rule="evenodd"/>\n' +
    '                    </svg>\n' +
    '                </div>\n' +
    '                <div class="ml-3">\n' +
    '                    <h3 class="text-sm font-medium text-red-800">\n' +
    '                        Lo sentimos tu navegador no es compatible con <b>Web Serial</b>.<br>\n' +
    '                        Asegurate de estar en un navegador compatible.\n' +
    '                    </h3>\n' +
    '                    <div class="mt-2 text-sm text-red-700">\n' +
    '                        <ul class="list-disc pl-5 space-y-1">\n' +
    '                            <li>\n' +
    '                                En Chrome 78 - 88 puedes habilitar el soporte en\n' +
    '                                <code>chrome://flags</code> habilitando la bandera\n' +
    '                                <code>#enable-experimental-web-platform-features</code>\n' +
    '                            </li>\n' +
    '                            <li>\n' +
    '                                En Chrome 89 ya esta integrada la funcionalidad al navegador\n' +
    '                            </li>\n' +
    '                            <li>\n' +
    '                                Puedes usar Microsoft Edge ^v89 (Chromium) en versiones menores a 89 debería funcionar igual\n' +
    '                                que chrome.\n' +
    '                                <br>\n' +
    '                                <code>edge://flags</code> habilitando la bandera\n' +
    '                                <code>#enable-experimental-web-platform-features</code>\n' +
    '                            </li>\n' +
    '                        </ul>\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>';

document.querySelector('body').innerHTML += owl_lock1_pre_requisites_html;

/**
 * bytes to make connection with the device
 * @type {string[]}
 */
const owl_lock1_bytes_connection = ["F1", "06", "00", "00", "00", "00", "00", "00", "00", "00", "F2", "F8"];
/**
 * if the connection get lost the interval of reconnection start
 * @type {number}
 */
let owl_lock1_interval = undefined;
/**
 * time for receive answers
 * @type {number}
 */
let owl_lock1_time_response_general = 3e3;
let owl_lock1_time_response_connect_start = 500;
/**
 * store the timeout to realize an operation in case of response not return in some time
 * @type {NodeJS.Timeout}
 */
let owl_lock1_timer_until_response = undefined;
/**
 * aux iteration for test function
 * @type {number}
 */
let owl_lock1_aux_iteration = 10;
/**
 * status of dispense
 * @type {undefined|boolean}
 */
let owl_lock1_status_dispense = undefined;
/**
 * Store the last error registered
 * @type {{handler: null|string, code: null|*[], no_code: number, message: null|string}}
 */
let owl_lock1_last_error = {
    "message": null,
    "handler": null,
    "code": null,
    "no_code": 666,
};
/**
 * Stop the sending commands until receive response
 * @type {NodeJS.Timer}
 */
let owl_lock1_wait_until_last_command_returns = undefined;
/**
 * Commands in queue to send to device serial
 * @type {array}
 */
let owl_lock1_queue_commands = [];
/**
 * Time to try reconnect
 * @type {number}
 */
let owl_lock1_time_to_reconnect = 7e3;
/**
 * If is true will shown a message in full screen if the serial device is not connected
 * @type {boolean}
 */
let owl_lock1_show_without_device = true;
/**
 * Route or base64 URL of image to show if device is not detected
 * @name owl_lock1_image_not_device_detected
 * @type {string}
 */
let owl_lock1_image_not_device_detected = "data:image/svg+xml;base64,PHN2ZyBpZD0iX3gzMV9feDJDXzUiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTEyLjE4OSAxOC4yNSA1LjU2MSA1LjU2MSAyLjA2MS0yLjA2MS01LjAzLTUuMDNjLS4xNDYtLjE0Ni0uMzM4LS4yMi0uNTMtLjIycy0uMzg0LjA3My0uNTMuMjJ6IiBmaWxsPSIjY2ZkOGRjIi8+PHBhdGggZD0ibTguNDY4IDYuOTg4LTEuNTkyLTEuNTkyYy0uNjg4LS42ODktMS45MjQtLjY4OC0yLjYxMSAwbC0yLjg3MiAyLjg3MmMtLjM0NC4zNDQtLjU0Mi44Mi0uNTQyIDEuMzA2cy4xOTguOTYyLjU0MSAxLjMwNWwxLjU5MiAxLjU5M2MuMTE1LjExNS4yNzIuMTguNDM1LjE4cy4zMi0uMDY1LjQzNS0uMThsNC42MTMtNC42MTNjLjExNS0uMTE1LjE4LS4yNzIuMTgtLjQzNXMtLjA2My0uMzIxLS4xNzktLjQzNnoiIGZpbGw9IiNjZmQ4ZGMiLz48cGF0aCBkPSJtMTUuMDE4IDEzLjQ3My0uOTc3LS45NzctLjE4NS0xLjY5Yy0uMDUxLS41NzYtLjMxMS0xLjEyNC0uNzMtMS41NDNsLTIuMjgxLTIuMjgxYy0uNjA5LS42MS0xLjY5LS42MS0yLjMgMGwtNS41NjMgNS41NjJjLS4zMDUuMzA0LS40NzMuNzEzLS40NzMgMS4xNTFzLjE2OC44NDcuNDczIDEuMTVsMi4yOCAyLjI4MWMuNDE5LjQxOS45NjcuNjc4IDEuNTI5LjcyOGwxLjcwNC4xODcuOTc3Ljk3N2MuMzA1LjMwNS43MTMuNDczIDEuMTUuNDczcy44NDUtLjE2OCAxLjE1LS40NzNsMy4yNDUtMy4yNDRjLjMwNS0uMzA0LjQ3My0uNzEzLjQ3My0xLjE1MXMtLjE2OC0uODQ2LS40NzItMS4xNXoiIGZpbGw9IiM2MDdkOGIiLz48cGF0aCBkPSJtMjMuMjUgMTAuMzE1YzAgLjUyLS40My45NS0uOTYuOTVoLTEwLjU4Yy0uNTMgMC0uOTYtLjQzLS45Ni0uOTUgMC0uMTkuMDUtLjM2LjE0LS41bDUuMjktOC41OWMuMTctLjI4LjQ3LS40Ni44Mi0uNDZzLjY1LjE4LjgyLjQ2bDUuMjkgOC41OWMuMDkuMTQxLjE0LjMxLjE0LjV6IiBmaWxsPSIjZmZjMTA3Ii8+PHBhdGggZD0ibTMuMTMgMTMuNWMtLjE5MiAwLS4zODQtLjA3My0uNTMtLjIybC0xLjk0LTEuOTRjLS40MTktLjQxOC0uNjYtLjk5Ny0uNjYtMS41OXMuMjQxLTEuMTcyLjY2MS0xLjU5MWwzLjQ5OS0zLjQ5OWMuODM2LS44MzggMi4zNDMtLjgzOSAzLjE4MS4wMDFsMS45MzkgMS45MzljLjI5My4yOTMuMjkzLjc2OCAwIDEuMDYxcy0uNzY4LjI5My0xLjA2MSAwbC0xLjk0LTEuOTM5Yy0uMjgxLS4yODMtLjc3OC0uMjgyLTEuMDU3LS4wMDJsLTMuNTAxIDMuNTAxYy0uMTQxLjE0LS4yMjEuMzMzLS4yMjEuNTI5cy4wOC4zODkuMjIuNTI4bDEuOTQgMS45NDFjLjI5My4yOTMuMjkzLjc2OCAwIDEuMDYxLS4xNDYuMTQ3LS4zMzkuMjItLjUzLjIyeiIvPjxwYXRoIGQ9Im0xMC43NSAyMGMtLjQ3MSAwLS45MTEtLjE4MS0xLjI0LS41MWwtMS4wNTQtMS4wNTQtMS44MzctLjIwMWMtLjYwNi0uMDU0LTEuMTk3LS4zMzMtMS42NDktLjc4NWwtMi40Ni0yLjQ2Yy0uMzI5LS4zMjktLjUxLS43NjktLjUxLTEuMjRzLjE4MS0uOTExLjUxLTEuMjRsNi02Yy4yOTMtLjI5My43NjgtLjI5MyAxLjA2MSAwcy4yOTMuNzY4IDAgMS4wNjFsLTYgNmMtLjAzMi4wMzItLjA3LjA5LS4wNy4xOHMuMDM4LjE0Ny4wNy4xOGwyLjQ2IDIuNDZjLjIwMS4yMDEuNDcuMzMuNzM2LjM1NGwyLjExNC4yMzFjLjE3LjAxOS4zMjguMDk0LjQ0OS4yMTVsMS4yNCAxLjI0Yy4wNjQuMDY0LjI5NS4wNjQuMzU5IDBsMy41LTMuNWMuMDMyLS4wMzIuMDctLjA5LjA3LS4xOHMtLjAzOC0uMTQ3LS4wNy0uMThjLS4yOTMtLjI5My0uMjkzLS43NjggMC0xLjA2MXMuNzY4LS4yOTMgMS4wNjEgMGMuMzI5LjMyOS41MS43Ny41MSAxLjI0cy0uMTgxLjkxMS0uNTEgMS4yNGwtMy41IDMuNWMtLjMyOS4zMjktLjc2OS41MS0xLjI0LjUxeiIvPjxwYXRoIGQ9Im0xOS4yNSAyMmMtLjE5MiAwLS4zODQtLjA3My0uNTMtLjIybC01LTVjLS4yOTMtLjI5My0uMjkzLS43NjggMC0xLjA2MXMuNzY4LS4yOTMgMS4wNjEgMGw1IDVjLjI5My4yOTMuMjkzLjc2OCAwIDEuMDYxLS4xNDcuMTQ3LS4zMzkuMjItLjUzMS4yMnoiLz48cGF0aCBkPSJtMTcuMjUgMjRjLS4xOTIgMC0uMzg0LS4wNzMtLjUzLS4yMmwtNS01Yy0uMjkzLS4yOTMtLjI5My0uNzY4IDAtMS4wNjFzLjc2OC0uMjkzIDEuMDYxIDBsNSA1Yy4yOTMuMjkzLjI5My43NjggMCAxLjA2MS0uMTQ3LjE0Ny0uMzM5LjIyLS41MzEuMjJ6Ii8+PHBhdGggZD0ibTMuMjUgMTBjLS4xOTIgMC0uMzg0LS4wNzMtLjUzLS4yMmwtMS4zMS0xLjMxYy0uMjkzLS4yOTMtLjI5My0uNzY4IDAtMS4wNjFzLjc2OC0uMjkzIDEuMDYxIDBsMS4zMSAxLjMxYy4yOTMuMjkzLjI5My43NjggMCAxLjA2MS0uMTQ3LjE0Ny0uMzM5LjIyLS41MzEuMjJ6Ii8+PHBhdGggZD0ibTUuMjUgOGMtLjE5MiAwLS4zODQtLjA3My0uNTMtLjIybC0xLjMxLTEuMzFjLS4yOTMtLjI5My0uMjkzLS43NjggMC0xLjA2MXMuNzY4LS4yOTMgMS4wNjEgMGwxLjMxIDEuMzFjLjI5My4yOTMuMjkzLjc2OCAwIDEuMDYxLS4xNDcuMTQ3LS4zMzkuMjItLjUzMS4yMnoiLz48cGF0aCBkPSJtMjIuMjg4IDEyaC0xMC41NzZjLS45NDQgMC0xLjcxMi0uNzY1LTEuNzEyLTEuNzA0IDAtLjMzNS4wOTQtLjY1MS4yNzItLjkxNmw1LjI3MS04LjU2NWMuMjk1LS40OTkuODU1LS44MTUgMS40NTctLjgxNXMxLjE2Mi4zMTYgMS40NjMuODI3bDUuMjgxIDguNTc4Yy4xNjIuMjQuMjU2LjU1Ni4yNTYuODkxIDAgLjkzOS0uNzY4IDEuNzA0LTEuNzEyIDEuNzA0em0tNS4yODgtMTAuNWMtLjA4OCAwLS4xNDcuMDQ4LS4xNzIuMDg5bC01LjMyOCA4LjcwN2MwIC4xMS4wOTcuMjA0LjIxMi4yMDRoMTAuNTc2Yy4xMTUgMCAuMjEyLS4wOTQuMjEyLS4yMDQgMC0uMDMzLS4wMDYtLjA2My0uMDE3LS4wNzhsLTUuMzA1LTguNjE2Yy0uMDMxLS4wNTQtLjA5LS4xMDItLjE3OC0uMTAyeiIvPjxwYXRoIGQ9Im0xNyA3LjVjLS40MTQgMC0uNzUtLjMzNi0uNzUtLjc1di0yYzAtLjQxNC4zMzYtLjc1Ljc1LS43NXMuNzUuMzM2Ljc1Ljc1djJjMCAuNDE0LS4zMzYuNzUtLjc1Ljc1eiIvPjxjaXJjbGUgY3g9IjE3IiBjeT0iOSIgcj0iLjc1Ii8+PC9zdmc+";
/**
 * Route or base64 URL of image to show if device is not detected
 * @name owl_lock1_image_reload
 * @type {string}
 */
let owl_lock1_image_reload = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIj48cGF0aCBkPSJNNDYzLjcwMiAxNjIuNjU1TDQ0Mi40OTEgMTQuMTY0Yy0xLjc0NC0xMi4xNzQtMTYuNzA3LTE3LjIzMy0yNS40NTktOC40ODFsLTMwLjg5NCAzMC44OTRDMzQ2LjQxMSAxMi42MTIgMzAxLjMwOSAwIDI1NC45MzIgMCAxMTUuNDY0IDAgMy40OTEgMTA5LjE2LjAwNSAyNDguNTExYy0uMTkgNy42MTcgNS4zNDcgMTQuMTUgMTIuODc2IDE1LjIzNGw1OS45NDEgOC41NjljOC45MzYgMS4zMDQgMTcuMjQ5LTUuNzEyIDE3LjEyNS0xNS4wNThDODguNzA0IDE2NS4yODYgMTYyLjk4NiA5MCAyNTQuOTMyIDkwYzIyLjI2NSAwIDQ0LjI2NyA0LjUyNiA2NC42IDEzLjE4M2wtMjkuNzggMjkuNzhjLTguNjk3IDguNjk3LTMuNzYxIDIzLjcwNiA4LjQ4MSAyNS40NTlsMTQ4LjQ5MSAyMS4yMTFjOS43ODQgMS40NzUgMTguMzgxLTcuMDM0IDE2Ljk3OC0xNi45Nzh6TTQ5OS4xMTcgMjQ5LjQxMmwtNTkuODk3LTguNTU1Yy03LjczOC0uOTgtMTcuMTI0IDUuNjUxLTE3LjEyNCAxNi4xNDMgMCA5MC45ODEtNzQuMDE5IDE2NS0xNjUgMTY1YTE2NS4yMDcgMTY1LjIwNyAwIDAxLTY0LjMwNi0xMy4wNTJsMjguODI4LTI4LjgyOGM4LjY5Ny04LjY5NyAzLjc2MS0yMy43MDYtOC40ODEtMjUuNDU5TDY0LjY0NiAzMzMuNDM1Yy05Ljc1My0xLjM5My0xOC4zOSA2Ljk3MS0xNi45NzggMTYuOTc4bDIxLjIxIDE0OC40OTJjMS43NDYgMTIuMTg3IDE2LjY5NiAxNy4yMTIgMjUuNDU5IDguNDgxbDMxLjY0MS0zMS42MjZDMTY1LjUxNCA0OTkuNTA1IDIxMC41ODcgNTEyIDI1Ny4wOTYgNTEyYzEzOC43OTQgMCAyNTAuNzUyLTEwOC42MTggMjU0Ljg5Ny0yNDcuMjguMjItNy42MzItNS4zMTctMTQuMjI0LTEyLjg3Ni0xNS4zMDh6IiBmaWxsPSIjZmZmIiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz48L3N2Zz4=";
/**
 * Code to display message in screen if device is not detected
 * @name owl_lock1_code_not_device_detected
 * @type {string}
 */
let owl_lock1_code_not_device_detected = '' +
    '<div id="owl_lock1_device_not_detected" class="owl_lock1_device_not_detected" style="display: none">' +
    '<img src="' + owl_lock1_image_not_device_detected + '" alt="' + __("Device disconnected") + '" ' +
    'class="owl-w-100 owl-p-4 owl-max-h-80vh">' +
    '<a href="' + location.toString() + '" class="owl-btn owl-btn-link owl-fixed-bottom">' +
    '<img src="' + owl_lock1_image_reload + '" style="max-width:60px;margin:0 auto;" alt="'+ __("Reload") + '">'+
    '</a></div>';

/**
 * Code to allow show a modal asking for the permissions of serial devices
 * @type {string}
 */
let owl_lock1_code_permissions_serial_devices = "" +
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
    "<button type=\"button\" class=\"owl_lock1_serial_btn_connect_serial inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm\">Locker 1" + __('Choose a serial port') + "</button></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>";

/**
 * Constant section
 ******************************************
 * All constant or variable starting with
 * original_owl_lock1_ is for soft reload page
 ******************************************
 */
const original_owl_lock1_interval = undefined;
const original_owl_lock1_timer_until_response = undefined;
const original_owl_lock1_status_dispense = undefined;
const original_owl_lock1_aux_iteration = 10;
const original_owl_lock1_time_response_general = 3000;
const original_owl_lock1_time_to_reconnect = 7000;
const original_owl_lock1_last_error = {"message": null, "handler": null, "code": null, "no_code": 666,};

/**
 * Soft reload the page, for some problems reloading and more speed
 * @name owlLock1SoftReload
 */
function owlLock1SoftReload() {
    /**
     * Set to undefined all variables
     */
    owl_lock1_interval = undefined;
    owl_lock1_timer_until_response = undefined;
    owl_lock1_status_dispense = undefined;
    owl_lock1_aux_iteration = undefined;
    owl_lock1_time_response_general = undefined;
    owl_lock1_time_to_reconnect = undefined;
    owl_lock1_last_error = undefined;
    /**
     * Assign value default using const original values
     */
    owl_lock1_interval = original_owl_lock1_interval;
    owl_lock1_timer_until_response = original_owl_lock1_timer_until_response;
    owl_lock1_status_dispense = original_owl_lock1_status_dispense;
    owl_lock1_aux_iteration = original_owl_lock1_aux_iteration;
    owl_lock1_time_response_general = original_owl_lock1_time_response_general;
    owl_lock1_time_to_reconnect = original_owl_lock1_time_to_reconnect;
    owl_lock1_last_error = original_owl_lock1_last_error;
    /**
     * Call another function to clean variables used in each project without modify the source
     */
    extOwlLock1SoftReload();
}

/**
 * Get the type of response
 * @name owlLock1GetResponse
 * @param code array|int
 * @param data {null|object}
 */
function owlLock1GetResponse(code, data = null) {
    if (code === 0) {
        owlLock1AppMessage(data);
    } else if (code && code.length > 0) {
        if (owl_lock1_interval !== undefined) {
            clearInterval(owl_lock1_interval);
            owl_lock1_interval = undefined;
        }
        clearTimeout(owl_lock1_timer_until_response);
        owl_lock1_timer_until_response = undefined;
        owlLock1SerialMessage(code);
    } else {
        owlLock1DividedCodeMessage(code, data);
    }
}

/**
 * Show the bytes sent to the serial device
 * @name owlLock1SentBytes
 * @param bytes
 */
function owlLock1SentBytes(bytes) {
    extOwlLock1SentBytes(bytes)
}

/**
 * Info received from serial device
 * @name owlLock1SerialMessage
 * @param code
 */
function owlLock1SerialMessage(code) {
    let message = {};
    let additional = {};

    //02 08 01 03 01 00 20
    switch (code[1].toString().toUpperCase()) {
        case "8": //Estatus
            owlLock1DeviceConnected();
            // Device connected
            message.name = __("Connection with the serial device completed.");
            message.description = __("Your connection with the serial device was successfully completed.");
            message.request = __("connect");
            message.no_code = 200;
            break;
        case "7": //Open cell

            // Device connected
            message.name = __("Cell open.");
            message.description = __("The selected cell was open successfully.");
            message.request = __("open cell");
            message.no_code = 200;
            break;
        case "6": //Config cell

            // Device connected
            message.name = __("Configuration applied.");
            message.description = __("The configuration was successfully applied.");
            message.request = __("configurate cell");
            message.no_code = 200;
            break;

        default:
            message.request = __("undefined");
            message.name = __("Response unrecognized");
            message.description = __("The response of application was received, but dont identify with any of current parameters");
            message.no_code = 404;
            break;
    }
    let arr = code;
    code = [];
    arr.forEach((val) => {
        code.push(owlLock1HexMaker(val));
    });
    /**
     * This info is send to a function in other file to make more easy the manipulation and integration
     */
    extOwlLock1SerialMessage({
        "code": code,
        "message": message.name,
        "description": message.description,
        "request": message.request,
        "no_code": message.no_code
    });
}

/**
 * @name owlLock1DividedCodeMessage
 * @void
 */
function owlLock1DividedCodeMessage() {

}

/**
 * @name owlLock1AppMessage
 * @void
 * @param data
 */
function owlLock1AppMessage(data) {
    clearTimeout(owl_lock1_timer_until_response);
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
            extOwlLock1WithoutDevice();
            if (owl_lock1_interval === undefined) {
                // x seconds between each try to reconnect
                owl_lock1_interval = setInterval(owlLock1Reconnect, owl_lock1_time_to_reconnect);
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
            extOwlLock1WithoutDevice();
            // connection not completed
            if (owl_lock1_interval === undefined) {
                // x seconds between each try to reconnect
                owl_lock1_interval = setInterval(owlLock1Reconnect, owl_lock1_time_to_reconnect);
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

    extOwlLock1AppMessage({
        "message": message.name,
        "description": message.description,
        "no_code": data.no_code
    });
}

/**
 * @name owlLock1DeviceConnected
 * @void
 */
function owlLock1DeviceConnected() {

}

/**
 * @name owlLock1ReloadPage
 * @void
 */
function owlLock1ReloadPage() {

}

/**
 * Convert arr of hex string to arr bytes string and send to device
 * @name owlLock1PreSendBytes
 * @param arr
 * @param to_do
 */
function owlLock1PreSendBytes(arr, to_do = "") {
    let bytes = [];
    arr.forEach((val) => {
        bytes.push(owlLock1HexMaker(val));
    });
    //bytes[11] = owlLock1HexMaker(owlLock1SumHex(bytes));
    bytes = owlLock1Add0x(bytes);
    console.debug(bytes,to_do);
    /**
     * Waits for the response
     */
    if (owl_lock1_timer_until_response !== undefined) {
        owl_lock1_queue_commands.push({'bytes':bytes,'to_do':to_do});
        console.warn(__("You send a new command to serial device before have an answer") + ". " + __("Commands in queue:") + " " + owl_lock1_queue_commands.length);
        owl_lock1_wait_until_last_command_returns = setInterval(() => {
            if (owl_lock1_timer_until_response === undefined && owl_lock1_queue_commands.length > 0) {
                console.log(__("Sending in delay mode") + ". " + __("Commands in queue:") + " " + owl_lock1_queue_commands.length);
                clearInterval(owl_lock1_wait_until_last_command_returns);
                owl_lock1_wait_until_last_command_returns = undefined;
                owl_lock1_timer_until_response = setTimeout(() => {
                    owlLock1TimerNoResponse(owl_lock1_queue_commands[0].bytes, owl_lock1_queue_commands[0].to_do);
                }, owl_lock1_time_response_general);

                serialOwlLock1WriteToSerial(owl_lock1_queue_commands[0].bytes);
                owl_lock1_queue_commands = owl_lock1_queue_commands.splice(1);
            }
        }, 500)
    } else {
        owl_lock1_queue_commands = [];
        owl_lock1_timer_until_response = setTimeout(() => {
            owlLock1TimerNoResponse(bytes, to_do);
        }, owl_lock1_time_response_general);

        serialOwlLock1WriteToSerial(bytes);
    }
}

/**
 * Makes a connection with the device, and Send bytes to serial
 * @name owlLock1Connect
 */
function owlLock1Connect() {
    owlLock1PreSendBytes(owl_lock1_bytes_connection, 'connect');
}

/**
 * Reconnection if devices is lost
 * @name owlLock1Reconnect
 * @deprecated WebSerial detect if a device was connected previously and in connection file makes a reconnection
 * if detects a plug serial, so you don't need use an a reconnect function
 */
function owlLock1Reconnect() {
    extOwlLock1ReconnectionMessage();
    owlLock1Connect();
}

/**
 * Style hex data to make uniform and pretty
 * @name owlLock1HexMaker
 * @param val hexadecimal number
 * @param min length required of string
 * @returns {string}
 */
function owlLock1HexMaker(val, min = 2) {
    let missing = (min - (val.toString().length));
    if (missing > 0) {
        for (let i = 0; i < missing; i++) {
            val = "0" + val;
        }
    }
    return val;
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
    owlLock1PreSendBytes(bytes, 'dispense');
}

/**
 * Test engines matrix
 * @name owlExecuteTestEnginesMatrix
 */
function owlExecuteTestEnginesMatrix(motors) {
    if (owl_lock1_aux_iteration === 90) {
        owl_lock1_aux_iteration = 10;
        return;
    }
    setTimeout(() => {
        let engine1 = owlDecToHex(owl_lock1_aux_iteration - 1);
        let engine2 = "00";
        if (motors === true) {
            engine2 = owlDecToHex(owl_lock1_aux_iteration);
        }
        setTimeout(() => {
            owlEnginesMatrix(engine1, engine2, "04");
        }, 500);
        if (owl_lock1_aux_iteration < 90) {
            owlExecuteTestEnginesMatrix();
        }
        owl_lock1_aux_iteration++;
    }, 1000)
}

/**
 * Sum of hexadecimals and return the value (in hexadecimal)
 * @name owlLock1SumHex
 * @param arr must be an array of values in hexadecimal (Ex. ['02','f4'])
 * @returns {string} value in hex
 */
function owlLock1SumHex(arr) {
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
function owlLock1Add0x(bytes) {
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
function owlLock1TimerNoResponse(code, to_do) {
    owl_lock1_last_error.message = __("Operation response timed out.");
    owl_lock1_last_error.handler = to_do;
    owl_lock1_last_error.code = code;
    clearTimeout(owl_lock1_timer_until_response);
    owl_lock1_timer_until_response = undefined;
    if (owl_lock1_last_error["handler"] === "connect") {
        extOwlLock1WithoutDevice();
        owlLock1Reconnect();
    } else if (owl_lock1_last_error["handler"] === "connect_start") {
        owlLock1Disconnect();
        _su_lock1_connected = false;
        //owlCheckDevicesConnected('locker');
        __lock1_port__cat += 1;
        serialOwlLock1Connect().then((a) => {
            beautyLog(a)
        });
    }

    extOwlLock1Timeout();
}

/*
function owlLock1TimerNoResponse(code, to_do) {
    owl_lock1_last_error.message = __("Operation response timed out.");
    owl_lock1_last_error.handler = to_do;
    owl_lock1_last_error.code = code;
    clearTimeout(owl_lock1_timer_until_response);
    owl_lock1_timer_until_response = undefined;
    if (owl_lock1_last_error["handler"] === "connect") {
        extOwlLock1WithoutDevice();
        owlLock1Reconnect();
    }

    extOwlLock1Timeout();
}
 */
function owlLock1ConnectionLost(event) {
    console.warn(event);
    extOwlLock1ConnectionLost(event);
}

function owlLock1DeviceDisconnected(event) {
    beautyLog(event);
    // If the serial port was opened, a stream error would be observed as well.
    _su_lock1_connected = false;
    owlLock1ConnectionLost(event);
    __lock1_port__cat = 0;

    owlLock1Disconnect();
    /*setTimeout(function(){
        owlLock1InitSerial();
    },500)*/
}

/**
 * Makes a disconnection of device
 * @name owlLock1Disconnect
 */
function owlLock1Disconnect() {
    serialOwlLock1Disconnect().then(r => {
        console.log(r);
    });
}

/**
 * Makes and send bytes custom and send to device
 * @name owlLock1CustomCode
 * @param arr array with hex code
 */
function owlLock1CustomCode(arr) {
    owlLock1PreSendBytes(arr, 'custom code');
}

/**
 * OPen the cell
 * @name owlLock1OpenCell
 * @param no number of cell
 */
function owlLock1OpenCell(no) {
    owlLock1PreSendBytes(owl_lock1_code.open['g'+no], 'open cell');
}

/**
 * Activate cell
 * @name owlLock1ActivateCell
 * @param no number of cell
 */
function owlLock1ActivateCell(no) {
    owlLock1PreSendBytes(owl_lock1_code.activate['g'+no], 'config cell');
}
/**
 * Deactivate cell
 * @name owlLock1DeactivateCell
 * @param no number of cell
 */
function owlLock1DeactivateCell(no) {
    owlLock1PreSendBytes(owl_lock1_code.deactivate['g'+no], 'config cell');
}

/**
 * Test matrix locker
 * @name owlLock1TestMatrixCell
 */
function owlLock1TestMatrixCell() {
    let no = 1;
    let s_interval = setInterval(function(){
        if(no >= 90){
            clearInterval(s_interval);
            s_interval = 0;
            no = 0;
            return;
        }
        owlLock1OpenCell(no);
        no += 1;
    },1500);
}

/**
 * Enable all cell locker
 * @name owlLock1EnableAllMatrixCell
 */
function owlLock1EnableAllMatrixCell() {
    let no = 1;
    let s_interval = setInterval(function(){
        if(no >= 90){
            clearInterval(s_interval);
            s_interval = 0;
            no = 0;
            return;
        }
        owlLock1ActivateCell(no);
        no += 1;
    },900);
}

/**
 * Disable all cell locker
 * @name owlLock1DisableAllMatrixCell
 */
function owlLock1DisableAllMatrixCell() {
    let no = 1;
    let s_interval = setInterval(function(){
        if(no >= 90){
            clearInterval(s_interval);
            s_interval = 0;
            no = 0;
            return;
        }
        owlLock1DeactivateCell(no);
        no += 1;
    },900);
}


/**
 * Parse an array of hex values to an array of dec values
 * @param arr
 * @returns {[]}
 */
function owlLock1ArrDecToHex(arr) {
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
function owlLock1ArrHexToDec(arr) {
    let arr_new = [];
    arr.forEach((value, index) => {
        arr_new[index] = owlHexToDec(value);
    });
    return arr_new;
}

/**
 * Clean the last error
 */
function owlLock1ClearErrors() {
    owl_lock1_last_error = original_owl_lock1_last_error;
}

/**
 * Reload when ends something
 * @param hard {boolean} force the reload of page
 */
function owlLock1Reload(hard = false) {
    // if the const is true
    if (typeof ext_owl_lock1_reload_when_finished === "undefined") {
        console.error(__("You must declare a 'ext_owl_lock1_reload_when_finished' as a constant in your 'ext.js' file"));
    } else {
        if (ext_owl_lock1_reload_when_finished) {
            if (hard === true) {
                location.reload();
            } else {
                owlLock1SoftReload();
            }
        }
    }
}

/**
 * Get all the errors in the app not handled
 * @name owlLock1Errors
 * @param error
 */
function owlLock1Errors(error) {
    extOwlLock1Errors(error);
}

function owlLock1InitSerial() {
    // element that contains an error unsupported navigator
    const owl_lock1_serial_navigator_not_supported = document.getElementById('owl_lock1_serial_navigator_not_supported');
    // Show or hide a banner of error, navigator is not supported
    owl_lock1_serial_navigator_not_supported.classList.toggle('hidden', 'serial' in navigator);

    // try to connect
    serialOwlLock1Connect().then(() => {
        //when finish the connection
    });


    document.querySelector('#boardroid-container').innerHTML += owl_lock1_code_not_device_detected + owl_lock1_code_permissions_serial_devices;

    document.getElementById('btn-open-warning-modal-permission').addEventListener('click', (e) => {
        document.getElementById('container-warning-modal-permission').classList.remove('hidden');
    });
    document.getElementById('btn-choose-serial-modal').addEventListener('click', (e) => {
        document.getElementById('container-warning-modal-permission').classList.add('hidden');
    });


    owl_lock1_serial_btn_connect_serial = document.querySelectorAll('.owl_lock1_serial_btn_connect_serial');
    // for every element that has the class add an listener to connect
    for (let i = 0; i < owl_lock1_serial_btn_connect_serial.length; i++) {
        owl_lock1_serial_btn_connect_serial[i].addEventListener('click', serialOwlLock1ClickConnect);
    }

    /**
     * Listener for connections of serial devices
     */
    navigator.serial.addEventListener("connect", (event) => {
        console.debug(__("Serial device detected again."), event);
        // TODO: Automatically open event.target or warn user a port is available.
        serialOwlLock1Connect().then(() => {
            //when finish the connection
        });
        extOwlLock1WithDevice();
    });

    /**
     * Listener for disconnections of serial devices
     */
    navigator.serial.addEventListener("disconnect", (event) => {
        // If the serial port was opened, a stream error would be observed as well.
        owlLock1ConnectionLost(event);
    });

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
}