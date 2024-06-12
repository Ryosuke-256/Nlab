import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import html2canvas from 'html2canvas'
import { element } from 'three/examples/jsm/nodes/Nodes.js'

/**
 * 宣言
 */
//imagefiles
const base_path = 'image\\'
const hdr_images_path = [
    'symmetrical_garden_02_2k.hdr',
    'chapel_day_2k.hdr',
    'cobblestone_street_night_2k.hdr',
    'brown_photostudio_02_2k.hdr',
]
const hdr_files = []

//base
let canvas, scene, camera, renderer, controls

//size
//const sizes = {width: window.innerWidth,height: window.innerHeight}
const sizes = {width: 256,height: 256}

//mouse follow
let pointlight1, cursor1_mesh

//animate object
let box1_mesh
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

/**
 * eventlister
 */
//base
window.addEventListener('load',init)

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
            //download
            imgData_2 = renderer.domElement.toDataURL();
            alldownloadlink.href = imgData_2;
            alldownloadlink.download = hdr_images_path[i] + "_material" + (j+1) + ".png"
            alldownloadlink.click();
            await sleep(100);
            console.log("downloaded hdr : " + i + "  material : " + j)
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
    
        //WebGL関連
        //ライトの座標
        pointlight1.position.x=mouse_webGL.x;
        pointlight1.position.y=mouse_webGL.y;
    
        //カーソルの座標
        cursor1_mesh.position.set(mouse_webGL.x,mouse_webGL.y,0)
})
/**eventlistner */

/**
 * Function
 */

