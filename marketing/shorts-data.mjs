// marketing/shorts-data.mjs
//
// Scenariusze shortów PS5 Vault: 12 filmów × 7 języków. Każdy film to:
//   frames(S, F, T) → lista klatek, gdzie S = teksty filmu w danym języku,
//   F = liczby z apki (marketing/shots/{lang}/facts.json), T = COMMON[lang].
//   text[lang] = napisy + tytuł, opis i hashtagi na YouTube (yt).
// **słowo** = wyróżnienie neonem. Bez długich myślników (zasada apki).
//
// Wycinki ekranów: [x, y, szerokość, wysokość] w pikselach zrzutu 824×1830.

export const COMMON = {
  pl: { cta: 'Pobierz z Google Play', free: 'Za darmo · bez konta · bez reklam', link: 'Link w profilu kanału' },
  en: { cta: 'Get it on Google Play', free: 'Free · no account · no ads', link: 'Link in the channel profile' },
  es: { cta: 'Disponible en Google Play', free: 'Gratis · sin cuenta · sin anuncios', link: 'Enlace en el perfil del canal' },
  de: { cta: 'Jetzt bei Google Play', free: 'Kostenlos · ohne Konto · ohne Werbung', link: 'Link im Kanalprofil' },
  fr: { cta: 'Disponible sur Google Play', free: 'Gratuit · sans compte · sans pub', link: 'Lien dans le profil de la chaîne' },
  it: { cta: 'Disponibile su Google Play', free: 'Gratis · senza account · senza pubblicità', link: 'Link nel profilo del canale' },
  pt: { cta: 'Disponível no Google Play', free: 'Grátis · sem conta · sem anúncios', link: 'Link no perfil do canal' },
}

const C = {
  finCards: [0, 578, 824, 760],
  finChart: [0, 1290, 824, 540],
  insights: [0, 440, 824, 1000],
  insightsLow: [0, 1000, 824, 830],
  homeNow: [0, 330, 824, 1300],
  homeRelease: [0, 1240, 824, 430],
  releases: [0, 330, 824, 540],
  collection: [0, 330, 824, 1000],
  wishlist: [0, 400, 824, 840],
  stats: [0, 680, 824, 880],
  wrapped: [0, 230, 824, 1000],
  achievements: [0, 120, 824, 1000],
  random: [60, 470, 704, 880],
  add: [0, 600, 824, 1000],
  import: [0, 630, 824, 620],
  pro: [0, 120, 824, 940],
}

const PLAY = 'https://play.google.com/store/apps/details?id=com.skudev.ps5vault'
const fill = (s, F) => String(s).replace(/\{(\w+)\}/g, (_, k) => F[k] ?? '')

// Mały pomocnik: teksty z {zmiennymi} uzupełniane liczbami z apki.
const V = (S, F) => new Proxy({}, { get: (_, k) => S[k] == null ? '' : fill(S[k], F) })

