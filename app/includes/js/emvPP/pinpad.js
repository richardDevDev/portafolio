//var nameAPP = 'lcagkpocmdchcfachibcpjobeifnllfl';
//var nameAPP = 'jdpojgmkohdpceblmhedeomcobekmbda';
//var nameAPP = 'lcfnfgleggaoeclfpkamebblgbonegee';
var nameAPP = 'hbmhpngdlimbncbkfmbodphninahciaa';


var port = chrome.runtime.connect(nameAPP);
var tipoMoneda = '';

var cierraPopup = true;
var ambiente = 'PROD';
var versionApp = "Versión 1.0.7";
var counterLogin=0;
//objeto que almacena la respuesta de la venta
var objResponse;

//objeto de usuario login
var objDataLogin = {
  Ambiente: '',
  Usuario: '',
  Pass: ''
}

//objeto de getKeys
var objDataKeys = {
  Ambiente: '',
  Usuario: '',
  Pass: '',
  Country: '',
  IdBranch: '',
  IdCompany: ''
}


var objDataTRX = {
  Ambiente: '',
  Currency: '',
  CurrencyCode: '',
  Amount: '',
  
  //Seccion Pinpad
  TimeOutPinPad: '100',
  SoportaFirma : '1',
  SoportaCTLS : '1',
  MarcaTerminal: '',
  ModeloTerminal: ''
  
}

//objeto de Afiliaciones
var objDataMerchant = {
  Ambiente: '',
  BIN: '',
  User: '',
  Currency: ''
}

//objeto de la venta
var objDataVenta = {
  Ambiente: '',
  Country: '',
  IdBranch: '',
  IdCompany: '',
  pwd: '',
  User: '',
  UserTRX: '',
  EMV: '',
  ModeloTerminal: '',
  SerieTerminal: '',
  Contactless: '',
  Printer: '',
  VersionTerminal: '',
  TpOperation: '',
  Reference: '',
  Amount: '',
  Currency: '',
  Merchant: '',
  Reverse: '' 
}

//objeto para impresion
var objPrint = {
  Ambiente: '',
  VoucherComercio: '',
  VoucherCliente: '',
  ModeloTerminal: ''
}

//Cancelacion
var objDataCancelacion = {
  Ambiente: '',
  User: '',
  Pwd: '',
  IdBranch: '',
  IdCompany: '',
  Country: '',
  UserTRX: '',
  Tx_OperationNumber: '',
  Tx_Auth: '',
  Amount: ''
}

//pass
var pwd;

//nodo de las afiliaciones
var nodoContado;
var nodoMSI;
var nodoMCI;


var timerTOUT=15;
var timerValidate=false;
//START: starts the timer with the default config.
//STOP: stops the timer and reset the time
//PAUSE: stops the timer but not the time
//RESET: just reset the time, but the function continues
//Atte. Iván
function timerTimeout(opt){
	console.log(timerTOUT);
	if (timerValidate) {
		switch(opt){
			case "PAUSE":
				//do nothing, the counter no reset.
			break;
			case "RESET":
				timerTOUT=15;
				setTimeout("timerTimeout('START')",1000);
			break;
			case "STOP":
			console.log("timer stop");
				timerTOUT=15;
				timerValidate=false;

			break;
			case "START":
				timerTOUT--;
		    if (timerTOUT<=0) {
		        timerTOUT=15;
		        cancelarProcesoDePagoTOUTPinpad();
		    }else{
		    		setTimeout("timerTimeout('START')",1000);
		    }
			break;
		}
	}else{
		timerTOUT=15;
	}
		
    //$(".closeVoucher").show();
    //$(".timerCloseDiv").text(timerTOUT);
    
}

