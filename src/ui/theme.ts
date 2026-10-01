import Phaser from 'phaser';
export const ink=0x081f35,gold=0xf1ce8f;
export function label(s:Phaser.Scene,x:number,y:number,text:string,size=20,color='#f6edd8'){return s.add.text(x,y,text,{fontFamily:'monospace',fontSize:size,color,stroke:'#081f35',strokeThickness:2});}
export function panel(s:Phaser.Scene,x:number,y:number,w:number,h:number){return s.add.rectangle(x,y,w,h,ink,.96).setOrigin(0).setStrokeStyle(3,gold);}
export function button(s:Phaser.Scene,x:number,y:number,text:string,fn:()=>void){const b=label(s,x,y,text,23).setOrigin(.5).setPadding(22,15).setBackgroundColor('#143d54').setInteractive({useHandCursor:true});b.on('pointerover',()=>b.setColor('#ffd276')).on('pointerout',()=>b.setColor('#f6edd8')).on('pointerdown',fn);return b;}
