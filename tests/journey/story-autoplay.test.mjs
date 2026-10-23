import test from 'node:test';
import assert from 'node:assert/strict';
import { StoryAutoplay } from '../../src/components/home/journey/story-autoplay.mjs';
import { StorySequence } from '../../src/components/home/journey/story-sequence.mjs';
import { VideoScrubber } from '../../src/components/home/journey/controller.mjs';

class Video extends EventTarget {
  constructor() { super(); Object.assign(this,{src:'',currentSrc:'',readyState:0,duration:2,seeking:false,paused:true,time:0,seeks:[],plays:0}); }
  get currentTime(){return this.time;}
  set currentTime(value){this.time=value;this.seeks.push(value);}
  pause(){this.paused=true;}
  play(){this.plays++;if(this.blocked)return Promise.reject(new Error('blocked'));this.paused=false;this.dispatchEvent(new Event('play'));return Promise.resolve();}
  load(){this.readyState=0;this.currentSrc='';this.time=0;}
  removeAttribute(){this.src='';}
  decode(){this.currentSrc=this.src;this.readyState=2;this.dispatchEvent(new Event('loadedmetadata'));this.dispatchEvent(new Event('loadeddata'));}
  advance(time){this.time=time;this.dispatchEvent(new Event('timeupdate'));}
  end(){this.advance(this.duration);this.paused=true;this.dispatchEvent(new Event('ended'));}
}
function fixture(options = {}){
  const videos=Array.from({length:5},()=>new Video());
  const layers=videos.map(video=>({video,element:{classList:{add(){},remove(){}},style:{setProperty(){}},setAttribute(){}}}));
  const mediaStates=[];
  const sequence=new StorySequence(layers,{Scrubber:VideoScrubber,assetBase:'https://example.test/assets',mobile:false,onState:state=>mediaStates.push(state)});
  const queue=new Map(),states=[],completions=[];let id=0,time=0;
  const auto=new StoryAutoplay(sequence,{requestFrame:cb=>{queue.set(++id,cb);return id;},cancelFrame:key=>queue.delete(key),onState:x=>states.push(x),onComplete:()=>completions.push(true),transitionMs:100,...options});
  return {videos,sequence,auto,states,queue,mediaStates,completions,
    async start(){auto.enable(0);auto.setActive(true);videos[0].decode();videos[1].decode();await Promise.resolve();},
    tick(step=20){const entry=queue.entries().next().value;if(entry){queue.delete(entry[0]);time+=step;entry[1](time);}},
    finishTransition(){let n=0;while(queue.size&&n++<40)this.tick();assert.equal(queue.size,0);},
    dispose(){auto.dispose();sequence.dispose();}
  };
}

