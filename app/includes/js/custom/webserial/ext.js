/*!
 * Weblinker v2.0 - web serial
 * @author danidoble
 * @year 2021
 * Copyright 2020-2022 Owl desarrollos
 * Copyright 2020-2022 Coin city mexico.
 */
"use strict"; //if you have problems with this you can comment it with -> //

//__type_project__ = "jofemar";
__type_project__ = "ams";

let change_returned_verified = 0;
const ccv_tiempoParaRecargarFalla = 2000;
const ccv_ext_senseInterval = 500;
let seleccion_dec;
let id_movimiento_dec;
let isOnControlPanel=false;
let isOnDispositivos=false;
let dispensando=false;
let id_movimiento_retirar;
let restarSeleccion;
let tiempoCancelaPago=1000*60; // 20 segundos sin que se inserte alguna moneda
let tiempoSinDeposito;
let entregaMonedas=false;
let entregaMonedasInterval=undefined;
let pageActive=undefined;
let intervaloProgressBar=undefined;
let IntervalcuentaRegresiva=undefined;
let shortCode=undefined;
var estatusPagado=false;
var cancelled=false;

/**
 * reload when finish an operation
 * this is an a preventive data set to true to allow soft reload and hard reload
 * @name ext_owl_reload_when_finished
 * @type {boolean}
 */
const ext_owl_reload_when_finished = true;
/**
 * Time to interval between sense check, default 500ms
 * @name ext_owl_time_interval_sense
 * @type {number}
 */
const ext_owl_time_interval_sense = 500;
/**
 * Time until page reload once sense result is obtained, default 2000ms
 * @name owl_time_to_reload
 * @type {number}
 */
const ext_owl_time_to_reload = 2e3;
/**
 * If reload is required once product is dispensed
 * @name ext_owl_reload_when_finish
 * @type {boolean}
 */
const ext_owl_reload_when_finish = true;
/**
 * If is true will shown a message in full screen if the serial device is not connected
 * @name owl_show_without_device
 * @type {boolean}
 */
//owl_show_without_device = true;
/**
 * nayax give a max authorized pre-credit, must be specified to prevent errors in payments
 * @type {number}
 */
//owl_nayax_max_pre_credit = 0';
/**
 * If the machine use ICT Recycler
 * @type {boolean}
 */
 //owl_ict = true;
 /**
 * Type of banknote currency to Recycler in ICT
 * @type {boolean}
 */
//let owl_ict_bill = 1;
/**
 * scrow of bill purse, default -> disable "00". To enable "01"
 * @name owl_scrow
 * @type {string}
 */
//owl_scrow = "00";
/**
 * Help to now if the system is in "/control", to do functions only for that place
 * @name owl_control
 * @type {boolean}
 */
//owl_control = false;
/**
 * Only for identify the active page
 * @name owl_control_page
 * @type {undefined}
 */
//owl_control_page = undefined;
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
 * @name extOwlSoftReload
 * @void
 */
function extOwlSoftReload() {
    //setTimeout(owlReadTubes,100);
    //setTimeout(owlReadBillPurse,200);

    /**
     * Put here all variables you want clear after process that require "reload" of "soft reload" ends.
     *
     * The next variables can let commented but if you need change to put another default value do it here.
     */

    /**
     * time for receive answers
     * @type {number}
     */
    owl_time_response_general=5e3;
    /**
     * time for response of engines, if its by sensor must be 15 seconds approx
     * @type {number}
     */
    //owl_time_response_engines = 15e3;
    /**
     * Time to try reconnect
     * @type {number}
     */
    //owl_time_to_reconnect = 7e3;

    /**
     * Add your own variables here to reset to default value
     */

     //ccv_tiempo_respuesta=5000;
     // ccv_tiempo_reconectar=7000;
     
         seleccion_dec=undefined;
         id_movimiento_dec=undefined;
         isOnControlPanel=false;
         isOnDispositivos=false;
         dispensando=false;
         id_movimiento_retirar=undefined;
         restarSeleccion=undefined;
         tiempoCancelaPago=1000*60 //20 segundos sin que se inserte alguna moneda
         entregaMonedas=false;
         entregaMonedasInterval=undefined;
         cobrandoEnd();
         intervaloProgressBar=undefined;
         IntervalcuentaRegresiva=undefined;
         owl_price = undefined;
         change_returned_verified = 0;
         //owl_price=undefined;
     
         tiempoSinDeposito=undefined;
         if($("#label-inferior").length>0){
             //$("#label-inferior").text("Ingrese efectivo hasta cubrir el total");
         }
     
         //setTimeout(owlReadTubes,300);
         //setTimeout(owlReadBillPurse,500);
}


/**
 * Responses of the serial device, includes the complete description of what means
 * @name extOwlSerialMessage
 * @void
 * @param f_obj json data
 */
function extOwlSerialMessage(f_obj) {
    /**
     * f_obj = {
     *   code
     *   message
     *   description
     *   request
     *   no_code
     * }
     * */
    addLog("log",f_obj);

    if(f_obj.no_code == 267){   //lectura de tubos
        //addLog("log",owl_arr_coins_tubes);
        saveCurrentMoneyPaymentPurses();
    }
    else if(f_obj.no_code == 268){  //lectura de billetes
        //addLog("log",owl_arr_bills_recycler);
        saveCurrentMoneyPaymentPurses();
    }
    else if(f_obj.no_code == 274){  //retiro de monedas
        entregaMonedas=true;
        if(dispensando){
            send(formData('updateRetiroMonedas',id_movimiento_retirar));
            OwlReload();
            
            $(".retiroProcess").hide();

            $("#retiroDiv").show();
            $("#controlsRetiro").show();
            
            $('#cerrarModal').click();
            dispensando=false;

        }
    }
}

/**
 * Show the numbers of coins in the coin purse tubes
 * @name extOwlPercentageTubes
 * @param obj
 * @void
 */
function extOwlPercentageTubes(obj) {
    addLog("log","Niveles Billetes",obj);

    $("#porcentaje_10").text(obj.p10+"%").addClass(auxPorcentaje(obj.p10));
    $("#porcentaje_5").text(obj.p5+"%").addClass(auxPorcentaje(obj.p5));
    $("#porcentaje_2").text(obj.p2+"%").addClass(auxPorcentaje(obj.p2));
    $("#porcentaje_1").text(obj.p1+"%").addClass(auxPorcentaje(obj.p1));
    $("#porcentaje_50c").text(obj.c50+"%").addClass(auxPorcentaje(obj.c50));

}

/**
 * Preload of devices (coin and bill purse)
 * @name extOwlDefaultLoad
 * @void
 */
