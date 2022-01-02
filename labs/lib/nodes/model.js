
import { mat4 } from '../gl-matrix/index.js';
import { degToRad } from '../math.js';
import { setUniform1i, setUniformMat4fv, setUniformVec } from '../shader.js';
import { SceneNode } from './sceneNode.js';

export class Model extends SceneNode {



    constructor(name, objVertexPositionBuffers,
        objVertexNormalBuffers,
        objVertexTexCoordBuffers,
        mtlKa,
        mtlKd,
        mtlKs,
        mtlShininess,
        mtlMapKa,
        mtlMapKd,
        mtlMapKs) {
        super()
        this.matrix = mat4.create()
        this.selfMatrix = mat4.create()

        this.objVertexPositionBuffers = objVertexPositionBuffers
        this.objVertexNormalBuffers = objVertexNormalBuffers
        this.objVertexTexCoordBuffers = objVertexTexCoordBuffers
        this.mtlKa = mtlKa
        this.mtlKd = mtlKd
        this.mtlKs = mtlKs
        this.mtlShininess = mtlShininess
        this.mtlMapKa = mtlMapKa
        this.mtlMapKd = mtlMapKd
        this.mtlMapKs = mtlMapKs
        this.name = name

        // console.log(`Loading ${name}`)
    }

    clone() {
        return new Model(`${this.name} (Clone)`,
            this.objVertexPositionBuffers,
            this.objVertexNormalBuffers,
            this.objVertexTexCoordBuffers,
            this.mtlKa,
            this.mtlKd,
            this.mtlKs,
            this.mtlShininess,
            this.mtlMapKa,
            this.mtlMapKd,
            this.mtlMapKs
        )
    }

    drawObj(stack, state, viewMatrix, projectionMatrix, aVertexPosition, aNormal, aTexCoords) {
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

        for (var i = 0; i < this.objVertexPositionBuffers.length; i++) {
            gl.enableVertexAttribArray(aVertexPosition);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.objVertexPositionBuffers[i]);
            gl.vertexAttribPointer(aVertexPosition, this.objVertexPositionBuffers[i].itemSize, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(aNormal);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.objVertexNormalBuffers[i]);
            gl.vertexAttribPointer(aNormal, this.objVertexNormalBuffers[i].itemSize, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(aTexCoords);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.objVertexTexCoordBuffers[i]);
            gl.vertexAttribPointer(aTexCoords, this.objVertexTexCoordBuffers[i].itemSize, gl.FLOAT, false, 0, 0);


            setUniformMat4fv("uModelViewMatrix", new Float32Array(modelViewMatrix))
            setUniformMat4fv("uModelMatrix", new Float32Array(modelMatrix))
            setUniformMat4fv("uProjectionMatrix", projectionMatrix)
            let normalMatrix = mat4.clone(modelViewMatrix)
            mat4.invert(normalMatrix, normalMatrix)
            mat4.transpose(normalMatrix, normalMatrix)

            setUniformMat4fv("uNormalMatrix", new Float32Array(normalMatrix))


            setUniformVec("mat_ambient", [this.mtlKa[i][0], this.mtlKa[i][1], this.mtlKa[i][2], 1.0])
            setUniformVec("mat_diffuse", [this.mtlKd[i][0], this.mtlKd[i][1], this.mtlKd[i][2], 1.0])
            setUniformVec("mat_specular", [this.mtlKs[i][0], this.mtlKs[i][1], this.mtlKs[i][2], 1.0])

            if (this.mtlMapKa[i] != null) {
                setUniform1i("enableMapKa", 1)
                gl.activeTexture(gl.TEXTURE0)              // set texture unit 0 to use 
                gl.bindTexture(gl.TEXTURE_2D, this.mtlMapKa[i]);    // bind the texture object to the texture unit 
                setUniform1i("textureKa", 0);      // pass the texture unit to the shader
            }
            else setUniform1i("enableMapKa", 0)

            if (this.mtlMapKd[i] != null) {
                setUniform1i("enableMapKd", 1)
                gl.activeTexture(gl.TEXTURE1);                 // set texture unit 0 to use 
                gl.bindTexture(gl.TEXTURE_2D, this.mtlMapKd[i]);    // bind the texture object to the texture unit 
                setUniform1i("textureKd", 1);      // pass the texture unit to the shader
            }
            else setUniform1i("enableMapKd", 0)

            if (this.mtlMapKs[i] != null) {
                setUniform1i("enableMapKs", 1)
                gl.activeTexture(gl.TEXTURE2);                 // set texture unit 1 to use 
                gl.bindTexture(gl.TEXTURE_2D, this.mtlMapKs[i]);    // bind the texture object to the texture unit 
                setUniform1i("textureKs", 2);      // pass the texture unit to the shader
            }
            else setUniform1i("enableMapKs", 0);
            // gl.uniform1i(shaderProgram.enableMapKs, 0);
            // throw new Error()

            // gl.drawArrays(gl.TRIANGLES, 0, this.objVertexPositionBuffers[i].numItems);
            switch (state.drawMode) {
                case "solid":
                    gl.drawArrays(gl.TRIANGLES, 0, this.objVertexPositionBuffers[i].numItems);
                    break
                case "lines":
                    gl.drawArrays(gl.LINES, 0, this.objVertexPositionBuffers[i].numItems)
                    break
                case "points":
                    gl.drawArrays(gl.POINTS, 0, this.objVertexPositionBuffers[i].numItems)
                    break

            }
        }

        // Draw the children
        // for (const child of this.children) {
        //     if (child instanceof Shape) {
        //         child.draw(stack, state, aVertexPosition, aNormal, viewMatrix, projectionMatrix)
        //     }
        // }
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


