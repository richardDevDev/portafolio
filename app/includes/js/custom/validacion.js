function onlyNumbers(e){
   var key = window.Event ? e.which : e.keyCode
   return (key >= 48 && key <= 57)
}


function validarCorreo(correo){
	emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    //Se muestra un texto a modo de ejemplo, luego va a ser un icono
    if (emailRegex.test(correo)) {
      return  true;
    } else {
      return false;
    }

}