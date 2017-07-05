Game.LevelSingle = function (game) {
	this.map = {};
	this.layer = {};

	this.player = {};
	this.playerSpeed = 150;
	this.ghosts = [];

	this.gums = [];

	this.fastWayGrid = new Array(32);

	this.gridsize = 32;
	this.safetile = 390;
	this.bigGumTile = 7;
	this.smallGumTile = 6;

	this.excludedTiles = [this.safetile, this.bigGumTile, this.smallGumTile];

	this.threshold = 3;

	this.debug = false;

};

var DIRECTION = { UP : "UP", DOWN : "DOWN", LEFT : "LEFT", RIGHT : "RIGHT"};
var NDIRECTION = { UP : "DOWN", DOWN : "UP", LEFT : "RIGHT", RIGHT : "LEFT"};
var STATUS = {SCAVAGE : "SCAVAGE", HUNT : "HUNT", FEAR : "FEAR"};

Game.LevelSingle.prototype = {
	create : function () {
		var that = this;

		this.stage.backgroundColor = '#3A5963';

		this.map = this.add.tilemap('map', this.gridsize, this.gridsize);
		this.map.addTilesetImage('tileset');
		this.layer = this.map.createLayer(0);

		this.layer.resizeWorld();

		var style = { font: "15px Arial", wordWrap: true, align: "center", fill: "#ff0044", backgroundColor: "#ffff00"};

		if (this.debug) {
			this.text = this.add.text(700, this.world.height-20, "text", style);
			this.text.anchor.set(0.5);
		}

		this.score = this.add.text(700, 20, "text", style);
		this.score.anchor.set(0.5);

		//  hero should collide with everything except the safe tile
		this.map.setCollisionByExclusion(this.excludedTiles, true, this.layer);

		// Player's Part
		this.player = this.add.sprite(48, 48, 'player');
		this.player.anchor.setTo(0.5, 0.5);
		this.player.surroundings = [];
		this.player.direction = DIRECTION.RIGHT;
		this.player.marker = new Phaser.Point();

		this.physics.arcade.enable(this.player);
		this.player.body.collideWorldBounds = true;
		this.player.score = 0;

		this.player.controls = {
			right: this.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
			left: this.input.keyboard.addKey(Phaser.Keyboard.LEFT),
			up: this.input.keyboard.addKey(Phaser.Keyboard.UP),
			down: this.input.keyboard.addKey(Phaser.Keyboard.DOWN)
		};
		
		// ghosts' Part
		this.ghosts = this.game.add.group();
		this.ghosts.enableBody = true;
		this.ghosts.createMultiple(4, 'pink_phantom');
		this.game.time.events.loop(3000, this.addGhost, this);
		this.addGhost();

		// big gum's Part
		this.bigGums = this.add.physicsGroup();
		this.map.createFromTiles(this.bigGumTile, this.safetile, 'bigGum', this.layer, this.bigGums);
		this.bigGums.setAll('x', 12, false, false, 1);
		this.bigGums.setAll('y', 12, false, false, 1);

		// small Gum's Part
		this.smallGums = this.add.physicsGroup();
		this.map.createFromTiles(this.smallGumTile, this.safetile, 'smallGum', this.layer, this.smallGums);
		this.smallGums.setAll('x', 12, false, false, 1);
		this.smallGums.setAll('y', 12, false, false, 1);

	},

	update : function () {
		that = this;

		//physics
		this.physics.arcade.collide(this.player, this.layer);
		this.physics.arcade.overlap(this.player, this.bigGums, this.eatBigGum, null, this);
		this.physics.arcade.overlap(this.player, this.smallGums, this.eatSmallGum, null, this);
		this.physics.arcade.collide(this.ghosts, this.layer);
		this.physics.arcade.overlap(this.player, this.ghosts, this.killPlayer, null, this);
		
		//ghosts' part
		this.ghosts.forEachAlive(function(ghost) {
			that.checkSurroundings(ghost);
			that.chooseStatus(that.player, ghost);
			that.chooseDirection(ghost, that.player);
			that.move(ghost);
			that.updateSprite(ghost);
		});
		
		//player's part
		this.checkSurroundings(this.player);
		this.checkKeys(this.player);
		this.move(this.player);
		this.writeScore(this.player);
		this.computeFastWay(this.player);

		// debug's part
		if (this.debug) {
			//this.writePosition(this.player);
			this.writeStatus(this.player);
		}
	},

	updateSprite: function (ghost){
		if (ghost.status === STATUS.FEAR) {
			//console.log ("FEAR");
			ghost.loadTexture("fear_ghost");
		} else if (ghost.status === STATUS.HUNT) {
			//console.log ("HUNT");
			ghost.loadTexture("red_phantom");
		} else {
			//console.log ("SCAVAGE");
			ghost.loadTexture("pink_phantom");
		}
	},

	chooseStatus: function(player, ghost){
		if (player.isBigUntil > that.game.time.now){
			ghost.status = STATUS.FEAR;
		} else if(ghost.chooseStatus  < this.game.time.now ) {
			//var rand =  Math.floor(Math.random() * possibleDirection.length); 
			ghost.status = (ghost.status == STATUS.SCAVAGE ? STATUS.HUNT : STATUS.SCAVAGE);
			ghost.chooseStatus = ghost.chooseStatus + 5000;
		}
	},

	initFastWayGrid: function(){
		this.fastWayGrid = new Array(this.map.width);
		for (var i = 0; i < this.fastWayGrid.length; i++) {
			this.fastWayGrid[i] = new Array(this.map.height).fill(-1);
		}
	},

	computeFastWay: function(player){
		// only compute when player in the center of a case
		if ((this.math.fuzzyEqual(player.y - player.body.halfHeight, player.marker.y * this.gridsize, this.threshold))
			&& (this.math.fuzzyEqual(player.x - player.body.halfWidth, player.marker.x * this.gridsize, this.threshold))) {
			
			this.initFastWayGrid();
			this.computeFastWayPoint(player.marker.x, player.marker.y, 0);

		}
	},

	computeFastWayPoint: function(x, y, value){
		// change value only if not exist
		if (this.fastWayGrid[x][y] === -1 || this.fastWayGrid[x][y] > value){
			this.fastWayGrid[x][y] = value;

			//compute for any near title of the current point that is a safe titlte		
			this.computeNextFastWayPoint(this.map.getTileLeft(this.layer.index, x, y), value+1);
			this.computeNextFastWayPoint(this.map.getTileRight(this.layer.index, x, y), value+1);
			this.computeNextFastWayPoint(this.map.getTileAbove(this.layer.index, x, y), value+1);
			this.computeNextFastWayPoint(this.map.getTileBelow(this.layer.index, x, y), value+1);
		}
	},

	computeNextFastWayPoint: function(tile, value) {
		if((this.excludedTiles.indexOf(tile.index) !== -1)){
			this.computeFastWayPoint(tile.x, tile.y, value);
		}
	},

	addGhost: function() {
		var ghost = this.ghosts.getFirstDead();

		if(!ghost) {
			return;
		}

		ghost.anchor.setTo(0.5, 0.5);
		ghost.reset(336, 336)
		ghost.surroundings = [];
		ghost.direction = DIRECTION.LEFT;
		ghost.marker = new Phaser.Point();
		ghost.noDirectionUntil = this.game.time.now;
		ghost.status = STATUS.SCAVAGE;
		ghost.chooseStatus = this.game.time.now + 5000;

		this.physics.arcade.enable(ghost);
		ghost.body.collideWorldBounds = true;
		
	},

	killPlayer: function(player, ghost){
		if (player.isBigUntil > this.game.time.now) {
			console.log('player kill ghost');
			ghost.kill();
		} else {
			console.log('ghost kill player');
			/*if(confirm("player killed by ghost. Restart ?")){
        		this.state.start('LevelSingle');
			} else {
       		 	this.state.start('MenuStart');
			}*/
		}
	},
	
	chooseDirection: function(phantom, player){
		if ((this.math.fuzzyEqual(phantom.y - phantom.body.halfHeight, phantom.marker.y * this.gridsize, this.threshold))
			&& (this.math.fuzzyEqual(phantom.x - phantom.body.halfWidth, phantom.marker.x * this.gridsize, this.threshold))
			&& phantom.noDirectionUntil < this.game.time.now) {
			var possibleDirection = [];
			var direction = null;
			var currentValue = 999;
			var that = this;
			Object.keys(phantom.surroundings).forEach(function(key) {
				if(key !== "null" && phantom.surroundings[key].index == that.safetile && phantom.direction !== NDIRECTION[key])
					possibleDirection.push(key);
			});
		 
			// scavaging : alternate turn in the map at each cross path
			if (phantom.status === STATUS.SCAVAGE){	
				var rand =  Math.floor(Math.random() * possibleDirection.length); 
				direction = possibleDirection[rand];
			}
		
			// attack : pursuing the player
			if (phantom.status === STATUS.HUNT){
				for(var i = 0; i < possibleDirection.length; i++){
					if (direction === null || currentValue > this.getValue(phantom, possibleDirection[i])){
						direction = possibleDirection[i];
						currentValue = this.getValue(phantom, direction);
					}
				}
			}

			// fear : leave the player
			if (phantom.status === STATUS.FEAR) {
				for(var i = 0; i < possibleDirection.length; i++){
					if (direction === null || currentValue < this.getValue(phantom, possibleDirection[i])){
						direction = possibleDirection[i];
						currentValue = this.getValue(phantom, direction);
					}
				}
			}

			this.checkDirections(phantom, direction);
			phantom.noDirectionUntil = this.game.time.now + 100;
		}

	},

	getValue: function(ghost, direction){
		var tile;
		if (direction === DIRECTION.LEFT)
			var tile = this.map.getTileLeft(this.layer.index, ghost.marker.x, ghost.marker.y);
		if (direction === DIRECTION.RIGHT)
			var tile = this.map.getTileRight(this.layer.index, ghost.marker.x, ghost.marker.y);
		if (direction === DIRECTION.UP)
			var tile = this.map.getTileAbove(this.layer.index, ghost.marker.x, ghost.marker.y);
		if (direction === DIRECTION.DOWN)
			var tile = this.map.getTileBelow(this.layer.index, ghost.marker.x, ghost.marker.y);

		return this.fastWayGrid[tile.x][tile.y];
	},

	writeScore: function (player) {
		this.score.setText("player : " + player.score);
	},

	writeStatus: function (player) {
		this.text.setText(this.player.isBigUntil > this.game.time.now ? "BIG" : "normal");
	},

	writePosition: function (player) {
		this.text.setText("(" + player.x + ":" + player.marker.x * this.gridsize + "/" + player.y + ":" + player.marker.y * this.gridsize + ")");
	},

	checkSurroundings: function (player) {

		player.marker.x = this.math.snapToFloor(Math.floor(player.x), this.gridsize) / this.gridsize;
		player.marker.y = this.math.snapToFloor(Math.floor(player.y), this.gridsize) / this.gridsize;

		//  Update our grid sensors
		player.surroundings[null] = null;
		player.surroundings[DIRECTION.LEFT] = this.map.getTileLeft(this.layer.index, player.marker.x, player.marker.y);
		player.surroundings[DIRECTION.RIGHT] = this.map.getTileRight(this.layer.index, player.marker.x, player.marker.y);
		player.surroundings[DIRECTION.UP] = this.map.getTileAbove(this.layer.index, player.marker.x, player.marker.y);
		player.surroundings[DIRECTION.DOWN] = this.map.getTileBelow(this.layer.index, player.marker.x, player.marker.y);
	},

	checkKeys: function (player) {
		if (player.controls.up.isDown) {
			this.checkDirections(player, DIRECTION.UP);
		} else if (player.controls.down.isDown) {
			this.checkDirections(player, DIRECTION.DOWN);
		} else if (player.controls.left.isDown) {
			this.checkDirections(player, DIRECTION.LEFT);
		} else if (player.controls.right.isDown) {
			this.checkDirections(player, DIRECTION.RIGHT);
		} else if (player.direction !== null) {
			this.checkDirections(player, player.direction);
		}
	},

	checkDirections: function (player, turnTo) {
		if (player.direction === NDIRECTION[turnTo]) {
			//on attend pas d'être sur un croisement pour faire demi-tour
			player.direction = turnTo;
		} else if ((this.math.fuzzyEqual(player.y - player.body.halfHeight, player.marker.y * this.gridsize, this.threshold))
		&& (this.math.fuzzyEqual(player.x - player.body.halfWidth, player.marker.x * this.gridsize, this.threshold))) {
			if ((player.direction === turnTo) && (turnTo === null || this.excludedTiles.indexOf(player.surroundings[turnTo].index) === -1)) {
				//impossible d'avancer.
				player.direction = null;
				this.alignPlayer(player);
			} else if ((player.surroundings[turnTo] === null) || (this.excludedTiles.indexOf(player.surroundings[turnTo].index) === -1)) {
				// impossible de tourner, il y a un mur
				return;
			} else {
				if (player.direction !== turnTo) {
					this.alignPlayer(player);
				}

				player.direction = turnTo;
			}
		}
	},

	alignPlayer: function (player) {
		player.x =  player.marker.x * this.gridsize + player.body.halfWidth;
		player.y =  player.marker.y * this.gridsize + player.body.halfHeight;
		player.body.reset(player.x, player.y);
	},

	move: function (player) {
		player.body.velocity.x = 0;
		player.body.velocity.y = 0;

		switch (player.direction) {
			case DIRECTION.RIGHT:
				player.angle = 0;
				player.body.velocity.x += this.playerSpeed;
				break;
			case DIRECTION.LEFT:
				player.angle = 180;
				player.body.velocity.x -= this.playerSpeed;
				break;
			case DIRECTION.UP:
				player.angle = 270;
				player.body.velocity.y -= this.playerSpeed;
				break;
			case DIRECTION.DOWN:
				player.angle = 90;
				player.body.velocity.y += this.playerSpeed;
				break;
		}
	},

	eatBigGum: function (player, gum) {
		player.score += 10;
		player.isBigUntil = this.game.time.now + 5000;
		gum.kill();
	},

	eatSmallGum: function (player, gum) {
		player.score += 1;
		gum.kill();
	},

	render: function () {
		if (this.debug) {
			player = this.player;
			for (direction in this.player.surroundings) {
				var tile = player.surroundings[direction];
				var color = 'rgba(0,255,0,0.3)';
				if (tile !== null) {
					if (tile.index !== this.safetile) {
						color = 'rgba(255,0,0,0.3)';
					}
					this.game.debug.geom(new Phaser.Rectangle(tile.worldX, tile.worldY, this.gridsize, this.gridsize), color, true);
				}
			}
		}
	}
};
