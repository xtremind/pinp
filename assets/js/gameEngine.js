var game = new Phaser.Game(window.innerWidth,window.innerHeight, Phaser.AUTO,'gameContainer', {
	preload: preload, create: create
});

function preload(){
	game.load.image('logo','/assets/img/phaser.png');
};

function create(){
	game.add.sprite(10,20,'logo');
	game.stage.backgroundColor = '#ffffff';
};

function update(){
	
};



