const { chromium } = require('C:/Users/Pablo Amendolara/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const executablePath = 'C:/Users/Pablo Amendolara/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('http://127.0.0.1:5174');
  await page.waitForFunction(() => window.game?.scene.isActive('MenuScene'));
  const assets = await page.evaluate(() => ({
    pabloFrames: window.game.textures.get('pablo').frameTotal - 1,
    lujanFrames: window.game.textures.get('lujan').frameTotal - 1,
    idleAnimations: ['pablo-idle', 'lujan-idle'].every(key => window.game.anims.exists(key)),
    walkAnimations: ['pablo-walk', 'lujan-walk'].every(key => window.game.anims.exists(key)),
  }));

  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.game.scene.isActive('LevelScene'));
  await page.waitForTimeout(250);
  const startX = await page.evaluate(() => window.game.scene.getScene('LevelScene').player.x);
  await page.keyboard.down('d');
  await page.waitForTimeout(550);
  const walking = await page.evaluate(() => {
    const scene = window.game.scene.getScene('LevelScene');
    return { x: scene.player.x, animation: scene.player.anims.currentAnim?.key, companion: scene.companion.anims.currentAnim?.key };
  });
  await page.keyboard.up('d');

  const observeFrame = await page.evaluate(() => {
    const scene = window.game.scene.getScene('LevelScene');
    scene.binoculars = true;
    scene.player.pose('observe');
    return Number(scene.player.frame.name);
  });
  const photoFrame = await page.evaluate(() => {
    const scene = window.game.scene.getScene('LevelScene');
    scene.lastPhoto = -1000;
    scene.photo();
    return Number(scene.player.frame.name);
  });
  await page.waitForTimeout(500);
  const jumpFrame = await page.evaluate(() => {
    const scene = window.game.scene.getScene('LevelScene');
    scene.binoculars = false;
    scene.player.body.blocked.down = false;
    scene.player.setVelocityY(-470);
    scene.player.walk(0, scene.time.now);
    return Number(scene.player.frame.name);
  });
  await page.waitForTimeout(850);
  const interactFrame = await page.evaluate(() => {
    const scene = window.game.scene.getScene('LevelScene');
    scene.player.pose('interact', 650);
    return Number(scene.player.frame.name);
  });

  const report = {
    ...assets,
    playerMoved: walking.x > startX,
    walkAnimation: walking.animation === 'pablo-walk',
    companionAnimation: walking.companion === 'lujan-walk',
    observeFrame,
    photoFrame,
    jumpFrame,
    interactFrame,
    consoleErrors: errors.filter(message => !message.includes('404')),
  };
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  const framesPass = observeFrame === 11 && photoFrame === 12 && jumpFrame === 9 && interactFrame === 13;
  const booleansPass = assets.pabloFrames === 15 && assets.lujanFrames === 15 && assets.idleAnimations && assets.walkAnimations && report.playerMoved && report.walkAnimation && report.companionAnimation;
  if (!framesPass || !booleansPass || report.consoleErrors.length) process.exitCode = 1;
})().catch(error => {
  console.error(error);
  process.exit(1);
});
