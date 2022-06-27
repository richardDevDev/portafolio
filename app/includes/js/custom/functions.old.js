var codes_remote=new Array;
var _sup_id_movimiento_;
var __type_project__ = "ams";
var id_variante=0;
var btnVariant=false;
var timerCancelOperation=15;
var seleccion=new Array;
var counter_timeOut=0;
var timeoutTest=50;
var counter_panel=0;
var terminar=false;
var timeoutGeneral=0;
var ventaArr=new Array;
var selectArr=new Array;
var timer=0;
var timerCam=0;
var exacto=0;
var contador=0;
var testSelection=0;
var testIdVending=1;
var typeMov=undefined;
var uuid_seleccion_db = 0;
var id_vending_seleccion_db = 0;
var redeem_code="";
var remoteValidation=false;
var formatNumber = {
 separador: ",", // separador para los miles
 sepDecimal: '.', // separador para los decimales
 formatear:function (num){
 num +='';
 var splitStr = num.split('.');
 var splitLeft = splitStr[0];
 var splitRight = splitStr.length > 1 ? this.sepDecimal + splitStr[1] : '';
 var regx = /(\d+)(\d{3})/;
 while (regx.test(splitLeft)) {
 splitLeft = splitLeft.replace(regx, '$1' + this.separador + '$2');
 }
 return this.simbol + splitLeft +splitRight;
 },
 new:function(num, simbol){
 this.simbol = simbol ||'';
 return this.formatear(num);
 }
}

function formData(handler,value){
	var form= new FormData();
	form.append("handler",handler);
	form.append("value",value);
	return form;
}
function formValidate(input){
	var elementos = $("."+input);
	var form = new FormData();
	var j=0;
	var faltan="";
	var cont=0;
	for (var i=0; i<elementos.length; i++) {
		if ($(elementos[i]).hasClass("notnull")) {
			//Busca si el elemento tiene la clase notnull
			if (elementos[i].value=="") {
				faltan+=$("#label-"+elementos[i].id).text()+'<br>';
			}
		}
		if (elementos[i].type=="file") {
			if(elementos[i].value!=""){
				form.append(elementos[i].id,elementos[i].files[cont]);
				cont++;

			}
		}else{
			form.append(elementos[i].id,elementos[i].value);
		}
		
	}
	if (faltan!="") {
		swal("Validacion","Los siguientes campos son obligatorios<br>"+faltan,"error");
	}else{
		form.append("handler",input);
		send(form);
	}
}

