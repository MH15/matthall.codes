

export class SceneNode {
    /**
     * @type SceneNode[]
     */
    children = []


    /**
     * 
     * @param {SceneNode} child 
     */
    add(child) {
        this.children.push(child)
    }
}


