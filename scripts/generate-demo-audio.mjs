import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const outputDir = join(rootDir, "apps/player/public/demo-assets/audio");

function createWav({ durationSeconds, sampleRate = 44100, generator }) {
  const sampleCount = Math.floor(durationSeconds * sampleRate);
  const bytesPerSample = 2;
  const dataSize = sampleCount * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  buffer.write("RIFF", 0);
  view.setUint32(4, 36 + dataSize, true);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  buffer.write("data", 36);
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleRate;
    const sample = Math.max(-1, Math.min(1, generator(t, durationSeconds)));
    view.setInt16(44 + i * bytesPerSample, Math.floor(sample * 32767), true);
  }

  return buffer;
}

function envelope(t, durationSeconds, attack = 0.02, release = 0.08) {
  const fadeIn = Math.min(1, t / attack);
  const fadeOut = Math.min(1, (durationSeconds - t) / release);
  return Math.max(0, Math.min(fadeIn, fadeOut));
}

await mkdir(outputDir, { recursive: true });

const bgm = createWav({
  durationSeconds: 10,
  generator: (t, duration) => {
    const base = Math.sin(2 * Math.PI * 220 * t) * 0.13;
    const harmony = Math.sin(2 * Math.PI * 330 * t) * 0.08;
    const pulse = Math.sin(2 * Math.PI * 2 * t) * 0.02;
    return (base + harmony + pulse) * envelope(t, duration, 0.3, 0.3);
  }
});

const sound = createWav({
  durationSeconds: 0.18,
  generator: (t, duration) => {
    const chirp = Math.sin(2 * Math.PI * (660 + 880 * t) * t) * 0.35;
    return chirp * envelope(t, duration, 0.01, 0.08);
  }
});

const voice = createWav({
  durationSeconds: 1.35,
  generator: (t, duration) => {
    const vowel = Math.sin(2 * Math.PI * 180 * t) * 0.18 + Math.sin(2 * Math.PI * 360 * t) * 0.06;
    const tremolo = 0.7 + Math.sin(2 * Math.PI * 5 * t) * 0.15;
    return vowel * tremolo * envelope(t, duration, 0.04, 0.18);
  }
});

await writeFile(join(outputDir, "bgm-demo.wav"), bgm);
await writeFile(join(outputDir, "sound-click.wav"), sound);
await writeFile(join(outputDir, "voice-lincheng-001.wav"), voice);

console.log(`Generated demo audio files in ${outputDir}`);