//initialization
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
        antialias: true,
        preserveDrawingBuffer: true
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    renderer.outputEncoding = THREE.sRGBEncoding; // レンダラーの出力をsRGB色空間に設定。
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // トーンマッピングをACESFilmicに設定。
    renderer.toneMappingExposure = 2; // トーンマッピングの露光量を調整。
    renderer.shadowMap.enabled = true // 影

    renderer.domElement.toDataURL("image/png")
    /**renderer */

    //controls
    controls = new OrbitControls( camera, canvas)

    /**
     * Object
     */
    //material setting
    const material_default_1 = new THREE.MeshPhysicalMaterial({
        color:0xff0000,thickness:1, //いろいろ
        metalness:0, roughness:0, //Standard
        anisotropy:0,attenuationDistance:10000, //異方性 (金属)
        clearcoat:0,clearcoatRoughness:0, //クリアコート
        iridescence:0.0, iridescenceIOR:1.3,iridescenceThicknessRange:[100,400], //虹彩効果
        transmission:0, //透明度 (非金属)
        dispersion:0,ior:1.5,reflectivity:0.5, // 反射率 (非金属)
        sheen:0,sheenRoughness:1,specularIntensity:1 //光沢 (非金属)
    })
    const material_normal_1 = new THREE.MeshPhysicalMaterial({
        color:0xff0000,thickness:1, //いろいろ
        metalness:0, roughness:0.25, //Standard
        anisotropy:0,attenuationDistance:10, //異方性 (金属)
        clearcoat:0.75,clearcoatRoughness:0.5, //クリアコート
        iridescence:0.5, iridescenceIOR:1,iridescenceThicknessRange:[100,400], //虹彩効果
        transmission:0, //透明度 (非金属)
        dispersion:1,ior:2.3,reflectivity: 0, // 反射率 (非金属)
        sheen:1,sheenRoughness:1,specularIntensity:1 //光沢 (非金属)
    })
    const material_Translucent_1 = new THREE.MeshPhysicalMaterial({
        color:0xff0000,thickness:10, //いろいろ
        metalness:0, roughness:0.5, //Standard
        anisotropy:0,attenuationDistance:10, //異方性 (金属)
        clearcoat:0.1,clearcoatRoughness:0.2, //クリアコート
        iridescence:0.2, iridescenceIOR:1,iridescenceThicknessRange:[100,800], //虹彩効果
        transmission:0.05, //透明度 (非金属)
        dispersion:1,ior:1,reflectivity:0.5, // 反射率 (非金属)
        sheen:1,sheenRoughness:0.1,specularIntensity:1 //光沢 (非金属)
    })
    const material_metal_1 = new THREE.MeshPhysicalMaterial({
        color:0xff0000,thickness:1, //いろいろ
        metalness:1, roughness:0.2, //Standard
        anisotropy:0,attenuationDistance:1000, //異方性 (金属)
        clearcoat:1,clearcoatRoughness:0.1, //クリアコート
        iridescence:0, iridescenceIOR:0.99,iridescenceThicknessRange:[100,400], //虹彩効果
        transmission:0, //透明度 (非金属)
        dispersion:1,ior:2.3,reflectivity: 0, // 反射率(非金属)
        sheen:0.1,sheenRoughness:1,specularIntensity:1 //光沢(非金属)
    })
    const material_mat_1 = new THREE.MeshPhysicalMaterial({
        color:0xff0000,thickness:1, //いろいろ
        metalness:0, roughness:0.8, //Standard
        anisotropy:0,attenuationDistance:10, //異方性 (金属)
        clearcoat:0.75,clearcoatRoughness:0.75, //クリアコート
        iridescence:0, iridescenceIOR:1,iridescenceThicknessRange:[100,400], //虹彩効果
        transmission:0, //透明度 (非金属)
        dispersion:0.1,ior:1,reflectivity: 0.5, // 反射率 (非金属)
        sheen:0.5,sheenRoughness:1,specularIntensity:0.5 //光沢 (非金属)
    })
    material_list = [material_default_1,material_normal_1,material_Translucent_1,material_metal_1,material_mat_1]

    //plane1
    const textureLoader = new THREE.TextureLoader()
    const normalMapTexture = textureLoader.load("./texture/seaworn_stone_tile/seaworn_stone_tiles_nor_dx_1k.jpg")
    const plane1_mesh=new THREE.Mesh(
        new THREE.PlaneGeometry(10,10,10,10),
        new THREE.MeshStandardMaterial({
            color:0xffffff,side: THREE.DoubleSide,
            roughness:0.0, metalness: 0.0,
            normalMap:normalMapTexture
        })
    )
    plane1_mesh.rotation.set(Math.PI/2,0,0)
    plane1_mesh.position.set(0,-1,0)
    plane1_mesh.receiveShadow = true
    scene.add(plane1_mesh)

    //box1
    box1_mesh=new THREE.Mesh(
        new THREE.SphereGeometry(0.3,50,50),
        material_list[index_material]
    )
    box1_mesh.castShadow = true
    scene.add(box1_mesh)

    //cursor
    cursor1_mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.01,10,10),
        new THREE.MeshBasicMaterial({color:0x000000}))
    cursor1_mesh.position.set(0,0,0)
    scene.add(cursor1_mesh)

    /**
     * models
     */

    //obj loader
    const objLoader = new OBJLoader()
    objLoader.load(
        "./models/normal/teapot.obj",
        (obj) =>{
            object_obj = obj.children[0] //children[0]はいらないときもあるので要確認

            const coe = 0.25
            object_obj.scale.set(coe,coe,coe)
            object_obj.position.set(1,0,0)
            object_obj.material = new THREE.MeshStandardMaterial({color:0xff0000,roughness:0.5,metalness:0.5})
            object_obj.castShadow = true
            scene.add(object_obj)
            console.log(object_obj)
        },(xhr)=>{
            console.log((xhr.loaded/xhr.total*100)+'% loaded')
        },(error)=>{
            console.log('An error happened',error)
        }
    )

    /**
     * Background and Lighting
     */
    //背景
    //HDRloadmanager
    const loadingManager = new THREE.LoadingManager(()=>{
        console.log("Finished loading");
        init_master(index_master)
    },(itemUrl,itemsLoaded,itemsTotal)=>{
        console.log("Files loaded:" + itemsLoaded + "/" + itemsTotal)
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
    const directionalLight =new THREE.DirectionalLight(0xffffff,0.5)
    directionalLight.position.set(1,1,1)
    scene.add(directionalLight)

    //点光源
    pointlight1 = new THREE.PointLight(0xffffff,10,0,1)
    pointlight1.position.set(0,0,0)
    pointlight1.castShadow = true
    scene.add(pointlight1)

    renderer.setAnimationLoop(animate)
}

// HDRファイルのロード
//init_master
function init_master(index){
    hdr_files[index].encoding = THREE.RGBEEncoding
    hdr_files[index].mapping = THREE.EquirectangularReflectionMapping
    scene.background = hdr_files[index]
    scene.environment = hdr_files[index]
}

//material load
function init_material(index){
    box1_mesh.material = material_list[index]
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
    sizes.width = 256
    sizes.height = 256

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

    //second
    const sec = performance.now()/1000

    box1_mesh.rotation.y=sec*(Math.PI/4)

    if(object_obj!=null){
        object_obj.rotation.y=sec*(Math.PI/4)
    }
    // Call tick again on the next frame
    //window.requestAnimationFrame(animate)
}