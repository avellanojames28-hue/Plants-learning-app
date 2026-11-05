// prints every sentence Sibol Reads can say, one per line in JSON
const d=require('./reads_data.js');const seen=new Set(),out=[];
d.allPhrases().forEach(p=>d.splitSent(p).forEach(s=>{const k=d.akey(s);if(!seen.has(k)){seen.add(k);out.push({key:k,text:s.trim()})}}));
process.stdout.write(JSON.stringify({sentences:out,sounds:d.SOUND_IPA}));