export const VIDEOS = [
  // ── 1. Kupka wstydu ──────────────────────────────────────────────────────────
  {
    id: '01',
    slug: { pl: '01-kupka-wstydu', en: '01-pile-of-shame', es: '01-pila-de-la-verguenza', de: '01-pile-of-shame', fr: '01-pile-de-la-honte', it: '01-pila-della-vergogna', pt: '01-pilha-da-vergonha' },
    frames: (S0, F) => { const S = V(S0, F); return [
      { type: 'hook', kicker: S.kicker, title: S.title, sub: S.sub, dur: 2.6 },
      { type: 'shot', head: S.h1, shot: 'finance', crop: C.finCards, callout: { n: F.shameValue, l: S.c1, tone: 'red' }, dur: 3.6 },
      { type: 'big', n: String(F.shameCount), l: S.big, sub: S.bigSub, dur: 2.8 },
      { type: 'share', head: S.h2, image: 'shame', dur: 3.4 },
      { type: 'end', headline: S.end, shot: 'finance', crop: [0, 0, 824, 1100], dur: 3.2 },
    ] },
    text: {
      pl: { kicker: 'POV: promocja w PS Store', title: 'Kupiłeś. **Nigdy nie odpaliłeś.**', sub: 'Ile takich gier masz Ty?', h1: 'PS5 Vault liczy, ile kasy **leży na półce**', c1: 'w niezagranych grach', big: '{shameWord} w folii', bigSub: 'Najdłużej czeka: **{shameOldest}**', h2: 'Twoja kupka wstydu na jednym obrazku', end: 'Policz swoją **kupkę wstydu**',
        yt: { title: 'Ile kasy leży u Ciebie na półce? 🎮 Kupka wstydu w liczbach', desc: 'Gry kupione na promocji i nigdy nie odpalone. PS5 Vault liczy, ile ich masz i ile pieniędzy w nich leży, a potem robi z tego obrazek do udostępnienia.', tags: '#kupkawstydu #backlog #ps5 #playstation #gry #gracze #shorts' } },
      en: { kicker: 'POV: PS Store sale', title: 'You bought it. **Never played it.**', sub: 'How many of those do you have?', h1: 'PS5 Vault counts the money **sitting on your shelf**', c1: 'in games never played', big: '{shameWord} still in the wrap', bigSub: 'Waiting the longest: **{shameOldest}**', h2: 'Your pile of shame in one image', end: 'Count your **pile of shame**',
        yt: { title: 'How much money is sitting on your shelf? 🎮 Pile of shame', desc: 'Games bought on sale and never played. PS5 Vault counts how many you have and how much money is stuck in them, then turns it into an image you can share.', tags: '#pileofshame #backlog #ps5 #playstation #gaming #gamer #shorts' } },
      es: { kicker: 'POV: ofertas en PS Store', title: 'Lo compraste. **Nunca lo jugaste.**', sub: '¿Cuántos así tienes tú?', h1: 'PS5 Vault cuenta el dinero **parado en tu estantería**', c1: 'en juegos sin jugar', big: '{shameWord} sin estrenar', bigSub: 'El que más espera: **{shameOldest}**', h2: 'Tu pila de la vergüenza en una imagen', end: 'Cuenta tu **pila de la vergüenza**',
        yt: { title: '¿Cuánto dinero tienes parado en la estantería? 🎮 Pila de la vergüenza', desc: 'Juegos comprados en oferta y nunca jugados. PS5 Vault cuenta cuántos tienes y cuánto dinero hay en ellos, y lo convierte en una imagen para compartir.', tags: '#backlog #piladelaverguenza #ps5 #playstation #videojuegos #gamer #shorts' } },
      de: { kicker: 'POV: Sale im PS Store', title: 'Gekauft. **Nie gestartet.**', sub: 'Wie viele davon hast du?', h1: 'PS5 Vault zählt das Geld, das **im Regal liegt**', c1: 'in nie gespielten Spielen', big: '{shameWord} noch eingeschweißt', bigSub: 'Wartet am längsten: **{shameOldest}**', h2: 'Dein Pile of Shame auf einem Bild', end: 'Zähl deinen **Pile of Shame**',
        yt: { title: 'Wie viel Geld liegt bei dir im Regal? 🎮 Pile of Shame', desc: 'Im Sale gekauft und nie gestartet. PS5 Vault zählt, wie viele Spiele das sind und wie viel Geld darin steckt, und macht daraus ein Bild zum Teilen.', tags: '#pileofshame #backlog #ps5 #playstation #gaming #zocken #shorts' } },
      fr: { kicker: 'POV : soldes sur le PS Store', title: 'Acheté. **Jamais lancé.**', sub: 'Tu en as combien comme ça ?', h1: 'PS5 Vault compte l’argent qui **dort sur l’étagère**', c1: 'en jeux jamais lancés', big: '{shameWord} sous blister', bigSub: 'Celui qui attend le plus : **{shameOldest}**', h2: 'Ta pile de la honte en une image', end: 'Compte ta **pile de la honte**',
        yt: { title: 'Combien d’argent dort sur ton étagère ? 🎮 Pile de la honte', desc: 'Des jeux achetés en solde et jamais lancés. PS5 Vault compte combien tu en as et combien d’argent dort dedans, puis en fait une image à partager.', tags: '#backlog #piledelahonte #ps5 #playstation #jeuxvideo #gamer #shorts' } },
      it: { kicker: 'POV: saldi sul PS Store', title: 'Comprato. **Mai avviato.**', sub: 'Quanti ne hai così?', h1: 'PS5 Vault conta i soldi **fermi sullo scaffale**', c1: 'in giochi mai avviati', big: '{shameWord} ancora incellofanati', bigSub: 'Aspetta da più tempo: **{shameOldest}**', h2: 'La tua pila della vergogna in un’immagine', end: 'Conta la tua **pila della vergogna**',
        yt: { title: 'Quanti soldi hai fermi sullo scaffale? 🎮 Pila della vergogna', desc: 'Giochi comprati in saldo e mai avviati. PS5 Vault conta quanti ne hai e quanti soldi ci sono dentro, poi ne fa un’immagine da condividere.', tags: '#backlog #piladellavergogna #ps5 #playstation #videogiochi #gamer #shorts' } },
      pt: { kicker: 'POV: promoção na PS Store', title: 'Comprou. **Nunca jogou.**', sub: 'Quantos assim você tem?', h1: 'O PS5 Vault conta o dinheiro **parado na estante**', c1: 'em jogos nunca jogados', big: '{shameWord} ainda lacrados', bigSub: 'Esperando há mais tempo: **{shameOldest}**', h2: 'Sua pilha da vergonha numa imagem', end: 'Conte sua **pilha da vergonha**',
        yt: { title: 'Quanto dinheiro está parado na sua estante? 🎮 Pilha da vergonha', desc: 'Jogos comprados na promoção e nunca jogados. O PS5 Vault conta quantos você tem e quanto dinheiro está neles, e transforma isso numa imagem para compartilhar.', tags: '#backlog #pilhadavergonha #ps5 #playstation #games #gamer #shorts' } },
    },
  },

  // ── 2. Ile wydałeś ───────────────────────────────────────────────────────────
  {
    id: '02',
    slug: { pl: '02-ile-wydales-na-gry', en: '02-how-much-you-spent', es: '02-cuanto-gastaste', de: '02-wie-viel-ausgegeben', fr: '02-combien-tu-as-depense', it: '02-quanto-hai-speso', pt: '02-quanto-voce-gastou' },
    frames: (S0, F) => { const S = V(S0, F); return [
      { type: 'hook', kicker: S.kicker, title: S.title, sub: S.sub, dur: 2.6 },
      { type: 'shot', head: S.h1, shot: 'finance', crop: C.finCards, dur: 3.4 },
      { type: 'shot', head: S.h2, shot: 'finance', crop: C.finChart, dur: 3.2 },
      { type: 'shot', head: S.h3, shot: 'insights', crop: C.insights, dur: 3.4 },
      { type: 'end', headline: S.end, shot: 'finance', crop: [0, 0, 824, 1100], dur: 3.2 },
    ] },
    text: {
      pl: { kicker: 'Bądź szczery', title: 'Ile **naprawdę** wydałeś na gry?', sub: 'Gry, DLC, mikrotransakcje. Wszystko.', h1: 'Gry, DLC i to, co **odzyskałeś** ze sprzedaży', h2: 'Miesiąc po miesiącu. Widać, **kiedy poleciało**', h3: 'A potem: **gdzie przepłacasz** i co sprzedać', end: 'Sprawdź, ile **naprawdę** wydajesz',
        yt: { title: 'Ile naprawdę wydałeś na gry? 💸 Gry, DLC i mikrotransakcje', desc: 'Wpisujesz ceny gier, DLC i to, co odzyskałeś ze sprzedaży, a PS5 Vault pokazuje wydatki miesiąc po miesiącu i podpowiada, gdzie przepłacasz.', tags: '#gry #ps5 #playstation #wydatki #dlc #gracze #shorts' } },
      en: { kicker: 'Be honest', title: 'How much have you **really** spent on games?', sub: 'Games, DLC, microtransactions. All of it.', h1: 'Games, DLC and what you **got back** from selling', h2: 'Month by month. You see **when it got out of hand**', h3: 'Then: **where you overpay** and what to sell', end: 'See what you **really** spend',
        yt: { title: 'How much have you REALLY spent on games? 💸 Games, DLC, microtransactions', desc: 'Log what you paid for games and DLC and what you got back from selling. PS5 Vault shows your spending month by month and where you overpay.', tags: '#gaming #ps5 #playstation #dlc #microtransactions #gamer #shorts' } },
      es: { kicker: 'Sé sincero', title: '¿Cuánto has gastado **de verdad** en juegos?', sub: 'Juegos, DLC, microtransacciones. Todo.', h1: 'Juegos, DLC y lo que **recuperaste** al vender', h2: 'Mes a mes. Se ve **cuándo se te fue la mano**', h3: 'Y luego: **dónde pagas de más** y qué vender', end: 'Mira cuánto gastas **de verdad**',
        yt: { title: '¿Cuánto has gastado DE VERDAD en juegos? 💸 Juegos, DLC y microtransacciones', desc: 'Apunta lo que pagaste por juegos y DLC y lo que recuperaste al venderlos. PS5 Vault te muestra el gasto mes a mes y dónde pagas de más.', tags: '#videojuegos #ps5 #playstation #dlc #gamer #gaming #shorts' } },
      de: { kicker: 'Sei ehrlich', title: 'Wie viel hast du **wirklich** für Spiele ausgegeben?', sub: 'Spiele, DLCs, Mikrotransaktionen. Alles.', h1: 'Spiele, DLCs und was du durch Verkäufe **zurückbekommen** hast', h2: 'Monat für Monat. Du siehst, **wann es zu viel wurde**', h3: 'Und dann: **wo du zu viel zahlst** und was du verkaufen solltest', end: 'Sieh, was du **wirklich** ausgibst',
        yt: { title: 'Wie viel hast du WIRKLICH für Spiele ausgegeben? 💸 Spiele, DLCs, Mikrotransaktionen', desc: 'Trag ein, was du für Spiele und DLCs bezahlt und durch Verkäufe zurückbekommen hast. PS5 Vault zeigt deine Ausgaben Monat für Monat und wo du zu viel zahlst.', tags: '#gaming #ps5 #playstation #dlc #zocken #gamer #shorts' } },
      fr: { kicker: 'Sois honnête', title: 'Combien as-tu **vraiment** dépensé en jeux ?', sub: 'Jeux, DLC, microtransactions. Tout.', h1: 'Jeux, DLC et ce que tu as **récupéré** en revendant', h2: 'Mois par mois. Tu vois **quand ça a dérapé**', h3: 'Puis : **où tu paies trop** et quoi revendre', end: 'Vois ce que tu dépenses **vraiment**',
        yt: { title: 'Combien as-tu VRAIMENT dépensé en jeux ? 💸 Jeux, DLC, microtransactions', desc: 'Note ce que tu as payé pour tes jeux et DLC et ce que tu as récupéré en revendant. PS5 Vault montre tes dépenses mois par mois et où tu paies trop.', tags: '#jeuxvideo #ps5 #playstation #dlc #gamer #gaming #shorts' } },
      it: { kicker: 'Sii sincero', title: 'Quanto hai speso **davvero** in giochi?', sub: 'Giochi, DLC, microtransazioni. Tutto.', h1: 'Giochi, DLC e quello che hai **recuperato** vendendo', h2: 'Mese per mese. Vedi **quando hai esagerato**', h3: 'Poi: **dove paghi troppo** e cosa vendere', end: 'Scopri quanto spendi **davvero**',
        yt: { title: 'Quanto hai speso DAVVERO in giochi? 💸 Giochi, DLC, microtransazioni', desc: 'Segna quanto hai pagato giochi e DLC e quanto hai recuperato vendendoli. PS5 Vault mostra le spese mese per mese e dove paghi troppo.', tags: '#videogiochi #ps5 #playstation #dlc #gamer #gaming #shorts' } },
      pt: { kicker: 'Seja sincero', title: 'Quanto você **realmente** gastou com jogos?', sub: 'Jogos, DLCs, microtransações. Tudo.', h1: 'Jogos, DLCs e o que você **recuperou** vendendo', h2: 'Mês a mês. Dá pra ver **quando saiu do controle**', h3: 'Depois: **onde você paga caro** e o que vender', end: 'Veja quanto você gasta **de verdade**',
        yt: { title: 'Quanto você REALMENTE gastou com jogos? 💸 Jogos, DLCs e microtransações', desc: 'Anote quanto pagou em jogos e DLCs e quanto recuperou vendendo. O PS5 Vault mostra seus gastos mês a mês e onde você paga caro.', tags: '#games #ps5 #playstation #dlc #gamer #gaming #shorts' } },
    },
  },

  // ── 3. Rok w grach ───────────────────────────────────────────────────────────
  {
    id: '03',
    slug: { pl: '03-rok-w-grach', en: '03-year-in-games', es: '03-ano-en-juegos', de: '03-jahr-in-spielen', fr: '03-annee-en-jeux', it: '03-anno-in-giochi', pt: '03-ano-em-jogos' },
    frames: (S0, F) => { const S = V(S0, F); return [
      { type: 'hook', kicker: S.kicker, title: S.title, sub: S.sub, dur: 2.6 },
      { type: 'big', n: String(F.wrappedHours), l: S.big, sub: S.bigSub, dur: 2.8 },
      { type: 'shot', head: S.h1, shot: 'wrapped', crop: C.wrapped, dur: 3.4 },
      { type: 'share', head: S.h2, image: 'wrappedimg', dur: 3.4 },
      { type: 'end', headline: S.end, shot: 'wrapped', crop: [0, 0, 824, 1100], dur: 3.2 },
    ] },
    text: {
      pl: { kicker: 'Muzyka ma swoje podsumowanie roku', title: 'A Twój **rok w grach**?', sub: 'Godziny, ukończone gry, platyny', big: 'godzin grania w {year}', bigSub: 'Najczęściej grane: **{topTitle}**', h1: 'Najczęściej grane, ukończone, platyny i **ulubiony gatunek**', h2: 'Gotowy obrazek **na story**', end: 'Zobacz swój **rok w grach**',
        yt: { title: 'Twój rok w grach w liczbach 🎁 Podsumowanie roku dla graczy', desc: 'Ile godzin grałeś w tym roku, co ukończyłeś, ile platyn wbiłeś i jaki gatunek wygrał. PS5 Vault robi z tego gotowy obrazek do udostępnienia.', tags: '#podsumowanieroku #gry #ps5 #playstation #platyna #gracze #shorts' } },
      en: { kicker: 'Music apps have a year recap', title: 'What about your **year in games**?', sub: 'Hours, games finished, platinums', big: 'hours played in {year}', bigSub: 'Most played: **{topTitle}**', h1: 'Most played, finished, platinums and **favorite genre**', h2: 'A ready image **for your story**', end: 'See your **year in games**',
        yt: { title: 'Your year in games, in numbers 🎁 A year recap for gamers', desc: 'How many hours you played this year, what you finished, how many platinums you earned and which genre won. PS5 Vault turns it into an image ready to share.', tags: '#yearinreview #gaming #ps5 #playstation #platinum #gamer #shorts' } },
      es: { kicker: 'La música tiene su resumen del año', title: '¿Y tu **año en juegos**?', sub: 'Horas, juegos terminados, platinos', big: 'horas jugadas en {year}', bigSub: 'El más jugado: **{topTitle}**', h1: 'Más jugados, terminados, platinos y **género favorito**', h2: 'Una imagen lista **para tu historia**', end: 'Mira tu **año en juegos**',
        yt: { title: 'Tu año en juegos en números 🎁 El resumen del año para gamers', desc: 'Cuántas horas jugaste este año, qué terminaste, cuántos platinos sacaste y qué género ganó. PS5 Vault lo convierte en una imagen lista para compartir.', tags: '#resumendelaño #videojuegos #ps5 #playstation #platino #gamer #shorts' } },
      de: { kicker: 'Musik hat ihren Jahresrückblick', title: 'Und dein **Jahr in Spielen**?', sub: 'Stunden, beendete Spiele, Platin', big: 'Stunden gespielt in {year}', bigSub: 'Am meisten gespielt: **{topTitle}**', h1: 'Meistgespielt, beendet, Platin und **Lieblingsgenre**', h2: 'Ein fertiges Bild **für deine Story**', end: 'Sieh dein **Jahr in Spielen**',
        yt: { title: 'Dein Jahr in Spielen in Zahlen 🎁 Der Jahresrückblick für Gamer', desc: 'Wie viele Stunden du dieses Jahr gespielt hast, was du beendet hast, wie viele Platin-Trophäen du geholt hast und welches Genre gewonnen hat. PS5 Vault macht daraus ein Bild zum Teilen.', tags: '#jahresrückblick #gaming #ps5 #playstation #platin #zocken #shorts' } },
      fr: { kicker: 'La musique a son bilan de l’année', title: 'Et ton **année en jeux** ?', sub: 'Heures, jeux terminés, platines', big: 'heures de jeu en {year}', bigSub: 'Le plus joué : **{topTitle}**', h1: 'Les plus joués, terminés, platines et **genre préféré**', h2: 'Une image prête **pour ta story**', end: 'Découvre ton **année en jeux**',
        yt: { title: 'Ton année en jeux en chiffres 🎁 Le bilan de l’année pour les joueurs', desc: 'Combien d’heures tu as joué cette année, ce que tu as terminé, combien de platines tu as eues et quel genre a gagné. PS5 Vault en fait une image prête à partager.', tags: '#bilan #jeuxvideo #ps5 #playstation #platine #gamer #shorts' } },
      it: { kicker: 'La musica ha il suo riepilogo dell’anno', title: 'E il tuo **anno in giochi**?', sub: 'Ore, giochi finiti, platini', big: 'ore di gioco nel {year}', bigSub: 'Il più giocato: **{topTitle}**', h1: 'Più giocati, finiti, platini e **genere preferito**', h2: 'Un’immagine pronta **per la tua storia**', end: 'Scopri il tuo **anno in giochi**',
        yt: { title: 'Il tuo anno in giochi in numeri 🎁 Il riepilogo dell’anno per gamer', desc: 'Quante ore hai giocato quest’anno, cosa hai finito, quanti platini hai preso e quale genere ha vinto. PS5 Vault lo trasforma in un’immagine pronta da condividere.', tags: '#riepilogo #videogiochi #ps5 #playstation #platino #gamer #shorts' } },
      pt: { kicker: 'A música tem sua retrospectiva', title: 'E o seu **ano em jogos**?', sub: 'Horas, jogos zerados, platinas', big: 'horas jogadas em {year}', bigSub: 'Mais jogado: **{topTitle}**', h1: 'Mais jogados, zerados, platinas e **gênero favorito**', h2: 'Uma imagem pronta **pro seu story**', end: 'Veja seu **ano em jogos**',
        yt: { title: 'Seu ano em jogos em números 🎁 A retrospectiva para gamers', desc: 'Quantas horas você jogou este ano, o que zerou, quantas platinas pegou e qual gênero venceu. O PS5 Vault transforma tudo numa imagem pronta para compartilhar.', tags: '#retrospectiva #games #ps5 #playstation #platina #gamer #shorts' } },
    },
  },

  // ── 4. Import biblioteki ─────────────────────────────────────────────────────
  {
    id: '04',
    slug: { pl: '04-import-biblioteki', en: '04-import-your-library', es: '04-importa-tu-biblioteca', de: '04-bibliothek-importieren', fr: '04-importe-ta-bibliotheque', it: '04-importa-la-libreria', pt: '04-importe-sua-biblioteca' },
    frames: (S0, F) => { const S = V(S0, F); return [
      { type: 'hook', kicker: S.kicker, title: S.title, sub: S.sub, dur: 2.6 },
      { type: 'list', heading: S.lh, items: [['🎮', 'PSN'], ['⚙️', 'Steam'], ['🟢', 'Xbox'], ['🎯', S.l4]], durs: [1.0, 1.0, 1.0, 2.0] },
      { type: 'shot', head: S.h1, shot: 'import', crop: C.import, dur: 3.2 },
      { type: 'shot', head: S.h2, shot: 'collection', crop: C.collection, dur: 3.2 },
      { type: 'end', headline: S.end, shot: 'collection', crop: [0, 0, 824, 1100], dur: 3.2 },
    ] },
    text: {
      pl: { kicker: 'Masz 300 gier?', title: 'Nie wpisuj ich **ręcznie**', sub: 'Cała biblioteka w minutę', lh: 'Import z:', l4: 'Playnite (wszystkie platformy)', h1: 'Wklejasz listę, **apka robi resztę**', h2: 'Cała kolekcja w jednym miejscu, **z filtrami**', end: 'Zaimportuj **swoją bibliotekę**',
        yt: { title: 'Cała biblioteka gier w minutę 📥 Import ze Steam, PSN, Xboxa i Playnite', desc: 'Nie musisz wpisywać setek gier ręcznie. PS5 Vault importuje bibliotekę ze Steam, PSN, Xboxa i Playnite (za darmo do 50 gier, bez limitu w Pro).', tags: '#steam #psn #xbox #playnite #ps5 #gry #shorts' } },
      en: { kicker: 'Got 300 games?', title: 'Don’t type them **by hand**', sub: 'Your whole library in a minute', lh: 'Import from:', l4: 'Playnite (every platform)', h1: 'Paste the list, **the app does the rest**', h2: 'Your whole collection in one place, **with filters**', end: 'Import **your library**',
        yt: { title: 'Your whole game library in a minute 📥 Import from Steam, PSN, Xbox and Playnite', desc: 'No need to type hundreds of games by hand. PS5 Vault imports your library from Steam, PSN, Xbox and Playnite (free up to 50 games, unlimited with Pro).', tags: '#steam #psn #xbox #playnite #ps5 #gaming #shorts' } },
      es: { kicker: '¿Tienes 300 juegos?', title: 'No los escribas **a mano**', sub: 'Toda tu biblioteca en un minuto', lh: 'Importa desde:', l4: 'Playnite (todas las plataformas)', h1: 'Pegas la lista y **la app hace el resto**', h2: 'Toda tu colección en un lugar, **con filtros**', end: 'Importa **tu biblioteca**',
        yt: { title: 'Toda tu biblioteca de juegos en un minuto 📥 Importa de Steam, PSN, Xbox y Playnite', desc: 'No hace falta escribir cientos de juegos a mano. PS5 Vault importa tu biblioteca de Steam, PSN, Xbox y Playnite (gratis hasta 50 juegos, sin límite con Pro).', tags: '#steam #psn #xbox #playnite #ps5 #videojuegos #shorts' } },
      de: { kicker: '300 Spiele?', title: 'Tipp sie nicht **von Hand** ein', sub: 'Deine ganze Bibliothek in einer Minute', lh: 'Import aus:', l4: 'Playnite (alle Plattformen)', h1: 'Liste einfügen, **die App macht den Rest**', h2: 'Deine ganze Sammlung an einem Ort, **mit Filtern**', end: 'Importiere **deine Bibliothek**',
        yt: { title: 'Deine ganze Spielebibliothek in einer Minute 📥 Import aus Steam, PSN, Xbox und Playnite', desc: 'Du musst nicht Hunderte Spiele von Hand eintippen. PS5 Vault importiert deine Bibliothek aus Steam, PSN, Xbox und Playnite (kostenlos bis 50 Spiele, ohne Limit mit Pro).', tags: '#steam #psn #xbox #playnite #ps5 #gaming #shorts' } },
      fr: { kicker: 'Tu as 300 jeux ?', title: 'Ne les tape pas **à la main**', sub: 'Toute ta bibliothèque en une minute', lh: 'Import depuis :', l4: 'Playnite (toutes les plateformes)', h1: 'Tu colles la liste, **l’app fait le reste**', h2: 'Toute ta collection au même endroit, **avec des filtres**', end: 'Importe **ta bibliothèque**',
        yt: { title: 'Toute ta bibliothèque de jeux en une minute 📥 Import Steam, PSN, Xbox et Playnite', desc: 'Inutile de taper des centaines de jeux à la main. PS5 Vault importe ta bibliothèque depuis Steam, PSN, Xbox et Playnite (gratuit jusqu’à 50 jeux, sans limite avec Pro).', tags: '#steam #psn #xbox #playnite #ps5 #jeuxvideo #shorts' } },
      it: { kicker: 'Hai 300 giochi?', title: 'Non scriverli **a mano**', sub: 'Tutta la libreria in un minuto', lh: 'Importa da:', l4: 'Playnite (tutte le piattaforme)', h1: 'Incolli la lista, **l’app fa il resto**', h2: 'Tutta la collezione in un posto, **con i filtri**', end: 'Importa **la tua libreria**',
        yt: { title: 'Tutta la tua libreria di giochi in un minuto 📥 Import da Steam, PSN, Xbox e Playnite', desc: 'Non serve scrivere centinaia di giochi a mano. PS5 Vault importa la tua libreria da Steam, PSN, Xbox e Playnite (gratis fino a 50 giochi, senza limiti con Pro).', tags: '#steam #psn #xbox #playnite #ps5 #videogiochi #shorts' } },
      pt: { kicker: 'Tem 300 jogos?', title: 'Não digite **um por um**', sub: 'Sua biblioteca inteira em um minuto', lh: 'Importe da:', l4: 'Playnite (todas as plataformas)', h1: 'Cole a lista e **o app faz o resto**', h2: 'Sua coleção inteira num só lugar, **com filtros**', end: 'Importe **sua biblioteca**',
        yt: { title: 'Sua biblioteca de jogos inteira em um minuto 📥 Importe da Steam, PSN, Xbox e Playnite', desc: 'Não precisa digitar centenas de jogos um por um. O PS5 Vault importa sua biblioteca da Steam, PSN, Xbox e Playnite (grátis até 50 jogos, sem limite no Pro).', tags: '#steam #psn #xbox #playnite #ps5 #games #shorts' } },
    },
  },

  // ── 5. Co zagrać? ────────────────────────────────────────────────────────────
  {
    id: '05',
    slug: { pl: '05-w-co-zagrac', en: '05-what-to-play', es: '05-a-que-juego', de: '05-was-spielen', fr: '05-a-quoi-jouer', it: '05-a-cosa-gioco', pt: '05-o-que-jogar' },
    frames: (S0, F) => { const S = V(S0, F); return [
      { type: 'hook', kicker: S.kicker, title: S.title, sub: S.sub, dur: 2.8 },
      { type: 'shot', head: S.h1, shot: 'collection', crop: [0, 330, 824, 900], dur: 3.0 },
      { type: 'shot', head: S.h2, shot: 'random', crop: C.random, dur: 3.4 },
      { type: 'big', n: '🎲', l: S.big, sub: S.bigSub, dur: 2.6 },
      { type: 'end', headline: S.end, shot: 'home', dur: 3.2 },
    ] },
    text: {
      pl: { kicker: 'Znasz to?', title: 'Godzina scrollowania. **Zero grania.**', sub: 'Masz 40 gier i nie wiesz, w co zagrać', h1: 'Jeden przycisk: **Co zagrać?**', h2: 'Losuje grę **z Twojej kupki wstydu**', big: 'Nie pasuje? Losuj ponownie', bigSub: 'Albo **Zacznij grać** i gra trafia do „Teraz gram”', end: 'Niech **apka wybierze** za Ciebie',
        yt: { title: 'Nie wiesz, w co zagrać? 🎲 Wylosuj grę z kupki wstydu', desc: 'Godzina przeglądania biblioteki i zero grania? W PS5 Vault jeden przycisk „Co zagrać?” losuje grę z Twojej kupki wstydu.', tags: '#wcozagrac #backlog #ps5 #playstation #gry #gracze #shorts' } },
      en: { kicker: 'Sound familiar?', title: 'An hour of scrolling. **Zero playing.**', sub: '40 games and no idea what to play', h1: 'One button: **What to play?**', h2: 'It picks a game **from your backlog**', big: 'Not feeling it? Roll again', bigSub: 'Or **Start playing** and it moves to "Now playing"', end: 'Let **the app decide** for you',
        yt: { title: 'Can’t decide what to play? 🎲 Let your backlog pick', desc: 'An hour of browsing your library and zero playing? In PS5 Vault one "What to play?" button picks a game from your backlog.', tags: '#whattoplay #backlog #ps5 #playstation #gaming #gamer #shorts' } },
      es: { kicker: '¿Te suena?', title: 'Una hora mirando la biblioteca. **Cero jugando.**', sub: '40 juegos y no sabes a cuál jugar', h1: 'Un botón: **¿A qué juego?**', h2: 'Elige un juego **de tu pila**', big: '¿No te convence? Otra vez', bigSub: 'O **Empieza a jugar** y pasa a "Jugando ahora"', end: 'Deja que **la app elija** por ti',
        yt: { title: '¿No sabes a qué jugar? 🎲 Deja que tu pila elija', desc: '¿Una hora mirando la biblioteca y cero jugando? En PS5 Vault un botón "¿A qué juego?" elige un juego de tu pila de pendientes.', tags: '#backlog #videojuegos #ps5 #playstation #gamer #gaming #shorts' } },
      de: { kicker: 'Kennst du das?', title: 'Eine Stunde scrollen. **Null zocken.**', sub: '40 Spiele und keine Ahnung, was du spielen sollst', h1: 'Ein Knopf: **Was spielen?**', h2: 'Lost ein Spiel **aus deinem Stapel** aus', big: 'Passt nicht? Nochmal losen', bigSub: 'Oder **Losspielen** und es landet bei „Spiele gerade“', end: 'Lass **die App entscheiden**',
        yt: { title: 'Keine Ahnung, was du spielen sollst? 🎲 Lass deinen Pile of Shame entscheiden', desc: 'Eine Stunde durch die Bibliothek scrollen und null zocken? In PS5 Vault lost ein Knopf „Was spielen?“ ein Spiel aus deinem Stapel aus.', tags: '#backlog #pileofshame #ps5 #playstation #gaming #zocken #shorts' } },
      fr: { kicker: 'Ça te parle ?', title: 'Une heure à scroller. **Zéro partie.**', sub: '40 jeux et aucune idée de quoi lancer', h1: 'Un bouton : **À quoi jouer ?**', h2: 'Il tire un jeu **de ta pile**', big: 'Pas convaincu ? Relance', bigSub: 'Ou **Commencer** et il passe dans « En cours »', end: 'Laisse **l’app choisir**',
        yt: { title: 'Tu ne sais pas à quoi jouer ? 🎲 Laisse ta pile choisir', desc: 'Une heure à parcourir ta bibliothèque et zéro partie ? Dans PS5 Vault, un bouton « À quoi jouer ? » tire un jeu de ta pile de la honte.', tags: '#backlog #jeuxvideo #ps5 #playstation #gamer #gaming #shorts' } },
      it: { kicker: 'Ti suona familiare?', title: 'Un’ora a scorrere. **Zero partite.**', sub: '40 giochi e nessuna idea di cosa avviare', h1: 'Un pulsante: **A cosa gioco?**', h2: 'Estrae un gioco **dalla tua pila**', big: 'Non ti convince? Riprova', bigSub: 'Oppure **Inizia a giocare** e passa in "Sto giocando"', end: 'Lascia **scegliere l’app**',
        yt: { title: 'Non sai a cosa giocare? 🎲 Lascia scegliere la tua pila', desc: 'Un’ora a scorrere la libreria e zero partite? In PS5 Vault un pulsante "A cosa gioco?" estrae un gioco dalla tua pila della vergogna.', tags: '#backlog #videogiochi #ps5 #playstation #gamer #gaming #shorts' } },
      pt: { kicker: 'Conhece essa?', title: 'Uma hora rolando a biblioteca. **Zero jogando.**', sub: '40 jogos e nenhuma ideia do que jogar', h1: 'Um botão: **O que jogar?**', h2: 'Sorteia um jogo **da sua pilha**', big: 'Não curtiu? Sorteie de novo', bigSub: 'Ou **Começar a jogar** e ele vai para "Jogando agora"', end: 'Deixe **o app escolher**',
        yt: { title: 'Não sabe o que jogar? 🎲 Deixe sua pilha escolher', desc: 'Uma hora olhando a biblioteca e zero jogando? No PS5 Vault um botão "O que jogar?" sorteia um jogo da sua pilha da vergonha.', tags: '#backlog #games #ps5 #playstation #gamer #gaming #shorts' } },
    },
  },

  // ── 6. Lista życzeń ──────────────────────────────────────────────────────────
  {
    id: '06',
    slug: { pl: '06-kupuj-tylko-w-promocji', en: '06-only-buy-on-sale', es: '06-compra-solo-en-oferta', de: '06-nur-im-sale-kaufen', fr: '06-achete-seulement-en-promo', it: '06-compra-solo-in-saldo', pt: '06-so-compre-na-promocao' },
    frames: (S0, F) => { const S = V(S0, F); return [
      { type: 'hook', kicker: S.kicker, title: S.title, sub: S.sub, dur: 2.6 },
      { type: 'list', heading: S.lh, items: [['🎯', S.l1], ['🔎', S.l2], ['✅', S.l3]], durs: [1.4, 1.4, 2.2] },
      { type: 'shot', head: S.h1, shot: 'wishlist', crop: C.wishlist, dur: 3.6 },
      { type: 'end', headline: S.end, shot: 'wishlist', crop: [0, 0, 824, 1100], dur: 3.2 },
    ] },
    text: {
      pl: { kicker: 'Zasada gracza', title: 'Nigdy nie kupuj gry **w pełnej cenie**', sub: '', lh: 'Lista życzeń w PS5 Vault', l1: 'Wpisz, **za ile kupisz**', l2: 'Sprawdź cenę w PS Store', l3: 'Apka powie: **czas kupić**', h1: '**Cena docelowa osiągnięta.** Kupujesz.', end: 'Kupuj gry **tylko w promocji**',
        yt: { title: 'Nigdy nie kupuj gry w pełnej cenie 🎯 Lista życzeń z ceną docelową', desc: 'Wpisz, ile chcesz zapłacić za grę, a gdy trafisz na promocję w PS Store, PS5 Vault powie, że to już ten moment.', tags: '#promocja #psstore #ps5 #playstation #gry #wishlist #shorts' } },
      en: { kicker: 'Gamer rule #1', title: 'Never buy a game **at full price**', sub: '', lh: 'The PS5 Vault wishlist', l1: 'Set **the price you’d pay**', l2: 'Check the price on PS Store', l3: 'The app says: **time to buy**', h1: '**Target price reached.** You buy.', end: 'Only buy games **on sale**',
        yt: { title: 'Never buy a game at full price 🎯 Wishlist with target prices', desc: 'Set what you want to pay for a game, and when you spot a PS Store sale, PS5 Vault tells you it is time to buy.', tags: '#pssale #psstore #ps5 #playstation #gaming #wishlist #shorts' } },
      es: { kicker: 'Regla del gamer', title: 'Nunca compres un juego **a precio completo**', sub: '', lh: 'La lista de deseos de PS5 Vault', l1: 'Pon **cuánto pagarías**', l2: 'Mira el precio en PS Store', l3: 'La app te dice: **cómpralo ya**', h1: '**Precio objetivo alcanzado.** A comprar.', end: 'Compra juegos **solo en oferta**',
        yt: { title: 'Nunca compres un juego a precio completo 🎯 Lista de deseos con precio objetivo', desc: 'Indica cuánto quieres pagar por un juego y, cuando veas una oferta en PS Store, PS5 Vault te avisa de que es el momento.', tags: '#ofertas #psstore #ps5 #playstation #videojuegos #gamer #shorts' } },
      de: { kicker: 'Gamer-Regel', title: 'Kauf nie ein Spiel **zum Vollpreis**', sub: '', lh: 'Die Wunschliste in PS5 Vault', l1: 'Trag ein, **was du zahlen würdest**', l2: 'Prüf den Preis im PS Store', l3: 'Die App sagt: **jetzt kaufen**', h1: '**Zielpreis erreicht.** Zugreifen.', end: 'Kauf Spiele **nur im Sale**',
        yt: { title: 'Kauf nie ein Spiel zum Vollpreis 🎯 Wunschliste mit Zielpreis', desc: 'Trag ein, was du für ein Spiel zahlen willst, und wenn du einen Sale im PS Store siehst, sagt dir PS5 Vault, dass jetzt der Moment ist.', tags: '#sale #psstore #ps5 #playstation #gaming #zocken #shorts' } },
      fr: { kicker: 'Règle du joueur', title: 'N’achète jamais un jeu **au prix fort**', sub: '', lh: 'La liste de souhaits de PS5 Vault', l1: 'Indique **ton prix**', l2: 'Vérifie le prix sur le PS Store', l3: 'L’app te dit : **c’est le moment**', h1: '**Prix cible atteint.** Tu achètes.', end: 'Achète **seulement en promo**',
        yt: { title: 'N’achète jamais un jeu au prix fort 🎯 Liste de souhaits avec prix cible', desc: 'Indique combien tu veux payer un jeu et, quand tu vois une promo sur le PS Store, PS5 Vault te dit que c’est le moment.', tags: '#promo #psstore #ps5 #playstation #jeuxvideo #gamer #shorts' } },
      it: { kicker: 'Regola del gamer', title: 'Mai comprare un gioco **a prezzo pieno**', sub: '', lh: 'La lista desideri di PS5 Vault', l1: 'Scrivi **quanto pagheresti**', l2: 'Controlla il prezzo sul PS Store', l3: 'L’app ti dice: **è il momento**', h1: '**Prezzo obiettivo raggiunto.** Compri.', end: 'Compra giochi **solo in saldo**',
        yt: { title: 'Mai comprare un gioco a prezzo pieno 🎯 Lista desideri con prezzo obiettivo', desc: 'Scrivi quanto vuoi pagare un gioco e, quando trovi un saldo sul PS Store, PS5 Vault ti dice che è il momento.', tags: '#saldi #psstore #ps5 #playstation #videogiochi #gamer #shorts' } },
      pt: { kicker: 'Regra de gamer', title: 'Nunca compre jogo **pelo preço cheio**', sub: '', lh: 'A lista de desejos do PS5 Vault', l1: 'Diga **quanto pagaria**', l2: 'Confira o preço na PS Store', l3: 'O app avisa: **hora de comprar**', h1: '**Preço-alvo atingido.** Pode comprar.', end: 'Compre jogos **só na promoção**',
        yt: { title: 'Nunca compre jogo pelo preço cheio 🎯 Lista de desejos com preço-alvo', desc: 'Diga quanto quer pagar num jogo e, quando aparecer uma promoção na PS Store, o PS5 Vault avisa que chegou a hora.', tags: '#promocao #psstore #ps5 #playstation #games #gamer #shorts' } },
    },
  },

  // ── 7. Premiery ──────────────────────────────────────────────────────────────
  {
    id: '07',
    slug: { pl: '07-odliczanie-do-premiery', en: '07-release-countdown', es: '07-cuenta-atras-lanzamiento', de: '07-release-countdown', fr: '07-compte-a-rebours-sortie', it: '07-conto-alla-rovescia', pt: '07-contagem-regressiva' },
    frames: (S0, F) => { const S = V(S0, F); return [
      { type: 'hook', kicker: S.kicker, title: S.title, sub: S.sub, dur: 2.6 },
      { type: 'shot', head: S.h1, shot: 'home', crop: C.homeRelease, dur: 3.2 },
      { type: 'shot', head: S.h2, shot: 'releases', crop: C.releases, dur: 3.0 },
      { type: 'big', n: '🔔', l: S.big, sub: S.bigSub, dur: 2.8 },
      { type: 'end', headline: S.end, shot: 'home', dur: 3.2 },
    ] },
    text: {
      pl: { kicker: 'Hype train 🚂', title: 'Ile dni do **Twojej premiery**?', sub: 'Odliczanie do gier, na które czekasz', h1: 'Odliczanie **na głównym ekranie**', h2: 'Pre-ordery w osobnej zakładce', big: 'Przypomnienie 3 dni przed', bigSub: 'i drugie **w dniu premiery**', end: 'Nie przegap **żadnej premiery**',
        yt: { title: 'Ile dni do premiery? ⏳ Odliczanie do gier, na które czekasz', desc: 'Dodaj grę z datą premiery, a PS5 Vault pokaże odliczanie na głównym ekranie i przypomni 3 dni przed premierą i w dniu premiery.', tags: '#premiera #preorder #ps5 #playstation #gry #gracze #shorts' } },
      en: { kicker: 'Hype train 🚂', title: 'How many days until **your launch**?', sub: 'A countdown to the games you’re waiting for', h1: 'The countdown **on your home screen**', h2: 'Pre-orders get their own tab', big: 'A reminder 3 days before', bigSub: 'and another **on launch day**', end: 'Never miss **a launch**',
        yt: { title: 'How many days until launch? ⏳ A countdown to the games you’re waiting for', desc: 'Add a game with its release date and PS5 Vault shows a countdown on the home screen and reminds you 3 days before and on launch day.', tags: '#preorder #release #ps5 #playstation #gaming #gamer #shorts' } },
      es: { kicker: 'Hype train 🚂', title: '¿Cuántos días faltan para **tu lanzamiento**?', sub: 'Cuenta atrás para los juegos que esperas', h1: 'La cuenta atrás **en la pantalla principal**', h2: 'Las reservas tienen su propia pestaña', big: 'Aviso 3 días antes', bigSub: 'y otro **el día del lanzamiento**', end: 'No te pierdas **ningún lanzamiento**',
        yt: { title: '¿Cuántos días faltan para el lanzamiento? ⏳ Cuenta atrás para tus juegos', desc: 'Añade un juego con su fecha de lanzamiento y PS5 Vault muestra la cuenta atrás en la pantalla principal y te avisa 3 días antes y el día del lanzamiento.', tags: '#lanzamiento #reserva #ps5 #playstation #videojuegos #gamer #shorts' } },
      de: { kicker: 'Hype Train 🚂', title: 'Wie viele Tage bis **zu deinem Release**?', sub: 'Ein Countdown für die Spiele, auf die du wartest', h1: 'Der Countdown **auf dem Startbildschirm**', h2: 'Vorbestellungen im eigenen Tab', big: 'Erinnerung 3 Tage vorher', bigSub: 'und noch eine **am Release-Tag**', end: 'Verpass **keinen Release**',
        yt: { title: 'Wie viele Tage bis zum Release? ⏳ Countdown für deine Spiele', desc: 'Trag ein Spiel mit Erscheinungsdatum ein und PS5 Vault zeigt den Countdown auf dem Startbildschirm und erinnert dich 3 Tage vorher und am Release-Tag.', tags: '#release #vorbestellung #ps5 #playstation #gaming #zocken #shorts' } },
      fr: { kicker: 'Hype train 🚂', title: 'Combien de jours avant **ta sortie** ?', sub: 'Un compte à rebours pour les jeux que tu attends', h1: 'Le compte à rebours **sur l’écran d’accueil**', h2: 'Les précommandes ont leur onglet', big: 'Rappel 3 jours avant', bigSub: 'et un autre **le jour J**', end: 'Ne rate **aucune sortie**',
        yt: { title: 'Combien de jours avant la sortie ? ⏳ Compte à rebours pour tes jeux', desc: 'Ajoute un jeu avec sa date de sortie et PS5 Vault affiche le compte à rebours sur l’écran d’accueil et te prévient 3 jours avant et le jour J.', tags: '#sortie #precommande #ps5 #playstation #jeuxvideo #gamer #shorts' } },
      it: { kicker: 'Hype train 🚂', title: 'Quanti giorni all’**uscita**?', sub: 'Il conto alla rovescia per i giochi che aspetti', h1: 'Il conto alla rovescia **nella schermata principale**', h2: 'I preordini hanno la loro scheda', big: 'Promemoria 3 giorni prima', bigSub: 'e un altro **il giorno dell’uscita**', end: 'Non perdere **nessuna uscita**',
        yt: { title: 'Quanti giorni all’uscita? ⏳ Conto alla rovescia per i tuoi giochi', desc: 'Aggiungi un gioco con la data di uscita e PS5 Vault mostra il conto alla rovescia nella schermata principale e ti avvisa 3 giorni prima e il giorno stesso.', tags: '#uscita #preordine #ps5 #playstation #videogiochi #gamer #shorts' } },
      pt: { kicker: 'Hype train 🚂', title: 'Quantos dias para **o seu lançamento**?', sub: 'Contagem regressiva dos jogos que você espera', h1: 'A contagem **na tela inicial**', h2: 'Pré-vendas ganham aba própria', big: 'Lembrete 3 dias antes', bigSub: 'e outro **no dia do lançamento**', end: 'Não perca **nenhum lançamento**',
        yt: { title: 'Quantos dias para o lançamento? ⏳ Contagem regressiva dos seus jogos', desc: 'Adicione um jogo com a data de lançamento e o PS5 Vault mostra a contagem na tela inicial e avisa 3 dias antes e no dia do lançamento.', tags: '#lancamento #prevenda #ps5 #playstation #games #gamer #shorts' } },
    },
  },

  // ── 8. Gdzie poszedł czas ────────────────────────────────────────────────────
  {
    id: '08',
    slug: { pl: '08-ile-godzin-przegrales', en: '08-how-many-hours', es: '08-cuantas-horas', de: '08-wie-viele-stunden', fr: '08-combien-d-heures', it: '08-quante-ore', pt: '08-quantas-horas' },
    frames: (S0, F) => { const S = V(S0, F); return [
      { type: 'hook', kicker: S.kicker, title: S.title, sub: S.sub, dur: 2.6 },
      { type: 'big', n: `${F.hours}h`, l: S.big, sub: S.bigSub, dur: 2.8 },
      { type: 'shot', head: S.h1, shot: 'stats', crop: C.stats, dur: 3.8 },
      { type: 'end', headline: S.end, shot: 'stats', crop: [0, 0, 824, 1100], dur: 3.2 },
    ] },
    text: {
      pl: { kicker: 'Policz to', title: 'Ile godzin **naprawdę** przegrałeś?', sub: 'Spoiler: więcej, niż myślisz', big: 'w {games} {gamesWord}', bigSub: 'To ponad **{days} dób** non stop', h1: 'Top 10: **gdzie poszedł Twój czas**', end: 'Policz **swoje godziny**',
        yt: { title: 'Ile godzin naprawdę przegrałeś? ⏱ Top 10 gier, które zjadły Twój czas', desc: 'PS5 Vault sumuje godziny z całej kolekcji i pokazuje, które gry zjadły najwięcej czasu, ile procent biblioteki ukończyłeś i ile masz platyn.', tags: '#gry #ps5 #playstation #statystyki #platyna #gracze #shorts' } },
      en: { kicker: 'Do the math', title: 'How many hours have you **really** played?', sub: 'Spoiler: more than you think', big: 'across {games} {gamesWord}', bigSub: 'That’s over **{days} days** non stop', h1: 'Top 10: **where your time went**', end: 'Count **your hours**',
        yt: { title: 'How many hours have you REALLY played? ⏱ The top 10 games that ate your time', desc: 'PS5 Vault adds up hours across your whole collection and shows which games ate the most time, how much of your library you finished and your platinums.', tags: '#gaming #ps5 #playstation #stats #platinum #gamer #shorts' } },
      es: { kicker: 'Haz la cuenta', title: '¿Cuántas horas has jugado **de verdad**?', sub: 'Spoiler: más de las que crees', big: 'en {games} {gamesWord}', bigSub: 'Son más de **{days} días** sin parar', h1: 'Top 10: **adónde se fue tu tiempo**', end: 'Cuenta **tus horas**',
        yt: { title: '¿Cuántas horas has jugado DE VERDAD? ⏱ El top 10 de juegos que se comieron tu tiempo', desc: 'PS5 Vault suma las horas de toda tu colección y te muestra qué juegos se llevaron más tiempo, cuánto de tu biblioteca terminaste y tus platinos.', tags: '#videojuegos #ps5 #playstation #estadisticas #platino #gamer #shorts' } },
      de: { kicker: 'Rechne mal nach', title: 'Wie viele Stunden hast du **wirklich** gezockt?', sub: 'Spoiler: mehr, als du denkst', big: 'in {games} {gamesWord}', bigSub: 'Das sind über **{days} Tage** am Stück', h1: 'Top 10: **wo deine Zeit geblieben ist**', end: 'Zähl **deine Stunden**',
        yt: { title: 'Wie viele Stunden hast du WIRKLICH gezockt? ⏱ Die Top 10 Zeitfresser', desc: 'PS5 Vault zählt die Stunden deiner ganzen Sammlung zusammen und zeigt, welche Spiele am meisten Zeit gefressen haben, wie viel du beendet hast und deine Platin-Trophäen.', tags: '#gaming #ps5 #playstation #statistik #platin #zocken #shorts' } },
      fr: { kicker: 'Fais le calcul', title: 'Combien d’heures as-tu **vraiment** joué ?', sub: 'Spoiler : plus que tu ne crois', big: 'sur {games} {gamesWord}', bigSub: 'Plus de **{days} jours** non-stop', h1: 'Top 10 : **où est passé ton temps**', end: 'Compte **tes heures**',
        yt: { title: 'Combien d’heures as-tu VRAIMENT joué ? ⏱ Le top 10 des jeux qui ont mangé ton temps', desc: 'PS5 Vault additionne les heures de toute ta collection et montre quels jeux ont pris le plus de temps, combien de ta bibliothèque est terminée et tes platines.', tags: '#jeuxvideo #ps5 #playstation #stats #platine #gamer #shorts' } },
      it: { kicker: 'Fai i conti', title: 'Quante ore hai giocato **davvero**?', sub: 'Spoiler: più di quanto pensi', big: 'in {games} {gamesWord}', bigSub: 'Sono più di **{days} giorni** di fila', h1: 'Top 10: **dov’è finito il tuo tempo**', end: 'Conta **le tue ore**',
        yt: { title: 'Quante ore hai giocato DAVVERO? ⏱ La top 10 dei giochi che ti hanno mangiato il tempo', desc: 'PS5 Vault somma le ore di tutta la collezione e mostra quali giochi hanno preso più tempo, quanta libreria hai finito e i tuoi platini.', tags: '#videogiochi #ps5 #playstation #statistiche #platino #gamer #shorts' } },
      pt: { kicker: 'Faça as contas', title: 'Quantas horas você **realmente** jogou?', sub: 'Spoiler: mais do que você imagina', big: 'em {games} {gamesWord}', bigSub: 'São mais de **{days} dias** sem parar', h1: 'Top 10: **pra onde foi seu tempo**', end: 'Conte **suas horas**',
        yt: { title: 'Quantas horas você REALMENTE jogou? ⏱ O top 10 de jogos que comeram seu tempo', desc: 'O PS5 Vault soma as horas da sua coleção inteira e mostra quais jogos levaram mais tempo, quanto da biblioteca você zerou e suas platinas.', tags: '#games #ps5 #playstation #estatisticas #platina #gamer #shorts' } },
    },
  },

  // ── 9. Bez subskrypcji ───────────────────────────────────────────────────────
  {
    id: '09',
    slug: { pl: '09-bez-subskrypcji', en: '09-no-subscription', es: '09-sin-suscripcion', de: '09-kein-abo', fr: '09-sans-abonnement', it: '09-senza-abbonamento', pt: '09-sem-assinatura' },
    frames: (S0, F) => { const S = V(S0, F); return [
      { type: 'hook', kicker: S.kicker, title: S.title, sub: S.sub, dur: 2.8 },
      { type: 'list', heading: S.lh, items: [['🆓', S.l1], ['💳', S.l2], ['🔒', S.l3]], durs: [1.6, 1.6, 2.2] },
      { type: 'shot', head: S.h1, shot: 'pro', crop: C.pro, dur: 3.6 },
      { type: 'end', headline: S.end, shot: 'home', dur: 3.2 },
    ] },
    text: {
      pl: { kicker: 'PS Plus, Game Pass, Netflix...', title: 'Bez subskrypcji. Bez reklam. **Bez konta.**', sub: 'Jeszcze jedna apka z abonamentem? Nie tym razem', lh: 'Jak działa PS5 Vault', l1: 'Kolekcja, statystyki i premiery **za darmo**', l2: 'Pro to **jeden zakup**, na zawsze', l3: 'Kolekcja zostaje **na Twoim telefonie**', h1: 'Pro: **raz płacisz**, masz na zawsze', end: 'Sprawdź **za darmo**',
        yt: { title: 'Apka dla graczy bez subskrypcji i bez reklam 🔒 PS5 Vault', desc: 'Kolekcja gier, statystyki, premiery i podsumowanie roku za darmo. Pro to jeden zakup w Google Play, bez abonamentu. Bez konta, kolekcja zostaje na telefonie.', tags: '#bezreklam #ps5 #playstation #gry #aplikacja #gracze #shorts' } },
      en: { kicker: 'PS Plus, Game Pass, Netflix...', title: 'No subscription. No ads. **No account.**', sub: 'Another app with a monthly fee? Not this time', lh: 'How PS5 Vault works', l1: 'Collection, stats and releases **for free**', l2: 'Pro is **one purchase**, forever', l3: 'Your collection stays **on your phone**', h1: 'Pro: **pay once**, keep it forever', end: 'Try it **for free**',
        yt: { title: 'A gamer app with no subscription and no ads 🔒 PS5 Vault', desc: 'Game collection, stats, releases and your year in games for free. Pro is a single Google Play purchase, no subscription. No account, your collection stays on your phone.', tags: '#noads #ps5 #playstation #gaming #app #gamer #shorts' } },
      es: { kicker: 'PS Plus, Game Pass, Netflix...', title: 'Sin suscripción. Sin anuncios. **Sin cuenta.**', sub: '¿Otra app con cuota mensual? Esta vez no', lh: 'Así funciona PS5 Vault', l1: 'Colección, estadísticas y lanzamientos **gratis**', l2: 'Pro es **una sola compra**, para siempre', l3: 'Tu colección se queda **en tu móvil**', h1: 'Pro: **pagas una vez** y es para siempre', end: 'Pruébala **gratis**',
        yt: { title: 'Una app para gamers sin suscripción ni anuncios 🔒 PS5 Vault', desc: 'Colección de juegos, estadísticas, lanzamientos y tu año en juegos gratis. Pro es una única compra en Google Play, sin suscripción. Sin cuenta, tu colección se queda en tu móvil.', tags: '#sinanuncios #ps5 #playstation #videojuegos #app #gamer #shorts' } },
      de: { kicker: 'PS Plus, Game Pass, Netflix...', title: 'Kein Abo. Keine Werbung. **Kein Konto.**', sub: 'Noch eine App mit Monatsgebühr? Diesmal nicht', lh: 'So funktioniert PS5 Vault', l1: 'Sammlung, Statistiken und Releases **kostenlos**', l2: 'Pro ist **ein einziger Kauf**, für immer', l3: 'Deine Sammlung bleibt **auf deinem Handy**', h1: 'Pro: **einmal zahlen**, für immer behalten', end: 'Teste es **kostenlos**',
        yt: { title: 'Eine Gamer-App ohne Abo und ohne Werbung 🔒 PS5 Vault', desc: 'Spielesammlung, Statistiken, Releases und dein Jahr in Spielen kostenlos. Pro ist ein einmaliger Kauf bei Google Play, kein Abo. Kein Konto, deine Sammlung bleibt auf deinem Handy.', tags: '#ohnewerbung #ps5 #playstation #gaming #app #zocken #shorts' } },
      fr: { kicker: 'PS Plus, Game Pass, Netflix...', title: 'Sans abonnement. Sans pub. **Sans compte.**', sub: 'Encore une app avec un abonnement ? Pas cette fois', lh: 'Comment marche PS5 Vault', l1: 'Collection, stats et sorties **gratuites**', l2: 'Pro, c’est **un seul achat**, pour toujours', l3: 'Ta collection reste **sur ton téléphone**', h1: 'Pro : **tu paies une fois**, c’est à vie', end: 'Essaie-la **gratuitement**',
        yt: { title: 'Une app pour joueurs sans abonnement ni pub 🔒 PS5 Vault', desc: 'Collection de jeux, stats, sorties et ton année en jeux gratuitement. Pro est un achat unique sur Google Play, sans abonnement. Sans compte, ta collection reste sur ton téléphone.', tags: '#sanspub #ps5 #playstation #jeuxvideo #app #gamer #shorts' } },
      it: { kicker: 'PS Plus, Game Pass, Netflix...', title: 'Niente abbonamento. Niente pubblicità. **Niente account.**', sub: 'Un’altra app a canone? Non stavolta', lh: 'Come funziona PS5 Vault', l1: 'Collezione, statistiche e uscite **gratis**', l2: 'Pro è **un solo acquisto**, per sempre', l3: 'La collezione resta **sul tuo telefono**', h1: 'Pro: **paghi una volta** ed è tuo per sempre', end: 'Provala **gratis**',
        yt: { title: 'Un’app per gamer senza abbonamento e senza pubblicità 🔒 PS5 Vault', desc: 'Collezione di giochi, statistiche, uscite e il tuo anno in giochi gratis. Pro è un acquisto unico su Google Play, senza abbonamento. Niente account, la collezione resta sul telefono.', tags: '#senzapubblicita #ps5 #playstation #videogiochi #app #gamer #shorts' } },
      pt: { kicker: 'PS Plus, Game Pass, Netflix...', title: 'Sem assinatura. Sem anúncios. **Sem conta.**', sub: 'Mais um app com mensalidade? Dessa vez não', lh: 'Como funciona o PS5 Vault', l1: 'Coleção, estatísticas e lançamentos **grátis**', l2: 'Pro é **uma compra só**, para sempre', l3: 'Sua coleção fica **no seu celular**', h1: 'Pro: **paga uma vez** e é seu para sempre', end: 'Teste **de graça**',
        yt: { title: 'Um app para gamers sem assinatura e sem anúncios 🔒 PS5 Vault', desc: 'Coleção de jogos, estatísticas, lançamentos e seu ano em jogos de graça. O Pro é uma compra única no Google Play, sem assinatura. Sem conta, sua coleção fica no celular.', tags: '#semanuncios #ps5 #playstation #games #app #gamer #shorts' } },
    },
  },

  // ── 10. Skaner pudełek ───────────────────────────────────────────────────────
  {
    id: '10',
    slug: { pl: '10-zeskanuj-pudelko', en: '10-scan-the-box', es: '10-escanea-la-caja', de: '10-huelle-scannen', fr: '10-scanne-la-boite', it: '10-scansiona-la-confezione', pt: '10-escaneie-a-caixa' },
    frames: (S0, F) => { const S = V(S0, F); return [
      { type: 'hook', kicker: S.kicker, title: S.title, sub: S.sub, dur: 2.6 },
      { type: 'shot', head: S.h1, shot: 'add', crop: C.add, dur: 3.4 },
      { type: 'list', heading: S.lh, items: [['📷', S.l1], ['🖼', S.l2], ['📦', S.l3]], durs: [1.5, 1.5, 2.2] },
      { type: 'end', headline: S.end, shot: 'collection', dur: 3.2 },
    ] },
    text: {
      pl: { kicker: 'Gracz pudełkowy? 📦', title: 'Zeskanuj pudełko. **Gra dodana.**', sub: 'Wystarczy kod kreskowy z tyłu okładki', h1: 'Aparat albo tytuł. Reszta **uzupełnia się sama**', lh: 'Tak to działa', l1: 'Skanujesz **kod EAN**', l2: 'Tytuł, gatunek i rok **same się wpisują**', l3: 'W Pro: **cała półka pod rząd**', end: 'Zeskanuj **swoją półkę**',
        yt: { title: 'Zeskanuj pudełko i gra jest w kolekcji 📷 Skaner kodów kreskowych', desc: 'Masz gry na płytach? Zeskanuj kod kreskowy z tyłu pudełka, a PS5 Vault sam uzupełni tytuł, gatunek i rok. W Pro skanujesz całą półkę pod rząd.', tags: '#kolekcjagier #pudełka #ps5 #playstation #gry #gracze #shorts' } },
      en: { kicker: 'Physical collector? 📦', title: 'Scan the box. **Game added.**', sub: 'Just the barcode on the back', h1: 'Camera or title. The rest **fills in by itself**', lh: 'How it works', l1: 'You scan **the barcode**', l2: 'Title, genre and year **fill in**', l3: 'With Pro: **your whole shelf in a row**', end: 'Scan **your shelf**',
        yt: { title: 'Scan the box and the game is in your collection 📷 Barcode scanner', desc: 'Collect physical games? Scan the barcode on the back of the box and PS5 Vault fills in the title, genre and year. With Pro you scan your whole shelf in a row.', tags: '#physicalgames #gamecollection #ps5 #playstation #gaming #gamer #shorts' } },
      es: { kicker: '¿Coleccionista de físico? 📦', title: 'Escanea la caja. **Juego añadido.**', sub: 'Basta con el código de barras de atrás', h1: 'Cámara o título. El resto **se rellena solo**', lh: 'Así funciona', l1: 'Escaneas **el código de barras**', l2: 'Título, género y año **se rellenan**', l3: 'Con Pro: **toda la estantería seguida**', end: 'Escanea **tu estantería**',
        yt: { title: 'Escanea la caja y el juego ya está en tu colección 📷 Escáner de códigos', desc: '¿Coleccionas juegos en físico? Escanea el código de barras de la caja y PS5 Vault rellena título, género y año. Con Pro escaneas toda la estantería seguida.', tags: '#formatofisico #coleccion #ps5 #playstation #videojuegos #gamer #shorts' } },
      de: { kicker: 'Retail-Sammler? 📦', title: 'Hülle scannen. **Spiel drin.**', sub: 'Der Barcode auf der Rückseite reicht', h1: 'Kamera oder Titel. Der Rest **füllt sich selbst**', lh: 'So geht’s', l1: 'Du scannst **den Barcode**', l2: 'Titel, Genre und Jahr **kommen von selbst**', l3: 'Mit Pro: **das ganze Regal am Stück**', end: 'Scann **dein Regal**',
        yt: { title: 'Hülle scannen und das Spiel ist in der Sammlung 📷 Barcode-Scanner', desc: 'Du sammelst Spiele auf Disc? Scann den Barcode auf der Rückseite und PS5 Vault füllt Titel, Genre und Jahr aus. Mit Pro scannst du das ganze Regal am Stück.', tags: '#retail #spielesammlung #ps5 #playstation #gaming #zocken #shorts' } },
      fr: { kicker: 'Collectionneur physique ? 📦', title: 'Scanne la boîte. **Jeu ajouté.**', sub: 'Le code-barres au dos suffit', h1: 'Caméra ou titre. Le reste **se remplit tout seul**', lh: 'Comment ça marche', l1: 'Tu scannes **le code-barres**', l2: 'Titre, genre et année **se remplissent**', l3: 'Avec Pro : **toute l’étagère à la suite**', end: 'Scanne **ton étagère**',
        yt: { title: 'Scanne la boîte et le jeu est dans ta collection 📷 Scanner de codes-barres', desc: 'Tu collectionnes les jeux en physique ? Scanne le code-barres au dos de la boîte et PS5 Vault remplit le titre, le genre et l’année. Avec Pro, tu scannes toute l’étagère à la suite.', tags: '#physique #collection #ps5 #playstation #jeuxvideo #gamer #shorts' } },
      it: { kicker: 'Collezionista fisico? 📦', title: 'Scansiona la confezione. **Gioco aggiunto.**', sub: 'Basta il codice a barre sul retro', h1: 'Fotocamera o titolo. Il resto **si compila da solo**', lh: 'Come funziona', l1: 'Scansioni **il codice a barre**', l2: 'Titolo, genere e anno **si compilano**', l3: 'Con Pro: **tutto lo scaffale di fila**', end: 'Scansiona **il tuo scaffale**',
        yt: { title: 'Scansiona la confezione e il gioco è nella collezione 📷 Scanner codici a barre', desc: 'Collezioni giochi fisici? Scansiona il codice a barre sul retro e PS5 Vault compila titolo, genere e anno. Con Pro scansioni tutto lo scaffale di fila.', tags: '#fisico #collezione #ps5 #playstation #videogiochi #gamer #shorts' } },
      pt: { kicker: 'Colecionador de mídia física? 📦', title: 'Escaneie a caixa. **Jogo adicionado.**', sub: 'Basta o código de barras atrás', h1: 'Câmera ou título. O resto **se preenche sozinho**', lh: 'Como funciona', l1: 'Você escaneia **o código de barras**', l2: 'Título, gênero e ano **se preenchem**', l3: 'No Pro: **a estante inteira em sequência**', end: 'Escaneie **sua estante**',
        yt: { title: 'Escaneie a caixa e o jogo já está na coleção 📷 Scanner de código de barras', desc: 'Coleciona mídia física? Escaneie o código de barras atrás da caixa e o PS5 Vault preenche título, gênero e ano. No Pro você escaneia a estante inteira em sequência.', tags: '#midiafisica #colecao #ps5 #playstation #games #gamer #shorts' } },
    },
  },

  // ── 11. Osiągnięcia ──────────────────────────────────────────────────────────
  {
    id: '11',
    slug: { pl: '11-osiagniecia', en: '11-achievements', es: '11-logros', de: '11-erfolge', fr: '11-succes', it: '11-obiettivi', pt: '11-conquistas' },
    frames: (S0, F) => { const S = V(S0, F); return [
      { type: 'hook', kicker: S.kicker, title: S.title, sub: S.sub, dur: 2.6 },
      { type: 'shot', head: S.h1, shot: 'achievements', crop: C.achievements, dur: 3.8 },
      { type: 'big', n: '19', l: S.big, sub: S.bigSub, dur: 2.6 },
      { type: 'end', headline: S.end, shot: 'achievements', crop: [0, 0, 824, 1100], dur: 3.2 },
    ] },
    text: {
      pl: { kicker: '🏆 Achievement unlocked', title: 'Twoja kolekcja też ma **trofea**', sub: 'Platyny w grach to nie wszystko', h1: 'Od pierwszej gry po **łowcę trofeów**', big: 'osiągnięć do zdobycia', bigSub: 'Kolekcjoner, finiszer, maratończyk i **seryjny finiszer**', end: 'Odblokuj **wszystkie 19**',
        yt: { title: 'Trofea za ogarnięcie kolekcji gier 🏆 19 osiągnięć w PS5 Vault', desc: 'Kolekcjoner, finiszer, łowca trofeów, maratończyk. PS5 Vault ma 19 osiągnięć, które odblokowujesz, gdy dodajesz i kończysz gry.', tags: '#trofea #platyna #ps5 #playstation #gry #gracze #shorts' } },
      en: { kicker: '🏆 Achievement unlocked', title: 'Your collection has **trophies** too', sub: 'In-game platinums aren’t everything', h1: 'From your first game to **trophy hunter**', big: 'achievements to earn', bigSub: 'Collector, finisher, marathoner and **serial finisher**', end: 'Unlock **all 19**',
        yt: { title: 'Trophies for your game collection 🏆 19 achievements in PS5 Vault', desc: 'Collector, finisher, trophy hunter, marathoner. PS5 Vault has 19 achievements you unlock as you add and finish games.', tags: '#trophies #platinum #ps5 #playstation #gaming #gamer #shorts' } },
      es: { kicker: '🏆 Logro desbloqueado', title: 'Tu colección también tiene **trofeos**', sub: 'Los platinos de los juegos no lo son todo', h1: 'Desde tu primer juego hasta **cazador de trofeos**', big: 'logros por conseguir', bigSub: 'Coleccionista, finalista, maratoniano y **finalista en serie**', end: 'Desbloquea **los 19**',
        yt: { title: 'Trofeos por tu colección de juegos 🏆 19 logros en PS5 Vault', desc: 'Coleccionista, finalista, cazador de trofeos, maratoniano. PS5 Vault tiene 19 logros que desbloqueas al añadir y terminar juegos.', tags: '#trofeos #platino #ps5 #playstation #videojuegos #gamer #shorts' } },
      de: { kicker: '🏆 Erfolg freigeschaltet', title: 'Deine Sammlung hat auch **Trophäen**', sub: 'Platin im Spiel ist nicht alles', h1: 'Vom ersten Spiel bis zum **Trophäenjäger**', big: 'Erfolge zum Freischalten', bigSub: 'Sammler, Finisher, Marathon und **Serien-Finisher**', end: 'Schalte **alle 19** frei',
        yt: { title: 'Trophäen für deine Spielesammlung 🏆 19 Erfolge in PS5 Vault', desc: 'Sammler, Finisher, Trophäenjäger, Marathon. PS5 Vault hat 19 Erfolge, die du freischaltest, wenn du Spiele hinzufügst und beendest.', tags: '#trophäen #platin #ps5 #playstation #gaming #zocken #shorts' } },
      fr: { kicker: '🏆 Succès débloqué', title: 'Ta collection a aussi **ses trophées**', sub: 'Les platines en jeu, ce n’est pas tout', h1: 'De ton premier jeu au **chasseur de trophées**', big: 'succès à débloquer', bigSub: 'Collectionneur, finisseur, marathonien et **finisseur en série**', end: 'Débloque **les 19**',
        yt: { title: 'Des trophées pour ta collection de jeux 🏆 19 succès dans PS5 Vault', desc: 'Collectionneur, finisseur, chasseur de trophées, marathonien. PS5 Vault propose 19 succès que tu débloques en ajoutant et en terminant des jeux.', tags: '#trophees #platine #ps5 #playstation #jeuxvideo #gamer #shorts' } },
      it: { kicker: '🏆 Obiettivo sbloccato', title: 'Anche la tua collezione ha **i trofei**', sub: 'I platini nei giochi non sono tutto', h1: 'Dal primo gioco al **cacciatore di trofei**', big: 'obiettivi da sbloccare', bigSub: 'Collezionista, finisher, maratoneta e **finisher seriale**', end: 'Sblocca **tutti i 19**',
        yt: { title: 'Trofei per la tua collezione di giochi 🏆 19 obiettivi in PS5 Vault', desc: 'Collezionista, finisher, cacciatore di trofei, maratoneta. PS5 Vault ha 19 obiettivi che sblocchi aggiungendo e finendo giochi.', tags: '#trofei #platino #ps5 #playstation #videogiochi #gamer #shorts' } },
      pt: { kicker: '🏆 Conquista desbloqueada', title: 'Sua coleção também tem **troféus**', sub: 'Platina no jogo não é tudo', h1: 'Do primeiro jogo ao **caçador de troféus**', big: 'conquistas para pegar', bigSub: 'Colecionador, finalizador, maratonista e **zerador em série**', end: 'Desbloqueie **as 19**',
        yt: { title: 'Troféus pela sua coleção de jogos 🏆 19 conquistas no PS5 Vault', desc: 'Colecionador, finalizador, caçador de troféus, maratonista. O PS5 Vault tem 19 conquistas que você desbloqueia ao adicionar e zerar jogos.', tags: '#trofeus #platina #ps5 #playstation #games #gamer #shorts' } },
    },
  },

  // ── 12. Koszt godziny ────────────────────────────────────────────────────────
  {
    id: '12',
    slug: { pl: '12-koszt-godziny-grania', en: '12-cost-per-hour', es: '12-coste-por-hora', de: '12-kosten-pro-stunde', fr: '12-cout-par-heure', it: '12-costo-per-ora', pt: '12-custo-por-hora' },
    frames: (S0, F) => { const S = V(S0, F); return [
      { type: 'hook', kicker: S.kicker, title: S.title, sub: S.sub, dur: 2.8 },
      { type: 'shot', head: S.h1, shot: 'finance', crop: [0, 578, 824, 340], dur: 3.2 },
      { type: 'shot', head: S.h2, shot: 'insights', crop: C.insightsLow, dur: 3.6 },
      { type: 'end', headline: S.end, shot: 'insights', crop: [0, 0, 824, 1100], dur: 3.2 },
    ] },
    text: {
      pl: { kicker: 'Matematyka gracza 🧮', title: 'Ile kosztowała Cię **jedna godzina** grania?', sub: 'Gra za 300 zł na 100 godzin to 3 zł/h', h1: 'Koszt godziny **całej kolekcji**', h2: 'I gry, które były **najdroższe na godzinę**', end: 'Policz **swój koszt godziny**',
        yt: { title: 'Ile kosztuje Cię godzina grania? 🧮 Koszt na godzinę każdej gry', desc: 'Gra za 300 zł, w którą grałeś 100 godzin, kosztowała 3 zł za godzinę. PS5 Vault liczy koszt godziny całej kolekcji i pokazuje gry z najgorszą wartością.', tags: '#gry #ps5 #playstation #finanse #oszczędzanie #gracze #shorts' } },
      en: { kicker: 'Gamer math 🧮', title: 'What did **one hour** of gaming cost you?', sub: 'A $60 game played for 100 hours is $0.60/h', h1: 'Cost per hour of **your whole collection**', h2: 'And the games that were **the priciest per hour**', end: 'Find **your cost per hour**',
        yt: { title: 'What does one hour of gaming cost you? 🧮 Cost per hour for every game', desc: 'A $60 game you played for 100 hours cost $0.60 an hour. PS5 Vault works out the cost per hour of your whole collection and shows the games with the worst value.', tags: '#gaming #ps5 #playstation #money #value #gamer #shorts' } },
      es: { kicker: 'Matemáticas gamer 🧮', title: '¿Cuánto te costó **una hora** de juego?', sub: 'Un juego de 70 € jugado 100 horas sale a 0,70 €/h', h1: 'El coste por hora de **toda tu colección**', h2: 'Y los juegos **más caros por hora**', end: 'Calcula **tu coste por hora**',
        yt: { title: '¿Cuánto te cuesta una hora de juego? 🧮 Coste por hora de cada juego', desc: 'Un juego de 70 € al que jugaste 100 horas te costó 0,70 € la hora. PS5 Vault calcula el coste por hora de toda tu colección y te muestra los juegos que menos valieron la pena.', tags: '#videojuegos #ps5 #playstation #dinero #gamer #gaming #shorts' } },
      de: { kicker: 'Gamer-Mathe 🧮', title: 'Was hat dich **eine Stunde** Zocken gekostet?', sub: 'Ein Spiel für 70 € und 100 Stunden sind 0,70 €/h', h1: 'Kosten pro Stunde **deiner ganzen Sammlung**', h2: 'Und die Spiele, die **pro Stunde am teuersten** waren', end: 'Berechne **deine Kosten pro Stunde**',
        yt: { title: 'Was kostet dich eine Stunde Zocken? 🧮 Kosten pro Stunde für jedes Spiel', desc: 'Ein Spiel für 70 €, das du 100 Stunden gespielt hast, hat 0,70 € pro Stunde gekostet. PS5 Vault berechnet die Kosten pro Stunde deiner ganzen Sammlung und zeigt die Spiele mit dem schlechtesten Wert.', tags: '#gaming #ps5 #playstation #geld #zocken #gamer #shorts' } },
      fr: { kicker: 'Maths de joueur 🧮', title: 'Combien t’a coûté **une heure** de jeu ?', sub: 'Un jeu à 70 € joué 100 heures, c’est 0,70 €/h', h1: 'Le coût par heure de **toute ta collection**', h2: 'Et les jeux **les plus chers à l’heure**', end: 'Calcule **ton coût par heure**',
        yt: { title: 'Combien te coûte une heure de jeu ? 🧮 Le coût par heure de chaque jeu', desc: 'Un jeu à 70 € joué 100 heures t’a coûté 0,70 € de l’heure. PS5 Vault calcule le coût par heure de toute ta collection et montre les jeux qui en valaient le moins la peine.', tags: '#jeuxvideo #ps5 #playstation #argent #gamer #gaming #shorts' } },
      it: { kicker: 'Matematica da gamer 🧮', title: 'Quanto ti è costata **un’ora** di gioco?', sub: 'Un gioco da 70 € giocato 100 ore costa 0,70 €/h', h1: 'Il costo per ora di **tutta la collezione**', h2: 'E i giochi **più cari all’ora**', end: 'Calcola **il tuo costo per ora**',
        yt: { title: 'Quanto ti costa un’ora di gioco? 🧮 Il costo per ora di ogni gioco', desc: 'Un gioco da 70 € giocato per 100 ore ti è costato 0,70 € all’ora. PS5 Vault calcola il costo per ora di tutta la collezione e mostra i giochi che valevano di meno.', tags: '#videogiochi #ps5 #playstation #soldi #gamer #gaming #shorts' } },
      pt: { kicker: 'Matemática gamer 🧮', title: 'Quanto custou **uma hora** de jogo?', sub: 'Um jogo de R$ 300 jogado 100 horas sai a R$ 3/h', h1: 'O custo por hora da **sua coleção inteira**', h2: 'E os jogos **mais caros por hora**', end: 'Calcule **seu custo por hora**',
        yt: { title: 'Quanto custa uma hora de jogo? 🧮 Custo por hora de cada jogo', desc: 'Um jogo de R$ 300 que você jogou por 100 horas custou R$ 3 por hora. O PS5 Vault calcula o custo por hora da sua coleção inteira e mostra os jogos que menos valeram a pena.', tags: '#games #ps5 #playstation #dinheiro #gamer #gaming #shorts' } },
    },
  },
]

// Liczba dób dla "ile godzin" (np. 1164 h → 48 dób).
export function enrichFacts(F) {
  return { ...F, days: Math.floor(F.hours / 24) }
}

export { PLAY }
