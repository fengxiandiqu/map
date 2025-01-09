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
let metroMarkers = [];  // 新增地铁标记存储数组

// 初始化地图时，存储区域和酒店标记
fetch('https://opendata.paris.fr/api/records/1.0/search/?dataset=arrondissements&rows=20')
    .then(response => response.json())
    .then(data => {
        console.log('API Data:', data); // 打印 API 数据，检查格式

        // 将 API 数据转换为 GeoJSON 格式
        const geojsonData = {
            type: 'FeatureCollection',
            features: data.records.map(record => ({
                type: 'Feature',
                properties: {
                    code: record.fields.c_ar, // 区域代码
                    name: `区域 ${record.fields.c_ar}` // 区域名称
                },
                geometry: record.fields.geom // 区域几何数据
            }))
        };

        console.log('GeoJSON Data:', geojsonData); // 打印转换后的 GeoJSON 数据

        // 添加 GeoJSON 图层到地图
        const geojsonLayer = L.geoJSON(geojsonData, {
            style: function(feature) {
                const districtCode = feature.properties.code; // 获取区域代码
                const fillColor = getDistrictColor(districtCode); // 获取区域颜色
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
                districtLayers.push(layer); // 存储区域图层
                layer.bindPopup(`区域 ${feature.properties.code}`); // 绑定弹出窗口
            }
        }).addTo(map);

        // 调整地图视野以显示所有区域
        map.fitBounds(geojsonLayer.getBounds());
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
                        // 创建弹出窗口内容
                        const popupContent = `
                            <div class="hotel-popup">
                                <h3>${element.tags.name || '未命名酒店'}</h3>
                                <p><strong>星级:</strong> ${'⭐'.repeat(stars)}</p>
                                ${element.tags.address ? `<p><strong>地址:</strong> ${element.tags.address}</p>` : ''}
                                ${element.tags.phone ? `<p><strong>电话:</strong> ${element.tags.phone}</p>` : ''}
                                ${element.tags.website ? `<p><a href="${element.tags.website}" target="_blank">访问网站</a></p>` : ''}
                            </div>
                        `;

                        // 绑定弹出窗口
                        marker.bindPopup(popupContent);

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

     // 筛选地铁站
    metroMarkers.forEach(marker => {
        const showMetro = selectedDistrict === 'all' || marker.district === parseInt(selectedDistrict);
        if (showMetro) {
            if (!map.hasLayer(marker)) {
                marker.addTo(map); // 显示符合条件的地铁站
            }
        } else {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker); // 隐藏不符合条件的地铁站
            }
        }
    });
}

// 绑定筛选事件
const districtFilter = document.getElementById('district-filter');
const hotelFilter = document.getElementById('hotel-filter');
districtFilter.addEventListener('change', applyFilters);
hotelFilter.addEventListener('change', applyFilters);

// 1. 创建地铁图标
const metroIcon = L.icon({
    iconUrl: 'https://img.icons8.com/plasticine/100/subway--v1.png', // 地铁图标
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
});

// 2. 初始化一个数组，用于存储地铁标记
const metroMarkers = [];

// 3. 加载地铁站点数据
fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `
        [out:json][timeout:25];
        area["name"="Paris"]["admin_level"="8"]->.searchArea;
        (
            node["railway"="subway_entrance"](area.searchArea);
            node["station"="subway"](area.searchArea);
        );
        out body;
    `
})
    .then(response => response.json())
    .then(data => {
        console.log('Metro data:', data);

        data.elements.forEach(element => {
            const lat = element.lat;
            const lon = element.lon;

            if (lat && lon) {
                // 创建地铁标记
                const marker = L.marker([lat, lon], { icon: metroIcon });

                // 获取地铁站所在区域
                marker.district = getDistrictFromCoordinates(lat, lon);

                // 绑定弹出框
                marker.bindPopup(`
                    <div class="metro-popup">
                        <h3>地铁站</h3>
                        <p><strong>名称:</strong> ${element.tags.name || '未命名地铁站'}</p>
                    </div>
                `);

                metroMarkers.push(marker); // 将标记添加到数组
                marker.addTo(map); // 默认添加到地图
            }
        });
    })
    .catch(error => {
        console.error('Error fetching metro data:', error);
    });

// 4. 为地铁切换按钮绑定逻辑
const toggleMetroButton = document.getElementById('toggle-metro-button'); // 获取地铁切换按钮
let metroVisible = true; // 地铁标记的可见状态

toggleMetroButton.addEventListener('click', () => {
    if (metroVisible) {
        // 隐藏地铁标记
        metroMarkers.forEach(marker => map.removeLayer(marker));
        toggleMetroButton.textContent = '显示地铁站';
    } else {
        // 显示地铁标记
        metroMarkers.forEach(marker => marker.addTo(map));
        toggleMetroButton.textContent = '隐藏地铁站';
    }
    metroVisible = !metroVisible; //切换状态
});

