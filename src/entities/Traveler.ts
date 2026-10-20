import Phaser from 'phaser';

export class Traveler extends Phaser.Physics.Arcade.Sprite {
 private readonly characterKey:string;
 private specialUntil=0;
 private shadow:Phaser.GameObjects.Ellipse;
 private lastGrounded=0;
 private jumpQueuedUntil=0;
 private wasGrounded=false;

 constructor(scene:Phaser.Scene,x:number,key:string){
  super(scene,x,520,key,0);this.characterKey=key;
  scene.add.existing(this);scene.physics.add.existing(this);
  this.setScale(.68).setCollideWorldBounds(true);
  this.body!.setSize(50,125).setOffset(39,29);
  this.shadow=scene.add.ellipse(x,600,38,8,0x14231f,.28).setDepth(-1);
  this.once('destroy',()=>this.shadow.destroy());
  this.play(`${key}-idle`);
 }

 requestJump(time:number){this.jumpQueuedUntil=time+160;}

 walk(targetSpeed:number,time:number,delta=16){
  const body=this.body as Phaser.Physics.Arcade.Body;
  const grounded=body.blocked.down||body.touching.down;
  if(grounded)this.lastGrounded=time;
  this.shadow.setPosition(this.x,body.bottom+2).setVisible(grounded).setScale(grounded?1:.7);
  // An action pose must not consume a buffered jump or freeze a character in
  // an airborne frame. Keep the physics running and hold horizontal position.
  if(time<this.specialUntil){
   this.jumpQueuedUntil=0;
   if(grounded)this.setVelocityX(0);
   return;
  }
  if(this.jumpQueuedUntil>time&&time-this.lastGrounded<130){
   this.setVelocityY(-575);this.jumpQueuedUntil=0;this.lastGrounded=-1000;
  }
  const step=(grounded?1550:1000)*Math.min(delta,50)/1000;
  this.setVelocityX(body.velocity.x+Phaser.Math.Clamp(targetSpeed-body.velocity.x,-step,step));
  if(Math.abs(this.body!.velocity.x)>12)this.setFlipX(this.body!.velocity.x<0);
  if(!grounded){this.anims.stop();this.setFrame(9);this.wasGrounded=false;return;}
  if(!this.wasGrounded){this.wasGrounded=true;this.scene.tweens.add({targets:this,scaleY:.64,duration:70,yoyo:true,onComplete:()=>this.setScale(.68)});}
  const moving=Math.abs(body.velocity.x)>18;
  const animation=`${this.characterKey}-${moving?'walk':'idle'}`;
  this.play(animation,true);
  if(moving)this.anims.timeScale=Phaser.Math.Clamp(Math.abs(body.velocity.x)/165,.65,1.35);
 }

 pose(action:'observe'|'photo'|'interact'|'victory',duration=0){
  const body=this.body as Phaser.Physics.Arcade.Body;
  const grounded=body.blocked.down||body.touching.down;
  if(!grounded)return;
  if(duration){
   this.jumpQueuedUntil=0;
   this.setVelocityX(0);
   this.specialUntil=this.scene.time.now+duration;
  }
  if(!duration&&this.scene.time.now<this.specialUntil)return;
  this.anims.stop();this.setFrame({observe:11,photo:12,interact:13,victory:14}[action]);
 }
}