function extOwlDefaultLoad() {
    owlReadTubes();
    setTimeout(owlReadBillPurse,100);
    if (!owl_control) {//If the page is not in some /control
        /**
         * Disable coin and bill purse
         * If the project don't use one of them use other function more appropriated
         */
         addLog("log","disable bill");
        setTimeout('extOwlDisableCoinBillPurses()',1000);
    } else {//If the page is in some /control
        let deactivate;
        switch (owl_control_page) {
            case 'index':
                deactivate = true;
                break;
            case 'planograma':
                deactivate = true;
                break;
            case 'dispositivos':
                deactivate = true;
                break;
            default:
                deactivate = false;
                break;
        }

        if(deactivate === false){
            switch (pageActive) {
                case 'control.index':
                    deactivate = true;
                    break;
                case 'control.planograma':
                    deactivate = true;
                    break;
                case 'control.dispositivos':
                    deactivate = true;
                    break;
                default:
                    deactivate = false;
                    break;
            }
        }

        //setTimeout(owlReadTubes,200);
        //setTimeout(owlReadBillPurse,300);
        if (deactivate) {
            /**
             * By default in /control pages the bill purse will not activate o deactivate
             * because the most of them don't have recycler, in case they have change for other function.
             */

            addLog("log",pageActive);
            setTimeout(()=>{
                //owlDisableCoinPurse();
                if(typeof putMoneyOnView != undefined && typeof putOnView === "function"){
                    isOnControlPanel=true;
                    putOnView();
                }
            }, 300);            
            setTimeout(owlDisableBillPurse,900);
        }else{
            //setTimeout(owlDisableCoinPurse,600);
            setTimeout(owlDisableBillPurse,900);
        }

    }
}


/**
 * Timeout response not received in time
 * @name extOwlTimeout
 * @void
 */
function extOwlTimeout() {
    addLog("error",owl_last_error);
}

/**
 * Show an a in progress reconnection message
 * @name extOwlReconnectionMessage
 * @void
 */
function extOwlReconnectionMessage() {
    addLog("log",__("Trying reconnect"));
}

/**
 * Show an error device not detected
 * @name extOwlWithoutDevice
 * @void
 */
function extOwlWithoutDevice(f_type='boardroid') {
    /*if (owl_show_without_device) {
        let f_device = document.getElementById('owl_device_not_detected');
        f_device.style.display = '';
        document.querySelector('body').classList.add('owl-overflow-hidden');
    }*/

    let f_device = document.getElementById('ccv_jofemar_device_not_detected');
    let f_machine = document.getElementById('notBoarddroid');
    f_device.style.display = '';
    f_machine.style.display = '';
    if(f_type === 'app'){
        f_machine.innerText='Applicación Boardroid no cargada.';
    }else{
        f_machine.innerText='Boardroid: No Conectada';
    }
    document.querySelector('body').classList.add('ccv-jofemar-overflow-hidden');


    let f_img_disconnected_boardroid = document.getElementById('ccv_boardroid_img_disconnected');
    let f_img_connected_boardroid = document.getElementById('ccv_boardroid_img_connected');

    if(f_img_disconnected_boardroid !== null){
        f_img_disconnected_boardroid.style.display = '';
        f_img_connected_boardroid.style.display = 'none';
    }

    //$("#notBoarddroid").show();
    //$("body").addClass("notOverflow");
}

/**
 * Show the bytes sended by the user to the serial device
 * @name extOwlSendedBytes
 * @param bytes
 */
function extOwlSendedBytes(bytes) {
    addLog("log",bytes);
}

/**
 * Hide the error device not detected
 * @name extOwlWithDevice
 * @void
 */
function extOwlWithDevice() {
    /*if (owl_show_without_device) {
        let f_device = document.getElementById('owl_device_not_detected');
        f_device.style.display = 'none';
        document.querySelector('body').classList.remove('owl-overflow-hidden');
    }*/

    //let f_device = document.getElementById('ccv_jofemar_device_not_detected');
    //let f_machine = document.getElementById('notBoarddroid');
    //f_device.style.display = 'none';
    //f_machine.style.display = 'none';
    //document.querySelector('body').classList.remove('ccv-jofemar-overflow-hidden');


    let f_img_disconnected_boardroid = document.getElementById('ccv_boardroid_img_disconnected');
    let f_img_connected_boardroid = document.getElementById('ccv_boardroid_img_connected');

    f_img_disconnected_boardroid.style.display = 'none';
    f_img_connected_boardroid.style.display = '';



    if(__type_project__ === "jofemar"){
        let f_machine = document.getElementById('ccv_jofemar_machine_one_disconected');
        let f_boardroid = document.getElementById('notBoarddroid');
        let f_device = document.getElementById('ccv_jofemar_device_not_detected');
        
        if(
            (f_machine === null || (f_machine !== null && f_machine.style.display.trim() === 'none'))){
                f_machine.style.display = 'none';
                document.querySelector('body').classList.remove('ccv-jofemar-overflow-hidden');
                f_device.style.display = 'none';
        }

        f_boardroid.style.display = 'none';
        f_boardroid.innerText='Boardroid: No Conectada';

        //$("#notBoarddroid").hide();
        //$("body").removeClass("notOverflow");
    }else{
        let f_boardroid = document.getElementById('notBoarddroid');
        let f_device = document.getElementById('ccv_jofemar_device_not_detected');
        
        document.querySelector('body').classList.remove('ccv-jofemar-overflow-hidden');
        f_device.style.display = 'none';
        
        f_boardroid.style.display = 'none';
        f_boardroid.innerText='Boardroid: No Conectada';
    }
    
}


//  Dinero en sesion
var contadorv=0;
var executeOneTime=false;
/**
 * Show the money in session
 * @name extOwlMoneySession
 * @void
 */
function extOwlMoneySession() {
    let money_in_session = JSON.parse(JSON.stringify({"bills": owl_arr_bills, "coins": owl_arr_coins}));
    addLog("log",money_in_session);


    //  Si esta en panel de recarga monedero
    contadorv++;
    addLog("log","ejecutado veces: "+contadorv);
    if(isOnControlPanel && isOnDispositivos){
        addLog("log","lecutra continua");
        lecturaContinua();
    }else{
            if (!cancelled) {

                let arrDineroEnSesion=JSON.stringify({"billetes":owl_arr_bills,"monedas":owl_arr_coins});
                //addLog("log",JSON.parse(arrDineroEnSesion));

                //dinero ingresado
                $("#ingresado").text("$ "+formatNumber.new(parseFloat(owl_amount_inserted).toFixed(2)));
                $(".ingresado").text("$ "+formatNumber.new(parseFloat(owl_amount_inserted).toFixed(2)));
                
                //  calcula el cambio y lo guarda en owl_change
                owlCalcChange();
                $(".cambio").text("$ "+formatNumber.new(parseFloat(owl_change).toFixed(2)));
                addLog("log","ingresado",owl_price);
                
             if (owl_price>0) {
                if(owl_amount_inserted >= owl_price){
                    cancelled=true;
                    $(".cambio").text("$ "+formatNumber.new(parseFloat(owl_change).toFixed(2)));
                    cobrandoEnd();

                    addLog("log","ingresado",owl_amount_inserted+"-"+owl_price);
                    estatusPagado=true;
                    setTimeout(function(){owlDisableCoinPurse();},100);
                    setTimeout(function(){owlDisableBillPurse();},600);
                    
                    $("#cancelarEnVenta").hide();
                    $(".proceso-venta").hide();
                    $("#label-inferior").text("Espere mientras se dispensa su producto");
                    $("#listenCash").show();
                    $(".process-img").hide();
                    $("#DISPENSANDO").show();
                    $("#show-only-some-currency").hide();
                    $(".btn_cancel_proccess_payment").hide();
                    // intenta hacer el dispensado con sensores = 0 (el tercer parametro)
                    //setTimeout(function(){ccv_matrizMotores(ccv_DecToHex(seleccion_dec),"00","00");;},1200)
                    //a la espera de que el dispensado se complete, o falle
                    //ccv_ext_waitForDownProduct(seleccion_dec,id_movimiento_dec);
                    if(__type_project__ === "jofemar"){
                    let str_selection = seleccion.toString();
                    let dispense_tray = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[0]+''+str_selection[1])+128));
                    let dispense_channel = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[2])+128));

                    ccvJofemarEnginesMatrix(parseInt(id_vending_seleccion_db),dispense_tray,dispense_channel)                   
                    ccvJofemarExtWaitForProductDown(str_selection,_sup_id_movimiento_);
                    
                    }else{
                        setTimeout(() => {
                            extOwlWaitingForSense(seleccion,_sup_id_movimiento_);
                            owlEnginesMatrix(owlDecToHex(seleccion),"00",owl_time_response_engines);
                        }, 1000);
                    }
                    addLog("log","cambiando estatus dispensado");
                    //setTimeout(function(){ccv_jofemar_status_dispensing=true},1500);

                    //owlReload();
                    
                }else{
                    cobrandoStart();
                }
            }else{
                addLog("log","operacion rechazada");
            }          
        }else{
            console.log("proceso cancelado repentinamente");
            
    }
        }
}

