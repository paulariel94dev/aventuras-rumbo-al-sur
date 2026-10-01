import Phaser from 'phaser';
import {label,panel} from './theme';
import {species} from '../data/wildlife';
import {WildlifeSystem} from '../systems/WildlifeSystem';
export class HUD{
 status:Phaser.GameObjects.Text;zone:Phaser.GameObjects.Text;notice:Phaser.GameObjects.Text;album:Phaser.GameObjects.Container;albumText:Phaser.GameObjects.Text;aim:Phaser.GameObjects.Graphics;hint:Phaser.GameObjects.Text;
 constructor(s:Phaser.Scene){
 const top=s.add.container(0,0).setScrollFactor(0).setDepth(50);top.add(panel(s,18,17,348,106));for(let i=0;i<2;i++){top.add(s.add.sprite(52,42+i*49,i?'lujan':'pablo',0).setScale(.38));top.add(label(s,85,27+i*49,`PLAYER ${i+1}  ${i?'LA COMPAÑERA':'EL PLAN'}`,15));top.add(label(s,85,47+i*49,'♥ ♥ ♥ ♥ ♥',19,'#f18478'));}
 top.add(panel(s,938,17,324,160));this.status=label(s,952,28,'',15);top.add(this.status);this.zone=label(s,650,35,'',16).setOrigin(.5);top.add(this.zone);top.add(label(s,650,61,'RUMBO AL SUR',24,'#ffd276').setOrigin(.5));
 const bottom=s.add.container(0,0).setScrollFactor(0).setDepth(50);bottom.add(panel(s,18,645,1244,58));this.hint=label(s,37,664,'A/D mover · ESPACIO saltar · Q observar · F foto · E hablar · TAB álbum',17);bottom.add(this.hint);
 this.notice=label(s,640,190,'',21).setOrigin(.5,0).setWordWrapWidth(850).setPadding(16,12).setBackgroundColor('#081f35').setScrollFactor(0).setDepth(70).setVisible(false);
 this.aim=s.add.graphics().setScrollFactor(0).setDepth(55);
 this.album=s.add.container(0,0).setScrollFactor(0).setDepth(90).setVisible(false);this.album.add(panel(s,240,135,800,480));this.album.add(label(s,275,165,'CUADERNO DE FAUNA',30,'#ffd276'));this.albumText=label(s,275,224,'',15).setLineSpacing(3);this.album.add(this.albumText);this.album.add(label(s,275,574,'TAB / ESC · volver al sendero',18));
 }
 update(w:WildlifeSystem,zone:string){this.zone.setText(zone);this.status.setText(`FAUNA  ${w.found.size}/5\nFOTOS  ${[...w.photos.values()].reduce((a,b)=>a+b,0)} puntos\n${species.filter(a=>!a.bonus).map(a=>(w.found.has(a.id)?"✓ ":"○ ")+a.name).join("\n")}`);}
 toggleAlbum(w:WildlifeSystem){this.album.setVisible(!this.album.visible);this.albumText.setText(species.filter(x=>!x.bonus||w.found.has(x.id)).map(x=>w.found.has(x.id)?`✓ ${x.name}  [foto: ${w.photos.get(x.id)||0}]\n  ${x.fact}`:`○ ${x.name} · por descubrir`).join('\n\n'));}
}
