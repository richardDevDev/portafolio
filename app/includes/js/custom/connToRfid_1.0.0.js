/*************************************************************************/
/*                          NOTAS IMPORTANTES                            */
/*  En necesario incluir JQuery 3+. Es obligatorio a menos que se        */
/*      transforme el codigo debajo en JS puro.                          */
/*                                                                       */
/*                                                            v1.0.1     */
/*  Archivo de conexion con rfid linker                             dd   */
/*************************************************************************/
/*************************************************************************/
/*                  Weblinker creado por Daniel Sandoval                 */
/*              connToCrx_1.x.x.js creado por Daniel Sandoval            */
/*              connToRfid_1.x.x.js creado por Daniel Sandoval           */
/*                              aka. danidoble                           */
/*                                                                       */
/*                                                                       */
/*                          ©2020   all rights reserved. owl desarrollos */
/*************************************************************************/

//Id de la aplicación de chrome
var rfid_idApp = "bgcglpmbgllikmjbiemliocajmbffkak";
//var rfid_idApp = "";

//para hacer pruebas con la aplicacion desempaquetada
//var rfid_idApp = "nhnoodciddbdcoofjefeonajhmehgamj";
//si la conexion se pierde el intervalo de reconexion se inicia
var rfid_interval;
//genera la conexion con la aplicacion (abre un puerto)
var rfid_portApp = chrome.runtime.connect(rfid_idApp, {name: 'rfid_dd_application'});      
//Almacena el ultimo error registrado
var rfid_last_error={
    "mensaje":null,
    "handler":null,
    "codigo":null,
    "noCode":666,
};
//almacenara el timeout para realizar una operacion en caso de que la respuesta no regrese en dado tiempo
var rfid_timerToResponse;
//auxiliar para limpiar la variable last error
var rfid_empty_last_error={
    "mensaje":null,
    "handler":null,
    "codigo":null,
    "noCode":666,
};

/*************************************************/
/**                                             **/
/*************************************************/
//si el puerto se desconecta o si la aplicacion tiene error, tambien ocurre si la aplicación se esta reiniciando y la pagina ya cargo.
rfid_portApp.onDisconnect.addListener(obj => {
    rfid_last_error["mensaje"]="La conexión con la aplicacion se perdió";
    rfid_last_error["handler"]=null;
    rfid_last_error["codigo"]=null;
    rfid_last_error["noCode"]=667;
    
    addLog("log",'La conexión con la aplicación se perdió');
    if(chrome.runtime.lastError){
        addLog("log","El puerto de la conexión con la aplicación se cerró. Error: "+chrome.runtime.lastError);
    }      
    //alert('La conexión con la aplicación de RFID se perdió');
});

//Cuando la aplicacion responde algo este listener obtiene los datos
rfid_portApp.onMessage.addListener(function(rfid_msg) {
    //la respuesta esta en formato JSON asi que se transforma en un objeto para mejor manejo
    rfid_unparse=rfid_jsonToObject(rfid_msg.msjBD);
    //si el codigo es 0 = mensaje de la aplicacion
    //si el codigo es un array de 14 posiciones = mensaje de la boardroid
    //se llama a una funcion para cada codigo de respuesta para procesar las respuestas y asignar los resultados
    
    if(rfid_unparse.codigo === '0'){
        rfid_proccessMessage(rfid_unparse);
    }else if(rfid_unparse.codigo){
        conRFID();
        //DETENIENDO LA REPETICION EN CASO DE QUE LA RECONEXION ESTE EN PROCESO
        if(rfid_interval != undefined){
            clearInterval(rfid_interval); 
            rfid_interval = undefined;
        }
        rfid_proccessData(rfid_unparse);
    }
});

//convierte JSON a un objeto
function rfid_jsonToObject(rfid_jsonEncoded){
    var arr=JSON.parse(rfid_jsonEncoded);
    return arr;
}

//procesa el codigo que llego de la boarddroid e identifica que significa
function rfid_proccessData(unparse){
    clearTimeout(rfid_timerToResponse);
    let codigoHex=unparse.codigo;
       
       //mostrar en donde se tenga que mostrar
   //addLog("log",codigoHex);
   printInRfid_input(codigoHex);
}

