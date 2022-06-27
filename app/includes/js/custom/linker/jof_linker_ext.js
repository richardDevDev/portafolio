/*!
  * Weblinker - Jofemar
  * Author Daniel Sandoval aka danidoble (https://github.com/danidoble)
  * Copyright 2011-2021 OWL Desarrollos, Coin City México
  * This file is property of OWL Desarrollos and Coin City México No redistribute
  */
"use strict"; //if this makes errors with your application comment it with -> //
/**
 * These variables are already declared in the communication file but they can be modified from this section.
 * It is recommended to make all the changes here so as not to modify the other file
 */
 ccv_jofemar_channel_start_verification_original = 109;
ccv_jofemar_channel_start_verification = 109;
ccv_jofemar_channel_stop_verification_original = 189;
ccv_jofemar_channel_stop_verification = 189;
ccv_jofemar_read_temperature = true;
//	scrow of bill purse: Enable -> 01, Disable -> 00
//	ccv_jofemar_scrow="00";
//	This help to know if the system is in CONTROL page, for do actions just for that place
//	ccv_jofemar_control=true;
// helps to know in which CONTROL PAGE it is, this has to be put before finalizing the body
// and after loading this file
//	ccv_jofemar_control_page=undefined;
// if true, show a message in full screen if the device is not connected
ccv_jofemar_show_no_device=false;
// Maximum allowed amount of pre-credit in nayax
// ccv_jofemar_nayax_max_pre_credit = 0;
// Route where is the image to be shown if the device is not detected
// By default this has a SVG base64 image 
// ccv_jofemar_cod_img = "/src/images/device_not_detected.png";
// time for the interval between the sensing check, default 500ms
ccv_jofemar_sense_interval = 1000;
// time to reload the page once the sensing result is obtained, default 2000ms
// ccv_jofemar_time_to_reload = 2000;
// if it is required to reload the page once the product is delivered, change to true
// cvv_jofemar_reload_when_finish = false;
// this will be loaded if the device is not connected
// ccv_jofemar_code_device = '';
// time for responses to arrive
// ccv_jofemar_time_response=3000;
function ccvJofemarExtSoftReload() {
    /** Here you put the variables that you want to clean after that a process that requires "reload" is terminated.
     *
     * Those that are default can be left commented, but if want to change some value just uncomment so as not to
     * modify the other file
     */
    // time for responses
     ccv_jofemar_time_response=7000;
    // time for engine responses
    	ccv_jofemar_time_response_engines=15000;
    // time for reconnection
    //	ccv_jofemar_time_reconnect=7000;
    /**
     * this is important to do if you have a machine jofemar
     */
    ccv_jofemar_channel_start_verification_original = 109;
    ccv_jofemar_channel_start_verification = 109;
    ccv_jofemar_channel_stop_verification_original = 189;
    ccv_jofemar_channel_stop_verification = 189;
}
/**
 * All functions from this point down must be customized
 */
// Add some code to be shown in case of device is disconnected
//document.querySelector('body').innerHTML += ccv_jofemar_code_device;
//if (ccv_jofemar_show_no_device) {}
// Do the connection with chrome app and the device
$(function(){
    if(__type_project__ === "jofemar"){
        //	se conecta con la aplicacion
        if(typeof ccv_conectar === "undefined"){
            if(typeof ccvJofemarConnect === "function"){
                ccvJofemarConnect(master_machine_select);
            }
        }
    }
	//();
	//console.log(ccv_arr_monedas_tubos);
	/**	se introduce el codigo personalizado para que se muestre el mensaje de que la boarddroid no 
		esta conectada en caso de que se desconecte o no se detecte 
	*/
	//$("body").append(ccv_ext_cod_css_boarddroid+ccv_ext_cod_boaddroid);
});
//window.onload = () => {
    //ccvJofemarConnect();
