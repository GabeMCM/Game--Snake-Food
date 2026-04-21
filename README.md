# 🐍 Snake Food: Reforged
### "Você não é a cobra. Você é a comida."

**Snake Food: Reforged** é um jogo de sobrevivência estratégica que subverte o gênero clássico. Em um tabuleiro sem bordas (toroidal), você assume o papel do alimento em uma luta desesperada para não ser devorado por uma cobra implacável controlada por IA.

---

## 🎯 O Conceito Invertido
Diferente do Snake tradicional, aqui a perspectiva é o seu maior desafio:
- 🔵 **Você é a Comida Real**: O alvo principal da cobra.
- ⚪ **Iscas Falsas**: Pontos brancos que surgem no mapa para distrair a IA.
- 🟢 **IA Toroidal**: A cobra calcula o caminho mais curto usando atalhos pelas bordas (geometria de toro), tornando a fuga um quebra-cabeça constante.

---

## ⚡ Mecânica Principal: SWAP ↔️
Sua peça central de sobrevivência. Ao tocar na tela, você **troca instantaneamente de posição** com a isca mais próxima. 
- Use para escapar de botes iminentes.
- Reposicione a cobra para longe de você.
- Gerencie o risco e a recompensa em milissegundos.

---

## 🛠️ Sistema de Habilidades (Loadout)
O jogo possui uma loja progressiva onde você pode equipar até **2 habilidades ativas** simultaneamente. Cada habilidade possui níveis de evolução (Graus) e mecânicas únicas:

| Habilidade | Efeito Principal |
|:---:|:---|
| **👻 Invisibilidade** | A IA perde o seu rastro e persegue apenas as iscas falsas. |
| **❄️ Aura de Gelo** | Reduz drasticamente a velocidade da cobra ao entrar no seu raio de ação. |
| **💉 Sacrifício** | Permite que a cobra coma um segmento dela mesma se te tocar, curando você. |
| **🧱 Bloqueio Fantasma** | Cria barreiras que forçam a IA a recalcular rotas complexas. |
| **👥 Clones** | Gera múltiplas iscas temporárias para saturar a busca da cobra. |
| **🧨 Isca Explosiva** | Transforma a isca em uma bomba que atordoa a cobra se for ingerida. |
| **🪙 Zona de Ganho** | Triplica moedas em uma área, mas acelera a cobra exponencialmente. |

---

## 💠 Design System: SF_UI
O projeto utiliza um sistema visual proprietário chamado **SF_UI**, focado em estética *Cyber-Noir*:
- **Rounded-3XL**: Cantos extremamente arredondados para um feeling premium.
- **Neon Glows**: Feedback visual através de brilhos externos (Primary, Accent, Danger).
- **Glassmorphism**: Menus com transparência e desfoque de fundo (Backdrop Blur).
- **Performance**: Interface React 100% otimizada rodando sobre um canvas PixiJS v8.

---

## 🚀 Arquitetura Técnica
O jogo foi reconstruído para máxima performance e portabilidade moderna:

- **Runtime**: [Deno 2.0](https://deno.com/) (Seguro e ultra-rápido)
- **Engine de Render**: [PixiJS 8](https://pixijs.com/) (WebGPU/WebGL nativo)
- **Framework UI**: [React 18](https://react.dev/) + [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend**: [Supabase](https://supabase.com/) (Autenticação e Rankings Globais)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **PWA**: Instalável em disp. móveis com suporte offline básico.

---

## 📦 Como Rodar Localmente

Certifique-se de ter o **Deno 2.x** instalado.

1. **Instalar dependências:**
   ```bash
   deno install
   ```

2. **Rodar em desenvolvimento:**
   ```bash
   deno task dev
   ```

3. **Gerar build de produção:**
   ```bash
   deno task build
   ```

---

## 🌐 Deploy
O projeto está configurado para deploy contínuo no **Vercel**. Ele utiliza as variáveis de ambiente do Supabase e redirecionamentos dinâmicos para suportar autenticação em qualquer domínio ou rede local.

---

## 📄 Licença
Projeto privado de GabeMCM. Todos os direitos reservados.
