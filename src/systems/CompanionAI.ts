import Phaser from 'phaser';
import {Traveler} from '../entities/Traveler';

export class CompanionAI{
 teleports=0;
 private stuckFor=0;
 update(player:Traveler,companion:Traveler,time:number,cameraLeft:number,delta=16){
  let distance=player.x-companion.x;
  if(Math.abs(distance)>950){
   companion.setPosition(Math.max(40,cameraLeft-80),player.y-20).setVelocity(0);
   this.teleports++;distance=player.x-companion.x;this.stuckFor=0;
  }
  const desired=distance>84?Math.min(245,165+Math.max(0,distance-180)*.3):distance<30?-105:0;
  companion.walk(desired,time,delta);
  const body=companion.body as Phaser.Physics.Arcade.Body;
  const blocked=body.blocked.left||body.blocked.right;
  this.stuckFor=blocked?this.stuckFor+delta:Math.max(0,this.stuckFor-delta);
  if((body.blocked.down||body.touching.down)&&(player.y<companion.y-38||this.stuckFor>100||player.body!.velocity.y<0&&distance>160)){
   companion.requestJump(time);this.stuckFor=0;
  }
 }
}
