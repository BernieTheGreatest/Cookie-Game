# Kevin’s Cookie Shop Tycoon

Open `index.html` in any modern web browser. No installation or build needed.

Start with $100 and run your shop for 30 days. Choose batch sizes and selling prices for three cookie varieties, plus an advertising budget, then click **Bake & open shop** to advance one day.

- Chocolate chip costs $0.50 to bake (default price $2.50), oatmeal raisin costs $0.35 (default $2.00), and double chocolate costs $0.75 (default $3.25).
- Bake any mix, including a single variety. Your active recipes share the day’s customer traffic; prices influence demand relative to each recipe’s default price. Daily shop costs are $5.
- Daily reports break down cookies sold and baked by recipe. The ledger records the menu and prices. Existing single-cookie saves remain playable as chocolate chip history.
- You must cover ingredients, advertising, and shop costs before opening.
- Weather and neighborhood activity affect demand. Higher prices lower demand; advertising increases it with diminishing returns.
- Unsold cookies are discarded. Cash below $5 ends the run early.
- Your progress is saved automatically in the current browser when local storage is available. New game resets it.
- Optional online fonts fall back to system fonts offline. All game behavior works offline.

For a local server, run `python3 -m http.server 8000` in this folder, then visit http://localhost:8000.
