import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import ThreeMeshUI from 'three-mesh-ui';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'

// --- Configuration & State ---
class ExperimentConfig {
    constructor() {
        // Constants
        this.slider_vel = 0.25;
        this.roundnum = 5;
        this.modelstart = 1;
        this.basePath_HDR = 'image\\';
        this.basePath_geometry = 'models/normal\\';


        this.hdr_nameList = [
            '5', '19', '34', '39', '42', '43', '78', '80', '102', '105',
            '125', '152', '164', '183', '198', '201', '202', '203', '209', '222',
            '226', '227', '230', '232', '243', '259', '272', '278', '281', '282'
        ];


        /**
        this.hdr_nameList = [
            '5', '19', '34'
        ];
        */

        this.nameList_geometry = ['bunny', 'boardA'];
        this.nameList_material = ['pla0075'];

        // State
        this.Offset_Y = 1.1;
        this.Offset_Z = 0.5;
        this.experiment_name = "";
        this.index_material = 0;
        this.changeseedlist = [0, 0, 0, 0, 0, 0];

        this.sizes = { width: window.innerWidth, height: window.innerHeight };
        this.position_ratio = 250;
        this.fov = 40;
    }

    init() {
        this.experiment_name = prompt("名前を入力してください:");
        console.log("入力された名前は: " + this.experiment_name);

        let namenum = 0;
        for (let i = 0; i < this.experiment_name.length; i++) {
            namenum += this.experiment_name.charCodeAt(i);
        }

        this.index_material = prompt("何回目ですか？:") - 1;
        while (this.index_material < 0 || this.index_material > 3) {
            this.index_material = prompt("1-4の範囲で入力してください");
        }

        console.log("name number : " + namenum);
        for (let i = this.changeseedlist.length - 1; i >= 0; i--) {
            namenum = Math.floor(this.seededRandom(1, 24 * 100, namenum));
            this.changeseedlist[i] = namenum;
        }

        for (let i = this.nameList_material.length - 1; i >= 0; i--) {
            let changenum = this.changeseedlist[i] % this.nameList_material.length;
            let tmpStorage = this.nameList_material[i];
            this.nameList_material[i] = this.nameList_material[changenum];
            this.nameList_material[changenum] = tmpStorage;
        }

        console.log("chang list : " + this.changeseedlist);
        console.log("Material List: ", this.nameList_material);
        console.log("今回のMaterialは：" + this.nameList_material[this.index_material]);
    }

    createseededRandom(seed) {
        return function () {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        }
    }

    seededRandom(min, max, seed) {
        const randomFunc = this.createseededRandom(seed);
        return Math.floor(randomFunc() * (max - min + 1)) + min;
    }

    dist() {
        const fovRad = (this.fov / 2) * (Math.PI / 180);
        const dist = ((this.sizes.height / this.position_ratio) / 2) / Math.tan(fovRad);
        return dist;
    }
}

// --- UI Manager ---
class UIManager {
    constructor(config, scene, camera) {
        this.config = config;
        this.scene = scene;
        this.camera = camera;
        this.sliderPanel = null;
        this.slider = null;
        this.handle = null;
        this.sliderValue = 0.5;
    }

    createTemplatePanel(text, posY, posZ) {
        const container = new ThreeMeshUI.Block({
            height: this.config.sizes.height * 1 / this.config.position_ratio,
            width: this.config.sizes.width * 1 / this.config.position_ratio,
            margin: 0.1,
            fontFamily: './assets/Roboto-msdf.json',
            fontTexture: './assets/Roboto-msdf.png',
        });
        const textBlock = new ThreeMeshUI.Block({
            height: this.config.sizes.height * 0.9 / this.config.position_ratio,
            width: this.config.sizes.width * 0.9 / this.config.position_ratio,
            margin: 0.04, offset: 0.03,
            textAlign: 'center',
            justifyContent: 'center',
        });
        const textObj = new ThreeMeshUI.Text({
            content: text,
            fontColor: new THREE.Color(0xffffff),
            fontSize: 0.2,
            backgroundOpacity: 0.0,
            offset: 0.01
        });
        textBlock.add(textObj);
        container.add(textBlock);
        container.position.set(0, posY, posZ);
        return container;
    }

