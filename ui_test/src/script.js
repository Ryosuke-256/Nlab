import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { attribute, element, metalness, roughness } from 'three/examples/jsm/nodes/Nodes.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';

import ThreeMeshUI from 'three-mesh-ui';
import VRControl from 'three-mesh-ui/examples/utils/VRControl.js'
import ShadowedLight from 'three-mesh-ui/examples/utils/ShadowedLight.js'

/**
 * 宣言
 */
//base
let canvas, scene, camera, renderer, controls, vrControl

//object
let meshcontainer , meshes , currentmesh

//mouse follow
let pointlight1, cursor1_mesh

//window size
const sizes = { width: window.innerWidth, height: window.innerHeight}

//camera
let fov

//widowsize関連補正
let position_ratio = 250

//mouse
let mouse_webGL = new THREE.Vector2()
let mouse_webGL_normal = new THREE.Vector2()
let mouse_window_normal =new THREE.Vector2()

//ui panel1
let container
//ui panel2
let container2
//ui panel3
let container3
const objsToTest = []
let selectState = false
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
mouse.x = mouse.y = null 

//ui panel list
let container_list = []

/**宣言*/

/**
 * eventlister
 */

//base
window.addEventListener('load',init)

//resize
window.addEventListener('resize', onWindowResize)

//fullscreen
window.addEventListener("dblclick",WindowFullscreen)

//camera direction
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

//uipanel3
window.addEventListener('pointermove',(e)=>{
    mouse.x = (e.clientX/sizes.width)*2-1
    mouse.y = -(e.clientY/sizes.height)*2+1
})
window.addEventListener('pointerdown',()=>{
    selectState = true
})
window.addEventListener('pointerup',()=>{
    selectState = false
})
window.addEventListener('touchstart',(e)=>{
    selectState
})

/**eventlistner */

/**
 * function
 */

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

    /**Renderer */

    //controls
    controls = new OrbitControls( camera, canvas)

    /**
     * VRcontroll
     */
    
        
    /**
     * Object
     */
    //plane1
    const plane1_mesh=new THREE.Mesh(
        new THREE.PlaneGeometry(10,10,10,10),
        new THREE.MeshStandardMaterial({color:0xffffff,side: THREE.DoubleSide, roughness:0.0, metalness: 0.0})
    )
    plane1_mesh.rotation.set(Math.PI/2,0,0)
    plane1_mesh.position.set(0,-1,0)
    plane1_mesh.receiveShadow = true
    scene.add(plane1_mesh)

    //room
    const room = new THREE.LineSegments(
        new BoxLineGeometry(6,6,6,10,10,10).translate(0,1,0),
        new THREE.LineBasicMaterial({color:0x808080})
    )
    const roomMesh = new THREE.Mesh(
        new THREE.BoxGeometry(6,6,6,10,10,10).translate(0,1,0),
        new THREE.MeshBasicMaterial({side:THREE.BackSide})
    )

    scene.add(room)
    objsToTest.push(roomMesh)

    //mesh group
    meshcontainer = new THREE.Group();
    meshcontainer.position.set(0,0,0)
    scene.add(meshcontainer)

    //box1
    const box1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.5,0.5,0.5),
        new THREE.MeshStandardMaterial({color:0xff0000, roughness:0.0, metalness: 0.0})
    )
    box1.castShadow = true

    //sphere1
    const sphere1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.5,30,30),
        new THREE.MeshStandardMaterial({color:0x00ff00,roughness:0.0,metalness:0.0})
    )

    //touras1
    const torus1 = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.3,0.1,128,32),
        new THREE.MeshStandardMaterial({color:0x0000ff,roughness:0.0,metalness:0.0})
    )

    box1.visible = sphere1.visible = torus1.visible = false
    meshcontainer.add(box1,sphere1,torus1)
    meshes = [box1,sphere1,torus1]
    currentmesh = 0

    showMesh(currentmesh)

    //cursor
    cursor1_mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.05,10,10),
        new THREE.MeshBasicMaterial({color:0x000000})
    )
    cursor1_mesh.position.set(0,0,0)
    scene.add(cursor1_mesh)

    //UIpanels
    makePanel1()
    makePanel2()
    makePanel3()

    /**Object */

    /**
     * Background & Lighting
     */
    //scene.background = new THREE.Color(0.2,0.2,0.2)
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
    pointlight1 = new THREE.PointLight(0xffffff,2,0,1)
    pointlight1.position.set(0,0,0)
    pointlight1.castShadow = true
    scene.add(pointlight1)

    /**Background & Lighting */

    //loop animation
    renderer.setAnimationLoop(animate)
}