//realiza la conexion con la boarddroid
function rfid_conectar(){
    rfid_sendMessage(JSON.stringify('conectar'));
}

//reconexion a la boarddroid si se desconecta
function rfid_reconectar(){
    addLog("log","Intentando reconectar");
    rfid_conectar();
}

//realiza una desconexion segura y autorizada de la boarddroid
function rfid_desconectar(){
    rfid_sendMessage(JSON.stringify('desconectar'));
    
}

//Codigo para enviar hexadecimales personalizados a la boarddroid
function rfid_codigoPersonalizado(val,cod){
    //ambos valores (val y cod) deben estar en JSON al momento de enviar rfid_sendMessage();
    var codigo=cod;
    codigo[11]=rfid_sumaHex(codigo);
    codigo=rfid_add0x(codigo);
    rfid_sendMessage(JSON.stringify(val),JSON.stringify(codigo));
}


/***************************************************/
/*                                                 */
/*                FUNCIONES AUXILIARES             */
/*                                                 */
/***************************************************/


//Aagrega 0x antes de cada valor en un array. | 00 => 0x00
function rfid_add0x(cod){
    let codigo=[];
    $.each(cod,function(index,value){
        codigo[index]="0x"+value;
    });
    return codigo;
}

//Envia mensajes a la aplicación
function rfid_sendMessage(instruccion,cod){
    if(cod==undefined){cod=JSON.stringify("");}
    rfid_portApp.postMessage({toDo: instruccion,codigo: cod});
    
    //Empieza un conteo de 3 segundos, donde si la respuesta no se presenta se activará la función
    rfid_timerToResponse=setTimeout(function(){rfid_timerNoResponse(cod,instruccion);},3000);
}

//Prueba de timer sin respuesta
function rfid_timerNoResponse(codigo,handler){
    rfid_last_error["mensaje"]="Se exedio el tiempo de espera para la respuesta de la operación.";
    rfid_last_error["handler"]=JSON.parse(handler);
    rfid_last_error["codigo"]=JSON.parse(codigo);
    addLog("log",rfid_last_error);
    clearTimeout(rfid_timerToResponse);
    sinRFID();
    rfid_reconectar();
};

//limpiar el ultimo error
function rfid_clearErrors(){
    rfid_last_error=rfid_empty_last_error;
}

/***************************************************/
/*                                                 */
/*            FUNCIONES PERSONALIZADAS             */
/*                                                 */
/***************************************************/


function rfid_proccessMessage(unparse){
    clearTimeout(rfid_timerToResponse);
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
            descriptionToShow="La conexión con el lector de RFID se termino por petición del sistema";
        break;
        case 702:
            messageToShow=unparse.mensaje;
            descriptionToShow="La instrucción que se mando no es compatible con esta versión de la aplicación";
        break;
        case 703:
            sinRFID();
            if(rfid_interval == undefined){
                //7 segundos entre cada intento de reconexion
                rfid_interval=setInterval(rfid_reconectar,7000);
            }
            messageToShow="lector de RFID desconectado";
            descriptionToShow=unparse.descripcion;
        break;
        case 704:
            //puerto desconectado
            messageToShow=unparse.mensaje;
            descriptionToShow=unparse.descripcion;
        break;
        case 705:
            //conexion no completada
            sinRFID();
            if(rfid_interval == undefined){
                //7 segundos entre cada intento de reconexion
                rfid_interval=setInterval(rfid_reconectar,7000);
            }
            messageToShow="Conexión con el lector de RFID no completada";
            descriptionToShow="Revisa que este conectado correctamente";
        break;
        case 706:
            messageToShow=unparse.mensaje;
            descriptionToShow="El puerto no esta vinculado al lector de RFID, así que se cerro.";
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
    let objComplete=JSON.stringify({"mensaje":messageToShow,"descripcion":descriptionToShow,"noCode":unparse.noCode});
    addLog("log",JSON.parse(objComplete));
    
    //addLog("log",unparse);
}