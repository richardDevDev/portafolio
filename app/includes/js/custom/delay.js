


$(function(){
    console.log("loader");
    if (typeof __demo == 'undefined'){
        console.log("prod");
    let _time = 6000;
    let _progress = document.getElementById('progress-bar-preloader');
    let _progress_time = 0;
    let inter = setInterval(function(){
        if(_progress_time >= (_time / 25)){
            clearInterval(inter);
            inter = 0;
            return;
        }
        let pr = 100 * (_progress_time*25) / _time;
        _progress.style.width = pr+'%'; 
        _progress_time++;
    },25);
    setTimeout(function(){
        let permission = document.getElementById('container-warning-modal-permission');
        if(permission === null){
            Swal.fire('Error de la aplicación, es probable que el sistema no inicie');
        }
        else if(!permission.classList.contains('hidden')){
            if(window.errorextension){
                //_progress.style.backgroundColor = "#f00";
                //_progress.style.fontSize = "2rem";
                //_progress.style.color = "#fff";
                //_progress.style.textAlign = "center";
                //_progress.style.innerHTML = "Error";
                $(_progress).css('color','#fff').css('font-size','2rem').css('background-color','#f00').css('text-align','center').text('Error');
                document.getElementById('txt-preloader-init').style.fontSize = '2rem';
                document.getElementById('txt-preloader-init').style.width = '80%';
                document.getElementById('txt-preloader-init').style.margin = '0 auto';
                document.getElementById('txt-preloader-init').innerHTML = "Extensión no cargada, revisa que todas las extensiones esten correctamente instaladas y recarga la página.<br><b class='text-danger'>Error irreparable, la aplicación no cargará.<b><br><a href='"+location.href+"' class='text-primary'>Recargar</a>"
            }else{
                permission.style.zIndex = 999999999;
                detectWhenBoardroidConnect();
            }
        }else{
            if(window.errorextension){
                $(_progress).css('color','#fff').css('font-size','2rem').css('background-color','#f00').css('text-align','center').text('Error');
                document.getElementById('txt-preloader-init').style.fontSize = '2rem';
                document.getElementById('txt-preloader-init').style.width = '80%';
                document.getElementById('txt-preloader-init').style.margin = '0 auto';
                document.getElementById('txt-preloader-init').innerHTML = "Extensión no cargada, revisa que todas las extensiones esten correctamente instaladas y recarga la página.<br><b class='text-danger'>Error irreparable, la aplicación no cargará.<b><br><a href='"+location.href+"' class='text-primary'>Recargar</a>"
            }else{
                $('#preloader-init').fadeOut();
            }
        }
    },(_time+200))

}else{
    console.log("demo");
    $('#preloader-init').fadeOut();
}
})


function detectWhenBoardroidConnect(){
    let permission = document.getElementById('container-warning-modal-permission');
    let inter = setInterval(function(){
        if(permission.classList.contains('hidden')){
            $('#preloader-init').fadeOut();
            clearInterval(inter);
            inter = 0;
        }
    },1e3)
}


/*
var conexion = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
var tipo = conexion.effectiveType;

function updateConnectionStatus() {
  console.log("Connection type changed from " + tipo + " to " + conexion.effectiveType);
  tipo = conexion.effectiveType;
}

conexion.addEventListener('change', updateConnectionStatus);
*/
