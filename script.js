// Clock Functionalities Start -----------------------------------------------------------
function setClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secondDeg = ((seconds / 60) * 360) + 90;
    const minuteDeg = ((minutes / 60) * 360) + 90;
    const hourDeg = ((hours / 12) * 360) + 90;

    const sHand = document.getElementById("second-hand");
    const mHand = document.getElementById("minute-hand");
    const hHand = document.getElementById("hour-hand");

    if(sHand) sHand.style.transform = `rotate(${secondDeg}deg)`;
    if(mHand) mHand.style.transform = `rotate(${minuteDeg}deg)`;
    if(hHand) hHand.style.transform = `rotate(${hourDeg}deg)`;
}
// Clock Functionalities End --------------------------------------------------------------

// Date Display Start ---------------------------------------------------------------------

function getOrdinalSuffix(day) {
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
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = now.toLocaleDateString('en-US', { month: 'long' });
    const dayNumber = now.getDate();
    const year = now.getFullYear();
    const suffix = getOrdinalSuffix(dayNumber);
    const formattedDate = `${dayName}, ${monthName} ${dayNumber}${suffix}, ${year}`;
    
    const dateEl = document.getElementById("full-date");
    if(dateEl) dateEl.textContent = formattedDate;

    // Trigger clock color update if on schedules page
    if(document.getElementById("clock-overlay")) {
        updateClockColors(dayName);
    }
}
// Date Display End -----------------------------------------------------------------------

// Schedule Logic Start -------------------------------------------------------------------

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7D794'];

// Persistence: Save data to LocalStorage
function saveSchedules() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const data = {};

    days.forEach(day => {
        const rows = document.querySelectorAll(`#table-${day} tbody tr`);
        data[day] = Array.from(rows).map(row => ({
            name: row.cells[0].querySelector('input').value,
            time: row.cells[1].querySelector('input').value
        }));
    });

    localStorage.setItem('easyScheduleData', JSON.stringify(data));
}

// Persistence: Load data from LocalStorage
function loadSchedules() {
    const savedData = localStorage.getItem('easyScheduleData');
    if (!savedData) return;

    const data = JSON.parse(savedData);
    Object.keys(data).forEach(day => {
        const tbody = document.querySelector(`#table-${day} tbody`);
        if (!tbody) return;
        
        tbody.innerHTML = ''; // Clear defaults
        data[day].forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" value="${item.name}" placeholder="Task Name" oninput="saveSchedules()"></td>
                <td><input type="text" value="${item.time}" placeholder="6:00 AM - 9:00 AM" oninput="saveSchedules(); updateDate()"></td>
            `;
            tbody.appendChild(row);
        });
    });
    updateDate(); // Refresh the clock colors
}

function addRow(day) {
    const tbody = document.querySelector(`#table-${day} tbody`);
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" placeholder="Task Name" oninput="saveSchedules()"></td>
        <td><input type="text" placeholder="6:00 AM - 9:00 AM" oninput="saveSchedules(); updateDate()"></td>
    `;
    tbody.appendChild(row);
    saveSchedules();
}

function removeRow(day) {
    const tbody = document.querySelector(`#table-${day} tbody`);
    if (tbody.lastElementChild) {
        tbody.removeChild(tbody.lastElementChild);
        saveSchedules();
        updateDate();
    }
}

function clearTable(day) {
    const tbody = document.querySelector(`#table-${day} tbody`);
    tbody.innerHTML = '';
    saveSchedules();
    updateDate();
}

function parseTimeToDegrees(timeStr) {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    let [_, hrs, mins, meridiem] = match;
    hrs = parseInt(hrs);
    mins = parseInt(mins);
    if (meridiem.toUpperCase() === 'PM' && hrs !== 12) hrs += 12;
    if (meridiem.toUpperCase() === 'AM' && hrs === 12) hrs = 0;
    
    return (((hrs % 12) * 60 + mins) / 720) * 360;
}

function updateClockColors(currentDay) {
    const overlay = document.getElementById("clock-overlay");
    if (!overlay) return;
    overlay.innerHTML = '';
    
    const table = document.getElementById(`table-${currentDay}`);
    if (!table) return;

    const rows = table.querySelectorAll(`tbody tr`);
    let timeBlocks = [];

    rows.forEach(row => {
        const timeVal = row.cells[1].querySelector('input').value;
        const parts = timeVal.split('-').map(p => p.trim());
        if (parts.length === 2) {
            const startDeg = parseTimeToDegrees(parts[0]);
            const endDeg = parseTimeToDegrees(parts[1]);
            if (startDeg !== null && endDeg !== null) {
                timeBlocks.push({ start: startDeg, end: endDeg });
            }
        }
    });

    timeBlocks.sort((a, b) => a.start - b.start);

    timeBlocks.forEach((block, index) => {
        const color = colors[index % colors.length];
        drawSegment(block.start, block.end, color);
    });
}

function drawSegment(startDeg, endDeg, color) {
    const overlay = document.getElementById("clock-overlay");
    const radius = 50; // Increased to 50 to fully fit the clock face edge
    const center = 50;
    
    const startRad = (startDeg - 90) * Math.PI / 180;
    const endRad = (endDeg - 90) * Math.PI / 180;
    
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    
    const largeArc = (endDeg - startDeg + 360) % 360 <= 180 ? 0 : 1;
    const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", color);
    path.setAttribute("opacity", "0.4");
    overlay.appendChild(path);
}

// Schedule Logic End ---------------------------------------------------------------------

// Run functions: 
setClock();
loadSchedules(); // Load saved data first
updateDate();

setInterval(setClock, 1000);   
setInterval(updateDate, 60000);