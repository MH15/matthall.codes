
import Stats from "./lib/stats.module.js";
import { Patch } from './lib/nodes/patch.js';
import { createProgram, createShader, initGL, setUniform1f, setUniform2f, setUniform3f } from "./lib/shader.js";

const vertShader = document.querySelector("#vertex-shader").innerHTML
const fragShader = document.querySelector("#fragment-shader").innerHTML


const SIZE = 3
const SPACING = 8
const PADDING = 50

// const scene = new Scene(vertShader, fragShader);

// const patch = new Patch()
// scene.add(patch)

// @ts-ignore
const stats = new Stats()
document.body.appendChild(stats.dom);
stats.showPanel(0)

const state = {
    modelRotationZ: 0,
    drawMode: "solid",
    cam: {
        fov: 50,
        aspect: 1,
        x: 16,
        y: -3,
        z: 0,
        xc: 0,
        yc: 0,
        zc: 0,
        yaw: -1.5,
        pitch: -.0
    },
    frontWheel: 0,
    rearShocks: -50,
    color: '#aa00ff',
    controlMode: "character"
}


/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("#canvas")
const mouse = [0, 0, 0]

canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse[0] = e.clientX / canvas.width * 2 - 1;
    mouse[1] = e.clientY / canvas.height * -2 + 1;

})


canvas.addEventListener("pointerdown", (e) => {
    mouse[2] = 1
})


canvas.addEventListener("pointerup", (e) => {
    mouse[2] = 0
})


/** @type {WebGL2RenderingContext} */
const gl = initGL(canvas)
gl.viewport(0, 0, canvas.width, canvas.height)


const vs = createShader(gl, gl.VERTEX_SHADER, vertShader)
const fs = createShader(gl, gl.FRAGMENT_SHADER, fragShader)

// Link the program
const prog = createProgram(gl, vs, fs)

// Set uniform value
setUniform1f(gl, "uPointSize", SIZE)
setUniform2f(gl, "uResolution", canvas.width, canvas.height)
console.log(canvas.width, canvas.height)

// Get attribute locations
const aPositionIndex = gl.getAttribLocation(prog, 'aPosition')

// Set up attribute buffers
const aPositionBuffer = gl.createBuffer()

// Set up a vertex array object
// This tells WebGL how to iterate your attribute buffers
const vao = gl.createVertexArray()
gl.bindVertexArray(vao)

// Pull 2 floats at a time out of the position buffer
gl.bindBuffer(gl.ARRAY_BUFFER, aPositionBuffer)
gl.enableVertexAttribArray(aPositionIndex)
gl.vertexAttribPointer(aPositionIndex, 2, gl.FLOAT, false, 0, 0)



let points = []

const w = canvas.width
const h = canvas.height
const spacing = SPACING // px
const rows = 100
const cols = 100


for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
        const i = r * cols + c
        points.push(((c / cols) - .5) * 1.25, (r / rows - .5) * 1.25)
    }
}

let v = new Float32Array(points)
console.log(rows, cols)



// Add some points to the position buffer
const positions = new Float32Array(points)
gl.bindBuffer(gl.ARRAY_BUFFER, aPositionBuffer)
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)




requestAnimationFrame(update)

function update() {
    stats.begin()

    // Draw the point
    setUniform3f(gl, "uMouse", ...mouse)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.POINTS, 0, positions.length / 2) // draw all 4 points
    requestAnimationFrame(update)

    stats.end()
}