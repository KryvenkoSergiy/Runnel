// Regenerates public/og.png (the four heroes as a 2x2 collage, 1200x630) and docs/looks/<id>.jpg for the README.
// Needs a running production preview (`npm run build && npm run preview`) and a local Chrome.
// Usage: node scripts/og.mjs [baseUrl]   (CHROME=/path/to/chrome to override the binary)
// Drives Chrome over the DevTools Protocol in real time: `chrome --screenshot` uses virtual time and
// freezes the intro animations halfway.
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const base = process.argv[2] ?? 'http://localhost:4173'
const bin = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const looks = ['paper', 'night', 'swiss', 'soft']
const out = new URL('../public/og.png', import.meta.url)
const shots = new URL('../docs/looks/', import.meta.url)
const profile = mkdtempSync(join(tmpdir(), 'runnel-og-'))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = spawn(bin, ['--headless=new', '--remote-debugging-port=9333', '--hide-scrollbars', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
try {
  let ver
  for (let i = 0; i < 50 && !ver; i++) {
    try { ver = await (await fetch('http://127.0.0.1:9333/json/version')).json() } catch { await sleep(200) }
  }
  if (!ver) throw new Error(`Chrome did not start: ${bin}`)

  const ws = new WebSocket(ver.webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r))
  let id = 0
  const pending = new Map()
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    pending.get(m.id)?.(m)
    pending.delete(m.id)
  })
  const send = (method, params = {}, sessionId) => new Promise((r) => {
    pending.set(++id, r)
    ws.send(JSON.stringify({ id, method, params, sessionId }))
  })

  const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' })
  const { result: { sessionId: s } } = await send('Target.attachToTarget', { targetId, flatten: true })
  // Reduced motion: intros land instantly and the hero's autoplay waits, so every look is caught at rest.
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, s)
  const shoot = async (url, scale, wait, format = 'png') => {
    await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: scale, mobile: false }, s)
    await send('Page.navigate', { url }, s)
    await sleep(wait)
    // The floating "How it's built" button does not belong in a preview.
    await send('Runtime.evaluate', { expression: `document.querySelector('.built-toggle')?.remove()` }, s)
    await sleep(300)
    return (await send('Page.captureScreenshot', { format, quality: format === 'jpeg' ? 85 : undefined }, s)).result.data
  }

  const tiles = []
  mkdirSync(shots, { recursive: true })
  for (const look of looks) {
    tiles.push(await shoot(`${base}/?look=${look}`, 2, 3000))
    // The same view, again as a light JPEG: README images should not weigh megabytes.
    writeFileSync(new URL(`${look}.jpg`, shots), Buffer.from(await shoot(`${base}/?look=${look}`, 1, 3000, 'jpeg'), 'base64'))
  }
  const collage = join(profile, 'collage.html')
  writeFileSync(collage, `<body style="margin:0;display:grid;grid-template-columns:1fr 1fr;width:1200px;height:630px">${
    tiles.map((t) => `<img style="display:block;width:600px;height:315px" src="data:image/png;base64,${t}">`).join('')}</body>`)
  writeFileSync(out, Buffer.from(await shoot(`file://${collage}`, 1, 800), 'base64'))
  ws.close()
  console.log(`Wrote ${out.pathname}`)
} finally {
  // Chrome keeps writing its profile until it exits; removing it earlier fails.
  const exited = new Promise((r) => chrome.once('exit', r))
  chrome.kill()
  await exited
  rmSync(profile, { recursive: true, force: true })
}