function send(datos){
	$.ajax({
		url:   BASE_URL+'/app/handlers/ajax.handler.class.php',
		type:  'POST',
		dataType: "html",
		data:  datos,
		processData: false,
		contentType: false,
		cache: false,
		beforeSend: function () {
		        $("#submit").attr("disabled","true");
		},
		error: function(){
			$("#connectionok").hide();
			$("#connectionno").show();
		}
		,
		success:  function (response) {
			$("#connectionok").show();
			$("#connectionno").hide();
			addLog("log",response);
			result=JSON.parse(response);
			switch (result.no){
				case 'remoteLogin':
					remoteLoginQR(result);
					break;

				case "CODES_REMOTE":
				$("#code_show").modal();
				$(".code_show").hide();
					if(result.message == 'false'){
						$(".syncAllBtn").hide();
							tbody.append("<tr><td colspan='4' class='text-center label'>Sin Códigos para Sincronizar</td></tr>");
					}else{
						console.log(result.message);
						$(".syncAllBtn").show();
						var tbody=$("#tbody_codes");
						tbody.text("");
						var data=result.message.codigos;
						if(data.length>0){
							for(var i=0;i<data.length;i++){
								if (data[i].codigo!="") {
									codes_remote.push(data[i].codigo);
									if (data[i].estatus=="LIBRE") {}
									tbody.append("<tr><td>"+data[i].codigo+"</td><td>"+(data[i].cantidad.toUpperCase())+"</td><td>"+data[i].estatus+"</td><td id='sync_"+data[i].codigo+"'><input type='button' class='btn btn-success btn-sm syncBtn' style='font-size:8pt' value='Sinc. Manual' onclick='sincronizar(`"+data[i].codigo+"`)'></td></tr>");
								}
								
							}
						}else{
							$(".syncAllBtn").hide();
							tbody.append("<tr><td colspan='4' class='text-center label'>Sin Códigos para Sincronizar</td></tr>");
						}
						
						console.log(codes_remote);
						$("#code_table").show();
					}
					break;
				case "SYNCCODE":
				$("#sync_"+result.code).text("");
				if (result.type=="success") {
					$("#sync_"+result.code).text("Sincronizado Correctamente");
				}else{
					$("#sync_"+codigo).append('<input type="button" class="btn btn-danger btn-sm syncBtn" style="font-size:8pt" value="Intentar de Nuevo" onclick="sincronizar('+result.code+')>"');
				}

				break;
				case "REDIRECT":
					if(result.type == 'success'){
						location.href = BASE_URL+'/'+result.url;
					}else{
						Swal.fire({
							icon: "error",
							title: result.title,
							html: result.message,
							showConfirmButton: false,
							timer: 3500
						})
						addLog('warn',result);
					}
					break;
				case 'remoteTestEngines':
					remoteTestEnginesQR(result);
					break;
				case "TESTENGINES":
					$('.modal').modal('hide');
					if(result.type == 'success'){
						$('#testEnginesModal').modal('show');
					}else{
						Swal.fire({
							icon: "error",
							title: result.title,
							html: result.message,
							showConfirmButton: false,
							timer: 3500
						})
						addLog('warn',result);
					}
					break;
					
				case 'WEBPAYDISPENSE':
				ajaxProcess=result.no;
				if (result.type=="success") {
					$(".bill-bar").hide();
					$("#preview").hide();
					$("#proceso_venta").modal({backdrop: 'static', keyboard: false}); 
					$("#ticketFecha").text(result.fecha);
					$("#ticketProducto").text(result.clave_articulo);
					$(".proceso-venta").hide();
					$("#listenCash").show();
					$("#id_movimiento").val(result.message);
					$(".folio").text("Folio: "+result.folio);
					$(".seleccion").text("Sel: "+result.seleccion);
					$(".total").text("$ "+parseFloat(result.precio).toFixed(2))
					seleccion_dec=result.seleccion;
					$(".process-img").hide();
					$("#DISPENSANDO").fadeIn();
					id_movimiento=result.message;
					seleccion=result.seleccion;
					uuid_seleccion_db=result.uuid;
					id_vending_seleccion_db=result.id_vending;


					if(__type_project__ === "jofemar"){
						let str_selection = seleccion.toString();
						let dispense_tray = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[0]+''+str_selection[1])+128));
						let dispense_channel = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[2])+128));

						ccvJofemarEnginesMatrix(master_machine_select,dispense_tray,dispense_channel)
						ccvJofemarExtWaitForProductDown();
					}
					else{
						setTimeout(() => {
							extOwlWaitingForSense(seleccion,id_movimiento);
							owlEnginesMatrix(owlDecToHex(seleccion),"00",owl_time_response_engines);
						}, 1000);
					}

					

					//ccv_ext_waitForDownProduct(seleccion_dec,result.message);
					//setTimeout(function(){ccv_matrizMotores(owlHexToDec(seleccion_dec),"00","00");;},600);
				}else{
					
					$("#preview").modal("hide");
					$('.proceso-venta').hide();
					$('#NOREAD').show();

					setTimeout('$("#proceso_venta").modal("hide");$(".bill-bar").show();',2000);
					ajaxProcess=undefined;
					keyCodeRepeat=0;
					keyCode="";
					//Swal.fire("Código no válido","Contacta con el operador, el código presentado no parece válido o ya ha sido canjeado","error");

				}

				case 'CODEREDEEM':
				ajaxProcess=result.no;
				if (result.type=="success") {
					$(".bill-bar").hide();
					$("#preview").hide();
					$("#proceso_venta").modal({backdrop: 'static', keyboard: false}); 
					$("#ticketFecha").text(result.fecha_consultado);
					$("#ticketProducto").text(result.cve);
					$(".proceso-venta").hide();
					$("#listenCash").show();
					$("#id_movimiento").val(result.id_movimiento);
					$(".folio").text("Folio: "+result.fol);
					$(".seleccion").text("Sel: "+result.sel);
					$(".total").text("$ "+parseFloat(result.tot).toFixed(2))
					seleccion_dec=result.sel;
					redeem_code=result.code;
					$(".process-img").hide();
					$("#DISPENSANDO").fadeIn();
					id_movimiento=result.id_movimiento;
					_sup_id_movimiento_=result.id_movimiento;
					seleccion=result.sel;
					uuid_seleccion_db=result.uuidx;
					id_vending_seleccion_db=result.id_vending;


					if(__type_project__ === "jofemar"){
						let str_selection = seleccion.toString();
						let dispense_tray = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[0]+''+str_selection[1])+128));
						let dispense_channel = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[2])+128));

						ccvJofemarEnginesMatrix(master_machine_select,dispense_tray,dispense_channel)
						ccvJofemarExtWaitForProductDown();
					}
					else{
						setTimeout(() => {
							extOwlWaitingForSense(seleccion,id_movimiento);
							owlEnginesMatrix(owlDecToHex(seleccion),"00",owl_time_response_engines);
						}, 1000);
					}

					

					//ccv_ext_waitForDownProduct(seleccion_dec,result.message);
					//setTimeout(function(){ccv_matrizMotores(owlHexToDec(seleccion_dec),"00","00");;},600);
				}else{
					
					$("#preview").modal("hide");
					$('.proceso-venta').hide();
					$('#NOREAD').show();

					setTimeout('$("#proceso_venta").modal("hide");$(".bill-bar").show();',2000);
					ajaxProcess=undefined;
					keyCodeRepeat=0;
					keyCode="";
					//Swal.fire("Código no válido","Contacta con el operador, el código presentado no parece válido o ya ha sido canjeado","error");

				}

					;
				break;
				case "LOGINEMV":
					start(result.message[0]);

					//error("fail-login");
				break;
				case "01":
					billetesAceptados(result.message);
				break;
				case "92":
					Swal.fire({
					  title: 'Mensaje',
					  text: result.message,
					  icon: result.type,
					  showCancelButton: false,
					  confirmButtonColor: '#3085d6',
					  confirmButtonText: 'Corregir!'
					}).then((result) => {

					})
				break;
				case "93":
					$(".messageModal").text(result.message);
					setTimeout('$(".messageModal").text("");',2500);
				break;
				case "94":
					$(".message").text(result.message);
					setTimeout('$(".message").text("");',1500);
				break;
				case "95":
					Swal.fire({
						  title: 'Mensaje',
					  text: result.message,
					  icon: result.type,
					  showCancelButton: false,
					  confirmButtonColor: '#3085d6',
					  confirmButtonText: 'Aceptar!'
					}).then((result) => {
					  if (result.value) {
					   	window.location.reload();
					  }
					})
				break;
				case "96":
					addLog("log",result);
				break;

				case "110":
					Swal.fire({
						title: 'Mensaje',
					  	text: result.message,
					  	icon: result.type,
					  	showCancelButton: false,
					  	confirmButtonColor: '#3085d6',
					  	confirmButtonText: 'Aceptar!'
					})
				break;
				case "97":
					if (result.message[0].id_movimiento>0) {
						if (window.location.pathname!="/puerta") {
							location.href="puerta";
						}
					}else{
						if (window.location.pathname!="/venta") {
							location.href="venta";
						}

					}
					setTimeout("puerta()",5000);
				break;
				case "98": //Precarga inicial devuelve el id del movimiento
				//addLog("log",response);
					$("#id_movimiento").val(result.message);
					//alert(result.message);
						switch(result.tipo_movimiento){

							case 'INGRESO':
								$("#ingresoEfectivo-fecha").text(result.fecha);
								$("#ingresoEfectivo-id").text(result.message);
								$("#ingresoEfectivo-proceso").text("INGRESO");
								formValidate("listenEstatus");
							break;
							case 'LEER':
								//$(".leerProcess").hide();
								//$("#lectura").fadeIn();
								formValidate("listenEstatus");
							break;
							case 'CARGA':
								$("#ingresoEfectivo-fecha").text(result.fecha);
								$("#ingresoEfectivo-id").text(result.message);
								$("#ingresoEfectivo-proceso").text("INGRESO");
								$("#ticketFecha").text(result.fecha);
								$("#movimiento-ticket").text(result.tipo_movimiento);
								formValidate("listenEstatus");
							break;
							case 'RETIRO-CONTROL':
								$(".retiroProcess").hide();
								$("#controlsRetiro").hide();;
								$("#ticketFecha").text(result.fecha);
								$("#loadingRetiro").fadeIn();
								formValidate("listenEstatus");
							break;
						}
				break;

				case "CASH": //Cash Payment-Primera respuesta
					$(".seleccion").text(result.seleccion);
					$(".folio").text(result.folio);
					$("#qrTicket").text("");
					var qrcode = new QRCode("qrTicket");
					qrcode.makeCode(result.codeURL);
					timeoutGeneral=result.timeout;
					seleccion=result.seleccion;
					uuid_seleccion_db=result.uuid;
					id_vending_seleccion_db=result.id_vending;
					
					counter_timeOut=timeoutGeneral;

					_sup_id_movimiento_ = result.message;

					setTimeout(function (){
						$(".proceso-venta").hide();
						$("#COBRAREFECTIVO").show();
						$("#CASHVOUCHER").show();
						$("#id_movimiento").val(result.message);
						
						$("#movimiento").text("Folio #"+result.message);

						seleccion=result.seleccion;
						uuid_seleccion_db=result.uuid;
						id_vending_seleccion_db=result.id_vending;
						


						if(__type_project__ === "jofemar"){
							let str_selection = seleccion.toString();
							let dispense_tray = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[0]+''+str_selection[1])+128));
							let dispense_channel = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[2])+128));
						}
						else{
							
						}

						formValidate("listenCash");
						setTimeout(function(){owlEnableCoinPurse()},200);
						setTimeout(function(){owlEnableBillPurse()},300);

						/*
							ccvJofemarEnginesMatrix(parseInt(id_vending_seleccion_db),dispense_tray,dispense_channel)
							ccvJofemarExtWaitForProductDown();
						*/
						//ccv_matrizMotores(owlHexToDec(result.seleccion),"00",owl_time_response_engines);
						//ccv_ext_waitForDownProductTest(result.seleccion);	
					},500);
					timeout({"type":'start',"timeout":result.timeout});

				break;

				case "EMV": //Cashless Payment-primera respuesta

					$("#qrTicket").text("");
					var qrcode = new QRCode("qrTicket");
					qrcode.makeCode(result.codeURL);
					$("#ticketFecha").text(result.fecha);
					$("#id_movimiento").val(result.message);
					_sup_id_movimiento_ = result.message;
					$(".proceso-venta").hide();
					$("#listenCash").show();
					$(".folio").text("Folio: "+result.folio);
					$(".seleccion").text("Sel: "+result.seleccion);
					$(".process-img").hide();
					$("#COBRARCASHLESS").fadeIn();
					$("#CASHLESSVOUCHER").show();
					timeoutGeneral=result.timeout;
					counter_timeOut=timeoutGeneral;
					timerPinpad(result.timeout);

					seleccion=result.seleccion;
					uuid_seleccion_db=result.uuid;
					id_vending_seleccion_db=result.id_vending;
					
					Login();
				break;

				case "TESTREMOTE":
					seleccion=result.seleccion;
					uuid_seleccion_db=result.uuid;
					id_vending_seleccion_db=result.id_vending;
					_sup_id_movimiento_ = result.message;

					setTimeout(function(){send(formData("listenRemote",_sup_id_movimiento_))},1000);

				break;

				case "listenRemote":
					$(".dispensing-process").hide();
					switch(result.estatus){
						case "COBRAR":
							$("#div-connecting").show();
							setTimeout(function(){send(formData("listenRemote",_sup_id_movimiento_))},2000);
							remoteValidation=false;
						break;
						case "CONFIRMANDO":
							$("#div-esperandoConfirmacion").show();
							setTimeout(function(){send(formData("listenRemote",_sup_id_movimiento_))},2000);
							remoteValidation=false;
						break;

						case "DISPENSANDO":
							$("#div-dispensando").show();
							setTimeout(function(){send(formData("listenRemote",_sup_id_movimiento_))},2000);
							remoteValidation=false;
						break;
						case "PAGADO":
							$("#div-entregado").show();
							remoteValidation=true;
				       
						break;

						case "CANCELADO":
							$("#div-cancelado").show();
							remoteValidation=true;
						break;

						case "TIMEOUT":
							$("#div-timeout").show();
							remoteValidation=true;
						break;
						case "NODISPENSADO":
							$("#div-no-entregado").show();
							remoteValidation=true;
						break;
						case "NOCONFIRMADO":
							$("#div-noconfirm").show();
							remoteValidation=true;
						break;
						case "ERROR":
							$("#div-error").show();
							remoteValidation=true;
						break;
					}

					if(remoteValidation){
						 $("#terminarPruebaDispensado").show();
			             setTimeout(function(){
			                $('.dispensing-process').hide();$('#div-start').hide();
			                $("#standby").show();
			                $('#editSeleccion').modal("hide");
			                $(".btn-controls").show();
			             },1000);
					}

					
				break;

				case "FREE": //Cashless Payment-primera respuesta
					ajaxProcess="FREE";
					$("#qrTicket").text("");
					var qrcode = new QRCode("qrTicket");
					qrcode.makeCode(result.codeURL);
					$("#ticketFecha").text(result.fecha);
					$("#id_movimiento").val(result.message);
					_sup_id_movimiento_ = result.message;
					$(".proceso-venta").hide();
					$("#listenCash").show();
					$(".folio").text("Folio: "+result.folio);
					$(".seleccion").text("Sel: "+result.seleccion);
					$(".process-img").hide();
					$("#COBRARCASHLESS").fadeIn();
					$("#CASHLESSVOUCHER").show();
					timeoutGeneral=result.timeout;
					counter_timeOut=timeoutGeneral;

					seleccion=result.seleccion;
					uuid_seleccion_db=result.uuid;
					id_vending_seleccion_db=result.id_vending;
					

					test();
					//Login();
				break;
				case "101":
				addLog("log","deprecated");
					/*setTimeout(function (){
						$(".dispensing-process").hide();
						$("#div-preparando").show();
						if ($("#id_movimiento").val()=="") {
							$("#id_movimiento").val(result.message);
							$("#movimiento").text("Folio #"+result.message);
						}
						let str_selection = seleccion.toString();
						let dispense_tray = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[0]+''+str_selection[1])+128));
						let dispense_channel = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[2])+128));
					
						ccvJofemarEnginesMatrix(parseInt(master_machine_select),dispense_tray,dispense_channel)
						ccvJofemarExtWaitForProductDown();
						
						//ccv_matrizMotores(owlHexToDec(result.seleccion),"00",owl_time_response_engines);
						//ccv_ext_waitForDownProductTest(result.seleccion);
						$("#folio").text("Folio: "+result.message);
					},500);
					timeout({"type":'start',"timeout":result.timeout});*/
				break;
				case "102"://Cash Estatus
					$("#total").text("$ "+formatNumber.new(parseFloat(result.total).toFixed(2)));
					if (result.ingresado==null) {
						$("#ingresado").text("$ 0.00");
					}else{
						$("#ingresado").text("$ "+formatNumber.new(parseFloat(result.ingresado).toFixed(2)));
					}
					if (result.cambio==null) {
						$("#cambio").text("$ 0.00");
					}else{
						$("#cambio").text("$ "+formatNumber.new(parseFloat(result.cambio).toFixed(2)));
					}
					$("#total").text("$ "+formatNumber.new(parseFloat(result.total).toFixed(2)));

					if (result.message!="COBRAR") {
						$(".process-img").hide();
						$("#"+result.message).fadeIn();
					}

					switch (result.message){
						case "COBRAR":
							$(".proceso-venta").hide();
							$("#label-inferior").text("Ingrese efectivo hasta cubrir el total");
							$("#listenCash").show();
							$("#controls-load").fadeIn();
							timeout({"type":'resta',"timeout":result.timeout});
							if (result.ingresadoDetalle!="No Existen Datos Disponibles") {
								fillBilletes(result.ingresadoDetalle);
							}
							setTimeout ('formValidate("listenEstatus")',500);
						break;
						case "RETIRO":
							$(".proceso-venta").hide();
							$("#label-inferior").text("Dispensando Cambio");
							$("#listenCash").fadeIn();
							setTimeout ('formValidate("listenEstatusPagado")',1000);

						break;
						case "FINLEER":
							$(".leerProcess").hide();
							$("#label-inferior").text("Leyendo Dispositivos");
							$("#lectura").fadeIn();
							lecturaDispositivos(result.ingresadoDetalle);

						break;
						case "CANCELADO":
							$(".proceso-venta").hide();
							$("#label-inferior").text("Cancelando Proceso");
							$("#listenCash").fadeIn();
							setTimeout ('formValidate("listenEstatusPagado")',1000);

						break;
						case "PAGADO":

							$(".proceso-venta").hide();
							$("#label-inferior").text("Espere mientras se dispensa su producto");
							$("#listenCash").fadeIn();
							setTimeout ('formValidate("listenEstatusPagado")',1000);
						break;
						case "DISPENSANDO":
							$(".process-img").hide();
							$("#label-inferior").text("Entregando Producto");
							$("#listenCash").fadeIn();
							setTimeout ('formValidate("listenEstatusPagado")',1000);
						break;
						case "PRODUCTODISPENSADO":
							$(".proceso-venta").hide();
							$("#label-inferior").text("Recoja su producto");
							$("#listenCash").fadeIn();
							setTimeout ('formValidate("listenEstatusPagado")',1000);
						break;
						case "PRODUCTONODISPENSADO":
							$("#ticketIngresado").val("CANCELADO");
							$("#ticketCambio").val("NO COBRADO");
							$(".proceso-venta").hide();
							$("#label-inferior").text("Producto no dispensado, generando devolución");
							$("#listenCash").fadeIn();
							setTimeout ('formValidate("listenEstatusPagado")',1000);
						break;
						case "TIMEOUT":
							$(".proceso-venta").hide();
							$("#label-inferior").html("Tiempo superado para esta operación<br> si ha ingresado efectivo espera a la devolución");
							$("#listenCash").fadeIn();
							timeout({"type":'resta',"timeout":result.timeout});
							setTimeout ('formValidate("listenEstatus")',2000);
						break;
						case "ENDPROCESS":
						$('.process-img').hide();$('#comprobante').show();
							if (typeof result.ingresadoDetalle!="undefined") {
								retiroTubos(result);
							}

							if (counter_timeOut==0) {
								$("#enviaCorreo").hide();
								$("#verComprobante").removeClass();
								$("#verComprobante").addClass("col-4 offset-4");
							}else{
								$(".proceso-venta").hide();
								$("#label-inferior").text("¿Que desea hacer ahora?");
								$("#listenCash").fadeIn();
								//setTimeout("location.reload();",5000);
								if (result.connection=="false") {
									$("#enviaCorreo").hide();
									$("#nocorreo").show();
								}
								/*Ticket*/
								$("#ticketIngresado").text("$ "+formatNumber.new(parseFloat(result.ingresado).toFixed(2)));
								$("#ticketCambio").text("$ "+formatNumber.new(parseFloat(result.cambio).toFixed(2)));
								$("#ticketTotal").text("$ "+formatNumber.new(parseFloat(result.total).toFixed(2)));
								$('#endTime').timer({
									countdown: true,
									duration: '240s',
									callback: function() {
										$('.modal').modal('hide');$('.modal-backdrop').remove();
									},
									repeat: false
								});
							}

						break;
					}
				break;
				case "103"://Cashless Estatus
					$("#total").text("$ "+formatNumber.new(parseFloat(result.total).toFixed(2)));
					if (result.ingresado==null) {
						$("#ingresado").text("$ 0.00");
					}else{
						$("#ingresado").text("$ "+formatNumber.new(parseFloat(result.ingresado).toFixed(2)));
					}
					if (result.message!="COBRAR") {
						$(".process-img").hide();
						$("#label-proceso").hide();
						$("#"+result.message).fadeIn();
					}
					switch (result.message){
						case "COBRAR":
							$(".proceso-venta").hide();
							$("#label-inferior").text("Esperando Respuesta del dispositivo de cobro");
							$("#listenCash").show();
							//setTimeout ('formValidate("listenEstatusPagadoCashless")',1000);
						break;
						case "ESPERANDOTARJETA":
							$(".proceso-venta").hide();
							$("#label-inferior").text("Siga las instrucciones del dispositivo");
							$("#listenCash").fadeIn();
							timeout({"type":'resta',"timeout":result.timeout});
							setTimeout ('formValidate("listenEstatusPagadoCashless")',1000);
						break;
						case "DISPENSANDO":
							$(".proceso-venta").hide();
							$(".proceso-venta").hide();
							$("#label-inferior").text("Entregando Producto");
							$("#listenCash").fadeIn();
							setTimeout ('formValidate("listenEstatusPagadoCashless")',1000);
						break;
						case "PRODUCTOENTREGADO":
							$("#label-inferior").text("Recoja su producto");
							$("#listenCash").fadeIn();
							setTimeout ('formValidate("listenEstatusPagadoCashless")',1000);
						break;
						case "PRODUCTONODISPENSADO":

							$("#ticketIngresado").val("CANCELADO");
							$("#ticketCambio").val("NO COBRADO");
							$(".proceso-venta").hide();
							$("#label-inferior").text("Producto no entregado, cobro no realizado, intente de nuevo");
							$("#listenCash").fadeIn();
							setTimeout ('formValidate("listenEstatusPagadoCashless")',1000);
						break;
						case "VENTANEGADA":
							$("#label-inferior").text("Contacte con su banco o verifique su saldo.");
							$("#listenCash").fadeIn();
							setTimeout ('formValidate("listenEstatusPagadoCashless")',1000);
						break;
						case "TIMEOUT":
							$(".proceso-venta").hide();
							$("#label-inferior").text("Tiempo de operacion excedido, ningun cobro se ha realizado");
							$("#listenCash").fadeIn();
							$("#ticketIngresado").text("CANCELADO TIEMPO DE ESPERA SUPERADO");
							$("#ticketCambio").text("NO COBRADO");
							$("#ticketTotal").text("$ "+formatNumber.new(parseFloat(result.total).toFixed(2)));
						break;
						case "ENDPROCESS":
						$('.process-img').hide();$('#comprobante').show();
						if (counter_timeOut==0) {
								$("#enviaCorreo").hide();
								$("#verComprobante").removeClass();
								$("#verComprobante").addClass("col-4 offset-4");
							}else{
								$(".proceso-venta").hide();
								$("#label-inferior").text("¡Gracias por su compra, Vuelva Pronto!");
								$("#listenCash").fadeIn();
								if (result.connection=="false") {
									$("#enviaCorreo").hide();
									$("#nocorreo").show();
								}
								/*Ticket*/
								if (result.ingresado==null) {
									$("#ticketIngresado").text("CANCELADO NO COBRADO");
								}else{
									$("#ticketIngresado").text("$ "+formatNumber.new(parseFloat(result.ingresado).toFixed(2)));
								}

								$("#ticketCambio").text("$ "+formatNumber.new(parseFloat(result.cambio).toFixed(2)));
								$("#ticketTotal").text("$ "+formatNumber.new(parseFloat(result.total).toFixed(2)));
								//setTimeout("location.reload();",5000);

							}
							$('#endTime').timer({
								countdown: true,
								duration: '150s',
								callback: function() {
									$('.modal').modal('hide');
										//$('#proceso_venta').modal('hide');
										$('.modal-backdrop').remove();
									//location.reload();
								},
								repeat: false
							});
						break;
					}
					if (terminar==true) {
							$(".proceso-venta").hide();
							$("#endCash").fadeIn();
					}
				break;
				case "104": //CashlessPinpad
					$("#total").text("$ "+formatNumber.new(parseFloat(result.total).toFixed(2)));
					if (result.ingresado==null) {
						$("#ingresado").text("$ 0.00");
					}else{
						$("#ingresado").text("$ "+formatNumber.new(parseFloat(result.ingresado).toFixed(2)));
					}
					if (result.message!="COBRAR") {
						$(".process-img").hide();
						$("#label-proceso").hide();
						$("#"+result.message).fadeIn();
					}
					switch (result.message){
						case "COBRAR":
						$("#timerPinpad0").timer('pause');
						setTimeout ('formValidate("listenEstatusPagadoCashlessEMV")',3000);
						break;
						case "DISPENSANDO":
						$(".btn_cancel_proccess_payment").hide();
							$(".proceso-venta").hide();
							$(".process-img").hide();
							$("#DISPENSANDO").show();
							$("#label-inferior").text("Entregando Producto");
							$("#listenCash").fadeIn();
							typeMov="EMV";

							//ccvJofemarEnginesMatrix
							//uuid_seleccion_db

							if(__type_project__ === "jofemar"){
								let str_selection = seleccion.toString();
								let dispense_tray = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[0]+''+str_selection[1])+128));
								let dispense_channel = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[2])+128));
								//alert(id_vending_seleccion_db+' | '+dispense_tray+' | '+dispense_channel);

								addLog("log","seleccion",seleccion);
								addLog("log","tray",dispense_tray);
								addLog("log","channel",id_vending_seleccion_db);
							
								ccvJofemarEnginesMatrix(master_machine_select,dispense_tray,dispense_channel)
								ccvJofemarExtWaitForProductDown();
							}
							else{
								setTimeout(() => {
									extOwlWaitingForSense(seleccion,_sup_id_movimiento_);
								owlEnginesMatrix(owlDecToHex(seleccion),"00",owl_time_response_engines);
								}, 1000);
							}

							//ccv_matrizMotores(owlHexToDec(seleccion),"00",owl_time_response_engines);
							//waitForDownProduct(seleccion);
							//setTimeout ('formValidate("listenEstatusPagadoCashlessEMV")',3000);
						break;
						case "PRODUCTODISPENSADO":
							$("#label-inferior").text("Recoja su producto");
							$("#listenCash").fadeIn();
							setTimeout ('formValidate("listenEstatusPagadoCashlessEMV")',3000);
						break;
						case "PRODUCTONODISPENSADO":
							$("#ticketIngresado").val("CANCELADO");
							$("#ticketCambio").val("NO COBRADO");
							$(".proceso-venta").hide();
							$("#label-inferior").html("Producto no entregado<br>Revise con Administrador");
							$("#listenCash").fadeIn();
							//cancelacion();
						break;
						case "TIMEOUT":
							$(".proceso-venta").hide();
							$("#label-inferior").html("Tiempo superado para esta operación<br> Ningun Cobro se ha realizado");
							$("#listenCash").fadeIn();
							$("#ticketIngresado").text("CANCELADO TIEMPO DE ESPERA SUPERADO");
							$("#ticketCambio").text("NO COBRADO");
							$("#ticketTotal").text("$ "+formatNumber.new(parseFloat(result.total).toFixed(2)));
							setTimeout ('formValidate("listenEstatusPagadoCashlessEMV")',2000);
						break;
						case "ENDPROCESS":
						$('.process-img').hide();$('#comprobante').show();
						$("#showAllPrices").hide();
						$("#timerPinpad0").timer('pause');
						if (counter_timeOut<=0) {
								$("#enviaCorreo").hide();
								$("#verComprobante").removeClass();
								$("#verComprobante").addClass("col-4 offset-4");
							}else{
								$(".proceso-venta").hide();
								$("#label-inferior").text("¡Gracias por su compra, Vuelva Pronto!");
								$("#listenCash").fadeIn();
								if (result.connection=="false") {
									$("#enviaCorreo").hide();
									$("#comprobante").show();
								}
								/*Ticket*/
								if (result.ingresado==null) {
									$("#ticketIngresado").text("COBRO PROCESADO CORRECTAMENTE");
								}else{
									$("#ticketIngresado").text("$ "+formatNumber.new(parseFloat(result.ingresado).toFixed(2)));
								}

								$("#ticketCambio").text("$ "+formatNumber.new(parseFloat(result.cambio).toFixed(2)));
								$("#ticketTotal").text("$ "+formatNumber.new(parseFloat(result.total).toFixed(2)));
								//setTimeout("location.reload();",5000);
								$('#endTime').timer({
									countdown: true,
									duration: '240s',
									callback: function() {
										location.reload();
									},
									repeat: false
								});
							}
						break;
					}
					if (terminar==true) {
							$(".proceso-venta").hide();
							$("#endCash").fadeIn();
					}
				break;
				case "203"://cargar
					if (result.message[0].estatus=="PAGADO") {
						timer=0;
						switch(result.message[0].tipo_movimiento){
							case 'LEER':
								tableLeer(result.message[0]);
							break;
							case 'INGRESO':
								printDiv("ticket-imprimir");
								location.reload();
							break;
							case 'RETIRO-BOLSA':
								resumenOperacion(result.message[0]);
								printDiv("ticket-imprimir");
								location.reload();
							break;
							default:
								printDiv("ticket-imprimir");
								location.reload();
							break;
						}
					}
					fillBilletes(result.message);
				break;
				case "204":
					retiroBolsa(result);
				break;
				case "205":
					$("#monedas").hide();
					$("#controls-load").hide();
					$("#ingresoEfectivo").fadeIn();
				break;
				case "404":
					$("#tipo_pago").hide();
					$(".proceso-venta").hide();
					$("#label-inferior").text("Producto Sin Stock");
					$("#SINSTOCK").show();
					$(".btn_cancel_proccess_payment").hide();
					setTimeout("normalState();",3000);
					break;
				case "03":
					$('#timerCancel').timer("pause");
					$("#rfid-uuid").attr('disabled','true')
					$(".process-img").hide();

					//addLog("log",result);
					if (result.type=="error") {
						//$("#rfidFail").show();
						$('#timerCancel').timer('remove');
						$('#timerCancel').
						$("#ticketIngresado").val("CANCELADO");
						$("#ticketCambio").val("NO COBRADO");
						$(".proceso-venta").hide();
						$(".process-img").hide();
						$("#rfidFail").fadeIn();
						$("#label-inferior").html("Saldo insuficiente.");
						$("#listenCash").fadeIn();
						$('.modal').modal('hide');
						//$('#proceso_venta').modal('hide');
						$('.modal-backdrop').remove();

					}else{
						$('#timerCancel').timer('remove');
						$(".folio").text("Folio: "+result.folio);
						$(".seleccion").text("Sel: "+result.seleccion);
						//$("#rfidSuccess").show();
						//integracion

						if(__type_project__ === "jofemar"){
							let str_selection = seleccion.toString();
							let dispense_tray = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[0]+''+str_selection[1])+128));
							let dispense_channel = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[2])+128));
							
							ccvJofemarEnginesMatrix(parseInt(master_machine_select),dispense_tray,dispense_channel)
							ccvJofemarExtWaitForProductDown();
						}
						else{
							setTimeout(() => {
								extOwlWaitingForSense(result.seleccion,result.id_movimiento);
								owlEnginesMatrix(owlDecToHex(result.seleccion),"00",owl_time_response_engines);
							
							}, 1000);
						}
						
						
						//ccv_matrizMotores(owlHexToDec(result.seleccion),"00",owl_time_response_engines)

						$(".proceso-venta").hide();
						$(".process-img").hide();
						$("#label-inferior").html("Entregando Producto.<br>");
						$("#listenCash").fadeIn();
						$("#DISPENSANDO").fadeIn();

						//waitForDownProduct(result.seleccion,result.id_movimiento);
					}



				break;
				case "100RFID": //Cashless Payment-primera respuesta
					$("#tipo_pago").attr("src","app/assets/img/sys/icons/pago-tarjeta.png");
					$("#ticketFecha").text(result.fecha);
					$("#id_movimiento").val(result.message);
					setTimeout(function (){
						$(".proceso-venta").hide();
						$("#listenCash").show();
						$(".folio").text("Folio: "+result.folio);
						$(".seleccion").text("Sel: "+result.seleccion);
						//formValidate("listenEstatusPagadoCashlessEMV");
					},1000);
					$(".process-img").hide();
					$("#COBRARCASHLESS").show();
					timeoutGeneral=result.timeout;
					counter_timeOut=timeoutGeneral;
					$(".progress").show();
				break;
				case "sseQR":
					//qrcode.makeCode('[{"id_productos":"1","clave_articulo":"ACADAPLENOVOX1","descripcion":"LAPTOP ROJA ","etiquetas":"CPU","imagen":"b8b8f99ef7271b7e377eef7db59b41ae.jpg","id_precio":"1","precio":"500","id_categoria":null,"estatus":"1","selecciones":"10,11","stock":"8"},{"id_productos":"2","clave_articulo":"ANKERPOWERPORT","descripcion":"ANKER POWERPORT SPEED 5 P","etiquetas":"Accesories","imagen":"b8b8f99ef7271b7e377eef7db59b41ae.jpg","id_precio":"2","precio":"10","id_categoria":null,"estatus":"1","selecciones":"13","stock":"4"},{"id_productos":"3","clave_articulo":"CABLELIGHTINGAUSB","descripcion":"CABLE LIGHTING A USB 2M","etiquetas":"ChargersAndBatteries","imagen":"Cable-de-Lightning.png","id_precio":"3","precio":"15","id_categoria":null,"estatus":"1","selecciones":"15","stock":"0"},{"id_productos":"4","clave_articulo":"HUBUSBCADAPTADOR","descripcion":"HUB USB C ADAPT. TYPE C","etiquetas":"Accesories","imagen":"Hub-USB-C-Adaptador-Type-C-para-MacBook.png","id_precio":"4","precio":"15","id_categoria":null,"estatus":"1","selecciones":"17","stock":"3"},{"id_productos":"5","clave_articulo":"JABRAEVOLVE65T","descripcion":"JABRA EVOLVE 65T","etiquetas":"Headsets","imagen":"Jabra-Evolve-65T.png","id_precio":"5","precio":"10","id_categoria":null,"estatus":"1","selecciones":"19","stock":"0"},{"id_productos":"6","clave_articulo":"JABRAEVOLVE75","descripcion":"JABRA EVOLVE 75","etiquetas":"Headsets","imagen":"Jabra-Evolve-75.png","id_precio":"6","precio":"5","id_categoria":null,"estatus":"1","selecciones":"21","stock":"0"},{"id_productos":"7","clave_articulo":"JABRAEVOLVE75E","descripcion":"JABRA EVOLVE 75E","etiquetas":"Headsets","imagen":"Jabra-Evolve-75e.png","id_precio":"7","precio":"10","id_categoria":null,"estatus":"1","selecciones":"23","stock":"2"},{"id_productos":"9","clave_articulo":"JABRASPEAK510","descripcion":"JABRA SPEAK 510","etiquetas":"Headsets","imagen":"Jabra-Speack-510.png","id_precio":"9","precio":"10","id_categoria":null,"estatus":"1","selecciones":"25","stock":"0"},{"id_productos":"11","clave_articulo":"KITLIMPIEZA","descripcion":"KIT DE LIMPIEZA","etiquetas":"Accesories","imagen":"Kit-de-limpieza.png","id_precio":"11","precio":"10","id_categoria":null,"estatus":"1","selecciones":"27,45","stock":"0"},{"id_productos":"12","clave_articulo":"WIRELESSMOUSELEN","descripcion":"LENOVO WIRELESS MOUSE","etiquetas":"Accesories","imagen":"Lenovo-wireless-mouse.png","id_precio":"12","precio":"10","id_categoria":null,"estatus":"1","selecciones":"29,33,47","stock":"2"},{"id_productos":"13","clave_articulo":"PORTABLEBATTERY","descripcion":"PORTABLE BATTERY CHARGER","etiquetas":"ChargersAndBatteries","imagen":"Portable-Battery-Charger.png","id_precio":"13","precio":"10","id_categoria":null,"estatus":"1","selecciones":"31","stock":"0"},{"id_productos":"14","clave_articulo":"USBCTOUSB3","descripcion":"CABLE USB-C TO USB 3","etiquetas":"ChargersAndBatteries","imagen":"Powerline-cable-USB-C-to-USB-3.0.png","id_precio":"14","precio":"15","id_categoria":null,"estatus":"1","selecciones":"35","stock":"0"},{"id_productos":"15","clave_articulo":"PRESENTADORREMOTO","descripcion":"PRESENTADOR R500 LASER RM","etiquetas":"Presenters","imagen":"r500-laser-presentation-remote.png","id_precio":"15","precio":"20","id_categoria":null,"estatus":"1","selecciones":"37","stock":"0"},{"id_productos":"16","clave_articulo":"SCREENPRIVACY","descripcion":"SCREEN PRIVACY PROTECTOR","etiquetas":"Accesories","imagen":"Screen-privacy-protector.png","id_precio":"16","precio":"15","id_categoria":null,"estatus":"1","selecciones":"41,43","stock":"0"}]');
					$("#qrcodeDiv").text("");
					var qrcode = new QRCode("qrcodeDiv");
					addLog("log","https://shyla.owldesarrollos.com/ishop?id="+result.id_producto+"&m="+tkn_machine+"&mv="+(result.mov_sh));
					qrcode.makeCode("https://shyla.owldesarrollos.com/ishop?id="+result.id_producto+"&m="+tkn_machine+"&mv="+(result.mov_sh));
					sseQR("LISTEN",(result.mov_sh));
					break;
				case "987":
					addLog("log",result);
					break;
			}
		}
	});
}
function puerta(){
	send(formData("listenPuerta","",""));
}
function fillBilletes(arr){
	var total=new Array;
	if (typeof B1000 != "undefined") {
		$total=0;
	for(var i=0;i<arr.length;i++){
		$("#in-1000-"+i).text(arr[i].B1000);	$("#sum-1000-0").text(	parseFloat(B1000)+parseFloat(arr[i].B1000));
		$("#in-500-"+i).text(arr[i].B500);		$("#sum-500-0").text(	parseFloat(B500)+parseFloat(arr[i].B500));
		$("#in-200-"+i).text(arr[i].B200);		$("#sum-200-0").text(	parseFloat(B200)+parseFloat(arr[i].B200));
		$("#in-100-"+i).text(arr[i].B100);		$("#sum-100-0").text(	parseFloat(B100)+parseFloat(arr[i].B100));
		$("#in-50-"+i).text(arr[i].B50);		$("#sum-50-0").text(	parseFloat(B50)+parseFloat(arr[i].B50));
		$("#in-20-"+i).text(arr[i].B20);		$("#sum-20-0").text(	parseFloat(B20)+parseFloat(arr[i].B20));
		$("#in-10-"+i).text(arr[i].M10);		$("#sum-10-0").text(	parseFloat(M10)+parseFloat(arr[i].M10));
		$("#in-5-"+i).text(arr[i].M5);			$("#sum-5-0").text(		parseFloat(M5)+parseFloat(arr[i].M5));
		$("#in-2-"+i).text(arr[i].M2);			$("#sum-2-0").text(		parseFloat(M2)+parseFloat(arr[i].M2));
		$("#in-1-"+i).text(arr[i].M1);			$("#sum-1-0").text(		parseFloat(M1)+parseFloat(arr[i].M1));
		$("#in-50c-"+i).text(arr[i].M50C);		$("#sum-50c-0").text(	parseFloat(M50C)+parseFloat(arr[i].M50C));
		$("#ingresoEfectivo-1000").text(arr[i].B1000);
		$("#ingresoEfectivo-500").text(arr[i].B500);
		$("#ingresoEfectivo-200").text(arr[i].B200);
		$("#ingresoEfectivo-100").text(arr[i].B100);
		$("#ingresoEfectivo-50").text(arr[i].B50);
		$("#ingresoEfectivo-20").text(arr[i].B20);
		$("#ingresoEfectivo-10").text(arr[i].M10);
		$("#ingresoEfectivo-5").text(arr[i].M5);
		$("#ingresoEfectivo-2").text(arr[i].M2);
		$("#ingresoEfectivo-1").text(arr[i].M1);
		$("#ingresoEfectivo-50C").text(arr[i].M50C);
		var total=
		(parseFloat(arr[i].B1000)*1000)+
		(parseFloat(arr[i].B500)*500)+
		(parseFloat(arr[i].B200)*200)+
		(parseFloat(arr[i].B100)*100)+
		(parseFloat(arr[i].B50)*50)+
		(parseFloat(arr[i].B20)*20)+
		(parseFloat(arr[i].M10)*10)+
		(parseFloat(arr[i].M5)*5)+
		(parseFloat(arr[i].M2)*2)+
		(parseFloat(arr[i].M1)*1)+
		(parseFloat(arr[i].M50C)*.50);
		}

		$("#ingresoEfectivo-total").text("$ "+formatNumber.new(parseFloat(total).toFixed(2)));
		$("#total-t").text(total[0]);
		$("#total-c").text(total[1]);
		$("#total").text(total[2]);
	}

}
$(".onclose").on('hidden.bs.modal', function () {
	location.reload();
});
function addImage(e){
	var file = e.target.files[0],
	imageType = /image.*/;
	//addLog("log",e);
	if (!file.type.match(imageType))
 		return;

	var reader = new FileReader();
	reader.onload = function (f) {$('.'+e.target.id).attr('src', f.target.result);};
	reader.readAsDataURL(file);
	var form= new FormData();
	form.append("file",e.target.files[0]);
	form.append("handler","uploadFile");
	form.append("id",e.target.id);
	send(form);
 }
 function preloadImage(e){
	var file = e.target.files[0],
	imageType = /image.*/;
	//addLog("log",e);
	if (!file.type.match(imageType))
 		return;
	var reader = new FileReader();
	reader.onload = function (f) {$('#vw-'+e.target.id).attr('src', f.target.result);$("#img-"+$("#sel").text()).attr('src', f.target.result);};
	reader.readAsDataURL(file);
	uploadImage(e);
 }
  function uploadImage(e){
	var file = e.target.files[0],
	imageType = /image.*/;
	if (!file.type.match(imageType))
 		return;
	var reader = new FileReader();
	reader.onload = function (f) {$('#vw-'+e.target.id).attr('src', f.target.result); $("#ticket-logo").attr("src",f.target.result);$("#ticket-logo").attr("width","60%")};
	reader.readAsDataURL(file);

	var form= new FormData();
	form.append("file",e.target.files[0]);
	form.append("handler","uploadImage");
	form.append("id",e.target.title);
	form.append("value",e.target.name);
	send(form);
 }
 function tableResumen(elements){
	tbody=$("#resumen");
	tbody.html("");
	var total=0;
	for (var j in elements) {
		if (elements[j]>0) {
			var row=$("<tr></tr>");
			col1=$("<td></td>").text(elements[j]);
			if (j>0) {
				if (j<20) {
					col2=$("<td></td>").text("Moneda $ "+j);
				}else{
					col2=$("<td></td>").text("Billete $ "+j);
				}

			}else{
				col2=$("<td></td>").text(j);
			}

			col3=$("<td></td>").text("$ "+(parseFloat(elements[j])*parseFloat(Number((j).match(/\d+$/)))).toFixed(2));
			total=parseFloat(total)+parseFloat(elements[j])*parseFloat(Number((j).match(/\d+$/)));
			row.append(col1);
			row.append(col2);
			row.append(col3);
			tbody.append(row);
			$("#label-total").text("$ "+total.toFixed(2));
		}

	}
}
function lecturaDispositivos(arr){
	$("#leer-10").text(arr.M10);
	$("#leer-5").text(arr.M5);
	$("#leer-2").text(arr.M2);
	$("#leer-1").text(arr.M1);
	$("#leer-50c").text(arr.M50C);
}
function resumen(){
	tbody=$("#resumen");
	tbody.text("");
	for(var i=0;i<ventaArr[0].articulos.length;i++){
		if (ventaArr[0].articulos[i].estatus=="1") {
			var row=$("<tr></tr>");
			row.append($("<td></td>").text(parseFloat(ventaArr[0].articulos[i].cantidad).toFixed(2)));
			row.append($("<td></td>").text(ventaArr[0].articulos[i].clave_articulo));
			row.append($("<td></td>").text("$ "+parseFloat(ventaArr[0].articulos[i].precio).toFixed(2)));
			tbody.append(row);
		}
	}
}
function zfill(number, width) {
    var numberOutput = Math.abs(number); /* Valor absoluto del número */
    var length = number.toString().length; /* Largo del número */ 
    var zero = "0"; /* String de cero */  

    if (width <= length) {
        if (number < 0) {
             return ("-" + numberOutput.toString()); 
        } else {
             return numberOutput.toString(); 
        }
    } else {
        if (number < 0) {
            return ("-" + (zero.repeat(width - length)) + numberOutput.toString()); 
        } else {
            return ((zero.repeat(width - length)) + numberOutput.toString()); 
        }
    }
}
function cancelarVenta(motivo){
	Swal.fire({
	  title: 'Estas seguro de Cancelar la Compra?',
	  text: "Si has ingresado dinero, asegurate de estar frente al kiosko para realizar tu devolucion",
	  icon: 'warning',
	  showCancelButton: true,
	  confirmButtonColor: '#3085d6',
	  cancelButtonColor: '#d33',
	  confirmButtonText: 'Quiero Cancelar!',
	  cancelButtonText: 'Regresar'
	}).then((result) => {
	  if (result.value) {
	    send(formData("cancelaVenta",ventaArr[0].id_movimiento,motivo));
	  }
	})
}
function timerCarga(){
	if (timer==1) {
		send(formData("listenCarga","",cargaArr[0].id_movimiento));
		setTimeout("timerCarga()",1000);
	}else{
		//alert("acabado");
	}
}
function cargaEfectivo(){
	$("#ingresoDinero").modal({backdrop: 'static', keyboard: false});
	setTimeout("$('#loading').fadeOut()",1500);
	setTimeout("$('#loading').hide()",1500);
	setTimeout("$('#carga').fadeIn()",1900);
	setTimeout("$('#controls').fadeIn()",2500);
	cargaArr[0].movimiento="CARGA";
	send(formData("cargaEfectivo",JSON.stringify(cargaArr)));
}
function ingresoManual(){
	$("#ingresaManual").modal({backdrop: 'static', keyboard: false});
	setTimeout("$('#loading-load').fadeOut()",1500);
	setTimeout("$('#carga-load').fadeIn()",1900);
	setTimeout("$('#controls-load').fadeIn()",2500);
	cargaArr[0].movimiento="MANUAL";
	//send(formData("cargaEfectivo","",JSON.stringify(cargaArr)));
}
function ingresoEfectivo(){
	addLog("log","ingresando");
	$("#ingresoDinero").modal({backdrop: 'static', keyboard: false});
	
	$('#listenCash').show()
	setTimeout("$('#controls').fadeIn()",2500);
	extOwlMoneySession()
	//cargaArr[0].movimiento="INGRESO";

	//send(formData("cargaEfectivo",JSON.stringify(cargaArr)));
}
/*function retiroEfectivo(){
	$(".process-img").hide();
	$("#loadingRetiro").show();
	owlDispenseBanknoteICT("1",$("#retiro-50").val());
}*/

