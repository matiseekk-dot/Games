// marketing/shorts-music.mjs
//
// Własny podkład do shortów w klimacie synthwave (bez praw autorskich osób trzecich,
// więc pasuje też do Reels, TikToka i reklam). Syntezujemy go w JS: arpeggio z
// rozstrojonych pił, bas na ósemkach, miękka stopa i hi-hat. ffmpeg dokłada pogłos,
// łagodzi górę i wyrównuje głośność. Wynik zawsze ten sam (stałe ziarno losowe).

import fs from 'fs'
import { execFileSync } from 'child_process'

const SR = 44100
const BPM = 104
const BEAT = 60 / BPM
const BAR = BEAT * 4
// Am F C G, dwa razy, potem Dm F G Am i jeszcze raz Am F C G: 16 taktów, ok. 37 s.
const PROG = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Dm', 'F', 'G', 'Am', 'Am', 'F', 'C', 'G']
const CHORDS = { Am: [57, 60, 64], F: [53, 57, 60], C: [55, 60, 64], G: [55, 59, 62], Dm: [50, 53, 57] }
const ROOT = { Am: 45, F: 41, C: 48, G: 43, Dm: 38 }

const freq = m => 440 * 2 ** ((m - 69) / 12)
let seed = 11
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

// Piła z kilku harmonicznych (bez aliasingu), dwie lekko rozstrojone kopie.
function saw(t, f, n = 7) {
  let s = 0
  for (let k = 1; k <= n; k++) s += Math.sin(2 * Math.PI * f * k * t) / k
  return s
}

function add(L, R, t0, len, fn, pan = 0) {
  const start = Math.round(t0 * SR)
  const n = Math.round(len * SR)
  const gl = Math.cos((pan + 1) * Math.PI / 4)
  const gr = Math.sin((pan + 1) * Math.PI / 4)
  for (let i = 0; i < n && start + i < L.length; i++) {
    const v = fn(i / SR)
    L[start + i] += v * gl
    R[start + i] += v * gr
  }
}

function arp(L, R, t0, midi, vel, pan) {
  const f = freq(midi)
  add(L, R, t0, 0.5, t => {
    const env = (t < 0.005 ? t / 0.005 : 1) * Math.exp(-7 * t)
    return vel * env * (saw(t, f) + saw(t, f * 1.006)) * 0.5
  }, pan)
}

function bass(L, R, t0, midi, len) {
  const f = freq(midi)
  add(L, R, t0, len, t => {
    const env = (t < 0.01 ? t / 0.01 : 1) * Math.exp(-2.2 * t) * (t > len - 0.03 ? (len - t) / 0.03 : 1)
    return 0.32 * env * (Math.sin(2 * Math.PI * f * t) + 0.35 * saw(t, f, 4))
  })
}

function pad(L, R, t0, notes, len) {
  for (const [j, m] of notes.entries()) {
    const f = freq(m + 12)
    add(L, R, t0, len, t => {
      const env = Math.min(1, t / 0.6) * Math.min(1, (len - t) / 0.6)
      return 0.035 * env * (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 2.003 * t))
    }, j === 0 ? -0.5 : j === 1 ? 0 : 0.5)
  }
}

function kick(L, R, t0) {
  add(L, R, t0, 0.35, t => 0.55 * Math.exp(-9 * t) * Math.sin(2 * Math.PI * (48 + 90 * Math.exp(-30 * t)) * t))
}

function hat(L, R, t0, vel) {
  add(L, R, t0, 0.06, t => vel * Math.exp(-70 * t) * (rand() * 2 - 1), 0.3)
}

export function buildMusic(outWav, ffmpeg = 'ffmpeg') {
  const total = PROG.length * BAR + 2
  const N = Math.round(total * SR)
  const L = new Float32Array(N)
  const R = new Float32Array(N)
  PROG.forEach((c, b) => {
    const t0 = b * BAR
    const notes = CHORDS[c]
    // Pierwsze 2 takty bez perkusji: spokojne wejście pod hook.
    const drums = b >= 2
    pad(L, R, t0, notes, BAR + 0.3)
    // Arpeggio szesnastkami: w górę i w dół po akordzie, z oktawą.
    const seq = [notes[0], notes[1], notes[2], notes[0] + 12, notes[2], notes[1]]
    for (let k = 0; k < 16; k++) {
      const vel = (k % 4 === 0 ? 0.16 : 0.1) * (0.9 + rand() * 0.2)
      arp(L, R, t0 + k * BEAT / 4, seq[k % seq.length] + 12, vel, k % 2 ? 0.35 : -0.35)
    }
    for (let k = 0; k < 8; k++) bass(L, R, t0 + k * BEAT / 2, ROOT[c] + (k % 2 ? 12 : 0), BEAT / 2 - 0.02)
    if (drums) for (let k = 0; k < 4; k++) {
      kick(L, R, t0 + k * BEAT)
      hat(L, R, t0 + k * BEAT + BEAT / 2, 0.07)
    }
  })
  // Normalizacja i zapis 16-bit WAV.
  let peak = 0
  for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]))
  const buf = Buffer.alloc(44 + N * 4)
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24)
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40)
  for (let i = 0; i < N; i++) {
    buf.writeInt16LE(Math.round(L[i] / peak * 0.9 * 32767), 44 + i * 4)
    buf.writeInt16LE(Math.round(R[i] / peak * 0.9 * 32767), 46 + i * 4)
  }
  const raw = outWav.replace(/\.wav$/, '-raw.wav')
  fs.writeFileSync(raw, buf)
  execFileSync(ffmpeg, ['-y', '-i', raw, '-af',
    'lowpass=f=7000,aecho=0.8:0.6:120|240:0.25|0.15,loudnorm=I=-16:TP=-1.5:LRA=9',
    '-ar', String(SR), outWav], { stdio: ['ignore', 'ignore', 'pipe'] })
  return outWav
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(buildMusic(process.argv[2] || 'music.wav'))
}