//};
// connection lost with the application, generates an irreparable error in the current session,
// the only way to fix it is to reload the page, but if it is done too often the app will be disabled by the browser
function ccvJofemarExtConnectionLost() {
    /*consoleError(ccv_jofemar_lang.extension.display.connection.lost, {
        "errors": [
            ccv_jofemar_lang.extension.display.connection.lost_errors.application,
            ccv_jofemar_lang.extension.display.connection.lost_errors.window,
            ccv_jofemar_lang.extension.display.connection.lost_errors.reloaded,
        ],
        "solutions": [
            ccv_jofemar_lang.extension.display.connection.lost_errors.solutions.application,
            ccv_jofemar_lang.extension.display.connection.lost_errors.solutions.reload,
            ccv_jofemar_lang.extension.display.connection.lost_errors.solutions.extension,
            ccv_jofemar_lang.extension.display.connection.lost_errors.solutions.browser,
        ],
        "no_code": 667
    });
    */
    addLog("log",ccv_jofemar_lang.extension.display.connection.lost, {
        "errors": [
            ccv_jofemar_lang.extension.display.connection.lost_errors.application,
            ccv_jofemar_lang.extension.display.connection.lost_errors.window,
            ccv_jofemar_lang.extension.display.connection.lost_errors.reloaded,
        ],
        "solutions": [
            ccv_jofemar_lang.extension.display.connection.lost_errors.solutions.application,
            ccv_jofemar_lang.extension.display.connection.lost_errors.solutions.reload,
            ccv_jofemar_lang.extension.display.connection.lost_errors.solutions.extension,
            ccv_jofemar_lang.extension.display.connection.lost_errors.solutions.browser,
        ],
        "no_code": 667
    });

    ccvJofemarExtNoDeviceConnected('app');
}
// unfinished or unreadable device response
function ccvJofemarExtCodeDivided(f_code) {
    //consoleWarn(ccv_jofemar_lang.extension.display.code.divided + f_code);
    addLog("log",ccv_jofemar_lang.extension.display.code.divided + f_code);
}
// Responses from the device (is an object)
let ccv_jofemar_ext_arr_active_channels = [];
function ccvJofemarExtResponses(response) {
    //consoleLog(response);
    addLog("log",response);
    if(parseInt(response.no_code) === 6115){
        let additional = JSON.parse(response.additional);
        //additional.machine.channel
        //additional.machine.hex
        //additional.machine.dec
        let data = {};

        data.machine = additional.machine.dec;
        data.selection = additional.machine.channel;
        data.status = additional.machine.status;
        ccv_jofemar_ext_arr_active_channels.push(data);
        if(ccv_jofemar_channel_start_verification === ccv_jofemar_channel_stop_verification){
            ccvJofemarApplyChannelActives(ccv_jofemar_ext_arr_active_channels);
        }
        //console.log(response.additional);
        addLog("log",response.additional);
    }
}
// Money in session, stores all the money that is inserted during a session
function ccvJofemarExtMoneySession() {
    let f_money = JSON.stringify({"bills": ccv_jofemar_arr_bills, "coins": ccv_jofemar_arr_coins});
    //consoleLog(JSON.parse(f_money))
    addLog("log",JSON.parse(f_money));
}
// Generate a response where it expects the sensing result to arrive, by default the time of the
// interval is 500ms, and it will repeat until the device's response arrives
var onetime=false;
var countTimeout=0;
function ccvJofemarExtWaitForProductDown(f_selection, f_id) {
    ccv_jofemar_waiting_for_sense = setInterval(()=> {
        if (ccv_jofemar_status_dispensing === undefined) {
            //console.log("dispensando...");
            addLog("log","dispensando... #timeout:",countTimeout+"/40");
            if (countTimeout==40) {
                countTimeout=0;
                ccv_jofemar_status_dispensing=false;
            }else{
                countTimeout++;
            }
            // ... It does nothing, since if it is undefined it means that the answer has not arrived yet
            // ... It is set to "if" since it could be useful later
        } else if (ccv_jofemar_status_dispensing) {
            //console.log("dispensing: "+ccv_jofemar_status_dispensing);
            addLog("log","dispensing: "+ccv_jofemar_status_dispensing);
            ccvJofemarCleanSenseProduct();
			$(".proceso-venta").hide();
			$(".process-img").hide();
			send(formData("restaStock",uuid_seleccion_db));
            send(formData("pagaNayax",_sup_id_movimiento_));
            send(formData("syncVentas",""));
            if (owl_amount_inserted >owl_price) {
                owl_change=owl_amount_inserted - owl_price;
            }else{
                owl_change=0;
            }
            
            //console.log("regresando cambio");
            addLog("log","regresando cambio");
            //setTimeout(function(){owlReadBillPurse()},200);
            //setTimeout(function(){owlReadTubes()},200);
            //console.log("dispensing2: "+ccv_jofemar_status_dispensing);
            addLog("log","dispensing2: "+ccv_jofemar_status_dispensing);
            //console.log("onetime",onetime);
            addLog("log","");
            //console.log("total",owl_price);
            addLog("log",owl_price);
            //console.log("cambio",owl_change);
            addLog("log",owl_change);
            //console.log("ingresado",owl_amount_inserted);
            addLog("log",owl_amount_inserted);
            if (owl_amount_inserted >owl_price) {
                $("#retireBillDiv").show();
                $("#PAGADOENTREGANDOCAMBIO").show();
                $("#CASHVOUCHER").show();
                $("#CASHLESSVOUCHER").hide();

                $(".givingBills").text(owl_change); 
                onetime=true;
                executeOneTime=true;
                owl_change=owl_amount_inserted - owl_price;
                $(".cambio").text("$ "+parseFloat(owl_change).toFixed(2));
                setTimeout(function(){
                    //console.log("regresando cambio");
                    addLog("log","regresando cambio");
                    owlReturnChange();
                    //ccv_devolverCambioMonedas_V2();
                },1000);
            }else{
                $("#PRODUCTOENTREGADO").fadeIn();
                $("#label-inferior").text("Recoja su producto");
                $("#listenCash").fadeIn();
                timerEndProcess(20);
            }

            // NOTIFY -> pick up your product
            // update stock
            // send(formData("subtractStock",f_selection));
            setTimeout(()=> {
                ccvJofemarReload();
            }, ccv_jofemar_time_to_reload);
        } else if (!ccv_jofemar_status_dispensing) {
            ccvJofemarCleanSenseProduct();
			$(".proceso-venta").hide();
            $(".process-img").hide();
            //$("#PRODUCTONOENTREGADO").fadeIn();
			send(formData("nodispensado",f_id));
            setTimeout(function(){owlReadBillPurse()},200);
            setTimeout(function(){
                

                if (owl_amount_inserted>0) {
                    owl_change=owl_amount_inserted;
                    $("#retireBillDiv").show();
                    $("#CANCELANDOCHANGE").show();
                    $("#CASHVOUCHER").show();
                    $("#CASHLESSVOUCHER").hide();
                    $(".givingBills").text(owl_change);

                    if (!onetime) {
                        onetime=true;
                        executeOneTime=true;
                        setTimeout(function(){owlReturnChange();},800);
                        //setTimeout(function(){ccv_devolverCambioMonedas_V2();},800);
                    }   
                }else{
                    timerEndProcess(20);
                }
                
                
            },300);
            setTimeout(function(){
                if(owl_arr_bills.total > 0){
                    send(formData("dineroIngresadoArr",JSON.stringify({
                        "movimiento":_sup_id_movimiento_,
                        "ingresado": owl_amount_inserted,
                        "cambio": owl_change,
                        "cambio_entregado": change_returned_verified,
                        "ubicacion": "null",
                        "efectivo": {
                            "1000":owl_arr_bills.stacker.P1000+owl_arr_bills.recycler.P1000,
                            "500":owl_arr_bills.stacker.P500+owl_arr_bills.recycler.P500,
                            "200":owl_arr_bills.stacker.P200+owl_arr_bills.recycler.P200,
                            "100":owl_arr_bills.stacker.P100+owl_arr_bills.recycler.P100,
                            "50":owl_arr_bills.stacker.P50+owl_arr_bills.recycler.P50,
                            "20":owl_arr_bills.stacker.P20+owl_arr_bills.recycler.P20,
                        }
                    })))
                }
            },1900)

            

            // NOTICE -> product not delivered,
            // update movement status
            //	send(formData("notDispensed",f_id));
            setTimeout(()=> {
                ccvJofemarReload();
            }, ccv_jofemar_time_to_reload);
        }
    }, ccv_jofemar_sense_interval);
}