function retirarBolsa(){
	send(formData("retiroBolsa",''));
}
function lecturaDispositivos(){
	$("#leerDispositivos").modal({backdrop: 'static', keyboard: false});
	send(formData("lecturaDispositivos",''));
	//send(flushForm('retiro','retiro'))
}
function tablareporte(tabla,arr){
	//addLog("log",arr);
	var tbody=$("#"+tabla);
	for(var i=0; i<arr.length;i++){
		var row=$("<tr></tr>");
		var folio=$("<td></td>").text(arr[i].id_movimiento);
		var nombre=$("<td></td>").text(arr[i].nombre);
		var fecha=$("<td></td>").text(arr[i].fecha_creacion);
		var total=$("<td></td>").text("$"+parseFloat(arr[i].total).toFixed(2));
		var ingresado=$("<td></td>").text("$"+parseFloat(arr[i].ingresado).toFixed(2));
		var cambio=$("<td></td>").text("$"+parseFloat(arr[i].cambio).toFixed(2));
		var productos=$("<td></td>").text(arr[i].productos);
		if (arr[i].entregado==1) {
			entregadoText="Entregado";
		}else{
			entregadoText="No";
		}
		var entregado=$("<td></td>").text(entregadoText);
		var reim="none";
		if (arr[i].entregado==1) {
			reim="block";
		}

		row.append(folio);
		row.append(nombre);
		row.append(fecha);
		var fcancelacion="";
		if(typeof(arr[i].fecha_modificacion)!="undefined"){
			var cancelacion=$("<td></td>").text(arr[i].fecha_modificacion);
			fcancelacion=arr[i].fecha_modificacion;
			row.append(cancelacion);
			row.append(total);
			row.append(ingresado);
			row.append(cambio);
			row.append(productos.css("text-align","center"));
			tipo="CANCELACIÓN";
		}else{
			tipo="VENTA";
			row.append(total);
			row.append(ingresado);
			row.append(cambio);
			row.append(productos.css("text-align","center"));
		}
		var reimprimir=$("<td></td>").html("<input type='button' class='btn btn-sm btn-primary btn-block' value='Ver Detalles'  data-toggle='modal' data-target='#detalle' onclick='hide("+'"'+reim+'"'+","+arr[i].id_movimiento+","+'"'+arr[i].fecha_creacion+'","'+tipo+'","'+fcancelacion+'"'+");send(formData("+'"detalleTicket","","'+arr[i].id_movimiento+'"'+"))'>");
		row.append(reimprimir);
		tbody.append(row);
	}
}
function tablareporteEventos(tabla,arr){
	//addLog("log",arr);
	var tbody=$("#"+tabla);
	for(var i=0; i<arr.length;i++){
		var row=$("<tr></tr>");
		var folio=$("<td></td>").text(arr[i].id_movimiento);
		var movimiento=$("<td></td>").text(arr[i].tipo_movimiento);
		var fecha=$("<td></td>").text(arr[i].fecha_creacion);

		var tipo=arr[i].tipo_movimiento;
		reim="";
		var reimprimir=$("<td></td>").html("<input type='button' class='btn btn-sm btn-primary btn-block' value='Ver Detalles'  data-toggle='modal' data-target='#detalle' onclick='hide("+'"'+reim+'"'+","+arr[i].id_movimiento+","+'"'+arr[i].fecha_creacion+'"'+',"'+tipo+'"'+");send(formData("+'"detalleTicketEvento","","'+arr[i].id_movimiento+'"'+"))'>");
		row.append(folio);
		row.append(movimiento);
		row.append(fecha);

		row.append(reimprimir);
		tbody.append(row);
	}
}
function cerrarSesion(){
	if ($("#ingresado").val()>0) {
		cancelarVenta('USUARIO');
	}else{
	  	location.href="venta";
	  }
	}
