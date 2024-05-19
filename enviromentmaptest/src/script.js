//package
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

const base_path = 'image\\'
const hdr_images_path = [
    'symmetrical_garden_02_2k.hdr',
    'chapel_day_2k.hdr',
    'cobblestone_street_night_2k.hdr',
    'brown_photostudio_02_2k.hdr',
]
const hdr_files = []

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * 背景とライト 
*/
// HDRファイルのロード
//init_master
function init_master(index){
    index_env = index
    index_map = index
    hdr_files[index].encoding = THREE.RGBEEncoding
    hdr_files[index].mapping = THREE.EquirectangularReflectionMapping
    scene.background = hdr_files[index]
    scene.environment = hdr_files[index]
}
//init_env
function init_env(index){
    hdr_files[index].encoding = THREE.RGBEEncoding
    hdr_files[index].mapping = THREE.EquirectangularReflectionMapping
    scene.background = hdr_files[index]
}
//init_map 
function init_map(index){
    hdr_files[index].encoding = THREE.RGBEEncoding
    hdr_files[index].mapping = THREE.EquirectangularReflectionMapping
    scene.environment = hdr_files[index]
}
//ロードマネージャ
const loadingManager = new THREE.LoadingManager(
    // everything has been loaded
    () =>
    {
        console.log('Finished loading everything')
        init_master(0)
    },
    // Progress
    (itemUrl, itemsLoaded, itemsTotal) =>
    {
        console.log('Files loaded: ' + itemsLoaded + '/' + itemsTotal)
    }
)
//全てをロード
const loader1 = new RGBELoader(loadingManager)
hdr_images_path.forEach(element => {
    loader1.load(
        base_path + element, 
        (texture) => {
            hdr_files.push(texture)
        }
    )
})

//点光源
const pointlight1 = new THREE.PointLight(0xffffff,200,0,1)
pointlight1.position.set(0,0,0)
pointlight1.castShadow = true
scene.add(pointlight1)

/**
 * geometry
 *  */
//texture_load
const textureLoader = new THREE.TextureLoader()
const normalMapTexture = textureLoader.load("./texture/seaworn_stone_tile/seaworn_stone_tiles_nor_dx_1k.jpg")

//plane1
const plane1_geometry = new THREE.PlaneGeometry(1000,1000,10,10)
const plane1_material =new THREE.MeshStandardMaterial({
    color:0xffffff,side: THREE.DoubleSide, roughness:1.0, metalness: 0.0,
    normalMap:normalMapTexture
})
const plane1_mesh=new THREE.Mesh(plane1_geometry,plane1_material)
plane1_mesh.rotation.set(Math.PI/2,0,0)
plane1_mesh.position.set(0,-100,0)
plane1_mesh.receiveShadow = true
scene.add(plane1_mesh)

//sphere1
const sphere1_geometry=new THREE.SphereGeometry(100,30,30)
const sphere1_material =new THREE.MeshPhysicalMaterial({
    color:0xff0000,thickness:1, //いろいろ
    anisotropy:0.5,attenuationDistance:10, //異方性
    clearcoat:1,clearcoatRoughness:0.2, //クリアコート
    dispersion:1,ior:2.3,reflectivity: 0, // 金属性
    sheen:1,sheenRoughness:1,specularIntensity:1 //光沢
})
const sphere1_mesh=new THREE.Mesh(sphere1_geometry,sphere1_material)
sphere1_mesh.position.set(0,0,0)
sphere1_mesh.castShadow = true
scene.add(sphere1_mesh)

//sphere2
const sphere2_geometry=new THREE.SphereGeometry(100,30,30)
const sphere2_material =new THREE.MeshStandardMaterial({color:0xff0000,roughness:1.0, metalness: 0.0})
const sphere2_mesh=new THREE.Mesh(sphere2_geometry,sphere2_material)
sphere2_mesh.position.set(-200,0,0)
sphere2_mesh.castShadow = true
scene.add(sphere2_mesh)

//sphere3
const sphere3_geometry=new THREE.SphereGeometry(100,30,30)
const sphere3_material =new THREE.MeshPhongMaterial({color:0xff0000})
const sphere3_mesh=new THREE.Mesh(sphere3_geometry,sphere3_material)
sphere3_mesh.position.set(200,0,0)
sphere3_mesh.castShadow = true
scene.add(sphere3_mesh)

//cursor
const cursor1_geometry = new THREE.SphereGeometry(5,10,10)
const cursor1_material = new THREE.MeshBasicMaterial({color:0x000000})
const cursor1_mesh = new THREE.Mesh(cursor1_geometry,cursor1_material)
cursor1_mesh.position.set(0,0,0)
scene.add(cursor1_mesh)

/**
 * EventListener
 */
//変数定義
var index_master = 0
var index_env = 0
var index_map = 0
//eventlistener
document.addEventListener('keydown', (e) =>{
    //master
    //press ←
    if(e.keyCode == 37 && index_master > 0) {
        index_master -= 1
        init_master(index_master)
    }
    //press →
    if(e.keyCode == 39 && index_master < hdr_files.length-1) {
        index_master += 1
        init_master(index_master)
    }

    //backimage
    //press Q
    if(e.keyCode == 81 && index_env > 0){
        index_env -= 1
        init_env(index_env)
    }
    //press E
    if(e.keyCode == 69 && index_env < hdr_files.length-1){
        index_env += 1
        init_env(index_env)
    }

    //ligthing
    //press A
    if(e.keyCode == 65 && index_map > 0){
        index_map -= 1
        init_map(index_map)
    }
    //press D
    if(e.keyCode == 68 && index_map < hdr_files.length-1){
        index_map += 1
        init_map(index_map)
    }
})


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
})

/**
 * その他 
*/
//orbitcontrol
const controls = new OrbitControls( camera, renderer.domElement )

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

    sphere1_mesh.rotation.y=sec*(Math.PI/4);
    // Call tick again on the next frame
    window.requestAnimationFrame(animate)
}

animate()