/* Evently seed data.
   verify: "verified" = details read from a public listing or article on 26 Nov 2026
           "partial"  = some details (time, venue, price) missing or from a short teaser
           "demo"     = invented sample content for testing; not a real event
   Times are local Africa/Kampala (UTC+3). Admins can edit, remove or replace any of this from the Admin page. */
window.EVENTLY_CHECKED = "2026-11-26";

window.EVENTLY_CATEGORIES = [
  {id:"concerts", name:"Concerts", blurb:"Live shows, headliners and album nights"},
  {id:"nightlife", name:"Nightlife", blurb:"Bar nights, lounges, raves and parties"},
  {id:"festivals", name:"Festivals", blurb:"Day-long and multi-day experiences"},
  {id:"comedy", name:"Comedy", blurb:"Stand-up, roasts and comedy nights"},
  {id:"culture", name:"Cultural events", blurb:"Art, theatre, heritage and fashion"},
  {id:"sports", name:"Sports", blurb:"Matches, runs and watch parties"},
  {id:"family", name:"Family events", blurb:"Fun days and kid-friendly outings"},
  {id:"business", name:"Business events", blurb:"Galas, awards and networking"},
  {id:"food", name:"Food and brunch", blurb:"Brunches, dinners and tastings"},
  {id:"free", name:"Free events", blurb:"Free entry, as listed by the organizer", virtual:true}
];

window.EVENTLY_VENUES = {
  "Lugogo Hockey Grounds":{area:"Lugogo",lat:0.3283,lng:32.6047},
  "Cricket Oval Lugogo":{area:"Lugogo",lat:0.3292,lng:32.6026},
  "Millennium Grounds, Lugogo":{area:"Lugogo",lat:0.3276,lng:32.6058},
  "UMA Show Ground, Lugogo":{area:"Lugogo",lat:0.3300,lng:32.6080},
  "Lugogo Legenda Rugby Club":{area:"Lugogo",lat:0.3270,lng:32.6035},
  "Zoe Grounds, Lugogo":{area:"Lugogo",lat:0.3262,lng:32.6068},
  "Kingdom Kampala":{area:"Nakasero",lat:0.3165,lng:32.5838},
  "Noor's Restaurant, Kingdom Kampala":{area:"Nakasero",lat:0.3165,lng:32.5838},
  "Kampala Serena Hotel":{area:"Nakasero",lat:0.3148,lng:32.5810},
  "Sheraton Kampala Hotel":{area:"Nakasero",lat:0.3175,lng:32.5853},
  "Kampala Marriott Hotel":{area:"Nakasero",lat:0.3205,lng:32.5868},
  "ONOMO Hotel Kampala":{area:"Kampala",lat:0.3190,lng:32.5900},
  "Fairway Hotel":{area:"Kololo",lat:0.3262,lng:32.5880},
  "Mezo Noir, Kololo":{area:"Kololo",lat:0.3335,lng:32.5932},
  "Marlin Bistro":{area:"Kampala",lat:null,lng:null},
  "Ishaazi Restaurant & Cafe":{area:"Kampala",lat:null,lng:null},
  "Best Western Plus The Athena Hotel":{area:"Kampala",lat:null,lng:null},
  "The Villa Kampala":{area:"Kampala",lat:null,lng:null},
  "Tales Bar & Lounge, Bukoto":{area:"Bukoto",lat:0.3522,lng:32.5958},
  "Black Panther Lounge, Bukoto-Kisaasi":{area:"Bukoto",lat:0.3560,lng:32.6005},
  "Nuli-Nuli Eatery, Bukoto-Kisasi Road":{area:"Bukoto",lat:0.3575,lng:32.6020},
  "Kabira Country Club":{area:"Bukoto",lat:0.3498,lng:32.5990},
  "El Nivel Bar, Kiwatule":{area:"Kiwatule",lat:0.3712,lng:32.6285},
  "Isabella, Ntinda":{area:"Ntinda",lat:0.3540,lng:32.6140},
  "Dstrkt 24, Kira Road":{area:"Kamwokya",lat:0.3450,lng:32.5925},
  "Motiv UG, Bugolobi":{area:"Bugolobi",lat:0.3185,lng:32.6205},
  "Thrones Bar & Lounge, Luthuli Ring":{area:"Bugolobi",lat:0.3192,lng:32.6178},
  "Zouk Lounge, Spring Road, Bugolobi":{area:"Bugolobi",lat:0.3170,lng:32.6190},
  "Bandali Rise":{area:"Bugolobi",lat:0.3205,lng:32.6255},
  "Protea Hotel by Marriott Kampala Skyz":{area:"Naguru",lat:0.3385,lng:32.6110},
  "Guvnor Uganda":{area:"Industrial Area",lat:0.3150,lng:32.6025},
  "Mestil Hotel & Residences":{area:"Nsambya",lat:0.3008,lng:32.5905},
  "Le Château Brasserie Belge":{area:"Kabalagala",lat:0.2955,lng:32.5965},
  "Xenson Art Space":{area:"Kampala",lat:null,lng:null},
  "Theatre la Bonita":{area:"Kampala CBD",lat:0.3128,lng:32.5772},
  "Supremacy Lounge, Nakulabye":{area:"Nakulabye",lat:0.3262,lng:32.5622},
  "Vegas Chillout, Kawempe":{area:"Kawempe",lat:0.3800,lng:32.5600},
  "Sip Lounge":{area:"Kampala",lat:null,lng:null},
  "Pearl Liquors Hub & Lounge":{area:"Kampala",lat:null,lng:null},
  "Hotel Noesis":{area:"Kampala",lat:null,lng:null},
  "Le Botti":{area:"Kampala",lat:null,lng:null},
  "Das Berliner Hotel, Bulenga":{area:"Bulenga, Wakiso",lat:0.3060,lng:32.4920},
  "Kalagala Falls":{area:"Kalagala, near Jinja",lat:0.5900,lng:33.0600},
  "Shooters Bar & Grill, Mbarara":{area:"Mbarara",lat:-0.6070,lng:30.6540},
  "Kisoro":{area:"Kisoro",lat:-1.2850,lng:29.6850},
  "Elgon Museum":{area:"Not stated",lat:null,lng:null},
  "Patwoni Country Club, Bweyale":{area:"Bweyale",lat:2.0700,lng:32.1500},
  "Lunkulu Island":{area:"Lake Victoria",lat:null,lng:null},
  "Venue to be announced, Kampala":{area:"Kampala",lat:null,lng:null},
  "Evently Demo Hall, Ntinda":{area:"Ntinda",lat:0.3555,lng:32.6160},
  "Evently Demo Rooftop, Kololo":{area:"Kololo",lat:0.3345,lng:32.5905},
  "Evently Demo Gardens, Muyenga":{area:"Muyenga",lat:0.2960,lng:32.6150}
};