function initKeyboard(input,type){
	$('#keyboard').unbind().removeData();
	$('#keyboard').hide();

	$('#keyboard').jkeyboard({
      layout: type,
      input: $('#'+input)
    });
    $('#keyboard').show();
}
function initKeyboardCustom(input,type,id_div){
	$('#'+id_div).unbind().removeData();
	$('#'+id_div).hide();

	$('#'+id_div).jkeyboard({
      layout: type,
      input: $('#'+input)
    });
    $('#'+id_div).show();
}
function modal_edit(arr){
	$(".edit_product").val("");
	$("#tags-edit").tagsinput("removeAll");
	$("#id_producto-edit").val(arr.id_productos);
	$("#key_product-edit").val(arr.clave_articulo);
	$("#description-edit").val(arr.descripcion);
	$("#category-edit").val(arr.id_categoria);
	$("#seleccion-edit").val(arr.selecciones);
	$("#precio-edit").val(arr.precio);
	$("#estatus-edit").val(arr.estatus);
	if (arr.etiquetas!=null) {
		$("#tags-edit").tagsinput("add",arr.etiquetas.replace(/[|]/g,","));
	}

	$('#edit-modal').modal();
	var spl=arr.selecciones.split(",");
	$(".planogram").removeClass("selectedS");
	for (var i = 0; i < spl.length; i++) {
		$("#sel-"+spl[i]).addClass("selectedS");
	}
}
function modal_edit_category(arr){
	$("#name_category-edit").val(arr.nombre_categoria);
	$("#id_categoria").val(arr.id_categoria);
	if (arr.cantidad==0) {
		$("#btn-delete").show();
	}else{
		$("#btn-delete").hide();
	}
	$('#edit-modal').modal();
}
function editReports(arr){
	$("#id_reporte").val(arr.id_conf);
	$("#reporte").val(arr.valor_conf);
	$('#editReporte').modal();
}
function generateReport(arr){
	$("#id_reporte").val(arr.id_conf);
	$("#reporte").val(arr.valor_conf);
	$('#generateReport').modal();
}

