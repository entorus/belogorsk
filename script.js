var vm = new Vue({
    el: '#app',
    data() { 
            return {
                map: null,
                tileLayer: null,
                layers: [],
                cars: [],
                carsMarkers: [],
                containers: [],
                containersMarkers: [],
                groups: [],
                controls: []
        };
    },

    created() {
        setInterval(function () {
            this.getCarsList();
            this.getCarGroups();
        //    this.clearLayers();
        }.bind(this), 3000); 
        axios
            .get('http://192.162.120.40:4242/main?func=readdicts&dicts=zones&out=json&uid=8bc40c48-3fc6-474a-a855-37b7fdd26b52')
            .then(response => { this.containers = response.data.zones })
            .catch(error => console.log(error));        
    }, 
    mounted() { 
        this.initMap();
    },
    watch: {
        cars: function () {
            this.initCars();
        },
        containers: function () {
            this.initContainers();
        }
    }, 
    methods: { 
        getCarsList() {
            //setInterval(function () {
                axios
                    .get('http://192.162.120.40:4242/main?func=state&out=json&uid=8bc40c48-3fc6-474a-a855-37b7fdd26b52')
                    .then(response => { this.cars = response.data.objects })
                    .catch(error => console.log(error));                      
            //console.log(this.groups);
            //}.bind(this), 3000);        
        },
        getCarGroups() {
            axios
                .get('http://192.162.120.40:4242/main?func=readdicts&dicts=objects&out=json&uid=8bc40c48-3fc6-474a-a855-37b7fdd26b52')
                .then(response => { this.groups = response.data.objects })
                .catch(error => console.log(error));
                
            /*this.groups.length != 0 ? console.log(this.groups.reduce((acc,iter) => {
                 acc.push(iter);
             }, [])) : false; */
        },
        initCars() {
            this.layers = L.layerGroup().addTo(this.map);

            let garbageCarIcon = L.icon({
                iconUrl: 'recycling-truck.png',
                iconSize: [30, 30],
            });
            let busIcon = L.icon({
                iconUrl: 'bus.png',
                iconSize: [30, 30],
            });
            let kdmIcon = L.icon({
                iconUrl: 'kdm.png',
                iconSize: [30, 30],
            });
            let tractorIcon = L.icon({
                iconUrl: 'tractor.png',
                iconSize: [30, 30],
            });
            let carsArr = [garbageCarIcon, busIcon, kdmIcon, tractorIcon];

            if (this.carsMarkers.length === 0) {
                this.cars.forEach(car => {
                    //carsArr[this.car.model_type]
                    let tempIcon = null;
                    //console.log(car.model_type);
                    switch (car.model_type) {
                        case '1':
                            tempIcon = tractorIcon;
                            break;
                        case '2':
                            tempIcon = kdmIcon;
                            break;
                        case '3':
                            tempIcon = tractorIcon;
                            break;
                        case '4':
                            tempIcon = busIcon;
                            break;
                        default:
                            tempIcon = garbageCarIcon;
                            break;
                    }
                    this.carsMarkers.push(new L.marker([car.lat, car.lon], {
                                icon: tempIcon
                            }).addTo(this.layers).bindPopup(
                                `<h2> Автомобиль </h2><b>${car.name}</b><h4>Подрядчик</h4><b>ЕДС Белогорск</b>`
                    ));
                });
            } else {
                this.carsMarkers.forEach((cm, i) => {
                    cm.setLatLng([this.cars[i].lat,this.cars[i].lon]);
                });
                // this.containersMarkers[this.randomInteger(0,this.containersMarkers.length-1)].setStyle({ цвета контейнеров
                //     color: 'green',
                //     fillColor: '#28a745',
                //  });
                let emptyContainer = L.icon({
                    iconUrl: 'canempty.png',
                    iconSize: [25, 25],
                });
                this.containersMarkers[this.randomInteger(0, this.containersMarkers.length - 1)].setIcon(emptyContainer);
            }
            
            this.controls.update(this.cars);
        },
        randomInteger(min, max) {
            var rand = min - 0.5 + Math.random() * (max - min + 1)
            rand = Math.round(rand);
            return rand;
        },
        clearLayers() {
            this.map.removeLayer(this.layers);
            // this.layers.leafletObject.clearLayers();
        },
        initContainers() {
            this.containers.forEach(container => {
                // new L.marker(container.center).addTo(this.map).bindPopup(
                //     `<h2> Площадка </h2><b>${container.name}</b>`
                // );
                // this.containersMarkers.push(new L.circle(container.center, {
                //     color: 'red',
                //     fillColor: '#f03',
                //     fillOpacity: 0.5,
                //     radius: container.radius
                // }).addTo(this.map).bindPopup(
                //     `<h2> Площадка </h2><b>${container.name}</b>`
                // ));
                let fullContainer = L.icon({
                    iconUrl: 'canfull.png',
                    iconSize: [25, 25],
                });
                this.containersMarkers.push(
                    new L.marker(container.center, {
                        icon: fullContainer
                    }
                ).addTo(this.map).bindPopup(
                    `<h2> Площадка </h2><b>${container.name}</b>`
                ));
            });
        },
        initMap() { 
            this.map = L.map('map').setView([50.91, 128.474], 13);
            this.tileLayer = L.tileLayer(
                'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                {
                    maxZoom: 18,
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
                }
            );
            this.tileLayer.addTo(this.map);
//=================================== Информация на карте
            this.map.zoomControl.setPosition('bottomleft');
            var info = L.control({
                position: 'topleft'
            });

            info.onAdd = function () {
                this._div = L.DomUtil.create('div', 'info'); 
                this.update();
                return this._div;
            };

            
            info.update = function (props) {
                this._div.innerHTML = props ? '<img class="gerb" src="gerb.jpg"><h4>Наличие техники ЖКХ на улицах города <br>Белогорск Амурской области</h4>Количество техники на связи: ' + props.length + ' единиц<br><br>' + 'Техники всего: 150 единиц'
                    + '<br><br>Подрядчики: 16<br><br> Автобусы: ' + props.filter(prop => prop.model_type == '4').length + ' единиц<br><br> Тракторы: ' + props.filter(prop => prop.model_type == '1' || prop.model_type == '3').length + ' единиц<br><br>КДМ: ' + props.filter(prop => prop.model_type == '2').length + ' единиц<br><br> Мусоровозы: ' + props.filter(prop => prop.model_type != '1' && prop.model_type != '2' && prop.model_type != '3' && prop.model_type != '4').length + ' единиц' : '<img class="gerb" src="gerb.jpg"><h4>Наличие техники ЖКХ на улицах города <br>Белогорск Амурской области</h4>Количество техники на связи: ' + Math.floor(Math.random() * 150) + ' единиц<br><br>' + 'Техники всего: 150 единиц'
                    + '<br><br>Подрядчики: 6<br><br> Автобусы: 5 единиц<br><br> Тракторы: 10 единиц<br><br>КДМ: 5 единиц<br><br> Мусоровозы: 10 единиц';
            };

            info.addTo(this.map);
            this.controls = info;
        }
     },
});