let timeout_check_money_dispensed = undefined;
function extOwlRetireBill(force = false){
    console.warn("aquio",timerClose);
    //owl_change = owl_amount_inserted;
    $("#changePdtDiv").show();
    if(owl_amount_retired < 0){
        console.log("que pex");
        addLog('error','Error en el conteo de retiro, el dispensado supera al que deberia entregarse',owl_amount_retired);
    }
    console.log("Billete Expulsado");
    console.log("retirado hasta ahora",owl_amount_retired);
    console.log("cambio total",owl_change);
    console.log("resultado",parseFloat(owl_change)+parseFloat(owl_amount_retired));
    $("#divRetireNow").show();
    addLog("log","billete expulsado");
    $(".givingBills").text("$ "+(parseFloat(owl_change)+parseFloat(owl_amount_retired)).toFixed(2));

    if(timeout_check_money_dispensed != undefined){
        clearTimeout(timeout_check_money_dispensed);
        timeout_check_money_dispensed = undefined;
    }
    if(force){
        //document.getElementById('alert-no-money-dispensed').classList.remove('hidden');
    }else{
        //timeout_check_money_dispensed = setTimeout(function(){
            //document.getElementById('alert-no-money-dispensed').classList.remove('hidden');  
        //},5000)
    }
    

    if (parseFloat(owl_change) + parseFloat(owl_amount_retired) == 0 || owl_amount_retired==0) {
         setTimeout(function(){//esto estaba en funcion para cuando dispensa producto, deberia ir aqui con los valores de retiro
            send(formData("dineroIngresadoArr", JSON.stringify({
                "movimiento": $("#id_movimiento").val(),
                "ingresado": owl_amount_inserted,
                "cambio": owl_change,
                "cambio_entregado": change_returned_verified,
                "ubicacion": "null",
                "efectivo": {
                    "1000": owl_arr_bills.stacker.P1000 + owl_arr_bills.recycler.P1000,
                    "500": owl_arr_bills.stacker.P500 + owl_arr_bills.recycler.P500,
                    "200": owl_arr_bills.stacker.P200 + owl_arr_bills.recycler.P200,
                    "100": owl_arr_bills.stacker.P100 + owl_arr_bills.recycler.P100,
                    "50": owl_arr_bills.stacker.P50 + owl_arr_bills.recycler.P50,
                    "20": owl_arr_bills.stacker.P20 + owl_arr_bills.recycler.P20,
                }
            })))    
        },1900)
        console.log("se terminó");
        timerClose=20;
        clearTimeout(timeout_check_money_dispensed);
        timeout_check_money_dispensed = undefined;
        timerEndProcess(20);

    }else{
        if (owl_no_dispense_all_money) {
            document.getElementById('alert-no-money-dispensed').classList.remove('hidden');
            console.log("no ha podido entregarse todo el cambio");
            timerEndProcess(35);

            setTimeout(function () {//esto estaba en funcion para cuando dispensa producto, deberia ir aqui con los valores de retiro
                send(formData("dineroIngresadoArr", JSON.stringify({
                    "movimiento": $("#id_movimiento").val(),
                    "ingresado": owl_amount_inserted,
                    "cambio": owl_change,
                    "cambio_entregado": change_returned_verified,
                    "ubicacion": "null",
                    "efectivo": {
                        "1000": owl_arr_bills.stacker.P1000 + owl_arr_bills.recycler.P1000,
                        "500": owl_arr_bills.stacker.P500 + owl_arr_bills.recycler.P500,
                        "200": owl_arr_bills.stacker.P200 + owl_arr_bills.recycler.P200,
                        "100": owl_arr_bills.stacker.P100 + owl_arr_bills.recycler.P100,
                        "50": owl_arr_bills.stacker.P50 + owl_arr_bills.recycler.P50,
                        "20": owl_arr_bills.stacker.P20 + owl_arr_bills.recycler.P20,
                    }
                })))    
            }, 1900);
        }
        console.log("todavia falta");
    } 
}

/**
 * Messages of application, not device serial
 * @name extOwlAppMessage
 * @void
 */
function extOwlAppMessage(obj) {
    addLog("log",obj);
}

function extOwlConnectionLost(event) {
    extOwlWithoutDevice();
}


if(typeof __demo === 'undefined'){
    let __demo = false;
}
/**
 * Show the last error occurred in execution time
 * @param error
 * @void
 */
function extOwlErrors(error) {
    
    if(error.toString().includes("Failed to execute 'requestPort' on 'Serial': Must be handling a user gesture to show a permission request")){
        if(!owl_control && !__demo){
            document.getElementById('btn-open-warning-modal-permission').click();
        }
    }
    else if(error.toString().includes("No port selected by the user")){
        if(!owl_control && !__demo){
            document.getElementById('btn-open-warning-modal-permission').click();
        }
    }
    else if(error.toString().includes("Cannot read property 'writable' of null")){
        //extOwlWithoutDevice()
        if(!owl_control && !__demo){
            document.getElementById('btn-open-warning-modal-permission').click();
        }
    }
    else if(error.toString().includes("The device has been lost")){
        extOwlWithoutDevice();
        //document.getElementById('btn-open-warning-modal-permission').click();
    }
    else if(error.toString().includes("Failed to open serial port")){
        addLog("warn",__("Failed to open serial port. Trying again."));
        extOwlWithoutDevice();
        owlDisconnect();
        setTimeout(()=>{
            // try to connect
            serialOwlConnect().then((e) => {
                //when finish the connection
                addLog("log",e);
            });
        },500);
    }
    else{
        addLog("error",error)
    }
    //you can show all errors in console or just let unhandled errors
    //addLog("error",error)
}

