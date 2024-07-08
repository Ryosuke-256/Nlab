import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

import ThreeMeshUI from 'three-mesh-ui';

/**
 * 宣言
 */
//imagefiles
const base_path = 'image\\'
/**
const hdr_images_path = [
    '19.hdr','39.hdr','78.hdr','80.hdr','102.hdr',
    '125.hdr','152.hdr','203.hdr','226.hdr','227.hdr',
    '230.hdr','232.hdr','243.hdr','278.hdr','281.hdr'
]
*/
const hdr_images_path = [
    '125.hdr','152.hdr','203.hdr','226.hdr','227.hdr'
]

const hdr_files = []

//base
let canvas, scene, camera, renderer, controls

//size
const sizes = {width: window.innerWidth,height: window.innerHeight}
const windowsize = 256
//const sizes = {width: windowsize,height: windowsize}

//mouse follow

//animate object

//downlodcount
let dlcount = 0
//loadchange
let index_master = 0

//camera
let fov

//widowsize関連補正
let position_ratio = 250

//mouse
const mouse_webGL = new THREE.Vector2()
const mouse_webGL_normal = new THREE.Vector2()
const mouse_window_normal =new THREE.Vector2()
/**initialization */

/**
 * Base
*/
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
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 2
renderer.shadowMap.enabled = true
renderer.setAnimationLoop(animate)
/**renderer */

//controls
/**
controls = new PointerLockControls( camera, canvas )
document.addEventListener('click',()=>{
    controls.lock()
})
controls.addEventListener( 'lock', ()=>{
	console.log('Pointer locked')
})
controls.addEventListener( 'unlock',()=>{
	console.log('Pointer unlocked')
})
scene.add(controls.getObject())
*/
controls = new OrbitControls( camera, canvas )

/**
 * Object
 */
const objsize = 0.2
const objrad = 0.05
const sphere1 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(objsize,objrad,128,8),
    new THREE.MeshStandardMaterial({
        color:0x000000, roughness:0.0, metalness: 0.0
    })
)
sphere1.position.set(-1.5,0,0)
scene.add(sphere1)
const sphere2 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(objsize,objrad,128,8),
    new THREE.MeshStandardMaterial({
        color:0x000000, roughness:0.5, metalness: 0.0
    })
)
sphere2.position.set(-0.7,0,0)
scene.add(sphere2)
const sphere3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(objsize,objrad,128,8),
    new THREE.MeshStandardMaterial({
        color:0x000000, roughness:0.3, metalness: 0.0
    })
)
sphere3.position.set(0.7,0,0)
scene.add(sphere3)
const sphere4 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(objsize,objrad,128,8),
    new THREE.MeshStandardMaterial({
        color:0x000000, roughness:0.9, metalness: 0.0
    })
)
sphere4.position.set(1.5,0,0)
scene.add(sphere4)

/**
 * models
 */


/**
 * Background and Lighting
 */
//背景
const hdr_url = []
//HDRloadmanager
const loadingManager = new THREE.LoadingManager(()=>{
    console.log("Finished loading");
    init_master(index_master)
},(itemUrl,itemsLoaded,itemsTotal)=>{
    console.log("Files loaded:" + itemsLoaded + "/" + itemsTotal)
    hdr_url.push(itemUrl)
})
//loadeverything
const loader1 = new RGBELoader(loadingManager)
hdr_images_path.forEach(element => {
    loader1.load(
        base_path + element,
        (texture)=>{
            hdr_files.push(texture)
        }
    )
})

//平行光源
const directionalLight =new THREE.DirectionalLight(0xffffff,10)
directionalLight.position.set(1,1,1)
scene.add(directionalLight)

//makePanel1()
makePanel1()
/**
 * Additional
 */

/**Additional */
/**Base */

/**
 * Function
 */
// HDRファイルのロード
//init_master
function init_master(index){
    hdr_files[index].encoding = THREE.RGBEEncoding
    hdr_files[index].mapping = THREE.EquirectangularReflectionMapping
    scene.background = hdr_files[index]
    scene.environment = hdr_files[index]

    console.log(hdr_url[index])
}

