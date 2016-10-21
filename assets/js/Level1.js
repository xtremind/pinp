Game.Level1 = function (game) {
};

var map, layer;

var player;
var controls = {};
var playerSpeed = 150;

var DIRECTION = { UP : "UP", DOWN : "DOWN", LEFT : "LEFT", RIGHT : "RIGHT"};

Game.Level1.prototype = {
    create : function () {
        this.stage.backgroundColor = '#3A5963';
                
        map = this.add.tilemap('map', 32, 32);
        map.addTilesetImage('tileset');
        layer = map.createLayer(0);
        
        layer.resizeWorld();
        
        map.setCollisionBetween(0, 2);
        
        this.safetile = 390;
                
        //  hero should collide with everything except the safe tile
        map.setCollisionByExclusion([this.safetile], true, this.layer);
        
        player = this.add.sprite(100, 560, 'player');
        player.anchor.setTo(0.5, 0.5);
        player.direction = DIRECTION.RIGHT;
                
        this.physics.arcade.enable(player);
        player.body.collideWorldBounds = true;
        
        controls = {
            right: this.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
            left: this.input.keyboard.addKey(Phaser.Keyboard.LEFT),
            up: this.input.keyboard.addKey(Phaser.Keyboard.UP),
            down: this.input.keyboard.addKey(Phaser.Keyboard.DOWN)
        };
        
    },
    
    update : function () {
        this.physics.arcade.collide(player, layer);
        
        if (controls.up.isDown) {
            player.direction = DIRECTION.UP;
        } else if (controls.down.isDown) {
            player.direction = DIRECTION.DOWN;
        } else if (controls.left.isDown) {
            player.direction = DIRECTION.LEFT;
        } else if (controls.right.isDown) {
            player.direction = DIRECTION.RIGHT;
        }
        
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
                        
        switch (player.direction) {
        case DIRECTION.RIGHT:
            if (!player.body.touching.right) {
                player.angle = 0;
                player.scale.setTo(1, 1);
                player.body.velocity.x += playerSpeed;
            }
            break;
        case DIRECTION.LEFT:
            if (!player.body.touching.left) {
                player.angle = 0;
                player.scale.setTo(-1, 1);
                player.body.velocity.x -= playerSpeed;
            }
            break;
        case DIRECTION.UP:
            if (!player.body.touching.up) {
                player.angle = 270;
                player.scale.setTo(1, 1);
                player.body.velocity.y -= playerSpeed;
            }
            break;
        case DIRECTION.DOWN:
            if (!player.body.touching.down) {
                player.angle = 90;
                player.scale.setTo(1, 1);
                player.body.velocity.y += playerSpeed;
            }
            break;
        }
    }
};