/**
 * Disable the coin and bill purse
 * @name extOwlDisableCoinBillPurses
 * @void
 */
function extOwlDisableCoinBillPurses() {
    owlDisableCoinPurse();
    // "set timeout" Is used because if you send 2 commands together one of them will not work
    setTimeout(() => {
        owlDisableBillPurse()
    }, 500);
}

/**
 * Enable the coin and bill purse
 * @name extOwlEnableCoinBillPurses
 * @void
 */
function extOwlEnableCoinBillPurses() {
    owlEnableCoinPurse();
    // "set timeout" Is used because if you send 2 commands together one of them will not work
    setTimeout(() => {
        owlEnableBillPurse(owl_scrow)
    }, 500);
}

/**
 * Validations of pre credit nayax authorization
 * @name extOwlNayaxPreCreditFail
 * @param type
 */
function extOwlNayaxPreCreditFail(type) {
    if (type === 'define') {
        addLog("error",__("for validation is needed give a max amount of pre-credit authorized by nayax"));
    } else if (type === 'amount') {
        addLog("error",__("You sent a value higher than the pre-credit authorized by nayax"));
    } else {
        addLog("error",__("Bad configuration of nayax pre credit"));
    }
}

/**
 * Wait until response of sense come from device, by default the time to interval its in constant
 * ext_owl_time_interval_sense
 * @name extOwlWaitingForSense
 */
function extOwlWaitingForSense(seleccion,id_movimiento) {
    owl_waiting_for_sense = setInterval(() => {
        if (owl_status_dispense === undefined) {
            // Still waiting for the sense response
            //console.log("dispensando...");
            addLog("log","dispensando... #timeout:",countTimeout+"/40");
            if (countTimeout==40) {
                countTimeout=0;
                owl_status_dispense=false;
            }else{
                countTimeout++;
            }
            // ... It does nothing, since if it is undefined it means that the answer has not arrived yet
            // ... It is set to "if" since it could be useful later

        } else if (owl_status_dispense === true) {
            owlClearSenseProduct();
            /**
             * user content section
             * put your code here
             */
            
            //console.log("dispensing: "+ccv_jofemar_status_dispensing);
            addLog("log","dispensing: "+owl_status_dispense);
            ccvJofemarCleanSenseProduct();
            $(".proceso-venta").hide();
            $(".process-img").hide();
            if (ajaxProcess==undefined) {
                ajaxProcess="GENERICO";
            }
            switch(ajaxProcess){
                case "CODEREDEEM":
                    send(formData("restaStock",uuid_seleccion_db));
                    send(formData("redeemCode",redeem_code));
                    send(formData("syncCodes",""));
                break;

                case "SSEREMOTE":
                    send(formData("restaStock",uuid_seleccion_db));
                    send(formData("pagaRemote",_sup_id_movimiento_));
                break;

                default:
                    send(formData("restaStock",uuid_seleccion_db));
                    send(formData("pagaNayax",_sup_id_movimiento_));
                    //send(formData("syncVentas","app"));
                    send(formData('syncSeleccionesLocaltoCloud',"app"));
                break;
            }
           
            
            if (owl_amount_inserted > owl_price) {
                owl_change=owl_amount_inserted - owl_price;
            }else{
                owl_change=0;
            }
            
            //console.log("regresando cambio");
            addLog("log","regresando cambio");
            //setTimeout(function(){owlReadBillPurse()},200);
            //setTimeout(function(){owlReadTubes()},200);
            //console.log("dispensing2: "+ccv_jofemar_status_dispensing);
            addLog("log","dispensing2: "+owl_status_dispense);
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
                $("#show-only-some-currency").hide();
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

            setTimeout(function(){
                send(formData("dineroIngresadoArr", JSON.stringify({
                    "movimiento": _sup_id_movimiento_,
                    "ingresado": owl_amount_inserted,
                    "cambio": owl_change,
                    "cambio_entregado": change_returned_verified,
                    "ubicacion": "null",
                    "efectivo": {
                        "1000": owl_arr_bills.stacker.P1000 + owl_arr_bills.recycler.P1000,
                        "500": owl_arr_bills.stacker.P500 + owl_arr_bills.recycler.P500,
                        "200": owl_arr_bills.stacker.P200 + owl_arr_bills.recycler.P200,
                        "100": owl_arr_bills.stacker.P100 + owl_arr_bills.recycler.P100,
                        "50": owl_arr_bills.stacker.P50 + owl_arr_bills.recycler.P50,
                        "20": owl_arr_bills.stacker.P20 + owl_arr_bills.recycler.P20,
                    }
                })))
                

                setTimeout("owlReload();send(formData('syncVentas', 'app'));",1500);
            },2000)

            /**
             * END user content section
             * */

            setTimeout(() => {
                
                terminarProcesoDePago();
            }, ext_owl_time_to_reload);

        } else if (owl_status_dispense === false) {
            if (ajaxProcess==undefined) {
                ajaxProcess="GENERICO";
            }
            owlClearSenseProduct();
            /**
             * user content section
             * put your code here
             */
            
            //  AVISAR -> producto no entregado, 
            $(".proceso-venta").hide();
            $(".process-img").hide();
            $("#PRODUCTONOENTREGADO").fadeIn();
            switch(ajaxProcess){
                case "SSEREMOTE":
                    send(formData("nodispensadosse",id_movimiento));
                break;

                default:
                    send(formData("nodispensado",id_movimiento));
                break;
            }
            
            setTimeout(function(){
                owlReadBillPurse()

                setTimeout(function(){
                    if (owl_amount_inserted>0) {
                        owl_change=owl_amount_inserted;
                        console.error("cambio aqui",owl_amount_inserted,owl_change);
                        $("#retireBillDiv").show();
                        $("#PRODUCTONOENTREGADO").hide();
                        $("#CANCELANDOCHANGE").show();
                        $("#CASHVOUCHER").show();
                        $("#CASHLESSVOUCHER").hide();
                        $(".givingBills").text(owl_change);
    
                        if (!onetime) {
                            onetime=true;
                            executeOneTime=true;
                            setTimeout(function () {
                                owl_change = owl_amount_inserted;
                                setTimeout(function () {
                                    owlReturnChange();
                                }, 500);                
                            }, 300);
                            //setTimeout(function(){owlReturnChange();},800);
                            //setTimeout(function(){ccv_devolverCambioMonedas_V2();},800);
                        }   
                    }else{
                        timerEndProcess(20);
                    }  
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
                        setTimeout("owlReload()",5000); // esto provoca que se reinicie antes de que dispense si se le pone muy poco tiempo
                    },1900)
                },800);
            },200);
            


            /**
             * END user content section
             * */
            setTimeout(() => {
                terminarProcesoDePago();
            }, ext_owl_time_to_reload);
        } else {
            owlClearSenseProduct();
            // something happened this is an error
            addLog("error",__("Error dispensing, the values allowed are 'undefined', true and false."));
            
        }
    }, ext_owl_time_interval_sense);
}

