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
  facebook: "https://www.facebook.com/p/American-Legion-Post-151-Conneaut-OH-61566798598965/",

  // Building / social room hours. Day 0 = Sunday ... 6 = Saturday.
  // Times use 24-hour "HH:MM". A close time past midnight (like 01:00) is fine.
  hours: [
    { day: 0, label: "Sunday",    open: "12:00", close: "22:00" },
    { day: 1, label: "Monday",    open: "10:00", close: "01:00" },
    { day: 2, label: "Tuesday",   open: "10:00", close: "01:00" },
    { day: 3, label: "Wednesday", open: "10:00", close: "01:00" },
    { day: 4, label: "Thursday",  open: "10:00", close: "01:00" },
    { day: 5, label: "Friday",    open: "10:00", close: "01:00" },
    { day: 6, label: "Saturday",  open: "10:00", close: "01:00" }
  ],

  kitchenHours: [
    { days: "Mon, Tue, Wed, Fri, Sat", time: "3:00 – 8:00 pm", note: "Full menu. Last orders 7:45 pm." },
    { days: "Thursday", time: "4:00 – 7:00 pm", note: "Pizza & stromboli, until sold out." },
    { days: "Sunday", time: "Closed", note: "" }
  ],

  // Daily specials, one per weekday. Leave "item" empty to show "Ask your bartender".
  specials: [
    { day: 0, item: "Kitchen Closed", price: "", note: "The bar is open noon – 10 pm." },
    { day: 1, item: "Burger Monday", price: "", note: "Featuring a special themed burger. Ask what this week's is!" },
    { day: 2, item: "Taco Tuesday", price: "", note: "" },
    { day: 3, item: "Wing Night", price: "$0.60 wings", note: "" },
    { day: 4, item: "Pizza & Stromboli Night", price: "", note: "4 – 7 pm, until sold out" },
    { day: 5, item: "Dinner Special", price: "", note: "See the media board for this week's dinner." },
    { day: 6, item: "Dinner Special", price: "", note: "See the media board for this week's dinner." }
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
    { date: "2026-11-14", time: "1:00 pm", title: "Paint & Sip Fundraiser",
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
  ]
};