test('default autoplay uses native playback and advances both the film and copy without scroll or repeated seeks',async()=>{
  const f=fixture();try{await f.start();assert.equal(f.videos[0].paused,false);assert.equal(f.videos[0].plays,1);
    f.videos[0].advance(.5);const first=f.sequence.progress;f.videos[0].advance(1.25);
    assert.ok(f.sequence.progress>first);assert.equal(f.videos[0].seeks.length,0);
    f.videos[0].end();f.finishTransition();await Promise.resolve();
    assert.equal(f.sequence.state.index,1);assert.equal(f.videos[1].paused,false);assert.equal(f.videos[0].paused,true);
  }finally{f.dispose();}
});
test('a delayed animation frame completes the handoff on time instead of stretching the transition', async () => {
  const f=fixture();try{
    await f.start();
    f.videos[0].end();
    f.tick(); f.tick(1000); await Promise.resolve();
    assert.equal(f.auto.index,1);
    assert.equal(f.videos[1].paused,false);
    assert.equal(f.queue.size,0);
  }finally{f.dispose();}
});
test('autoplay runs every chapter in sequence and ends with a replay control',async()=>{
  const f=fixture();try{await f.start();for(let i=0;i<5;i++){
    if(f.videos[i].readyState<2)f.videos[i].decode();await Promise.resolve();assert.equal(f.videos[i].paused,false);
    if(f.videos[i+1])f.videos[i+1].decode();f.videos[i].end();f.finishTransition();await Promise.resolve();
  }assert.equal(f.sequence.progress,1);assert.equal(f.auto.phase,'complete');assert.equal(f.states.at(-1),false);
    f.auto.resume();await Promise.resolve();assert.equal(f.sequence.state.index,0);assert.equal(f.videos[0].paused,false);
  }finally{f.dispose();}
});
test('offscreen and user pause suspend playback and crossfade work without losing the current position',async()=>{
  const f=fixture();try{await f.start();f.videos[0].advance(1);f.auto.setActive(false);assert.equal(f.videos[0].paused,true);
    f.auto.setActive(true);await Promise.resolve();assert.equal(f.videos[0].currentTime,1);assert.equal(f.videos[0].paused,false);
    f.videos[0].end();f.tick();f.tick();const position=f.sequence.progress;f.auto.pause();assert.equal(f.queue.size,0);
    f.auto.setActive(false);f.auto.setActive(true);assert.equal(f.sequence.progress,position);assert.equal(f.queue.size,0);
    f.auto.resume();f.finishTransition();assert.equal(f.sequence.state.index,1);
  }finally{f.dispose();}
});
test('switching to scroll control pauses native playback and restores accurate seeking',async()=>{
  const f=fixture();try{await f.start();f.auto.disable();f.sequence.setProgress(.12);
    assert.equal(f.videos[0].paused,true);assert.equal(f.videos[0].currentTime,1.4583333333333333);
    assert.ok(f.videos[0].seeks.length>0);const progress=f.sequence.progress;
    f.auto.enable(progress);f.auto.setActive(true);await Promise.resolve();assert.equal(f.videos[0].paused,false);
  }finally{f.dispose();}
});
test('blocked autoplay keeps the poster and visible play control, then resumes on an explicit play action',async()=>{
  const f=fixture();try{f.videos[0].blocked=true;await f.start();await Promise.resolve();
    assert.equal(f.auto.userPaused,true);assert.equal(f.states.at(-1),false);assert.equal(f.sequence.progress,0);
    f.videos[0].blocked=false;f.auto.resume();await Promise.resolve();assert.equal(f.videos[0].paused,false);
  }finally{f.dispose();}
});

test('a delayed incoming decoder holds the outgoing film and resumes without frame polling',async()=>{
  const f=fixture();try{
    f.auto.enable(0);f.auto.setActive(true);f.videos[0].decode();await Promise.resolve();
    f.videos[0].end();
    assert.equal(f.queue.size,0);
    assert.equal(f.auto.index,0);
    assert.equal(f.sequence.progress,.16);
    f.videos[1].decode();f.finishTransition();await Promise.resolve();
    assert.equal(f.auto.index,1);assert.equal(f.videos[1].paused,false);
  }finally{f.dispose();}
});

test('a failed incoming clip exposes retry while preserving the outgoing frame',async()=>{
  const f=fixture();try{
    f.auto.enable(0);f.auto.setActive(true);f.videos[0].decode();await Promise.resolve();
    f.videos[0].end();assert.equal(f.mediaStates.at(-1).ready,false);
    f.videos[1].currentSrc=f.videos[1].src;f.videos[1].dispatchEvent(new Event('error'));
    assert.equal(f.mediaStates.at(-1).failed,true);assert.equal(f.auto.index,0);
    f.sequence.retry();f.videos[1].decode();f.finishTransition();await Promise.resolve();
    assert.equal(f.auto.index,1);assert.equal(f.mediaStates.at(-1).failed,false);
  }finally{f.dispose();}
});

