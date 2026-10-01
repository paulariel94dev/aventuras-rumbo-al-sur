import Phaser from 'phaser';
import {species,Species} from '../data/wildlife';
export type AnimalState='idle'|'moving'|'alert';
export type Animal={data:Species;sprite:Phaser.GameObjects.Sprite;state:AnimalState;elapsed:number};
export class WildlifeSystem{
 animals:Animal[];found=new Set<string>();photos=new Map<string,number>();focus=0;target?:Animal;
 constructor(scene:Phaser.Scene){this.animals=species.map(data=>({data,sprite:scene.add.sprite(data.x,data.y,data.texture,0).setScale(data.kind==='bird'?1.08:.92).play(`${data.texture}-idle`),state:'idle',elapsed:0}));}
 get count(){return species.filter(s=>!s.bonus&&this.found.has(s.id)).length;}
 update(dt:number,px:number,aim:{x:number;y:number}|null,onFound:(a:Animal)=>void){
 for(const a of this.animals){a.elapsed+=dt;const close=Math.abs(px-a.sprite.x)<100;a.state=close?'alert':Math.floor(a.elapsed/2500)%2?'moving':'idle';const amp=a.data.kind==='bird'?100:a.state==='moving'?35:5;a.sprite.x=a.data.x+Math.sin(a.elapsed/1700)*amp;a.sprite.y=a.data.y+(a.data.kind==='bird'?Math.sin(a.elapsed/1100)*35:0);a.sprite.setFlipX(Math.cos(a.elapsed/1700)<0);a.sprite.setAlpha(a.data.bonus&&this.count<5?.35:1);if(this.found.has(a.data.id)){a.sprite.anims.stop();a.sprite.setFrame(7);}else if(a.state==='alert'){a.sprite.anims.stop();a.sprite.setFrame(6);}else a.sprite.play(`${a.data.texture}-${a.state}`,true);}
 const candidate=aim?this.animals.find(a=>(!a.data.bonus||this.count===5)&&Math.abs(a.sprite.x-px)<580&&Phaser.Math.Distance.Between(aim.x,aim.y,a.sprite.x,a.sprite.y)<65):undefined;
 if(candidate!==this.target){this.focus=0;this.target=candidate;}if(!candidate||this.found.has(candidate.data.id)){this.focus=0;return;}this.focus+=dt;if(this.focus>=1500){this.found.add(candidate.data.id);this.focus=0;onFound(candidate);}
 }
 photo(px:number,aim:{x:number;y:number}){const a=this.target;if(!a)return null;const distance=Math.abs(px-a.sprite.x);const centered=Math.max(0,1-Phaser.Math.Distance.Between(aim.x,aim.y,a.sprite.x,a.sprite.y)/65);const score=Math.round(350*centered+350*Math.max(0,1-Math.abs(distance-240)/400)+(a.state==='moving'?300:a.state==='idle'?180:60));this.photos.set(a.data.id,Math.max(score,this.photos.get(a.data.id)||0));return {a,score};}
}