function makePanel1(){
    const container = new ThreeMeshUI.Block({
        height:1.05,width:1,padding:0.1,
        fontFamily: './assets/Roboto-msdf.json',
        fontTexture: './assets/Roboto-msdf.png',
        textAlign: 'center',
        justifyContent: 'center'
    })
    container.position.set(0.0,0.9,0.0)
    container.rotation.set(Math.PI/8,0.0,0.0)
    scene.add(container)
    const textBlock = new ThreeMeshUI.Block({
        height:0.95,width:0.8,margin:0.1,offset:0.1,
        textAlign:'center',
        padding:0.03
    })
    container.add(textBlock)
    textBlock.add(
        new ThreeMeshUI.Text({
            content:'Rotation camera with \n',
            fontColor:new THREE.Color(0xffffff),
            fontSize:0.07
        }),
        new ThreeMeshUI.Text({
            content:'Mouse\n',
            fontColor:new THREE.Color(0xffffff),
            fontSize:0.1
        }),
        new ThreeMeshUI.Text({
            content:'Rotation object with\n',
            fontColor:new THREE.Color(0xffffff),
            fontSize:0.07
        }),
        new ThreeMeshUI.Text({
            content:'W A S D\n',
            fontColor:new THREE.Color(0xffffff),
            fontSize:0.1
        }),
        new ThreeMeshUI.Text({
            content:'Screen Shot with\n',
            fontColor:new THREE.Color(0xffffff),
            fontSize:0.07
        }),
        new ThreeMeshUI.Text({
            content:'P\n',
            fontColor:new THREE.Color(0xffffff),
            fontSize:0.1
        }),
        new ThreeMeshUI.Text({
            content:'Change HDR with \n',
            fontColor:new THREE.Color(0xffffff),
            fontSize:0.07
        }),
        new ThreeMeshUI.Text({
            content:'Right/Left arrow\n',
            fontColor:new THREE.Color(0xffffff),
            fontSize:0.1
        })
    )
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
    //sizes.width = windowsize
    //sizes.height = windowsize

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
let rot_vel = 0.006
function animate(){
    //controls
    controls.update()
    // Render
    renderer.render(scene, camera)
    ThreeMeshUI.update()

    //second
    const sec = performance.now()/1000

    //keyanimation
    if (down_pressingfrag){
        sphere1.rotation.x += Math.PI*rot_vel
        sphere2.rotation.x += Math.PI*rot_vel
        sphere3.rotation.x += Math.PI*rot_vel
        sphere4.rotation.x += Math.PI*rot_vel
    }
    if (up_pressingfrag){
        sphere1.rotation.x -= Math.PI*rot_vel
        sphere2.rotation.x -= Math.PI*rot_vel
        sphere3.rotation.x -= Math.PI*rot_vel
        sphere4.rotation.x -= Math.PI*rot_vel
    }
    if (right_pressingfrag){
        sphere1.rotation.y += Math.PI*rot_vel
        sphere2.rotation.y += Math.PI*rot_vel
        sphere3.rotation.y += Math.PI*rot_vel
        sphere4.rotation.y += Math.PI*rot_vel
    }
    if (left_pressingfrag){
        sphere1.rotation.y -= Math.PI*rot_vel
        sphere2.rotation.y -= Math.PI*rot_vel
        sphere3.rotation.y -= Math.PI*rot_vel
        sphere4.rotation.y -= Math.PI*rot_vel
    }
    // Call tick again on the next frame
}
/**Function */

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

//change loaded
document.addEventListener("keydown",(e)=>{
    //hdr
    //press ←
    if(e.keyCode == 37 && index_master > 0){
        index_master -=1;
        init_master(index_master);
    }
    //press →
    if(e.keyCode == 39 && index_master < hdr_files.length-1){
        index_master +=1;
        init_master(index_master)
    }
})

//donwload push P
document.addEventListener("keydown",(e) =>{
    if(e.keyCode == 80) {
        var imgData, imgNode;
        //Listen to 'P' key
        if(e.which !== 80) return;
        try {
            renderer.render(scene, camera)
            imgData = renderer.domElement.toDataURL();
        }
        catch(e) {
            console.log("Browser does not support taking screenshot of 3d context");
            return;
        }
        const downloadlink = document.getElementById("downloadlink");
        downloadlink.href = imgData;
        downloadlink.download= "downloadfile_" + dlcount + ".png";
        downloadlink.click();
        imgNode = document.createElement("img");
        imgNode.src = imgData;
        document.body.appendChild(imgNode);
        dlcount +=1;
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

let up_pressingfrag = false
let left_pressingfrag = false
let down_pressingfrag = false
let right_pressingfrag = false
document.addEventListener("keydown",(e)=>{
    //press w
    if(e.keyCode == 87){
        up_pressingfrag = true
    }
    //press a
    if(e.keyCode == 65){
        left_pressingfrag = true
    }
    //press s
    if(e.keyCode == 83){
        down_pressingfrag = true
    }
    //press d 
    if(e.keyCode == 68){
        right_pressingfrag = true
    }
})

document.addEventListener("keyup",(e)=>{
    //press w
    if(e.keyCode == 87){
        up_pressingfrag = false
    }
    //press a
    if(e.keyCode == 65){
        left_pressingfrag = false
    }
    //press s
    if(e.keyCode == 83){
        down_pressingfrag = false
    }
    //press d 
    if(e.keyCode == 68){
        right_pressingfrag = false
    }
})
/**eventlistner */