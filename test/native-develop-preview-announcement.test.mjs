import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('All five native update announcements explain develop account-free preview limits', async () => {
  const sources = await Promise.all([
    'native/ios/NikonLink/Views/RootView.swift',
    'native/macos/Sources/NikonLink/SettingsSheet.swift',
    'native/android/app/src/main/java/com/tauber/nikonlink/MainActivity.java',
    'native/harmony/entry/src/main/ets/pages/Index.ets',
    'native/windows/MainWindow.xaml.cs'
  ].map(read));
  for (const source of sources) {
    assert.match(source, /develop 预览：打开即进入原生功能/);
    assert.match(source, /Windows\/macOS PTP-only 包不含 Nikon\/Sony 厂商 SDK/);
  }
});
