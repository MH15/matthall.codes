import { createBuffer, setUniform2f, setUniform3f, uniform } from "../shader.js";
import { Shape } from "./shape.js";


export class Patch extends Shape {
    static vb = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        -1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        1.0, 1.0
    ])




    constructor() {
        let points = []

        const w = Scene.canvas.width
        const h = Scene.canvas.height
        const spacing = 100 // px
        const rows = Math.floor(h / spacing)
        const cols = Math.floor(w / spacing)

        console.log(rows, cols)

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const i = r * cols + c
                points.push(c / cols, r / rows)
            }
        }

        let v = new Float32Array(points)
        console.log(v)



        super(null, 2, 2)

        this.positions = new Float32Array([
            -1.0, 1.0, // top-left
            1.0, 1.0, // top-right
            1.0, -1.0, // bottom-right
            -1.0, -1.0, // bottom-left
        ])
        this.width = w
        this.height = h

        this.mouse = [0, 0, 0]

        Scene.canvas.addEventListener("mousemove", (e) => {
            const rect = Scene.canvas.getBoundingClientRect();
            this.mouse[0] = e.clientX - rect.left;
            this.mouse[1] = rect.height - (e.clientY - rect.top) - 1;  // bottom is 0 in WebGL
        })


        Scene.canvas.addEventListener("mousedown", (e) => {
            this.mouse[2] = 1
        })


        Scene.canvas.addEventListener("mouseup", (e) => {
            this.mouse[2] = 0
        })

        this.vbo = createBuffer(Scene.gl, this.positions)


    }


    draw(stack, state, aPosition) {
        const gl = Scene.gl
        // gl.clearColor(0, 1, 0, 1)
        // gl.clear(gl.COLOR_BUFFER_BIT)


        // setUniform2f("uResolution", Scene.canvas.width, Scene.canvas.height)
        setUniform2f("uResolution", this.width, this.height)
        setUniform3f("iMouse", ...this.mouse)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo)
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

        gl.drawArrays(gl.POINTS, 0, this.positions.length / 2);



    }
}