function showMesh(id){
    meshes.forEach((mesh,i) => {
        mesh.visible = i === id ? true : false
    })
}

//UIpanel1
function makePanel1(){
    const ui_imageloader = new THREE.TextureLoader()
    //container
    container = new ThreeMeshUI.Block({
        height:1.6,width:1,padding:0.1,
        fontFamily: './assets/Roboto-msdf.json',
        fontTexture: './assets/Roboto-msdf.png',
        textAlign: 'center',
        justifyContent: 'center'
    })
    //block
    const imageBlock = new ThreeMeshUI.Block({
        height:0.8,width:0.8,offset:0.1
    })
    const textBlock = new ThreeMeshUI.Block({
        height:0.8,width:0.8,margin:0.1,offset:0.1
    })
    container.add(imageBlock,textBlock)
    //text
    const text = new ThreeMeshUI.Text({
        content:'The spiny bush viper is known for its extremely keeled dorsal scales.',
        fontColor:new THREE.Color(0xd2ffbd),
        fontSize:0.05,
        backgroundOpacity: 0.0,
        offset:0.01
    })
    textBlock.add(text)
    //styletext
    textBlock.set({
        textAlign:'right',
        justifyContent:'end',
        padding:0.03
    })
    textBlock.add(
        new ThreeMeshUI.Text({
            content:'Mind your fingers.',
            fontSize:0.1,
            fontColor:new THREE.Color(0xefffe8)
        })
    )
    ui_imageloader.load("./assets/spiny_bush_viper.jpg",(texture)=>{
        imageBlock.set({backgroundTexture:texture})
    })

    container_list.push(container)
    scene.add(container)
}
//UI edge panel
function makePanel2(){
    container2 = new ThreeMeshUI.Block({
        width:1,height:0.8,fontSize:0.055,
        backgroundColor:new THREE.Color(0,0,0),
        justifyContent:"center",textAlign:"center",
        fontFamily: './assets/Roboto-msdf.json',
        fontTexture: './assets/Roboto-msdf.png'
    })
    container2.position.set(0,0,0)
    container2.rotation.x = -0.55


    container2.add(
        new ThreeMeshUI.Text({
           content:"Block.borderRadius\n\nBlock.borderWidth\n\nBlock.borderColor\n\nBlock.borderOpacity"
        })
     )

    container_list.push(container2)
    scene.add(container2)
}
//UI bottan panel
function makePanel3(){
    container3 = new ThreeMeshUI.Block({
        fontSize:0.07,padding:0.02,borderRadius:0.11,
        justifyContent:"center",
        contentDirection:"row-reverse",
        fontFamily: './assets/Roboto-msdf.json',
        fontTexture: './assets/Roboto-msdf.png',
    })
    container3.position.set(0,0.6,-1.2)
    container3.rotation.x = -0.55
    scene.add(container3)

    //Buttons

    const buttonOptions = {
        width:0.4,height:0.15,
        justifyContent:"center",
        offset:0.05,margin:0.02,borderRadius: 0.075,
    }

    const hoveredStateAtrributes = {
        state:"hovered",
        attributes:{
            offset:0.035,
            backgroundColor: new THREE.Color( 0x888888 ),
			backgroundOpacity: 1,
			fontColor: new THREE.Color( 0xffffff )
        }
    }

    const idleStateAttributes = {
        state:"idle",
        attributes:{
            offset:0.035,
            backgroundColor: new THREE.Color( 0x444444 ),
			backgroundOpacity: 0.7,
			fontColor: new THREE.Color( 0xffffff )
        }
    }

    const buttonNext = new ThreeMeshUI.Block( buttonOptions )
    const buttonPrevious = new ThreeMeshUI.Block( buttonOptions )

    buttonNext.add(
        new ThreeMeshUI.Text({content:"next"})
    )
    buttonPrevious.add(
        new ThreeMeshUI.Text({content:"previous"})
    )

    const selectedAttributes = {
        offset:0.02,
        backgroundColor:new THREE.Color(0x777777),
        fontColor: new THREE.Color(0x222222)
    }

    buttonNext.setupState({
        state:"selected",
        attributes:selectedAttributes,
        onSet:() => {
            currentmesh = (currentmesh+1)%3
            showMesh(currentmesh)
        }
    })
    buttonNext.setupState(hoveredStateAtrributes)
    buttonNext.setupState(idleStateAttributes)

    buttonPrevious.setupState({
        state:"selected",
        attributes:selectedAttributes,
        onSet:() => {
            currentmesh -=1
            if (currentmesh<0 ) currentmesh = 2
            showMesh(currentmesh)
        }
    })
    buttonPrevious.setupState(hoveredStateAtrributes)
    buttonPrevious.setupState(idleStateAttributes)

    container3.add(buttonNext,buttonPrevious)
    objsToTest.push(buttonNext,buttonPrevious)
}

