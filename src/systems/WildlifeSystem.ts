import Phaser from 'phaser';
import {species,Species} from '../data/wildlife';

export type AnimalState='idle'|'moving'|'alert';
export type Animal={data:Species;sprite:Phaser.GameObjects.Sprite;state:AnimalState;elapsed:number;direction:number;clue:Phaser.GameObjects.Container};

export class WildlifeSystem{
 animals:Animal[];
 found=new Set<string>();
 clues=new Set<string>();
 photos=new Map<string,number>();
 photoTextures=new Map<string,string>();
 photoFrames=new Map<string,number>();
 focus=0;
 target?:Animal;
 nearbyClue?:Animal;
 readonly focusGoal=1500;

 constructor(scene:Phaser.Scene){
  this.animals=species.map(data=>{
   const x=data.x-285;
   const marker=scene.add.circle(x,562,18,0x243e37).setStrokeStyle(3,0xffd57b);
   const icon=scene.add.text(x,561,'?',{fontFamily:'monospace',fontSize:'22px',color:'#ffe9a6'}).setOrigin(.5);
   const caption=scene.add.text(x-54,520,data.bonus?'ÚLTIMA PISTA · E':'RASTRO · E',{fontFamily:'monospace',fontSize:'15px',color:'#ffe1a4'});
   const clue=scene.add.container(0,0,[marker,icon,caption]).setDepth(3);
   const sprite=scene.add.sprite(data.x,data.y,data.texture,0).setScale(data.id==='condor'?1.36:.92).play(`${data.texture}-idle`);
   return {data,sprite,state:'idle' as AnimalState,elapsed:0,direction:1,clue};
  });
 }

 get count(){return species.filter(s=>!s.bonus&&this.found.has(s.id)).length;}

 inspectClue(px:number){
  const clue=this.animals.find(a=>(!a.data.bonus||this.count===5)&&!this.clues.has(a.data.id)&&Math.abs(px-(a.data.x-285))<105);
  if(!clue)return null;
  this.clues.add(clue.data.id);
  return clue;
 }

 update(dt:number,px:number,aim:{x:number;y:number}|null,onFound:(a:Animal)=>void){
  this.nearbyClue=this.animals.find(a=>(!a.data.bonus||this.count===5)&&!this.clues.has(a.data.id)&&Math.abs(px-(a.data.x-285))<105);
  for(const a of this.animals){
   a.elapsed+=dt;
   const unlocked=this.clues.has(a.data.id);
   a.clue.setVisible(!unlocked&&(!a.data.bonus||this.count===5));
   const flying=a.data.kind==='bird';
   const perched=a.data.kind==='woodpecker';
   a.state=flying?'moving':Math.abs(px-a.sprite.x)<100?'alert':Math.floor(a.elapsed/2200)%2?'moving':'idle';
   if(flying){
    a.sprite.x=a.data.x+Math.sin(a.elapsed/1700)*100;
    a.sprite.y=a.data.y+Math.sin(a.elapsed/1100)*35;
    a.sprite.setFlipX(Math.cos(a.elapsed/1700)<0);
   }else if(a.state==='moving'&&!perched){
    // Only walk frames translate. Idle, alert and resting poses keep their footing.
    const speed=a.data.kind==='fox'?26:20;
    a.sprite.x+=a.direction*speed*Math.min(dt,50)/1000;
    if(Math.abs(a.sprite.x-a.data.x)>=52){
     a.sprite.x=a.data.x+a.direction*52;
     a.direction*=-1;
    }
    a.sprite.setFlipX(a.direction<0);
   }
   a.sprite.setAlpha(unlocked?1:.22);
   if(a.state==='alert'){a.sprite.anims.stop();a.sprite.setFrame(6);}
   else a.sprite.play(`${a.data.texture}-${a.state}`,true);
  }
  const candidate=aim?this.animals.find(a=>this.clues.has(a.data.id)&&!this.found.has(a.data.id)&&Math.abs(a.sprite.x-px)<650&&Phaser.Math.Distance.Between(aim.x,aim.y,a.sprite.x,a.sprite.y)<78):undefined;
  this.target=candidate;
  if(candidate){this.focus=Math.min(this.focusGoal,this.focus+dt);}
  else this.focus=Math.max(0,this.focus-dt*.55);
  if(candidate&&this.focus>=this.focusGoal){
   this.found.add(candidate.data.id);this.focus=0;onFound(candidate);
  }
 }

 photo(px:number,aim:{x:number;y:number}){
  const a=this.animals.find(item=>this.clues.has(item.data.id)&&Phaser.Math.Distance.Between(aim.x,aim.y,item.sprite.x,item.sprite.y)<65&&Math.abs(px-item.sprite.x)<650);
  if(!a)return null;
  const distance=Math.abs(px-a.sprite.x);
  const centered=Math.max(0,1-Phaser.Math.Distance.Between(aim.x,aim.y,a.sprite.x,a.sprite.y)/90);
  const score=Math.round(350*centered+350*Math.max(0,1-Math.abs(distance-240)/400)+(a.state==='moving'?300:a.state==='idle'?180:60));
  const improved=score>(this.photos.get(a.data.id)||0);
  if(improved){this.photos.set(a.data.id,score);this.photoFrames.set(a.data.id,Number(a.sprite.frame.name));}
  const newSighting=!this.found.has(a.data.id);
  if(newSighting)this.found.add(a.data.id);
  return {a,score,improved,newSighting};
 }
}