    createMiniPanel(text, posY, posZ, scale) {
        const container = new ThreeMeshUI.Block({
            height: 0.5, width: 1.3, margin: 0.1,
            fontFamily: './assets/Roboto-msdf.json',
            fontTexture: './assets/Roboto-msdf.png',
        });
        const textBlock = new ThreeMeshUI.Block({
            height: 0.4, width: 1.05, margin: 0.04, offset: 0.03,
            textAlign: 'center',
            justifyContent: 'center',
        });
        const text1 = new ThreeMeshUI.Text({
            content: text,
            fontColor: new THREE.Color(0xffffff),
            fontSize: 0.1,
            backgroundOpacity: 0.0,
            offset: 0.01
        });
        textBlock.add(text1);
        container.add(textBlock);
        container.position.set(0, posY, posZ);
        container.scale.set(scale, scale, scale);
        return container;
    }

    async showVRPanel(parent, renderer) {
        const panel = this.createTemplatePanel("Press [Enter VR] button", -this.config.Offset_Y, -this.config.Offset_Z);
        return new Promise((resolve) => {
            parent.add(panel);
            renderer.xr.addEventListener('sessionstart', () => {
                parent.remove(panel);
                document.body.requestPointerLock();
                resolve();
            });
        });
    }

    async showClickPanel(container, parent) {
        return new Promise((resolve) => {
            parent.add(container);
            const clickHandler = (e) => {
                if (e.button == 2) {
                    parent.remove(container);
                    window.removeEventListener("mousedown", clickHandler);
                    resolve();
                }
            };
            window.addEventListener("mousedown", clickHandler);
        });
    }

    async showAutoClosePanel(container, parent, duration = 1000) {
        return new Promise((resolve) => {
            parent.add(container);
            setTimeout(() => {
                parent.remove(container);
                resolve();
            }, duration);
        });
    }

    createSliderPanel() {
        this.sliderPanel = new ThreeMeshUI.Block({
            height: 0.3, width: 1.3, margin: 0.1,
            fontFamily: './assets/Roboto-msdf.json',
            fontTexture: './assets/Roboto-msdf.png',
        });
        const textBlock = new ThreeMeshUI.Block({
            height: 0.12, width: 0.95, margin: 0, offset: 0.03,
            textAlign: 'center',
            justifyContent: 'center',
        });
        const text = new ThreeMeshUI.Text({
            content: 'Adjust slider & Left click',
            fontColor: new THREE.Color(0xffffff),
            fontSize: 0.075,
            backgroundOpacity: 0.0,
            offset: 0.01
        });
        this.slider = new ThreeMeshUI.Block({
            height: 0.025, width: 1, offset: 0.02, margin: 0.06,
            backgroundColor: new THREE.Color(0x999999),
            justifyContent: 'center',
        });
        this.handle = new ThreeMeshUI.Block({
            height: 0.07, width: 0.015, offset: 0.01,
            backgroundColor: new THREE.Color(0xffffff),
            backgroundOpacity: 1
        });
        this.slider.add(this.handle);
        this.sliderPanel.add(this.slider);
        textBlock.add(text);
        this.sliderPanel.add(textBlock);
        this.sliderPanel.position.set(0, -0.14, -0.25);
        this.sliderPanel.rotation.set(-Math.PI / 12, 0, 0);
        this.sliderPanel.scale.set(0.25, 0.25, 0.25);
    }

    updateSlider() {
        this.handle.position.x = (this.sliderValue - 0.5) * this.slider.getWidth();
    }

    updateValue() {
        this.sliderValue = this.handle.position.x / this.slider.getWidth() + 0.5;
    }
}

