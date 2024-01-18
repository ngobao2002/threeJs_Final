import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextureLoader } from 'three';

const keyIndicators = {
  a: document.getElementById('keyA'),
  s: document.getElementById('keyS'),
  d: document.getElementById('keyD'),
  w: document.getElementById('keyW'),
};

function updateKeyIndicator(key, isPressed) {
  keyIndicators[key].style.backgroundColor = isPressed ? '#4CAF50' : '#ddd'; // Change color when pressed
}

window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = true;
      updateKeyIndicator('a', true);
      break;
    case 'KeyD':
      keys.d.pressed = true;
      updateKeyIndicator('d', true);
      break;
    case 'KeyS':
      keys.s.pressed = true;
      updateKeyIndicator('s', true);
      break;
    case 'KeyW':
      keys.w.pressed = true;
      updateKeyIndicator('w', true);
      break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = false;
      updateKeyIndicator('a', false);
      break;
    case 'KeyD':
      keys.d.pressed = false;
      updateKeyIndicator('d', false);
      break;
    case 'KeyS':
      keys.s.pressed = false;
      updateKeyIndicator('s', false);
      break;
    case 'KeyW':
      keys.w.pressed = false;
      updateKeyIndicator('w', false);
      break;
  }
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4.61, 2.74, 8);

const backgroundTextureUrl = 'assets/385007399_1285701365441291_6608515030540178832_n.jpg';
const backgroundTexture = new TextureLoader().load(backgroundTextureUrl);

const backgroundGeometry = new THREE.BoxGeometry(1000, 1000, 1000); // Adjust the size as needed
const backgroundMaterial = new THREE.MeshBasicMaterial({ map: backgroundTexture, side: THREE.BackSide });
const backgroundCube = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
scene.add(backgroundCube);



const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

class Box extends THREE.Mesh {
  constructor({
    width,
    height,
    depth,
    color = '#00ff00',
    velocity = { x: 0, y: 0, z: 0 },
    position = { x: 0, y: 0, z: 0 },
    zAcceleration = false,
    textureUrl,
  }) {
    super(
      new THREE.BoxGeometry(width, height, depth),
      textureUrl
        ? new THREE.MeshStandardMaterial({ map: new TextureLoader().load(textureUrl) })
        : new THREE.MeshStandardMaterial({ color })
    );

    this.width = width;
    this.height = height;
    this.depth = depth;

    this.position.set(position.x, position.y, position.z);

    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;

    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;

    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;

    this.velocity = velocity;
    this.gravity = -0.002;

    this.zAcceleration = zAcceleration;
  }

  updateSides() {
    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;

    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;

    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;
  }

  update(ground) {
    this.updateSides();

    if (this.zAcceleration) this.velocity.z += 0.0003;

    this.position.x += this.velocity.x;
    this.position.z += this.velocity.z;

    this.applyGravity(ground);
  }

  applyGravity(ground) {
    this.velocity.y += this.gravity;

    if (boxCollision({ box1: this, box2: ground })) {
      const friction = 0.5;
      this.velocity.y *= friction;
      this.velocity.y = -this.velocity.y;
    } else this.position.y += this.velocity.y;
  }

  reset() {
    this.position.set(0, 0, 0);
    this.velocity.set(0, -0.01, 0);
  }
}

function boxCollision({ box1, box2 }) {
  const xCollision = box1.right >= box2.left && box1.left <= box2.right;
  const yCollision = box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom;
  const zCollision = box1.front >= box2.back && box1.back <= box2.front;

  return xCollision && yCollision && zCollision;
}

const cubeTextureUrl = 'assets/arid2_lf.jpg';
const cube = new Box({
  width: 1,
  height: 1,
  depth: 1,
  velocity: { x: 0, y: -0.01, z: 0 },
  textureUrl: cubeTextureUrl,
});
cube.castShadow = true;
scene.add(cube);

const ground = new Box({
  width: 10,
  height: 0.5,
  depth: 50,
  color: '#0369a1',
  position: { x: 0, y: -2, z: 0 },
});

ground.receiveShadow = true;
scene.add(ground);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.y = 3;
light.position.z = 1;
light.castShadow = true;
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

camera.position.z = 5;

const keys = {
  a: { pressed: false },
  d: { pressed: false },
  s: { pressed: false },
  w: { pressed: false },
};

window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = true;
      break;
    case 'KeyD':
      keys.d.pressed = true;
      break;
    case 'KeyS':
      keys.s.pressed = true;
      break;
    case 'KeyW':
      keys.w.pressed = true;
      break;
    case 'Space':
      cube.velocity.y = 0.08;
      break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = false;
      break;
    case 'KeyD':
      keys.d.pressed = false;
      break;
    case 'KeyS':
      keys.s.pressed = false;
      break;
    case 'KeyW':
      keys.w.pressed = false;
      break;
  }
});

const enemies = [];

let frames = 0;
let spawnRate = 200;
let passedEnemies = 0;
let isGameOver = false;