/**
 * Wait until response of sense come from device, by default the time to interval its in constant
 * ext_owl_time_interval_sense
 * @name extOwlWaitingForSenseTest
 */
function extOwlWaitingForSenseTest(seleccion,id_movimiento) {
    owl_waiting_for_sense = setInterval(() => {
        if (owl_status_dispense === undefined) {
            // Still waiting for the sense response

        } else if (owl_status_dispense === true) {
            owlClearSenseProduct();
            /**
             * user content section
             * put your code here
             */
             // $("#label-inferior").text("Recoja su producto");
             // $("#listenCash").fadeIn();
            //  AVISAR -> recoja su producto
            $(".dispensing-process").hide();
            $("#div-entregado").show();
            $("#terminarPruebaDispensado").show();
            //cantidad=parseInt($("#sel-"+restarSeleccion).children('.quantity').text());
            //cantidad-=1;
            //$("#sel-"+restarSeleccion).children('.quantity').text(cantidad);

            //  actualizar stock
            /*      send(formData("restaStock",JSON.stringify({
                        "seleccion":seleccion,
                        "id_movimiento":id_movimiento,
                        "din_ingresado":owl_amount_inserted,
                        "din_cambio":owl_change,
                        "arr_monedas_caja":owl_arr_coins.box,
                        "arr_billetes_stacker":owl_arr_bills.stacker
                    })));
            /**
             * END user content section
             * */
             setTimeout(function(){
                $('.dispensing-process').hide();$('#div-start').hide();
                $("#standby").show();
                $('#editSeleccion').modal("hide");
                $(".btn-controls").show();
                $("#controlsDiv").show();
             },1000);

             
            setTimeout(() => {
                owlReload();
            }, ext_owl_time_to_reload);

        } else if (owl_status_dispense === false) {
            owlClearSenseProduct();
            /**
             * user content section
             * put your code here
             */
            
            //  AVISAR -> producto no entregado, 
            $(".dispensing-process").hide();
            $("#div-no-entregado").show();
            $("#terminarPruebaDispensado").show();

            // $("#ticketIngresado").val("CANCELADO");
            // $("#ticketCambio").val("NO COBRADO");
            // $(".proceso-venta").hide();
            // $("#label-inferior").html("Producto no entregado<br>, cobro no realizado, Realizando Cancelacion");
            // $("#listenCash").fadeIn();
            // cancelacion();

            //  actualizar estatus del movimiento
            send(formData("nodispensado",id_movimiento));

            /**
             * END user content section
             * */

             setTimeout(function(){
                $('.dispensing-process').hide();$('#div-start').hide();
                $("#standby").show();
                $('#editSeleccion').modal('hide');
                $("#controlsDiv").show();
             },1000);
            setTimeout(() => {
                owlReload();
            }, ccv_tiempoParaRecargarFalla);
        } else {
            // something happened this is an error
            addLog("error",__("Error dispensing, the values allowed are 'undefined', true and false."));
        }
    }, ext_owl_time_interval_sense);
}

$(()=>{
    owlInitSerial();

    if(__type_project__ === "jofemar"){
        if(typeof ccvJofemarConnect === "function"){
            ccvJofemarConnect();
        }
    }
})

/**
 * CUSTOM FUNCTIONS
 */

 function terminarCompra(){
    $(".process-img").hide();
    $(".proceso-venta").hide();
    $("#standby").show();
    $(".ingresado").text("$ 0.00");
    $(".cambio").text("$ 0.00");
    $(".total").text("$ 0.00");
    $("#proceso_venta").modal("hide");
    $("#preview").modal("hide");
}

function retiroEfectivo(){
    owlEnableBillPurse();
    let quantity = $('#retiro-50').val();
    if(parseInt(quantity) > 0){
        setTimeout(function(){
            addLog("log",quantity);
            owlDispenseBanknoteICT(owl_ict_bill,owlDecToHex(quantity));
        },300);
        setTimeout(function(){
            owlDisableBillPurse();
        },600);
    }
    setTimeout(function(){
        dispensingMoneyInPanel(quantity);
    },1000);
}

function lecturaContinua(){
    owlEnableBillPurse();
    owlEnableCoinPurse();
    //reciclador
    $("#camin-50-0").text(owl_arr_bills.recycler.P50);
    $("#camin-10-0").text(owl_arr_coins.tubes.P10);
    $("#camin-5-0").text(owl_arr_coins.tubes.P5);
    $("#camin-2-0").text(owl_arr_coins.tubes.P2);
    $("#camin-1-0").text(owl_arr_coins.tubes.P1);
    $("#camin-50c-0").text(owl_arr_coins.tubes.G50);
    
    //  TOTAL
    $("#sum-50-0").text(parseInt(owl_arr_bills.total/50));


    $("#ingresoEfectivo-10").text(owl_arr_coins.tubes.P10+owl_arr_coins.box.P10);
    $("#ingresoEfectivo-5").text(owl_arr_coins.tubes.P5+owl_arr_coins.box.P5);
    $("#ingresoEfectivo-2").text(owl_arr_coins.tubes.P2+owl_arr_coins.box.P2);
    $("#ingresoEfectivo-1").text(owl_arr_coins.tubes.G50+owl_arr_coins.box.G50);
    $("#ingresoEfectivo-50C").text(owl_arr_coins.tubes.P1+owl_arr_coins.box.P1);

    $("#arr_monedas_caja").val(JSON.stringify(owl_arr_coins.box));
    
}
function cobrandoStart(){
    addLog("log","cobrandoStart");
    clearTimeout(tiempoSinDeposito);
    tiempoSinDeposito=undefined;

    tiempoSinDeposito=setTimeout(function(){
        cancelarProcesoDePago();
    },tiempoCancelaPago);
}
function cobrandoEnd(){
    clearTimeout(tiempoSinDeposito);
    tiempoSinDeposito=undefined;
    
    clearInterval(intervaloProgressBar);
    intervaloProgressBar=undefined;

    clearInterval(IntervalcuentaRegresiva);
    IntervalcuentaRegresiva=undefined;

    
}
function auxPorcentaje(val){
    if(val < 25){
        return "bg-danger text-white";
    }else if(val >= 25 && val < 50){
        return "bg-warning text-dark";
    }
    else if(val >= 50){
        return "bg-success text-white";
    }
    return "";
}
function llenarParaRetirar(){
    addLog("log","ABRE");
    $('.retiroProcess').hide();
    $("#retiroDiv").show();
    $("#controlsRetiro").show();
    //owlReadTubes();
    //setTimeout(owlReadBillPurse,300);
    setTimeout(function(){
        retirarMonedas('','reiniciar');
        $("#retirar_10").text(owl_arr_coins_tubes.P10);
        $("#retirar_5").text(owl_arr_coins_tubes.P5);
        $("#retirar_2").text(owl_arr_coins_tubes.P2);
        $("#retirar_1").text(owl_arr_coins_tubes.P1);
        $("#retirar_50c").text(owl_arr_coins_tubes.G50);
    },300);

}
function retirarMonedas(denominacion,operador){
    id=$("#retiro-"+denominacion);
    valor=parseInt(id.val());
    max=parseInt($("#retirar_"+denominacion).text());
    id.attr("max",max);


    fin=$("#fin-"+denominacion);
    switch (operador) {
        case 'todo':
            if(id.hasClass('quitar')){
                id.val(0).removeClass('quitar bg-info text-white');
                fin.text(max);
            }else{
                id.val(max).addClass('quitar bg-info text-white');
                fin.text(0);
            }
            break;
        case '+':
            if((valor+1) > max){
                id.val(max);
                fin.text(0);
            }else{
                id.val(valor+1);
                fin.text(max-(valor+1));
            }
            
            break;
        case '-':
            if((valor-1) < 0){
                id.val(0);
                fin.text(max);
            }else{
                id.val(valor-1);
                fin.text(max-(valor-1));
            }
            break;
        case 'reiniciar':
            $("#retiro-10").val(0);
            $("#retiro-5").val(0);
            $("#retiro-2").val(0);
            $("#retiro-1").val(0);
            $("#retiro-50c").val(0);

            $("#fin-10").text("0");
            $("#fin-5").text("0");
            $("#fin-2").text("0");
            $("#fin-1").text("0");
            $("#fin-50c").text("0");
        break;
    }
}

