
var seleccion_dec;
var id_movimiento_dec;
var isOnControlPanel=false;
var isOnDispositivos=false;
var dispensando=false;
var id_movimiento_retirar;
var restarSeleccion;
var tiempoCancelaPago=1000*20; // 20 segundos sin que se inserte alguna moneda
var tiempoSinDeposito;
var entregaMonedas=false;
var entregaMonedasInterval=undefined;
var pageActive=undefined;
var intervaloProgressBar=undefined;
var IntervalcuentaRegresiva=undefined;
var shortCode=undefined;

/**********************************************************************/
/** 			   CONSTANTES Y VARIABLES PERSONALIZABLES			 **/
/** 	todas las variables ya estan definidas con un valor por	 	 **/
/**		defecto, pero se pueden cambiar desde aqui para no modificar **/
/**		el archivo de conexion, solo descomentar las que se 		 **/
/**		necesiten modificar, 					 7000 = 7 segundos   **/
/**********************************************************************/

//	tiempo para las respuestas
	ccv_tiempo_respuesta=5000;

//	tiempo para la reconexion (1 hora = (1000*60*60) => 1000 = 1 segundo, 60 = 60 segundos, 60 = 60 minutos)
//	ccv_tiempo_reconectar=7000;

// tiempo para el intervalo entre la comprobacion del sensado, default 500ms
const ccv_ext_senseInterval = 500;

//	tiempo para reiniciar los valores default una vez se obtenga el resultado del sensado, default 500ms
const ccv_tiempoParaRecargar = 2000;
const ccv_tiempoParaRecargarFalla = 2000;

//	si esta en true, hara que los arreglos y variables se reinicien 
//	una vez que el dispensado se complete, o falle
const cvv_reloadWhenFinished=true;

/**************
	Esto provocara que se reinicien las variables a la version de la primera carga, por lo que si se 
	desea que se se reinicien con los valores personalizados se tienen que poner aqui
**************/
function ccv_ext_softReload(){
	ccv_tiempo_respuesta=5000;
//	ccv_tiempo_reconectar=7000;

	seleccion_dec=undefined;
	id_movimiento_dec=undefined;
	isOnControlPanel=false;
	isOnDispositivos=false;
	dispensando=false;
	id_movimiento_retirar=undefined;
	restarSeleccion=undefined;
	tiempoCancelaPago=1000*20 //20 segundos sin que se inserte alguna moneda
	entregaMonedas=false;
	entregaMonedasInterval=undefined;
	cobrandoEnd();
	intervaloProgressBar=undefined;
	IntervalcuentaRegresiva=undefined;
	owl_price=undefined;

	tiempoSinDeposito=undefined;
	if($("#label-inferior").length>0){
		//$("#label-inferior").text("Ingrese efectivo hasta cubrir el total");
	}

	setTimeout(function(){ccv_leerTubos();},300);
	
}


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

