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

