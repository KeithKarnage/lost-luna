"use strict";var inLobby=[],inGame=[],matches=[];function findOpponent(user){console.log('find opponent',inLobby.length)
for(var i=0;i<inLobby.length;i++){if(user!==inLobby[i]&&inLobby[i].opponent===null){console.log('opponent found')
new Match(user,inLobby[i]).loadGame()}}}
function leaveLobby(user){if(inLobby.indexOf(user)>-1)
inLobby.splice(inLobby.indexOf(user),1)}
function leaveMatch(user){if(inGame.indexOf(user)>-1)
inGame.splice(inGame.indexOf(user),1)}
function Match(user1,user2){this.user1=user1;this.user2=user2;this.dO=deckOrder();this.game=new Game({server:!0,players:[user1,user2],dO:[this.dO,this.dO]});matches.push(this)}
Match.prototype={loadGame:function(){this.user1.loadGame(this,this.user2,[0,this.dO]);this.user2.loadGame(this,this.user1,[1,this.dO])},begin:function(){if(this.user1.ready&&this.user2.ready){let time=Date.now()+5000;this.user1.socket.emit('begin',time);this.user2.socket.emit('begin',time);this.game.start(time-100)}},matchOver:function(){this.user1.match=null;this.user2.match=null;this.game.MainLoop.stop();this.game=null;matches.splice(matches.indexOf(this))
console.log(matches.length)}}
function User(socket){this.socket=socket;this.match=null;this.opponent=null;this.ready=!1}
User.prototype={loadGame:function(match,opponent,pI){this.match=match;leaveLobby(this);inGame.push(this);this.opponent=opponent;this.socket.emit("loadGame",JSON.stringify(pI))},begin:function(){this.ready=!0;this.match.begin()},end:function(){if(this.match)
this.match.matchOver();this.opponent=null;this.socket.emit("gameOver");leaveMatch(this)}}
module.exports=function(socket){var user=new User(socket);socket.on("disconnect",function(){console.log("Disconnected: "+socket.id);if(user.match)leaveMatch();else leaveLobby(user);if(user.opponent)
user.opponent.end()});socket.on('battle',function(){inLobby.push(user);findOpponent(user)})
socket.on('ready',function(data){user.begin()})
socket.on('card',function(data){data=JSON.parse(data);let pId=data[5],pI=data[0],nC=Math.floor(Math.random()*4);data[0]=null;user.match.game.playCard(data[1],data,pI,nC);data.push(nC);socket.emit('confirmCard',JSON.stringify(data))})
socket.on('matchEnded',function(data){user.end()})
console.log("Connected: "+socket.id)};"use strict";(function(){let sz=512,colours=['#639bff','#306082','#3f3f74','#222034','#d77bba','#76428a','#45283c','#99e550','#6abe30','#d95763','#ac3232','#cbdbfc','#595652','#fbf236','#323c39','#8a6430','#8f974a','#ffffff','#df7126','#847e87','#696a6a',],hexToRGB=function(i){let j,r=[],c=colours[i];for(j=0;j<3;j++){r.push(parseInt(c.substr(1+2*j,2),16))}
return r},graphs=[[[1,2,2]],[[1,,2]],[[2]],[[1]],[[,1,,,2],[1,,,,2]],[[,1,2],[2,1,]],[[1,,,2,0],[1,,,,2]],[[1,2,0],[,2,1]],[[3,,3]],[[,3,3]],[[,,3]],[[3,,]],[[3,3,]],[[2],[1],[1]],[[2,1,,0],[,2,1,],[,,2,1]],[[2,1,1,1],[,2,2,]],[[,1],[1,2],[2,]],[[1],[1],[2]],[[1,0],[2,1]],[[1,1],[,2]],[[,1],[1,2]],[[3],[3],[1],[1],[1]],[[2,3,,,0],[2,1,3,,],[,2,1,3,],[,,2,1,],[,,,,1]],[[,3,3,3,,0],[2,1,1,1,1,1],[,2,2,2,,]],[[,,,,1],[,,3,1,],[,3,1,2,],[,1,2,,],[2,2,,,]],[[1],[1],[1],[3],[3],[2]],[[1,,,,0],[,1,3,,],[,2,1,3,],[,,2,1,],[,,,2,2]],[[,,3,3,3,0],[1,1,1,1,1,2],[,,2,2,2,]],[[,,,3,2],[,,3,1,],[,3,1,2,],[,1,2,,],[1,,,,]],[[1,,,,0],[2,1,,,],[4,3,1,,],[4,4,3,1,],[4,4,4,3,1]],[[5],[3],[1]],[[4,3,1],[3,3,1],[1,1,]],[[1,2],[1,]],[[0,1,0],[1,1,1],[0,1,0]],[[1,2]],[[0,3,3,0],[3,2,3,4],[3,3,5,4],[0,4,4,0]]],o1=[[16,-1,,,2,16]],o2=[[0,0,8,32,2,32]],cmdSets=[[[0,[[6,3,3],[6,7,4]],[[0,16,7,16],[16,-1,8,16,2,16]],[2,3]]],[[0,[[6,8,3]],[[0,16,7,16],[16,-1,8,16,2,16]],[2]]],[[1,[[6,11,2]],[[0,16,7,16]]],[2,[[24,10,2],[40,73,2]]],[3,[[38,10,2],[22,73,2]]],[4,[[21,26],[21,42],[37,57]]],[5,[[38,26],[38,42],[22,57]]],[6,[[21,90],[21,106],[37,121]]],[7,[[38,90],[38,106],[22,121]]]],[[8,[[6,4]],o1],[9,[[6,20]],o1],[10,[[6,36]],o1],[11,[[6,100]],o1],[12,[[6,116]],o1]],[[13,[[5,7]],o1],[14,[[7,23]],o1],[15,[[8,39]],o1],[16,[[9,53]],o1],[17,[[9,69]],o1],[18,[[5,85]],o1],[19,[[4,103]],o1],[20,[[4,119]],o1],],[[21,[[5,5]],o1],[22,[[7,21]],o1],[23,[[8,37]],o1],[24,[[8,50]],o1],[25,[[9,66]],o1],[26,[[2,82]],o1],[27,[[1,101]],o1],[28,[[2,118]],o1],],[[29,[[2,1,,,25]],o2],[30,[[2,3,26,,21]],o2],[31,[[23,6,23,,6]],o2],[32,[[1,2,27]],o2]],[[33,[[4,1,2]],[[0,3]],,[,0]],[33,[[5,1,2,,5]],[[0,3]],,[,1]],[33,[[6,2,4,,3]],,,[,2]],[3,[[5,4,,,6,]],,,[,9]],[3,[[6,4,,,4,]],,,[,10]],[0,[[6,8,15]]],[1,[[7,8,15]],,,[,1,1]],],[[33,[[1,1,3]],[[0,5]],,[,0]],[33,[[2,1,3,,11]],[[0,5]],,[,1]],[33,[[4,2,7,,8]],,,[,2]],[3,[[2,5,2,,12,]],,,[,9]],[3,[[3,5,2,,10,]],,,[,10]],[0,[[5,11,20]]],[34,[[7,11,20,,3,1]],,,[,2,1]],],[[33,[[5,5,4,,4]],,,[,3]],[33,[[5,21,4,,4]]],[33,[[5,37,4,,4]],,,[,13]],[1,[[7,39,2,,2]]],[33,[[5,52,5,,4],[8,51,3,,3],[6,55,3,,2]],,,[,10]],[33,[[5,53,2,,3],[8,52,2,,3],[6,56,1,,3]],,,[,18]],[16,[[8,53,,,3],[7,54,3,,2]],,,[0,13,18]],[33,[[4,69,5,,2],[5,68,1]],,,[,10]],[33,[[6,68,,,4],[5,69,5]],,,[,18]],[5,[[6,69]],,,[,13,13]],[17,[[6,71]],,,[,13,13]],[33,[[4,85,5],[5,84,,,5]],,,[,14]],[33,[[5,86,4],[6,85,,,4]],,,[,18,14]],[33,[[4,101,4],[5,100,,,4]],,,[,14]],[33,[[4,118],[7,116]],,,[,14]],],[[33,[[3,2,1,,4],[3,10,1,,4],[3,18,2,,4],[3,26,2,,5]],,,[,19]],[33,[[1,2,1],[1,10,1],[1,18,2],[1,26,2]],,,[,14]],[33,[[2,2,1,,4],[2,10,1,,4],[2,18,2,,4],[2,26,2,,5]],,,[,12]],]]
let px;function exctCmd(cs,cn,pl,X=0,Y=0){cs=cmdSets[cs];px=cn.ctx.getImageData(0,0,sz,sz);let g,i,j,p;cs.forEach(s=>{if(s[4])p=s[4];else p=pl;s[1].forEach(c=>{g=graphs[s[0]];executeCommand(g,cn,p,c,X,Y);if(s[2]){s[2].forEach(d=>{for(i=0;i<(d[2]||1);i++){for(j=0;j<(d[4]||1);j++){executeCommand(g,cn,p,c,d[0]+(d[5]||0)*j+X,d[1]+(d[3]||0)*i+Y)}}})}});if(s[3]){s[3].forEach((s3,i)=>exctCmd(s[3][i],cn,pl,X,Y))}})}
function executeCommand(g,cn,pl,c,X=0,Y=0){graph(g,cn,pl,c[0]+X,c[1]+Y,c[2],c[3],c[4],c[5])}
function graph(g,cnv,p,X,Y,V=1,vO=1,H=1,hO=1){let ctx=cnv.ctx,W=cnv.width,y,x,c,l,v,h;for(v=0;v<V;v++){for(h=0;h<H;h++){for(y=0;y<g.length;y++){for(x=0;x<g[y].length;x++){if(g[y][x]){c=hexToRGB(p[g[y][x]]);l=(X+x+h*hO)*4+(Y+y+v*vO)*W*4;px.data[l]=c[0];px.data[l+1]=c[1];px.data[l+2]=c[2];px.data[l+3]=255}}}}}
ctx.putImageData(px,0,0)}
function copy(cnv,sx,sy,sw,sh,x,y,w,h,e,V=0,vOff,H=0,hOff){let i,ctx=cnv.ctx,b=Cnv(w,h),c=b.ctx;c.imageSmoothingEnabled=!1;c.drawImage(cnv,sx,sy,sw,sh,0,0,sw,sh);if(e)ctx.clearRect(sx,sy,sw,sh);ctx.drawImage(b,0,0,sw,sh,x,y,w,h);for(i=0;i<V;i++)
ctx.drawImage(b,0,0,sw,sh,x,y+(i+1)*(vOff||h),w,h);for(i=0;i<H;i++)
ctx.drawImage(b,0,0,sw,sh,x+(i+1)*(hOff||w),y,w,h);}
let game=null,socket,btns;function disableButtons(){for(var i=0;i<btns.length;i++){btns[i].setAttribute("disabled",'disabled')}}
function bind(){socket.on('loadGame',function(pI){newGame(!1,JSON.parse(pI))});socket.on('begin',function(time){game.start(time)});socket.on('confirmCard',function(data){data=JSON.parse(data);game.confCard(data)});socket.on('state',function(st){game.recState(st)});socket.on('gameOver',function(){game.gameOver()})}
function battle(){disableButtons();socket.emit('battle')}
function oneP(){newGame(!0,[0,deckOrder()]);game.begin(Date.now()+3000)}
function makeSpriteSheet(C){exctCmd(0,C,[,0,2,7]);exctCmd(5,C,[,11,12,3]);exctCmd(0,C,[,0,1,7],48);exctCmd(4,C,[,11,12],48);exctCmd(0,C,[,0,1,7],48,128);exctCmd(0,C,[,1,3,9],96);exctCmd(4,C,[,11,12],96);exctCmd(1,C,[,0,2,7],0,128);exctCmd(3,C,[,0,2,9],0,133);exctCmd(7,C,[,0,2,1,3],144);exctCmd(8,C,[,0,1,2,3],160);executeCommand(graphs[35],C,[,19,13,20,14,12],[182,134])
copy(C,150,3,4,4,150,4,4,4);copy(C,163,3,10,4,163,4,10,4)}
let i,S=assets.images,w=innerWidth,h=innerHeight,ls=w>h,L=ls?w:h,scl=ls?w/680:h/480;S[0]=Cnv(sz,sz);S[1]=Cnv(sz,sz);L*=1.5;S[2]=Cnv(L,L);let ctx=S[2].ctx,stl=S[2].style;stl.position='fixed';stl.left='0px';stl.top='0px';stl.zIndex=-1;document.body.appendChild(S[2]);makeSpriteSheet(S[0]);colours[0]=colours[4];colours[1]=colours[5];colours[3]=colours[6];makeSpriteSheet(S[1]);exctCmd(9,S[0],[,17,13,18,10,14,3],176);exctCmd(10,S[0],[,17,13,18,10,14,3],176,144);exctCmd(6,S[0],[,11,13,14,15,16],192);copy(S[0],144,0,16,24,198,5,16,24);copy(S[0],16,96,16,16,230,9,16,16);copy(S[0],0,128,16,16,192,34,16,16,0,1,6,2,5);copy(S[0],196,47,5,5,198,47,5,5,0,0,0,2)
copy(S[0],48,16,16,16,224,39,16,16,0,0,0,2,5);copy(S[0],112,16,16,16,195,72,16,16,0,0,0,1,6);copy(S[0],48,128,16,16,230,71,16,16);copy(S[0],176,128,16,16,227,71,16,16);copy(S[0],198,42,16,12,197,100,16,12,0,1);copy(S[0],48,16,16,16,224,100,16,16,0,0,0,2,5);copy(S[0],48,16,16,16,223,106,16,16,0,0,0,2,5);S[0].ctx.fillStyle=colours[7];let x,y,j;vals.forEach((n,i)=>{x=(i%2*32)+192,y=Math.floor(i/2)*32
for(j=0;j<n;j++)
S[0].ctx.fillRect(x+24,y+5+j*3,5,2);})
copy(S[0],0,0,sz,sz,0,0,2*sz,2*sz,1)
copy(S[1],0,0,sz,sz,0,0,2*sz,2*sz,1)
ctx.fillStyle=colours[20];ctx.fillRect(0,0,S[2].width,S[2].height);ctx.save();ctx.scale(scl,scl);for(i=0;i<40;i++){ctx.drawImage(S[0],352,288+rInt(4)*16,32,16,Math.random()*L/scl,Math.random()*L/scl,32,16)}
ctx.restore();function newGame(oneP,pI){disableButtons();addEventListener('mousedown',controls,!1);addEventListener('mouseup',controls,!1);addEventListener('touchstart',controls,!1);addEventListener('touchend',controls,!1);game=new Game({server:!1,socket:socket,oneP:oneP,pI:pI[0]||0,dO:pI[1]});addEventListener('orientationchange',function(){game.rsz(game.canvas)},!1)}
function controls(e){switch(e.type){case 'mousedown':mouse(e);game.tDown=!0;break;case 'mouseup':game.tDown=!1
break;case 'touchstart':mouse(e.changedTouches[0]);game.tDown=!0;break;case 'touchend':game.tDown=!1;break}}
function mouse(e){game.touch(e.clientX,e.clientY)}
function init(){btns=document.getElementsByTagName("button");for(var i=0;i<btns.length;i++){(function(btn,callbacks){btn.addEventListener("click",callbacks[i],!1)})(btns[i],[battle,oneP])}
if(online){socket=io({upgrade:!1,transports:["websocket"]});bind()}}
window.addEventListener("load",init,!1)})();"use strict";let assets={images:[]};(function(root){let server,socket,audio,game=null,oneP,timeStamp,stTime,started,gameEnded=!1,endSound=!1,quitting=!1,playingCard=!1,playID=0,sSt,sStI=0,sSts=[],sStTmr=0,touch,sz=512,scale=1,prtrt,stage,field,hand,mPanel,meter,mana=0,manaMax=10,manaGain=1,sCard=null,dO,players=[new Player(),new Player()],p1,p2,expls,lsrs,unts,NOOP=()=>{},types=[[32,64,90,0,1000,1500,1,'',[[320,0]],[[16,4]],0],[32,48,80,0,600,800,50,'',[[288,0]],[[16,2]],800],[32,32,100,30,1200,200,200,'',[[0,0],[32,0],[0,0],[64,0]],[[10,12],[24,10],[28,4],[24,-4],[19,-6],[4,-6],[2,3],[8,8]],600],[32,32,10,50,0,50,100,'',[[0,256],[32,256],[0,256],[64,256]],[[0,0]],250],[32,32,80,40,800,100,50,'',[[96,0],[128,0],[96,0],[160,0]],[[10,10],[22,10],[26,6],[22,2],[20,0],[10,0],[8,6],[8,8]],400],[32,32,70,50,300,300,50,'',[[194,0],[226,0],[194,0],[258,0]],[[10,10],[22,10],[26,6],[22,2],[20,0],[10,0],[8,6],[8,8]],500],[32,32,80,25,800,250,500,'',[[96,256],[96,256],[128,256],[96,256],[96,256],[160,256]],[[14,20],[24,20],[24,16],[24,14],[22,10],[12,12],[10,16],[12,20]],400],],cards=[[[1,0,0]],[[2,0,0]],[[3,0,9],[3,15,9],[3,-15,9],[3,0,-9],[3,15,-9],[3,-15,-9]],[[4,0,-10],[4,-10,10],[4,10,10]],[[5,-6,0],[5,6,0]],[[6,0,0]],[[3,-8,9],[3,-24,9],[3,8,9],[3,16,9],[3,-8,0],[3,-24,0],[3,8,0],[3,16,0],[3,-8,-9],[3,-24,-9],[3,8,-9],[3,16,-9],],[[4,0,9],[4,15,9],[4,-15,9],[4,0,-9],[4,15,-9],[4,-15,-9]]];function Player(pInd){return{mana:0,deck:[],hand:[],played:{},confirmed:{},units:{},}}
function Card(id){let C=new Obj(0,0,64,64,'blue');C.cardID=id;C.sx=384+(id%2)*64;C.sy=0+Math.floor(id/2)*64;C.render=ctx=>{ctx.save();ctx.scale(2,2);ctx.drawImage(assets.images[0],C.sx,C.sy,C.w,C.h,C.x,C.y,C.w,C.h);ctx.restore()}
return C}
root.Game=function(opts){game=this;server=opts.server;socket=opts.socket;oneP=opts.oneP;var simulationTimestep=1000/60,frameDelta=0,lastFrameTimeMs=0,fps=60,lastFpsUpdate=0,framesThisSecond=0,numUpdateSteps=0,minFrameDelay=0,running=!1,started=!1,panic=!1,requestAnimationFrame=!server?window.requestAnimationFrame:(function(){var lastTimestamp=Date.now(),now,timeout;return function(callback){now=Date.now()
timeout=Math.max(0,simulationTimestep-(now-lastTimestamp));lastTimestamp=now+timeout;return setTimeout(function(){callback(now+timeout)},timeout)}})(),cancelAnimationFrame=!server?window.cancelAnimationFrame:clearTimeout,begin=NOOP,update=NOOP,draw=NOOP,end=NOOP,rafHandle;this.MainLoop={setBegin:function(fun){begin=fun||begin;return this},setUpdate:function(fun){update=fun||update;return this},setDraw:function(fun){draw=fun||draw;return this},setEnd:function(fun){end=fun||end;return this},start:function(){if(!started){started=!0;rafHandle=requestAnimationFrame(function(timestamp){draw(1);running=!0;lastFrameTimeMs=timestamp;lastFpsUpdate=timestamp;framesThisSecond=0;rafHandle=requestAnimationFrame(animate)})}
return this},stop:function(){running=!1;started=!1;cancelAnimationFrame(rafHandle);return this},isRunning:function(){return running},};function animate(timestamp){timeStamp=timestamp;rafHandle=requestAnimationFrame(animate);if(timestamp<lastFrameTimeMs+minFrameDelay){return}
frameDelta+=timestamp-lastFrameTimeMs;lastFrameTimeMs=timestamp;begin(timestamp,frameDelta);if(timestamp>lastFpsUpdate+1000){fps=0.25*framesThisSecond+0.75*fps;lastFpsUpdate=timestamp;framesThisSecond=0}
framesThisSecond++;numUpdateSteps=0;while(frameDelta>=simulationTimestep){update(simulationTimestep);frameDelta-=simulationTimestep;if(++numUpdateSteps>=240){panic=!0;break}}
draw(frameDelta/simulationTimestep);end(fps,panic);panic=!1}
this.init(opts)}
root.Game.prototype={init:function(opts){stage=new Obj(0,0,720,480,'black');field=new Obj(70,0,480,480,'grey');let f1=new Obj(0,0,240,240,'slategrey');let f2=new Obj(240,240,240,240,'slategrey');hand=new Obj(550,0,150,480,'lightgrey');mPanel=new Obj(0,0,70,480,'lightgrey');meter=new Obj(13,13,46,454,'red');stage.addChild(field);field.render=NOOP;hand.render=NOOP;stage.addChild(hand);stage.addChild(mPanel);stage.render=()=>{};for(let i=0;i<4;i++){let o=new Obj(0,0,112,112,'blue')
o.render=()=>{}
hand.addChild(o)}
mPanel.addChild(meter);stTime=null;started=!1;sStI=0;sSts=[];players=[new Player(),new Player()];p1=players[0];p2=players[1];if(server){p1.socket=opts.players[0].socket;p2.socket=opts.players[1].socket}
gameEnded=!1;endSound=!1;quitting=!1;players.forEach(p=>{p.played={};p.confirmed={}})
if(server||oneP){p1.pInd=0;p2.pInd=1;p1.eInd=1;p2.eInd=0;p2.towers=[Unit(p2,100,60,0),Unit(p2,380,60,0)];p1.towers=[Unit(p1,100,420,0),Unit(p1,380,420,0)]}
lsrs=ObjectPool(Laser,[0,0]);if(!server){window.mobile=!1;if(typeof window.orientation!=='undefined'){mobile=!0;window.top.scrollTo(0,1)}
touch=new Obj();this.tDown=!1;sCard=null;let pInd=opts.pI;p1.pInd=pInd?1:0;p2.pInd=pInd?0:1;p1.eInd=1;p2.eInd=0;expls=ObjectPool(Explosion,[0,0]);this.canvas=Cnv(2,2);this.rsz(this.canvas);document.body.appendChild(this.canvas);let ctx=this.canvas.ctx;ctx.imageSmoothingEnabled=!1;this.ctx=ctx;ID=0;p1.spSh=assets.images[0];p2.spSh=assets.images[1];this.MainLoop.setDraw(this.render)}
dO=opts.dO||deckOrder();p1.deck.push(Card(0),Card(1),Card(2),Card(3),Card(4),Card(5),Card(6),Card(7));p2.deck.push(Card(0),Card(1),Card(2),Card(3),Card(4),Card(5),Card(6),Card(7));players.forEach((p,j)=>{let i,c,o=server?dO[p.pInd]:dO;for(i=0;i<4;i++){c=p.deck[o[i]];if(!server&&!j)
hand.children[i].addChild(c);p.hand.push(c)}
p.hand.forEach(C=>{p.deck.splice(p.deck.indexOf(C),1)})})
this.MainLoop.setUpdate(this.update);this.MainLoop.setBegin(this.begin);this.MainLoop.start();if(!server&&!oneP)socket.emit('ready')},start:function(time){stTime=time},recState:function(st){sSts.push(st)},begin:function(tS,fD){if(oneP||(stTime&&!started&&now()>stTime))started=!0;if(!server){if(game.tDown){for(let i=0;i<4;i++){if(touchIn(hand.children[i]))
sCard=i}
if(sCard!==null&&touchIn(field)&&touch.y>(field.gY()+field.h)/2&&p1.mana>=vals[p1.hand[sCard].cardID]){game.playCard(sCard,null,0)}}
if(oneP&&Math.random()<0.01){let c=rInt(4),v=vals[p2.hand[c].cardID];if(p2.mana>=v){game.playCard(rInt(4),[,,rInt(100,190),rInt(100,140)],1)}}
if(sSts.length>sStI){sSt=JSON.parse(sSts[sStI]);if(now()<sSt[3]+100)return;players.forEach((p,i)=>{let units=sSt[p.pInd],unit,found,id;units.forEach(sU=>{found=!1;id=sU[0];if(p.units[id]){p.units[id].reconcile(sU);found=!0}
if(!found){addUnit([sU[1],sU[3]],p,sU);found=!1}})
for(let u in p.units){unit=p.units[u];found=!1;units.forEach(sU=>{if(sU[0]===unit.id)
found=!0})
if(!found)
removeUnit(unit)}});let i,l,p=p1.pInd;for(i=0;i<sSt[2].length;i++){l=sSt[2][i];Sfx.play("L1",0.5,!1);lsrs.newObject({x:p?480-l[0]:l[0],y:p?480-l[1]:l[1],w:p?480-l[2]:l[2],h:p?480-l[3]:l[3],typ:l[4],time:l[5]})}
sStI++}
if(!server&&!oneP){}}else{let n=now();if(n>sStTmr+50){sStTmr=n;sendState()}}
field.children.forEach(o=>{if(o.dead)
removeUnit(o)})
if(!gameEnded&&(oneP||server)){if(p1.towers.length===0||p2.towers.length===0){console.log('gameEnded')
gameEnded=!0;setTimeout(gameOver,1000)}}},update:function(tS){let o,objs,anm;for(o in animatedObjects){objs=animatedObjects[o];for(anm in objs)
objs[anm].update(now());}
field.children.forEach((o,i)=>{if(o){if(o.ai&&o.vis)o.ai();o.update(tS)}})
if(!started)return;players.forEach(p=>{p.mana=Math.min(manaMax,p.mana+(manaGain*tS/1000))})},render:function(){let i,c,ctx=game.ctx,w=prtrt?meter.w/10:meter.w,h=prtrt?meter.h:meter.h/10;ctx.clearRect(0,0,innerWidth,innerHeight);ctx.save();ctx.scale(scale,scale);if(sCard!==null){ctx.save();ctx.fillStyle='#fff';ctx.globalAlpha=0.3;ctx.fillRect(field.gX(),field.gY()+240,480,240);ctx.restore()}
displayObj(stage);ctx.strokeStyle='green';ctx.lineWidth=4;if(sCard!==null){c=hand.children[sCard];ctx.strokeRect(c.gX()+8,c.gY()+8,c.w,c.h)}
for(i=0;i<Math.floor(p1.mana);i++){ctx.fillStyle='green';if(prtrt)
ctx.fillRect(meter.gX()+w*i,meter.gY(),w,h)
else ctx.fillRect(meter.gX(),(meter.gY()+meter.h-h)-(h*i),w,h)}
if(!started){ctx.textAlign='right';ctx.fillStyle='black';ctx.font='40px sans-serif'
ctx.fillText(decToBin(Math.floor((stTime-now())/100)),320+field.gX(),240+field.gY())}
if(gameEnded){let message='';if(p1.towers.length>0){message='You Win!';if(!endSound)
Sfx.play('win',0.8,!1)}else{message='You Lose!'}
endSound=!0;ctx.textAlign='center';ctx.fillStyle='black';ctx.font='80px sans-serif'
ctx.fillText(message,240+field.gX(),240+field.gY())}
ctx.restore()},gameOver:function(){gameOver()},playCard:function(card,data,pI,nC){if(playingCard)return;playingCard=!0;let n=data?data[3]:now(),p=players[pI],l;p.played[playID]=[card,n];if(server||oneP){cardConfirmed(p,playID++,data,card,nC)
players[pI].mana-=vals[players[pI].hand[card].cardID]}
else{l=new Obj().cpy(touch).sub(field.gL());if(p1.pInd){l.x=480-l.x;l.y=480-l.y}
socket.emit('card','['+p1.pInd+','+card+','+l.x+','+l.y+','+n+','+playID++ +']')}},confCard:function(data){cardConfirmed(p1,data[5],null,data[1],data[6])},touch:function(x,y){touch.x=x;touch.y=y;touch.scl(1/scale)},rsz:cnv=>{let W=680,H=480,iW=innerWidth,iH=innerHeight,p=iH>iW,w=p?iW/H:iW/W,h=p?iH/W:iH/H,stl=cnv.style;scale=w<h?w:h;prtrt=p;cnv.width=iW;cnv.height=iH;cnv.ctx.imageSmoothingEnabled=!1;stl.position='fixed';stl.left='0px';stl.top='0px';stl.zIndex=2;assets.images[2].style.zIndex=1;if(p){stage.x=innerWidth/2-H*scale/2;stage.y=innerHeight/2-W*scale/2;hand.x=0;hand.y=550;hand.w=H;hand.h=150;mPanel.x=0;mPanel.y=0;mPanel.w=H;mPanel.h=70;meter.w=454;meter.h=46;field.x=0;field.y=70;for(let i=0;i<4;i++){let card=hand.children[i];card.y=4;card.x=i*118}}else{stage.x=innerWidth/2-W*scale/2;stage.y=innerHeight/2-H*scale/2;hand.x=550;hand.y=0;hand.w=150;hand.h=H;mPanel.x=0;mPanel.y=0;mPanel.w=70;mPanel.h=H;meter.w=46;meter.h=454;field.x=70;field.y=0;for(let i=0;i<4;i++){let card=hand.children[i];card.x=4;card.y=i*118}}}};function displayObj(obj){let ctx=game.ctx;ctx.save();ctx.translate(obj.x,obj.y);if(obj.alpha!==1)
ctx.globalAlpha=obj.alpha;if(!obj.vis)ctx.globalAlpha=obj.alpha*0.5;if(!obj.render){ctx.fillStyle=obj.fill;ctx.fillRect(0,0,obj.w,obj.h)}else{obj.render(ctx)}
if(obj.children&&obj.children.length>0){obj.children.forEach(child=>{displayObj(child)})}
ctx.restore()};function sendState(){sSt=[];players.forEach(p=>{let i,u,x,y,units=[],tgt;for(i in p.units){u=p.units[i];x=rnd(u.x);y=rnd(u.y);units.push([u.id,u.typ,x,y,u.pT,u.tgt?u.tgt.id:null,u.atT,u.hlt,u.dead])}
sSt[p.pInd]=units})
let i,l,ls=[];for(i=0;i<lsrs.active.length;i++){l=lsrs.active[i];ls.push([l.x,l.y,l.w,l.h,l.typ,l.time])}
sSt.push(ls);sSt.push(now());sSt=JSON.stringify(sSt);p1.socket.emit('state',sSt);p2.socket.emit('state',sSt)}
function cardConfirmed(p,pID,data,card,nC){let d,c=p.played[pID],nCard,pCard;p.confirmed[pID]=c;delete p.played[pID];pCard=p.hand[card];nCard=drawCard(p,card,nC);if(oneP||server){cards[pCard.cardID].forEach(u=>{addUnit(c,p,data,u)})}
if(!server)anmPlayCard(p,card,pCard,nCard);else nextCard(p,card,pCard,nCard);if(!p.pInd)
sCard=null}
function drawCard(p,space,nC){let r=nC===undefined?rInt(p.deck.length):nC;let c=p.deck.splice(r,1)[0];return c}
function nextCard(p,id,c,n){playingCard=!1;if(!server&&p1.pInd===p.pInd){hand.children[id].removeChild(c);hand.children[id].addChild(n);c.alpha=1;c.x=0;c.y=0}
p.hand.splice(id,1,n);p.deck.push(c)}
function gameOver(){if(quitting)return;quitting=!0;if(server){p1.socket.emit('gameOver');p2.socket.emit('gameOver')}else socket.emit('matchEnded','boo ya');if(game)
game.MainLoop.stop();if(!server){setTimeout(()=>{let node=document.getElementsByTagName('canvas')[0],btns=document.getElementsByTagName("button");document.body.removeChild(game.canvas);if(oneP)game=null;for(var i=0;i<btns.length;i++)
btns[i].disabled=!1;assets.images[2].style.zIndex=-1},1000)}}
let ID=0;function Obj(x,y,w,h,c){let O={id:ID++,x:x||0,y:y||0,w:w||0,h:h||0,vis:!0,alpha:1,fill:c||'red',add(o){this.x+=o.x;this.y+=o.y;return this},sub(o){this.x-=o.x;this.y-=o.y;return this},scl(o){this.x*=o;this.y*=o;return this},cpy(o){this.x=o.x;this.y=o.y;return this},clr(){this.x=0;this.y=0;return this},mag(){return Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2))},nrmlz(){let m=this.mag();if(m!=0){this.x=this.x/m;this.y=this.y/m}
return this},dist(o){return Math.sqrt(Math.pow(this.x-o.x,2)+Math.pow(this.y-o.y,2))},dir(){return Math.atan2(this.y,this.x)},parent:null,children:[],addChild(chld){if(chld.parent)
chld.parent.removeChild(chld);chld.parent=this;this.children.push(chld);this.children.sort((a,b)=>a.y+a.h*0.75-b.y+b.h*0.75)},removeChild(chld){if(chld.parent===this){this.children.splice(this.children.indexOf(chld),1);chld.parent=null}
else throw new Error(chld+"is not a child of "+this)},gX(){if(this.parent)
return this.x+this.parent.gX();else return this.x},gY(){if(this.parent)
return this.y+this.parent.gY();else return this.y},gL(){return new Obj(this.gX(),this.gY())},update(){}}
return O};function Unit(ply,x,y,t,id){let p=types[t],U=new Obj(x,y,p[0],p[1],p[7]);U.id=id||U.id;U.dead=!1;U.pT=null;U.dly=p[10];U.ply=ply;U.tm=ply.units;U.enm=players[ply.eInd].units;U.tgt=null;U.dir=Obj();U.aim=null;U.aPs=p[9];U.api=0;U.typ=t;U.rng=p[2];U.mvS=p[3];U.atS=p[4];U.atT=0;U.hlt=p[5];U.dmg=p[6];U.frms=p[8]||[];U.t=0;U.aI=0;if(t===6){let g=new Obj(0,0,32,32);g.sx=352;g.sy=256;g.render=c=>{c.drawImage(assets.images[0],g.sx,g.sy,g.w,g.h,g.x-20,g.y-29,g.w,g.h)}
U.addChild(g)}
U.tm[U.id]=U;field.addChild(U);U.ai=()=>{if(U.dead)return;if(U.tgt===null||U.tgt.dead||U.dist(U.tgt)>U.rng)
U.target();if(U.tgt!==null){if(U.dist(U.tgt)>U.rng||U.aim===null){U.dir.cpy(U.tgt).sub(U).nrmlz();U.aim=(Math.floor(U.dir.dir()/Math.PI*-4+4.5)+6)%8}
else U.dir.clr();if(U.dist(U.tgt)<U.rng){if(now()>U.atT+U.atS){let tg=U.tgt,ap=U.aPs[U.aim%U.aPs.length]||[0,0];if(U.typ===0){U.api=(U.api+1)%2;ap=U.aPs[U.api]||[[0,0]]}
if(U.typ===3){if(!server){expls.newObject([U.x,U.y+U.tgt.h*0.1]);Sfx.play("E1",0.5,!1)}
removeUnit(U);if(tg.takeDamage(U.dmg))
tg=null}else{if(U.typ===6){if(server){U.throwTime=now()}
else if(!U.throwing){U.throwing=!0;anmThrowGrenade(U,tg.x,tg.y);return}}else{if(oneP)Sfx.play("L1",0.5,!1);if(server||oneP){let laser=lsrs.newObject({x:U.x+ap[0]-U.w/2,y:U.y+ap[1]-U.h/2,w:tg.x,h:tg.y,typ:U.typ})}
if(tg.takeDamage(U.dmg))
tg=null}}
U.atT=now()}}}},U.target=()=>{U.tgt=null;for(let i in U.enm){let enm=U.enm[i],dst=U.dist(enm);if(enm.dead)continue;if(U.tgt===null||dst<U.dist(U.tgt))
U.tgt=enm}},U.takeDamage=amount=>{U.hlt-=amount;if(U.hlt<=0){U.hlt=0;U.dead=!0;return!0}},U.update=d=>{if(U.vis){if(U.tgt===null)
U.target();if(U.tgt){U.dir.scl(U.mvS*d/1000);U.add(U.dir)}}
else{if(now()>U.pT+U.dly)
U.vis=!0}},U.reconcile=d=>{U.x=p1.pInd?480-d[2]:d[2];U.y=p1.pInd?480-d[3]:d[3];U.pT=d[4];U.atT=d[6];U.hlt=d[7];U.dead=d[8]},U.render=c=>{if(now()>U.t+80){U.t=now();U.aI++;U.aI=U.aI%U.frms.length}
if(U.dir.mag()<0.1)
U.aI=0;let frm=U.frms[U.aI];if(U.typ<2)
U.aim=0;if(frm){c.drawImage(U.ply.spSh,frm[0],frm[1]+U.aim*32,U.w,U.h,-U.w/2,-U.h*0.75,U.w,U.h)}}
return U}
function addUnit(crd,p,data,U){let i,u,enm=p.pInd?p1.units:p2.units,x=data?data[2]:touch.x-field.gX(),y=data?data[3]:touch.y-field.gY(),id=data?data[0]:undefined,typ=!server&&!oneP?data[1]:U[0];if(U){x+=U[1];y+=U[2]}
if(p1.pInd){x=480-x;y=480-y}
u=Unit(p,x,y,typ,id);u.pT=crd[1];u.vis=!1}
function removeUnit(unit){delete unit.tm[unit.id];if(unit.typ===0){if(server||oneP)
unit.ply.towers.splice(unit.ply.towers.indexOf(unit),1);if(!server){for(let i=0;i<5;i++){setTimeout(function(){Sfx.play('E2',0.8,!1);console.log('E2')},Math.random()*50+100*i)}}}
field.removeChild(unit);for(let i in unit.enm){let en=unit.enm[i];if(en.tgt&&en.tgt.id===unit.id)
en.tgt=null}}
let lasers=['red','orange','blue','yellow','purple','pink']
function Laser(o){let O=new Obj();O.init=(o)=>{O.typ=o.typ;O.time=o.time||now();O.x=o.x;O.y=o.y;O.w=o.w;O.h=o.h;field.addChild(O)}
O.render=ctx=>{if(now()>O.time){ctx.strokeStyle=lasers[O.typ];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(O.w-O.x,O.h-O.y);ctx.stroke()}}
O.update=tS=>{if(now()>O.time+Math.random()*275+25){field.removeChild(O);O.release()}}
return O};function Explosion(){let i,frm,e=new Obj(0,0,32,32);e.frms=[];for(i=0;i<8;i++)
e.frms.push([352,i*32]);e.init=(o)=>{e.x=o[0];e.y=o[1];e.time=now();e.aI=0;field.addChild(e)};e.update=()=>{if(now()>e.time+80)
e.aI++;if(e.aI===8){e.release();field.removeChild(e)}}
e.render=c=>{frm=e.frms[e.aI];c.drawImage(assets.images[0],frm[0],frm[1],32,32,-16,-16,32,32)}
return e}
function now(){return Date.now()};function rnd(n){return Math.floor(n*100)/100};function rvrs(obj){obj.x=480-obj.x;obj.y=480-obj.y;return obj};function touchIn(obj){if(touch.x>obj.gX()&&touch.x<obj.gX()+obj.w&&touch.y>obj.gY()&&touch.y<obj.gY()+obj.h)
return!0};let animatedObjects={},ease={linear:x=>x,acceleration:x=>x*x,deceleration:x=>1-Math.pow(1-x,2),smoothStep:x=>x*x*Math.pow((3-2*x),1),};function animateProperty(o){let anm={};Object.assign(anm,o);anm.sVal=anm.sVal||anm.target[anm.property];anm.direction="forward";anm.timesToRepeat=o.timesToRepeat||1;anm.repeatCount=1;anm.start=(sVal,eVal)=>{anm.sVal=JSON.parse(JSON.stringify(sVal));anm.eVal=JSON.parse(JSON.stringify(eVal));anm.playing=!0;anm.duration=anm.duration||1000;anm.stTime=now();if(!animatedObjects[anm.target.id])
animatedObjects[anm.target.id]={};animatedObjects[anm.target.id][anm.property]=anm};anm.start(anm.sVal,anm.eVal);anm.update=()=>{let eTime=now()-anm.stTime,time,curvedTime;if(anm.playing){if(eTime<anm.duration){let nTime=eTime/anm.duration;curvedTime=ease[anm.curve](nTime);anm.target[anm.property]=(anm.eVal*curvedTime)+(anm.sVal*(1-curvedTime))}else anm.end()}};anm.end=()=>{if(anm.yoyo&&anm.direction==="forward"){anm.direction="reverse";anm.start(anm.eVal,anm.sVal);return}
if(anm.timesToRepeat>1&&anm.repeatCount<anm.timesToRepeat)
anm.repeat();else if(anm.repeat===1||anm.repeatCount>=anm.timesToRepeat)
anm.complete()};anm.repeat=()=>{anm.repeatCount++;if(anm.direction==="reverse"){anm.direction="forward";anm.start(anm.eVal,anm.sVal)}else anm.start(anm.sVal,anm.eVal)};anm.complete=()=>{anm.playing=!1;if(anm.onComplete)anm.onComplete(anm.target);delete animatedObjects[anm.target.id][anm.property]};anm.play=()=>anm.playing=!0;anm.pause=()=>anm.playing=!1;return anm}
function anmPlayCard(p,id,c,n){let card=p.hand[id];animateProperty({target:card,property:prtrt?'y':'x',eVal:-100,duration:350,curve:'acceleration',onComplete:()=>{nextCard(p,id,c,n)}});animateProperty({target:card,property:'alpha',eVal:0,duration:300,curve:'smoothStep'})}
function anmThrowGrenade(u,X,Y){let g=u.children[0],t=u.tgt;animateProperty({target:g,property:'x',eVal:(X-u.x)/(scale*2),duration:300,curve:'linear',onComplete:()=>{g.x=0;g.y=0;u.throwing=!1}});animateProperty({target:g,property:'y',eVal:(Y-u.y)/(scale*2),duration:300,curve:u.aim<=1?'acceleration':'deceleration',onComplete:()=>{expls.newObject([X,Y])
Sfx.play("E1",0.5,!1);if(t.takeDamage(u.dmg))
u.tgt=null}})}
function decToBin(dec){return dec>=0?(dec>>>0).toString(2):0}
function ObjectPool(object,def){let i,pool={};pool.active=[];pool.inactive=[];pool.newObject=function(opts){let o;if(pool.inactive.length<1){o=object();o.init(opts);o.release=()=>{o.vis=!1;pool.active.splice(pool.active.indexOf(o),1);pool.inactive.push(o)}}else{o=pool.inactive.pop();o.init(opts);o.vis=!0}
pool.active.push(o);return o};return pool}
if(typeof define==='function'&&define.amd){define(root.MainLoop)}
else if(typeof module==='object'&&module!==null&&typeof module.exports==='object'){module.exports=root.Game}})(this);function Cnv(w,h){let c=document.createElement('canvas');c.ctx=c.getContext('2d');c.width=w;c.height=h;c.ctx.imageSmoothingEnabled=!1;return c};function deckOrder(){let i,d=[0,1,2,3,4,5,6,7],o=[];for(i=0;i<8;i++)
o.push(d.splice([rInt(d.length)],1)[0]);return o}
let vals=[6,5,3,2,4,3,6,5];function rInt(i,o){return Math.floor(Math.random()*i+(o||0))}
var server=typeof window!=="object";if(!server){function SfxrParams(){this.setSettings=function(values)
{for(var i=0;i<24;i++)
{this[String.fromCharCode(97+i)]=values[i]||0}
if(this['c']<.01){this['c']=.01}
var totalTime=this['b']+this['c']+this['e'];if(totalTime<.18){var multiplier=.18/totalTime;this['b']*=multiplier;this['c']*=multiplier;this['e']*=multiplier}}}
function SfxrSynth(){this._params=new SfxrParams();var _envLn0,_envLn1,_envLn2,_prd,_mxPrd,_slide,_dSld,_chngAmt,_chngTm,_chngLmt,_sqDty,_dtySwp;this.reset=function(){var p=this._params;_prd=100/(p.f*p.f+.001);_mxPrd=100/(p.g*p.g+.001);_slide=1-p.h*p.h*p.h*.01;_dSld=-p.i*p.i*p.i*.000001;if(!p.a){_sqDty=.5-p.n/2;_dtySwp=-p.o*.00005}
_chngAmt=1+p.l*p.l*(p.l>0?-.9:10);_chngTm=0;_chngLmt=p.m==1?0:(1-p.m)*(1-p.m)*20000+32}
this.totalReset=function(){this.reset();var p=this._params;_envLn0=p.b*p.b*100000;_envLn1=p.c*p.c*100000;_envLn2=p.e*p.e*100000+12;return((_envLn0+_envLn1+_envLn2)/ 3 | 0) * 3;}
this.synthWave=function(buffer,length){var p=this._params;var _filters=p.s!=1||p.v,_hpFC=p.v*p.v*.1,_hpFDC=1+p.w*.0003,_lpFC=p.s*p.s*p.s*.1,_lpFDC=1+p.t*.0001,_lpOn=p.s!=1,_mVol=p.x*p.x,_mnFrq=p.g,_psr=p.q||p.r,_psrDeltaOffset=p.r*p.r*p.r*.2,_psrOffset=p.q*p.q*(p.q<0?-1020:1020),_repeatLimit=p.p?((1-p.p)*(1-p.p)*20000|0)+32:0,_sustainPunch=p.d,_vAmp=p.j/2,_vibratoSpeed=p.k*p.k*.01,_waveType=p.a;var _envLn=_envLn0,_envOvrLn0=1/_envLn0,_envOvrLn1=1/_envLn1,_envOvrLn2=1/_envLn2;var _lpDmp=5/(1+p.u*p.u*20)*(.01+_lpFC);if(_lpDmp>.8){_lpDmp=.8}
_lpDmp=1-_lpDmp;var _finished=!1,_envelopeStage=0,_envTm=0,_envVol=0,_hpFilterPos=0,_lpDPos=0,_lpOldPos,_lpPos=0,_prdTemp,_phase=0,_psrInt,_psrPos=0,_pos,_rTm=0,_sample,_sSmpl,_vPhs=0;var _psrBfr=new Array(1024),_nsBfr=new Array(32);for(var i=_psrBfr.length;i--;){_psrBfr[i]=0}
for(var i=_nsBfr.length;i--;){_nsBfr[i]=Math.random()*2-1}
for(var i=0;i<length;i++){if(_finished){return i}
if(_repeatLimit){if(++_rTm>=_repeatLimit){_rTm=0;this.reset()}}
if(_chngLmt){if(++_chngTm>=_chngLmt){_chngLmt=0;_prd*=_chngAmt}}
_slide+=_dSld;_prd*=_slide;if(_prd>_mxPrd){_prd=_mxPrd;if(_mnFrq>0){_finished=!0}}
_prdTemp=_prd;if(_vAmp>0){_vPhs+=_vibratoSpeed;_prdTemp*=1+Math.sin(_vPhs)*_vAmp}
_prdTemp|=0;if(_prdTemp<8){_prdTemp=8}
if(!_waveType){_sqDty+=_dtySwp;if(_sqDty<0){_sqDty=0}else if(_sqDty>.5){_sqDty=.5}}
if(++_envTm>_envLn){_envTm=0;switch(++_envelopeStage){case 1:_envLn=_envLn1;break;case 2:_envLn=_envLn2}}
switch(_envelopeStage){case 0:_envVol=_envTm*_envOvrLn0;break;case 1:_envVol=1+(1-_envTm*_envOvrLn1)*2*_sustainPunch;break;case 2:_envVol=1-_envTm*_envOvrLn2;break;case 3:_envVol=0;_finished=!0}
if(_psr){_psrOffset+=_psrDeltaOffset;_psrInt=_psrOffset|0;if(_psrInt<0){_psrInt=-_psrInt}else if(_psrInt>1023){_psrInt=1023}}
if(_filters&&_hpFDC){_hpFC*=_hpFDC;if(_hpFC<.00001){_hpFC=.00001}else if(_hpFC>.1){_hpFC=.1}}
_sSmpl=0;for(var j=8;j--;){_phase++;if(_phase>=_prdTemp){_phase%=_prdTemp;if(_waveType==3){for(var n=_nsBfr.length;n--;){_nsBfr[n]=Math.random()*2-1}}}
switch(_waveType){case 0:_sample=((_phase/_prdTemp)<_sqDty)?.5:-.5;break;case 1:_sample=1-_phase/_prdTemp*2;break;case 2:_pos=_phase/_prdTemp;_pos=(_pos>.5?_pos-1:_pos)*6.28318531;_sample=1.27323954*_pos+.405284735*_pos*_pos*(_pos<0?1:-1);_sample=.225*((_sample<0?-1:1)*_sample*_sample-_sample)+_sample;break;case 3:_sample=_nsBfr[Math.abs(_phase*32/_prdTemp|0)]}
if(_filters){_lpOldPos=_lpPos;_lpFC*=_lpFDC;if(_lpFC<0){_lpFC=0}else if(_lpFC>.1){_lpFC=.1}
if(_lpOn){_lpDPos+=(_sample-_lpPos)*_lpFC;_lpDPos*=_lpDmp}else{_lpPos=_sample;_lpDPos=0}
_lpPos+=_lpDPos;_hpFilterPos+=_lpPos-_lpOldPos;_hpFilterPos*=1-_hpFC;_sample=_hpFilterPos}
if(_psr){_psrBfr[_psrPos%1024]=_sample;_sample+=_psrBfr[(_psrPos-_psrInt+1024)%1024];_psrPos++}
_sSmpl+=_sample}
_sSmpl*=.125*_envVol*_mVol;buffer[i]=_sSmpl>=1?32767:_sSmpl<=-1?-32768:_sSmpl*32767|0}
return length}}
var synth=new SfxrSynth();window.jsfxr=function(settings){synth._params.setSettings(settings);var envelopeFullLength=synth.totalReset();var data=new Uint8Array(((envelopeFullLength+1)/2|0)*4+44);var used=synth.synthWave(new Uint16Array(data.buffer,44),envelopeFullLength)*2;var dv=new Uint32Array(data.buffer,0,44);dv[0]=0x46464952;dv[1]=used+36;dv[2]=0x45564157;dv[3]=0x20746D66;dv[4]=0x00000010;dv[5]=0x00010001;dv[6]=0x0000AC44;dv[7]=0x00015888;dv[8]=0x00100002;dv[9]=0x61746164;dv[10]=used;return data.buffer}
var Sfx=(function(){var
context,master,buffers={},muted=!0;function createSource(name,config){var data=jsfxr(config);context.decodeAudioData(data,function(buffer){buffers[name]=buffer})}
return{init:function(){context=new AudioContext();master=context.createGain();master.connect(context.destination);createSource('L1',[0,,0.3,,0.15,0.66,0.2,-0.28,,,,,,0.46,-0.065,,,,1,,,,,0.5]);createSource('E1',[3,,0.4,0.47,0.1,0.3,,-0.27,,0.01,,-0.7,0.69,0.004,0.002,,-0.098,-0.08,1,,,,-0.016,0.5]);createSource('E2',[3,0.03,0.25,0.55,0.22,0.06,,-0.05,0.035,,,-0.05,0.006,0.04,0.04,0.1,-0.13,-0.29,1,-0.012,0.0025,0.008,0.003,0.5]);createSource('win',[0,0.05,0.35,0.03,0.25,0.30,,0.19,-0.04,0.25,0.4,0.03,0.034,0.026,,0.05,,0.043,0.97,0.03,0.06,0.01,0.005,0.5]);Sfx.mute()},play:function(name,volume,loop){var source=null,gain;if(name in buffers){gain=context.createGain();gain.gain.value=volume||1;gain.connect(master);source=context.createBufferSource();source.loop=loop||!1;source.buffer=buffers[name];source.connect(gain);source.start(0)}
return source},mute:function(){muted=!muted;console.log("muted = ",muted)
master.gain.value=muted?0:2}}})();window.onload=function(){window.AudioContext=window.AudioContext||window.webkitAudioContext;if(window.AudioContext){Sfx.init()}
setTimeout(function(){Sfx.play("win",0.5,!1)},100);console.log(Sfx)}}