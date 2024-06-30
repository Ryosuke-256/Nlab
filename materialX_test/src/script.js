import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MaterialXLoader } from 'three/examples/jsm/loaders/MaterialXLoader.js';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';
import WebGPU from 'three/addons/capabilities/WebGPU.js';
import WebGL from 'three/addons/capabilities/WebGL.js';
import * as Nodes from 'three/examples/jsm/nodes/Nodes.js';

const SAMPLE_PATH = 'https://raw.githubusercontent.com/materialx/MaterialX/main/resources/Materials/Examples/StandardSurface/';
//const SAMPLE_PATH = './StandardSurface/'

const samples = [
    'standard_surface_brass_tiled.mtlx',
    //'standard_surface_brick_procedural.mtlx',
    'standard_surface_carpaint.mtlx',
    //'standard_surface_chess_set.mtlx',
    'standard_surface_chrome.mtlx',
    'standard_surface_copper.mtlx',
    //'standard_surface_default.mtlx',
    //'standard_surface_glass.mtlx',
    //'standard_surface_glass_tinted.mtlx',
    'standard_surface_gold.mtlx',
    'standard_surface_greysphere.mtlx',
    //'standard_surface_greysphere_calibration.mtlx',
    'standard_surface_jade.mtlx',
    //'standard_surface_look_brass_tiled.mtlx',
    //'standard_surface_look_wood_tiled.mtlx',
    'standard_surface_marble_solid.mtlx',
    'standard_surface_metal_brushed.mtlx',
    'standard_surface_plastic.mtlx',
    //'standard_surface_thin_film.mtlx',
    'standard_surface_velvet.mtlx',
    'standard_surface_wood_tiled.mtlx'
];

let camera, scene, renderer, prefab;
const models = [];

init();

function init() {

    if ( WebGPU.isAvailable() === false && WebGL.isWebGL2Available() === false ) {

        document.body.appendChild( WebGPU.getErrorMessage() );

        throw new Error( 'No WebGPU or WebGL2 support' );

    }

    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 50 );
    camera.position.set( 0, 3, 20 );

    scene = new THREE.Scene();
    renderer = new WebGPURenderer( { antialias: true, forceWebGL: false } );
    renderer.setSize(window.innerWidth,window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    renderer.outputEncoding = THREE.sRGBEncoding; // レンダラーの出力をsRGB色空間に設定。
    renderer.toneMapping = THREE.ReinhardToneMapping ; // トーンマッピングをACESFilmicに設定。
    renderer.toneMappingExposure = 1; 
    renderer.shadowMap.enabled = true 
    
    container.appendChild( renderer.domElement );

    //

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 2;
    controls.maxDistance = 40;

    //
    let object_obj
    new OBJLoader().load(
        "./models/normal/teapot.obj",
        (obj) =>{
            object_obj = obj.children[0] //children[0]はいらないときもあるので要確認
            object_obj.position.set(0,4,0)
            object_obj.material = new THREE.MeshStandardMaterial({color:0xff0000,roughness:0.5,metalness:0.5})
            object_obj.castShadow = true
            scene.add(object_obj)
            //console.log(object_obj)

            const test_clone = object_obj.clone()
            //console.log(test_clone)
        },(xhr)=>{
            console.log('loading')
        },(error)=>{
            console.log('An error happened',error)
        }
    )
    new RGBELoader()
        .setPath( './image/' )
        .load( 'brown_photostudio_02_2k.hdr', async ( texture ) => {

            texture.mapping = THREE.EquirectangularReflectionMapping;

            scene.background = texture;
            scene.environment = texture;

            prefab = await new OBJLoader().loadAsync( 
                "./models/normal/teapot.obj",
             );
            //scene.add(prefab)

            for ( const sample of samples ) {

                addSample( sample );

            }

        } );

    window.addEventListener( 'resize', onWindowResize );
    renderer.setAnimationLoop( render );
}

function updateModelsAlign() {

    const COLUMN_COUNT = 6;
    const DIST_X = 3;
    const DIST_Y = 4;

    const lineCount = Math.floor( models.length / COLUMN_COUNT ) - 1.5;

    const offsetX = ( DIST_X * ( COLUMN_COUNT - 1 ) ) * - .5;
    const offsetY = ( DIST_Y * lineCount ) * .5;

    for ( let i = 0; i < models.length; i ++ ) {

        const model = models[ i ];

        model.position.x = ( ( i % COLUMN_COUNT ) * DIST_X ) + offsetX;
        model.position.y = ( Math.floor( i / COLUMN_COUNT ) * - DIST_Y ) + offsetY;

    }

}

async function addSample( sample ) {

    const model = prefab.children[0].clone();

    models.push( model );

    scene.add( model );

    updateModelsAlign();

    //

    const material = await new MaterialXLoader()
        .setPath( SAMPLE_PATH )
        .loadAsync( sample )
        .then( ( { materials } ) => Object.values( materials ).pop());
    console.log(material)
    //console.log(model)
    
    //console.log(new THREE.MeshPhysicalMaterial({color:0xff0000,roughness:0.5,metalness:0.5}))
    model.material = material;
    //console.log(model)

    //model.material = new THREE.MeshStandardMaterial({color:0xffff00,roughness:0.5,metalness:0.5})
}

//

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function render() {

    renderer.render( scene, camera );

}