// --- Audio Manager ---
class AudioManager {
    constructor() {
        this.sound_Head = new Audio('sound/Sound_A.mp3');
        this.sound_NoHead = new Audio('sound/Sound_B.mp3');
    }

    playHead() {
        this.sound_Head.currentTime = 0;
        this.sound_Head.play().catch(e => console.error(e));
    }

    playNoHead() {
        this.sound_NoHead.currentTime = 0;
        this.sound_NoHead.play().catch(e => console.error(e));
    }
}

// --- Head Tracker ---
class HeadTracker {
    constructor(camera, config) {
        this.camera = camera;
        this.config = config;
        this.originPosition = null;
        this.isWaiting = false;
        this.startPosition = new THREE.Vector3();
        this.threshold = 0.1;
        this.resolveWaiting = null;
        this.sound = new Audio('sound/Sound_A.mp3'); // For movement trigger feedback
    }

    update() {
        if (!this.isWaiting) return;

        const currentPosition = new THREE.Vector3();
        this.camera.getWorldPosition(currentPosition);
        const distance = currentPosition.distanceTo(this.startPosition);

        if (distance > this.threshold) {
            console.log(`Movement detected: ${distance.toFixed(3)}`);
            this.isWaiting = false;
            this.sound.currentTime = 0;
            this.sound.play().catch(e => console.error(e));
            if (this.resolveWaiting) {
                this.resolveWaiting();
                this.resolveWaiting = null;
            }
        }
    }

    wait(threshold = 0.15) {
        this.threshold = threshold;
        this.camera.getWorldPosition(this.startPosition);
        this.isWaiting = true;
        return new Promise((resolve) => {
            this.resolveWaiting = resolve;
        });
    }

    async waitForReset(scene, uiManager, threshold = 0.05) {
        const centerPanel = uiManager.createTemplatePanel('Please Return to Center\n(Front)', 0, 0.1);
        centerPanel.scale.set(0.2, 0.2, 0.2);
        // Re-implementing original style roughly
        const bgBlock = centerPanel;
        bgBlock.set({ backgroundColor: new THREE.Color(0xff0000), backgroundOpacity: 0.5 });

        scene.add(centerPanel);

        let isCentered = false;
        while (!isCentered) {
            const currentPosition = new THREE.Vector3();
            this.camera.getWorldPosition(currentPosition);
            const distance = currentPosition.distanceTo(this.originPosition);

            if (distance < threshold) {
                isCentered = true;
            } else {
                await new Promise(r => setTimeout(r, 50));
            }
        }
        scene.remove(centerPanel);
    }

    async runAdjustmentSession(scene, uiManager, cameraGroup, object_mesh) {
        const panel = uiManager.createMiniPanel("Adjust Position\nRight Click to Confirm", 0, -0.3, 0.6);

        // Reset model and camera for adjustment
        object_mesh.updateMesh(scene, 0, 0);
        cameraGroup.position.set(0, -this.config.Offset_Y, this.config.Offset_Z);

        const keyHandler = (e) => {
            if (e.keyCode == 38) { // Up
                cameraGroup.position.y += 0.05;
                this.config.Offset_Y -= 0.05;
            } else if (e.keyCode == 40) { // Down
                cameraGroup.position.y -= 0.05;
                this.config.Offset_Y += 0.05;
            } else if (e.keyCode == 39) { // Right
                cameraGroup.position.z += 0.5;
                this.config.Offset_Z += 0.5;
            } else if (e.keyCode == 37) { // Left
                cameraGroup.position.z -= 0.5;
                this.config.Offset_Z -= 0.5;
            }
        };
        document.addEventListener("keydown", keyHandler);

        await uiManager.showClickPanel(panel, scene);

        document.removeEventListener("keydown", keyHandler);

        this.originPosition = new THREE.Vector3();
        this.camera.getWorldPosition(this.originPosition);

        // Reset camera group for session
        cameraGroup.position.set(0, -this.config.Offset_Y, 3.0);
    }
}

