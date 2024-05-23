//package
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { element } from 'three/examples/jsm/nodes/Nodes.js'

/**
 * File path
 */
//imagefiles
const base_path = 'image\\'
const hdr_images_path = [
    'symmetrical_garden_02_2k.hdr',
    'chapel_day_2k.hdr',
    'cobblestone_street_night_2k.hdr',
    'brown_photostudio_02_2k.hdr',
]
const hdr_files = []

//modelfiles
const model_base_path = 'models/normal\\'
const model_path = [
    'board_ang0_size03.obj',
    'board_ang30_size03.obj',
    'bunny.obj',
    'sphere.obj',
    'teapot.obj',
]
const model_files = []

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * HDRI Load 
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
const pointlight1 = new THREE.PointLight(0xffffff,300,0,1)
pointlight1.position.set(0,0,0)
pointlight1.castShadow = true
scene.add(pointlight1)


/**
 * geometry
 *  */
//texture_load
const textureLoader = new THREE.TextureLoader()
const normalMapTexture = textureLoader.load("./texture/seaworn_stone_tile/seaworn_stone_tiles_nor_dx_1k.jpg")

//material setting
const material_default_1 = new THREE.MeshPhysicalMaterial({
    color:0xff0000,thickness:1, //いろいろ
    metalness:0, roughness:0, //Standard
    anisotropy:0,attenuationDistance:10000, //異方性 (金属)
    clearcoat:0,clearcoatRoughness:0, //クリアコート
    iridescence:0.0, iridescenceIOR:1.3,iridescenceThicknessRange:[100,400], //虹彩効果
    transmission:0, //透明度 (非金属)
    dispersion:0,ior:1.5,reflectivity:0.5, // 反射率 (非金属)
    sheen:0,sheenRoughness:1,specularIntensity:1 //光沢 (非金属)
})
const material_normal_1 = new THREE.MeshPhysicalMaterial({
    color:0xff0000,thickness:1, //いろいろ
    metalness:0, roughness:0.25, //Standard
    anisotropy:0,attenuationDistance:10, //異方性 (金属)
    clearcoat:0.75,clearcoatRoughness:0.5, //クリアコート
    iridescence:0.5, iridescenceIOR:1,iridescenceThicknessRange:[100,400], //虹彩効果
    transmission:0, //透明度 (非金属)
    dispersion:1,ior:2.3,reflectivity: 0, // 反射率 (非金属)
    sheen:1,sheenRoughness:1,specularIntensity:1 //光沢 (非金属)
})
const material_Translucent_1 = new THREE.MeshPhysicalMaterial({
    color:0xff0000,thickness:10, //いろいろ
    metalness:0, roughness:0.5, //Standard
    anisotropy:0,attenuationDistance:10, //異方性 (金属)
    clearcoat:0.1,clearcoatRoughness:0.2, //クリアコート
    iridescence:0.2, iridescenceIOR:1,iridescenceThicknessRange:[100,800], //虹彩効果
    transmission:0.05, //透明度 (非金属)
    dispersion:1,ior:1,reflectivity:0.5, // 反射率 (非金属)
    sheen:1,sheenRoughness:0.1,specularIntensity:1 //光沢 (非金属)
})
const material_metal_1 = new THREE.MeshPhysicalMaterial({
    color:0xff0000,thickness:1, //いろいろ
    metalness:1, roughness:0.2, //Standard
    anisotropy:0,attenuationDistance:1000, //異方性 (金属)
    clearcoat:1,clearcoatRoughness:0.1, //クリアコート
    iridescence:0, iridescenceIOR:0.99,iridescenceThicknessRange:[100,400], //虹彩効果
    transmission:0, //透明度 (非金属)
    dispersion:1,ior:2.3,reflectivity: 0, // 反射率(非金属)
    sheen:0.1,sheenRoughness:1,specularIntensity:1 //光沢(非金属)
})
const material_mat_1 = new THREE.MeshPhysicalMaterial({
    color:0xff0000,thickness:1, //いろいろ
    metalness:0, roughness:0.8, //Standard
    anisotropy:0,attenuationDistance:10, //異方性 (金属)
    clearcoat:0.75,clearcoatRoughness:0.75, //クリアコート
    iridescence:0, iridescenceIOR:1,iridescenceThicknessRange:[100,400], //虹彩効果
    transmission:0, //透明度 (非金属)
    dispersion:0.1,ior:1,reflectivity: 0.5, // 反射率 (非金属)
    sheen:0.5,sheenRoughness:1,specularIntensity:0.5 //光沢 (非金属)
})
const material_list = [material_default_1,material_normal_1,material_Translucent_1,material_metal_1,material_mat_1]


