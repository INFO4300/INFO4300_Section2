/* INFO 4300 Section 2. Buildless and self-contained. All examples are fictional. */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const lesson = window.LESSON.segments;
const audioData = window.AUDIO_DATA || {};
const audio = $('#narration');
let current = 0, captionsVisible = true, activeCue = -1, activeSignal = -1;
let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let view = 'home';
const phases = ['Purpose & needs','Evidence & priorities','Decisions & plan','Space & service','Evaluate & adjust'];
const shortTitles = ['The service problem','Purpose to objective','Evidence & SWOT','Compare options','Policy, procedure, rule','Make it workable','Plan the space','Keep it working','Marketing starts here','Communicate & evaluate','Prepare for the case'];
const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const signal = (phrase,content,cls='') => `<div class="signal ${cls}" data-signal="${escapeHTML(phrase)}">${content}</div>`;
const figNote = '<p class="visual-note">Cedar Crossing is fictional. All proposed actions, conditions, targets, and results are teaching examples.</p>';
const visuals = {
 welcome: () => `<div class="scene-block"><img src="cedar-crossing.svg" alt="A library room with a quiet desk, shared table, shelves, and movable furniture." width="1120" height="760"><div><span class="small-label">THE STARTING POINT</span><h2>One room.<br>Different needs.</h2>${signal('some people need quiet','<p>Quiet work. Small-group learning. Limited staff time and money.</p>')}${signal('gather evidence','<p><strong>Before choosing a solution, understand the need.</strong></p>')}</div></div>${figNote}`,
 direction: () => `<h2>Purpose → progress → work</h2><p class="intro-line">Each level answers a different question.</p><div class="purpose-ladder">${[
 ['Values','What guides us?','Equitable access','Values guide conduct'],['Vision','What future do we imagine?','A community with welcoming places to learn','Its vision'],['Mission','Why are we here?','Connect residents with information and learning opportunities','Its mission'],['Goal','What broad result matters?','Improve access to suitable study space','A goal'],['Objective','What will we assess, and when?','By the end of an eight-week pilot, at least 80% of surveyed room users report finding space suited to their activity.','An objective'],['Activity','What work will we do?','Test a room schedule; orient staff; collect feedback.','An activity']
 ].map(([t,q,e,p])=>`<div class="purpose-step signal ${t==='Objective'?'objective-highlight':''}" data-signal="${p}"><strong>${t}</strong><p><span class="small">${q}</span><br>${e}</p></div>`).join('')}</div>${figNote}`,
 swot: () => `<h2>SWOT: know the boundary</h2><p class="intro-line">Analyze the library, then look at the environment around it.</p><div class="swot-grid">${[
 ['Strength','INTERNAL / HELPS','Movable tables','movable tables'],['Weakness','INTERNAL / LIMITS','Limited staff capacity','limited staff capacity'],['Opportunity','EXTERNAL / HELPS','A possible community partnership','possible community partnership'],['Threat','EXTERNAL / LIMITS','A proposed municipal funding reduction','proposed reduction']
 ].map(([h,t,p,a])=>`<article class="swot-item signal" data-signal="${a}"><span class="tag">${t}</span><h3>${h}</h3><p>${p}</p></article>`).join('')}</div><div class="pest signal" data-signal="PEST looks"><span><b>P</b>olitical</span><span><b>E</b>conomic</span><span><b>S</b>ocial</span><span><b>T</b>echnological</span></div><p class="visual-note">PEST investigates external forces. SWOT connects external conditions with internal capabilities.</p>${figNote}`,
 decisions: () => `<h2>What could the library do?</h2><p class="intro-line">Criteria: user needs, access, staff capacity, cost, and flexibility.</p><table class="options-table"><caption>Illustrative qualitative comparison. No actual costs or user findings are implied.</caption><thead><tr><th scope="col">Option</th><th scope="col">Potential value</th><th scope="col">Tradeoff</th></tr></thead><tbody><tr class="signal" data-signal="Clearer signs"><td>Improve signs</td><td>Low initial cost; quick to try</td><td>Does not separate competing uses</td></tr><tr class="chosen signal" data-signal="schedule pilot"><td>Schedule pilot</td><td>Reversible; tests quiet and group periods</td><td>Needs staff attention and communication</td></tr><tr class="signal" data-signal="Renovation may"><td>Major renovation</td><td>Potential for greater separation</td><td>Funding, disruption, design, and ongoing support</td></tr></tbody></table><div class="choice-note signal" data-signal="manager selects"><b>Our fictional choice:</b> a schedule pilot to learn within current capacity. Review the choice after use.</div>${figNote}`,
 policy: () => `<h2>Three statements. Three purposes.</h2><div class="policy-stack">${[
 ['Policy','A framework for judgment','Room access supports equitable learning use, guided by published service priorities.','Our fictional policy'],['Procedure','An ordered workflow','Check the schedule → identify a period → record the booking → confirm the arrangement.','A procedure explains'],['Rule','A specific expectation','During posted quiet periods, conversations must take place outside the room.','A rule specifies']
 ].map(([t,s,p,a])=>`<article class="policy-item signal" data-signal="${a}"><div><h3>${t}</h3><small>${s}</small></div><p>${p}</p></article>`).join('')}</div>${figNote}`,
 implementation: () => `<div class="plan-sheet"><span class="small-label">CEDAR CROSSING / PILOT PLAN</span><h2>From intention to action</h2><dl><dt>Owner</dt><dd class="signal" data-signal="designated coordinator">A designated pilot coordinator</dd><dt>Time frame</dt><dd>Eight weeks, with a mid-pilot check</dd><dt>Resources</dt><dd>Existing room and furniture; approved staff time</dd><dt>Preparation</dt><dd>A current schedule and staff walkthrough</dd><dt>Evidence</dt><dd class="signal" data-signal="what to measure">Successful use, unmet requests, barriers, and workload</dd></dl><div class="plan-cycle signal" data-signal="adjust the schedule"><span>Record a baseline</span><span>Check progress</span><span>Review & adjust ↻</span></div></div>${figNote}`,
 facilities: () => `<h2>Plan activities and relationships</h2><p class="intro-line">Conceptual illustration only. Schematic, not to scale; no code or accessibility certification.</p><div class="floorplan"><div class="floor-zone signal" data-signal="quiet-use area"><h3>Quiet-use area</h3><p>Focus work<br>Locate away from active conversation</p></div><div class="floor-zone active-zone signal" data-signal="active collaboration"><h3>Collaboration area</h3><p>Movable tables<br>Support changing group activities</p></div><div class="floor-route signal" data-signal="clear route">Clear circulation route · visible destination · accessible approach</div><span class="floor-entrance">ENTRANCE ↑</span></div><div class="space-legend"><span>Power & data access</span><span>Flexible furniture</span><span>Staff workflow</span></div><div class="choice-note signal" data-signal="architectural program"><b>Architectural program:</b> the written requirements that help specialists design the space.</div>${figNote}`,
 maintenance: () => `<h2>Keep the service usable</h2><p class="intro-line">Opening is one moment in a longer operating life.</p><div class="continuity"><article class="signal" data-signal="who checks the room"><h3>Maintain</h3><p>Clear ownership<br>Report problems<br>Coordinate and follow up</p></article><article class="signal" data-signal="Emergency preparation"><h3>Prepare</h3><p>Roles and communication<br>Current procedures<br>Training across shifts</p></article><article class="signal" data-signal="After people use"><h3>Review</h3><p>Access and comfort<br>Function and safety concerns<br>Adjust after use</p></article></div><p class="visual-note">For actual emergencies, follow your institution’s current procedures.</p>`,
 marketing: () => `<h2>Start with people and the service</h2><p class="intro-line">The chapter’s marketing mix connects needs, delivery, and communication.</p><div class="marketing-layout"><ul class="cs-list"><li class="signal" data-signal="three Cs"><strong>Customer</strong><span>Whose needs are we meeting?</span></li><li><strong>Convenience</strong><span>How easy is it to use?</span></li><li><strong>Communication</strong><span>How will people know and respond?</span></li></ul><div class="ps-grid signal" data-signal="six Ps">${[['Product','The service'],['Price','Charge and value'],['Place','Where it is available'],['Process','How it works'],['Participants','People involved'],['Promotion','How it is communicated']].map(([h,p])=>`<div><strong>${h}</strong><span>${p}</span></div>`).join('')}</div></div><div class="choice-note signal" data-signal="An attractive announcement"><b>Check the promise:</b> can people access the service, and can staff deliver it?</div>`,
 evaluation: () => `<div class="poster-example"><span class="small-label">FICTIONAL MESSAGE / BENEFIT + NEXT STEP</span><h3>Need a predictable quiet place to study?</h3><p>Check the quiet-use periods on the room schedule.</p></div><div class="evaluation-strip"><div class="signal" data-signal="Reach tells"><b>Awareness</b><span>Did intended users encounter and understand the message?</span></div><div class="signal" data-signal="suitable space"><b>Experience</b><span>Could they find and use suitable space?</span></div><div class="signal" data-signal="workload"><b>Sustainability</b><span>Could staff maintain the service?</span></div></div><p class="visual-note">Use evidence to keep, change, or discontinue an approach. A count alone cannot explain why something happened.</p>`,
 case: () => `<h2>Two time perspectives</h2><p class="intro-line"><cite>For This We Get a Master’s Degree?</cite> · Handgrove College Library</p><div class="case-columns"><article class="signal" data-signal="what planning might"><span class="number">01</span><h3>Before the problem</h3><p>What planning might have prevented this situation?</p></article><article class="signal" data-signal="what the library should do now"><span class="number">02</span><h3>From this point forward</h3><p>What should the library do now, and how would it assess the result?</p></article></div><div class="case-process"><span>Facts & missing information</span><span>Needs & affected people</span><span>Relevant concepts</span><span>Options & tradeoffs</span><span>Your justified recommendation</span><span>Implementation & evaluation</span></div><p class="visual-note">An original analysis aid, not an answer key. Read the full case and current assignment instructions in Canvas.</p>`
};
function showView(name){
 audio.pause();
 if (view==='game' && name!=='game') pauseGame(true);
 ['home','lesson','game','finish'].forEach(id=>$('#'+id).hidden=id!==name);
 view=name;
 window.scrollTo({top:0,behavior:reduced?'auto':'smooth'});
}
function renderLesson(index,focus=true){
 current=Math.max(0,Math.min(lesson.length-1,index));
 const s=lesson[current];
 showView('lesson');
 audio.pause(); audio.removeAttribute('src'); audio.load();
 const meta=audioData[s.id] || {filename:`narration-${s.id}.mp3`,captions:`narration-${s.id}.vtt`,cues:[]};
 audio.src=meta.filename || meta.audioFilename || `narration-${s.id}.mp3`;
 audio.playbackRate=Number($('#speed').value);audio.muted=$('#mute-all').checked;
 audio.load();
 activeCue=-1;activeSignal=-1;
 $('#media-error').hidden=true;
 $('#media-error').textContent='Audio is unavailable. You can read this chapter below or open the full transcript.';
 $('#chapter-kicker').textContent=s.chapter;
 $('#chapter-title').textContent=s.title;
 $('#progress-text').textContent=`${current+1} of ${lesson.length}`;
 $('#lesson-progress').value=current+1;
 $('#page-label').textContent=`Chapter ${current+1} / ${lesson.length}`;
 $('#chapter-select').value=current;
 $$('.chapter-button').forEach((b,i)=>{if(i===current)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
 $('#route').innerHTML=phases.map((p,i)=>`<li class="${i===s.phase?'active':''}" ${i===s.phase?'aria-current="step"':''}>${p}</li>`).join('');
 $('#visual').innerHTML=visuals[s.id]();
 $('#takeaway').textContent=s.takeaway;
 $('#captions').textContent='Press Play to hear this chapter. Captions appear here.';
 $('#captions').hidden=!captionsVisible;
 $('#download-audio').href=audio.getAttribute('src');
 $('#caption-download').href=meta.captions || `narration-${s.id}.vtt`;
 $('#chapter-text').innerHTML=`<p>${escapeHTML(s.narration)}</p>`;
 $('#chapter-transcript').open=false;
 $('#explore-content').innerHTML=s.explore.map(([h,p])=>`<h3>${escapeHTML(h)}</h3><p>${escapeHTML(p)}</p>`).join('');
 $('.explore').open=false;
 $('#previous').disabled=current===0;
 $('#next').textContent=current===lesson.length-1?'Optional game →':'Next →';
 renderPractice(s);
 if(focus) $('#chapter-title').focus({preventScroll:true});
}
function renderPractice(s){
 const slot=$('#practice-slot');
 if(!s.question){slot.innerHTML='';return;}
 slot.innerHTML=`<section class="practice" aria-label="Optional practice"><div class="practice-heading"><div><span class="small-label">TRY IT / ABOUT 20 SECONDS</span><h2>Put the idea to work</h2></div><button class="compact" id="open-practice">Try it</button></div><div id="practice-body" hidden><p class="question" id="question-text">${escapeHTML(s.question.prompt)}</p><div class="practice-options" role="group" aria-labelledby="question-text">${s.question.choices.map((c,i)=>`<button data-answer="${i}" aria-pressed="false">${escapeHTML(c)}</button>`).join('')}</div><div id="practice-feedback" role="status"></div><div class="practice-actions"><button class="text-button" id="retry-practice">Try again</button><button class="text-button" id="finish-practice">Continue lesson</button></div></div><button class="text-button" id="skip-practice">Skip this practice</button></section>`;
 $('#open-practice').onclick=()=>{audio.pause();$('#practice-body').hidden=false;$('#open-practice').hidden=true;$('.practice-options button').focus()};
 $$('.practice-options button').forEach(b=>b.onclick=()=>{
 audio.pause(); const i=Number(b.dataset.answer);
 $$('.practice-options button').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));
 $('#practice-feedback').className='practice-feedback';
 $('#practice-feedback').textContent=(i===s.question.answer?'Correct. ':'Consider this: ')+s.question.feedback[i];
 });
 $('#retry-practice').onclick=()=>{audio.pause();$$('.practice-options button').forEach(b=>b.setAttribute('aria-pressed','false'));$('#practice-feedback').textContent='';$('#practice-feedback').className='';$('.practice-options button').focus()};
 const finish=()=>{audio.pause();$('#practice-body').hidden=true;$('#open-practice').hidden=false;$('#open-practice').textContent='Revisit';$('#media-error').hidden=true;$('#next').focus()};
 $('#finish-practice').onclick=finish;$('#skip-practice').onclick=finish;
}
function updateAudio(){
 const cues=(audioData[lesson[current].id]||{}).cues||[];
 const t=audio.currentTime;
 const i=cues.findIndex(c=>t>=c.start && t<c.end);
 if(i!==activeCue){activeCue=i;$('#captions').textContent=i>=0?cues[i].text:(audio.ended?'Chapter narration finished. Revisit any part, try the practice, or continue.':'');}
 let chosen=null;
 const spoken=cues.filter(c=>c.start<=t).map(c=>c.text.toLowerCase()).join(' ');
 $$('#visual [data-signal]').forEach(el=>{if(spoken.includes(el.dataset.signal.toLowerCase()))chosen=el});
 $$('#visual .signal').forEach(el=>el.classList.toggle('is-speaking',el===chosen));
}
audio.addEventListener('timeupdate',updateAudio);
audio.addEventListener('ended',()=>{$('#captions').textContent='Chapter narration finished. Revisit any part, try the practice, or continue.'});
audio.addEventListener('error',()=>{$('#media-error').hidden=false});
audio.addEventListener('play',()=>{if(view!=='lesson')audio.pause(); const pb=$('#practice-body');if(pb&&!pb.hidden){audio.pause();$('#media-error').hidden=false;$('#media-error').textContent='Narration is paused during practice. Choose Continue lesson, then press Play to resume.';}});
$('#speed').onchange=()=>audio.playbackRate=Number($('#speed').value);
$('#replay').onclick=()=>{audio.pause();audio.currentTime=0;audio.play().catch(()=>{$('#media-error').hidden=false})};
$('#toggle-captions').onclick=()=>{captionsVisible=!captionsVisible;$('#captions').hidden=!captionsVisible;$('#toggle-captions').textContent=captionsVisible?'Hide captions':'Show captions';$('#toggle-captions').setAttribute('aria-pressed',String(captionsVisible))};
$('#mute-all').onchange=()=>audio.muted=$('#mute-all').checked;
$('#narration-volume').oninput=()=>audio.volume=Number($('#narration-volume').value);
$('#reduce-motion').checked=reduced;
document.body.classList.toggle('reduce-motion',reduced);
$('#reduce-motion').onchange=()=>{reduced=$('#reduce-motion').checked;document.body.classList.toggle('reduce-motion',reduced);};
$('#chapter-nav').innerHTML=lesson.map((s,i)=>`<button class="chapter-button" data-chapter="${i}"><b>${String(i+1).padStart(2,'0')}</b><span>${shortTitles[i]}</span></button>`).join('');
$('#chapter-select').innerHTML=lesson.map((s,i)=>`<option value="${i}">${i+1}. ${shortTitles[i]}</option>`).join('');
$$('.chapter-button').forEach(b=>b.onclick=()=>renderLesson(Number(b.dataset.chapter)));
$('#chapter-select').onchange=()=>renderLesson(Number($('#chapter-select').value));
$('#start').onclick=()=>renderLesson(0);
$('#previous').onclick=()=>renderLesson(current-1);
$('#next').onclick=()=>current<lesson.length-1?renderLesson(current+1):openGame();
$('#go-home').onclick=()=>{showView('home');$('#start').focus()};
$('#jump-game').onclick=()=>openGame();
$('#review-case').onclick=()=>renderLesson(lesson.length-1);
$('#replay-game').onclick=()=>{openGame();resetGame()};
$('#skip-game').onclick=()=>finishLesson();
function finishLesson(){showView('finish');$('#finish-title').focus({preventScroll:true});}

