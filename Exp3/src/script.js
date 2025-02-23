import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import ThreeMeshUI from 'three-mesh-ui';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'

/**
 * Setteing
 */
// slider valocity
const slider_vel = 0.25
//camera distance
const distance = 3
//round limit
const roundnum = 5
//model startq
const modelstart = 1

/** Setting */

/**
 * initializing
 */
//name input 
let experiment_name = prompt("名前を入力してください:");
console.log("入力された名前は: " + experiment_name)
let namenum = 0
for (let i=0;i<experiment_name.length; i++){
    namenum += experiment_name.charCodeAt(i);
}

let Material_num = prompt("何回目ですか？:")
while(Material_num < 1 || Material_num > 4){
    Material_num = prompt("1-4の範囲で入力してください")
}

console.log("name number : "+namenum);
let changenseedlist = [0,0,0,0,0,0]
for (let i = changenseedlist.length - 1 ; i >=0; i--){
    namenum = Math.floor(seededRandom(1,24*100,namenum))
    changenseedlist[i] = namenum
}

let materialname_list = ['cu0025','cu0129','pla0075','pla0225']
for (let i = materialname_list.length-1 ; i >=0; i--){
    let changenum = changenseedlist[i] % 4;
    console.log("/nchangenum : "+changenum)
    let tmpStorage = materialname_list[i]
    materialname_list[i] = materialname_list[changenum]
    materialname_list[changenum] = tmpStorage
}

console.log("chang list : " + changenseedlist)
console.log(materialname_list)


function createseededRandom(seed) { 
    return function() {
        seed = (seed * 9301 + 49297) % 233280
        return seed / 233280
    }
}

function seededRandom(min,max,seed){
    const randomFunc = createseededRandom(seed); 
    return Math.floor(randomFunc() * (max - min + 1)) + min;
}


console.log("今回のMaterialは：" + materialname_list[Material_num - 1])

//imagefiles
const base_path = 'image\\'

/**
const hdr_images_path = [
    '19.hdr','39.hdr','78.hdr',
]
*/


const hdr_images_path = [
    '5.hdr','19.hdr','34.hdr','39.hdr','42.hdr',
    '43.hdr','78.hdr','80.hdr','102.hdr','105.hdr',
    '125.hdr','152.hdr','164.hdr','183.hdr','198.hdr',
    '201.hdr','202.hdr','203.hdr','209.hdr','222.hdr',
    '226.hdr','227.hdr','230.hdr','232.hdr','243.hdr',
    '259.hdr','272.hdr','278.hdr','281.hdr','282.hdr'
]


/**
const hdr_images_path = [
    '19.hdr','39.hdr','78.hdr','80.hdr','102.hdr',
    '125.hdr','152.hdr','203.hdr','226.hdr','227.hdr',
    '230.hdr','232.hdr','243.hdr','278.hdr','281.hdr'
]
*/

//modelfiles
const model_base_path = 'models/normal\\'
const model_path = [
    'sphere.obj',
    'bunny.obj',
    'dragon.obj',
    'boardA.obj',
    'boardB.obj',
    'boardC.obj',
]

//base
let canvas, scene, camera, renderer, controls,composer

//size
let sizes = {width: window.innerWidth,height: window.innerHeight}

//widowsize関連補正
let position_ratio = 250

//mouse
const mouse_webGL = new THREE.Vector2()
const mouse_webGL_normal = new THREE.Vector2()
const mouse_window = new THREE.Vector2()
const mouse_window_normal = new THREE.Vector2()
const mouse_pl = new THREE.Vector2(0,0)

//loadchange
let index_master = 0
let index_material = 0
let index_model = 0

// Canvas
canvas = document.querySelector('canvas.webgl')

// Scene
scene = new THREE.Scene()

//camera
let fov = 40
camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.01, dist(fov)*10)
//camera.position.set(10000,0,dist(fov))
const cameraGroup = new THREE.Group()
cameraGroup.add(camera)
cameraGroup.position.set(0,-1.5,distance)
scene.add(cameraGroup)
//camera distance
function dist (fov) {
    const fovRad= (fov/2)*(Math.PI/180)
    const dist = ((sizes.height/position_ratio)/2)/Math.tan(fovRad)
    return dist
}
/**initialization */

