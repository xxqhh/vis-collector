import React, {useRef, useEffect} from "react";

import WindGL from './glWindy';

const Windy = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const pxRatio = Math.max(Math.floor(window.devicePixelRatio) || 1, 2);
        const gl = canvas.getContext('webgl', {antialiasing: false});

        const wind = new WindGL(gl);
        wind.numParticles = 65536;

        function frame() {
            if (wind.windData) {
                wind.draw();
            }
            requestAnimationFrame(frame);
        }
        frame();


        function updateRetina() {
            const ratio = pxRatio;
            canvas.width = canvas.clientWidth * ratio;
            canvas.height = canvas.clientHeight * ratio;
            wind.resize();
        }
        updateRetina();


        // 获取风场数据
        getWindData(
            "http://localhost:4000/example/windy_demo/prepare_data/my_test/output/lv1_webgl.png",
            "http://localhost:4000/example/windy_demo/prepare_data/my_test/output/lv1_webgl.json",
        ).then((data) => {
            console.log(data);
            wind.setWind(data);
        })
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                width: "100%",
                height: "100%",
                backgroundColor: "#000"
            }}
        />
    )
};


export default Windy;


const getWindData = (imgUrl, jsonUrl) => new Promise((resolve, reject) => {
    const windFiles = {
        0: 'a',
        1: '2016112000',
        6: '2016112006',
        12: '2016112012',
        18: '2016112018',
        24: '2016112100',
        30: '2016112106',
        36: '2016112112',
        42: '2016112118',
        48: '2016112200'
    };

    const getJSON = (url, callback) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open('get', url, true);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                callback(xhr.response);
            } else {
                throw new Error(xhr.statusText);
            }
        };
        xhr.send();
    };


    getJSON(jsonUrl, function (windData) {
        const windImage = new Image();
        windData.image = windImage;
        windImage.src = imgUrl;
        windImage.onload = function () {
            // wind.setWind(windData);
            resolve(windData);
        };
    });
});

