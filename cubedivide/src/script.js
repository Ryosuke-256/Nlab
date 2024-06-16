import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { gsap } from "gsap";

/**
 * 宣言
 */
//base
let canvas, scene, camera, renderer, controls

//size
const sizes = {width: window.innerWidth,height: window.innerHeight}

//camera
let fov

//widowsize関連補正
let position_ratio = 250

//mouse
const mouse_webGL = new THREE.Vector2()
const mouse_webGL_normal = new THREE.Vector2()
const mouse_window_normal =new THREE.Vector2()

//object
let edge_box = 0.3
let boxes_group = new THREE.Group()
let boxes_list = []
let box0_mesh,box0_geometry

/**
 * eventlister
 */
//base
//window.addEventListener('load',init)

//resize
window.addEventListener('resize', onWindowResize)

//fullscreen
window.addEventListener("dblclick",WindowFullscreen)

//number key to camera
document.addEventListener("keydown",(e)=>{
    //1
    if(e.keyCode == 49) {
        camera.position.set(0,0,dist(fov))
    }
    //2
    if(e.keyCode == 50) {
        camera.position.set(dist(fov),0,0)
    }
    //3
    if(e.keyCode == 51) {
        camera.position.set(0,0,-dist(fov))
    }
    //4
    if(e.keyCode == 52) {
        camera.position.set(-dist(fov),0,0)
    }
    //5
    if(e.keyCode == 53) {
        camera.position.set(0,dist(fov),0)
    }
    //6
    if(e.keyCode == 54) {
        camera.position.set(0,-dist(fov),0)
    }
})
/**
//keydown animation
document.addEventListener("keydown",(e)=>{
    //press A
    if(e.keyCode == 65){
        gsap.to(boxes_list[1].position,{
            duration:0.3,
            x:box0_vertices[1][0]*2,y:box0_vertices[1][1]*2,z:box0_vertices[1][2]*2,
            ease:"power4.inOut",
        })
    }
})

document.addEventListener("keyup",(e)=>{
    if(e.keyCode == 65){
        gsap.to(boxes_list[1].position,{
            duration:0.3,
            x:box0_vertices[1][0],y:box0_vertices[1][1],z:box0_vertices[1][2],
            ease:"power4.inOut",
        })
    }
})
*\

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
 * Base
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
box0_geometry = new THREE.BoxGeometry(0.5,0.5,0.5)
box0_mesh = new THREE.Mesh(
    box0_geometry,
    new THREE.MeshBasicMaterial({
        color:0x00ff00,wireframe:true
    })
)
scene.add(box0_mesh)

//頂点情報ゲット
let vertices = box0_mesh.geometry.attributes.position.array
let box0_vertices_be = []

for (let i = 0; i < vertices.length; i+=3){
    const vertex = [vertices[i],vertices[i+1],vertices[i+2]]
    box0_vertices_be.push(vertex)
}

let box0_vertices = Array.from(new Set(box0_vertices_be.map(JSON.stringify)),JSON.parse)

//各頂点にboxを配置
for(let i = 0; i < box0_vertices.length; i++){
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(edge_box,edge_box,edge_box),
        new THREE.MeshStandardMaterial({
            color:0x123456,roughness:0.5,metalness:0.3,transparent:true,opacity:0.4
        })
    )
    boxes_group.add(box)
    boxes_list.push(box)
    box.position.set(box0_vertices[i][0],box0_vertices[i][1],box0_vertices[i][2])
}

scene.add(boxes_group)

console.log(boxes_list[0])

let bairitsu = 1
//const  = arrayOfArrays.map(innerArray => innerArray.map(element => element * bairitsu));

/**
 * GSAP Animation
 */
const tl = gsap.timeline()

gsap.to(boxes_list[2].rotation, { duration:1, y: Math.PI, ease: "power4.inOut", repeat: -1 });

/**
 * Background and Lighting
 */
//背景
scene.background=new THREE.Color(0x333333)

//平行光源
const directionalLight =new THREE.DirectionalLight(0xffffff,4)
directionalLight.position.set(1,1,1)
scene.add(directionalLight)

//点光源
const pointlight = new THREE.PointLight(0xffffff,5)
camera.add(pointlight)


renderer.setAnimationLoop(animate)

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

let cameraz_0,cameraz_1
let sec,sec_0,sec_1,sec_diff

function animate(){

    //second
    sec = performance.now()/1000

    //object
    box0_mesh.rotation.y = sec*(Math.PI/8)
    boxes_group.rotation.y = sec*(Math.PI/8)
    boxes_list[0].rotation.y = sec*(Math.PI/8)
    
    controls.update()

    // Render
    renderer.render(scene, camera)
}

let keyPressed = false

document.addEventListener("keydown",(e)=>{
    if(e.keyCode == 65 && !keyPressed){
        cameraz_0 = camera.position.z
        cameraz_1 = cameraz_0
        sec = performance.now()/1000
        sec_0 = performance.now()/1000
        //gsap.to(camera.position,{ duration:1, z : cameraz_0 - 0.5, ease:"circ.Out" })
        console.log("A keydown,\ncamera0 : " + cameraz_0 + "\ncamera1 : " + cameraz_1+"\nsec_0 : "+ sec_0+"\nsec : "+sec)
        keyPressed = true
    }
})
document.addEventListener("keydown",(e)=>{
    if(e.keyCode == 65){
        if (sec_0 !=null)
            sec_diff = sec - sec_0
        cameraz_1 = cameraz_0 - sec_diff*0.2
        camera.position.z = cameraz_1
    }else{
        cameraz_1 = 0
    }
    console.log("count")
})
document.addEventListener("keyup",(e)=>{
    if(e.keyCode == 65){
        gsap.to(camera.position,{ duration:0.5, z : cameraz_0, ease:"power4.inOut" })
        console.log("A keyup ,\ncamera0 : " + cameraz_0 + "\ncamera1 : " + cameraz_1+"\nsec_0 : "+ sec_0+"\nsec : "+sec+"\nsec_diff : "+sec_diff)
        keyPressed = false
    }
})