import { mat4, vec3 } from "../gl-matrix/index.js"
import { degToRad, r } from "../math.js"
import { SceneNode } from "../nodes/sceneNode.js"
import { createBuffer, setUniform1i, setUniformMat4fv, uniform } from "../shader.js"

export class Shape extends SceneNode {
    matrix = mat4.create()
    selfMatrix = mat4.create()

    position = [0, 0]
    origin = [0, 0]
    rotation = 0

    /**
     * 
     * @param {Float32Array} vertices 
     * @param {number} verticesSize 
     * @param {number} verticesCount 
     * @param {Uint16Array} indices 
     * @param {number} indicesSize 
     * @param {number} indicesCount 
     * @param {Float32Array} colors 
     * @param {number} colorsSize 
     * @param {number} colorsCount 
     */
    constructor(
        vertices, verticesSize, verticesCount,
        indices = null, indicesSize = null, indicesCount = null,
        colors = null, colorsSize = null, colorsCount = null,
        normals = null

    ) {
        super()

        this.verticesSize = verticesSize
        this.verticesCount = verticesCount
        this.indicesSize = indicesSize
        this.indicesCount = indicesCount
        this.colorsSize = colorsSize
        this.colorsCount = colorsCount

        this.normals = normals

        // this.vbo = createBuffer(Scene.gl, vertices)
        // this.ibo = createBuffer(Scene.gl, indices, Scene.gl.ELEMENT_ARRAY_BUFFER)
        // this.cbo = createBuffer(Scene.gl, colors)

        // this.nbo = null
        // this.normalsCount = 0
        // if (normals) {
        //     this.nbo = createBuffer(Scene.gl, normals)
        //     this.normalsCount = this.normals.length
        // } else {
        // }
        // this.color = [1, 0, 0]

        mat4.identity(this.matrix)
    }
    draw(stack, state, aPosition) {
        const gl = Scene.gl
        // Get current stack top
        let top = stack.pop()
        let modelMatrix = mat4.create()
        mat4.identity(modelMatrix)
        if (top) {
            mat4.multiply(modelMatrix, top, this.matrix)
        } else {
            console.error("Warning: no top of stack!")
        }

        stack.push(top)
        stack.push(mat4.clone(modelMatrix))

        // Local space transforms
        mat4.multiply(modelMatrix, modelMatrix, this.selfMatrix)

        let modelViewMatrix = mat4.create()
        mat4.identity(modelViewMatrix)
        mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix)

        let normalMatrix = mat4.clone(modelViewMatrix)
        mat4.invert(normalMatrix, normalMatrix)
        mat4.transpose(normalMatrix, normalMatrix)
        setUniform1i("enableMapKd", 0)
        setUniform1i("enableMapKa", 0)
        setUniform1i("enableMapKs", 0)

        setUniformMat4fv("uNormalMatrix", new Float32Array(normalMatrix))

        if (this.nbo != null) {

            gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo)
            gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0)
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo)
        gl.vertexAttribPointer(aVertexPosition, this.verticesSize, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo)

        setUniformMat4fv("uModelViewMatrix", new Float32Array(modelViewMatrix))
        setUniformMat4fv("uModelMatrix", new Float32Array(modelMatrix))
        setUniformMat4fv("uProjectionMatrix", projectionMatrix)
        gl.drawElements(gl.TRIANGLES, this.indicesCount, gl.UNSIGNED_SHORT, 0)



        // Draw the children
        for (const child of this.children) {
            if (child instanceof Shape) {
                child.draw(stack, state, aVertexPosition, aNormal, viewMatrix, projectionMatrix)
            }
        }
        // Pop to restore transformation to next draw calls
        stack.pop()

    }
    /**
     * Translate in local space.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z
     */
    translate(x, y, z = 0) {
        mat4.translate(this.matrix, this.matrix, [x, y, z])
    }

    setPosition(x, y, z) {
        this.matrix = mat4.create()
        this.translate(x, y, z)
    }

    /**
     * Translate self without translating children.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z
     */
    translateSelf(x, y, z = 0) {
        mat4.translate(this.selfMatrix, this.selfMatrix, [x, y, z])
    }

    /**
     * Scale in local space.
     * @param {number} x 
     */
    scale(x) {
        mat4.scale(this.matrix, this.matrix, [x, x, x])
    }
    /**
     * Scale self without scaling children.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    scaleSelf(x, y = x, z = x) {
        mat4.scale(this.selfMatrix, this.selfMatrix, [x, y, z])
    }

    /**
     * Rotate in local space.
     * @param {number} deg 
     */
    rotate(deg, axis = [0, 0, 1]) {
        mat4.rotate(this.matrix, this.matrix, degToRad(deg), axis)
    }
    /**
     * Rotate self without rotating children.
     * @param {number} deg 
     */
    rotateSelf(deg, axis = [0, 0, 1]) {
        mat4.rotate(this.selfMatrix, this.selfMatrix, degToRad(deg), axis)
    }
}

export class Tetrahedron extends Shape {
    static vertices = new Float32Array([
        Math.sqrt(8 / 9), -1 / 3, 0,
        -Math.sqrt(2 / 9), -1 / 3, Math.sqrt(2 / 3),
        -Math.sqrt(2 / 9), -1 / 3, -Math.sqrt(2 / 3),
        0, 1, 0
    ])

    static indices = new Uint16Array([
        0, 1, 3,
        1, 2, 3,
        2, 0, 3,
        0, 2, 1
    ])
    constructor(color) {
        var colors = new Float32Array([
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0,
            1.0, 0.0, 0.0
        ])
        super(Tetrahedron.vertices, 3, 4, Tetrahedron.indices, 1, 12, colors, 3, 4)
    }
}
export class Cylinder extends Shape {
    /**
     * 
     * @param {number} radiusTop
     * @param {number} radiusBottom
     * @param {number} length 
     * @param {number} radiusSteps 
     * @param {number} lengthSteps 
     */
    constructor(radiusTop, radiusBottom, length, radiusSteps, lengthSteps) {
        // Inspired by https://threejs.org/docs/#api/en/geometries/CylinderGeometry
        const indices = []
        const vertices = []
        const normals = []
        const indexArray = [];
        const colors = []
        let index = 0

        // Vertices
        for (let y = 0; y <= lengthSteps; y++) {
            const indexRow = [];
            const v = y / lengthSteps;
            const radius = v * (radiusBottom - radiusTop) + radiusTop;

            for (let x = 0; x <= radiusSteps; x++) {
                const deg = (x / radiusSteps) * 360
                const rad = degToRad(deg)
                const xPos = Math.sin(rad) * radius
                const yPos = Math.cos(rad) * radius
                const zPos = -v * length + length / 2

                normals.push(Math.sin(rad))
                normals.push(0.0)
                normals.push(Math.cos(rad))

                const vertex = vec3.fromValues(xPos, zPos, yPos)
                vertices.push(...vertex);
                colors.push(r(256), r(256), r(256))

                indexRow.push(index++);
            }
            indexArray.push(indexRow);
        }

        // Indices
        for (let x = 0; x < radiusSteps; x++) {
            for (let y = 0; y < lengthSteps; y++) {
                const a = indexArray[y][x];
                const b = indexArray[y + 1][x];
                const c = indexArray[y + 1][x + 1];
                const d = indexArray[y][x + 1];
                // Two faces per quad
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }

        const vb = new Float32Array(vertices)
        const ib = new Uint16Array(indices)
        const cb = new Float32Array(colors)
        const nb = new Float32Array(normals)
        super(vb, 3, vb.length / 3, ib, 1, ib.length, cb, 3, cb.length / 3, nb)
    }

}

