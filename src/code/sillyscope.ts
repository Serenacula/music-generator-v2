export function drawSillyScope(
    analyser: AnalyserNode,
    bufferLength: number,
    dataArray: Uint8Array,
    canvas: HTMLCanvasElement,
    canvasCtx: CanvasRenderingContext2D
) {
    function loop() {
        // This code is mostly from the mozilla api docs
        requestAnimationFrame(loop)

        analyser.getByteTimeDomainData(dataArray)

        canvasCtx.fillStyle = "rgb(249, 249, 249)"
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

        canvasCtx.lineWidth = 4
        canvasCtx.strokeStyle = "rgb(0, 0, 0)"

        canvasCtx.beginPath()

        const sliceWidth = (canvas.width * 1.1) / bufferLength
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0
            const y = (v * canvas.height) / 2

            if (i === 0) {
                canvasCtx.moveTo(x, y + 0.5)
            } else {
                canvasCtx.lineTo(x, y + 0.5)
            }

            x += sliceWidth
        }

        canvasCtx.lineTo(canvas.width + 1, canvas.height / 2)
        canvasCtx.stroke()
    }
    loop()
}
