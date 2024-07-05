import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { element } from 'three/examples/jsm/nodes/Nodes.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//for postprocessing
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'


/**
 * initializing
 */
//imagefiles
const base_path = 'image\\'

/**
const hdr_images_path = [
    '5.hdr','19.hdr',
]
*/

/**
const hdr_images_path = [
    '5.hdr','19.hdr','34.hdr','39.hdr','42.hdr',
    '43.hdr','78.hdr','80.hdr','102.hdr','105.hdr',
    '125.hdr','152.hdr','164.hdr','183.hdr','198.hdr',
    '201.hdr','202.hdr','203.hdr','209.hdr','222.hdr',
    '226.hdr','227.hdr','230.hdr','232.hdr','243.hdr',
    '259.hdr','272.hdr','278.hdr','281.hdr','282.hdr'
]
*/

const hdr_images_path = [
    '19.hdr','39.hdr','78.hdr','80.hdr','102.hdr',
    '125.hdr','152.hdr','203.hdr','226.hdr','227.hdr',
    '230.hdr','232.hdr','243.hdr','278.hdr','281.hdr'
]

const hdr_files = []

//base
let canvas, scene, camera, renderer, controls,composer

//size
//const sizes = {width: window.innerWidth,height: window.innerHeight}
const windowsize = 256
const sizes = {width: windowsize,height: windowsize}

//mouse follow
let pointlight1, cursor1_mesh

//animate object
var object_obj = null

//camera
let fov

//widowsize関連補正
let position_ratio = 250

//mouse
const mouse_webGL = new THREE.Vector2()
const mouse_webGL_normal = new THREE.Vector2()
const mouse_window_normal =new THREE.Vector2()

//downlodcount
let dlcount = 0

//loadchange
let index_master = 0
let index_material = 0;

//material
let material_list
/**initialization */

/**
 * Base
 */

// Canvas
canvas = document.querySelector('canvas.webgl')

// Scene
scene = new THREE.Scene()

//camera
fov = 40
camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.01, dist(fov)*10)
camera.position.set(0,0,dist(fov))
scene.add(camera)

/**
 * Renderer
 */
renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 1.0
renderer.shadowMap.enabled = true

renderer.domElement.toDataURL("image/png")
renderer.setAnimationLoop(animate)
/**renderer */

//controlssss
controls = new OrbitControls( camera, canvas)

/**
 * Object
 */
//cursor
cursor1_mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.01,10,10),
    new THREE.MeshBasicMaterial({color:0x000000}))
cursor1_mesh.position.set(0,0,0)
//scene.add(cursor1_mesh)

//material setting
const custom_1 = new THREE.MeshPhysicalMaterial({
    color:0xff0000,thickness:0,flatShading:false, //いろいろ
    metalness:0, roughness:1, //Standard
    emissive : 0x000000, emissiveIntensity :1.0, //発光
    anisotropy:0,attenuationDistance:10000, //異方性 (金属)
    clearcoat:0,clearcoatRoughness:0, //クリアコート
    iridescence:0.0, iridescenceIOR:1.3,iridescenceThicknessRange:[100,400], //虹彩効果
    transmission:0, //透明度 (非金属)
    dispersion:0,ior:1.5,reflectivity:0.5, // 反射率 (非金属)
    sheen:0,sheenRoughness:1,specularIntensity:1, //光沢 (非金属)
})
const metal_0025 = new THREE.MeshPhysicalMaterial({
    color:0xecacac, //いろいろ
    metalness:1, roughness:0.025, //Standard
})
const metal_0129 = new THREE.MeshPhysicalMaterial({
    color:0xecacac, //いろいろ
    metalness:1, roughness:0.129, //Standard
})
const plastic_0075 = new THREE.MeshPhysicalMaterial({
    color:0xa8a8a8, //いろいろ
    metalness:0, roughness:0.075, //Standard
    clearcoat:1.0,clearcoatRoughness:0, //クリアコート
    ior:1.5,reflectivity:0.5, // 屈折率
    specularIntensity:1 //鏡面反射
})
const plastic_0225 = new THREE.MeshPhysicalMaterial({
    color:0xa8a8a8, //いろいろ
    metalness:0, roughness:0.225, //Standard
    clearcoat:1.0,clearcoatRoughness:0, //クリアコート
    ior:1.5,reflectivity:0.5, // 屈折率
    specularIntensity:1 //鏡面反射
})
const default_1 = new THREE.MeshPhysicalMaterial({
    color:0xff0000,thickness:0,flatShading:false, //いろいろ
    metalness:0, roughness:1, //Standard
    emissive : 0x000000, emissiveIntensity :1.0, //発光
    anisotropy:0,attenuationDistance:10000, //異方性 (金属)
    clearcoat:0,clearcoatRoughness:0, //クリアコート
    iridescence:0.0, iridescenceIOR:1.3,iridescenceThicknessRange:[100,400], //虹彩効果
    transmission:0, //透明度 (非金属)
    dispersion:0,ior:1.5,reflectivity:0.5, // 反射率 (非金属)
    sheen:0,sheenRoughness:1,specularIntensity:1 //光沢 (非金属)
})
material_list = [custom_1,metal_0025,metal_0129,plastic_0075,plastic_0225,default_1]
let materialname_list = ['custom_1','metal_0025','metal_0129','plastic_0075','plastic_0225','default_1']

