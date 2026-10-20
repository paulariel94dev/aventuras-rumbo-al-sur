import Phaser from 'phaser';
import {label,panel} from './theme';
import {species} from '../data/wildlife';
import {WildlifeSystem} from '../systems/WildlifeSystem';

export class HUD{
 status:Phaser.GameObjects.Text;
 zone:Phaser.GameObjects.Text;
 notice:Phaser.GameObjects.Text;
 album:Phaser.GameObjects.Container;
 albumCards:Phaser.GameObjects.Container;
 aim:Phaser.GameObjects.Graphics;
 hint:Phaser.GameObjects.Text;
 private scene:Phaser.Scene;
 private albumPage=0;

 constructor(scene:Phaser.Scene){
  this.scene=scene;
  const top=scene.add.container(0,0).setScrollFactor(0).setDepth(50);
  top.add(panel(scene,18,17,348,106));
  for(let i=0;i<2;i++){
   top.add(scene.add.sprite(52,42+i*49,i?'lujan':'pablo',0).setScale(.38));
   top.add(label(scene,85,27+i*49,`PLAYER ${i+1}  ${i?'LA COMPAÑERA':'EL PLAN'}`,15));
   top.add(label(scene,85,47+i*49,'♥ ♥ ♥ ♥ ♥',19,'#f18478'));
  }
  top.add(panel(scene,938,17,324,160));
  this.status=label(scene,952,28,'',15);top.add(this.status);
  this.zone=label(scene,650,35,'',16).setOrigin(.5);top.add(this.zone);
  top.add(label(scene,650,61,'RUMBO AL SUR',24,'#ffd276').setOrigin(.5));
  const bottom=scene.add.container(0,0).setScrollFactor(0).setDepth(50);
  bottom.add(panel(scene,18,645,1244,58));
  this.hint=label(scene,37,664,'A/D mover · ESPACIO saltar · E investigar · Q observar · F foto · TAB álbum',17);
  bottom.add(this.hint);
  if(!scene.sys.game.device.os.desktop)bottom.setVisible(false);
  this.notice=label(scene,640,190,'',21).setOrigin(.5,0).setWordWrapWidth(850).setPadding(16,12).setBackgroundColor('#081f35').setScrollFactor(0).setDepth(70).setVisible(false);
  this.aim=scene.add.graphics().setScrollFactor(0).setDepth(55);
  this.album=scene.add.container(0,0).setScrollFactor(0).setDepth(90).setVisible(false);
  this.album.add(panel(scene,155,103,970,520));
  this.album.add(label(scene,185,122,'CUADERNO DE FAUNA',31,'#ffd276'));
  this.albumCards=scene.add.container(0,0);this.album.add(this.albumCards);
  if(scene.sys.game.device.os.desktop)this.album.add(label(scene,185,585,'TAB / ESC · volver al sendero',17));
 }

 update(w:WildlifeSystem,zone:string){
  this.zone.setText(zone);
  this.status.setText(`FAUNA  ${w.found.size}/5\nFOTOS  ${[...w.photos.values()].reduce((a,b)=>a+b,0)} puntos\n${species.filter(a=>!a.bonus).map(a=>(w.found.has(a.id)?'✓ ':'○ ')+a.name).join('\n')}`);
 }

 toggleAlbum(w:WildlifeSystem){
  const opening=!this.album.visible;
  this.album.setVisible(opening);
  if(!opening)return;
  this.albumPage=0;
  this.renderAlbum(w);
 }

 changeAlbumPage(w:WildlifeSystem,step:number){
  if(!this.album.visible||this.scene.sys.game.device.os.desktop)return;
  const entries=species.filter(data=>!data.bonus||w.found.has(data.id)||w.photos.has(data.id));
  const pages=Math.ceil(entries.length/2);
  this.albumPage=(this.albumPage+step+pages)%pages;
  this.renderAlbum(w);
 }

 private renderAlbum(w:WildlifeSystem){
  this.albumCards.removeAll(true);
  const entries=species.filter(data=>!data.bonus||w.found.has(data.id)||w.photos.has(data.id));
  const mobile=!this.scene.sys.game.device.os.desktop;
  const visible=mobile?entries.slice(this.albumPage*2,this.albumPage*2+2):entries;
  visible.forEach((data,index)=>{
   const x=mobile?175+index*475:175+(index%3)*310;
   const y=mobile?185:185+Math.floor(index/3)*190;
   const width=mobile?455:290;
   const height=mobile?365:180;
   const photoWidth=mobile?431:274;
   const photoHeight=mobile?166:100;
   const photoY=mobile?y+96:y+57;
   const photographed=w.photos.has(data.id);
   const seen=w.found.has(data.id)||photographed;
   const card=panel(this.scene,x,y,width,height);
   card.setFillStyle(seen?0x0c2a40:0x0b1d2c,.98);
   this.albumCards.add(card);
   this.albumCards.add(this.scene.add.rectangle(x+width/2,photoY,photoWidth,photoHeight,seen?0x597b83:0x173448));
   const texture=w.photoTextures.get(data.id);
   if(photographed&&texture&&this.scene.textures.exists(texture)){
    this.albumCards.add(this.scene.add.image(x+width/2,photoY,texture).setDisplaySize(photoWidth,photoHeight));
   }else if(seen){
    const frame=w.photoFrames.get(data.id)??0;
    this.albumCards.add(this.scene.add.image(x+width/2,photoY,data.texture,frame).setScale(mobile?1.3:data.id==='condor'?1:.72));
   }else{
    this.albumCards.add(label(this.scene,x+width/2,photoY-(mobile?42:25),'?',mobile?72:46,'#7698a1').setOrigin(.5,0));
   }
   this.albumCards.add(label(this.scene,x+10,y+(mobile?198:111),seen?data.name:'POR DESCUBRIR',mobile?25:16,seen?'#ffe0a1':'#9cb3bb'));
   this.albumCards.add(label(this.scene,x+10,y+(mobile?234:132),photographed?`FOTO · ${w.photos.get(data.id)} puntos`:seen?'AVISTADO · SIN FOTO':'BUSCÁ UN RASTRO EN EL SENDERO',mobile?18:12,photographed?'#9bdab5':'#b3c0c2'));
   if(seen)this.albumCards.add(label(this.scene,x+10,y+(mobile?268:151),data.fact,mobile?18:11).setWordWrapWidth(mobile?425:270));
  });
  if(mobile){
   const pages=Math.ceil(entries.length/2);
   const previous=label(this.scene,240,585,'◀',28,'#ffd276').setOrigin(.5).setPadding(28,8).setBackgroundColor('#143d54').setInteractive();
   const next=label(this.scene,950,585,'▶',28,'#ffd276').setOrigin(.5).setPadding(28,8).setBackgroundColor('#143d54').setInteractive();
   previous.on('pointerdown',()=>this.changeAlbumPage(w,-1));
   next.on('pointerdown',()=>this.changeAlbumPage(w,1));
   this.albumCards.add([previous,next,label(this.scene,640,578,`PÁGINA ${this.albumPage+1}/${pages}`,20,'#ffd276').setOrigin(.5,0)]);
  }
 }
}
