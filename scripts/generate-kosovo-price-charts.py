#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["matplotlib>=3.10,<4"]
# ///
"""Regenerate editable EN/SQ article charts: uv run scripts/generate-kosovo-price-charts.py.

All reported values and source URLs live in data/kosovo-price-comparison.json.
Derived totals, percentages and ratios are calculated here with Decimal.
SVG keeps selectable text; PNG copies support image previews and export.
"""

from decimal import Decimal
import json
from pathlib import Path
import textwrap

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager, ticker
from matplotlib.patches import Patch


ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "scripts/data/kosovo-price-comparison.json").read_text())
OUT = ROOT / "public/writing/kosovo-germany-grocery-prices"
PAPER = "#f7f4ee"
INK = "#1b1712"
PINE = "#2f5d4f"
GERMANY = "#8a8074"
MUTED = "#655e55"
RULE = "#d9d3c8"

georgia = Path("/System/Library/Fonts/Supplemental/Georgia.ttf")
if georgia.exists():
    font_manager.fontManager.addfont(str(georgia))
TITLE_FONT = "Georgia" if georgia.exists() else "DejaVu Serif"
plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 16,
    "text.color": INK,
    "axes.labelcolor": INK,
    "xtick.color": MUTED,
    "ytick.color": INK,
    "figure.facecolor": PAPER,
    "axes.facecolor": PAPER,
    "savefig.facecolor": PAPER,
    "svg.fonttype": "none",
    "svg.hashsalt": "eduardluta-kosovo-prices",
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.spines.left": False,
    "axes.spines.bottom": False,
})

TEXT = {
    "en": {
        "countries": ["Kosovo", "Germany"],
        "wages_title": "The income behind the price",
        "wages_sub": "Reported average net monthly employee wages · 2025",
        "wages_foot": ["Sources: KAS · Destatis (revision: 25 Aug 2026).",
                       "National wage methods differ; these are not medians."],
        "prices_title": "Four staples, two retail samples",
        "prices_sub": "Price per listed unit · euros",
        "items": ["Milk · 1 L", "Rice · 1 kg", "Flour · 1 kg", "Sugar · 1 kg"],
        "legend": ["Kosovo · KAS average", "Germany · ALDI Nord"],
        "prices_foot": ["Sources: KAS, Aug 2026 · ALDI Nord, 23 Sep 2026.",
                        "Different retail samples; product categories, not identical SKUs."],
        "basket_title": "One small basket. Two measures.",
        "basket_sub": "One listed unit each of milk, rice, flour and sugar",
        "basket_euros": "1 / Combined price · euros",
        "basket_share": "2 / Share of reported monthly net wage",
        "basket_ratio": "Kosovo’s wage share is {ratio}× Germany’s.",
        "basket_foot": ["Calculated from KAS, ALDI Nord and Destatis data.",
                        "Prices: Aug / Sep 2026 · Wages: 2025. Methods differ.",
                        "Four-item illustration; not a cost-of-living index."],
        "inflation_title": "Prices are still rising",
        "inflation_sub": "Kosovo · August 2026 versus August 2025",
        "inflation_labels": ["Food & non-alcoholic\ndrinks", "All items"],
        "inflation_foot": ["Source: KAS, consumer price statistics, August 2026.",
                           "Published year-on-year rates, not annual averages."],
    },
    "sq": {
        "countries": ["Kosovë", "Gjermani"],
        "wages_title": "Të ardhurat pas çmimit",
        "wages_sub": "Pagat mesatare neto mujore të raportuara · 2025",
        "wages_foot": ["Burimet: ASK · Destatis (rishikim: 25 gusht 2026).",
                       "Metodat kombëtare ndryshojnë; këto nuk janë paga mediane."],
        "prices_title": "Katër produkte, dy mostra çmimesh",
        "prices_sub": "Çmimi për njësinë e shënuar · euro",
        "items": ["Qumësht · 1 L", "Oriz · 1 kg", "Miell · 1 kg", "Sheqer · 1 kg"],
        "legend": ["Kosovë · mesatare ASK", "Gjermani · ALDI Nord"],
        "prices_foot": ["Burimet: ASK, gusht 2026 · ALDI Nord, 23 shtator 2026.",
                        "Mostra dhe produkte të ndryshme; krahasim sipas kategorisë."],
        "basket_title": "Një shportë e vogël. Dy matje.",
        "basket_sub": "Nga një njësi qumështi, orizi, mielli dhe sheqeri",
        "basket_euros": "1 / Çmimi i përgjithshëm · euro",
        "basket_share": "2 / Pjesa e pagës mesatare neto mujore",
        "basket_ratio": "Pjesa e pagës në Kosovë është {ratio}× ajo në Gjermani.",
        "basket_foot": ["Llogaritur nga të dhënat e ASK, ALDI Nord dhe Destatis.",
                        "Çmimet: gusht / shtator 2026 · Pagat: 2025. Metodat ndryshojnë.",
                        "Shembull me katër produkte, jo indeks i kostos së jetesës."],
        "inflation_title": "Çmimet ende po rriten",
        "inflation_sub": "Kosovë · gusht 2026 kundrejt gushtit 2025",
        "inflation_labels": ["Ushqime e pije\njoalkoolike", "Të gjithë\nartikujt"],
        "inflation_foot": ["Burimi: ASK, statistikat e çmimeve, gusht 2026.",
                           "Norma kundrejt një viti më parë, jo mesatare vjetore."],
    },
}


