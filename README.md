# American Legion Cowle Post 151 Website

Website for American Legion Cowle Post 151, 272 Broad St, Conneaut, OH 44030.

It's a plain static site (HTML, CSS and JavaScript, with no build step), so it can be hosted for free on GitHub Pages.

## Pages

- `index.html`: Home (open/closed status, today's special, what's coming up)
- `menu.html`: Menu & Daily Specials
- `events.html`: Events & Meetings
- `hometown-heroes.html`: Hometown Hero tribute flags, with the downloadable order form (`downloads/hometown-hero-flag-order-form.pdf`, fillable)
- `about.html`: About, officers, Legion family, veterans resources
- `contact.html`: Visit Us (address, hours, map)

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
- `officers`, `email`, `facebook`

Edit the file on GitHub, commit, and the live site updates within a minute or two.

## Hosting with GitHub Pages

Settings → Pages → Source: "Deploy from a branch" → `main` / root.

## Preview locally

Open `index.html` in a browser, or run `python3 -m http.server`, then visit http://localhost:8000.
