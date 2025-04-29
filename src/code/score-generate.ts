const notes = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
] as const

type Note = (typeof notes)[number]
type NoteWithLength = {
    note: Note
    noteLength: number
}
type NoteArray = Note[]
type Score = Array<NoteWithLength | { note: "silence"; noteLength: number }>

/**
 * Builds a major scale out, based on the starting note
 */
type ScaleType = "major" | "minor" | "random"
function generateScale(
    rootNote: Note,
    scaleType: ScaleType = "random"
): NoteArray {
    const major = [0, 2, 4, 5, 7, 9, 11]
    const minor = [0, 2, 3, 5, 7, 9, 11]
    const scaleMap = {
        major,
        minor,
        random: Math.random() * 10 < 5 ? major : minor,
    }
    const rootIndex = notes.indexOf(rootNote)
    const doubledNotes = [...notes, ...notes]

    return scaleMap[scaleType].map(
        (position) => doubledNotes[position + rootIndex]
    )
}

/**
 * Returns a random note. Can optionally ban notes, and specify a scale to use.
 * If no scale is specified, it will use the complete spectrum of notes.
 */
function randomNote(scale?: NoteArray, bannedNotes?: Note[]): Note {
    const filteredScale = (scale ?? notes).filter(
        (note) => !bannedNotes?.includes(note)
    )
    if (filteredScale.length === 0) {
        throw Error("randomNote: No notes available to choose")
    }

    return filteredScale[Math.floor(Math.random() * filteredScale.length)]
}

function randomHarmonic(
    scale: NoteArray,
    rootNote: Note,
    includeJazz: boolean
): Note {
    const doubledScale = [...scale, ...scale]
    const harmonics = [
        rootNote,
        doubledScale[scale.indexOf(rootNote) + 2],
        doubledScale[scale.indexOf(rootNote) + 4],
    ] as Note[]
    if (includeJazz) {
        harmonics.push(doubledScale[scale.indexOf(rootNote) + 6])
    }

    return harmonics[Math.floor(Math.random() * harmonics.length)]
}

function removeRandomNotes(
    initialMelody: Score,
    dropPercentage: number
): Score {
    const result: Score = initialMelody.map((note) =>
        Math.random() * 100 > dropPercentage
            ? note
            : { note: "silence", noteLength: note.noteLength }
    )
    return result
}

function barOfNotes(scale: NoteArray, beatsInBar: number, startingNote?: Note) {
    if (Math.random() * 10 >= 5) {
        return barOfRandomNotes(scale, beatsInBar, startingNote)
    } else {
        return barOfScaledNotes(scale, beatsInBar, startingNote)
    }
}

function barOfRandomNotes(
    scale: NoteArray,
    beatsInBar: number,
    startingNote?: Note
): NoteArray {
    const result: NoteArray = []
    startingNote && result.push(startingNote)
    for (let i = startingNote ? 1 : 0; i < beatsInBar; i++) {
        // Banned notes here just makes sure we don't repeat the same note inside a single bar
        const bannedNotes = result < scale ? result : undefined
        result.push(randomNote(scale, bannedNotes))
    }

    return result
}

function barOfScaledNotes(
    scale: NoteArray,
    beatsInBar: number,
    startingNote?: Note
): NoteArray {
    const doubledNotes = [...scale, ...scale]

    const result: NoteArray = []
    result.push(startingNote || randomNote(scale))

    let previousNote: Note = result[0]
    for (let i = 1; i < beatsInBar; i++) {
        previousNote = result[result.length - 1]

        const direction = Math.floor(Math.random() * 3)
        const addUpNote = () =>
            result.push(doubledNotes[scale.indexOf(previousNote) + 1])
        const addDownNote = () =>
            result.push(doubledNotes[scale.lastIndexOf(previousNote) - 1])
        switch (direction) {
            case 0: {
                // Direction up
                addUpNote()
                break
            }
            case 1: {
                // Direction down
                addDownNote()
                break
            }

            default: {
                // Direction random
                if (Math.random() * 2 < 1) {
                    addUpNote()
                } else {
                    addDownNote()
                }
                break
            }
        }
    }

    return result
}

function randomPhrase(
    scale: NoteArray,
    beatsInBar: number,
    includeJazz: boolean,
    firstNote: Note = scale[0]
): NoteArray {
    const firstNoteSet = barOfRandomNotes(scale, beatsInBar, firstNote)

    const secondNoteSet = barOfNotes(
        scale,
        beatsInBar,
        randomHarmonic(scale, firstNote, includeJazz)
    )
    const thirdNoteSet = barOfNotes(
        scale,
        beatsInBar,
        randomHarmonic(scale, firstNote, includeJazz)
    )

    const phrase = [
        ...firstNoteSet,
        ...secondNoteSet,
        ...thirdNoteSet,
        firstNote,
    ]

    // Change random notes to 2 beats long

    return phrase
}

function generateMelody(
    scale: NoteArray,
    includeJazz: boolean,
    beatsInBar: number,
    dropPercentage: number,
    rootNote: Note = scale[0]
): Score {
    const firstPhrase = randomPhrase(scale, beatsInBar, includeJazz, rootNote)
    const melody: NoteArray = [
        ...firstPhrase,
        ...firstPhrase,
        ...randomPhrase(scale, beatsInBar, includeJazz, rootNote),
        ...firstPhrase,
    ]

    const melodyWithLength = melody.map((note) => {
        return {
            note: note,
            noteLength: Math.floor(Math.random() * 2) ? 1 : 2,
        }
    })

    return removeRandomNotes(melodyWithLength, dropPercentage)
}

function generateChords(
    scale: NoteArray,
    melody: Score,
    beatsInBar: number,
    jazzChords: boolean
): Score[] {
    const doubledScale = [...scale, ...scale]
    const chordFirstVoice: Score = []
    const chordSecondVoice: Score = []
    const chordThirdVoice: Score = []
    const chordFourthVoice: Score = []

    let i = 0
    for (const note of melody) {
        i++

        const chordLength = note.noteLength * beatsInBar

        // We only consider the first note of each bar
        if (!(i % beatsInBar)) {
            // Choose a random note pattern
            const notePattern = [
                [-6, -4, -2, 0],
                [-4, -2, 0, 2],
                [-2, 0, 2, 4],
                [0, 2, 4, 6],
            ][Math.floor(Math.random() * 4)]

            // Create the chord - each index shifts the note to a different harmonic
            const noteObject = (index: number): typeof note => ({
                note:
                    note.note === "silence"
                        ? "silence"
                        : doubledScale[
                              scale.indexOf(note.note) + notePattern[index]
                          ],
                noteLength: chordLength,
            })

            chordFirstVoice.push(noteObject(0))
            chordSecondVoice.push(noteObject(1))
            chordThirdVoice.push(noteObject(2))
            chordFourthVoice.push(noteObject(3))
        }
    }

    const result = [chordFirstVoice, chordSecondVoice, chordThirdVoice]
    if (jazzChords) {
        result.push(chordFourthVoice)
    }

    return result
}
