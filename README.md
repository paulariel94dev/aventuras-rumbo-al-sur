# Aventuras en Equipo: Rumbo al Sur

MVP original en TypeScript, Phaser 3 y Vite. Demo pública: https://paulariel94dev.github.io/aventuras-rumbo-al-sur/. Cada push a `main` publica automáticamente `dist` en GitHub Pages. Instalación: `npm install`, luego `npm run dev`. Build: `npm run build`.

## Cómo jugar

A/D o flechas: caminar. Espacio: saltar. Buscá los rastros con `?` y presioná E para investigarlos. Q: alternar binoculares. Mouse, toque o flechas: seguir al animal mientras observás. Mantenelo dentro del círculo 1,5 segundos acumulados para registrarlo; si se escapa, el progreso baja poco a poco. F: fotografía (binoculares activos); una foto bien centrada también registra la especie. E: investigar, conversar o terminar en la bandera. Tab: álbum; Tab/Escape: cerrar. En pantallas táctiles hay un mando visible.

Recorré los cinco ambientes, observá las cinco especies y presioná E en el fin del sendero. Tras 5/5 se habilita el zorro bonus antes de la bandera; es un segundo encuentro, no una sexta especie. Podés terminar con 5/5 o 6/5. Diez segundos quietos activan GOOD VIBES ONLY. No hay combate ni pérdida de vidas. Los corazones representan la pareja, no daño. Las caídas devuelven al último suelo seguro.

El recorrido mide 11.200 px. El sendero principal es continuo; las plataformas elevadas son opcionales, se atraviesan desde abajo y se pisan al caer. El salto admite una pulsación apenas antes de aterrizar o después de dejar el borde. Sin guardado persistente; reiniciar empieza un viaje nuevo.

## Estructura y arte

`scenes/`: BootScene genera texturas, MenuScene, LevelScene, EndingScene. `entities/`: Traveler. `systems/`: CompanionAI, WildlifeSystem, Landscape. `data/wildlife.ts`: especies, ubicaciones y fichas. `ui/`: HUD y tema.

Pablo y Luján usan hojas originales de 15 cuadros; cada especie utiliza una hoja original de 8 cuadros con reposo, movimiento, alerta y conducta tranquila. El cóndor mantiene el vuelo animado aun después del avistamiento. Los cinco ambientes cuentan con fondos propios y fundidos de 900 ms al cruzar de zona. Las fuentes de alta resolución se conservan en `public/assets/characters/source/` y `public/assets/wildlife/source/`; los procesadores de `tools/` regeneran las hojas transparentes listas para Phaser. Los archivos `sprites.json` documentan los cuadros. No se incluyen sprites de juegos ajenos. La lógica de fauna permanece independiente del HUD. Las mejores fotos por encuentro suman: centrado (350), distancia ideal de 240 px (350) y comportamiento (hasta 300). El álbum muestra el recorte real de la mejor foto y, en móvil, se recorre de a dos fichas por página.

MVP para teclado, mouse y controles táctiles. Sin audio. Los animales permanecen disponibles para evitar perder objetivos, pero primero hay que investigar su rastro. Álbum pausa física y observación. La IA no colisiona con Pablo, salta obstáculos, recupera caídas y reaparece detrás de cámara si queda demasiado lejos.