/**
 * Renderer
 */
renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
//renderer = new THREE.WebGLRenderer()
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding
renderer.shadowMap.enabled = true
renderer.toneMapping = THREE.CustomToneMapping
renderer.toneMappingExposure = 1.0

//VR
renderer.xr.enabled = true
document.body.appendChild( VRButton.createButton( renderer ))

renderer.domElement.toDataURL("image/png")
renderer.setAnimationLoop(animate)
/**renderer */

/**
 * ToneMap
 */
THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(
    'vec3 CustomToneMapping( vec3 color ) { return color; }',
    `
    vec3 CustomToneMapping( vec3 color ) {
        float sR = color.r;
        float sG = color.g;
        float sB = color.b;

        // sRGB To RGB
        float R = (sR > 0.04045) ? pow((sR + 0.055) / 1.055, 2.4) : (sR / 12.92);
        float G = (sG > 0.04045) ? pow((sG + 0.055) / 1.055, 2.4) : (sG / 12.92);
        float B = (sB > 0.04045) ? pow((sB + 0.055) / 1.055, 2.4) : (sB / 12.92);

        // RGB To XYZ
        float X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
        float Y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750;
        float Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041;

        // Reinhard tone mapping
        float pwhite = 10.0;
        float Lscaled = Y / 1.19;
        Y = (Lscaled * (1.0 + Lscaled / pow(pwhite, 2.0))) / (1.0 + Lscaled);

        // Make xy achromatic (D65 white point)
        float x = 0.3127;
        float y = 0.3290;

        // xyY To XYZ
        X = Y / y * x;
        Z = Y / y * (1.0 - x - y);

        // XYZ To RGB
        R = X *  3.2404542 + Y * -1.5371385 + Z * -0.4985314;
        G = X * -0.9692660 + Y *  1.8760108 + Z *  0.0415560;
        B = X *  0.0556434 + Y * -0.2040259 + Z *  1.0572252;

        // RGB to sRGB
        sR = (R > 0.0031308) ? 1.055 * pow(R, (1.0 / 2.4)) - 0.055 : 12.92 * R;
        sG = (G > 0.0031308) ? 1.055 * pow(G, (1.0 / 2.4)) - 0.055 : 12.92 * G;
        sB = (B > 0.0031308) ? 1.055 * pow(B, (1.0 / 2.4)) - 0.055 : 12.92 * B;

        vec3 tmocolor = vec3(sR, sG, sB);
        return saturate(tmocolor);
    }`
);
/** ToneMap */

//controlssss
controls = new OrbitControls( camera, canvas)

/**
 * Object
 */
//cursor
let cursor1_mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.01,10,10),
    new THREE.MeshBasicMaterial({color:0x000000}))
cursor1_mesh.position.set(0,0,0)
//scene.add(cursor1_mesh)

//material setting
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

let material_list = [metal_0025,metal_0129,plastic_0075,plastic_0225]
for (let i = material_list.length-1 ; i >= 0; i--){
    let changenum = changenseedlist[i]%4;
    //console.log("changenum : "+changenum)
    let tmpStorage = material_list[i]
    material_list[i] = material_list[changenum]
    material_list[changenum] = tmpStorage
}
//console.log(material_list)

let ThisMat = material_list[Material_num - 1]
let ThisMatName = materialname_list[Material_num - 1]

/**
 * Loading
 */
