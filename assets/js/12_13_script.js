// Initialize the map
const map = L.map('map').setView([48.8566, 2.3522], 12);

// Add the base map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Define colors for the districts
const colors = [
    'rgba(0, 160, 0, 0.6)', 'rgba(0, 160, 0, 0.6)', 'rgba(255, 255, 0, 0.6)', 'rgba(0, 160, 0, 0.6)',
    'rgba(0, 160, 0, 0.6)', 'rgba(0, 160, 0, 0.6)', 'rgba(0, 160, 0, 0.6)', 'rgba(0, 160, 0, 0.6)',
    'rgba(0, 100, 0, 0.6)', 'rgba(139, 0, 0, 0.6)', 'rgba(255, 255, 0, 0.6)', 'rgba(0, 100, 0, 0.6)',
    'rgba(255, 255, 0, 0.6)', 'rgba(0, 100, 0, 0.6)', 'rgba(0, 100, 0, 0.6)', 'rgba(0, 100, 0, 0.6)',
    'rgba(139, 0, 0, 0.6)', 'rgba(255, 0, 0, 0.6)', 'rgba(255, 0, 0, 0.6)', 'rgba(255, 0, 0, 0.6)'
];

// Function to get color based on district number
function getDistrictColor(code) {
    return colors[code - 1];
}

function formatDistrictNumber(num) {
    return `区域 ${num}`;
}

// Fetch data from Paris Open Data
fetch('https://opendata.paris.fr/api/records/1.0/search/?dataset=arrondissements&rows=20')
    .then(response => response.json())
    .then(data => {
        console.log('API Data:', data);

        const geojsonLayer = L.geoJSON(data.records, {
            style: function(feature) {
                const fillColor = getDistrictColor(feature.properties.code);
                console.log('District Code:', feature.properties.code, 'Fill Color:', fillColor);
                return {
                    fillColor: fillColor,
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            },
            onEachFeature: function(feature, layer) {
                layer.bindPopup(`区域 ${feature.properties.code}`);
            }
        }).addTo(map).bringToFront();
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

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

// Use the Overpass API to fetch hotels in Paris
const overpassUrl = 'https://overpass-api.de/api/interpreter';
const hotelQuery = `
    [out:json][timeout:25];
    area["name"="Paris"]["admin_level"="8"]->.searchArea;
    (
        node["tourism"="hotel"]["stars"~"^[3-5]$"](area.searchArea);
        way["tourism"="hotel"]["stars"~"^[3-5]$"](area.searchArea);
        relation["tourism"="hotel"]["stars"~"^[3-5]$"](area.searchArea);
    );
    out body;
    >;
    out skel qt;
`;

fetch(overpassUrl, {
    method: 'POST',
    body: hotelQuery
})
    .then(response => response.json())
    .then(data => {
        console.log('Hotel data received:', data);

        data.elements.forEach(element => {
            if (element.tags && element.tags.stars) {
                const stars = parseInt(element.tags.stars);
                if (stars >= 3) {
                    const lat = element.lat;
                    const lon = element.lon;

                    if (lat && lon) {
                        const marker = L.marker([lat, lon], { icon: hotelIcons[stars] }).addTo(map);
                        console.log('Hotel Marker added:', marker.getLatLng());
                    } else {
                        console.warn('Missing coordinates for hotel:', element.tags.name);
                    }
                }
            }
        });
    })
    .catch(error => {
        console.error('Error fetching hotels:', error);
    });

// Define metro icon
const metroIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2991/2991632.png',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
});

// Use the Overpass API to fetch metro stations in Paris
const metroQuery = `
    [out:json][timeout:25];
    area["name"="Paris"]["admin_level"="8"]->.searchArea;
    (
        node["railway"="subway_entrance"](area.searchArea);
        node["station"="subway"](area.searchArea);
    );
    out body;
`;

fetch(overpassUrl, {
    method: 'POST',
    body: metroQuery
})
    .then(response => response.json())
    .then(data => {
        console.log('Metro data received:', data);

        data.elements.forEach(element => {
            const lat = element.lat;
            const lon = element.lon;

            if (lat && lon) {
                const marker = L.marker([lat, lon], { icon: metroIcon }).addTo(map);
                console.log('Metro Marker added:', marker.getLatLng());
            } else {
                console.warn('Missing coordinates for metro:', element.tags.name);
            }
        });
    })
    .catch(error => {
        console.error('Error fetching metro data:', error);
    });

