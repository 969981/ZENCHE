import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// develop: account-free native launch. AI device activation is a separate feature.
const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

const iosPath = 'native/ios/NikonLink/Views/RootView.swift';
const macPath = 'native/macos/Sources/NikonLink/main.swift';
const macSettingsPath = 'native/macos/Sources/NikonLink/SettingsSheet.swift';
const androidPath = 'native/android/app/src/main/java/com/tauber/nikonlink/MainActivity.java';
const harmonyPath = 'native/harmony/entry/src/main/ets/pages/Index.ets';
const windowsXamlPath = 'native/windows/MainWindow.xaml';
const windowsCodePath = 'native/windows/MainWindow.xaml.cs';

test('iOS / iPadOS: launch directly into workspace without credentials', async () => {
  const source = await read(iosPath);
  const rootView = source.slice(source.indexOf('struct RootView: View {'));
  assert.match(rootView, /Group \{\s*mainWorkspace\s*\}/);
  assert.match(rootView, /private func prepareLocalWorkspace\(\)/);
  assert.match(rootView, /model\.prepareSignedInState\(\)/);
  assert.doesNotMatch(rootView, /switch model\.auth\.state/);
  assert.doesNotMatch(rootView, /await model\.auth\.bootstrap\(\)/);
  assert.doesNotMatch(source, /private struct LoginView:/);
  assert.doesNotMatch(source, /await model\.auth\.logout\(\)/);
  assert.match(source, /title: "通用"/);
});

test('macOS: launch directly into workspace and preserve camera setup', async () => {
  const [source, settings] = await Promise.all([read(macPath), read(macSettingsPath)]);
  const rootView = source.slice(source.indexOf('private struct RootView: View {'));
  assert.match(rootView, /Group \{\s*mainWorkspace\s*\}/);
  assert.match(rootView, /private func prepareLocalWorkspace\(\)/);
  assert.match(rootView, /model\.prepareSignedInState\(\)/);
  assert.doesNotMatch(rootView, /switch model\.auth\.state/);
  assert.doesNotMatch(rootView, /await model\.auth\.bootstrap\(\)/);
  assert.doesNotMatch(source, /private struct LoginView:/);
  assert.doesNotMatch(settings, /await auth\.logout\(\)/);
  assert.match(settings, /RuntimeLocalizedText\("外观"\)/);
});

test('Android: start capture section, without account wall or registration', async () => {
  const source = await read(androidPath);
  assert.match(source, /setContentView\(buildApplication\(\)\);\s*showSplash\(\);[\s\S]{0,150}showSection\("capture"\);/);
  assert.doesNotMatch(source, /showLoginWall\(|showAuthCheckingWall\(|validateSessionAsync\(/);
  assert.doesNotMatch(source, /authManager\.hasSession\(|authWallHost|authEmailInput/);
  assert.doesNotMatch(source, /LinearLayout accountPanel = panel\(\)/);
  assert.match(source, /private View buildSettingsView\(\)/);
});

test('HarmonyOS: display workspace without account state or blocking overlay', async () => {
  const source = await read(harmonyPath);
  assert.match(source, /@State private section: string = 'capture'/);
  assert.doesNotMatch(source, /bootstrapAuthGuard\(|this\.LoginWall\(\)|this\.AuthCheckingWall\(\)/);
  assert.doesNotMatch(source, /private LoginWall\(|private AuthCheckingWall\(/);
  assert.doesNotMatch(source, /this\.performLogout\(\)|this\.authManager/);
  assert.match(source, /private SettingsWorkspace\(\)/);
});

test('Windows: load complete workspace without creating login/register controls', async () => {
  const [xaml, code] = await Promise.all([read(windowsXamlPath), read(windowsCodePath)]);
  assert.match(code, /await EnterLocalWorkspaceAsync\(\)/);
  assert.match(code, /private async Task EnterLocalWorkspaceAsync\(\)/);
  assert.match(code, /ShowLaunchAnnouncementIfNeeded\(\)/);
  assert.doesNotMatch(code, /BootstrapAuthAsync\(|ShowAuthForm\(|AuthSubmit_Click/);
  assert.doesNotMatch(xaml, /x:Name="AuthWall"|x:Name="AuthFormPanel"|x:Name="LogoutButton"|x:Name="AccountEmailText"/);
  assert.match(xaml, /x:Name="SettingsPanel"/);
  assert.match(xaml, /x:Name="CapturePanel"/);
});

test('All native login entry points are absent; device activation remains separate', async () => {
  const paths = [iosPath, macPath, macSettingsPath, androidPath, harmonyPath, windowsXamlPath, windowsCodePath];
  const sources = await Promise.all(paths.map(read));
  assert.ok(sources.every((source) => !/还没有账号？切换到|登录后使用拍摄、编辑与 AI 功能/.test(source)));
  assert.ok(sources.every((source) => !/Bearer/.test(source)), 'native AI calls must not send account Bearer tokens');
  assert.match(sources[3], /activation/i);
  assert.match(sources[4], /activation/i);
});