//updatebuttons
function updateButoons(){
    let intersect
/**
    if(renderer.xr.isPresenting){
        vrControl.setFromController(0,raycaster.ray)
        intersect = raycast()
        if (intersect) vrControl.setPointerAt(0,intersect.point)
    }else if(mouse.x !== null && mouse.y !== null){
        raycaster.setFromCamera(mouse,camera)
        intersect = raycast()
    }
*/
    if(mouse.x !== null && mouse.y !== null){
        raycaster.setFromCamera(mouse,camera)
        intersect = raycast()
    }
    if (intersect && intersect.object.isUI){
        if(selectState){
            intersect.object.setState('selected')
        }else{
            intersect.object.setState('hovered')
        }
    }

    objsToTest.forEach((obj)=>{
        if((!intersect || obj !== intersect.object) && obj.isUI){
            obj.setState('idle')
        }
    })
}

function raycast() {
    return objsToTest.reduce((closestIntersection,obj)=>{
        const intersection = raycaster.intersectObject(obj,true)
        if(!intersection[0]) return closestIntersection
        if(!closestIntersection || intersection[0].distance < closestIntersection.distance){
            intersection[0].object = obj
            return intersection[0]
        }
        return closestIntersection
    },null)
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

//camera distance
function dist (fov) {
    const fovRad= (fov/2)*(Math.PI/180)
    const dist = ((sizes.height/position_ratio)/2)/Math.tan(fovRad)
    return dist
}

//animateloop
function animate(){
    controls.update()
    // Render
    renderer.render(scene, camera)

    //second
    const sec = performance.now()/1000

    //geometry animation
    meshcontainer.rotation.set(Math.PI*sec/4,Math.PI*sec/4,0)

    //UI
    //animation
    container2.set({
        borderRadius:[0,0.2+0.2*Math.sin(sec),0,0],
        borderWidth:0.05-0.06*Math.sin(sec),
        borderColor:new THREE.Color(0.5+5*Math.sin(sec),0.5,1),
        borderOpacity:1
    })
    //UI transform set
    if(container_list.every(element => element !== null)){
        container.position.set(-2,0,-1)
        container2.position.set(-1,0,-1)
        container3.position.set(0,0,1)
    }

    ThreeMeshUI.update()
    updateButoons()
    // Call tick again on the next frame
}

/**function */