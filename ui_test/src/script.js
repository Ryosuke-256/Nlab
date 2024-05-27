import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import ThreeMeshUI from 'three-mesh-ui';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry }  from 'three/examples/jsm/geometries/TextGeometry.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
//scene.background = new THREE.Color(0.2,0.2,0.2)

/**
 * Fonts
 */
const fontLoader = new FontLoader()
fontLoader.load(
    "./fonts/helvetiker_regular.typeface.json",
    (font)=>{
        const textGeometry = new TextGeometry(
            "Hello Three.js text",
            {
                font:font,
                size:50,
                depth:0.1,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            }
        )
        const textMaterial = new THREE.MeshStandardMaterial()
        const text = new THREE.Mesh(textGeometry,textMaterial)
        text.position.set(200,200,0)
        scene.add(text)
    }
)

const helvitica = fontLoader.load(
    "./fonts/helvetiker_regular.typeface.json",
)

/**
 * UI
 */
//container
const container = new ThreeMeshUI.Block({
    height:160,width:100,padding:10,
    //fontFamily:helvitica,
    //fontFamily: "./fonts/helvetiker_regular.typeface.json",
    fontFamily: './assets/Roboto-msdf.json',
    fontTexture: './assets/Roboto-msdf.png',
    textAlign: 'center',
    justifyContent: 'center'
})
//block
const imageBlock = new ThreeMeshUI.Block({
    height:80,width:80,offset:10
})
const textBlock = new ThreeMeshUI.Block({
    height:80,width:80,margin:10,offset:10
})
container.add(imageBlock,textBlock)

//text
const text = new ThreeMeshUI.Text({
    content:'The spiny bush viper is known for its extremely keeled dorsal scales.',
    fontColor:new THREE.Color(0xffffff),
    fontSize:10.0,
    backgroundOpacity: 0.0,
    offset:1
})
textBlock.add(text)

//image
const ui_imageloader = new THREE.TextureLoader()
ui_imageloader.load("./assets/spiny_bush_viper.jpg",(texture)=>{
    imageBlock.set({backgroundTexture:texture})
})

scene.add(container)

/**
 * Geometry
 */
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
const box1_geometry=new THREE.SphereGeometry(50,50,50)
const box1_material =new THREE.MeshStandardMaterial({color:0xff0000, roughness:0.0, metalness: 0.0})
const box1_mesh=new THREE.Mesh(box1_geometry,box1_material)
box1_mesh.position.set(0,200,0)
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
//obj loader
var object_obj = null
const objLoader = new OBJLoader()
objLoader.load(
    "./models/normal/teapot.obj",
    (obj) =>{
        object_obj = obj.children[0] //children[0]はいらないときもあるので要確認

        const coe = 50
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
 * Mouse ctrl
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

    //geometry animation
    box1_mesh.rotation.y=sec*(Math.PI/4)
    if(object_obj!=null){
        object_obj.rotation.y=sec*(Math.PI/4)
    }

    //UI
    ThreeMeshUI.update()

    // Call tick again on the next frame
    window.requestAnimationFrame(animate)
}

animate()