def number(value, decimals=0, lang="en"):
    """Explicit, portable display formatting; no machine locale dependency."""
    out = f"{value:,.{decimals}f}"
    if lang == "sq":
        out = out.replace(",", "\N{NARROW NO-BREAK SPACE}").replace(".", ",")
    return out


def canvas(title, subtitle, height=5.5, mobile=False):
    if mobile:
        title = textwrap.fill(title, width=27)
        subtitle = textwrap.fill(subtitle, width=39)
    fig = plt.figure(figsize=(3.8 if mobile else 7.6, height), dpi=100)
    title_size = 19 if mobile else 24
    fig.text(.055, .94, title, fontsize=title_size, fontfamily=TITLE_FONT,
             va="top", ha="left", linespacing=1.2)
    subtitle_y = (.94 - ((title.count('\n') + 1) * title_size / 72 * 1.2 + .16) / height
                  if mobile else .845 if height < 6 else .87)
    fig.text(.055, subtitle_y, subtitle,
             fontsize=11.5 if mobile else 13.2, color=MUTED, va="top")
    return fig


def footer(fig, lines, bottom=.065, mobile=False):
    if mobile:
        lines = [part for line in lines for part in textwrap.wrap(line, width=43)]
    height = fig.get_figheight()
    line_step = (.21 if mobile else .23) / height
    top = bottom + (len(lines) - 1) * line_step
    rule_y = top + (.034 if mobile else .05)
    fig.add_artist(plt.Line2D([.055, .945], [rule_y, rule_y],
                             color=RULE, linewidth=1, transform=fig.transFigure))
    for i, line in enumerate(lines):
        fig.text(.055, top - i * line_step, line, fontsize=10 if mobile else 11.8,
                 va="baseline", color=MUTED)


def euro_axis(ax, maximum, ticks, lang="en", mobile=False):
    ax.set_xlim(0, maximum)
    ax.set_xticks(ticks)
    ax.xaxis.set_major_formatter(ticker.FuncFormatter(lambda x, _: number(x, 0, lang)))
    ax.tick_params(axis="x", labelsize=10 if mobile else 12, length=0, pad=9)
    ax.tick_params(axis="y", length=0, pad=8 if mobile else 12)
    ax.set_axisbelow(True)
    ax.grid(axis="x", color=RULE, linewidth=.8)


def hbars(ax, values, labels, value_labels, maximum, mobile=False):
    ax.barh([1, 0], values, height=.44, color=[PINE, GERMANY], zorder=3)
    ax.set_yticks([1, 0], labels, fontsize=12 if mobile else 16)
    ax.set_ylim(-.55, 1.55)
    for y, value, label in zip([1, 0], values, value_labels):
        ax.text(value + maximum * .022, y, label, va="center", fontsize=12 if mobile else 17,
                color=INK)


def save(fig, name, lang, mobile=False):
    OUT.mkdir(parents=True, exist_ok=True)
    stem = f"{name}-{lang}{'-mobile' if mobile else ''}"
    # Catch clipped translated labels/notes before publishing either format.
    fig.canvas.draw()
    renderer = fig.canvas.get_renderer()
    for label in fig.findobj(matplotlib.text.Text):
        if not label.get_text() or not label.get_visible():
            continue
        box = label.get_window_extent(renderer)
        if box.x0 < -1 or box.y0 < -1 or box.x1 > fig.bbox.width + 1 or box.y1 > fig.bbox.height + 1:
            raise ValueError(f"Clipped text in {stem}: {label.get_text()!r}")
    svg_path = OUT / f"{stem}.svg"
    fig.savefig(svg_path, metadata={"Date": DATA["retrieved_on"]})
    svg_path.write_text("\n".join(line.rstrip() for line in svg_path.read_text().splitlines()) + "\n")
    fig.savefig(OUT / f"{stem}.png", dpi=180, metadata={"Software": "Matplotlib"})
    plt.close(fig)


