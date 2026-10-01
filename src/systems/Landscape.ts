import Phaser from 'phaser';
export function landscape(s:Phaser.Scene,width=11200,foreground=false){
 s.add.rectangle(0,0,width,720,0x80b6c6).setOrigin(0).setScrollFactor(0).setDepth(-30);
 const back=s.add.graphics().setScrollFactor(.12).setDepth(-29);back.fillStyle(0xffdd9c);back.fillCircle(1010,225,66);
 for(let i=-1;i<32;i++){let x=i*360;back.fillStyle(i%2?0x5e8294:0x718f9c);back.fillTriangle(x,475,x+220,170+(i%3)*40,x+430,475);back.fillStyle(0xe1e5d5);back.fillTriangle(x+158,260+(i%3)*40,x+220,170+(i%3)*40,x+284,260+(i%3)*40);}
 const lake=s.add.graphics().setScrollFactor(.3).setDepth(-28);lake.fillStyle(0x4c98ae);lake.fillRect(0,450,width,180);for(let i=0;i<900;i++){lake.fillStyle(i%2?0x8cc3c7:0x68aebc);lake.fillRect(i*57,470+(i*31)%140,20+(i%4)*14,3);}
 const woods=s.add.graphics().setScrollFactor(.55).setDepth(-27);for(let i=0;i<280;i++){const x=i*110;const y=455+(i%3)*28;woods.fillStyle(i%2?0x366e6b:0x407c74);woods.fillTriangle(x-35,y+100,x,y-80,x+35,y+100);}
 // The old geometric foreground is intentionally disabled. LevelScene adds the
 // authored, tileable vegetation and soil layers below.
}

export class DepthLayers{
 private readonly scene:Phaser.Scene;
 constructor(scene:Phaser.Scene,width=11200){
  this.scene=scene;
  const frames=['green','autumn','slender'];
  for(let i=0,x=650;x<width;x+=1100+(i%3)*220,i++){
   const zone=Math.floor(x/2240);
   if(zone===2 || (zone===1&&i%3!==0))continue;
   // The trunk meets the earth around 82% of the sheet height. The remaining
   // dangling roots belong underground, behind the terrain drawn at depth -2.
   if([1850,4200,6800,8600].some(gap=>x>gap-100&&x<gap+250))continue;
   scene.add.ellipse(x,598,60,9,0x263329,.3).setDepth(-6);
   const tree=scene.add.image(x,601,'trees-detailed',frames[i%3]).setOrigin(.5,.82).setScale(.30+(i%3)*.025).setDepth(-5);
   tree.setFlipX(i%2===0);
   if(i%3===0){
    scene.add.image(x*.65+300,601,'trees-detailed',frames[(i+2)%3]).setOrigin(.5,.82).setScale(.20).setScrollFactor(.65,1).setTint(0xb1c2b4).setDepth(-7);
   }
  }
  // A handful of small leaves moves behind the actors, without covering the HUD.
  for(let i=0;i<5;i++){
   const leaf=scene.add.rectangle(120+i*247,310+i*27,3,2,i%2?0xc79b45:0x9fa453).setScrollFactor(0).setDepth(-3);
   scene.tweens.add({targets:leaf,x:leaf.x+55,y:leaf.y+160,alpha:0,duration:6500+i*900,delay:i*1200,repeat:-1,ease:'Sine.easeInOut'});
  }
 }
 terrain(x:number,y:number,w:number,h:number){
  // Ground belongs to world positions, including platforms spanning a boundary.
  const colors=[0x30271a,0x423e35,0x946531,0x25281b,0x68391f];
  const draw=(left:number,width:number,zone:number,alpha=1)=>{
   this.scene.add.rectangle(left,y,width,h,colors[zone]).setOrigin(0).setDepth(-2).setAlpha(alpha);
   const tile=this.scene.add.tileSprite(left,y,width,Math.min(h,96),'ground-biomes',`soil-${zone}`).setOrigin(0).setDepth(-2).setTileScale(.5,.5).setAlpha(alpha);
   tile.tilePositionX=left;
  };
  for(let left=x;left<x+w;){
   const zone=Math.min(4,Math.floor(left/2240));
   const boundary=(zone+1)*2240;
   const nextEdge=zone===4?x+w:left<boundary-256?boundary-256:Math.min(boundary,left+32);
   const end=Math.min(x+w,nextEdge);
   draw(left,end-left,zone);
   if(zone<4&&left>=boundary-256)draw(left,end-left,zone+1,(left-boundary+256)/256);
   left=end;
  }
 }
}

export class BiomeBackdrop{
 private readonly scene:Phaser.Scene;
 private readonly images:Phaser.GameObjects.Image[];
 private current=0;
 constructor(scene:Phaser.Scene){this.scene=scene;this.images=['forest','lake','steppe','rainforest','valley'].map((key,index)=>scene.add.image(640,360,`biome-${key}`).setDisplaySize(1280,720).setScrollFactor(0).setDepth(-20).setAlpha(index===0?1:0));}
 update(worldX:number){const next=Phaser.Math.Clamp(Math.floor(worldX/2240),0,4);if(next===this.current)return;this.current=next;for(let index=0;index<this.images.length;index++)this.scene.tweens.add({targets:this.images[index],alpha:index===next?1:0,duration:900,ease:'Sine.easeInOut'});}
 get zone(){return this.current;}
}

