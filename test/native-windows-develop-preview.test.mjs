import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (file) => readFile(new URL(file, root), 'utf8');

test('Windows develop preview has a distinct per-user installer identity', async () => {
  const nsis = await read('native/windows/Installer/NikonLink.nsi');
  assert.match(nsis, /!ifdef ZENCH_DEVELOP_PREVIEW/);
  assert.match(nsis, /!define APP_REG_ROOT HKCU/);
  assert.match(nsis, /NikonLinkDevelopPreview/);
  assert.match(nsis, /ZENCHE-develop-preview/);
  assert.match(nsis, /!define APP_ELEVATION user/);
  assert.match(nsis, /!define APP_REG_ROOT HKLM/);
  assert.match(nsis, /"Software\\NikonLink"/);
  assert.match(nsis, /!define APP_ELEVATION admin/);
  assert.match(nsis, /DeleteRegKey \$\{APP_REG_ROOT\} "\$\{APP_UNINSTALL_REG\}"/);
});

test('PTP-only preview packages carry a limitation notice and checksum', async () => {
  const script = await read('scripts/build-windows.ps1');
  assert.match(script, /\[switch\]\$PreviewWithoutVendorSdk/);
  assert.match(script, /if \(-not \$PreviewWithoutVendorSdk\)/);
  assert.match(script, /README-DEVELOP-PTP-ONLY\.txt/);
  assert.match(script, /-develop-PTP-only/);
  assert.match(script, /DZENCH_DEVELOP_PREVIEW/);
  assert.match(script, /Write-Checksum -Path \$ArchivePath/);
  assert.match(script, /Write-Checksum -Path \$InstallerPath/);
});

test('develop preview packaging is branch-specific and not a stable update release', async () => {
  const ci = await read('.github/workflows/build.yml');
  assert.match(ci, /github\.ref == 'refs\/heads\/develop'/);
  assert.match(ci, /ZENCHE-Windows-develop-PTP-only/);
  assert.match(ci, /-PreviewWithoutVendorSdk/);
  assert.doesNotMatch(ci, /gh release upload/);
});
