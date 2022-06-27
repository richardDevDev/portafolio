var formatNumber = {separador: ",", Decimal: '.', formatear:function (num){num +='';var splitStr = num.split('.');var splitLeft = splitStr[0];var splitRight = splitStr.length > 1 ? this.sepDecimal + splitStr[1] : '';var regx = /(\d+)(\d{3})/;while (regx.test(splitLeft)) {splitLeft = splitLeft.replace(regx, '$1' + this.separador + '$2');}return this.simbol + splitLeft +splitRight;},new:function(num, simbol){this.simbol = simbol ||'';return this.formatear(num);}}

function formValidate(input){var elementos = $("."+input);var form = new FormData();var j=0;var faltan="";for (var i=0; i<elementos.length; i++) {if ($(elementos[i]).hasClass("notnull")) {if (elementos[i].value=="") {faltan+=$("#label-"+elementos[i].id).text()+'<br>';}}form.append(elementos[i].id,elementos[i].value);}
	if (faltan!="") {Swal.fire("Validacion","Los siguientes campos son obligatorios<br>"+faltan,"error");}else{form.append("handler",input);send(form);}}

function formData(handler,value){
	var form= new FormData();
	form.append("handler",handler);
	form.append("value",value);
	return form;
}

function send(datos){
	$.ajax({
		url:   BASE_URL+'/app/handlers/ajax.handler.class.php',type:  'POST',dataType: "html",data:  datos,processData: false,contentType: false,cache: false,
		beforeSend: function () {},
		error: function(){},
		success:  function (response) {
			addLog("log",response);
			result=JSON.parse(response);
			switch (result.no){
				case 'WEBPAY':
				addLog("log","webpay",result);
					$(".proceso-venta").hide();
					//div que muestra Iframe
					$('#frame_payment_mitec').attr('src',result.message);
					$("#WEBPAY").show();

					//Imprimir Datos Ticket
					$("#ticketFecha").text(result.fecha);
					$("#ticketFolio").text(result.folio);
					$("#ticketProducto").text(result.clave_articulo);
					$("#ticketDescripcion").text(result.descripcion);
					$("#ticketSeleccion").text(result.seleccion);
					$("#ticketTotal").text("$ "+parseFloat(result.precio).toFixed(2));

					setTimeout('send(formData("listenWebpay",result.id_movimiento))',1500) ;
					
					//Al termina de cobrar generar código QR
					/*var qrcode = new QRCode("qrRedeem");
					qrcode.makeCode(result.code);*/

					//Al terminar Mostrar Voucher
					//$("#WEBPAYVOUCHER").show();
				break;

				case "LISTENWEBPAY":
					addLog("log",result);
					$(".cpagos").text(result.cpagos);

					switch(result.type){
						case "success":
						$("#qrRedeemVoucher").html(result.code);
							$(".proceso-venta").hide();
							$("#WEBPAYVOUCHER").show();
						break;
						case "denied":
							$(".razon").text(result.erro);
							$(".ticket-label").hide();
							$("#label-denied").show();
							$("#razon").show();
							$(".proceso-venta").hide();
							$("#WEBPAYVOUCHER").show();
						break;
						default:
							setTimeout('send(formData("listenWebpay",result.id_movimiento))',1500) ;
						break;

					}
				break;

				case 'INFOCODE':
					$(".history").hide();
					$("#details").show();
					$("#qrRedeem").text("");
					if (result.code!=undefined) {
						$("#qrRedeem").html(result.code);
						$("#code").show();
					}else{
						$("#code").hide();
					}
					//Imprimir Datos Ticket
					result=result.message[0];
					$("#ticketFechaInfo").text(result.fecha_creacion);
					if (result.nb_error!="") {
						$("#ticketcpagosInfo").text(result.nb_error);
					}else{
						$("#ticketcpagosInfo").text(result.fol);
					}
					
					$("#ticketProductoInfo").text(result.cve);
					$("#ticketSeleccionInfo").text(result.sel);
					$("#ticketTotalInfo").text("$ "+parseFloat(result.tot).toFixed(2));
				break;
			}
		}
	});
}


function showPrice(data){
	var divVariantes=$("#divVariantes");
	$(`#id_product`).val("");
	divVariantes.text("");
	var variantes=data.variantes;
	addLog("log",variantes);
	for(var i=0;i<variantes.length;i++){
		divVariantes.append("<div id='variant-"+variantes[i].id_variante+"' onclick='$(`.variantesbtn`).removeClass(`active`);$(this).addClass(`active`);$(`#id_product`).val(`"+variantes[i].id_variante+"`)' class='variantesbtn mt-2 col-10 pl-0 pr-0 text-center pt-2 m-1 variantes'>"+variantes[i].clave_variante+"</div>");
	}
	addLog("log",data);
	//$("#id_product").val(data.id_producto);
	$("#preview-img").attr("src","app/assets/img/products/"+data.imagen_preview);
	$("#preview-description").text(data.descripcion);
	$("#preview-sku").text(data.clave_articulo);
	$("#preview-price").text("$ "+parseFloat(data.precio).toFixed(2));
	$("#preview").modal("show");
	//objDataTRX.Amount=data.precio;
	ccv_precio=data.precio;
}

function initProcess(type){
		
		if ($("#id_product").val()>0) {
			$("#preview").hide();
				$(".proceso-venta").hide();
				switch(type){
					case 'QR':
					$("#qrcodeDiv").text("");
						var qrcode = new QRCode("qrcodeDiv");
						qrcode.makeCode($("#id_product").val());
						$("#proceso_venta").modal({backdrop: 'static', keyboard: false});
						$("#QR").show();
					break;

					case 'webpay':
						$("#proceso_venta").modal({backdrop: 'static', keyboard: false});
						$("#COBRARFORM").show();
					break;
				}
			
		}else{
			Swal.fire("Alerta","Elige por lo menos una Talla o Color","warning")
		}
	}

function webpayNext(){
	//$(".proceso-venta").hide();
	//$("#LOADING").show();
	var elementos = $(".startProcessWebpay");
	var form = new FormData();
	var j=0;var faltan="";
	for (var i=0; i<elementos.length; i++) {
		if ($(elementos[i]).hasClass("notnull")) {
			if (elementos[i].value=="") {
				faltan+=$("#label-"+elementos[i].id).text()+'<br>';
			}
		}
	}
	if (faltan!="") {Swal.fire("Validacion","Los siguientes campos son obligatorios<br>"+faltan,"error");}else{formValidate("startProcessWebpay")};
}

function cancelWebpay(){
	location.reload();
	$('#preview').modal('hide');$('#proceso_venta').modal('hide');
	$("#email").val("");
	$("#phone").val("");

}

function cancelSale(){
	$("#preview").modal("hide");
	$("#proceso_venta").modal("hide");
}