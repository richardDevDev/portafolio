/**
 * Locker 1
 */

let html_open_locker1_cell = document.querySelectorAll('.open_locker1_cell');
let html_activate_locker1_cell = document.querySelectorAll('.activate_locker1_cell');
let html_deactivate_locker1_cell = document.querySelectorAll('.deactivate_locker1_cell');

for (let i = 0; i < html_open_locker1_cell.length; i++) {
    html_open_locker1_cell[i].addEventListener('click',function(e){
        let el = this;
        let cell_b = el.getAttribute('data-cell');
        let cell = (document.getElementById('locker1_hnc_'+cell_b).innerText).trim();
        if(isNaN(parseInt(cell))){
            //alert('No se puede abrir una celda desactivada');
            console.warn('No se puede abrir una celda desactivada');
            return;
        }
        locker1OpenCell(cell,cell_b);
    });
}

for (let i = 0; i < html_activate_locker1_cell.length; i++) {
    html_activate_locker1_cell[i].addEventListener('click',function(){
        let el = this;
        let cell = el.getAttribute('data-cell');
        locker1ActivateCell(cell);
    });
}

for (let i = 0; i < html_deactivate_locker1_cell.length; i++) {
    html_deactivate_locker1_cell[i].addEventListener('click',function(){
        let el = this;
        let cell = el.getAttribute('data-cell');
        locker1DeactivateCell(cell);
    });
}

function locker1OpenCell(no,no_original){
    console.debug(no,no_original);
    owlLock1OpenCell(no);
}
function locker1ActivateCell(no){
    let container = document.getElementById('container_cell_'+no);
    container.classList.remove('bg-red-500');
    container.classList.add('bg-indigo-500');
    owlLock1ActivateCell(no);
    let header = document.getElementById('locker1_hnc_'+no);
    header.setAttribute('data-cell',no);
    setTimeout(locker1PutHeaders,300);
}
function locker1DeactivateCell(no){
    let container = document.getElementById('container_cell_'+no);
    container.classList.remove('bg-indigo-500');
    container.classList.add('bg-red-500');
    owlLock1DeactivateCell(no);

    let header = document.getElementById('locker1_hnc_'+no);
    header.setAttribute('data-cell','--');
    setTimeout(locker1PutHeaders,300);
}

function locker1PutHeaders(){
    let headers = document.querySelectorAll('.header_numbers_cell_locker1');

    let no = 1;
    for (let i = 0; i < headers.length; i++) {
        //console.warn(i,no);
        let data = headers[i].getAttribute('data-cell');
        let btn_open = document.getElementById('btn_open_cell_'+(i+1));
        if(!isNaN(parseInt(data))){
            headers[i].innerText = no;
            btn_open.setAttribute('data-cella',no.toString());
            no++;
        }else{
            headers[i].innerText = '--';
            btn_open.setAttribute('data-cella','0');
        }
    }
}


/**
 * Locker 2
 */


let html_open_locker2_cell = document.querySelectorAll('.open_locker2_cell');
let html_activate_locker2_cell = document.querySelectorAll('.activate_locker2_cell');
let html_deactivate_locker2_cell = document.querySelectorAll('.deactivate_locker2_cell');

for (let i = 0; i < html_open_locker2_cell.length; i++) {
    html_open_locker2_cell[i].addEventListener('click',function(e){
        let el = this;
        let cell_b = el.getAttribute('data-cell');
        let cell = (document.getElementById('locker2_hnc_'+cell_b).innerText).trim();
        if(isNaN(parseInt(cell))){
            //alert('No se puede abrir una celda desactivada');
            console.warn('No se puede abrir una celda desactivada');
            return;
        }
        locker2OpenCell(cell,cell_b);
    });
}

for (let i = 0; i < html_activate_locker2_cell.length; i++) {
    html_activate_locker2_cell[i].addEventListener('click',function(){
        let el = this;
        let cell = el.getAttribute('data-cell');
        locker2ActivateCell(cell);
    });
}

for (let i = 0; i < html_deactivate_locker2_cell.length; i++) {
    html_deactivate_locker2_cell[i].addEventListener('click',function(){
        let el = this;
        let cell = el.getAttribute('data-cell');
        locker2DeactivateCell(cell);
    });
}



function locker2OpenCell(no,no_original){
    console.debug(no,no_original);
    owlLock2OpenCell(no);
}
function locker2ActivateCell(no){
    let container = document.getElementById('container_cell_'+no);
    container.classList.remove('bg-red-500');
    container.classList.add('bg-indigo-500');
    owlLock2ActivateCell(no);
    let header = document.getElementById('locker2_hnc_'+no);
    header.setAttribute('data-cell',no);
    setTimeout(locker2PutHeaders,300);
}
function locker2DeactivateCell(no){
    let container = document.getElementById('container_cell_'+no);
    container.classList.remove('bg-indigo-500');
    container.classList.add('bg-red-500');
    owlLock2DeactivateCell(no);

    let header = document.getElementById('locker2_hnc_'+no);
    header.setAttribute('data-cell','--');
    setTimeout(locker2PutHeaders,300);
}

function locker2PutHeaders(){
    let headers = document.querySelectorAll('.header_numbers_cell_locker2');

    let no = 1;
    for (let i = 0; i < headers.length; i++) {
        //console.warn(i,no);
        let data = headers[i].getAttribute('data-cell');
        let btn_open = document.getElementById('btn_open_cell_'+(i+1));
        if(!isNaN(parseInt(data))){
            headers[i].innerText = no;
            btn_open.setAttribute('data-cella',no.toString());
            no++;
        }else{
            headers[i].innerText = '--';
            btn_open.setAttribute('data-cella','0');
        }
    }
}
