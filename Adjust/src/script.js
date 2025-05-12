import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import ThreeMeshUI from 'three-mesh-ui';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'

/**
 * Setteing
 */
// slider valocity
const slider_vel = 0.25
//camera Offset
let Offset_Y = 1.5;
let Offset_Z = 3.0;

//imagefiles
const base_path = 'image\\'


const hdr_nameList = [
    '19','39','78',
];


/**
const hdr_nameList = [
    '5','19','34','39','42','43','78','80','102','105',
    '125','152','164','183','198','201','202','203','209','222',
    '226','227','230','232','243','259','272','278','281','282'
];
 */

/**
const hdr_nameList = [
    '19','39','78','80','102','125','152','203','226','227',
    '230','232','243','278','281'
]
 */

//models
const model_base_path = 'models/normal\\'
const model_nameList = ['sphere','bunny','dragon','boardA','boardB','boardC'];

//materials
const material_nameList = ['cu0025','cu0129','pla0075','pla0225'];

//index
let index_HDR = 0;
let index_material = 0;
let index_model = 0;

/** Setting */

/**
 * initializing
 */

//size
let sizes = {width: window.innerWidth,height: window.innerHeight};
//widowsize関連補正
let position_ratio = 250;

//mouse
const mouse_pl = new THREE.Vector2(0,0);

// Canvas
let canvas = document.querySelector('canvas.webgl');

// Scene
let scene = new THREE.Scene();

//camera
let fov = 40;
let camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.01, dist(fov)*10);
//camera.position.set(10000,0,dist(fov))
const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
cameraGroup.position.set(0,-Offset_Y,Offset_Z)
scene.add(cameraGroup)
//camera distance
function dist (fov) {
    const fovRad= (fov/2)*(Math.PI/180)
    const dist = ((sizes.height/position_ratio)/2)/Math.tan(fovRad)
    return dist
}
let camera_fix = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.01, dist(fov)*10);
camera_fix.position.set(0,-Offset_Y,Offset_Z);
scene.add(camera_fix);
/**initialization */

/**
 * Renderer
 */
let renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding
renderer.shadowMap.enabled = true
renderer.toneMapping = THREE.CustomToneMapping
renderer.toneMappingExposure = 1.0

//VR
renderer.xr.enabled = true
document.body.appendChild( VRButton.createButton( renderer ))

let xrCamera_0
renderer.xr.addEventListener('sessionstart',()=>{
    renderer.render( scene, camera );
    xrCamera_0 = renderer.xr.getCamera();
    console.log(xrCamera_0);
})

function animate(){
    //second
    const sec = performance.now()/1000

    //update
    ThreeMeshUI.update()

    // Render
    renderer.render(scene, camera)
}

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

/**
 * Object
 */
//Mask plate
let outerWidth = 20;
let outerHeight = 10;
let innerWidth = 1;
let innerHeight = 1;

const outerShape = new THREE.Shape();
outerShape.moveTo(-outerWidth / 2, -outerHeight / 2);
outerShape.lineTo(-outerWidth / 2, outerHeight / 2);
outerShape.lineTo(outerWidth / 2, outerHeight / 2);
outerShape.lineTo(outerWidth / 2, -outerHeight / 2);
outerShape.lineTo(-outerWidth / 2, -outerHeight / 2);

const innerShape = new THREE.Shape();
innerShape.moveTo(-innerWidth / 2, -innerHeight / 2);
innerShape.lineTo(-innerWidth / 2, innerHeight / 2);
innerShape.lineTo(innerWidth / 2, innerHeight / 2);
innerShape.lineTo(innerWidth / 2, -innerHeight / 2);
innerShape.lineTo(-innerWidth / 2, -innerHeight / 2);
outerShape.holes.push(innerShape);

const geometry_mask = new THREE.ShapeGeometry(outerShape);
const material_mask = new THREE.MeshBasicMaterial({ color: 0x666666, side: THREE.DoubleSide });
const mask = new THREE.Mesh(geometry_mask, material_mask);
mask.position.z = 0; // カメラの前に配置
scene.add(mask)

