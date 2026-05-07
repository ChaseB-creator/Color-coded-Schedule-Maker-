// Clock Functionalities Start -----------------------------------------------------------
function setClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secondDeg = ((seconds / 60) * 360) + 90;
    const minuteDeg = ((minutes / 60) * 360) + 90;
    const hourDeg = ((hours / 12) * 360) + 90;

    document.getElementById("second-hand").style.transform = `rotate(${secondDeg}deg)`;
    document.getElementById("minute-hand").style.transform = `rotate(${minuteDeg}deg)`;
    document.getElementById("hour-hand").style.transform = `rotate(${hourDeg}deg)`;
}
// Clock Functionalities End --------------------------------------------------------------

// Date Display Start ---------------------------------------------------------------------

function getOrdinalSuffix(day) {
    // Handles 11th, 12th, 13th and the rest
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}

function updateDate() {
    const now = new Date();

    // Gets the full names for Day and Month
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = now.toLocaleDateString('en-US', { month: 'long' });
    const dayNumber = now.getDate();
    const year = now.getFullYear();

    const suffix = getOrdinalSuffix(dayNumber);

    // Combines everything into the requested format
    const formattedDate = `${dayName}, ${monthName} ${dayNumber}${suffix}, ${year}`;

    // Updates the HTML
    document.getElementById("full-date").textContent = formattedDate;
}
// Date Display End -----------------------------------------------------------------------

// Run functions: 
setClock();
updateDate();

setInterval(setClock, 1000);   // Update clock every second
setInterval(updateDate, 60000); // Update date every minute