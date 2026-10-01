import Phaser from 'phaser';
import {BootScene} from './scenes/BootScene';
import {MenuScene,EndingScene} from './scenes/MenuScene';
import {LevelScene} from './scenes/LevelScene';
import './style.css';
const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:1280,height:720,backgroundColor:'#081f35',pixelArt:true,roundPixels:true,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{gravity:{x:0,y:1100},debug:false}},scene:[BootScene,MenuScene,LevelScene,EndingScene]});
if(import.meta.env.DEV) Object.assign(window,{game});
