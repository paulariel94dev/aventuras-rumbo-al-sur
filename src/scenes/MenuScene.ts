import Phaser from 'phaser';
import {landscape} from '../systems/Landscape';
import {label,panel,button} from '../ui/theme';
export class MenuScene extends Phaser.Scene{
 constructor(){super('MenuScene');}
 create(){landscape(this);panel(this,240,115,800,475);label(this,640,155,'AVENTURAS EN EQUIPO',42,'#ffd276').setOrigin(.5);label(this,640,215,'RUMBO AL SUR',58).setOrigin(.5);label(this,640,273,'Misma dirección, nuevas especies.',22).setOrigin(.5);this.add.sprite(540,385,'pablo').setScale(.9).play('pablo-idle');this.add.sprite(730,385,'lujan').setScale(.9).play('lujan-idle');label(this,640,475,'Un sendero · cinco especies · todo el tiempo juntos',19).setOrigin(.5);button(this,640,542,'COMENZAR EL VIAJE  →',()=>this.scene.start('LevelScene'));label(this,640,639,'A / D o ← / → mover   ·   ESPACIO saltar   ·   Q binoculares',18).setOrigin(.5);label(this,640,671,'Mouse o flechas para enfocar · F foto · E conversar / finalizar · TAB álbum',16).setOrigin(.5);this.input.keyboard!.once('keydown-ENTER',()=>this.scene.start('LevelScene'));}
}
export class EndingScene extends Phaser.Scene{
 constructor(){super('EndingScene');}
 create(data:{bonus:boolean;score:number}){landscape(this);panel(this,205,125,870,470);label(this,640,183,'¡MISIÓN CUMPLIDA!',52,'#ffd276').setOrigin(.5);label(this,640,251,data.bonus?'6/5 · EL SUR TENÍA UNA SORPRESA MÁS':'5/5 · CUADERNO COMPLETO',26).setOrigin(.5);label(this,640,305,'Pablo: Teníamos un plan.\nLuján: Y el zorro tenía otro.',23).setOrigin(.5);this.add.sprite(570,410,'pablo',14).setScale(.82);this.add.sprite(705,410,'lujan',14).setScale(.82);label(this,640,495,`Mejores fotografías: ${data.score} puntos`,21).setOrigin(.5);button(this,640,552,'VOLVER A VIAJAR',()=>this.scene.start('MenuScene'));}
}
