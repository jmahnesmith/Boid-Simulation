// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"index.js":[function(require,module,exports) {
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function main() {
  // Scene setup
  var scene = new THREE.Scene();
  var canvas = document.querySelector('#simulation-container');
  var renderer = setupRenderer(canvas);
  var camera = setupCamera();
  var controls = setupControls(camera, renderer.domElement);

  // Lighting and Sky
  setupLighting(scene);
  setupSky(scene, renderer, camera);

  // World bounds
  var worldBounds = 200;
  createWorldBounds(scene, worldBounds);

  // Boids and Obstacles
  var _setupBoidsAndObstacl = setupBoidsAndObstacles(scene, worldBounds),
    _setupBoidsAndObstacl2 = _slicedToArray(_setupBoidsAndObstacl, 2),
    boids = _setupBoidsAndObstacl2[0],
    obstacles = _setupBoidsAndObstacl2[1];

  // Render loop
  requestAnimationFrame(function render(time) {
    updateScene(time, controls, renderer, camera, obstacles, boids);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  });
  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  function makeObstacleInstance(color, radius, x, z) {
    var material = new THREE.MeshToonMaterial({
      color: color
    });
    var obstacle = new THREE.Mesh(obstacleGeometry, material);
    obstacle.scale.multiplyScalar(radius);
    obstacle.userData.radius = radius;
    obstacle.userData.phase = Math.random() * Math.PI * 2;
    scene.add(obstacle);
    obstacle.position.set(x, Math.sin(obstacle.userData.phase) * worldBounds / 2, z);
    return obstacle;
  }
  function makeBoidInstance(color) {
    var material = new THREE.MeshToonMaterial({
      color: color
    });
    var boid = new THREE.Mesh(boidGeometry, material);
    boid.userData.velocity = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * (maxSpeed - minSpeed) + minSpeed);
    scene.add(boid);
    var spawnPoint = new THREE.Vector3().randomDirection();
    spawnPoint.normalize();
    spawnPoint.multiplyScalar(Math.random() * spawnRadius);
    boid.position.x = spawnPoint.x;
    boid.position.y = spawnPoint.y;
    boid.position.z = spawnPoint.z;
    return boid;
  }
}
function setupRenderer(canvas) {
  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.75;
  return renderer;
}
function setupCamera() {
  var fov = 75;
  var aspect = 2; // canvas default
  var near = 0.1;
  var far = 5000;
  var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(133.33, 114.29, 133.33);
  return camera;
}
function setupControls(camera, domElement) {
  var controls = new OrbitControls(camera, domElement);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.enablePan = false;
  return controls;
}
function setupLighting(scene) {
  var ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);
  var mainLight = new THREE.DirectionalLight(0xFFFFFF, 1);
  mainLight.position.set(-1, 2, 4);
  scene.add(mainLight);
}
function setupSky(scene, renderer, camera) {
  var sky = new Sky();
  sky.scale.setScalar(450000);
  scene.add(sky);
  var sun = new THREE.Vector3();

  // Sky and sun parameters
  var effectController = {
    turbidity: 6,
    rayleigh: 0.25,
    mieCoefficient: 0.001,
    mieDirectionalG: 0.4,
    elevation: 80,
    azimuth: 0,
    exposure: renderer.toneMappingExposure
  };

  // Update uniforms
  var uniforms = sky.material.uniforms;
  uniforms['turbidity'].value = effectController.turbidity;
  uniforms['rayleigh'].value = effectController.rayleigh;
  uniforms['mieCoefficient'].value = effectController.mieCoefficient;
  uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;
  var phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
  var theta = THREE.MathUtils.degToRad(effectController.azimuth);
  sun.setFromSphericalCoords(1, phi, theta);
  uniforms['sunPosition'].value.copy(sun);
  renderer.toneMappingExposure = effectController.exposure;
  renderer.render(scene, camera);
}
function createWorldBounds(scene, worldBounds) {
  var size = worldBounds;
  var geometry = new THREE.BoxGeometry(size, size, size, 2, 2, 2);
  var edgeGeometry = new THREE.EdgesGeometry(geometry);
  var material = new THREE.LineBasicMaterial({
    color: 0xFFFFFF
  });
  var mesh = new THREE.LineSegments(edgeGeometry, material);
  scene.add(mesh);
}
function setupBoidsAndObstacles(scene, worldBounds) {
  // Boid parameters
  var boidRadius = 1.0;
  var boidHeight = 3.3;
  var radialSegments = 9;
  var boidGeometry = new THREE.ConeGeometry(boidRadius, boidHeight, radialSegments).rotateX(Math.PI / 2);

  // Obstacle parameters
  var obstacleRadius = 1;
  var obstacleDetail = 1;
  var obstacleGeometry = new THREE.IcosahedronGeometry(obstacleRadius, obstacleDetail);

  // Common parameters for boids and obstacles
  var maxSpeed = 1.0;
  var minSpeed = 0.5;
  var spawnRadius = worldBounds / 2;
  var numberOfBoids = 500;
  var numberOfObstacles = 15;

  // Create boids
  var boids = [];
  for (var i = 0; i < numberOfBoids; i++) {
    boids.push(makeBoidInstance(getRandomColor(), boidGeometry, maxSpeed, minSpeed, spawnRadius));
  }

  // Create obstacles
  var obstacles = [];
  for (var _i = 0; _i < numberOfObstacles; _i++) {
    obstacles.push(makeObstacleInstance(getRandomColor(), obstacleGeometry, obstacleRadius, worldBounds));
  }
  return [boids, obstacles];
}
function makeObstacleInstance(color, obstacleGeometry, radius, worldBounds) {
  var material = new THREE.MeshToonMaterial({
    color: color
  });
  var obstacle = new THREE.Mesh(obstacleGeometry, material);
  obstacle.scale.multiplyScalar(radius);
  obstacle.userData.radius = radius;
  obstacle.userData.phase = Math.random() * Math.PI * 2;
  scene.add(obstacle);
  var x = Math.random() * worldBounds - worldBounds / 2;
  var z = Math.random() * worldBounds - worldBounds / 2;
  obstacle.position.set(x, Math.sin(obstacle.userData.phase) * worldBounds / 2, z);
  return obstacle;
}
function makeBoidInstance(color, boidGeometry, maxSpeed, minSpeed, spawnRadius) {
  var material = new THREE.MeshToonMaterial({
    color: color
  });
  var boid = new THREE.Mesh(boidGeometry, material);
  boid.userData.velocity = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * (maxSpeed - minSpeed) + minSpeed);
  scene.add(boid);
  var spawnPoint = new THREE.Vector3().randomDirection();
  spawnPoint.normalize();
  spawnPoint.multiplyScalar(Math.random() * spawnRadius);
  boid.position.set(spawnPoint.x, spawnPoint.y, spawnPoint.z);
  return boid;
}
function updateScene(time, controls, renderer, camera, obstacles, boids) {
  time *= 0.001;
  controls.update();
  if (resizeRendererToDisplaySize(renderer)) {
    var canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  // Update obstacles - Example: making them move or change over time
  obstacles.forEach(function (obstacle) {
    // Example: Oscillating the obstacles in the y-axis
    obstacle.position.y = Math.sin(obstacle.userData.phase + time) * 50;
  });

  // Update boids - Implement the logic for boid movement
  boids.forEach(function (boid) {
    // Implement boid behavior here
    // Example: Adjusting boid velocity based on boid rules (alignment, cohesion, separation)

    // Update boid position based on velocity
    boid.position.add(boid.userData.velocity);

    // Example: Boundary checks or wrapping logic
    wrapAround(boid, 200); // Assuming 'wrapAround' is a function you implement

    // Update boid rotation to face the direction of velocity
    boid.lookAt(boid.position.clone().add(boid.userData.velocity));
  });
}
function wrapAround(boid, boundary) {
  if (boid.position.x > boundary) boid.position.x = -boundary;else if (boid.position.x < -boundary) boid.position.x = boundary;
  if (boid.position.y > boundary) boid.position.y = -boundary;else if (boid.position.y < -boundary) boid.position.y = boundary;
  if (boid.position.z > boundary) boid.position.z = -boundary;else if (boid.position.z < -boundary) boid.position.z = boundary;
}
function resizeRendererToDisplaySize(renderer) {
  var canvas = renderer.domElement;
  var pixelRatio = window.devicePixelRatio;
  var width = canvas.clientWidth * pixelRatio | 0;
  var height = canvas.clientHeight * pixelRatio | 0;
  var needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
main();
},{}],"C:/Users/jwm21/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}
module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "52545" + '/');
  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);
    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);
          if (didAccept) {
            handled = true;
          }
        }
      });

      // Enable HMR for CSS by default.
      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });
      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }
    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }
    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }
    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}
function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}
function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}
function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }
  var parents = [];
  var k, d, dep;
  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }
  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }
  return parents;
}
function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}
function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }
  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }
  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}
function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }
  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }
  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }
}
},{}]},{},["C:/Users/jwm21/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/Boids.e31bb0bc.js.map