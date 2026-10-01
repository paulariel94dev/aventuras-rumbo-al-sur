import {Traveler} from '../entities/Traveler';
export class CompanionAI{
 teleports=0;
 update(p:Traveler,c:Traveler,time:number,cameraLeft:number){let d=p.x-c.x;if(Math.abs(d)>1500){c.setPosition(Math.max(24,cameraLeft-90),450);c.setVelocity(0);this.teleports++;d=p.x-c.x;}c.walk(Math.abs(d)>75?Math.sign(d)*(Math.abs(d)>220?235:150):0,time);const b=c.body as Phaser.Physics.Arcade.Body;if(b.blocked.down&&(b.blocked.left||b.blocked.right||p.y<c.y-45))c.setVelocityY(-460);}
}
