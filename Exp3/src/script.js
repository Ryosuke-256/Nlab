import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import ThreeMeshUI from 'three-mesh-ui';

//for postprocessing
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';



/**
 * initializing
 */
//name input 
let experiment_name = prompt("名前を入力してください:");
console.log("入力された名前は: " + experiment_name)

//imagefiles
const base_path = 'image\\'

const hdr_images_path = [
    '19.hdr','39.hdr','78.hdr',
]

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
const sizes = {width: window.innerWidth,height: window.innerHeight}
//const windowsize = 256
//const sizes = {width: windowsize,height: windowsize}

//widowsize関連補正
let position_ratio = 250

//mouse
const mouse_webGL = new THREE.Vector2()
const mouse_webGL_normal = new THREE.Vector2()
const mouse_window_normal =new THREE.Vector2()

//loadchange
let index_master = 0
let index_material = 0
let index_model = 0

//round
let roundnum = 2
/**initialization */

/**
 * Base
 */

// Canvas
canvas = document.querySelector('canvas.webgl')

// Scene
scene = new THREE.Scene()

//camera
let fov = 40
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
let materialname_list = ['cu_0.025','cu_0.129','pla_0.075','pla_0.225']

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
            console.log("Finished loading")
            init_model(index_model)
            resolve()
        },(itemUrl,itemsLoaded,itemsTotal)=>{
            console.log("Files loaded:" + itemsLoaded + "/" + model_path.length)
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
                    console.log((xhr.loaded/xhr.total*100)+'% loaded')
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
            console.log("Finished loading");
            init_master(index_master)
            resolve()
        },(itemUrl,itemsLoaded,itemsTotal)=>{
            console.log("Files loaded:" + itemsLoaded + "/" + hdr_images_path.length)
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

let stimulsData = []
let datacount = 0
async function Data_make(){
    return new Promise((resolve)=>{
        for (let i = 0; i < model_path.length; i++) {
            const model_name = model_path[i]
            for (let j = 0; j < hdr_images_path.length; j++){
                const hdr_name = hdr_images_path[j]
                let onedata = new OneData(datacount,j,hdr_name,i,model_name)
                stimulsData.push(onedata)
                datacount += 1
            }
        }
        resolve()
    })
}

function OneData(datacount,hdrid,hdr,modelid,model){
    this.allid = datacount
    this.hdrid = hdrid
    this.modelid = modelid
    this.score = 0
    this.totalscore = 0
    this.hdr = hdr
    this.model = model
    this.T_times = 0
}

//main loading
async function mainload(){
    await modelload()
    await hdrload()
    await Data_make()
    OneSession()
}
//activate
mainload()

/**
modelload()
hdrload()
*/
/** Loading */

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
 * Additional
 */

/**Additional */
/**Base */

/**
 * Panel 1
 */
//initialization
let container
let sliderValue = 0.5
let slider,handle,resultbar
//activate
SliderPanel1()
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
        height:0.12,width:0.95,margin:0.04,offset:0.03,
        textAlign:'center',
        justifyContent:'center',
    })
    const text = new ThreeMeshUI.Text({
        content:'Please adjust slider',
        fontColor:new THREE.Color(0xd2ffbd),
        fontSize:0.075,
        backgroundOpacity: 0.0,
        offset:0.01
    })
    textBlock.add(text)
    container.add(textBlock)
    //slider
    slider = new ThreeMeshUI.Block({
        height:0.025,width:1,offset:0.02,
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

    container.position.set(0,-0.5,0.5)
    container.rotation.set(0,0,0)
    scene.add(container)
}
function updateSlider(){
    handle.position.x = (sliderValue - 0.5) * slider.getWidth()
    console.log(handle.position.x)
}
/**Panel 1 */
/**
 * Panel 2
 */
//initialization
let container2
//activate

//panel making
function FinishPanel1(){
    //container
    container2 = new ThreeMeshUI.Block({
        height:0.3,width:1.3,margin:0.1,
        fontFamily: './assets/Roboto-msdf.json',
        fontTexture: './assets/Roboto-msdf.png',
    })
    //text block
    const textBlock = new ThreeMeshUI.Block({
        height:0.12,width:0.95,margin:0.04,offset:0.03,
        textAlign:'center',
        justifyContent:'center',
    })
    const text = new ThreeMeshUI.Text({
        content:'Thank you!!',
        fontColor:new THREE.Color(0xd2ffbd),
        fontSize:0.075,
        backgroundOpacity: 0.0,
        offset:0.01
    })
    textBlock.add(text)
    container2.add(textBlock)
    scene.add(container2)
}
/**Panel 2 */

/**
 * trial
 */
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve,ms))
}
async function OneSession(){
    let totalResults = [
        ['Name','Result_Av','T_times','TIME(SEC)'],
    ]
    for (let session = 0; session < material_list.length;session++){
        let ReportTable= [
            hdr_images_path
        ]
        init_material(session)
        let resulttable
        for (let round = 0;round < roundnum;round++){
            resulttable = Array(roundnum).fill().map(() => Array(stimulsData.length).fill(0))
            stimulsData.sort(() => Math.random() - 0.5);
            for (let trial = 0;trial < stimulsData.length;trial++){
                init_model(stimulsData[trial].modelid)
                init_master(stimulsData[trial].hdrid)
                await OneTrial()
                stimulsData[trial].score = resultbar
                stimulsData[trial].totalscore = stimulsData[trial].totalscore + resultbar
                resulttable[round][stimulsData[trial].allid] = resultbar
            }
            stimulsData.sort((a, b) => a.allid - b.allid)
            let reporcontents = stimulsData.map(field => field.score)
            console.log(reporcontents)
            ReportTable.push(reporcontents)
        }
        //let ReportTable = HeaderTable.concat(resulttable)
        let sheetname = experiment_name + "_" + materialname_list[session] + ".csv"
        exportToCsv(sheetname, ReportTable)
    }
    //filewrite

    //finalization
    console.log("Finished")
    scene.background=new THREE.Color(0x333333)
    scene.remove(container)
    scene.remove(object_obj)
    FinishPanel1()
}
async function OneTrial(){
    return new Promise((resolve)=>{
        console.log("loop confirm")
        function TrialFunction(e){
            if (e.keyCode == 37){
                sliderValue = Math.max(0,sliderValue - 0.05)
                console.log("rightconfirm")
                updateSlider()
            }
            if (e.keyCode == 39){
                sliderValue = Math.min(1,sliderValue + 0.05)
                updateSlider()
            }
            if (e.keyCode == 40){
                resultbar = sliderValue
                sliderValue = 0.5
                updateSlider()
                document.removeEventListener("keydown",TrialFunction)
                resolve()
            }
        }
        document.addEventListener("keydown",TrialFunction)
    })
}
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
 * Post processing
 */