// --- Data Manager ---
class DataManager {
    constructor() {
        this.stimulusData = [];
    }

    createData(hdr_nameList, roundnum) {
        // Create 60 items (30 HDRs * 2 conditions)
        let stimulus_definitions = [];
        for (let i = 0; i < hdr_nameList.length; i++) {
            stimulus_definitions.push(hdr_nameList[i]); // ID 2*i (Head)
            stimulus_definitions.push(hdr_nameList[i]); // ID 2*i+1 (NoHead)
        }

        this.stimulusData = [];
        for (let i = 0; i < stimulus_definitions.length; i++) {
            this.stimulusData.push({
                id: i,
                hdr: stimulus_definitions[i],
                score: new Array(roundnum),
                tmpscore: 0
            });
        }
    }

    exportToCsv(filename, rows) {
        const processRow = function (row) {
            let finalVal = '';
            for (let j = 0; j < row.length; j++) {
                let innerValue = row[j] === null ? '' : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                }
                let result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0)
                    result = '"' + result + '"';
                if (j > 0)
                    finalVal += ',';
                finalVal += result;
            }
            return finalVal + '\n';
        };

        let csvFile = '';
        for (let i = 0; i < rows.length; i++) {
            csvFile += processRow(rows[i]);
        }

        const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

// --- Stimulus Manager ---
class StimulusManager {
    constructor(config) {
        this.config = config;
        this.mesh = null;
        this.geometry_files = [];
        this.geometry_url = [];
        this.hdr_files = [];
        this.materials = [];
        this.initMaterials();
    }

    initMaterials() {
        const pla0075 = new THREE.MeshPhysicalMaterial({ color: 0xa8a8a8, metalness: 0, roughness: 0, clearcoat: 1.0, clearcoatRoughness: 0.075, ior: 1.5, reflectivity: 0.5, specularIntensity: 0 });

        this.materials = [pla0075];

        // Shuffle materials based on seed
        for (let i = this.materials.length - 1; i >= 0; i--) {
            let changenum = this.config.changeseedlist[i] % this.materials.length;
            let tmpStorage = this.materials[i];
            this.materials[i] = this.materials[changenum];
            this.materials[changenum] = tmpStorage;
        }
    }

    async loadModels() {
        const manager = new THREE.LoadingManager(() => console.log("Finished Model loading"));
        const loader = new OBJLoader(manager);

        for (let i = 0; i < this.config.nameList_geometry.length; i++) {
            const element = this.config.nameList_geometry[i];
            const path = this.config.basePath_geometry + element + '.obj';
            await new Promise((resolve, reject) => {
                loader.load(path, (obj) => {
                    this.geometry_files.push(obj.children[0]);
                    this.geometry_url.push(element);
                    resolve();
                }, undefined, reject);
            });
        }

        // Shuffle models
        for (let i = this.geometry_url.length - 1; i >= 0; i--) {
            let changenum = (this.config.changeseedlist[i] + this.config.index_material) % this.geometry_url.length;
            let tmp1 = this.geometry_url[i]; this.geometry_url[i] = this.geometry_url[changenum]; this.geometry_url[changenum] = tmp1;
            let tmp2 = this.geometry_files[i]; this.geometry_files[i] = this.geometry_files[changenum]; this.geometry_files[changenum] = tmp2;
        }
        console.log(this.geometry_url)
    }

    async loadHDRs() {
        const manager = new THREE.LoadingManager(() => console.log("Finished HDR loading"));
        const loader = new RGBELoader(manager);

        for (let i = 0; i < this.config.hdr_nameList.length; i++) {
            const element = this.config.hdr_nameList[i];
            const path = this.config.basePath_HDR + element + '.hdr';
            await new Promise((resolve, reject) => {
                loader.load(path, (texture) => {
                    this.hdr_files.push(texture);
                    resolve();
                }, undefined, reject);
            });
        }
    }