(function(){
  const EV = "evento.ug", AE = "allevents.ug", AI = "allevents.in";
  const e = [];
  const add = o => e.push(o);

  /* ---------- Headline concerts and festivals ---------- */
  add({slug:"braka-land-east-africa-2026",tickets:{"url": "https://www.brakaland.ug/", "site": "brakaland.ug"},title:"B'raka Land East Africa 2026",cat:"concerts",tags:["afrobeats","music","joshua baraka"],artists:["Joshua Baraka"],
    start:"2026-11-28T18:00",venue:"Lugogo Hockey Grounds",city:"Kampala",price:{from:75000},organizer:"Not stated on listing",
    desc:"Joshua Baraka's B'raka Land comes to Lugogo Hockey Grounds. The listing shows tickets from UGX 75,000 with three other price points.",
    sources:[{name:EV,url:"https://evento.ug/event/79332702/braka-land-ea-2026/"},{name:AE,url:"https://www.allevents.ug/events/joshua-baraka-braka-land-east-africa-2026"}],
    booking:"https://evento.ug/event/79332702/braka-land-ea-2026/",verify:"verified",featured:true,base:940});
  add({slug:"blankets-and-wine-kampala-december-2026",tickets:{"url": "https://www.blanketsandwine.com/event/blankets-wine-kampala", "site": "blanketsandwine.com"},title:"Blankets & Wine Kampala: December 2026",cat:"festivals",tags:["afrobeats","amapiano","picnic","music","bnxn"],artists:["BNXN","King Saha","Aziz Azion","Kyle Simbwa","Tojo","Sean Offixial","Tai Dai","DJ Etania","Selector Jay","Fem Deejay","DJ Ssese","DJ Dash"],
    start:"2026-12-13T12:00",end:"2026-12-14T00:00",venue:"Millennium Grounds, Lugogo",city:"Kampala",price:{from:100000,note:"Early bird UGX 100,000. Chama House access UGX 250,000."},organizer:"Blankets & Wine",
    desc:"A 12-hour picnic-style music and lifestyle festival closing the year, headlined by Nigerian Afro-fusion star BNXN. Expect Afrobeats, Amapiano and local club music from King Saha, Aziz Azion, Kyle Simbwa, Tojo and more, with DJs Etania, Selector Jay, Fem Deejay, DJ Ssese and DJ Dash.",
    sources:[{name:AE,url:"https://www.allevents.ug/nigerian-afro-fusion-star-bnxn-set-to-headline-the-kamala-edition-of-blankets-wine-kampala-2026"},{name:"blanketsandwine.com",url:"https://www.blanketsandwine.com/event/blankets-wine-kampala"}],
    booking:"https://www.blanketsandwine.com/event/blankets-wine-kampala",verify:"verified",featured:true,base:1210});
  add({slug:"pare-pare-rave-2026-uncle-waffles",tickets:{"url": "https://book.tkt.ug/pare-pare-rave", "site": "tkt.ug"},title:"Pare Pare Rave 2026 ft. Uncle Waffles",cat:"nightlife",tags:["amapiano","rave","party","dj"],artists:["Uncle Waffles"],
    start:"2026-12-18T20:00",timeTBC:true,venue:"Venue to be announced, Kampala",city:"Kampala",price:{note:"Price not stated on the official site."},organizer:"Pare Pare Rave",
    desc:"South African Amapiano star Uncle Waffles headlines Pare Pare Rave in Kampala. Amapiano all night. The official site does not yet name the venue or start time.",
    sources:[{name:"rave.ug",url:"https://rave.ug/"}],booking:"https://book.tkt.ug/pare-pare-rave",verify:"partial",featured:true,base:1080});
  add({slug:"unlimited-jose-chameleone-live-2026",title:"Unlimited: Dr Jose Chameleone Live in Concert",cat:"concerts",tags:["music","legend","afropop"],artists:["Jose Chameleone"],
    start:"2026-12-04T17:00",venue:"Cricket Oval Lugogo",city:"Kampala",price:{from:20000},organizer:"Not stated on listing",
    desc:"Dr Jose Chameleone's Unlimited concert at the Cricket Oval, Lugogo.",
    sources:[{name:EV,url:"https://evento.ug/event/57917106/unlimited-dr-jose-chameleone-live-concert-2026/"}],booking:"https://evento.ug/event/57917106/unlimited-dr-jose-chameleone-live-concert-2026/",verify:"verified",featured:true,base:860});
  add({slug:"konshens-live-in-kampala-2026",tickets:{"url": "https://www.tagticketing.com/", "site": "tagticketing.com", "note": "Search for Konshens on the site."},title:"Konshens Live in Kampala",cat:"concerts",tags:["dancehall","music","reggae"],artists:["Konshens"],
    start:"2026-12-11T18:00",venue:"Cricket Oval Lugogo",city:"Kampala",price:{from:20000},organizer:"Not stated on listing",
    desc:"Jamaican dancehall star Konshens performs live at the Cricket Oval, Lugogo.",
    sources:[{name:EV,url:"https://evento.ug/event/81862247/konshens-live-kampala-2026/"}],booking:"https://evento.ug/event/81862247/konshens-live-kampala-2026/",verify:"verified",base:780});
  add({slug:"nina-roz-live-in-concert",title:"Nina Roz Live in Concert",cat:"concerts",tags:["music","afropop"],artists:["Nina Roz"],
    start:"2026-12-11T18:00",venue:"Lugogo Hockey Grounds",city:"Kampala",price:{from:30000},organizer:"Not stated on listing",
    desc:"Nina Roz headlines her own concert at Lugogo Hockey Grounds.",
    sources:[{name:EV,url:"https://evento.ug/event/7709595/nina-roz-live-concert/"}],booking:"https://evento.ug/event/7709595/nina-roz-live-concert/",verify:"verified",base:520});
  add({slug:"mariam-ndagire-live-in-concert-2026",title:"Mariam Ndagire Live in Concert",cat:"concerts",tags:["music","kadongo kamu","legend"],artists:["Mariam Ndagire"],
    start:"2026-12-11T18:00",venue:"Kingdom Kampala",city:"Kampala",price:{from:200000},organizer:"Not stated on listing",
    desc:"Mariam Ndagire's 2026 concert at Kingdom Kampala.",
    sources:[{name:EV,url:"https://evento.ug/event/11158460/mariam-ndagire-live-concert-2026/"}],booking:"https://evento.ug/event/11158460/mariam-ndagire-live-concert-2026/",verify:"verified",base:360});
  add({slug:"rachel-magoola-60-still-shining",tickets:{"url": "https://www.quicket.co.ug/", "site": "Quicket", "note": "Search the event name on Quicket. Also on MTN MoMo by dialling *165*20#."},title:"Rachel Magoola @ 60: Still Shining",cat:"concerts",tags:["music","afrigo","legend"],artists:["Rachel Magoola","Afrigo Band"],
    start:"2026-11-27T15:00",venue:"Kingdom Kampala",city:"Kampala",price:{from:100000,note:"Bronze UGX 100,000, Silver 200,000, Gold table of 4 UGX 2,000,000, Platinum table of 8 UGX 4,000,000."},organizer:"The Afrigo Band",
    desc:"Rachel Magoola celebrates 60 with a concert at Kingdom Kampala. Note: evento.ug lists a 3:00 PM start while allevents.in lists 11:00 AM. Confirm with the organizer.",
    sources:[{name:EV,url:"https://evento.ug/event/35261360/rachel-magoola-60-still-shining/"},{name:AI,url:"https://allevents.in/kampala/rachelmagoola-60-still-shining/200031004911215"}],booking:"https://evento.ug/event/35261360/rachel-magoola-60-still-shining/",verify:"verified",featured:true,base:640});
  add({slug:"tugende-mu-kikadde-2026",title:"Tugende Mu Kikadde 2026",cat:"concerts",tags:["music","kadongo kamu","oldies"],
    start:"2026-12-05T18:00",venue:"Kampala Serena Hotel",city:"Kampala",price:{from:200000},organizer:"Not stated on listing",
    desc:"An evening of classic Ugandan music at Kampala Serena Hotel.",
    sources:[{name:EV,url:"https://evento.ug/event/29383619/tugende-mu-kikadde-2026/"}],booking:"https://evento.ug/event/29383619/tugende-mu-kikadde-2026/",verify:"verified",base:410});
  add({slug:"frencha-nezza-the-journey-concert",title:"Frencha Nezza Live: The Journey Concert",cat:"concerts",tags:["music"],artists:["Frencha Nezza"],
    start:"2026-12-04T18:00",venue:"Elgon Museum",city:"Not stated",price:{from:20000},organizer:"Not stated on listing",
    desc:"Frencha Nezza performs The Journey concert at Elgon Museum. The listing does not name the town.",
    sources:[{name:EV,url:"https://evento.ug/event/39297185/frencha-nezza-live-journey-concert/"}],booking:"https://evento.ug/event/39297185/frencha-nezza-live-journey-concert/",verify:"partial",base:140});
  add({slug:"blu3-up-close-christmas-together",tickets:{"url": "https://www.quicket.co.ug/", "site": "Quicket", "note": "Search the event name on Quicket."},title:"BLU3: Up Close & Personal, Christmas Together",cat:"concerts",tags:["music","rnb","christmas"],artists:["BLU*3"],
    start:"2026-12-17T17:00",venue:"Protea Hotel by Marriott Kampala Skyz",city:"Kampala",price:{from:120000},organizer:"Not stated on listing",
    desc:"An intimate Christmas show with BLU*3 at Protea Hotel Kampala Skyz.",
    sources:[{name:EV,url:"https://evento.ug/event/21095710/blu3-up-close-personal-christmas-together/"}],booking:"https://evento.ug/event/21095710/blu3-up-close-personal-christmas-together/",verify:"verified",base:470});
  add({slug:"odeal-live-lugogo-2026",title:"Odeal Live in Kampala",cat:"concerts",tags:["afrobeats","music"],artists:["Odeal"],
    start:"2026-12-18T19:00",timeTBC:true,venue:"Lugogo Hockey Grounds",city:"Kampala",price:{note:"Price not stated."},organizer:"Not stated",
    desc:"British-Nigerian singer Odeal is billed for the National Hockey Stadium, Lugogo. Seen only as a short teaser, so check the official announcement for time and tickets.",
    sources:[{name:AE,url:"https://www.allevents.ug/events"}],verify:"partial",base:520});
  add({slug:"big-doug-kampala-2026",tickets:{"url": "https://www.quicket.co.ug/", "site": "Quicket", "note": "Search the event name on Quicket."},title:"Big Doug Live",cat:"concerts",tags:["pop","music"],artists:["Big Doug"],
    start:"2026-12-12T15:30",venue:"Nuli-Nuli Eatery, Bukoto-Kisasi Road",city:"Kampala",price:{note:"Price not stated. Tickets sold via Quicket."},organizer:"Not stated",
    desc:"Big Doug performs at Nuli-Nuli Eatery on Bukoto-Kisasi Road.",
    sources:[{name:"shazam.com",url:"https://www.shazam.com/en-gb/event/369d8df9-717a-42de-83ca-2b20cd0e4b06"}],verify:"verified",base:120});
  add({slug:"abrahafrik-d-youngstar-christmas-2026",title:"Abrahafrik D Youngstar Live",cat:"concerts",tags:["music","christmas"],artists:["Abrahafrik D Youngstar"],
    start:"2026-12-25T19:00",venue:"Das Berliner Hotel, Bulenga",city:"Wakiso",price:{note:"Price not stated."},organizer:"Not stated",
    desc:"A Christmas night concert at Das Berliner Hotel, Bulenga.",
    sources:[{name:"shazam.com",url:"https://www.shazam.com/en-us/event/3ec0fe55-a3f3-4c06-b479-31f22e0b54c0"}],verify:"verified",base:90});
  add({slug:"cherubim-chamber-chorale-kenneth-mugabi",title:"The Cherubim Chamber Chorale with Kenneth Mugabi",cat:"concerts",tags:["choir","acoustic","music"],artists:["Kenneth Mugabi","The Cherubim Chamber Chorale"],
    start:"2026-12-05T18:00",timeTBC:true,venue:"Sheraton Kampala Hotel",city:"Kampala",price:{note:"Price not stated."},organizer:"Not stated",
    desc:"A choral evening at Sheraton Kampala featuring Kenneth Mugabi. Seen only in a Bandsintown listing title, so time and price are unconfirmed.",
    sources:[{name:"bandsintown.com",url:"https://www.bandsintown.com/e/108752625-kenneth-mugabi-at-sheraton-kampala-hotel"}],verify:"partial",base:210});
  add({slug:"slick-stuart-roja-live-mbarara",title:"Slick Stuart & Roja Live in Mbarara",cat:"nightlife",tags:["dj","party"],artists:["DJ Slick Stuart","DJ Roja"],
    start:"2026-12-05T18:00",venue:"Shooters Bar & Grill, Mbarara",city:"Mbarara",price:{free:true},organizer:"Not stated on listing",
    desc:"DJs Slick Stuart and Roja take over Shooters Bar & Grill in Mbarara.",
    sources:[{name:EV,url:"https://evento.ug/event/8230626/slick-stuart-and-roja-live-mbarara/"}],verify:"verified",base:260});
  add({slug:"champion-bwoy-tour-bweyale",title:"Champion Bwoy Tour Live in Bweyale",cat:"concerts",tags:["music","tour"],
    start:"2026-12-13T11:00",venue:"Patwoni Country Club, Bweyale",city:"Bweyale",price:{note:"Price not stated."},organizer:"Not stated",
    desc:"The Champion Bwoy Tour stops at Patwoni Country Club in Bweyale.",
    sources:[{name:AI,url:"https://allevents.in/kampala/champion-bwoy-tour-live-in-bweyale/200031019743755"}],verify:"partial",base:70});
  add({slug:"world-aids-day-concert-lugogo-2026",title:"World AIDS Day Concert",cat:"concerts",tags:["music","community","free"],
    start:"2026-11-27T17:00",end:"2026-11-27T20:00",venue:"Zoe Grounds, Lugogo",city:"Kampala",price:{free:true},organizer:"AHF Uganda Cares with the Ministry of Health, Uganda AIDS Commission and partners",
    desc:"A free World AIDS Day concert with music, comedy and contests, organised by AHF Uganda Cares and partners.",
    sources:[{name:AI,url:"https://allevents.in/kampala/lugogo-world-aids-day-concert-millennium-park/200030996291020"}],verify:"verified",base:300});

  /* ---------- Nightlife and bar nights ---------- */
  add({slug:"king-saha-live-tales-lounge",title:"King Saha Live at Tales Lounge",cat:"nightlife",tags:["music","bar night"],artists:["King Saha"],
    start:"2026-11-26T18:00",venue:"Tales Bar & Lounge, Bukoto",city:"Kampala",price:{free:true},organizer:"Tales Lounge",
    desc:"King Saha performs live at Tales Lounge in Bukoto.",sources:[{name:EV,url:"https://evento.ug/event/60497170/king-saha-live-tales-lounge/"}],verify:"verified",base:510});
  add({slug:"rhythm-and-soul-thursdays-spice-diana",title:"Rhythm & Soul Thursdays ft. Spice Diana",cat:"nightlife",tags:["bar night","music","rnb"],artists:["Spice Diana"],
    start:"2026-11-26T18:00",venue:"Black Panther Lounge, Bukoto-Kisaasi",city:"Kampala",price:{free:true,note:"Free entry as listed."},organizer:"Black Panther Lounge",
    desc:"The Thursday night series at Black Panther Lounge, this week featuring Spice Diana.",
    sources:[{name:EV,url:"https://evento.ug/event/23703248/rhythm-soul-thursdays/"},{name:AE,url:"https://www.allevents.ug/events/rhythm-soul-thursdays-featuring-spice-diana"}],verify:"verified",base:430});
  add({slug:"supa-star-hours-thrones",title:"Supa Star Hours",cat:"nightlife",tags:["bar night","party"],
    start:"2026-11-26T20:00",timeTBC:true,venue:"Thrones Bar & Lounge, Luthuli Ring",city:"Kampala",price:{free:true,note:"Free entry as listed."},organizer:"Thrones Kampala",
    desc:"Thursday night at Thrones Bar & Lounge on Luthuli Ring.",sources:[{name:AE,url:"https://www.allevents.ug/events/supa-star-hours"}],verify:"partial",base:190});
  add({slug:"el-nivel-rock-night",title:"el Nivel Rock Night",cat:"nightlife",tags:["rock","bar night","live band"],
    start:"2026-11-26T18:00",venue:"El Nivel Bar, Kiwatule",city:"Kampala",price:{free:true},organizer:"El Nivel Bar",
    desc:"A rock night at El Nivel Bar in Kiwatule.",sources:[{name:EV,url:"https://evento.ug/event/216043835/el-nivel-rock-night/"}],verify:"verified",base:150});
  add({slug:"le-botti-ladies-night",title:"Le Botti Ladies Night",cat:"nightlife",tags:["bar night","ladies night"],
    start:"2026-11-26T18:00",venue:"Le Botti",city:"Kampala",price:{free:true},organizer:"Le Botti",
    desc:"Thursday ladies night at Le Botti.",sources:[{name:EV,url:"https://evento.ug/event/11594661/le-botti-ladies-night/"}],verify:"verified",base:170});
  add({slug:"villa-good-vibes-friday",title:"The Villa Good Vibes Friday",cat:"nightlife",tags:["bar night","party","dj"],
    start:"2026-11-27T18:00",venue:"The Villa Kampala",city:"Kampala",price:{free:true},organizer:"The Villa Kampala",
    desc:"Friday night vibes at The Villa Kampala.",sources:[{name:EV,url:"https://evento.ug/event/68393336/villa-good-vibes-friday/"}],verify:"verified",base:330});
  add({slug:"timeless-xperience-7th-edition",title:"Timeless Xperience: 7th Edition",cat:"nightlife",tags:["party","throwback"],
    start:"2026-11-27T20:00",timeTBC:true,venue:"Zouk Lounge, Spring Road, Bugolobi",city:"Kampala",price:{free:true,note:"Free entry as listed."},organizer:"Zouk Lounge & Restaurant",
    desc:"The seventh edition of Timeless Xperience at Zouk Lounge, Plot 67A Spring Road, Bugolobi.",sources:[{name:AE,url:"https://www.allevents.ug/events/timeless-xperience-7th-edition"}],verify:"partial",base:280});
  add({slug:"bien-alusa-continua-album-watch-party",title:"Bien: Alusa Continua Album Watch Party",cat:"nightlife",tags:["afropop","album","party"],artists:["Bien"],
    start:"2026-11-27T18:00",venue:"Motiv UG, Bugolobi",city:"Kampala",price:{free:true},organizer:"Not stated on listing",
    desc:"Kenyan star Bien hosts a watch party for his album Alusa Continua at Motiv.",sources:[{name:EV,url:"https://evento.ug/event/81720483/bien-alusa-continua-album-watch-party/"}],verify:"verified",featured:true,base:590});
  add({slug:"love-fest-2nd-edition",title:"Love Fest: 2nd Edition",cat:"nightlife",tags:["party","music"],
    start:"2026-11-27T18:00",venue:"Sip Lounge",city:"Kampala",price:{from:20000},organizer:"Not stated on listing",
    desc:"The second edition of Love Fest at Sip Lounge.",sources:[{name:EV,url:"https://evento.ug/event/89409971/love-fest-2nd-edition/"}],verify:"verified",base:160});
  add({slug:"kidwyne-made-in-vegas",title:"Kidwyne: Made in Vegas",cat:"nightlife",tags:["party","music"],artists:["Kidwyne"],
    start:"2026-11-27T18:00",venue:"Vegas Chillout, Kawempe",city:"Kampala",price:{from:20000},organizer:"Not stated on listing",
    desc:"Kidwyne's Made in Vegas night at Vegas Chillout, Kawempe.",sources:[{name:EV,url:"https://evento.ug/event/41397251/kidwyne-made-vegas/"}],verify:"verified",base:150});
  add({slug:"hot-buttered-soul-rnb",title:"Hot Buttered Soul: RnB Night",cat:"nightlife",tags:["rnb","bar night"],
    start:"2026-11-27T21:00",venue:"Marlin Bistro",city:"Kampala",price:{from:50000},organizer:"Not stated on listing",
    desc:"An RnB night at Marlin Bistro.",sources:[{name:EV,url:"https://evento.ug/event/77945680/hot-buttered-soul-rnb/"}],verify:"verified",base:200});
  add({slug:"afrolatin-fridays-noors",title:"AfroLatin Fridays",cat:"nightlife",tags:["dance","salsa","bachata","kizomba"],
    start:"2026-11-27T18:00",venue:"Noor's Restaurant, Kingdom Kampala",city:"Kampala",price:{note:"Price not stated."},organizer:"Not stated",
    desc:"A Friday social dance night with bachata, kizomba, konpa and salsa. Gates open at 6 PM.",sources:[{name:AI,url:"https://allevents.in/kampala/afrolatinfridays/200031069655842"}],verify:"verified",base:140});
  add({slug:"madoxx-sematimba-night-with-the-legend",title:"Madoxx Sematimba: A Night With The Legend",cat:"nightlife",tags:["music","legend","bar night"],artists:["Madoxx Sematimba"],
    start:"2026-11-28T18:00",venue:"Pearl Liquors Hub & Lounge",city:"Kampala",price:{free:true},organizer:"Not stated on listing",
    desc:"Madoxx Sematimba live at Pearl Liquors Hub & Lounge.",sources:[{name:EV,url:"https://evento.ug/event/99977620/madoxx-sematimba-night-legend/"}],verify:"verified",base:240});
  add({slug:"melanin-soul-rnb-blackroots",tickets:{"url": "https://www.quicket.co.ug/", "site": "Quicket", "note": "Search the event name on Quicket."},title:"Melanin Soul and RnB ft. Blackroots Academy of Soul",cat:"concerts",tags:["rnb","soul","live band"],
    start:"2026-11-28T18:00",venue:"Hotel Noesis",city:"Kampala",price:{from:30000},organizer:"Blackroots Academy of Soul",
    desc:"A soul and RnB evening with Blackroots Academy of Soul at Hotel Noesis.",sources:[{name:EV,url:"https://evento.ug/event/84741366/melanin-soul-and-rnb-feat-blackroots-academy-of-soul/"}],verify:"verified",base:120});
  add({slug:"great-maro-concert",title:"The Great Maro Concert",cat:"nightlife",tags:["music","bar night"],artists:["Maro"],
    start:"2026-12-04T18:00",venue:"El Nivel Bar, Kiwatule",city:"Kampala",price:{free:true},organizer:"Not stated on listing",
    desc:"Maro performs at El Nivel Bar in Kiwatule.",sources:[{name:EV,url:"https://evento.ug/event/16261174/great-maro-concert/"}],verify:"verified",base:180});
  add({slug:"fancy-at-7-nyama-edition",title:"Fancy @7: Nyama Edition",cat:"nightlife",tags:["party","anniversary","nyama choma"],
    start:"2026-12-04T19:00",timeTBC:true,venue:"Fancy Lounge, Kisasi-Kyanja Road",city:"Kampala",price:{note:"Price not stated."},organizer:"Fancy Lounge",
    desc:"Fancy Lounge marks its 7th anniversary with a nyama edition party on Kisasi-Kyanja Road.",sources:[{name:AI,url:"https://allevents.in/kampala/fancy-7-nyama-edition/200031033797518"}],verify:"partial",base:110});
  add({slug:"4th-floor-intimate-experience",tickets:{"url": "https://www.quicket.co.ug/", "site": "Quicket", "note": "Search the event name on Quicket, or scan the QR code on the poster."},title:"The 4th Floor Intimate Experience",cat:"nightlife",tags:["lounge","music"],
    start:"2026-12-05T18:00",venue:"Tales Bar & Lounge, Bukoto",city:"Kampala",price:{from:50000,note:"evento.ug shows Free, allevents.ug shows from UGX 50,000. Confirm with the venue."},organizer:"Tales Lounge",
    desc:"An intimate night on the 4th floor at Tales, Bukoto.",sources:[{name:EV,url:"https://evento.ug/event/44238896/4th-floor-intimate-experience/"},{name:AE,url:"https://www.allevents.ug/events/the-4th-floor-intimate-experience"}],verify:"verified",base:210});
  add({slug:"boozy-brunch-thrones",title:"Boozy Brunch at Thrones",cat:"food",tags:["brunch","party"],
    start:"2026-12-06T18:00",venue:"Thrones Bar & Lounge, Luthuli Ring",city:"Kampala",price:{free:true},organizer:"Thrones Kampala",
    desc:"A brunch party at Thrones Kampala.",sources:[{name:EV,url:"https://evento.ug/event/44098009/boozy-brunch/"}],verify:"verified",base:220});
  add({slug:"bandali-day-one-street-one-night",title:"Bandali Day: One Street, One City, One Night",cat:"festivals",tags:["street party","music"],
    start:"2026-12-06T12:00",venue:"Bandali Rise",city:"Kampala",price:{free:true},organizer:"Not stated on listing",
    desc:"A one-street party on Bandali Rise, Bugolobi, running from midday.",sources:[{name:EV,url:"https://evento.ug/event/5336054/bandali-day-one-street-one-city-one-night/"}],verify:"verified",featured:true,base:690});
  add({slug:"afro-netion-wave-edition",title:"Afro Netion: Wave Edition",cat:"nightlife",tags:["afrobeats","party"],
    start:"2026-12-19T18:00",venue:"Motiv UG, Bugolobi",city:"Kampala",price:{from:30000},organizer:"Not stated on listing",
    desc:"The Wave Edition of Afro Netion at Motiv.",sources:[{name:EV,url:"https://evento.ug/event/15610546/afro-netion-wave-edition/"}],verify:"verified",base:260});
  add({slug:"ballers-party-guvnor",title:"Ballers Party",cat:"nightlife",tags:["club","party"],
    start:"2026-12-17T21:00",venue:"Guvnor Uganda",city:"Kampala",price:{free:true},organizer:"Guvnor Uganda",
    desc:"A Ballers Party night at Guvnor.",sources:[{name:EV,url:"https://evento.ug/event/99391676/ballers-party/"}],verify:"verified",base:300});
  add({slug:"old-school-rnb-and-friends",title:"Old School RnB & Friends",cat:"concerts",tags:["rnb","throwback"],
    start:"2026-12-20T12:00",venue:"Mestil Hotel & Residences",city:"Kampala",price:{free:true},organizer:"Not stated on listing",
    desc:"An afternoon of old school RnB at Mestil Hotel.",sources:[{name:EV,url:"https://evento.ug/event/56083065/old-school-rnb-friends/"}],verify:"verified",base:200});
  add({slug:"jaguza-hiphop-xenson",title:"Jaguza Hip Hop",cat:"concerts",tags:["hip-hop","music"],
    start:"2026-12-12T18:00",timeTBC:true,venue:"Xenson Art Space",city:"Kampala",price:{from:30000,note:"Listed as \"only 30k\" via Karitickets."},organizer:"Not stated",
    desc:"A hip-hop night at Xenson Art Space.",sources:[{name:AI,url:"https://allevents.in/kampala/parties"}],verify:"partial",base:170});

  /* ---------- Recurring bar nights (from 2026 press coverage) ---------- */
  add({slug:"useless-mondays-mezo-noir",title:"Useless Mondays",cat:"nightlife",tags:["bar night","dj","weekly","theme night"],artists:["DJ Dash"],
    recurring:{dow:1,time:"20:00",hours:5},timeTBC:true,venue:"Mezo Noir, Kololo",city:"Kampala",price:{note:"Price not stated."},organizer:"Mezo Noir with Don Julio",
    desc:"A weekly Monday theme night hosted by DJ Dash at Mezo Noir, Kololo. It marked its first anniversary in June 2026. Confirm this week's edition with the venue before you go.",
    sources:[{name:"Nile Post via allAfrica",url:"https://allafrica.com/stories/202606100678.html"}],verify:"partial",base:380});
  add({slug:"4-pitchers-midweek-madness",title:"4 Pitchers Midweek Madness",cat:"comedy",tags:["comedy","bar night","weekly","free"],
    recurring:{dow:2,time:"19:00",hours:5},venue:"Dstrkt 24, Kira Road",city:"Kampala",price:{free:true,note:"Free entry."},organizer:"District Management, 4 Pitchers and Stress Clinic",
    desc:"A weekly Tuesday night of comedy and music at Dstrkt 24 on Kira Road, next to Georgina Eye Clinic, from 7 PM. Launched in June 2026. Confirm this week's lineup with the venue.",
    sources:[{name:"Matooke Republic",url:"https://www.matookerepublic.com/entertainment/events/20260530/kampala-gets-a-new-weekly-comedy-and-entertainment-hotspot/"}],verify:"partial",base:330});
  add({slug:"tusker-malt-band-night-isabella",title:"Tusker Malt Band Night",cat:"nightlife",tags:["live band","bar night","weekly"],
    recurring:{dow:5,time:"20:00",hours:4},timeTBC:true,venue:"Isabella, Ntinda",city:"Kampala",price:{note:"Price not stated."},organizer:"Tusker Malt and The Singleton",
    desc:"Weekly live band nights, with Friday nights at Isabella in Ntinda given as an example. Bands named include Abeeka Band, Janzi Band and Vanessa and the Band. Confirm the week's band with the venue.",
    sources:[{name:"Nile Post",url:"https://nilepost.co.ug/entertainment/325447/tusker-malt-singleton-take-band-nights-nationwide"}],verify:"partial",base:210});

  /* ---------- Comedy, culture, sport, food, business, family ---------- */
  add({slug:"comedy-night-dr-hilary-okello",title:"Comedy Night with Dr. Hilary Okello",cat:"comedy",tags:["stand-up"],artists:["Hilary Okello"],
    start:"2026-11-26T18:00",venue:"ONOMO Hotel Kampala",city:"Kampala",price:{from:150000},organizer:"Not stated on listing",
    desc:"Comedian Dr. Hilary Okello at ONOMO Hotel Kampala.",sources:[{name:EV,url:"https://evento.ug/event/46914862/comedy-night-dr-hilary-okello/"}],verify:"verified",base:260});
  add({slug:"organised-chaos-november-2026",title:"Organised Chaos: November",cat:"comedy",tags:["stand-up","open mic"],
    start:"2026-11-27T18:00",venue:"Ishaazi Restaurant & Cafe",city:"Kampala",price:{free:true},organizer:"Not stated on listing",
    desc:"The November edition of Organised Chaos comedy at Ishaazi Restaurant & Cafe.",sources:[{name:EV,url:"https://evento.ug/event/73198251/organised-chaos-november-2026/"}],verify:"verified",base:150});
  add({slug:"jack-daniels-off-the-record-karole-kasita",title:"Jack Daniel's Off The Record ft. Karole Kasita",cat:"nightlife",tags:["music","party"],artists:["Karole Kasita"],
    start:"2026-11-28T18:00",venue:"Thrones Bar & Lounge, Luthuli Ring",city:"Kampala",price:{free:true},organizer:"Not stated on listing",
    desc:"Karole Kasita headlines Off The Record at Thrones Kampala.",sources:[{name:EV,url:"https://evento.ug/event/62253918/jack-daniel-s-record-ft-karole-kasita/"}],verify:"verified",base:450});
  add({slug:"friends-of-mardrat-and-chiko-2026",title:"Friends of Mardrat & Chiko",cat:"comedy",tags:["comedy"],artists:["Mardrat","Chiko"],
    start:"2026-12-19T18:00",venue:"The Villa Kampala",city:"Kampala",price:{free:true},organizer:"Not stated on listing",
    desc:"Comedians Mardrat and Chiko and friends at The Villa Kampala.",sources:[{name:EV,url:"https://evento.ug/event/32006704/friends-of-mardrat-chiko-2026/"}],verify:"verified",base:280});
  add({slug:"gubumbujja-live-stage-play",title:"Gubumbujja: Live Stage Play",cat:"culture",tags:["theatre","play"],
    start:"2026-11-27T19:00",timeTBC:true,venue:"Theatre la Bonita",city:"Kampala",price:{note:"Price not stated."},organizer:"Aromatic Entertainment",
    desc:"A live stage play by Aromatic Entertainment at Theatre la Bonita.",sources:[{name:AI,url:"https://allevents.in/kampala/parties"}],verify:"partial",base:130});
  add({slug:"karakta-africa-2026-rebirth",title:"KARAKTA Africa 2026: Rebirth",cat:"culture",tags:["art","exhibition"],
    start:"2026-11-27T18:00",venue:"Xenson Art Space",city:"Kampala",price:{free:true},organizer:"Not stated on listing",
    desc:"KARAKTA Africa's 2026 edition, Rebirth, at Xenson Art Space.",sources:[{name:EV,url:"https://evento.ug/event/56686671/karakta-africa-2026-rebirth/"}],verify:"verified",base:160});
  add({slug:"onomo-arts-experience-vol-6",title:"Onomo Arts Experience Vol. 6",cat:"culture",tags:["art","networking"],
    start:"2026-11-28T12:00",venue:"ONOMO Hotel Kampala",city:"Kampala",price:{free:true},organizer:"ONOMO Hotel Kampala",
    desc:"The sixth Onomo Arts Experience, a daytime arts gathering at ONOMO Hotel.",sources:[{name:EV,url:"https://evento.ug/event/48989561/onomo-arts-experience-vol-6/"}],verify:"verified",base:120});
  add({slug:"alur-cultural-festival-12th-edition",title:"Alur Cultural Festival: 12th Edition",cat:"culture",tags:["heritage","festival","culture"],
    start:"2026-12-06T10:00",timeTBC:true,venue:"UMA Show Ground, Lugogo",city:"Kampala",price:{note:"Price not stated."},organizer:"Not stated",
    desc:"The 12th Alur Cultural Festival celebrating Alur heritage at UMA Show Ground, Lugogo.",sources:[{name:AI,url:"https://allevents.in/kampala/parties"}],verify:"partial",base:240});
  add({slug:"rugby-uganda-cup-finals-2026",title:"Rugby Uganda Cup Finals 2026",cat:"sports",tags:["rugby"],
    start:"2026-11-28T16:00",venue:"Lugogo Legenda Rugby Club",city:"Kampala",price:{from:20000},organizer:"Not stated on listing",
    desc:"The Uganda Cup rugby finals at Legends Rugby Grounds, Lugogo.",sources:[{name:EV,url:"https://evento.ug/event/34798987/rugby-uganda-cup-finals-2026/"}],verify:"verified",base:330});
  add({slug:"batwa-run-2026",title:"Batwa Run 2026",cat:"sports",tags:["run","fitness","charity"],
    start:"2026-11-29T07:00",end:"2026-11-29T12:00",venue:"Kisoro",city:"Kisoro",price:{from:30000},organizer:"Not stated on listing",
    desc:"The 2026 Batwa Run in Kisoro.",sources:[{name:EV,url:"https://evento.ug/event/44410674/batwa-run-2026/"}],verify:"verified",base:170});
  add({slug:"rolex-festival-2026",ticketsNote:"Tickets on the MTN MoMo app or by dialling *165*20#.",title:"Rolex Festival 2026",cat:"food",tags:["food","festival","family"],
    start:"2026-11-29T10:00",end:"2026-11-29T20:00",venue:"Cricket Oval Lugogo",city:"Kampala",price:{from:20000},organizer:"Not stated on listing",
    desc:"A day celebrating the Ugandan rolex, the chapati and egg roll, at the Cricket Oval, Lugogo.",
    sources:[{name:EV,url:"https://evento.ug/event/43144116/rolex-festival-2026/"},{name:AE,url:"https://www.allevents.ug/events/rolex-festival"}],verify:"verified",featured:true,base:720});
  add({slug:"old-school-rnb-brunch-mezo-noir",tickets:{"url": "https://www.osrnbrunch.com/", "site": "osrnbrunch.com"},title:"More Than A Brunch: Old School R&B",cat:"food",tags:["brunch","rnb"],
    start:"2026-11-29T12:00",timeTBC:true,venue:"Mezo Noir, Kololo",city:"Kampala",price:{from:65000},organizer:"Not stated on listing",
    desc:"A UK-based old school R&B brunch at Mezo Noir, Somero Road. evento.ug lists 6 PM, which may be the default time. Confirm with the venue.",
    sources:[{name:EV,url:"https://evento.ug/event/52698608/more-than-brunch-kampala/"},{name:AE,url:"https://www.allevents.ug/events/uk-based-old-school-rb-brunch"}],verify:"verified",base:260});
  add({slug:"30-years-le-chateau-brunch",title:"30 Years of Le Château Brunch",cat:"food",tags:["brunch"],
    start:"2026-11-29T12:00",venue:"Le Château Brasserie Belge",city:"Kampala",price:{from:400000},organizer:"Le Château",
    desc:"Le Château marks 30 years with an anniversary brunch.",sources:[{name:EV,url:"https://evento.ug/event/94348434/30-years-of-la-chateau-brunch/"}],verify:"verified",base:90});
  add({slug:"wine-tasting-journey-through-the-vines-4",title:"Wine Tasting: A Journey Through The Vines",cat:"food",tags:["wine","tasting"],
    start:"2026-11-27T18:00",venue:"Best Western Plus The Athena Hotel",city:"Kampala",price:{from:180000},organizer:"Not stated on listing",
    desc:"The fourth edition of A Journey Through The Vines wine tasting.",sources:[{name:EV,url:"https://evento.ug/event/30313224/wine-tasting-journey-through-vines-4th-edition/"}],verify:"verified",base:110});
  add({slug:"woodshed-thanksgiving-dinner",title:"The Woodshed Thanksgiving Dinner",cat:"food",tags:["dinner","thanksgiving"],
    start:"2026-11-26T18:30",venue:"Kampala Marriott Hotel",city:"Kampala",price:{from:150000},organizer:"Kampala Marriott Hotel",
    desc:"Thanksgiving dinner at The Woodshed, Kampala Marriott.",sources:[{name:EV,url:"https://evento.ug/event/74114153/woodshed-thanksgiving-dinner/"}],verify:"verified",base:100});
  add({slug:"mezo-big-brunch-tropical",title:"Mezo Big Brunch: Tropical Theme",cat:"food",tags:["brunch","christmas"],
    start:"2026-12-13T12:00",timeTBC:true,venue:"Mezo Noir, Kololo",city:"Kampala",price:{free:true,note:"Listed as free entry."},organizer:"Mezo Noir",
    desc:"A tropical-themed big brunch at Mezo Noir.",sources:[{name:EV,url:"https://evento.ug/event/74094235/mezo-big-brunch-tropical-theme/"}],verify:"verified",base:200});
  add({slug:"christmas-eve-dinner-sheraton",title:"Christmas Eve Dinner at Sheraton",cat:"food",tags:["christmas","dinner"],
    start:"2026-12-24T19:00",venue:"Sheraton Kampala Hotel",city:"Kampala",price:{from:175000},organizer:"Sheraton Kampala",
    desc:"Christmas Eve dinner at Sheraton Kampala.",sources:[{name:EV,url:"https://evento.ug/event/70593150/christmas-eve-dinner/"}],verify:"verified",base:90});
  add({slug:"grand-christmas-lunch-kabira",title:"Grand Christmas Day Lunch Buffet",cat:"family",tags:["christmas","lunch","family"],
    start:"2026-12-25T12:00",venue:"Kabira Country Club",city:"Kampala",price:{from:145000},organizer:"Kabira Country Club",
    desc:"A Christmas Day lunch buffet at Kabira Country Club.",sources:[{name:EV,url:"https://evento.ug/event/64419781/grand-christmas-day-lunch-buffet/"}],verify:"verified",base:80});
  add({slug:"new-years-eve-gala-mestil",title:"New Year's Eve Gala & Countdown",cat:"nightlife",tags:["new year","gala","party"],
    start:"2026-12-31T18:00",end:"2027-01-01T02:00",venue:"Mestil Hotel & Residences",city:"Kampala",price:{from:300000},organizer:"Mestil Hotel",
    desc:"Ring in 2027 with a gala dinner and countdown at Mestil Hotel.",sources:[{name:EV,url:"https://evento.ug/event/34434919/new-year-s-eve-gala-countdown/"}],verify:"verified",base:310});
  add({slug:"future-imaginations-festival",title:"Future Imaginations Festival",cat:"festivals",tags:["new year","island","festival"],
    start:"2026-12-31T18:00",end:"2027-01-01T10:00",venue:"Lunkulu Island",city:"Lake Victoria",price:{free:true,note:"Listed as free. Check how to get to the island."},organizer:"Not stated on listing",
    desc:"A New Year's festival on Lunkulu Island in Lake Victoria.",sources:[{name:EV,url:"https://evento.ug/event/77247870/future-imaginations-festival/"}],verify:"verified",base:350});
  add({slug:"annual-tourism-gala-2026",title:"Annual Tourism Gala 2026",cat:"business",tags:["tourism","gala","networking"],
    start:"2026-11-27T09:00",venue:"Mestil Hotel & Residences",city:"Kampala",price:{free:true},organizer:"Not stated on listing",
    desc:"The 2026 tourism industry gala at Mestil Hotel.",sources:[{name:EV,url:"https://evento.ug/event/505970/annual-tourism-gala-2026/"}],verify:"verified",base:110});
  add({slug:"sustainability-awards-east-africa-2026",title:"The Sustainability Awards East Africa",cat:"business",tags:["awards","networking"],
    start:"2026-11-27T18:00",venue:"Kampala Serena Hotel",city:"Kampala",price:{free:true},organizer:"Not stated on listing",
    desc:"Awards celebrating sustainability across East Africa, at Kampala Serena Hotel.",sources:[{name:EV,url:"https://evento.ug/event/89204900/sustainability-awards-east-africa-2026/"}],verify:"verified",base:100});
  add({slug:"diaspora-family-fun-day-2026",title:"Diaspora Family Fun Day 2026",cat:"family",tags:["family","kids","outdoor"],
    start:"2026-12-26T10:00",timeTBC:true,venue:"Al Qassimi Crocodile Farm, Mpigi",city:"Mpigi",price:{note:"Price not stated."},organizer:"Not stated",
    desc:"A family fun day at Al Qassimi Gate One Crocodile Farm, Ssenyondo, Bunjako, Mpigi.",sources:[{name:AI,url:"https://allevents.in/kampala/family-fun-day/200031033798121"}],verify:"partial",base:90});

  /* ---------- Recently completed (kept online with status, for Aftermovie galleries) ---------- */
  add({slug:"nyege-nyege-2026",title:"Nyege Nyege 2026: Wakaliwood Edition",cat:"festivals",tags:["electronic","festival","music","nile"],
    start:"2026-11-19T12:00",end:"2026-11-22T23:59",venue:"Kalagala Falls",city:"Jinja",price:{note:"Ticket sales closed."},organizer:"Nyege Nyege",
    desc:"The 11th edition of Nyege Nyege on the banks of the Nile at Kalagala Falls, with more than 200 artists across seven stages, plus fashion, art, theatre, comedy and film.",
    sources:[{name:"Daily Monitor",url:"https://www.monitor.co.ug/uganda/lifestyle/entertainment/lights-camera-nile-nyege-nyege-2026-sets-stage-for-bigger-cultural-playground-5608702"}],verify:"verified",community:true,base:1500});
  add({slug:"bar-symphony-kingdom-kampala",title:"The Bar Symphony",cat:"concerts",tags:["orchestra","live band","bar night"],artists:["Josh SB","Julius Sese","Essie","Steve Keys"],
    start:"2026-11-15T18:00",timeTBC:true,venue:"Kingdom Kampala",city:"Kampala",price:{note:"Price not stated."},organizer:"The Singleton and WhiteCap Lager",
    desc:"A 12-piece orchestra under Joshua Waiswa reworked contemporary and dancehall songs with classical instruments, with Julius Sese, Essie and Steve Keys.",
    sources:[{name:"Nile Post via allAfrica",url:"https://allafrica.com/stories/202611180614.html"}],verify:"verified",community:true,base:400});
  add({slug:"guinness-matchday-supremacy-lounge",title:"Guinness Matchday: Super Sunday",cat:"sports",tags:["football","watch party","premier league"],
    start:"2026-11-22T17:00",end:"2026-11-22T22:00",timeTBC:true,venue:"Supremacy Lounge, Nakulabye",city:"Kampala",price:{note:"Free to watch. Bottle and bucket offers on the night."},organizer:"Guinness (Uganda Breweries)",
    desc:"Premier League Super Sunday on big screens with in-house MCs, including Liverpool vs Manchester United at 7:30 PM.",
    sources:[{name:"Matooke Republic",url:"https://www.matookerepublic.com/events-2/20261120/guinness-matchday-set-to-bring-premier-league-super-sunday-experience-to-supremacy-lounge-nakulabye-this-weekend/"}],verify:"verified",base:200});

  /* ---------- Demo content (not real events) ---------- */
  add({slug:"demo-kids-saturday-art-club",title:"Kids Saturday Art Club",cat:"family",tags:["kids","art","family"],
    relDays:2,time:"10:00",hours:3,venue:"Evently Demo Hall, Ntinda",city:"Kampala",price:{free:true},organizer:"Evently Demo Organizer",
    desc:"Demo content. A sample family event used to test the weekend planner and family filters. Replace or remove it from the Admin page.",verify:"demo",base:60});
  add({slug:"demo-founders-breakfast",title:"Kampala Founders Breakfast",cat:"business",tags:["startups","networking"],
    relDays:6,time:"07:30",hours:2,venue:"Evently Demo Hall, Ntinda",city:"Kampala",price:{from:35000},organizer:"Evently Demo Organizer",
    desc:"Demo content. A sample networking event used to test business filters and reminders.",verify:"demo",base:70});
  add({slug:"demo-rooftop-silent-disco",title:"Rooftop Silent Disco",cat:"nightlife",tags:["party","silent disco"],
    relDays:9,time:"20:00",hours:5,venue:"Evently Demo Rooftop, Kololo",city:"Kampala",price:{from:40000},organizer:"Evently Demo Organizer",status:"postponed",statusNote:"Postponed by the organizer. A new date will be announced.",
    desc:"Demo content. A sample event that shows how a postponed event is displayed.",verify:"demo",base:90});

  window.EVENTLY_SEED = e;

  window.EVENTLY_DEALS = [
    {id:"d1",slug:"blankets-and-wine-kampala-december-2026",kind:"Early promotion",title:"Early bird passes at UGX 100,000",desc:"Early bird passes are on sale on the official Blankets & Wine site. Chama House access is UGX 250,000.",until:"2026-12-13T12:00",verify:"verified",source:"https://www.allevents.ug/nigerian-afro-fusion-star-bnxn-set-to-headline-the-kamala-edition-of-blankets-wine-kampala-2026",untilNote:"End of early bird not stated. Shown until the event starts."},
    {id:"d2",slug:"4-pitchers-midweek-madness",kind:"Free event",title:"Free entry every Tuesday",desc:"Comedy and music with free entry at Dstrkt 24, Kira Road, from 7 PM.",until:"2027-03-31T23:59",verify:"partial",source:"https://www.matookerepublic.com/entertainment/events/20260530/kampala-gets-a-new-weekly-comedy-and-entertainment-hotspot/",untilNote:"Ongoing weekly series. Evently will review it at the end of March 2027."},
    {id:"d3",slug:"jaguza-hiphop-xenson",kind:"Discounted offer",title:"Entry at 30k",desc:"Listed as \"only 30k\" through Karitickets.",until:"2026-12-12T18:00",verify:"partial",source:"https://allevents.in/kampala/parties"},
    {id:"d4",slug:"guinness-matchday-supremacy-lounge",kind:"Last-minute deal",title:"Guinness bottle and bucket offers",desc:"Offers on Guinness bottles and buckets during the Super Sunday screenings.",until:"2026-11-22T22:00",verify:"verified",source:"https://www.matookerepublic.com/events-2/20261120/guinness-matchday-set-to-bring-premier-league-super-sunday-experience-to-supremacy-lounge-nakulabye-this-weekend/"},
    {id:"d5",slug:"demo-founders-breakfast",kind:"Giveaway",title:"Win a seat at the Founders Breakfast",desc:"Demo content. Shows how a giveaway appears. No real prize.",untilRel:4,verify:"demo"},
    {id:"d6",slug:"demo-kids-saturday-art-club",kind:"Last-minute deal",title:"Bring a friend, both kids free",desc:"Demo content. Shows how a last-minute promotion appears.",untilRel:2,verify:"demo"}
  ];

  window.EVENTLY_CITIES = [
    {id:"kampala-central",name:"Kampala Central",lat:0.3136,lng:32.5811},
    {id:"kololo",name:"Kololo",lat:0.3330,lng:32.5930},
    {id:"bukoto",name:"Bukoto / Ntinda",lat:0.3530,lng:32.6050},
    {id:"bugolobi",name:"Bugolobi / Lugogo",lat:0.3230,lng:32.6100},
    {id:"kabalagala",name:"Kabalagala / Nsambya",lat:0.2980,lng:32.5930},
    {id:"wakiso",name:"Wakiso",lat:0.4044,lng:32.4594},
    {id:"entebbe",name:"Entebbe",lat:0.0512,lng:32.4637},
    {id:"jinja",name:"Jinja",lat:0.4244,lng:33.2042},
    {id:"mbarara",name:"Mbarara",lat:-0.6072,lng:30.6545},
    {id:"gulu",name:"Gulu",lat:2.7724,lng:32.2881},
    {id:"kisoro",name:"Kisoro",lat:-1.2850,lng:29.6850}
  ];
})();

