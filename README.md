# Aventuras en Equipo: Rumbo al Sur

MVP original en TypeScript, Phaser 3 y Vite. Instalación: `npm install`, luego `npm run dev`. Build: `npm run build`.

## Cómo jugar

A/D o flechas: caminar. Espacio: saltar. B: alternar binoculares. Mouse o flechas: apuntar mientras observás. Mantené un animal dentro del círculo 1,5 segundos para registrarlo. F: fotografía (binoculares activos). E: conversar o terminar en la bandera. Tab: álbum; Tab/Escape: cerrar. En pantallas táctiles hay controles visibles.

Recorré los cinco ambientes, observá las cinco especies y presioná E en el fin del sendero. Tras 5/5 se habilita el zorro bonus antes de la bandera; es un segundo encuentro, no una sexta especie. Podés terminar con 5/5 o 6/5. Diez segundos quietos activan GOOD VIBES ONLY. No hay combate ni pérdida de vidas. Los corazones representan la pareja, no daño. Las caídas devuelven al último suelo seguro.

El recorrido mide 44.800 px; avanzar a pie lleva ~4,8 minutos sin paradas. Exploración, enfoque y fotos apuntan a una sesión de 5–10 minutos, pendiente de medir con jugadores. Sin guardado persistente; reiniciar empieza un viaje nuevo.

## Estructura y arte

`scenes/`: BootScene genera texturas, MenuScene, LevelScene, EndingScene. `entities/`: Traveler. `systems/`: CompanionAI, WildlifeSystem, Landscape. `data/wildlife.ts`: especies, ubicaciones y fichas. `ui/`: HUD y tema.

Pablo y Luján usan hojas originales de 15 cuadros; cada especie utiliza una hoja original de 8 cuadros con reposo, movimiento, alerta y conducta tranquila. Los cinco ambientes cuentan con fondos propios y fundidos de 900 ms al cruzar de zona. Las fuentes de alta resolución se conservan en `public/assets/characters/source/` y `public/assets/wildlife/source/`; los procesadores de `tools/` regeneran las hojas transparentes listas para Phaser. Los archivos `sprites.json` documentan los cuadros. No se incluyen sprites de juegos ajenos. La lógica de fauna permanece independiente del HUD. Las mejores fotos por encuentro suman: centrado (350), distancia ideal de 240 px (350) y comportamiento (hasta 300).

MVP para teclado/mouse; controles táctiles básicos. Sin audio. Los animales son accesibles de forma permanente para evitar perder objetivos. Álbum pausa física y observación. La IA no colisiona con Pablo, salta obstáculos, recupera caídas y reaparece detrás de cámara si supera 1.500 px de distancia.

