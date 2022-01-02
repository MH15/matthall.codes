export function r(max) {
    return randi(-max, max) / max
}

export function randi(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}
export function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

export function round(n, d = 2) {
    return Math.round(n * Math.pow(10, d)) / Math.pow(10, d)
}

export const clamp = (num, a, b) => {
    return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b))
}


export function rgb(r, g, b) {
    return [r / 255, g / 255, b / 255, 1]
}