//model loading
let object_obj = null
const model_files = []
let model_url = []
async function modelload(){
    return new Promise((resolve)=>{
        //Modelloadmanager
        const ModelloadingManager = new THREE.LoadingManager(()=>{
            console.log("Finished Model loading")
            //Shuffle model
            //console.log(model_url)
            for (let i = model_url.length-1; i>=0; i--){
                let changenum = (changenseedlist[i] + Material_num) % model_url.length;
                let tmpStorage1 = model_url[i]
                model_url[i] = model_url[changenum]
                model_url[changenum] = tmpStorage1
                let tmpStorage2 = model_files[i]
                model_files[i] = model_files[changenum]
                model_files[changenum] = tmpStorage2
            }
            console.log(model_url)
            resolve()
        },(itemUrl,itemsLoaded,itemsTotal)=>{
            console.log("Model loaded:" + itemsLoaded + "/" + model_path.length)
        })
        //loadeverything
        const model_loader = new OBJLoader(ModelloadingManager)
        
        modelloader(model_loader)
    })
}
async function modelloader(loader){
    for (let i = 0; i < model_path.length; i++) {
        const element = model_path[i]
        const modelpath = model_base_path + element
    
        await new Promise((resolve, reject) => {
            loader.load(
                modelpath,
                (obj) => {
                    model_files.push(obj.children[0])
                    model_url.push(element)
                    resolve()
                },(xhr)=>{

                },
                (err) => reject(err)
            )
        })
    }
}
//hdr loading
const hdr_files = []
let hdr_url = []
async function hdrload(){
    return new Promise((resolve)=>{
        //HDRloadmanager
        const loadingManager = new THREE.LoadingManager(()=>{
            console.log("Finished HDR loading");
            //init_HDR(index_master)
            resolve()
        },(itemUrl,itemsLoaded,itemsTotal)=>{
            console.log("HDR loaded:" + itemsLoaded + "/" + hdr_images_path.length)
        })
        //loadeverything
        const loader1 = new RGBELoader(loadingManager)
        
        hdrloader(loader1)
    })
}
async function hdrloader(loader){
    for (let i = 0; i < hdr_images_path.length; i++) {
        const element = hdr_images_path[i]
        const imagepath = base_path + element
    
        await new Promise((resolve, reject) => {
            loader.load(
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
// DataMaking
let stimulsData = []
async function Data_make(){
    return new Promise((resolve)=>{
        for (let i = 0; i < hdr_url.length; i++){
            const hdr_name = hdr_url[i]
            let onedata = new OneData(i,hdr_name)
            stimulsData.push(onedata)
        }
        resolve()
    })
}
function OneData(id,hdr){
    this.id = id
    this.score = 0
    this.totalscore = 0
    this.hdr = hdr
    this.T_times = 0
}
//init_HDR
function init_HDR(index){
    hdr_files[index].encoding = THREE.RGBEEncoding
    hdr_files[index].mapping = THREE.EquirectangularReflectionMapping
    scene.background = hdr_files[index]
    scene.environment = hdr_files[index]
}
//material load
function init_material(index){
    object_obj.material = material_list[index]
    object_obj.material.needsUpdate = true
}
//model load
function init_model(index){
    if(object_obj != null){
        scene.remove(object_obj)
    }
    object_obj = model_files[index]
    const coe = 0.34
    object_obj.scale.set(coe,coe,coe)
    object_obj.position.set(0,0,0)
    init_material(index_material)
    object_obj.castShadow = true
    scene.add(object_obj)
}
/** Loading */

/**
 * geometry
 */
/** geometry */

/**
 * Lighting
 */
//点光源
let pointlight1 = new THREE.PointLight(0xffffff,10,0,1)
pointlight1.position.set(0,0,0)
pointlight1.castShadow = true
//scene.add(pointlight1)
/**Lighting */

/**
 * additional
 */
document.addEventListener('pointerlockchange',()=>{
    if(document.pointerLockElement == document.body){
        console.log("pointer locked")
    } else {
        console.log("pointer unlocked")
    }
})
document.addEventListener('keydown',(e)=>{
    if (e.keyCode == 27){
        document.exitPointerLock()
    }
})
/** additional */

/** 
 * Loading Panel
 */
let loadpanel
function LoadPanel(){
    //container
    loadpanel = new ThreeMeshUI.Block({
        height:sizes.height*1/position_ratio,width:sizes.width*1/position_ratio,margin:0.1,
        fontFamily: './assets/Roboto-msdf.json',
        fontTexture: './assets/Roboto-msdf.png',
    })
    //text block
    const textBlock = new ThreeMeshUI.Block({
        height:sizes.height*0.9/position_ratio,width:sizes.width*0.9/position_ratio,margin:0.04,offset:0.03,
        textAlign:'center',
        justifyContent:'center',
    })
    const text = new ThreeMeshUI.Text({
        content:'Now Loading',
        fontColor:new THREE.Color(0xffffff),
        fontSize:0.2,
        backgroundOpacity: 0.0,
        offset:0.01
    })
    textBlock.add(text)
    loadpanel.add(textBlock)
    loadpanel.position.set(0,-cameraGroup.position.y,-distance)
    scene.add(loadpanel)
}
/** Loading Panel */

/**
 * Slider Panel
 */
//initialization
let container
let sliderValue = 0.5
let slider,handle,resultbar
//Sliderpanel
function SliderPanel1(){
    //container
    container = new ThreeMeshUI.Block({
        height:0.3,width:1.3,margin:0.1,
        fontFamily: './assets/Roboto-msdf.json',
        fontTexture: './assets/Roboto-msdf.png',
    })
    //text block
    const textBlock = new ThreeMeshUI.Block({
        height:0.12,width:0.95,margin:0,offset:0.03,
        textAlign:'center',
        justifyContent:'center',
    })
    const text = new ThreeMeshUI.Text({
        content:'Adjust slider & Left click',
        fontColor:new THREE.Color(0xffffff),
        fontSize:0.075,
        backgroundOpacity: 0.0,
        offset:0.01
    })
    //slider
    slider = new ThreeMeshUI.Block({
        height:0.025,width:1,offset:0.02,margin:0.06,
        backgroundColor: new THREE.Color(0x999999),
        justifyContent:'center',
    });
    handle = new ThreeMeshUI.Block({
        height:0.07,width:0.015,offset:0.01,
        backgroundColor: new THREE.Color(0xffffff),
        backgroundOpacity: 1
    });
    slider.add(handle)
    container.add(slider)
    textBlock.add(text)
    container.add(textBlock)
    container.position.set(0,-0.45,-1)
    container.rotation.set(-Math.PI/12,0,0)
    container.scale.set(0.75,0.75,0.75)
    //camera.add(container)
}
function updateSlider(){
    handle.position.x = (sliderValue - 0.5) * slider.getWidth()
    //console.log(handle.position.x)
}
function updateValue(){
    sliderValue = handle.position.x / slider.getWidth() + 0.5
}
/**Slider Panel */

/**
 *  Finish Panel
 */
//initialization
let container2
//panel making
function FinishPanel1(){
    //container
    container2 = new ThreeMeshUI.Block({
        height:sizes.height*1/position_ratio,width:sizes.width*1/position_ratio,margin:0.1,
        fontFamily: './assets/Roboto-msdf.json',
        fontTexture: './assets/Roboto-msdf.png',
    })
    //text block
    const textBlock = new ThreeMeshUI.Block({
        height:sizes.height*0.9/position_ratio,width:sizes.width*0.9/position_ratio,margin:0.04,offset:0.03,
        textAlign:'center',
        justifyContent:'center',
    })
    const text = new ThreeMeshUI.Text({
        content:'Thank you!!',
        fontColor:new THREE.Color(0xffffff),
        fontSize:0.2,
        backgroundOpacity: 0.0,
        offset:0.01
    })
    textBlock.add(text)
    container2.add(textBlock)
    scene.add(container2)
}
/** Finish Panel */

/** 
 * VR Button Pnale
 */
//initialization
let vrPanel
//panel making
async function VRPanel(){
    return new Promise((resolve)=>{
        console.log("vrpanel start")
        //container
        vrPanel = new ThreeMeshUI.Block({
            height:sizes.height*1/position_ratio,width:sizes.width*1/position_ratio,margin:0.1,
            fontFamily: './assets/Roboto-msdf.json',
            fontTexture: './assets/Roboto-msdf.png',
        })
        //text block
        const textBlock = new ThreeMeshUI.Block({
            height:sizes.height*0.9/position_ratio,width:sizes.width*0.9/position_ratio,margin:0.04,offset:0.03,
            textAlign:'center',
            justifyContent:'center',
        })
        const text = new ThreeMeshUI.Text({
            content:'Press [Enter VR] button',
            fontColor:new THREE.Color(0xffffff),
            fontSize:0.2,
            backgroundOpacity: 0.0,
            offset:0.01
        })
        textBlock.add(text)
        vrPanel.add(textBlock)
        scene.add(vrPanel)
        vrPanel.position.set(0,-cameraGroup.position.y,-distance)
        renderer.xr.addEventListener('sessionstart',()=>{
            scene.remove(vrPanel)
            document.body.requestPointerLock()
            resolve()
        })
    })
}
/** VR Button */

/**
 * Test Intro Panel
 */
//initialization
let startpanel
//panel making
async function StartPanel(){
    return new Promise((resolve)=>{
        //container
        startpanel = new ThreeMeshUI.Block({
            height:sizes.height*0.8/position_ratio,width:sizes.width*0.8/position_ratio,margin:0.1,
            fontFamily: './assets/Roboto-msdf.json',
            fontTexture: './assets/Roboto-msdf.png',
        })
        //text block
        const textBlock = new ThreeMeshUI.Block({
            height:sizes.height*0.75/position_ratio,width:sizes.width*0.75/position_ratio,margin:0.04,offset:0.03,
            textAlign:'center',
            justifyContent:'center',
        })
        const text = new ThreeMeshUI.Text({
            content:'Right Click \n To Test Session',
            fontColor:new THREE.Color(0xffffff),
            fontSize:0.2,
            backgroundOpacity: 0.0,
            offset:0.01
        })
        textBlock.add(text)
        startpanel.add(textBlock)
        scene.add(startpanel)
        window.addEventListener("mousedown",(e)=>{
            if(e.button == 2){
                scene.remove(startpanel)
                resolve()
            }
        })
        startpanel.position.set(0,0,1)
    })
}
/** Test Intro Panel */

/**
 * Test Session Panel
 */
let testpanel1
function TestPanel1(){
    //container
    testpanel1 = new ThreeMeshUI.Block({
        height:0.3,width:1.3,margin:0.1,
        fontFamily: './assets/Roboto-msdf.json',
        fontTexture: './assets/Roboto-msdf.png',
    })
    //text block
    const textBlock = new ThreeMeshUI.Block({
        height:0.12,width:1.05,margin:0.04,offset:0.03,
        textAlign:'center',
        justifyContent:'center',
    })
    const text1 = new ThreeMeshUI.Text({
        content:'This is Test Session',
        fontColor:new THREE.Color(0xffffff),
        fontSize:0.1,
        backgroundOpacity: 0.0,
        offset:0.01
    })
    textBlock.add(text1)
    testpanel1.add(textBlock)
    testpanel1.position.set(0,-0.75,0)
}
let testpanel2
function TestPanel2(){
    //container
    testpanel2 = new ThreeMeshUI.Block({
        height:0.5,width:2.0,margin:0.1,
        fontFamily: './assets/Roboto-msdf.json',
        fontTexture: './assets/Roboto-msdf.png',
    })
    //text block
    const textBlock = new ThreeMeshUI.Block({
        height:0.4,width:1.5,margin:0.04,offset:0.03,
        textAlign:'center',
        justifyContent:'center',
    })
    const text1 = new ThreeMeshUI.Text({
        content:'Right Click to finish test',
        fontColor:new THREE.Color(0xffffff),
        fontSize:0.2,
        backgroundOpacity: 0.0,
        offset:0.01
    })
    textBlock.add(text1)
    testpanel2.add(textBlock)
    testpanel2.position.set(0,-0.75,0)
}
//activate
TestPanel1()
TestPanel2()
/** Test SessionPanel */

/**
 * Exp Start panel
 */
let exppanel
async function ExpPanel(model_num){
    return new Promise((resolve)=>{
        //container
        exppanel = new ThreeMeshUI.Block({
            height:sizes.height*0.8/position_ratio,width:sizes.width*0.8/position_ratio,margin:0.1,
            fontFamily: './assets/Roboto-msdf.json',
            fontTexture: './assets/Roboto-msdf.png',
        })
        //text block
        const textBlock = new ThreeMeshUI.Block({
            height:sizes.height*0.75/position_ratio,width:sizes.width*0.75/position_ratio,margin:0.04,offset:0.05,
            textAlign:'center',
            justifyContent:'center',
        })
        const text = new ThreeMeshUI.Text({
            content:'Right Click \n To Exp ' + model_num +'/'+ model_files.length,
            fontColor:new THREE.Color(0xffffff),
            fontSize:0.2,
            backgroundOpacity: 0.0,
            offset:0.01
        })
        textBlock.add(text)
        exppanel.add(textBlock)
        exppanel.position.set(0,0,1)
        scene.add(exppanel)
        window.addEventListener("mousedown",(e)=>{
            if(e.button == 2){
                scene.remove(exppanel)
                resolve()
            }
        })
    })
}
/** Exp panel */

/**
 * trial
 */
//sleep
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve,ms))
}
//preload
async function Preload(){
    init_model(0)
    init_material(Material_num-1)
    for (let i = 0; i < hdr_files.length;i++){
        init_HDR(i)
        await sleep(30)
    }
    scene.remove(object_obj)
}

//test trial
var testcontinue = true
let mousex1 = 0
let mousex2 = 0
let testcount = 0
async function TestSession(){
    testcontinue = true
    testcount = 0
    while(testcontinue){ 
        if(testcount < hdr_files.length){
            scene.add(testpanel1)
        }else{
            scene.add(testpanel2)
        }
        init_HDR(stimulsData[testcount % hdr_files.length].id)
        await TestTrial()
        testcount += 1
        scene.remove(testpanel1)
        scene.remove(testpanel2)
    }
}
async function TestTrial(){
    return new Promise((resolve)=>{
        mousex1 = mouse_pl.x + (Math.random() - 0.5)*3
        trialloop()
        function TrialFunction(e){
            if(e.button == 0){
                updateValue()
                console.log(sliderValue)
                sliderValue = 0.5
                updateSlider()
                document.removeEventListener("mousedown",TrialFunction)
                resolve()
            }
            if(e.button == 2 && testcount >= hdr_files.length){
                testcontinue = false
                document.removeEventListener("mousedown",TrialFunction)
                resolve()
            }
        }
        document.addEventListener("mousedown",TrialFunction)
    })
}

//main trial
async function OneSession(){
    let totalResults = [
        ['Name','Result_Av','T_times','TIME(SEC)'],
    ]
    //slider activate
    SliderPanel1()
    for (let session = modelstart-1; session < model_files.length;session++){
        let ReportTable= [
            hdr_images_path
        ]
        init_model(session)
        init_material(Material_num-1)
        camera.remove(container)
        await StartPanel()
        camera.add(container)
        await TestSession()
        await sleep(100)
        camera.remove(container)
        await ExpPanel(session+1)
        camera.add(container)
        let resulttable
        for (let round = 0;round < roundnum;round++){
            console.log("round" + round + "start")
            resulttable = Array(roundnum).fill().map(() => Array(stimulsData.length).fill(0))
            stimulsData.sort(() => Math.random() - 0.5)
            for (let trial = 0;trial < stimulsData.length;trial++){
                init_HDR(stimulsData[trial].id)
                await OneTrial()
                stimulsData[trial].score = resultbar
                stimulsData[trial].totalscore = stimulsData[trial].totalscore + resultbar
                resulttable[round][stimulsData[trial].id] = resultbar
                await sleep(50)
            }
            stimulsData.sort((a, b) => a.id - b.id)
            let reporcontents = stimulsData.map(field => field.score)
            console.log(reporcontents)
            ReportTable.push(reporcontents)
        }
        //let ReportTable = HeaderTable.concat(resulttable)
        let modelname = model_url[session].replace(/\.obj/g,"")
        let xlsxname = experiment_name + "_" + ThisMatName + "_" + modelname + ".csv"
        exportToCsv(xlsxname, ReportTable)
    }
    //finalization
    console.log("Exp Finished")
    scene.background=new THREE.Color(0x333333)
    scene.remove(container)
    scene.remove(object_obj)
    FinishPanel1()
}
async function OneTrial(){
    return new Promise((resolve)=>{
        mousex1 = mouse_pl.x + (Math.random() - 0.5)*3
        trialloop()
        document.addEventListener("mousedown",TrialFunction)
        function TrialFunction(e){
            if(e.button == 0){
                updateValue()
                console.log(sliderValue)
                resultbar = sliderValue
                document.removeEventListener("mousedown",TrialFunction)
                resolve()
            }
        }
    })
}
function trialloop(){
    mousex2 = mouse_pl.x

    handle.position.x = ( mousex2 - mousex1 ) * slider_vel
    handle.position.x = Math.max(-slider.getWidth()/2,Math.min(slider.getWidth()/2,handle.position.x))

    renderer.xr.getSession().requestAnimationFrame(trialloop)
}

//Exp Flow
async function mainload(){
    LoadPanel()
    await modelload()
    await hdrload()
    await Data_make()
    await Preload()
    scene.remove(loadpanel)
    await VRPanel()
    OneSession()
}
mainload()
/**trial */

/**
 * Write Out
 */
//総合成績表
function writeTotalResult(){
    let nowTime = new Date().getTime()
    // 書き出し項目
    let totalResult = []
    totalResults.push(totalResult)
    exportToCsv("test", totalResults)
}
//csv出力
function exportToCsv(filename, rows) {
    //CSVの各行を処理する
    var processRow = function (row) {
        var finalVal = ''
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString()
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString()
            }
            var result = innerValue.replace(/"/g, '""')
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"'
            if (j > 0)
                finalVal += ','
            finalVal += result
        }
        return finalVal + '\n'
    };
    //CSVファイル全体を生成する
    var csvFile = ''
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i])
    }
    //CSVファイルをBlobにしてダウンロード
    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' })
    var link = document.createElement("a")
    if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
}
//xlsx出力
function exprotToxlsx(filename,data){
    //  ワークシートを作成
    const ws = XLSX.utils.aoa_to_sheet(data);
    //  ワークブックを作成
    const wb = XLSX.utils.book_new();
}
/**Write Out */