// Game: timers advance only while a timed question is active and the page is visible.
const questions=[
 {statement:'A plan needs a way to review results.',answer:0,explanation:'True. Evaluation tells you whether the plan achieved its purpose and what to adjust.',practice:true},
 {statement:'Completing a purchase proves that user needs were met.',answer:1,explanation:'False. A purchase is an activity or output. You still need evidence about the intended service result.'},
 {statement:'SWOT strengths and weaknesses describe internal conditions.',answer:0,explanation:'True. Opportunities and threats describe external conditions. The organizational boundary matters.'},
 {statement:'A poster can solve the room’s low-use problem.',answer:2,explanation:'It depends. If the relevant barrier is awareness, an effective poster may help. If hours or access prevent use, promotion alone cannot solve it.',golden:true},
 {statement:'A procedure describes steps for a recurring task.',answer:0,explanation:'True. A procedure gives a workflow, while a policy gives the broader framework for decisions.'},
 {statement:'A group is always the best way to make a decision.',answer:1,explanation:'False. Groups can add knowledge and participation, but they cost time and can create pressure to agree. Match the process to the decision.'},
 {statement:'Facilities planning ends on opening day.',answer:1,explanation:'False. Maintenance, emergency preparation, and evaluation after occupancy remain part of managing the service.',golden:true},
 {statement:'Marketing includes service design as well as promotion.',answer:0,explanation:'True. Marketing connects user needs, service design, delivery, communication, and evaluation.'},
 {statement:'A high satisfaction percentage is enough to prove equitable access.',answer:1,explanation:'False. Check response counts and who is missing, including people who could not use the service.'}
];
let state={round:-1,score:0,lives:3,streak:0,active:false,paused:false,elapsed:0,limit:14,mode:'timed',finished:false,started:false};
let raf=0,lastFrame=0,gameSounds=false,audioContext=null;
let sessionBest={timed:0,untimed:0},storageAvailable=true;
function mode(){return $('input[name="game-mode"]:checked').value}
if(reduced){$('input[name="game-mode"][value="untimed"]').checked=true;}
function readBest(m){try{return Math.max(sessionBest[m],Number(localStorage.getItem('info4300-s2-loot-v1-'+m))||0)}catch{storageAvailable=false;return sessionBest[m]}}
function saveBest(){if(state.score>readBest(state.mode)){sessionBest[state.mode]=state.score;try{localStorage.setItem('info4300-s2-loot-v1-'+state.mode,String(state.score))}catch{storageAvailable=false}}}
function stats(){
 $('#score').textContent=state.score;$('#lives').textContent=state.lives;$('#streak').textContent=state.streak;$('#best').textContent=readBest(state.started?state.mode:mode());
 $('#best').title=storageAvailable?'Saved only in this browser on this device.':'Browser storage is unavailable; best is kept for this visit only.';
}
function announce(s){$('#game-announcement').textContent=s}
function openGame(){showView('game');stats();$('#game-heading').focus({preventScroll:true});}
function setBaskets(enabled){$$('[data-basket]').forEach(b=>b.disabled=!enabled)}
function sound(correct){if(!gameSounds)return;try{audioContext=audioContext||new(window.AudioContext||window.webkitAudioContext)();audioContext.resume();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.value=correct?660:220;g.gain.setValueAtTime(.04,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.13);o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+.14)}catch{}}
function resetGame(){
 cancelAnimationFrame(raf);state={round:-1,score:0,lives:3,streak:0,active:false,paused:false,elapsed:0,limit:14,mode:mode(),finished:false,started:false};
 $('#round-label').textContent='Ready to shelve a few ideas?';$('#clock').textContent='';$('#gold-label').textContent='START WITH A PRACTICE TURN';$('#statement').textContent='Choose timed or untimed mode, then start. Questions pause for feedback after every answer.';$('#book-card').className='book-card';$('#book-card').style.transform='';$('#game-feedback').textContent='';$('#game-start').hidden=false;$('#game-continue').hidden=true;$('#game-pause').disabled=true;$('#game-pause').textContent='Pause';$$('input[name="game-mode"]').forEach(r=>r.disabled=false);setBaskets(false);stats();
}
function startRound(){
 if(state.round>=questions.length || state.lives<=0){endGame();return;}
 const q=questions[state.round];state.active=true;state.paused=false;state.elapsed=0;state.limit=q.practice?18:Math.max(10,14-(state.round-1)*.45);
 $('#round-label').textContent=q.practice?'Practice turn · no points or lost lives':`Book ${state.round} of ${questions.length-1}`;
 $('#gold-label').textContent=q.practice?'PRACTICE':q.golden?'GOLDEN BOOK · DOUBLE POINTS + A BONUS LIFE':'CATCH THE IDEA';
 $('#book-card').className='book-card'+(q.golden?' golden':'');$('#book-card').style.transform='translateY(0)';$('#statement').textContent=q.statement;$('#game-feedback').textContent='';$('#game-continue').hidden=true;$('#game-start').hidden=true;$('#game-pause').disabled=false;$('#game-pause').textContent='Pause';setBaskets(true);
 announce(`${q.practice?'Practice':q.golden?'Golden-book bonus round':'Question'}. ${q.statement} Choose True, False, or It depends.`);
 $('#game-board').focus({preventScroll:true});lastFrame=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);
}
function tick(now){
 if(!state.active)return;
 const dt=Math.min(200,now-lastFrame);lastFrame=now;
 if(!state.paused && !document.hidden && state.mode==='timed'){
 state.elapsed+=dt/1000;const pct=Math.min(1,state.elapsed/state.limit);
 const available=Math.max(0,$('#drop-zone').clientHeight-$('#book-card').offsetHeight-20);
 $('#book-card').style.transform=reduced?'translateY(0)':`translateY(${pct*Math.min(available,85)}px)`;
 $('#clock').textContent=Math.max(0,Math.ceil(state.limit-state.elapsed))+' sec';
 if(pct>=1){answer(-1);return;}
 }else{$('#clock').textContent=state.paused?'Paused':state.mode==='untimed'?'Untimed':'';}
 raf=requestAnimationFrame(tick);
}
function answer(choice){
 if(!state.active||state.paused)return;
 const q=questions[state.round],correct=choice===q.answer;state.active=false;cancelAnimationFrame(raf);setBaskets(false);$('#game-pause').disabled=true;$('#clock').textContent='Feedback · clock paused';
 let reward='';
 if(!q.practice){
 if(correct){state.streak++;const bonus=Math.min(100,Math.max(0,state.streak-1)*20);const points=(100+bonus)*(q.golden?2:1);state.score+=points;reward=` +${points} points${bonus?' including a streak bonus':''}.`;if(q.golden){state.lives=Math.min(5,state.lives+1);reward+=' One bonus life, up to five.';}}
 else{state.lives--;state.streak=0;reward=' One life used. The explanation stays available.';}
 }else{reward=' Practice does not affect points or lives.';}
 const prefix=choice===-1?'Time is up. ':correct?'Nice catch. ':'Try this idea. ';
 $('#game-feedback').textContent=prefix+q.explanation+reward;
 $('#game-continue').hidden=false;$('#game-continue').textContent=state.round===questions.length-1||state.lives<=0?'See results':'Continue →';
 stats();sound(correct);$('#game-continue').focus({preventScroll:true});
}
function pauseGame(force=false){
 if(!state.active)return;
 state.paused=force?true:!state.paused;$('#game-pause').textContent=state.paused?'Resume':'Pause';setBaskets(!state.paused);$('#clock').textContent=state.paused?'Paused':'';announce(state.paused?'Game paused. Choose Resume when ready.':'Game resumed.');
}
function endGame(){
 state.active=false;state.finished=true;cancelAnimationFrame(raf);setBaskets(false);saveBest();stats();$('#round-label').textContent='Your shelf is complete';$('#clock').textContent='';$('#gold-label').textContent='THANKS FOR PLAYING';$('#statement').textContent=`${state.score} points. Keep the learning; leave the speed pressure.`;$('#book-card').style.transform='';$('#book-card').className='book-card';$('#game-feedback').textContent='You can replay, try the other mode, or return to the case preparation. All statements and explanations are also in the full transcript.';$('#game-continue').hidden=false;$('#game-continue').textContent='Return to course next steps';$('#game-pause').disabled=true;$$('input[name="game-mode"]').forEach(r=>r.disabled=false);announce(`Finished with ${state.score} points. Best on this device in ${state.mode} mode: ${readBest(state.mode)}.`);$('#game-continue').focus({preventScroll:true});
}
$('#game-start').onclick=()=>{state.started=true;state.mode=mode();state.round=0;$$('input[name="game-mode"]').forEach(r=>r.disabled=true);startRound()};
$('#game-continue').onclick=()=>{if(state.finished){finishLesson();return;}state.round++;startRound()};
$('#game-pause').onclick=()=>pauseGame();
$('#game-restart').onclick=()=>{resetGame();$('#game-start').focus({preventScroll:true})};
$$('[data-basket]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.basket)));
$('#game-board').addEventListener('keydown',e=>{if(!$('#game-shortcuts').checked||e.altKey||e.ctrlKey||e.metaKey||e.repeat)return;if(['1','2','3'].includes(e.key)&&state.active&&!state.paused){e.preventDefault();answer(Number(e.key)-1)}});
$$('input[name="game-mode"]').forEach(r=>r.onchange=()=>{if(!state.active){resetGame();stats()}});
$('#game-sound').onclick=()=>{gameSounds=!gameSounds;$('#game-sound').textContent=gameSounds?'Sounds on':'Sounds off';$('#game-sound').setAttribute('aria-pressed',String(gameSounds));if(gameSounds)sound(true)};
document.addEventListener('visibilitychange',()=>{if(document.hidden){audio.pause();pauseGame(true)}});
stats();
})();