//	RUTA DONDE SE ENCUENTRA LA IMAGEN A MOSTRAR SI NO SE DETECTA LA BOARDDROID
//let ccv_ext_cod_img_disconnected="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NTEuNzQgNDUxLjc0Ij48cGF0aCBkPSJNNDQ2LjMyNCAzNjcuMzgxTDI2Mi44NTcgNDEuNjkyYy0xNS42NDQtMjguNDQ0LTU4LjMxMS0yOC40NDQtNzMuOTU2IDBMNS40MzUgMzY3LjM4MWMtMTUuNjQ0IDI4LjQ0NCA0LjI2NyA2NCAzNi45NzggNjRoMzY1LjUxMWMzNC4xMzMtMS40MjIgNTQuMDQ0LTM1LjU1NiAzOC40LTY0eiIgZmlsbD0iI2UyNGM0YiIvPjxwYXRoIGQ9Ik0yMjUuODc5IDYzLjAyNWwxODMuNDY3IDMyNS42ODlINDIuNDEzTDIyNS44NzkgNjMuMDI1eiIgZmlsbD0iI2ZmZiIvPjxnIGZpbGw9IiMzZjQ0NDgiPjxwYXRoIGQ9Ik0xOTYuMDEzIDIxMi4zNTlsMTEuMzc4IDc1LjM3OGMxLjQyMiA4LjUzMyA4LjUzMyAxNS42NDQgMTguNDg5IDE1LjY0NCA4LjUzMyAwIDE3LjA2Ny03LjExMSAxOC40ODktMTUuNjQ0bDExLjM3OC03NS4zNzhjMi44NDQtMTguNDg5LTExLjM3OC0zNC4xMzMtMjkuODY3LTM0LjEzMy0xOC40OS0uMDAxLTMxLjI5IDE1LjY0NC0yOS44NjcgMzQuMTMzeiIvPjxjaXJjbGUgY3g9IjIyNS44NzkiIGN5PSIzMzYuMDkyIiByPSIxNy4wNjciLz48L2c+PC9zdmc+";
//let ccv_ext_cod_img_connected="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDQ5NiA0OTYiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQxMi43NTQgMTA4LjM3YzAgNC45MDQgMy40NDMtOS40MTQtNDYuMDQgMTc1LjIyLTIuNzQyLTEwLjYzNS0xLjkyIDEyLjM3LTEuOTItMTg5LjU3IDE0LjIwNC0yMS42MyA0Ny45Ni0xMS40MjIgNDcuOTYgMTQuMzV6TTM0OC43OTQgMzAuNHYyMTcuNjJjLTU4LjIyLTEwMC44MjItMzIuNTQ5LTU2LjM4OC02MC44LTEwNS4zMlYzMC40YzAtMTYuNzYgMTMuNjQtMzAuNCAzMC40LTMwLjQgMTcuMDIxIDAgMzAuNCAxMy43OTYgMzAuNCAzMC40ek0zMTMuNjQ0IDIxOS4xM2wtMjMuNi0yMy41OWMtMjAuNTQ3LTIwLjU1Ni00Ny41Ny0zMi4zNC03OS43OC0zMi4zNGwtNTMuOTItODkuOTJjLTguMzE5LTE0LjQ1NS0zLjQ1Mi0zMy4wNDcgMTEuMTUtNDEuNDggMTQuNjg3LTguNDY5IDMzLjIxOS0zLjI1MyA0MS41MyAxMS4xMyA4Mi4yNTggMTM2LjcwNSA0MC4xNjIgNjQuNTUgMTA0LjYyIDE3Ni4yeiIvPjxwYXRoIGQ9Ik0zNTcuMTk0IDMzNC41OWMwIDQ5Ljk0LTE5Ljg1OCA5OC4wNzgtNTUuMzMgMTMzLjU4LTE3LjMxIDE3LjI5LTQwLjMgMjcuMTctNjQuNzQgMjcuOC0zLjg5NCAwIDE0Ljk4OC4wMy00Mi40Ni4wMy02MS40NiAwLTExMS40Ny01MC0xMTEuNDctMTExLjQ3di0xNTMuNmMwLTUgNC4wNy05LjA2IDkuMDctOS4wNi43ODQgMCAxLjQyOC0uMDQ1IDIuMzktLjMxIDIuNDkxLjk4OSAyNC45ODMuNjQ2IDQwLjIgMjIuNjcgOS44MjggMTMuMTMxIDkuMTQgMjguNDI3IDkuMTQgMzcuOSAwIDM0LjIzIDE0Ljc4IDY2Ljc4IDQwLjUzIDg5LjMzIDI3Ljg4NiAyNC40MDkgNzEuNTEgNC4zOTMgNzEuNTEtMzIuNDUtLjAxLTQwLjkwNyAxLjU2Mi01MC4zMzUtNS41Ni02Ni41LTYuMzczLTE0LjM5OS0xNC4zOTItMjAuNjE2LTI1LjE0LTMwLjQyLTMuNjU4LTIuOTMuODU1LTIuMDktNzQuMjgtMi4wOS05LjkwMy0xNy42MDctMjguNDgzLTMwLjk1MS01MC42Mi0zMy42My45LTguNjA5IDUuNTIzLTE2LjgyOCAxMy40My0yMi4xMSAxMy4xNTItNi40MTYtMS41MzEtNS4wNiA5OC4xMi01LjA2IDI1LjIxIDAgNDguOTIgOS44MiA2Ni43NSAyNy42NWw2NS44MyA2NS44MyA0Ljk4IDguNjNjNC42NjYgMTcuMTQxIDcuNjUgMzIuOTE2IDcuNjUgNTMuMjh6Ii8+PC9zdmc+";

//	codigo para insertar debajo de todo el codigo html una vez cargada la pagina
const ccv_ext_cod_boaddroid='';
const ccv_ext_cod_css_boarddroid='';
/*********************************************************************/
/** TODAS LAS FUNCIONES DEBEN SER PERSONALIZADAS SEGUN SEA EL CASO 	**/
/*********************************************************************/

//	Cuando la pagina cargue, se inicializa la conexion
$(function(){
	//	se conecta con la aplicacion
	//if(typeof ccv_conectar === "function"){
		ccv_conectar();
	//}
	if(typeof ccvJofemarConnect === "function"){
		ccvJofemarConnect(master_machine_select);
	}
	
	//();
	//addLog("log",ccv_arr_monedas_tubos);

	/**	se introduce el codigo personalizado para que se muestre el mensaje de que la boarddroid no 
		esta conectada en caso de que se desconecte o no se detecte 
	*/
	//$("body").append(ccv_ext_cod_css_boarddroid+ccv_ext_cod_boaddroid);
});

