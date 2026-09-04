# Astro Investment Client Portal

A GitHub Pages-ready client registration form for new and repeat astrology-based financial awareness consultations.

## Included

- Responsive registration form with astrology and broad financial-profile fields
- Client IDs beginning `ASTRO-INVESTOR`
- Repeat-consultation references such as `/C01`, `/C02`
- ₹500 payment section with a placeholder for a future gateway link
- Google Sheets record keeping and email delivery through Google Apps Script
- Confirmation emails to the client and notifications to `sunviewrising@gmail.com`
- Privacy consent and clear investment/astrology disclaimers

## 1. Create the email and record system

1. Sign in to the Google account for `sunviewrising@gmail.com`.
2. Create a blank Google Sheet named **Astro Investment Consultations**.
3. In the Sheet, open **Extensions → Apps Script**.
4. Delete the sample code and paste everything from `google-apps-script/Code.gs`.
5. Click **Deploy → New deployment → Web app**.
6. Set **Execute as** to **Me** and **Who has access** to **Anyone**.
7. Authorize the script and copy its Web App URL.
8. Open `config.js` and paste the URL into `scriptUrl`.

## 2. Add the payment link later

Open `config.js` and paste the payment gateway URL:

```js
paymentUrl: "https://your-payment-link-here"
```

The Pay ₹500 button will become active automatically.

## 3. Publish with GitHub Pages

Upload all files and folders to the repository root. In GitHub, open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.

## Important privacy note

Keep the Google Sheet private. Never collect passwords, OTPs, full bank/card details, Aadhaar, PAN or demat credentials. Review your privacy notice and regulatory obligations before public launch.
