import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import ThreeMeshUI from 'three-mesh-ui';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'

/**
 * Setteing
 */
// slider valocity
const slider_vel = 0.25;
//round limit
const roundnum = 5;
//model startq
const modelstart = 2;
//camera Offset
let Offset_Y = 2.2;
let Offset_Z = 0.5;
//rotation angle 

//imagefiles
const basePath_HDR = 'image\\'

/**
const hdr_nameList = [
    '19','39','78',
];
 */

const hdr_nameList = [
    '5','19','34','39','42','43','78','80','102','105',
    '125','152','164','183','198','201','202','203','209','222',
    '226','227','230','232','243','259','272','278','281','282'
];

/**
const hdr_nameList = [
    '19','39','78','80','102','125','152','203','226','227',
    '230','232','243','278','281'
]
*/
//models
const basePath_geometry = 'models/normal\\';
const nameList_geometry = ['bunny','boardA','boardC'];

//materials
const nameList_material = ['cu0025','pla0075'];

//Sound
const Path_sound = 'sound/Sound_B.mp3';

//index
let index_HDR = 0;
let index_material = 0;
let index_model = 0;
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

index_material = prompt("何回目ですか？:") - 1;
while(index_material < 0 || index_material > 3){
    index_material = prompt("1-4の範囲で入力してください");
}

console.log("name number : "+namenum);
let changeseedlist = [0,0,0,0,0,0]
for (let i = changeseedlist.length - 1 ; i >=0; i--){
    namenum = Math.floor(seededRandom(1,24*100,namenum))
    changeseedlist[i] = namenum
}

for (let i = nameList_material.length-1 ; i >=0; i--){
    let changenum = changeseedlist[i] % 2;
    //console.log("/nchangenum : "+changenum)
    let tmpStorage = nameList_material[i]
    nameList_material[i] = nameList_material[changenum]
    nameList_material[changenum] = tmpStorage
}

console.log("chang list : " + changeseedlist)
console.log(nameList_material)

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

