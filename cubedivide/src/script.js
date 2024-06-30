import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';

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
let edge_box = 0.501
let boxes_group = new THREE.Group()
let boxes_list = []
let box0_mesh,box0_geometry

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

renderer.outputEncoding = THREE.sRGBEncoding; 
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1; 
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
//scene.add(box0_mesh)

const sphere1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.1,30,30),
    new THREE.MeshBasicMaterial({
        color:0x00ff00
    })
)
scene.add(sphere1)


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
            color:0x123456,roughness:0.8,metalness:0.1,transparent:true,opacity:1
        })
    )
    boxes_group.add(box)
    boxes_list.push(box)
    box.position.set(box0_vertices[i][0],box0_vertices[i][1],box0_vertices[i][2])
}

scene.add(boxes_group)

console.log(boxes_list[0])

/**
 * GSAP Animation
 */
//const tl = gsap.timeline()

//gsap.to(boxes_list[2].rotation, { duration:1, y: Math.PI, ease: "power4.inOut", repeat: -1 });

/**
 * Background and Lighting
 */
//背景
scene.background=new THREE.Color(0x333333)

//平行光源
const directionalLight =new THREE.DirectionalLight(0xffffff,15)
directionalLight.position.set(1,1,1)
scene.add(directionalLight)

//点光源
const pointlight = new THREE.PointLight(0xffffff,4)
camera.add(pointlight)


renderer.setAnimationLoop(animate)
/**Base */
/**
 * Postprocessing
 */
//gradientShader
const gradientShader = {
    uniforms: {
        tDiffuse: { value: null },
        smoothStepMin : {value:0.2}
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float smoothStepMin;
        varying vec2 vUv;
        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            float dist = distance(vUv, vec2(0.5, 0.5));
            color.rgb *= smoothstep(smoothStepMin, 0.9, 1.0 - dist);
            gl_FragColor = color;
        }
    `
}
const renderPass = new RenderPass(scene, camera);
const gradientPass = new ShaderPass(gradientShader);
gradientPass.renderToScreen = true;
//bloom
const bloomPass = new UnrealBloomPass(new THREE.Vector2(sizes.width,sizes.height),0.75,0.8,0.4)
//compse
let composer = new EffectComposer(renderer)
composer.addPass(renderPass)
composer.addPass(bloomPass)
composer.addPass(gradientPass) 

/**Postprocessing */
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

//loop animate
let sec
function animate(){

    //second
    sec = performance.now()/1000

    //object
    //box0_mesh.rotation.y = sec*(Math.PI/8)

    boxes_group.rotation.y = sec*(Math.PI/8)


    //camera
    if (zoomin) {
        camera.position.z -= 0.002
        const wiggleintensity = 0.02
        camera.position.x += (Math.random() - 0.5)*wiggleintensity
        camera.position.y += (Math.random() - 0.5)*wiggleintensity
        camera.position.z += (Math.random() - 0.5)*wiggleintensity
    }

    //postprocessing
    if (dark_flag){
        gradientShader.uniforms.smoothStepMin.value += 0.0005
    }

    // Render
    controls.update()
    //renderer.render(scene, camera)
    composer.render()
}
/**function */

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

//obj animation
let obj_dist = 1.4
let obj_pressingfrag = false
document.addEventListener("keydown",(e)=>{
    //press A
    if(e.keyCode == 65){
        for (let i = 0;i < boxes_list.length;i++){
            gsap.to(boxes_list[i].position,{
                duration:0.3,
                x:box0_vertices[i][0]*obj_dist,
                y:box0_vertices[i][1]*obj_dist,
                z:box0_vertices[i][2]*obj_dist,
                ease:"power4.Out",
            })
        }
        obj_pressingfrag = true
    }
})

document.addEventListener("keyup",(e)=>{
    if(e.keyCode == 65){
        for (let i = 0;i < boxes_list.length;i++){
            gsap.to(boxes_list[i].position,{
                duration:0.3,
                x:box0_vertices[i][0],
                y:box0_vertices[i][1],
                z:box0_vertices[i][2],
                ease:"power4.Out",
            })
        }
        obj_pressingfrag = false
    }
})

//camera animation
let cameraz_0
let zoomin = false
let keyPressed_camera = false

document.addEventListener("keydown",(e)=>{
    if(e.keyCode == 65 && !keyPressed_camera){
        //frag管理
        setTimeout(()=>{
            zoomin = true
        },50)
        keyPressed_camera = true
        cameraz_0 = camera.position.z
        gsap.to(camera.position,{ duration:0.5, z : cameraz_0 - 0.3, ease:"power1.Out" })
    }
}) //キーを押してから始めの一回だけ発火、キーを押している最中の挙動はzoomin(flag)でanimationloop内で処理
document.addEventListener("keyup",(e)=>{
    if(e.keyCode == 65){
        //frag管理
        setTimeout(()=>{
            zoomin = false
        },200)
        keyPressed_camera = false
        gsap.to(camera.position,{ duration:0.4, z : cameraz_0, ease:"circ.inOut" })
    }
}) //キーを離したら発火

//postprocessing
let dark_flag = false
let keyPressed_pp = false
document.addEventListener("keydown",(e)=>{
    if(e.keyCode == 65 && !keyPressed_pp){
        //frag管理
        setTimeout(()=>{
            dark_flag = true
        },10)
        keyPressed_pp = true
        gradientShader.uniforms.smoothStepMin.value = 0.2
        gsap.to(gradientShader.uniforms.smoothStepMin,{ duration:0.5, value: 0.8 , ease:"power1.Out" })
        console.log(gradientShader.uniforms.smoothStepMin.value)
    }
})
//effectGrayScale.uniforms['amount'].value = 0.5;
document.addEventListener("keyup",(e)=>{
    if(e.keyCode == 65){
        //frag管理
        setTimeout(()=>{
            zoomin = false
        },10)
        keyPressed_pp = false
        gsap.to(gradientShader.uniforms.smoothStepMin,{ duration:0.3, value: 0.2, ease:"circ.inOut" })
        console.log(gradientShader.uniforms.smoothStepMin.value)
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