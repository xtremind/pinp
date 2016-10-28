Game.Level1 = function (game) {    
    this.map; 
    this.layer;
    
    this.players = [];
    this.playerSpeed = 150;
    
    this.gridsize = 32;
    this.safetile = 390;
    this.threshold = 3;
    
    this.debug = false;
};

var DIRECTION = { UP : "UP", DOWN : "DOWN", LEFT : "LEFT", RIGHT : "RIGHT"};
var NDIRECTION = { UP : "DOWN", DOWN : "UP", LEFT : "RIGHT", RIGHT : "LEFT"};

Game.Level1.prototype = {
    create : function () {
        this.stage.backgroundColor = '#3A5963';
                
        this.map = this.add.tilemap('map', 32, 32);
        this.map.addTilesetImage('tileset');
        this.layer = this.map.createLayer(0);
        
        this.layer.resizeWorld();
        
        this.map.setCollisionBetween(0, 2);
        
        if(this.debug) {
            var style = { font: "15px Arial", wordWrap: true, align: "center", fill: "#ff0044", backgroundColor: "#ffff00"};
            this.text = this.add.text(700, 20, "text", style);
            this.text.anchor.set(0.5);
        }
            
        //  hero should collide with everything except the safe tile
        //this.map.setCollisionByExclusion([this.safetile], true, this.layer);
        
        this.players[0] = this.add.sprite(48, 48, 'player');
        this.players[0].anchor.setTo(0.5, 0.5);
        this.players[0].surroundings = [];
        this.players[0].direction = DIRECTION.RIGHT;
        this.players[0].marker = new Phaser.Point;
                
        this.physics.arcade.enable(this.players[0]);
        this.players[0].body.collideWorldBounds = true;
        
        this.players[0].controls = {
            right: this.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
            left: this.input.keyboard.addKey(Phaser.Keyboard.LEFT),
            up: this.input.keyboard.addKey(Phaser.Keyboard.UP),
            down: this.input.keyboard.addKey(Phaser.Keyboard.DOWN)
        };
        
    },
    
    update : function () {
        this.physics.arcade.collide(this.players[0], this.layer);
        this.checkSurroundings(this.players[0]);
        this.checkKeys(this.players[0]);
        this.move(this.players[0]);
        if(this.debug) {
            this.writePosition(this.players[0]);
        }
    },
    
    writePosition: function(player){
        this.text.setText("(" + player.x + ":" + player.marker.x*32+"/"+ player.y + ":" +player.marker.y*32+")");
    },
    
    checkSurroundings: function(player){
        
        player.marker.x = this.math.snapToFloor(Math.floor(player.x), this.gridsize) / this.gridsize;
        player.marker.y = this.math.snapToFloor(Math.floor(player.y), this.gridsize) / this.gridsize;

        //  Update our grid sensors
        player.surroundings[null] = null;
        player.surroundings[DIRECTION.LEFT] = this.map.getTileLeft(this.layer.index, player.marker.x, player.marker.y);
        player.surroundings[DIRECTION.RIGHT] = this.map.getTileRight(this.layer.index, player.marker.x, player.marker.y);
        player.surroundings[DIRECTION.UP] = this.map.getTileAbove(this.layer.index, player.marker.x, player.marker.y);
        player.surroundings[DIRECTION.DOWN] = this.map.getTileBelow(this.layer.index, player.marker.x, player.marker.y);
    },
    
    checkKeys: function(player){
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
    
    checkDirections: function(player, turnTo){
        if((this.math.fuzzyEqual(player.y-16, player.marker.y*32, this.threshold)) && (this.math.fuzzyEqual(player.x-16, player.marker.x*32, this.threshold))){
            if ((player.direction === turnTo) && (player.surroundings[turnTo].index !== this.safetile) ) {
                //impossible d'avancer.
                player.direction = null;
                player.x =  player.marker.x*32 + 16;
                player.y =  player.marker.y*32 + 16;
                player.body.reset(player.x, player.y);
            } else if ((player.surroundings[turnTo] === null) || (player.surroundings[turnTo].index !== this.safetile)){
                // impossible de tourner, il y a un mur 
                return;
            } else {
                if(player.direction !== turnTo){
                    player.x =  player.marker.x*32 + 16;
                    player.y =  player.marker.y*32 + 16;
                    player.body.reset(player.x, player.y);
                }
                if(player.direction === NDIRECTION[turnTo]){
                    //je peux faire demi-tour
                    player.direction = turnTo;
                    return;
                }

                //sinon, je ne peux tourner qu'à un emplacement specifique
                switch (turnTo) {
                case DIRECTION.RIGHT:
                case DIRECTION.LEFT:
                    //if (this.math.fuzzyEqual(player.y-16, player.surroundings[turnTo].worldY, this.threshold)){
                        player.direction = turnTo;
                    //}
                    break;
                case DIRECTION.UP:
                case DIRECTION.DOWN:
                    //if (this.math.fuzzyEqual(player.x-16, player.surroundings[turnTo].worldY, this.threshold)){
                        player.direction = turnTo;
                    //}
                    break;
                }
            }  
        } 
    },
    
    move: function(player){
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        
        switch (player.direction) {
        case DIRECTION.RIGHT:
            player.angle = 0;
            player.scale.setTo(1, 1);
            player.body.velocity.x += this.playerSpeed;
            break;
        case DIRECTION.LEFT:
            player.angle = 0;
            player.scale.setTo(-1, 1);
            player.body.velocity.x -= this.playerSpeed;
            break;
        case DIRECTION.UP:
            player.angle = 270;
            player.scale.setTo(1, 1);
            player.body.velocity.y -= this.playerSpeed;
            break;
        case DIRECTION.DOWN:
            player.angle = 90;
            player.scale.setTo(1, 1);
            player.body.velocity.y += this.playerSpeed;
            break;
        }
    },
    
    render: function(){
        if(this.debug) {
            for (direction in this.players[0].surroundings){
                tile = this.players[0].surroundings[direction];
                var color = 'rgba(0,255,0,0.3)';
                if (tile !== null) {
                    if (tile.index !== this.safetile){
                        color = 'rgba(255,0,0,0.3)';
                    }
                    this.game.debug.geom(new Phaser.Rectangle(tile.worldX, tile.worldY, 32, 32), color, true);
                }
            }
        }
    }
};
