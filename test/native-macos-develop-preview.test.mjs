import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('macOS develop preview uses an isolated bundle and has no proprietary SDK runtime', async () => {
  const script = await read('scripts/build-macos.sh');
  assert.match(script, /--preview-without-vendor-sdk/);
  assert.match(script, /com\.tauber\.nikonlink\.develop-preview/);
  assert.match(script, /develop-PTP-only/);
  assert.match(script, /README-DEVELOP-PTP-ONLY/);
  assert.match(script, /-lCr_Core/);
  assert.match(script, /sony_runtime_link_args=\(\)/);
  assert.match(script, /SONY_SDK_ROOT\/include/);
  assert.match(script, /codesign --force --deep --sign -/);
});

test('Sony preview bridge explicitly rejects unavailable camera operations', async () => {
  const source = await read('native/macos/Sources/NikonLink/SonySDKBridgePreviewStub.cpp');
  assert.match(source, /kVendorSdkUnavailable = -150/);
  for (const symbol of [
    'ZencheProbeSonyCameraRemoteSDK',
    'ZencheSonySDKConnect',
    'ZencheSonySDKDisconnect',
    'ZencheSonySDKGetLiveViewImage',
    'ZencheSonySDKCapture',
    'ZencheSonySDKSetMovieRecording',
    'ZencheSonySDKAutofocus',
    'ZencheSonySDKSetProperty',
  ]) {
    assert.ok(source.includes(symbol), 'missing stub: ' + symbol);
  }
  assert.match(source, /initialized/);
});

test('macOS PTP-only preview is only packaged on develop', async () => {
  const ci = await read('.github/workflows/build.yml');
  assert.match(ci, /github\.ref == 'refs\/heads\/develop'/);
  assert.match(ci, /ZENCHE-macOS-develop-PTP-only/);
  assert.match(ci, /build-macos\.sh --preview-without-vendor-sdk/);
});
