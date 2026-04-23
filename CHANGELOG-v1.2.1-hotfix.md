# PS5 Vault — v1.2.1 Hotfix

**Type:** Critical hotfix
**Parent:** v1.2.0 (deployed — but broken on Settings tab)

## 🐛 Co było zepsute

Otwarcie zakładki **Opcje** powodowało crash → ErrorBoundary fallback z komunikatem `openImport is not defined`.

## 🔍 Przyczyna

W v1.2.0 dodałem `ImportModal` z handlerem `openImport`. Settings component wywołuje tę funkcję:
```jsx
<div className='set-row' onClick={openImport}>  // Settings component, linia 1617
```

Ale `openImport` jest zdefiniowane w głównym App component. **Settings nie dostawał go przez props.** W Collection toolbar (inline w App) działało bo closure scope. W Settings (osobny komponent) crashuje.

Classic scope bug który zrobiłbym też przy code review na 3 minuty, a nie zrobiłem bo v1.2.0 szło pod presją czasu i nie przetestowałem każdego flow end-to-end.

## ✅ Fix

Dwa miejsca:

**`src/App.jsx:1601`** — Settings dostaje openImport w props:
```jsx
function Settings({games,setGames,flash,lang,setLang,openImport}){
```

**`src/App.jsx:1778`** — App przekazuje openImport do Settings:
```jsx
<Settings games={games} setGames={setGames} flash={flash} lang={lang} setLang={setLang} openImport={openImport}/>
```

To wszystko. Zero zmian logiki, zero zmian UI.

## 🧪 Audit po fixie

Sprawdziłem wszystkie wywołania `openImport`, `closeImport`, `importModal`:
- ✅ Settings (1617) — dostaje przez props (fixed)
- ✅ Collection toolbar (1735) — inline w App, closure scope OK
- ✅ ImportModal renderer (1807+) — w App scope, OK
- ✅ Wszystkie handlery merge/replace — w App scope, OK

## 🔧 Tech

- Build passes (829 modułów)
- Bundle size bez zmian
- SW bump `ps5vault-v8` → `ps5vault-v9`
- `package.json` → 1.2.1

## Deployment

1. ⬜ Wypakuj `ps5vault-v1.2.1.zip` → zastąp folder `ps5-vault/`
2. ⬜ Commit: `v1.2.1 hotfix — Settings crash (openImport scope)`
3. ⬜ Push → Actions
4. ⬜ Hard refresh → SW = `ps5vault-v9`
5. ⬜ Otwórz Opcje — powinno się otworzyć normalnie
6. ⬜ Kliknij "Importuj dane" — modal z wyborem trybu powinien się pojawić

## Reflection — lekcja na przyszłość

Ten bug byłby złapany natychmiast przez **3-minutowy smoke test wszystkich zakładek** przed spakowaniem v1.2.0. Nie zrobiłem tego. Zamiast tego polegałem tylko na `npm run build` passing — który łapie syntax errors, ale **nie łapie runtime errors jak missing prop**.

**Reguła dla następnych deployi:** po build check zawsze `npm run dev` i manual click through każdej zakładki. 5 minut roboty oszczędza exact tego crash'a u usera.

Na szczęście ErrorBoundary zadziałało idealnie — user zobaczył czytelny komunikat zamiast białego ekranu, dane w localStorage są bezpieczne, kliknie "Przeładuj apkę" i wraca do stanu sprzed. ROI tej 30 min pracy z sesji kiedy dodawaliśmy ErrorBoundary właśnie się zmaterializował.
