import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { metalness, texture } from 'three/examples/jsm/nodes/Nodes.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
//scene.background = new THREE.Color(0.2,0.2,0.2)

//plane1
const plane1_geometry = new THREE.PlaneGeometry(1000,1000,10,10)
const textureLoader = new THREE.TextureLoader()
const normalMapTexture = textureLoader.load("./texture/seaworn_stone_tile/seaworn_stone_tiles_nor_dx_1k.jpg")
const plane1_material =new THREE.MeshStandardMaterial({color:0xffffff,side: THREE.DoubleSide, roughness:0.0, metalness: 0.0,normalMap:normalMapTexture})
const plane1_mesh=new THREE.Mesh(plane1_geometry,plane1_material)
plane1_mesh.rotation.set(Math.PI/2,0,0)
plane1_mesh.position.set(0,-100,0)
plane1_mesh.receiveShadow = true
scene.add(plane1_mesh)

//box1
const box1_geometry=new THREE.BoxGeometry(100,100,100)
const box1_material =new THREE.MeshStandardMaterial({color:0xff0000, roughness:0.0, metalness: 0.0})
const box1_mesh=new THREE.Mesh(box1_geometry,box1_material)
box1_mesh.castShadow = true
scene.add(box1_mesh)


//cursor
const cursor1_geometry = new THREE.SphereGeometry(5,10,10)
const cursor1_material = new THREE.MeshBasicMaterial({color:0x000000})
const cursor1_mesh = new THREE.Mesh(cursor1_geometry,cursor1_material)
cursor1_mesh.position.set(0,0,0)
scene.add(cursor1_mesh)

/**
 * models
 */
//gltf loader
var object_gltf = null
const gltfLoader = new GLTFLoader()
gltfLoader.load(
    "./models/gltf/teapot1.1.gltf",
    (gltf) =>{
        object_gltf = gltf.scene.children[0] //children[0]はいらないときもあるので要確認

        object_gltf.scale.set(30,30,30)
        object_gltf.position.set(-200,0,0)
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
var object_obj = null
const objLoader = new OBJLoader()
objLoader.load(
    "./models/normal/dragon.obj",
    (obj) =>{
        object_obj = obj.children[0] //children[0]はいらないときもあるので要確認

        const coe = 100
        object_obj.scale.set(coe,coe,coe)
        object_obj.position.set(200,0,0)
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
const pointlight1 = new THREE.PointLight(0xffffff,200,0,1)
pointlight1.position.set(0,0,0)
pointlight1.castShadow = true
scene.add(pointlight1)

/**
 * Sizes
 */
var adjust = 0
const sizes = {
    width: window.innerWidth-adjust,
    height: window.innerHeight-adjust
}
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth-adjust
    sizes.height = window.innerHeight-adjust

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.position.set(0,0,dist(fov))
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

//fullscreen
window.addEventListener("dblclick",() =>
{
    if(!document.fullscreenElement){
        canvas.requestFullscreen()
    }
    else{
        document.exitFullscreen()
    }
})

/**
 * Camera
 */
// Base camera
const fov = 75
const dist =(fov) =>{
    const fovRad= (fov/2)*(Math.PI/180)
    const dist = (sizes.height/2)/Math.tan(fovRad)
    return dist
}
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1, dist(fov)*10)
camera.position.set(0,0,dist(fov))
scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.outputEncoding = THREE.sRGBEncoding; // レンダラーの出力をsRGB色空間に設定。
renderer.toneMapping = THREE.ACESFilmicToneMapping; // トーンマッピングをACESFilmicに設定。
renderer.toneMappingExposure = 2; // トーンマッピングの露光量を調整。
renderer.shadowMap.enabled = true // 影


//controls
const controls = new OrbitControls( camera, canvas)
controls.enableDamping = true


/**
 * マウス
 */
const mouse_webGL = new THREE.Vector2()
const mouse_webGL_normal = new THREE.Vector2()
const mouse_window_normal =new THREE.Vector2()

//マウス動いた時の処理
window.addEventListener('mousemove',e =>
{
    //WebGLマウス座標
    mouse_webGL.x=e.clientX-(sizes.width/2)
    mouse_webGL.y=-e.clientY+(sizes.height/2)

    //WebGLマウス座標の正規化
    mouse_webGL_normal.x=(mouse_webGL.x*2/sizes.width)
    mouse_webGL_normal.y=(mouse_webGL.y*2/sizes.height)

    //Windowマウス座標の正規化
    mouse_window_normal.x=(e.clientX/sizes.width)*2-1
    mouse_window_normal.y=-(e.clientY/sizes.height)*2+1

//WebGL関連
    //ライトの座標
    pointlight1.position.x=mouse_webGL.x;
    pointlight1.position.y=mouse_webGL.y;

    //カーソルの座標
    cursor1_mesh.position.set(mouse_webGL.x,mouse_webGL.y,0)

//WebGL_normal関連

//Window_noraml関連

})

/**
 * Animate
 */
const animate = () =>
{
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
    window.requestAnimationFrame(animate)
}

animate()