var timerClose=20;
function timerEndProcess(timeset){
    if (timeset>0) {
        timerClose=timeset;
    }
    $(".closeVoucher").show();
    $(".timerCloseDiv").text(timerClose);
    timerClose--;
    console.log(timerClose);
    if (timerClose<=0) {
        timerClose=20;
        console.log("terminado");
        normalState();
    }else{
        setTimeout("timerEndProcess('')",1000);
    }
}


// This function is for the dispensing in control, it is for testing, it should not
// mix with the main one since some functions are not in control
function ccvJofemarExtWaitForProductDownTest(f_selection, f_id) {
    //console.log("esperando caida");
    addLog("log","esperando caida");
    ccv_jofemar_waiting_for_sense=setInterval(function(){
    //ccv_jofemar_status_dispensing
            if(ccv_jofemar_status_dispensing == undefined){

                //	...	No hace nada, ya que si esta indefinida significa que la respuesta no ha llegado aun

                //	...	Se pone en if ya que podria ser util despues

            }else if(ccv_jofemar_status_dispensing){
    ccvJofemarCleanSenseProduct();
                $(".dispensing-process").hide();

                $("#div-entregado").show();

                ccv_jofemar_status_dispensing=undefined;

                setTimeout(function(){

                    $(".dispensing-process").hide();

                    $("#standby").show();

                    $(".btn-controls").show();

                    $('.modal').modal('hide');

                    $('.modal-backdrop').remove();

                },500);

            }else if(!ccv_jofemar_status_dispensing){
                ccvJofemarCleanSenseProduct();
                $(".dispensing-process").hide();

                $("#standby").hide();

                $("#div-no-entregado").show();

                ccv_jofemar_status_dispensing=undefined;

                setTimeout(function(){

                    $(".dispensing-process").hide();

                    $("#standby").show();

                    $(".btn-controls").show();



                    $('.modal').modal('hide');

                    $('.modal-backdrop').remove();

                },500);

            }

        },1000);
        /*
    ccv_jofemar_waiting_for_sense = setInterval(()=> {
        if (ccv_jofemar_status_dispensing === undefined) {
            // ... It does nothing, since if it is undefined it means that the answer has not arrived yet
            // ... It is set to "if" since it could be useful later
        } else if (ccv_jofemar_status_dispensing) {
            ccvJofemarCleanSenseProduct();
            // NOTIFY -> pick up your product
            // update stock
            // send(formData("subtractStock",f_selection));
            setTimeout(()=> {
                ccvJofemarReload();
            }, ccv_jofemar_time_to_reload);
        } else if (!ccv_jofemar_status_dispensing) {
            ccvJofemarCleanSenseProduct();
            // NOTICE -> product not delivered,
            // update movement status
            //	send(formData("notDispensed",f_id));
            setTimeout(()=> {
                ccvJofemarReload();
            }, ccv_jofemar_time_to_reload);
        }
    }, ccv_jofemar_sense_interval);
    */
}
// when the connection is sended
function ccvJofemarExtMessageConnection() {
    //consoleLog(ccv_jofemar_lang.extension.display.connection.connecting);
    addLog("log",ccv_jofemar_lang.extension.display.connection.connecting);
}
// when the reconnection is active it shows what is described in the function
function ccvJofemarExtMessageReconnection() {
    //consoleLog(ccv_jofemar_lang.extension.display.connection.reconnecting);
    addLog("log",ccv_jofemar_lang.extension.display.connection.reconnecting);
}
// The messages of the application are usually errors
function ccvJofemarExtMessageApplication(f_str) {
    //consoleLog(JSON.parse(f_str));
    addLog("log",JSON.parse(f_str));
    /* // if you want to show or give another use to the answers, they are formed in the following way
    obj = {
        "message": "response message from the application",
        "description": "longer description of the message",
        "no_code": "708", // the code that returns the message to identify what it means
    };
    */
}
// TIMEOUT - no response in the specified time
function ccvJofemarExtTimeout() {
    //consoleLog(ccv_jofemar_last_error);
    addLog("log",ccv_jofemar_last_error);
}
// if it is detected that the device is not connected
function ccvJofemarExtNoDeviceConnected(d_image = 'connect') {
    if (ccv_jofemar_show_no_device) {
        let f_device = document.getElementById('ccv_jofemar_device_not_detected');
        let f_machine = document.getElementById('ccv_jofemar_machine_one_disconected');
        let f_img_disconnected_machine = document.getElementById('ccv_jofemar_img_machine_one_disconected');
        let f_img_door_open_machine = document.getElementById('ccv_jofemar_img_machine_one_door_open');
        let f_img_door_closed_machine = document.getElementById('ccv_jofemar_img_machine_one_door_closed');
        f_img_disconnected_machine.style.display = 'none';
        f_img_door_open_machine.style.display = 'none';
        f_img_door_closed_machine.style.display = 'none';
        if(d_image === 'connect'){
            f_machine.innerText = 'Máquina 1: No Conectada';
            f_img_disconnected_machine.style.display = '';
        }
        if(d_image === 'closed'){
            f_machine.innerText = 'Máquina 1: Puerta Cerrada';
            f_img_door_closed_machine.style.display = '';
        }
        if(d_image === 'open'){
            f_machine.innerText = 'Máquina 1: Puerta Abierta';
            f_img_door_open_machine.style.display = '';
        }
        if(d_image === 'app'){
            f_machine.innerText = 'Aplicación Linker Jof 1 no cargada';
            f_img_disconnected_machine.style.display = '';
        }


        f_device.style.display = '';
        f_machine.style.display = '';
        document.querySelector('body').classList.add('ccv-jofemar-overflow-hidden');
    }
}
// if reconnect to the device
function ccvJofemarExtDeviceConnected() {
    let f_img_disconnected_machine = document.getElementById('ccv_jofemar_img_machine_one_disconected');
    let f_img_door_open_machine = document.getElementById('ccv_jofemar_img_machine_one_door_open');
    let f_img_door_closed_machine = document.getElementById('ccv_jofemar_img_machine_one_door_closed');
    f_img_disconnected_machine.style.display = 'none';
    f_img_door_open_machine.style.display = 'none';
    f_img_door_closed_machine.style.display = '';
    //let f_device = document.getElementById('ccv_jofemar_device_not_detected');
    //let f_machine = document.getElementById('ccv_jofemar_machine_one_disconected');
    //f_device.style.display = 'none';
    //f_machine.style.display = 'none';
    //document.querySelector('body').classList.remove('ccv-jofemar-overflow-hidden');
    let f_machine = document.getElementById('ccv_jofemar_machine_one_disconected');
    let f_boardroid = document.getElementById('notBoarddroid');
    let f_device = document.getElementById('ccv_jofemar_device_not_detected');

    if(((f_boardroid === null || (f_boardroid !== null && f_boardroid.style.display.trim() === 'none')))){
            f_device.style.display = 'none';
            f_boardroid.style.display = 'none';
            document.querySelector('body').classList.remove('ccv-jofemar-overflow-hidden');
    }
    f_machine.style.display = 'none';
    f_machine.innerText = 'Máquina 1: No Conectada';
}
// Default Load data
function ccvJofemarExtDefaultLoad() {
    if (!ccv_jofemar_control) {// User page
        /* Disable coin purse and bill purse, if the page loaded and if one of two does not exist change by other
         * function more appropriate
            # they must be deactivated, because if they were activated would receive money without an active purchase
        */
        ccvJofemarExtDisableCoinBillPurse();
    } else {// Control page
        let f_disable = false;
        switch (ccv_jofemar_control_page) {
            case 'index':
                f_disable = true;
                break;
            case 'planograma':
                f_disable = true;
                break;
            case 'dispositivos':
                f_disable = true;
                break;
            default:
                f_disable = false;
                break;
        }
        if (f_disable) {
            /*
                By default in control, the wallet is not activated or deactivated, because most do not have a recycler,
                 in case it does, change to another more appropriate function
            */
            ccvJofemarReadTubes();
            setTimeout(()=>{ccvJofemarDisableCoinPurse()}, 300);
        }
    }
}
/* Obtains the percentages of the tubes in relation to the coins that are detected in the
 * tube reading,
 */
 function ccvJofemarExtPercentageTubes(arr) {
    // the indices of arr = 10,5,2,1,50c
    //consoleLog(arr);
     addLog("log",arr);
}
/**
 * This functions commented are useful for coin and bill purse
 * You can use them in your own functions by calling them in your code
 */
