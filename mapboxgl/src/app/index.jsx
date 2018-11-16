import styles from './index.scss';
import MapboxUtil from './MapboxUtil';
import TestMap from './TestMap';

import { Component } from 'react';
import { EnumMapboxStyles } from './MapboxUtil/constants';

import streetsV9StyleJson from './data/streets-v9.json'

export default class Map extends Component {
    state = {
        mapboxStyle: MapboxUtil.G.styles.streets_v9,
        center: MapboxUtil.G.CENTER,
        zoom: 4,
        pitch: 0,       // 地图倾斜角度 45
        bearing: 0,     // 地图旋转参数，单位是度数 20
        wms: '',
    };

    mapboxUtil = null;

    componentDidMount() {
        const mapboxgl = MapboxUtil.G.mapboxgl;
        const { center, zoom, mapboxStyle, pitch, bearing } = this.state;
        let circleZoomFn = null;

        // window.addEventListener('online', () => alert(1), false);

        // ------------初始化地图------------------
        const mapboxUtil = this.mapboxUtil = new MapboxUtil('mapbox-gl-id', {
            center,
            zoom,
            pitch,      // 地图倾斜角度 40
            bearing,    // 地图旋转参数，单位是度数 20
            // localIdeographFontFamily: "'Noto Sans', 'Noto Sans CJK SC', sans-serif",

            style: {
                "version": 8,
                "sprite": "http://localhost:4000/asserts/mapbox/sprite/sprite",    // 加载图标来源
                "glyphs": "http://localhost:4000/asserts/mapbox/font/{fontstack}/{range}.pbf", // 加载字体
                "sources": {},
                "layers": []
            },

            // style: streetsV9StyleJson

        }, (map) => {
            const testMap = new TestMap(this.mapboxUtil);

            testMap.doSetOsmTileLayer();

            // testMap.doSetGeoJSONByFill();

            // testMap.doSetGeoJSONByFillExtrusion();

            // testMap.doSetWMS();

            // testMap.doSetImageOverlay();

            // testMap.doSetFontAndIconLayer();

            // testMap.doSetCircleLayer();

            // testMap.doSetLineLayer();

            // testMap.doSetPolygonLayer();

            // testMap.doSetDemLayer();
            //
            // testMap.doSetPixelCircleLayer();

        });
        const map = mapboxUtil.map;
    }

    // 处理mapbox样式
    handleMapboxStyle = (mapboxStyle) => {
        this.setState({mapboxStyle});
    }


    handleOk = () => {
        const { mapboxStyle, pitch, bearing } = this.state;
        const map = this.mapboxUtil.map;
        // 处理mapbox样式
        if (G.mapboxStyle != mapboxStyle) {
            map.setStyle(mapboxStyle, {optimize: true})
        }

        // 处理pitch
        map.setPitch(pitch, {});

        // 处理bearing
        map.setBearing(bearing, {});

    }

    render() {
        const { mapboxStyle, pitch, bearing, wms } = this.state;

        return (
            <div className={styles["mapbox-gl-map"]}>
                <div className={styles.condition}>
                    <div>
                        <span>地图样式(style):</span>
                        <select value={mapboxStyle} onChange={(e) => this.setState({mapboxStyle: e.target.value})}>
                            {
                                Object.keys(EnumMapboxStyles).map(styleKey => <option key={styleKey} value={EnumMapboxStyles[styleKey]}>{styleKey}</option>)
                            }
                        </select>
                    </div>
                    <div>
                        <span>地图倾斜角度(pitch):</span>
                        <input value={pitch} onChange={(e) => this.setState({pitch: e.target.value})}/>
                    </div>
                    <div>
                        <span>地图旋转角度(bearing):</span>
                        <input value={bearing} onChange={(e) => this.setState({bearing: e.target.value})}/>
                    </div>

                    <div>
                        <span>WMS地址:</span>
                        <input value={wms} onChange={(e) => this.setState({wms: e.target.value})} style={{width: '80%'}}/>
                        <div style={{color: 'green'}}>示例:&nbsp;&nbsp;&nbsp;&nbsp;{`http://10.0.5.170:8081/rasdaman/ows?bbox={bbox-epsg-3857}&crs=EPSG:3857&service=WMS&version=1.3.0&request=GetMap&layers=WorldDem30m&width=256&height=256&styles=&format=image/png`}</div>
                    </div>

                    <button onClick={this.handleOk}>确定</button>
                </div>

                <div id="mapbox-gl-id"></div>
            </div>
        );
    }
}