test('mobile startup requests muted inline playback before loadeddata can be deferred',async()=>{
  const f=fixture();try{
    f.auto.enable(0);f.auto.setActive(true);
    assert.equal(f.videos[0].readyState,0);
    assert.equal(f.videos[0].plays,1);
    assert.equal(f.videos[0].muted,true);assert.equal(f.videos[0].defaultMuted,true);
    assert.equal(f.videos[0].playsInline,true);assert.equal(f.videos[0].autoplay,true);
    await Promise.resolve();f.videos[0].decode();
    assert.equal(f.videos[0].plays,1);
  }finally{f.dispose();}
});
test('an interrupted startup cannot turn an offscreen pause into a user pause',async()=>{
  const f=fixture();try{
    let reject;
    f.videos[0].play=()=>new Promise((resolve,no)=>{reject=no;});
    f.auto.enable(0);f.auto.setActive(true);f.auto.setActive(false);
    reject(Object.assign(new Error('interrupted'),{name:'AbortError'}));await Promise.resolve();
    assert.equal(f.auto.userPaused,false);assert.equal(f.auto.playPending,false);
    assert.equal(f.videos[0].autoplay,false);
    f.videos[0].play=Video.prototype.play;f.auto.setActive(true);await Promise.resolve();
    assert.equal(f.videos[0].paused,false);
  }finally{f.dispose();}
});

test('all five clips complete with two mobile decoder slots and decode-on-play, then completion fires once',async()=>{
  const f=fixture();try{
    for(const video of f.videos) video.play=function(){
      if(this.readyState<2)queueMicrotask(()=>{
        if(f.videos.filter(item=>item.readyState>=2).length<2)this.decode();
      });
      return Video.prototype.play.call(this);
    };
    f.auto.enable(0);f.auto.setActive(true);await Promise.resolve();await Promise.resolve();
    for(let i=0;i<5;i++){
      assert.equal(f.auto.index,i);assert.equal(f.videos[i].paused,false);
      assert.ok(f.videos.filter(item=>item.readyState>=2).length<=2);
      if(i>0)assert.equal(f.videos[i-1].src,'');
      assert.equal(f.completions.length,0);
      f.videos[i].end();await Promise.resolve();await Promise.resolve();
      f.finishTransition();await Promise.resolve();
    }
    assert.equal(f.auto.phase,'complete');assert.equal(f.completions.length,1);
    f.auto.setActive(false);f.auto.setActive(true);assert.equal(f.completions.length,1);
  }finally{f.dispose();}
});
test('pausing while an incoming decoder is being primed suspends both videos',async()=>{
  const f=fixture();try{
    f.auto.enable(0);f.auto.setActive(true);f.videos[0].decode();await Promise.resolve();
    let reject;
    f.videos[1].play=function(){this.paused=false;return new Promise((resolve,no)=>{reject=no;});};
    f.videos[0].end();assert.equal(f.videos[1].paused,false);
    f.auto.pause();assert.equal(f.videos[1].paused,true);
    reject(Object.assign(new Error('interrupted'),{name:'AbortError'}));await Promise.resolve();
    assert.equal(f.auto.userPaused,true);assert.equal(f.queue.size,0);
  }finally{f.dispose();}
});

test('chapter handoffs release the outgoing source before preloading a third decoder',async()=>{
  const f=fixture();try{
    const allocations=[];
    for(const video of f.videos){
      const load=video.load;
      video.load=function(){
        load.call(this);
        if(this.src){
          const count=f.videos.filter(item=>item.src).length;
          allocations.push(count);
          // Model a mobile browser that never starts a third eager decoder.
          if(count<=2)queueMicrotask(()=>{if(this.src)this.decode();});
        }
      };
    }
    f.auto.enable(0);f.auto.setActive(true);await Promise.resolve();await Promise.resolve();
    for(let i=0;i<5;i++){
      assert.equal(f.auto.index,i);
      assert.equal(f.videos[i].paused,false);
      f.videos[i].end();f.finishTransition();await Promise.resolve();await Promise.resolve();
    }
    assert.ok(allocations.every(count=>count<=2),`decoder allocations: ${allocations}`);
    assert.equal(f.auto.phase,'complete');assert.equal(f.completions.length,1);
  }finally{f.dispose();}
});

