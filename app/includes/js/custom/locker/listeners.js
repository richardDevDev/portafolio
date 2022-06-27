dd.number_lockers_project = 1; // indica cuantos locker se van a usar en el proyecto
// se debe seguir un patron de nombres para que el codigo pre-escrito en la libreria funcione correctamente
// si se quiere un locker la variable debe ser declara como "var lock1" o "window['lock1']" para que se pueda llamar
// dinamicamente desde cualquier parte del codigo cambiando unicamente el numero
var lock1 = null, lock2 = null;
document.addEventListener("DOMContentLoaded", () => {
    lock1 = new Locker();
    // si se quiere activar el modo de pruebas con 2 lockers des-comentar las 2 lineas de abajo
    //lock2 = new Locker();
    //lock2.setBytesConnection(2);
    lock1._serial_filters = [{usbVendorId: 1027, usbProductId: 24577}];
    setTimeout(async () => {
        await lock1.initSerial(1);
    }, 1e3);

    document.getElementById('btn-open-all-lock1').addEventListener("click", async () => {
        lock1.testMatrix();
    });
    document.getElementById('btn-lock1').addEventListener("click", async () => {
        await lock1.initSerial();
    });

    if (lock2 === null) {
        document.getElementById('btn-lock2').classList.add('hidden');
        document.getElementById('btn-lock2').classList.remove('inline-flex')

        document.getElementById('test_grid_container').classList.remove('md:grid-cols-2')
        document.getElementById('test_2d_locker').classList.add('hidden');
        document.getElementById('test_lock1_container_matrix').classList.remove('md:grid-cols-3', 'lg:grid-cols-4', 'xl:grid-cols-5', '2xl:grid-cols-6');
        document.getElementById('test_lock1_container_matrix').classList.add('md:grid-cols-4', 'lg:grid-cols-6', 'xl:grid-cols-8', '2xl:grid-cols-8');

        document.getElementById('btn-open-all-lock2').addEventListener("click", async () => {
            lock2.testMatrix();
        });
        document.getElementById('btn-lock2').addEventListener("click", async () => {
            await lock2.initSerial();
        });
    }

    /**
     * Locker 1
     */
    setTimeout(function () {
        initLock();
    }, 1e3);
})

function initLock() {
    let html_open_locker1_cell = document.querySelectorAll('.open_locker1_cell');
    let html_activate_locker1_cell = document.querySelectorAll('.activate_locker1_cell');
    let html_deactivate_locker1_cell = document.querySelectorAll('.deactivate_locker1_cell');

    for (let i = 0; i < html_open_locker1_cell.length; i++) {
        html_open_locker1_cell[i].addEventListener('click', function (e) {
            let el = this;
            let cell_b = el.getAttribute('data-cell');
            let cell = (document.getElementById('locker1_hnc_' + cell_b).innerText).trim();
            if (isNaN(parseInt(cell))) {
                Swal.fire("Error", __("Unable to open a disabled cell"), "error");
                return;
            }
            locker1OpenCell(cell, cell_b);
        });
    }

    for (let i = 0; i < html_activate_locker1_cell.length; i++) {
        html_activate_locker1_cell[i].addEventListener('click', function () {
            let el = this;
            let cell = el.getAttribute('data-cell');
            locker1ActivateCell(cell);
        });
    }

    for (let i = 0; i < html_deactivate_locker1_cell.length; i++) {
        html_deactivate_locker1_cell[i].addEventListener('click', function () {
            let el = this;
            let cell = el.getAttribute('data-cell');
            locker1DeactivateCell(cell);
        });
    }


    let html_open_locker2_cell = document.querySelectorAll('.open_locker2_cell');
    let html_activate_locker2_cell = document.querySelectorAll('.activate_locker2_cell');
    let html_deactivate_locker2_cell = document.querySelectorAll('.deactivate_locker2_cell');

    for (let i = 0; i < html_open_locker2_cell.length; i++) {
        html_open_locker2_cell[i].addEventListener('click', function (e) {
            let el = this;
            let cell_b = el.getAttribute('data-cell');
            let cell = (document.getElementById('locker2_hnc_' + cell_b).innerText).trim();
            if (isNaN(parseInt(cell))) {
                //alert('No se puede abrir una celda desactivada');
                Swal.fire("Error", __("Unable to open a disabled cell"), "error");
                return;
            }
            locker2OpenCell(cell, cell_b);
        });
    }

    for (let i = 0; i < html_activate_locker2_cell.length; i++) {
        html_activate_locker2_cell[i].addEventListener('click', function () {
            let el = this;
            let cell = el.getAttribute('data-cell');
            locker2ActivateCell(cell);
        });
    }

    for (let i = 0; i < html_deactivate_locker2_cell.length; i++) {
        html_deactivate_locker2_cell[i].addEventListener('click', function () {
            let el = this;
            let cell = el.getAttribute('data-cell');
            locker2DeactivateCell(cell);
        });
    }

}