function retiroProcess2(){
	let available_to_dispense = owl_arr_bills.recycler.P50;
	$('#r-camin-50-0').text(available_to_dispense);

	let retiro = parseInt($("#retiro-50").val());

	$("#fin-50").text(available_to_dispense-retiro);
}

function retiroProcess(maxval,operacion,input){
		actual=$("#retiro-"+input).val();
		switch (operacion){
			case "+":
				if ((parseInt(actual)+1)<=maxval) {
					$("#retiro-"+input).val(parseInt(actual)+1);
					$("#fin-"+input).text("");
					$("#fin-"+input).text(parseInt(maxval)-parseInt($("#retiro-"+input).val()));
					$('#btn-'+input).removeClass("btn-danger");
					$('#btn-'+input).addClass("btn-warning");
					if ($("#retiro-"+input).val()==maxval) {
						$('#btn-'+input).addClass("btn-danger");
						$('#btn-'+input).removeClass("btn-default");
					}
				}
			break;

			case "-":
				if ((parseInt(actual)-1)>=0) {
					$("#retiro-"+input).val(parseInt(actual)-1);
					$("#fin-"+input).text(parseInt(maxval)-parseInt($("#retiro-"+input).val()));
					$('#btn-'+input).removeClass("btn-danger");
					$('#btn-'+input).addClass("btn-warning");
					if ($("#retiro-"+input).val()==0) {
						$('#btn-'+input).removeClass("btn-danger");
						$('#btn-'+input).removeClass("btn-warning");
						$('#btn-'+input).addClass("btn-default");
					}
				}
			break;
			case "todo":
				if ($('#retiro-'+input).val()>0) {
					$('#retiro-'+input).val(0);
					$('#fin-'+input).text("");
					$("#fin-"+input).text(parseInt(maxval)+parseInt($("#retiro-"+input).val()));
					$('#btn-'+input).removeClass("btn-danger");
					$('#btn-'+input).removeClass("btn-warning");
					$('#btn-'+input).addClass("btn-default");
				}else{
					if (maxval!=0) {
						$('#retiro-'+input).val(maxval);
						$('#fin-'+input).text("");
						$("#fin-"+input).text(parseInt(maxval)-parseInt($("#retiro-"+input).val()));
						$('#btn-'+input).addClass("btn-danger");
						$('#btn-'+input).removeClass("btn-default");
					}

				}

			break; 
		}
	}
	function confirmChange(price){
		let show_currency = {
			'p1':true, 'p2':true, 'p5':true, 'p10':true, 'p20':true,
			'p50':true, 'p100':true, 'p200':true, 'p500':true, 'p1000':true,
		};
		//owlHasToReturnChange
		//owlReturnChangeComprobator
		$('.accepted-money').hide();
		var arr=[1,2,5,10,20,50,100,200,500,1000];
		let how_many = 0;
		for(var i=0;i<arr.length;i++){
			show_currency['p'+arr[i]] = owlHasToReturnChange(parseFloat(price)+parseFloat(arr[i]));
			if(show_currency['p'+arr[i]]){
				$('.MXN'+arr[i]).show();
				how_many++;
			}
			//console.log("base_price="+price+" + "+arr[i]+"="+(parseFloat(price)+parseFloat(arr[i]))+ owlReturnChangeComprobator(parseFloat(price)+parseFloat(arr[i])));
		}

		if(how_many <= 0){
			return {"action":'confirm'};
		}
		else if(how_many < 10 && how_many > 0){
			return {"action":'some',"currency":show_currency};
		}
		return {"action":'continue'};
	}

	let next_step_effective = null;
	function showPrice(data){

		if (!__demo) {
			next_step_effective = confirmChange(data.precio);
		}
		
		
		$(".btn_cancel_proccess_payment").show();
		var divVariantes=$("#divVariantes");
		$(`#id_product`).val("");
		divVariantes.text("");
		var variantes=data.variantes;
		/*
		for(var i=0;i<variantes.length;i++){
			divVariantes.append("<div id='variant-"+variantes[i].id_variante+"' onclick='$(`.variantesbtn`).removeClass(`active`);$(this).addClass(`active`);$(`#id_product`).val(`"+variantes[i].id_variante+"`)' class='variantesbtn mt-2 col-10 pl-0 pr-0 text-center pt-2 m-1 variantes'>"+variantes[i].clave_variante+"</div>");
		}
		*/
		addLog("log","datos de producto",data);
		$(`#id_product`).val(data.id_producto);
		/*if (btnVariant) {
			$("#variant-"+id_variante).addClass("active");
			$(`#id_product`).val(id_variante);
		}*/
		//$("#imagen-venta").attr("src","app/assets/img/products/"+data.imagen);

		var carrousel=$("#carrousel-items");
		$(".carousel").carousel(0);
		$("#imagen_preview_1").attr("src","app/assets/img/products/"+data.imagen_preview_1);
		$("#imagen_preview_2").attr("src","app/assets/img/products/"+data.imagen_preview_2);
		$("#sku-venta").text(data.clave_articulo);
		$("#desc-venta").text(data.descripcion);
		/*Ticket*/
		$("#ticketProducto").text(data.clave_articulo);
		$("#ticketDescripcion").text(data.descripcion);
		$("#labelPrice").text("$ "+formatNumber.new(parseFloat(data.precio).toFixed(2)));
		//$("#id_product").val(data.id_variante);
		$("#labelPricesku").text(data.clave_articulo);
		$(".check").addClass("hide");
		$("#check-"+data.id_producto).toggleClass("hide");

		$(".compraBtn").removeClass("selected");
		$("#btn-"+data.id_producto).toggleClass("selected");
		//send(formData('revisaNiveles',data.precio));
		$("#preview-img").attr("src","app/assets/img/products/"+data.imagen);
		$("#preview-description").text(data.descripcion);
		$("#preview-sku").text(data.clave_articulo);
		$("#preview-price").text("$ "+formatNumber.new(parseFloat(data.precio).toFixed(2)));
		$(".total").text("$ "+formatNumber.new(parseFloat(data.precio).toFixed(2)));
		
		$(".btnComprar").show();
		$("#sstock").hide();
		
		$("#preview").modal("show");

		if(parseFloat(data.precio) < 50){
			$('#pinpad-method').hide();
		}else{
			$('#pinpad-method').show();
		}
		
		//ccv_precio=data.precio;
		owl_price=data.precio;
		objDataTRX.Amount=data.precio;
		btnVariant=false;
		change_returned_verified=0;
}
function aviso(){
	$("#aviso1").modal({backdrop: 'static', keyboard: false});
}
function redireccionar() {
    //setTimeout("location.reload()", 600000);
  }
  function initProcess(type){
		if ($("#id_product").val()>0) {
			$("#preview").modal('hide');
			executeOneTime=false;
				switch(type){
					case 'cash':
						$('#show-only-some-currency').hide();
						if(next_step_effective !== null && (next_step_effective.action == "continue" || next_step_effective.action == "some")){
							if(next_step_effective.action == "some"){
								//mostrar los aceptados
								$('#show-only-some-currency').show();
							}
							$("#proceso_venta").modal({backdrop: 'static', keyboard: false}); 
							$(".proceso-venta").hide();
							$("#LOADING").show();
							formValidate("startProcessCash");
						}else if(next_step_effective !== null && next_step_effective.action == "confirm"){
							$("#proceso_venta").modal({backdrop: 'static', keyboard: false}); 
							$(".proceso-venta").hide();
							$("#CONFIRMNOCHANGE").show();
						}else{
							$("#proceso_venta").modal({backdrop: 'static', keyboard: false}); 
							$(".proceso-venta").hide();
							$("#LOADING").show();
							formValidate("startProcessCash");
						}
					break; 
					case 'cashless':
						$(".bill-bar").hide();
						$(".cashless-bar").fadeIn();
						$("#proceso_venta").modal({backdrop: 'static', keyboard: false});
						addLog("log",result);
						$("#tipo_pago").attr("src","app/assets/img/sys/icons/pago-tarjeta.png");
						$("#ticketFecha").text(result.fecha);
						$("#id_movimiento").val(result.message);
						$("#listenCash").show();
						$(".process-img").hide();
						$("#label-inferior").text("Preparando Dispositivo HID");
						$("#launching").show();
						setTimeout(function (){
							$(".process-img").hide();
							$(".folio").text("");
							$(".seleccion").text("");
							$("#label-inferior").text("Presente Tarjeta");
							$(".process-img").hide();
							$("#COBRARCASHLESS").show();
							/*timeoutGeneral=result.timeout;
							counter_timeOut=timeoutGeneral;
							$(".progress").show();*/
							$("#rfid-uuid").removeAttr('disabled')
						},1000);
						$('#timerCancel').timer({
							countdown: true,
							duration: "10s",
							callback: function() {
							$("#timerCancel").timer('remove');
							$('.modal').modal('hide');
							$('.modal-backdrop').remove();
							}
						});

					break;
					case 'emv':
						$("#proceso_venta").modal({backdrop: 'static', keyboard: false}); 
						$(".proceso-venta").hide();
						$("#LOADING").show();
						
						formValidate("startProcessCashlessEMV");  
					break;

					case 'coin':
						$("#proceso_venta").modal({backdrop: 'static', keyboard: false}); 
						$(".proceso-venta").hide();
						$("#LOADING").show();
						
						formValidate("startProcessCoin");  
					break;

					case 'qr':
						$("#proceso_venta").modal({backdrop: 'static', keyboard: false}); 
						$(".proceso-venta").hide();
						$("#QR").show();
						$("#followqr").hide();
						$(".hiddeableElement").hide();
						$("#qrcodeDiv").text("");
						$("#modalContent").css("background-color","transparent")
						
						let frm = new FormData();
						frm.append('mac',tkn_machine);
						frm.append('handler','startProccessQR');
						frm.append('id',$("#id_product").val());
						send(frm);	
					break;
				}

		}else{
			Swal.fire("Alerta","Elige por lo menos una Talla o Color","warning");
		}
	}


	function cargaManual(maxval,operacion,input){
		actual=$("#manual-"+input).val();
		switch (operacion){
			case "+":
					$("#manual-"+input).val(parseInt(actual)+1);
					$("#fin-manual-"+input).text("");
					$("#fin-manual-"+input).text(parseInt(maxval)+parseInt($("#manual-"+input).val()));
					$('#btn-'+input).removeClass("btn-danger");
					$('#btn-'+input).addClass("btn-warning");
					if ($("#manual-"+input).val()==maxval) {
						$('#btn-'+input).addClass("btn-danger");
						$('#btn-'+input).removeClass("btn-default");
					}

			break;

			case "-":
				if ((parseInt(actual)-1)>=0) {
					$("#manual-"+input).val(parseInt(actual)-1);
					$("#fin-manual-"+input).text(parseInt(maxval)+parseInt($("#manual-"+input).val()));
					$('#btn-'+input).removeClass("btn-danger");
					$('#btn-'+input).addClass("btn-warning");
					if ($("#manual-"+input).val()==0) {
						$('#btn-'+input).removeClass("btn-danger");
						$('#btn-'+input).removeClass("btn-warning");
						$('#btn-'+input).addClass("btn-default");
					}
				}
			break;
		}
	}
	function muestra(id){
		$(".data").hide();
		$(".tab").removeClass("active");
		$("#menu-"+id).addClass("active");
		$("#data-"+id).show();
	}
	function billetesAceptados(arr){
		$(".billetes").hide();
		$(".aceptados").fadeIn();

		if (arr==false) {
			$(".exacto").show();
			exacto=1;
		}else{
			exacto=0;
			var spl=arr.split(",");
			for(var i=0;i<spl.length-1;i++){
				$("."+spl[i]).show();
			}
		}

	}
	function timeout(arr){
		$(".progress").fadeIn();
		porcentaje=(parseFloat(arr.timeout)*100)/(timeoutGeneral);
		counter_timeOut=porcentaje;
		switch(arr.type){
			case 'start':
				$("#progressbar").css({'width':(porcentaje+"%")});
			break;
			case 'resta':
				$("#progressbar").css({'width':(porcentaje+"%")});
			break;
		}

		return true;
	}
	function timerPinpad(){
		$('#timerPinpad0').timer({
			countdown: true,
			duration: '1s',
			callback: function() {
				if (counter_timeOut<=0) {
					cancelReadCard();
					formValidate("cancelTimeout");
				}else{
					counter_timeOut--;
					$('#timerPinpad0').timer('reset');
					porcentaje=(parseFloat(counter_timeOut)*100)/(timeoutGeneral);
			    	$("#progressbar").css({'width':(porcentaje+"%")});
				}

			},
			repeat: true
		});

	}
	function control(){
		contador++;
		if (contador>3) {
			if (contador==10) {
				Swal.fire({
				  title: 'Direccionando . . .',
				  html: 'Espera, accediendo a panel de control',
				  timer: 1000,
				  showConfirmButton: false,
				  allowOutsideClick: false,
				  onOpen: () => {
				    swal.showLoading()
				    timerInterval = setInterval(() => {
				      swal.getContent().querySelector('strong')
				    }, 100)
				  }
				}).then((result) => {
				  if (
				    result.dismiss === swal.DismissReason.timer
				  ) {
				    location.href='login'
				  }
				})
			}
		}
	}
	function deleteProduct(){
	Swal.fire({
		title: 'Eliminar',
		text: "Estas a punto de eliminar una producto",
		icon: "warning",
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		confirmButtonText: 'Proceder'
		}).then((result) => {
		if (result.value) {
			formValidate('delete-product');
		}
	})

	}
