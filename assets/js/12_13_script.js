// Initialize the map
const map = L.map('map').setView([48.8566, 2.3522], 12);

// Add the base map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Define colors for the districts with transparency (using rgba)
const colors = [
    'rgba(0, 160, 0, 0.6)',    // #00A000 with 0.6 opacity
    'rgba(0, 160, 0, 0.6)',    // #00A000
    'rgba(255, 255, 0, 0.6)',  // #FFFF00
    'rgba(0, 160, 0, 0.6)',    // #00A000
    'rgba(0, 160, 0, 0.6)',    // #00A000
    'rgba(0, 160, 0, 0.6)',    // #00A000
    'rgba(0, 160, 0, 0.6)',    // #00A000
    'rgba(0, 160, 0, 0.6)',    // #00A000
    'rgba(0, 100, 0, 0.6)',    // #006400
    'rgba(139, 0, 0, 0.6)',    // #8B0000
    'rgba(255, 255, 0, 0.6)',  // #FFFF00
    'rgba(0, 100, 0, 0.6)',    // #006400
    'rgba(255, 255, 0, 0.6)',  // #FFFF00
    'rgba(0, 100, 0, 0.6)',    // #006400
    'rgba(0, 100, 0, 0.6)',    // #006400
    'rgba(0, 100, 0, 0.6)',    // #006400
    'rgba(139, 0, 0, 0.6)',    // #8B0000
    'rgba(255, 0, 0, 0.6)',    // #FF0000
    'rgba(255, 0, 0, 0.6)',    // #FF0000
    'rgba(255, 0, 0, 0.6)'     // #FF0000
];



// Function to get color based on district number
function getDistrictColor(code) {
    return colors[code - 1]; // Subtract 1 because array is 0-based
}

function formatDistrictNumber(num) {
    return `区域 ${num}`;
}

// Add info control
const info = L.control();
info.onAdd = function() {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};



// Function to highlight legend item
function highlightLegendItem(code) {
    const legendItems = document.querySelectorAll('.legend-item');
    legendItems.forEach(item => {
        if (item.dataset.district === code.toString()) {
            item.style.backgroundColor = '#f0f0f0';
            item.style.fontWeight = 'bold';
        }
    });
}