function locker1OpenCell(no, no_original) {
    console.debug(no, no_original);
    lock1.open(no);
}

function locker1ActivateCell(no) {
    let container = document.getElementById('container_cell_' + no);
    container.classList.remove('bg-red-500');
    container.classList.add('bg-indigo-500');
    lock1.activate(no);
    let header = document.getElementById('locker1_hnc_' + no);
    header.setAttribute('data-cell', no);
    setTimeout(locker1PutHeaders, 300);
}

function locker1DeactivateCell(no) {
    let container = document.getElementById('container_cell_' + no);
    container.classList.remove('bg-indigo-500');
    container.classList.add('bg-red-500');
    lock1.deactivate(no);

    let header = document.getElementById('locker1_hnc_' + no);
    header.setAttribute('data-cell', '--');
    setTimeout(locker1PutHeaders, 300);
}

function locker1PutHeaders() {
    let headers = document.querySelectorAll('.header_numbers_cell_locker1');

    let no = 1;
    for (let i = 0; i < headers.length; i++) {
        //console.warn(i,no);
        let data = headers[i].getAttribute('data-cell');
        let btn_open = document.getElementById('btn_open_cell_' + (i + 1));
        if (!isNaN(parseInt(data))) {
            headers[i].innerText = no;
            btn_open.setAttribute('data-cella', no.toString());
            no++;
        } else {
            headers[i].innerText = '--';
            btn_open.setAttribute('data-cella', '0');
        }
    }
}


/**
 * Locker 2
 */
function locker2OpenCell(no, no_original) {
    console.debug(no, no_original);
    lock2.open(no);
}

function locker2ActivateCell(no) {
    let container = document.getElementById('container_cell_' + no);
    container.classList.remove('bg-red-500');
    container.classList.add('bg-indigo-500');
    lock2.activate(no);
    let header = document.getElementById('locker2_hnc_' + no);
    header.setAttribute('data-cell', no);
    setTimeout(locker2PutHeaders, 300);
}

function locker2DeactivateCell(no) {
    let container = document.getElementById('container_cell_' + no);
    container.classList.remove('bg-indigo-500');
    container.classList.add('bg-red-500');
    lock2.deactivate(no);

    let header = document.getElementById('locker2_hnc_' + no);
    header.setAttribute('data-cell', '--');
    setTimeout(locker2PutHeaders, 300);
}

function locker2PutHeaders() {
    let headers = document.querySelectorAll('.header_numbers_cell_locker2');

    let no = 1;
    for (let i = 0; i < headers.length; i++) {
        let data = headers[i].getAttribute('data-cell');
        let btn_open = document.getElementById('btn_open_cell_' + (i + 1));
        if (!isNaN(parseInt(data))) {
            headers[i].innerText = no;
            btn_open.setAttribute('data-cella', no.toString());
            no++;
        } else {
            headers[i].innerText = '--';
            btn_open.setAttribute('data-cella', '0');
        }
    }
}
