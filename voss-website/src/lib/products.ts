export type Product = {
  id: string;
  name: string;
  line: string;
  price: number;
  /** Base leather colour, linear-friendly hex. */
  leather: string;
  /** Secondary trim / gusset colour. */
  trim: string;
  /** Hardware finish. */
  hardware: string;
  hardwareName: string;
  description: string;
  specs: { label: string; value: string }[];
};

export const PRODUCTS: Product[] = [
  {
    id: "noir",
    name: "Vesper",
    line: "The Evening Edit",
    price: 1480,
    leather: "#14100e",
    trim: "#241d19",
    hardware: "#c9a227",
    hardwareName: "Brushed brass",
    description:
      "A structured shoulder bag with a sculpted flap and hand-burnished edges. Cut from full-grain calfskin that deepens in tone with every wear.",
    specs: [
      { label: "Dimensions", value: '9.5" × 6.0" × 3.0"' },
      { label: "Leather", value: "Full-grain Tuscan calfskin" },
      { label: "Lining", value: "Suede goatskin" },
      { label: "Made in", value: "Florence, Italy" },
    ],
  },
  {
    id: "cognac",
    name: "Solene",
    line: "The Day Edit",
    price: 1290,
    leather: "#7a4423",
    trim: "#5c3119",
    hardware: "#c9a227",
    hardwareName: "Brushed brass",
    description:
      "Our softest silhouette. A slouched top-handle in vegetable-tanned cognac that relaxes into the shape of the way you carry it.",
    specs: [
      { label: "Dimensions", value: '11.0" × 7.5" × 4.0"' },
      { label: "Leather", value: "Vegetable-tanned cowhide" },
      { label: "Lining", value: "Cotton twill" },
      { label: "Made in", value: "Florence, Italy" },
    ],
  },
  {
    id: "bone",
    name: "Maraux",
    line: "The Resort Edit",
    price: 1620,
    leather: "#c8bba8",
    trim: "#a89880",
    hardware: "#d8d4cc",
    hardwareName: "Polished nickel",
    description:
      "Architectural and unlined, finished in a pale bone grain. Designed to hold its shape empty and to read as sculpture on a shelf.",
    specs: [
      { label: "Dimensions", value: '10.0" × 7.0" × 3.5"' },
      { label: "Leather", value: "Grained French calf" },
      { label: "Lining", value: "Unlined, raw edge" },
      { label: "Made in", value: "Florence, Italy" },
    ],
  },
  {
    id: "oxblood",
    name: "Ilaria",
    line: "The Signature",
    price: 1850,
    leather: "#5a1f26",
    trim: "#3d151a",
    hardware: "#c9a227",
    hardwareName: "Brushed brass",
    description:
      "The house silhouette. A deep oxblood box bag with a chain that detaches, so it carries as a clutch by night and a shoulder bag by day.",
    specs: [
      { label: "Dimensions", value: '10.5" × 6.5" × 3.2"' },
      { label: "Leather", value: "Box calf, hand-glazed" },
      { label: "Lining", value: "Suede goatskin" },
      { label: "Made in", value: "Florence, Italy" },
    ],
  },
];

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
