
/**
 * Initialize WebGL and set canvas to fullscreen.
 * @param {HTMLCanvasElement} canvas 
 * @returns {WebGL2RenderingContext}
 */
export function initGL(canvas) {
    let gl = canvas.getContext("webgl2")
    gl.canvas.width = window.innerWidth;
    gl.canvas.height = window.innerHeight;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    return gl
}

/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {any} type 
 * @returns {WebGLShader}
 */
export function createShader(gl, type, source) {
    let shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    let e = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw e
}

let program;
const uniforms = new Map()

/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {WebGLShader} vertexShader 
 * @param {WebGLShader} fragmentShader 
 * @returns {WebGLProgram}
 */
export function createProgram(gl, vertexShader, fragmentShader) {
    program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    console.info("Vertex shader compiled.")
    gl.attachShader(program, fragmentShader)
    console.info("Fragment shader compiled.")
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('prog info-log:', gl.getProgramInfoLog(program))
        console.error('vert info-log: ', gl.getShaderInfoLog(vertexShader))
        console.error('frag info-log: ', gl.getShaderInfoLog(fragmentShader))
    }

    gl.useProgram(program);
    return program
}


/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {Float32Array|Uint16Array} data 
 * @param {number} method 
 * @returns {WebGLBuffer}
 */
export function createBuffer(gl, data, method = gl.ARRAY_BUFFER) {
    let buffer_id = gl.createBuffer()
    if (!buffer_id) throw new Error("Failed to create buffer.")

    gl.bindBuffer(method, buffer_id)
    gl.bufferData(method, data, gl.STATIC_DRAW)

    return buffer_id
}


// Add an attribute
/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {WebGLProgram} program 
 * @param {string} name 
 * @returns {number}
 */
export function attribute(gl, program, name) {
    let attrib = gl.getAttribLocation(program, name);
    // console.log("attribute", name, attrib)
    gl.enableVertexAttribArray(attrib);
    if (attrib < 0) {
        throw new Error(`Attribute "${name}" not found in program.`)
    }
    return attrib
}



/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {WebGLProgram} program 
 * @param {string} name 
 * @returns {WebGLUniformLocation}
 */
export function uniform(gl, program, name) {
    let location = gl.getUniformLocation(program, name);
    if (location < 0) {
        throw new Error(`Attribute "${name}" not found in program.`)
    }
    uniforms.set(name, location)
    return location
}


export function setUniformMat4fv(gl, name, val) {
    let location = uniforms.get(name)
    if (!location) {
        location = uniform(gl, program, name)
    }
    gl.uniformMatrix4fv(location, false, new Float32Array(val))
}

export function setUniform1i(gl, name, val) {
    let location = uniforms.get(name)
    if (!location) {
        location = uniform(gl, program, name)
    }
    gl.uniform1i(location, val)
}

export function setUniform1f(gl, name, val) {
    let location = uniforms.get(name)
    if (!location) {
        location = uniform(gl, program, name)
    }
    gl.uniform1f(location, val)
}

export function setUniform2f(gl, name, a, b) {
    let location = uniforms.get(name)
    if (!location) {
        location = uniform(gl, program, name)
    }
    gl.uniform2f(location, a, b)
}
export function setUniform3f(gl, name, a, b, c) {
    let location = uniforms.get(name)
    if (!location) {
        location = uniform(gl, program, name)
    }
    gl.uniform3f(location, a, b, c)
}

/**
 * Set a uniform, creating it the first time.
 * @param {string} name uniform name
 * @param {number[]} val 3 or 4 element array
 */
export function setUniformVec(gl, name, val) {
    let location = uniforms.get(name)
    if (!location) {
        location = uniform(gl, program, name)
    }

    if (val.length == 4) {
        gl.uniform4f(location, val[0], val[1], val[2], val[3])
    } else if (val.length == 3) {
        gl.uniform3f(location, val[0], val[1], val[2])
    } else {
        console.error(`Uniform "${name}" not set. Value must be an array of length 3 or 4.`)
    }
}