//plane1
const plane1_geometry = new THREE.PlaneGeometry(1000,1000,10,10)
const plane1_material =new THREE.MeshStandardMaterial({
    color:0xffffff,side: THREE.DoubleSide, roughness:1.0, metalness: 0.0,
    normalMap:normalMapTexture
})
const plane1_mesh=new THREE.Mesh(plane1_geometry,plane1_material)
plane1_mesh.rotation.set(Math.PI/2,0,0)
plane1_mesh.position.set(0,-150,0)
plane1_mesh.receiveShadow = true
scene.add(plane1_mesh)

//sphere1
const sphere1_geometry=new THREE.SphereGeometry(100,30,30)
const sphere1_mesh=new THREE.Mesh(sphere1_geometry,material_list[0])
sphere1_mesh.position.set(-100,0,0)
sphere1_mesh.castShadow = true
scene.add(sphere1_mesh)

/**sphere2
const sphere2_geometry=new THREE.SphereGeometry(100,30,30)
const sphere2_material =new THREE.MeshStandardMaterial({color:0xff0000,roughness:0.1, metalness: 1.0})
const sphere2_mesh=new THREE.Mesh(sphere2_geometry,sphere2_material)
sphere2_mesh.position.set(-200,0,0)
sphere2_mesh.castShadow = true
scene.add(sphere2_mesh)
*/

/**sphere3
const sphere3_geometry=new THREE.SphereGeometry(100,30,30)
const sphere3_material =new THREE.MeshPhongMaterial({color:0xff0000})
const sphere3_mesh=new THREE.Mesh(sphere3_geometry,sphere3_material)
sphere3_mesh.position.set(200,0,0)
sphere3_mesh.castShadow = true
scene.add(sphere3_mesh)
*/

//cursor
const cursor1_geometry = new THREE.SphereGeometry(5,10,10)
const cursor1_material = new THREE.MeshBasicMaterial({color:0x000000})
const cursor1_mesh = new THREE.Mesh(cursor1_geometry,cursor1_material)
cursor1_mesh.position.set(0,0,0)
scene.add(cursor1_mesh)

/**
 * models
*/
//変数定義
var index_master = 0
var index_env = 0
var index_map = 0
var index_model = 0
var index_material = 0

//initialization
var object_obj = null
function init_model(index){
    //情報破棄
    scene.remove(object_obj)

    object_obj = model_files[index]
    const coe = 50
    object_obj.scale.set(coe,coe,coe)
    object_obj.position.set(150,0,0)
    object_obj.material = material_list[index_material]
    object_obj.castShadow = true
    scene.add(object_obj)
    console.log(object_obj)
}

//ロードマネージャ
const loadingManager_model = new THREE.LoadingManager(
    // everything has been loaded
    () =>
    {
        console.log('Finished loading everything')
        init_model(0)
    },
    // Progress
    (itemUrl, itemsLoaded, itemsTotal) =>
    {
        console.log('Files loaded: ' + itemsLoaded + '/' + itemsTotal)
    }
)

//全てのobjファイルをロード
const objLoader = new OBJLoader(loadingManager_model)
model_path.forEach(element=>{
    objLoader.load(
        model_base_path + element,
        (obj) =>{
            model_files.push(obj.children[0])
        },(xhr)=>{
            console.log((xhr.loaded/xhr.total*100)+'% loaded')
        },(error)=>{
            console.log('An error happened',error)
        }
    )
})

/**
 * EventListener
 */
//funciton
function init_material(index){
    sphere1_mesh.material = material_list[index]
    object_obj.material = material_list[index]
}
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

    //models
    //pressZ
    if(e.keyCode == 90 && index_model > 0){
        index_model -=1
        init_model(index_model)
    }
    //pressC
    if(e.keyCode == 67 && index_model < model_files.length-1){
        index_model += 1
        init_model(index_model)
    }

    //materials
    //pressR
    if(e.keyCode == 82 && index_material > 0){
        index_material -=1
        init_material(index_material)
    }
    //pressY
    if(e.keyCode == 89 && index_material < material_list.length-1){
        index_material += 1
        init_material(index_material)
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
    if(object_obj!=null){
        object_obj.rotation.y=sec*(Math.PI/4)
    }
    // Call tick again on the next frame
    window.requestAnimationFrame(animate)
}

animate()