//	conexion con la aplicacion perdida, genera un error irreparable en la sesion actual, 
//	la unica manera de arreglarlo es recargar la pagina, pero si se hace muy seguido la app se inhabilitara
function ccv_ext_conexionPerdida(){
	addLog("error",
		'La conexión con la aplicación "weblinker" se perdió o falló',{
		'errores':[
			'Es probable que abrieras otra ventana y provoco que la conexion existente se terminara',
			'Se recargó con demasiada frecuencia la aplicación',
		],
		'soluciones':[
			'Intenta recargar la página',
			'Forza la recarga de la aplicación en "extensions"',
			'Cierra el navegador y vuelve a abrirlo',
		],
		'noCode':667
	});
	//sinBoarddroid('app');
	/*
	//guardar en BD el log
	data=JSON.stringify({
        "codigo":"appDisconected",
        "mensaje":ccv_last_error["mensaje"],
        "descripcion":"",
        "solicitud":"",
        "noCode":ccv_last_error["noCode"],
    })
	ccv_saveLog(data);
	*/
	//alert('La conexión con la aplicación se perdió');
}
//	respuesta de la boarddroid inconclusa o ilegible
function ccv_ext_codigoDividido(){
	addLog("log","El código se dividio, es probable que el código sea inconcluso o no tenga un sentido legible. "+ccv_unparse.codigo);
}
//	Respuestas de la boarddroird en JSON
function ccv_ext_respuestas(respuesta){
	//addLog("log",respuesta);
	//guardar el log en DB
    //ccv_saveLog(respuesta);

	respuesta=JSON.parse(respuesta);
	
	if(respuesta.noCode == 267){	//lectura de tubos
		
		//addLog("log",ccv_arr_monedas_tubos);
		
	}else if(respuesta.noCode == 274){	//retiro de monedas
		entregaMonedas=true;
		if(dispensando){
			send(formData('updateRetiroMonedas',id_movimiento_retirar));
			ccv_reload();
			
			$(".retiroProcess").hide();

			$("#retiroDiv").show();
			$("#controlsRetiro").show();
			
			$('#cerrarModal').click();
			dispensando=false;

		}
	}
	//addLog("log",respuesta);
}
//	Dinero en sesion
var contadorv=0;
var executeOneTime=false;
function ccv_ext_dineroSesion(){
	//	Si esta en panel de recarga monedero
	contadorv++;
	addLog("log","ejecutado veces: "+contadorv);
	if(isOnControlPanel && isOnDispositivos){
		lecturaContinua();
	}else{

		if (executeOneTime==false) {
			arrDineroEnSesion=JSON.stringify({"billetes":owl_arr_bills,"monedas":owl_arr_coins});
			//addLog("log",JSON.parse(arrDineroEnSesion));

			//dinero ingresado
			$("#ingresado").text("$ "+formatNumber.new(parseFloat(owl_amount_inserted).toFixed(2)));
			$(".ingresado").text("$ "+formatNumber.new(parseFloat(owl_amount_inserted).toFixed(2)));
			
			//	calcula el cambio y lo guarda en owl_change
			owlCalcChange();
			$(".cambio").text("$ "+formatNumber.new(parseFloat(owl_change).toFixed(2)));
			if(owl_amount_inserted >= owl_price){

				setTimeout(function(){owlDisableCoinPurse()();},100);
				setTimeout(function(){owlDisableBillPurse()();},600);
				cobrandoEnd();
				$("#cancelarEnVenta").hide();
				$(".proceso-venta").hide();
				$("#label-inferior").text("Espere mientras se dispensa su producto");
				$("#listenCash").show();
				$(".process-img").hide();
				$("#DISPENSANDO").show();
				// intenta hacer el dispensado con sensores = 0 (el tercer parametro)
				//setTimeout(function(){ccv_matrizMotores(ccv_DecToHex(seleccion_dec),"00","00");;},1200)
				//a la espera de que el dispensado se complete, o falle
				//ccv_ext_waitForDownProduct(seleccion_dec,id_movimiento_dec);
				let str_selection = seleccion.toString();
				let dispense_tray = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[0]+''+str_selection[1])+128));
				let dispense_channel = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[2])+128));
				
				ccvJofemarEnginesMatrix(parseInt(master_machine_select),dispense_tray,dispense_channel)
				ccvJofemarExtWaitForProductDown();
				cobrandoEnd();
				addLog("log","cambiando estatus dispensado");
				//setTimeout(function(){ccv_jofemar_status_dispensing=true},1500);

				//ccv_reload();
				
			}else{
				cobrandoStart();
			}
		}else{
			addLog("log","billete expulsado");
		}
		
	}
	
}
//	Genera una respuesta donde espera que el resultado del sensado llegue, por defecto el tiempo del
//	intervalo es de 500ms, y se repetira hasta que la respuesta de la boarddroid llegue
function ccv_ext_waitForDownProduct(seleccion,id_movimiento){
	ccv_waitingForSense=setInterval(function(){
		if(ccv_estatus_dispensado == undefined){
			//	...	No hace nada, ya que si esta indefinida significa que la respuesta no ha llegado aun
			//	...	Se pone en if ya que podria ser util despues
		}else if(ccv_estatus_dispensado){
			ccv_cleanSenseProduct();

			//	AVISAR -> recoja su producto
			$(".proceso-venta").hide();
			$(".process-img").hide();
			$("#PRODUCTOENTREGADO").fadeIn();
			$("#label-inferior").text("Recoja su producto");
			$("#listenCash").fadeIn();
			send(formData("restaStock",seleccion));
			send(formData("pagaNayax",id_movimiento));
			cobrandoEnd();

			if(owl_amount_inserted >= owl_price){
				$("#cambio").text("$ "+formatNumber.new(parseFloat(owl_change).toFixed(2)));	
			}
			//lee la cantidad de monedas en los tubos, y los guarda en ccv_arr_monedas_tubos
			ccv_leerTubos();
			if(owl_change && owl_change != 0){
				//devolver cambio si se puede
				setTimeout(function(){ccv_devolverCambioMonedas_V2();},300);
				
			}

			if (typeMov=="EMV") {
				$('.process-img').hide();$('#comprobante').show();
			}

			//	actualizar stock
			/*send(formData("restaStock",JSON.stringify({
				"seleccion":seleccion,
				"id_movimiento":id_movimiento,
				"din_ingresado":owl_amount_inserted,
				"din_cambio":owl_change,
				"arr_monedas_caja":owl_arr_coins.caja,
				"arr_billetes_stacker":owl_arr_bills.stacker,

			})));*/
			setTimeout(function(){
				ccv_reload();
				terminarProcesoDePago();
			},ccv_tiempoParaRecargar);
		}else if(!ccv_estatus_dispensado){
			ccv_cleanSenseProduct();

			//	AVISAR -> producto no entregado, 
			$("#ticketIngresado").val("CANCELADO");
			$("#ticketCambio").val("NO COBRADO");
			$(".proceso-venta").hide();
			$("#label-inferior").text("Producto no dispensado, generando devolución");
			$(".process-img").hide();
			$("#PRODUCTONODISPENSADO").show();
			$("#listenCash").show();
			cobrandoEnd();
			//se realiza la devolucion
			ccv_leerTubos();
			setTimeout(function(){
				owl_change=owl_amount_inserted;
				setTimeout(function(){ccv_devolverCambioMonedas_V2();},300);
				
			},300);

			//	actualizar estatus del movimiento
				send(formData("nodispensado",id_movimiento));
			setTimeout(function(){
				ccv_reload();
				terminarProcesoDePago();
			},ccv_tiempoParaRecargarFalla);
		}
	},ccv_ext_senseInterval);
	
}

