//package
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

//image
//import background1 from '../image/symmetrical_garden_02_2k.hdr'
//import background2 from "../image/chapel_day_2k.hdr"

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**geometry */
//plane1
const plane1_geometry = new THREE.PlaneGeometry(1000,1000,10,10)
const plane1_material =new THREE.MeshStandardMaterial({color:0xffffff,side: THREE.DoubleSide, roughness:0.0, metalness:0.5})
const plane1_mesh=new THREE.Mesh(plane1_geometry,plane1_material)
plane1_mesh.rotation.set(Math.PI/2,0,0)
plane1_mesh.position.set(0,-200,0)
scene.add(plane1_mesh)

//sphere1
const sphere1_geometry=new THREE.SphereGeometry(100,30,30)
//texture設定
const textureLoader = new THREE.TextureLoader()
const normalMapTexture = textureLoader.load("./texture/seaworn_stonetile/seaworn_stone_tiles_nor_dx_1k.jpg")
const sphere1_material =new THREE.MeshStandardMaterial({color:0xff0000, roughness:0.0, metalness: 0.5, normalMap:normalMapTexture})
const sphere1_mesh=new THREE.Mesh(sphere1_geometry,sphere1_material)
sphere1_mesh.position.set(0,0,0)
scene.add(sphere1_mesh)

/**background & Light
new RGBELoader().load(background1,function(texture){
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.background = texture
    scene.enviroement = texture
})
*/

//scene.background = new THREE.Color(0.2,0.2,0.2)

/**平行光源
const directionalLight =new THREE.DirectionalLight(0xffffff)
directionalLight.position.set(1,1,1)
scene.add(directionalLight)
*/

/**
 * Sizes
*/
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const fov = 65
const fovRad= (fov/2)*(Math.PI/180)
const dist = (sizes.height/2)/Math.tan(fovRad)

const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1, dist*10)
camera.position.set(0,0,dist)
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

/**
 * 背景とライト 
*/
// HDRファイルのロード
const loader = new RGBELoader()
loader.load(
    './image/chapel_day_2k.hdr', 
    (texture) => {
    texture.encoding = THREE.RGBEEncoding

    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.background = texture;
    scene.environment = texture
    }
)


/**
 * その他 
*/
//orbitcontrol
const controls = new OrbitControls( camera, renderer.domElement )

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

    sphere1_mesh.rotation.y=sec*(Math.PI/4);
    // Call tick again on the next frame
    window.requestAnimationFrame(animate)
}

animate()