import test from 'node:test';
import assert from 'node:assert/strict';
import { ProgressSmoother, VideoScrubber } from '../../src/components/home/journey/controller.mjs';
function simulation(hz) {
  const queue = [];
  const values = [];
  let time = 0;
  const motion = new ProgressSmoother(v => values.push(v), { requestFrame: cb => queue.push(cb) });
  const tick = () => { time += 1000 / hz; queue.shift()?.(time); };
  return { motion, values, queue, tick, untilIdle() { let n=0; while(queue.length && n++<200) tick(); assert.equal(queue.length,0); } };
}
test('smoothing converges exactly and stops rather than consuming idle animation frames', () => {
  for (const hz of [60,90,120]) {
    const s = simulation(hz); s.motion.setTarget(1); s.untilIdle();
    assert.equal(s.values.at(-1), 1);
    assert.ok(s.values[0] > 0 && s.values[0] < 0.5);
    assert.ok(s.values.every((v,i,a) => v >= (a[i-1] || 0) && v<=1));
    s.motion.setTarget(1); assert.equal(s.queue.length,0);
  }
});
test('rapid direction reversal follows latest scroll input without overshoot', () => {
  const s = simulation(60); s.motion.setTarget(1); s.tick(); s.tick();
  const turning = s.values.at(-1);
  s.motion.setTarget(0); s.tick(); assert.ok(s.values.at(-1) < turning);
  s.untilIdle(); assert.equal(s.values.at(-1),0);
});
test('switching rooms or taking manual control cancels old queued movement', () => {
  const s = simulation(60); s.motion.setTarget(1); s.tick();
  s.motion.reset(0); const count = s.values.length; s.untilIdle();
  assert.equal(s.values.length,count);
  s.motion.setTarget(0.4); s.untilIdle(); assert.equal(s.values.at(-1),0.4);
});
test('direct scroll tracking applies the exact target and cancels pending easing', () => {
  const s = simulation(60);
  s.motion.setTarget(1);
  s.tick();
  s.motion.setTarget(0.5, true);
  assert.equal(s.values.at(-1), 0.5);
  const count = s.values.length;
  s.untilIdle();
  assert.equal(s.values.length, count, 'Old easing must not move the film after a direct update');
  s.motion.setTarget(0, true);
  assert.equal(s.values.at(-1), 0);
  assert.equal(s.queue.length, 0);
  s.motion.setTarget(1);
  s.untilIdle();
  assert.equal(s.values.at(-1), 1, 'Easing can resume after a preference change');
});
test('motion response is consistent across refresh rates', () => {
  const positions = [60,120].map(hz => { const s = simulation(hz); s.motion.setTarget(1); for(let i=0;i<hz/10;i++)s.tick(); return s.values.at(-1); });
  assert.ok(Math.abs(positions[0]-positions[1])<0.035);
});
test('a stalled seek after a successful load exposes recovery without a permanent freeze', () => {
  class Video extends EventTarget { pause(){} load(){this.currentSrc=this.src} }
  const video = new Video(); Object.assign(video,{readyState:2,duration:10.041667,seeking:false,currentTime:0});
  const timers = new Map(); let id=0, errors=0;
  const scrubber = new VideoScrubber(video,{onError:()=>errors++,setTimer:fn=>{timers.set(++id,fn);return id},clearTimer:key=>timers.delete(key)});
  scrubber.load('assets/office.mp4');video.dispatchEvent(new Event('loadeddata'));assert.equal(scrubber.ready,true);
  scrubber.setProgress(0.5);video.seeking=true;timers.get(id)();
  assert.equal(errors,1);assert.equal(scrubber.failed,true);
});
test('decoded frames become visible while the latest requested position is still catching up', () => {
  class Video extends EventTarget { pause(){} load(){this.currentSrc=this.src} }
  const video = new Video();Object.assign(video,{readyState:2,duration:10.041667,seeking:false,currentTime:0});
  let ready=0;const scrubber=new VideoScrubber(video,{onReady:()=>ready++});
  scrubber.load('assets/office.mp4');scrubber.setProgress(.5);video.currentTime=3;
  video.dispatchEvent(new Event('seeked'));
  assert.equal(ready,1);assert.equal(video.currentTime,5);
});