//	Genera una respuesta donde espera que el resultado del sensado llegue, por defecto el tiempo del
//	intervalo es de 500ms, y se repetira hasta que la respuesta de la boarddroid llegue
function ccv_ext_waitForDownProductTest(seleccion,id_movimiento){
	ccv_waitingForSense=setInterval(function(){
		if(ccv_estatus_dispensado == undefined){
			//	...	No hace nada, ya que si esta indefinida significa que la respuesta no ha llegado aun
			//	...	Se pone en if ya que podria ser util despues
		}else if(ccv_estatus_dispensado){
			ccv_cleanSenseProduct();

			 // $("#label-inferior").text("Recoja su producto");
			 // $("#listenCash").fadeIn();
			//	AVISAR -> recoja su producto
			$(".dispensing-process").hide();
			$("#div-entregado").show();
			$("#terminarPruebaDispensado").show();
			cantidad=parseInt($("#sel-"+restarSeleccion).children('.quantity').text());
			cantidad-=1;
			$("#sel-"+restarSeleccion).children('.quantity').text(cantidad);

			//	actualizar stock
					send(formData("restaStock",JSON.stringify({
						"seleccion":seleccion,
						"id_movimiento":id_movimiento,
						"din_ingresado":owl_amount_inserted,
						"din_cambio":owl_change,
						"arr_monedas_caja":owl_arr_coins.caja,
						"arr_billetes_stacker":owl_arr_bills.stacker
					})));
			setTimeout(function(){
				ccv_reload();
			},ccv_tiempoParaRecargar);
		}else if(!ccv_estatus_dispensado){
			ccv_cleanSenseProduct();

			//	AVISAR -> producto no entregado, 
			$(".dispensing-process").hide();
			$("#div-no-entregado").show();
			$("#terminarPruebaDispensado").show();

			// $("#ticketIngresado").val("CANCELADO");
			// $("#ticketCambio").val("NO COBRADO");
			// $(".proceso-venta").hide();
			// $("#label-inferior").html("Producto no entregado<br>, cobro no realizado, Realizando Cancelacion");
			// $("#listenCash").fadeIn();
			// cancelacion();

			//	actualizar estatus del movimiento
				send(formData("nodispensado",id_movimiento));
			setTimeout(function(){
				ccv_reload();
			},ccv_tiempoParaRecargarFalla);
		}
	},ccv_ext_senseInterval);
}
//	cuando la reconexion esta activa se muestra lo que se describa en la funcion
function ccv_ext_mensajeReconexion(){
	addLog("log","Intentando reconectar");
}