// Enable only the coin purse
// ccvJofemarEnableCoinPurse()
// Disable only the coin purse
// ccvJofemarDisableCoinPurse()
// Enable only the bill purse
// SCROW -> enable "01" disable "00"
// ccvJofemarEnableBillPurse(SCROW)
// Disable only the bill purse
// ccvJofemarDisableBillPurse()
// Enable coin purse and bill purse
function ccvJofemarEnableCoinBillPurse() {
    ccvJofemarEnableCoinPurse();
    // a time is set because if they are sent together one of the commands will not work
    // scrow = variable to enable or disable it (if the wallet has it, if not send 00 in scrow)
    setTimeout(()=> {
        ccvJofemarEnableBillPurse(ccv_jofemar_scrow);
    }, 300);
}
// Disable coin and bill purse
function ccvJofemarExtDisableCoinBillPurse() {
    ccvJofemarDisableCoinPurse();
    // a time is set because if they are sent together one of the commands will not work
    setTimeout(()=> {
        ccvJofemarDisableBillPurse()
    }, 300);
}
function ccvJofemarExtDisplayCode(code){
    //consoleLog(code);
    addLog("log",code);
}
function ccvJofemarExtEventMachine(data){
    /**
     * data.event = 'evento que llamo a la funcion'
     * data.code = 'array en hexadecimal que llego desde la maquina (no tienen el 0x pero esta implicito al ser
     *              hexadecimal)' Ej. [0x02, 0x81, 0x54, 0x31, 0xF8, 0x0F, 0x03]
     * data.additional = {
     *     machine: {'dec','hex'}
     *     key: {'dec','hex','ascii'}
     * }
     */
    //consoleLog(data);
    addLog("log",data);
}
let ccv_jofemar_ext_interval_waiting_dispensing = undefined;
function ccvJofemarWaitForProductDown(){
    setTimeout(() => {
        ccv_jofemar_ext_interval_waiting_dispensing = setInterval(()=>{

            if(ccv_jofemar_status_dispensing == undefined){

                //	...	No hace nada, ya que si esta indefinida significa que la respuesta no ha llegado aun

                //	...	Se pone en if ya que podria ser util despues

            }else if(ccv_jofemar_status_dispensing === true){

                $(".dispensing-process").hide();

                $("#div-entregado").show();

                ccv_jofemar_status_dispensing=undefined;
                clearInterval(ccv_jofemar_ext_interval_waiting_dispensing);
                ccv_jofemar_ext_interval_waiting_dispensing = undefined;


                setTimeout(function(){

                    $(".dispensing-process").hide();

                    $("#standby").show();

                    $(".btn-controls").show();

                    $('.modal').modal('hide');

                    $('.modal-backdrop').remove();

                },500);

            }else if(!ccv_jofemar_status_dispensing === false){

                $(".dispensing-process").hide();

                $("#standby").hide();

                $("#div-no-entregado").show();

                ccv_jofemar_status_dispensing=undefined;
                clearInterval(ccv_jofemar_ext_interval_waiting_dispensing);
                ccv_jofemar_ext_interval_waiting_dispensing = undefined;

                setTimeout(function(){

                    $(".dispensing-process").hide();

                    $("#standby").show();

                    $(".btn-controls").show();



                    $('.modal').modal('hide');

                    $('.modal-backdrop').remove();

                },500);

            }



        },1000)
    }, 2000);
}
function ccvJofemarEndWaitingInterval(){
    clearInterval(ccv_jofemar_ext_interval_waiting_dispensing);
    ccv_jofemar_ext_interval_waiting_dispensing = undefined;
    clearInterval(ccv_jofemar_sen);
}

