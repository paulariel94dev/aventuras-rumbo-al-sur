import Phaser from 'phaser';
export class Traveler extends Phaser.Physics.Arcade.Sprite{
 private readonly characterKey:string;
 private specialUntil=0;
 private shadow?:Phaser.GameObjects.Ellipse;
 constructor(s:Phaser.Scene,x:number,key:string){super(s,x,520,key,0);this.characterKey=key;s.add.existing(this);s.physics.add.existing(this);this.setScale(.62).setCollideWorldBounds(true);this.body!.setSize(50,125);this.body!.setOffset(39,29);this.play(`${key}-idle`);}
 walk(speed:number,time:number){
 if(!this.shadow){this.shadow=this.scene.add.ellipse(this.x,600,32,7,0x14231f,.25).setDepth(-1);this.once('destroy',()=>this.shadow?.destroy());}
 const contact=this.body as Phaser.Physics.Arcade.Body;
 this.shadow.setPosition(this.x,contact.bottom).setVisible(contact.blocked.down);
 this.setVelocityX(speed);if(speed)this.setFlipX(speed<0);
 if(time<this.specialUntil)return;
 const body=this.body as Phaser.Physics.Arcade.Body;
 if(!body.blocked.down){this.anims.stop();this.setFrame(body.velocity.y<0?9:10);return;}
 const animation=`${this.characterKey}-${speed?'walk':'idle'}`;
 this.play(animation,true);
 }
 pose(action:'observe'|'photo'|'interact'|'victory',duration=0){
 const frames={observe:11,photo:12,interact:13,victory:14};
 if(duration)this.specialUntil=this.scene.time.now+duration;
 if(!duration&&this.scene.time.now<this.specialUntil)return;
 this.anims.stop();this.setFrame(frames[action]);
 }
}