//	Los mensajes de la aplicacion, normalmente son errores
function ccv_ext_mensajeAplicacion(mensaje){
	addLog("log",JSON.parse(mensaje));
	/*
	//guardar el log en DB
    ccv_saveLog(mensaje);
	*/
    //ESTA FUNCION ES PERSONALIZADA PARA CADA SITIO CON EL QUE SE VAYA A UTILIZAR, LOS MENSAJES ESTAN COMPUESTOS DE LA SIG. MANERA:
    /* 
        unparse={
            "codigo":"0",//El 0 siempre ira en respuestas mensaje
            "mensaje":"mensaje de respuesta de la aplicacion",
            "descripcion":"descripcion mas extensa del mensaje",
            "tipo":"message", //Las respuestas pueden ser "success"||"error"||"syserror"||"message"||"warning"
            "solicitud":"conectar", //Solicitud Realizada Desde Web
            "respuesta":"mensaje"
        };
    */
    //addLog("log",unparse);
}
//	TIMEOUT - sin respuesta en el tiempo especificado
function ccv_ext_timeout(){
	addLog("log",ccv_last_error);
	/*
	//guardar en BD el log
	data=JSON.stringify({
        "codigo":"appDisconected",
        "mensaje":ccv_last_error["mensaje"],
        "descripcion":"",
        "solicitud":"",
        "noCode":ccv_last_error["noCode"],
    })
	ccv_saveLog(data);*/
}

//	si se detecta que no esta conectada la boarddroid se activa esta funcion
function sinBoarddroid(f_type='boardroid'){
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

    f_img_disconnected_boardroid.style.display = '';
    f_img_connected_boardroid.style.display = 'none';

    //$("#notBoarddroid").show();
    //$("body").addClass("notOverflow");
}
//	si la boarddroid se vuelve a detectar se activa esta funcion
function conBoarddroid(){
	//let f_device = document.getElementById('ccv_jofemar_device_not_detected');
	//let f_machine = document.getElementById('notBoarddroid');
	//f_device.style.display = 'none';
	//f_machine.style.display = 'none';
	//document.querySelector('body').classList.remove('ccv-jofemar-overflow-hidden');


	let f_img_disconnected_boardroid = document.getElementById('ccv_boardroid_img_disconnected');
    let f_img_connected_boardroid = document.getElementById('ccv_boardroid_img_connected');

    f_img_disconnected_boardroid.style.display = 'none';
    f_img_connected_boardroid.style.display = '';



	let f_machine_slave = document.getElementById('ccv_jofemar_machine_slave_disconected');
	let f_machine = document.getElementById('ccv_jofemar_machine_one_disconected');
	let f_boardroid = document.getElementById('notBoarddroid');
	let f_device = document.getElementById('ccv_jofemar_device_not_detected');
	
	if(
		(f_machine === null || (f_machine !== null && f_machine.style.display.trim() === 'none')) && 
		(f_machine_slave === null || (f_machine_slave !== null && f_machine_slave.style.display.trim() === 'none'))){
			f_machine.style.display = 'none';
			f_machine_slave.style.display = 'none';
			document.querySelector('body').classList.remove('ccv-jofemar-overflow-hidden');
			f_device.style.display = 'none';
	}
	
	f_boardroid.style.display = 'none';
	f_boardroid.innerText='Boardroid: No Conectada';
    //$("#notBoarddroid").hide();
    //$("body").removeClass("notOverflow");
}