function OnlyLogin(){

	var obj;
	var aux;
	
	objDataLogin.Ambiente = ambiente;
	objDataLogin.Usuario = $("#usr").val();//EMV 
	objDataLogin.Pass = $("#pss").val();

	console.log('Login');
	estatus("login");
	var portL = chrome.runtime.connect(nameAPP, {name: "login"});
	portL.postMessage(objDataLogin);

    portL.onMessage.addListener(function getResp(response) {
    	console.log("logindata"+ response);
		obj = JSON.parse(response);
		aux = obj['RESPUESTA'];
		
		if(aux == null || aux == 'error'){
				$("#errorEmv").text(obj['ERROR']);
				$("#errorEmv").show();
				setTimeout('$("#errorEmv").hide();',3000);
				return;
		}
		else{
			objUser = obj;
			$("#nb_user").val(objUser['nb_user']);
			$("#bs_company").val(objUser['bs_company']);
			$("#nb_company").val(objUser['nb_company']);
			$("#nb_streetcompany").val(objUser['nb_streetcompany']);
			$("#bs_branch").val(objUser['bs_branch']);
			$("#nb_branch").val(objUser['nb_branch']);
			$("#bs_country").val(objUser['bs_country']);
			$("#monedas").val(objUser['monedas']);
			$("#monedasMOTO").val(objUser['monedasMOTO']);
			$("#execute_reverse").val(objUser['ExecuteReverse']);
			$("#btnEmv").show();
		}
	});


}

function launchApp(){
	estatus("launch");
	var portL = chrome.runtime.connect(nameAPP, {name: "launchApp"});
	portL.postMessage(nameAPP);
	portL.onMessage.addListener(function getResp(response) {
	
	var objLogin = JSON.parse(response);
  	
  	console.log(objLogin.RESPUESTA);
	if(objLogin['RESPUESTA'] === 'ok') {
		Login();
	}else{
		error("fail-launch");
	}

	});
}

function test(){
	estatus("pagado");
}