function fillSelecciones(data){
	addLog("log",data);
	//$("#cve_prod").val(data.id_variante);
	$("#cve_prod").val(data.id_producto);
	//$("#cve_prod").text(data.clave_articulo);
	$("#desc_prod").text(data.descripcion);
	$("#sel").text(data.seleccion);
	$("#id_seleccion").val(data.id_seleccion);
	$("#stock").val(data.stock);
	$("#producto").val(data.producto);
	testSelection=data.seleccion;
	testIdVending=data.id_vending;
	if (data.enable==1) {
		$('#enable').bootstrapToggle('on');
	}else{
		$('#enable').bootstrapToggle('off');
	}
	$("#enable").attr("onchange",'$(`#enable`).val($(this).prop(`checked`));if ($(`#enable`).val()==`true`) {$(`#stock`).val(`'+data.stock_default+'`);}else{$(`#stock`).val(`0`);}');
}
function selectSel(id_seleccion,input){
	var selecciones=$("#"+input).val();
	var spl=selecciones.split(",");
	var found=false;
	if (spl.indexOf(id_seleccion)!=-1) {
		spl.splice(spl.indexOf(id_seleccion),1);
		addLog("log",spl);
		var elementos="";
		for (var i = 0; i < spl.length; i++) {
			if (i==spl.length-1) {
				elementos+=spl[i];
			}else{
				elementos+=spl[i]+",";
			}
		}
		$("#"+input).val(elementos);
	}else{
		if ($("#"+input).val()=="") {
			$("#"+input).val(id_seleccion);
		}else{
			$("#"+input).val($("#"+input).val()+","+id_seleccion);
		}
	}
}
function editUser(arr){
	$("#id_usuario-edit").val(arr.id_usuario);
	$("#nombreUsuario-edit").val(arr.nombre);
	$("#nickname-edit").val(arr.user);
	$("#contrasenia-edit").val("notthistimehackerboy");
	$("#confirmar-edit").val("notthistimehackerboy");
	$("#rol-edit").val(arr.rol);
	$("#userEdit").modal();
}
function deleteUser(user){
	Swal.fire({
		title: 'Eliminar',
		text: "Estas a punto de eliminar un Usuario",
		icon: "warning",
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		confirmButtonText: 'Proceder'
		}).then((result) => {
		if (result.value) {
			send(formData('userDelete',user));
		}
	})
	}
function retiroBolsa(arr){
	addLog("log",arr.efectivo);
	$("#retiroBolsa-id").text(arr.id);
	$("#retiroBolsa-proceso").text(arr.tipo_movimiento);
	$("#retiroBolsa-fecha").text(arr.fecha);
	$("#retiroBolsa-1000").text(arr.efectivo.B1000);
	$("#retiroBolsa-500").text(arr.efectivo.B500);
	$("#retiroBolsa-200").text(arr.efectivo.B200);
	$("#retiroBolsa-100").text(arr.efectivo.B100);
	$("#retiroBolsa-50").text(arr.efectivo.B50);
	$("#retiroBolsa-20").text(arr.efectivo.B20);
	$("#retiroBolsa-10").text(arr.efectivo.M10);
	$("#retiroBolsa-5").text(arr.efectivo.M5);
	$("#retiroBolsa-2").text(arr.efectivo.M2);
	$("#retiroBolsa-1").text(arr.efectivo.M1);
	$("#retiroBolsa-50C").text(arr.efectivo.M50C);
	$("#retiroBolsa-50CN").text(arr.efectivo.M50CN);
	var total=(parseFloat(arr.efectivo.B1000)*1000)+(parseFloat(arr.efectivo.B500)*500)+(parseFloat(arr.efectivo.B200)*200)+(parseFloat(arr.efectivo.B100)*100)+(parseFloat(arr.efectivo.B50)*50)+(parseFloat(arr.efectivo.B20)*20)+(parseFloat(arr.efectivo.M10)*10)+(parseFloat(arr.efectivo.M5)*5)+(parseFloat(arr.efectivo.M2)*2)+(parseFloat(arr.efectivo.M1)*1)+(parseFloat(arr.efectivo.M50C)*.50)+(parseFloat(arr.efectivo.M50CN)*.50);
	$("#retiroBolsa-total").text("$ "+formatNumber.new(parseFloat(total).toFixed(2)));
	$(".retiroBolsa").hide();
	$("#retiroBolsaDiv").fadeIn();
}
function retiroTubos(arr){
	addLog("log",arr.ingresadoDetalle);
	$("#retiroTubos-id").text(arr.ingresadoDetalle[0].id_movimiento);
	$("#retiroTubos-proceso").text(arr.message);
	$("#retiroTubos-1000").text(arr.ingresadoDetalle[0].B1000);
	$("#retiroTubos-500").text(arr.ingresadoDetalle[0].B500);
	$("#retiroTubos-200").text(arr.ingresadoDetalle[0].B200);
	$("#retiroTubos-100").text(arr.ingresadoDetalle[0].B100);
	$("#retiroTubos-50").text(arr.ingresadoDetalle[0].B50);
	$("#retiroTubos-20").text(arr.ingresadoDetalle[0].B20);
	$("#retiroTubos-10").text(arr.ingresadoDetalle[0].M10);
	$("#retiroTubos-5").text(arr.ingresadoDetalle[0].M5);
	$("#retiroTubos-2").text(arr.ingresadoDetalle[0].M2);
	$("#retiroTubos-1").text(arr.ingresadoDetalle[0].M1);
	$("#retiroTubos-50C").text(arr.ingresadoDetalle[0].M50C);
	var total=
	(parseFloat(arr.ingresadoDetalle[0].B1000)*1000)+
	(parseFloat(arr.ingresadoDetalle[0].B500)*500)+
	(parseFloat(arr.ingresadoDetalle[0].B200)*200)+
	(parseFloat(arr.ingresadoDetalle[0].B100)*100)+
	(parseFloat(arr.ingresadoDetalle[0].B50)*50)+
	(parseFloat(arr.ingresadoDetalle[0].B20)*20)+
	(parseFloat(arr.ingresadoDetalle[0].M10)*10)+
	(parseFloat(arr.ingresadoDetalle[0].M5)*5)+
	(parseFloat(arr.ingresadoDetalle[0].M2)*2)+
	(parseFloat(arr.ingresadoDetalle[0].M1)*1)+
	(parseFloat(arr.ingresadoDetalle[0].M50C)*.50);
	$("#retiroTubos-total").text("$ "+formatNumber.new(parseFloat(total).toFixed(2)));
}
function detalleMovimiento(arr){
	addLog("log",arr);
	$("#detalleEventos").modal();
	$("#id_dinero").text(arr.id_dinero);
	$("#r1000").text(arr['B1000']);
	$("#r500").text(arr[500]);
	$("#r200").text(arr[200]);
	$("#r100").text(arr[100]);
	$("#r50").text(arr[50]);
	$("#r20").text(arr[20]);
	$("#r10").text(arr[10]);
	$("#r5").text(arr[5]);
	$("#r2").text(arr[2]);
	$("#r1").text(arr[1]);
	$("#r50C").text(arr['50c']);
	$("#r50CN").text(arr['50cn']);
}
function format(input){
	var num = input.value.replace(/\./g,'');
	num = num.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g,'$1.');
	num = num.split('').reverse().join('').replace(/^[\.]/,'');
	input.value = num;
}
function estatus(step){
	$(".proceso-venta").hide();
	$(".process-img").hide();
	$("#listenCash").show();
	switch (step){
		case "launch":
			$("#LOADING").show();
		break;
		case "login":
			$("#LOGIN").show();
			//$("#label-inferior").text("Validando Conexión");
		break;
		case "rsakey":
			$("#KEYS").show();
			//$("#label-inferior").text("Obteniendo Llaves");
		break;
		case "readCard":
			$("#INSERTCARD").show();
			//$("#label-inferior").text("Por favor Inserte su tarjeta Ahora y no la retire");
		break;
		
		case "afiliaciones":
			$("#CHARGING").show();
			//$("#label-inferior").text("Realizando Cobro, NO RETIRE LA TARJETA");
		break;
		case "pagado":
			$("#CASHLESSVOUCHER").show();
			//$(".process-img").hide();
			//$("#comprobante").show();
			formValidate("cobroPinpad");
		break;
		case "test":
			$("#voucher").show();
			//$(".process-img").hide();
			//$("#comprobante").show();

		break;

	}
}
function error(step){

	$("#errorCobro").show();
	$(".proceso-venta").hide();
	$(".btn_cancel_proccess_payment").hide();
	switch (step){
		case "fail-login":
			codeError="CCV01";
			$("#codeError").text(codeError);
			$("#messageError").text("Error al establecer conexión");
			$("#label-inferior").text("Error al establecer conexión");
		break;
		case "fail-keys":
			codeError="CCV02";
			$("#codeError").text(codeError);
			$("#messageError").text("Error al obtener llaves de conexión");
			$("#label-inferior").text("Error al obtener llaves de conexión");
			$("#NEGATED").show();
		break;
		case "fail-launch":
			codeError="CCV03";
			$("#codeError").text(codeError);
			$("#messageError").text("Sin Conexión a Internet");
			$("#label-inferior").text("Sin Conexión a Internet");
		break;
		case "fail-card":
			codeError="CCV04";
			$("#codeError").text(codeError);
			$("#messageError").text("Error de lectura de tarjeta");
			$("#label-inferior").text("Error de lectura de tarjeta");
			$("#NEGATED").show();
		break;
		case "fail-card-ilegible":
			codeError="CCV05";
			$("#codeError").text(codeError);
			$("#messageError").text("Tarjeta Ilegible, intente de nuevo");
			$("#label-inferior").text("Tarjeta Ilegible, intente de nuevo");
			$("#NEGATED").show();
		break;
		case "fail-card-importe":
			codeError="CCV06";
			$("#codeError").text(codeError);
			$("#messageError").text("Error de Importe, intente de nuevo");
			$("#label-inferior").text("Error de Importe, intente de nuevo");
			$("#NEGATED").show();
		break;
		case "fail-card-noresponse":
			codeError="CCV07";
			$("#codeError").text(codeError);
			$("#messageError").text("Sin respuesta del dispositivo de cobro");
			$("#label-inferior").text("Sin respuesta del dispositivo de cobro");
			$("#NEGATED").show();
		break;
		case "fail-card-cancelada":
			codeError="CCV08";
			$("#codeError").text(codeError);
			$("#messageError").text("Timeout");
			$("#label-inferior").text("Operacion Cancelada");
			$("#NEGATED").show();
		break;
		case "fail-card-timeout":
			codeError="CCV09";
			$("#codeError").text(codeError);
			$("#messageError").text("Tiempo de espera superado");
			$("#label-inferior").text("Tiempo de espera superado");
			$("#NEGATED").show();
		break;
		case "fail-card-read":
			codeError="CCV10";
			$("#codeError").text(codeError);
			$("#messageError").text("Error de lectura de Banda/Chip");
			$("#label-inferior").text("Error de lectura de Banda/Chip");
			$("#NEGATED").show();
		break;
		case "fail-card-pin":
			codeError="CCV11";
			$("#codeError").text(codeError);
			$("#messageError").text("Error de lectura de PIN");
			$("#label-inferior").text("Error de lectura de PIN");
			$("#NEGATED").show();
		break;
		case "fail-card-cad":
			codeError="CCV12";
			$("#codeError").text(codeError);
			$("#messageError").text("Error Tarjeta Vencida");
			$("#label-inferior").text("Error Tarjeta Vencida");
			$("#NEGATED").show();
		break;
		case "fail-card-chip":
			codeError="CCV13";
			$("#codeError").text(codeError);
			$("#messageError").text("Problemas para leer CHIP, intente de nuevo");
			$("#label-inferior").text("Problemas para leer CHIP, intente de nuevo");
			$("#NEGATED").show();
		break;
		case "fail-operation-limit":
			codeError="CCV14";
			$("#codeError").text(codeError);
			$("#messageError").text("Limite excedido, Intente con un producto de menor precio");
			$("#label-inferior").text("Limite excedido, Intente con un producto de menor precio");
			$("#NEGATED").show();
		break;
		case "fail-operation-founds":
			codeError="CCV15";
			$("#codeError").text(codeError);
			$("#messageError").text("Fondos Insuficientes");
			$("#label-inferior").text("Fondos Insuficientes");
			$("#NEGATED").show();
		break;
		case "fail-denied":
			codeError="CCV05";
		break;
	}
	addLog("log",codeError);
	$("#estatusCancelacion").val(codeError);
	formValidate("cancelPinpad");
	counter_timeOut=0;

	setTimeout("$('#proceso_venta').modal('hide');$('#errorCobro').hide();$('.btn_cancel_proccess_payment').show();$('#CASHLESSVOUCHER').hide();",10000);
	//$("#comprobante").show();
}
function inicio(){
	$("#principalVid").modal('hide');
	let vid = document.getElementById("vid_inicio_loop_touch");
	vid.muted = true;
	vid.pause();
	vid.currentTime=0;
}
function listener(string){
		$(".process-img").hide();
		$("#rfidprocess").show();
		formValidate("startRFID");

	}
