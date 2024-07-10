import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * 宣言
 */
//base
let canvas, scene, camera, renderer, controls

//size
const sizes = {width: window.innerWidth,height: window.innerHeight}

//mouse follow
let pointlight1, cursor1_mesh

//animate object
let box1_mesh
var object_gltf = null
var object_obj = null

//camera
let fov

//widowsize関連補正
let position_ratio = 250

//mouse
const mouse_webGL = new THREE.Vector2()
const mouse_webGL_normal = new THREE.Vector2()
const mouse_window_normal =new THREE.Vector2()

/**
 * eventlister
 */
//base
window.addEventListener('load',init)

//resize
window.addEventListener('resize', onWindowResize)

//fullscreen
window.addEventListener("dblclick",WindowFullscreen)

//number key to camera
document.addEventListener("keydown",(e)=>{
    if(e.keyCode == 49) {
        camera.position.set(0,0,dist(fov))
    }
    if(e.keyCode == 50) {
        camera.position.set(dist(fov),0,0)
    }
    if(e.keyCode == 51) {
        camera.position.set(0,0,-dist(fov))
    }
    if(e.keyCode == 52) {
        camera.position.set(-dist(fov),0,0)
    }
    if(e.keyCode == 53) {
        camera.position.set(0,dist(fov),0)
    }
    if(e.keyCode == 54) {
        camera.position.set(0,-dist(fov),0)
    }
})

//mouse
window.addEventListener('mousemove',e =>
    {
        //WebGLマウス座標
        mouse_webGL.x=(e.clientX-(sizes.width/2))/position_ratio
        mouse_webGL.y=(-e.clientY+(sizes.height/2))/position_ratio
    
        //WebGLマウス座標の正規化
        mouse_webGL_normal.x=(mouse_webGL.x*2/sizes.width)/position_ratio
        mouse_webGL_normal.y=(mouse_webGL.y*2/sizes.height)/position_ratio
    
        //Windowマウス座標の正規化
        mouse_window_normal.x=(e.clientX/sizes.width)*2/position_ratio-1
        mouse_window_normal.y=-(e.clientY/sizes.height)*2/position_ratio+1
    
        //WebGL関連
        //ライトの座標
        pointlight1.position.x=mouse_webGL.x;
        pointlight1.position.y=mouse_webGL.y;
    
        //カーソルの座標
        cursor1_mesh.position.set(mouse_webGL.x,mouse_webGL.y,0)
})
/**eventlistner */

/**
 * Function
 */

//initialization

// Canvas
canvas = document.querySelector('canvas.webgl')

// Scene
scene = new THREE.Scene()

//camera
fov = 75
camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.01, dist(fov)*10)
camera.position.set(0,0,dist(fov))
scene.add(camera)

/**
 * Renderer
 */
renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.outputEncoding = THREE.sRGBEncoding; // レンダラーの出力をsRGB色空間に設定。
renderer.toneMapping = THREE.ACESFilmicToneMapping; // トーンマッピングをACESFilmicに設定。
renderer.toneMappingExposure = 2; // トーンマッピングの露光量を調整。
renderer.shadowMap.enabled = true // 影
/**renderer */

//controls
controls = new OrbitControls( camera, canvas)

/**
 * Object
 */
//plane1
const textureLoader = new THREE.TextureLoader()
const normalMapTexture = textureLoader.load("./texture/seaworn_stone_tile/seaworn_stone_tiles_nor_dx_1k.jpg")
const plane1_mesh=new THREE.Mesh(
    new THREE.PlaneGeometry(10,10,10,10),
    new THREE.MeshStandardMaterial({
        color:0xffffff,side: THREE.DoubleSide,
        roughness:0.0, metalness: 0.0,
        normalMap:normalMapTexture
    })
)
plane1_mesh.rotation.set(Math.PI/2,0,0)
plane1_mesh.position.set(0,-1,0)
plane1_mesh.receiveShadow = true
scene.add(plane1_mesh)

//box1
box1_mesh=new THREE.Mesh(
    new THREE.SphereGeometry(0.3,50,50),
    new THREE.MeshStandardMaterial({
        color:0xff0000, roughness:0.1, metalness: 1.0
    })
)
box1_mesh.castShadow = true
scene.add(box1_mesh)

//cursor
cursor1_mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.01,10,10),
    new THREE.MeshBasicMaterial({color:0x000000}))
cursor1_mesh.position.set(0,0,0)
scene.add(cursor1_mesh)

/**
 * models
 */
//gltf loader
const gltfLoader = new GLTFLoader()
gltfLoader.load(
    "./models/gltf/teapot.gltf",
    (gltf) =>{
        object_gltf = gltf.scene.children[0] //children[0]はいらないときもあるので要確認

        const coe = 0.2
        object_gltf.scale.set(coe,coe,coe)
        object_gltf.position.set(-1,0,0)
        object_gltf.material = new THREE.MeshStandardMaterial({color:0xff0000,roughness:0.5,metalness:0.5})
        object_gltf.castShadow = true
        scene.add(object_gltf)
        console.log(object_gltf)
    },(xhr)=>{
        console.log((xhr.loaded/xhr.total*100)+'% loaded')
    },(error)=>{
        console.log('An error happened',error)
    }
)

//obj loader
const objLoader = new OBJLoader()
objLoader.load(
    "./models/normal/teapot.obj",
    (obj) =>{
        object_obj = obj.children[0] //children[0]はいらないときもあるので要確認

        const coe = 0.25
        object_obj.scale.set(coe,coe,coe)
        object_obj.position.set(1,0,0)
        object_obj.material = new THREE.MeshStandardMaterial({color:0xff0000,roughness:0.5,metalness:0.5})
        object_obj.castShadow = true
        scene.add(object_obj)
        console.log(object_obj)
    },(xhr)=>{
        console.log((xhr.loaded/xhr.total*100)+'% loaded')
    },(error)=>{
        console.log('An error happened',error)
    }
)

/**
 * Background and Lighting
 */
//背景
const loader1 = new RGBELoader();
loader1.load(
    "./image/chapel_day_2k.hdr",
    (texture)=>{
        texture.encoding = THREE.RGBEEncoding
        texture.mapping = THREE.EquirectangularReflectionMapping
        scene.background = texture
        scene.environment = texture
    }
)

//平行光源
const directionalLight =new THREE.DirectionalLight(0xffffff,0.5)
directionalLight.position.set(1,1,1)
scene.add(directionalLight)

//点光源
pointlight1 = new THREE.PointLight(0xffffff,10,0,1)
pointlight1.position.set(0,0,0)
pointlight1.castShadow = true
scene.add(pointlight1)

renderer.setAnimationLoop(animate)
/**Base */

/**
 * Function
 */

//camera distance
function dist (fov) {
    const fovRad= (fov/2)*(Math.PI/180)
    const dist = ((sizes.height/position_ratio)/2)/Math.tan(fovRad)
    return dist
}

//widowresize
function onWindowResize(){
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.position.set(0,0,dist(fov))
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

//windowfullscreeen
function WindowFullscreen(){
    if(!document.fullscreenElement){
        canvas.requestFullscreen()
    }else{
        document.exitFullscreen()
    }
}

function animate(){
    controls.update()
    // Render
    renderer.render(scene, camera)

    //second
    const sec = performance.now()/1000

    box1_mesh.rotation.y=sec*(Math.PI/4)
    if(object_gltf!=null){
        object_gltf.rotation.z=sec*(Math.PI/4)
    }
    if(object_obj!=null){
        object_obj.rotation.y=sec*(Math.PI/4)
    }
    // Call tick again on the next frame
    //window.requestAnimationFrame(animate)
}
