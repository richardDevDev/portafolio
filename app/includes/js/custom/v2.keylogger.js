window.onload = function() { 
	document.onkeypress = keylogger;
	addLog("log","Owl keylogger V2 ready");
}
var site=placeOfUse(); //place of keylogger use
var keyCodeRepeat=0; //keyActivation read times
var keyCode="";
//key behavior
var keyActivation="Enter";
var keyIgnore=["CapsLock","F1","F2","F3","Shift"];

//time execution script after keyActivation
var maxTimeExecution=30;//seconds
var minTimeExecution=0;//start counter;



function keylogger(evObject) {
	if (keyCode.length==1) {
		$("#principal").modal("hide");
		$(".bill-bar").hide();
		$("#preview").modal("hide");
		$("#proceso_venta").modal({backdrop: 'static', keyboard: false}); 
		$(".btn_cancel_proccess_payment").hide();
		$('.proceso-venta').hide();
		$("#READQR").show();
	}

	if (evObject.key==keyActivation) {//If  it detects keyActivaton has been pressed do:
		addLog("log",keyCode);
		if (keyCodeRepeat==0) { //Times that can read a code after keyActivation key.
			switch(site){
				case 'index':
					addLog("log","Código Leido Correctamente: "+keyCode);
					//logger+="{success:codigo leido: "+keyCode+"}";
					keyCodeRepeat++;
					//timerQuery();
					//do someting
					executeScript();
				break;
				default:
					addLog("log","Código Leido Correctamente sin acciones pendientes: "+keyCode);
				break;
			}
		}else{//ignore 2nd keyActivation Execution
			addLog("log","codigo ignorado: "+keyCode);
			//logger+="{error:codigo ignorado: "+keyCode+"}";
		}


	}else{ //concat evObject.key
		if (keyCodeRepeat==0) {
			switch(evObject.key){
				/*case "1":case "2":case "3":case "4":case "5":case "6":case "7":case "8":case "9":case "0":case "A":case "B":case "C":case "D":case "E":case "F":case "G":case "a":case "b":case "c":case "d":case "e":case "f":case "g":
					
				break;*/
				default: //Accept all keys
					var foundKey=false;
					for(var i=0;i<keyIgnore.length;i++){ //ignore Keys
						if (keyIgnore[i]==evObject.key) {foundKey=true;break;}
					}
					if (!foundKey) { //concat keys
						keyCode+=evObject.key;
					}
				break;
			}
		}else{
			addLog("log","Key ignored:"+evObject.key);
		}
		
	}
}

function resetKeylogger(){
	keyCodeRepeat=0;
	keyCode="";
}

function timerQuery(){
	if (minTimeExecution>=maxTimeExecution) {
		//time end and do something
		timeOutExecution();
		minTimeExecution=0; //restart counter and stops timer;
	}else{
		minTimeExecution++;
		setTimeout("timerQuery()",1000);
	}
}

function placeOfUse(){
	/*
	var rutaAbsoluta = self.location.href;   
	var posicionUltimaBarra = rutaAbsoluta.lastIndexOf("/");
	var rutaRelativa = rutaAbsoluta.substring( posicionUltimaBarra + "/".length , rutaAbsoluta.length );
	if (rutaRelativa=="") {
		rutaRelativa='index';
	}
	return rutaRelativa.replace(".php","");  
	*/
	let pathname = (location.pathname).replaceAll('/','').replaceAll('.php');
	if(pathname.trim() === ''){
		pathname = 'index';
	}

	return pathname;
}

function executeScript() {//"ok read" function execution
	if (keyCode.includes("logincontrol=") || keyCode.includes("logincontrol¿")) {
		if (keyCode.includes("logincontrol¿")) {
			$.each(keyReplacer.search, function (index, val) {
				console.log(val, keyReplacer.replace[index]);
				keyCode = keyCode.replaceAll(val, keyReplacer.replace[index])
			})
		}

		setTimeout(function(){
			$('.proceso-venta').hide();
			$("#proceso_venta").hide();
		},1000)

		let action_qr = keyCode.split("logincontrol=");
		send(formData("loginWithQR", action_qr[1]));
		resetKeylogger();
	}
	else if (keyCode.includes("testengines=") || keyCode.includes("testengines¿")) {
		if (keyCode.includes("testengines¿")) {
			$.each(keyReplacer.search, function (index, val) {
				console.log(val, keyReplacer.replace[index]);
				keyCode = keyCode.replaceAll(val, keyReplacer.replace[index])
			})
		}

		setTimeout(function(){
			$('.proceso-venta').hide();
			$("#proceso_venta").hide();
		},1000)

		let action_qr = keyCode.split("testengines=");
		send(formData("testEnginesWithQR", action_qr[1]));
		resetKeylogger();
	} else {
		//if(keyCode.includes("'")){
		//	keyCode.toString().replace("'","-").replaceAll("'","-");
		//}
		keyCode = keyCode.toUpperCase();
		switch (keyCode) {
			case 'CONTROL':
			case 'CONTRO':
				location.href = BASE_URL + "/login?auto=true";
				break;

			case 'FILL':
			case 'FIL':
				send(formData("fillMachine", keyCode));
				keyCodeRepeat = 0;
				keyCode = "";
				break;

			case 'RESET':
			case 'RESE':
				location.reload();
				keyCodeRepeat = 0;
				keyCode = "";
				break;

			case 'STOCK':
			case 'STOC':
				if (stock == false) {
					stock = true;
					$("#about").modal();
				} else {
					stock = false;
					$("#about").modal("hide");
				}
				keyCodeRepeat = 0;
				keyCode = "";
				break;

			default:
				if (keyCode.includes("-")){
					$(".div-process").hide();
					$("#sending").show();
					//send(formData("sendKeyV2", keyCode)); // playergroup tenia esto
					send(formData("sendKeyRedeem", keyCode)); // esto lo tenia belle
				}else{
					$(".div-process").hide();
					$("#sending").show();
					//send(formData("sendKeyV2", keyCode)); // playergroup tenia esto
					send(formData("sendKeyEncrypt", keyCode)); // esto lo tenia belle
				}
				
				break;
		}
	}
}

function timeOutExecution(){//timeout function execution

}