//Tonemapping
const ReinhardTMO = {
    uniforms: {
        tDiffuse: { value: null },
        pWhite: { value: 1.0 }
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
//Tonemapping
const ReinhardTMOv2 = {
    uniforms: {
        tDiffuse: { value: null },
        pWhite: { value: 1.0 }
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
        float R = rgb.r;
        float G = rgb.g;
        float B = rgb.b;

        //sRGB To RGB
        R = (R > 0.04045) ? pow((R + 0.055) / 1.055, 2.4) : (R / 12.92);
        G = (G > 0.04045) ? pow((G + 0.055) / 1.055, 2.4) : (G / 12.92);
        B = (B > 0.04045) ? pow((B + 0.055) / 1.055, 2.4) : (B / 12.92);

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

    float reinhardTonemap(float L,float pWhite) {
        float Lscaled =  L / 1.19;
        float Ld = (Lscaled * (1.0 + pow(Lscaled / pWhite,2.0))) / (1.0 + Lscaled);
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

        gl_FragColor = vec4(xyYColor, color.a);
    }`
}

// Applying the shader as a post-processing effect
const renderPass = new RenderPass(scene, camera)
const ReinhardTMOPass = new ShaderPass(ReinhardTMO)
const ReinhardTMOv2Pass = new ShaderPass(ReinhardTMOv2)
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
// HDRファイルのロード
//init_master
function init_master(index){
    console.log(index)
    hdr_files[index].encoding = THREE.RGBEEncoding
    hdr_files[index].mapping = THREE.EquirectangularReflectionMapping
    scene.background = hdr_files[index]
    scene.environment = hdr_files[index]

    console.log(hdr_url[index])
}

//material load
function init_material(index){
    object_obj.material = material_list[index]
}

//model load
function init_model(index){
    if(object_obj != null){
        scene.remove(object_obj)
    }
    object_obj = model_files[index]
    const coe = 0.34
    console.log(index)
    console.log(model_files)
    console.log(object_obj)
    object_obj.scale.set(coe,coe,coe)
    object_obj.position.set(0,0.05,0)
    init_material(index_material)
    object_obj.castShadow = true
    scene.add(object_obj)
    console.log(object_obj)
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

function animate(){
    //update
    controls.update()
    ThreeMeshUI.update()
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
    //press Q
    if(e.keyCode == 81 && index_master > 0){
        index_master -=1;
        init_master(index_master);
    }
    //press E
    if(e.keyCode == 69 && index_master < hdr_files.length-1){
        index_master +=1;
        init_master(index_master)
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