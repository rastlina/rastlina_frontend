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
function fixture(){
  const videos=Array.from({length:5},()=>new Video());
  const layers=videos.map(video=>({video,element:{classList:{add(){},remove(){}},style:{setProperty(){}},setAttribute(){}}}));
  const sequence=new StorySequence(layers,{Scrubber:VideoScrubber,assetBase:'https://example.test/assets',mobile:false});
  const queue=new Map(),states=[];let id=0,time=0;
  const auto=new StoryAutoplay(sequence,{requestFrame:cb=>{queue.set(++id,cb);return id;},cancelFrame:key=>queue.delete(key),onState:x=>states.push(x),transitionMs:100});
  return {videos,sequence,auto,states,queue,
    async start(){auto.enable(0);auto.setActive(true);videos[0].decode();videos[1].decode();await Promise.resolve();},
    tick(){const entry=queue.entries().next().value;if(entry){queue.delete(entry[0]);time+=20;entry[1](time);}},
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
test('autoplay runs every chapter in sequence and ends with a replay control',async()=>{
  const f=fixture();try{await f.start();for(let i=0;i<5;i++){
    if(f.videos[i].readyState<2)f.videos[i].decode();await Promise.resolve();assert.equal(f.videos[i].paused,false);
    f.videos[i].end();f.finishTransition();await Promise.resolve();
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
