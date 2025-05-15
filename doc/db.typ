// #import "@preview/pinit:0.2.2"
#set text(14pt, font: "Noto Sans")
#show table.cell.where(y: 0): set text(weight: "bold")
= Book catalog database layout
#grid(
  columns: 2,
  column-gutter: 1cm,
  table[User][id][name][password][createdAt][updatedAt], table[Book][id][author][title][details][createdAt][updatedAt],
)
