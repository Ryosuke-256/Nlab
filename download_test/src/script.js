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
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';


/**
 * initializing
 */
//imagefiles
const base_path = 'image\\'

/**
const hdr_images_path = [
    '5.hdr','125.hdr',
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
//camera distance
function dist (fov) {
    const fovRad= (fov/2)*(Math.PI/180)
    const dist = ((sizes.height/position_ratio)/2)/Math.tan(fovRad)
    return dist
}
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
    metalness:0, roughness:0, //Standard
    clearcoat:1.0,clearcoatRoughness:0.075, //クリアコート
    ior:1.5,reflectivity:0.5, // 屈折率
    specularIntensity:0 //鏡面反射
})
const plastic_0225 = new THREE.MeshPhysicalMaterial({
    color:0xa8a8a8, //いろいろ
    metalness:0, roughness:0, //Standard
    clearcoat:1.0,clearcoatRoughness:0.225, //クリアコート
    ior:1.5,reflectivity:0.5, // 屈折率
    specularIntensity:0 //鏡面反射
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
//material_list = [custom_1,metal_0025,metal_0129,plastic_0075,plastic_0225,default_1]
//let materialname_list = ['custom_1','metal_0025','metal_0129','plastic_0075','plastic_0225','default_1']

material_list = [metal_0025,metal_0129,plastic_0075,plastic_0225]
let materialname_list = ['cu_0.025','cu_0.129','pla_0.075','pla_0.225']


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
/**
 * 最適load
//HDRloadmanager
const loadingManager = new THREE.LoadingManager(()=>{
    console.log("Finished loading");
    init_master(index_master)
},(itemUrl,itemsLoaded,itemsTotal)=>{
    console.log("Files loaded:" + itemsLoaded + "/" + itemsTotal)
})
//loadeverything
const loader1 = new RGBELoader(loadingManager)

async function hdrloader(){
    hdr_images_path.forEach(element => {
        const imagepath = base_path + element
        loader1.load(
            imagepath,
            (texture)=>{
                hdr_files.push(texture)
                hdr_url.push(element)
            }
        )
    })
}
*/

/** 順番通りload */
async function hdrloader() {
    //HDRloadmanager
    const loadingManager = new THREE.LoadingManager(()=>{
        console.log("Finished loading")
        init_master(index_master)
    },(itemUrl,itemsLoaded,itemsTotal)=>{
        console.log("Files loaded:" + itemsLoaded + "/" + hdr_images_path.length)
    })
    const loader1 = new RGBELoader(loadingManager)

    for (let i = 0; i < hdr_images_path.length; i++) {
        const element = hdr_images_path[i]
        const imagepath = base_path + element

        await new Promise((resolve, reject) => {
            loader1.load(
                imagepath,
                (texture) => {
                    hdr_files.push(texture)
                    hdr_url.push(element)
                    resolve()
                },
                undefined,
                (err) => reject(err)
            )
        })
    }
}

hdrloader()

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
//Tonemapping
const ReinhardTMO = {
    uniforms: {
        tDiffuse: { value: null },
        pWhite: { value: 10.0 }
    },
    vertexShader : `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
    fragmentShader : `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform float pWhite;

    vec3 rgbToxyY(vec3 rgb) {
        float sR = rgb.r;
        float sG = rgb.g;
        float sB = rgb.b;

        //sRGB To RGB
        float R = (sR > 0.04045) ? pow((sR + 0.055) / 1.055, 2.4) : (sR / 12.92);
        float G = (sG > 0.04045) ? pow((sG + 0.055) / 1.055, 2.4) : (sG / 12.92);
        float B = (sB > 0.04045) ? pow((sB + 0.055) / 1.055, 2.4) : (sB / 12.92);

        //RGB To XYZ
        float X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
        float Y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750;
        float Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041;

        //XYZ To xyY
        float sum = X + Y + Z;
        float x = X / sum;
        float y = Y / sum;

        return vec3(x, y, Y);
    }

    vec3 xyYToRgb(vec3 xyY) {
        float x = xyY.x;
        float y = xyY.y;
        float Y = xyY.z;

        //xyY To XYZ
        float X = Y / y * x;
        float Z = Y / y * (1.0 - x - y);

        //XYZ To RGB
        float R = X *  3.2404542 + Y * -1.5371385 + Z * -0.4985314;
        float G = X * -0.9692660 + Y *  1.8760108 + Z *  0.0415560;
        float B = X *  0.0556434 + Y * -0.2040259 + Z *  1.0572252;

        //RGB to sRGB
        float sR = (R > 0.0031308) ? 1.055 * pow(R, (1.0 / 2.4)) - 0.055 : 12.92 * R;
        float sG = (G > 0.0031308) ? 1.055 * pow(G, (1.0 / 2.4)) - 0.055 : 12.92 * G;
        float sB = (B > 0.0031308) ? 1.055 * pow(B, (1.0 / 2.4)) - 0.055 : 12.92 * B;

        return vec3(sR, sG, sB);
    }

    float reinhardTonemap(float L,float pWhite) {
        float Lscaled =  L / 1.19;
        float Ld = (Lscaled * (1.0 + Lscaled / pow(pWhite,2.0))) / (1.0 + Lscaled);
        return Ld;
    }

    void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        vec3 xyYColor = rgbToxyY(color.rgb);

        // Reinhard tone mapping
        xyYColor.z = reinhardTonemap(xyYColor.z, pWhite);

        // Make xy achromatic
        xyYColor.x = 0.3127; // D65 white point
        xyYColor.y = 0.3290; // D65 white point

        vec3 rgbColor = xyYToRgb(xyYColor);

        gl_FragColor = vec4(rgbColor, color.a);
    }`
}

// Applying the shader as a post-processing effect
const renderPass = new RenderPass(scene, camera)
const ReinhardTMOPass = new ShaderPass(ReinhardTMO)
//Output
const outputPass = new OutputPass()
//effectGrayScale.renderToScreen = true;

composer = new EffectComposer(renderer)
composer.addPass(renderPass)
composer.addPass(ReinhardTMOPass)
composer.addPass(outputPass)
/**Post processing*/

/**
 * Function
 */
//material load
function init_material(index){
    object_obj.material = material_list[index]

    const myElement = document.getElementById('mat_name');
    myElement.textContent = materialname_list[index];
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
    //renderer.render(scene, camera)
    composer.render()

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
        for (j=0; j < 1; j++){
            init_material(j);
            //renderer.render(scene, camera)
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