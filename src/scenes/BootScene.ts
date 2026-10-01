import Phaser from 'phaser';
export class BootScene extends Phaser.Scene{
 constructor(){super('BootScene');}
 preload(){
 this.load.spritesheet('pablo','./assets/characters/pablo-sheet.png',{frameWidth:128,frameHeight:160});
 this.load.spritesheet('lujan','./assets/characters/lujan-sheet.png',{frameWidth:128,frameHeight:160});
 for(const animal of ['fox','guanaco','condor','woodpecker','huemul'])this.load.spritesheet(animal,`./assets/wildlife/${animal}-sheet.png`,{frameWidth:128,frameHeight:128});
 for(const biome of ['forest','lake','steppe','rainforest','valley'])this.load.image(`biome-${biome}`,`./assets/landscapes/${biome}.png`);
 this.load.image('foreground-vegetation','./assets/environment/foreground-vegetation.png');
 this.load.image('ground-strip','./assets/environment/ground-detailed.png');
 this.load.image('ground-biomes','./assets/environment/ground-biomes.png');
 this.load.image('trees-detailed','./assets/environment/trees-detailed.png');
 }
 create(){
 const soil=this.textures.get('ground-biomes');
 const edges=[0,195,390,585,780,1024];
 for(let i=0;i<5;i++)soil.add(`soil-${i}`,0,0,edges[i],1536,edges[i+1]-edges[i]);
 const trees=this.textures.get('trees-detailed');
 trees.add('green',0,0,0,640,1024);trees.add('autumn',0,640,0,560,1024);trees.add('slender',0,1200,0,336,1024);
 const g=this.make.graphics({x:0,y:0});
 const rect=(x:number,y:number,w:number,h:number,c:number)=>{g.fillStyle(c);g.fillRect(x,y,w,h);};
 g.clear();rect(0,0,16,16,0xffffff);g.generateTexture('block',16,16);g.destroy();this.scene.start('MenuScene');
 for(const character of ['pablo','lujan']){
 this.anims.create({key:`${character}-idle`,frames:this.anims.generateFrameNumbers(character,{start:0,end:2}),frameRate:2,repeat:-1});
 const walkFrames=[3,4,5,6,7,8,7,6,5,4].map(frame=>({key:character,frame}));
 this.anims.create({key:`${character}-walk`,frames:walkFrames,frameRate:8,repeat:-1});
 }
 for(const animal of ['fox','guanaco','condor','woodpecker','huemul']){
 this.anims.create({key:`${animal}-idle`,frames:this.anims.generateFrameNumbers(animal,{start:0,end:1}),frameRate:2,repeat:-1});
 this.anims.create({key:`${animal}-moving`,frames:this.anims.generateFrameNumbers(animal,{start:2,end:5}),frameRate:6,repeat:-1});
 }
 }
}
