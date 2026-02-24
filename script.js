const TARGET_URLS = [
  'https://kuro-api-pannel.vercel.app/connect',
  'https://rjloader.vippanel.online/connect',
  'https://gamesever.vippanel.space/connect'
];

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const protectBtn = document.getElementById('protectBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resultBox = document.getElementById('resultBox');
const statusText = document.getElementById('statusText');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');

let selectedFile = null;
let uploadedName = null;

const setStep = (n) => {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`step${i}`);
    el.classList.remove('active', 'done');
    if (i < n) el.classList.add('done');
    if (i === n) el.classList.add('active');
  }
};

const setProgress = (pct, label) => {
  progressBar.style.width = `${pct}%`;
  progressText.textContent = `${pct}%`;
  if (label) statusText.textContent = label;
};

const setResult = (text, ok = null) => {
  resultBox.textContent = text;
  resultBox.classList.remove('ok', 'err');
  if (ok === true) resultBox.classList.add('ok');
  if (ok === false) resultBox.classList.add('err');
};

const validateFile = (file) => {
  if (!file) throw new Error('No file selected.');
  if (!file.name.endsWith('.so')) throw new Error('Only .so files are supported.');
  if (file.size > 10 * 1024 * 1024) throw new Error('File too large. Max allowed is 10MB.');
};

const handlePick = (file) => {
  try {
    validateFile(file);
    selectedFile = file;
    protectBtn.disabled = false;
    setStep(1);
    setProgress(10, 'File selected. Ready to upload.');
    setResult(`Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, true);
  } catch (err) {
    selectedFile = null;
    protectBtn.disabled = true;
    setResult(err.message, false);
  }
};

['dragenter', 'dragover'].forEach(evt => dropZone.addEventListener(evt, e => {
  e.preventDefault();
  dropZone.classList.add('drag');
}));
['dragleave', 'drop'].forEach(evt => dropZone.addEventListener(evt, e => {
  e.preventDefault();
  dropZone.classList.remove('drag');
}));
dropZone.addEventListener('drop', e => handlePick(e.dataTransfer.files[0]));
browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => handlePick(e.target.files[0]));

protectBtn.addEventListener('click', async () => {
  if (!selectedFile) return;
  protectBtn.disabled = true;
  downloadBtn.classList.add('hidden');

  try {
    setStep(1);
    setProgress(20, 'Uploading file...');

    const formData = new FormData();
    formData.append('library', selectedFile);

    const uploadRes = await fetch('upload.php', { method: 'POST', body: formData });
    const uploadJson = await uploadRes.json();
    if (!uploadRes.ok || !uploadJson.ok) throw new Error(uploadJson.error || 'Upload failed');
    uploadedName = uploadJson.file;

    setStep(2);
    setProgress(45, 'Analyzing protected targets...');

    const protectRes = await fetch('protect.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: uploadedName, targets: TARGET_URLS })
    });

    const protectJson = await protectRes.json();
    if (!protectRes.ok || !protectJson.ok) throw new Error(protectJson.error || 'Protection failed');

    setStep(4);
    setProgress(100, 'Protection complete. Ready to download.');
    downloadBtn.href = protectJson.download;
    downloadBtn.classList.remove('hidden');

    const info = `Done • URLs found: ${protectJson.matches} • Size +${protectJson.delta_kb}KB`;
    setResult(info, true);
  } catch (err) {
    setProgress(0, 'Error');
    setResult(err.message || 'Unexpected error', false);
  } finally {
    protectBtn.disabled = false;
  }
});
