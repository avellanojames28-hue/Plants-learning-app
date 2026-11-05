/* Sibol Reads data + every sentence the app speaks (shared with the audio generator; no dependencies) */
var LET={
 s:['sss','sun','☀️','snake','🐍'],a:['ah','apple','🍎','ant','🐜'],t:['tuh','tiger','🐯','tent','⛺'],p:['puh','pig','🐖','pizza','🍕'],i:['ih','iguana','🦎','insect','🐛'],n:['nnn','nest','🪺','nose','👃'],
 m:['mmm','moon','🌙','monkey','🐒'],d:['duh','dog','🐕','duck','🦆'],g:['guh','goat','🐐','gift','🎁'],o:['aw','octopus','🐙','otter','🦦'],c:['kuh','cat','🐈','cake','🎂'],k:['kuh','kite','🪁','key','🔑'],
 e:['eh','egg','🥚','elephant','🐘'],u:['uh','umbrella','☂️','up','⬆️'],r:['rrr','rabbit','🐇','rainbow','🌈'],h:['huh','hat','🎩','horse','🐎'],b:['buh','ball','⚽','bus','🚌'],f:['fff','fish','🐟','frog','🐸'],l:['lll','lion','🦁','leaf','🍃'],
 j:['juh','juice','🧃','jellyfish','🪼'],v:['vvv','van','🚐','violin','🎻'],w:['wuh','whale','🐋','watermelon','🍉'],x:['ks','box','📦','fox','🦊'],y:['yuh','yo-yo','🪀','yarn','🧶'],z:['zzz','zebra','🦓','zero','0️⃣'],q:['kwuh','queen','👸','queen','👸'],
};
/* the true sound of each letter, in IPA, for the natural voice generator */
var SOUND_IPA={sss:'sːː',ah:'æː',tuh:'tə',puh:'pə',ih:'ɪː',nnn:'nːː',mmm:'mːː',duh:'də',guh:'ɡə',aw:'ɑː',kuh:'kə',eh:'ɛː',uh:'ʌː',rrr:'ɹːː',huh:'hə',buh:'bə',fff:'fːː',lll:'lːː',juh:'dʒə',vvv:'vːː',wuh:'wə',ks:'ks',yuh:'jə',zzz:'zːː',kwuh:'kwə'};
var WORDPIC={pan:'🍳',pin:'📌',tap:'🚰',ant:'🐜',tin:'🥫',nap:'😴',cat:'🐈',dog:'🐕',map:'🗺️',pig:'🐖',pot:'🍲',cap:'🧢',sad:'😢',
  bed:'🛏️',sun:'☀️',hen:'🐔',bus:'🚌',cup:'☕',net:'🥅',hat:'🎩',bat:'🦇',fan:'🪭',log:'🪵',bug:'🐛',leg:'🦵',red:'🟥',
  box:'📦',fox:'🦊',van:'🚐',web:'🕸️',jet:'🛩️',yam:'🍠',zip:'🤐',six:'6️⃣',wig:'💇'};
