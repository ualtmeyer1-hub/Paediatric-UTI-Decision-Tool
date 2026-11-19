# Paediatric UTI Dipstick & Testing Decision Support Tool (NICE NG224)

An offline-capable **Progressive Web App (PWA)** designed for mobile phones, tablets, and desktop browsers to support diagnostic stewardship in babies, children, and young people under 16 years with suspected urinary tract infection (UTI).

---

## Clinical & Guideline Basis

All diagnostic rules, dipstick decision matrices, specimen collection standards, and microscopy interpretation tables in this tool are derived directly from:

1. **NICE Guideline NG224** — *Urinary tract infection in under 16s: diagnosis and management* (National Institute for Health and Care Excellence, published 27 July 2022; minor link updates through November 2025). Available at: [https://www.nice.org.uk/guidance/ng224](https://www.nice.org.uk/guidance/ng224)
   - **Overview & Exclusions:** Covers birth to `<16` years; excludes indwelling urinary catheters, neurogenic bladders, significant pre-existing uropathies, underlying renal disease, immunosuppression, ICU admissions, and recurrent UTI in sexually active girls/young women `<16` years.
   - **Symptoms & Signs (Recs 1.1.1–1.1.9 & Table 1):** Symptoms/signs increasing vs decreasing UTI likelihood; upper UTI (pyelonephritis) vs lower UTI (cystitis) differentiation (Recs 1.1.25–1.1.27).
   - **Infants `<3` Months (Recs 1.1.3 & 1.2.2):** Immediate paediatric specialist referral and urgent pre-antibiotic microscopy & culture without relying on dipstick testing.
   - **Children `3` Months to `<3` Years (Rec 1.1.19):** Dipstick testing for Leukocyte Esterase (LE) and Nitrite; if either or both are positive, start antibiotics and send urine for culture; if both are negative, withhold antibiotics and culture unless Recommendation 1.1.21 triggers apply.
   - **Children `≥3` Years (`<16` Years) (Rec 1.1.20 & Table 2):** Full 4-way LE/Nitrite decision matrix incorporating fresh-sample verification (`LE− / Nitrite+`) and clinical evidence assessment (`LE+ / Nitrite−`).
   - **Mandatory Culture Indications (Rec 1.1.21):** Acute upper UTI, high/intermediate risk of serious illness, age `<3` months, positive LE or nitrite, recurrent UTI, non-response within 24–48 hours, or discordance between clinical signs and dipstick findings.
   - **Urine Collection & Preservation (Recs 1.1.11–1.1.18):** Clean-catch or manufacturer-approved collection pads; prohibition of cotton wool balls, gauze, or sanitary towels; refrigeration or boric acid preservation (strictly adhering to fill-line volume) if culture cannot occur within 4 hours.
2. **UK Standards for Microbiology Investigations (UK SMI B 41)** — *Investigation of urine* (pre-analytical boric acid fill-line requirements and laboratory culture standards).

---

## How This Tool Was Created

- **Architecture:** Built as a zero-dependency, vanilla **HTML5 / CSS3 / JavaScript** Progressive Web App (`index.html`, `styles.css`, `app.js`, `manifest.json`, and `sw.js`).
- **Deterministic Rule Engine:** Contains no generative AI or probabilistic black-box logic. Every clinical output maps deterministically to the age-stratified branching rules in NICE NG224 Recommendations `1.1.3`, `1.1.19`, `1.1.20` (Table 2), `1.1.21`, and `1.2.2`.
- **Privacy & Information Governance by Design:** Executes 100% client-side within the device browser. Zero patient-identifiable data (PID) is collected, transmitted, logged, or stored externally. The **Copy Clinical Note** utility writes strictly to the local device clipboard.
- **Offline Resilience:** Includes a Service Worker (`sw.js`) that caches all application assets on first load so the app functions reliably in areas with poor mobile or Wi-Fi reception.

---

## Deploying as a Mobile App via GitHub Pages

You can host this repository free on **GitHub Pages** and install it onto iOS and Android home screens as a standalone mobile app:

1. **Create a GitHub Repository:**
   - Create a new public (or institutional) repository on GitHub (e.g., `paediatric-uti-ng224-app`).
   - Upload all files from this package (`index.html`, `styles.css`, `app.js`, `manifest.json`, `sw.js`, `README.md`, and the `icons/` folder) to the root of the `main` branch.
2. **Enable GitHub Pages:**
   - Go to **Settings → Pages** in your GitHub repository.
   - Under **Build and deployment → Source**, select **Deploy from a branch**.
   - Choose `main` and `/ (root)`, then click **Save**.
   - GitHub will publish the app over HTTPS at `https://<your-username>.github.io/<repo-name>/`.
3. **Install on Mobile Devices:**
   - **iPhone / iPad (Safari):** Open the GitHub Pages URL in Safari, tap the **Share** icon, and select **Add to Home Screen**.
   - **Android (Chrome):** Open the GitHub Pages URL in Chrome, tap the **three-dot menu**, and select **Install app** or **Add to Home screen**.

---

## Optional: Packaging as a Native iOS / Android Binary (Capacitor)

If you require an `.apk` or App Store / MDM package rather than a PWA:

```bash
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "Paed UTI NG224" "uk.nhs.stewardship.paeduti" --web-dir .
npx cap add android
npx cap add ios
npx cap sync
```

---

## Clinical Disclaimer

This decision-support tool is intended for qualified healthcare professionals to aid point-of-care application of **NICE Guideline NG224**. It does not replace clinical judgement or local NHS Board antimicrobial prescribing formularies. Always assess for red-flag sepsis (`NICE NG51`) and serious illness in under 5s (`NICE NG143`).