document.addEventListener("keydown",(e)=>{
    //press ←
    if(e.keyCode == 37){
        mask.scale.x -= 0.01;
        mask.scale.y -= 0.01;
    }
    //press →
    if(e.keyCode == 39){
        mask.scale.x += 0.01;
        mask.scale.y += 0.01;
    }
    //press ↓
    if(e.keyCode == 40){
        console.log(mask.scale);
    }
})

//background sphere
const BGsphere_geo = new THREE.SphereGeometry(3.5,32,16)
const BGsphere_mat = new THREE.MeshBasicMaterial({color:0xffffff,
    side:THREE.DoubleSide}
)
const BGsphere_mesh = new THREE.Mesh(BGsphere_geo,BGsphere_mat)
BGsphere_mesh.rotation.set(0,Math.PI,0)
BGsphere_mesh.scale.set(-1,1,1)
//scene.add(BGsphere_mesh)


//material setting
const cu0025 = new THREE.MeshPhysicalMaterial({
    color:0xecacac, //いろいろ
    metalness:1, roughness:0.025, //Standard
})
const cu0129 = new THREE.MeshPhysicalMaterial({
    color:0xecacac, //いろいろ
    metalness:1, roughness:0.129, //Standard
})
const pla0075 = new THREE.MeshPhysicalMaterial({
    color:0xa8a8a8, //いろいろ
    metalness:0, roughness:0, //Standard
    clearcoat:1.0,clearcoatRoughness:0.075, //クリアコート
    ior:1.5,reflectivity:0.5, // 屈折率
    specularIntensity:0 //鏡面反射
})
const pla0225 = new THREE.MeshPhysicalMaterial({
    color:0xa8a8a8, //いろいろ
    metalness:0, roughness:0, //Standard
    clearcoat:1.0,clearcoatRoughness:0.225, //クリアコート
    ior:1.5,reflectivity:0.5, // 屈折率
    specularIntensity:0 //鏡面反射
})


let material_list = [cu0025,cu0129,pla0075,pla0225]
//console.log(material_list)

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
            resolve()
        },(itemUrl,itemsLoaded,itemsTotal)=>{
            console.log("Model loaded:" + itemsLoaded + "/" + model_nameList.length)
        })
        //loadeverything
        const model_loader = new OBJLoader(ModelloadingManager)
        
        modelloader(model_loader)
    })
}
async function modelloader(loader){
    for (let i = 0; i < model_nameList.length; i++) {
        const element = model_nameList[i]
        const modelpath = model_base_path + element + '.obj'
    
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
            resolve()
        },(itemUrl,itemsLoaded,itemsTotal)=>{
            console.log("HDR loaded:" + itemsLoaded + "/" + hdr_nameList.length)
        })
        //loadeverything
        const loader1 = new RGBELoader(loadingManager)
        
        hdrloader(loader1)
    })
}
async function hdrloader(loader){
    for (let i = 0; i < hdr_nameList.length; i++) {
        const element = hdr_nameList[i]
        const imagepath = base_path + element + '.hdr'
    
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
    this.hdr = hdr
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
 * Lighting
 */

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
 * Making Panel
 */
//Templete Panel
function TempletePanel(text,posY,posZ){
    //container
    const container = new ThreeMeshUI.Block({
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
    const textObj = new ThreeMeshUI.Text({
        content:text,
        fontColor:new THREE.Color(0xffffff),
        fontSize:0.2,
        backgroundOpacity: 0.0,
        offset:0.01
    })
    textBlock.add(textObj)
    container.add(textBlock)
    container.position.set(0,posY,posZ)
    return container;
}

//VR panel
async function VRPanel(container,parent){
    return new Promise((resolve)=>{
        parent.add(container);
        renderer.xr.addEventListener('sessionstart',()=>{
            parent.remove(container)
            document.body.requestPointerLock()
            resolve()
        })
    })
}

/**
 * Slider Panel
 */
//initialization
let sliderPanel
let sliderValue = 0.5
let slider,handle,resultbar
//Sliderpanel
function SliderPanel1(){
    //container
    sliderPanel = new ThreeMeshUI.Block({
        height:0.3,width:1.3,margin:0.1,
        fontFamily: './assets/Roboto-msdf.json',
        fontTexture: './assets/Roboto-msdf.png',
        backgroundOpacity: 0,
    })
    //text block
    const textBlock = new ThreeMeshUI.Block({
        height:0.12,width:0.95,margin:0,offset:0.03,
        textAlign:'center',
        justifyContent:'center',
        backgroundOpacity: 0,
    })
    const text = new ThreeMeshUI.Text({
        content:'Adjust slider & Left click',
        fontColor:new THREE.Color(0x000000),
        fontSize:0.075,
        backgroundOpacity: 0.0,
        offset:0.01
    })
    //slider
    slider = new ThreeMeshUI.Block({
        height:0.015,width:1,offset:0.02,margin:0.06,
        backgroundColor: new THREE.Color(0x777777),
        justifyContent:'center',
    });
    handle = new ThreeMeshUI.Block({
        height:0.07,width:0.025,offset:0.01,
        backgroundColor: new THREE.Color(0x000000),
        backgroundOpacity: 1
    });
    slider.add(handle)
    sliderPanel.add(slider)
    textBlock.add(text)
    sliderPanel.add(textBlock)
    sliderPanel.position.set(0,-0.5,-3)
    sliderPanel.rotation.set(-Math.PI/12,0,0)
    sliderPanel.scale.set(0.75,0.75,0.75)
    //camera.add(sliderPanel)
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
 * trial
 */
//sleep
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve,ms))
}
//preload
async function Preload(){
    init_model(0)
    init_material(index_material)
    for (let i = 0; i < hdr_files.length;i++){
        init_HDR(i)
        await sleep(30)
    }
    scene.remove(object_obj)
}

//debugSession
var debugcontinue = true
let mousex1 = 0
let mousex2 = 0
let debugcount = 0;
async function DebugSession(){
    SliderPanel1();
    camera.remove(sliderPanel);
    camera.add(sliderPanel);
    init_model(index_model)
    init_material(index_material)
    debugcontinue = true
    while(debugcontinue){ 
        init_HDR(stimulsData[debugcount % hdr_files.length].id)
        await DebugTrial()
        debugcount += 1;
    }
}
async function DebugTrial(){
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
            if(e.button == 2 && debugcount >= hdr_files.length){
                debugcontinue = false
                document.removeEventListener("mousedown",TrialFunction)
                resolve()
            }
        }
        document.addEventListener("mousedown",TrialFunction)
    })
}
function trialloop(){
    mousex2 = mouse_pl.x

    handle.position.x = ( mousex2 - mousex1 ) * slider_vel
    handle.position.x = Math.max(-slider.getWidth()/2,Math.min(slider.getWidth()/2,handle.position.x))

    renderer.xr.getSession().requestAnimationFrame(trialloop)
}

