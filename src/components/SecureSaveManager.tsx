import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Html5QrcodeScanner } from 'html5-qrcode';
import QRCode from 'qrcode';
import { Camera, Download, QrCode, RefreshCw, Share2, Shield, Upload } from 'lucide-react';
import {
  BackupDecryptionError,
  UnsupportedBackupVersionError,
  buildSecureBackupBundle,
  decryptSecureBackupBundleAuto,
  detectBackupFormat,
  exportSecureBackupBundleV3,
  isWebCryptoBackupAvailable,
  loadProgressState,
  loadVaultDocuments,
  readBackupApplicationStorage,
  restoreSecureBackupBundle,
} from '../utils/saveSystem';
import { readLocalAiSettings } from '../utils/localAiSettings';
import type { ThemeType } from '../types';

const UPGRADE_NOTICE_STORAGE_KEY = 'beredskap101_backup_v3_notice_v1';

export default function SecureSaveManager({
  theme,
  onStateRestored,
}: {
  theme: ThemeType;
  onStateRestored?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en') as 'en' | 'no';

  const [passkey, setPasskey] = useState<string>('');
  const [encryptedExport, setEncryptedExport] = useState<string>('');
  const [qrGenerated, setQrGenerated] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [importPasskey, setImportPasskey] = useState<string>('');
  const [scanActive, setScanActive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [pendingUpgradeNotice, setPendingUpgradeNotice] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Draw the QR canvas only after it is mounted. Encryption itself happens
  // exclusively on button clicks — never per keystroke.
  useEffect(() => {
    if (!qrGenerated || !encryptedExport) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, encryptedExport, {
      width: 256,
      margin: 2,
      color: {
        dark: '#10201c',
        light: '#ffffff',
      },
    }).catch((error) => {
      console.error('Failed to generate QR code:', error);
      showStatus(
        currentLang === 'no'
          ? 'QR-generering feilet. Reduser datamengde eller bruk fil-eksport.'
          : 'QR generation failed. Reduce payload size or use file export.',
        'error'
      );
      setQrGenerated(false);
    });
  }, [qrGenerated, encryptedExport]);

  const showStatus = (text: string, type: 'success' | 'error' | 'info') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const isWeakPasskey = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length < 12 || trimmed.toUpperCase() === 'BEREDSKAP101';
  };

  // zxcvbn-free entropy hint: length floor is enforced separately; this only
  // warns when the class mix is poor (never blocks).
  const needsStrengthHint = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 12) return false;
    const classes = [/[a-zæøå]/, /[A-ZÆØÅ]/, /\d/, /[^a-zA-ZæøåÆØÅ0-9]/].filter((pattern) => pattern.test(trimmed)).length;
    return classes < 3;
  };

  // New encrypted backups always use authenticated WebCrypto encryption.
  const buildEncryptedExport = async (): Promise<string | null> => {
    if (!isWebCryptoBackupAvailable()) {
      showStatus(currentLang === 'no'
        ? 'Kryptert eksport krever HTTPS eller localhost. Bruk eksport av lokale data bare på en betrodd enhet.'
        : 'Encrypted export requires HTTPS or localhost. Use local-data export only on a trusted device.', 'error');
      return null;
    }
    if (isWeakPasskey(passkey)) {
      showStatus(
        currentLang === 'no' ? 'Velg et backup-passord på minst 12 tegn.' : 'Choose a backup passkey of at least 12 characters.',
        'error'
      );
      return null;
    }

    try {
      const progressState = await loadProgressState();
      const vaultDocuments = await loadVaultDocuments();
      const localAiSettings = readLocalAiSettings();
      const bundle = buildSecureBackupBundle(progressState, vaultDocuments, localAiSettings, readBackupApplicationStorage());
      return await exportSecureBackupBundleV3(bundle, passkey);
    } catch (error) {
      console.error(error);
      showStatus(currentLang === 'no' ? 'Kunne ikke bygge backup.' : 'Failed to build backup.', 'error');
      return null;
    }
  };

  // One-time notice after a legacy import has been re-exported as v3.
  const maybeShowUpgradeNotice = () => {
    if (!pendingUpgradeNotice || !isWebCryptoBackupAvailable()) return;
    try {
      if (window.localStorage.getItem(UPGRADE_NOTICE_STORAGE_KEY)) {
        setPendingUpgradeNotice(false);
        return;
      }
      window.localStorage.setItem(UPGRADE_NOTICE_STORAGE_KEY, '1');
    } catch {
      // Storage blocked: still show the notice once for this session.
    }
    setPendingUpgradeNotice(false);
    showStatus(t('backup_notice_upgraded'), 'info');
  };

  const handleExport = async () => {
    const encrypted = await buildEncryptedExport();
    if (!encrypted) {
      setEncryptedExport('');
      setQrGenerated(false);
      return;
    }
    setEncryptedExport(encrypted);
    setQrGenerated(false);
    maybeShowUpgradeNotice();
  };

  const generateQRCode = async () => {
    const encrypted = await buildEncryptedExport();
    if (!encrypted) return;
    setEncryptedExport(encrypted);
    setQrGenerated(true);
  };

  const handleDownload = async () => {
    const encrypted = await buildEncryptedExport();
    if (!encrypted) return;
    const blob = new Blob([encrypted], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `beredskap101-backup-${Date.now()}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    showStatus(currentLang === 'no' ? 'Backup-fil lastet ned.' : 'Backup file downloaded.', 'success');
  };

  const handleShare = async () => {
    const encrypted = await buildEncryptedExport();
    if (!encrypted) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Beredskap101 Backup',
          text: encrypted,
        });
        showStatus(currentLang === 'no' ? 'Backup delt.' : 'Backup shared.', 'success');
        return;
      } catch (error) {
        console.error('Share failed', error);
      }
    }

    try {
      await navigator.clipboard.writeText(encrypted);
      showStatus(
        currentLang === 'no' ? 'Backup kopiert til utklippstavle.' : 'Backup copied to clipboard.',
        'success'
      );
    } catch (error) {
      console.error('Clipboard write failed', error);
      showStatus(currentLang === 'no' ? 'Kopiering feilet.' : 'Copy failed.', 'error');
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      showStatus(
        currentLang === 'no' ? 'Lim inn kryptert backupkode.' : 'Please paste encrypted backup code.',
        'error'
      );
      return;
    }
    // Strength rules apply to new exports; old backups may use a shorter key.
    if (!importPasskey) {
      showStatus(
        currentLang === 'no' ? 'Skriv inn passordet til denne backupen.' : 'Enter the passkey used for this backup.',
        'error'
      );
      return;
    }

    // Decode and validate before touching local state.
    let decrypted: Awaited<ReturnType<typeof decryptSecureBackupBundleAuto>>;
    try {
      decrypted = await decryptSecureBackupBundleAuto(importText.trim(), importPasskey);
    } catch (error) {
      if (error instanceof UnsupportedBackupVersionError) {
        showStatus(t('backup_error_unsupported_version'), 'error');
      } else if (error instanceof BackupDecryptionError) {
        let looksLikeV3 = false;
        try {
          looksLikeV3 = detectBackupFormat(importText.trim()) === 'v3';
        } catch {
          looksLikeV3 = false;
        }
        if (looksLikeV3 && !isWebCryptoBackupAvailable()) {
          showStatus(t('backup_error_v3_requires_https'), 'error');
        } else {
          showStatus(t('backup_error_corrupt'), 'error');
        }
      } else {
        showStatus(t('backup_error_corrupt'), 'error');
      }
      return;
    }

    try {
      const result = await restoreSecureBackupBundle(decrypted.bundle, decrypted.format);
      if (!result.ok) {
        showStatus(result.rollbackComplete
          ? (currentLang === 'no' ? 'Gjenoppretting feilet. Tidligere data er beholdt.' : 'Restore failed. Previous data was retained.')
          : (currentLang === 'no' ? 'Gjenoppretting feilet delvis. Ikke last inn siden på nytt; eksporter gjenværende data.' : 'Restore was partial. Do not reload; export remaining data.'), 'error');
        return;
      }
      if (decrypted.format !== 'v3') {
        // Migration-on-save: the next export will be a v3 envelope.
        setPendingUpgradeNotice(true);
      }
      showStatus(
        currentLang === 'no'
          ? `Gjenopprettet: ${decrypted.format === 'v1' ? 'eldre fremdrift' : `${decrypted.bundle.vaultDocuments.length} dokumenter`}.`
          : `Restored: ${decrypted.format === 'v1' ? 'legacy progress' : `${decrypted.bundle.vaultDocuments.length} documents`}.`,
        'success'
      );
      if (onStateRestored) {
        setTimeout(() => onStateRestored(), 1000);
      } else {
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error(error);
      showStatus(currentLang === 'no' ? 'Gjenoppretting feilet.' : 'Restore failed.', 'error');
    }
  };

  const startScanner = () => {
    setScanActive(true);
    setStatusMessage(null);
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
        scanner.render(
          (decodedText) => {
            setImportText(decodedText);
            showStatus(currentLang === 'no' ? 'QR-kode skannet.' : 'QR code scanned.', 'info');
            scanner.clear();
            setScanActive(false);
          },
          () => {
            // Ignore frame-level decode errors while scanning.
          }
        );
        scannerRef.current = scanner;
      } catch (error) {
        console.error('Scanner init failed:', error);
        showStatus(currentLang === 'no' ? 'Kamera kunne ikke startes.' : 'Failed to start camera.', 'error');
        setScanActive(false);
      }
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((error) => console.error(error));
      scannerRef.current = null;
    }
    setScanActive(false);
  };

  const styles = {
    cardBg: theme !== 'light' ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-slate-200 text-slate-800',
    titleText: theme !== 'light' ? 'text-[var(--accent)] font-mono' : 'text-slate-900 font-display',
    btnSecondary:
      theme !== 'light'
        ? 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
    inputField:
      theme !== 'light'
        ? 'bg-black border-neutral-800 text-[var(--accent)] focus:border-[var(--accent)]'
        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="secure-save-manager">
      <div className={`p-6 rounded-xl border-2 shadow-sm ${styles.cardBg} flex flex-col justify-between`}>
        <div className="space-y-4">
          <h3 className={`text-xl font-bold flex items-center gap-2 ${styles.titleText}`}>
            <Shield className="w-5 h-5" />
            {currentLang === 'no' ? 'Kryptert backup-eksport' : 'Encrypted backup export'}
          </h3>

          <p className="text-xs opacity-75">
            {currentLang === 'no'
              ? 'Inkluderer sjekklister, lokale dokumentmetadata/notater og lokal AI-innstilling. Lokal lagring uten skylagring.'
              : 'Includes checklists, local document metadata/notes, and local AI settings. Local-only storage with no cloud sync.'}
          </p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="exportPasskey" className="text-xs font-mono uppercase tracking-widest text-neutral-500">
              {currentLang === 'no' ? 'Backup-passord' : 'Backup passkey'}
            </label>
            <input
              id="exportPasskey"
              type="password"
              autoComplete="new-password"
              value={passkey}
              onChange={(event) => setPasskey(event.target.value)}
              className={`p-3 rounded-lg border-2 text-base font-semibold focus:outline-none transition-colors ${styles.inputField}`}
            />
            <p className="text-[10px] opacity-70">
              {currentLang === 'no'
                ? 'Bruk minst 12 tegn. Standardpassordet BEREDSKAP101 avvises.'
                : 'Use at least 12 characters. The old BEREDSKAP101 default is rejected.'}
            </p>
            {needsStrengthHint(passkey) && (
              <p className="text-[10px] text-amber-500">{t('backup_hint_passphrase_strength')}</p>
            )}
          </div>

          {qrGenerated ? (
            <div className="flex flex-col items-center justify-center p-4 bg-white border border-neutral-700 rounded-lg">
              <canvas ref={canvasRef} className="max-w-[200px] max-h-[200px]" />
              <span className="text-[10px] text-[#10201c] font-mono font-bold mt-2 uppercase">
                {currentLang === 'no' ? 'Skann med telefon' : 'Scan with phone'}
              </span>
            </div>
          ) : (
            <button
              onClick={generateQRCode}
              className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 min-h-[50px] cursor-pointer ${styles.btnSecondary}`}
            >
              <QrCode className="w-4 h-4" />
              {currentLang === 'no' ? 'Generer QR-backup' : 'Generate QR backup'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={handleDownload}
            className={`py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 min-h-[54px] cursor-pointer ${styles.btnSecondary}`}
          >
            <Download className="w-4 h-4" />
            {currentLang === 'no' ? 'Last ned fil' : 'Download file'}
          </button>
          <button
            onClick={handleShare}
            className={`py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 min-h-[54px] cursor-pointer ${
              theme !== 'light' ? 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)] hover:brightness-105 font-extrabold' : 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)] hover:brightness-105 font-semibold'
            }`}
          >
            <Share2 className="w-4 h-4" />
            {currentLang === 'no' ? 'Del / Kopier' : 'Share / Copy'}
          </button>
        </div>
      </div>

      <div className={`p-6 rounded-xl border-2 shadow-sm ${styles.cardBg} flex flex-col justify-between`}>
        <div className="space-y-4">
          <h3 className={`text-xl font-bold flex items-center gap-2 ${styles.titleText}`}>
            <Upload className="w-5 h-5" />
            {currentLang === 'no' ? 'Gjenopprett backup' : 'Restore backup'}
          </h3>

          <p className="text-xs opacity-75">
            {currentLang === 'no'
              ? 'Importer kryptert backupkode via innliming eller QR. Stotter ogsa eldre backupformat.'
              : 'Import encrypted backup code by paste or QR. Legacy backup format is also supported.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="importPasskey" className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                {currentLang === 'no' ? 'Passord' : 'Passkey'}
              </label>
              <input
                id="importPasskey"
                type="password"
                autoComplete="current-password"
                value={importPasskey}
                onChange={(event) => setImportPasskey(event.target.value)}
                className={`p-3 rounded-lg border-2 text-xs font-semibold focus:outline-none transition-colors ${styles.inputField}`}
              />
            </div>

            <button
              onClick={scanActive ? stopScanner : startScanner}
              className={`py-3.5 mt-auto rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 min-h-[50px] cursor-pointer ${
                scanActive ? 'bg-red-600 text-white hover:bg-red-700' : styles.btnSecondary
              }`}
            >
              <Camera className="w-4 h-4" />
              {scanActive ? (currentLang === 'no' ? 'Stopp kamera' : 'Stop camera') : (currentLang === 'no' ? 'Skann QR' : 'Scan QR')}
            </button>
          </div>

          {scanActive && (
            <div className="border border-neutral-700 rounded-lg overflow-hidden bg-black p-2">
              <div id="qr-reader" className="w-full"></div>
            </div>
          )}

          {!scanActive && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="importCode" className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                {currentLang === 'no' ? 'Kryptert kode' : 'Encrypted code'}
              </label>
              <textarea
                id="importCode"
                rows={4}
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                placeholder={currentLang === 'no' ? 'Lim inn backupkode her...' : 'Paste backup code here...'}
                className={`p-3 rounded-lg border-2 text-xs font-semibold focus:outline-none transition-colors ${styles.inputField} resize-none`}
              />
            </div>
          )}
        </div>

        {statusMessage && (
          <div
            role={statusMessage.type === 'error' ? 'alert' : 'status'}
            className={`mt-4 p-3 rounded text-xs font-bold border ${
              statusMessage.type === 'success'
                ? 'bg-green-950/20 border-green-500 text-green-500'
                : statusMessage.type === 'error'
                  ? 'bg-red-950/20 border-red-500 text-red-500'
                  : 'bg-blue-950/20 border-blue-500 text-blue-500'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={handleImport}
            className={`py-4 rounded-lg font-extrabold uppercase tracking-wide text-base transition-transform cursor-pointer min-h-[56px] ${
              theme !== 'light' ? 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)] hover:brightness-105' : 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)] hover:brightness-105'
            }`}
          >
            {currentLang === 'no' ? 'Gjenopprett data' : 'Restore data'}
          </button>
          <button
            onClick={() => void handleExport()}
            className={`py-4 rounded-lg border text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer ${styles.btnSecondary}`}
          >
            <RefreshCw className="w-4 h-4" />
            {currentLang === 'no' ? 'Oppdater backup' : 'Refresh backup'}
          </button>
        </div>
      </div>
    </div>
  );
}
