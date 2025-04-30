import type { Score } from "./music"
import { drawSillyScope } from "./sillyscope"

type PlayableFrequencies = Array<{
    frequency: number | null
    noteLength: number
}>
const noteMap = {
    "C": 261.63,
    "C#": 277.18,
    "D": 293.66,
    "D#": 311.13,
    "E": 329.63,
    "F": 349.23,
    "F#": 369.99,
    "G": 392.0,
    "G#": 415.3,
    "A": 440.0,
    "A#": 466.16,
    "B": 493.88,
}

function convertToFrequencies(score: Score, frequencyMultiplier: number) {
    return score.map((note) => {
        return {
            frequency:
                note.note === "silence"
                    ? null
                    : noteMap[note.note] * frequencyMultiplier || 1,
            noteLength: note.noteLength,
        }
    })
}

export type SongPlaying = { stop: () => void; endTime: Date }
export function playNotes(
    audioContext: AudioContext,
    merger: ChannelMergerNode,
    mergerNumber: number,
    score: Score,
    voice: OscillatorType,
    beatsPerMinute: number,
    frequencyMultiplier: number,
    timeDelay = 0
): SongPlaying {
    const noteFrequencies = convertToFrequencies(score, frequencyMultiplier)

    let timeCounter = tempo(timeDelay)
    let songEndTime: Date = new Date()
    const oscillators: OscillatorNode[] = []
    for (const note of noteFrequencies) {
        if (note.frequency) {
            const oscillator = audioContext.createOscillator()
            oscillators.push(oscillator)
            oscillator.connect(merger, undefined, mergerNumber)

            oscillator.type = voice || "square"
            oscillator.frequency.value = note.frequency

            const startTime = audioContext.currentTime + timeCounter //+ tempo(Math.random() / 8)
            oscillator.start(startTime)
            oscillator.stop(
                audioContext.currentTime + timeCounter + tempo(note.noteLength)
            )

            timeCounter += tempo(note.noteLength)
            songEndTime = new Date(new Date().getTime() + timeCounter * 1000)
        } else {
            timeCounter += tempo(note.noteLength)
        }
    }

    function tempo(time: number) {
        return (time * 60) / beatsPerMinute
    }

    return {
        stop: () => oscillators.forEach((oscillator) => oscillator.stop()),
        endTime: songEndTime,
    }
}

export const soundFactory = () => {
    /**
     * Audio Setup
     */

    // Audio context - the root node of Web Audio API
    const audioContext = new AudioContext()

    // Analyser - used to get a visualisation of the waveform
    const analyser = audioContext.createAnalyser()
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteTimeDomainData(dataArray)
    analyser.connect(audioContext.destination)

    // Volume controls
    const volume = audioContext.createGain()
    volume.connect(analyser)
    volume.gain.value = 0.3

    // required to get stereo again after merging
    const stereoPan = audioContext.createStereoPanner()
    stereoPan.pan.value = 0.5
    stereoPan.connect(volume)

    // this is to fix the phone-audio bug
    const merger = audioContext.createChannelMerger(6)
    merger.connect(stereoPan)

    // tracking state
    let sillyscopeDrawn = false
    let currentlyPlaying: SongPlaying[] = []
    let endTime: Date = new Date()

    return {
        endTime: () => endTime,
        stop: () => {
            for (const song of currentlyPlaying) {
                song.stop()
            }
            currentlyPlaying = []
            endTime = new Date()
            return
        },
        playNotes: (
            mergerNumber: number,
            score: Score,
            frequencyMultiplier: number,
            voice: OscillatorType,
            beatsPerMinute: number,
            timeDelay = 0
        ): SongPlaying => {
            audioContext.resume()

            const result = playNotes(
                audioContext,
                merger,
                mergerNumber,
                score,
                voice,
                beatsPerMinute,
                frequencyMultiplier,
                timeDelay
            )
            currentlyPlaying.push(result)
            endTime =
                endTime.getTime() > result.endTime.getTime()
                    ? endTime
                    : result.endTime
            return result
        },
        drawSillyScope: (
            canvas: HTMLCanvasElement,
            canvasCtx: CanvasRenderingContext2D
        ) => {
            if (sillyscopeDrawn) {
                return
            }
            sillyscopeDrawn = true
            drawSillyScope(analyser, bufferLength, dataArray, canvas, canvasCtx)
        },
    }
}