function Login()
{
	var obj;
	var aux;
	
	objDataLogin.Ambiente = ambiente;
	objDataLogin.Usuario = usPP;
	objDataLogin.Pass = psPP;

	console.log('Login');
	estatus("login");
	var portL = chrome.runtime.connect(nameAPP, {name: "login"});
	portL.postMessage(objDataLogin);

    portL.onMessage.addListener(function getResp(response) {
    	console.log("logindata"+ response);
		obj = JSON.parse(response);
		aux = obj['RESPUESTA'];
		
		if(aux == null || aux == 'error'){
			console.log("intento: "+counterLogin);
			counterLogin++;
			if (counterLogin==2) {
				error("fail-login");
				return;
			}else{
				Login();
			}
			return;
		}
		else{
			localStorage.setItem('datosusuario', response);
			localStorage.setItem('user', objDataLogin.Usuario +'|' + objDataLogin.Pass);
			
			objUser = JSON.parse(localStorage.getItem('datosusuario'));
			
			objDataKeys.Ambiente = ambiente;
			objDataKeys.Usuario = objDataLogin.Usuario;
			objDataKeys.Pass = objDataLogin.Pass;
			objDataKeys.Country = objUser['bs_country'];
			objDataKeys.IdBranch = objUser['bs_branch'];
			objDataKeys.IdCompany = objUser['bs_company'];

			//Se llaman las llaves RSA
			console.log('getKeyRSA');
			console.log(objDataTRX.Amount);
			
			console.log("timer start");
			timerValidate=true;
			timerTimeout("START");
			estatus("rsakey");
			portL = chrome.runtime.connect(nameAPP, {name: "getKeysRSA"});
			portL.postMessage(objDataKeys)

			portL.onMessage.addListener(function getResp(response) {
				timerValidate=false;
				timerTimeout("STOP");
				console.log('pinpadData'  + response);
				//datos de la pinpad
				localStorage.setItem('datosPinPad', response);
				
				obj = JSON.parse(response);
				aux = obj['RESPUESTA'];
				
				if(aux == null || aux == 'error') {
					error("fail-keys");
				}
				else {
					//Configuracion

					var pinpad=JSON.parse(localStorage.getItem('datosPinPad'));

					objDataTRX.Ambiente = ambiente;
					objDataTRX.Currency = "MXN";		  //Currency
					objDataTRX.CurrencyCode = "0484";	  //CurrencyCode
					//objDataTRX.Amount = "1";		  //Amount
					objDataTRX.MarcaTerminal = pinpad['marca']; 			  //MarcaPinPad
					objDataTRX.ModeloTerminal = pinpad['modelo']; 			//ModeloTerminal

					console.log("Read Card");
					estatus("readCard");
					portL = chrome.runtime.connect(nameAPP, {name: "readCard"});
					portL.postMessage(objDataTRX);

					console.log(portL);
					portL.onMessage.addListener(function getResp(response) {

						console.log("respWP-" + response);

						var aux = '';
						var objTRX = JSON.parse(response);
				  
						aux = objTRX['RESPUESTA'];
						
						if(aux == null || aux == 'error')
						{	
							console.log(objTRX);
							switch (objTRX.codError){
								case "01"://Tarjeta Ilegible
									error("fail-card-ilegible");
								break;
								case "02"://Importe Incorrecto
									error("fail-card-importe");
								break;
								case "03"://No hay respuesta del lector
									error("fail-card-noresponse");
								break;
								case "04"://No hay planes de pago
									error("fail-card-plan");
								break;
								case "10"://Operacion Cancelada
									error("fail-card-cancelada");
								break;
								case "11"://Proceso Cancelado Timeout
									error("fail-card-timeout");
								break;
								case "12"://Lectura Erronea de Banda/Chip
									error("fail-card-read");
								break;
								case "14"://Error de Lectura PIN
									error("fail-card-pin");
								break;
								case "15"://Tarjeta Vencida
									error("fail-card-cad");
								break;
								case "16"://Problemas al leer el chip
									error("fail-card-chip");
								break;
							
								case "22"://Tarjeta Bloqueada
									error("fail-card-bloqued");
								break;
								default://Transaccion Declinada por el PINPAD
									error("fail-card");
								break;
							}
							
							return;
						}
						else {
							
							//SE PROCESA EL RESULTADO DE LA TARJETA
							var binT = '';
							if(objTRX['maskPan'].length > 6)
								binT = objTRX['maskPan'].substring(0,6);
							
							//quitar hardcode
							var dataUser=JSON.parse(localStorage.getItem('datosusuario'));
							objDataMerchant.Ambiente = ambiente;
							objDataMerchant.BIN = binT;							//BIN
							objDataMerchant.User = objDataLogin.Usuario;			        //User
							objDataMerchant.Currency = objDataTRX.Currency;		//Currency

							//Get Afiliaciones
							console.log("Get Afiliaciones");
							estatus("afiliaciones");
							portL = chrome.runtime.connect(nameAPP, {name: "getMerchant"});
							portL.postMessage(objDataMerchant);
							portL.onMessage.addListener(function getResp(response) {
								
								console.log("respWP getMerchant-" + response);
								
								objTRX = JSON.parse(response);
								aux = objTRX['respuesta'];
								console.log(objTRX);
								if(aux == null || aux == '0') {
									//error de Lectura
									cancelReadCard();

									return;
								}
								else {

									//var objResponse;
									var respTRX;
									var respVoucher;
									console.log("Configurando Cobro");
									//Se llenan los valores del [obj]eto de la transacción
									$("#timerPinpad0").timer('pause');
									var datosUser = localStorage.getItem('user');
									var params;
									if(datosUser.includes("|")) {
										params = datosUser.split("|");
										dataPWD = params[1];
									}
									objDataVenta.Country = objDataKeys.Country;
									objDataVenta.IdBranch = objDataKeys.IdBranch;
									objDataVenta.IdCompany = objDataKeys.IdCompany;
									objDataVenta.pwd = objDataKeys.Pass;
									objDataVenta.User = objDataKeys.Usuario;
									
									objDataVenta.Amount = objDataTRX.Amount;
									objDataVenta.Currency = objDataTRX.Currency;
									objDataVenta.Merchant = objTRX.contado.af.merchant;
									//Referencia unica: objDataVenta.Reference = "Pruebas Coin11";
									objDataVenta.Reference=$("#id_movimiento").val();
									objDataVenta.UserTRX = 'userPinpadWeb';
									objDataVenta.TpOperation = "29";
									//Tp operation 29 Desatendido; 11 Sitio Atendido
									
									
									objDataVenta.EMV = pinpad['EMV'];
									objDataVenta.ModeloTerminal = pinpad['modelo'];
									objDataVenta.SerieTerminal = pinpad['serie'];
									objDataVenta.Contactless = pinpad['soportaCTLS'];
									objDataVenta.Printer = pinpad['impresora'];
									objDataVenta.VersionTerminal = pinpad['versionApp'];
									
									objDataVenta.Ambiente = ambiente;
									objDataVenta.Reverse = dataUser['ExecuteReverse'];
									//Send Cobro
									console.log(objDataVenta);
									
									var portL = chrome.runtime.connect(nameAPP, {name: "sndVentaDirectaEMV"});
									portL.postMessage(objDataVenta);

									portL.onMessage.addListener(function getResp(response) {
									console.log("resultado de la transaccion");
									objResponse = JSON.parse(response);
									
							  		console.log(response);
									if(objResponse['response'] != 'approved'){
										var codeError;
										var msgError;
										
										if(objResponse['response'] == 'denied' ) {
											codeError = objResponse['cd_response'];
										    msgError = objResponse['friendly_response'];
										    switch(objResponse.cd_response){
										    	case "51":
										    		error("fail-operation-founds");
										    	break;
										    	case "57":
										    		error("fail-operation-limit");
										    	break;
										    }
										}
										else {

											if(objResponse['response'] == 'error' ) {
												codeError = objResponse['cd_error'];
										    	msgError = objResponse['nb_error'];
											}else {
												codeError = objResponse['codError'];
										    	msgError = objResponse['ERROR'];	
											}
										}

										$("#codeError").text(codeError);
										$("#messageError").text(msgError);
										error("fail-denied");
										return;
									}
									else {
										$("#autorizacion").val(objResponse['auth']);
										$("#aprobacion").val(objResponse['foliocpagos']);
										$("#fecha_aprobacion").val(objResponse['date']+" "+objResponse["time"]);
										var voucherBruto=objResponse.voucher_comercio;
										console.log(voucherBruto);
										var voucher1=voucherBruto.split("VALIDADO CON FIRMA ELECTRONICA");
										$("#firmaDiv").show();

										if (voucher1.length==2) {
											$("#firma").text("VALIDADO CON FIRMA ELECTRÓNICA");
										}else{
											var voucher2=voucherBruto.split("Autorizado sin Firma");
											if (voucher1.length==2) {
												$("#firma").text("AUTORIZADO SIN FIRMA");
											}else{
												$("#firma").text("COBRO AMEX");
											}
											
											//Autorizado sin Firma
										}


										$("#voucherAuth").text(objResponse['auth']);
										$("#voucherAprov").text(objResponse['foliocpagos']);
										estatus("pagado");
										
										return;
									}

									cancelReadCard();

								});
									

								}	
								
							}); 

						}
						
					});//termina Read Card
				}
				
		    });
		}
	  
    });

	
}

