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
})
/**eventlistner */

/**
 * Function
 */

//initialization
function init(){
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
    const sphere1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.2,100,100),
        new THREE.MeshStandardMaterial({
            color:0xff0000, roughness:0.1, metalness: 0.8
        })
    )
    //scene.add(sphere1)

    const box0_geometry = new THREE.BoxGeometry(0.5,0.5,0.5)
    const box0 = new THREE.Mesh(
        box0_geometry,
        new THREE.MeshBasicMaterial({
            color:0x00ff00,wireframe:true
        })
    )
    scene.add(box0)

    const positions = box0_geometry.attributes.position.array;
    const box0_vertices = []
    
    console.log(positions.length)

    for (let i = 0; i < positions.length; i+=3){
        const vertex = new THREE.Vector3(positions[i],positions[i+1],positions[i+2])
        box0_vertices.push(vertex)
    }

    console.log(box0_vertices.length)

    const boxs = []
    for(let i = 0; i < box0_vertices; i++){
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.5,0.5,0.5),
            new THREE.MeshStandardMaterial({
                color:0x123456,roughness:0.2,metalness:0.3
            })
        )
        boxs.push(box)
        box.position.set(box0_vertices[i][0],box0_vertices[i][1],box0_vertices[i][2])
        scene.add(box)
    }

    /**
     * models
     */

    /**
     * Background and Lighting
     */
    //背景
    scene.background=new THREE.Color(0x333333)

    //平行光源
    const directionalLight =new THREE.DirectionalLight(0xffffff,10)
    directionalLight.position.set(1,1,1)
    scene.add(directionalLight)


    renderer.setAnimationLoop(animate)
}

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

    // Call tick again on the next frame
    //window.requestAnimationFrame(animate)
}