/**
 * Function
 */
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
    onWindowResize()
}
function animate(){
    //second
    const sec = performance.now()/1000

    //object

    //update
    //controls.update()
    ThreeMeshUI.update()

    // Render
    renderer.render(scene, camera)
}
/**Function */

/**
 * eventlister
 */
//resize
window.addEventListener('resize', onWindowResize)
//fullscreen
document.addEventListener("keydown",(e)=>{
    //press F
    if(e.keyCode == 70) {
        WindowFullscreen()
        console.log("full window")
    }
})
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
    //press Q
    if(e.keyCode == 81 && index_master > 0){
        index_master -=1;
        init_HDR(index_master);
    }
    //press E
    if(e.keyCode == 69 && index_master < hdr_files.length-1){
        index_master +=1;
        init_HDR(index_master)
    }
    //materials
    //press A
    if(e.keyCode == 65 && index_material > 0){
        index_material -=1
        init_material(index_material)
    }
    //press D
    if(e.keyCode == 68 && index_material < material_list.length-1){
        index_material += 1
        init_material(index_material)
    }
})
//mouse
window.addEventListener('mousemove',e =>{
    //WebGLマウス座標
    mouse_webGL.x=(e.clientX-(sizes.width/2))/position_ratio
    mouse_webGL.y=(-e.clientY+(sizes.height/2))/position_ratio

    //WebGLマウス座標の正規化
    mouse_webGL_normal.x=(mouse_webGL.x*2/sizes.width)/position_ratio
    mouse_webGL_normal.y=(mouse_webGL.y*2/sizes.height)/position_ratio

    //windowマウス座標
    mouse_window.x = e.clientX*2/position_ratio-1
    mouse_window.y = e.clientY*2/position_ratio+1

    //Windowマウス座標の正規化
    mouse_window_normal.x=(e.clientX/sizes.width)*2/position_ratio-1
    mouse_window_normal.y=-(e.clientY/sizes.height)*2/position_ratio+1

    //pointer lock api
    mouse_pl.x += e.movementX/position_ratio
    mouse_pl.y += e.movementY/position_ratio
    
})
/**eventlistner */