function cancelReadCard(){
	console.log("Cancela Readcard");
	portL = chrome.runtime.connect(nameAPP, {name: "cancelReadCard"});
	portL.postMessage(objDataTRX.MarcaTerminal);
	//error("fail-cancel");
	portL.onMessage.addListener(function getResp(response) {
	console.log("Operacion Cancelada ", response);
	});
}

function cancelacion(){
	objDataCancelacion.Ambiente = ambiente;
	objDataCancelacion.User = objDataKeys.Usuario;
	objDataCancelacion.Pwd = objDataKeys.Pass;
	objDataCancelacion.IdBranch = objDataKeys.IdBranch;
	objDataCancelacion.IdCompany = objDataKeys.IdCompany;
	objDataCancelacion.Country = objDataKeys.Country;
	objDataCancelacion.UserTRX = 'userPinpadWeb';

	objDataCancelacion.Tx_OperationNumber = $('#aprobacion').val();
	objDataCancelacion.Tx_Auth = $('#autorizacion').val();
	objDataCancelacion.Amount = objDataTRX.Amount;

	jsonObtenido = '';

	var portL;
	console.log("Cancelación");
	portL = chrome.runtime.connect(nameAPP, {name: "sndCancelacion"});
	portL.postMessage(objDataCancelacion);

	portL.onMessage.addListener(function getResp(response) {
		
		console.log("respWP-" + response);
		jsonObtenido = response;

  		var resp;
		var objTRX = JSON.parse(response);
		
  		if(objTRX['response'] == 'approved') {

  			$("#autorizacion-cancelacion").val(objTRX['auth']);
			$("#aprobacion-cancelacion").val(objTRX['foliocpagos']);
			$("#fecha_aprobacion-cancelacion").val(objTRX['date']+" "+objTRX["time"]);


			$("#voucherAuthCancel").text(objTRX['auth']);
			$("#voucherAprovCancel").text(objTRX['foliocpagos']);
			$("#voucherRefCancel").text(objTRX['reference']);
			$("#voucherCancel").show();
			formValidate("cancelacionVenta");
  		}
  		else{
  			
	  			if(objTRX['RESPUESTA'] == 'error' ){
					$("#autorizacion-cancelacion").val(objTRX['RESPUESTA']);
					$("#aprobacion-cancelacion").val(objTRX['ERROR']);
					$("#fecha_aprobacion-cancelacion").val("sin fecha");

					$("#voucherAuthCancel").text(objTRX['RESPUESTA']);
					$("#voucherAprovCancel").text(objTRX['ERROR']);
					$("#voucherRefCancel").text(objTRX['codError']);
					$("#voucherCancel").show();
					formValidate("cancelacionVenta");

					return;
				}
				else{
					$("#autorizacion-cancelacion").val(objTRX['nb_error']);
					$("#aprobacion-cancelacion").val(objTRX['cd_error']);
					$("#fecha_aprobacion-cancelacion").val("response");

					$("#voucherAuthCancel").text(objTRX['nb_error']);
					$("#voucherAprovCancel").text(objTRX['cd_error']);
					$("#voucherRefCancel").text(objTRX['response']);
					$("#voucherCancel").show();
					formValidate("cancelacionVenta");
					return;
	  			}
			}


	});
}