function RecargarMonedero(){
	//ccv_configMonedero("01","00","00");
	setTimeout(function(){ccv_configBilletero("00",)},400);
}
function lecturaContinua(){
	
	//tubos
	$("#in-10-0").text(owl_arr_coins.tubos.P10);
	$("#in-5-0").text(owl_arr_coins.tubos.P5);
	$("#in-2-0").text(owl_arr_coins.tubos.P2);
	$("#in-1-0").text(owl_arr_coins.tubos.P1);
	$("#in-50c-0").text(owl_arr_coins.tubos.G50);//

	//caja
	$("#in-10-1").text(owl_arr_coins.caja.P10);
	$("#in-5-1").text(owl_arr_coins.caja.P5);
	$("#in-2-1").text(owl_arr_coins.caja.P2);
	$("#in-1-1").text(owl_arr_coins.caja.P1);
	$("#in-50c-1").text(owl_arr_coins.caja.G50);

	//	TOTAL
	$("#sum-50c-0").text(parseInt($("#camin-50c-0").text())+owl_arr_coins.tubos.G50+owl_arr_coins.caja.G50);
	$("#sum-1-0").text(parseInt($("#camin-1-0").text())+owl_arr_coins.tubos.P1+owl_arr_coins.caja.P1);
	$("#sum-2-0").text(parseInt($("#camin-2-0").text())+owl_arr_coins.tubos.P2+owl_arr_coins.caja.P2);
	$("#sum-5-0").text(parseInt($("#camin-5-0").text())+owl_arr_coins.tubos.P5+owl_arr_coins.caja.P5);
	$("#sum-10-0").text(parseInt($("#camin-10-0").text())+owl_arr_coins.tubos.P10+owl_arr_coins.caja.P10);


	$("#ingresoEfectivo-10").text(owl_arr_coins.tubos.P10+owl_arr_coins.caja.P10);
	$("#ingresoEfectivo-5").text(owl_arr_coins.tubos.P5+owl_arr_coins.caja.P5);
	$("#ingresoEfectivo-2").text(owl_arr_coins.tubos.P2+owl_arr_coins.caja.P2);
	$("#ingresoEfectivo-1").text(owl_arr_coins.tubos.G50+owl_arr_coins.caja.G50);
	$("#ingresoEfectivo-50C").text(owl_arr_coins.tubos.P1+owl_arr_coins.caja.P1);

	$("#arr_monedas_caja").val(JSON.stringify(owl_arr_coins.caja));
	
}

function habilitarMonedero(){
	addLog("log","Habilitar Monedero Disabled");
	//setTimeout(function(){ccv_configMonedero("01","00","00");},500);
}

function habilitarBilletero(){
	addLog("log","Habilitar Billetero");
	setTimeout(function(){ccv_configBilletero("01")},500);
}

function habilitarNayax(){
	addLog("log","Habilitar Nayax");
	//0x01 0x0B 0x00 0x01 0x00 0x13 0x00 0x00 0xF2 0xDF
	ccv_nayaxCashless("01",seleccion_dec,"00","00",owl_price,"00");
}


function owlDisableCoinPurse(){
	addLog("log","deshabilitar Monedero Disabled");
	//ccv_configMonedero("00","00","00");
	
}

function owlDisableBillPurse(){
	addLog("log","deshabilitar Billetero");
	ccv_configBilletero("00");
}

function deshabilitarNayax(){
	addLog("log","deshabilitar Nayax");
	ccv_nayax("00")
}


