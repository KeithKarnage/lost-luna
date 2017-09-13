"use strict";

/**
 * User sessions
 * @param {array} inLobby
 */
var inLobby = [],
	inGame  = [],
	matches = [];

/**
 * Find opponent for a user
 * @param {User} user
 */
function findOpponent(user) {
	// console.log('find opponent', inLobby.length)
	for (var i = 0; i < inLobby.length; i++) {
		if (
			user !== inLobby[i] && 
			inLobby[i].opponent === null
		) {
			// console.log('opponent found')
			new Match(user, inLobby[i]).loadGame();
		}
	}
}

/**
 * Remove user session
 * @param {User} user
 */
function leaveLobby(user) {
	if(inLobby.indexOf(user) > -1)
		inLobby.splice(inLobby.indexOf(user), 1);

}
function leaveMatch(user) {
	if(inGame.indexOf(user) > -1)
		inGame.splice(inGame.indexOf(user),1);
}

/**
 * Match class
 * @param {User} user1
 * @param {User} user2
 */
function Match(user1, user2) {
	// console.log('new match')
	this.user1 = user1;
	this.user2 = user2;
	this.dO = deckOrder();
	this.game = new Game({
		server: true,
		players: [user1,user2],
		dO: [this.dO,this.dO]
	});
	matches.push(this);
}


Match.prototype = {
/**
 * Start new match
 */
	loadGame: function() {
		this.user1.loadGame(this, this.user2, [0,this.dO]);
		this.user2.loadGame(this, this.user1, [1,this.dO]);
	},
	begin: function() {
		// console.log('Match.begin')
		if(this.user1.ready && this.user2.ready) {
			let time = Date.now() + 5000;
			this.user1.socket.emit('begin',time);
			this.user2.socket.emit('begin',time);
			this.game.start(time-100);
		}
	},
	matchOver: function() {
		this.user1.match = null;
		this.user2.match = null;
		this.game.MainLoop.stop();
		this.game = null;
		matches.splice(matches.indexOf(this))
		console.log(matches.length);
	}
}


/**
 * User session class
 * @param {Socket} socket
 */
function User(socket) {
	this.socket = socket;
	this.match = null;
	this.opponent = null;
	this.ready = false;
}

/**
 * Start new match
 * @param {Match} match
 * @param {User} opponent
 */
User.prototype = {
	loadGame: function (match, opponent, pI) {
		this.match = match;
		leaveLobby(this);
		inGame.push(this);
		this.opponent = opponent;
		this.socket.emit("loadGame",JSON.stringify(pI));
	},

	begin: function() {
		this.ready = true;
		this.match.begin();
	},

	/**
	 * Terminate match
	 */
	end: function () {
		if(this.match)
			this.match.matchOver();
		this.opponent = null;
		this.socket.emit("gameOver");
		leaveMatch(this);
		// inLobby.push(this);
	}
}

// setInterval(function() {
// 	console.log(matches.length);
// },1000)



/**
 * Trigger win event
 */
// User.prototype.win = function () {
// 	this.socket.emit("win", this.opponent.guess);
// };

/**
 * Trigger lose event
 */
// User.prototype.lose = function () {
// 	this.socket.emit("lose", this.opponent.guess);
// };

/**
 * Socket.IO on connect event
 * @param {Socket} socket
 */
module.exports = function (socket) {
	var user = new User(socket);
	
	socket.on("disconnect", function () {
		console.log("Disconnected: " + socket.id);
		// console.log(inLobby.length)
		if(user.match) leaveMatch();
		else leaveLobby(user);
		if (user.opponent)
			user.opponent.end();
	});

	socket.on('battle', function() {
		inLobby.push(user);
		findOpponent(user);

	})

	socket.on('ready', function(data) {
		user.begin();
	})

	socket.on('card', function(data) {
		data = JSON.parse(data);
		// console.log(data[0],data[2],data[3])

		let pId = data[5], //  ID
			pI = data[0], //  INDEX
			// d = JSON.parse(data); //  DATA
			nC = Math.floor(Math.random()*4);  //  NEXT CARD FROM DECK
		// console.log(nC);
		data[0] = null;
		user.match.game.playCard(data[1],data,pI,nC);

		data.push(nC);


		socket.emit('confirmCard',JSON.stringify(data));
		// console.log(data);
		
		

	})
	socket.on('matchEnded',function(data) {
		user.end();
	})


	console.log("Connected: " + socket.id);

};