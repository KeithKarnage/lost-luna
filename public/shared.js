"use strict";
let assets = {
			images: []
		};

(function(root) {

	


	let server,
		socket,
		audio,
		playSound,
		game = null,
		oneP,
		timeStamp,
		startTime,
		started,
		gameEnded = false,
		quitting = false,
		playingCard = false,
		playID = 0,


		sSt,
		sStI = 0,
		sSts = [],
		sStTmr = 0,

		touch,
	    // tDown = false,  //  CURRENTLY TOUCHED

		// canvas,
		
		sz = 512,
		// assets,

		scale = 1,
		prtrt,  //  PORTRAIT OR LANDSCAPE
		stage,
		field,
		hand,
		mPanel,
		meter,
		mana = 0,
		manaMax = 10,
		manaGain = 1,

		sCard = null,  //  SELECTED CARD
		dO,
		// cardsPlayed = {},
		// cardsConfirmed = {},

		players = [new Player(),new Player()],
		p1,
		p2,

		expls,
		lsrs,
		unts,

		NOOP = () => {},
		// Actors = [],
		// lasers = [],

		//typ		//  TYPE OF UNIT
		//rng		//  ATTACK RANGE
		//mvS 		//  MOVE SPEED (PIXELS PER SECOND)
		//atS 		//  ATTACK SPEED (MS PER STRIKE)
		//hlt 		//  HEALTH


		//dly = DELAY BEFORE PLAYING


		// [w, h, rng, mvS, atS, hlt, dmg, fill, 
		//  0  1   2    3    4    5    6    7    
		//  frames, 
		//    8         
		//  aimPoints, 
		//    9  
		//   dly]
        //   10

		types = [
			//  BASE TOWER
			[32, 64, 90, 0, 1000, 1500, 1, '',
			[[320,0]],
			[[16,4]],
			0],

			//  MINI TOWER
			[32, 48, 80, 0, 600, 800, 50, '',
			[[288,0]],
			[[16,2]],
			800],

			//  SNIPER
			[32, 32, 100, 30, 1200, 200, 200, '',
			[[0,0],[32,0],[0,0],[64,0]],
			[[10,12],[24,10],[28,4],[24,-4],[19,-6],[4,-6],[2,3],[8,8]],
			600],

			//  SPIDER BOT
			[32, 32, 10, 50, 0, 50, 100, '',
			[[0,256],[32,256],[0,256],[64,256]],
			[[0,0]],
			250],

			//  MARK 1
			[32, 32, 80, 40, 800, 100, 50, '',
			[[96,0],[128,0],[96,0],[160,0]],
			[[10,10],[22,10],[26,6],[22,2],[20,0],[10,0],[8,6],[8,8]],
			400],

			//  NINJA
			[32, 32, 70, 50, 300, 300, 50, '',
			[[194,0],[226,0],[194,0],[258,0]],
			[[10,10],[22,10],[26,6],[22,2],[20,0],[10,0],[8,6],[8,8]],
			500],

			//  GRENADIER
			[32, 32, 80, 25, 800, 250, 500, '',
			[[96,256],[96,256],[128,256],[96,256],[96,256],[160,256]],
			[[14,20],[24,20],[24,16],[24,14],[22,10],[12,12],[10,16],[12,20]],
			400],
		],
		cards = [
			//  CARD 1  -  MINI TOWER
			[[1,0,0]],
			//  2  -   ONE SNIPER
			[[2,0,0]],
			//  3  -  SIX SPIDERS
			[[3,0,9],[3,15,9],[3,-15,9],[3,0,-9],[3,15,-9],[3,-15,-9]],
			//  4  THREE MARK 1'S WITH BLASTERS
			[[4,0,-10],[4,-10,10],[4,10,10]],
			//  5  TWO NINJAS
			[[5,-6,0],[5,6,0]],
			//  6  ONE GRENADIER
			[[6,0,0]],
			//  7  12 MINI BOMBS
			[[3,-8,9],[3,-24,9],[3,8,9],[3,16,9],
			 [3,-8,0],[3,-24,0],[3,8,0],[3,16,0],
			 [3,-8,-9],[3,-24,-9],[3,8,-9],[3,16,-9],],
			//  8  6 MARK 1'S
			[[4,0,9],[4,15,9],[4,-15,9],[4,0,-9],[4,15,-9],[4,-15,-9]]
		];

	function Player(pInd) {
		return {
			mana: 0,
			deck: [],
			hand: [],
			played: {},
			confirmed: {},
			units: {},
		}
	}
	function Card(id) {
		let C = new Obj(0,0,64,64,'blue');
		C.cardID = id;

		C.sx = 384 + (id%2)*64;
		C.sy = 0 + Math.floor(id/2)*64;
		C.render = ctx => {
			ctx.save();
			ctx.scale(2,2);
			ctx.drawImage(assets.images[0],C.sx,C.sy,C.w,C.h,C.x,C.y,C.w,C.h);
			ctx.restore();
		}
		return C;
	}
		
	root.Game = function(opts) {
		game = this;
		server = opts.server;
		socket = opts.socket;
		oneP = opts.oneP;

		// assets = {
		// 	sprites: []
		// };
		// assets = assets;




		//  ENCLOSED MAIN LOOP VARIABLES
		var simulationTimestep = 1000 / 60,
		    frameDelta = 0,
		    lastFrameTimeMs = 0,
		    fps = 60,
		    lastFpsUpdate = 0,
		    framesThisSecond = 0,
		    numUpdateSteps = 0,
		    minFrameDelay = 0,
		    running = false,
		    started = false,
		    panic = false,
		    // windowOrRoot = typeof window === 'object' ? window : root,
		    requestAnimationFrame = !server ? window.requestAnimationFrame : (function() {
		        var lastTimestamp = Date.now(),
		            now,
		            timeout;
		        return function(callback) {
		            now = Date.now()
		            timeout = Math.max(0, simulationTimestep - (now - lastTimestamp));
		            lastTimestamp = now + timeout;
		            return setTimeout(function() {
		                callback(now + timeout);
		            }, timeout);
		        };
		    })(),
		    cancelAnimationFrame = !server ? window.cancelAnimationFrame : clearTimeout,
		    // NOOP = function() {},
		    begin = NOOP,
		    update = NOOP,
		    draw = NOOP,
		    end = NOOP,
		    rafHandle;

		//  MAIN LOOP
		this.MainLoop = {
		    

		    setBegin: function(fun) {
		        begin = fun || begin;
		        return this;
		    },

		    setUpdate: function(fun) {
		        update = fun || update;
		        return this;
		    },

		    setDraw: function(fun) {
		        draw = fun || draw;
		        return this;
		    },

		    setEnd: function(fun) {
		        end = fun || end;
		        return this;
		    },

		    start: function() {
		        if(!started) {
		            started = true;
		            rafHandle = requestAnimationFrame(function(timestamp) {
		                draw(1);
		                running = true;
		                lastFrameTimeMs = timestamp;
		                lastFpsUpdate = timestamp;
		                framesThisSecond = 0;
		                rafHandle = requestAnimationFrame(animate);
		            });
		        }
		        return this;
		    },

		    stop: function() {
		        running = false;
		        started = false;
		        cancelAnimationFrame(rafHandle);
		        return this;
		    },

		    isRunning: function() {
		        return running;
		    },
		};
		//  MAIN LOOP ANIMATION
		function animate(timestamp) {
			// if(!server) window.timeStamp = timestamp;
			timeStamp = timestamp;
		    rafHandle = requestAnimationFrame(animate);
		    if(timestamp < lastFrameTimeMs + minFrameDelay) {
		        return;
		    }
		    frameDelta += timestamp - lastFrameTimeMs;
		    lastFrameTimeMs = timestamp;
		    begin(timestamp, frameDelta);
		    if(timestamp > lastFpsUpdate + 1000) {
		        fps = 0.25 * framesThisSecond + 0.75 * fps;

		        lastFpsUpdate = timestamp;
		        framesThisSecond = 0;
		    }
		    framesThisSecond++;

		    numUpdateSteps = 0;
		    while (frameDelta >= simulationTimestep) {
		        update(simulationTimestep);
		        frameDelta -= simulationTimestep;

		        if(++numUpdateSteps >= 240) {
		            panic = true;
		            break;
		        }
		    }

		    draw(frameDelta / simulationTimestep);
		    end(fps, panic);

		    panic = false;
		}

		this.init(opts);
	}
	root.Game.prototype = {
		init: function(opts) {

			stage = new Obj(0,0,720,480,'black');
			field = new Obj(70,0,480,480,'grey');
			let f1 = new Obj(0,0,240,240,'slategrey');
			let f2 = new Obj(240,240,240,240,'slategrey');
			hand = new Obj(550,0,150,480,'lightgrey');
			mPanel = new Obj(0,0,70,480,'lightgrey');
			meter = new Obj(13,13,46,454,'red');

			stage.addChild(field);
			field.render = NOOP;
			hand.render = NOOP;
			// field.addChild(f1);
			// field.addChild(f2);
			stage.addChild(hand);
			stage.addChild(mPanel);
			stage.render = ()=>{};

			for(let i=0; i<4; i++) {
				let o = new Obj(0,0,112,112,'blue')
				o.render = () => {}
				hand.addChild(o);
			}

			mPanel.addChild(meter);




			startTime = null;
			started = false;

			sStI = 0;
			sSts = [];

			players = [new Player(),new Player()];
			p1 = players[0];
			p2 = players[1];
			if(server) {
				p1.socket = opts.players[0].socket;
				p2.socket = opts.players[1].socket;
			}
			gameEnded = false;
			quitting = false;
			// cardsPlayed = {};
			// cardsConfirmed = {};
			players.forEach(p => {
				p.played = {};
				p.confirmed = {};
			})

			if(server || oneP) {

				
				// [Unit(p1,100,400,0),
							 // Unit(p1,380,400,0)];
				p1.pInd = 0;
				p2.pInd = 1;
				p1.eInd = 1;
				p2.eInd = 0;

				p2.towers = [Unit(p2,100,60,0),
							 Unit(p2,380,60,0)];
				// p1.towers = []

				p1.towers = [Unit(p1,100,420,0),
							 Unit(p1,380,420,0)]

				

			} 

			lsrs = ObjectPool(Laser,[0,0]);
			//  CLIENT SPECIFIC SET UP
			if(!server) {
				audio = Audio();	
				touch = new Obj();
						// playNewSound(sounds[1])
				// this.touch = touch;
				this.tDown = false;

				sCard = null;


				let pInd = opts.pI;

				p1.pInd = pInd ? 1 : 0;
				p2.pInd = pInd ? 0 : 1;
				p1.eInd = 1;
				p2.eInd = 0;

				expls = ObjectPool(Explosion,[0,0]);
				

				//  SET UP CANVAS
				this.canvas = Cnv(2,2);
				this.rsz(this.canvas);
				// this.rsz(assets.images[2]);
				
				document.body.appendChild(this.canvas);
				let ctx = this.canvas.ctx;
				ctx.imageSmoothingEnabled = false;
				this.ctx = ctx;


				ID = 0;

				// assets.images[1] = Cnv(sz,sz);
				p1.spSh = assets.images[0];
				p2.spSh = assets.images[1];


				// ctx.fillStyle = 'cornflowerblue';
				// ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

				// ctx.save();
				// ctx.scale(2,2);
				// ctx.drawImage(assets.images[0],0,0);
				// ctx.restore();

				this.MainLoop.setDraw(this.render);
			}

			dO = opts.dO || deckOrder();
			// let num = 1
			// p1.deck.push(Card(num),Card(num),Card(num),Card(num),Card(num),Card(num),Card(num),Card(num));
			// p2.deck.push(Card(num),Card(num),Card(num),Card(num),Card(num),Card(num),Card(num),Card(num));

			p1.deck.push(Card(0),Card(1),Card(2),Card(3),Card(4),Card(5),Card(6),Card(7));
			p2.deck.push(Card(0),Card(1),Card(2),Card(3),Card(4),Card(5),Card(6),Card(7));

			players.forEach((p,j) => {
				let i,c,o = server ? dO[p.pInd] : dO;
				for(i=0; i<4; i++) {
					c = p.deck[o[i]];
					if(!server && !j)
						hand.children[i].addChild(c);
					p.hand.push(c);
				}
				p.hand.forEach(C => {
					p.deck.splice(p.deck.indexOf(C),1)
				})				
			})
			




			//  SET UP MAIN LOOP
			this.MainLoop.setUpdate(this.update);
			this.MainLoop.setBegin(this.begin);
			this.MainLoop.start();

			//  TELL SERVER WE ARE READY
			if(!server && !oneP) socket.emit('ready');
		},
		start: function(time) {

			startTime = time;
		},
		recState: function(st) {
			sSts.push(st);
		},
		//  CONTROLS
		begin: function(tS,fD) {
			if(oneP || (startTime && !started && now() > startTime)) started = true;
			if(!server) {
				//  CHECK CONTROLS
				if(game.tDown) {
					for(let i=0; i<4; i++) {
						if(touchIn(hand.children[i]))
							sCard = i;
					}
					if(sCard !== null
					&& touchIn(field)
					&& touch.y > (field.gY()+field.h)/2
					&& p1.mana >= vals[p1.hand[sCard].cardID]) {
						p1.mana -= vals[p1.hand[sCard].cardID]
						game.playCard(sCard,null,0);
					}
				}

				if(oneP
				&& Math.random() < 0.01) {
					let c = rInt(4),
						v = vals[p2.hand[c].cardID];
					if(p2.mana >= v){
						p2.mana -= v;
						game.playCard(rInt(4),[,,rInt(100,190),rInt(100,140)],1);
					}

				}

				
				//  UPDATE FROM SERVER STATES
				if(sSts.length > sStI) {
					sSt =  JSON.parse(sSts[sStI]);

					//  LAG BEGIND THE SERVER BY 100ms TO SMOOTH OUT ANY BUMBPS
					if(now() < sSt[3] + 100) return;


					players.forEach((p,i) => {
						let units = sSt[p.pInd],
							unit,
							found,
							id;
						

						units.forEach(sU => {
							
							found = false;
							id = sU[0];


							if(p.units[id]) {
								p.units[id].reconcile(sU);
								found = true;
							}
							if(!found) {
								//  ADD UNIT
								addUnit([sU[1],sU[3]],p, sU);
								found = false;
							}
						})
						//  REMOVE UNITS NOT IN THE UPDATE
						for(let u in p.units) {
							unit = p.units[u];
							found = false;
							units.forEach(sU => {
								if(sU[0] === unit.id)
									found = true;
							})
							if(!found)
								removeUnit(unit);
						}
					});
					let i,l,p = p1.pInd;
					for(i=0; i<sSt[2].length; i++) {
						l = sSt[2][i];
						lsrs.newObject({
							 x: p ? 480 - l[0] : l[0],
							 y: p ? 480 - l[1] : l[1],
							 w: p ? 480 - l[2] : l[2],
							 h: p ? 480 - l[3] : l[3],
							 typ: l[4],
							 time: l[5]
						});
					}

					sStI++;
				}
				if(!server && !oneP) {
					// lsrs.active.forEach()
				}
			//  SERVER
			} else {
				let n = now();
				if(n > sStTmr + 50) {
					sStTmr = n;
					sendState();
				}

			}

			field.children.forEach(o => {
				if(o.dead)
					removeUnit(o);
			})

			//  CHECK IF MATCH IS DONE
			if(!gameEnded
			&& (oneP || server)) {

				if(p1.towers.length === 0
				|| p2.towers.length === 0) {
					console.log('gameEnded')
					gameEnded = true;
					setTimeout(gameOver,1000);
					// this = null;
				}
			}
		},
		update: function(tS) {

			let o, objs, anm;
			for(o in animatedObjects) {
				objs = animatedObjects[o];
				for(anm in objs)
					objs[anm].update(now());
			}
			// if(gameEnded) return;
			//  ALL CHILDREN OF FIELD
			field.children.forEach((o,i) => {
				//  IF IT EXISTS
				if(o) {
					//  IF IT HAS AI, PROCESS THAT
					if(o.ai && o.vis) o.ai();
					//  UPDATE THE OBJECT
					o.update(tS);
				}
			})

			if(!started) return;
			//  BOTH PLAYERS GAIN MANA
			players.forEach( p => {
				p.mana = Math.min(manaMax,p.mana + (manaGain * tS/1000));
			});

			
		},
		render: function() { 
			let i, c, ctx = game.ctx,
				w = prtrt ? meter.w/10 : meter.w,  //  PORTRAIT OR LANDSCAPE
				h = prtrt ? meter.h : meter.h/10;  //  PORTRAIT OR LANDSCAPE
			// ctx.fillStyle = 'darkgrey';
			// ctx.fillRect(0,0,innerWidth,innerHeight);
			ctx.clearRect(0,0,innerWidth,innerHeight);

			ctx.save();
			ctx.scale(scale,scale);

			if(sCard) {
				ctx.save();
				ctx.fillStyle = '#fff';
				ctx.globalAlpha = 0.3;
				ctx.fillRect(field.gX(),field.gY()+240,480,240);
				ctx.restore();
			}


			displayObj(stage);

			//  OUTLINE CARD
			ctx.strokeStyle = 'green';
			ctx.lineWidth = 4;
			if(sCard !== null) {
				c = hand.children[sCard];
				ctx.strokeRect(c.gX()+8,c.gY()+8,c.w,c.h);
			}

			//  FILL MANA METER
			for(i=0; i<Math.floor(p1.mana); i++) {
				ctx.fillStyle = 'green';
				if(prtrt)  //  PORTRAIT OR LANDSCAPE
					ctx.fillRect(meter.gX()+w*i,meter.gY(),w,h)
				else ctx.fillRect(meter.gX(),(meter.gY()+meter.h-h) - (h*i),w,h)
			}


			
			if(!started) {
				ctx.textAlign = 'right';
				ctx.fillStyle = 'black';
				ctx.font = '40px arial'
				ctx.fillText(decToBin(Math.floor((startTime-now())/100)),320+field.gX(),240+field.gY())
			}

		
			ctx.restore();



			
		},
		gameOver: function() {
			gameOver();
		},
		playCard: function(card,data,pI,nC) {

			//  ONLY DO THIS ONCE
			if(playingCard) return;
			playingCard = true;
			let n = data ? data[3] : now(),
				p = players[pI],
				l;

			p.played[playID] = [card,n];

			
			if(server || oneP)
				cardConfirmed(p,playID++,data,card,nC)
			else {
				l = new Obj().cpy(touch).sub(field.gL());
				if(p1.pInd) {
					l.x = 480 - l.x;
					l.y = 480 - l.y;
				}
				socket.emit('card','['+p1.pInd+','+card+','+l.x+','+l.y+','+n+','+playID++ +']');
			}

			
		},
		confCard: function(data) {

			cardConfirmed(p1,data[5],null,data[1],data[6]);
		},
		touch: function(x,y) {
			touch.x = x;
			touch.y = y;
			touch.scl(1/scale);
		},
		//  RESIZE
		rsz: cnv => {
			//  SCREEN DIMENSIONS
			let W = 680, H = 480,
				iW = innerWidth,
				iH = innerHeight,
			//  PORTRAIT OR LANDSCAPE
				p = iH > iW,
				w = p ? iW/H : iW/W,
				h = p ? iH/W : iH/H,

				stl = cnv.style;
			
			scale = w < h ? w : h;
			prtrt = p;  //  PORTRAIT OR LANDSCAPE

			cnv.width = iW;
			cnv.height = iH;
			cnv.ctx.imageSmoothingEnabled = false;

			stl.position = 'fixed';
			stl.left = '0px';
			stl.top = '0px';
			stl.zIndex = 2;
			assets.images[2].style.zIndex = 1;

			if(p) {
				//  CENTRE STAGE VERTICALLY
				stage.x = innerWidth/2 - H*scale/2;

				stage.y = innerHeight/2 - W*scale/2;

				//  RESIZE AND REPOSITION HAND
				hand.x = 0;
				hand.y = 550;
				hand.w = H;
				hand.h = 150;
				mPanel.x = 0;
				mPanel.y = 0;
				mPanel.w = H;
				mPanel.h = 70;
				meter.w = 454;
				meter.h = 46;
				field.x = 0;
				field.y = 70;
				for(let i=0; i<4; i++) {
					let card = hand.children[i];
					card.y = 4;
					card.x = i*118;
				}
			} else {
				stage.x = innerWidth/2 - W*scale/2;
				stage.y = innerHeight/2 - H*scale/2;

				//  RESIZE AND REPOSITION HAND
				hand.x = 550;
				hand.y = 0;
				hand.w = 150;
				hand.h = H;
				mPanel.x = 0;
				mPanel.y = 0;
				mPanel.w = 70;
				mPanel.h = H;
				meter.w = 46;
				meter.h = 454;
				field.x = 70;
				field.y = 0;
				for(let i=0; i<4; i++) {
					let card = hand.children[i];
					card.x = 4;
					card.y = i*118;
				}
			}
		}
		

	};

	function displayObj(obj) {
		let ctx = game.ctx;

		ctx.save();
		ctx.translate(obj.x,obj.y);
		if(obj.alpha !== 1)
			ctx.globalAlpha = obj.alpha;
		
		if(!obj.vis) ctx.globalAlpha = obj.alpha * 0.5;
		if(!obj.render) {
			ctx.fillStyle = obj.fill;
			ctx.fillRect(0,0,obj.w,obj.h);
		} else {
			// ctx.fillStyle = obj.fill;
			// ctx.fillRect(0,0,obj.w,obj.h);
			obj.render(ctx);
		}

		if(obj.children
		&& obj.children.length > 0) {
			obj.children.forEach(child => {
				displayObj(child);
			})
		}

		ctx.restore();
	};

	function sendState() {
		sSt = [];
		players.forEach(p => {
			let i,u,x,y,
				units = [],
				tgt;
			for(i in p.units) {
				u = p.units[i];

				// tgt = u.tgt != null ? u.tgt.id : null;
				x = rnd(u.x);
				y = rnd(u.y);

				units.push([u.id,
							u.typ,
							x,
							y,
							u.pT,
							u.tgt ? u.tgt.id : null,
							u.atT,
							u.hlt,
							u.dead] )
			}
			sSt[p.pInd] = units;
		})
		let i,l,ls = [];
		for(i=0; i<lsrs.active.length; i++) {
			l = lsrs.active[i];
			ls.push([l.x,l.y,l.w,l.h,l.typ,l.time]);
		}
		sSt.push(ls);

		sSt.push(now());

		sSt = JSON.stringify(sSt);
		p1.socket.emit('state',sSt);
		p2.socket.emit('state',sSt);
	}

	
	function cardConfirmed(p,pID,data,card,nC) {

		//  GET CARD PLAYED
		let d,c = p.played[pID],
			nCard, pCard;



		//  PUT IT IN confirmed
		p.confirmed[pID] = c;
		//  REMOVE IT FROM played
		delete p.played[pID];
		
		pCard = p.hand[card];
		nCard = drawCard(p,card,nC);


		//  ADD UNITS
		if(oneP || server) {

			cards[pCard.cardID].forEach(u => {
				addUnit(c,p,data,u)
			})
			// addUnit(c,p,data)
		}

		if(!server) anmPlayCard(p,card,pCard,nCard);
		else nextCard(p,card,pCard,nCard);


		
		//  DESELECT CARD
		if(!p.pInd)
			sCard = null;
		

	}

	function drawCard(p,space,nC) {
		let r = nC === undefined ? rInt(p.deck.length) : nC;
		let	c = p.deck.splice(r,1)[0];
			
		return c;
	}

	function nextCard(p,id,c,n) {
		playingCard = false;

		// console.log(p.hand[0].cardID,p.hand[1].cardID,p.hand[2].cardID,p.hand[3].cardID," ",p.deck[0].cardID,p.deck[1].cardID,p.deck[2].cardID,n.cardID)
		
		
		if(!server && p1.pInd === p.pInd) {
			hand.children[id].removeChild(c);
			hand.children[id].addChild(n);

			c.alpha = 1;
			c.x = 0;
			c.y = 0;
		}

		p.hand.splice(id,1,n);
		p.deck.push(c);


	}

	function gameOver() {
		//  ONLY RUN THIS CODE ONCE
		if(quitting) return;
		quitting = true;

		if(server) {
			p1.socket.emit('gameOver');
			p2.socket.emit('gameOver');
		} else socket.emit('matchEnded','boo ya');

		//  STOP PROCESSING
		if(game)
			game.MainLoop.stop();
		
		//  WAIT A SECOND
		if(!server) {
			setTimeout(() => {
				//  CANVAS ELEMENT
				let node = document.getElementsByTagName('canvas')[0],
				//  BATTLE/PRACTICE BUTTONS
					btns = document.getElementsByTagName("button");

				//  REMOVE CANVAS FROM DOCUMENT
				document.body.removeChild(game.canvas);
				//  SET GAME TO NULL FOR SINGLE PLAYER
				if(oneP) game = null;
				//  ENABLE BUTTONS
				for(var i=0; i<btns.length; i++)
					btns[i].disabled = false;

				assets.images[2].style.zIndex = -1;

			},1000)
		}
		
	}
	

	//  OBJECT ID
	let ID = 0;
	//  MAIN VECTOR/OBJECT
	function Obj(x,y,w,h,c) {

		let O = {
			id: ID++,
			x: x || 0,
			y: y || 0,
			w: w || 0,
			h: h || 0,
			vis: true,
			alpha: 1,
			fill: c || 'red',
			add(o) {
				this.x += o.x;
				this.y += o.y;
				return this;
			},
			sub(o) {
				this.x -= o.x;
				this.y -= o.y;
				return this;
			},
			scl(o) {
				this.x *= o;
				this.y *= o;
				return this;
			},
			cpy(o) {
				this.x = o.x;
				this.y = o.y;
				return this;
			},
			clr() {
				this.x = 0;
				this.y = 0;
				return this;
			},
			mag() {
				return Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2));
			},
			nrmlz() {
				let m = this.mag();
				if(m != 0) {
					this.x = this.x / m;
					this.y = this.y / m;
				}
				return this;
			},
			dist(o) {
				return Math.sqrt(Math.pow(this.x - o.x, 2)+Math.pow(this.y - o.y, 2))
			},
			dir() {return Math.atan2(this.y,this.x)},

			//  SCENE GRAPH
			parent: null,
			children: [],

			addChild(chld) {
				if(chld.parent)
					chld.parent.removeChild(chld);
				chld.parent = this;

				this.children.push(chld);
				this.children.sort((a,b) => a.y+a.h*0.75 - b.y+b.h*0.75)
			},
			removeChild(chld) {
				
				if(chld.parent === this) {

					this.children.splice(this.children.indexOf(chld),1);
					chld.parent = null;

				}
				else throw new Error(chld + "is not a child of " + this);
			},
			gX() {
				if(this.parent)
					return this.x + this.parent.gX();
				else return this.x;
			},
			gY() {
				if(this.parent)
					return this.y + this.parent.gY();
				else return this.y;
			},
			gL() {
				return new Obj(this.gX(),this.gY());
			},
			update() {}
		}



		return O;
	};



	function Unit(ply,x,y,t,id) {

		let p = types[t],	//  PROTOTYPE
			U = new Obj(x,y,p[0],p[1],p[7]);

		// U.x -= U.w/2;
		// U.y -= U.h*0.75;

		U.id = id || U.id;
		U.dead = false;
		U.pT = null;        //  PLAY TIME
		U.dly = p[10];      //  DELAY TIME WHEN PLAYING UNIT
		U.ply = ply;
		U.tm = ply.units;			//  ARRAY UNIT IS IN
		U.enm = players[ply.eInd].units;			//  THE ARRAY OF ENEMY UNITS
		U.tgt = null;		//  TARGETED ENEMY
		U.dir = Obj();		//  DIRECTION OF MOVEMENT
		U.aim = null;		//  DIRECTION AIMING
		U.aPs = p[9];       //  AIMING POINTS
		
		U.api = 0;          //  AIMING POINT INDEX

		U.typ = t;			//  TYPE OF UNIT


		U.rng = p[2];			//  ATTACK RANGE
		U.mvS = p[3];		//  MOVE SPEED (PIXELS PER SECOND)
		U.atS = p[4];		//  ATTACK SPEED (MS PER STRIKE)
		U.atT = 0;			//  TIME OF LAST ATTACK
		U.hlt = p[5];		//  HEALTH
		U.dmg = p[6];		//  DAMAGE DEALT


		U.frms = p[8] || [];// ANIMATION FRAMES
		U.t = 0;			//  TIME
		U.aI = 0;  			//  ANIMATION INDEX


		if(t===6) {
			let g = new Obj(0,0,32,32);
			g.sx = 352;
			g.sy = 256;
			g.render = c => {
				c.drawImage(assets.images[0],g.sx,g.sy,g.w,g.h,g.x-20,g.y-29,g.w,g.h);
			}
			U.addChild(g);
		}

		

		// tm.push(U);
		U.tm[U.id] = U;
		field.addChild(U);
		
		// Actors.push(U);

		U.ai = () => {
			if(U.dead) return;

			if(U.tgt === null
			|| U.tgt.dead
			|| U.dist(U.tgt) > U.rng)
				U.target();

			//  IF THE UNIT HAS A TARGET, MOVE TOWARDS AND ATTACK IT
			if(U.tgt !== null) {
				//  DIRECTION TO MOVE
				if(U.dist(U.tgt) > U.rng
				|| U.aim === null) {
					U.dir.cpy(U.tgt).sub(U).nrmlz();
					U.aim = (Math.floor(U.dir.dir()/Math.PI* -4+4.5) + 6) % 8;

				}
				else U.dir.clr();
				//  IF THE TARGET IS CLOSE ENOUGH
				if(U.dist(U.tgt) < U.rng) {

					// U.aim = (Math.floor(U.aim.cpy(U.tgt).sub(U).nrmlz().dir()/Math.PI* -4+4.5) + 6) % 8;
					//  IF THE UNIT IS READY TO ATTACK
					if(now() > U.atT + U.atS) {

						
						//  TARGET
						let tg = U.tgt,
						//  AIM POINT
							ap = U.aPs[U.aim%U.aPs.length] || [0,0];
						if(U.typ === 0) {
							//  AIM POINT INDEX
							U.api = (U.api + 1) % 2;

							//  AIM POINT + AIM POINTS [AIM POINT INDEX]
							ap = U.aPs[U.api] || [[0,0]];
						}


						if(U.typ === 3) {
							if(!server)
								expls.newObject([U.x,U.y+U.tgt.h*0.1]);
							// Explosion(U.x,U.y);
							removeUnit(U);
							setTimeout(function() {
								if(tg.takeDamage(U.dmg))
									tg = null;
							},300);

						} else {
							if(U.typ === 6) {
								if(server) {
									U.throwTime = now();
								}
								else if(!U.throwing) {
									U.throwing = true;
									anmThrowGrenade(U,tg.x,tg.y);
									return;
								}
							} else {
								if(oneP) playSound(0);
									
								if(server || oneP) {
									let laser = lsrs.newObject({
										 x: U.x+ap[0]-U.w/2,
										 y: U.y+ap[1]-U.h/2,
										 w: tg.x,
										 h: tg.y,
										 typ: U.typ
									});
								}
								
								//  ATTACK!  ATTACK!  ATTACK!
								

								if(tg.takeDamage(U.dmg))
									tg = null;
							}
						}
						U.atT = now();
						
					}	
				}
			}
		},
		U.target = () => {

			//  FOR EACH ENEMY UNIT
			U.tgt = null;



			for(let i in U.enm) {
				let enm = U.enm[i],		//  ENEMY UNIT
					dst = U.dist(enm);	//  DISTANCE TO ENEMY UNIT

				//  IF ENEMY UNIT IS IN RANGE
				// if(dst < U.rng) {
				if(enm.dead) continue;
				//  IF THIS UNIT HAS NO TARGET OR THE DISTANCE TO THE ENEMY UNIT
				//  IS LESS THAN THE CURRENT TARGET, TARGET THE ENEMY UNIT
				if(U.tgt === null
				|| dst < U.dist(U.tgt))
					U.tgt = enm;
				// }

			}
		},
		U.takeDamage = amount => {
			U.hlt -= amount;
			if(U.hlt <= 0) {
				U.hlt = 0;
				// if(server || oneP)
				 U.dead = true;
				// else U.dead = 1;

				return true;
			}

		},
		U.update = d => {
			if(U.vis) {
				if(U.tgt === null)
					U.target();
				if(U.tgt) {
					U.dir.scl(U.mvS*d/1000);

					U.add(U.dir);
				}
			}
			else {
				//  MAKE VISIBLE IF NOW IS GREATER THAN PLAY TIME PLUS DELAY TIME
				if(now() > U.pT + U.dly)
					U.vis = true;
			}
		},
		//  RECONCILE WITH SERVER STATE
							// u.id
				//      +','+ rnd(u.x)
				//      +','+ rnd(u.y)
				//      +','+ u.pT
				//      +','+ tgt
				//      +','+ u.atT
				//      +','+ u.hlt)
		U.reconcile = d => {

			// d = d.split(',');
			U.x = p1.pInd ? 480 - d[2] : d[2];
			U.y = p1.pInd ? 480 - d[3] : d[3];
			U.pT = d[4];

			// U.tgt = d[5];
			U.atT = d[6];
			U.hlt = d[7];

			U.dead = d[8];

			// U.tgt = U.enm
		},
		U.render = c => {

			
			//  SWITCH FRAMES
			if(now() > U.t + 80) {
				U.t = now();
				U.aI++;
				U.aI = U.aI % U.frms.length;
			}
			//  IDLE POSE
			if(U.dir.mag() < 0.1)
				U.aI = 0;
			
			//  CACHE FRAME
			let frm = U.frms[U.aI];
				// aim = (Math.floor(U.aim.dir()/Math.PI* -4+4.5) +6) % 8;

			//  TOWERS ALWAYS AIM = 0;
			if(U.typ < 2)
				U.aim = 0;

			// if(U.typ === 6
			// && U.aim > 3
			// && U.aim < 6)
			// 	c.drawImage(assets.images[0],
			// 				)

			//  DRAW FRAME
			if(frm) {
				c.drawImage(U.ply.spSh,
							frm[0],frm[1]+U.aim*32,
							U.w,U.h,
							-U.w/2,-U.h*0.75,
							U.w,U.h);
			}
		}
		return U;
	}

	function addUnit(crd,p,data,U) {


		let i,u,
			enm = p.pInd ? p1.units : p2.units,
			x = data ? data[2] : touch.x - field.gX(),
			y = data ? data[3] : touch.y - field.gY(),
			id = data ? data[0] : undefined,
			typ = !server && !oneP ? data[1] : U[0];

		if(U) {
			x += U[1];
			y += U[2];
		}

		if(p1.pInd) {
			x = 480 - x;
			y = 480 - y;
		}

		u = Unit(p,x,y,typ,id);

		// 	//  TIME CARD WAS PLACED AT
		u.pT = crd[1];
		// 	//  SET IT TO INVISIBLE
		u.vis = false;
	}

	function removeUnit(unit) {
		//  REMOVE UNIT FROM IT'S TEAMS UNITS ARRAY
		// unit.tm.splice(unit.tm.indexOf(unit),1);
		delete unit.tm[unit.id];
		//  IF IT IS A TOWER, REMOVE IT FROM IT'S TEAMS TOWER ARRAY AS WELL
		if((server || oneP)
		&& unit.typ === 0)
			unit.ply.towers.splice(unit.ply.towers.indexOf(unit),1);
		//  REMOVE FROM FIELD TO END UPDATING AND RENDERING

		field.removeChild(unit);
		//  IF ANY ENEMY UNITS ARE TARGETING THIS UNIT, TARGET THEM TO NULL
		for(let i in unit.enm) {
			let en = unit.enm[i];
			if(en.tgt && en.tgt.id === unit.id)
				en.tgt = null;
		}
	}

	let lasers = [
		'red',
		'orange',
		'blue','yellow',
		'purple',
		'pink'


	]
	function Laser(o) {
		let O = new Obj();
		O.init = (o) => {
			O.typ = o.typ;
			O.time = o.time || now();
			O.x = o.x;
			O.y = o.y;
			O.w = o.w;
			O.h = o.h;
			field.addChild(O);			
		}
		O.render = ctx => {
			if(now() > O.time ) {
				ctx.strokeStyle = lasers[O.typ];
				ctx.lineWidth = 2;


	// ctx.fillStyle = lasers[O.typ];
	// ctx.fillRect(0,0,O.w,O.h);

				ctx.beginPath();
				ctx.moveTo(0,0);
				ctx.lineTo(O.w-O.x,O.h-O.y);
				ctx.stroke();
			}
		}
		O.update = tS => {
			if(now() > O.time + Math.random()*275+25) {
				field.removeChild(O);
				O.release();
			}
		}
		return O;
		// field.addChild(O);

	};

	function Explosion() {

		let i,frm,e = new Obj(0,0,32,32);
		e.frms = [];
		for(i=0; i<8; i++)
			e.frms.push([352,i*32]);
		e.init = (o) => {
			e.x = o[0];
			e.y = o[1];
			e.time = now();
			e.aI = 0;
			field.addChild(e);
		};
		e.update = () => {
			if(now() > e.time + 80)
				e.aI++;
			if(e.aI === 8) {
				e.release();
				field.removeChild(e);
			}
		}
		e.render = c => {
			frm = e.frms[e.aI];
			c.drawImage(assets.images[0],
						frm[0],frm[1],32,32,-16,-16,32,32);
		}
		
		return e;
	}

	
	

	function now() { return Date.now() };


	function rnd(n) {
		return Math.floor(n * 100)/100
		// return n;
	};

	function rvrs(obj) {
		obj.x = 480 - obj.x;
		obj.y = 480 - obj.y;
		return obj;
	};

	function touchIn(obj) {
		if(touch.x > obj.gX() && touch.x < obj.gX() + obj.w
		&& touch.y > obj.gY() && touch.y < obj.gY() + obj.h)
			return true;
	};