function extJofCurrentTemperature(data){
    addLog("log",data);

    document.getElementById('jof_show_current_temp').innerText = data.str;
    // print sample
}
function extJofWorkingTemperature(data){
    document.getElementById('assigned-working-temperature').innerText = 'Temperatura de corte actual: '+data.temp+'°C';
    addLog('log','temperatura de corte',data)
}


/**
 * @uncompleted
 * This function is not completed and makes errors, generating many inserts in the database
 */
//function ccvJofemarExtSaveLog(strJson){
//    //  strJson has
//    //  "code"
//    //  "message"
//    //  "description"
//    //  "request"
//    //  "no_code"
//    //consoleLog(strJson);
//    addLog("log",strJson);
//    // send is a example function
//    // formData is a example function (first parameter is a handler for backend and second parameter is the string
//    // inside of "value" parameter)
//    send(formData("logLinker",strJson))
//}
/**
 * Created by danidoble (https://github.com/danidoble)
 * @author Daniel Sandoval AKA danidoble
 * @year 2021
 * @website https://danidoble.com
 */

 
$(()=>{
    if(__type_project__ === "jofemar"){
    //lazyLoadInstance.update();
    setTimeout(function(){
        let eval_site_url = new URL(location);
        if(ccv_jofemar_read_temperature && !(eval_site_url.pathname).includes('/control')){
            addLog('log','leyendo temperatura actual')
            ccvJofemarReadCurrentTemperature();
            setInterval(function(){
                addLog('log','leyendo temperatura actual')
            ccvJofemarReadCurrentTemperature();
            },(1000*60*3))
        }
    },4500)
    }

})