//material_list = [metal_0025,metal_0129,plastic_0075,plastic_0225]
//let materialname_list = ['cu_0.025','cu_0.129','pla_0.075','pla_0.225']


/**
 * GUI
 */
const params = {
    color:0xff0000,thickness:0,flatShading:false, //いろいろ
    metalness:0, roughness:1, //Standard
    emissive : 0x000000, emissiveIntensity :1.0, //発光
    anisotropy:0,attenuationDistance:10000, //異方性 (金属)
    clearcoat:0,clearcoatRoughness:0, //クリアコート
    iridescence:0.0, iridescenceIOR:1.3,iridescenceThicknessRange:[100,400], //虹彩効果
    transmission:0, //透明度 (非金属)
    dispersion:false,ior:1.5,reflectivity:0.5, // 反射率 (非金属)
    sheen:0,sheenRoughness:1,specularIntensity:1, //光沢 (非金属)
    exposure:1,
}
const gui = new GUI()
gui.addColor( params, 'color' )
.onChange( () =>{
    custom_1.color.set( params.color )
})
gui.add( params, 'metalness',0,1,0.1)
.onChange( () =>{
    custom_1.metalness = params.metalness
})
gui.add( params, 'roughness',0,1,0.1)
.onChange( () =>{
    custom_1.roughness = params.roughness
})
gui.add( params, 'anisotropy',0,1,0.1)
.onChange(()=>{
    custom_1.anisotropy = params.anisotropy
})
gui.add( params, 'attenuationDistance',0,10000,10)
.onChange(()=>{
    custom_1.attenuationDistance = params.attenuationDistance
})
gui.add( params, 'emissiveIntensity',0,1,0.1)
.onChange( () =>{
    custom_1.emissiveIntensity = params.emissiveIntensity
})
gui.add( params, 'clearcoat',0,1,0.1)
.onChange( () =>{
    custom_1.clearcoat = params.clearcoat
})
gui.add( params, 'clearcoatRoughness',0,1,0.1)
.onChange( () =>{
    custom_1.clearcoatRoughness = params.clearcoatRoughness
})

gui.add( params, 'dispersion' )
.onChange( () =>{
    if (params.dispersion){
        custom_1.dispersion = 1
    }else{
        custom_1.dispersion = 0
    }
})

gui.add( params, 'ior',1,2.3,0.1 )
.onChange( () =>{
    custom_1.ior = params.ior
})
gui.add( params, 'reflectivity',0,1,0.1)
.onChange( () =>{
    custom_1.reflectivity = params.reflectivity
})
gui.add( params, 'sheen',0,1,0.1)
.onChange( () =>{
    custom_1.sheen = params.sheen
})
gui.add( params, 'sheenRoughness',0,1,0.1)
.onChange( () =>{
    custom_1.sheenRoughness = params.sheenRoughness
})
gui.add( params, 'specularIntensity',0,1,0.1)
.onChange( () =>{
    custom_1.specularIntensity = params.specularIntensity
})
const toneMappingFolder = gui.addFolder( 'tone mapping' );
toneMappingFolder.add( params, 'exposure', 0.1, 10 ).onChange( (val)=>{
    reinhardTMPass.uniforms.exposure.value = val
})
/**GUI */

/**
 * models
 */

