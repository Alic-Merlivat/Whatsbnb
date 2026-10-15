# Connect Gemini speech to Dyseurope

The page is ready to play Gemini WAV audio returned by the existing chat webhook. The live n8n workflow still needs the speech nodes connected and a Gemini credential selected. No key belongs in the HTML or this repository.

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

Local mocked checks cover payload compatibility, WAV handling, autoplay rejection, replay, stop/mute, stale playback, URL cleanup, and speech-node response formatting. Live Gemini generation and listening quality must be checked using the selected n8n credential. No live n8n workflow has been changed by preparing these files.

Official references: [Gemini speech generation and voice options](https://ai.google.dev/gemini-api/docs/speech-generation), [n8n Chat Trigger response modes](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.chattrigger/).
