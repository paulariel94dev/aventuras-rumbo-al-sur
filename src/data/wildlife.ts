export type WildlifeTexture='fox'|'guanaco'|'condor'|'woodpecker'|'huemul';
export type Species={id:string;name:string;x:number;y:number;color:number;kind:'fox'|'deer'|'bird'|'woodpecker';texture:WildlifeTexture;fact:string;bonus?:boolean};
export const species:Species[]=[
{id:'zorro',name:'Zorro colorado',x:1050,y:557,color:0xc56b36,kind:'fox',texture:'fox',fact:'Su cola tupida lo abriga en el frío patagónico.'},
{id:'condor',name:'Cóndor andino',x:3200,y:340,color:0x263343,kind:'bird',texture:'condor',fact:'Aprovecha las corrientes de aire para planear.'},
{id:'guanaco',name:'Guanaco',x:5350,y:550,color:0xcfa477,kind:'deer',texture:'guanaco',fact:'Vive en grupos y se comunica con posturas y sonidos.'},
{id:'carpintero',name:'Carpintero gigante',x:7480,y:420,color:0xbd493c,kind:'woodpecker',texture:'woodpecker',fact:'Su golpeteo resuena en los bosques australes.'},
{id:'huemul',name:'Huemul',x:9400,y:550,color:0x8b8066,kind:'deer',texture:'huemul',fact:'Un ciervo nativo: observarlo de lejos ayuda a cuidarlo.'},
{id:'bonus',name:'Zorro de la despedida',x:10400,y:557,color:0xe19845,kind:'fox',texture:'fox',bonus:true,fact:'No era una sexta especie. Era un último compañero de viaje.'}
] as Species[];
export const zones=['BOSQUE PATAGÓNICO','LAGO Y MONTAÑA','ESTEPA','BOSQUE HÚMEDO','VALLE DEL ENCUENTRO'];


