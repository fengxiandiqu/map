// Initialize the map 
const map = L.map('map').setView([48.8566, 2.3522], 12);

// Add the base map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Define colors for the districts with transparency (using rgba)
const colors = [
    'rgba(0, 160, 0, 0.6)',    // #00A000 with 0.6 opacity
    'rgba(255, 255, 0, 0.6)',  // #FFFF00
    'rgba(139, 0, 0, 0.6)',    // #8B0000
    'rgba(255, 0, 0, 0.6)'     // #FF0000
];

// Function to get color based on district number
function getDistrictColor(code) {
    return colors[code % colors.length]; // Loop through the colors array
}

// Fetch data from Paris Open Data
fetch('https://opendata.paris.fr/api/records/1.0/search/?dataset=arrondissements&rows=20')
    .then(response => response.json())
    .then(data => {
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
                    },
                    mouseout: function(e) {
                        geojsonLayer.resetStyle(e.target);
                    }
                });
                layer.bindPopup(`区域 ${feature.properties.code}`);
            }
        }).addTo(map);

        // Convert API data to GeoJSON
        data.records.forEach(record => {
            const districtCode = parseInt(record.fields.c_ar);
            const feature = {
                type: 'Feature',
                properties: {
                    code: districtCode
                },
                geometry: record.fields.geom
            };
            geojsonLayer.addData(feature);
        });

        // Fit map to show all districts
        map.fitBounds(geojsonLayer.getBounds());

        // Add legend
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = function() {
            const div = L.DomUtil.create('div', 'legend');
            div.innerHTML = '<h4>巴黎街区</h4>';
            for (let i = 1; i <= colors.length; i++) {
                div.innerHTML += `
                    <div>
                        <i style="background:${getDistrictColor(i)}"></i> 区域 ${i}
                    </div>`;
            }
            return div;
        };
        legend.addTo(map);
    })



