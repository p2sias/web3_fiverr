import fabric from 'fabric'

export default function toPng(svgString: string) {   
    return new Promise<string>((resolve, reject) => {
        try {
            const canvas = fabric.fabric.createCanvasForNode(200, 200);
        
            fabric.fabric.loadSVGFromString(svgString, (objects, options) => {
                const obj = new fabric.fabric.Group(objects, options)
                canvas.add(obj)
                resolve(canvas.toDataURL())
            });
        } catch (err: any) {
            reject(err);
        }
        
    })
}