console.log("今回のMaterialは：" + nameList_material[index_material])

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
cameraGroup.position.set(0,-1.0,3.0)
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
let renderer = new THREE.WebGLRenderer({
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
renderer.xr.enabled = true;
document.body.appendChild( VRButton.createButton( renderer ));

class HeadMovementTrigger {
    constructor(camera,soundUrl) {
        this.camera = camera;
        this.isWaiting = false;
        this.startPosition = new THREE.Vector3(); 
        this.threshold = 0.1;          
        this.resolveWaiting = null; 

        if (soundUrl) {
            this.sound = new Audio(soundUrl);
            this.sound.preload = 'auto'; // 事前に読み込んでおく
        } else {
            this.sound = null;
        }
    }

    /**
    * 毎フレームのレンダーループから呼び出す関数
    */
    update() {
        // 待機中でなければ何もしない
        if (!this.isWaiting) {
            return;
        }

        const currentPosition = new THREE.Vector3();
        this.camera.getWorldPosition(currentPosition);

        const distance = currentPosition.distanceTo(this.startPosition);

        if (distance > this.threshold) {
            console.log(`移動距離: ${distance.toFixed(3)}`);
            this.isWaiting = false;

            this.playSound();

            if (this.resolveWaiting) {
                this.resolveWaiting(); 
                this.resolveWaiting = null;
            }
        }
    }

    /**
     * 頭が一定量動くまで待機する非同期関数
     */
    wait(threshold = 0.1) {
        this.threshold = threshold;
        
        // 現在の頭の位置を「開始地点」として保存
        this.camera.getWorldPosition(this.startPosition);
        
        this.isWaiting = true;

        // 新しいPromiseを返し、そのPromiseのresolve関数をクラス内に保存する
        return new Promise((resolve) => {
        this.resolveWaiting = resolve;
        });
    }

    playSound() {
        if (this.sound) {
            // 一瞬で再生が終わる短い音の場合、再生位置を最初に戻す
            this.sound.currentTime = 0; 
            this.sound.play().catch(e => console.error("音声の再生に失敗しました:", e));
        }
    }
    setVolume(volume) {
        if (this.sound) {
            this.sound.volume = Math.max(0.0, Math.min(1.0, volume));
        }
    }
}

const headTrigger = new HeadMovementTrigger(camera, Path_sound);

function animate(){
    //second
    const sec = performance.now()/1000

    if(headTrigger){
        headTrigger.update();
    }

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
 * Loading
 */
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
        const imagepath = basePath_HDR + element + '.hdr'
    
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
class data_Object{
    constructor(hdr_url,arraylength){
        this.stimulsData = [];
        this.url_Hdr = hdr_url;
        this.arrayLength = arraylength;
    };
    async make_Data(){
        return new Promise((resolve)=>{
            for (let i = 0; i < this.url_Hdr.length; i++){
                const hdr_name = this.url_Hdr[i]
                let onedata = new OneData(i,hdr_name,this.arrayLength)
                this.stimulsData.push(onedata)
            }
            resolve()
        })
    }
};

class OneData{
    constructor(id,hdr,arrayLength){
        this.id = id;
        this.score = new Array(arrayLength);
        this.hdr = hdr;
        this.index = Array.from({length:arrayLength},(_,i) => i);
        this.tmpscore = 0;
    };
    PickandRemoveElement(){
        const randomIndex = Math.floor(Math.random() * this.index.length);
        const pickedElement = this.index.splice(randomIndex,1);
        return pickedElement[0];
    };
    InsertElement(index,score){
        this.score[index] = score;
    };
};

//init_HDR
function init_HDR(index){
    hdr_files[index].encoding = THREE.RGBEEncoding
    hdr_files[index].mapping = THREE.EquirectangularReflectionMapping
    scene.background = hdr_files[index]
    scene.environment = hdr_files[index]
}

class stimulu_Object{
    constructor(changeSeedList,path_geometry){
        this.mesh = null
        this.geometry_files = []
        this.geometry_url = []
        this.changeSeedList = changeSeedList
        this.path_geometry = path_geometry

        //material make
        this.cu0025 = new THREE.MeshPhysicalMaterial({
            color:0xecacac, //いろいろ
            metalness:1, roughness:0.025, //Standard
        })
        this.cu0129 = new THREE.MeshPhysicalMaterial({
            color:0xecacac, //いろいろ
            metalness:1, roughness:0.129, //Standard
        })
        this.pla0075 = new THREE.MeshPhysicalMaterial({
            color:0xa8a8a8, //いろいろ
            metalness:0, roughness:0, //Standard
            clearcoat:1.0,clearcoatRoughness:0.075, //クリアコート
            ior:1.5,reflectivity:0.5, // 屈折率
            specularIntensity:0 //鏡面反射
        })
        this.pla0225 = new THREE.MeshPhysicalMaterial({
            color:0xa8a8a8, //いろいろ
            metalness:0, roughness:0, //Standard
            clearcoat:1.0,clearcoatRoughness:0.225, //クリアコート
            ior:1.5,reflectivity:0.5, // 屈折率
            specularIntensity:0 //鏡面反射
        })
        this.material_list = [this.cu0025,this.pla0075]
        for (let i = this.material_list.length-1 ; i >= 0; i--){
            let changenum = this.changeSeedList[i]%2;
            //console.log("changenum : "+changenum)
            let tmpStorage = this.material_list[i]
            this.material_list[i] = this.material_list[changenum]
            this.material_list[changenum] = tmpStorage
        }
    }

    async modelload(){
        return new Promise((resolve)=>{
            //Modelloadmanager
            const ModelloadingManager = new THREE.LoadingManager(()=>{
                console.log("Finished Model loading")
                //Shuffle list
                //console.log(this.geometry_url)
                for (let i = this.geometry_url.length-1; i>=0; i--){
                    let changenum = (this.changeSeedList[i] + index_material) % this.geometry_url.length;
                    let tmpStorage1 = this.geometry_url[i]
                    this.geometry_url[i] = this.geometry_url[changenum]
                    this.geometry_url[changenum] = tmpStorage1
                    let tmpStorage2 = this.geometry_files[i]
                    this.geometry_files[i] = this.geometry_files[changenum]
                    this.geometry_files[changenum] = tmpStorage2
                }
                console.log(this.geometry_url)
                resolve()
            },(itemUrl,itemsLoaded,itemsTotal)=>{
                console.log("Model loaded:" + itemsLoaded + "/" + nameList_geometry.length)
            })
            //loadeverything
            const model_loader = new OBJLoader(ModelloadingManager)
            
            this.modelloader(model_loader)
        })
    }
    async modelloader(loader){
        for (let i = 0; i < nameList_geometry.length; i++) {
            const element = nameList_geometry[i]
            const modelpath = this.path_geometry + element + '.obj'
        
            await new Promise((resolve, reject) => {
                loader.load(
                    modelpath,
                    (obj) => {
                        this.geometry_files.push(obj.children[0])
                        this.geometry_url.push(element)
                        resolve()
                    },(xhr)=>{
                    },
                    (err) => reject(err)
                )
            })
        }
    }
    //material load
    init_material(index_material){
        this.mesh.material = this.material_list[index_material]
        this.mesh.material.needsUpdate = true
    }
    //model load
    init_mesh(index_shape,index_material){
        if(this.mesh != null){
            scene.remove(this.mesh)
        }
        this.mesh = this.geometry_files[index_shape]
        const coe_load = 0.3;
        this.mesh.scale.set(coe_load,coe_load,coe_load)
        this.mesh.position.set(0,0,0)
        this.init_material(index_material)
        this.mesh.castShadow = true
        scene.add(this.mesh)
        const coe = 0.055;
        this.mesh.scale.set(coe,coe,coe)
    }
    //transform
    rotate_mesh(positionXYZ_center,angle,distance){
        const angle_radian = angle/180 * Math.PI;
        this.mesh.position.set(
            positionXYZ_center[0] - distance * Math.sin(angle_radian),
            positionXYZ_center[1],
            positionXYZ_center[2] - distance*Math.cos(angle_radian)
        )
    };
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
    //container.scale.set(0.2,0.2,0.2)
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

// Click Panel
async function ClickPanel(container,parent){
    return new Promise((resolve)=>{
        parent.add(container);
        window.addEventListener("mousedown",(e)=>{
            if(e.button == 2){
                parent.remove(container)
                resolve()
            }
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
    sliderPanel.add(slider)
    textBlock.add(text)
    sliderPanel.add(textBlock)
    sliderPanel.position.set(0,-0.14,-0.25)
    sliderPanel.rotation.set(-Math.PI/12,0,0)
    sliderPanel.scale.set(0.25,0.25,0.25)
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
    testpanel1.position.set(0,-0.2,0);
    testpanel1.scale.set(0.4,0.4,0.4);
};
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
    testpanel2.position.set(0,0.2,0);
    testpanel2.scale.set(0.25,0.25,0.25);
};
//activate
TestPanel1();
TestPanel2();
/** Test SessionPanel */

/**
 * trial
 */
//sleep
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve,ms))
}
//preload
async function Preload(object_mesh){
    object_mesh.init_mesh(0,index_material)
    for (let i = 0; i < hdr_files.length;i++){
        init_HDR(i)
        await sleep(30)
    }
    scene.remove(object_mesh.mesh)
}

//test trial
var testcontinue = true
let mousex1 = 0
let mousex2 = 0
let testcount = 0
async function TestSession(object_mesh,object_data){
    testcontinue = true
    testcount = 0
    while(testcontinue){ 
        if(testcount < hdr_files.length){
            scene.add(testpanel1)
        }else{
            scene.add(testpanel2)
        }
        //change HDR
        init_HDR(object_data.stimulsData[testcount % hdr_files.length].id)
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
async function OneSession(object_mesh){
    SliderPanel1();
    let panelY = 0;
    let panelZ = 0.2;
    for (let session = modelstart-1; session < object_mesh.geometry_files.length;session++){
        //make data object
        let object_data = new data_Object(hdr_url,roundnum);
        object_data.make_Data();
        
        let ReportTable= [
            hdr_nameList
        ]
        //load data
        object_mesh.init_mesh(session,index_material)
        cameraGroup.position.set(0,-Offset_Y,Offset_Z);
        camera.remove(sliderPanel);

        //Test Intro
        let testIntroPanel = TempletePanel('Right Click \n To Test Session',panelY,panelZ);
        testIntroPanel.scale.set(0.2,0.2,0.2);
        await ClickPanel(testIntroPanel,scene);

        //Test session
        camera.add(sliderPanel);
        await TestSession(object_mesh,object_data);
        await sleep(100);
        camera.remove(sliderPanel);

        //Exp Intro
        let expPanel = TempletePanel('Right Click \n To Exp ' + (session+1) +'/'+ nameList_geometry.length,
        panelY,panelZ);
        expPanel.scale.set(0.2,0.2,0.2);
        await ClickPanel(expPanel,scene);

        //Exp session
        camera.add(sliderPanel);
        let resulttable
        for (let round = 0;round < roundnum;round++){
            console.log("round" + round + "start")
            resulttable = Array(roundnum).fill().map(() => Array(object_data.stimulsData.length).fill(0))
            object_data.stimulsData.sort(() => Math.random() - 0.5)
            for (let trial = 0;trial < object_data.stimulsData.length;trial++){
                let selectIndex = object_data.stimulsData[trial].PickandRemoveElement();
                //load HDR
                init_HDR(object_data.stimulsData[trial].id);

                //Head move
                //await headTrigger.wait(0.15);

                //trial
                await OneTrial()
                console.log(`HDR: ${object_data.stimulsData[trial].hdr},score: ${sliderValue.toFixed(3)}`)

                //save one result
                object_data.stimulsData[trial].InsertElement(selectIndex,resultbar);
                object_data.stimulsData[trial].tmpscore = resultbar;
                resulttable[round][object_data.stimulsData[trial].id] = resultbar
                
                await sleep(50)
            }
            //save results
            object_data.stimulsData.sort((a, b) => a.id - b.id)
            let reporcontents = object_data.stimulsData.map(field => field.tmpscore)
            console.log(reporcontents)
            ReportTable.push(reporcontents)
        }
        //save data
        //let ReportTable = HeaderTable.concat(resulttable)
        let geometyrName = object_mesh.geometry_url[session].replace(/\.obj/g,"")
        let xlsxName = experiment_name + "_" + nameList_material[index_material] + "_" + geometyrName + ".csv"
        exportToCsv(xlsxName, ReportTable)
    }
    //finalization
    console.log("Exp Finished");
    scene.background=new THREE.Color(0x333333);
    camera.remove(sliderPanel);
    scene.remove(object_mesh);
    let finishPanel = TempletePanel('Thank you!!',panelY,panelZ);
    finishPanel.scale.set(0.2,0.2,0.2);
    scene.add(finishPanel);
}
async function OneTrial(){
    return new Promise((resolve)=>{
        mousex1 = mouse_pl.x + (Math.random() - 0.5)*3
        trialloop()
        document.addEventListener("mousedown",TrialFunction)
        function TrialFunction(e){
            if(e.button == 0){
                updateValue()
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
    //loading data
    let loadpanel = TempletePanel("Now Loading",-Offset_Y,-Offset_Z);
    scene.add(loadpanel);
    const object_stimulu = new stimulu_Object(changeseedlist,basePath_geometry);
    await object_stimulu.modelload()
    await hdrload()
    await Preload(object_stimulu)
    scene.remove(loadpanel)

    //debug
    document.addEventListener("keydown",(e)=>{
        //press ↑
        if(e.keyCode == 38){
            cameraGroup.position.y += 0.05;
        };
        // press ↓
        if(e.keyCode == 40){
            cameraGroup.position.y -= 0.05;
        };
        // press →
        if(e.keyCode == 39){
            cameraGroup.position.z += 0.5;
        };
        // press ←
        if(e.keyCode == 37){
            cameraGroup.position.z -= 0.5;
        };
    })

    //Exp Start
    let vrpanel = TempletePanel("Press [Enter VR] button",-Offset_Y,-Offset_Z);
    await VRPanel(vrpanel,scene);
    OneSession(object_stimulu);
}
mainload()
/**trial */

/**
 * Write Out
 */
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
/**Function */

/**
 * eventlister
 */
//resize
window.addEventListener('resize', onWindowResize)
//change loaded
document.addEventListener("keydown",(e)=>{
    //hdr
    //press Q
    if(e.keyCode == 81 && index_HDR > 0){
        index_HDR -=1;
        init_HDR(index_HDR);
    }
    //press E
    if(e.keyCode == 69 && index_HDR < hdr_files.length-1){
        index_HDR +=1;
        init_HDR(index_HDR)
    }
})
//mouse
window.addEventListener('mousemove',e =>{
    //pointer lock api
    mouse_pl.x += e.movementX/position_ratio
    mouse_pl.y += e.movementY/position_ratio
    
})
/**eventlistner */