def wages(lang, mobile=False):
    t = TEXT[lang]
    fig = canvas(t["wages_title"], t["wages_sub"], height=6.1 if mobile else 5.5, mobile=mobile)
    ax = fig.add_axes([.26, .32, .64, .37] if mobile else [.225, .30, .68, .43])
    values = [DATA["wages"][key] for key in ("kosovo", "germany")]
    hbars(ax, values, t["countries"], [f"€{number(x, lang=lang)}" for x in values], 4000 if mobile else 3300, mobile)
    euro_axis(ax, 4000 if mobile else 3400, [0, 2000, 4000] if mobile else [0, 1000, 2000, 3000], lang, mobile)
    footer(fig, t["wages_foot"], bottom=.045 if mobile else .065, mobile=mobile)
    save(fig, "wages", lang, mobile)


def prices(lang, mobile=False):
    t = TEXT[lang]
    fig = canvas(t["prices_title"], t["prices_sub"], height=8.6 if mobile else 7, mobile=mobile)
    fig.legend([Patch(color=PINE), Patch(color=GERMANY)], t["legend"],
               loc="upper left", bbox_to_anchor=(.032 if mobile else .042, .77 if mobile else .82), frameon=False,
               ncol=1, fontsize=11.5 if mobile else 13.5, handlelength=.85, labelspacing=.6)
    ax = fig.add_axes([.31, .245, .60, .42] if mobile else [.28, .235, .64, .46])
    for idx, item in enumerate(DATA["prices"]["items"]):
        y = 3 - idx
        for offset, key, color in [(.18, "kosovo", PINE), (-.18, "germany", GERMANY)]:
            value = item[key]
            ax.barh(y + offset, value, height=.28, color=color, zorder=3)
            ax.text(value + .045, y + offset, f"€{number(value, 2, lang)}",
                    va="center", fontsize=11.5 if mobile else 14.5)
    item_labels = [item.replace(' · ', '\n') for item in t["items"]] if mobile else t["items"]
    ax.set_yticks([3, 2, 1, 0], item_labels, fontsize=12 if mobile else 14)
    ax.set_ylim(-.6, 3.6)
    euro_axis(ax, 2.45 if mobile else 2.15, [0, 1, 2], lang, mobile)
    footer(fig, t["prices_foot"], bottom=.04 if mobile else .065, mobile=mobile)
    save(fig, "prices", lang, mobile)


def basket(lang, mobile=False):
    t = TEXT[lang]
    totals = [sum(Decimal(str(item[key])) for item in DATA["prices"]["items"])
              for key in ("kosovo", "germany")]
    shares = [total / Decimal(DATA["wages"][key]) * 100
              for total, key in zip(totals, ("kosovo", "germany"))]
    ratio = shares[0] / shares[1]
    fig = canvas(t["basket_title"], t["basket_sub"], height=10.4 if mobile else 8.8, mobile=mobile)
    fig.text(.055, .79 if mobile else .795, t["basket_euros"], fontsize=12 if mobile else 15, color=PINE)
    ax = fig.add_axes([.26, .59, .64, .17] if mobile else [.225, .56, .68, .20])
    hbars(ax, list(map(float, totals)), t["countries"],
          [f"€{number(x, 2, lang)}" for x in totals], 6.8 if mobile else 6, mobile)
    euro_axis(ax, 6.8 if mobile else 6, [0, 2, 4, 6], lang, mobile)
    share_label = textwrap.fill(t["basket_share"], width=32) if mobile else t["basket_share"]
    fig.text(.055, .515 if mobile else .487, share_label, fontsize=12 if mobile else 15, color=PINE)
    ax = fig.add_axes([.26, .305, .64, .17] if mobile else [.225, .265, .68, .19])
    hbars(ax, list(map(float, shares)), t["countries"],
          [f"{number(x, 2, lang)}%" for x in shares], 1, mobile)
    euro_axis(ax, 1.12 if mobile else 1, [0, .5, 1] if mobile else [0, .25, .5, .75, 1], lang, mobile)
    ax.xaxis.set_major_formatter(ticker.FuncFormatter(lambda x, _: f"{number(x, 1 if mobile else 2, lang)}%"))
    ratio_text = t["basket_ratio"].format(ratio=number(ratio, 2, lang))
    if mobile:
        ratio_text = textwrap.fill(ratio_text, width=35)
    fig.text(.055, .215 if mobile else .192, ratio_text, fontsize=12 if mobile else 14.7, color=PINE)
    footer(fig, t["basket_foot"], bottom=.035 if mobile else .045, mobile=mobile)
    save(fig, "basket", lang, mobile)


