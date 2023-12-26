import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import * as dat from 'dat.gui';

const gui = new dat.GUI();
const settings = {
    boidMinSpeed: 0,
    boidMaxSpeed: 0.85,
    boidMinForce: 0,
    boidMaxForce: 0.05,
}

// Adding GUI controls for min and max speed
gui.add(settings, 'boidMinSpeed', 0, 5).name('Min Speed').onChange(updateSpeedRange);
gui.add(settings, 'boidMaxSpeed', 0, 5).name('Max Speed').onChange(updateSpeedRange);
gui.add(settings, 'boidMinForce', 0, 0.25).name('Min Force').onChange(updateForceRange);
gui.add(settings, 'boidMaxForce', 0, 0.25).name('Max Force').onChange(updateForceRange);

function main() {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const canvas = document.querySelector('#simulation-container');
    const renderer = setupRenderer(canvas);
    const camera = setupCamera();
    const controls = setupControls(camera, renderer.domElement);

    // Lighting and Sky
    setupLighting(scene);

    // World bounds
    const worldBounds = 200;
    createWorldBounds(scene, worldBounds);

    // Boids
    const boids = setupBoids(scene, worldBounds);

    // Render loop
    requestAnimationFrame(function render(time) {
        updateScene(scene, time, controls, renderer, camera, boids, worldBounds);
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }); 
}

function getRandomColor() {
    const brightColors = [
        0xff0000, // Red
        0x00ff00, // Green
        0x0000ff, // Blue
        0xffff00, // Yellow
        0x00ffff, // Cyan
        0xff00ff, // Magenta
    ];
    const color = brightColors[Math.floor(Math.random() * brightColors.length)];
    return color;
}
// Ensure min speed is always less than or equal to max speed
function updateSpeedRange() {
    if (settings.boidMinSpeed > settings.boidMaxSpeed) {
        settings.boidMinSpeed = settings.boidMaxSpeed;
    }
}

// Ensure min force is always less than or equal to max speed
function updateForceRange() {
    if (settings.boidMinForce > settings.boidMaxForce) {
        settings.boidMinForce = settings.boidMaxForce;
    }
}

function makeBoidInstance(scene, color, boidGeometry, maxSpeed, minSpeed, spawnRadius) {
    const material = new THREE.MeshToonMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.6
    });

    const boid = new THREE.Mesh(boidGeometry, material);

    boid.userData.velocity = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * (maxSpeed - minSpeed) + minSpeed);
    
    scene.add(boid);

    let spawnPoint = new THREE.Vector3().randomDirection();
    spawnPoint.normalize();
    spawnPoint.multiplyScalar(Math.random() * spawnRadius);
    
    boid.position.set(spawnPoint.x, spawnPoint.y, spawnPoint.z);

    return boid;
}

function setupRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.75;
    return renderer;
}

function setupCamera() {
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 5000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(133.33, 114.29, 133.33);
    return camera;
}

function setupControls(camera, domElement) {
    const controls = new OrbitControls(camera, domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enablePan = false;
    return controls;
}

function setupLighting(scene) {
    const ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    mainLight.position.set(-1, 2, 4);
    scene.add(mainLight);
}

function createWorldBounds(scene, worldBounds) {
    const size = worldBounds;
    const geometry = new THREE.BoxGeometry(size, size, size, 2, 2, 2);
    const edgeGeometry = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
    const mesh = new THREE.LineSegments(edgeGeometry, material);
    scene.add(mesh);
}

function setupBoids(scene, worldBounds) {
    // Boid parameters
    const boidRadius = 1.0;
    const boidHeight = 3.3;
    const radialSegments = 9;
    const boidGeometry = new THREE.ConeGeometry(boidRadius, boidHeight, radialSegments).rotateX(Math.PI / 2);

    // Common parameters for boids
    const spawnRadius = worldBounds / 2;
    const numberOfBoids = 500;

    // Create boids
    let boids = [];
    for (let i = 0; i < numberOfBoids; i++) {
        boids.push(makeBoidInstance(scene, getRandomColor(), boidGeometry, settings.boidMaxSpeed, settings.boidMinSpeed, spawnRadius));
    }

    return boids;
}

function align(boid, boids, perceptionRadius) {
    let steering = new THREE.Vector3();
    let total = 0;
    for (let other of boids) {
        let distance = boid.position.distanceTo(other.position);
        if (other !== boid && distance < perceptionRadius) {
            steering.add(other.userData.velocity);
            total++;
        }
    }
    if (total > 0) {
        steering.divideScalar(total);
        steering.normalize();
        steering.multiplyScalar(settings.boidMaxSpeed);
        steering.sub(boid.userData.velocity);
        steering.clampLength(0, settings.boidMaxForce);
    }
    return steering;
}

function cohesion(boid, boids, perceptionRadius) {
    let steering = new THREE.Vector3();
    let total = 0;
    for (let other of boids) {
        let distance = boid.position.distanceTo(other.position);
        if (other !== boid && distance < perceptionRadius) {
            steering.add(other.position);
            total++;
        }
    }
    if (total > 0) {
        steering.divideScalar(total);
        steering.sub(boid.position);
        steering.normalize();
        steering.multiplyScalar(settings.boidMaxSpeed);
        steering.sub(boid.userData.velocity);
        steering.clampLength(0, settings.boidMaxForce);
    }
    return steering;
}

function separation(boid, boids, perceptionRadius) {
    let steering = new THREE.Vector3();
    let total = 0;
    for (let other of boids) {
        let distance = boid.position.distanceTo(other.position);
        if (other !== boid && distance < perceptionRadius) {
            let diff = boid.position.clone().sub(other.position);
            diff.divideScalar(distance);
            steering.add(diff);
            total++;
        }
    }
    if (total > 0) {
        steering.divideScalar(total);
        steering.normalize();
        steering.multiplyScalar(settings.boidMaxSpeed);
        steering.sub(boid.userData.velocity);
        steering.clampLength(0, settings.boidMaxForce);
    }
    return steering;
}

function updateScene(scene, time, controls, renderer, camera, boids, worldBounds) {
    time *= 0.001;
    controls.update();

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    // Update boids - Implement the logic for boid movement
    boids.forEach((boid) => {
        let alignment = align(boid, boids, 50); // Adjust the perception radius as needed
        let cohesionForce = cohesion(boid, boids, 50);
        let separationForce = separation(boid, boids, 50);

        boid.userData.velocity.add(alignment);
        boid.userData.velocity.add(cohesionForce);
        boid.userData.velocity.add(separationForce);

        boid.position.add(boid.userData.velocity);

        wrapAround(boid, worldBounds / 2, boid.position);

        boid.lookAt(boid.position.clone().add(boid.userData.velocity));
    });

    renderer.render(scene, camera);
}

function wrapAround(boid, boundary) {
    let wrapped = false;

    if (boid.position.x > boundary) {
        boid.position.x = -boundary;
        wrapped = true;
    } else if (boid.position.x < -boundary) {
        boid.position.x = boundary;
        wrapped = true;
    }

    if (boid.position.y > boundary) {
        boid.position.y = -boundary;
        wrapped = true;
    } else if (boid.position.y < -boundary) {
        boid.position.y = boundary;
        wrapped = true;
    }

    if (boid.position.z > boundary) {
        boid.position.z = -boundary;
        wrapped = true;
    } else if (boid.position.z < -boundary) {
        boid.position.z = boundary;
        wrapped = true;
    }
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

main();