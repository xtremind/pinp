var game = new Phaser.Game(800,400, Phaser.AUTO,'gameContainer', {
	preload: preload, create: create
});

function preload(){
	game.load.image('logo','/assets/img/phaser.png');
};

function create(){
	game.add.sprite(10,20,'logo');
};
function update(){
	
};