function probarMotores(){
    owlExecuteTestEnginesMatrix();
}

function terminarCargaMonedas(){
    $('#ingresoDinero').modal('hide');
    
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    
    $('#ingresoEfectivo').hide();
    owlSoftReload();
    //se restablecen los valores de carga, como configuracion de monedero, billetero, lectura de monedas, etc
    setTimeout(function(){
        extOwlDefaultLoad();
    },300);
}
function terminarRetiroEfectivo(){
    $("#retiraDinero").hide().removeClass('show');
    /*$("#retiraDinero").hide();
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();*/
}

function cancelarProcesoDePago(){
    cancelled=true;
    timer_executed = true;
    $(".proceso-venta").hide();
    $(".btn_cancel_proccess_payment").hide();
    if(owl_amount_inserted > 0){
         owl_change=owl_amount_inserted;
         $(".cambio").text("$ "+parseFloat(owl_change).toFixed(2));
        $("#retireBillDiv").show();
        $("#PRODUCTONOENTREGADO").hide();
        $("#CANCELANDOCHANGE").show();
        $("#CASHVOUCHER").show();
        $("#CASHLESSVOUCHER").hide();

        $(".givingBills").text(owl_change);
        

        //setTimeout(function(){ccv_devolverCambioMonedas_V2();},800);
        setTimeout(function(){owlReturnChange();},900);
        
        //entregaMonedasProcess("view");
    }else{
        $("#CANCELANDO").show();
        $("#CASHVOUCHER").hide();
        $("#CASHLESSVOUCHER").hide();
        setTimeout(function(){
            $("#proceso_venta").modal('hide');
            $("#preview").modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            owlSoftReload();
            normalState();
        },3000);
    }
    send(formData('CANCELADOTIMEOUT',$("#id_movimiento").val()));
    timerEndProcess(20);
}

function cancelarProcesoDePagoButton(){
    cancelReadCard();
    cancelled=true;
    timer_executed = true;
    cobrandoEnd();
    //owlReadTubes();
    //setTimeout(function(){owlReadBillPurse();},300);

    $(".proceso-venta").hide();
    
    $(".btn_cancel_proccess_payment").hide();
    if(owl_amount_inserted > 0){
        owl_change=owl_amount_inserted;
        $("#retireBillDiv").show();
        $("#PRODUCTONOENTREGADO").hide();
        $("#CANCELANDOCHANGE").show();
        $("#CASHVOUCHER").show();
        $("#CASHLESSVOUCHER").hide();

        $(".givingBills").text(owl_change);
        //setTimeout(function(){ccv_devolverCambioMonedas_V2();},800);
        setTimeout(function(){owlReturnChange();},900);
        //entregaMonedasProcess("view");
    }else{
        $("#CANCELANDO").show();
        $("#CASHVOUCHER").hide();
        $("#CASHLESSVOUCHER").hide();
        setTimeout(function(){
            $("#proceso_venta").modal('hide');
            $("#preview").modal('hide');
            //$('body').removeClass('modal-open');
            //$('.modal-backdrop').remove();
            owlSoftReload();
            normalState();
        },3000);
    }
    send(formData('CANCELADOBUTTON',$("#id_movimiento").val()));
    //setTimeout('normalState()',3000);
}

function cancelarProcesoDePagoTOUTPinpad(){
    cancelled=true;
    cancelReadCard();
    timer_executed = true;
    cobrandoEnd();
    //owlReadTubes();
    //setTimeout(function(){owlReadBillPurse();},300);

    $(".proceso-venta").hide();
    
    $(".btn_cancel_proccess_payment").hide();
        $("#CANCELANDOPINPAD").show();
        $("#CASHVOUCHER").hide();
        $("#CASHLESSVOUCHER").hide();
        setTimeout(function(){
            $("#proceso_venta").modal('hide');
            $("#preview").modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            owlSoftReload();
            normalState();
        },5000);
    
    send(formData('CANCELADOBUTTON',$("#id_movimiento").val()));
    //setTimeout('normalState()',3000);
}


function cancelarProcesoDePagoPalanca(){
    if (!cancelled) {
        timer_executed = true;
        cancelReadCard();
        cancelled=true;
        cobrandoEnd();
        //owlReadTubes();
        //setTimeout(function(){owlReadBillPurse();},300);

        $(".proceso-venta").hide();
        console.log("dinero ingresado palanca rechazo",owl_amount_inserted);
        $(".btn_cancel_proccess_payment").hide();
        if(owl_amount_inserted > 0){
            owl_change=owl_amount_inserted;
            $("#retireBillDiv").show();
            $("#PRODUCTONOENTREGADO").hide();
            $("#CANCELANDOCHANGE").show();
            $("#CASHVOUCHER").show();
            $("#CASHLESSVOUCHER").hide();

            $(".givingBills").text(owl_change);
            
            setTimeout(function(){owlReturnChange();},800);
            //entregaMonedasProcess("view");
        }else{
            console.log("aca no deberia entrar");
            $("#CANCELANDO").show();
            $("#CASHVOUCHER").hide();
            $("#CASHLESSVOUCHER").hide();
            setTimeout(function(){
                $("#proceso_venta").modal('hide');
                $("#preview").modal('hide');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
                owlSoftReload();
                normalState();
            },3000);
        }
        send(formData('CANCELADOPALANCA',$("#id_movimiento").val()));
        //setTimeout('normalState()',3000);
    }else{
        console.log("Proceso terminado o cancelado, no se puede volver a cancelar");
    }
    
}



function terminarProcesoDePago(){
    cancelReadCard();
    setTimeout(function(){owlDisableBillPurse();},600);
    setTimeout(function(){owlDisableCoinPurse();},1000);
    //setTimeout(function(){owlDisableNayax();},1600);
    $(".process-img").hide();
    $("#comprobante").show();
    /*$("#proceso_venta").modal('hide');
    $("#preview").modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();*/

    
}




