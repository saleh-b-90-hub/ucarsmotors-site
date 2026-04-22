# U Cars Motors Website

Production-ready luxury website for `www.ucarsmotors.com`.

Slogan used: **Driven by Quality. Defined by Trust.**

## Project Structure
- `index.html` Home page
- `cars.html` Cars inventory with brand/model/price filters
- `parts.html` Used parts categories
- `services.html` Premium automotive services
- `about.html` Brand story and trust positioning
- `contact.html` Contact form + direct WhatsApp action
- `assets/css/styles.css` Design system and responsive styling
- `assets/js/main.js` Menu, car filters, WhatsApp form handler
- `assets/img/logo.svg` Luxury logo concept
- `robots.txt`, `sitemap.xml`, `vercel.json` Deployment + SEO files

## Fast fix: push from this PC (unblocks Vercel)
If GitHub shows an empty repo and Vercel has no deployments, run in **PowerShell** from this folder:

```powershell
cd C:\Users\saleh\.cursor\projects\empty-window
.\PUSH-TO-GITHUB.ps1
```

If it asks for auth: run `gh auth login` once, then run the script again.  
Alternatively set `$env:GITHUB_TOKEN` to a PAT (see comments inside `PUSH-TO-GITHUB.ps1`).

## Before Deploying
1. Edit business email/address if needed in `contact.html`.
2. Replace placeholder images with real stock images when ready.
3. Keep WhatsApp number in `assets/js/main.js` as `49178551145` unless you change it.

## Deploy to Vercel (Beginner Friendly)
1. Create a GitHub account (if you do not already have one).
2. Create a new repository and upload this project folder.
3. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub.
4. Click **Add New...** -> **Project**.
5. Import your new GitHub repository.
6. Framework preset: choose **Other** (static project).
7. Build settings:
   - Build command: leave empty
   - Output directory: leave empty
8. Click **Deploy**.
9. Wait for success message and open your Vercel URL.

## Connect Namecheap Domain (`www.ucarsmotors.com`)
After deploy, in Vercel:
1. Open your project -> **Settings** -> **Domains**.
2. Add `ucarsmotors.com`.
3. Add `www.ucarsmotors.com`.
4. Vercel will show DNS records. Use the values below in Namecheap.

In Namecheap:
1. Open **Domain List** -> `ucarsmotors.com` -> **Manage**.
2. Open **Advanced DNS**.
3. Add or update these records:

- `A Record`
  - Host: `@`
  - Value: `76.76.21.21`
  - TTL: Automatic

- `CNAME Record`
  - Host: `www`
  - Value: `cname.vercel-dns.com`
  - TTL: Automatic

4. Remove conflicting records for `@` or `www` (old parking/hosting records).
5. Save changes.
6. Return to Vercel Domains page and click **Refresh** / **Verify**.
7. Wait for status to become **Valid Configuration**.

## Make Site Live
1. Confirm both domains are valid in Vercel.
2. In Vercel domain settings, set `www.ucarsmotors.com` as primary if you prefer.
3. Vercel SSL is automatic; wait a few minutes for certificate issuance.
4. Test:
   - `https://www.ucarsmotors.com`
   - `https://www.ucarsmotors.com/cars`
   - `https://www.ucarsmotors.com/contact`
5. Submit sitemap to Google Search Console:
   - `https://www.ucarsmotors.com/sitemap.xml`
