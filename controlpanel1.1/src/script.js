import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0.2,0.2,0.2)

//plane1
const plane1_geometry = new THREE.PlaneGeometry(1000,1000,10,10)
const plane1_material =new THREE.MeshStandardMaterial({color:0xffffff,side: THREE.DoubleSide, roughness:0.0, metalness: 0.0})
const plane1_mesh=new THREE.Mesh(plane1_geometry,plane1_material)
plane1_mesh.rotation.set(Math.PI/2,0,0)
plane1_mesh.position.set(0,-100,0)
scene.add(plane1_mesh)

//box1
const box1_geometry=new THREE.BoxGeometry(100,100,100)
const box1_material =new THREE.MeshStandardMaterial({color:0xff0000, roughness:0.0, metalness: 0.0})
const box1_mesh=new THREE.Mesh(box1_geometry,box1_material)
scene.add(box1_mesh)

//平行光源
const directionalLight =new THREE.DirectionalLight(0xffffff,0.5)
directionalLight.position.set(1,1,1)
scene.add(directionalLight)

//点光源
const pointlight = new THREE.PointLight(0xffffff,200,0,1)
pointlight.position.set(0,0,0)
scene.add(pointlight)

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
    let adjust = 30
    sizes.width = window.innerWidth-adjust
    sizes.height = window.innerHeight-adjust

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

    box1_mesh.rotation.y=sec*(Math.PI/4)
    // Call tick again on the next frame
    window.requestAnimationFrame(animate)
}

animate()