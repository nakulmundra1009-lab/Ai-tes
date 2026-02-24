# IKRU x YUVI PROTECTION LIB

Complete drag-drop web workflow for `.so` upload, target URL scan (3 fixed URLs), XOR obfuscation, and protected output download.

## Files
- `index.html` UI workflow
- `style.css` dark gradient responsive theme
- `script.js` upload/protect progress flow
- `upload.php` secure file upload
- `protect.php` target URL match + XOR replacement + output generation
- `protector.cpp` native reference implementation for URL verification
- `netlify.toml` static deploy + headers
- `deploy.sh` permission + folder setup

## One-Click Deploy (Netlify)
1. Push this repo to GitHub.
2. Connect repository in Netlify.
3. Build settings:
   - Build command: *(empty)*
   - Publish directory: `.`
4. Deploy.

## Backend runtime
Netlify hosts static assets. PHP endpoints (`upload.php`, `protect.php`) require a PHP runtime (e.g., shared hosting, VPS, or container) or migration to Netlify Functions.

## Local setup
```bash
chmod +x deploy.sh
./deploy.sh
php -S 0.0.0.0:8080
```
Open `http://localhost:8080`.

## Workflow
1. Upload `lib.so`
2. Analyze fixed targets:
   - `https://kuro-api-pannel.vercel.app/connect`
   - `https://rjloader.vippanel.online/connect`
   - `https://gamesever.vippanel.space/connect`
3. Protect with XOR (`char ^= 0xAA ^ index`)
4. Download `protected_lib.so`

## Validation Rules
- Rejects files larger than 10MB
- Accepts only `.so`
- Deletes uploaded original after protection