function editCard(arr){
	$("#UUID-edit").val(arr.id_card);
	$("#nombre-edit").val(arr.nombre);
	$("#asignacion-edit").val(arr.id_usuario);
	$("#editCard").modal();
}
function addBalance(arr){
	$("#UUID-carga").val(arr.id_card);
	$("#saldo").val(arr.saldo);
	$("#addBalance").modal();
}
function cancelSale(){
	$('.modal').modal('hide');$('.modal-backdrop').remove();send(formData("cancelaTodo"));
}
function showStock(){
	$(".product-stock").fadeIn();
	setTimeout("$('.product-stock').fadeOut()",5000);
}
function testDispensing(seleccion,vending = 1){
	setTimeout(function (){
		$(".dispensing-process").hide();
		$("#div-preparando").show();
		addLog("log","activar motores." +seleccion+"-00");
		$("#controlsDiv").hide();
		/*if(seleccion.length === 3){
			if(__type_project__ === "jofemar"){
				let str = seleccion.toString();
				let tray = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str[0]+''+str[1])+128));
				let channel = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str[2])+128));
				//addLog("log",vending,tray,channel);
			
				ccvJofemarEnginesMatrix(vending,tray,channel)
				ccvJofemarExtWaitForProductDownTest();
			
			}
			else{
				setTimeout(() => {
					extOwlWaitingForSenseTest(seleccion,_sup_id_movimiento_);
					owlEnginesMatrix(owlDecToHex(seleccion),"00",owl_time_response_engines);
				}, 1000);
			}
		}*/
		if(__type_project__ === "jofemar"){
			let str = seleccion.toString();
			let tray = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str[0]+''+str[1])+128));
			let channel = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str[2])+128));
			//addLog("log",vending,tray,channel);
		
			ccvJofemarEnginesMatrix(vending,tray,channel)
			ccvJofemarExtWaitForProductDownTest();
		
		}
		else{
			setTimeout(() => {
				extOwlWaitingForSenseTest(seleccion,_sup_id_movimiento_);
				owlEnginesMatrix(owlDecToHex(seleccion),"00",owl_time_response_engines);
			}, 1000);
		}
		//ccv_matrizMotores(owlHexToDec(seleccion),"00",owl_time_response_engines);


		//check_matrix_dispensed
        //interval_to_check_matrix_dispense

		//ccv_ext_waitForDownProductTest(seleccion);
	},500);
}

function remoteDispensing(seleccion,vending = 1){
		$(".dispensing-process").hide();
		$("#div-esperandoConfirmacion").show();
		send(formData("remoteDispensing",JSON.stringify({"seleccion":seleccion,"vending":vending})));
		timerRemoteDispensing();
}
var timerRemote=0;
var timerConfirmation=false;
function timerRemoteDispensing(){
	console.log(timerRemote);
	if (timerRemote>=10) {
		timerRemote=0;
		if (_sup_id_movimiento_=="") {
			$(".dispensing-process").hide();
			$("#div-noconfirm").show();
		}else{
			if(timerConfirmation){
				send(formData("confirmremoteDispensing",JSON.stringify({"id_movimiento":_sup_id_movimiento_,"estatus":"DISPENSADO"})));
			}else{
				send(formData("confirmremoteDispensing",JSON.stringify({"id_movimiento":_sup_id_movimiento_,"estatus":"NODISPENSADO"})))
			}
		}
		
	}else{
		timerRemote++;
		setTimeout("timerRemoteDispensing()",1000);
	}
}

function detalleTicket(arr){
	addLog("log",arr);
	$("#id_movimiento").text(arr.id_movimiento);
	$("#ticketFecha").text(arr.fecha_creacion);
	$("#ticketFolio").text(arr.folio);
	$("#ticketProducto").text(arr.cve_producto);
	$("#ticketDescripcion").text(arr.descripcion);
	$("#ticketCantidad").text(arr.cantidad);
	$("#ticketSeleccion").text(arr.seleccion);
	if (arr.autorizacion!="") {
		$("#voucher").show();
	}
	if (arr.autorizacion_cancelacion!="") {
		$("#voucherCancel").show();
	}
	$("#voucherAuth").text(arr.autorizacion);
	$("#voucherAprov").text(arr.aprobacion);
	$("#voucherAuthCancel").text(arr.autorizacion_cancelacion);
	$("#voucherAprovCancel").text(arr.aprobacion_cancelacion);
	$("#voucherRefCancel").text(arr.id_movimiento);
	$("#codeError").text(arr.id_movimiento);
	$("#messageError").text(arr.id_movimiento);
	$("#ticketIngresado").text("$ "+parseFloat(arr.total).toFixed(2));
	$("#ticketCambio").text("$ 0.00");
	$("#ticketTotal").text("$ "+parseFloat(arr.total).toFixed(2));
	$("#detalle").modal();
}
$(function(){
	if($('#btn_continue_cash_process').length > 0){
		$('#btn_continue_cash_process').click(function(){
			$("#proceso_venta").modal({backdrop: 'static', keyboard: false}); 
			$(".proceso-venta").hide();
			$("#LOADING").show();
			formValidate("startProcessCash");
		});
	}
	
	if(__type_project__ === "jofemar"){
		if($('#btn-open-modal-working-temp').length > 0){
			$('#btn-open-modal-working-temp').click(function(){
				ccvJofemarReadWorkingTemperature(1);
				$('#modalConfigWorkingTemp').modal('show');
			});
		}
	}	

	$('.btn_update_selection').change((e)=>{

		   let target = e.target;

		   let btn = $(target);

		   let selection_id = btn.data('id');

		   let selection_stock = btn.data('stock');

		   let selection_toogle = btn.data('selection_toogle');

		   let form = new FormData();

		   form.append('handler','fastEditSelecciones');

		   form.append('enable',selection_toogle);

		   form.append('stock',selection_stock);

		   form.append('id_seleccion',selection_id);



		   send(form);

	   })

	$('.btn_cancel_proccess_payment').click((e)=>{
		cancelProccessInit();
	});

	/**
	 * retiro de efectivo
	 */
	if(typeof __retiro_efectivo !== 'undefined'){
		$('#more-to-dispense-banknotes').click(function(){
			let available_to_dispense = owl_arr_bills.recycler.P50;
			$('#r-camin-50-0').text(available_to_dispense);
		
			let val = $("#retiro-50");
		
			let more = parseInt(val.val())+1;
			if(more < 0){
				val.val(0);
			}
			else if(more > parseInt(available_to_dispense)){
				val.val(available_to_dispense);
			}
			else{
				val.val(more);
				
			}
			retiroProcess2();
		});
		$('#less-to-dispense-banknotes').click(function(){
			let available_to_dispense = owl_arr_bills.recycler.P50;
			$('#r-camin-50-0').text(available_to_dispense);
		
			let val = $("#retiro-50");
		
			let less = parseInt(val.val())-1;
			if(less < 0){
				val.val(0);
			}
			else if( less > parseInt(available_to_dispense)){
				val.val(available_to_dispense);
			}
			else{
				val.val(less);
				retiroProcess2();
			}
		});
		$('#btn-50').click(function(){
			let available_to_dispense = owl_arr_bills.recycler.P50;
			$('#r-camin-50-0').text(available_to_dispense);
		
			let val = $("#retiro-50");
			val.val(available_to_dispense);
			retiroProcess2();
		});
	}
})
function applyChannelActives(data){
	addLog("log",data);
	let form = new FormData();
	form.append('handler','enableChannelMachine');
	form.append('arr_obj', JSON.stringify(data));
	send(form);
}

$(()=>{
	$("#principalVid").modal({backdrop: 'static', keyboard: false, windowClass: 'fullscreen'});
	let vid = document.getElementById("vid_inicio_loop_touch");
	if(vid !== null){
		vid.muted = true;
		vid.play();
	}
})
//window.onload=function(){};//al parecer se declaro en otro lado


function filter(){
	addLog("log","aplicando filtro");
	var filtro1=$("#ffilter").val();
	var filtro2=$("#sfilter").val();

	if (filtro1!="" && filtro2!="") {
		addLog("log","filtro Doble");
		addLog("log",filtro1+" "+filtro2);
		$(".productItems").hide();
		$("."+filtro1+filtro2).show();

	}else{
		addLog("log","filtro basico");
		if (filtro1!="") {
			$(".productItems").hide();
			$("."+filtro1).show();
		}

		if (filtro2!="") {
			$(".productItems").hide();
			$("."+filtro2).show();
		}
	}
}

