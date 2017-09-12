"use strict";

(function () {
let sz = 512,
    colours = [
        '#639bff',
        '#306082',
        '#3f3f74',
        '#222034',

        '#d77bba',
        '#76428a',
        //'#3f3f74',
        '#45283c',

        '#99e550',
        '#6abe30',
//9
        '#d95763',
        '#ac3232',
//11
        '#cbdbfc',
        '#595652',
//13
        '#fbf236',
        '#323c39',
        '#8a6430',
        '#8f974a',
        // '#222034',

//17
        '#ffffff',
        // '#fbf236', 13
        '#df7126',
        // '#ac3232', 10
        // '#323c39', 14
        // '#222034', 3
//19
        '#847e87',
        // '#fbf236', 13
        '#696a6a',
        // '#595652', 12
        // '#323c39', 14

//21
        // '#847e87', 19
        // '#595652', 12
        // '#323c39', 14






    ],
    hexToRGB = function(i) {
        let j,
            r = [],
            c = colours[i];
        // console.log(c)
        for(j=0; j<3; j++) {
            // console.log(i)
            r.push(parseInt(c.substr(1+2*j,2),16));
        }
        return r
    },
    graphs = [
        //  MAIN BODY
        [[1,2,2]],

        //  LEGS
        [[1, ,2]],

        [[2]],

        [[1]],
        //  4
        [[ ,1, , ,2],
         [1, , , ,2]],
        //  5
        [[ ,1,2],
         [2,1, ]],
        //  6
        [[1, , ,2,0],
         [1, , , ,2]],

        [[1,2,0],
         [ ,2,1]],

         //  EYES
        //8  EYES DOWN
        [[3, ,3]],
        //9  EYES DOWN/LEFT
        [[ ,3,3]],
        //10  EYES LEFT
        [[ , ,3]],
        //11  EYES RIGHT
        [[3, , ]],
        //12  EYES DOWN/RIGHT
        [[3,3, ]],

        //13  GUN DOWN
        [[2],
         [1],
         [1]],    
        //11  GUN DOWN/RIGHT
        [[2,1, ,0],
         [ ,2,1, ],
         [ , ,2,1]],    
        //12  GUN RIGHT
        [[2,1,1,1],
         [ ,2,2, ]],    
        //16  GUN UP/RIGHT
        [[ ,1],
         [1,2],
         [2, ]],    
        //17  GUN UP
        [[1],
         [1],
         [2]],    
        //18  GUN UP/LEFT
        [[1,0],
         [2,1]],    
        //19  GUN LEFT
        [[1,1],
         [ ,2]],    
        //20  GUN DOWN/LEFT
        [[ ,1],
         [1,2]],

        //21  GUN2 DOWN
        [[3],
         [3],
         [1],
         [1],
         [1]],
        //22  GUN2 DOWN/RIGHT
        [[2,3, , ,0],
         [2,1,3, , ],
         [ ,2,1,3, ],
         [ , ,2,1, ],
         [ , , , ,1]],
        //23  GUN2 RIGHT
        [[ ,3,3,3, ,0],
         [2,1,1,1,1,1],
         [ ,2,2,2, , ]],
        //22  GUN2 UP/RIGHT
        [[ , , , ,1],
         [ , ,3,1, ],
         [ ,3,1,2, ],
         [ ,1,2, , ],
         [2,2, , , ]],
        //21  GUN2 UP
        [[1],
         [1],
         [1],
         [3],
         [3],
         [2]],
        //26  GUN2 UP/LEFT
        [[1, , , ,0],
         [ ,1,3, , ],
         [ ,2,1,3, ],
         [ , ,2,1, ],
         [ , , ,2,2]],
        //27  GUN2 LEFT
        [[ , ,3,3,3,0],
         [1,1,1,1,1,2],
         [ , ,2,2,2, ]],
        //28  GUN2 DOWN/LEFT
        [[ , , ,3,2],
         [ , ,3,1, ],
         [ ,3,1,2, ],
         [ ,1,2, , ],
         [1, , , , ]],

        //29  CARD
        [[1, , , ,0],
         [2,1, , , ],
         [4,3,1, , ],
         [4,4,3,1, ],
         [4,4,4,3,1]],
        //30  CARD
        [[5],
         [3],
         [1]],
        //31  CARD
        [[4,3,1],
         [3,3,1],
         [1,1, ]],
        //32  CARD
        [[1,2],
         [1, ]],


         //33  TOWER/ FIREBALL
         [[0,1,0],
          [1,1,1],
          [0,1,0]],
        //34
        [[1,2]],
        //35

        [[0,3,3,0],
         [3,2,3,4],
         [3,3,5,4],
         [0,4,4,0]]
        

            

    ],
    o1 = [[16,-1,,,2,16]],
    o2 = [[0,0,8,32,2,32]],
    commandSets = [
        //  MARK 1 BODY
        [[0,[[6,2,3],[6,6,4]],[[0,16,7,16],[16,-1,8,16,2,16]],[2,3]]],
        //  MINI BOMB BODY
        [[0,[[6,7,3]],[[0,16,7,16],[16,-1,8,16,2,16]],[2]]],
        //  LEGS
        [
            [1,[[6,10,2]],[[0,16,7,16]]],
            [2,[[24,9,2],[40,73,2]]],
            [3,[[38,9,2],[22,73,2]]],
            [4,[[21,25],[21,41],[37,57]]],
            [5,[[38,25],[38,41],[22,57]]],
            [6,[[21,89],[21,105],[37,121]]],
            [7,[[38,89],[38,105],[22,121]]]
        ],
        //  3  -  EYES
        [
            [8,[[6,3]],o1],
            [9,[[6,19]],o1],
            [10,[[6,35]],o1],
            [11,[[6,99]],o1],
            [12,[[6,115]],o1]

        ],
        //  4  -  GUN1
        [
            [13,[[5,6]],o1],
            [14,[[7,22]],o1],
            [15,[[8,38]],o1],
            [16,[[9,52]],o1],
            [17,[[9,68]],o1],
            [18,[[5,84]],o1],
            [19,[[4,102]],o1],
            [20,[[4,118]],o1],
        ],
        //  5  -  GUN2
        [
            [21,[[5,4]],o1],
            [22,[[7,20]],o1],
            [23,[[8,36]],o1],
            [24,[[8,49]],o1],
            [25,[[9,65]],o1],
            [26,[[2,81]],o1],
            [27,[[1,100]],o1],
            [28,[[2,117]],o1],
        ],
        //  6  -  CARDS
        [
            [29,[[2,1,,,25]],o2],
            [30,[[2,3,26,,21]],o2],
            [31,[[23,6,23,,6]],o2],
            [32,[[1,2,27]],o2]
        ],
        //  7  -  MINI TOWER
        [
            [33,[[4,1,2]],[[0,3]],,[,0]],
            [33,[[5,1,2,,5]],[[0,3]],,[,1]],
            [33,[[6,2,4,,3]],,,[,2]],
            [3,[[5,4,,,6,]],,,[,9]],
            [3,[[6,4,,,4,]],,,[,10]],
            [0,[[6,8,15]]],
            [1,[[7,8,15]],,,[,1,1]],
        ],
        //  8  -  MEGA TOWER
        [
            [33,[[1,1,3]],[[0,5]],,[,0]],
            [33,[[2,1,3,,11]],[[0,5]],,[,1]],
            [33,[[4,2,7,,8]],,,[,2]],
            [3,[[2,5,2,,12,]],,,[,9]],
            [3,[[3,5,2,,10,]],,,[,10]],
            [0,[[5,11,20]]],
            [34,[[7,11,20,,3,1]],,,[,2,1]],
        ],
        //  9  -  EXPLOSION
        [
            [33,[[5,5,4,,4]],,,[,3]],
            [33,[[5,21,4,,4]]],
            [33,[[5,37,4,,4]],,,[,13]],
            [1,[[7,39,2,,2]]],

            [33,[[5,52,5,,4],[8,51,3,,3],[6,55,3,,2]],,,[,10]],
            [33,[[5,53,2,,3],[8,52,2,,3],[6,56,1,,3]],,,[,18]],
            [16,[[8,53,,,3],[7,54,3,,2]],,,[0,13,18]],

            [33,[[4,69,5,,2],[5,68,1]],,,[,10]],
            [33,[[6,68,,,4],[5,69,5]],,,[,18]],
            [5,[[6,69]],,,[,13,13]],
            [17,[[6,71]],,,[,13,13]],

            [33,[[4,85,5],[5,84,,,5]],,,[,14]],
            [33,[[5,86,4],[6,85,,,4]],,,[,18,14]],

            [33,[[4,101,4],[5,100,,,4]],,,[,14]],
            [33,[[4,118],[7,116]],,,[,14]],
        ],
        //  10  -  CRATERS
        [
            [33,[[3,2,2,,2],[10,2,2,,2],[3,10,,,2],[10,10,,,3]],,,[,19]],
            [33,[[1,2,2,,2],[9,2,2,,2],[2,10,,3],[9,10,]],,,[,14]],
            [33,[[2,2,2,,2],[10,2,2,,1],[3,10],[10,10,,,2]],,,[,12]]
        ]
    ]

let px;
function executeCommandSet(cs,cn,pl,X=0,Y=0) {
    pl = pl || [0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
    cs = commandSets[cs];
    px = cn.ctx.getImageData(0,0,sz,sz);
    let g,i,j,p;
    
    cs.forEach( s => {
        if(s[4]) p = s[4];
        else p = pl;
        s[1].forEach( c => {
            g = graphs[s[0]];
            executeCommand(g,cn,p,c,X,Y);
            if(s[2]) {
                s[2].forEach( d => {
                    for(i=0; i<(d[2]||1); i++) {
                        for(j=0; j<(d[4]||1); j++) {
                            executeCommand(g,cn,p,c,d[0]+(d[5]||0)*j+X,d[1]+(d[3]||0)*i+Y);
                        }
                    }
                })
            }
        });
        if(s[3]) { s[3].forEach( (s3,i) => executeCommandSet(s[3][i],cn,pl,X,Y)) }
        // if(m) executeCommandSet(m,cn,pl,X,Y)
    })
    
    
}
function executeCommand(g,cn,pl,c,X=0,Y=0) {
    graph(g,cn,pl,c[0]+X,c[1]+Y,c[2],c[3],c[4],c[5]);
}



//  GRAPH
//  DRAWS A GRAPH TO A CANVAS
//  g = graph (2 dimensional array of colour indexes)
//  c = canvas to draw on
//  p = pallette
//  X
//  Y
function graph(g,cnv,p,X,Y,V=1,vO=1,H=1,hO=1) {
    // vO = vO || g.length;
    // hO = hO || g[0].length;
    // console.log(V,H)
    //  CANVAS CONTEXT
    let ctx = cnv.ctx,
    //  WIDTH OF CANVAS
        W = cnv.width,
    //  PIXEL DATA
        // px = ctx.getImageData(0,0,W,cnv.height),
    //  INDICES, COLOUR OBJECT, LOCATION
        y, x, c, l,
        v,h;
    // console.log(g)
    for(v=0; v<V; v++) {
        for(h=0; h<H; h++) {
            for(y=0; y<g.length; y++) {
                for(x=0; x<g[y].length; x++) {
                    //  IF THE GRAPH SAYS ZERO WE DON'T CHANGE THAT PIXEL
                    if(g[y][x]) {
                        //  GET COLOUR FROM GRAPH
                        c = hexToRGB(p[g[y][x]]);
                        // console.log(h,hO)
                        //  GET LOCATION FOR ONE DIMENSIONAL ARRAY
                        l = (X+x+h*hO)*4 + (Y+y+v*vO)*W*4;
                        //  SET PIXEL DATA
                        px.data[l] = c[0];
                        px.data[l+1] = c[1];
                        px.data[l+2] = c[2];
                        px.data[l+3] = 255;
                    }
                }
            }
        }
    }
    ctx.putImageData(px,0,0);
}




function copy(cnv,sx,sy,sw,sh,x,y,w,h,e,V=0,vOff,H=0,hOff) {
    let i,
        ctx = cnv.ctx,
        b = Cnv(w,h),  //  BUFFER
        c = b.ctx;     //  BUFFER CONTEXT
    // w = w || sw;
    // h = h || sh;
    c.imageSmoothingEnabled = false;

    //  SAVE AREA TO BUFFER
    c.drawImage(cnv,sx,sy,sw,sh,0,0,sw,sh);
    //  CLEAR IF NECESSART
    if(e) ctx.clearRect(sx,sy,sw,sh);
    ctx.drawImage(b,0,0,sw,sh,x,y,w,h);
    for(i=0; i<V; i++) 
        ctx.drawImage(b,0,0,sw,sh,x,y+(i+1)*(vOff||h),w,h);
    for(i=0; i<H; i++)
        ctx.drawImage(b,0,0,sw,sh,x+(i+1)*(hOff||w),y,w,h);

}








    let game = null,
        socket, //Socket.IO client
        btns; //Button elements;

    /**
     * Disable all btn
     */
    function disableButtons() {
        for (var i = 0; i < btns.length; i++) {
            btns[i].setAttribute("disabled", 'disabled');
        }
    }

    
    /**
     * Binde Socket.IO and btn events
     */
    function bind() {

        //  OPPONENT FOUND, TIME TO LOAD A NEW GAME
        socket.on('loadGame', function(pI) {
            newGame(false,JSON.parse(pI));
        });

        socket.on('begin', function(time) {
            game.start(time);
        });

        socket.on('confirmCard', function(data) {
            data = JSON.parse(data);

            game.confCard(data);

        });

        socket.on('state', function(st) {
            game.recState(st);
        });

        socket.on('gameOver', function() {
            game.gameOver();
        })


        
    }

    //  PRESS THE BATTLE BUTTON TO INITIATE A NEW GAME
    function battle() {
        disableButtons();
        socket.emit('battle');
    }

    function oneP() {
        newGame(true,[0,deckOrder()]);
        game.begin(Date.now() + 3000)
    }

    function makeSpriteSheet(C) {
        //  SNIPER
        executeCommandSet(0,C,[,0,2,7]);
        executeCommandSet(5,C,[,11,12,3]);

        //  MARK 1
        executeCommandSet(0,C,[,0,1,7],48);
        executeCommandSet(4,C,[,11,12],48);

        //  GRENADIER
        executeCommandSet(0,C,[,0,1,7],48,128);

        //  NINJA
        executeCommandSet(0,C,[,1,3,9],96);
        executeCommandSet(4,C,[,11,12],96);


        //  MINI BOT
        executeCommandSet(1,C,[,0,2,7],0,128);
        executeCommandSet(3,C,[,0,2,9],0,133);

        //  MINI TOWER
        executeCommandSet(7,C,[,0,2,1,3],144);
        

        //  MEGA TOWER
        executeCommandSet(8,C,[,0,1,2,3],160);

        //  GRENADE
        executeCommand(graphs[35],C,[,19,13,20,14,12],[182,134])

        //  MOVE PART OF TOWERS DOWN TO LOOK MORE ROUND
        copy(C,150,3,4,4,150,4,4,4);
        copy(C,163,3,10,4,163,4,10,4);
    }

    let i,S = assets.images,
        w = innerWidth,
        h = innerHeight,
        ls = w > h,
        L = ls?w:h,
        scl = ls ? w/680 : h/480;
    S[0] = Cnv(sz,sz);
    S[1] = Cnv(sz,sz);
    L *= 1.5;
    S[2] = Cnv(L,L);
    let ctx = S[2].ctx,
        stl = S[2].style;
    stl.position = 'fixed';
    stl.left = '0px';
    stl.top = '0px';
    stl.zIndex = -1;

    document.body.appendChild(S[2]);

    makeSpriteSheet(S[0]);
    colours[0] = colours[4];
    colours[1] = colours[5];
    colours[3] = colours[6];
    makeSpriteSheet(S[1]);

    //  EXPLOSION
    executeCommandSet(9,S[0],[,17,13,18,10,14,3],176);

    //  CRATERS
    executeCommandSet(10,S[0],[,17,13,18,10,14,3],176,144);
    
    //  CARD BACKS
    executeCommandSet(6,S[0],[,11,13,14,15,16],192);

    //  CARD 1,  MINI TOWER
    copy(S[0],144,0,16,24,198,5,16,24);

    //  SECOND CARD 1 MARK 1 SNIPER
    copy(S[0],16,96,16,16,230,9,16,16);
    //  CARD 3,  6 MINI BOMBS
    copy(S[0],0,128,16,16,192,34,16,16,0,1,6,2,5);
    copy(S[0],196,47,5,5,198,47,5,5,0,0,0,2)

    //  CARD 4,  3 MARK 1 GUNNERS
    copy(S[0],48,16,16,16,224,39,16,16,0,0,0,2,5);
    
    //  CARD 5,  2 NINJAS
    copy(S[0],112,16,16,16,195,72,16,16,0,0,0,1,6);

    //  CARD 6, GRENADIER
    copy(S[0],48,128,16,16,230,71,16,16);
    copy(S[0],176,128,16,16,227,71,16,16);

    //  CARD 7, 12 MINI BOMBS
    copy(S[0],198,40,16,12,197,100,16,12,0,1);

    //  CARD 8, 6 MARK 1 GUNNERS
    copy(S[0],48,16,16,16,224,100,16,16,0,0,0,2,5);
    copy(S[0],48,16,16,16,223,106,16,16,0,0,0,2,5);
    

    //  DRAW CARD COSTS
    S[0].ctx.fillStyle = colours[7];
    let x,y,j;
    vals.forEach((n,i) => {
        x = (i % 2 * 32) + 192,
        y = Math.floor(i/2) * 32
        for(j=0; j<n; j++)
            S[0].ctx.fillRect(x+24,y+5+j*3,5,2);
    })


    copy(S[0],0,0,sz,sz,0,0,2*sz,2*sz,1)
    copy(S[1],0,0,sz,sz,0,0,2*sz,2*sz,1)

    ctx.fillStyle = colours[20];
    ctx.fillRect(0,0,S[2].width,S[2].height);

    // ctx.fillStyle = colours[12];
    ctx.save();
    ctx.scale(scl,scl);
    for(i=0; i<40; i++) {
        ctx.drawImage(S[0],
            352 + Math.floor(Math.random()*2)*16,
            288 + Math.floor(Math.random()*2)*16,
            16,16,
            Math.random()*L/scl,Math.random()*L/scl,16,16);
    }
    // ctx.drawImage(S[0],0,0);
    ctx.restore();

    // ctx.save();
    //     // ctx.translate(-512,0)
    //     ctx.scale(2,2);

    //     ctx.fillStyle = colours[20];
    //     ctx.fillRect(0,0,sz,sz);
    //     for(let x=0; x<16; x++) {
    //         for(let y=0; y<16; y++) {
    //             ctx.fillStyle = colours[19]
    //             ctx.fillRect(x*32,y*32,16,16);
    //             ctx.fillRect((x+1)*32-16,y*32+16,16,16);
    //         }
    //     }
    //     ctx.drawImage(assets.images[0],0,0);
    //     ctx.restore();
    //  LOAD A NEW GAME
    function newGame(oneP,pI) {

        disableButtons();

        addEventListener('mousedown',controls,false);
        addEventListener('mouseup',controls,false);
        addEventListener('touchstart',controls,false);
        addEventListener('touchend',controls,false);

        
        game = new Game({
            server: false,
            socket: socket,
            oneP: oneP,
            pI: pI[0] || 0,
            dO: pI[1]
        });
        addEventListener('orientationchange',function() { game.rsz(game.canvas) }, false);

    }


    function controls(e) {
        switch(e.type) {
            case 'mousedown':
                mouse(e);
                game.tDown = true;
            break;
            case 'mouseup':
                game.tDown = false
            break;
            case 'touchstart':
                mouse(e.changedTouches[0]);
                game.tDown = true;
            break;
            case 'touchend':
                game.tDown = false;
            break;
        }
    }

    function mouse(e) {
        game.touch(e.clientX,e.clientY)
        
        // touch.x = e.clientX;
        // touch.y = e.clientY;
        // touch.scl(1/scale);
    }

    /**
     * Client module init
     */
    function init() {
        btns = document.getElementsByTagName("button");
        for (var i = 0; i < btns.length; i++) {
            (function (btn, callbacks) {
                btn.addEventListener("click", callbacks[i], false);
            })(btns[i], [battle, oneP]);
        }
        if(online) {
            socket = io({ upgrade: false, transports: ["websocket"] });
            bind();
        }
        

        
    }

    window.addEventListener("load", init, false);

})();
