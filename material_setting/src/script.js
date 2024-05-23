import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
//scene.background = new THREE.Color(0.2,0.2,0.2)


/**
 * Geometry
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
    anisotropy:1,attenuationDistance:10, //異方性 (金属)
    clearcoat:0.75,clearcoatRoughness:0.5, //クリアコート
    iridescence:0.5, iridescenceIOR:1,iridescenceThicknessRange:[100,400], //虹彩効果
    transmission:0, //透明度 (非金属)
    dispersion:1,ior:2.3,reflectivity: 0, // 反射率 (非金属)
    sheen:1,sheenRoughness:1,specularIntensity:1 //光沢 (非金属)
})
const material_Translucent_1 = new THREE.MeshPhysicalMaterial({
    color:0xff0000,thickness:10, //いろいろ
    metalness:0, roughness:0.5, //Standard
    anisotropy:1,attenuationDistance:10, //異方性 (金属)
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
    anisotropy:1,attenuationDistance:10, //異方性 (金属)
    clearcoat:0.75,clearcoatRoughness:0.75, //クリアコート
    iridescence:0, iridescenceIOR:1,iridescenceThicknessRange:[100,400], //虹彩効果
    transmission:0, //透明度 (非金属)
    dispersion:0.1,ior:1,reflectivity: 0.5, // 反射率 (非金属)
    sheen:0.5,sheenRoughness:1,specularIntensity:0.5 //光沢 (非金属)
})
const material_list = [material_default_1,material_normal_1,material_Translucent_1,material_metal_1,material_mat_1]


//plane1
const plane1_geometry = new THREE.PlaneGeometry(1000,1000,10,10)
const textureLoader = new THREE.TextureLoader()
const normalMapTexture = textureLoader.load("./texture/seaworn_stone_tile/seaworn_stone_tiles_nor_dx_1k.jpg")
const plane1_material =new THREE.MeshStandardMaterial({color:0xffffff,side: THREE.DoubleSide, roughness:0.0, metalness: 0.0,normalMap:normalMapTexture})
const plane1_mesh=new THREE.Mesh(plane1_geometry,plane1_material)
plane1_mesh.rotation.set(Math.PI/2,0,0)
plane1_mesh.position.set(0,-100,0)
plane1_mesh.receiveShadow = true
scene.add(plane1_mesh)

//box1
const box1_geometry=new THREE.SphereGeometry(100,100,100)
const box1_mesh=new THREE.Mesh(box1_geometry,material_default_1)
box1_mesh.castShadow = true
scene.add(box1_mesh)


//cursor
const cursor1_geometry = new THREE.SphereGeometry(5,10,10)
const cursor1_material = new THREE.MeshBasicMaterial({color:0x000000})
const cursor1_mesh = new THREE.Mesh(cursor1_geometry,cursor1_material)
cursor1_mesh.position.set(0,0,0)
scene.add(cursor1_mesh)

/**
 * Background and Lighting
 */
//背景
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
const pointlight1 = new THREE.PointLight(0xffffff,200,0,1)
pointlight1.position.set(0,0,0)
pointlight1.castShadow = true
scene.add(pointlight1)

/**
 * Sizes
 */
var adjust = 0
const sizes = {
    width: window.innerWidth-adjust,
    height: window.innerHeight-adjust
}
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth-adjust
    sizes.height = window.innerHeight-adjust

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.position.set(0,0,dist(fov))
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

//fullscreen
window.addEventListener("dblclick",() =>
{
    if(!document.fullscreenElement){
        canvas.requestFullscreen()
    }
    else{
        document.exitFullscreen()
    }
})

/**
 * Camera
 */
// Base camera
const fov = 75
const dist =(fov) =>{
    const fovRad= (fov/2)*(Math.PI/180)
    const dist = (sizes.height/2)/Math.tan(fovRad)
    return dist
}
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1, dist(fov)*10)
camera.position.set(0,0,dist(fov))
scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.outputEncoding = THREE.sRGBEncoding; // レンダラーの出力をsRGB色空間に設定。
renderer.toneMapping = THREE.ACESFilmicToneMapping; // トーンマッピングをACESFilmicに設定。
renderer.toneMappingExposure = 2; // トーンマッピングの露光量を調整。
renderer.shadowMap.enabled = true // 影

//controls
const controls = new OrbitControls( camera, canvas)
controls.enableDamping = true


/**
 * Mouse ctrl
 */
const mouse_webGL = new THREE.Vector2()
const mouse_webGL_normal = new THREE.Vector2()
const mouse_window_normal =new THREE.Vector2()

//マウス動いた時の処理
window.addEventListener('mousemove',e =>
{
    //WebGLマウス座標
    mouse_webGL.x=e.clientX-(sizes.width/2)
    mouse_webGL.y=-e.clientY+(sizes.height/2)

    //WebGLマウス座標の正規化
    mouse_webGL_normal.x=(mouse_webGL.x*2/sizes.width)
    mouse_webGL_normal.y=(mouse_webGL.y*2/sizes.height)

    //Windowマウス座標の正規化
    mouse_window_normal.x=(e.clientX/sizes.width)*2-1
    mouse_window_normal.y=-(e.clientY/sizes.height)*2+1

//WebGL関連
    //ライトの座標
    pointlight1.position.x=mouse_webGL.x;
    pointlight1.position.y=mouse_webGL.y;

    //カーソルの座標
    cursor1_mesh.position.set(mouse_webGL.x,mouse_webGL.y,0)

//WebGL_normal関連

//Window_noraml関連

})

/**
 * Animate
 */
const animate = () =>
{
    controls.update()
    // Render
    renderer.render(scene, camera)

    //second
    const sec = performance.now()/1000

    box1_mesh.rotation.y=sec*(Math.PI/4)
    // Call tick again on the next frame
    window.requestAnimationFrame(animate)
}

animate()