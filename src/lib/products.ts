import consoleHome from "@/assets/console-home.jpg";
import consoleHandheld from "@/assets/console-handheld.jpg";
import consoleRetro from "@/assets/console-retro.jpg";
import controller from "@/assets/controller.jpg";
import gamesStack from "@/assets/games-stack.jpg";
import headset from "@/assets/headset.jpg";

export type CategoryId = "consoles" | "jogos" | "controles" | "acessorios" | "retro";

export const CATEGORIES: { id: CategoryId; label: string; image: string; tagline: string }[] = [
  { id: "consoles", label: "Consoles", image: consoleHome, tagline: "Nova geração" },
  { id: "jogos", label: "Jogos", image: gamesStack, tagline: "Lançamentos e clássicos" },
  { id: "controles", label: "Controles", image: controller, tagline: "Domine a partida" },
  { id: "acessorios", label: "Acessórios", image: headset, tagline: "Setup completo" },
  { id: "retro", label: "Retrô", image: consoleRetro, tagline: "Nostalgia raiz" },
];

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  price: number; // cents
  oldPrice?: number;
  image: string;
  condition: "Novo" | "Seminovo";
  badge?: string;
  featured?: boolean;
  description: string;
  specs: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "playstation-5-slim",
    name: "PlayStation 5 Slim",
    category: "consoles",
    price: 379990,
    oldPrice: 419990,
    image: consoleHome,
    condition: "Novo",
    badge: "Mais vendido",
    featured: true,
    description:
      "Console de nova geração com SSD ultrarrápido, gráficos em 4K e controle sem fio com resposta tátil.",
    specs: ["SSD de 1TB", "Leitor de disco", "1 controle sem fio", "Garantia de 12 meses"],
  },
  {
    id: "nintendo-switch-oled",
    name: "Nintendo Switch OLED",
    category: "consoles",
    price: 229990,
    image: consoleHandheld,
    condition: "Novo",
    badge: "Portátil",
    featured: true,
    description:
      "Jogue na TV ou em qualquer lugar com a tela OLED de 7 polegadas e cores vibrantes.",
    specs: ["Tela OLED 7\"", "64GB de memória", "Joy-Con neon", "Base para TV"],
  },
  {
    id: "super-nintendo-classico",
    name: "Super Nintendo Clássico",
    category: "retro",
    price: 89990,
    image: consoleRetro,
    condition: "Seminovo",
    badge: "Raridade",
    featured: true,
    description:
      "O clássico dos anos 90 revisado e testado, pronto para reviver as melhores tardes de jogatina.",
    specs: ["Testado e revisado", "1 controle original", "Cabos inclusos", "Garantia de 3 meses"],
  },
  {
    id: "controle-pro-sem-fio",
    name: "Controle Pro Sem Fio",
    category: "controles",
    price: 34990,
    oldPrice: 39990,
    image: controller,
    condition: "Novo",
    featured: true,
    description:
      "Pegada confortável, gatilhos precisos e bateria para longas sessões. Compatível com PC e consoles.",
    specs: ["Bluetooth e cabo USB-C", "Bateria de até 30h", "Vibração dupla", "Compatível com PC"],
  },
  {
    id: "headset-gamer-rgb",
    name: "Headset Gamer RGB",
    category: "acessorios",
    price: 24990,
    image: headset,
    condition: "Novo",
    badge: "Novidade",
    featured: true,
    description:
      "Som surround imersivo, microfone com cancelamento de ruído e iluminação RGB que dá vida ao setup.",
    specs: ["Som surround 7.1", "Microfone removível", "Iluminação RGB", "Suporte incluso"],
  },
  {
    id: "ea-sports-fc-26-ps5",
    name: "EA Sports FC 26 — PS5",
    category: "jogos",
    price: 29990,
    image: gamesStack,
    condition: "Novo",
    badge: "Lançamento",
    featured: true,
    description: "O futebol mais jogado do mundo com novos modos de carreira e Ultimate Team.",
    specs: ["Mídia física", "Português", "1 a 4 jogadores", "Online"],
  },
  {
    id: "mario-kart-8-deluxe",
    name: "Mario Kart 8 Deluxe — Switch",
    category: "jogos",
    price: 27990,
    image: gamesStack,
    condition: "Novo",
    description: "Corridas para jogar com a família e os amigos, com todas as pistas e personagens.",
    specs: ["Mídia física", "Até 4 na mesma tela", "Online", "Livre para todos"],
  },
  {
    id: "gta-v-ps5",
    name: "GTA V — PS5",
    category: "jogos",
    price: 14990,
    oldPrice: 19990,
    image: gamesStack,
    condition: "Seminovo",
    description: "Mundo aberto gigante com modo história e GTA Online. Disco revisado, sem riscos.",
    specs: ["Mídia física", "Legendas em português", "Online", "Disco revisado"],
  },
  {
    id: "controle-retro-usb",
    name: "Controle Retrô USB",
    category: "retro",
    price: 6990,
    image: consoleRetro,
    condition: "Novo",
    description: "Controle no estilo clássico para jogar seus retrôs favoritos no PC ou em mini consoles.",
    specs: ["Conexão USB", "Plug and play", "Cabo de 1,8m", "Compatível com PC"],
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