function entregaMonedasProcess(tipo){
    if(tipo=="view"){
        entregaMonedasInterval=setInterval(function(){
            if(entregaMonedas){
                clearInterval(entregaMonedasInterval);
                entregaMonedasInterval=undefined;
                //quitar ventana modal
                $("#proceso_venta").modal('hide');
                $("#preview").modal('hide');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
                owlSoftReload();
            }
        },ccv_ext_senseInterval)
    }
    
}
//leer la cantidad de billetes en dispositivos (aprox)
//F1 C3 00 00 00 00 00 00 00 00 F2 B5
function owlReadBillPurse(){
    let bytes = ["F1", "C3", "00", "00", "00", "00", "00", "00", "00", "00", "F2", "B5"];
    owlPreSendBytes(bytes, 'read bill');
}

//devolver cambio solo con monedero dependiendo la lectura de tubos
function ccv_devolverCambioMonedas_V2(){
    let totalMonedasTubos=
                    (owl_arr_coins_tubes.G50*.5)+
                    (owl_arr_coins_tubes.P1*1)+
                    (owl_arr_coins_tubes.P2*2)+
                    (owl_arr_coins_tubes.P5*5)+
                    (owl_arr_coins_tubes.P10*10);
    let totalBilletesRecycler=
                    (owl_arr_bills_recycler.P20*20)+
                    (owl_arr_bills_recycler.P50*50);
    let m50c=0; // *se reemplaza por 5p* la configuracion no tendra para devolver de 50c
    let m1p=0;
    let m2p=0;
    let m5p=0;
    let m10p=0;
    let b20p=0;
    let b50p=0;

    let ncambio=owl_change;
    addLog("log",owl_change);
    addLog("log","billetes disponibles");
    addLog("log",owl_arr_bills_recycler.P50);

    addLog("log","Monedas disponibles");
    addLog("log",owl_arr_coins_tubes);
    //addLog("log",cambio);

    if(owl_change > 0){
        
        for(let i=0;i<20;i++){
            //si el cambio esta en 0 se termina el for 
            if(ncambio == 0){
                break;
            }

                //##BILLETES  1a
            else if((ncambio-50) >= 0 && owl_arr_bills_recycler.P50 > b50p){
                b50p++;
                ncambio-=50;
            }

            /*else if((ncambio-20) >= 0 && owl_arr_bills_recycler.P20 > b20p){
                b50p++;
                ncambio-=20;
            }*/
            
                //##MONEDAS
            else if((ncambio-10) >= 0 && owl_arr_coins_tubes.P10 > m10p){
                m10p++;
                ncambio-=10;
            }
            else if((ncambio-5) >= 0 && owl_arr_coins_tubes.P5 > m5p){
                m5p++;
                ncambio-=5;
            }
            else if((ncambio-2) >= 0 && owl_arr_coins_tubes.P2 > m2p){
                m2p++;
                ncambio-=2;
            }
            else if((ncambio-1) >= 0 && owl_arr_coins_tubes.P1 > m1p){
                m1p++;
                ncambio-=1;
            }
            else if((ncambio-.5) >= 0 && owl_arr_coins_tubes.G50 > m50c){
                m50c++;
                ncambio-=.5;
            }

            //RESATABLECE EL CONTADOR SI EL CAMBIO NO SE HA COMPLETADO
            /*if(i == 19 && ncambio > 0){
                i=0;
            }*/
        }

    }
    else{
        //El cambio esta en cero, no se devuelve nada.
    }
    change_returned_verified = owl_change;
    if(owl_change > (totalMonedasTubos)+totalBilletesRecycler){ 
        change_returned_verified = (totalMonedasTubos)+totalBilletesRecycler;
        addLog("log","El cambio es mas de lo que tiene el monedero");
    }

    
    let arrJ=JSON.stringify({
        "monedas":{
            "c50":m50c,
            "p1":m1p,
            "p2":m2p,
            "p5":m5p,
            "p10":m10p
        },
        "billetes":{
            "p20":b20p,
            "p50":b50p
        },
        "cambio":owl_change
    });
    let unparsedArrJ=JSON.parse(arrJ);
    addLog("log","cambio",unparsedArrJ.cambio);
     addLog("log","billetes disponibles",b50p);
    if(unparsedArrJ.cambio>0){
        
        //evaluar si monedas seran dispensadas
        let dispensarMonedas=false;

        
        $.each(unparsedArrJ.monedas,function(index,value){
            if(!dispensarMonedas && value>0){
               dispensarMonedas=true;
            }
        });

        $.each(unparsedArrJ.billetes,function(index,value){
            if(!dispensarMonedas && value>0){
               dispensarMonedas=true;
            }
        });
        
        addLog("log","validacion:");
        addLog("log",unparsedArrJ);
        addLog("log","dispensar monedas",dispensarMonedas);
        if(dispensarMonedas){

            let dm50c=unparsedArrJ.monedas.c50.toString(16);
            let dm1=unparsedArrJ.monedas.p1.toString(16);                        
            let dm2=unparsedArrJ.monedas.p2.toString(16);                        
            let dm5=unparsedArrJ.monedas.p5.toString(16);                        
            let dm10=unparsedArrJ.monedas.p10.toString(16); 
            let dm20=unparsedArrJ.billetes.p20.toString(16);  
            let dm50=unparsedArrJ.billetes.p50.toString(16);                        
            var type="00";
            var qant="00";

            if (b20p>0) {
                //change_returned_verified /= 20;
                type="00";
                qant="0"+unparsedArrJ.billetes.p20.toString();
            }

            if (b50p>0) {
                //change_returned_verified /= 50;
                type="01";
                qant="0"+unparsedArrJ.billetes.p50.toString();
            }
            addLog("log","retirando:"+dm5);
            setTimeout(function(){owlDispenseCoins(dm50c,dm1,dm2,dm5,dm10);},200);
            setTimeout(function(){owlDispenseBanknoteICT(type.toString(),qant);},800);
            

        } else {
            //setTimeout(function(){owlDispenseCoins("00","00","00","00","00");},200);
       
            setTimeout(function(){owlDispenseBanknoteICT("00","00");},800);
        }
        
    }else{
        //No hay cambio que devolver
    }
}



