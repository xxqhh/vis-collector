import React from 'react';
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";

import * as mapUtil from './mapUtil';
import BLN from './markers/BLN';
import Arrow from './markers/Arrow';
import Tip from './markers/Tip';

const EnumTypes = {
    repayment: {
        label: "还款",
        type: "repayment",
        color: "#FF9728"
    },
    loan: {
        label: "放款",
        type: "loan",
        color: "#FF1E1B"
    }
}

const defaultTo = (value, defaultVal) => typeof value !== "undefined" ? value : defaultVal;

export default () => {
    const options = {
        "map": {
            "center": [104.223828, 37.972688],
            "zoom": 3,
            "pitch": 0,
            "bearing": 0,
            "isInteractive": true
        },
        "event": {"supernatantColor": "#28407B", "supernatantOpacity": 0.8},
        "legend": {
            "position": {"top": 50, "left": 0},
            "repaymentColor": "#EFDE3F",
            "loanColor": "#FF3649",
            "circleRadius": 7,
            "fontSize": 14,
            "fontColor": "#ffffff"
        },
        "ui": {
            "breatheDiameter": 15,
            "barBaseW": 35,
            "barBaseH": 35,
            "isStartAnimation": true,
            "animationTime": 15000
        },
        "comResource": {"mapFont": "", "chinaMap": "", "barLoanImg": "", "barRepaymentImg": ""}
    }

    const data = [
        {
            "type":"repayment",
            "name":"北京",
            "value":77
        },
        {
            "type":"loan",
            "name":"西藏",
            "value":42
        },
        {
            "type":"repayment",
            "name":"新疆",
            "value":102
        },
        // {
        //     "type":"loan",
        //     "name":"云南",
        //     "value":61
        // },
        // {
        //     "type":"repayment",
        //     "name":"宁夏",
        //     "value":47
        // },
        {
            "type":"loan",
            "name":"上海",
            "value":92
        },
        // {
        //     "type":"repayment",
        //     "name":"山东",
        //     "value":102
        // },
        // {
        //     "type":"loan",
        //     "name":"河南",
        //     "value":61
        // },
        // {
        //     "type":"repayment",
        //     "name":"四川",
        //     "value":22
        // },
        //
        // {
        //     "type":"loan",
        //     "name":"陕西",
        //     "value":51
        // },
        // {
        //     "type":"loan",
        //     "name":"湖北",
        //     "value":66
        // },
        // {
        //     "type":"loan",
        //     "name":"贵州",
        //     "value":72
        // },
        // {
        //     "type":"loan",
        //     "name":"河北",
        //     "value":88
        // },
        // {
        //     "type":"loan",
        //     "name":"江西",
        //     "value":104
        // },
        // {
        //     "type":"loan",
        //     "name":"吉林",
        //     "value":32
        // },
        // {
        //     "type":"repayment",
        //     "name":"甘肃",
        //     "value":52
        // },
        // {
        //     "type":"repayment",
        //     "name":"湖南",
        //     "value":63
        // },
        // {
        //     "type":"repayment",
        //     "name":"青海",
        //     "value":36
        // },
        // {
        //     "type":"repayment",
        //     "name":"黑龙江",
        //     "value":75
        // },
        // {
        //     "type":"repayment",
        //     "name":"香港",
        //     "value":109
        // }
    ];

    return <Chart options={options} data={data} />
}

class Chart extends React.PureComponent {
    state = {
        mapName: "中国"
    };


    // 存放地图中用到的资源
    resource = (() => {
        const chinaGeoJSON = require("./geojson/china.json");

        return {
            // 省名称对应的坐标
            provinceToLngLat: (() => {
                const provinceToLngLat = {};
                chinaGeoJSON.features.forEach(item => {
                    const {name, cp} = item.properties;
                    provinceToLngLat[name] = cp;
                });

                return provinceToLngLat;
            })(),
        }
    })();

    componentDidMount() {

        this._initMap();
    }

    componentDidUpdate(prevProps, prevState) {
        this.map && mapUtil.redrawMap(this.map, prevProps, this.props);
        this._drawUiMarkerToMap && this._drawUiMarkerToMap(this.map);
    }

    _initMap() {
        const {options} = this.props;
        this.map = mapUtil.createMap(mapboxgl, this.containerRef, options.map, (map) => {
            mapUtil.addOsmTileLayer(map, "http://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}");

            const tipEvent = new TipEvent(mapboxgl, map);
            this._drawUiMarkerToMap = this.mkDrawUiMarkerToMapFn(map, tipEvent);
            this._drawMap = this.mkDrawMap(tipEvent);

            // 添加中国地图
            this._drawMap("中国");


            // 添加uiMarker
            this._drawUiMarkerToMap(map, this.resource);

            map.resize();
        });
    }

