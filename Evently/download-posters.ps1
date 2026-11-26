# Evently poster downloader
# Visits each event listing page, finds its poster image (og:image) and saves it to the folder below.
# It only reads public web pages and writes image files into that one folder. Nothing else is changed.
$ErrorActionPreference = "Continue"
$dest = "F:\evently-posters"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
$events = @(
  @("braka-land-east-africa-2026", @("https://evento.ug/event/79332702/braka-land-ea-2026/", "https://www.allevents.ug/events/joshua-baraka-braka-land-east-africa-2026")),
  @("blankets-and-wine-kampala-december-2026", @("https://www.allevents.ug/nigerian-afro-fusion-star-bnxn-set-to-headline-the-kamala-edition-of-blankets-wine-kampala-2026")),
  @("pare-pare-rave-2026-uncle-waffles", @("https://rave.ug/")),
  @("unlimited-jose-chameleone-live-2026", @("https://evento.ug/event/57917106/unlimited-dr-jose-chameleone-live-concert-2026/")),
  @("konshens-live-in-kampala-2026", @("https://evento.ug/event/81862247/konshens-live-kampala-2026/")),
  @("nina-roz-live-in-concert", @("https://evento.ug/event/7709595/nina-roz-live-concert/")),
  @("mariam-ndagire-live-in-concert-2026", @("https://evento.ug/event/11158460/mariam-ndagire-live-concert-2026/")),
  @("rachel-magoola-60-still-shining", @("https://evento.ug/event/35261360/rachel-magoola-60-still-shining/", "https://allevents.in/kampala/rachelmagoola-60-still-shining/200031004911215")),
  @("tugende-mu-kikadde-2026", @("https://evento.ug/event/29383619/tugende-mu-kikadde-2026/")),
  @("frencha-nezza-the-journey-concert", @("https://evento.ug/event/39297185/frencha-nezza-live-journey-concert/")),
  @("blu3-up-close-christmas-together", @("https://evento.ug/event/21095710/blu3-up-close-personal-christmas-together/")),
  @("slick-stuart-roja-live-mbarara", @("https://evento.ug/event/8230626/slick-stuart-and-roja-live-mbarara/")),
  @("champion-bwoy-tour-bweyale", @("https://allevents.in/kampala/champion-bwoy-tour-live-in-bweyale/200031019743755")),
  @("world-aids-day-concert-lugogo-2026", @("https://allevents.in/kampala/lugogo-world-aids-day-concert-millennium-park/200030996291020")),
  @("king-saha-live-tales-lounge", @("https://evento.ug/event/60497170/king-saha-live-tales-lounge/")),
  @("rhythm-and-soul-thursdays-spice-diana", @("https://evento.ug/event/23703248/rhythm-soul-thursdays/", "https://www.allevents.ug/events/rhythm-soul-thursdays-featuring-spice-diana")),
  @("supa-star-hours-thrones", @("https://www.allevents.ug/events/supa-star-hours")),
  @("el-nivel-rock-night", @("https://evento.ug/event/216043835/el-nivel-rock-night/")),
  @("le-botti-ladies-night", @("https://evento.ug/event/11594661/le-botti-ladies-night/")),
  @("villa-good-vibes-friday", @("https://evento.ug/event/68393336/villa-good-vibes-friday/")),
  @("timeless-xperience-7th-edition", @("https://www.allevents.ug/events/timeless-xperience-7th-edition")),
  @("bien-alusa-continua-album-watch-party", @("https://evento.ug/event/81720483/bien-alusa-continua-album-watch-party/")),
  @("love-fest-2nd-edition", @("https://evento.ug/event/89409971/love-fest-2nd-edition/")),
  @("kidwyne-made-in-vegas", @("https://evento.ug/event/41397251/kidwyne-made-vegas/")),
  @("hot-buttered-soul-rnb", @("https://evento.ug/event/77945680/hot-buttered-soul-rnb/")),
  @("afrolatin-fridays-noors", @("https://allevents.in/kampala/afrolatinfridays/200031069655842")),
  @("madoxx-sematimba-night-with-the-legend", @("https://evento.ug/event/99977620/madoxx-sematimba-night-legend/")),
  @("melanin-soul-rnb-blackroots", @("https://evento.ug/event/84741366/melanin-soul-and-rnb-feat-blackroots-academy-of-soul/")),
  @("great-maro-concert", @("https://evento.ug/event/16261174/great-maro-concert/")),
  @("fancy-at-7-nyama-edition", @("https://allevents.in/kampala/fancy-7-nyama-edition/200031033797518")),
  @("4th-floor-intimate-experience", @("https://evento.ug/event/44238896/4th-floor-intimate-experience/", "https://www.allevents.ug/events/the-4th-floor-intimate-experience")),
  @("boozy-brunch-thrones", @("https://evento.ug/event/44098009/boozy-brunch/")),
  @("bandali-day-one-street-one-night", @("https://evento.ug/event/5336054/bandali-day-one-street-one-city-one-night/")),
  @("afro-netion-wave-edition", @("https://evento.ug/event/15610546/afro-netion-wave-edition/")),
  @("ballers-party-guvnor", @("https://evento.ug/event/99391676/ballers-party/")),
  @("old-school-rnb-and-friends", @("https://evento.ug/event/56083065/old-school-rnb-friends/")),
  @("comedy-night-dr-hilary-okello", @("https://evento.ug/event/46914862/comedy-night-dr-hilary-okello/")),
  @("organised-chaos-november-2026", @("https://evento.ug/event/73198251/organised-chaos-november-2026/")),
  @("jack-daniels-off-the-record-karole-kasita", @("https://evento.ug/event/62253918/jack-daniel-s-record-ft-karole-kasita/")),
  @("friends-of-mardrat-and-chiko-2026", @("https://evento.ug/event/32006704/friends-of-mardrat-chiko-2026/")),
  @("karakta-africa-2026-rebirth", @("https://evento.ug/event/56686671/karakta-africa-2026-rebirth/")),
  @("onomo-arts-experience-vol-6", @("https://evento.ug/event/48989561/onomo-arts-experience-vol-6/")),
  @("rugby-uganda-cup-finals-2026", @("https://evento.ug/event/34798987/rugby-uganda-cup-finals-2026/")),
  @("batwa-run-2026", @("https://evento.ug/event/44410674/batwa-run-2026/")),
  @("rolex-festival-2026", @("https://evento.ug/event/43144116/rolex-festival-2026/", "https://www.allevents.ug/events/rolex-festival")),
  @("old-school-rnb-brunch-mezo-noir", @("https://evento.ug/event/52698608/more-than-brunch-kampala/", "https://www.allevents.ug/events/uk-based-old-school-rb-brunch")),
  @("30-years-le-chateau-brunch", @("https://evento.ug/event/94348434/30-years-of-la-chateau-brunch/")),
  @("wine-tasting-journey-through-the-vines-4", @("https://evento.ug/event/30313224/wine-tasting-journey-through-vines-4th-edition/")),
  @("woodshed-thanksgiving-dinner", @("https://evento.ug/event/74114153/woodshed-thanksgiving-dinner/")),
  @("mezo-big-brunch-tropical", @("https://evento.ug/event/74094235/mezo-big-brunch-tropical-theme/")),
  @("christmas-eve-dinner-sheraton", @("https://evento.ug/event/70593150/christmas-eve-dinner/")),
  @("grand-christmas-lunch-kabira", @("https://evento.ug/event/64419781/grand-christmas-day-lunch-buffet/")),
  @("new-years-eve-gala-mestil", @("https://evento.ug/event/34434919/new-year-s-eve-gala-countdown/")),
  @("future-imaginations-festival", @("https://evento.ug/event/77247870/future-imaginations-festival/")),
  @("annual-tourism-gala-2026", @("https://evento.ug/event/505970/annual-tourism-gala-2026/")),
  @("sustainability-awards-east-africa-2026", @("https://evento.ug/event/89204900/sustainability-awards-east-africa-2026/")),
  @("diaspora-family-fun-day-2026", @("https://allevents.in/kampala/family-fun-day/200031033798121"))
)
$ok = 0; $fail = @()
foreach ($e in $events) {
  $slug = $e[0]; $done = $false
  foreach ($page in $e[1]) {
    if ($done) { break }
    try {
      $html = (Invoke-WebRequest -Uri $page -UserAgent $ua -UseBasicParsing -TimeoutSec 30).Content
      $m = [regex]::Match($html, '<meta[^>]+property=["'']og:image["''][^>]+content=["'']([^"'']+)')
      if (-not $m.Success) { $m = [regex]::Match($html, '<meta[^>]+content=["'']([^"'']+)["''][^>]+property=["'']og:image') }
      if ($m.Success) {
        $img = [System.Net.WebUtility]::HtmlDecode($m.Groups[1].Value)
        $ext = [IO.Path]::GetExtension(([Uri]$img).AbsolutePath); if (-not $ext -or $ext.Length -gt 5) { $ext = ".jpg" }
        Invoke-WebRequest -Uri $img -UserAgent $ua -UseBasicParsing -TimeoutSec 60 -OutFile (Join-Path $dest ($slug + $ext))
        Write-Host "Saved  $slug" -ForegroundColor Green; $ok++; $done = $true
      }
    } catch { }
  }
  if (-not $done) { Write-Host "No poster found  $slug" -ForegroundColor Yellow; $fail += $slug }
  Start-Sleep -Milliseconds 400
}
Write-Host ""
Write-Host "Done. $ok posters saved to $dest. $($fail.Count) events had no poster." -ForegroundColor Cyan
Read-Host "Press Enter to close"
