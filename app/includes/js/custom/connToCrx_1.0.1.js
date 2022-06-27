/*************************************************************************/
/*                  Weblinker creado por Daniel Sandoval                 */
/*              connToCrx_1.x.x.js creado por Daniel Sandoval            */
/*                              aka. danidoble                           */
/*                                                                       */
/*                                                                       */
/*                          ©2020   all rights reserved. owl desarrollos */
/*************************************************************************/

//Id de la aplicación de chrome
var ccv_idApp = "jacpigchgklnboobohdagmgddjfpjfjo";
//si la conexion se pierde el intervalo de reconexion se inicia
var ccv_interval;
//tiempo para que lleguen las respuestas
var ccv_tiempo_respuesta=3000;
//tiempo para la reconexion
var ccv_tiempo_reconectar=7000;
//interval para el sensado de producto
var ccv_waitingForSense;
//Estatus del dispensado
var ccv_estatus_dispensado;
//genera la conexion con la aplicacion (abre un puerto)
var ccv_portApp = chrome.runtime.connect(ccv_idApp, {name: 'application'});      
//almacena el cambio a devolver
var ccv_cambio=0;
//almacena la cantidad de dinero ingresada por sesion
var ccv_monto_ingresado=0;
//almacena el precio de el producto que se esta comprando
var ccv_precio;
//  prueba de motores, empieza en 10 y termina en 89
var ccv_aux_iteranti = 10; 
//Almacena el ultimo error registrado
var ccv_last_error={
    "mensaje":null,
    "handler":null,
    "codigo":null,
    "noCode":666,
};
//almacenara el timeout para realizar una operacion en caso de que la respuesta no regrese en dado tiempo
var ccv_timerToResponse;
//auxiliar para limpiar la variable last error
var ccv_empty_last_error={
    "mensaje":null,
    "handler":null,
    "codigo":null,
    "noCode":666,
};
//array de monedas insertadas en la sesion activa
var ccv_arr_monedas={
    "G50":0,
    "C50":0,
    "P1":0,
    "P2":0,
    "P5":0,
    "P10":0
};
//array de billetes insertados en la sesion activa
var ccv_arr_billetes={
    "P20":0,
    "P50":0,
    "P100":0,
    "P200":0,
    "P500":0,
    "P1000":0,
};

//Array de monedas insertadas, diferenciando a donde se mando (caja/tubos)
var ccv_arr_monedas_V2={
    "tubos":{
        "G50":0,
        "C50":0,
        "P1":0,
        "P2":0,
        "P5":0,
        "P10":0
    },
    "caja":{
        "G50":0,
        "C50":0,
        "P1":0,
        "P2":0,
        "P5":0,
        "P10":0
    },
    "G50":0,
    "C50":0,
    "P1":0,
    "P2":0,
    "P5":0,
    "P10":0,
    "total":0,
};

//Array de billetes insertados, diferenciando a donde se manda (stacker/reciclador)
var ccv_arr_billetes_V2={
    "stacker":{
        "P20":0,
        "P50":0,
        "P100":0,
        "P200":0,
        "P500":0,
        "P1000":0,
    },
    "recycler":{
        "P20":0,
        "P50":0,
        "P100":0,
        "P200":0,
        "P500":0,
        "P1000":0,
    },
    "P20":0,
    "P50":0,
    "P100":0,
    "P200":0,
    "P500":0,
    "P1000":0,
    "total":0,
}

//array de billetes en el stacker, para llenarlo se debe ejecutar la funcion correspondiente
var ccv_arr_billetes_stacker={
    "P20":0,
    "P50":0,
    "P100":0,
    "P200":0,
    "P500":0,
    "P1000":0,
}
//array de monedas en los tubos, para llenarlo se debe ejecutar la funcion correspondiente
var ccv_arr_monedas_tubos={
    "C50":0,
    "G50":0,
    "P1":0,
    "P2":0,
    "P5":0,
    "P10":0
};

var ccv_arr_billetes_expulsados={
        "b20":0,
        "b50":0
    }
var ccv_temperatureLogArr=[];

/*************************************************/
/**                                             **/
/*************************************************/
//si el puerto se desconecta o si la aplicacion tiene error, tambien ocurre si la aplicación se esta reiniciando y la pagina ya cargo.
ccv_portApp.onDisconnect.addListener(obj => {
    ccv_last_error["mensaje"]="La conexión con la aplicacion se perdió";
    ccv_last_error["handler"]=null;
    ccv_last_error["codigo"]=null;
    ccv_last_error["noCode"]=667;
    
    if(chrome.runtime.lastError){addLog("log",chrome.runtime.lastError);}    
    /*    let arrToLog={
        "codigo":codigoHex,
        "mensaje":messageToShow,
        "descripcion":descriptionToShow,
        "solicitud":solicitudToShow,
        "noCode":codeToShow
    };
    */
    
    ccv_ext_conexionPerdida();
});

//Cuando la aplicacion responde algo este listener obtiene los datos
ccv_portApp.onMessage.addListener(function(ccv_msg) {
    //la respuesta esta en formato JSON asi que se transforma en un objeto para mejor manejo
    ccv_unparse=ccv_jsonToObject(ccv_msg.msjBD);
    //si el codigo es 0 = mensaje de la aplicacion
    //si el codigo es un array de 14 posiciones = mensaje de la boardroid
    //se llama a una funcion para cada codigo de respuesta para procesar las respuestas y asignar los resultados
    if(ccv_unparse.codigo == 0){
        
        ccv_proccessMessage(ccv_unparse);
    }else if(ccv_unparse.codigo && ccv_unparse.codigo.length == 14){
        //DETENIENDO LA REPETICION EN CASO DE QUE LA RECONEXION ESTE EN PROCESO
        if(ccv_interval != undefined){
            clearInterval(ccv_interval); 
            ccv_interval = undefined;    
        }
        ccv_proccessData(ccv_unparse);
    }else{
        ccv_ext_codigoDividido();
    }
    //addLog("log",ccv_unparse);
});

//convierte JSON a un objeto
function ccv_jsonToObject(ccv_jsonEncoded){
    var arr=JSON.parse(ccv_jsonEncoded);
    return arr;
}