// Real event posters (organizer artwork collected from public listings, 2026-11-26). Admin/organizer uploads override these.
window.EVENTLY_POSTERS = new Set(["30-years-le-chateau-brunch", "4th-floor-intimate-experience", "afro-netion-wave-edition", "afrolatin-fridays-noors", "annual-tourism-gala-2026", "ballers-party-guvnor", "bandali-day-one-street-one-night", "batwa-run-2026", "bien-alusa-continua-album-watch-party", "blankets-and-wine-kampala-december-2026", "blu3-up-close-christmas-together", "boozy-brunch-thrones", "braka-land-east-africa-2026", "champion-bwoy-tour-bweyale", "christmas-eve-dinner-sheraton", "comedy-night-dr-hilary-okello", "diaspora-family-fun-day-2026", "el-nivel-rock-night", "fancy-at-7-nyama-edition", "frencha-nezza-the-journey-concert", "friends-of-mardrat-and-chiko-2026", "future-imaginations-festival", "grand-christmas-lunch-kabira", "great-maro-concert", "hot-buttered-soul-rnb", "jack-daniels-off-the-record-karole-kasita", "karakta-africa-2026-rebirth", "kidwyne-made-in-vegas", "king-saha-live-tales-lounge", "konshens-live-in-kampala-2026", "le-botti-ladies-night", "love-fest-2nd-edition", "mariam-ndagire-live-in-concert-2026", "melanin-soul-rnb-blackroots", "mezo-big-brunch-tropical", "new-years-eve-gala-mestil", "nina-roz-live-in-concert", "old-school-rnb-and-friends", "old-school-rnb-brunch-mezo-noir", "onomo-arts-experience-vol-6", "organised-chaos-november-2026", "pare-pare-rave-2026-uncle-waffles", "rachel-magoola-60-still-shining", "rhythm-and-soul-thursdays-spice-diana", "rolex-festival-2026", "rugby-uganda-cup-finals-2026", "slick-stuart-roja-live-mbarara", "supa-star-hours-thrones", "timeless-xperience-7th-edition", "tugende-mu-kikadde-2026", "unlimited-jose-chameleone-live-2026", "villa-good-vibes-friday", "wine-tasting-journey-through-the-vines-4", "woodshed-thanksgiving-dinner", "world-aids-day-concert-lugogo-2026"]);
