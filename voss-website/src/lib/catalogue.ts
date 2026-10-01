import media from './studio-media.json';

export type Colourway = { name: string; hex: string; image: number; key: string; alsoShotAs?: number[] };
export type Piece = { slug: string; dir: string; name: string; label: string; imageCount: number; price: number | null; listPrice: number | null; colourways: Colourway[]; detailImages?: number[]; silhouette: string; note: string; description: string; coverColour: string };
const hues: Record<string, string> = { green:'#344d35', black:'#222222', 'dark-brown':'#48332c', cognac:'#9e5e30', burgundy:'#702f3b', camel:'#b78955', ivory:'#e7e0d0', magenta:'#8a305d', mustard:'#ba9236', 'royal-blue':'#294b95', navy:'#253343', tan:'#a97643', taupe:'#9a8e7d', wine:'#6a3040', nude:'#c5a58f', brown:'#76503a', 'beige-natural':'#c5b798', blue:'#416888', grey:'#98958e', beige:'#c8b18a', 'grey-black':'#8b8b88', 'cream-black':'#e1d4bc', 'tan-black':'#b37847', 'burgundy-black':'#6a2c3b', 'cream-brown':'#dfd0b7' };
const specs = [
  ['square-quilted-tote','Square Quilted Tote',3499,'Totes','camel','green,black,dark-brown,cognac,burgundy,camel','A clean grid of quilting, rounded handles and a quietly structured shape.','For days when you want a little structure. Square quilting gives this tote its rhythm, while rounded handles and small metal details keep the silhouette simple.'],
  ['floral-embossed-tote','Floral Embossed Bag',3899,'Top handle','magenta','ivory,black,magenta,mustard,royal-blue,navy','Floral texture and curved metal handles give this structured bag a distinctive outline.','Look closer: the floral pattern is part of the surface. A straight-sided body balances the curved handles, giving the bag a distinct outline without a busy print.'],
  ['croc-panel-tote','Croc Panel Tote',3249,'Totes','black','dark-brown,green,tan,black','Croc embossing meets a smooth base and long, slender handles.','Two textures, one clear shape. The embossed body sits above a smooth base, with long handles and small metal accents drawing the eye upward.'],
  ['croc-top-handle-bag','Croc Top Handle Bag',3299,'Top handle','black','taupe,green,wine,black','A defined shape with croc embossing and a considered metal accent.','A more structured take on the everyday handbag. Croc embossing adds depth to the surface; paired handles and a neat front detail finish the form.'],
  ['chevron-quilted-satchel','Chevron Quilted Satchel',4099,'Top handle','green','tan,black,nude,dark-brown,green','Directional quilting and curved handles, with a matching wallet pictured alongside.','The chevron pattern does the talking. Curved handles soften the structured outline, while small buckles pick up the light. Explore the colour photographs before choosing.'],
  ['textured-dome-satchel','Textured Dome Satchel',4049,'Top handle','black','black,brown,tan,beige-natural,navy','A softly rounded top, long handles and a finely textured finish.','An understated shape with detail up close. The rounded top and long handles give this satchel a clean profile, with pointed handle tabs and a small front plaque.'],
  ['arc-handle-bag-set','Arc Handle Bag Set',3399,'Bag sets','beige','blue,black,grey,beige','A coordinated trio, led by a tote with a distinctive curved metal handle.','One colour story across three shapes. A curved-handle tote sits alongside a smaller zip bag and a flap purse. Compare the photographs of each colour: finishes and details can differ.'],
  ['two-tone-bag-set','Two Tone Bag Set',3749,'Totes','cream-brown','grey-black,cream-black,tan-black,burgundy-black,cream-brown','Contrasting panels connect a tote, a smaller zip bag and a rounded pouch.','Light against dark. This three-piece set brings together contrasting panels, a smaller bag with tassel details and a curved pouch. Choose the combination that works with your wardrobe.'],
  ['tassel-tote','Tassel Tote',3100,'Totes','black','green,cognac,burgundy,dark-brown,black,navy','A tapered tote with long handles, curved side seams and a hanging tassel.','A simple shape with a little movement. Long rounded handles frame the tapered body, while curved seams and a small tassel add detail. Choose from six colours and explore the studio photograph of each.'],
  ['structured-trio-bag-set','Structured Trio Bag Set',3400,'Bag sets','cognac','black,navy,burgundy,dark-brown,cognac','A structured top handle bag, zipped pouch and gold-bar flap purse in one matching set.','Three matching pieces, each with its own shape. Rounded handle tabs soften the main bag, a zipped pouch sits alongside it, and a slim gold bar finishes the flap purse. Compare five colours before choosing your set.'],
] as const;
export const CATALOGUE: Piece[] = specs.map((s, i) => {
  const dir = `product-${String(i + 1).padStart(2, '0')}`;
  return { slug:s[0], dir, name:s[1], label:`Article ${String(i + 1).padStart(2, '0')}`, price:s[2], listPrice:null, silhouette:s[3], coverColour:s[4], colourways:s[5].split(',').map((key, n) => ({key, name:key.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '), hex:hues[key], image:n + 1})), imageCount:s[5].split(',').length, note:s[6], description:s[7] };
});
export type StudioPhoto = { src: string; label: string };
const assets = media as Record<string, Record<string, StudioPhoto[]>>;
export const coverImage = (p: Piece) => studioPhotos(p, p.colourways.find(c => c.key === p.coverColour)!)[0].src;
export const coverSrcSet = (p: Piece) => studioPhotoSrcSet(studioPhotos(p, p.colourways.find(c => c.key === p.coverColour)!)[0]);
export const studioPhotos = (p: Piece, c: Colourway) => assets[p.dir][c.key];
export const studioPhotoSrcSet = (photo: StudioPhoto) => [480,960].map(w => `${photo.src.replace('-960.webp', `-${w}.webp`)} ${w}w`).join(', ');
export const colourwayImage = (p: Piece, c: Colourway) => studioPhotos(p,c)[0].src;
export const colourwaySrcSet = (p: Piece, c: Colourway) => studioPhotoSrcSet(studioPhotos(p,c)[0]);
export const referenceImages = (p: Piece, c: Colourway) => studioPhotos(p,c).map(photo => photo.src);
export const hdImage = (p: Piece, n: number) => colourwayImage(p, p.colourways[n - 1] ?? p.colourways[0]);
export const hdSrcSet = (p: Piece, n: number) => colourwaySrcSet(p, p.colourways[n - 1] ?? p.colourways[0]);
export const pieceImages = (p: Piece) => p.colourways.map(c => colourwayImage(p,c));
export const legacyImages = (piece?: Piece) => { void piece; return [] as string[]; };
export const LEGACY_COUNTS: Record<string,number> = {};
export const HUE_TOKENS = hues;
export const STYLE_COUNT = CATALOGUE.length;
export const styleCountWord = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'][STYLE_COUNT] ?? String(STYLE_COUNT);
export const StyleCountWord = styleCountWord[0].toUpperCase() + styleCountWord.slice(1);
export const getPiece = (slug: string) => CATALOGUE.find(p => p.slug === slug);
export const relatedPieces = (slug: string, count = 3) => CATALOGUE.filter(p => p.slug !== slug).slice(0,count);
export const priceLabel = (price: number | null) => price === null ? null : `Rs ${new Intl.NumberFormat('en-PK').format(price)}`;
export const OFFER = { live:false, endsOn:null as string | null, save:0 };
export const offerRunning = (now?: Date) => { void now; return false; };
export const offerEndsLabel = () => '';
export const pricing = (p: Piece, now?: Date) => { void now; return {running:false, now:priceLabel(p.price), was:null, save:null}; };