//   ANIMATION CODE
	let animatedObjects = {},
		ease = {
			linear: x => x,
			acceleration: x => x * x,
			deceleration: x => 1 - Math.pow(1 - x, 2),
			smoothStep: x => x * x * Math.pow((3 - 2 * x), 1),
		};

	// animateProperty({
	// 		target: e,
	// 		property: "y",
	// 		endValue: e.y + 100,
	// 		duration: 1000,
	// 		curve: "smoothStep",
	// 		yoyo: true,
	// 		timesToRepeat: 2
	// 	})

	// for(let o in animatedObjects) {
	// 	let obj = animatedObjects[o];
	// 	for(let anm in obj) {
	// 		obj[anm].update(now());
	// 	}
	// }

	function animateProperty(options) {
		let anm = {};
		Object.assign(anm,options);
		anm.startValue = anm.startValue || anm.target[anm.property];
		anm.direction = "forward";
		anm.timesToRepeat = options.timesToRepeat || 1;
		anm.repeatCount = 1;

		anm.start = (startValue,endValue) => {
			anm.startValue = JSON.parse(JSON.stringify(startValue));
			anm.endValue = JSON.parse(JSON.stringify(endValue));
			anm.playing = true;
			anm.duration = anm.duration || 1000;
			anm.startTime = now();

			if(!animatedObjects[anm.target.id])
				animatedObjects[anm.target.id] = {};

			animatedObjects[anm.target.id][anm.property] = anm;
			
		};

		anm.start(anm.startValue, anm.endValue);

		anm.update = () => {
			let eTime = now() - anm.startTime,
				time, curvedTime;
			if(anm.playing) {
				if(eTime < anm.duration) {
					let nTime = eTime / anm.duration;
					curvedTime = ease[anm.curve](nTime);

					
					anm.target[anm.property] = (anm.endValue * curvedTime) + (anm.startValue * (1 - curvedTime));
				} else anm.end();
			}
		};

		anm.end = () => {
			if(anm.yoyo
			&& anm.direction === "forward") {
				anm.direction = "reverse";
				anm.start(anm.endValue,anm.startValue);
				return;
			}

			if(anm.timesToRepeat > 1
			&& anm.repeatCount < anm.timesToRepeat)
				anm.repeat();
			else if(anm.repeat === 1
			|| anm.repeatCount >= anm.timesToRepeat)
				anm.complete();
		};

		anm.repeat = () => {
			anm.repeatCount++;
			if(anm.direction === "reverse") {
				anm.direction = "forward";
				anm.start(anm.endValue,anm.startValue);
			} else anm.start(anm.startValue,anm.endValue);
		};

		anm.complete = () => {
			anm.playing = false;
			if(anm.onComplete) anm.onComplete(anm.target);
			delete animatedObjects[anm.target.id][anm.property];
		};

		anm.play = () => anm.playing = true;
		anm.pause = () => anm.playing = false;

		return anm;
	}

	function anmPlayCard(p,id,c,n) {
		let card = p.hand[id];

		animateProperty({
			target: card,
			property: prtrt ? 'y' : 'x',
			endValue: -100,
			duration: 350,
			curve: 'acceleration',
			onComplete: () => {
				nextCard(p,id,c,n)
			}
		});
		animateProperty({
			target: card,
			property: 'alpha',
			endValue: 0,
			duration: 300,
			curve: 'smoothStep'
		})
	}

	function anmThrowGrenade(u,X,Y) {
		let g = u.children[0],
			t = u.tgt;
		animateProperty({
			target: g,
			property: 'x',
			endValue: (X-u.x)/(scale*2),
			duration: 300,
			curve: 'linear',
			onComplete: () => {
				g.x = 0;
				g.y = 0;
				u.throwing = false;
			}
		});
		animateProperty({
			target: g,
			property: 'y',
			endValue: (Y - u.y)/ (scale*2),
			duration: 300,
			curve: u.aim <= 1 ? 'acceleration':'deceleration',
			onComplete: () => {
				expls.newObject([X,Y])
				// Explosion(X,Y);
			}
		})
	}

	function decToBin(dec){
	    return dec >= 0 ? (dec >>> 0).toString(2) : 0;
	}
	function ObjectPool(object,def) {
		let i,pool = {};
		pool.active = [];
		pool.inactive = [];
		
		pool.newObject = function(opts) {

			let o;
			if(pool.inactive.length < 1) {

				o = object();
				o.init(opts);
				o.release = () => {
					o.vis = false;
					pool.active.splice(pool.active.indexOf(o),1);
					pool.inactive.push(o);
				}
				// field.addChild(o);
			} else {
				o = pool.inactive.pop();
				o.init(opts);
				o.vis = true;
			}
			// o.birth = now();
			pool.active.push(o);
			

			return o;
		};
		// for(i=0; i<20; i++)
		// 	pool.newObject({});
		return pool;
	}
