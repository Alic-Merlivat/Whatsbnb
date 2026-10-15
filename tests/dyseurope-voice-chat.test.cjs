const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../dyseurope-voice-chat.html'),'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
function setup({voice=true, mic=true, storageFails=false, audio=false}={}) {
  class Element {
    constructor(){this.value='';this.checked=true;this.disabled=false;this.children=[];this.events={};this.attrs={};this.classList={toggle(){}};}
    append(...items){this.children.push(...items);}
    setAttribute(k,v){this.attrs[k]=v;}
    addEventListener(k,fn){this.events[k]=fn;}
    focus(){}
    requestSubmit(){return nodes.form.events.submit({preventDefault(){}});}
  }
  const nodes=Object.fromEntries(['message','mic','messages','status','send','voice','stop','form','mic-help'].map(k=>[k,new Element()]));
  let rec, pending, aborted=false;
  const spoken=[], requests=[], players=[], revoked=[];
  let playError;
  const window={isSecureContext:true,addEventListener(){}};
  if(voice){window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};window.speechSynthesis={getVoices:()=>[{lang:'fr-FR'}],cancel(){},speak:u=>spoken.push(u)};}
  if(mic) window.SpeechRecognition=class {constructor(){rec=this;} start(){this.onstart();} stop(){this.onend();} abort(){this.onend();}};
  if(audio) window.Audio=class {constructor(url){this.url=url;players.push(this);} play(){return playError ? Promise.reject(playError) : Promise.resolve();} pause(){this.paused=true;} removeAttribute(){} load(){}};
  const timers=[];
  const context={window,Audio:window.Audio,Blob,atob,URL:{createObjectURL:()=> 'blob:test-'+players.length,revokeObjectURL:url=>revoked.push(url)},document:{getElementById:k=>nodes[k],createElement:()=>new Element()},crypto:require('node:crypto').webcrypto,sessionStorage:{getItem(){if(storageFails)throw Error();return null;},setItem(){}},SpeechSynthesisUtterance:window.SpeechSynthesisUtterance,AbortController,setTimeout:fn=>timers.push(fn),clearTimeout(){},fetch:async(url,options)=>{requests.push({url,...options,payload:JSON.parse(options.body)});return await pending;}};
  vm.runInNewContext(script,context);
  return {nodes,spoken,requests,players,revoked,get rec(){return rec;},timers,setPlayError(error){playError=error;},deferReply(){let resolve;pending=new Promise(r=>resolve=r);return data=>resolve({ok:true,text:async()=>JSON.stringify(data),headers:{get:()=> 'application/json'}});},setReply(data,ok=true,type='application/json'){pending=Promise.resolve({ok,text:async()=> typeof data==='string'?data:JSON.stringify(data),headers:{get:()=>type}});},send(text){nodes.message.value=text;return nodes.form.requestSubmit();}};
}
(async()=>{
  const s=setup();
  s.setReply({output:'Bonjour !'});await s.send('Question');
  assert.equal(s.requests[0].payload.action,'sendMessage');assert.equal(s.requests[0].payload.chatInput,'Question');assert.ok(s.requests[0].payload.sessionId);
  assert.equal(s.spoken[0].lang,'fr-FR');assert.equal(s.spoken[0].text,'Bonjour !');
  s.nodes.voice.checked=false;
  s.setReply([{output:'<img onerror=alert(1)> texte'}]);await s.send('Suite');
  assert.equal(s.requests[1].payload.sessionId,s.requests[0].payload.sessionId);
  assert.equal(s.nodes.messages.children.at(-1).children[1].textContent,'<img onerror=alert(1)> texte');assert.equal(s.spoken.length,1);
  s.nodes.messages.children.at(-1).children[2].events.click();assert.equal(s.spoken.length,2);
  s.setReply({},false);await s.send('Conserver');assert.equal(s.nodes.message.value,'Conserver');assert.equal(s.nodes.send.disabled,false);
  s.setReply({});await s.send('Invalide');assert.equal(s.nodes.message.value,'Invalide');
  s.setReply('Réponse texte',true,'text/plain');await s.send('Texte');assert.equal(s.nodes.messages.children.at(-1).children[1].textContent,'Réponse texte');
  s.setReply('<html>Erreur</html>',true,'text/html');await s.send('HTML');assert.equal(s.nodes.message.value,'HTML');
  s.nodes.message.value='Début';s.nodes.mic.events.click();assert.equal(s.nodes.send.disabled,true);assert.equal(s.rec.lang,'fr-FR');
  s.rec.onresult({results:[[{transcript:'question dictée'}]]});s.nodes.mic.events.click();assert.equal(s.nodes.message.value,'Début question dictée');assert.equal(s.nodes.send.disabled,false);
  s.nodes.mic.events.click();s.rec.onerror({error:'not-allowed'});s.rec.onend();assert.match(s.nodes.status.textContent,/refusé/);
  const fallback=setup({voice:false,mic:false,storageFails:true});assert.equal(fallback.nodes.mic.disabled,true);assert.equal(fallback.nodes.voice.disabled,true);
  fallback.setReply({text:'OK'});await fallback.send('Sans voix');assert.equal(fallback.nodes.message.disabled,false);
  const wav=Buffer.alloc(46);wav.write('RIFF');wav.writeUInt32LE(38,4);wav.write('WAVE',8);wav.write('fmt ',12);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(24000,24);wav.writeUInt32LE(48000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(2,40);
  const audioData={mimeType:'audio/wav',data:wav.toString('base64')};
  const a=setup({audio:true,voice:false});a.setReply({output:'Voix Gemini',audio:audioData});await a.send('Bonjour');
  assert.equal(a.players.length,1);assert.equal(a.nodes.voice.disabled,false);
  a.nodes.stop.events.click();assert.equal(a.players[0].paused,true);assert.equal(a.revoked.length,1);
  a.nodes.messages.children.at(-1).children[2].events.click();assert.equal(a.players.length,2);assert.equal(a.requests.length,1);
  a.players[1].onended();assert.equal(a.revoked.length,2);
  a.setPlayError(Object.assign(new Error('blocked'),{name:'NotAllowedError'}));await a.send('Auto');await new Promise(setImmediate);
  assert.match(a.nodes.status.textContent,/Sélectionnez/);
  a.setPlayError(null);a.nodes.voice.checked=false;await a.send('Muet');assert.equal(a.players.length,3);
  a.nodes.voice.checked=true;
  const resolve=a.deferReply();const sending=a.send('Attendre');a.nodes.stop.events.click();resolve({output:'Retard',audio:audioData});await sending;assert.equal(a.players.length,3);
  a.setReply({output:'Corrompu',audio:{mimeType:'audio/wav',data:'AAAA'}});await a.send('Mauvais audio');assert.match(a.nodes.status.textContent,/audio indisponible/);assert.equal(a.nodes.message.value,'');
  a.setReply({output:'OK',audio:audioData});await a.send('Dernier');const old=a.players.at(-1);a.nodes.stop.events.click();old.onerror();assert.equal(a.nodes.message.disabled,false);
  const addon=JSON.parse(fs.readFileSync(require('node:path').join(__dirname, '../n8n/dyseurope-gemini-tts.nodes.json'),'utf8'));
  function runNode(index,input,prepared){return vm.runInNewContext('(function(){'+addon.nodes[index].parameters.jsCode+'})()',{$input:{first:()=>({json:input})},$:()=>({first:()=>({json:prepared})}),Buffer});}
  const prepared=runNode(0,{output:'# Bonjour **à vous**. [Lien](https://example.com)'})[0].json;
  assert.equal(prepared.output,'# Bonjour **à vous**. [Lien](https://example.com)');
  assert.equal(prepared.request.input[0].content[0].text,'Bonjour à vous. Lien');
  assert.equal(prepared.request.generation_config.speech_config[0].voice,'Sulafat');
  const formatted=runNode(2,{steps:[{type:'model_output',content:[{type:'audio',data:audioData.data}]}]},prepared)[0].json;
  assert.equal(formatted.audio.data,audioData.data);assert.equal(formatted.output,prepared.output);
  assert.equal(runNode(2,{error:'quota'},prepared)[0].json.audio,null);
  assert.equal(runNode(2,{steps:{}},prepared)[0].json.audio,null);
  assert.equal(runNode(2,{steps:[{type:'model_output',content:[{type:'audio',data:'AAAA'}]}]},prepared)[0].json.audio,null);
  assert.equal(addon.active,false);
  console.log('PASS: Gemini WAV playback/replay/stop/mute, autoplay rejection, pending-reply stop, audio URL cleanup, invalid-audio text preservation, speech-node body/format/failure handling.');
  console.log('PASS: JavaScript syntax; n8n payload/session reuse; object/array/plain-text replies; safe text rendering; French speech/mute/replay; HTTP and malformed-response draft recovery; dictation and permission errors; no-voice and blocked-storage fallbacks.');
})().catch(e=>{console.error(e);process.exitCode=1;});
