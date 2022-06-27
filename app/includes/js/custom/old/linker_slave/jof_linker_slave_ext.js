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





ccv_slave_jofemar_channel_start_verification_original = 110;

    ccv_slave_jofemar_channel_start_verification = 110;



    ccv_slave_jofemar_channel_stop_verification_original = 189;

    ccv_slave_jofemar_channel_stop_verification = 189;





//	scrow of bill purse: Enable -> 01, Disable -> 00



//	ccv_slave_jofemar_scrow="00";







//	This help to know if the system is in CONTROL page, for do actions just for that place



//	ccv_slave_jofemar_control=true;







// helps to know in which CONTROL PAGE it is, this has to be put before finalizing the body



// and after loading this file



//	ccv_slave_jofemar_control_page=undefined;







// if true, show a message in full screen if the device is not connected



ccv_slave_jofemar_show_no_device=false;







// Maximum allowed amount of pre-credit in nayax



// ccv_slave_jofemar_nayax_max_pre_credit = 0;







// Route where is the image to be shown if the device is not detected



// By default this has a SVG base64 image 



// ccv_slave_jofemar_cod_img = "/src/images/device_not_detected.png";







// time for the interval between the sensing check, default 500ms



ccv_slave_jofemar_sense_interval = 1000;







// time to reload the page once the sensing result is obtained, default 2000ms



// ccv_slave_jofemar_time_to_reload = 2000;







// if it is required to reload the page once the product is delivered, change to true



// cvv_slave_jofemar_reload_when_finish = false;







// this will be loaded if the device is not connected



// ccv_slave_jofemar_code_device = '';







// time for responses to arrive



//  ccv_slave_jofemar_time_response=3000;







function ccvSlaveJofemarExtSoftReload() {



    /** Here you put the variables that you want to clean after that a process that requires "reload" is terminated.



     *



     * Those that are default can be left commented, but if want to change some value just uncomment so as not to



     * modify the other file



     */







    // time for responses



    // ccv_slave_jofemar_time_response=3000;







    // time for engine responses



    //	ccv_slave_jofemar_time_response_engines=15000;







    // time for reconnection



    //	ccv_slave_jofemar_time_reconnect=7000;





    /**

     * this is important to do if you have a machine jofemar

     */

    ccv_slave_jofemar_channel_start_verification_original = 110;

    ccv_slave_jofemar_channel_start_verification = 110;



    ccv_slave_jofemar_channel_stop_verification_original = 189;

    ccv_slave_jofemar_channel_stop_verification = 189;



}







/**



 * All functions from this point down must be customized



 */







// Add some code to be shown in case of device is disconnected

