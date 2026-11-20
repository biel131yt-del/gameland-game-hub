export type CategoryId = "consoles" | "jogos" | "controles" | "acessorios" | "retro";

export const CATEGORIES: { id: CategoryId; label: string; image: string; tagline: string }[] = [
  { id: "consoles", label: "Consoles", image: "/products/console-home.jpg", tagline: "Nova geração" },
  { id: "jogos", label: "Jogos", image: "/products/games-stack.jpg", tagline: "Lançamentos e clássicos" },
  { id: "controles", label: "Controles", image: "/products/controller.jpg", tagline: "Domine a partida" },
  { id: "acessorios", label: "Acessórios", image: "/products/headset.jpg", tagline: "Setup completo" },
  { id: "retro", label: "Retrô", image: "/products/console-retro.jpg", tagline: "Nostalgia raiz" },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  price: number; // cents
  oldPrice: number | null;
  image: string;
  condition: "Novo" | "Seminovo";
  badge: string | null;
  featured: boolean;
  description: string;
  specs: string[];
  stock: number;
};

// Example catalog for local development without a database.
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "playstation-5-slim",
    name: "PlayStation 5 Slim",
    category: "consoles",
    price: 379990,
    oldPrice: 419990,
    image: "/products/console-home.jpg",
    condition: "Novo",
    badge: "Mais vendido",
    featured: true,
    description:
      "Console de nova geração com SSD ultrarrápido, gráficos em 4K e controle sem fio com resposta tátil.",
    specs: ["SSD de 1TB", "Leitor de disco", "1 controle sem fio", "Garantia de 12 meses"],
    stock: 4,
  },
  {
    id: "nintendo-switch-oled",
    name: "Nintendo Switch OLED",
    category: "consoles",
    price: 229990,
    oldPrice: null,
    image: "/products/console-handheld.jpg",
    condition: "Novo",
    badge: "Portátil",
    featured: true,
    description: "Jogue na TV ou em qualquer lugar com a tela OLED de 7 polegadas e cores vibrantes.",
    specs: ['Tela OLED 7"', "64GB de memória", "Joy-Con neon", "Base para TV"],
    stock: 3,
  },
  {
    id: "super-nintendo-classico",
    name: "Super Nintendo Clássico",
    category: "retro",
    price: 89990,
    oldPrice: null,
    image: "/products/console-retro.jpg",
    condition: "Seminovo",
    badge: "Raridade",
    featured: true,
    description:
      "O clássico dos anos 90 revisado e testado, pronto para reviver as melhores tardes de jogatina.",
    specs: ["Testado e revisado", "1 controle original", "Cabos inclusos", "Garantia de 3 meses"],
    stock: 1,
  },
  {
    id: "controle-pro-sem-fio",
    name: "Controle Pro Sem Fio",
    category: "controles",
    price: 34990,
    oldPrice: 39990,
    image: "/products/controller.jpg",
    condition: "Novo",
    badge: null,
    featured: true,
    description:
      "Pegada confortável, gatilhos precisos e bateria para longas sessões. Compatível com PC e consoles.",
    specs: ["Bluetooth e cabo USB-C", "Bateria de até 30h", "Vibração dupla", "Compatível com PC"],
    stock: 10,
  },
  {
    id: "headset-gamer-rgb",
    name: "Headset Gamer RGB",
    category: "acessorios",
    price: 24990,
    oldPrice: null,
    image: "/products/headset.jpg",
    condition: "Novo",
    badge: "Novidade",
    featured: true,
    description:
      "Som surround imersivo, microfone com cancelamento de ruído e iluminação RGB que dá vida ao setup.",
    specs: ["Som surround 7.1", "Microfone removível", "Iluminação RGB", "Suporte incluso"],
    stock: 6,
  },
  {
    id: "ea-sports-fc-26-ps5",
    name: "EA Sports FC 26 — PS5",
    category: "jogos",
    price: 29990,
    oldPrice: null,
    image: "/products/games-stack.jpg",
    condition: "Novo",
    badge: "Lançamento",
    featured: true,
    description: "O futebol mais jogado do mundo com novos modos de carreira e Ultimate Team.",
    specs: ["Mídia física", "Português", "1 a 4 jogadores", "Online"],
    stock: 8,
  },
  {
    id: "mario-kart-8-deluxe",
    name: "Mario Kart 8 Deluxe — Switch",
    category: "jogos",
    price: 27990,
    oldPrice: null,
    image: "/products/games-stack.jpg",
    condition: "Novo",
    badge: null,
    featured: false,
    description: "Corridas para jogar com a família e os amigos, com todas as pistas e personagens.",
    specs: ["Mídia física", "Até 4 na mesma tela", "Online", "Livre para todos"],
    stock: 5,
  },
  {
    id: "gta-v-ps5",
    name: "GTA V — PS5",
    category: "jogos",
    price: 14990,
    oldPrice: 19990,
    image: "/products/games-stack.jpg",
    condition: "Seminovo",
    badge: null,
    featured: false,
    description: "Mundo aberto gigante com modo história e GTA Online. Disco revisado, sem riscos.",
    specs: ["Mídia física", "Legendas em português", "Online", "Disco revisado"],
    stock: 2,
  },
  {
    id: "controle-retro-usb",
    name: "Controle Retrô USB",
    category: "retro",
    price: 6990,
    oldPrice: null,
    image: "/products/console-retro.jpg",
    condition: "Novo",
    badge: null,
    featured: false,
    description: "Controle no estilo clássico para jogar seus retrôs favoritos no PC ou em mini consoles.",
    specs: ["Conexão USB", "Plug and play", "Cabo de 1,8m", "Compatível com PC"],
    stock: 15,
  },
];

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
