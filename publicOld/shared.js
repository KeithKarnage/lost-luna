"use strict";
let assets = {
			images: []
		};

(function(root) {

	


	let server,
		socket,
		audio,
		// playSound,
		game = null,
		oneP,
		timeStamp,
		stTime,
		started,
		gameEnded = false,
		endSound = false,
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




			stTime = null;
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
			endSound = false;
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
				window.mobile = false;
			    //  CHECK TO SEE IF window.orientation EXISTS.
			    //  IF IT DOES, THIS IS A MOBILE DEVICE
			    if(typeof window.orientation !== 'undefined'){
			        //  SET MOBILE FLAG TO TRUE
			        mobile = true;
			        //  SCROLL TO THE TOP OF THE SCREEN TO REMOVE THE ADDRESS BAR ON A MOBILE DEVICE
			        window.top.scrollTo(0,1);
			    }
				// audio = Audio();	
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

			stTime = time;
		},
		recState: function(st) {
			sSts.push(st);
		},
		//  CONTROLS
		begin: function(tS,fD) {
			if(oneP || (stTime && !started && now() > stTime)) started = true;
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
						game.playCard(sCard,null,0);
					}
				}

				if(oneP
				&& Math.random() < 0.01) {
					let c = rInt(4),
						v = vals[p2.hand[c].cardID];
					if(p2.mana >= v){
						// p2.mana -= v;
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
						// playSound('L1');
						Sfx.play("L1",0.5,false);
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

			if(sCard !== null) {
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
				ctx.font = '40px sans-serif'
				ctx.fillText(decToBin(Math.floor((stTime-now())/100)),320+field.gX(),240+field.gY())
			}
			if(gameEnded) {
				let message = '';
				if(p1.towers.length > 0) {
					message = 'You Win!';
					if(!endSound)
						Sfx.play('win',0.8,false)
				} else {
					message = 'You Lose!'
				}
				endSound = true;
				ctx.textAlign = 'center';
				ctx.fillStyle = 'black';
				ctx.font = '80px sans-serif'
				ctx.fillText(message,240+field.gX(),240+field.gY())
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

			
			if(server || oneP) {
				cardConfirmed(p,playID++,data,card,nC)
				players[pI].mana -= vals[players[pI].hand[card].cardID]
			}
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
							if(!server) {
								expls.newObject([U.x,U.y+U.tgt.h*0.1]);
								// playSound(1)
								Sfx.play("E1",0.5,false);
							}
							// Explosion(U.x,U.y);
							removeUnit(U);
							// setTimeout(function() {
								if(tg.takeDamage(U.dmg))
									tg = null;
							// },300);

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
								// if(oneP) playSound('L1');
								if(oneP) Sfx.play("L1",0.5,false);  
									
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
		if(unit.typ === 0) {
			if(server || oneP)
				unit.ply.towers.splice(unit.ply.towers.indexOf(unit),1);
			if(!server) {
				for(let i=0; i<5; i++) {
					setTimeout(function() {
						Sfx.play('E2',0.8,false);
						console.log('E2')
					}, Math.random()*50 + 100*i)
				}
				
			}
		}
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
	// 		eVal: e.y + 100,
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

	function animateProperty(o) {
		let anm = {};
		Object.assign(anm,o);
		anm.sVal = anm.sVal || anm.target[anm.property];
		anm.direction = "forward";
		anm.timesToRepeat = o.timesToRepeat || 1;
		anm.repeatCount = 1;

		anm.start = (sVal,eVal) => {
			anm.sVal = JSON.parse(JSON.stringify(sVal));
			anm.eVal = JSON.parse(JSON.stringify(eVal));
			anm.playing = true;
			anm.duration = anm.duration || 1000;
			anm.stTime = now();

			if(!animatedObjects[anm.target.id])
				animatedObjects[anm.target.id] = {};

			animatedObjects[anm.target.id][anm.property] = anm;
			
		};

		anm.start(anm.sVal, anm.eVal);

		anm.update = () => {
			let eTime = now() - anm.stTime,
				time, curvedTime;
			if(anm.playing) {
				if(eTime < anm.duration) {
					let nTime = eTime / anm.duration;
					curvedTime = ease[anm.curve](nTime);

					
					anm.target[anm.property] = (anm.eVal * curvedTime) + (anm.sVal * (1 - curvedTime));
				} else anm.end();
			}
		};

		anm.end = () => {
			if(anm.yoyo
			&& anm.direction === "forward") {
				anm.direction = "reverse";
				anm.start(anm.eVal,anm.sVal);
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
				anm.start(anm.eVal,anm.sVal);
			} else anm.start(anm.sVal,anm.eVal);
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
			eVal: -100,
			duration: 350,
			curve: 'acceleration',
			onComplete: () => {
				nextCard(p,id,c,n)
			}
		});
		animateProperty({
			target: card,
			property: 'alpha',
			eVal: 0,
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
			eVal: (X-u.x)/(scale*2),
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
			eVal: (Y - u.y)/ (scale*2),
			duration: 300,
			curve: u.aim <= 1 ? 'acceleration':'deceleration',
			onComplete: () => {
				expls.newObject([X,Y])
				// playSound(1)
				Sfx.play("E1",0.5,false);
				if(t.takeDamage(u.dmg))
					u.tgt = null;				
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
	// let sounds = [
	// 	['noise',2,,, ,,,, 0.1,0.2,0.4,0.8,0.1,  ,,,,,  , 1,0.1],
	// 	['square',0.5,880,400, 'sawtooth',200,20,10, 0.02,0.06,0.08,0.6,0.1, 'lowpass',1000,20,10,,, 1, 0.1]
	// ], //playSound,

	// Audio = () => {
		
	// 	let AudioCtx = window.AudioContext || window.webkitAudioContext,
	// 		// lRampTo = 
	// 		aCtx = new AudioCtx(),
	// 		bufferSize = 4096,
	// 		pinkNoise = (function() {
	// 	        var b0, b1, b2, b3, b4, b5, b6;
	// 	        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
	// 	        var node = aCtx.createScriptProcessor(bufferSize, 1, 1);
	// 	        node.onaudioprocess = function(e) {
	// 	            var output = e.outputBuffer.getChannelData(0);
	// 	            for (var i = 0; i < bufferSize; i++) {
	// 	                var white = Math.random() * 2 - 1;
	// 	                b0 = 0.99886 * b0 + white * 0.0555179;
	// 	                b1 = 0.99332 * b1 + white * 0.0750759;
	// 	                b2 = 0.96900 * b2 + white * 0.1538520;
	// 	                b3 = 0.86650 * b3 + white * 0.3104856;
	// 	                b4 = 0.55000 * b4 + white * 0.5329522;
	// 	                b5 = -0.7616 * b5 - white * 0.0168980;
	// 	                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
	// 	                output[i] *= 0.11; // (roughly) compensate for gain
	// 	                b6 = white * 0.115926;
	// 	            }
	// 	        }
	// 	        return node;
	// 	    })(),
	// 	    bitCrusher = (function() {
	// 	        let node = aCtx.createScriptProcessor(bufferSize, 1, 1);
	// 	        node.bits = 1; // between 1 and 16
	// 	        node.normfreq = 0.01; // between 0.0 and 1.0
	// 	        let step = Math.pow(1/2, node.bits),
	// 	            phaser = 0,
	// 	            last = 0;
	// 	        node.onaudioprocess = function(e) {
	// 	            let i,
	// 	                input = e.inputBuffer.getChannelData(0),
	// 	                output = e.outputBuffer.getChannelData(0);
	// 	            for (i = 0; i < bufferSize; i++) {
	// 	                phaser += node.normfreq;
	// 	                if (phaser >= 1.0) {
	// 	                    phaser -= 1.0;
	// 	                    last = step * Math.floor(input[i] / step + 0.5);
	// 	                }
	// 	                output[i] = last;
	// 	            }
	// 	        };
	// 	        return node;
	// 	    })(),
	// 	    distortion = (function() {
	// 	        // create the waveshaper
	// 	        var node = aCtx.createWaveShaper();
	// 	        // node.amount
	// 	        Object.defineProperty(node, 'amount', { set: amt => { node.curve = makeDistortionCurve(amt)}});
	// 	        node.curve = makeDistortionCurve(1);
		         
	// 	        // our distortion curve function
	// 	        function makeDistortionCurve(amount) {
	// 	            var k = typeof amount === 'number' ? amount : 50,
	// 	                n_samples = 44100,
	// 	                curve = new Float32Array(n_samples),
	// 	                deg = Math.PI / 180,
	// 	                i = 0,
	// 	                x;
	// 	            for ( ; i < n_samples; ++i ) {
	// 	                x = i * 2 / n_samples - 1;
	// 	                curve[i] = ( 3 + k ) * x * 20 * deg / 
	// 	                    (Math.PI + k * Math.abs(x));
	// 	            }
	// 	            return curve;
	// 	        }

	// 	        return node;
	// 	    })()

	// 	function playNewSound(o) {
	// 	    let gen = o[0] === 'noise' ? pinkNoise : createOsc(),
	// 	        g = aCtx.createGain(),
	// 	        fm = createOsc(),
	// 	        fmG = aCtx.createGain(),
	// 	        cT = aCtx.currentTime,
	// 	        a = o[8],
	// 	        d = o[9],
	// 	        s = o[10],
	// 	        sV = o[11],
	// 	        r = o[12],
	// 	        bqf,dst,btC;
	// 	    gen.type = o[0];
	// 	    g.gain.value = o[1];
	// 	    if(o[0] !== 'noise') {
	// 		    gen.frequency.value = o[2] || 440;
	// 		    if(o[3]) gen.frequency.linearRampToValueAtTime(o[3],cT+a+d+s);
	// 		}

	// 		if(o[4]) {
	// 		    fm.type = o[4];
	// 		    fm.frequency.value = o[5] || 0;
	// 		    if(o[6]) {
	// 		        fm.frequency.linearRampToValueAtTime(o[6],cT+a+d+s);
	// 		        fm.start(0);
	// 		        fm.stop(cT+a+d+s+r)
	// 		    }
	// 		    fmG.gain.value = o[7] || 30;
	// 		}

	// 	    if(o[13]) {

	// 	        bqf = aCtx.createBiquadFilter();
	// 	        bqf.type = o[13];
	// 	        bqf.frequency.value = o[14];
	// 	        if(o[15]) bqf.frequency.linearRampToValueAtTime(o[15],cT+a+d+s);
	// 	        bqf.Q.value = o[16];
	// 	        bqf.gain.value = o[17] || 1;
	// 	    }

	// 	    if(o[18]) {
	// 	        dst = aCtx.createWaveShaper();
	// 	        dst.curve = makeDistortionCurve(o[18]);
	// 	    }

	// 	    if(o[20]) btC = bitCrusher; 

	// 		if(o[0] !== 'noise') {
	// 			if(o[4]) {
	// 			    fm.connect(fmG);
	// 			    fmG.connect(gen.frequency);
	// 			}
	// 		    gen.start(0);
	// 		    gen.stop(cT+a+d+s+r);
	// 		}
		    
	// 	    gen.connect(dst || btC || bqf || g);
	// 	    if(dst) dst.connect(btC || bqf || g);
	// 	    if(btC) btC.connect(bqf || g);
	// 	    if(bqf) bqf.connect(g);
		    
	// 	    g.connect(aCtx.destination);
	// 	    g.gain.setValueAtTime(0,cT);
	// 	    g.gain.linearRampToValueAtTime(1,cT+a);
	// 	    g.gain.linearRampToValueAtTime(sV,cT+a+d);
	// 	    g.gain.linearRampToValueAtTime(sV,cT+a+d+s);
	// 	    g.gain.linearRampToValueAtTime(0,cT+a+d+s+r);
	// 	}

	// 	function createOsc() {
	// 	    return aCtx.createOscillator();
	// 	}
	// 	function makeDistortionCurve(amount) {
	// 	    var k = typeof amount === 'number' ? amount : 50,
	// 	        n_samples = 44100,
	// 	        curve = new Float32Array(n_samples),
	// 	        deg = Math.PI / 180,
	// 	        i = 0,
	// 	        x;
	// 	    for ( ; i < n_samples; ++i ) {
	// 	        x = i * 2 / n_samples - 1;
	// 	        curve[i] = ( 3 + k ) * x * 20 * deg / 
	// 	            (Math.PI + k * Math.abs(x));
	// 	    }
	// 	    return curve;
	// 	}

	// 	playNewSound(sounds[1])
	
	// 	// playNewSound(['square',0.2,880 + (Math.random()*150-75),500, 'sawtooth',300,100,30, 0.02,0.06,0.08,0.6,0.1, 'lowpass',800,200,1]);
	// 	// game.sfx = [
	// 	// 	function() {
	// 	// 		playNewSound()
	// 	// 	}
	// 	// ]
	// 	if(mobile) {
	// 		playSound = i => {
	// 			switch(i) {
	// 				case 0:
	// 					playNewSound(['sawtooth',0.2,1760 + (Math.random()*150-75),, ,,,, 0.02,0.06,0.08,0.2,0.9, 'lowpass',600,,100]);
	// 				break;
	// 				case 1:
	// 					playNewSound(['noise',1,,, ,,,, 0.01,0.02,0.4,0.8,0.1,  ,,,,,  , 8,1]);
	// 				break;
	// 				case 2:
	// 				case 3:
	// 				break;
	// 			}
	// 		}
	// 	} else {
	// 		playSound = i => {
	// 			switch(i) {
	// 				case 0:
	// 					playNewSound(['square',0.2,1760 + (Math.random()*150-75),500, 'sawtooth',300,100,30, 0.02,0.06,0.08,0.4,0.9, 'lowpass',600,200,10]);
	// 				break;
	// 				case 1:
	// 					playNewSound(['noise',1,,, ,,,, 0.01,0.02,0.4,0.8,0.1,  ,,,,,  , 8,1]);
	// 				break;
	// 				case 2:
	// 				case 3:
						
	// 				break;
	// 			}
	// 		}
	// 	}


	// }

	

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

	



















var server = typeof window !== "object";
/**
 * SfxrParams
 *
 * Copyright 2010 Thomas Vian
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Thomas Vian
 */
/** @constructor */
if(!server) {
  function SfxrParams() {
    //--------------------------------------------------------------------------
    //
    //  Settings String Methods
    //
    //--------------------------------------------------------------------------

    /**
     * Parses a settings array into the parameters
     * @param array Array of the settings values, where elements 0 - 23 are
     *                a: waveType
     *                b: attackTime
     *                c: sustainTime
     *                d: sustainPunch
     *                e: decayTime
     *                f: startFrequency
     *                g: minFrequency
     *                h: slide
     *                i: deltaSlide
     *                j: vibratoDepth
     *                k: vibratoSpeed
     *                l: changeAmount
     *                m: changeSpeed
     *                n: squareDuty
     *                o: dutySweep
     *                p: repeatSpeed
     *                q: phaserOffset
     *                r: phaserSweep
     *                s: lpFilterCutoff
     *                t: lpFilterCutoffSweep
     *                u: lpFilterResonance
     *                v: hpFilterCutoff
     *                w: hpFilterCutoffSweep
     *                x: masterVolume
     * @return If the string successfully parsed
     */
    this.setSettings = function(values)
    {
      for ( var i = 0; i < 24; i++ )
      {
        this[String.fromCharCode( 97 + i )] = values[i] || 0;
      }

      // I moved this here from the reset(true) function
      if (this['c'] < .01) {
        this['c'] = .01;
      }

      var totalTime = this['b'] + this['c'] + this['e'];
      if (totalTime < .18) {
        var multiplier = .18 / totalTime;
        this['b']  *= multiplier;
        this['c'] *= multiplier;
        this['e']   *= multiplier;
      }
    }
  }

  /**
   * SfxrSynth
   *
   * Copyright 2010 Thomas Vian
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * @author Thomas Vian
   */
  /** @constructor */
  function SfxrSynth() {
    // All variables are kept alive through function closures

    //--------------------------------------------------------------------------
    //
    //  Sound Parameters
    //
    //--------------------------------------------------------------------------

    this._params = new SfxrParams();  // Params instance

    //--------------------------------------------------------------------------
    //
    //  Synth Variables
    //
    //--------------------------------------------------------------------------

    var _envLn0, // Length of the attack stage
        _envLn1, // Length of the sustain stage
        _envLn2, // Length of the decay stage

        _prd,          // Period of the wave
        _mxPrd,       // Maximum period before sound stops (from minFrequency)

        _slide,           // Note slide
        _dSld,      // Change in slide

        _chngAmt,    // Amount to change the note by
        _chngTm,      // Counter for the note change
        _chngLmt,     // Once the time reaches this limit, the note changes

        _sqDty,      // Offset of center switching point in the square wave
        _dtySwp;       // Amount to change the duty by

    //--------------------------------------------------------------------------
    //
    //  Synth Methods
    //
    //--------------------------------------------------------------------------

    /**
     * Resets the runing variables from the params
     * Used once at the start (total reset) and for the repeat effect (partial reset)
     */
    this.reset = function() {
      // Shorter reference
      var p = this._params;

      _prd       = 100 / (p['f'] * p['f'] + .001);
      _mxPrd    = 100 / (p['g']   * p['g']   + .001);

      _slide        = 1 - p['h'] * p['h'] * p['h'] * .01;
      _dSld   = -p['i'] * p['i'] * p['i'] * .000001;

      if (!p['a']) {
        _sqDty = .5 - p['n'] / 2;
        _dtySwp  = -p['o'] * .00005;
      }

      _chngAmt =  1 + p['l'] * p['l'] * (p['l'] > 0 ? -.9 : 10);
      _chngTm   = 0;
      _chngLmt  = p['m'] == 1 ? 0 : (1 - p['m']) * (1 - p['m']) * 20000 + 32;
    }

    // I split the reset() function into two functions for better readability
    this.totalReset = function() {
      this.reset();

      // Shorter reference
      var p = this._params;

      // Calculating the length is all that remained here, everything else moved somewhere
      _envLn0 = p['b']  * p['b']  * 100000;
      _envLn1 = p['c'] * p['c'] * 100000;
      _envLn2 = p['e']   * p['e']   * 100000 + 12;
      // Full length of the volume envelop (and therefore sound)
      // Make sure the length can be divided by 3 so we will not need the padding "==" after base64 encode
      return ((_envLn0 + _envLn1 + _envLn2) / 3 | 0) * 3;
    }

    /**
     * Writes the wave to the supplied buffer ByteArray
     * @param buffer A ByteArray to write the wave to
     * @return If the wave is finished
     */
    this.synthWave = function(buffer, length) {
      // Shorter reference
      var p = this._params;

      // If the filters are active
      var _filters = p['s'] != 1 || p['v'],
          // Cutoff multiplier which adjusts the amount the wave position can move
          _hpFC = p['v'] * p['v'] * .1,
          // Speed of the high-pass cutoff multiplier
          _hpFDC = 1 + p['w'] * .0003,
          // Cutoff multiplier which adjusts the amount the wave position can move
          _lpFC = p['s'] * p['s'] * p['s'] * .1,
          // Speed of the low-pass cutoff multiplier
          _lpFDC = 1 + p['t'] * .0001,
          // If the low pass filter is active
          _lpOn = p['s'] != 1,
          // masterVolume * masterVolume (for quick calculations)
          _mVol = p['x'] * p['x'],
          // Minimum frequency before stopping
          _mnFrq = p['g'],
          // If the phaser is active
          _psr = p['q'] || p['r'],
          // Change in phase offset
          _psrDeltaOffset = p['r'] * p['r'] * p['r'] * .2,
          // Phase offset for phaser effect
          _psrOffset = p['q'] * p['q'] * (p['q'] < 0 ? -1020 : 1020),
          // Once the time reaches this limit, some of the    iables are reset
          _repeatLimit = p['p'] ? ((1 - p['p']) * (1 - p['p']) * 20000 | 0) + 32 : 0,
          // The punch factor (louder at begining of sustain)
          _sustainPunch = p['d'],
          // Amount to change the period of the wave by at the peak of the vibrato wave
          _vAmp = p['j'] / 2,
          // Speed at which the vibrato phase moves
          _vibratoSpeed = p['k'] * p['k'] * .01,
          // The type of wave to generate
          _waveType = p['a'];

      var _envLn      = _envLn0,     // Length of the current envelope stage
          _envOvrLn0 = 1 / _envLn0, // (for quick calculations)
          _envOvrLn1 = 1 / _envLn1, // (for quick calculations)
          _envOvrLn2 = 1 / _envLn2; // (for quick calculations)

      // Damping muliplier which restricts how fast the wave position can move
      var _lpDmp = 5 / (1 + p['u'] * p['u'] * 20) * (.01 + _lpFC);
      if (_lpDmp > .8) {
        _lpDmp = .8;
      }
      _lpDmp = 1 - _lpDmp;

      var _finished = false,     // If the sound has finished
          _envelopeStage    = 0, // Current stage of the envelope (attack, sustain, decay, end)
          _envTm     = 0, // Current time through current enelope stage
          _envVol   = 0, // Current volume of the envelope
          _hpFilterPos      = 0, // Adjusted wave position after high-pass filter
          _lpDPos = 0, // Change in low-pass wave position, as allowed by the cutoff and damping
          _lpOldPos,       // Previous low-pass wave position
          _lpPos      = 0, // Adjusted wave position after low-pass filter
          _prdTemp,           // Period modified by vibrato
          _phase            = 0, // Phase through the wave
          _psrInt,            // Integer phaser offset, for bit maths
          _psrPos        = 0, // Position through the phaser buffer
          _pos,                  // Phase expresed as a Number from 0-1, used for fast sin approx
          _rTm       = 0, // Counter for the repeats
          _sample,               // Sub-sample calculated 8 times per actual sample, averaged out to get the super sample
          _sSmpl,          // Actual sample writen to the wave
          _vPhs     = 0; // Phase through the vibrato sine wave

      // Buffer of wave values used to create the out of phase second wave
      var _psrBfr = new Array(1024),
          // Buffer of random values used to generate noise
          _nsBfr  = new Array(32);
      for (var i = _psrBfr.length; i--; ) {
        _psrBfr[i] = 0;
      }
      for (var i = _nsBfr.length; i--; ) {
        _nsBfr[i] = Math.random() * 2 - 1;
      }

      for (var i = 0; i < length; i++) {
        if (_finished) {
          return i;
        }

        // Repeats every _repeatLimit times, partially resetting the sound parameters
        if (_repeatLimit) {
          if (++_rTm >= _repeatLimit) {
            _rTm = 0;
            this.reset();
          }
        }

        // If _chngLmt is reached, shifts the pitch
        if (_chngLmt) {
          if (++_chngTm >= _chngLmt) {
            _chngLmt = 0;
            _prd *= _chngAmt;
          }
        }

        // Acccelerate and apply slide
        _slide += _dSld;
        _prd *= _slide;

        // Checks for frequency getting too low, and stops the sound if a minFrequency was set
        if (_prd > _mxPrd) {
          _prd = _mxPrd;
          if (_mnFrq > 0) {
            _finished = true;
          }
        }

        _prdTemp = _prd;

        // Applies the vibrato effect
        if (_vAmp > 0) {
          _vPhs += _vibratoSpeed;
          _prdTemp *= 1 + Math.sin(_vPhs) * _vAmp;
        }

        _prdTemp |= 0;
        if (_prdTemp < 8) {
          _prdTemp = 8;
        }

        // Sweeps the square duty
        if (!_waveType) {
          _sqDty += _dtySwp;
          if (_sqDty < 0) {
            _sqDty = 0;
          } else if (_sqDty > .5) {
            _sqDty = .5;
          }
        }

        // Moves through the different stages of the volume envelope
        if (++_envTm > _envLn) {
          _envTm = 0;

          switch (++_envelopeStage)  {
            case 1:
              _envLn = _envLn1;
              break;
            case 2:
              _envLn = _envLn2;
          }
        }

        // Sets the volume based on the position in the envelope
        switch (_envelopeStage) {
          case 0:
            _envVol = _envTm * _envOvrLn0;
            break;
          case 1:
            _envVol = 1 + (1 - _envTm * _envOvrLn1) * 2 * _sustainPunch;
            break;
          case 2:
            _envVol = 1 - _envTm * _envOvrLn2;
            break;
          case 3:
            _envVol = 0;
            _finished = true;
        }

        // Moves the phaser offset
        if (_psr) {
          _psrOffset += _psrDeltaOffset;
          _psrInt = _psrOffset | 0;
          if (_psrInt < 0) {
            _psrInt = -_psrInt;
          } else if (_psrInt > 1023) {
            _psrInt = 1023;
          }
        }

        // Moves the high-pass filter cutoff
        if (_filters && _hpFDC) {
          _hpFC *= _hpFDC;
          if (_hpFC < .00001) {
            _hpFC = .00001;
          } else if (_hpFC > .1) {
            _hpFC = .1;
          }
        }

        _sSmpl = 0;
        for (var j = 8; j--; ) {
          // Cycles through the period
          _phase++;
          if (_phase >= _prdTemp) {
            _phase %= _prdTemp;

            // Generates new random noise for this period
            if (_waveType == 3) {
              for (var n = _nsBfr.length; n--; ) {
                _nsBfr[n] = Math.random() * 2 - 1;
              }
            }
          }

          // Gets the sample from the oscillator
          switch (_waveType) {
            case 0: // Square wave
              _sample = ((_phase / _prdTemp) < _sqDty) ? .5 : -.5;
              break;
            case 1: // Saw wave
              _sample = 1 - _phase / _prdTemp * 2;
              break;
            case 2: // Sine wave (fast and accurate approx)
              _pos = _phase / _prdTemp;
              _pos = (_pos > .5 ? _pos - 1 : _pos) * 6.28318531;
              _sample = 1.27323954 * _pos + .405284735 * _pos * _pos * (_pos < 0 ? 1 : -1);
              _sample = .225 * ((_sample < 0 ? -1 : 1) * _sample * _sample  - _sample) + _sample;
              break;
            case 3: // Noise
              _sample = _nsBfr[Math.abs(_phase * 32 / _prdTemp | 0)];
          }

          // Applies the low and high pass filters
          if (_filters) {
            _lpOldPos = _lpPos;
            _lpFC *= _lpFDC;
            if (_lpFC < 0) {
              _lpFC = 0;
            } else if (_lpFC > .1) {
              _lpFC = .1;
            }

            if (_lpOn) {
              _lpDPos += (_sample - _lpPos) * _lpFC;
              _lpDPos *= _lpDmp;
            } else {
              _lpPos = _sample;
              _lpDPos = 0;
            }

            _lpPos += _lpDPos;

            _hpFilterPos += _lpPos - _lpOldPos;
            _hpFilterPos *= 1 - _hpFC;
            _sample = _hpFilterPos;
          }

          // Applies the phaser effect
          if (_psr) {
            _psrBfr[_psrPos % 1024] = _sample;
            _sample += _psrBfr[(_psrPos - _psrInt + 1024) % 1024];
            _psrPos++;
          }

          _sSmpl += _sample;
        }

        // Averages out the super samples and applies volumes
        _sSmpl *= .125 * _envVol * _mVol;

        // Clipping if too loud
        buffer[i] = _sSmpl >= 1 ? 32767 : _sSmpl <= -1 ? -32768 : _sSmpl * 32767 | 0;
      }

      return length;
    }
  }

  // Adapted from http://codebase.es/riffwave/
  var synth = new SfxrSynth();
  // Export for the Closure Compiler
  window['jsfxr'] = function(settings) {
    // Initialize SfxrParams
    synth._params.setSettings(settings);
    // Synthesize Wave
    var envelopeFullLength = synth.totalReset();
    var data = new Uint8Array(((envelopeFullLength + 1) / 2 | 0) * 4 + 44);
    var used = synth.synthWave(new Uint16Array(data.buffer, 44), envelopeFullLength) * 2;
    var dv = new Uint32Array(data.buffer, 0, 44);
    // Initialize header
    dv[0] = 0x46464952; // "RIFF"
    dv[1] = used + 36;  // put total size here
    dv[2] = 0x45564157; // "WAVE"
    dv[3] = 0x20746D66; // "fmt "
    dv[4] = 0x00000010; // size of the following
    dv[5] = 0x00010001; // Mono: 1 channel, PCM format
    dv[6] = 0x0000AC44; // 44,100 samples per second
    dv[7] = 0x00015888; // byte rate: two bytes per sample
    dv[8] = 0x00100002; // 16 bits per sample, aligned on every two bytes
    dv[9] = 0x61746164; // "data"
    dv[10] = used;      // put number of samples here

    return data.buffer;
  }


  /**
   * Sound module
   */
  var Sfx = (function () {

      var //container, //Mute switch
          context, //AudioContext
          master, //Master volme
          buffers = {}, //BufferSources
          muted = true; //mute switch

      /**
       * Create BufferSource
       * @param {string} name
       * @param {array} config
       */
      function createSource(name, config) {
          var data = jsfxr(config);
          context.decodeAudioData(data, function (buffer) {
              buffers[name] = buffer;
          });
      }

      return {

          /**
           * Init module
           */
          init: function () {
              // container = $("#sfx");
              context = new AudioContext();
              master = context.createGain();
              master.connect(context.destination);
             
				createSource('L1',[0,,0.3,,0.15,0.66,0.2,-0.28,,,,,,0.46,-0.065,,,,1,,,,,0.5]);
				createSource('E1',[3,,0.4,0.47,0.1,0.3,,-0.27,,0.01,,-0.7,0.69,0.004,0.002,,-0.098,-0.08,1,,,,-0.016,0.5]);
				createSource('E2',[3,0.03,0.25,0.55,0.22,0.06,,-0.05,0.035,,,-0.05,0.006,0.04,0.04,0.1,-0.13,-0.29,1,-0.012,0.0025,0.008,0.003,0.5]);
				createSource('win',[0,0.05,0.35,0.03,0.25,0.30,,0.19,-0.04,0.25,0.4,0.03,0.034,0.026,,0.05,,0.043,0.97,0.03,0.06,0.01,0.005,0.5]);
              Sfx.mute();
          },

          /**
           * Play sound
           * @param {string} name
           * @param {number} volume
           * @param {boolean} loop
           * @return {AudioSource}
           */
          play: function (name, volume, loop) {
            // console.log("playing sound:",name)
              var source = null,
                  gain;
              if (name in buffers) {
                  gain = context.createGain();
                  gain.gain.value = volume || 1;
                  gain.connect(master);
                  source = context.createBufferSource();
                  source.loop = loop || false;
                  source.buffer = buffers[name];
                  source.connect(gain);
                  source.start(0);
              }
              return source;
          },

          /**
           * Switch mute
           */
          mute: function () {
              muted = !muted;
              console.log("muted = ",muted)
              master.gain.value = muted ? 0 : 2;
              // attr(container, "class", muted ? "off" : "");

          }
      };

  })();



  window.onload = function () {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      if (window.AudioContext) {
          Sfx.init();
      }
      // Sfx.mute();
      setTimeout(function() {
        Sfx.play("win",0.5,false);
      },100);
      // setTimeout(function() {
      //   Sfx.play("ding",0.4,false);
      // },370);
      
      console.log(Sfx);
      
  }



}