/*
0 - type
1 - master amp
2 - frequency
3 - end frequency

4 - type of frequency modulation
5 - frequency of freq mod
6 - end frequency of freq mod
7 - amount of freq mod

8 - attack
9 - decay
10 - sustain
11 - sustain value
12 - release

13 - type of filter
14 - frequency of filter
15 - end frequency of filter
16 - Q
17 - gain of filter

18 - distortion amount

19 - bit crusher bits 1 - 16
20 - bit crusher freq 0 - 1


*/
	let sounds = [
		['noise',2,,, ,,,, 0.1,0.2,0.4,0.8,0.1,  ,,,,,  , 1,0.1],
		['square',0.2,440,0, ,,,, 0.02,0.06,0.08,0.6,0.1, 'lowpass',800,0,10,,100,]
	], //playSound,

	Audio = () => {
		
		let AudioCtx = window.AudioContext || window.webkitAudioContext,
			// lRampTo = 
			aCtx = new AudioCtx(),
			bufferSize = 4096,
			pinkNoise = (function() {
		        var b0, b1, b2, b3, b4, b5, b6;
		        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
		        var node = aCtx.createScriptProcessor(bufferSize, 1, 1);
		        node.onaudioprocess = function(e) {
		            var output = e.outputBuffer.getChannelData(0);
		            for (var i = 0; i < bufferSize; i++) {
		                var white = Math.random() * 2 - 1;
		                b0 = 0.99886 * b0 + white * 0.0555179;
		                b1 = 0.99332 * b1 + white * 0.0750759;
		                b2 = 0.96900 * b2 + white * 0.1538520;
		                b3 = 0.86650 * b3 + white * 0.3104856;
		                b4 = 0.55000 * b4 + white * 0.5329522;
		                b5 = -0.7616 * b5 - white * 0.0168980;
		                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
		                output[i] *= 0.11; // (roughly) compensate for gain
		                b6 = white * 0.115926;
		            }
		        }
		        return node;
		    })(),
		    bitCrusher = (function() {
		        let node = aCtx.createScriptProcessor(bufferSize, 1, 1);
		        node.bits = 1; // between 1 and 16
		        node.normfreq = 0.01; // between 0.0 and 1.0
		        let step = Math.pow(1/2, node.bits),
		            phaser = 0,
		            last = 0;
		        node.onaudioprocess = function(e) {
		            let i,
		                input = e.inputBuffer.getChannelData(0),
		                output = e.outputBuffer.getChannelData(0);
		            for (i = 0; i < bufferSize; i++) {
		                phaser += node.normfreq;
		                if (phaser >= 1.0) {
		                    phaser -= 1.0;
		                    last = step * Math.floor(input[i] / step + 0.5);
		                }
		                output[i] = last;
		            }
		        };
		        return node;
		    })(),
		    distortion = (function() {
		        // create the waveshaper
		        var node = aCtx.createWaveShaper();
		        // node.amount
		        Object.defineProperty(node, 'amount', { set: amt => { node.curve = makeDistortionCurve(amt)}});
		        node.curve = makeDistortionCurve(1);
		         
		        // our distortion curve function
		        function makeDistortionCurve(amount) {
		            var k = typeof amount === 'number' ? amount : 50,
		                n_samples = 44100,
		                curve = new Float32Array(n_samples),
		                deg = Math.PI / 180,
		                i = 0,
		                x;
		            for ( ; i < n_samples; ++i ) {
		                x = i * 2 / n_samples - 1;
		                curve[i] = ( 3 + k ) * x * 20 * deg / 
		                    (Math.PI + k * Math.abs(x));
		            }
		            return curve;
		        }

		        return node;
		    })()

		function playNewSound(o) {
		    let gen = o[0] === 'noise' ? pinkNoise : createOsc(),
		        g = aCtx.createGain(),
		        fm = createOsc(),
		        fmG = aCtx.createGain(),
		        cT = aCtx.currentTime,
		        a = o[8],
		        d = o[9],
		        s = o[10],
		        sV = o[11],
		        r = o[12],
		        bqf,dst,btC;
		    gen.type = o[0];
		    g.gain.value = o[1];
		    if(o[0] !== 'noise') {
			    gen.frequency.value = o[2] || 440;
			    if(o[3]) gen.frequency.linearRampToValueAtTime(o[3],cT+a+d+s);
			}

			if(o[4]) {
			    fm.type = o[4];
			    fm.frequency.value = o[5] || 0;
			    if(o[6]) {
			        fm.frequency.linearRampToValueAtTime(o[6],cT+a+d+s);
			        fm.start(0);
			        fm.stop(cT+a+d+s+r)
			    }
			    fmG.gain.value = o[7] || 30;
			}

		    if(o[13]) {

		        bqf = aCtx.createBiquadFilter();
		        bqf.type = o[13];
		        bqf.frequency.value = o[14];
		        if(o[15]) bqf.frequency.linearRampToValueAtTime(o[15],cT+a+d+s);
		        bqf.Q.value = o[16];
		        bqf.gain.value = o[17] || 1;
		    }

		    if(o[18]) {
		        dst = aCtx.createWaveShaper();
		        dst.curve = makeDistortionCurve(o[18]);
		    }

		    if(o[20]) btC = bitCrusher; 

			if(o[0] !== 'noise') {
				if(o[4]) {
				    fm.connect(fmG);
				    fmG.connect(gen.frequency);
				}
			    gen.start(0);
			    gen.stop(cT+a+d+s+r);
			}
		    
		    gen.connect(dst || btC || bqf || g);
		    if(dst) dst.connect(btC || bqf || g);
		    if(btC) btC.connect(bqf || g);
		    if(bqf) bqf.connect(g);
		    
		    g.connect(aCtx.destination);
		    g.gain.setValueAtTime(0,cT);
		    g.gain.linearRampToValueAtTime(1,cT+a);
		    g.gain.linearRampToValueAtTime(sV,cT+a+d);
		    g.gain.linearRampToValueAtTime(sV,cT+a+d+s);
		    g.gain.linearRampToValueAtTime(0,cT+a+d+s+r);
		}

		function createOsc() {
		    return aCtx.createOscillator();
		}
		function makeDistortionCurve(amount) {
		    var k = typeof amount === 'number' ? amount : 50,
		        n_samples = 44100,
		        curve = new Float32Array(n_samples),
		        deg = Math.PI / 180,
		        i = 0,
		        x;
		    for ( ; i < n_samples; ++i ) {
		        x = i * 2 / n_samples - 1;
		        curve[i] = ( 3 + k ) * x * 20 * deg / 
		            (Math.PI + k * Math.abs(x));
		    }
		    return curve;
		}

		playNewSound(sounds[1])
	
		// playNewSound(['square',0.2,880 + (Math.random()*150-75),500, 'sawtooth',300,100,30, 0.02,0.06,0.08,0.6,0.1, 'lowpass',800,200,1]);
		// game.sfx = [
		// 	function() {
		// 		playNewSound()
		// 	}
		// ]
		playSound = i => {
			switch(i) {
				case 0:
				case 1:
				case 2:
				case 3:
					playNewSound(['square',0.2,880 + (Math.random()*150-75),500, 'sawtooth',300,,30, 0.02,0.06,0.08,0.6,0.9, 'lowpass',600,,1]);
				break;
			}
		}


	}

	

	if (typeof define === 'function' && define.amd) {
    define(root.MainLoop);
	}
	// CommonJS support
	else if (typeof module === 'object' && module !== null && typeof module.exports === 'object') {
	    module.exports = root.Game;
	}

})(this);

//  RETURN SIZED CANVAS WITH CONTEXT AS PROPERTY
	function Cnv(w,h) {
		let c = document.createElement('canvas');
		c.ctx = c.getContext('2d');
		c.width = w;
		c.height = h;
		c.ctx.imageSmoothingEnabled = false;
		return c;
	};

	function deckOrder() {
		let i,
			d = [0,1,2,3,4,5,6,7],
			o = [];
		for(i=0; i<8; i++)
			o.push(d.splice([rInt(d.length)],1)[0]);
		return o;
	}
	//  1  -  MINI TOWER
	//  2  -   ONE SNIPER
	//  3  -  SIX SPIDERS
	//  4  THREE MARK 1'S WITH BLASTERS
	//  5  TWO NINJAS
	//  6  ONE GRENADIER
	//  7  12 MINI BOMBS
	//  8  6 MARK 1'S
	let vals = [6,5,3,2,4,3,6,5];

	function rInt(i,o) {
		return Math.floor(Math.random()*i+(o||0));
	}

	



