function porcentaje(){
//	ccv_arr_monedas_tubos
/*
monedas de 10 = 72
monedas de 1  = 100
monedas de 2  = 92
monedas de 5  = 80

*/
	porcentaje=[];
	porcentaje["10"]=formatNumber.new(parseFloat((ccv_arr_monedas_tubos.P10)/58*100).toFixed(0));
	porcentaje["5"]=formatNumber.new(parseFloat((ccv_arr_monedas_tubos.P5)/69*100).toFixed(0));
	porcentaje["2"]=formatNumber.new(parseFloat((ccv_arr_monedas_tubos.P2)/78*100).toFixed(0));
	porcentaje["1"]=formatNumber.new(parseFloat((ccv_arr_monedas_tubos.P1)/85*100).toFixed(0));
	porcentaje["50c"]=formatNumber.new(parseFloat((ccv_arr_monedas_tubos.G50)/92*100).toFixed(0));

	
	$("#porcentaje_10").text(porcentaje['10']+"%").addClass(auxPorcentaje(porcentaje['10']));
	$("#porcentaje_5").text(porcentaje['5']+"%").addClass(auxPorcentaje(porcentaje['5']));
	$("#porcentaje_2").text(porcentaje['2']+"%").addClass(auxPorcentaje(porcentaje['2']));
	$("#porcentaje_1").text(porcentaje['1']+"%").addClass(auxPorcentaje(porcentaje['1']));
	$("#porcentaje_50c").text(porcentaje['50c']+"%").addClass(auxPorcentaje(porcentaje['50c']));
	

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
	ccv_leerTubos();
	setTimeout(function(){
		retirarMonedas('','reiniciar');
		$("#retirar_10").text(ccv_arr_monedas_tubos.P10);
		$("#retirar_5").text(ccv_arr_monedas_tubos.P5);
		$("#retirar_2").text(ccv_arr_monedas_tubos.P2);
		$("#retirar_1").text(ccv_arr_monedas_tubos.P1);
		$("#retirar_50c").text(ccv_arr_monedas_tubos.G50);
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
	ccv_runTestMatriz();
}

function cargaPredeterminada(){
	//	se deshabilita el monedero, para que no reciba monedas antes de tiempo
	//setTimeout(function(){ccv_configMonedero("01","00","00");},800);
	setTimeout(function(){
		ccv_leerTubos();
	},300);
	if(pageActive=="control.index" || pageActive=="control.dispositivos" || pageActive=="control.planograma"){
		addLog("log",pageActive);
		setTimeout(function(){
			ccv_configMonedero("00","00","00");
			if(typeof putMoneyOnView != undefined && typeof putOnView === "function"){
				isOnControlPanel=true;
				putOnView();
			}
		},600);
	}
	else{
		setTimeout(function(){
			//BilletesAceptables();
			ccv_configMonedero("00","00","00");
			
		},600);
		setTimeout(function(){ccv_configBilletero("00","00")},900);
	}
	
}

function terminarCargaMonedas(){
	$('#ingresoDinero').modal('hide');
	
	$('body').removeClass('modal-open');
	$('.modal-backdrop').remove();
	
	$('#ingresoEfectivo').hide();
	ccv_SoftReload();
	//se restablecen los valores de carga, como configuracion de monedero, billetero, lectura de monedas, etc
	setTimeout(function(){
		cargaPredeterminada();
	},300);
}
function terminarRetiroEfectivo(){
	$("#retiraDinero").hide().removeClass('show');
	/*$("#retiraDinero").hide();
	$('body').removeClass('modal-open');
	$('.modal-backdrop').remove();*/
}

function cancelarProcesoDePago(){
	ccv_leerTubos();
	setTimeout(function(){ccv_leerBilletero();},300);

	$(".process-img").hide();
	$("#label-inferior").text("Tiempo agotado, cancelando");
	$("#TIMEOUT").show();
	if(owl_amount_inserted > 0){
		owl_change=owl_amount_inserted;
		setTimeout(function(){ccv_devolverCambioMonedas_V2();},300);
		setTimeout(function(){owlDisableBillPurse()();},600);
		//setTimeout(function(){owlDisableCoinPurse()();},1000);
		//setTimeout(function(){deshabilitarNayax();},1600);
		entregaMonedasProcess("view");
	}else{
		setTimeout(function(){
			$("#proceso_venta").modal('hide');
			$("#preview").modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			ccv_SoftReload();
		},1000);
		setTimeout(function(){owlDisableBillPurse()();},600);
		setTimeout(function(){owlDisableCoinPurse()();},1000);
		setTimeout(function(){deshabilitarNayax();},1600);
	}
	send(formData('CANCELADOTIMEOUT',id_movimiento_dec));
}



function terminarProcesoDePago(){
	setTimeout(function(){owlDisableBillPurse()();},600);
	setTimeout(function(){owlDisableCoinPurse()();},1000);
	//setTimeout(function(){deshabilitarNayax();},1600);
	$(".process-img").hide();
	$("#comprobante").show();
	/*$("#proceso_venta").modal('hide');
	$("#preview").modal('hide');
	$('body').removeClass('modal-open');
	$('.modal-backdrop').remove();*/

	
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
				ccv_SoftReload();
			}
		},ccv_ext_senseInterval)
	}
	
}