ccv_jofemar_code_device = '<style>.ccv-jofemar-img-transform{transform:scale(1.35)}</style>' +
    '<div id="ccv_jofemar_device_not_detected" class="ccv_jofemar_device_not_detected" style="display: none">' +
        '<div class="d-flex p-0 m-0" style="min-height:80vh">'+
            '<div class="m-0 p-0" style="display:grid;place-items:center;overflow:hidden;">'+
                '<img data-src="' + ccv_jofemar_cod_img_no_detected + '" id="ccv_jofemar_img_machine_one_disconected" alt="' + ccv_jofemar_lang.extension.display.device_disconnected + '" class="lazy ccv-jofemar-h-715px ccv-jofemar-max-h-80vh p-0 m-0 w-100 ccv-jofemar-img-transform" style="display:none">'+
                '<img data-src="' + ccv_jofemar_cod_img_door_open + '" id="ccv_jofemar_img_machine_one_door_open" alt="' + ccv_jofemar_lang.extension.display.device_disconnected + '" class="lazy ccv-jofemar-h-715px ccv-jofemar-max-h-80vh p-0 m-0 w-100 ccv-jofemar-img-transform" style="display:none">'+
                '<img data-src="' + ccv_jofemar_cod_img_door_closed + '" id="ccv_jofemar_img_machine_one_door_closed" alt="' + ccv_jofemar_lang.extension.display.device_disconnected + '" class="lazy ccv-jofemar-h-715px ccv-jofemar-max-h-80vh p-0 m-0 w-100 ccv-jofemar-img-transform">'+
            '</div>'+
            '<div class="m-0 p-0" style="display:grid;place-items:center;overflow-hidden;">'+
                '<img data-src="' + ccv_ext_cod_img_disconnected + '" id="ccv_boardroid_img_disconnected" alt="' + ccv_jofemar_lang.extension.display.device_disconnected + '" class="lazy ccv-jofemar-h-715px ccv-jofemar-max-h-80vh p-0 m-0 w-100 ccv-jofemar-img-transform">'+
                '<img data-src="' + ccv_ext_cod_img_connected + '" id="ccv_boardroid_img_connected" alt="' + ccv_jofemar_lang.extension.display.device_disconnected + '" class="lazy ccv-jofemar-h-715px  ccv-jofemar-max-h-80vh p-0 m-0 w-100 ccv-jofemar-img-transform" style="display:none">'+
            '</div>'+
            '<div class="m-0 p-0" style="display:grid;place-items:center;overflow-hidden;">'+
                '<img data-src="' + ccv_slave_jofemar_cod_img_no_detected + '" id="ccv_slave_jofemar_img_machine_one_disconected" alt="' + ccv_jofemar_lang.extension.display.device_disconnected + '" class="lazy ccv-jofemar-h-715px ccv-jofemar-max-h-80vh p-0 m-0 w-100 ccv-jofemar-img-transform" style="display:none">'+
                '<img data-src="' + ccv_slave_jofemar_cod_img_door_open + '" id="ccv_slave_jofemar_img_machine_one_door_open" alt="' + ccv_jofemar_lang.extension.display.device_disconnected + '" class="lazy ccv-jofemar-h-715px ccv-jofemar-max-h-80vh p-0 m-0 w-100 ccv-jofemar-img-transform" style="display:none">'+
                '<img data-src="' + ccv_slave_jofemar_cod_img_door_closed + '" id="ccv_slave_jofemar_img_machine_one_door_closed" alt="' + ccv_jofemar_lang.extension.display.device_disconnected + '" class="lazy ccv-jofemar-h-715px ccv-jofemar-max-h-80vh p-0 m-0 w-100 ccv-jofemar-img-transform">'+
            '</div>'+
        '</div>'+
    '<div class="ccv-jofemar-w-100" id="notBoarddroid" style="font-size:3rem;color:#fff;text-align:center;display:none">'+
    'Boardroid: No Conectada</div>'+
    '<div class="ccv-jofemar-w-100" id="ccv_jofemar_machine_one_disconected" style="font-size:3rem;color:#fff;text-align:center;display:none">'+
    'Máquina 1: No Conectada</div>'+
    '<div class="ccv-jofemar-w-100" id="ccv_jofemar_machine_slave_disconected" style="font-size:3rem;color:#fff;text-align:center;display:none">'+
    'Máquina 2: No Conectada</div>' +

    '<a href="' + location.toString() + '" class="ccv-jofemar-btn ccv-jofemar-btn-link ccv-jofemar-fixed-bottom">'+
    '<img class="lazy mb-3" style="max-width:80px" data-src="'+ccv_jofemar_img_reload_modal+'" alt="'+ccv_jofemar_lang.extension.display.reload+'">'+
    '</a></div>';


    document.querySelector('body').innerHTML += ccv_jofemar_code_device + ccv_jofemar_modal_active_channels_selection;
$(()=>{
    lazyLoadInstance.update();
})
//document.querySelector('body').innerHTML += ccv_slave_jofemar_code_device;

//if (ccv_slave_jofemar_show_no_device) {}







// Do the connection with chrome app and the device



//window.onload = () => {

    //ccvSlaveJofemarConnect();

//};











// connection lost with the application, generates an irreparable error in the current session,



// the only way to fix it is to reload the page, but if it is done too often the app will be disabled by the browser