var GROUPS=[
  {name:'Sunny Island',color:'#2F9E55',soft:'#DDF2E3',letters:'satpin',blend:['pan','pin','tap','ant','tin','nap'],spell:['pan','tap','pin','tin','ant'],write:['pin','tap','pan']},
  {name:'Berry Bay',color:'#D9485F',soft:'#FBE0E4',letters:'mdgock',sight:['I','see','a','the'],blend:['cat','dog','map','pig','pot','cap'],spell:['cat','dog','pig','map','pot'],
    read:[['I see a cat.','🐈','🐕'],['I see a pig.','🐖','🐐'],['I see the map.','🗺️','🍳'],['I see a dog.','🐕','🐈']]},
  {name:'Rainbow Hills',color:'#2D78B8',soft:'#DCEBF8',letters:'eurhbfl',sight:['is','can','my','on'],blend:['bed','sun','hen','bus','cup','hat','bug'],spell:['sun','bed','hen','bus','hat'],
    read:[['The hen is red.','🐔','🐖'],['I can see the bus.','🚌','🛏️'],['My hat is on the bed.','🎩🛏️','🧢🌳'],['The bug is on a log.','🐛🪵','🐜☕']]},
  {name:'Star Mountain',color:'#8A4FBF',soft:'#F0E6FA',letters:'jvwxyzq',blend:['box','fox','van','web','jet','six'],spell:['box','fox','van','jet','web'],write:['fox','van','web'],
    read:[['The fox is in a box.','🦊📦','🐕🛏️'],['I can see a jet.','🛩️','🚌'],['The van is red.','🚐','🚌']]},
];
var SIGHT_POOL=['I','a','the','see','is','can','my','on','to','it','in','at'];
var PRAISES=['Great job!','Yes!','You got it!','Super!','Wow!','Well done!'];
var STICKER_MAX=48;
var snd=function(l){return LET[l][0]};
var spellOut=function(w){return w.toUpperCase().split('').join(', ')};
var SAY={
  hi:"Hi! I'm Sibol. Let's learn to read together! Tap the glowing circle.",
  back:'Welcome back! Tap the glowing circle to play.',
  locked:'Finish the glowing level first!',
  meet:function(l){return 'This is the letter '+l+'. It says '+snd(l)+', like '+LET[l][1]+'! Tap the big letter three times.'},
  sound:function(l){return snd(l)+'!'},
  meetDone:function(l){return snd(l)+', '+LET[l][1]+'! Great listening!'},
  meetPic:function(l){return LET[l][1]+'. '+snd(l)+', '+LET[l][1]+'.'},
  trace1:function(l){return "Let's write "+l+'! Watch the yellow dot, then trace with your pen from the green dot.'},
  trace2:function(l){return 'Now write '+l+' again, all by yourself!'},
  traceDone:function(l,p){return p+" That's "+l+'! '+snd(l)+'!'},
  green:'Start at the green dot!',almost:'Almost! Follow the dotted line all the way.',watchDot:'Watch the yellow dot, then follow the dotted line from the green dot.',
  huntQ:function(l){return l==='x'?'Which one ends with '+snd(l)+'? Like box!':'Which one starts with '+snd(l)+'? '+snd(l)+'.'},
  huntRight:function(l,w,p){return p+' '+w+'! '+snd(l)+', '+w+'.'},
  huntWrong:function(l,w,many){return "That's "+w+'. Listen: '+snd(l)+'. '+(many?'Look for the glowing one!':'Try again!')},
  popIntro:function(l){return 'Pop the balloons with '+l+'! '+snd(l)+'!'},
  popDone:function(l,p){return p+' You popped five '+l+' balloons!'},
  popWrong:function(ch,l){return "That's "+ch+'. Find '+l+'!'},
  blendIntro:function(n){return 'Word '+n+'. Tap each letter to hear its sound.'},
  blendSlide:'Now slide the green button to blend the sounds!',
  blendSay:function(w){return w.split('').map(snd).join('... ')+'... '+w+'!'},
  blendWhich:function(w){return w+'. Which picture is '+w+'?'},
  right:function(w,p){return p+' '+w+'!'},
  listenAgain:function(w){return 'Listen again: '+w+'.'},
  spellAsk:function(w,first){return w+'. '+w.split('').map(snd).join(', ')+'. What sound comes '+(first?'first':'next')+'?'},
  spellDone:function(w,p){return p+' '+spellOut(w)+', '+w+'!'},
  spellWrong:function(have,want){return 'That says '+snd(have)+'. We need '+snd(want)+'.'},
  writeIntro:function(w){return "Let's write "+w+'. '+spellOut(w)+'. Trace each letter.'},
  writeDone:function(w,p){return p+' You wrote '+w+'!'},
  sightIntro:function(w){return 'This word is '+w+'. Find all three '+w+' words!'},
  sightDone:function(w,p){return p+' That word is '+w+'!'},
  sightWrong:function(x,w){return 'That word is '+x+'. Find '+w+'!'},
  readTap:'Tap each word and read it with me.',readWhich:'Which picture matches the sentence?',
  readRight:function(s,p){return p+' '+s},readAgain:function(s){return 'Read it again: '+s},
  won:'You did it! You earned a new sticker! Tap the card to see it.',practiced:'Great practice! You are getting better and better.',
  book:function(n){return n===1?'You have 1 sticker! Keep reading to get more!':'You have '+n+' stickers! Keep reading to get more!'},
  bookNone:'Finish a level to get your first sticker!',
  slow:'This is how I will talk.',
};
/* every sentence the app can say, for pre-recording */
function allPhrases(){
  var out=[],add=function(s){out.push(s)};
  ['hi','back','locked','green','almost','watchDot','blendSlide','readTap','readWhich','won','practiced','bookNone','slow'].forEach(function(k){add(SAY[k])});
  PRAISES.forEach(add);add('Try again!');add('Look for the glowing one!');for(var bn=1;bn<=8;bn++)add(SAY.blendIntro(bn));
  var L=Object.keys(LET);
  L.forEach(function(l){
    add(SAY.meet(l));add(SAY.sound(l));add(SAY.meetDone(l));add(SAY.meetPic(l));add(SAY.trace1(l));add(SAY.trace2(l));add(SAY.huntQ(l));add(SAY.popIntro(l));
    add("That's "+l+'!');add('Find '+l+'!');add('You popped five '+l+' balloons!');add(snd(l));
    [LET[l][1],LET[l][3]].forEach(function(w){add(w+'!');add(snd(l)+', '+w+'.');add("That's "+w+'.');});
    add('Listen: '+snd(l)+'.');
  });
  L.forEach(function(k){add(LET[k][1]);add("That's "+LET[k][1]+'.');add("That's "+LET[k][3]+'.')});
  for(var n=1;n<=8;n++)add('Word '+n+'.');
  var words={};GROUPS.forEach(function(g){(g.blend||[]).concat(g.spell||[],g.write||[]).forEach(function(w){words[w]=1})});
  Object.keys(words).forEach(function(w){add(w);add(SAY.blendSay(w));add(SAY.blendWhich(w));add(w+'!');add(SAY.listenAgain(w));
    add(SAY.spellAsk(w,true));add(SAY.spellAsk(w,false));add(spellOut(w)+', '+w+'!');add(SAY.writeIntro(w));add('You wrote '+w+'!')});
  L.forEach(function(a){L.forEach(function(b){if(snd(a)!==snd(b))add(SAY.spellWrong(a,b))})});
  SIGHT_POOL.forEach(function(w){add(w);add(SAY.sightIntro(w));add('That word is '+w+'!');add('That word is '+w+'.');add('Find '+w+'!')});
  GROUPS.forEach(function(g){(g.read||[]).forEach(function(r){var s=r[0];add(s);add(SAY.readAgain(s));s.split(' ').forEach(function(x){add(x.replace(/[.]/,''))})})});
  for(var i=1;i<=STICKER_MAX;i++)add(SAY.book(i));
  return out;
}
var splitSent=function(t){return String(t).trim().split(/(?<=[.!?:])\s+/).filter(Boolean)};
var akey=function(s){return s.trim().toLowerCase().replace(/\s+/g,' ')};