//Flow
async function mainload(){
    //loading data
    let loadpanel = TempletePanel("Now Loading",-Offset_Y,-Offset_Z);
    scene.add(loadpanel);
    await modelload()
    await hdrload()
    await Data_make()
    await Preload()
    scene.remove(loadpanel)

    //Exp Start
    let vrpanel = TempletePanel("Press [Enter VR] button",-Offset_Y,-Offset_Z);
    await VRPanel(vrpanel,scene);
    DebugSession();
}
mainload()
/**trial */

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
/**Function */

/**
 * eventlister
 */
//resize
window.addEventListener('resize', onWindowResize)
//change loaded
document.addEventListener("keydown",(e)=>{
    //hdr
    //press T
    if(e.keyCode == 84 && index_HDR > 0){
        index_HDR -=1;
        init_HDR(index_HDR);
    }
    //press Y
    if(e.keyCode == 89 && index_HDR < hdr_files.length-1){
        index_HDR +=1;
        init_HDR(index_HDR)
    }

    //materials
    //press E
    if(e.keyCode == 69 && index_material > 0){
        index_material -=1
        init_material(index_material)
    }
    //press R
    if(e.keyCode == 82 && index_material < material_list.length-1){
        index_material += 1
        init_material(index_material)
    }

    //models
    //press Q
    if(e.keyCode == 81 && index_model > 0){
        index_model -=1;
        init_model(index_model);
    }
    //press W
    if(e.keyCode == 87 && index_model < model_files.length-1){
        index_model +=1;
        init_model(index_model);
    }
})
//mouse
window.addEventListener('mousemove',e =>{
    //pointer lock api
    mouse_pl.x += e.movementX/position_ratio
    mouse_pl.y += e.movementY/position_ratio
    
})
/**eventlistner */