function sseRemoteDispensing(type,id_mov_sh = null){
	var lock=false;
	var url="http://zahal.owldesarrollos.com/sse";
	//url="https://localhost/sse";
    if (typeof (EventSource) !== 'undefined') {
    	var source;
		if(id_mov_sh !== null){
			addLog("log","listen sse");
				source = new EventSource(url+'?mv='+id_mov_sh);
		}else{
			if (type=="START") {
				console.log("log","start sse");
				source = new EventSource(url);
			}else{
				console.log("log","listen sse");
				source = new EventSource(url+'?id='+id_movimiento);
			}
		}
        
        source.onopen = function (event) {
        };
        source.onerror = function (event) {
        };
         source.onmessage = function(event) {
         	console.log(event.lastEventId);
         	console.log("log",event.lastEventId);
		    console.log("logSSE",JSON.parse(event.data));
		    data=JSON.parse(event.data);
         	switch(event.lastEventId){
         		case "REMOTE_DISPENSING":
         			ajaxProcess="SSEREMOTE";
		         	$("#proceso_venta").modal({backdrop: 'static', keyboard: false}); 
					$(".proceso-venta").hide();
					$("#CONFIRMREMOTE").show();
		         	
		        	
		        	$("#qrTicket").text("");
					$("#ticketFecha").text(data.fecha_creacion);
					$("#ticketProducto").text(data.cve_producto);
					$("#ticketDescripcion").text(data.cve_producto);

					$(".total").text("$ "+formatNumber.new(parseFloat(data.total).toFixed(2)));

					$("#id_movimiento").val(data.id_movimiento);
					_sup_id_movimiento_ = data.id_movimiento;
					$(".folio").text("Folio: "+data.folio);
					$(".seleccion").text("Sel: "+data.seleccion);
					
					timeoutGeneral=data.timeout;
					counter_timeOut=timeoutGeneral;

					seleccion=data.seleccion;
					uuid_seleccion_db=data.uuid;
					id_vending_seleccion_db=data.id_vending;
					timerCloseRemote();

         		break;
         		case "SYNC":
         			for(var i=0;i<data.length;i++){
         				switch(data[i].id_sync){
         					case "1"://productos
         						send(formData("syncProductos",data[i].id_sync));
         					break;
         					case "2"://selecciones
         						send(formData("syncSelecciones",data[i].id_sync));
         					break;
         					case "3"://codigos
         						send(formData("syncCodigosCloudtoLocal",data[i].id_sync));
         					break;
         					case "4"://ventas
         						send(formData("syncVentas",data[i].id_sync));
         					break;

         					case "5"://configuracion
         						send(formData("syncConfiguraciones",data[i].id_sync));
         					break;

         				}
         				
         			}

         		break;
         	}

         	
         };
        
    } else {
        addLog("log",'Sorry, your browser does not support server-sent events...');
    }

}
var timerRemoteConfirm=10;
function timerCloseRemote(){
	if (timerRemoteConfirm<=0) {
		timerRemoteConfirm=10;
		$("#proceso_venta").modal("hide");
	}else{
		if (timerRemoteConfirm==12) {
			timerRemoteConfirm=10;
		}else{
			timerRemoteConfirm--;
			setTimeout('timerCloseRemote()',1000);
		}
		
	}
}

function sseQR(type,id_mov_sh = null){
	var lock=false;
    if (typeof (EventSource) !== 'undefined') {
    	var source;
		if(id_mov_sh !== null){
			addLog("log","listen sse");
				source = new EventSource('https://shyla.owldesarrollos.com/sse?mv='+id_mov_sh);
		}else{
			if (type=="START") {
				addLog("log","start sse");
				source = new EventSource('https://shyla.owldesarrollos.com/sse');
			}else{
				addLog("log","listen sse");
				source = new EventSource('https://shyla.owldesarrollos.com/sse?id='+id_movimiento);
			}
		}
        
        source.onopen = function (event) {
        };
        source.onerror = function (event) {
        };
         source.onmessage = function(event) {
         	addLog("log","message");
        	addLog("log",event);
            if (lock==false) {
                var data=JSON.parse(event.data);
                addLog("log",data);
                if (data.estatus_movimiento!=undefined) {
                	//lock=true;
                	id_movimiento=data.id_movimiento;
                	seleccion_dec=
					addLog("log","estatus"+data.estatus_movimiento);
                	switch(data.estatus_movimiento){

                		case "COBRAR":
							if(parseInt(data.sse) === 1){
								$(".proceso-venta").hide();
								$("#QRPAYING").show();
							}
							source.close();
								addLog("log","termina de leer cobranza");
							setTimeout(()=>{
								sseQR("LISTEN",id_mov_sh !== null ? id_mov_sh: null);
							},800);
                		break;
                		case "PAGADO":
                			$(".btn_cancel_proccess_payment").hide();
                			addLog("log",data);
                			addLog("log","pagado");
                			$(".proceso-venta").hide();
							$("#DISPENSANDO").show();
                			//dispensar

                			$("#id_movimiento").val(result.message);
							$("#movimiento").text("Folio #"+result.message);

							seleccion=data.seleccion;
							uuid_seleccion_db=data.uuid;
							id_vending_seleccion_db=data.id_vending;
							if(parseInt(id_vending_seleccion_db) == 1){
								id_vending_seleccion_db = master_machine_select;
							}
							source.close();
							if(__type_project__ === "jofemar"){
								let str_selection = seleccion.toString();
								let dispense_tray = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[0]+''+str_selection[1])+128));
								let dispense_channel = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[2])+128));
						
								ccvJofemarEnginesMatrix(parseInt(master_machine_select),dispense_tray,dispense_channel)
								ccvJofemarExtWaitForProductDown();
							}
							else{
								setTimeout(() => {
									extOwlWaitingForSense(seleccion,id_movimiento);
									owlEnginesMatrix(owlDecToHex(seleccion),"00",owl_time_response_engines);
									
								}, 1000);
							}

							
                		break;
						case "CANCELADO-INACTIVO":
							source.close();
							break;
                	}
                    //send(formData("remoteConfirm",seleccion.id_movimiento));
                    lock=false;
                }
            }
         };
        
    } else {
        addLog("log",'Sorry, your browser does not support server-sent events...');
    }

}

function normalState(){

	console.log("normal state ejecutado");
	timerClose=0;
	setTimeout("timerClose=20",2000);
	$("#changePdtDiv").hide();
	$(".closeVoucher").hide();
	$(".givingBills").text("$ 0.00");
	$(".ingresado").text("$ 0.00");
	setTimeout(function(){owlReadTubes();},200);
	setTimeout(function(){owlReadBillPurse();},500);
	 setTimeout(function(){owlDisableBillPurse();},1200);
	$(".proceso-venta").hide();
    $("#LOADING").show();
    $("#proceso_venta").modal("hide");
	$("#alert-no-money-dispensed").addClass('hidden');
    $("#CASHVOUCHER").hide();
    $("#CASHLESSVOUCHER").hide();
    onetime=false;
    $(".ingresado").text("$ 0.00");
    $(".cambio").text("$ 0.00");
    $(".total").text("$ 0.00");
	$(".btn_cancel_proccess_payment").show();
    //ccv_cambio=0;
    //ccv_monto_ingresado=0;
    //ccv_precio=0;
    owl_amount_retired=0;
	timeout_check_money_dispensed = undefined;
	owl_no_dispense_all_money = false;
	redeem_code="";
    cancelButtonPress=false;
	owl_change=0;
	owl_amount_inserted=0;
	owl_price=0;
	keyCodeRepeat=0;
	keyCode="";
	estatusPagado=false;
	ingresado=0;
	countTimeout=0;

	$("#principalVid").modal('show');
	let vid = document.getElementById("vid_inicio_loop_touch");
	vid.muted = true;
	vid.currentTime=0;
	vid.play();

	$('.productItems').hide();
	$('.productItems').show();
	$('#ffilter').val('');
	$('#sfilter').val('');
	cancelled=false;
	timer_executed = false;
	timerTOUT=15;
	timerValidate=false;
}

function cancelProccessInit(){
	/*owl_change = owl_amount_inserted;
	addLog("log",owl_amount_inserted,owl_change);
	//owlReturnChange();
	//owlReturnChangeCoinPurse();
	owlReturnChangeBillPurse();
	cancelSale();
	setTimeout(()=>{
		normalState();
		owlSoftReload();
		extOwlDisableCoinBillPurses();
		//extOwlDisableBillPurse();
		//extOwlDisableCoinPurse();
	},500);*/
	cancelButtonPress=true;
	cancelarProcesoDePagoButton();
}

function dispenseChangeF(change,id_movimiento,cambio){
	addLog("log","faltante",owl_ict_bill);
	let qant = 0;
	/*if(owl_ict_bill === 0){
		qant =(change/20)
		pname = 'P20';
	}
	else i*/
	if(owl_ict_bill === 1){
		qant =(change/50)
		pname = 'P50';
	}
	/*else if(owl_ict_bill === 2){
		qant =(change/100)
		pname = 'P100';
	}
	else if(owl_ict_bill === 3){
		qant =(change/200)
		pname = 'P200';
	}
	else if(owl_ict_bill === 4){
		qant =(change/500)
		pname = 'P500';
	}
	else if(owl_ict_bill === 5){
		qant =(change/1000)
		pname = 'P1000';
	}*/
	addLog("log","recy",owl_arr_bills_recycler[pname]);
	if(owl_arr_bills_recycler[pname] > 0 && owl_arr_bills_recycler[pname] >= qant){
		owlDispenseBanknoteICT(owl_ict_bill,owlDecToHex(qant));
		setTimeout(function(){

			send(formData('updateMovAfterPurchase',JSON.stringify({'movimiento':id_movimiento,
			'cambio_entregado':cambio})));
		},1000);
	}else{
		alert('Sin suficientes billetes para entregar cambio, cancelando proceso');
	}
}

//reinicia todos los errores de la maquina
function ccvResetAll(){
	setTimeout(function(){
		ccvJofemarReset(1, '80');
	},100);
	setTimeout(function(){
		ccvJofemarReset(1, '81');
	},700);
	setTimeout(function(){
		ccvJofemarReset(1, 'FF');
	},1300);
	
}


function remoteLogin(id){
	Swal.fire({
		title: '¿Iniciar sesion?',
		text: 'Se generará un código que podrás usar para iniciar sesión en la máquina por 30 minutos',
		icon: 'question',
		showCancelButton: true,
		confirmButtonColor: '#d33',
		cancelButtonColor: '#3085d6',
		confirmButtonText: 'Iniciar sesión',
		cancelButtonText: 'Cancelar'
	}).then((result) => {
		if (result.isConfirmed) {
			if(document.getElementById("remoteLoginModal") !== null){
				$('#remoteLoginModal').modal('show');
			}
			send(formData('remoteLogin',id))
		}
	})
}
function remoteLoginQR(result){
	console.log(result);
	document.getElementById("qrcodelogin").innerHTML = '';
	document.getElementById("container-anchorQrcodeDiv").classList.remove('hidden');
	window["qrcodelogin"] = new QRCodeStyling(__conf_qr.square);

	qrcodelogin._options.data = "logincontrol="+result.message.token_session;
	qrcodelogin.update();
	qrcodelogin.append(document.getElementById("qrcodelogin"));
}

function remoteTestEngines(id){
	Swal.fire({
		title: '¿Probar motores?',
		text: 'Se generará un código que podrás usar para probar motores desde la aplicacion en la maquina (valido por 30 minutos)',
		icon: 'question',
		showCancelButton: true,
		confirmButtonColor: '#d33',
		cancelButtonColor: '#3085d6',
		confirmButtonText: 'Probar motores',
		cancelButtonText: 'Cancelar'
	}).then((result) => {
		if (result.isConfirmed) {
			if(document.getElementById("remoteTestEnginesModal") !== null){
				$('#remoteTestEnginesModal').modal('show');
			}
			send(formData('remoteTestEngines',id))
		}
	})
}
function remoteTestEnginesQR(result){
	//console.log(result);
	document.getElementById("qrcodetestengines").innerHTML = '';
	document.getElementById("container-anchorQrcodeDiv").classList.remove('hidden');
	window["qrcodetestengines"] = new QRCodeStyling(__conf_qr.square);

	qrcodetestengines._options.data = "testengines="+result.message.token_session;
	qrcodetestengines.update();
	qrcodetestengines.append(document.getElementById("qrcodetestengines"));
}


function testEnginesModalR(seleccion,uuid){
	let str_selection = seleccion.toString();
	let str_uuid = uuid.toString();
	let dispense_tray = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[0]+''+str_selection[1])+128));
	let dispense_channel = ccvJofemarCheckHexMaker(ccvJofemarDecToHex(parseInt(str_selection[2])+128));

	addLog("log","Dispensando como prueba de motores",{
		"seleccion":seleccion,
		"uuid":uuid,
		"maquina":str_uuid[0],
		"tray":dispense_tray,
		"channel":dispense_channel,
	})
	ccvJofemarEnginesMatrix(parseInt(str_uuid[0]),dispense_tray,dispense_channel)                   
}


function sincronizar(codigo){
	$("#sync_"+codigo).text("");
	$("#sync_"+codigo).append('<input type="button" class="btn btn-warning btn-sm" style="font-size:8pt" value="Sincronizando">');
	send(formData("syncCode",JSON.stringify({"codigo":codigo,"data_key":$("#data_key").val()})));
}