function BilletesAceptables(){
    let respuestaL=3;
    let totalMonedasTubos=
                    (owl_arr_coins_tubes.G50*.5)+
                    (owl_arr_coins_tubes.P1*1)+
                    (owl_arr_coins_tubes.P2*2)+
                    (owl_arr_coins_tubes.P5*5)+
                    (owl_arr_coins_tubes.P10*10);
    let m50c=0; // *se reemplaza por 5p* la configuracion no tendra para devolver de 50c
    let m1p=0;
    let m2p=0;
    let m5p=0;
    let m10p=0;

    let ncambio=owl_price;
    
    if(owl_price > 0){
        
        for(let i=0;i<20;i++){
            //si el cambio esta en 0 se termina el for 
            if(ncambio == 0){
                break;
            }
            
                //##MONEDAS
            else if((ncambio-10) >= 0 && owl_arr_coins_tubes.P10 > m10p){
                m10p++;
                ncambio-=10;
            }
            else if((ncambio-5) >= 0 && owl_arr_coins_tubes.P5 > m5p){
                m5p++;
                ncambio-=5;
            }
            else if((ncambio-2) >= 0 && owl_arr_coins_tubes.P2 > m2p){
                m2p++;
                ncambio-=2;
            }
            else if((ncambio-1) >= 0 && owl_arr_coins_tubes.P1 > m1p){
                m1p++;
                ncambio-=1;
            }
            else if((ncambio-.5) >= 0 && owl_arr_coins_tubes.G50 > m50c){
                m50c++;
                ncambio-=.5;
            }

            //RESATABLECE EL CONTADOR SI EL CAMBIO NO SE HA COMPLETADO
            /*if(i == 19 && ncambio > 0){
                i=0;
            }*/
        }
        if(ncambio != 0 ){
            respuestaL=2;
        }

    }
    else{
        respuestaL=0;
        //El cambio esta en cero, no se devuelve nada.
    }
    if(owl_price > totalMonedasTubos){  
        addLog("log","El cambio es mas de lo que tiene el monedero");
        respuestaL=1;
    }
    addLog("log",respuestaL);
    if(respuestaL == 0){
        //  El cambio esta en cero, no se devuelve nada
        //billetesAceptados(false);
    }else if(respuestaL == 1){
        // no tiene para dispensar esta cantidad
        billetesAceptados(false);
    }else if(respuestaL == 2){
        // no se hizo el calculo para llevar el cambio a 0, se deduce que no existe cambio suficiente
        billetesAceptados(false);
    }
    else if(respuestaL == 3){
        // esto es lo bueno
        bills="";
        auxCam=auxForLessOp(20);
        if(totalMonedasTubos > 20 && ccv_ext_aux_cambio(20) == 3 && ccv_ext_aux_cambio(auxCam) == 3){
            bills+="20,";
        }
        auxCam=auxForLessOp(50);
        if(totalMonedasTubos > 50 && ccv_ext_aux_cambio(50) == 3 && ccv_ext_aux_cambio(auxCam) == 3){
            bills+="50,";
        }
        auxCam=auxForLessOp(100);
        if(totalMonedasTubos > 100 && ccv_ext_aux_cambio(100) == 3 && ccv_ext_aux_cambio(auxCam) == 3){
            bills+="100,";
        }
        auxCam=auxForLessOp(200);
        if(totalMonedasTubos > 200 && ccv_ext_aux_cambio(200) == 3 && ccv_ext_aux_cambio(auxCam) == 3){
            bills+="200";
        }

        if(bills == ""){
            bills=false;
        }
        addLog("log",bills);
        billetesAceptados(bills);
    }else{
        // Cosas raras pasan si esto se llega a dar
    }
    
}
function auxForLessOp(val){
    val=(parseInt(val));
    auxCam=owl_price-val;
    if(auxCam < 0){
        auxCam=val-owl_price;
    }
    return auxCam;
}

function ccv_ext_aux_cambio($cambioVirtual){
    let respuestaL=3;
    let totalMonedasTubos=
                    (owl_arr_coins_tubes.G50*.5)+
                    (owl_arr_coins_tubes.P1*1)+
                    (owl_arr_coins_tubes.P2*2)+
                    (owl_arr_coins_tubes.P5*5)+
                    (owl_arr_coins_tubes.P10*10);
    let m50c=0; // *se reemplaza por 5p* la configuracion no tendra para devolver de 50c
    let m1p=0;
    let m2p=0;
    let m5p=0;
    let m10p=0;

    let ncambio=$cambioVirtual;
    
    if($cambioVirtual > 0){
        
        for(let i=0;i<20;i++){
            //si el cambio esta en 0 se termina el for 
            if(ncambio == 0){
                break;
            }
            
                //##MONEDAS
            else if((ncambio-10) >= 0 && owl_arr_coins_tubes.P10 > m10p){
                m10p++;
                ncambio-=10;
            }
            else if((ncambio-5) >= 0 && owl_arr_coins_tubes.P5 > m5p){
                m5p++;
                ncambio-=5;
            }
            else if((ncambio-2) >= 0 && owl_arr_coins_tubes.P2 > m2p){
                m2p++;
                ncambio-=2;
            }
            else if((ncambio-1) >= 0 && owl_arr_coins_tubes.P1 > m1p){
                m1p++;
                ncambio-=1;
            }
            else if((ncambio-.5) >= 0 && owl_arr_coins_tubes.G50 > m50c){
                m50c++;
                ncambio-=.5;
            }

            //RESATABLECE EL CONTADOR SI EL CAMBIO NO SE HA COMPLETADO
            /*if(i == 19 && ncambio > 0){
                i=0;
            }*/
        }
        if(ncambio != 0 ){
            respuestaL=2;
        }

    }
    else{
        respuestaL=0;
        //El cambio esta en cero, no se devuelve nada.
    }
    if(owl_price > totalMonedasTubos){  
        respuestaL=1;
    }
    //addLog("log","Cambio entrante = "+$cambioVirtual+". Cambio resultante = "+ncambio+". Respuesta = "+respuestaL);
    return respuestaL;
}


function startActions(){
    setTimeout(function(){deshabilitarMonedero()},200);
    setTimeout(function(){deshabilitarBilletero()},1000);
    

    //setTimeout(function(){deshabilitarNayax()},1500);
}

let timerToSaveMoney = undefined;
function saveCurrentMoneyPaymentPurses(){
    if(owl_arr_bills_recycler.P20 === undefined){
        return;
    }

    if(timerToSaveMoney !== undefined){
        clearTimeout(timerToSaveMoney);
        timerToSaveMoney = undefined;
    }
    timerToSaveMoney = setTimeout(()=>{//owl_arr_coins_tubes es hexadecimal desde linker, owl_arr_bills_recycler ya es decimal desde linker, no necesita reconversion
        addLog("log",owl_arr_bills_recycler,owl_arr_coins_tubes);
        let frm = new FormData();
        frm.append('m50c',owlHexToDec(owl_arr_coins_tubes.C50));
        frm.append('m50cg',owlHexToDec(owl_arr_coins_tubes.G50));
        frm.append('m1p',owlHexToDec(owl_arr_coins_tubes.P1));
        frm.append('m2p',owlHexToDec(owl_arr_coins_tubes.P2));
        frm.append('m5p',owlHexToDec(owl_arr_coins_tubes.P5));
        frm.append('m10p',owlHexToDec(owl_arr_coins_tubes.P10));
        frm.append('b20p',owl_arr_bills_recycler.P20);
        frm.append('b50p',owl_arr_bills_recycler.P50);
        frm.append('b100p',owl_arr_bills_recycler.P100);
        frm.append('b200p',owl_arr_bills_recycler.P200);
        frm.append('b500p',owl_arr_bills_recycler.P500);
        frm.append('b1000p',owl_arr_bills_recycler.P1000);
        frm.append('handler','saveCurrentMoneyPaymentPurses');
        send(frm);
    },1500);
}

