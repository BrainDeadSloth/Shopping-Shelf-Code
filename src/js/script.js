import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const hdrTextureURL = new URL('../../static/MR_INT-005_WhiteNeons_NAD.hdr', import.meta.url);

const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

renderer.setClearColor(0xA3A3A3);

const controls = new OrbitControls(camera, renderer.domElement);

camera.position.set(5, 1, 0);
controls.target = new THREE.Vector3(0, 1, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.5;
controls.maxDistance = 10;

const aLight = new THREE.AmbientLight(0x333333, 0.8);
// scene.add(aLight);

const dLight = new THREE.DirectionalLight(0xffffff, 1);
// scene.add(dLight);
dLight.position.set(2, 5, 5);

const grid = new THREE.GridHelper(30, 30);
scene.add(grid);

const loadingManager = new THREE.LoadingManager();

const progressBar = document.getElementById('progress-bar');

loadingManager.onProgress = function(url, loaded, total) {
    progressBar.value = (loaded / total) * 100;
}

const progressBarContainer = document.querySelector('.progress-bar-container');

loadingManager.onLoad = function() {
    progressBarContainer.style.display = 'none';
}

const gltfLoader = new GLTFLoader(loadingManager);

const rgbeLoader = new RGBELoader(loadingManager);

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 4;

const group = new THREE.Group();

rgbeLoader.load(hdrTextureURL, function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // scene.background = texture;
    scene.environment = texture;

    gltfLoader.load('./assets/shelf_1/scene.gltf', function(gltf) {
        const model = gltf.scene;
        scene.add(model);
        model.position.set(0.5, 0, 0);
    });

    gltfLoader.load('./assets/coke/scene.gltf', function(gltf) {
        const liquid = gltf.scene.getObjectByName('coca_cola_refrigerante_0');
        const liquidGeo = liquid.geometry.clone();
        const liquidMat = liquid.material;
        const liquidMesh = new THREE.InstancedMesh(liquidGeo, liquidMat, 200);
        group.add(liquidMesh);

        const bottle = gltf.scene.getObjectByName('garrafa_garrafa_0');
        const bottleGeo = bottle.geometry.clone();
        const bottleMat = bottle.material;
        const bottleMesh = new THREE.InstancedMesh(bottleGeo, bottleMat, 200);
        group.add(bottleMesh);

        const label = gltf.scene.getObjectByName('rotulo_rotulo_0');
        const labelGeo = label.geometry.clone();
        const labelMat = label.material;
        const labelMesh = new THREE.InstancedMesh(labelGeo, labelMat, 200);
        group.add(labelMesh);

        const lid = gltf.scene.getObjectByName('tampa_tampa_0');
        const lidGeo = lid.geometry.clone();
        const lidMat = lid.material;
        const lidMesh = new THREE.InstancedMesh(lidGeo, lidMat, 200);
        group.add(lidMesh);

        const dummy = new THREE.Object3D();
        for (let i = 0; i < 200; i++) {
            dummy.position.x = (Math.floor(Math.random() * (10 - 6) ) + 6) / 10;

            let rand = Math.floor(Math.random() * 4);

            switch (rand) {
                case 0:
                    dummy.position.y = 0.127;
                    break;
                case 1:
                    dummy.position.y = 0.62;
                    break;
                case 2:
                    dummy.position.y = 1.13;
                    break;
                case 3:
                    dummy.position.y = 1.63;
                    break;
            
                default:
                    break;
            }

            dummy.position.z = (Math.floor(Math.random() * (195 - (-195)) ) + (-195)) / 100;
            dummy.scale.set(0.08, 0.08, 0.08);
            dummy.rotation.x = -0.5 * Math.PI;

            dummy.updateMatrix();
            liquidMesh.setMatrixAt(i, dummy.matrix);
            bottleMesh.setMatrixAt(i, dummy.matrix);
            labelMesh.setMatrixAt(i, dummy.matrix);
            lidMesh.setMatrixAt(i, dummy.matrix);
        }
    });

});

scene.add(group);

function animate(time) {
    controls.update();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});