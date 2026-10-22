# American Legion Cowle Post 151 Website

Website for American Legion Cowle Post 151, 272 Broad St, Conneaut, OH 44030.

It's a plain static site (HTML, CSS and JavaScript, with no build step), so it can be hosted for free on GitHub Pages.

## Pages

- `index.html`: Home (open/closed status, today's special, what's coming up)
- `menu.html`: Menu & Daily Specials
- `events.html`: Events & Meetings
- `hometown-heroes.html`: Hometown Hero tribute flags. Two ways to order: the online form (handled by `order.php`, thank-you page `hometown-heroes-thanks.html`) or the downloadable PDF (`downloads/hometown-hero-flag-order-form.pdf`, fillable)
- `hall-rental.html`: Hall rental (details from `hallRental` in content.js; "Check a Date" opens the contact form on the Hall rental topic)
- `join.html`: Membership, eligibility and yearly dues (from `membership` in content.js)
- `about.html`: About, officers, Legion family, veterans resources
- `gallery.html`: Photo gallery (photos in `images/gallery/`, listed in `gallery` in content.js)
- `sentinel.html`: The Sentinel newsletter. Email sign-up (handled by `subscribe.php`) and past issues (PDFs in `downloads/`, listed in `sentinel` in content.js)
- `in-memoriam.html`: Members who have passed (from `inMemoriam` in content.js)
- `contact.html`: Visit Us (address, hours, map) and the "Send Us a Message" form, handled by `contact.php`. Link to `contact.html?topic=hall#contact-form` to preselect a topic (keys: general, hall, legion, sons, auxiliary, aux-other, sons-other, heroes).

The header and footer are repeated in each page, so if you add a page, add it to the nav in every page.

## Updating content

All week-to-week content lives in **`content.js`**:

- `hours`: building hours
- `kitchenHours`: kitchen hours
- `specials`: the daily special for each weekday (today's special is highlighted automatically)
- `menu`, `menuNote`, `menuFooter`: the kitchen menu (sections, items, prices and options)
- `announcements`: banners at the top of the home page
- `events`: one-time events, with an optional image from `images/` (past events hide automatically)
- `meetings`: recurring monthly meetings (the next date is calculated automatically)
- `officers`, `sonsOfficers`, `auxiliaryOfficers`: the three officer lists on the About page
- `membership`, `hallRental`, `gallery`, `sentinel`, `inMemoriam`: the pages above
- `email`, `facebook`

Edit the file on GitHub, commit, and the live site updates within a minute or two.

### Site editor (no coding)

`admin.html` (not linked from the site, and hidden from search engines) is a point-and-click editor for the daily specials, announcements, events, In Memoriam, photo gallery, Sentinel PDFs, hall rental details and membership dues. It signs in with a GitHub fine-grained token that only has **Contents: Read and write** on this repository (the sign-in page has the steps). Each save is one commit to `content.js` plus any uploaded photos or PDFs, so it goes live the same way as an edit on GitHub. Photos are shrunk to 1600 px before upload. Only the parts you changed are rewritten; comments and everything else in `content.js` stay as they are.

## Hosting

The live site is **conneautlegionpost151.org**, hosted on Namecheap (Stellar shared hosting). The domain, hosting and email accounts are all in the same Namecheap account.

Every push to `main` is uploaded to the hosting account's `public_html/` folder by `.github/workflows/deploy.yml`. It needs three repository secrets (Settings → Secrets and variables → Actions): `FTP_SERVER`, `FTP_USERNAME` and `FTP_PASSWORD`, all from cPanel → FTP Accounts.

Email accounts are created in cPanel → Email Accounts.

### Hometown Hero online orders

`order.php` emails each online order, with the veteran's photo attached, and sends the family a short confirmation. **Set the address that receives orders** in the `$RECIPIENTS` line near the top of `order.php`. Until it's set, the form tells people to use the PDF instead. The form needs PHP, so it only works on the Namecheap hosting, not on GitHub Pages. `.user.ini` raises PHP's upload limit for 10 MB photos.

### Contact form messages

`contact.php` emails each message to the people for the topic the visitor picks. **Set the addresses** in `$ROUTES` near the top of `contact.php`, one list per topic. Any topic left empty goes to `$DEFAULT`. Until `$DEFAULT` has an address, the form asks people to call the Post. Replies go straight to the visitor's email.

### Sentinel sign-ups

`subscribe.php` adds each sign-up to `sentinel-subscribers.csv` in the hosting account's home folder (one level above `public_html`, so it can't be opened from the web and site uploads never touch it). Download it from cPanel → File Manager and import it into whatever you use to send the newsletter. Duplicates are skipped. Optionally set `$NOTIFY` to get an email for each new sign-up.

### Writing The Sentinel in the editor

The editor's **Write The Sentinel** tab (draft kept in `sentinelDraft` in content.js, layout built by `newsletter.js`) fills in events, specials, hours, meetings and officers from the site, plus whatever you write. **Copy for Mailchimp** copies the finished email; **Save & Post on the Website** saves it as `newsletter/issues/sentinel-<issue>.html` and lists it on the Sentinel page.

### The Sentinel email template

`newsletter/sentinel-template.html` is an email-ready newsletter layout (tables and inline styles, so Gmail and Outlook show it correctly). Each section is marked with `SECTION:` / `END` comments, so you can delete sections or copy them to add more. Paste the file into Mailchimp's "Code your own" editor (or a similar service) to send it. Print it to PDF to post an issue on the Sentinel page.

## Preview locally

Open `index.html` in a browser, or run `python3 -m http.server`, then visit http://localhost:8000.
