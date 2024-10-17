import * as THREE from "three";
import { OrbitControls, Box } from "@react-three/drei";
import { XR, VRButton, ARButton } from "@react-three/xr";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Glitch
} from "@react-three/postprocessing";


export default function App() {
  return (
    <>
      <VRButton />
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
          <EffectComposer multisampling={0} disableNormalPass={true}>
            <Bloom
              luminanceThreshold={0}
              luminanceSmoothing={0.9}
              height={300}
            />
          </EffectComposer>
        </XR>
      </Canvas>
    </>
  );
}