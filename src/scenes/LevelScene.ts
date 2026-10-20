import Phaser from 'phaser';
import {Traveler} from '../entities/Traveler';
import {CompanionAI} from '../systems/CompanionAI';
import {WildlifeSystem} from '../systems/WildlifeSystem';
import {BiomeBackdrop,DepthLayers,landscape} from '../systems/Landscape';
import {HUD} from '../ui/HUD';
import {label} from '../ui/theme';
import {zones} from '../data/wildlife';
export class LevelScene extends Phaser.Scene{
 player!:Traveler;companion!:Traveler;wildlife!:WildlifeSystem;ai!:CompanionAI;hud!:HUD;backdrop!:BiomeBackdrop;layers!:DepthLayers;keys!:Record<string,Phaser.Input.Keyboard.Key>;binoculars=false;aim={x:820,y:450};idle=0;vibes=false;seen=new Set<number>();checkpoint=140;lastPhoto=-1000;noticeTimer?:Phaser.Time.TimerEvent;touchMove=0;capturePending=false;
 constructor(){super('LevelScene');}
 create(){this.binoculars=false;this.idle=0;this.vibes=false;this.seen=new Set();this.checkpoint=140;this.lastPhoto=-1000;this.touchMove=0;landscape(this,11200,false);this.backdrop=new BiomeBackdrop(this);this.layers=new DepthLayers(this);this.physics.world.setBounds(0,0,11200,900);const ground=this.physics.add.staticGroup();const platforms=this.physics.add.staticGroup();const g=this.add.graphics().setVisible(false);
 const terrain=(x:number,y:number,w:number,h:number)=>{this.layers.terrain(x,y,w,h);const b=ground.create(x+w/2,y+h/2,'block') as Phaser.Physics.Arcade.Image;b.setDisplaySize(w,h).refreshBody().setVisible(false);g.fillStyle(0x6e624c);g.fillRect(x,y,w,h);g.fillStyle(0x3e6a4a);g.fillRect(x,y,w,12);g.fillStyle(0xb5aa6b);g.fillRect(x,y+12,w,5);for(let q=0;q<w;q+=39){g.fillStyle(q%2?0x867657:0x5c5545);g.fillRect(x+q,y+28+(q%43),18,8);}};
 terrain(0,600,11200,300);
 for(const x of [660,2740,4930,7120,9070]){
  this.layers.terrain(x,484,220,18);
  const ledge=platforms.create(x+110,493,'block') as Phaser.Physics.Arcade.Image;
  ledge.setDisplaySize(220,18).refreshBody().setVisible(false);
  this.add.rectangle(x+110,507,220,7,0x293f32).setDepth(-1);
 }
 this.player=new Traveler(this,140,'pablo');this.companion=new Traveler(this,65,'lujan');this.physics.add.collider(this.player,ground);this.physics.add.collider(this.companion,ground);
 const landOnLedge=(actor:unknown,ledge:unknown)=>{const body=(actor as Traveler).body as Phaser.Physics.Arcade.Body;const top=((ledge as Phaser.Physics.Arcade.Image).body as Phaser.Physics.Arcade.StaticBody).top;return body.velocity.y>=0&&body.bottom<=top+18;};
 this.physics.add.collider(this.player,platforms,undefined,landOnLedge);this.physics.add.collider(this.companion,platforms,undefined,landOnLedge);
 this.ai=new CompanionAI();this.wildlife=new WildlifeSystem(this);this.hud=new HUD(this);this.keys=this.input.keyboard!.addKeys('A,D,LEFT,RIGHT,UP,DOWN,SPACE,Q,F,E,TAB,ESC') as Record<string,Phaser.Input.Keyboard.Key>;this.input.keyboard!.addCapture(['SPACE','TAB','UP','DOWN']);this.cameras.main.setBounds(0,0,11200,720).startFollow(this.player,true,.09,.09,-170,90);
 const press=(key:string,action:()=>void)=>this.input.keyboard!.on(`keydown-${key}`,(event:KeyboardEvent)=>{if(!event.repeat)action();});
 press('SPACE',()=>this.jump());press('E',()=>this.interact());press('Q',()=>this.toggleBinoculars());press('F',()=>this.photo());press('TAB',()=>this.album());press('ESC',()=>{if(this.hud.album.visible)this.album();});
 for(const a of this.wildlife.animals){this.add.rectangle(a.data.x-277,580,8,40,0x72573d);}
 label(this,10720,499,'FIN DEL SENDERO\nE · celebrar el viaje',22,'#ffdda0');this.add.rectangle(10940,520,8,160,0x72573d);this.add.rectangle(10995,470,104,64,0xf2d394);label(this,10948,451,'JUNTOS\nAL SUR',17,'#081f35');
 this.input.addPointer(2);
 const setAim=(p:Phaser.Input.Pointer)=>{if(!this.binoculars||(!this.sys.game.device.os.desktop&&p.y>=570))return;this.aim.x=Phaser.Math.Clamp(p.x,20,1260);this.aim.y=Phaser.Math.Clamp(p.y,130,625);};
 this.input.on('pointermove',setAim);this.input.on('pointerdown',setAim);
 this.createMobileControls();
 this.say('Luján: Trajiste el mapa, ¿no?\nPablo: Sí. El zorro todavía no confirmó el itinerario.');
 }
 createMobileControls(){
  if(this.sys.game.device.os.desktop)return;
  document.querySelector('.mobile-controls')?.remove();
  const root=document.createElement('div');root.className='mobile-controls';root.innerHTML=`<button class="fullscreen" aria-label="Pantalla completa">⛶</button><div class="move"><button data-hold="left" aria-label="Mover a la izquierda">◀</button><button data-action="jump" aria-label="Saltar">▲</button><button data-hold="right" aria-label="Mover a la derecha">▶</button></div><div class="album-navigation"><button data-action="prev-page" aria-label="Página anterior">◀</button><button data-action="next-page" aria-label="Página siguiente">▶</button></div><div class="actions"><button data-action="binoculars">Q<br><small>mirar</small></button><button data-action="photo">F<br><small>foto</small></button><button data-action="talk">E<br><small>hablar</small></button><button data-action="album">☰<br><small>álbum</small></button><button data-action="back">↩<br><small>volver</small></button></div><div class="hint">Mantené ◀ ▶ para caminar · Q binoculares · F foto</div>`;
  document.body.appendChild(root);
  this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>root.remove());
  root.querySelector('.fullscreen')?.addEventListener('click',()=>document.dispatchEvent(new Event('game-fullscreen')));
  root.querySelectorAll<HTMLElement>('[data-action]').forEach(button=>button.addEventListener('pointerdown',event=>{event.preventDefault();const action=button.dataset.action;if(action==='jump')this.jump();if(action==='binoculars')this.toggleBinoculars();if(action==='photo')this.photo();if(action==='talk')this.interact();if(action==='album')this.album();if(action==='back'&&this.hud.album.visible)this.album();if(action==='prev-page')this.hud.changeAlbumPage(this.wildlife,-1);if(action==='next-page')this.hud.changeAlbumPage(this.wildlife,1);}));
  root.querySelectorAll<HTMLElement>('[data-hold]').forEach(button=>{const set=(value:number)=>(event:Event)=>{event.preventDefault();this.touchMove=value;};button.addEventListener('pointerdown',set(button.dataset.hold==='left'?-1:1));['pointerup','pointercancel','pointerleave'].forEach(type=>button.addEventListener(type,()=>this.touchMove=0));});
 }
 say(text:string){this.noticeTimer?.remove();this.hud.notice.setText(text).setVisible(true);this.noticeTimer=this.time.delayedCall(5200,()=>this.hud.notice.setVisible(false));}
 jump(){if(!this.hud.album.visible&&!this.binoculars)this.player.requestJump(this.time.now);}
 toggleBinoculars(){if(this.hud.album.visible)return;this.binoculars=!this.binoculars;this.wildlife.focus=0;this.hud.hint.setText(this.binoculars?'MIRAR: arrastrá / flechas · seguí al animal · F foto · Q salir':'A/D mover · ESPACIO saltar · E investigar rastros · Q mirar · F foto · TAB álbum');}
 album(){this.hud.toggleAlbum(this.wildlife);document.querySelector('.mobile-controls')?.classList.toggle('album-open',this.hud.album.visible);if(this.hud.album.visible)this.physics.pause();else this.physics.resume();}
 photo(){if(this.hud.album.visible||!this.binoculars||this.time.now-this.lastPhoto<700)return;this.lastPhoto=this.time.now;this.player.pose('photo',420);const photo=this.wildlife.photo(this.player.x,{x:this.aim.x+this.cameras.main.scrollX,y:this.aim.y+this.cameras.main.scrollY});if(photo){
  if(photo.improved){
   this.capturePending=true;
   const x=Phaser.Math.Clamp(photo.a.sprite.x-this.cameras.main.scrollX-130,0,1020);
   const y=Phaser.Math.Clamp(photo.a.sprite.y-this.cameras.main.scrollY-50,0,620);
   this.game.renderer.snapshotArea(x,y,260,100,snapshot=>{
    this.capturePending=false;
    if(!(snapshot instanceof HTMLImageElement))return;
    const key=`fauna-photo-${photo.a.data.id}`;
    if(this.textures.exists(key))this.textures.remove(key);
    this.textures.addBase64(key,snapshot.src);
    this.wildlife.photoTextures.set(photo.a.data.id,key);
   },'image/png');
  }
  if(photo.improved)this.time.delayedCall(50,()=>this.cameras.main.flash(100,255,244,218));
  else this.cameras.main.flash(100,255,244,218);
  this.say(`${photo.newSighting?'AVISTADO Y FOTOGRAFIADO':'FOTO'} · ${photo.a.data.name} · ${photo.score} puntos`);
 }else this.say('Buscá un animal dentro del círculo para sacar una foto.');}
 interact(){if(this.hud.album.visible)return;this.player.pose('interact',650);if(this.player.x>10650){if(this.wildlife.count===5)this.scene.start('EndingScene',{bonus:this.wildlife.found.has('bonus'),score:[...this.wildlife.photos.values()].reduce((a,b)=>a+b,0)});else this.say(`Luján: Nos faltan ${5-this.wildlife.count} especies. Volvamos a los miradores.`);return;}
 const clue=this.wildlife.inspectClue(this.player.x);
 if(clue){this.say(`LUJÁN: ¡Encontré un rastro! ${clue.data.name} está cerca.\nQ para observar; seguí su movimiento con el círculo.`);this.aim.x=Phaser.Math.Clamp(clue.sprite.x-this.cameras.main.scrollX,20,1260);this.aim.y=clue.sprite.y;}
 else this.say(this.wildlife.count===5?'Luján: Ya están las cinco. ¡Un zorro nos espera antes del final!':'Luján: Busquemos los rastros marcados con ?; E para investigarlos.');}
 update(time:number,delta:number){if(!this.player)return;const dt=Math.min(delta,50);if(this.hud.album.visible)return;
 let direction=(this.keys.D.isDown||(!this.binoculars&&this.keys.RIGHT.isDown)?1:0)-(this.keys.A.isDown||(!this.binoculars&&this.keys.LEFT.isDown)?1:0)+this.touchMove;direction=Phaser.Math.Clamp(direction,-1,1);this.player.walk(this.binoculars?0:direction*185,time,dt);if(this.binoculars)this.player.pose('observe');this.ai.update(this.player,this.companion,time,this.cameras.main.scrollX,dt);if(this.player.y>760){this.player.setPosition(this.checkpoint,450).setVelocity(0);this.say('Luján: Probemos de nuevo desde el sendero.');}if(this.companion.y>760)this.companion.setPosition(Math.max(20,this.player.x-100),420).setVelocity(0);if((this.player.body as Phaser.Physics.Arcade.Body).blocked.down)this.checkpoint=this.player.x;
 if(this.binoculars){this.aim.x=Phaser.Math.Clamp(this.aim.x+(Number(this.keys.RIGHT.isDown)-Number(this.keys.LEFT.isDown))*dt*.4,20,1260);this.aim.y=Phaser.Math.Clamp(this.aim.y+(Number(this.keys.DOWN.isDown)-Number(this.keys.UP.isDown))*dt*.4,130,625);}
 const aim=this.binoculars?{x:this.aim.x+this.cameras.main.scrollX,y:this.aim.y+this.cameras.main.scrollY}:null;this.wildlife.update(dt,this.player.x,aim,a=>{this.say(`AVISTAMIENTO · ${a.data.name}\n${this.wildlife.found.size}/5 · ${a.data.fact}`);});this.hud.aim.clear();if(this.binoculars&&!this.capturePending){this.hud.aim.lineStyle(3,0xffdd93,.95).strokeCircle(this.aim.x,this.aim.y,78);this.hud.aim.lineBetween(this.aim.x-10,this.aim.y,this.aim.x+10,this.aim.y);this.hud.aim.lineBetween(this.aim.x,this.aim.y-10,this.aim.x,this.aim.y+10);this.hud.aim.fillStyle(0x081f35,.8).fillRect(this.aim.x-64,this.aim.y+89,128,12);this.hud.aim.fillStyle(0xffdd93).fillRect(this.aim.x-60,this.aim.y+92,120*this.wildlife.focus/this.wildlife.focusGoal,6);}
 if(!this.binoculars)this.hud.hint.setText(this.wildlife.nearbyClue?'RASTRO CERCANO · E investigar · Q observar · F fotografiar':'A/D mover · ESPACIO saltar · E investigar rastros · Q mirar · F foto · TAB álbum');
 this.backdrop.update(this.player.x);const zone=this.backdrop.zone;this.hud.update(this.wildlife,zones[zone]);if(!this.seen.has(zone)){this.seen.add(zone);if(zone>0)this.say(['','Pablo: El lago salió igual que en la foto.\nLuján: Falta que vos salgas enfocado.','Luján: El guanaco nos está evaluando.\nPablo: Espero que no pida referencias.','Pablo: ¿Escuchás ese golpeteo?\nLuján: El carpintero sí trajo herramientas.','Luján: Despacio. El huemul merece silencio.\nPablo: Mi mejor comentario hasta ahora.'][zone]);}
 const still=Math.abs(this.player.body!.velocity.x)<1&&Math.abs(this.player.body!.velocity.y)<1;this.idle=still?this.idle+dt:0;if(this.idle>=10000&&!this.vibes){this.vibes=true;this.say('♥ GOOD VIBES ONLY ♥\nNo es solo un destino… es con vos.');}if(!still)this.vibes=false;
 }
}


