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

// Add a legend for hotel ratings
const hotelLegend = L.control({position: 'bottomleft'});
hotelLegend.onAdd = function() {
    const div = L.DomUtil.create('div', 'hotel-legend'); // 使用新的类名
    div.innerHTML = `
        <h4>酒店评分</h4>
        <div class="legend-item">
            <i style="background-color: #89CFF0"></i>3星
        </div>
        <div class="legend-item">
            <i style="background-color: #ff9800"></i>4星
        </div>
        <div class="legend-item">
            <i style="background-color: #ffca28"></i>5星
        </div>
    `;
    return div;
};
hotelLegend.addTo(map);


        // Use the Overpass API to fetch hotels in Paris
        const overpassUrl = 'https://overpass-api.de/api/interpreter';
        const query = `
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
            body: query
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
                
                            // 在这里加入检查 lat 和 lon 的代码
                            if (lat && lon) {
                                const marker = L.marker([lat, lon], { icon: hotelIcons[stars] }).addTo(map);
                                
                                // Create popup content
                                const popupContent = `
                                    <div class="hotel-popup">
                                        <h3>${element.tags.name || 'Unnamed Hotel'}</h3>
                                        <p><strong>Rating:</strong> ${'⭐'.repeat(stars)}</p>
                                        ${element.tags.address ? `<p><strong>Address:</strong> ${element.tags.address}</p>` : ''}
                                        ${element.tags.phone ? `<p><strong>Phone:</strong> ${element.tags.phone}</p>` : ''}
                                        ${element.tags.website ? `<p><a href="${element.tags.website}" target="_blank">Visit Website</a></p>` : ''}
                                    </div>
                                `;
                                marker.bindPopup(popupContent);
                            } else {
                                console.warn('缺少坐标信息的酒店:', element.tags.name);
                            }
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching hotels:', error);
                // Show error message on the map
                const errorControl = L.control({position: 'topright'});
                errorControl.onAdd = function() {
                    const div = L.DomUtil.create('div', 'info error');
                    div.innerHTML = `
                        <h4>Error Loading Hotels</h4>
                        <p>Could not load hotel data. Please try again later.</p>
                        <p>Error: ${error.message}</p>
                    `;
                    return div;
                };
                errorControl.addTo(map);
            });
        
        // Define metro icon
        const metroIcon = L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/2991/2991632.png', // 地铁图标链接（示例）
            iconSize: [25, 25],
            iconAnchor: [12, 25],
            popupAnchor: [0, -25]
        });

        // Use the Overpass API to fetch metro stations in Paris
        const metroQuery = `
            [out:json][timeout:25];
            area["name"="Paris"]["admin_level"="8"]->.searchArea;
            (
                node["railway"="subway_entrance"](area.searchArea); // 地铁入口
                node["station"="subway"](area.searchArea); // 地铁站
            );
            out body;
        `;

        // Fetch metro data
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
                    
                    // Popup content
                    const popupContent = `
                        <div class="metro-popup">
                            <h3>地铁站</h3>
                            <p><strong>名称:</strong> ${element.tags.name || '未命名地铁站'}</p>
                        </div>
                    `;
                    marker.bindPopup(popupContent);
                } else {
                    console.warn('缺少坐标信息的地铁位置:', element.tags.name);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching metro data:', error);

            // Display error on map
            const errorControl = L.control({ position: 'topright' });
            errorControl.onAdd = function() {
                const div = L.DomUtil.create('div', 'info error');
                div.innerHTML = `
                    <h4>Error Loading Metro Data</h4>
                    <p>无法加载地铁数据，请稍后再试。</p>
                    <p>Error: ${error.message}</p>
                `;
                return div;
            };
            errorControl.addTo(map);
        });
    


    }) // Close the districts fetch .then()
    .catch(error => {
        console.error('Error fetching data:', error);
        alert('Error loading map data. Please check console for details.');
    });



    document.addEventListener('DOMContentLoaded', () => {
        const commentsList = document.getElementById('comments-list');
        const commentInput = document.getElementById('comment-input');
        const submitComment = document.getElementById('submit-comment');
    
        // 初始化评论数据
        let commentsData = JSON.parse(localStorage.getItem('commentsData') || '[]');
        if (!Array.isArray(commentsData)) {
            commentsData = [];
        }
    
        // 显示评论
        function displayComments() {
            commentsList.innerHTML = '';
            if (commentsData.length === 0) {
                commentsList.innerHTML = '<p>暂无评论</p>';
                return;
            }
            commentsData.forEach((comment, index) => {
                const commentDiv = document.createElement('div');
                commentDiv.className = 'comment';
                commentDiv.innerHTML = `
                    <p>${comment}</p>
                    <button onclick="deleteComment(${index})">删除</button>
                `;
                commentsList.appendChild(commentDiv);
            });
        }
    
        // 添加评论
        submitComment.addEventListener('click', () => {
            const commentText = commentInput.value.trim();
            if (commentText) {
                commentsData.push(commentText);
                localStorage.setItem('commentsData', JSON.stringify(commentsData));
                commentInput.value = '';
                displayComments();
            }
        });
    
        // 删除评论
        window.deleteComment = (index) => {
            commentsData.splice(index, 1);
            localStorage.setItem('commentsData', JSON.stringify(commentsData));
            displayComments();
        };
    
        // 初始加载评论
        displayComments();
    });
    


// === Tab 切换功能 ===
function switchTab(tabName) {
    const mapTab = document.getElementById('map-tab-content');
    const commentsTab = document.getElementById('comments-tab-content');
    const mapButton = document.getElementById('map-tab');
    const commentsButton = document.getElementById('comments-tab');

    if (tabName === 'map') {
        mapTab.classList.add('active');
        commentsTab.classList.remove('active');
        mapButton.classList.add('active');
        commentsButton.classList.remove('active');
        if (window.map) {
            map.invalidateSize(); // 确保地图在切换后正确显示
        }
    } else {
        commentsTab.classList.add('active');
        mapTab.classList.remove('active');
        commentsButton.classList.add('active');
        mapButton.classList.remove('active');
    }
}

document.getElementById('map-tab').addEventListener('click', () => switchTab('map'));
document.getElementById('comments-tab').addEventListener('click', () => switchTab('comments'));

// 创建自定义控件并添加到地图右上方
const infoControl = L.control({ position: 'topleft' });

infoControl.onAdd = function () {
    const div = L.DomUtil.create('div', 'info'); // 创建一个 div 元素
    div.innerHTML = `
        <h4>欢迎使用我们的地图!</h4>
        <p>在陌生的城市中，安全无疑是最关心的问题。我们的地图为您提供了一个全新的视角，专注于巴黎的安全区域，帮助您选择最合适的酒店。巴黎被划分为20个区，
        我们将每个区的风险等级进行标注，从绿色到红色，清晰地展示每个区域的安全程度，让您在旅途中更加安心。无论您是初次来到巴黎，还是经验丰富的旅行者，
        这张地图都会为您的选择提供强有力的支持。选择您心仪的酒店，同时确保安全，享受愉快的巴黎之旅！</p>
    `;
    return div;
};

// 将控件添加到地图
infoControl.addTo(map);

