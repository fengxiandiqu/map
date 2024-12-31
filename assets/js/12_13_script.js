// 初始化地图
const map = L.map('map').setView([48.8566, 2.3522], 12);

// 添加底图
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 定义区域颜色
const colors = [
    'rgba(0, 160, 0, 0.6)', 'rgba(0, 160, 0, 0.6)', 'rgba(255, 255, 0, 0.6)', 'rgba(0, 160, 0, 0.6)',
    'rgba(0, 160, 0, 0.6)', 'rgba(0, 160, 0, 0.6)', 'rgba(0, 160, 0, 0.6)', 'rgba(0, 160, 0, 0.6)',
    'rgba(0, 100, 0, 0.6)', 'rgba(139, 0, 0, 0.6)', 'rgba(255, 255, 0, 0.6)', 'rgba(0, 100, 0, 0.6)',
    'rgba(255, 255, 0, 0.6)', 'rgba(0, 100, 0, 0.6)', 'rgba(0, 100, 0, 0.6)', 'rgba(0, 100, 0, 0.6)',
    'rgba(139, 0, 0, 0.6)', 'rgba(255, 0, 0, 0.6)', 'rgba(255, 0, 0, 0.6)', 'rgba(255, 0, 0, 0.6)'
];

// 获取区域颜色
function getDistrictColor(code) {
    return colors[code - 1];
}

// 存储所有区域和酒店标记
let districtLayers = [];
let hotelMarkers = [];

// 初始化地图时，存储区域和酒店标记
fetch('https://opendata.paris.fr/api/records/1.0/search/?dataset=arrondissements&rows=20')
    .then(response => response.json())
    .then(data => {
        const geojsonLayer = L.geoJSON(data.records, {
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
                districtLayers.push(layer); // 存储区域图层
            }
        }).addTo(map);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// 定义酒店图标
const hotelIcons = {
    3: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    4: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    5: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    })
};

// 获取酒店数据
fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `
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
    `
})
    .then(response => response.json())
    .then(data => {
        data.elements.forEach(element => {
            if (element.tags && element.tags.stars) {
                const stars = parseInt(element.tags.stars);
                if (stars >= 3) {
                    const lat = element.lat;
                    const lon = element.lon;

                    if (lat && lon) {
                        const marker = L.marker([lat, lon], { icon: hotelIcons[stars] }).addTo(map);
                        marker.stars = stars; // 存储酒店的星级信息
                        marker.district = getDistrictFromCoordinates(lat, lon); // 存储酒店所属区域
                        hotelMarkers.push(marker); // 存储酒店标记
                    }
                }
            }
        });
    })
    .catch(error => {
        console.error('Error fetching hotels:', error);
    });

// 根据坐标获取酒店所属区域
function getDistrictFromCoordinates(lat, lon) {
    let district = null;
    districtLayers.forEach(layer => {
        if (layer.getBounds().contains([lat, lon])) {
            district = layer.feature.properties.code;
        }
    });
    return district;
}

// 筛选功能
function applyFilters() {
    const selectedDistrict = districtFilter.value;
    const selectedStars = hotelFilter.value;

    // 筛选区域
    districtLayers.forEach(layer => {
        if (selectedDistrict === 'all' || layer.feature.properties.code === parseInt(selectedDistrict)) {
            layer.setStyle({ fillOpacity: 0.7 }); // 显示选中区域
        } else {
            layer.setStyle({ fillOpacity: 0 }); // 隐藏其他区域
        }
    });

    // 筛选酒店
    hotelMarkers.forEach(marker => {
        const showHotel =
            (selectedDistrict === 'all' || marker.district === parseInt(selectedDistrict)) &&
            (selectedStars === 'all' || parseInt(selectedStars) === marker.stars);

        if (showHotel) {
            if (!map.hasLayer(marker)) {
                marker.addTo(map); // 显示符合条件的酒店
            }
        } else {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker); // 隐藏不符合条件的酒店
            }
        }
    });
}

// 绑定筛选事件
const districtFilter = document.getElementById('district-filter');
const hotelFilter = document.getElementById('hotel-filter');
districtFilter.addEventListener('change', applyFilters);
hotelFilter.addEventListener('change', applyFilters);