def inflation(lang, mobile=False):
    t = TEXT[lang]
    fig = canvas(t["inflation_title"], t["inflation_sub"], height=6.4 if mobile else 6, mobile=mobile)
    ax = fig.add_axes([.11, .33, .78, .40] if mobile else [.13, .30, .76, .46])
    values = [DATA["inflation"][key] for key in ("food", "all_items")]
    ax.bar([0, 1], values, width=.55, color=[PINE, GERMANY], zorder=3)
    ax.set_xlim(-.55, 1.55)
    ax.set_ylim(0, 9)
    labels = ["Food &\nnon-alcoholic\ndrinks", "All items"] if mobile and lang == "en" else t["inflation_labels"]
    ax.set_xticks([0, 1], labels, fontsize=11 if mobile else 14)
    ax.set_yticks([])
    ax.tick_params(axis="x", length=0, pad=13)
    ax.axhline(0, color=RULE, linewidth=1)
    for x, value in enumerate(values):
        ax.text(x, value + .27, f"{number(value, 1, lang)}%", ha="center",
                va="bottom", fontsize=22 if mobile else 25, color=INK)
    footer(fig, t["inflation_foot"], bottom=.045 if mobile else .065, mobile=mobile)
    save(fig, "inflation", lang, mobile)


if __name__ == "__main__":
    for language in TEXT:
        for chart in (wages, prices, basket, inflation):
            chart(language)
            chart(language, mobile=True)
    summary = {}
    for country in ("kosovo", "germany"):
        total = sum(Decimal(str(item[country])) for item in DATA["prices"]["items"])
        summary[country] = {
            "basket_eur": str(total),
            "share_of_monthly_net_wage_pct": str(total / Decimal(DATA["wages"][country]) * 100),
        }
    summary["basket_wage_share_ratio_kosovo_to_germany"] = str(
        Decimal(summary["kosovo"]["share_of_monthly_net_wage_pct"]) /
        Decimal(summary["germany"]["share_of_monthly_net_wage_pct"])
    )
    summary["basket_price_ratio_kosovo_to_germany"] = str(
        Decimal(summary["kosovo"]["basket_eur"]) / Decimal(summary["germany"]["basket_eur"])
    )
    summary["monthly_net_wage_ratio_germany_to_kosovo"] = str(
        Decimal(DATA["wages"]["germany"]) / Decimal(DATA["wages"]["kosovo"])
    )
    summary["per_product"] = {
        item["id"]: {
            "kosovo_price_premium_pct": str(
                (Decimal(str(item["kosovo"])) / Decimal(str(item["germany"])) - 1) * 100
            ),
            "kosovo_price_difference_eur": str(
                Decimal(str(item["kosovo"])) - Decimal(str(item["germany"]))
            ),
        }
        for item in DATA["prices"]["items"]
    }
    summary["basket_kosovo_price_premium_pct"] = str(
        (Decimal(summary["basket_price_ratio_kosovo_to_germany"]) - 1) * 100
    )
    summary["basket_kosovo_price_difference_eur"] = str(
        Decimal(summary["kosovo"]["basket_eur"]) - Decimal(summary["germany"]["basket_eur"])
    )
    summary["income_equivalent_german_basket_price_eur"] = str(
        Decimal(summary["kosovo"]["basket_eur"]) *
        Decimal(DATA["wages"]["germany"]) / Decimal(DATA["wages"]["kosovo"])
    )
    summary["equal_wage_share_kosovo_price_reduction_pct"] = str(
        (1 - Decimal(DATA["wages"]["kosovo"]) / Decimal(DATA["wages"]["germany"])) * 100
    )
    summary["formulas"] = {
        "price_premium_pct": "(Kosovo price / German price - 1) * 100; same formula for the basket",
        "price_difference_eur": "Kosovo price - German price; same formula for the basket",
        "wage_share_pct": "Basket price / reported monthly net wage * 100",
        "income_equivalent_german_basket_price_eur": "Kosovo basket price * German wage / Kosovo wage",
        "equal_wage_share_kosovo_price_reduction_pct": "(1 - Kosovo wage / German wage) * 100; reduction from a corresponding German price for equal wage shares",
    }
    public_data = {**DATA, "derived": summary}
    (OUT / "source-data.json").write_text(json.dumps(public_data, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps(summary, indent=2))
    print(f"Wrote 16 SVG charts, 16 PNG previews and source-data.json to {OUT}")