test('a transient AbortError leaves autoplay armed for the next readiness event',async()=>{
  const f=fixture();try{
    f.videos[0].play=()=>Promise.reject(Object.assign(new Error('interrupted'),{name:'AbortError'}));
    f.auto.enable(0);f.auto.setActive(true);await Promise.resolve();
    assert.equal(f.auto.userPaused,false);assert.equal(f.auto.playPending,false);
    f.videos[0].play=Video.prototype.play;f.videos[0].decode();await Promise.resolve();
    assert.equal(f.videos[0].paused,false);
  }finally{f.dispose();}
});

test('a failed previously decoded incoming clip cannot crossfade into a dead player',async()=>{
  const f=fixture();try{
    await f.start();
    f.videos[1].dispatchEvent(new Event('error'));
    assert.equal(f.sequence.entries[1].ready,false);
    f.videos[0].end();f.finishTransition();
    assert.equal(f.auto.index,0);assert.equal(f.mediaStates.at(-1).failed,true);
    f.sequence.retry();f.videos[1].decode();f.finishTransition();await Promise.resolve();
    assert.equal(f.auto.index,1);assert.equal(f.videos[1].paused,false);
  }finally{f.dispose();}
});

function watchdogFixture() {
  const timers = new Map(); let id = 0;
  const f = fixture({setTimer: cb => {timers.set(++id, cb);return id;}, clearTimer: key => timers.delete(key)});
  return Object.assign(f, {timers, expire(){const next=timers.entries().next().value;assert.ok(next);timers.delete(next[0]);next[1]();}});
}

test('a playing decoder stall reloads once at the same position, then exposes Retry',async()=>{
  const f=watchdogFixture();try{
    await f.start();f.videos[0].advance(1);const position=f.sequence.progress;
    f.expire();assert.equal(f.sequence.progress,position);assert.equal(f.auto.userPaused,false);
    assert.equal(f.videos[0].readyState,0);
    f.videos[0].decode();await Promise.resolve();
    assert.equal(f.videos[0].currentTime,1);assert.equal(f.videos[0].paused,false);
    f.expire();assert.equal(f.sequence.entries[0].failed,true);assert.equal(f.auto.userPaused,true);
    assert.equal(f.mediaStates.at(-1).failed,true);assert.equal(f.timers.size,0);
  }finally{f.dispose();}
});

test('a stalled incoming chapter gets one reload then recovery UI without skipping it',async()=>{
  const f=watchdogFixture();try{
    f.auto.enable(0);f.auto.setActive(true);f.videos[0].decode();await Promise.resolve();
    f.videos[0].end();await Promise.resolve();
    f.expire();await Promise.resolve();assert.equal(f.auto.index,0);assert.equal(f.auto.phase,'transition');
    f.expire();assert.equal(f.sequence.entries[1].failed,true);assert.equal(f.auto.index,0);
    assert.equal(f.mediaStates.at(-1).failed,true);assert.equal(f.auto.userPaused,true);
    f.sequence.retry();f.auto.resume();f.videos[1].decode();f.finishTransition();await Promise.resolve();
    assert.equal(f.auto.index,1);assert.equal(f.videos[1].paused,false);
  }finally{f.dispose();}
});

test('progress refreshes the watchdog, while leaving the viewport cancels it',async()=>{
  const f=watchdogFixture();try{
    await f.start();const old=[...f.timers.keys()][0];f.videos[0].advance(.5);
    assert.equal(f.timers.has(old),false);assert.equal(f.timers.size,1);
    f.auto.setActive(false);assert.equal(f.timers.size,0);
    f.auto.setActive(true);await Promise.resolve();assert.equal(f.timers.size,1);
    f.auto.pause();assert.equal(f.timers.size,0);
  }finally{f.dispose();}
});

test('an optional incoming entry at final completion does not break status reporting',async()=>{
  const f=fixture();try{f.sequence.setProgress(1);f.sequence.waitingForNext=true;
    assert.doesNotThrow(()=>f.sequence.reportState());
  }finally{f.dispose();}
});