//obj loader
const objLoader = new OBJLoader()
objLoader.load(
    "./models/normal/bunny.obj",
    (obj) =>{
        object_obj = obj.children[0] //children[0]はいらないときもあるので要確認

        const coe = 0.34
        object_obj.scale.set(coe,coe,coe)
        object_obj.position.set(0,0.05,0)
        init_material(index_material)
        object_obj.castShadow = true
        scene.add(object_obj)
        console.log(object_obj)
    },(xhr)=>{
        console.log((xhr.loaded/xhr.total*100)+'% loaded')
    },(error)=>{
        console.log('An error happened',error)
    }
)
/**Model */

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

//点光源
pointlight1 = new THREE.PointLight(0xffffff,10,0,1)
pointlight1.position.set(0,0,0)
pointlight1.castShadow = true
//scene.add(pointlight1)
/**Background and Lighting */

/**
 * Additional
 */
const newParagraph = document.createElement('p');
const textNode = document.createTextNode('hdr_name');
newParagraph.appendChild(textNode);
newParagraph.setAttribute('id', 'hdr_name');
document.body.appendChild(newParagraph);

const matParagraph = document.createElement('p');
const mattextNode = document.createTextNode('mat_name');
matParagraph.appendChild(mattextNode);
matParagraph.setAttribute('id', 'mat_name');
document.body.appendChild(matParagraph);
/**Additional */
/**Base */

/**
 * Post processing
 */
//grayScale
const grayScaleShader = {
    uniforms: {
        "tDiffuse": { value: null }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
            gl_FragColor = vec4(vec3(gray), color.a);
        }
    `
};
//ReinhardTMS
const reinhardToneMappingShader = {
    uniforms: {
        tDiffuse: { value: null },
        exposure: { value: 1.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float exposure;
        varying vec2 vUv;
        vec3 reinhardTonemap(vec3 color) {
            return color / (color + vec3(1.0));
        }

        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            color.rgb *= exposure;
            color.rgb = reinhardTonemap(color.rgb);
            gl_FragColor = color;
        }
    `
};
// Applying the shader as a post-processing effect
const renderPass = new RenderPass(scene, camera)
const GrayScalePass = new ShaderPass(grayScaleShader)
const reinhardTMPass = new ShaderPass(reinhardToneMappingShader)
//effectGrayScale.renderToScreen = true;

composer = new EffectComposer(renderer)
composer.addPass(renderPass)
composer.addPass(GrayScalePass) 
composer.addPass(reinhardTMPass)


/**Post processing*/

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
    
    const myElement = document.getElementById('hdr_name');
    myElement.textContent = hdr_url[index];
}

//material load
function init_material(index){
    object_obj.material = material_list[index]

    const myElement = document.getElementById('mat_name');
    myElement.textContent = materialname_list[index];
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
    //sizes.width = window.innerWidth
    //sizes.height = window.innerHeight
    sizes.width = windowsize
    sizes.height = windowsize

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
    //composer.render()

    //second
    const sec = performance.now()/1000
}
/**Function */


/**
 * eventlister
 */

//resize
window.addEventListener('resize', onWindowResize)

//fullscreen
window.addEventListener("dblclick",WindowFullscreen)

//number key to camera 1 to 6
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

//donwload push P
document.addEventListener("keydown",(e) =>{
    if(e.keyCode == 80) {
        var imgData, imgNode;
        //Listen to 'P' key
        if(e.which !== 80) return;
        try {
            renderer.render(scene, camera)

            composer.render()
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

//alldownload push L
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve,ms))
}

async function loopwithdelay(){
    var imgData_2;
    let i,j
    const alldownloadlink = document.getElementById("alldownload");
    //hdr change
    for (i=0; i < hdr_images_path.length; i++){
        init_master(i)
        //material change
        for (j=0; j < material_list.length; j++){
            init_material(j);
            renderer.render(scene, camera)
            composer.render()
            //download

            imgData_2 = renderer.domElement.toDataURL();
            alldownloadlink.href = imgData_2;
            let hdr_path = hdr_images_path[i].replace(".hdr","")
            alldownloadlink.download = "bunny_" + materialname_list[j] + "_" + hdr_path + ".png"
            alldownloadlink.click();
            await sleep(100);
            console.log("downloaded hdr : " + hdr_path + "  material : " + materialname_list[j])
        }
    }
    init_master(index_master);
    init_material(index_material);
}

document.addEventListener("keydown",(e=>{
    if(e.keyCode == 76){
        loopwithdelay();
    }
}))

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
})
/**eventlistner */