//procesa el codigo que llego de la boarddroid e identifica que significa
function ccv_proccessData(unparse){

    clearTimeout(ccv_timerToResponse);
    ccv_timerToResponse=undefined;
    let codigoHex=unparse.codigo;
    let messageToShow;
    let descriptionToShow;
    let solicitudToShow;
    let codeToShow;
    
    let msjs1;
    let msjs2;
    addLog("log",codigoHex);

    switch(codigoHex[1].toString().toUpperCase()){
        case "6":
            conBoarddroid();
            //Hardware conectado
            messageToShow="Conexion con la BoardDroid completa";
            descriptionToShow="Tu conexion se realizó con exito.";
            solicitudToShow="conectar";
            codeToShow=200;
            addLog("log",messageToShow);

            startActions();
            
        break;

        case "A0":
            //Moneda insertada
            solicitudToShow="insertarMoneda";
            msjs="Moneda insertada";
            tubo=" tubo";
            caja=" caja de ganancias";
            let moneda="0";
            dondeFue="";
            
            switch(codigoHex[2].toString()){
                //PALANCA DE RECHAZO
                case "1":
                    messageToShow="Palanca de rechazo";
                    descriptionToShow="La palanca de rechazo fue activada";
                    codeToShow=210;
                break;
                //REINICIO DE MONEDERO
                case "2":
                    messageToShow="Reinicio de monedero";
                    descriptionToShow="La configuración del monedero fue reiniciada";
                    codeToShow=211;
                break;
                
                //MONEDA EN CAJA DE GANANCIAS
                case "40":
                    messageToShow=msjs+caja;
                    descriptionToShow="50 centavos (grande)";
                    moneda="G50";
                    codeToShow=212;
                    dondeFue="caja";
                break;
                case "41":
                    messageToShow=msjs+caja;
                    descriptionToShow="50 centavos (chica)";
                    moneda="C50";
                    codeToShow=213;
                    dondeFue="caja";
                break;
                case "42":
                    messageToShow=msjs+caja;
                    descriptionToShow="1 peso";
                    moneda="P1";
                    codeToShow=214;
                    dondeFue="caja";
                break;
                case "43":
                    messageToShow=msjs+caja;
                    descriptionToShow="2 pesos";
                    moneda="P2";
                    codeToShow=215;
                    dondeFue="caja";
                break;
                case "44":
                    messageToShow=msjs+caja;
                    descriptionToShow="5 pesos";
                    moneda="P5";
                    codeToShow=216;
                    dondeFue="caja";
                break;
                case "45":
                    messageToShow=msjs+caja;
                    descriptionToShow="10 pesos";
                    moneda="P10";
                    codeToShow=217;
                    dondeFue="caja";
                break;
                case "46":
                    messageToShow=msjs+caja;
                    descriptionToShow="valor indefinido 46??";
                    codeToShow=218;
                    dondeFue="caja";
                break;
                case "47":
                    messageToShow=msjs+caja;
                    descriptionToShow="valor indefinido 47??";
                    codeToShow=219;
                    dondeFue="caja";
                break;
                    
                //MONEDA EN TUBO
                case "50":
                    messageToShow=msjs+tubo;
                    descriptionToShow="50 centavos (grande)";
                    moneda="G50";
                    codeToShow=220;
                    dondeFue="tubo";
                break;
                case "51":
                    messageToShow=msjs+tubo;
                    descriptionToShow="50 centavos (chica)";
                    moneda="C50";
                    codeToShow=221;
                    dondeFue="tubo";
                break;
                case "52":
                    messageToShow=msjs+tubo;
                    descriptionToShow="1 peso";
                    moneda="P1";
                    codeToShow=222;
                    dondeFue="tubo";
                break;
                case "53":
                    messageToShow=msjs+tubo;
                    descriptionToShow="2 pesos";
                    moneda="P2";
                    codeToShow=223;
                    dondeFue="tubo";
                break;
                case "54":
                    messageToShow=msjs+tubo;
                    descriptionToShow="5 pesos";
                    moneda="P5";
                    codeToShow=224;
                    dondeFue="tubo";
                break;
                case "55":
                    messageToShow=msjs+tubo;
                    descriptionToShow="10 pesos";
                    moneda="P10";
                    codeToShow=225;
                    dondeFue="tubo";
                break;
                case "56":
                    messageToShow=msjs+tubo;
                    descriptionToShow="valor indefinido 56??";
                    codeToShow=226;
                    dondeFue="tubo";
                break;
                case "57":
                    messageToShow=msjs+tubo;
                    descriptionToShow="valor indefinido 57??";
                    codeToShow=227;
                    dondeFue="tubo";
                break;
                
                default:
                    messageToShow=msjs;
                    descriptionToShow="Estatus desconocido. Sin informacion de la moneda";
                    codeToShow=228;
                break;       
            }
            ccv_contarDinero(moneda,dondeFue);
        break;

        case "B0":
            //Billete insertado
            
            solicitudToShow="insertarBillete";
            
            let billete="0";
            let valor;
            let insertado="Billete en pre stacker";
            let rechazado="Billete rechazado";
            let aceptado="Billete aceptado";
            let Bstacker="Billete insertado en el stacker";
            let Breclycler="Billete insertado en el reciclador";
            let mkl;
            

            let bills={
                "b20":"20 pesos",
                "b50":"50 pesos",
                "b100":"100 pesos",
                "b200":"200 pesos",
                "b500":"500 pesos",
                "b1000":"1000 pesos"
            };
            dondeFue="";
            //Billete insertado
            
            switch(codigoHex[2].toString()){
                //BILLETES ACEPTADOS  (80 - 87)
                //BILLETE INSERTADO EN EL STACKER
                case "80"://20 pesos
                    valor=bills["b20"];
                    mkl=Bstacker;
                    billete="P20";
                    codeToShow=229;
                    dondeFue="stacker";
                break;    
                case "81"://50 pesos
                    valor=bills["b50"];
                    mkl=Bstacker;
                    billete="P50";
                    codeToShow=230;
                    dondeFue="stacker";
                break;
                case "82"://100 pesos
                    valor=bills["b100"];
                    mkl=Bstacker;
                    billete="P100";
                    codeToShow=231;
                    dondeFue="stacker";
                break;
                case "83"://200 pesos
                    valor=bills["b200"];
                    mkl=Bstacker;
                    billete="P200";
                    codeToShow=232;
                    dondeFue="stacker";
                break;
                case "84"://500 pesos
                    valor=bills["b500"];
                    mkl=Bstacker;
                    billete="P500";
                    codeToShow=233;
                    dondeFue="stacker";
                break;
                case "85"://?? pesos
                    valor="Valor desconocido 85";
                    mkl=Bstacker;
                    codeToShow=234;
                    dondeFue="stacker";
                break;
                case "86"://?? pesos
                    valor="Valor desconocido 86";
                    mkl=Bstacker;
                    codeToShow=235;
                    dondeFue="stacker";
                break;
                case "87"://?? pesos
                    valor="Valor desconocido 87";
                    mkl=Bstacker;
                    codeToShow=236;
                    dondeFue="stacker";
                break;
                
                    
                //BILLETES INSERTADOS EN PRE STAKER
                case "90"://20 pesos
                    valor=bills["b20"];
                    mkl=insertado;
                    codeToShow=237;
                break;
                case "91"://50 pesos
                    valor=bills["b50"];
                    mkl=insertado;
                    codeToShow=238;
                break;
                case "92"://100 pesos
                    valor=bills["b100"];
                    mkl=insertado;
                    codeToShow=239;
                break;
                case "93"://200 pesos
                    valor=bills["b200"];
                    mkl=insertado;
                    codeToShow=240;
                break;
                case "94"://500 pesos
                    valor=bills["b500"];
                    mkl=insertado;
                    codeToShow=241;
                break;
                case "95"://?? pesos
                    valor="VALOR DESCONOCIDO 95";
                    mkl=insertado;
                    codeToShow=242;
                break;
                case "96"://?? pesos
                    valor="VALOR DESCONOCIDO 96";
                    mkl=insertado;
                    codeToShow=243;
                break;
                case "97"://?? pesos
                    valor="VALOR DESCONOCIDO 97";
                    mkl=insertado;
                    codeToShow=244;
                break;
                    
                    
                //BILLETES RECHAZADOS (EXPULSADO)
                case "a0"://20 pesos
                    valor=bills["b20"];
                    mkl=rechazado;
                    codeToShow=245;
                break;
                case "a1"://50 pesos
                    valor=bills["b50"];
                    mkl=rechazado;
                    codeToShow=246;
                break;
                case "a2"://100 pesos
                    valor=bills["b100"];
                    mkl=rechazado;
                    codeToShow=247;
                break;
                case "a3"://200 pesos
                    valor=bills["b200"];
                    mkl=rechazado;
                    codeToShow=248;
                break;
                case "a4"://500 pesos
                    valor=bills["b500"];
                    mkl=rechazado;
                    codeToShow=249;
                break;
                case "a5"://?? pesos
                    valor="valor desconocido a5";
                    mkl=rechazado;
                    codeToShow=250;
                break;
                case "a6"://?? pesos
                    valor="valor desconocido a6";
                    mkl=rechazado;
                    codeToShow=251;
                break;
                case "a7"://?? pesos
                    valor="valor desconocido a7";
                    mkl=rechazado;
                    codeToShow=252;
                break;
                
                //BILLETE INSERTADO EN EL RECICLADOR.
                case "b0"://20 pesos
                    valor=bills["b20"];
                    mkl=Breclycler;
                    billete="P20";
                    codeToShow=253;
                    dondeFue="recycler";
                break;
                case "b1"://50 pesos
                    valor=bills["b50"];
                    mkl=Breclycler;
                    billete="P50";
                    codeToShow=254;
                    dondeFue="recycler";
                break;
                case "b2"://100 pesos
                    valor=bills["b100"];
                    mkl=Breclycler;
                    billete="P100";
                    codeToShow=255;
                    dondeFue="recycler";
                break;
                case "b3"://200 pesos
                    valor=bills["b200"];
                    mkl=Breclycler;
                    billete="P200";
                    codeToShow=256;
                    dondeFue="recycler";
                break;
                case "b4"://500 pesos
                    valor=bills["b500"];
                    mkl=Breclycler;
                    billete="P500";
                    codeToShow=257;
                    dondeFue="recycler";
                break;
                case "b5"://?? pesos
                    valor="valor desconocido a5";
                    mkl=Breclycler;
                    codeToShow=258;
                    dondeFue="recycler";
                break;
                case "b6"://?? pesos
                    valor="valor desconocido a6";
                    mkl=Breclycler;
                    codeToShow=259;
                    dondeFue="recycler";
                break;
                case "b7"://?? pesos
                    valor="valor desconocido a7";
                    mkl=Breclycler;
                    codeToShow=260;
                    dondeFue="recycler";
                break;

                //BILLETE RETIRADO DE RECICLADOR.
                case "2a"://20 pesos
                    addLog("log","billete en espera de ser retirado");
                break;
               
            }
            messageToShow=mkl;
            descriptionToShow=valor;
            ccv_contarDinero(billete,dondeFue);
        break;

        case "D0":
            //Estatus de la habilitación del monedero
            solicitudToShow="ConfigurarMonedero";
            
            
            msjs1="";
            msjs2="";
            switch(codigoHex[2].toString()){
                case "1":
                    msjs1="Monedero habilitado";
                    msjs2="Configuración completa";
                    codeToShow=261;
                break;
                case "0":
                    msjs1="Monedero deshabilitado";
                    msjs2="Deshabilitado por sistema";
                    codeToShow=262;
                break;
                default:
                    msjs1="Estatus desconocido"; 
                    msjs2="La respuesta del monedero no se identificó correctamente"; 
                    codeToShow=263;
                break;
                
            }
            messageToShow=msjs1;
            descriptionToShow=msjs2;

        break;

        case "D1":
            //Estatus de la habilitación del billetero
            solicitudToShow="ConfigurarBilletero";
            
            
            let estatusPreScroll;
            
            switch(codigoHex[2].toString()){
                case "0":
                    //pre scroll deshabilitado
                    estatusPreScroll="Configuración pre scroll deshabilitada billete entra directo";
                    codeToShow=265;
                break;
                case "1":
                    //pre scroll deshabilitado
                    estatusPreScroll="Configuración pre scroll habilitada";
                    codeToShow=266;
                break;
            }
            switch(codigoHex[3].toString()){
                case "0":
                    msjs1="Billetero deshabilitado";
                break;
                case "1":
                    msjs1="Billetero habilitado";
                break;
            }
            if(codigoHex[3].toString() == "0"){
                estatusPreScroll="";
                codeToShow=264;
            }
            messageToShow=msjs1;
            descriptionToShow=estatusPreScroll;
        break;

        case "D2":
            //Envio del resultado de la lectura de la cantidad de monedas en los tubos del monedero
            solicitudToShow="leerTubos";
            codeToShow=267;
            c50c=codigoHex[3];
            c50g=codigoHex[2];
            p1=codigoHex[4];
            p2=codigoHex[5];
            p5=codigoHex[6];
            p10=codigoHex[7];
            ccv_arr_monedas_tubos["C50"]=ccv_HexToDec(c50c);
            ccv_arr_monedas_tubos["G50"]=ccv_HexToDec(c50g);
            ccv_arr_monedas_tubos["P1"]=ccv_HexToDec(p1);
            ccv_arr_monedas_tubos["P2"]=ccv_HexToDec(p2);
            ccv_arr_monedas_tubos["P5"]=ccv_HexToDec(p5);
            ccv_arr_monedas_tubos["P10"]=ccv_HexToDec(p10);
            messageToShow="Leer tubos";
            descriptionToShow="Cantidad de monedas aproximadas";
        break;

        case "D3":
            //Envio del resultado de la lectura de la cantidad de billetes en el reciclador
            solicitudToShow="leerBilletes";
            codeToShow=268;
            b20=codigoHex[2];
            b50=codigoHex[3];
            b100=codigoHex[4];
            b200=codigoHex[5];
            b500=codigoHex[6];
            b1000=codigoHex[7];
            ccv_arr_billetes_stacker["P20"]=b20;
            ccv_arr_billetes_stacker["P50"]=b50;
            ccv_arr_billetes_stacker["P100"]=b100;
            ccv_arr_billetes_stacker["P200"]=b200;
            ccv_arr_billetes_stacker["P500"]=b500;
            ccv_arr_billetes_stacker["P1000"]=b1000;
            messageToShow="Cantidad de billetes";
            descriptionToShow="Cantidad de billetes aproximadas: 20 pesos = "+b20+" billetes. 50 pesos = "+b50+" billetes. 100 pesos = "+b100+" billetes. 200 pesos = "+b200+" billetes. 500 pesos "+b500+" billetes. 1000 pesos "+b1000+" billetes.";
            addLog("log",ccv_arr_billetes_stacker);
        break;

        case "D4":
            //Estatus de la instrucción Escrow, Se ingreso o se rechazo el billete
            solicitudToShow="estatusBillete";
            
            let estatusBillete;
            switch(codigoHex[2].toString()){
                case "1":
                    estatusBillete="Billete aceptado";
                    codeToShow=269;
                break;
                case "0":
                    estatusBillete="Billete rechazado";
                    codeToShow=270;
                break;
                default:
                    estatusBillete="Estatus del billete desconocido"
                    codeToShow=271;
                break;
            }
            messageToShow=estatusBillete;
            descriptionToShow="";
        break;

        case "D5":
            //Estatus de la tarea Payout, indica el numero de billetes que se dispensaron
            solicitudToShow="estatusBilletesDispensados";
            codeToShow=272;
            
            b20cc=parseInt(codigoHex[2],16);//20
            b50cc=parseInt(codigoHex[3],16);//50
            b100cc=parseInt(codigoHex[4],16);//100
            b200cc=parseInt(codigoHex[5],16);//200
            b500cc=parseInt(codigoHex[6],16);//500
            b1000cc=parseInt(codigoHex[7],16);//1000
            
            spli=(b20cc*20)+(b50cc*50)+(b100cc*100)+(b200cc*200)+(b500cc*500)+(b1000cc*1000);
            msjs1="Se dispensaron "+spli+" pesos";    
            msjs2="Cantidad aprox. $20x"+b20cc+". $50x"+b50cc+". $100x"+b100cc+". $200x"+b200cc+". $500x"+b500cc+". $1000x"+b1000cc;    
            if(spli == 0){
                msjs1="No se dispenso dinero";
                msjs2="Es probable que el billetero este vacio";
                codeToShow=273;
            }
            messageToShow=msjs1;
            descriptionToShow=msjs2;


        break;

        case "D6":
            //Estatus de la tarea CoinOut, indica el número de monedas que se dispensaron
            solicitudToShow="monedasDispensadas";
            codeToShow=274;
            messageToShow="Monedas dispensadas";
            descriptionToShow="";
            
        break;

        case "D7":
            //Reporta el estatus a la accion de mover un motor, si el producto fue o no entregado
            solicitudToShow="estatusEntregaProducto";
            
            
            let estatusEntrega;
            switch(codigoHex[5].toString()){
                case "1":
                    estatusEntrega="Producto no entregado";
                    msjs2="No se entrego el producto solicitado";
                    codeToShow=275;
                    ccv_estatus_dispensado=false;
                break;
                case "0":
                    estatusEntrega="Producto entregado";
                    msjs2="El producto solicitado ("+parseInt(codigoHex[2],16)+") fue entregado correctamente";
                    codeToShow=276;
                    ccv_estatus_dispensado=true;
                break;
                default:
                    estatusEntrega="Estatus desconocido";
                    msjs2="Error";
                    codeToShow=277;
                    ccv_estatus_dispensado=false;
                break;
            }
            messageToShow=estatusEntrega;
            descriptionToShow=msjs2;

        break;

        case "D8":
            //Puerta el estatus de la puerta si esta abierta o cerrada
            solicitudToShow="estatusPuerta";
            codeToShow=211;
            
            let estatus="";
            switch(codigoHex[13]){
                case "db":
                    estatus="Puerta cerrada";
                    codeToShow=278;
                break;
                case "dc":
                    estatus="Puerta abierta";
                    codeToShow=279;
                break;
                default:
                    estatus="Estatus desconocido";
                    codeToShow=280;
                break;
            }
            messageToShow=estatus;
            descriptionToShow="";

        break;

        case "D9":
             //Envia la temperatura del sensor conectado
           solicitudToShow="estatusSensor";
            codeToShow=281;
            tempHigh=parseInt(codigoHex[2],16);
            tempLow=parseInt(codigoHex[3],16);
            temperatura=parseFloat(ccv_HexToDec(codigoHex[2]+codigoHex[3])*.10);


            if (codigoHex[3].length==1) {
                codigoHex[3]="0"+codigoHex[3];
                temperatura=parseFloat(ccv_HexToDec(codigoHex[2]+codigoHex[3])*.10);
            }
            
            addLog("log","Estatus de la temperatura");
            descriptionToShow="Temperatura: "+temperatura;
            ccv_temperatureLogArr.push({
                "alta":tempHigh,
                "baja":tempLow,
            });

            // addLog("log","Temperatura: "+parseInt(temperatura));

             //send(formData('templog',parseInt(temperatura)));
             $("#temperatura").text(parseInt(temperatura)+"°C");


            if (parseInt(temperatura)>=20) {
                ccv_relevadorRefrigeracion('01');
            }else if(parseInt(temperatura)<=14){
                ccv_relevadorRefrigeracion('00');
            }
             
             
            
        break;

        case "DA":
            //Respuesta al comando leer o apagar relevador (echo)
            solicitudToShow="estatusRelevador";
            codeToShow=213;
            if(codigoHex[2] == "1"){
                messageToShow="RELEVADOR ENCENDIDO";
                codeToShow=282;
            }else if(codigoHex[2] == "0"){
                messageToShow="RELEVADOR APAGADO";
                codeToShow=283;
            }else{
                messageToShow="Estatus desconocido";
                codeToShow=284;
            }
            
            descriptionToShow="";

        break;

        case "DB":
            //Respuesta al comando de guardar en memoria de billetes
            solicitudToShow="guardarMemoriaBilletes";
            codeToShow=285;
            
            messageToShow="Estatus desconocido";
            descriptionToShow="sin informacion";

        break;

        case "DC":
            //Respuesta al comando leer memoria de billetes
            solicitudToShow="leerMemoriaBilletes";
            codeToShow=295;
            
            messageToShow="Estatus desconocido";
            descriptionToShow="sin informacion";

        break;

        case "DD":
            //Reporta el estatus del lector de tarjetas [Aceptado,rechazada,cancelada o sin Nayax]
            solicitudToShow="estatusLectorTarjetas";
            addLog("log",codigoHex);
            addLog("log",codigoHex[2].toString().toUpperCase());
            switch(codigoHex[2].toString().toUpperCase()){
                case "1":       
                    //NAYAX DESHABILITADO
                    codeToShow=505;
                    messageToShow="Nayax deshabilitado";
                    descriptionToShow="El nayax fue deshabilitado correctamente";
                    shortCode="DESHABILITADO";
                    addLog("log",descriptionToShow);
                break;
                case "2":       
                    //NAYAX HABILITADO
                    codeToShow=506;
                    messageToShow="Nayax habilitado";
                    descriptionToShow="El nayax ahora esta habilitado";
                    shortCode="HABILITADO";
                    addLog("log",descriptionToShow);
                break;
                case "3":       
                    //CREDITO PRE AUTORIZADO
                    codeToShow=507;
                    messageToShow="Credito pre autorizado";
                    descriptionToShow="Se pre autorizó el credito";
                    shortCode="PREAUTORIZADO";
                    addLog("log",descriptionToShow);
                break;
                case "4":       
                    //PETICION DE CANCELACION
                    codeToShow=508;
                    messageToShow="En proceso de cancelación";
                    descriptionToShow="Se generó una petición de cancelación";
                    shortCode="CANCELACION";
                    addLog("log",descriptionToShow);
                break;
                case "5":       
                    //VENTA APROBADA EMPEZANDO EL DISPENADO DEL PRODUCTP
                    codeToShow=509;
                    messageToShow="Venta aprobada";
                    descriptionToShow="Venta aprobada empezando dispensado del producto";
                    shortCode="DISPENSANDO";
                    addLog("log",descriptionToShow);
                    $(".process-img").hide();
                    $("#DISPENSANDO").fadeIn();
                break;
                case "6":       
                    //VENTA DENEGADA
                    codeToShow=510;
                    messageToShow="Venta denegada";
                    descriptionToShow="La venta fue denegada";
                    shortCode="VENTA_NEGADA";
                    addLog("log",descriptionToShow);
                break;
                case "7":       
                    //FIN DE SESION
                    codeToShow=511;
                    messageToShow="Sesión finalizada";
                    descriptionToShow="La sesión finalizó";
                    shortCode="TERMINADO"
                    addLog("log",descriptionToShow);
                break;
                case "8":       
                    //CANCELADO
                    codeToShow=512;
                    messageToShow="Cancelado";
                    descriptionToShow="Cancelación completa";
                    shortCode="CANCELACION_COMPLETA";
                    addLog("log",descriptionToShow);
                break;
                case "A":       
                case "a":       
                    //FIN DE DISPENSADO, STATUS DE DISPENSADO
                    switch(codigoHex[8]){
                       case "1":
                            //NO DISPENSADO
                            codeToShow=513;
                            messageToShow="Producto no dispensado";
                            descriptionToShow="El dispensado del producto pagado con nayax no se completo";
                            addLog("log",descriptionToShow);
                            ccv_estatus_dispensado=false;
                       break;
                       case "0":
                            //PRODUCTO DISPENADO
                            codeToShow=514;
                            messageToShow="Producto dispensado";
                            descriptionToShow="El dispensado del producto finalizó correctamente";
                            addLog("log",descriptionToShow);
                            ccv_estatus_dispensado=true;
                       break;
                       default:
                           codeToShow=515;
                           messageToShow="Estatus del dispensado desconocido";
                           descriptionToShow="No hay más infomación";
                           addLog("log",descriptionToShow);
                           ccv_estatus_dispensado=false;
                       break;    
                    }
                break;
                default:
                    codeToShow=516;
                    messageToShow="Estatus desconocido";
                    descriptionToShow="Estatus del lector de tarjetas no se identificó";
                break;
            }
            

        break;

        default:
            messageToShow="Respuesta no reconocida";
            descriptionToShow="La respuesta de la aplicación se recibió pero no se identificó con ninguno de los paramentros actuales";
            solicitudToShow="indefinido";
            codeToShow=404;
        break;

    }
    
    let arrToLog={
        "codigo":codigoHex,
        "mensaje":messageToShow,
        "descripcion":descriptionToShow,
        "solicitud":solicitudToShow,
        "noCode":codeToShow
    };

    ccv_ext_respuestas(JSON.stringify(arrToLog));
}

