const { chromium } = require('C:/Users/Pablo Amendolara/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const executablePath = 'C:/Users/Pablo Amendolara/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe';
const zones = [
  ['forest', 'zorro'],
  ['lake', 'condor'],
  ['steppe', 'guanaco'],
  ['rainforest', 'carpintero'],
  ['valley', 'huemul'],
];

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('http://127.0.0.1:5174');
  await page.waitForFunction(() => window.game?.scene.isActive('MenuScene'));

  const preload = await page.evaluate(() => {
    const game = window.game;
    const wildlife = ['fox', 'guanaco', 'condor', 'woodpecker', 'huemul'];
    const biomes = ['forest', 'lake', 'steppe', 'rainforest', 'valley'];
    return {
      frames: wildlife.every(key => game.textures.get(key).frameTotal - 1 === 8),
      animations: wildlife.every(key => game.anims.exists(`${key}-idle`) && game.anims.exists(`${key}-moving`)),
      biomes: biomes.every(key => game.textures.exists(`biome-${key}`)),
    };
  });

  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.game.scene.isActive('LevelScene'));
  const observations = [];
  for (let index = 0; index < zones.length; index++) {
    const [biome, speciesId] = zones[index];
    await page.evaluate(({ index, speciesId }) => {
      const scene = window.game.scene.getScene('LevelScene');
      const animal = scene.wildlife.animals.find(item => item.data.id === speciesId);
      scene.player.setPosition(animal.data.x - 260, 500).setVelocity(0);
      scene.companion.setPosition(animal.data.x - 340, 500).setVelocity(0);
      scene.backdrop.update(index * 8960 + 100);
      scene.cameras.main.centerOn(animal.data.x, 360);
    }, { index, speciesId });
    await page.waitForTimeout(1050);
    const state = await page.evaluate(speciesId => {
      const scene = window.game.scene.getScene('LevelScene');
      const animal = scene.wildlife.animals.find(item => item.data.id === speciesId);
      return {
        zone: scene.backdrop.zone,
        texture: animal.sprite.texture.key,
        visible: animal.sprite.visible && animal.sprite.alpha > 0,
        state: animal.state,
        stateVisual: animal.state === 'alert' ? Number(animal.sprite.frame.name) === 6 : animal.sprite.anims.currentAnim?.key === `${animal.data.texture}-${animal.state}`,
      };
    }, speciesId);
    observations.push({ biome, speciesId, ...state });
    await page.screenshot({ path: `artifacts/qa-zone-${index + 1}-${biome}.png` });
  }

  const report = { ...preload, zones: observations, consoleErrors: errors.filter(error => !error.includes('favicon')) };
  console.log(JSON.stringify(report, null, 2));
  const zonesPass = observations.every((item, index) => item.zone === index && item.visible && item.stateVisual);
  const texturesPass = observations.every(item => ({ zorro: 'fox', condor: 'condor', guanaco: 'guanaco', carpintero: 'woodpecker', huemul: 'huemul' })[item.speciesId] === item.texture);
  await browser.close();
  if (!preload.frames || !preload.animations || !preload.biomes || !zonesPass || !texturesPass || report.consoleErrors.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exit(1); });