function ccvSlaveJofemarExtConnectionLost() {
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
    });*/
    addLog("error",ccv_jofemar_lang.extension.display.connection.lost, {
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

    ccvSlaveJofemarExtNoDeviceConnected('app');
}







// unfinished or unreadable device response



function ccvSlaveJofemarExtCodeDivided(f_code) {



    //consoleWarn(ccv_jofemar_lang.extension.display.code.divided + f_code);
    addLog("warn",ccv_jofemar_lang.extension.display.code.divided + f_code);

}







// Responses from the device (is an object)

let ccv_slave_jofemar_ext_arr_active_channels = [];

function ccvSlaveJofemarExtResponses(response) {

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



        ccv_slave_jofemar_ext_arr_active_channels.push(data);

        if(ccv_slave_jofemar_channel_start_verification === ccv_slave_jofemar_channel_stop_verification){

            ccvJofemarApplyChannelActives(ccv_slave_jofemar_ext_arr_active_channels);

        }

        //console.log(response.additional);
        addLog("log",response.additional);

    }



}







// Money in session, stores all the money that is inserted during a session



function ccvSlaveJofemarExtMoneySession() {



    let f_money = JSON.stringify({"bills": ccv_slave_jofemar_arr_bills, "coins": ccv_slave_jofemar_arr_coins});



    //consoleLog(JSON.parse(f_money))
    addLog("log",JSON.parse(f_money))



}







// Generate a response where it expects the sensing result to arrive, by default the time of the



// interval is 500ms, and it will repeat until the device's response arrives


var countTimeout=0;
function ccvSlaveJofemarExtWaitForProductDown(f_selection, f_id) {
    ccv_slave_jofemar_waiting_for_sense = setInterval(()=> {
        if (ccv_slave_jofemar_status_dispensing === undefined) {
            //console.log("dispensando...");
            addLog("log","dispensando...");
            if (countTimeout==40) {
                countTimeout=0;
                ccv_jofemar_status_dispensing=false;
            }else{
                countTimeout++;
            }
            // ... It does nothing, since if it is undefined it means that the answer has not arrived yet
            // ... It is set to "if" since it could be useful later
        } else if (ccv_slave_jofemar_status_dispensing) {
            //console.log("dispensing: "+ccv_slave_jofemar_status_dispensing);
            addLog("log","dispensing: "+ccv_slave_jofemar_status_dispensing);
            ccvSlaveJofemarCleanSenseProduct();
            $(".proceso-venta").hide();
            $(".process-img").hide();
            $("#PRODUCTOENTREGADO").fadeIn();
            $("#label-inferior").text("Recoja su producto");
            $("#listenCash").fadeIn();
            send(formData("restaStock",uuid_seleccion_db));
            //console.log("regresando cambio");
            addLog("log","regresando cambio");
            setTimeout(function(){owlReadBillPurse()},200);
            //setTimeout(function(){ccv_leerTubos()},2000);
            //console.log("dispensing2: "+ccv_slave_jofemar_status_dispensing);
            addLog("log","dispensing2: "+ccv_slave_jofemar_status_dispensing);
            if (owl_amount_inserted >owl_price) {
                onetime=true;
                executeOneTime=true;
                owl_change=owl_amount_inserted - owl_price;
                setTimeout(function(){ccv_devolverCambioMonedas_V2();},800);
            }
            
            setTimeout(function(){
                normalState();
            },3000);

            // NOTIFY -> pick up your product
            // update stock
            // send(formData("subtractStock",f_selection));
            setTimeout(()=> {
                //location.reload();
                ccvSlaveJofemarReload();
            }, ccv_slave_jofemar_time_to_reload);
        } else if (!ccv_slave_jofemar_status_dispensing) {
            ccvSlaveJofemarCleanSenseProduct();
            $(".proceso-venta").hide();
            $(".process-img").hide();
            $("#PRODUCTONOENTREGADO").fadeIn();
            send(formData("nodispensado",id_movimiento));
            setTimeout(function(){owlReadBillPurse()},200);
            setTimeout(function(){
                owl_change=owl_amount_inserted;
                if (!onetime) {
                    onetime=true;
                    executeOneTime=true;
                    setTimeout(function(){ccv_devolverCambioMonedas_V2();},800);
                }
                
            },300);

            setTimeout(function(){
                normalState();
            },5000);

           setTimeout(function(){normalState();},4000);
            // NOTICE -> product not delivered,
            // update movement status
            //  send(formData("notDispensed",f_id));
            setTimeout(()=> {
                ccvSlaveJofemarReload();
            }, ccv_slave_jofemar_time_to_reload);
        }
    }, ccv_slave_jofemar_sense_interval);
}







