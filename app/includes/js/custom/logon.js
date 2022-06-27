function paintValidation(color,input){
	input.css("background-color","#"+color);
}

function flushForm(input){
	var elementos = $("."+input);
	var form = new FormData();
	var j=0;
	for (var i=0; i<elementos.length; i++) {
		form.append(elementos[i].id,elementos[i].files[0]);
	}
	form.append("handler","login")
	return form;
}

function validar(){
	var elementos = $(".notnull");
	var contador=0;
	for (var i=0; i<elementos.length; i++) {
	   if ($("#"+elementos[i].id).val()=="") {
	   	paintValidation("EC644B",$("#val"+elementos[i].id));
	   	return false;
	   }else{
	   	paintValidation("87D37C",$("#val"+elementos[i].id));
	   	contador++;
	   }
	}
	if (contador==elementos.length) {
		return true
	}
}

function sendLogin(datos){
	$.ajax({
		data:  datos,
		url:   BASE_URL+'/app/handlers/logon.app.php',
		type:  'post',
		dataType: "html",
		processData: false,
		contentType: false,
		cache: false,
		beforeSend: function () {
		        
		},
		success:  function (response) {
			addLog("log",response);
			result=JSON.parse(response);
			switch (result.no){
				case "1":
				$("#mensajes").text(result.message);
				if (typeof result.url!="undefined") {
					location.href=result.url;
				}
				break;
				
			}

		}
	});
}

function mensaje(msg){
	$("#mensajes").text(msg);
	$("#mensajes").show("swing");
}