    // 绘制中国地图
    mkDrawMap = (tipEvent) => {
        const nameToGeoJson = {
            "中国": require("./geojson/china.json"),
            "上海": require("./geojson/shanghai.json"),
        }

        const drawImg = (map, containerDom, imgUrl) => {
            const layerId = mapUtil.addCustomImgToMap(
                map,
                containerDom,
                imgUrl,
                {
                    containerWH: {
                        width: 740,
                        height: 540,
                    },
                    mapParams: {
                        zoom: 3,
                        center: [104.223828, 37.972688],
                        pitch: 0,
                        bearing: 0
                    }
                }
            );

            return {
                remove: () => {
                    map.getLayer(layerId) && map.removeLayer(layerId);
                    map.getSource(layerId) && map.removeSource(layerId);
                }
            };
        }

        const drawFill  = (map, geoJSON, event) => {
            const layerIds = [];

            geoJSON.features.map((data) => {
                const layerId = mapUtil.generateUUID();
                const {name} = data.properties;
                layerIds.push(layerId);

                return map.addLayer({
                    'id': layerId,
                    'type': 'fill',
                    source: {
                        'type': 'geojson',
                        'data': data
                    },
                    'layout': {},
                    'paint': {
                        'fill-color': '#005FB1',
                        'fill-opacity': 1
                    }
                })
                    .on("mouseover", layerId, (e) => tipEvent.enter(e, layerId, name, event))
                    .on("mouseout", layerId, () => tipEvent.leave(layerId))
                    .on("click", layerId, (e) => {
                        this._drawMap && this._drawMap(name);
                    })
            });

            return {
                remove: () => layerIds.forEach(layerId => {
                    map.getLayer(layerId) && map.removeLayer(layerId);
                    map.getSource(layerId) && map.removeSource(layerId);
                })
            };
        }

        const drawLine = (map, geoJSON) => {
            const layerId = mapUtil.generateUUID();

            map.addLayer({
                'id': layerId,
                'type': 'line',
                source: {
                    'type': 'geojson',
                    'data': geoJSON
                },
                'layout': {},
                'paint': {
                    'line-color': 'rgba(0,0,0, 1)',
                    'line-width': 1
                }
            });

            return {
                remove: () => {
                    map.getLayer(layerId) && map.removeLayer(layerId);
                    map.getSource(layerId) && map.removeSource(layerId);
                }
            };
        }

        const drawName = (map, geoJSON) => {
            const Text = ({name}) => (<div style={{color: "#ffffff", fontSize: 13, fontWeight: 800}}>{name}</div>);
            const provinceNameMarker = geoJSON.features.map(item => {
                const {name, cp} = item.properties;

                return mapUtil.addUiMarkerToMap(mapboxgl, map, {
                    reactToDom: mapUtil.reactToDOM(Text, {name}),
                    position: cp
                }, {
                    // offset: [width / 2, 0]  // left
                });
            });

            return {
                remove: () => provinceNameMarker.forEach(marker => marker.remove())
            };
        }


        let layers = [];
        return (name) => {
            const map = this.map;
            const containerDom = this.containerDom;
            const {event} = this.props.options;

            if(nameToGeoJson[name]){
                layers.forEach(layer => layer.remove());
                const geoJSON = nameToGeoJson[name];

                // 绘制各个省份并且绑定事件
                layers.push(drawFill(map, geoJSON, event));

                // 添加地图底图
                // layers.push(drawImg(map, containerDom, require("./img/china_map.png")));

                // 绘制地图线
                layers.push(drawLine(map, geoJSON));

                // 绘制省份名称
                layers.push(drawName(map, geoJSON));

                // 飞入指定的geojson位置
                mapUtil.fitBounds(mapboxgl, map, mapUtil.getGeoJSONFirstCoord(geoJSON));
            }
        }
    }