function cancelacionPanelControl(aprobacion,autorizacion,monto){
	objDataCancelacion.Ambiente = ambiente;
	/*objDataCancelacion.User = objDataKeys.Usuario;
	objDataCancelacion.Pwd = objDataKeys.Pass;
	objDataCancelacion.IdBranch = objDataKeys.IdBranch;
	objDataCancelacion.IdCompany = objDataKeys.IdCompany;
	objDataCancelacion.Country = objDataKeys.Country;
	objDataCancelacion.UserTRX = 'userPinpadWeb';*/

	objDataCancelacion.Tx_OperationNumber = $('#aprobacion').val();
	objDataCancelacion.Tx_Auth = $('#autorizacion').val();
	objDataCancelacion.Amount = objDataTRX.Amount;

	jsonObtenido = '';

	var portL;
	console.log("Cancelación");
	portL = chrome.runtime.connect(nameAPP, {name: "sndCancelacion"});
	portL.postMessage(objDataCancelacion);

	portL.onMessage.addListener(function getResp(response) {
		
		console.log("respWP-" + response);
		jsonObtenido = response;

  		var resp;
		var objTRX = JSON.parse(response);

			console.log(objTRX);
		
  		if(objTRX['response'] == 'approved') {
  			//send(formData('cancelacionVentaPanel',JSON.stringify(objTRX)))

  			/*$("#autorizacion-cancelacion").val(objTRX['auth']);
				$("#aprobacion-cancelacion").val(objTRX['foliocpagos']);
				$("#fecha_aprobacion-cancelacion").val(objTRX['date']+" "+objTRX["time"]);


				$("#voucherAuthCancel").text(objTRX['auth']);
				$("#voucherAprovCancel").text(objTRX['foliocpagos']);
				$("#voucherRefCancel").text(objTRX['reference']);
				$("#voucherCancel").show();*/
			formValidate("cancelacionVenta");
  		}else{	
	  			if(objTRX['RESPUESTA'] == 'error' ){

					/*$("#autorizacion-cancelacion").val(objTRX['RESPUESTA']);
					$("#aprobacion-cancelacion").val(objTRX['ERROR']);
					$("#fecha_aprobacion-cancelacion").val("sin fecha");

					$("#voucherAuthCancel").text(objTRX['RESPUESTA']);
					$("#voucherAprovCancel").text(objTRX['ERROR']);
					$("#voucherRefCancel").text(objTRX['codError']);
					$("#voucherCancel").show();
					formValidate("cancelacionVenta");*/

					return;
				}
				else{
					/*$("#autorizacion-cancelacion").val(objTRX['nb_error']);
					$("#aprobacion-cancelacion").val(objTRX['cd_error']);
					$("#fecha_aprobacion-cancelacion").val("response");

					$("#voucherAuthCancel").text(objTRX['nb_error']);
					$("#voucherAprovCancel").text(objTRX['cd_error']);
					$("#voucherRefCancel").text(objTRX['response']);
					$("#voucherCancel").show();*/
					//formValidate("cancelacionVenta");
					return;
	  			}
			}


	});
}