//devolver cambio solo con monedero dependiendo la lectura de tubos
function ccv_devolverCambioMonedas_V2(){
	totalMonedasTubos=
					(ccv_arr_monedas_tubos.G50*.5)+
					(ccv_arr_monedas_tubos.P1*1)+
					(ccv_arr_monedas_tubos.P2*2)+
					(ccv_arr_monedas_tubos.P5*5)+
					(ccv_arr_monedas_tubos.P10*10);
	totalBilletesRecycler=
					(ccv_arr_billetes_stacker.P20*20)+
					(ccv_arr_billetes_stacker.P50*50);
    let m50c=0; // *se reemplaza por 5p* la configuracion no tendra para devolver de 50c
    let m1p=0;
    let m2p=0;
    let m5p=0;
    let m10p=0;
    let b20p=0;
    let b50p=0;

    let ncambio=owl_change;
    
    addLog("log","billetes disponibles");
    addLog("log",ccv_arr_billetes_stacker);

    addLog("log","Monedas disponibles");
    addLog("log",ccv_arr_monedas_tubos);
    if(owl_change > 0){
        
        for(let i=0;i<20;i++){
            //si el cambio esta en 0 se termina el for 
            if(ncambio == 0){
                break;
            }

                //##BILLETES
            else if((ncambio-50) >= 0 && ccv_arr_billetes_stacker.P50 > b50p){
                b50p++;
                ncambio-=50;
            }

            else if((ncambio-20) >= 0 && ccv_arr_billetes_stacker.P20 > b20p){
                b50p++;
                ncambio-=20;
            }
            
                //##MONEDAS
            else if((ncambio-10) >= 0 && ccv_arr_monedas_tubos.P10 > m10p){
                m10p++;
                ncambio-=10;
            }
            else if((ncambio-5) >= 0 && ccv_arr_monedas_tubos.P5 > m5p){
                m5p++;
                ncambio-=5;
            }
            else if((ncambio-2) >= 0 && ccv_arr_monedas_tubos.P2 > m2p){
                m2p++;
                ncambio-=2;
            }
            else if((ncambio-1) >= 0 && ccv_arr_monedas_tubos.P1 > m1p){
                m1p++;
                ncambio-=1;
            }
            else if((ncambio-.5) >= 0 && ccv_arr_monedas_tubos.G50 > m50c){
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
    if(owl_change > (totalMonedasTubos)+totalBilletesRecycler){	
    	addLog("log","El cambio es mas de lo que tiene el monedero");
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
            "p50":b50p
        },
        "cambio":owl_change
    });
    unparsedArrJ=JSON.parse(arrJ);
    if(unparsedArrJ.cambio>0){
        
        //evaluar si monedas seran dispensadas
        let dispensarMonedas=false;

        $.each(unparsedArrJ.billetes,function(index,value){
            if(!dispensarMonedas && value>0){
               dispensarMonedas=true;
            }
        });

        $.each(unparsedArrJ.monedas,function(index,value){
            if(!dispensarMonedas && value>0){
               dispensarMonedas=true;
            }
        });


        
        addLog("log","validacion:");
        addLog("log",unparsedArrJ);

        if(dispensarMonedas){

        	dm50c=unparsedArrJ.monedas.c50.toString(16);
            dm1=unparsedArrJ.monedas.p1.toString(16);                        
            dm2=unparsedArrJ.monedas.p2.toString(16);                        
            dm5=unparsedArrJ.monedas.p5.toString(16);                        
            dm10=unparsedArrJ.monedas.p10.toString(16); 
            dm20=unparsedArrJ.billetes.p20.toString(16);  
            dm50=unparsedArrJ.billetes.p50.toString(16);                        
            var type="00";
            var qant="00";

            if (b20p>0) {
                type="00";
                qant="0"+unparsedArrJ.billetes.p20.toString();
            }

            if (b50p>0) {
                type="01";
                qant="0"+unparsedArrJ.billetes.p50.toString();
            }
            addLog("log","retirando:"+dm5);
            setTimeout(function(){ccv_RetirarMonedas(dm50c,dm1,dm2,dm5,dm10);},200);
            setTimeout(function(){ccv_RetirarBilletes(type.toString(),qant);},800);
            ;

        }else {
        	setTimeout(function(){ccv_RetirarMonedas("00","00","00","00","00");},200);
       
        	setTimeout(function(){ccv_RetirarBilletes("00","00");},800);
        }
        
    }else{
        //No hay cambio que devolver
    }
}



function BilletesAceptables(){
	respuestaL=3;
	totalMonedasTubos=
					(ccv_arr_monedas_tubos.G50*.5)+
					(ccv_arr_monedas_tubos.P1*1)+
					(ccv_arr_monedas_tubos.P2*2)+
					(ccv_arr_monedas_tubos.P5*5)+
					(ccv_arr_monedas_tubos.P10*10);
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
            else if((ncambio-10) >= 0 && ccv_arr_monedas_tubos.P10 > m10p){
                m10p++;
                ncambio-=10;
            }
            else if((ncambio-5) >= 0 && ccv_arr_monedas_tubos.P5 > m5p){
                m5p++;
                ncambio-=5;
            }
            else if((ncambio-2) >= 0 && ccv_arr_monedas_tubos.P2 > m2p){
                m2p++;
                ncambio-=2;
            }
            else if((ncambio-1) >= 0 && ccv_arr_monedas_tubos.P1 > m1p){
                m1p++;
                ncambio-=1;
            }
            else if((ncambio-.5) >= 0 && ccv_arr_monedas_tubos.G50 > m50c){
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
		//	El cambio esta en cero, no se devuelve nada
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
	respuestaL=3;
	totalMonedasTubos=
					(ccv_arr_monedas_tubos.G50*.5)+
					(ccv_arr_monedas_tubos.P1*1)+
					(ccv_arr_monedas_tubos.P2*2)+
					(ccv_arr_monedas_tubos.P5*5)+
					(ccv_arr_monedas_tubos.P10*10);
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
            else if((ncambio-10) >= 0 && ccv_arr_monedas_tubos.P10 > m10p){
                m10p++;
                ncambio-=10;
            }
            else if((ncambio-5) >= 0 && ccv_arr_monedas_tubos.P5 > m5p){
                m5p++;
                ncambio-=5;
            }
            else if((ncambio-2) >= 0 && ccv_arr_monedas_tubos.P2 > m2p){
                m2p++;
                ncambio-=2;
            }
            else if((ncambio-1) >= 0 && ccv_arr_monedas_tubos.P1 > m1p){
                m1p++;
                ncambio-=1;
            }
            else if((ncambio-.5) >= 0 && ccv_arr_monedas_tubos.G50 > m50c){
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
	setTimeout(function(){owlDisableCoinPurse()()},200);
	setTimeout(function(){owlDisableBillPurse()()},1000);
	

	//setTimeout(function(){deshabilitarNayax()},1500);
}