    // ui marker
    mkDrawUiMarkerToMapFn = (map, tipEvent) => {
        let blns = [];      // 保存呼吸灯对象
        let arrows = {};    // 保存箭头省份对象

        return () => {
            const {data, options} = this.props;

            blns.forEach(bln => bln.remove());
            blns = [];

            Object.values(arrows).forEach(arrow => arrow.remove())
            arrows = {};

            const provinceToData = {};

            const maxVal = Math.max(...data.map(item => item.value));

            data.forEach(item => {
                const position = this.resource.provinceToLngLat[item.name];
                if (position) {
                    item.position = position;
                    provinceToData[item.name] = item;

                    // 箭头省份名称
                    if (!arrows[item.name]) {
                        const arrow = new Arrow(mapboxgl, map, {
                            leftArrowNames: ["北京"],
                            name: item.name,
                            value: item.value,
                            position
                        });

                        arrow.render();
                        arrows[item.name] = arrow;
                    }


                    // ui效果到组件中
                    const bln = new BLN(mapboxgl, map);
                    blns.push(bln);

                    let color = "#68D33C";
                    let barImg = require("./img/green.svg");
                    if(item.value > 90){
                        color = "#FF4A36";
                        barImg = require("./img/red.svg");
                    }else if(item.value <=90 && item.value > 60){
                        color = "#F9BA2B";
                        barImg = require("./img/yellow.svg");
                    }

                    bln.render(this.resource, {
                        ui: {
                            breathe: {
                                width: options.ui.breatheDiameter,
                                height: options.ui.breatheDiameter,
                                color
                            },
                            bar: {
                                width: options.ui.barBaseW,
                                height: options.ui.barBaseH,
                                color,
                                barImg
                            },
                        },
                        data: item
                    });

                } else {
                    console.error("未找到对应的省份坐标:", item.name)
                }
            });

            tipEvent.setOptions({provinceToData, event: this.props.options.event})
        }
    };


    render() {
        return (
            <div className="map">
                <div
                    ref={(ref) => this.containerRef = ref}
                    style={{
                        position: "fixed",
                        width: "100%",
                        height: "100%",
                        border: "none",
                    }}
                />
                <div className="operator">
                    <button onClick={() => this._drawMap("中国")}>全国</button>
                </div>
                {/*language=SCSS*/}
                <style jsx>{`
                    .map{
                        position: relative;
                        
                        .operator{
                            position: absolute;
                            top: 10px;
                            left: 10px;
                        }
                    }
                `}</style>
            </div>
        );
    }
}


/**
 * tip事件管理
 */
class TipEvent {
    layerIdToMarker = {};

    constructor(mapboxgl, map, options = {}) {
        this.initParams = {
            mapboxgl,
            map,
            options: Object.assign({
                event: {
                    supernatantColor: "#28407B",
                    supernatantOpacity: 0.8,
                },
                provinceToData: {
                    repayment: {},
                    loan: {}
                }
            }, options)
        };

        map.on("mousemove", (e) => {
            Object.values(this.layerIdToMarker).forEach(marker => marker && marker.setLngLat(e.lngLat))
        })
    }

    setOptions = (options) => this.initParams.options = Object.assign(this.initParams.options, options);

    enter = (e, layerId, name) => {
        const {mapboxgl, map, options} = this.initParams;
        const {provinceToData, event} = options;

        if (!this.layerIdToMarker[layerId]) {
            // map.addLayer({
            //     'id': `${layerId}_fill-extrusion`,
            //     'type': 'fill-extrusion',
            //     'source': layerId,
            //     'layout': {},
            //     'paint': {
            //         // 'fill-extrusion-color': "rgba(40, 64, 123, 0.8)",
            //         'fill-extrusion-color': event.supernatantColor,
            //         // 'fill-extrusion-height': 40000 * 2,     // 挤压高度, 单位值"米"
            //         'fill-extrusion-base': 0,           //
            //         'fill-extrusion-opacity': event.supernatantOpacity,
            //         // 'fill-extrusion-pattern': "in-national-4",
            //     }
            // });

            this.layerIdToMarker[layerId] = new Tip(mapboxgl, map, {
                position: [e.lngLat.lng, e.lngLat.lat],
                data: [
                    {
                        name: "省份",
                        value: name,
                        unit: ""
                    },
                    {
                        name: "数量",
                        value: defaultTo((provinceToData[name] || {}).value, "-"),
                        unit: "",
                    },
                ]
            }).render();
        }
    }

    leave = (layerId) => {
        const {map} = this.initParams;
        map.getLayer(`${layerId}_fill-extrusion`) && map.removeLayer(`${layerId}_fill-extrusion`);
        this.layerIdToMarker[layerId] && this.layerIdToMarker[layerId].remove();
        this.layerIdToMarker[layerId] = null;
    }
}

