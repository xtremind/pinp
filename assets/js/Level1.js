Game.Level1 = function (game) {
};

var map, layer;

var player;
var controls = {};
var playerSpeed = 150;

var up = "UP", down = "DOWN", left = "LEFT", right = "RIGHT";


Game.Level1.prototype = {
    create : function () {
        this.stage.backgroundColor = '#3A5963';
                
        map = this.add.tilemap('map', 32, 32);
        map.addTilesetImage('tileset');
        layer = map.createLayer(0);
        
        layer.resizeWorld();
        
        map.setCollisionBetween(0,2);
        
        player = this.add.sprite(100,560,'player');
        player.anchor.setTo(0.5, 0.5);
        player.direction = right;
                
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
        if(controls.up.isDown){
            player.direction = up;
        } else if(controls.down.isDown){
            player.direction = down;
        }else if(controls.left.isDown){
            player.direction = left;
        }else if(controls.right.isDown){
            player.direction = right;
        }
        
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        
        switch(player.direction){
                case right:
                    player.scale.setTo(1, 1);
                    player.body.velocity.x += playerSpeed
                    break;
                case left:
                    player.scale.setTo(-1, 1);
                    player.body.velocity.x -= playerSpeed
                    break;
                case up:
                    player.scale.setTo(1, 1);
                    player.body.velocity.y -= playerSpeed
                    break;
                case down:
                    player.scale.setTo(-1, -1);
                    player.body.velocity.y += playerSpeed
                    break;
        }
    }
};
