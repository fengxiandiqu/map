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


// Function to reset legend item highlight
function resetLegendItem() {
    const legendItems = document.querySelectorAll('.legend-item');
    legendItems.forEach(item => {
        item.style.backgroundColor = 'transparent';
        item.style.fontWeight = 'normal';
    });
}

// Fetch data from Paris Open Data
fetch('https://opendata.paris.fr/api/records/1.0/search/?dataset=arrondissements&rows=20')
    .then(response => response.json())
    .then(data => {
        // Sort records by district number
        data.records.sort((a, b) => 
            parseInt(a.fields.c_ar) - parseInt(b.fields.c_ar)
        );

        const geojsonLayer = L.geoJSON(null, {
            style: function(feature) {
                return {
                    fillColor: getDistrictColor(feature.properties.code),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            },
            onEachFeature: function(feature, layer) {
                layer.on({
                    mouseover: function(e) {
                        const layer = e.target;
                        layer.setStyle({
                            weight: 5,
                            color: '#666',
                            dashArray: '',
                            fillOpacity: 0.9
                        });
                        info.update(feature.properties);
                        highlightLegendItem(feature.properties.code);
                    },
                    mouseout: function(e) {
                        geojsonLayer.resetStyle(e.target);
                        info.update();
                        resetLegendItem();
                    },
                    click: function(e) {
                        map.fitBounds(e.target.getBounds());
                    }
                });
                layer.bindPopup(formatDistrictNumber(feature.properties.code));
            }
        }).addTo(map);

        // Convert API data to GeoJSON
        data.records.forEach(record => {
            const districtCode = parseInt(record.fields.c_ar);
            const feature = {
                type: 'Feature',
                properties: {
                    code: districtCode,
                    name: formatDistrictNumber(districtCode)
                },
                geometry: record.fields.geom
            };
            geojsonLayer.addData(feature);
        });

        // Fit map to show all districts
        map.fitBounds(geojsonLayer.getBounds());

        // Add legend with matching colors and interactive highlighting
        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function() {
            const div = L.DomUtil.create('div', 'legend');
            div.innerHTML = '<h4>巴黎街区</h4>';
            // Create legend items in order
            for (let i = 1; i <= 20; i++) {
                div.innerHTML += 
                    `<div class="legend-item" data-district="${i}">
                        <i style="background:${getDistrictColor(i)}"></i>
                        ${formatDistrictNumber(i)}
                    </div>`;
            }
            return div;
        };
        legend.addTo(map);




// ... (keep all existing code until after the legend) ...

        // After the legend code, add this:
        
        // Define icons for different star ratings
        const hotelIcons = {
            3: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            }),
            4: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            }),
            5: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        };

