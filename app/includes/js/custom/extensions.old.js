//tiempo despues de que la entrega comienza
const TIEMPO_RELOAD=10000;
//tiempo de espera para las respuestas
const TIEMPO_RESPONSE=4000;
// TIMEPO EN MOTORES la formula aplicada para calcular
// si quiero 2 segundos
// (2*10)=20 una vez se tiene este resultado se convierte a hexadecimal
// ccv_DecToHex((2*10));
// 0 = por sensor
var TIEMPO_MOTORES="00"/*ccv_DecToHex((3*10))*/;
$(function(){
	//rfid_conectar();
	if(typeof ccv_conectar === "function"){
		ccv_conectar();
	}
	if(typeof ccvJofemarConnect === "function"){
		ccvJofemarConnect();
	}
	if(typeof ccvJofemarConnect === "function"){
		setTimeout(()=>{
			ccvSlaveJofemarConnect();
		},100)
	}
});

function printInRfid_input(codigo){
	if($("#rfid-uuid").length > 0){//Venta
		uuid=$("#rfid-uuid");
		//console.log(uuid[0].disabled);
		if(uuid[0].disabled==true){
			console.log("StandBy");
		}else{
				uuid.val(codigo);
				listener(uuid.val());

		}
	}else if($("#UUID").length > 0){//Alta RFID
		uuid=$("#UUID");
		if(uuid.attr("disabled")){
			console.log("No esta activa la compra");
		}else{
				uuid.val(codigo);

		}
	}else if($("#rfid-login").length > 0){//Login
		uuid=$("#rfid-login");
		if(uuid.attr("disabled")){
			console.log("No esta activa la compra");
		}else{
			console.log(codigo);
			if (codigo.length>8) {
				sendLogin(formData("loginRFID",codigo));
			}

		}
	}
}
var waitingForSense;
function waitForDownProduct(seleccion,id_movimiento){
	waitingForSense=setInterval(function(){
		if(ccv_estatus_dispensado == undefined){
		}else if(ccv_estatus_dispensado){
			clearInterval(waitingForSense);
			waitingForSense=undefined;
			$(".proceso-venta").hide();
			$(".process-img").hide();
			$("#PRODUCTOENTREGADO").fadeIn();
			$("#label-inferior").text("Recoja su producto");
			$("#listenCash").fadeIn();
			send(formData("restaStock",seleccion));
			if (typeMov=="EMV") {
				$('.process-img').hide();$('#comprobante').show();
			}else{
				setTimeout(function(){
					location.reload();
				},2000);
			}

		}else if(!ccv_estatus_dispensado){
			clearInterval(waitingForSense);
			waitingForSense=undefined;
			$("#ticketIngresado").val("CANCELADO");
			$("#ticketCambio").val("NO COBRADO");
			$(".proceso-venta").hide();
			$("#label-inferior").html("Producto no entregado <br> Revise con su Administrador");
			$("#listenCash").fadeIn();
			send(formData("nodispensado",id_movimiento));
			if (typeMov=="EMV") {
				$('.process-img').hide();$('#comprobante').show();cancelacion();
			}else{
				setTimeout(function(){
					$('.modal').modal('hide');
					//$('#proceso_venta').modal('hide');
					$('.modal-backdrop').remove();
				},2000);
			}
		}
	},500);

}
function ccv_ext_waitForDownProductTest(seleccion){
	console.log("esperando caida");
	ccv_waitingForSense=setInterval(function(){
		if(ccv_estatus_dispensado == undefined){
			//	...	No hace nada, ya que si esta indefinida significa que la respuesta no ha llegado aun
			//	...	Se pone en if ya que podria ser util despues
		}else if(ccv_estatus_dispensado){
			$(".dispensing-process").hide();
			$("#div-entregado").show();
			ccv_estatus_dispensado=undefined;
			setTimeout(function(){
				$(".dispensing-process").hide();
				$("#standby").show();
				$(".btn-controls").show();
				$('.modal').modal('hide');
				$('.modal-backdrop').remove();
			},500);
		}else if(!ccv_estatus_dispensado){
			$(".dispensing-process").hide();
			$("#standby").hide();
			$("#div-no-entregado").show();
			ccv_estatus_dispensado=undefined;
			setTimeout(function(){
				$(".dispensing-process").hide();
				$("#standby").show();
				$(".btn-controls").show();

				$('.modal').modal('hide');
				$('.modal-backdrop').remove();
			},500);
		}
	},500);
}
function sinBoarddroid(){
	let f_device = document.getElementById('ccv_jofemar_device_not_detected');
	let f_machine = document.getElementById('notBoarddroid');
	f_device.style.display = '';
	f_machine.style.display = '';
	document.querySelector('body').classList.add('ccv-jofemar-overflow-hidden');
    //$("#notBoarddroid").show();
    //$("body").addClass("notOverflow");
}
function conBoarddroid(){
	let f_device = document.getElementById('ccv_jofemar_device_not_detected');
	let f_machine = document.getElementById('notBoarddroid');
	f_device.style.display = 'none';
	f_machine.style.display = 'none';
	document.querySelector('body').classList.remove('ccv-jofemar-overflow-hidden');
    //$("#notBoarddroid").hide();
    //$("body").removeClass("notOverflow");
}
function sinRFID(){
    $("#notRFID").show();
    $("body").addClass("notOverflow");
}
function conRFID(){
    $("#notRFID").hide();
    $("body").removeClass("notOverflow");
}

function startActions(){
	setTimeout(function(){deshabilitarMonedero()},200);
	setTimeout(function(){deshabilitarBilletero()},1000);
	//setTimeout(function(){deshabilitarNayax()},1500);
}


function habilitarMonedero(){
	console.log("Habilitar Monedero");
	setTimeout(function(){ccv_configMonedero("01","00","00");},500);
}

function habilitarBilletero(){
	console.log("Habilitar Billetero");
	setTimeout(function(){ccv_configBilletero("01","00")},500);
}

function habilitarNayax(){
	console.log("Habilitar Nayax");
	//0x01 0x0B 0x00 0x01 0x00 0x13 0x00 0x00 0xF2 0xDF
	ccv_nayaxCashless("01",seleccion_dec,"00","00",ccv_precio,"00");
}


function deshabilitarMonedero(){
	console.log("deshabilitar Monedero");
	ccv_configMonedero("00","00","00");
	
}

function deshabilitarBilletero(){
	console.log("deshabilitar Billetero");
	ccv_configBilletero("00","00");
}

function deshabilitarNayax(){
	console.log("deshabilitar Nayax");
	ccv_nayax("00")
}
