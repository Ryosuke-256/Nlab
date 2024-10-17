import * as THREE from "three";
import { OrbitControls, Box } from "@react-three/drei";
import { XR, VRButton, ARButton } from "@react-three/xr";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { MeshPhongMaterial } from "three";

export default function App() {
  return (
    <>
      <ARButton />
      <Canvas camera={{ position: [0, 2, 0] }}>
        <XR referenceSpace="local-floor">
          <color attach="background" args={["#111"]} />
          <ambientLight intensity={2} />
          <pointLight position={[20, 10, -10]} intensity={2} />
          <primitive object={new THREE.AxesHelper(2)} />
          <primitive object={new THREE.GridHelper(20, 20)} />
          <OrbitControls />

          <Box key="companionCube">
            <meshPhongMaterial color="#440066" />
          </Box>
        </XR>
      </Canvas>
    </>
  );
}


/** 
import logo from './logo.svg';
import './App.css';
import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { useState } from 'react'

const store = createXRStore()

export function App() {
  const [red, setRed] = useState(false)
  return (
    <>
      <button onClick={() => store.enterVR()}>Enter VR</button>
      <Canvas>
        <XR store={store}>
          <mesh pointerEventsType={{ deny: 'grab' }} onClick={() => setRed(!red)} position={[0, 1, -1]}>
            <boxGeometry />
            <meshBasicMaterial color={red ? 'red' : 'blue'} />
          </mesh>
        </XR>
      </Canvas>
    </>
  )
}
export default App;
*/

/**
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/

