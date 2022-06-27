if (__type_project__ === 'jofemar') {
    // Route where is the image to be shown if the device is not detected
    var ccv_jofemar_cod_img_no_detected = "/app/includes/images/linkers/machine_disconnected.gif";
    var ccv_jofemar_cod_img_door_open = "/app/includes/images/linkers/machine_door_open.png";
    var ccv_jofemar_cod_img_door_closed = "/app/includes/images/linkers/machine_ok.png";

    //let ccv_slave_jofemar_cod_img_no_detected = "/app/includes/images/linkers/machine_disconnected.gif";
    //let ccv_slave_jofemar_cod_img_door_open = "/app/includes/images/linkers/machine_door_open.png";
    //let ccv_slave_jofemar_cod_img_door_closed = "/app/includes/images/linkers/machine_ok.png";

    var ccv_ext_cod_img_disconnected = "/app/includes/images/linkers/central_error.png";
    var ccv_ext_cod_img_connected = "/app/includes/images/linkers/central_ok.gif";

    var ccv_jofemar_modal_error_img_x = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NTEuNzQgNDUxLjc0Ij48cGF0aCBkPSJNNDQ2LjMyNCAzNjcuMzgxTDI2Mi44NTcgNDEuNjkyYy0xNS42NDQtMjguNDQ0LTU4LjMxMS0yOC40NDQtNzMuOTU2IDBMNS40MzUgMzY3LjM4MWMtMTUuNjQ0IDI4LjQ0NCA0LjI2NyA2NCAzNi45NzggNjRoMzY1LjUxMWMzNC4xMzMtMS40MjIgNTQuMDQ0LTM1LjU1NiAzOC40LTY0eiIgZmlsbD0iI2UyNGM0YiIvPjxwYXRoIGQ9Ik0yMjUuODc5IDYzLjAyNWwxODMuNDY3IDMyNS42ODlINDIuNDEzTDIyNS44NzkgNjMuMDI1eiIgZmlsbD0iI2ZmZiIvPjxnIGZpbGw9IiMzZjQ0NDgiPjxwYXRoIGQ9Ik0xOTYuMDEzIDIxMi4zNTlsMTEuMzc4IDc1LjM3OGMxLjQyMiA4LjUzMyA4LjUzMyAxNS42NDQgMTguNDg5IDE1LjY0NCA4LjUzMyAwIDE3LjA2Ny03LjExMSAxOC40ODktMTUuNjQ0bDExLjM3OC03NS4zNzhjMi44NDQtMTguNDg5LTExLjM3OC0zNC4xMzMtMjkuODY3LTM0LjEzMy0xOC40OS0uMDAxLTMxLjI5IDE1LjY0NC0yOS44NjcgMzQuMTMzeiIvPjxjaXJjbGUgY3g9IjIyNS44NzkiIGN5PSIzMzYuMDkyIiByPSIxNy4wNjciLz48L2c+PC9zdmc+";
    var ccv_jofemar_modal_warning_img_x = "https://thumbs.gfycat.com/UniqueSizzlingFinwhale-max-1mb.gif";

    var ccv_jofemar_img_reload_modal = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyLjAxOSA1MTIuMDE5Ij48cGF0aCBkPSJNNDYzLjQ4OSAyODcuOTkzaC02NC4zMmMtOC4zNTIgMC0xNC43ODQgNi41Ni0xNS43NDQgMTQuODQ4LTguNDggNzMuMTUyLTc4Ljg0OCAxMjcuNjQ4LTE1Ny4yNDggMTA5LjY5Ni00Ni4yMDgtMTAuNTkyLTgzLjc0NC00OC4wNjQtOTQuNC05NC4yNC0xOS4yOTYtODMuNjggNDQuMDY0LTE1OC4zMDQgMTI0LjUxMi0xNTguMzA0djQ4YzAgNi40NjQgMy45MDQgMTIuMzIgOS44ODggMTQuNzg0czEyLjgzMiAxLjA4OCAxNy40NC0zLjQ4OGw5Ni05NmM2LjI0LTYuMjQgNi4yNC0xNi4zODQgMC0yMi42MjRsLTk2LTk2Yy00LjYwOC00LjU0NC0xMS40NTYtNS45Mi0xNy40NC0zLjQ1NnMtOS44ODggOC4zMi05Ljg4OCAxNC43ODR2NDhjLTEyNC42MDggMC0yMjUuNzYgMTAyLjI0LTIyMy45NjggMjI3LjI2NCAxLjY5NiAxMTguODQ4IDEwMS43MjggMjE4Ljk0NCAyMjAuNTc2IDIyMC43MzYgMTE5LjM5MiAxLjc5MiAyMTguMDgtOTAuMzY4IDIyNi43ODQtMjA3LjE2OC42NzItOS4xMi03LjA0LTE2LjgzMi0xNi4xOTItMTYuODMyeiIgZmlsbD0iI2Q5ZDlkOSIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIi8+PC9zdmc+";



    var ccv_jofemar_modal_active_channels_selection = '' +
        '<div class="modal" data-backdrop="static" tabindex="-1" role="dialog" id="ccv-jofemar-modal-selection">' +
        '<div class="modal-dialog" role="document">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<h5 class="modal-title">Asignando Motores Activos</h5>' +
        '</div>' +
        '<div class="modal-body">' +
        '<p class="w-100 text-center">Porcentaje.<br><span id="ccv-jofemar-modal-selection-span" style="font-size:4rem;">0%</span></p>' +
        '<div class="progress">' +
        '<div id="ccv-jofemar-modal-selection-progressbar" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 75%"></div>' +
        '</div>' +
        '<p>Espera se estan asignando los canales activos!. Este mensaje se cerrará cuando termine.</p>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<!--Errors-->' +
        '<div class="modal fade" id="ccv_jofemar_errors_modal" tabindex="-1" aria-labelledby="ccv_jofemar_errors_modalLabel" aria-hidden="true" data-backdrop="static">' +
        '<div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">' +
        '<div class="modal-content border-0 shadow">' +
        '<div class="modal-header border-0 bg-white">' +
        '<h5 class="modal-title w-100 h1 text-center" id="ccv_jofemar_errors_modal_title">Error</h5>' +
        '</div>' +
        '<div class="modal-body border-0 bg-white h3 text-center" id="ccv_jofemar_errors_modal_content"></div>' +
        '<div class="modal-body border-0 bg-white text-center">' +
        '<button type="button" class="btn btn-info" id="btn-reset-errors-jof-modal" onclick="ccvJofemarCheckErr()">Reiniciar errores</button><br>' +
        '<div id="text-waiting-reset-errors-jof-modal"></div>' +
        '</div>' +
        '<div class="modal-footer border-0 bg-white">' +
        '<img id="ccv_jofemar_errors_modal_img" class="w-100" style="max-width:100px;" src="' + ccv_jofemar_modal_error_img_x + '" alt="Error">' +
        '</div>' +
        '<div class="modal-footer border-0 bg-white">' +
        '<a href="' + location.href + '" class="w-100 text-dark">Recargar</a>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

    ccv_jofemar_code_device = '<style>.ccv-jofemar-img-transform{transform:scale(1.35)}</style>' +
        '<div id="ccv_jofemar_device_not_detected" class="ccv_jofemar_device_not_detected" style="display: none">' +
        '<div class="d-flex p-0 m-0" style="min-height:80vh">' +
        '<div class="m-0 p-0" style="display:grid;place-items:center;overflow:hidden;">' +
        '<div class="w-100" style="min-width:50vw;display:grid;place-items:end;">' +
        '<img data-src="' + ccv_jofemar_cod_img_no_detected + '" id="ccv_jofemar_img_machine_one_disconected" alt="' + ccv_jofemar_lang.extension.display.device_disconnected + '" class="lazy ccv-jofemar-max-h-80vh p-0 m-0 ccv-jofemar-img-transform" style="display:none;height:400px;max-width:250px;">' +
        '<img data-src="' + ccv_jofemar_cod_img_door_open + '" id="ccv_jofemar_img_machine_one_door_open" alt="' + ccv_jofemar_lang.extension.display.device_disconnected + '" class="lazy ccv-jofemar-max-h-80vh p-0 m-0 ccv-jofemar-img-transform" style="display:none;height:400px;max-width:250px;">' +
        '<img data-src="' + ccv_jofemar_cod_img_door_closed + '" id="ccv_jofemar_img_machine_one_door_closed" alt="' + ccv_jofemar_lang.extension.display.device_disconnected + '" class="lazy ccv-jofemar-max-h-80vh p-0 m-0 ccv-jofemar-img-transform" style="height:400px;max-width:250px;">' +
        '</div>' +
        '</div>' +
        '<div class="m-0 p-0" style="display:grid;place-items:center;overflow-hidden;">' +
        '<div class="w-100" style="min-width:50vw;display:grid;place-items:start;">' +
        '<img data-src="' + ccv_ext_cod_img_disconnected + '" id="ccv_boardroid_img_disconnected" alt="' + ccv_jofemar_lang.extension.display.device_disconnected + '" class="lazy ccv-jofemar-max-h-80vh p-0 m-0 ccv-jofemar-img-transform" style="height:400px;max-width:250px;">' +
        '<img data-src="' + ccv_ext_cod_img_connected + '" id="ccv_boardroid_img_connected" alt="' + ccv_jofemar_lang.extension.display.device_disconnected + '" class="lazy ccv-jofemar-max-h-80vh p-0 m-0 ccv-jofemar-img-transform" style="display:none;height:400px;max-width:250px;">' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="ccv-jofemar-w-100" id="notBoarddroid" style="font-size:3rem;color:#fff;text-align:center;display:none">' +
        'Boardroid: No Conectada</div>' +
        '<div class="ccv-jofemar-w-100" id="ccv_jofemar_machine_one_disconected" style="font-size:3rem;color:#fff;text-align:center;display:none">' +
        'Máquina 1: No Conectada</div>' +

        '<a href="' + location.toString() + '" class="ccv-jofemar-btn ccv-jofemar-btn-link ccv-jofemar-fixed-bottom">' +
        '<img class="lazy mb-3" style="max-width:80px" data-src="' + ccv_jofemar_img_reload_modal + '" alt="' + ccv_jofemar_lang.extension.display.reload + '">' +
        '</a></div>';

    //position:absolute;top: 7vh;right:10px;
    document.querySelector('body').innerHTML += '<div style="position:absolute;top:10px;right:10px;font-size:1.5rem;z-index:1021" class="font-weight-bold text-dark" id="jof_show_current_temp"></div>' + ccv_jofemar_code_device + ccv_jofemar_modal_active_channels_selection;

}
else if (__type_project__ === 'ams') {
    // Route where is the image to be shown if the device is not detected
    var ccv_ext_cod_img_disconnected = "/app/includes/images/linkers/machine_disconnected.gif";
    var ccv_ext_cod_img_connected = "/app/includes/images/linkers/machine_door_open.png";
    var ccv_jofemar_img_reload_modal = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyLjAxOSA1MTIuMDE5Ij48cGF0aCBkPSJNNDYzLjQ4OSAyODcuOTkzaC02NC4zMmMtOC4zNTIgMC0xNC43ODQgNi41Ni0xNS43NDQgMTQuODQ4LTguNDggNzMuMTUyLTc4Ljg0OCAxMjcuNjQ4LTE1Ny4yNDggMTA5LjY5Ni00Ni4yMDgtMTAuNTkyLTgzLjc0NC00OC4wNjQtOTQuNC05NC4yNC0xOS4yOTYtODMuNjggNDQuMDY0LTE1OC4zMDQgMTI0LjUxMi0xNTguMzA0djQ4YzAgNi40NjQgMy45MDQgMTIuMzIgOS44ODggMTQuNzg0czEyLjgzMiAxLjA4OCAxNy40NC0zLjQ4OGw5Ni05NmM2LjI0LTYuMjQgNi4yNC0xNi4zODQgMC0yMi42MjRsLTk2LTk2Yy00LjYwOC00LjU0NC0xMS40NTYtNS45Mi0xNy40NC0zLjQ1NnMtOS44ODggOC4zMi05Ljg4OCAxNC43ODR2NDhjLTEyNC42MDggMC0yMjUuNzYgMTAyLjI0LTIyMy45NjggMjI3LjI2NCAxLjY5NiAxMTguODQ4IDEwMS43MjggMjE4Ljk0NCAyMjAuNTc2IDIyMC43MzYgMTE5LjM5MiAxLjc5MiAyMTguMDgtOTAuMzY4IDIyNi43ODQtMjA3LjE2OC42NzItOS4xMi03LjA0LTE2LjgzMi0xNi4xOTItMTYuODMyeiIgZmlsbD0iI2Q5ZDlkOSIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIi8+PC9zdmc+";


    ccv_jofemar_code_device = '<style>.ccv-jofemar-img-transform{transform:scale(1.35)}</style>' +
        '<div id="ccv_jofemar_device_not_detected" class="ccv_jofemar_device_not_detected" style="display: none">' +
        '<div class="d-flex p-0 m-0" style="min-height:80vh">' +
        '<div class="m-0 p-0" style="display:grid;place-items:center;overflow-hidden;">' +
        '<div class="w-100" style="min-width:50vw;display:grid;place-items:start;">' +
        '<img data-src="' + ccv_ext_cod_img_disconnected + '" id="ccv_boardroid_img_disconnected" alt="' + ccv_jofemar_lang.extension.display.device_disconnected + '" class="lazy ccv-jofemar-max-h-80vh p-0 m-0 ccv-jofemar-img-transform" style="height:400px;max-width:250px;">' +
        '<img data-src="' + ccv_ext_cod_img_connected + '" id="ccv_boardroid_img_connected" alt="' + ccv_jofemar_lang.extension.display.device_disconnected + '" class="lazy ccv-jofemar-max-h-80vh p-0 m-0 ccv-jofemar-img-transform" style="display:none;height:400px;max-width:250px;">' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="ccv-jofemar-w-100" id="notBoarddroid" style="font-size:3rem;color:#fff;text-align:center;display:none">' +
        'Boardroid: No Conectada</div>' +
        '<div class="ccv-jofemar-w-100" id="ccv_jofemar_machine_one_disconected" style="font-size:3rem;color:#fff;text-align:center;display:none"></div>' +
        
        '<a href="' + location.toString() + '" class="ccv-jofemar-btn ccv-jofemar-btn-link ccv-jofemar-fixed-bottom">' +
        '<img class="lazy mb-3" style="max-width:80px" data-src="' + ccv_jofemar_img_reload_modal + '" alt="' + ccv_jofemar_lang.extension.display.reload + '">' +
        '</a></div>';

    //position:absolute;top: 7vh;right:10px;
    document.querySelector('body').innerHTML += '<div style="position:absolute;top:10px;right:10px;font-size:1.5rem;z-index:1021" class="font-weight-bold text-dark" id="jof_show_current_temp"></div>' + ccv_jofemar_code_device;
}