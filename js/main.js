import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(4.61, 2.74, 8)

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

class Box extends THREE.Mesh {
    constructor({
        radius, // add radius parameter
        width,
        height,
        depth,
        color = '#00ff00',
        velocity = {
            x: 0,
            y: 0,
            z: 0
        },
        position = {
            x: 0,
            y: 0,
            z: 0
        },
        zAcceleration = false
    }) {
        super(
            new THREE.SphereGeometry(radius, 32, 32), // replace BoxGeometry with SphereGeometry
            new THREE.MeshStandardMaterial({ color })
        )

        this.radius = radius; // add radius property
        this.position.set(position.x, position.y, position.z)

        this.velocity = velocity
        this.gravity = -0.002

        this.zAcceleration = zAcceleration
    }

    updateSides() {
        // For a sphere, there are no sides to update
    }

    update(ground) {
        // For a sphere, the update logic may be different, you can adjust accordingly
        if (this.zAcceleration) this.velocity.z += 0.0003

        this.position.x += this.velocity.x
        this.position.z += this.velocity.z

        this.applyGravity(ground)
    }

    applyGravity(ground) {
        this.velocity.y += this.gravity

        // Adjust collision logic for a sphere
        const distanceToGround = this.position.y - this.radius / 2 - ground.top;

        if (distanceToGround <= 0) {
            const friction = 0.5;
            this.velocity.y *= friction;
            this.velocity.y = -this.velocity.y;
        } else {
            this.position.y += this.velocity.y;
        }
    }
}

function boxCollision({ box1, box2 }) {
    const distance = box1.position.distanceTo(box2.position);
    return distance < box1.radius + box2.radius;
}

const cube = new Box({
    radius: 0.5, // specify the radius for the sphere
    velocity: {
        x: 0,
        y: -0.01,
        z: 0
    }
})
cube.castShadow = true
scene.add(cube)

const ground = new Box({
    width: 10,
    height: 0.5,
    depth: 50,
    color: '#0369a1',
    position: {
        x: 0,
        y: -2,
        z: 0
    }
})

ground.receiveShadow = true
scene.add(ground)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.y = 3
light.position.z = 1
light.castShadow = true
scene.add(light)

scene.add(new THREE.AmbientLight(0xffffff, 0.5))

camera.position.z = 5
console.log(ground.top)
console.log(cube.position.y)

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    s: {
        pressed: false
    },
    w: {
        pressed: false
    }
}

window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyA':
            keys.a.pressed = true
            break
        case 'KeyD':
            keys.d.pressed = true
            break
        case 'KeyS':
            keys.s.pressed = true
            break
        case 'KeyW':
            keys.w.pressed = true
            break
        case 'Space':
            cube.velocity.y = 0.08
            break
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyA':
            keys.a.pressed = false
            break
        case 'KeyD':
            keys.d.pressed = false
            break
        case 'KeyS':
            keys.s.pressed = false
            break
        case 'KeyW':
            keys.w.pressed = false
            break
    }
})

const enemies = []

let frames = 0
let spawnRate = 200

let score = 0;
const scoreElement = document.createElement("div");
scoreElement.style.position = "absolute";
scoreElement.style.top = "10px";
scoreElement.style.left = "10px";
scoreElement.style.color = "#ffffff";
scoreElement.style.fontFamily = "Arial, sans-serif";
scoreElement.style.fontSize = "20px";
document.body.appendChild(scoreElement);


function animate() {
    const animationId = requestAnimationFrame(animate)
    renderer.render(scene, camera)

    // movement code
    cube.velocity.x = 0
    cube.velocity.z = 0
    if (keys.a.pressed) cube.velocity.x = -0.05
    else if (keys.d.pressed) cube.velocity.x = 0.05

    if (keys.s.pressed) cube.velocity.z = 0.05
    else if (keys.w.pressed) cube.velocity.z = -0.05

    cube.update(ground)
    enemies.forEach((enemy) => {
        enemy.update(ground)
        if (boxCollision({ box1: cube, box2: enemy })) {
            cancelAnimationFrame(animationId)
            alert("Game Over! Your score is: " + score);
        }
    })
    score++;
    scoreElement.textContent = "Score: " + score;

    if (frames % spawnRate === 0) {
        if (spawnRate > 20) spawnRate -= 20

        const enemy = new Box({
            radius: 0.5, // specify the radius for the sphere
            position: {
                x: (Math.random() - 0.5) * 10,
                y: 0,
                z: -20
            },
            velocity: {
                x: 0,
                y: 0,
                z: 0.005
            },
            color: 'red',
            zAcceleration: true
        })
        enemy.castShadow = true
        scene.add(enemy)
        enemies.push(enemy)
    }

    frames++
}

animate()
