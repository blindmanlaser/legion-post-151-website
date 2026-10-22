// ============================================================
//  SITE CONTENT: edit this file to update the website.
//  Everything the Post changes week to week lives here:
//  hours, specials, menu, events and announcements.
//  Keep the quotes and commas as they are when you edit.
// ============================================================

window.SITE = {
  name: "American Legion Cowle Post 151",
  city: "Conneaut, Ohio",
  address: "272 Broad St, Conneaut, OH 44030",
  phone: "440-593-2205",
  email: "", // add the Post's email address here when known
  // Emblems for the Post, Sons and Auxiliary (files in images/emblems). Leave "" to hide one.
  emblems: { legion: "images/emblems/legion.png", sons: "images/emblems/sons.png", auxiliary: "images/emblems/auxiliary.png" },
  facebook: "https://www.facebook.com/p/American-Legion-Post-151-Conneaut-OH-61566798598965/",

  // Building / social room hours. Day 0 = Sunday ... 6 = Saturday.
  // Times use 24-hour "HH:MM". A close time past midnight (like 01:00) is fine.
  hours: [
    { day: 0, label: "Sunday",    open: "12:00", close: "22:00" },
    { day: 1, label: "Monday",    open: "12:00", close: "22:00" },
    { day: 2, label: "Tuesday",   open: "12:00", close: "22:00" },
    { day: 3, label: "Wednesday", open: "12:00", close: "22:00" },
    { day: 4, label: "Thursday",  open: "12:00", close: "22:00" },
    { day: 5, label: "Friday",    open: "12:00", close: "22:00" },
    { day: 6, label: "Saturday",  open: "12:00", close: "22:00" }
  ],

  kitchenHours: [
    { days: "Mon, Tue, Wed, Fri, Sat", time: "3:00 – 8:00 pm", note: "Full menu. Last orders 7:45 pm." },
    { days: "Thursday", time: "4:00 – 7:00 pm", note: "Pizza & stromboli, until sold out." },
    { days: "Sunday", time: "Closed", note: "" }
  ],

  // Daily specials, one per weekday. Leave "item" empty to show "Ask your bartender".
  specials: [
    { day: 0, item: "Kitchen Closed", price: "", note: "The bar is open noon – 10 pm." },
    { day: 1, item: "Burger Monday", price: "", note: "Featuring a special themed burger." },
    { day: 2, item: "Taco Tuesday", price: "", note: "" },
    { day: 3, item: "Wing Night", price: "$0.60 wings", note: "" },
    { day: 4, item: "Pizza & Stromboli Night", price: "", note: "4 – 7 pm, until sold out" },
    { day: 5, item: "Dinner Special", price: "", note: "" },
    { day: 6, item: "Dinner Special", price: "", note: "" }
  ],

  // Menu sections. Items look like:
  //   { name: "Burger", desc: "", price: "7.50", options: [{ label: "Add Cheese", price: "1.25" }] }
  // Leave price empty for items that only have options (like "with Crispy Chicken").
  // "featured: true" gives a section the highlighted box.
  menuNote: "Available Monday, Tuesday, Wednesday, Friday and Saturday, 3:00 – 8:00 pm. Last order taken at 7:45 pm.",
  menuFooter: "See the media board for our daily specials. Consumer advisory: consuming raw or undercooked meats, poultry, seafood, shellfish or eggs may increase your risk of foodborne illness.",
  menu: [
    { section: "New Appetizer Features", featured: true, items: [
      { name: "Bacon Cheese Potato Kegs (5)", price: "5.00" },
      { name: "Spinach Arancini Balls (2)", price: "4.00" },
      { name: "Hot Pepper Sausage Roll (1)", price: "2.50" },
      { name: "Crab Rangoon Bites (4)", price: "5.00" },
      { name: "Nacho Chips", desc: "Served with your choice of dip", options: [
        { label: "Salsa", price: "3.50" },
        { label: "Pimento Cheese", price: "6.00" },
        { label: "Mexican Street Corn Dip", price: "7.00" }
      ] }
    ] },
    { section: "Appetizers", note: "Sauces for tenders and boneless wings are listed under Wings.", items: [
      { name: "Chicken Tenders (3)", desc: "Served with celery, carrots and dip", price: "4.75", options: [{ label: "with Fries", price: "6.25" }] },
      { name: "Boneless Wings (10)", desc: "Served with celery, carrots and dip", price: "6.50" },
      { name: "Shrimp Basket", price: "4.75", options: [{ label: "with Fries", price: "6.25" }] },
      { name: "Large Fries", price: "3.25" },
      { name: "Sweet Potato Fries", price: "3.25" },
      { name: "Tater Tots", price: "3.00" },
      { name: "Onion Rings", price: "3.25" },
      { name: "Veggie Basket", price: "3.75" },
      { name: "Gouda Bacon Mac 'n' Cheese Bites (10)", price: "5.25" },
      { name: "Broccoli Cheese Bites (5)", price: "4.00" },
      { name: "Cheese Sticks (5)", price: "4.25" },
      { name: "Mini Tacos (10)", price: "3.75" },
      { name: "Mozzarella Wedges (4)", price: "5.25" },
      { name: "Fried Zucchini Planks", price: "5.25" },
      { name: "Fried Pickle Spears (4)", price: "5.25" },
      { name: "Mini Empanadas (4)", price: "6.25" },
      { name: "Pizza Logs (each)", price: "1.75" },
      { name: "Taco Logs (each)", price: "1.75" },
      { name: "Cod Nuggets (6)", price: "5.25" },
      { name: "Pretzel Poppers (15)", price: "4.50" },
      { name: "Veggie Egg Roll (each)", price: "2.00" },
      { name: "Pork Egg Roll (each)", price: "1.75" },
      { name: "Jalapeño Poppers (5)", price: "4.25" },
      { name: "JoJos", price: "3.00" },
      { name: "Raspberry Cheesecake Logs (2)", price: "5.25" },
      { name: "Apple Pie Logs (3)", price: "5.25" },
      { name: "Additional Dips (each)", desc: "Sour cream, salsa, ranch, blue cheese, BBQ, cocktail sauce, honey mustard, hot sauce, taco sauce, tartar sauce, sweet chili, hot honey", price: "0.50" },
      { name: "Extra Veggies", price: "1.00" }
    ] },
    { section: "Wraps & Salads", footnote: "Cheese choices: Hot Pepper Jack, Provolone, American, Swiss. Add fries, onion rings or sweet potato fries for $2.00.", items: [
      { name: "Crispy Chicken Wrap", desc: "Lettuce, tomato, cheddar cheese and ranch", price: "5.75" },
      { name: "Grilled Chicken Wrap", desc: "Lettuce, tomato, cheddar cheese and ranch", price: "6.75" },
      { name: "Chicken Bacon Ranch Wrap", desc: "Lettuce, tomato, cheese, bacon and ranch", options: [
        { label: "with Crispy Chicken", price: "6.50" }, { label: "with Grilled Chicken", price: "7.50" }] },
      { name: "Spicy Chicken Wrap", desc: "Lettuce, tomato, cheddar cheese, hot sauce and ranch", options: [
        { label: "with Crispy Chicken", price: "6.00" }, { label: "with Grilled Chicken", price: "7.00" }] },
      { name: "Chicken Caesar Wrap", desc: "Lettuce, tomato, Caesar dressing and parmesan cheese", options: [
        { label: "with Crispy Chicken", price: "6.00" }, { label: "with Grilled Chicken", price: "7.00" }] },
      { name: "Tossed Salad", price: "2.50", options: [
        { label: "Add Chicken", price: "1.50" }, { label: "Add Bacon", price: "0.75" }, { label: "Add Cheese", price: "1.25" }] }
    ] },
    { section: "Sandwiches", items: [
      { name: "Burger*", price: "7.50", options: [{ label: "Add Cheese", price: "1.25" }] },
      { name: "BLT", price: "5.50" },
      { name: "Cheese Quesadilla", price: "5.50", options: [{ label: "with Chicken", price: "6.50" }] },
      { name: "Fish Sandwich", desc: "Lettuce and tartar sauce", price: "6.50" },
      { name: "Meatball and Cheese Sub", desc: "4 meatballs, marinara, provolone and parmesan cheese", price: "7.25" },
      { name: "Chicken Sandwich", desc: "Lettuce, tomato and mayo", options: [
        { label: "with Crispy Chicken", price: "6.25" }, { label: "with Grilled Chicken", price: "5.25" }] },
      { name: "Chicken Club", desc: "Bacon, cheese, lettuce, tomato and mayo", options: [
        { label: "with Crispy Chicken", price: "7.25" }, { label: "with Grilled Chicken", price: "6.25" }] }
    ] },
    { section: "Wings", items: [
      { name: "Dine In (each)", price: "0.80" },
      { name: "To-Go (each)", price: "0.90" }
    ], lists: [
      { title: "Sauces", items: ["Plain", "Hot", "Mild Hot", "Hot Garlic Parm", "BBQ", "Hot BBQ", "Honey BBQ", "Carolina", "Honey Mustard", "Hot Honey Parm", "Butter Garlic", "Hawaiian", "Butter Garlic Parm", "Cajun", "Taco", "Mango Habanero", "Sweet Chili", "Crazy Sauce", "Lemon Pepper", "Teriyaki", "NEW Spicy Peach"] },
      { title: "Dry Rubs", items: ["Dry Ranch", "Dry Applewood Rub", "Dry Mango Habanero", "NEW Tropical Chili Dry Rub"] }
    ] },
    { section: "Pizza & Stromboli", note: "Thursdays only, 4:00 – 7:00 pm, until sold out.", items: [] }
  ],

  // Announcements show at the top of the Home and Events pages. Newest first.
  // "link" is optional and adds a "Learn more" link.
  announcements: [
    { title: "Hometown Hero Flags", body: "Honor a Conneaut veteran with a tribute flag displayed Memorial Day through Veterans Day.", link: "hometown-heroes.html" }
  ],

  // One-time events. Dates are "YYYY-MM-DD". Past events hide automatically.
  // "image" (optional) is a file in the images folder.
  events: [
    { date: "2026-10-31",
      time: "8:00 – 11:00 pm",
      title: "Halloween Night with Big in Japan",
      host: "Live music from Cleveland party band Big in Japan",
      image: "images/big-in-japan-halloween-band.jpg",
      body: "Big in Japan is bringing the party Halloween night! Come in costume. There will be prizes for the best costumes. See you there!" },
    { date: "2026-11-14",
      time: "1:00 pm",
      title: "Paint & Sip Fundraiser",
      host: "Hosted by the American Legion Auxiliary Unit 151",
      image: "images/paint-and-sip.jpg",
      body: "Paint your own 12-inch round \"Hello Winter\" door hanger with step-by-step instruction from Chris Davis. All materials included, and beginners are welcome. BYOB, light appetizers provided. $45 per person. 100% of proceeds benefit Operation Toys for Freedom.",
      tickets: "Tickets behind the bar, or text/call Nicole at 440-813-6601. Limited seating." }
  ],

  // Recurring meetings. week = which Tuesday etc. of the month (1-4), weekday 0-6.
  meetings: [
    { group: "Sons of the American Legion (SAL)", week: 2, weekday: 2, time: "8:30 pm" },
    { group: "American Legion Auxiliary",         week: 3, weekday: 2, time: "7:00 pm" },
    { group: "Legion General Meeting",            week: 4, weekday: 2, time: "7:30 pm",
      note: "Home Co. 6:00 · Finance 6:15 · Executive 6:30 · Honor Guard 7:00" }
  ],

  // Officers on the About page. One line per officer: { title: "Commander", name: "Jane Doe" },
  // Leave a list empty to show "Officer list coming soon."

  // American Legion Post 151
  officers: [
    { title: "Commander", name: "Kirk Jennings" },
    { title: "1st Vice Commander", name: "Scott Carpetner" },
    { title: "2nd Vice Commander", name: "Rick Heinly" },
    { title: "Finance Officer", name: "Brenda Dorkins" },
    { title: "Adjutant", name: "Dave Cox" },
    { title: "Chaplain", name: "Kevin Jury" },
    { title: "Sergeant-at-Arms", name: "Kevin Jury" },
    { title: "Member at Large", name: "Mike Keller" },
    { title: "Member at Large", name: "Romey Bryant" },
    { title: "Member at Large", name: "Adam Dixon" },
    { title: "Member at Large", name: "Rich Luce" },
  ],

  // Sons of the American Legion
  sonsOfficers: [
    { title: "Commander", name: "Mike Miller" },
    { title: "1st Vice Commander", name: "Corky Erdman" },
    { title: "2nd Vice Commander", name: "Fred Kapen" },
    { title: "Adjutant", name: "George Sabo" },
    { title: "Sergeant-at-Arms", name: "Nick Colby" },
    { title: "Historian", name: "Dennis Rought Sr." },
    { title: "Chaplain", name: "Dennis Rought Jr." }
  ],

  // American Legion Auxiliary
  auxiliaryOfficers: [
    { title: "President", name: "Renee Unruh" },
    { title: "1st Vice President", name: "Nicole Unruh" },
    { title: "2nd Vice President", name: "Sandi Seegert" },
    { title: "Treasurer / Membership", name: "Tina Betts" },
    { title: "Secretary", name: "Mary Halman" }
  ],

  // Membership page (join.html). Dues are per year.
  membership: [
    { group: "The American Legion",
      emblem: "legion",
      dues: "$40",
      contact: "Adjutant",
      who: "Veterans who served at least one day of active federal duty in the U.S. Armed Forces since December 7, 1941, and were honorably discharged or are still serving." },
    { group: "Sons of the American Legion",
      emblem: "sons",
      dues: "$35",
      contact: "Adjutant",
      who: "Sons, grandsons, great-grandsons, adopted sons and stepsons of Legion members, or of veterans who would have been eligible for the Legion." },
    { group: "American Legion Auxiliary",
      emblem: "auxiliary",
      dues: "$40",
      contact: "Treasurer / Membership",
      who: "Spouses, parents, children, grandchildren, great-grandchildren and siblings of Legion members or Legion-eligible veterans." }
  ],

  // Hall rental page (hall-rental.html). Leave price, booking or capacity as "" to show "Call for details".
  hallRental: {
    price: "$30 per hour (3 hours max)",
    booking: "$30 due when you book",
    capacity: "",
    features: [
      "Open to everyone. You don't need to be a member to rent the hall.",
      "Full-service bar. Guests order drinks from the Post bar.",
      "Food catered by the Post kitchen, or bring in the outside caterer of your choice.",
      "Great for birthdays, showers, graduations, reunions, celebrations of life and meetings."
    ],
    note: "Call or send us a message with your date and the number of guests, and we'll let you know if it's available."
  },

  // Hometown Hero banner map (banner-map.html). One line per banner on a pole:
  // { name: "John Smith", branch: "U.S. Army", years: "1965 – 1968", era: "Vietnam",
  //   where: "Broad St, in front of the Post", spot: "41.94681, -80.55430", photo: "images/heroes/john-smith.jpg" },
  // spot is the pole's latitude, longitude (right-click the spot in Google Maps to copy it,
  // or use "Use my location" in the site editor while standing at the pole).
  // sample: true marks made-up pins; delete those once the real banners are in.
  heroBanners: [
    { name: "Richard (Dick) Gross",
      branch: "U.S. Navy",
      years: "1945 - 1952",
      era: "Korea",
      where: "Broad St, on the Pole by the Park",
      spot: "41.959279, -80.553711",
      photo: "images/richard-dick-gross-2026-10-22.jpg" },
    { name: "Thomas Smith",
      branch: "U.S. Navy",
      years: "1942 – 1946",
      era: "WWII",
      where: "Broad St, in front of the Post",
      spot: "41.94695, -80.55432",
      sample: true },
    { name: "Jane Doe",
      branch: "U.S. Air Force",
      years: "1990 – 2010",
      era: "Desert Storm",
      where: "Broad St at Main St",
      spot: "41.94790, -80.55405",
      sample: true },
    { name: "Robert Johnson",
      branch: "U.S. Marine Corps",
      years: "1950 – 1953",
      era: "Korea",
      where: "Main St, east of Broad St",
      spot: "41.94780, -80.55120",
      sample: true },
    { name: "Mary Williams",
      branch: "U.S. Coast Guard",
      years: "1978 – 1982",
      where: "Main St, west of Broad St",
      spot: "41.94755, -80.55760",
      sample: true }
  ],

  // Photo gallery (gallery.html). Put photos in the images/gallery folder, then add a line:
  // { file: "images/gallery/fish-fry.jpg", caption: "Fish fry, Lent 2026" },
  gallery: [
    { file: "images/gallery/hometown-hero-banner-01.jpg" },
    { file: "images/gallery/hometown-hero-banner-02.jpg" },
    { file: "images/gallery/hometown-hero-banner-03.jpg" },
    { file: "images/gallery/hometown-hero-banner-04.jpg" },
    { file: "images/gallery/hometown-hero-banner-05.jpg" },
    { file: "images/gallery/hometown-hero-banner-06.jpg" },
    { file: "images/gallery/hometown-hero-banner-07.jpg" },
    { file: "images/gallery/hometown-hero-banner-08.jpg" },
    { file: "images/gallery/hometown-hero-banner-09.jpg" },
    { file: "images/gallery/hometown-hero-banner-10.jpg" },
    { file: "images/gallery/hometown-hero-banner-11.jpg" },
    { file: "images/gallery/hometown-hero-banner-12.jpg" },
    { file: "images/gallery/hometown-hero-banner-13.jpg" },
    { file: "images/gallery/hometown-hero-banner-14.jpg" },
    { file: "images/gallery/hometown-hero-banner-15.jpg" },
    { file: "images/gallery/hometown-hero-banner-16.jpg" },
    { file: "images/gallery/hometown-hero-banner-17.jpg" },
    { file: "images/gallery/hometown-hero-banner-18.jpg" },
    { file: "images/gallery/hometown-hero-banner-19.jpg" },
    { file: "images/gallery/hometown-hero-banner-20.jpg" },
    { file: "images/gallery/hometown-hero-banner-21.jpg" },
    { file: "images/gallery/hometown-hero-banner-22.jpg" },
    { file: "images/gallery/hometown-hero-banner-23.jpg" },
    { file: "images/gallery/hometown-hero-banner-24.jpg" },
    { file: "images/gallery/hometown-hero-banner-25.jpg" },
    { file: "images/gallery/hometown-hero-banner-26.jpg" },
    { file: "images/gallery/hometown-hero-banner-27.jpg" },
    { file: "images/gallery/hometown-hero-banner-28.jpg" },
    { file: "images/gallery/hometown-hero-banner-29.jpg" },
    { file: "images/gallery/hometown-hero-banner-30.jpg" },
    { file: "images/gallery/hometown-hero-banner-31.jpg" },
    { file: "images/gallery/hometown-hero-banner-32.jpg" },
    { file: "images/gallery/hometown-hero-banner-33.jpg" },
    { file: "images/gallery/hometown-hero-banner-34.jpg" },
    { file: "images/gallery/hometown-hero-banner-35.jpg" },
    { file: "images/gallery/memorial-plaque-36.jpg", caption: "Installing the memorial plaque for Richard & Sandra Nelson" },
    { file: "images/gallery/memorial-plaque-37.jpg", caption: "In loving memory of Richard & Sandra Nelson" },
    { file: "images/gallery/memorial-plaque-38.jpg", caption: "The Nelsons' memorial plaque in place" }
  ],

  // The Sentinel newsletter (sentinel.html). Put PDFs in the downloads folder, newest first:
  // { title: "The Sentinel", date: "November 2026", file: "downloads/sentinel-2026-11.pdf" },
  sentinel: [
    { title: "The Sentinel", date: "November 2, 2026", file: "newsletter/issues/sentinel-november-2-2026.html" }
  ],

  // Draft of the next Sentinel, written in the site editor's "Write The Sentinel" tab.
  sentinelDraft: {
    issue: "November 2, 2026",
    preheader: "The Sentinel",
    coverImage: "images/images-2026-10-22.jpg",
    coverCaption: "BIG IN JAPAN",
    commanderMessage: "I would like to Thank everyone for their help with the Halloween Decorating.",
    commanderSign: "Kirk Jennings, Commander, Cowle Post 151",
    spotlightTitle: "This Week we would like to Spotlight a Selfless Act of Kindness!",
    spotlightBody: "A 5-year-old boy name John helped an old lady with her food cart.",
    includeHours: true,
    includeEvents: true,
    eventDays: "14",
    includeSpecials: true,
    kitchenNews: "Monday's Burger Special - Breakfast Burger - Egg, Bacon, and American Cheese\nTaco Tuesday - 3 Soft/Hard Tacos for $4.00\nWednesday - $0.60 Wing Night\nThursday - Pizza and Stromboli Night\nFriday - Dinner Special - Surf and Turf\nSaturday - Dinner Special - BBQ Chicken w/ Corn and Corn Bread",
    includeHeroes: true,
    auxNews: "Auxiliary Elections are approaching soon. If you would like to run sign up at the Post.",
    sonsNews: "Membership Dues are due by the end of the Year. Late Fee after the 1st of the Year.",
    communityTitle: "Ashcraft Reverse Raffle",
    communityBody: "Ashcraft Reverse Raffle is this Saturday. Doors open at 5:30PM. Please come out and support this wonder cause.",
    newMembers: "John Smith, Jane Doe, and Joe Shit",
    drawings: "Monday - John Smith NSU - $425.00\nTuesday - Jane Doe SU - $230.00",
    taps: "John Smith, U.S. Army, Vietnam",
    includeOfficers: true,
    memberNotice: ""
  },

  // In Memoriam (in-memoriam.html). Members who have passed, newest first:
  // { name: "John Smith", branch: "U.S. Army", service: "Vietnam", date: "October 2026" },
  // branch, service and date are optional.
  inMemoriam: [
  ]
};
