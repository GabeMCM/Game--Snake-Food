# 🐍 Snake Food: Reforged

> **Você não é a cobra. Você é a comida.**

Um jogo de sobrevivência estratégica onde você inverte o papel clássico do Snake. Em vez de controlar a cobra, você **é o alimento** — e sua única missão é não ser devorado.

Use sua habilidade principal, o **SWAP**, para trocar de posição com uma isca e confundir a cobra. Acumule moedas, compre habilidades poderosas e sobreviva o máximo que puder.

---

## 🎮 Gameplay

### O Conceito
No Snake clássico, você controla a cobra e come a comida. Aqui, **a perspectiva é invertida**:

- 🔵 **Você** é o ponto azul (a comida real)
- ⚪ **Isca** é o ponto branco (comida falsa)
- 🟢 **Cobra** é controlada por IA com pathfinding toroidal

### Mecânica Principal: SWAP ↔
Toque em qualquer lugar da tela para **trocar instantaneamente de posição** com a isca. Use isso para:
- Fugir quando a cobra está perto demais
- Enganar a IA fazendo-a perseguir a isca
- Reposicionar-se estrategicamente no tabuleiro

### Sistema de Economia
| Recurso | Como obter |
|---------|-----------|
| 🪙 Moedas por isca | +1 moeda cada vez que a cobra come a isca |
| 🪙 Moedas por tempo | +1 moeda a cada 10 segundos sobrevividos |
| 🪙 Moedas dobradas | Ver anúncio no fim da partida (1x por jogo) |

### Mundo Toroidal
O tabuleiro é um **toro** — sem paredes. A cobra e os itens que saem por um lado reaparecem pelo lado oposto. A IA da cobra entende isso e sempre calcula o **caminho mais curto**, incluindo os atalhos pelas bordas.

---

## 🛡️ Habilidades

Você pode comprar, evoluir e equipar **até 2 habilidades** por partida na loja. Todas possuem **tempo de cast de 0.8s** antes de ativar.

### 👻 Invisibilidade
| Atributo | Valor (NV 1) | Escala por NV |
|----------|-------------|---------------|
| Custo | 50 🪙 | ×(NV+1) |
| Duração | 5s | +1s/NV |
| Cooldown | 15s | -1s/NV (mín 5s) |
| Efeito | A cobra ignora você e persegue apenas a isca ||

Ao ativar, seu ponto fica semi-transparente e a IA da cobra **não te enxerga mais**. Ela passa a perseguir somente a isca branca. Perfeito para ganhar tempo ou reposicionar com segurança.

---

### ❄️ Aura de Gelo
| Atributo | Valor (NV 1) | Escala por NV |
|----------|-------------|---------------|
| Custo | 80 🪙 | ×(NV+1) |
| Duração | 5s | +1s/NV |
| Cooldown | 20s | -1s/NV (mín 10s) |
| Efeito | Cobra fica 50% mais lenta quando perto de você ||

Cria uma aura visual de gelo ao seu redor (raio de 10 tiles). Quando a cabeça da cobra entra na zona, sua velocidade cai pela metade. Ideal para situações de perseguição onde o SWAP sozinho não basta.

---

---

### 💉 Sacrifício
| Atributo | Valor (NV 1) | Escala por NV |
|----------|-------------|---------------|
| Custo | 150 🪙 | ×(NV+1) |
| Duração | 5s | fixa |
| Cooldown | 30s | -2s/NV (mín 15s) |
| Cura | +30 HP | +5 HP/NV |
| Efeito | Próximo toque da cobra: ela encolhe e você recupera HP ||

---

### 🧱 Bloqueio Fantasma
| Atributo | Valor (NV 1) | Escala por NV |
|----------|-------------|---------------|
| Custo | 70 🪙 | ×(NV+1) |
| Duração | 8s | +1s/NV |
| Cooldown | 25s | -2s/NV (mín 10s) |
| Efeito | Cria blocos sólidos que apenas a cobra respeita ||

Gera obstáculos aleatórios pelo mapa que forçam a cobra a recalcular a rota (pathfinding). Upgrades aumentam o tempo de duração e a quantidade de blocos spawnados.

---

### 👥 Clones
| Atributo | Valor (NV 1) | Escala por NV |
|----------|-------------|---------------|
| Custo | 100 🪙 | ×(NV+1) |
| Duração | 10s | +1s/NV |
| Cooldown | 30s | -2s/NV (mín 15s) |
| Efeito | Cria iscas falsas (clones) para despistar a cobra ||

Cria cópias da isca que atraem a cobra. Se a habilidade **Invisibilidade** estiver ativa simultaneamente, a cobra prioriza os clones cegamente. Quando a cobra come um clone, ela cresce normalmente mas você não ganha moedas.

---

### 🪙 Zona de Ganho
| Atributo | Valor (NV 1) | Escala por NV |
|----------|-------------|---------------|
| Custo | 120 🪙 | ×(NV+1) |
| Duração | 12s | +2s/NV |
| Cooldown | 40s | -3s/NV (mín 20s) |
| Efeito | 3x moedas na área, mas acelera a cobra exponencialmente ||

Cria uma zona quadrada no grid ao redor do jogador. Coletar a isca dentro desta zona triplica o ganho de moedas. No entanto, se o jogador estiver dentro da zona, a cobra dobra de velocidade para equilibrar o risco.

