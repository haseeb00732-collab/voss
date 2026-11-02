export type BagSelection = { slug: string; colour: string; quantity: number };

/** Changing colour combines duplicate selections without silently losing quantities. */
export function changeBagColour(items: BagSelection[], index: number, colour: string): BagSelection[] {
  const selected = items[index];
  if (!selected || selected.colour === colour) return items;
  const match = items.findIndex((item, position) => position !== index && item.slug === selected.slug && item.colour === colour);
  if (match < 0) return items.map((item, position) => position === index ? { ...item, colour } : item);
  const quantity = items[match].quantity + selected.quantity;
  if (quantity > 20) throw new Error('You can order up to 20 of one colour. Reduce the quantities before combining them.');
  return items.flatMap((item, position) => position === index ? [] : [{ ...item, quantity: position === match ? quantity : item.quantity }]);
}
