import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';

const maxSpeed = 1.0;
const maxForce = 0.05;


function main() {
    // Scene setup
    const scene = new THREE.Scene();
    const canvas = document.querySelector('#simulation-container');
    const renderer = setupRenderer(canvas);
    const camera = setupCamera();
    const controls = setupControls(camera, renderer.domElement);

    // Lighting and Sky
    setupLighting(scene);
    setupSky(scene, renderer, camera);

    // World bounds
    const worldBounds = 200;
    createWorldBounds(scene, worldBounds);

    // Boids and Obstacles
    const [boids, obstacles] = setupBoidsAndObstacles(scene, worldBounds);

    // Render loop
    requestAnimationFrame(function render(time) {
        updateScene(scene, time, controls, renderer, camera, obstacles, boids, worldBounds);
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }); 
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function makeBoidInstance(scene, color, boidGeometry, maxSpeed, minSpeed, spawnRadius) {
    const material = new THREE.MeshToonMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.3
    });

    const boid = new THREE.Mesh(boidGeometry, material);

    boid.userData.velocity = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * (maxSpeed - minSpeed) + minSpeed);
    
    scene.add(boid);

    let spawnPoint = new THREE.Vector3().randomDirection();
    spawnPoint.normalize();
    spawnPoint.multiplyScalar(Math.random() * spawnRadius);
    
    boid.position.x = spawnPoint.x;
    boid.position.y = spawnPoint.y;
    boid.position.z = spawnPoint.z;

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
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    mainLight.position.set(-1, 2, 4);
    scene.add(mainLight);
}

function setupSky(scene, renderer, camera) {
    const sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    const sun = new THREE.Vector3();

    // Sky and sun parameters
    const effectController = {
        turbidity: 6,
        rayleigh: 0.25,
        mieCoefficient: 0.001,
        mieDirectionalG: 0.4,
        elevation: 5,
        azimuth: 0,
        exposure: renderer.toneMappingExposure
    };

    // Update uniforms
    const uniforms = sky.material.uniforms;
    uniforms['turbidity'].value = effectController.turbidity;
    uniforms['rayleigh'].value = effectController.rayleigh;
    uniforms['mieCoefficient'].value = effectController.mieCoefficient;
    uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
    const theta = THREE.MathUtils.degToRad(effectController.azimuth);
    sun.setFromSphericalCoords(1, phi, theta);

    uniforms['sunPosition'].value.copy(sun);
    renderer.toneMappingExposure = effectController.exposure;
    renderer.render(scene, camera);
}

function createWorldBounds(scene, worldBounds) {
    const size = worldBounds;
    const geometry = new THREE.BoxGeometry(size, size, size, 2, 2, 2);
    const edgeGeometry = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
    const mesh = new THREE.LineSegments(edgeGeometry, material);
    scene.add(mesh);
}

function setupBoidsAndObstacles(scene, worldBounds) {
    // Boid parameters
    const boidRadius = 1.0;
    const boidHeight = 3.3;
    const radialSegments = 9;
    const boidGeometry = new THREE.ConeGeometry(boidRadius, boidHeight, radialSegments).rotateX(Math.PI / 2);

    // Obstacle parameters
    const obstacleRadius = 1;  
    const obstacleDetail = 1;  
    const obstacleGeometry = new THREE.IcosahedronGeometry(obstacleRadius, obstacleDetail);

    // Common parameters for boids and obstacles
    const maxSpeed = 1.0;
    const minSpeed = 0.5;
    const spawnRadius = worldBounds / 2;
    const numberOfBoids = 500;
    const numberOfObstacles = 5;

    // Create boids
    let boids = [];
    for (let i = 0; i < numberOfBoids; i++) {
        boids.push(makeBoidInstance(scene, getRandomColor(), boidGeometry, maxSpeed, minSpeed, spawnRadius));
    }

    // Create obstacles
    let obstacles = [];
    for (let i = 0; i < numberOfObstacles; i++) {
        obstacles.push(makeObstacleInstance(scene, getRandomColor(), obstacleGeometry, obstacleRadius, worldBounds));
    }

    return [boids, obstacles];
}

function makeObstacleInstance(scene, color, obstacleGeometry, radius, worldBounds) {
    const material = new THREE.MeshToonMaterial({ color });
    const obstacle = new THREE.Mesh(obstacleGeometry, material);
    obstacle.scale.multiplyScalar(radius);
    obstacle.userData.radius = radius;
    obstacle.userData.phase = Math.random() * Math.PI * 2;
    scene.add(obstacle);

    const x = Math.random() * worldBounds - worldBounds / 2;
    const z = Math.random() * worldBounds - worldBounds / 2;
    obstacle.position.set(x, Math.sin(obstacle.userData.phase) * worldBounds / 2, z);

    return obstacle;
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
        steering.multiplyScalar(maxSpeed);
        steering.sub(boid.userData.velocity);
        steering.clampLength(0, maxForce);
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
        steering.multiplyScalar(maxSpeed);
        steering.sub(boid.userData.velocity);
        steering.clampLength(0, maxForce);
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
        steering.multiplyScalar(maxSpeed);
        steering.sub(boid.userData.velocity);
        steering.clampLength(0, maxForce);
    }
    return steering;
}

function updateScene(scene, time, controls, renderer, camera, obstacles, boids, worldBounds) {
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

        wrapAround(boid, worldBounds / 2);

        boid.lookAt(boid.position.clone().add(boid.userData.velocity));
    });

    // Update obstacles - Example: making them move or change over time
    obstacles.forEach((obstacle) => {
        // Example: Oscillating the obstacles in the y-axis
        obstacle.position.y = Math.sin(obstacle.userData.phase + time) * 50; 
    });

    renderer.render(scene, camera);
}

function wrapAround(boid, boundary) {
    if (boid.position.x > boundary) boid.position.x = -boundary;
    else if (boid.position.x < -boundary) boid.position.x = boundary;

    if (boid.position.y > boundary) boid.position.y = -boundary;
    else if (boid.position.y < -boundary) boid.position.y = boundary;

    if (boid.position.z > boundary) boid.position.z = -boundary;
    else if (boid.position.z < -boundary) boid.position.z = boundary;
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