// This function is for the dispensing in control, it is for testing, it should not



// mix with the main one since some functions are not in control



function ccvSlaveJofemarExtWaitForProductDownTest(f_selection, f_id) {
    //console.log("esperando caida");
    addLog("log","esperando caida");
    ccv_slave_jofemar_waiting_for_sense=setInterval(function(){
    //ccv_slave_jofemar_status_dispensing
            if(ccv_slave_jofemar_status_dispensing == undefined){

                //	...	No hace nada, ya que si esta indefinida significa que la respuesta no ha llegado aun

                //	...	Se pone en if ya que podria ser util despues

            }else if(ccv_slave_jofemar_status_dispensing){
    ccvSlaveJofemarCleanSenseProduct();
                $(".dispensing-process").hide();

                $("#div-entregado").show();

                ccv_slave_jofemar_status_dispensing=undefined;

                setTimeout(function(){

                    $(".dispensing-process").hide();

                    $("#standby").show();

                    $(".btn-controls").show();

                    $('.modal').modal('hide');

                    $('.modal-backdrop').remove();

                },500);

            }else if(!ccv_slave_jofemar_status_dispensing){
                ccvSlaveJofemarCleanSenseProduct();
                $(".dispensing-process").hide();

                $("#standby").hide();

                $("#div-no-entregado").show();

                ccv_slave_jofemar_status_dispensing=undefined;

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
    ccv_slave_jofemar_waiting_for_sense = setInterval(()=> {



        if (ccv_slave_jofemar_status_dispensing === undefined) {



            // ... It does nothing, since if it is undefined it means that the answer has not arrived yet



            // ... It is set to "if" since it could be useful later



        } else if (ccv_slave_jofemar_status_dispensing) {



            ccvSlaveJofemarCleanSenseProduct();

                $(".dispensing-process").hide();

    

                $("#div-entregado").show();

    

                ccv_slave_jofemar_status_dispensing=undefined;

    

                setTimeout(function(){

    

                    $(".dispensing-process").hide();

    

                    $("#standby").show();

    

                    $(".btn-controls").show();

    

                    $('.modal').modal('hide');

    

                    $('.modal-backdrop').remove();

    

                },500);

        } else if (!ccv_slave_jofemar_status_dispensing) {

            ccvSlaveJofemarCleanSenseProduct();

                $(".dispensing-process").hide();

    

                $("#standby").hide();

    

                $("#div-no-entregado").show();

    

                ccv_slave_jofemar_status_dispensing=undefined;

    

                setTimeout(function(){

    

                    $(".dispensing-process").hide();

    

                    $("#standby").show();

    

                    $(".btn-controls").show();

    

                    

    

                    $('.modal').modal('hide');

    

                    $('.modal-backdrop').remove();

    

                },500);



        }



    }, ccv_slave_jofemar_sense_interval);

*/





}







// when the connection is sended



function ccvSlaveJofemarExtMessageConnection() {
    //consoleLog(ccv_jofemar_lang.extension.display.connection.connecting);
    addLog("log",ccv_jofemar_lang.extension.display.connection.connecting);
}







// when the reconnection is active it shows what is described in the function



function ccvSlaveJofemarExtMessageReconnection() {
    //consoleLog(ccv_jofemar_lang.extension.display.connection.reconnecting);
    addLog("log",ccv_jofemar_lang.extension.display.connection.reconnecting);
}







// The messages of the application are usually errors



function ccvSlaveJofemarExtMessageApplication(f_str) {
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



function ccvSlaveJofemarExtTimeout() {
    //consoleLog(ccv_slave_jofemar_last_error);
    addLog("log",ccv_slave_jofemar_last_error);
}







// if it is detected that the device is not connected



function ccvSlaveJofemarExtNoDeviceConnected(d_image = 'connect') {



    if (ccv_slave_jofemar_show_no_device) {



        let f_device = document.getElementById('ccv_jofemar_device_not_detected');

        let f_machine = document.getElementById('ccv_jofemar_machine_slave_disconected');

        let f_img_disconnected_machine = document.getElementById('ccv_slave_jofemar_img_machine_one_disconected');
        let f_img_door_open_machine = document.getElementById('ccv_slave_jofemar_img_machine_one_door_open');
        let f_img_door_closed_machine = document.getElementById('ccv_slave_jofemar_img_machine_one_door_closed');

        f_img_disconnected_machine.style.display = 'none';
        f_img_door_open_machine.style.display = 'none';
        f_img_door_closed_machine.style.display = 'none';
        if(d_image === 'connect'){
            f_machine.innerText = 'Máquina 2: No Conectada';
            f_img_disconnected_machine.style.display = '';
        }
        if(d_image === 'closed'){
            f_machine.innerText = 'Máquina 2: Puerta Cerrada';
            f_img_door_closed_machine.style.display = '';
        }
        if(d_image === 'open'){
            f_machine.innerText = 'Máquina 2: Puerta Abierta';
            f_img_door_open_machine.style.display = '';
        }
        if(d_image === 'app'){
            f_machine.innerText = 'Aplicación Linker Jof 2 no cargada';
            f_img_disconnected_machine.style.display = '';
        }


        f_device.style.display = '';

        f_machine.style.display = '';



        document.querySelector('body').classList.add('ccv-jofemar-overflow-hidden');



    }



}







// if reconnect to the device



function ccvSlaveJofemarExtDeviceConnected() {

    let f_img_disconnected_machine = document.getElementById('ccv_slave_jofemar_img_machine_one_disconected');
    let f_img_door_open_machine = document.getElementById('ccv_slave_jofemar_img_machine_one_door_open');
    let f_img_door_closed_machine = document.getElementById('ccv_slave_jofemar_img_machine_one_door_closed');

    f_img_disconnected_machine.style.display = 'none';
    f_img_door_open_machine.style.display = 'none';
    f_img_door_closed_machine.style.display = '';
    

    /*if (ccv_slave_jofemar_show_no_device) {



        let f_device = document.getElementById('ccv_jofemar_device_not_detected');

        let f_machine = document.getElementById('ccv_jofemar_machine_slave_disconected');



        f_device.style.display = 'none';

        f_machine.style.display = 'none';



        document.querySelector('body').classList.remove('ccv-jofemar-overflow-hidden');



    }else{*/

        let f_machine_slave = document.getElementById('ccv_jofemar_machine_slave_disconected');

        let f_machine = document.getElementById('ccv_jofemar_machine_one_disconected');

        let f_boardroid = document.getElementById('notBoarddroid');

        let f_device = document.getElementById('ccv_jofemar_device_not_detected');

    
        if(

            (f_machine === null || (f_machine !== null && f_machine.style.display.trim() === 'none')) && 

            (f_boardroid === null || (f_boardroid !== null && f_boardroid.style.display.trim() === 'none'))){

                f_device.style.display = 'none';

                f_machine.style.display = 'none';

                f_boardroid.style.display = 'none';

                document.querySelector('body').classList.remove('ccv-jofemar-overflow-hidden');

        }

        f_machine_slave.style.display = 'none';

    //}



}







// Default Load data



function ccvSlaveJofemarExtDefaultLoad() {



    if (!ccv_slave_jofemar_control) {// User page



        /* Disable coin purse and bill purse, if the page loaded and if one of two does not exist change by other



         * function more appropriate



            # they must be deactivated, because if they were activated would receive money without an active purchase



        */



        ccvSlaveJofemarExtDisableCoinBillPurse();



    } else {// Control page



        let f_disable = false;



        switch (ccv_slave_jofemar_control_page) {



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



            ccvSlaveJofemarReadTubes();



            setTimeout(()=>{ccvSlaveJofemarDisableCoinPurse()}, 300);



        }







    }



}







/* Obtains the percentages of the tubes in relation to the coins that are detected in the



 * tube reading,



 */



function ccvSlaveJofemarExtPercentageTubes(arr) {



    // the indices of arr = 10,5,2,1,50c



    //consoleLog(arr);
    addLog("log",arr);



}











/**



 * This functions commented are useful for coin and bill purse



 * You can use them in your own functions by calling them in your code



 */







// Enable only the coin purse



// ccvSlaveJofemarEnableCoinPurse()







// Disable only the coin purse



// ccvSlaveJofemarDisableCoinPurse()







// Enable only the bill purse



// SCROW -> enable "01" disable "00"



// ccvSlaveJofemarEnableBillPurse(SCROW)







// Disable only the bill purse



// ccvSlaveJofemarDisableBillPurse()











// Enable coin purse and bill purse



function ccvSlaveJofemarEnableCoinBillPurse() {



    ccvSlaveJofemarEnableCoinPurse();



    // a time is set because if they are sent together one of the commands will not work



    // scrow = variable to enable or disable it (if the wallet has it, if not send 00 in scrow)



    setTimeout(()=> {



        ccvSlaveJofemarEnableBillPurse(ccv_slave_jofemar_scrow);



    }, 300);



}







// Disable coin and bill purse



function ccvSlaveJofemarExtDisableCoinBillPurse() {



    ccvSlaveJofemarDisableCoinPurse();



    // a time is set because if they are sent together one of the commands will not work



    setTimeout(()=> {



        ccvSlaveJofemarDisableBillPurse()



    }, 300);



}







function ccvSlaveJofemarExtDisplayCode(code){



    //consoleLog(code);
    addLog("log",code);



}







function ccvSlaveJofemarExtEventMachine(data){



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





let ccv_slave_jofemar_ext_interval_waiting_dispensing = undefined;

function ccvSlaveJofemarWaitForProductDown(){

    ccv_slave_jofemar_ext_interval_waiting_dispensing = setInterval(()=>{



		    



        if(ccv_slave_jofemar_check_matrix_dispensed == undefined){



            //	...	No hace nada, ya que si esta indefinida significa que la respuesta no ha llegado aun



            //	...	Se pone en if ya que podria ser util despues



        }else if(ccv_slave_jofemar_check_matrix_dispensed){



            $(".dispensing-process").hide();



            $("#div-entregado").show();



            ccv_slave_jofemar_check_matrix_dispensed=undefined;

            clearInterval(ccv_slave_jofemar_ext_interval_waiting_dispensing);

            ccv_slave_jofemar_ext_interval_waiting_dispensing = undefined;





            setTimeout(function(){



                $(".dispensing-process").hide();



                $("#standby").show();



                $(".btn-controls").show();



                $('.modal').modal('hide');



                $('.modal-backdrop').remove();



            },500);



        }else if(!ccv_slave_jofemar_check_matrix_dispensed){



            $(".dispensing-process").hide();



            $("#standby").hide();



            $("#div-no-entregado").show();



            ccv_slave_jofemar_check_matrix_dispensed=undefined;

            clearInterval(ccv_slave_jofemar_ext_interval_waiting_dispensing);

            ccv_slave_jofemar_ext_interval_waiting_dispensing = undefined;



            setTimeout(function(){



                $(".dispensing-process").hide();



                $("#standby").show();



                $(".btn-controls").show();



                



                $('.modal').modal('hide');



                $('.modal-backdrop').remove();



            },500);



        }



        



    },1000)

}







/**



 * @uncompleted



 * This function is not completed and makes errors, generating many inserts in the database



 */



//function ccvSlaveJofemarExtSaveLog(strJson){



//    //  strJson has



//    //  "code"



//    //  "message"



//    //  "description"



//    //  "request"



//    //  "no_code"



//    consoleLog(strJson);



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