/* ---- themed words, writing and coloring (shared with the voice generator) ---- */
var WORDSETS=[
 {id:'feel',name:'Feelings',icon:'😀',items:[['happy','😀'],['sad','😢'],['angry','😠'],['scared','😨'],['sleepy','😴'],['silly','🤪'],['surprised','😮'],['excited','🤩']]},
 {id:'toys',name:'Toys',icon:'🧸',items:[['ball','⚽'],['doll','🪆'],['kite','🪁'],['teddy bear','🧸'],['blocks','🧱'],['robot','🤖'],['car','🚗'],['drum','🥁'],['puzzle','🧩'],['yo-yo','🪀']]},
 {id:'nature',name:'Nature',icon:'🌳',items:[['tree','🌳'],['flower','🌸'],['sun','☀️'],['moon','🌙'],['star','⭐'],['rain','🌧️'],['cloud','☁️'],['river','🏞️'],['mountain','⛰️'],['sea','🌊'],['leaf','🍃'],['rock','🪨']]},
 {id:'home',name:'At home',icon:'🏠',items:[['bed','🛏️'],['chair','🪑'],['cup','☕'],['spoon','🥄'],['door','🚪'],['lamp','💡'],['book','📖'],['clock','⏰'],['bag','🎒'],['toothbrush','🪥']]},
 {id:'animals',name:'Animals',icon:'🐶',items:[['dog','🐕'],['cat','🐈'],['fish','🐟'],['bird','🐦'],['cow','🐄'],['duck','🦆'],['frog','🐸'],['bee','🐝'],['horse','🐴'],['lion','🦁']]},
 {id:'food',name:'Food',icon:'🍎',items:[['apple','🍎'],['banana','🍌'],['bread','🍞'],['egg','🥚'],['milk','🥛'],['rice','🍚'],['cake','🍰'],['grapes','🍇'],['carrot','🥕'],['corn','🌽']]},
 {id:'colors',name:'Colors',icon:'🎨',items:[['red','#E8484F'],['blue','#2D78B8'],['yellow','#FFC933'],['green','#2F9E55'],['orange','#F29A1F'],['purple','#8A4FBF'],['pink','#F49AC1'],['brown','#8B5E3C'],['black','#222222'],['white','#FFFFFF']]},
 {id:'shapes',name:'Shapes',icon:'🔺',items:[['circle','circle'],['square','square'],['triangle','triangle'],['rectangle','rectangle'],['star','star'],['heart','heart'],['diamond','diamond'],['oval','oval']]},
 {id:'numbers',name:'Numbers',icon:'🔢',items:[['one','1'],['two','2'],['three','3'],['four','4'],['five','5'],['six','6'],['seven','7'],['eight','8'],['nine','9'],['ten','10']]},
];
var NUMWORD=['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
var WRITE_WORDS=['cat','dog','sun','ball','doll','kite','car','bed','cup','toy','happy','sad','red','blue','tree','fish','mom','dad'];
var SHAPE_NAMES=['circle','square','triangle','rectangle','star','heart','diamond','oval'];
var SAY2={
  tabRead:"Let's read! Tap the glowing circle.",tabWords:'Pick a group of words to learn!',tabWrite:'Pick something to write!',tabColor:'Pick a picture to color!',
  cards:'Tap a card to hear the word.',quizIntro:'Read the word. Which picture is it?',
  thatIs:function(w){return 'That is '+w+'. Try again!'},
  countQ:'How many? Count them!',countAgain:'Count again!',
  allWords:'You read all the words!',
  bigLetter:function(L){return "Let's write big "+L+'!'},
  numWrite:function(n){return "Let's write "+NUMWORD[n]+'!'},
  shapeWrite:function(s){return "Let's draw a "+s+'!'},
  youDid:'You did it!',paper:'Write anything you like!',
  colorIntro:'Choose a color and a pen. Then color the picture!',pretty:'Beautiful!',
  nameWrite:'Write your name!',
};
var SOUND_TOKENS=Object.keys(SOUND_IPA).sort(function(a,b){return b.length-a.length});
var soundSplitRe=function(){return new RegExp("(?<![A-Za-z'])("+SOUND_TOKENS.join('|')+")(?![A-Za-z'])",'i')};
var fragKey=function(f){return akey(String(f).replace(/^[\s,.:;!?]+/,''))};
function allPhrases2(){
  var out=[],add=function(s){out.push(s)};
  ['tabRead','tabWords','tabWrite','tabColor','cards','quizIntro','countQ','countAgain','allWords','youDid','paper','colorIntro','pretty','nameWrite'].forEach(function(k){add(SAY2[k])});
  WORDSETS.forEach(function(g){add(g.name);g.items.forEach(function(it){add(it[0]);add(it[0]+'!');add(SAY2.thatIs(it[0]))})});
  NUMWORD.forEach(function(n){add(n);add(n+'!')});
  'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('').forEach(function(L){add(SAY2.bigLetter(L))});
  for(var i=0;i<=10;i++)add(SAY2.numWrite(i));
  SHAPE_NAMES.forEach(function(s){add(SAY2.shapeWrite(s))});
  WRITE_WORDS.forEach(function(w){add(SAY.writeIntro(w));add(w);add('You wrote '+w+'!')});
  return out;
}
if(typeof module!=='undefined')module.exports={allPhrases:function(){return allPhrases().concat(allPhrases2())},splitSent:splitSent,akey:akey,SOUND_IPA:SOUND_IPA,soundSplitRe:soundSplitRe,fragKey:fragKey};
