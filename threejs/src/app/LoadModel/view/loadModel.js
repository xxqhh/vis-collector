// 加载obj模型
import ThreeUtil from "../util/ThreeUtil";
import * as THREE from "three";
import "../util/loader/GLTFLoader"

import OBJMTLLoader from '../util/loader/OBJMTLLoader';

export const loadObjModel = (scene) => {
    // obj文件大小为1.3M
    const small = {
        mtlPath: "/asserts/models/obj/small/",
        objPath:"/asserts/models/obj/small/",
        mtlFileName:"build_4.mtl",
        objFileName:"build_4.obj",
    };


    // obj文件大小为84M
    // 本地加载模型时间: 3s
    // objLoader解析时间为: 60s
    // 模型真正加载入webgl后不会卡顿
    // 卡顿出现在obj解析过程
    const big = {
        mtlPath: "/asserts/models/obj/big/",
        objPath:"/asserts/models/obj/big/",
        mtlFileName:"bugatti.mtl",
        objFileName:"bugatti.obj",
    };


    // obj文件大小为1.3M
    const taiping = {
        mtlPath: "/asserts/taiping/",
        objPath:"/asserts/taiping/",
        mtlFileName:"lubansuo.mtl",
        objFileName:"lubansuo.obj",
    };

    // ThreeUtil.loadMtlObj(small).then((object) => {
    // ThreeUtil.loadMtlObj(taiping).then((object) => {
    //     console.log("object->", object)
    //     object.position.set(0,0,0)
    //     scene.add(object);
    // }).catch(e => console.error(e));


    var loaderShip = new OBJMTLLoader();
    // loaderShip.addEventListener( 'load', callbackShipLoaded);
    loaderShip.load( "/asserts/taiping/lubansuo.obj", "/asserts/taiping/lubansuo.mtl");
}

// 加载vtk模型
export const loadVtkModel = (scene) => {
    ThreeUtil.loadVTK("/asserts/models/vtk/map.vtk").then((geometry) => {
        const material = new THREE.MeshLambertMaterial( { color: 0x00FFFF, fog: false, side: THREE.DoubleSide } );
        const mesh = new THREE.Mesh( geometry, material );
        mesh.name = "map";
        // mesh.rotateX(-90/180 * Math.PI);
        scene.add(mesh);
    }).catch(e => console.error(e));
};

/**
 * 加载fbx模型
 * @param scene
 */
export const loadFbxModel = (scene) => {
    const mixers = [];
    const clock = new THREE.Clock();

    ThreeUtil.loadFbx("http://localhost:4000/asserts/models/fbx/Samba_Dancing.fbx").then((object) => {
        object.scale.set(0.5, 0.5, 0.5);

        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.customAnimate = (() => {
            // 处理"变形动画"
            object.mixer = new THREE.AnimationMixer( object );
            mixers.push( object.mixer );
            const action = object.mixer.clipAction( object.animations[ 0 ] );
            action.play();

            return () => {
                if ( mixers.length > 0 ) {
                    for ( let i = 0; i < mixers.length; i ++ ) {
                        mixers[ i ].update( clock.getDelta() );
                    }
                }
            }
        })();

        scene.add(object)
    }).catch(e => console.error(e))
};


/**
 * 加载gltf模型
 * @param scene
 */
export const loadGltf = (scene) => {
    const loader = new THREE.GLTFLoader();

    loader.load("/asserts/gltf/radar/34M_17.gltf", ((gltf) => {
        // 删除旧模型
        // if(objects.gltf) objects.gltf.remove();
        // objects.gltf = gltf.scene;

        scene.add(gltf.scene);
    }));
}
