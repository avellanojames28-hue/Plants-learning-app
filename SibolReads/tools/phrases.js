// every sentence (and the pieces around letter sounds) Sibol Reads can say
const d=require('./reads_data.js');const seen=new Set(),out=[];
const addK=(k,t)=>{if(k&&!seen.has(k)){seen.add(k);out.push({key:k,text:t.trim()})}};
const re=d.soundSplitRe();
d.allPhrases().forEach(p=>d.splitSent(p).forEach(s=>{addK(d.akey(s),s);
  const parts=s.split(re);if(parts.length>1)parts.forEach((x,i)=>{if(i%2===0){const t=String(x).replace(/^[\s,.:;!?]+/,'');addK(d.fragKey(x),t)}})}));
process.stdout.write(JSON.stringify({sentences:out,sounds:d.SOUND_IPA}));
