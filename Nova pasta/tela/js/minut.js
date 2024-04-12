const timerElement1 = document.getElementById('timer1');
const timerElement2 = document.getElementById('timer2');
const timerElement3 = document.getElementById('timer3');
const timerElement4 = document.getElementById('timer4');
const timerElement5 = document.getElementById('timer5');
const timerElement6 = document.getElementById('timer6');
const timerElement7 = document.getElementById('timer7');
let totalMinutes1 = 4;
let totalMinutes2 = 10;
let totalMinutes3 = 30;
let totalMinutes4 = 3;
let totalMinutes5 = 4;
let totalMinutes6 = 2;
let totalMinutes7 = 2;



function updateTimer1() {
    timerElement1.textContent = totalMinutes1;
    totalMinutes1++;
    if (totalMinutes1 > 59) {
        clearInterval(timerInterval1);
    }
}

function updateTimer2() {
    timerElement2.textContent = totalMinutes2;
    totalMinutes2++;
    if (totalMinutes2 > 24) {
        clearInterval(timerInterval2);
    }
}
function updateTimer3() {
    timerElement3.textContent = totalMinutes3;
    totalMinutes3++;
    if (totalMinutes3 > 24) {
        clearInterval(timerInterval3);
    }
}
function updateTimer4() {
    timerElement4.textContent = totalMinutes4;
    totalMinutes4++;
    if (totalMinutes4 > 24) {
        clearInterval(timerInterval4);
    }
}
function updateTimer5() {
    timerElement5.textContent = totalMinutes5;
    totalMinutes5++;
    if (totalMinutes5 > 24) {
        clearInterval(timerInterval5);
    }
}
function updateTimer6() {
    timerElement6.textContent = totalMinutes6;
    totalMinutes6++;
    if (totalMinutes6 > 24) {
        clearInterval(timerInterval6);
    }
}
function updateTimer7() {
    timerElement7.textContent = totalMinutes7;
    totalMinutes7++;
    if (totalMinutes7 > 24) {
        clearInterval(timerInterval7);
    }
}


const timerInterval1 = setInterval(updateTimer1, 6000); // Update every minute (60,000 milliseconds)
const timerInterval2 = setInterval(updateTimer2, 120000); // Update every 100 milliseconds
const timerInterval3 = setInterval(updateTimer3, 120000)
const timerInterval4 = setInterval(updateTimer4, 480000)
const timerInterval5 = setInterval(updateTimer5, 600000)
const timerInterval6 = setInterval(updateTimer6, 100)
const timerInterval7 = setInterval(updateTimer7, 1000)
