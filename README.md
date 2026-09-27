# QVAC Bedtime Story Starter

Enter a character and a setting and an on-device AI writes just a short opening paragraph (3-5 sentences) for a bedtime story using those specifics — a "starter" to spark a story, not a full tale. No cloud call, no API key.

## How it works

1. You type a character (e.g. `a shy young fox named Wisp`) and a setting (e.g. `a moonlit meadow full of fireflies`) into the two input fields and submit.
2. The server asks the on-device model for only the opening paragraph of a gentle, cozy bedtime story — explicitly told to set the scene and stop on a note of anticipation, never to resolve the plot or write an ending.
3. The reply is streamed token-by-token and cleaned up (stripped of quotes and preambles like "Here's...").
4. `logic.js` checks that the result actually mentions both the character and the setting (`mentionsBoth`) and isn't a refusal or too long; if either check fails, it falls back to a guaranteed on-topic starter paragraph built from your exact inputs.

### Example

- Input: character `a shy young fox named Wisp`, setting `a moonlit meadow full of fireflies`
- Typical output: `"In a moonlit meadow where fireflies drifted like slow-blinking stars, a shy young fox named Wisp peeked out from behind a tall stalk of grass..."`

### QVAC functions used

- `loadModel({ modelSrc: LLAMA_3_2_1B_INST_Q4_0 })` — loads the model on-device at startup (`src/gui.js`).
- `completion({ modelId, history, stream: true, completionOpts })` — generates the story starter, streamed via `run.tokenStream` (`src/logic.js`).
- `unloadModel({ modelId })` — releases the model when the server shuts down (`src/gui.js`).

## Run

```bash
npm install
npm start
```

Then open http://localhost:31024

The port can be overridden with the `PORT` environment variable.

## QVAC SDK version

`@qvac/sdk` ^0.19.0 (see `package.json`).

## License

MIT