    updateMesh(scene, index_shape, index_material) {
        if (this.mesh != null) scene.remove(this.mesh);

        this.mesh = this.geometry_files[index_shape];
        const coe_load = 0.3;
        this.mesh.scale.set(coe_load, coe_load, coe_load);
        this.mesh.position.set(0, 0, 0);

        this.mesh.material = this.materials[index_material];
        this.mesh.material.needsUpdate = true;
        this.mesh.castShadow = true;

        scene.add(this.mesh);
        const coe = 0.055;
        this.mesh.scale.set(coe, coe, coe);
    }

    setHDR(scene, index) {
        const hdr = this.hdr_files[index];
        hdr.encoding = THREE.RGBEEncoding;
        hdr.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = hdr;
        scene.environment = hdr;
    }
}

// --- Experiment Manager ---
class ExperimentManager {
    constructor() {
        this.config = new ExperimentConfig();
        this.config.init();

        this.canvas = document.querySelector('canvas.webgl');
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(this.config.fov, this.config.sizes.width / this.config.sizes.height, 0.01, this.config.dist() * 10);
        this.cameraGroup = new THREE.Group();
        this.cameraGroup.add(this.camera);
        this.cameraGroup.position.set(0, -this.config.Offset_Y, 3.0);
        this.scene.add(this.cameraGroup);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(this.config.sizes.width, this.config.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        this.renderer.toneMapping = THREE.CustomToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.xr.enabled = true;
        document.body.appendChild(VRButton.createButton(this.renderer));

        this.uiManager = new UIManager(this.config, this.scene, this.camera);
        this.audioManager = new AudioManager();
        this.headTracker = new HeadTracker(this.camera, this.config);
        this.dataManager = new DataManager();
        this.stimulusManager = new StimulusManager(this.config);

        this.mouse_pl = new THREE.Vector2(0, 0);

        this.setupToneMapping();
        this.setupEventListeners();

        this.renderer.setAnimationLoop(() => this.animate());
        this.testcontinue = true;
    }

    setupToneMapping() {
        THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(
            'vec3 CustomToneMapping( vec3 color ) { return color; }',
            `
            vec3 CustomToneMapping( vec3 color ) {
                float sR = color.r; float sG = color.g; float sB = color.b;
                float R = (sR > 0.04045) ? pow((sR + 0.055) / 1.055, 2.4) : (sR / 12.92);
                float G = (sG > 0.04045) ? pow((sG + 0.055) / 1.055, 2.4) : (sG / 12.92);
                float B = (sB > 0.04045) ? pow((sB + 0.055) / 1.055, 2.4) : (sB / 12.92);
                float X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
                float Y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750;
                float Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041;
                float pwhite = 10.0;
                float Lscaled = Y / 1.19;
                Y = (Lscaled * (1.0 + Lscaled / pow(pwhite, 2.0))) / (1.0 + Lscaled);
                float x = 0.3127; float y = 0.3290;
                X = Y / y * x; Z = Y / y * (1.0 - x - y);
                R = X *  3.2404542 + Y * -1.5371385 + Z * -0.4985314;
                G = X * -0.9692660 + Y *  1.8760108 + Z *  0.0415560;
                B = X *  0.0556434 + Y * -0.2040259 + Z *  1.0572252;
                sR = (R > 0.0031308) ? 1.055 * pow(R, (1.0 / 2.4)) - 0.055 : 12.92 * R;
                sG = (G > 0.0031308) ? 1.055 * pow(G, (1.0 / 2.4)) - 0.055 : 12.92 * G;
                sB = (B > 0.0031308) ? 1.055 * pow(B, (1.0 / 2.4)) - 0.055 : 12.92 * B;
                return saturate(vec3(sR, sG, sB));
            }`
        );
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', e => {
            this.mouse_pl.x += e.movementX / this.config.position_ratio;
            this.mouse_pl.y += e.movementY / this.config.position_ratio;
        });
        document.addEventListener('pointerlockchange', () => {
            console.log(document.pointerLockElement == document.body ? "pointer locked" : "pointer unlocked");
        });
        document.addEventListener('keydown', (e) => {
            if (e.keyCode == 27) document.exitPointerLock(); // ESC
            if (e.keyCode == 80) document.body.requestPointerLock(); // P
        });
    }

    onWindowResize() {
        this.config.sizes.width = window.innerWidth;
        this.config.sizes.height = window.innerHeight;
        this.camera.aspect = this.config.sizes.width / this.config.sizes.height;
        this.camera.position.set(0, 0, this.config.dist());
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.config.sizes.width, this.config.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    animate() {
        this.headTracker.update();
        ThreeMeshUI.update();
        this.renderer.render(this.scene, this.camera);
    }

    async run() {
        const loadPanel = this.uiManager.createTemplatePanel("Now Loading", -this.config.Offset_Y, -this.config.Offset_Z);
        this.scene.add(loadPanel);

        await this.stimulusManager.loadModels();
        await this.stimulusManager.loadHDRs();

        // Preload
        this.stimulusManager.updateMesh(this.scene, 0, this.config.index_material);
        for (let i = 0; i < this.stimulusManager.hdr_files.length; i++) {
            this.stimulusManager.setHDR(this.scene, i);
            await new Promise(r => setTimeout(r, 30));
        }
        this.scene.remove(this.stimulusManager.mesh);
        this.scene.remove(loadPanel);

        await this.uiManager.showVRPanel(this.scene, this.renderer);

        await this.headTracker.runAdjustmentSession(this.scene, this.uiManager, this.cameraGroup, this.stimulusManager);

        await this.runSession();
    }

    async runSession() {
        this.uiManager.createSliderPanel();

        for (let session = this.config.modelstart - 1; session < this.stimulusManager.geometry_files.length; session++) {
            this.dataManager.createData(this.config.hdr_nameList, this.config.roundnum);

            let ReportTable_Head = [[...this.config.hdr_nameList]];
            let ReportTable_NoHead = [[...this.config.hdr_nameList]];

            this.stimulusManager.updateMesh(this.scene, session, this.config.index_material);
            this.cameraGroup.position.set(0, -this.config.Offset_Y, this.config.Offset_Z);
            this.camera.remove(this.uiManager.sliderPanel);

            // Test Session
            const testIntro = this.uiManager.createTemplatePanel('Right Click \n To Test Session', 0, 0.2);
            testIntro.scale.set(0.2, 0.2, 0.2);
            await this.uiManager.showClickPanel(testIntro, this.scene);

            this.camera.add(this.uiManager.sliderPanel);
            await this.runTestSession();
            await new Promise(r => setTimeout(r, 100));
            this.camera.remove(this.uiManager.sliderPanel);

            // Exp Session
            const expIntro = this.uiManager.createTemplatePanel('Right Click \n To Exp ' + (session + 1) + '/' + this.config.nameList_geometry.length, 0, 0.2);
            expIntro.scale.set(0.2, 0.2, 0.2);
            await this.uiManager.showClickPanel(expIntro, this.scene);

            this.camera.add(this.uiManager.sliderPanel);

            for (let round = 0; round < this.config.roundnum; round++) {
                console.log("round" + round + "start");

                // Interleave logic
                let indicesHead = [];
                let indicesNoHead = [];
                for (let i = 0; i < this.dataManager.stimulusData.length; i++) {
                    if (i % 2 === 0) indicesHead.push(i);
                    else indicesNoHead.push(i);
                }
                indicesHead.sort(() => Math.random() - 0.5);
                indicesNoHead.sort(() => Math.random() - 0.5);

                let trialIndices = [];
                for (let i = 0; i < indicesHead.length; i++) {
                    trialIndices.push(indicesHead[i]);
                    trialIndices.push(indicesNoHead[i]);
                }

                for (let i = 0; i < trialIndices.length; i++) {
                    let trialIdx = trialIndices[i];
                    let currentStimulus = this.dataManager.stimulusData[trialIdx];
                    let isHead = (currentStimulus.id % 2 === 0);
                    let hdrIndex = Math.floor(currentStimulus.id / 2);

                    await this.headTracker.waitForReset(this.scene, this.uiManager);

                    this.stimulusManager.setHDR(this.scene, hdrIndex);

                    if (isHead) {
                        this.audioManager.playHead();
                        const panel = this.uiManager.createMiniPanel('Move your head !', 0, 0.1, 0.3);
                        await this.uiManager.showAutoClosePanel(panel, this.scene);
                    } else {
                        this.audioManager.playNoHead();
                        const panel = this.uiManager.createMiniPanel('Don\'t Move !', 0, 0.1, 0.3);
                        await this.uiManager.showAutoClosePanel(panel, this.scene);
                    }

                    // Attach mesh to appropriate parent based on condition
                    if (isHead) {
                        // Head condition: mesh stays in world space
                        this.scene.attach(this.stimulusManager.mesh);
                        this.stimulusManager.mesh.position.set(0, 0, 0);
                        this.stimulusManager.mesh.rotation.set(0, 0, 0);
                        await this.headTracker.wait(0.15);
                    } else {
                        // NoHead condition: mesh fixed to camera (no parallax)
                        this.camera.attach(this.stimulusManager.mesh);
                    }

                    await this.runOneTrial();

                    currentStimulus.score[round] = this.uiManager.sliderValue;
                    currentStimulus.tmpscore = this.uiManager.sliderValue;
                    console.log(`HDR: ${currentStimulus.hdr}, score: ${this.uiManager.sliderValue.toFixed(3)}`);

                    await new Promise(r => setTimeout(r, 50));
                    this.scene.attach(this.stimulusManager.mesh);
                }

                let scoresHead = [];
                let scoresNoHead = [];
                for (let i = 0; i < this.dataManager.stimulusData.length; i++) {
                    let val = this.dataManager.stimulusData[i].tmpscore;
                    if (i % 2 === 0) scoresHead.push(val);
                    else scoresNoHead.push(val);
                }
                ReportTable_Head.push(scoresHead);
                ReportTable_NoHead.push(scoresNoHead);
            }

            let geometryName = this.stimulusManager.geometry_url[session].replace(/\.obj/g, "");
            this.dataManager.exportToCsv(this.config.experiment_name + "_" + this.config.nameList_material[this.config.index_material] + "_" + geometryName + "_Head.csv", ReportTable_Head);
            this.dataManager.exportToCsv(this.config.experiment_name + "_" + this.config.nameList_material[this.config.index_material] + "_" + geometryName + "_NoHead.csv", ReportTable_NoHead);
        }

        console.log("Exp Finished");
        this.scene.background = new THREE.Color(0x333333);
        this.camera.remove(this.uiManager.sliderPanel);
        this.scene.remove(this.stimulusManager.mesh);
        const finishPanel = this.uiManager.createTemplatePanel('Thank you!!', 0, 0.2);
        finishPanel.scale.set(0.2, 0.2, 0.2);
        this.scene.add(finishPanel);
    }

    async runTestSession() {
        this.testcontinue = true;
        let testcount = 0;

        while (this.testcontinue) {
            // Determine condition: even = Head, odd = NoHead
            let isHead = (testcount % 2 === 0);

            await this.headTracker.waitForReset(this.scene, this.uiManager);

            // Use dummy data for test
            this.stimulusManager.setHDR(this.scene, testcount % this.stimulusManager.hdr_files.length);

            let finishPanel = null;

            if (testcount < this.stimulusManager.hdr_files.length) {
                if (isHead) {
                    this.audioManager.playHead();
                    const panel = this.uiManager.createMiniPanel('Test: Move your head !', 0, 0.1, 0.3);
                    await this.uiManager.showAutoClosePanel(panel, this.scene);
                } else {
                    this.audioManager.playNoHead();
                    const panel = this.uiManager.createMiniPanel('Test: Don\'t Move !', 0, 0.1, 0.3);
                    await this.uiManager.showAutoClosePanel(panel, this.scene);
                }
            } else {
                finishPanel = this.uiManager.createMiniPanel('Right Click to finish test', 0.2, 0, 0.4);
                this.scene.add(finishPanel);
            }

            // Attach mesh based on condition (same as main session)
            if (isHead) {
                this.scene.attach(this.stimulusManager.mesh);
                this.stimulusManager.mesh.position.set(0, 0, 0);
                this.stimulusManager.mesh.rotation.set(0, 0, 0);
                await this.headTracker.wait(0.15);
            } else {
                this.camera.attach(this.stimulusManager.mesh);
            }

            await this.runTestTrial(testcount);

            if (finishPanel) {
                this.scene.remove(finishPanel);
            }

            testcount++;
        }
    }

    async runTestTrial(testcount) {
        return new Promise((resolve) => {
            let mousex1 = this.mouse_pl.x + (Math.random() - 0.5) * 3;

            const trialloop = () => {
                let mousex2 = this.mouse_pl.x;
                this.uiManager.handle.position.x = (mousex2 - mousex1) * this.config.slider_vel;
                this.uiManager.handle.position.x = Math.max(-this.uiManager.slider.getWidth() / 2, Math.min(this.uiManager.slider.getWidth() / 2, this.uiManager.handle.position.x));

                if (this.trialRunning) {
                    this.renderer.xr.getSession().requestAnimationFrame(trialloop);
                }
            };

            this.trialRunning = true;
            // Check if VR session exists before starting loop
            if (this.renderer.xr.getSession()) {
                trialloop();
            } else {
                // Fallback for non-VR testing if needed, or just warn
                console.warn("VR Session not active, slider animation might not work");
            }

            const trialFunction = (e) => {
                if (e.button == 0) {
                    this.uiManager.updateValue();
                    console.log(this.uiManager.sliderValue);
                    this.uiManager.sliderValue = 0.5;
                    this.uiManager.updateSlider();
                    this.trialRunning = false;
                    document.removeEventListener("mousedown", trialFunction);
                    resolve(false);
                }
                if (e.button == 2 && testcount >= this.stimulusManager.hdr_files.length) {
                    this.trialRunning = false;
                    this.testcontinue = false;
                    document.removeEventListener("mousedown", trialFunction);
                    resolve(true);
                }
            };
            document.addEventListener("mousedown", trialFunction);
        });
    }

    async runOneTrial() {
        return new Promise((resolve) => {
            let mousex1 = this.mouse_pl.x + (Math.random() - 0.5) * 3;

            const trialloop = () => {
                let mousex2 = this.mouse_pl.x;
                this.uiManager.handle.position.x = (mousex2 - mousex1) * this.config.slider_vel;
                this.uiManager.handle.position.x = Math.max(-this.uiManager.slider.getWidth() / 2, Math.min(this.uiManager.slider.getWidth() / 2, this.uiManager.handle.position.x));

                if (this.trialRunning) {
                    this.renderer.xr.getSession().requestAnimationFrame(trialloop);
                }
            };

            this.trialRunning = true;
            if (this.renderer.xr.getSession()) {
                trialloop();
            }

            const trialFunction = (e) => {
                if (e.button == 0) {
                    this.uiManager.updateValue();
                    this.trialRunning = false;
                    document.removeEventListener("mousedown", trialFunction);
                    resolve();
                }
            };
            document.addEventListener("mousedown", trialFunction);
        });
    }
}

// --- Main ---
const experiment = new ExperimentManager();
experiment.run();