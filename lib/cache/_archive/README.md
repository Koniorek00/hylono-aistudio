# Archived: `lib/cache/products.ts`

Archived 2026-08-28 (proof `1009711`). Moved, not deleted — `git log --follow
lib/cache/_archive/products.ts` still shows its whole history.

## Why

It was **dead code carrying its own price book**.

Measured before moving it, across **16,550 files** in the whole repository
(not just `app/`, `components/`, `lib/`): the only code reference to
`cache/products` or `monthlyPriceEur` was the file itself. `lib/cache/` contained
nothing else, and nothing imported it. It was a `use cache` scaffold that never got
wired up.

That would be harmless if it held no data. It held:

```ts
monthlyPriceEur: 390   // and 210, and 180
currency: 'EUR'
```

Those figures match **no** price book in this repository. The website's rental prices
are `1499` / `199` and its purchase prices `24900` / `2400`, denominated in **PLN**
(`PRICE_BOOK_CURRENCY`). So this file was a **third** disagreeing source of prices,
sitting in `lib/` under an inviting name, in a codebase whose main defect class for
the last twelve cycles has been exactly that — prices claiming a currency the company
does not charge in.

The realistic failure was not that it was wrong. It was that someone would find
`lib/cache/products.ts`, reasonably assume it was the cache in front of the real
catalogue, and render `EUR 390` from it.

## Why archived rather than fixed

Renaming `monthlyPriceEur` and correcting the currency would have polished code with
zero callers, and left the invented figures in place. Removing it from the live tree
removes the trap. Keeping it here preserves the `use cache` / `cacheLife` / `cacheTag`
scaffolding, which is the only part with any future value.

## If you want this capability back

Do not un-archive it as-is. Wire a cache layer to the **existing** single source —
`content/products.ts` for the catalogue and `lib/money.ts` for currency — so there is
one price book, not two. The whole point of that module is that a price cannot be
rendered without stating its currency.

## Related

- `site-intelligence/08-verification/1009711-*` — this archival, with the measurement.
- `site-intelligence/09-launch-board/2026-08-22-app-website-price-divergence-handover.md`
  — the *other* divergent price book, in the app monorepo. That one is owner-gated
  because it may describe genuinely different devices; this one was not, because it
  had no consumers at all.
