# Setup
```
git clone 
npm install
npm run dev
```

# Color management in Three.js
From 0.152, Three.js works in linear sRGB internally. It means we have to convert the input from sRGB non-linear to linear sRGB and then convert back back the output to non-linear sRB
```
// input
const color = new THREE.Color(0,0,0).convertSRGBToLinear()

// ...

// output somewhere in the code (to print in the console)
const color = new THREE.Color(0,0,0).convertLinearToSRGB()
// or
console.log(ambientLight.color.clone().convertLinearToSRGB()) // Don't forget the clone(), or it will convert the value that we want to print

// output for device (final)
renderer.outputColorSpace = THREE.SRGBColorSpace
```