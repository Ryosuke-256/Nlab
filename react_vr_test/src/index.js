/**
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
*/


import { createRoot } from 'react-dom/client'
import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import './styles.css'
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'


function Box(props) {
// This reference will give us direct access to the mesh
const meshRef = useRef()
// Set up state for the hovered and active state
const [hovered, setHover] = useState(false)
const [active, setActive] = useState(false)
// Subscribe this component to the render-loop, rotate the mesh every frame
useFrame((state, delta) => (meshRef.current.rotation.x += delta))
// Return view, these are regular three.js elements expressed in JSX
return (
  <mesh
    {...props}
    ref={meshRef}
    scale={active ? 1.5 : 1}
    onClick={(event) => setActive(!active)}
    onPointerOver={(event) => setHover(true)}
    onPointerOut={(event) => setHover(false)}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
  </mesh>
)
}

createRoot(document.getElementById('root')).render(
  <>
    <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
        <EffectComposer>
          <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
          <Noise opacity={0.02} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
    </Canvas>
  </>
)
