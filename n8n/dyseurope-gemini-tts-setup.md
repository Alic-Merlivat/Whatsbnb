# Connect Gemini speech to Dyseurope

The page is ready to play Gemini WAV audio returned by the existing chat webhook. The speech integration is connected and tested in the unpublished [Dyseurope - Gemini voice test](https://strelitzia.app.n8n.cloud/workflow/gqIthLV7gufoqz8i) workflow, using the existing Google credential. The production workflow remains unchanged pending review. No key belongs in the HTML or this repository.

## Set up n8n

1. Open the existing Dyseurope workflow in the n8n editor. Duplicate it for a test first so the current chatbot keeps working.
2. Import `dyseurope-gemini-tts.nodes.json` as a separate **inactive** workflow. This is an add-on with four connected nodes, not a replacement chatbot. Copy those four nodes into the test copy of the existing chatbot workflow, preserving their names.
3. Connect the node that produces the final answer (`output` or `text`) to **Dyseurope - Prepare speech**. Keep the existing agent, knowledge sources, memory, and Gemini chat model.
4. In **Dyseurope - Gemini speech**, select your existing **Google Gemini(PaLM) Api** credential. The HTTP Request uses Predefined Credential Type → Google Gemini(PaLM) Api. If that credential cannot access the TTS model, check model access/quota in its Google project; do not paste a key into the node body or website.
5. In the Chat Trigger, set **Response Mode → Using Response Nodes** (older versions: Using Respond to Webhook Node). The included **Dyseurope - Send reply** must send the final JSON. Disconnect any previous response node on this path so the request receives exactly one response. Keep Embedded Chat and the existing allowed website origins.
6. Test the copied workflow before changing the original. A successful reply should contain both `output` (the original text) and `audio: { mimeType: 'audio/wav', data: '…base64…' }`. The browser sends `action`, `sessionId`, and `chatInput` exactly as before.
7. After review, apply the tested nodes to the existing workflow, save/publish it, and deploy the updated HTML through the site's existing deployment process. Keep the production webhook URL in the HTML unchanged. If you test against a duplicate workflow's URL, use a separate local HTML copy and restore the production URL before deployment.

## Voice and delivery

The prepared request uses `gemini-3.8-flash-tts` with the **Sulafat** voice and a warm, reassuring French delivery. Style instructions are separate from the transcript so they are not read aloud. Change `generation_config.speech_config[0].voice` and the `speech_metadata.style` value in **Dyseurope - Prepare speech** to audition alternatives.

The speech transcript removes simple Markdown formatting and retains link labels. The displayed answer is preserved. For smoother replies and shorter waiting times, add this guidance to the existing agent's system instructions: “Réponds en français, avec des phrases courtes et naturelles adaptées à la lecture à voix haute. Vise moins de 150 mots sauf si la question exige davantage de détails. Évite les tableaux et les longues listes.”

## Playback and failure behavior

- Automatic playback, replay, stop, and mute work with the returned WAV. Replay reuses the received audio without another Gemini call.
- If a browser blocks automatic playback, the page invites the visitor to select **Écouter la réponse**.
- Stop or mute while waiting also prevents the pending reply from starting automatically.
- HTTP errors, missing audio, and invalid/oversized WAV responses preserve the text answer. The workflow returns `audio: null` when generation fails; the page then uses the existing device voice when available and identifies that fallback.
- Raw PCM is not a WAV file. This add-on explicitly requests complete WAV output; it validates the RIFF/WAVE header before returning audio.
- This initial version generates audio with every answer, even when the visitor has muted playback. Mute controls playback, not API usage. The speech HTTP request has a 60-second timeout; the page allows 90 seconds for the combined chat and speech response. A slow agent plus speech can still exceed that limit.
- No transcript/audio is stored by the page across reloads; only the tab session identifier is saved. n8n and Google's own execution/data-retention settings still apply.

## Validation status

Local mocked checks pass for payload compatibility, WAV handling, autoplay rejection, replay, stop/mute, stale playback, URL cleanup, and speech-node response formatting.

On 15 October 2026, the test workflow completed a French chat request through the agent, speech preparation, Gemini speech, formatting, and response nodes in 9.384 seconds. The formatter returned the original French answer plus base64 audio with MIME type audio/wav and a valid RIFF/WAVE header. A separate speech-only request also completed successfully. Both used the existing Google Gemini(PaLM) Api credential; no key was exported.

The test copy is unpublished. The original production workflow and index.html were not changed. Audible quality and playback in the deployed website still need review; the workflow test proves audio generation and response formatting, not browser playback.

Official references: [Gemini speech generation and voice options](https://ai.google.dev/gemini-api/docs/speech-generation), [n8n Chat Trigger response modes](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.chattrigger/).
