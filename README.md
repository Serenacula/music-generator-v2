# Music Generator

This uses a simple algorithm to generate a tune. It has various options to play around with generation.

The code for this one is pretty simple:

1. The core script is in index.astro
2. form.ts: Getting and formatting data from the page
3. music.ts: Score generation functions
    - This includes defining how many beats notes are
4. sound.ts: Managing the actual sound and web AudioAPI
    - This includes a tie-in with the sillyscope because it was easier
5. sillyscope.ts: Generation code for the sillyscope

## Future feature plans:

-   Displaying the note charts
-   Editing the note charts before playing
-   Building out the layout of the song from chunks
-   More options
-   More sound manipulations
-   Wonder if we could get some cool visual art, pulling from the music generated..?