---

### 🧨 Isca Explosiva
| Atributo | Valor (NV 1) | Escala por NV |
|----------|-------------|---------------|
| Custo | 90 🪙 | ×(NV+1) |
| Duração | 15s | Janela para ser comida |
| Cooldown | 35s | -2s/NV (mín 15s) |
| Efeito | Stun de 3s na cobra e lentidão persistente ||

Transforma a isca atual em uma **TNT**. Se a cobra comê-la, ela fica paralisada (stun) por 3 segundos com efeito visual de "glitch". Upgrades adicionam um efeito de lentidão (slow) permanente à cobra que dura até o fim da rodada (reset).

A habilidade mais arriscada. Ativa um estado onde, se a cobra te tocar durante a janela de 5s, **ela perde um segmento** do corpo e **você recupera HP**. Seu ponto fica avermelhado enquanto o efeito está ativo. Se a cobra não te tocar no tempo, o efeito é desperdiçado.

---

## ❤️ Vida

- **Vida inicial**: 100 HP
- **Dano por toque da cobra**: 20 HP
- **Upgrade na loja**: +10 HP por compra
  - Custo: `20 + (HP_atual - 100) × 2` moedas
  - Exemplo: 100→110 HP custa 20 🪙, 200→210 HP custa 220 🪙

Quando a vida chega a 0, o jogo termina.

---

## 🏗️ Arquitetura Técnica

### Stack
| Tecnologia | Uso |
|-----------|-----|
| **Deno** | Runtime JavaScript/TypeScript |
| **Vite** | Build tool e dev server |
| **React 18** | Interface (menus, HUD, overlays) |
| **PixiJS 8** | Renderização do canvas do jogo (grid, cobra, jogador) |
| **Tailwind CSS 4** | Estilização responsiva mobile-first |
| **Framer Motion** | Animações (disponível, uso futuro) |
| **vite-plugin-pwa** | Progressive Web App (instalável) |

### Separação Canvas vs UI
```
┌─────────────────────────────────┐
│        HTML (React + Tailwind)  │
│  ┌───────────────────────────┐  │
│  │   HUD: Moedas + Tempo     │  │  ← HTML overlay
│  ├───────────────────────────┤  │
│  │                           │  │
│  │    Canvas (PixiJS)        │  │  ← Só renderiza o jogo
│  │    640×640 grid           │  │
│  │                           │  │
│  ├───────────────────────────┤  │
│  │   HP Bar + Skill Buttons  │  │  ← HTML overlay
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

O Canvas (PixiJS) renderiza **exclusivamente** o jogo: grid, cobra, jogador e efeitos visuais. Toda a interface (menus, HUD, barra de vida, botões de habilidade) é **HTML puro** posicionado acima do canvas, garantindo responsividade perfeita em qualquer dispositivo.

### Estrutura de Arquivos
```
src/
├── main.tsx              # Entry point + viewport fix iOS
├── index.css             # Tailwind import + design tokens
├── App.tsx               # State management + routing
├── App.css               # Animações custom (neon, glass)
├── components/
│   ├── GameView.tsx       # Wrapper React ↔ PixiJS
│   ├── MainMenu.tsx       # Menu principal
│   ├── SkillsMenu.tsx     # Loja de habilidades
│   └── AdSlot.tsx         # Componente de anúncios
├── game/
│   └── GameEngine.ts      # Motor do jogo (IA, física, render)
└── utils/
    └── persistence.ts     # Save/load via localStorage
```

### Persistência
O progresso do jogador é salvo automaticamente via `localStorage`:
- Moedas acumuladas
- Vida máxima atual
- Habilidades desbloqueadas e seus níveis
- Habilidades equipadas (loadout)
- Melhor tempo de sobrevivência

---

## 🚀 Como Rodar

### Pré-requisitos
- [Deno](https://deno.land/) instalado

### Desenvolvimento
```bash
deno task dev
```
O servidor abre em `http://localhost:5173/` com hot-reload.

### Build de Produção
```bash
deno task build
```
Gera os arquivos otimizados em `dist/`.

### Preview do Build
```bash
deno task preview
```

---

## 📱 PWA

O jogo é um **Progressive Web App**. Em dispositivos mobile, pode ser instalado na tela inicial e funciona como um app nativo:
- Modo `standalone` (sem barra do navegador)
- Orientação otimizada para portrait
- Tema escuro nativo (`#0a0a14`)

---

## 🎨 Design

### Paleta de Cores
| Cor | Hex | Uso |
|-----|-----|-----|
| Background | `#080816` | Fundo principal |
| Neon Blue | `#00a0ff` | Jogador, destaques |
| Neon Green | `#00ff82` | HP bar, botão play, cobra (cabeça) |
| Gold | `#ffd700` | Moedas |
| Red | `#ff3c50` | Dano, sacrifício |
| Cyan | `#00E1FF` | Aura de gelo |
| Purple | `#A78BFA` | Invisibilidade |

### Efeitos Visuais
- **Glassmorphism**: Painéis semi-transparentes com blur
- **Neon Glow**: Bordas e sombras com brilho colorido
- **Gradient Title**: Título com gradiente animado cyan→green→blue
- **Micro-animações**: Fade-in, scale, pulse nos elementos interativos

---

## 📄 Licença

Projeto privado. Todos os direitos reservados.
