
// Clock Functionalities:
function setClock(){
    const now = new Date();
    const second = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secondDeg = ((seconds / 60) * 360) + 90;
    const minuteDeg = ((minutes / 60) * 360) + 90;
    const hourDeg = ((hours / 12) * 360) + 90;
}

document.getElementById("second-hand").style.transform = 'rotate(${secondDeg}deg)';
document.getElementById("minute-hand").style.transform = 'rotate(${minuteDeg}deg)';
document.getElementById("hour-hand").style.transform = 'rotate(${hourDeg}deg)';

// Clock Functionalities end --------------------------------------------------------------