const gameOverPopup = document.createElement('div');
gameOverPopup.style.position = 'absolute';
gameOverPopup.style.top = '50%';
gameOverPopup.style.left = '50%';
gameOverPopup.style.transform = 'translate(-50%, -50%)';
gameOverPopup.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
gameOverPopup.style.color = 'white';
gameOverPopup.style.padding = '20px';
gameOverPopup.style.display = 'none';
document.body.appendChild(gameOverPopup);

// const contentGameOver = document.createElement('div');
// contentGameOver.textContent = 'Game over';
// contentGameOver.style.margin = 'auto';
// contentGameOver.style.textAlign = 'center';
// gameOverPopup.appendChild(contentGameOver);

function updatePassedEnemies() {
  passedEnemies++;
}

const contentPoint = document.createElement('div');
contentPoint.innerHTML = '<h1>Game Over</h1>';
contentPoint.style.margin = 'auto';
contentPoint.style.textAlign = 'center';
gameOverPopup.appendChild(contentPoint);

const restartGameOverButton = document.createElement('button');
restartGameOverButton.textContent = 'Restart, ấn không được phải không reload trang đi hi hi';
restartGameOverButton.style.padding = '10px';
restartGameOverButton.style.marginTop = '10px';
restartGameOverButton.style.cursor = 'pointer';
gameOverPopup.appendChild(restartGameOverButton);

restartGameOverButton.addEventListener('click', () => {
  isGameOver = false;
  passedEnemies = 0;
  gameOverPopup.style.display = 'none';
  
  console.log('check ckick')
  location.reload();
  
});

const passedEnemiesElement = document.createElement('div');
passedEnemiesElement.style.position = 'absolute';
passedEnemiesElement.style.top = '10px';
passedEnemiesElement.style.left = '10px';
passedEnemiesElement.style.color = 'white';
document.body.appendChild(passedEnemiesElement);



function displayPassedEnemies() {
  passedEnemiesElement.textContent = `Passed Enemies: ${passedEnemies}`;
  console.log('abc', passedEnemies)
}

function displayGameOver() {
  gameOverPopup.style.display = 'block';
}

const popupGeometry = new THREE.BoxGeometry(5, 3, 1);
const popupMaterial = new THREE.MeshStandardMaterial({ color: 'rgba(0, 0, 0, 0.7)', transparent: true });
const popupMesh = new THREE.Mesh(popupGeometry, popupMaterial);
popupMesh.position.set(0, 2, -5);
popupMesh.visible = false;
scene.add(popupMesh);

const popupText = document.createElement('div');
// popupText.innerHTML = '<h1>Game Over</h1><p>Your Score: ' + passedEnemies + '</p>';
// popupText.style.color = 'white';
// popupText.style.textAlign = 'center';
// popupText.style.marginTop = '30%';
popupMesh.userData.text = popupText;
document.body.appendChild(popupText);

const restartPopupButton = document.createElement('button');
// restartPopupButton.textContent = 'Restart';
// restartPopupButton.style.padding = '10px';
// restartPopupButton.style.marginTop = '10px';
// restartPopupButton.style.cursor = 'pointer';
popupText.appendChild(restartPopupButton);

restartPopupButton.addEventListener('click', () => {
  isGameOver = false;
  passedEnemies = 0;
  popupMesh.visible = false;

  enemies.forEach((enemy) => {
    scene.remove(enemy);
  });
  enemies = [];

  cube.reset();

  animate();
});



function animate() {
  if (isGameOver) {
    displayGameOver();
    displayPassedEnemies();
    return;
  }

  const animationId = requestAnimationFrame(animate);
  renderer.render(scene, camera);

  cube.velocity.x = 0;
  cube.velocity.z = 0;
  if (keys.a.pressed) cube.velocity.x = -0.05;
  else if (keys.d.pressed) cube.velocity.x = 0.05;

  if (keys.s.pressed) cube.velocity.z = 0.05;
  else if (keys.w.pressed) cube.velocity.z = -0.05;

  cube.update(ground);
  enemies.forEach((enemy) => {
    enemy.update(ground);
    if (cube.position.z < enemy.position.z && !enemy.passed) {
      enemy.passed = true;
      updatePassedEnemies();
    }
    if (boxCollision({ box1: cube, box2: enemy })) {
      isGameOver = true;
      cancelAnimationFrame(animationId);
    }
  });

  displayPassedEnemies();

  if (isGameOver) {
    displayGameOver();
    displayPassedEnemies();
    return;
  }

  if (frames % spawnRate === 0) {
    if (spawnRate > 20) spawnRate -= 20;

    const enemyTextureUrl = 'assets/arid2_bk.jpg';
    const enemy = new Box({
      width: 1,
      height: 1,
      depth: 1,
      position: {
        x: (Math.random() - 0.5) * 10,
        y: 0,
        z: -20,
      },
      velocity: {
        x: 0,
        y: 0,
        z: 0.005,
      },
      color: 'red',
      zAcceleration: true,
      passed: false,
      textureUrl: enemyTextureUrl,
    });
    enemy.castShadow = true;
    scene.add(enemy);
    enemies.push(enemy);
  }

  frames++;
}

animate();