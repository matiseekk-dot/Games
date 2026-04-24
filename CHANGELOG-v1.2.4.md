# PS5 Vault — v1.2.4 Hotfix

**Type:** Translation key bug in Finance component
**Parent:** v1.2.3 (tip jar — na produkcji)

## 🐛 Co było zepsute

W zakładce **Finanse → Analiza**, karta "Najlepsza wartość" wyświetlała tekst **"bestValueDesc"** zamiast prawdziwej translacji.

Zrzut ekranu pokazał: "Najlepsza wartość \ bestValueDesc \ 1.9 zł/h"

## 🔍 Przyczyna

W v1.2.0 (Finance main tab refactor) przeniosłem Finance do osobnego komponentu i wpisałem zły klucz translacji: **`'bestValueDesc'`** (z "ue") zamiast istniejącego **`'bestValDesc'`** (bez "ue"). 

Translations table ma klucz `bestValDesc` na linii 70 (PL) i 189 (EN). Kiedy `t(lang, 'bestValueDesc')` nie znalazł klucza, fallback zwrócił sam string "bestValueDesc" → widoczne w UI.

W Stats (na linii 1311) ten sam insight miał **prawidłowy** klucz `'bestValDesc'`. Bug był tylko w duplikacie logiki w Finance.

## ✅ Fix

1 linia zmieniona — w Finance component linia 1579:
- `t(lang,'bestValueDesc',...)` → `t(lang,'bestValDesc',...)`

## 🔧 Tech

- Build passes
- SW bump v11 → v12
- package.json → 1.2.4

## Deployment

1. Wypakuj ZIP → zastąp `ps5-vault/`
2. Commit: `v1.2.4 hotfix — bestValueDesc translation key`
3. Push → Actions
4. Hard refresh → SW = `ps5vault-v12`
5. Sprawdź: Finanse → Analiza → karta "Najlepsza wartość" → widzisz realny tekst (np. "EA Sports FC 26 — tylko 1.9 zł/h. Twoja najlepsza inwestycja.")

## Reflection

**To jest drugi bug z mojej strony w v1.2.0** (po Settings/openImport scope bug naprawionym w v1.2.1).

Oba byłyby złapane przez smoke test manual. Lekcja: **pełny refactor (Finance → osobny komponent) wymaga ręcznego przetestowania każdej ścieżki, nie tylko `npm run build` check**.

Od następnej większej zmiany będę robił `npm run dev` i klik-przez wszystkie feature flows przed pakowaniem ZIP.
