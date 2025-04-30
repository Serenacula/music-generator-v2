import type { Note, ScaleType } from "./music"

export type Form = ReturnType<typeof getForm>
export const getForm = (document: Document) => ({
    voiceSelect: (document.querySelector(".voice")! as HTMLSelectElement)
        .value as OscillatorType,
    scaleSelect: (document.querySelector(".scale")! as HTMLSelectElement)
        .value as Note | "random",
    scaleTypeSelect: (
        document.querySelector(".scaleType")! as HTMLSelectElement
    ).value as ScaleType,

    beatsPerMinuteInput: (
        document.querySelector(".beatsPerMinute")! as HTMLInputElement
    ).valueAsNumber,
    beatsInBarInput: (
        document.querySelector(".beatsInBar")! as HTMLInputElement
    ).valueAsNumber,
    chordMultiplierInput: (
        document.querySelector(".chordMultiplier")! as HTMLInputElement
    ).valueAsNumber,
    percentDroppedInput: (
        document.querySelector(".percentDropped")! as HTMLInputElement
    ).valueAsNumber,

    banRepeatedNotesCheckbox: (
        document.querySelector(".banRepeatedNotes")! as HTMLInputElement
    ).checked,
    randomiseRootCheckbox: (
        document.querySelector(".randomiseRoot")! as HTMLInputElement
    ).checked,
    secondMelodyCheckbox: (
        document.querySelector(".secondMelody")! as HTMLInputElement
    ).checked,
    jazzHarmoniesCheckbox: (
        document.querySelector(".jazzHarmonies")! as HTMLInputElement
    ).checked,
    jazzChordsCheckbox: (
        document.querySelector(".jazzChords")! as HTMLInputElement
    ).checked,
})