//realiza la conexion con la boarddroid
function ccv_conectar(){
    ccv_sendMessage(JSON.stringify('conectar'));
}
//reconexion a la boarddroid si se desconecta
function ccv_reconectar(){
    ccv_ext_mensajeReconexion();
    ccv_conectar();
}
//realiza una desconexion segura y autorizada de la boarddroid
function ccv_desconectar(){
    ccv_sendMessage(JSON.stringify('desconectar'));
}
//Codigo para enviar hexadecimales personalizados a la boarddroid
function ccv_codigoPersonalizado(val,cod){
    //ambos valores (val y cod) deben estar en JSON al momento de enviar ccv_sendMessage();
    var codigo=cod;
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify(val),JSON.stringify(codigo));
}
//Configura el monedero
function ccv_configMonedero(SS,NN,MM){
    //SS => Habilitar o deshabilitar
    //NN => cantidad alta
    //MM => cantidad baja
    var codigo=["F1","C1",SS,NN,MM,"00","00","00","00","00","F2","00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("ConfigurarMonedero"),JSON.stringify(codigo));
}
//leer la cantidad de monedas en los tubos (aprox)
function ccv_leerTubos(){
    var codigo=["F1","C2","00","00","00","00","00","00","00","00","F2","00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("leerTubos"),JSON.stringify(codigo));
}


//leer la cantidad de billetes en dispositivos (aprox)
//F1 C3 00 00 00 00 00 00 00 00 F2 B5
function ccv_leerBilletero(){
    var codigo=["F1","C3","00","00","00","00","00","00","00","00","F2","B5"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("leerTubos"),JSON.stringify(codigo));
}
//Dispensar monedas
function ccv_RetirarMonedas(SS,ZZ,YY,RR,TT){
    //SS => 50 centavos (Grande)
    //ZZ => 1 peso
    //YY => 2 pesos
    //RR => 5 pesos
    //TT => 10 pesos
    var codigo=["F1","C6",SS,ZZ,YY,RR,TT,"00","00","00","F2","00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("RetirarMonedas"),JSON.stringify(codigo));
}
//configurar billetero
function ccv_configBilletero(NN){
    //NN => Habilitar o deshabilitar
    //SS => Pre scroll, habilitar o deshabilitar
    if (NN=="01") {
        var codigo=["F1","C0","FF","FF","00","00","00","00","00","00","F2","B0"];
    }else{
        var codigo=["F1","C0","00","00","00","00","00","00","00","00","F2","B2"];
    }
    
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("ConfigurarBilletero"),JSON.stringify(codigo));
}

//aceptar billete que esta en pre stacker
function ccv_aceptarBillete(){
    var codigo=["F1", "C4", "01", "00", "00", "00", "00", "00", "00", "00", "F2", "00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("AceptarBillete"),JSON.stringify(codigo));
}
//rechazar billete que esta en pre stacker
function ccv_rechazarBillete(){
    var codigo=["F1", "C4", "00", "00", "00", "00", "00", "00", "00", "00", "F2", "00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("RechazarBillete"),JSON.stringify(codigo));
}
//dispensar billetes
//F1 C5 01 05 00 00 00 00 00 00 F2 BD <- Dispensar 5 Billetes de $50
function ccv_RetirarBilletes(ss,zz){
    //SS => tipo de billete
    //ZZ => cantidad
    //0 => 20 pesos
    //1 => 50 pesos
    //2 => 100 pesos
    //3 => 200 pesos
    //4 => 500 pesos
    var codigo=["F1","C5",ss,zz,"00","00","00","00","00","00","F2","B0"];
    addLog("log",codigo);
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("DispensarBilletes"),JSON.stringify(codigo));
}
//leer temperatura
function ccv_leerTemperatura(){
    var codigo=["F1","CB","00","00","00","00","00","00","00","00","F2","00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("leerTemperatura"),JSON.stringify(codigo));
}
//dispensar productos
function ccv_matrizMotores(SS,ZZ,YY){
    //SS => producto 1 a dispensar
    //ZZ => producto 2 a dispensar
    //YY => tiempo o sensor
    var codigo=["F1", "C7", SS, ZZ, YY, "00", "00", "00", "00", "00", "F2", "00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("matrizMotores"),JSON.stringify(codigo));
}
//activar o desactivar relevador de refrigeracion
function ccv_relevadorRefrigeracion(SS){
    //SS => encender / apagar relevador
    var codigo=["F1", "CC", SS, "00", "00", "00", "00", "00", "00", "00", "F2", "00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("relevadorRefrigeracion"),JSON.stringify(codigo));
}
//guardar memoria del billetero (NI IDEA DE QUE HAGA)
function ccv_guardarMemoriaBilletero(SS,RR,TT,NN,MM,YY,UU){
    //SS => Byte channel configuration
    /**
            ## 0x03 => activar
            ## 0x00 => deshabilitar canal
    */
    //RR => Reclycler $20   (0x03 | 0x00)
    //TT => Reclycler $50   (0x03 | 0x00)
    //NN => Reclycler $100  (0x03 | 0x00)
    //MM => Reclycler $200  (0x03 | 0x00)
    //YY => Reclycler $500  (0x03 | 0x00)
    //UU => Reclycler $1000 (0x03 | 0x00)
    var codigo=["F1", "C8", SS, "00", RR, TT, NN, MM, YY, UU, "F2", "00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("guardarMemoriaBilletero"),JSON.stringify(codigo));
}
//leer memoria del billetero
function ccv_leerMemoriaBilletero(){
    var codigo=["F1", "C9", "00", "00", "00","00","00","00","00","00", "F2", "00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("leerMemoriaBilletero"),JSON.stringify(codigo));
}
//nayax habilitar o deshabilitar
function ccv_nayax(SS){
    var codigo=["F1", "CD", SS, "00", "00","00","00","00","00","00", "F2", "00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("nayaxCashless"),JSON.stringify(codigo));
}
//nayax escoger producto o productos (máx. 2)
function ccv_nayaxProductos(RR,TT){
    var codigo=["F1", "CD", "01", RR,TT, "1E","00","00","00","00", "F2", "00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("nayaxCashless"),JSON.stringify(codigo));
}
//habilitar monedero
function ccv_habilitarMonedero(){
    var codigo=["F1","C1","01","00","00","00","00","00","00","00","F2","00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("ConfigurarMonedero"),JSON.stringify(codigo));
}
//deshabilitar monedero
function ccv_deshabilitarMonedero(){
    var codigo=["F1","C1","00","00","00","00","00","00","00","00","F2","00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("ConfigurarMonedero"),JSON.stringify(codigo));
}
//habilitar billetero
function ccv_habilitarBilletero(NN,MM){
    //NN => SCROW BILLETERO
    var codigo=["F1","C0",NN,MM,"00","00","00","00","00","00","F2","B0"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("ConfigurarBilletero"),JSON.stringify(codigo));
}
//deshabilitar billetero
function ccv_deshabilitarBilletero(){
    //NN => SCROW BILLETERO
    var codigo=["F1","C0","00","00","00","00","00","00","00","00","F2","00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("ConfigurarBilletero"),JSON.stringify(codigo));
}
//function dispensar con sensor
function ccv_dispensarConSensor(SS,ZZ){
    //SS => motor 1
    //ZZ => motor 2
    var codigo=["F1", "C7", SS, ZZ, "00", "00", "00", "00", "00", "00", "F2", "00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("matrizMotores"),JSON.stringify(codigo));
}
//function dispensar con tiempo a 3 segundos
function ccv_dispensarConTiempo(SS,ZZ){
    //SS => motor 1
    //ZZ => motor 2
    var codigo=["F1", "C7", SS, ZZ, "1E", "00", "00", "00", "00", "00", "F2", "00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("matrizMotores"),JSON.stringify(codigo));
}
//habilitar relevador de refrigeracion
function ccv_habilitarRelevadorRefrigeracion(){
    var codigo=["F1", "CC", "01", "00", "00", "00", "00", "00", "00", "00", "F2", "00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("relevadorRefrigeracion"),JSON.stringify(codigo));
}
//deshabilitar relevador de refrigeracion
function ccv_deshabilitarRelevadorRefrigeracion(){
    var codigo=["F1", "CC", "00", "00", "00", "00", "00", "00", "00", "00", "F2", "00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("relevadorRefrigeracion"),JSON.stringify(codigo));
}
//Devolver cambio, esta funcion es para cuando el monedero y el billetero estan funcionando
//El billetero debe poder dispensar billetes de lo contrario usar la funcion para devolver cambio solo con monedas
function ccv_devolverCambio(){
    let m50c=0;
    let m1p=0;
    let m2p=0;
    let m5p=0;
    let m10p=0;

    let b20p=0;
    let b50p=0;
    let b100p=0;
    let b200p=0;
    let b500p=0;
    let b1000p=0;

    let ncambio=ccv_cambio;
    if(ccv_cambio > 0){
        
        for(let i=0;i<20;i++){
            //si el cambio esta en 0 se termina el for 
            if(ncambio == 0){
                break;
            }
            
                //##BILLETES
            if((ncambio-1000) >= 0){
                b1000p++;
                ncambio-=1000;
            }
            else if((ncambio-500) >= 0){
                b500p++;
                ncambio-=500;
            }
            else if((ncambio-200) >= 0){
                b200p++;
                ncambio-=200;
            }
            else if((ncambio-100) >= 0){
                b100p++;
                ncambio-=100;
            }
            else if((ncambio-50) >= 0){
                b50p++;
                ncambio-=50;
            }
            else if((ncambio-20) >= 0){
                b20p++;
                ncambio-=20;
            }
                //##MONEDAS
            else if((ncambio-10) >= 0){
                m10p++;
                ncambio-=10;
            }
            else if((ncambio-5) >= 0){
                m5p++;
                ncambio-=5;
            }
            else if((ncambio-2) >= 0){
                m2p++;
                ncambio-=2;
            }
            else if((ncambio-1) >= 0){
                m1p++;
                ncambio-=1;
            }
            else if((ncambio-.5) >= 0){
                m1p++;
                ncambio-=.5;
            }
            //RESATABLECE EL CONTADOR SI EL CAMBIO NO SE HA COMPLETADO
            if(i == 19 && ncambio > 0){
                i=0;
            }
        }
    }
    else{
        //El cambio esta en ceros, no se devuelve nada.
    }
    arrJ=JSON.stringify({
        "monedas":{
            "c50":m50c,
            "p1":m1p,
            "p2":m2p,
            "p5":m5p,
            "p10":m10p
        },
        "billetes":{
            "p20":b20p,
            "p50":b50p,
            "p100":b100p,
            "p200":b200p,
            "p500":b500p,
            "p1000":b1000p
        },
        "cambio":ccv_cambio
    });
    unparsedArrJ=JSON.parse(arrJ);
    
    if(unparsedArrJ.cambio>0){
        //evaluar si billetes seran dispensados
        let dispensarBilletes=false;
        $.each(unparsedArrJ.billetes,function(index,value){
        if(!dispensarBilletes && value>0){
               dispensarBilletes=true;
            }
        });
        //evaluar si monedas seran dispensadas
        let dispensarMonedas=false;
        $.each(unparsedArrJ.monedas,function(index,value){
            if(!dispensarMonedas && value>0){
               dispensarMonedas=true;
            }
        });
        
        addLog("log",unparsedArrJ);
    
        if(dispensarBilletes){
            db20=unparsedArrJ.billetes.p20.toString(16);
            db50=unparsedArrJ.billetes.p50.toString(16);                        
            db100=unparsedArrJ.billetes.p100.toString(16);                        
            db200=unparsedArrJ.billetes.p200.toString(16);                        
            db500=unparsedArrJ.billetes.p500.toString(16);                        
            db1000=unparsedArrJ.billetes.p1000.toString(16);                        

            ccv_RetirarBilletes(db20,db50,db100,db200,db500,db1000);
        }

        if(dispensarMonedas){
            dm50c=unparsedArrJ.monedas.c50.toString(16);
            dm1=unparsedArrJ.monedas.p1.toString(16);                        
            dm2=unparsedArrJ.monedas.p2.toString(16);                        
            dm5=unparsedArrJ.monedas.p5.toString(16);                        
            dm10=unparsedArrJ.monedas.p10.toString(16);                        

            ccv_RetirarMonedas(dm50c,dm1,dm2,dm5,dm10);
        }
        
    }else{
        //No hay cambio que devolver
        
    }
}

//devolver cambio solo con monedero
function ccv_devolverCambioMonedas(){

    let m50c=0;
    let m1p=0;
    let m2p=0;
    let m5p=0;
    let m10p=0;
    let b20p=0;
    let b50p=0;

    let ncambio=ccv_cambio;
    if(ccv_cambio > 0){
        
        for(let i=0;i<20;i++){
            //si el cambio esta en 0 se termina el for 
            if(ncambio == 0){
                break;
            }
                //##BILLETES
            else if((ncambio-50) >= 0){
                b50p++;
                ncambio-=50;
            }
            
                //##MONEDAS
            else if((ncambio-20) >= 0){
                b20p++;
                ncambio-=20;
            }
            else if((ncambio-5) >= 0){
                m5p++;
                ncambio-=5;
            }
            else if((ncambio-2) >= 0){
                m2p++;
                ncambio-=2;
            }
            else if((ncambio-1) >= 0){
                m1p++;
                ncambio-=1;
            }
            else if((ncambio-.5) >= 0){
                m1p++;
                ncambio-=.5;
            }

            //RESATABLECE EL CONTADOR SI EL CAMBIO NO SE HA COMPLETADO
            if(i == 19 && ncambio > 0){
                i=0;
            }
        }

    }
    else{
        //El cambio esta en ceros, no se devuelve nada.
    }
    
    arrJ=JSON.stringify({
        "monedas":{
            "c50":m50c,
            "p1":m1p,
            "p2":m2p,
            "p5":m5p,
            "p10":m10p
        },

        "billetes":{
            "b20":b50,
            "b50":b20
        },
        "cambio":ccv_cambio
    });
    unparsedArrJ=JSON.parse(arrJ);

    if(unparsedArrJ.cambio>0){
        //  ccv_arr_monedas_tubos
        //  Si no se tiene suficiente efectivo para devolver el cambio, no lo hará
        /*totalTubos=(ccv_arr_monedas_tubos["G50"]*.50)+(ccv_arr_monedas_tubos["C50"]*.50);
        totalTubos+=ccv_arr_monedas_tubos["P1"]*1;
        totalTubos+=ccv_arr_monedas_tubos["P2"]*2;
        totalTubos+=ccv_arr_monedas_tubos["P5"]*5;
        totalTubos+=ccv_arr_monedas_tubos["P10"]*10;
        if(totalTubos < ccv_cambio){
            return false;
        }
        //si no tiene un cambio optimo para la entrega
        if(
            (m50c   > ccv_arr_monedas_tubos["G50"]  )   ||
            (m1p    > ccv_arr_monedas_tubos["P1"]   )   ||
            (m2p    > ccv_arr_monedas_tubos["P2"]   )   ||
            (m5p    > ccv_arr_monedas_tubos["P5"]   )   ||
            (m10p   > ccv_arr_monedas_tubos["P10"]  )
        ){
            return false;
        }*/

        //evaluar si monedas seran dispensadas
        let dispensarMonedas=false;
        $.each(unparsedArrJ.monedas,function(index,value){
            if(!dispensarMonedas && value>0){
               dispensarMonedas=true;
            }
        });
        
        addLog("log",unparsedArrJ);

        if(dispensarMonedas){
            
            dm50c=unparsedArrJ.monedas.c50.toString(16);
            dm1=unparsedArrJ.monedas.p1.toString(16);                        
            dm2=unparsedArrJ.monedas.p2.toString(16);                        
            dm5=unparsedArrJ.monedas.p5.toString(16);                        
            dm10=unparsedArrJ.monedas.p10.toString(16); 
            dm20=unparsedArrJ.billetes.b20.toString(16);  
            dm50=unparsedArrJ.billetes.b50.toString(16);                        
            var type="00";
            var qant="00";
            if (dm20>0) {
                type="01";
                qant=unparsedArrJ.billetes.b20.toString(16);
            }

            if (dm50>0) {
                type="02";
                qant=unparsedArrJ.billetes.b50.toString(16);
            }
            ccv_RetirarMonedas(dm50c,dm1,dm2,dm5,dm10);

            ccv_RetirarBilletes(type,qant);
        }
        
    }else{
        //No hay cambio que devolver
        
    }
}

//devolver cambio solo con billetero
function ccv_devolverCambioBilletes(){
    let b20p=0;
    let b50p=0;
    let b100p=0;
    let b200p=0;
    let b500p=0;
    let b1000p=0;

    let ncambio=ccv_cambio;
    let error={"cambio":false,"faltante":0};
    if(ccv_cambio > 0){
        
        for(let i=0;i<20;i++){
            //si el cambio esta en 0 se termina el for 
            if(ncambio == 0){
                break;
            }else if(ncambio < 20){
                error["cambio"]=true;
                error["faltante"]=ncambio;
                break;         
            }
            
                //##BILLETES
            if((ncambio-1000) >= 0){
                b1000p++;
                ncambio-=1000;
            }
            else if((ncambio-500) >= 0){
                b500p++;
                ncambio-=500;
            }
            else if((ncambio-200) >= 0){
                b200p++;
                ncambio-=200;
            }
            else if((ncambio-100) >= 0){
                b100p++;
                ncambio-=100;
            }
            else if((ncambio-50) >= 0){
                b50p++;
                ncambio-=50;
            }
            else if((ncambio-20) >= 0){
                b20p++;
                ncambio-=20;
            }

            //RESATABLECE EL CONTADOR SI EL CAMBIO NO SE HA COMPLETADO
            if(i == 19 && ncambio > 0){
                i=0;
            }
        }

    }
    else{
        //El cambio esta en ceros, no se devuelve nada.
    }
    if(error.cambio){
        addLog("log","El cambio no se entrego completo, falto por entregar "+error.faltante+" pesos");
    }
    arrJ=JSON.stringify({
        "billetes":{
            "p20":b20p,
            "p50":b50p,
            "p100":b100p,
            "p200":b200p,
            "p500":b500p,
            "p1000":b1000p
        },
        "cambio":ccv_cambio,
        "error":error,
    });
    unparsedArrJ=JSON.parse(arrJ);
    
    if(unparsedArrJ.cambio>0){
        //evaluar si billetes seran dispensados
        let dispensarBilletes=false;
        $.each(unparsedArrJ.billetes,function(index,value){
        if(!dispensarBilletes && value>0){
               dispensarBilletes=true;
            }
        });
        
        addLog("log",unparsedArrJ);
    
        if(dispensarBilletes){
            db20=unparsedArrJ.billetes.p20.toString(16);
            db50=unparsedArrJ.billetes.p50.toString(16);                        
            db100=unparsedArrJ.billetes.p100.toString(16);                        
            db200=unparsedArrJ.billetes.p200.toString(16);                        
            db500=unparsedArrJ.billetes.p500.toString(16);                        
            db1000=unparsedArrJ.billetes.p1000.toString(16);                        

            ccv_RetirarBilletes(db20,db50,db100,db200,db500,db1000);
        }
        
    }else{
        //No hay cambio que devolver
        
    }
}

//nayax cashless
function ccv_nayaxCashless(SS,RR,TT,KK,NN){
    //SS => Habilitar o deshabilitar nayax
    //RR => Producto 1
    //TT => Producto 2
    //KK => Tiempo o sensor
    //NN => Monto a Cobrar
    //MM => Amount low part
    if (NN!=undefined) {
        NN=parseInt(NN)*10;
        NN=ccv_DecToHex(NN);

        var long=NN.length;
        var ceros="";
        if (long<4) {
            var fin=4-parseInt(long);
            for(var i=0;i<fin;i++){
                ceros+="0";
            }
        }
       
        NN=ceros+NN;
        MM=NN.charAt(2)+""+NN.charAt(3);
        NN=NN.charAt(0)+""+NN.charAt(1);

    }
    var codigo=["F1", "CD", SS, ccv_DecToHex(RR), "00",KK,NN,MM,"00","00", "F2", "00"];
    codigo[11]=ccv_sumaHex(codigo);
    codigo=ccv_add0x(codigo);
    ccv_sendMessage(JSON.stringify("nayaxCashless"),JSON.stringify(codigo));
}

/***************************************************/
/*                                                 */
/*                FUNCIONES AUXILIARES             */
/*                                                 */
/***************************************************/

//Genera la suma de hexadecimales y regresa el valor en hexadecimal
function ccv_sumaHex(arr){
    //arr[1]+arr[2]+arr[3]+arr[4]+arr[5]+arr[6]+arr[7]+arr[8]+arr[9]+arr[10]
    let sum=0;
    $.each(arr,function(index,value){
        if(index !=0 && index != 11){
            sum+=parseInt(value,16);
        }
    });
    return sum.toString(16);
}

//Aagrega 0x antes de cada valor en un array. | 00 => 0x00
function ccv_add0x(cod){
    let codigo=[];
    $.each(cod,function(index,value){
        codigo[index]="0x"+value;
    });
    return codigo;
}

//Envia mensajes a la aplicación
function ccv_sendMessage(instruccion,cod){
    if(cod==undefined){cod=JSON.stringify("");}
    ccv_portApp.postMessage({toDo: instruccion,codigo: cod});
    
    //Empieza un conteo de 3 segundos, donde si la respuesta no se presenta se activará la función
    ccv_timerToResponse=setTimeout(function(){ccv_timerNoResponse(cod,instruccion);},ccv_tiempo_respuesta);
}

//cuenta el dinero que se ingresa al monedero y al billetero por sesion
function ccv_contarDinero(dinero,where){
    switch(dinero.toUpperCase()){
        //monedas
        case "G50":
            if(where == "tubo"){
                ccv_arr_monedas_V2.tubos.G50+=1;
            }else{
                ccv_arr_monedas_V2.caja.G50+=1;
            }
            ccv_arr_monedas_V2.G50+=1;
            ccv_arr_monedas["G50"]+=1;
            ccv_monto_ingresado+=.5;
        break;
        case "C50":
            if(where == "tubo"){
                ccv_arr_monedas_V2.tubos.C50+=1;
            }else{
                ccv_arr_monedas_V2.caja.C50+=1;
            }
            ccv_arr_monedas_V2.C50+=1;
            ccv_arr_monedas["C50"]+=1;
            ccv_monto_ingresado+=.5;
        break;
        case "P1":
            if(where == "tubo"){
                ccv_arr_monedas_V2.tubos.P1+=1;
            }else{
                ccv_arr_monedas_V2.caja.P1+=1;
            }
            ccv_arr_monedas_V2.P1+=1;
            ccv_arr_monedas["P1"]+=1;
            ccv_monto_ingresado+=1;
        break;
        case "P2":
            if(where == "tubo"){
                ccv_arr_monedas_V2.tubos.P2+=1;
            }else{
                ccv_arr_monedas_V2.caja.P2+=1;
            }
            ccv_arr_monedas_V2.P2+=1;
            ccv_arr_monedas["P2"]+=1;
            ccv_monto_ingresado+=2;
        break;
        case "P5":
            if(where == "tubo"){
                ccv_arr_monedas_V2.tubos.P5+=1;
            }else{
                ccv_arr_monedas_V2.caja.P5+=1;
            }
            ccv_arr_monedas_V2.P5+=1;
            ccv_arr_monedas["P5"]+=1;
            ccv_monto_ingresado+=5;
        break;
        case "P10":
            if(where == "tubo"){
                ccv_arr_monedas_V2.tubos.P10+=1;
            }else{
                ccv_arr_monedas_V2.caja.P10+=1;
            }
            ccv_arr_monedas_V2.P10+=1;
            ccv_arr_monedas["P10"]+=1;
            ccv_monto_ingresado+=10;
        break;
        //billetes
        case "P20":
            if(where == "stacker"){
                ccv_arr_billetes_V2.stacker.P20+=1;
            }else{
                ccv_arr_billetes_V2.recycler.P20+=1;
            }
            ccv_arr_billetes_V2.P20+=1;
            ccv_arr_billetes["P20"]+=1;
            ccv_monto_ingresado+=20;
        break;
        case "P50":
            if(where == "stacker"){
                ccv_arr_billetes_V2.stacker.P50+=1;
            }else{
                ccv_arr_billetes_V2.recycler.P50+=1;
            }
            ccv_arr_billetes_V2.P50+=1;
            ccv_arr_billetes["P50"]+=1;
            ccv_monto_ingresado+=50;
        break;
        case "P100":
            if(where == "stacker"){
                ccv_arr_billetes_V2.stacker.P100+=1;
            }else{
                ccv_arr_billetes_V2.recycler.P100+=1;
            }
            ccv_arr_billetes_V2.P100+=1;
            ccv_arr_billetes["P100"]+=1;
            ccv_monto_ingresado+=100;
        break;
        case "P200":
            if(where == "stacker"){
                ccv_arr_billetes_V2.stacker.P200+=1;
            }else{
                ccv_arr_billetes_V2.recycler.P200+=1;
            }
            ccv_arr_billetes_V2.P200+=1;
            ccv_arr_billetes["P200"]+=1;
            ccv_monto_ingresado+=200;
        break;
        case "P500":
            if(where == "stacker"){
                ccv_arr_billetes_V2.stacker.P500+=1;
            }else{
                ccv_arr_billetes_V2.recycler.P500+=1;
            }
            ccv_arr_billetes_V2.P500+=1;
            ccv_arr_billetes["P500"]+=1;
            ccv_monto_ingresado+=500;
        break;
        case "P1000":
            if(where == "stacker"){
                ccv_arr_billetes_V2.stacker.P1000+=1;
            }else{
                ccv_arr_billetes_V2.recycler.P1000+=1;
            }
            ccv_arr_billetes_V2.P1000+=1;
            ccv_arr_billetes["P1000"]+=1;
            ccv_monto_ingresado+=1000;
        break;
        default:
            //No se suma a los arrays
        break;
    }

    ccv_arr_monedas_V2.total=(ccv_arr_monedas_V2.G50*.50)+(ccv_arr_monedas_V2.C50*.50);
    ccv_arr_monedas_V2.total+=ccv_arr_monedas_V2.P1*1;
    ccv_arr_monedas_V2.total+=ccv_arr_monedas_V2.P2*2;
    ccv_arr_monedas_V2.total+=ccv_arr_monedas_V2.P5*5;
    ccv_arr_monedas_V2.total+=ccv_arr_monedas_V2.P10*10;
    ccv_ext_dineroSesion();
    
}

//convierte un valor decimal a hexadecimal
function ccv_DecToHex(val){
    val=parseInt(val);
    val=val.toString(16);
    return val;
}
//convierte un valor hexadecimal a decimal
function ccv_HexToDec(val){
    val=parseInt(val,16);
    return val;
}
//convertir un array hexadecimal a un array decimal
function ccv_arrDecToHex(arr){
    let newArr=[];
    $.each(arr,function(index,value){
        newArr[index]=ccv_DecToHex(value);
    });
    return newArr;
}
//convertir un array decimal a un array hexadecimal
function ccv_arrHexToDec(arr){
    let newArr=[];
    $.each(arr,function(index,value){
        newArr[index]=ccv_HexToDec(value);
    });
    return newArr;
}
//calcular cambio
function ccv_calcularCambio(){
    if(ccv_precio == undefined){
        return {"error":"El precio no esta definido, no se puede hacer un calculo con un valor indefinido"};
    }
    //Si el monto ingresado es igual al precio
    if(ccv_monto_ingresado == ccv_precio){
        ccv_cambio=0;
    }
    else if(ccv_monto_ingresado > ccv_precio){
        ccv_cambio=ccv_monto_ingresado-ccv_precio;        
    }
    else{
        return {"error":"El monto a cobrar no se ha cubierto"};
    }
    let arr={
        "cambio":ccv_cambio,
        "error":0,
    };
    return arr;
}
// TIMEOUT si no se presenta respuesta desde cierto tiempo que se mando la solicitud
function ccv_timerNoResponse(codigo,handler){
    ccv_last_error["mensaje"]="Se exedio el tiempo de espera para la respuesta de la operación.";
    ccv_last_error["handler"]=JSON.parse(handler);
    ccv_last_error["codigo"]=JSON.parse(codigo);
    clearTimeout(ccv_timerToResponse);
    if(ccv_last_error["handler"] == "conectar"){
        sinBoarddroid();
        clearInterval(ccv_interval); 
        ccv_interval = undefined;
        ccv_interval=setInterval(ccv_reconectar,ccv_tiempo_reconectar);
    }
    // else if(ccv_last_error["handler"] == "ConfigurarMonedero"){
    //     //alert();
    //     //$(".coinDissmiss").fadeOut(500).remove();
    //     $("body").append('\n'+
    //         '<div class="fixed-bottom coinDissmiss" style="z-index:9999999"><div class="alert alert-warning alert-dismissible fade show" role="alert">\n'+
    //           'El monedero no respondio o no se recibio la respuesta correctamente.\n'+
    //           '<button type="button" class="close" data-dismiss="alert" aria-label="Close">\n'+
    //             '<span aria-hidden="true">&times;</span>\n'+
    //           '</button>\n'+
    //         '</div></div>');
    //     setTimeout(function(){
    //         $(".coinDissmiss").fadeOut(500).remove();
    //     },5000);
    // }
    // else if(ccv_last_error["handler"] == "ConfigurarBilletero"){
    //     $(".billDissmiss").fadeOut(500).remove();
    //     $("body").append('\n'+
    //         '<div class="fixed-bottom billDissmiss" style="z-index:9999999"><div class="alert alert-warning alert-dismissible fade show" role="alert">\n'+
    //           'El billetero no respondio o no se recibio la respuesta correctamente.\n'+
    //           '<button type="button" class="close" data-dismiss="alert" aria-label="Close">\n'+
    //             '<span aria-hidden="true">&times;</span>\n'+
    //           '</button>\n'+
    //         '</div></div>');
    //     setTimeout(function(){
    //         $(".billDissmiss").fadeOut(500).remove();
    //     },5000);
    // }
    ccv_ext_timeout();
};
//limpiar el ultimo error
function ccv_clearErrors(){
    ccv_last_error=ccv_empty_last_error;
}

//funcion para probar motores
function ccv_runTestMatriz(){
    if(ccv_aux_iteranti == 90){
        ccv_aux_iteranti=10;
        return;
    }
    setTimeout(function () {   
        motor1=ccv_DecToHex(ccv_aux_iteranti);
        setTimeout(function(){ccv_matrizMotores(motor1,"00","04");},500);
        if (ccv_aux_iteranti < 90) {            
            ccv_runTestMatriz();  
        }
        ccv_aux_iteranti++;
    }, 1000)
}
/***************************************************/
/*                                                 */
/*            FUNCIONES PERSONALIZADAS             */
/*                                                 */
/***************************************************/


function ccv_proccessMessage(unparse){

    clearTimeout(ccv_timerToResponse);
    let messageToShow="";
    let descriptionToShow="";
    //Respuestas genericas de la aplicación
    switch(unparse.noCode){
        case 700:
            messageToShow=unparse.mensaje;
            descriptionToShow="La aplicación se conecto con el sitio web";
        break;
        case 701:
            messageToShow=unparse.mensaje;
            descriptionToShow="La conexión con la boarddroid se termino por petición del sistema";
        break;
        case 702:
            messageToShow=unparse.mensaje;
            descriptionToShow="La instrucción que se mando no es compatible con esta versión de la aplicación";
        break;
        case 703:
            sinBoarddroid();
            if(ccv_interval == undefined){
                clearInterval(ccv_interval); 
                ccv_interval = undefined;
                //X segundos entre cada intento de reconexion
                ccv_interval=setInterval(ccv_reconectar,ccv_tiempo_reconectar);
            }
            messageToShow="Boarddroid desconectada";
            descriptionToShow=unparse.descripcion;
        break;
        case 704:
            //puerto desconectado
            messageToShow=unparse.mensaje;
            descriptionToShow=unparse.descripcion;
        break;
        case 705:
            sinBoarddroid();
            //conexion no completada
            if(ccv_interval == undefined){
                clearInterval(ccv_interval); 
                ccv_interval = undefined;
                //X segundos entre cada intento de reconexion
                ccv_interval=setInterval(ccv_reconectar,ccv_tiempo_reconectar);
            }
            messageToShow="Conexión con la boarddroid no completada";
            descriptionToShow="Revisa que este conectada correctamente";
        break;
        case 706:
            messageToShow=unparse.mensaje;
            descriptionToShow="El puerto no esta vinculado a la boarddroid, así que se cerro.";
        break;
        case 707:
            messageToShow=unparse.mensaje;
            descriptionToShow="La respuesta no se recibio en el tiempo especificado por la aplicación";
        break;
        case 708:
        default:
            messageToShow=unparse.mensaje;
            descriptionToShow="Uy! te encontraste con un error desconocido";
        break;
    }
    let objComplete=JSON.stringify({
        "codigo":"msjApp",
        "mensaje":messageToShow,
        "descripcion":descriptionToShow,
        "solicitud":"...",
        "noCode":unparse.noCode,
    });

    
    ccv_ext_mensajeAplicacion(objComplete);
}

function ccv_cleanSenseProduct(){
    clearInterval(ccv_waitingForSense);
    ccv_waitingForSense=undefined;
    ccv_estatus_dispensado=undefined;
}
function ccv_reload(){
    if(cvv_reloadWhenFinished){
        //location.reload();
        ccv_SoftReload();
    }
}
function ccv_reloadWhenFail(){
    if(cvv_reloadWhenFinished){
        location.reload();
    }
}



/******************************************************/
/*  LIMPIAR LAS VARIABLES Y ARREGLOS PARA QUE NO SE   */
/*    TENGA QUE RECARGAR LA PAGINA                    */
/******************************************************/

const ccv_interval_ORIGINAL=undefined;
const ccv_waitingForSense_ORIGINAL=undefined;
const ccv_precio_ORIGINAL=undefined;
const ccv_timerToResponse_ORIGINAL=undefined;
const ccv_estatus_dispensado_ORIGINAL=undefined;  
const ccv_cambio_ORIGINAL=0;
const ccv_monto_ingresado_ORIGINAL=0;
const ccv_aux_iteranti_ORIGINAL = 10; 
const ccv_tiempo_respuesta_ORIGINAL=3000;
const ccv_tiempo_reconectar_ORIGINAL=7000;
const ccv_temperatureLogArr_ORIGINAL=[];
const ccv_last_error_ORIGINAL={"mensaje":null,"handler":null,"codigo":null,"noCode":666,};
const ccv_empty_last_error_ORIGINAL={"mensaje":null,"handler":null,"codigo":null,"noCode":666,};
const ccv_arr_monedas_ORIGINAL={"G50":0,"C50":0,"P1":0,"P2":0,"P5":0,"P10":0};
const ccv_arr_billetes_ORIGINAL={"P20":0,"P50":0,"P100":0,"P200":0,"P500":0,"P1000":0,};
const ccv_arr_monedas_V2_ORIGINAL={"tubos":{"G50":0,"C50":0,"P1":0,"P2":0,"P5":0,"P10":0},"caja":{"G50":0,"C50":0,"P1":0,"P2":0,"P5":0,"P10":0},"G50":0,"C50":0,"P1":0,"P2":0,"P5":0,"P10":0,"total":0,};
const ccv_arr_billetes_V2_ORIGINAL={"stacker":{"P20":0,"P50":0,"P100":0,"P200":0,"P500":0,"P1000":0,},"recycler":{"P20":0,"P50":0,"P100":0,"P200":0,"P500":0,"P1000":0,},"P20":0,"P50":0,"P100":0,"P200":0,"P500":0,"P1000":0,"total":0,}
const ccv_arr_billetes_stacker_ORIGINAL={"P20":0,"P50":0,"P100":0,"P200":0,"P500":0,"P1000":0,}
const ccv_arr_monedas_tubos_ORIGINAL={"C50":0,"G50":0,"P1":0,"P2":0,"P5":0,"P10":0};


function ccv_SoftReload(){
    //  SE VACIAN LAS VARIABLES QUE SE TENIAN PARA QUE NO SE GENEREN ERRORES
    //  LAS MANDO A UNDEFINED
    ccv_interval=undefined;
    ccv_waitingForSense=undefined;
    ccv_precio=undefined;
    ccv_timerToResponse=undefined;
    ccv_estatus_dispensado=undefined;
    ccv_cambio=undefined;
    ccv_monto_ingresado=undefined;
    ccv_aux_iteranti=undefined;
    ccv_tiempo_respuesta=undefined;
    ccv_tiempo_reconectar=undefined;
    ccv_temperatureLogArr=undefined;
    ccv_last_error=undefined;
    ccv_empty_last_error=undefined;
    ccv_arr_monedas=undefined;
    ccv_arr_billetes=undefined;
    ccv_arr_monedas_V2=undefined;
    ccv_arr_billetes_V2=undefined;
    ccv_arr_billetes_stacker=undefined;
    ccv_arr_monedas_tubos=undefined;

    //  SE LES ASIGNA EL VALOR POR DEFECTO QUE ESTA GUARDADO EN CONSTANTES
    ccv_interval=ccv_interval_ORIGINAL;
    ccv_waitingForSense=ccv_waitingForSense_ORIGINAL;
    ccv_precio=ccv_precio_ORIGINAL;
    ccv_timerToResponse=ccv_timerToResponse_ORIGINAL;
    ccv_estatus_dispensado=ccv_estatus_dispensado_ORIGINAL;
    ccv_cambio=ccv_cambio_ORIGINAL;
    ccv_monto_ingresado=ccv_monto_ingresado_ORIGINAL;
    ccv_aux_iteranti=ccv_aux_iteranti_ORIGINAL;
    ccv_tiempo_respuesta=ccv_tiempo_respuesta_ORIGINAL;
    ccv_tiempo_reconectar=ccv_tiempo_reconectar_ORIGINAL;
    ccv_temperatureLogArr=ccv_temperatureLogArr_ORIGINAL;
    ccv_last_error=ccv_last_error_ORIGINAL;
    ccv_empty_last_error=ccv_empty_last_error_ORIGINAL;
    ccv_arr_monedas=ccv_arr_monedas_ORIGINAL;
    ccv_arr_billetes=ccv_arr_billetes_ORIGINAL;
    ccv_arr_monedas_V2=ccv_arr_monedas_V2_ORIGINAL;
    ccv_arr_billetes_V2=ccv_arr_billetes_V2_ORIGINAL;
    ccv_arr_billetes_stacker=ccv_arr_billetes_stacker_ORIGINAL;
    ccv_arr_monedas_tubos=ccv_arr_monedas_tubos_ORIGINAL;

    ccv_ext_softReload();
}


function ccv_saveLog(strJson){
    /*  strJson contiene
    "codigo"
    "mensaje"
    "descripcion"
    "solicitud"
    "noCode"
    */
    addLog("log",strJson);
    send(formData("logWeblinker",strJson));
}