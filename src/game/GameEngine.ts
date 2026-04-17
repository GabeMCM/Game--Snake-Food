import { Application, Container, Graphics, Point, Ticker, Rectangle, ColorMatrixFilter } from 'pixi.js'
import { PlayerData } from '../utils/persistence'
import { THEMES } from '../utils/themes'

export const GAME_WIDTH = 640
export const GAME_HEIGHT = 640
export const GRID_SIZE = 20
export const SNAKE_SPEED = 10 // Mais quadradinhos = cobra parece mais rápida

export interface GameProps {
  onCoinCollect: (amt: number) => void
  onHit: (dmg: number) => void
  onHeal: (amt: number) => void
  onTimeUpdate: (time: number) => void
  onFuryUpdate: (progress: number) => void
  onFuryActiveChange: (active: boolean, mode: string) => void
  health: number
  maxHealth: number
  appearance: PlayerData['settings']
  furyStats: { level: number }
  coinStats: { level: number }
}

export class GameEngine {
  private app: Application
  public props: GameProps
  private container: Container

  // Estado do Jogo
  private snake: Point[] = []
  private direction: Point = new Point(0, -1)
  private playerPos: Point = new Point(0, 0)
  private fakePos: Point = new Point(0, 0)
  private fakePos2: Point = new Point(0, 0)

  // Gráficos
  private snakeGraphics: Graphics[] = []
  private playerGraphic: Graphics
  private fakeGraphic: Graphics
  private fakeGraphic2: Graphics
  private gridGraphics: Graphics
  private bgGraphics: Graphics
  private bgContainer: Container
  private frostAuraGraphic: Graphics

  // De controle
  private lastMoveTime: number = 0
  private startTime: number = 0
  private isRunning: boolean = false
  private foodIndices: number[] = [] // Rastreia o progresso da comida engolida pelo corpo
  private isMouthOpen: boolean = false
  private playerRotation: number = 0 // Rotação contínua para o player triangulo

  // Habilidades
  private isInvisible: boolean = false
  private invisTimer: number = 0
  private isFrostAuraActive: boolean = false
  private readonly AURA_RANGE = 200 // Reduzido proporcionalmente (10 blocos de 20px)

  private isIntangible: boolean = false
  private intangibleTimer: number = 0

  private isSacrificeActive: boolean = false
  private sacrificeTimer: number = 0
  private sacrificeHealAmt: number = 30

  // NOVAS Habilidades (Reforçado)
  private phantomBlocks: Point[] = []
  private blockTimer: number = 0
  private blockGraphic: Graphics

  private clones: Point[] = []
  private cloneTimer: number = 0
  private cloneGraphics: Graphics[] = []

  private isGainZoneActive: boolean = false
  private gainZoneTimer: number = 0
  private gainZoneRadius: number = 5
  private gainZoneGraphic: Graphics

  private isExplosiveBaitActive: boolean = false
  private explosiveBaitTimer: number = 0
  private isStunned: boolean = false
  private stunTimer: number = 0
  private slowMultiplier: number = 1.0
  private explosiveBaitSlowAmt: number = 0
  
  // FÚRIA
  private furyPoints: number = 0
  private maxFuryPoints: number = 10
  private passiveFuryTimer: number = 0
  private isFuryActive: boolean = false
  private furyTimer: number = 0
  private furyComplication: 'NONE' | 'SMALL_BOARD' | 'MIRROR' | 'ILLUSION' = 'NONE'
  private furyMoveCount: number = 0
  private furyFilter: ColorMatrixFilter = new ColorMatrixFilter()
  private secondarySnake: Point[] = []
  private secondarySnakeGraphics: Graphics[] = []
  private secondaryDirection: Point = new Point(0, -1)
  private furySafeZone: Rectangle = new Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT)
  private furyZoneGraphic: Graphics

  constructor(app: Application, props: GameProps) {
    this.app = app
    this.props = props
    this.container = new Container()
    this.app.stage.addChild(this.container)

    // Camada de fundo (Atrás de tudo)
    this.bgContainer = new Container()
    this.container.addChild(this.bgContainer)
    this.bgGraphics = new Graphics()
    this.bgContainer.addChild(this.bgGraphics)

    // Grade de fundo (opaca/fraca)
    this.gridGraphics = new Graphics()
    this.drawGrid()
    this.container.addChild(this.gridGraphics)

    // Gráfico da Aura de Gelo
    this.frostAuraGraphic = new Graphics()
    this.container.addChild(this.frostAuraGraphic)

    // Inicializar Gráficos de Comida
    this.playerGraphic = new Graphics()
    this.fakeGraphic = new Graphics()
    this.fakeGraphic2 = new Graphics()

    this.container.addChild(this.fakeGraphic)
    this.container.addChild(this.fakeGraphic2)
    this.container.addChild(this.playerGraphic)

    // Inicializar Graphics das novas skills
    this.blockGraphic = new Graphics()
    this.container.addChild(this.blockGraphic)

    this.gainZoneGraphic = new Graphics()
    this.container.addChild(this.gainZoneGraphic)

    // Gráfico de complicação de Fúria
    this.furyZoneGraphic = new Graphics()
    this.container.addChild(this.furyZoneGraphic)

    // Clones usam um array de graphics para gerenciar múltiplos
    this.cloneGraphics = []

    // Interatividade Local (Removida em favor do container React para maior compatibilidade)
    this.app.stage.eventMode = 'none'

    this.container.filters = []

    this.updateThemeSettings()
    this.reset()
  }

  public destroy() {
    this.stop()
    this.furyZoneGraphic.destroy()
    this.bgGraphics.destroy()
    this.gridGraphics.destroy()
    this.playerGraphic.destroy()
    this.fakeGraphic.destroy()
    this.fakeGraphic2.destroy()
    this.blockGraphic.destroy()
    this.gainZoneGraphic.destroy()
    this.frostAuraGraphic.destroy()
    this.snakeGraphics.forEach(g => g.destroy())
    this.cloneGraphics.forEach(g => g.destroy())
    this.secondarySnakeGraphics.forEach(g => g.destroy())
  }

  private updateThemeSettings() {
    const themeId = this.props.appearance.theme
    const theme = THEMES[themeId] || THEMES.neon
    const canvas = this.app.canvas as HTMLCanvasElement
    if (!canvas) return

    canvas.style.backgroundColor = theme.colors.bg

    // Sincronizar fundo do Renderer do Pixi (CRÍTICO para o tema Light funcionar)
    if (this.app.renderer) {
      this.app.renderer.background.color = theme.colors.engineBg;
    }

    // Limpar e preparar o fundo animado
    this.bgGraphics.clear()
  }

  public triggerSwap() {
    this.swapPositions()
  }

  public updateProps(props: GameProps) {
    const oldTheme = this.props.appearance.theme
    this.props = props
    if (oldTheme !== props.appearance.theme) {
      this.updateThemeSettings()
      this.drawGrid()
    }
    this.updateGraphics()
  }

  public activateInvisibility(durationMs: number) {
    this.isInvisible = true
    this.invisTimer = durationMs
    this.playerGraphic.alpha = 0.3
  }

  public toggleFrostAura(active: boolean) {
    this.isFrostAuraActive = active
    if (!active) {
      this.frostAuraGraphic.clear()
    }
  }

  public activateSacrifice(durationMs: number, healAmt: number = 30) {
    this.isSacrificeActive = true
    this.sacrificeTimer = durationMs
    this.sacrificeHealAmt = healAmt
    this.playerGraphic.tint = 0xFF3C50 // Avermelhado para indicar perigo/sacrifício
  }

  public activateIntangibility(durationMs: number) {
    this.isIntangible = true
    this.intangibleTimer = durationMs
    this.updateGraphics()
  }

  public activatePhantomBlock(durationMs: number, count: number) {
    this.phantomBlocks = []
    for (let i = 0; i < count; i++) {
      // Blocos aleatórios, mas não em cima da cobra ou player
      this.phantomBlocks.push(this.getRandomPos(false, this.playerPos, GRID_SIZE * 3))
    }
    this.blockTimer = durationMs
    this.drawObstacles()
  }

  public activateClones(durationMs: number, count: number) {
    // Limpar clones antigos
    this.cloneGraphics.forEach(g => g.destroy())
    this.cloneGraphics = []
    this.clones = []

    for (let i = 0; i < count; i++) {
      const pos = this.getRandomPos(false, this.playerPos, GRID_SIZE * 5)
      this.clones.push(pos)

      const g = new Graphics()
      this.container.addChild(g)
      this.cloneGraphics.push(g)
    }
    this.cloneTimer = durationMs
    this.drawClones()
  }

  public activateGainZone(durationMs: number, radius: number) {
    this.isGainZoneActive = true
    this.gainZoneTimer = durationMs
    this.gainZoneRadius = radius
    this.drawGainZone()
  }

  public activateExplosiveBait(durationMs: number, slowAmt: number) {
    this.isExplosiveBaitActive = true
    this.explosiveBaitTimer = durationMs
    this.explosiveBaitSlowAmt = slowAmt
    this.updateGraphics() // Redesenha para mostrar visual de TNT
  }

  private onFuryStart() {
    this.isFuryActive = true
    const level = this.props.furyStats.level
    
    // O consumo deve ser 1 ponto por 0,5 seg (500ms) basico
    this.furyTimer = this.furyPoints * (500 + (level * 20)) 
    this.furyPoints = 0
    this.furyMoveCount = 0

    // Escolher complicação baseada no nível. 
    // Se nível >= 5, excluímos 'NONE' para garantir que sempre ative algo como solicitado.
    const available: ('NONE' | 'SMALL_BOARD' | 'MIRROR' | 'ILLUSION')[] = []
    if (level >= 5) available.push('SMALL_BOARD')
    if (level >= 10) available.push('MIRROR')
    if (level >= 15) available.push('ILLUSION')
    
    if (available.length === 0) {
        this.furyComplication = 'NONE'
    } else {
        this.furyComplication = available[Math.floor(Math.random() * available.length)]
    }
    
    console.log(`🔥 FÚRIA ATIVADA! Complicação: ${this.furyComplication}`)

    if (this.furyComplication === 'SMALL_BOARD') {
        const padding = 2 * GRID_SIZE
        this.furySafeZone = new Rectangle(padding, padding, GAME_WIDTH - padding * 2, GAME_HEIGHT - padding * 2)
        
        // TELEPORTE OBRIGATÓRIO: Sempre remove o player do perigo ao encolher
        console.log("📍 Fúria Ativada! Teleportando player para zona segura central...")
        // Forçamos ele para uma área segura garantida (centro da SafeZone)
        this.playerPos = this.getRandomPos(false) 
        
        this.playerGraphic.x = this.playerPos.x
        this.playerGraphic.y = this.playerPos.y
        
        // Reposicionar isca também para garantir que caia dentro
        this.fakePos = this.getRandomPos(true, this.playerPos, 3 * GRID_SIZE)
        
        // Desenhar os muros uma única vez (evita flickering e processamento extra)
        this.drawFurySafeZone()
    } else {
        this.furySafeZone = new Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT)
        this.furyZoneGraphic.clear()
    }

    if (this.furyComplication === 'MIRROR') {
      this.startMirrorSnake()
      // TERCEIRA ISCA: Adicionar isca extra para compensar a segunda cobra
      this.fakePos2 = this.getRandomPos(true, this.playerPos, 3 * GRID_SIZE)
    }

    // Ativar Filtro
    this.container.filters = [this.furyFilter]
    this.props.onFuryActiveChange(true, this.furyComplication)
  }

  private startMirrorSnake() {
    // A cobra espelhada começa na posição espelhada da cabeça atual
    const head = this.snake[0]
    const mirrorPos = new Point(GAME_WIDTH - head.x - GRID_SIZE, head.y)
    this.secondarySnake = [mirrorPos]
    
    const g = new Graphics()
    this.container.addChild(g)
    this.secondarySnakeGraphics = [g]
  }

  private onFuryEnd() {
    this.isFuryActive = false
    this.furyTimer = 0
    // Limpar efeitos visuais da Fúria
    this.furyZoneGraphic.clear()
    this.furyComplication = 'NONE'
    this.furySafeZone = new Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT)
    this.container.filters = []
    this.container.alpha = 1
    
    this.secondarySnake = []
    this.secondarySnakeGraphics.forEach(g => g.destroy())
    this.secondarySnakeGraphics = []

    // Limpar terceira isca
    this.fakePos2 = new Point(0, 0)
    this.fakeGraphic2.clear()

    console.log("❄️ Fúria encerrada.")
    this.props.onFuryActiveChange(false, '')
    this.props.onFuryUpdate(0)
  }

  private startSecondarySnake() {
    // Inicia no canto oposto ou aleatório
    const pos = this.getRandomPos(true, this.snake[0], GRID_SIZE * 10)
    this.secondarySnake = [pos]
    
    const g = new Graphics()
    this.container.addChild(g)
    this.secondarySnakeGraphics = [g]
    this.secondaryDirection = new Point(0, 1) // Direção inicial diferente
  }

  public start() {
    this.isRunning = true
    this.startTime = performance.now()
    this.app.ticker.add(this.update)
  }

  public stop() {
    this.isRunning = false
    this.app.ticker.remove(this.update)
  }

  private reset() {
    // Posicionar no Centro (Cobra)
    const centerX = Math.floor(GAME_WIDTH / 2 / GRID_SIZE) * GRID_SIZE
    const centerY = Math.floor(GAME_HEIGHT / 2 / GRID_SIZE) * GRID_SIZE
    this.snake = [new Point(centerX, centerY)]

    // Limpar gráficos antigos da cobra
    this.snakeGraphics.forEach(g => g.destroy())
    this.snakeGraphics = []

    // Criar nova cabeça
    const head = new Graphics()
    this.container.addChild(head)
    this.snakeGraphics.push(head)

    // Reset de habilidades
    this.isInvisible = false
    this.invisTimer = 0
    this.isSacrificeActive = false
    this.sacrificeTimer = 0
    this.playerGraphic.alpha = 1
    this.playerGraphic.tint = 0xFFFFFF
    this.isIntangible = false
    this.intangibleTimer = 0

    // Reset de NOVAS habilidades
    this.phantomBlocks = []
    this.blockTimer = 0
    this.blockGraphic.clear()

    this.clones = []
    this.cloneTimer = 0
    this.cloneGraphics.forEach(g => g.destroy())
    this.cloneGraphics = []

    this.isGainZoneActive = false
    this.gainZoneTimer = 0
    this.gainZoneGraphic.clear()

    this.isExplosiveBaitActive = false
    this.explosiveBaitTimer = 0
    this.isStunned = false
    this.stunTimer = 0
    this.slowMultiplier = 1.0
    this.explosiveBaitSlowAmt = 0

    // Posicionar comida aleatória (longe do centro)
    this.playerPos = this.getRandomPos(true)
    // Garantir que a isca não nasça em cima nem muito perto do jogador (min 3 quadrados)
    this.fakePos = this.getRandomPos(true, this.playerPos, 3 * GRID_SIZE)
    this.fakePos2 = new Point(0, 0)
    this.fakeGraphic2.clear()

    this.updateGraphics()
  }

  private getRandomPos(excludeCenter = false, minDistFrom?: Point, minDist: number = 0): Point {
    // Agora respeita a zona segura da Fúria (Muros)
    const minX = (this.furySafeZone.x / GRID_SIZE) + 1
    const maxX = ((this.furySafeZone.x + this.furySafeZone.width) / GRID_SIZE) - 2
    const minY = (this.furySafeZone.y / GRID_SIZE) + 1
    const maxY = ((this.furySafeZone.y + this.furySafeZone.height) / GRID_SIZE) - 2

    let x, y, pos: Point
    let isOccupied = false

    let attempts = 0
    do {
      attempts++
      x = Math.floor(Math.random() * (maxX - minX + 1) + minX) * GRID_SIZE
      y = Math.floor(Math.random() * (maxY - minY + 1) + minY) * GRID_SIZE
      pos = new Point(x, y)

      // Verificar se a posição está ocupada pela cobra
      isOccupied = this.snake.some(part => part.equals(pos))
      if (isOccupied) continue

      // Verificar distância mínima de um ponto específico (ex: player)
      if (minDistFrom && attempts < 100) {
        const d = this.getToroidalDistance(pos, minDistFrom)
        if (d < minDist) continue
      }

      if (!excludeCenter) break

      const dx = Math.abs(x - GAME_WIDTH / 2)
      const dy = Math.abs(y - GAME_HEIGHT / 2)
      if (dx > GRID_SIZE * 5 || dy > GRID_SIZE * 5) break
    } while (attempts < 200)

    return pos
  }

  private swapPositions() {
    const temp = this.playerPos.clone()
    this.playerPos.copyFrom(this.fakePos)
    this.fakePos.copyFrom(temp)
    this.updateGraphics()
  }

  private update = (time: Ticker) => {
    if (!this.isRunning) return

    const now = performance.now()
    const dt = this.app.ticker.deltaMS
    this.props.onTimeUpdate((now - this.startTime) / 1000)

    // Gerenciar NOVAS Habilidades
    if (this.blockTimer > 0) {
      this.blockTimer -= dt
      if (this.blockTimer <= 0) {
        this.phantomBlocks = []
        this.blockGraphic.clear()
      }
    }

    if (this.cloneTimer > 0) {
      this.cloneTimer -= dt
      if (this.cloneTimer <= 0) {
        this.clones = []
        this.cloneGraphics.forEach(g => g.destroy())
        this.cloneGraphics = []
      }
    }

    if (this.isGainZoneActive) {
      this.gainZoneTimer -= dt
      if (this.gainZoneTimer <= 0) {
        this.isGainZoneActive = false
        this.gainZoneGraphic.clear()
      } else {
        this.drawGainZone()
      }
    }

    if (this.isExplosiveBaitActive) {
      this.explosiveBaitTimer -= dt
      if (this.explosiveBaitTimer <= 0) {
        this.isExplosiveBaitActive = false
        this.updateGraphics()
      }
    }

    if (this.isStunned) {
      this.stunTimer -= dt
      if (this.stunTimer <= 0) {
        this.isStunned = false
        this.updateGraphics()
      }
    }

    // Gerenciar Invisibility e Sacrifice
    if (this.invisTimer > 0) {
      this.invisTimer -= dt
      if (this.invisTimer <= 0) {
        this.isInvisible = false
        this.playerGraphic.alpha = 1.0
      }
    }

    if (this.sacrificeTimer > 0) {
      this.sacrificeTimer -= dt
      if (this.sacrificeTimer <= 0) {
        this.isSacrificeActive = false
        this.playerGraphic.tint = 0xFFFFFF
      }
    }

    if (this.intangibleTimer > 0) {
      this.intangibleTimer -= dt
      if (this.intangibleTimer <= 0) {
        this.isIntangible = false
        this.updateGraphics()
      }
    }

    // Controle de velocidade da cobra
    let speedMult = 1.0 * this.slowMultiplier // Aplicar slow permanente (explosive bait)

    if (this.isFuryActive) {
      const level = (this.props.appearance as any).furyStats?.level || 1
      speedMult *= (1.2 + (level * 0.04))
    }

    if (this.isStunned) {
      speedMult = 0 // Cobra paralisada
    } else {
      // Aura de Gelo
      if (this.isFrostAuraActive) {
        const head = this.snake[0]
        const distToPlayer = this.getToroidalDistance(head, this.playerPos)
        if (distToPlayer < this.AURA_RANGE) {
          speedMult *= 0.5
        }
      }

      // Zona de Ganho (Acelera a cobra se o player estiver nela)
      if (this.isGainZoneActive) {
        const distToPlayer = this.getToroidalDistance(this.snake[0], this.playerPos)
        if (distToPlayer < this.gainZoneRadius * GRID_SIZE) {
          speedMult *= 2.0 // Cobra dobra de velocidade na zona
        }
      }

      // Animação da Boca: Abre se estiver perto de qualquer alvo (comida ou player)
      const target = this.getNearestTarget()
      const distToTarget = this.getToroidalDistance(this.snake[0], target)
      this.isMouthOpen = distToTarget < GRID_SIZE * 2.5

      // Rotação contínua do Player (Triângulo) - Mais lento conforme pedido
      this.playerRotation += 0.01

      // LÓGICA DE FÚRIA
      if (this.isFuryActive) {
        this.furyTimer -= dt
        if (this.furyTimer <= 0) {
          this.onFuryEnd()
        } else {
          // Piscar Inverso Intensivo (Blink rápido)
          // Usamos o seno para alternar entre 0 (normal) e 1 (invertido) rapidamente
          const blinkFreq = 15 // Ajuste para intensidade
          const intensity = Math.sin(now / 1000 * blinkFreq)
          if (intensity > 0) {
            this.furyFilter.negative(false)
          } else {
            this.furyFilter.reset()
          }
        }
      } else {
        // LÓGICA DE ACUMULAÇÃO DE FÚRIA (PONTOS)
        const level = (this.props.appearance as any).furyStats?.level || 1
        this.maxFuryPoints = 10 + (level - 1) * 2
        
        // Ganho Passivo: 1pt / 10s (Lvl 1) ou 2pt / 10s (Lvl 2+)
        this.passiveFuryTimer += dt
        const interval = 10000 // 10s
        if (this.passiveFuryTimer >= interval) {
          const pointsToGain = level >= 10 ? 2 : 1
          this.furyPoints = Math.min(this.maxFuryPoints, this.furyPoints + pointsToGain)
          this.passiveFuryTimer = 0
          this.props.onFuryUpdate((this.furyPoints / this.maxFuryPoints) * 100)
        }

        if (this.furyPoints >= this.maxFuryPoints) {
          this.onFuryStart()
        }
      }

      this.updateGraphics() // Forçar atualização constante para rotação suave
    }

    // Desenhar Fundo e Frost Aura se ativa
    this.drawBackground()
    if (this.isFrostAuraActive) {
      this.drawFrostAura()
    }
    if (this.isFuryActive && this.furyComplication === 'SMALL_BOARD') {
        this.drawFurySafeZone()
    }

    const moveInterval = 1000 / ((SNAKE_SPEED + this.snake.length * 0.2) * speedMult)
    if (speedMult > 0 && now - this.lastMoveTime > moveInterval) {
      this.moveSnake()
      this.lastMoveTime = now
    }
  }

  private drawFurySafeZone() {
    this.furyZoneGraphic.clear()
    const wallColor = 0xFF003C // Vermelho Predatório
    const thickness = 10
    
    // Desenha bordas grossas ao redor da zona segura
    // Usamos rect e stroke com alinhamento externo (1)
    this.furyZoneGraphic.rect(this.furySafeZone.x, this.furySafeZone.y, this.furySafeZone.width, this.furySafeZone.height)
    this.furyZoneGraphic.stroke({ width: thickness, color: wallColor, alpha: 0.8, alignment: 1 })
  }

  private drawBackground() {
    const theme = this.props.appearance.theme
    if (theme === 'sky') this.drawSky()
    else if (theme === 'universe') this.drawUniverse()
    else this.bgGraphics.clear()
  }

  private drawSky() {
    this.bgGraphics.clear()
    const t = performance.now() / 1000

    // Desenhar algumas nuvens estilizadas
    const clouds = [
      { x: 100, y: 150, s: 1.2, spd: 20 },
      { x: 400, y: 100, s: 0.8, spd: 35 },
      { x: 250, y: 450, s: 1.5, spd: 15 },
      { x: 550, y: 350, s: 1.0, spd: 25 },
      { x: 50, y: 550, s: 0.9, spd: 30 }
    ]

    clouds.forEach(c => {
      const dx = (c.x + t * c.spd) % (GAME_WIDTH + 150) - 100
      this.bgGraphics.circle(dx, c.y, 30 * c.s)
      this.bgGraphics.circle(dx + 25 * c.s, c.y - 10 * c.s, 25 * c.s)
      this.bgGraphics.circle(dx + 20 * c.s, c.y + 15 * c.s, 20 * c.s)
      this.bgGraphics.circle(dx + 45 * c.s, c.y + 5 * c.s, 28 * c.s)
    })
    this.bgGraphics.fill({ color: 0xFFFFFF, alpha: 0.4 })
  }

  private drawUniverse() {
    this.bgGraphics.clear()

    // Estrelas fixas simples
    const stars = [
      { x: 50, y: 50 }, { x: 150, y: 200 }, { x: 400, y: 100 }, { x: 550, y: 450 },
      { x: 100, y: 580 }, { x: 300, y: 350 }, { x: 450, y: 250 }, { x: 600, y: 50 }
    ]

    stars.forEach(s => {
      const blink = 0.5 + Math.sin(performance.now() / 500 + s.x) * 0.5
      this.bgGraphics.circle(s.x, s.y, 2)
      this.bgGraphics.fill({ color: 0xFFFFFF, alpha: blink * 0.8 })
    })

    // Nebulosa sutil
    this.bgGraphics.circle(320, 320, 200)
    this.bgGraphics.fill({ color: 0x440088, alpha: 0.05 })
  }

  private getNearestTarget(): Point {
    const head = this.snake[0]

    // Se estiver invisível, ignora o jogador. Se houver clones, foca neles antes da isca real.
    let targets: Point[] = []

    if (this.isInvisible) {
      targets = this.clones.length > 0 ? [...this.clones] : [this.fakePos]
    } else {
      targets = [this.playerPos, this.fakePos, ...this.clones]
    }

    return targets.reduce((prev, curr) => {
      const distPrev = this.getToroidalDistance(head, prev)
      const distCurr = this.getToroidalDistance(head, curr)
      return distCurr < distPrev ? curr : prev
    })
  }

  private getFarthestTarget(head: Point): Point {
    let targets = [this.playerPos, this.fakePos, ...this.clones]
    if (this.isInvisible) targets = [this.fakePos, ...this.clones]

    return targets.reduce((prev, curr) => {
      const distPrev = this.getToroidalDistance(head, prev)
      const distCurr = this.getToroidalDistance(head, curr)
      return distCurr > distPrev ? curr : prev
    })
  }

  private getToroidalDistance(p1: Point, p2: Point): number {
    const dx = Math.min(Math.abs(p1.x - p2.x), GAME_WIDTH - Math.abs(p1.x - p2.x))
    const dy = Math.min(Math.abs(p1.y - p2.y), GAME_HEIGHT - Math.abs(p1.y - p2.y))
    return dx + dy
  }

  private calculateBestDirection(head: Point, target: Point): Point {
    const possibleDirs = [
      new Point(GRID_SIZE, 0), new Point(-GRID_SIZE, 0),
      new Point(0, GRID_SIZE), new Point(0, -GRID_SIZE)
    ]

    let bestDir = this.direction
    let minScore = Infinity

    for (const dir of possibleDirs) {
      const nextPos = new Point(
        (head.x + dir.x + GAME_WIDTH) % GAME_WIDTH,
        (head.y + dir.y + GAME_HEIGHT) % GAME_HEIGHT
      )

      // Evitar colisão com o próprio corpo
      if (this.snake.some(part => part.equals(nextPos))) continue

      // Evitar Bloqueios Fantasmas
      if (this.phantomBlocks.some(block => block.equals(nextPos))) continue

      const score = this.getToroidalDistance(nextPos, target)
      if (score < minScore) {
        minScore = score
        bestDir = dir
      }
    }
    return bestDir
  }

  private moveSnake() {
    if (this.isFuryActive) {
        this.furyMoveCount++
        if (this.furyComplication === 'ILLUSION') {
            this.container.alpha = (this.furyMoveCount % 3 === 0) ? 0.3 : 1.0
        }
    }
    const head = this.snake[0]

    // IA Avançada: Perseguição Toroidal e Evasão de Próprio Corpo
    const target = this.getNearestTarget()
    this.direction = this.calculateBestDirection(head, target)

    // Calcular nova posição com wrap-around
    let newX = head.x + this.direction.x
    let newY = head.y + this.direction.y

    if (newX < 0) newX = GAME_WIDTH - GRID_SIZE
    if (newX >= GAME_WIDTH) newX = 0
    if (newY < 0) newY = GAME_HEIGHT - GRID_SIZE
    if (newY >= GAME_HEIGHT) newY = 0

    const newHead = new Point(newX, newY)

    // Check death by Small Board complication
    if (this.isFuryActive && this.furyComplication === 'SMALL_BOARD') {
        if (!this.furySafeZone.contains(newHead.x + 1, newHead.y + 1)) {
            this.props.onHit(100)
            this.onFuryEnd()
            this.reset()
            return
        }
    }

    // Movimento da cobra secundária (FÚRIA MIRROR)
    if (this.isFuryActive && this.furyComplication === 'MIRROR') {
      this.moveMirrorSnake()
    }

    // Verificações de Colisão
    if (newHead.equals(this.playerPos)) {
      if (this.isSacrificeActive) {
        // SACRIFÍCIO: Cobra perde um gomo e player cura
        if (this.snake.length > 1) {
          const removedPart = this.snake.pop()
          const g = this.snakeGraphics.pop()
          if (g) g.destroy()
        }
        this.props.onHeal(this.sacrificeHealAmt)
        this.isSacrificeActive = false // Reseta após o toque
        this.playerGraphic.tint = 0xFFFFFF
        console.log(`💉 Sacrifício bem sucedido! Cobra encolheu e você curou ${this.sacrificeHealAmt} HP.`)
      } else if (this.isIntangible) {
        // Intangibilidade: cobra atravessa sem dano
        console.log("🌪️ Intangibilidade ativa: você foi atravessado!")
      } else {
        // Dano normal
        this.props.onHit(20)
        if (this.isFuryActive) this.onFuryEnd()
        this.reset()
        return
      }
    }

    // Verificar se cobra comeu um CLONE
    const cloneIndex = this.clones.findIndex(c => c.equals(newHead))
    if (cloneIndex !== -1) {
      this.clones.splice(cloneIndex, 1)
      const g = this.cloneGraphics.splice(cloneIndex, 1)[0]
      if (g) g.destroy()
      // Cobra cresce ao comer clone também (para ser punitivo)
      this.snake.unshift(newHead)
      this.foodIndices.push(0) // Iniciar animação de engolir
      const part = new Graphics()
      this.container.addChild(part)
      this.snakeGraphics.push(part)
      this.updateGraphics()
      return
    }

    this.snake.unshift(newHead)

    if (newHead.equals(this.fakePos) || newHead.equals(this.fakePos2)) {
      this.eatBait(newHead)
    } else {
      // Movimento normal: remove cauda
      this.snake.pop()
    }

    // Avançar progresso da comida pelo corpo a cada movimento
    this.foodIndices = this.foodIndices
      .map(i => i + 1)
      .filter(i => i < this.snake.length)

    this.updateGraphics()
  }

  private eatBait(pos: Point, isSecondary = false) {
    // Incrementar Fúria ao comer (1 ponto direto)
    if (!this.isFuryActive) {
      this.furyPoints = Math.min(this.maxFuryPoints, this.furyPoints + 1)
      this.props.onFuryUpdate((this.furyPoints / this.maxFuryPoints) * 100)
    }

    // Recompensa básica + multiplicador de fúria (Risco/Retorno)
    let reward = 1
    
    // Multiplicador Global de Moedas (Permanente)
    const coinLevel = this.props.coinStats.level
    const globalMult = 1.0 + (coinLevel - 1) * 0.15

    // Multiplicador de Fúria
    if (this.isFuryActive) {
        const furyLevel = (this.props.appearance as any).furyStats?.level || 1
        const furyMult = 1.5 + (furyLevel * 0.25) 
        reward *= furyMult
    }

    // Zona de Ganho (Acumula com outros multiplicadores)
    if (this.isGainZoneActive) {
      const distToPlayer = this.getToroidalDistance(pos, this.playerPos)
      if (distToPlayer < this.gainZoneRadius * GRID_SIZE) {
        reward *= 3
      }
    }

    // Aplicar multiplicador global e arredondar
    reward = Math.floor(reward * globalMult)

    this.props.onCoinCollect(reward)

    // Lógica de ISCA EXPLOSIVA
    if (this.isExplosiveBaitActive && pos.equals(this.fakePos)) {
      this.isStunned = true
      this.stunTimer = 3000 // 3 segundos de stun
      this.isExplosiveBaitActive = false
      this.explosiveBaitTimer = 0

      if (this.explosiveBaitSlowAmt > 0) {
        const slowFactor = 1 - (this.explosiveBaitSlowAmt / 100)
        this.slowMultiplier *= slowFactor
      }
      console.log("🧨 BUM! Isca explodiu. Cobra atordoada!")
    }

    // Crescimento
    if (pos.equals(this.fakePos) || pos.equals(this.fakePos2)) {
        if (isSecondary) {
            const part = new Graphics()
            this.container.addChild(part)
            this.secondarySnakeGraphics.push(part)
        } else {
            this.foodIndices.push(0)
            const part = new Graphics()
            this.container.addChild(part)
            this.snakeGraphics.push(part)
        }
        
        // Reposicionar a isca correta
        if (pos.equals(this.fakePos)) {
            this.fakePos = this.getRandomPos(true, this.playerPos, 3 * GRID_SIZE)
        } else {
            this.fakePos2 = this.getRandomPos(true, this.playerPos, 3 * GRID_SIZE)
        }
    }
  }

  private moveMirrorSnake() {
    // A cabeça secundária espelha a cabeça primária
    // E o corpo secundário cresce conforme a primária cresce
    const primaryHead = this.snake[0]
    const mirrorX = GAME_WIDTH - primaryHead.x - GRID_SIZE
    const newHead = new Point(mirrorX, primaryHead.y)

    this.secondarySnake.unshift(newHead)
    
    // Sincronizar tamanho
    while (this.secondarySnake.length > this.snake.length) {
        this.secondarySnake.pop()
    }
    while (this.secondarySnake.length < this.snake.length) {
        const last = this.secondarySnake[this.secondarySnake.length-1]
        this.secondarySnake.push(new Point(last.x, last.y))
        const g = new Graphics()
        this.container.addChild(g)
        this.secondarySnakeGraphics.push(g)
    }

    // Check collision with player
    if (newHead.equals(this.playerPos) && !this.isInvisible && !this.isIntangible) {
      this.props.onHit(20)
      this.onFuryEnd()
      this.reset()
      return
    }
  }

  private handleSideSweepCollision() {
    // Qualquer gomo da cobra que tocar no player causa dano
    if (!this.isInvisible && !this.isIntangible) {
        const allSnakeParts = [...this.snake, ...this.secondarySnake]
        if (allSnakeParts.some(p => p.equals(this.playerPos))) {
            this.props.onHit(20)
            this.onFuryEnd()
            this.reset()
            return
        }
    }

    // Qualquer gomo da cobra que tocar na isca a consome
    if (this.snake.some(p => p.equals(this.fakePos)) || 
        this.secondarySnake.some(p => p.equals(this.fakePos))) {
        this.eatBait(this.fakePos)
    }
    if (this.isFuryActive && this.furyComplication === 'MIRROR') {
        if (this.snake.some(p => p.equals(this.fakePos2)) || 
            this.secondarySnake.some(p => p.equals(this.fakePos2))) {
            this.eatBait(this.fakePos2)
        }
    }
  }

  private updateGraphics() {
    const themeId = this.props.appearance.theme
    const theme = THEMES[themeId] || THEMES.neon
    this.drawBackground()

    // Desenhar Player
    const playerRot = this.props.appearance.playerShape === 'triangle' ? this.playerRotation : undefined
    const pRaw = (theme.category === 'simple' && this.props.appearance.playerColor) ? this.props.appearance.playerColor : theme.colors.enginePlayer
    const pColorObj = this.normalizeColor(pRaw, theme.colors.enginePlayer || 0xFFFFFF)

    this.drawDot(this.playerGraphic, this.playerPos, pColorObj, true, false, this.isIntangible, this.props.appearance.playerShape, playerRot)

    // Isca real (pode ser TNT)
    const baitColor = theme.colors.engineBait
    this.drawDot(this.fakeGraphic, this.fakePos, baitColor, false, this.isExplosiveBaitActive, false, 'rounded')

    // Terceira isca (Fúria Mirror)
    if (this.isFuryActive && this.furyComplication === 'MIRROR' && this.fakePos2.x > 0) {
        this.drawDot(this.fakeGraphic2, this.fakePos2, baitColor, false, false, false, 'rounded')
    } else {
        this.fakeGraphic2.clear()
    }

    // Desenhar Cobra
    this.snake.forEach((pos, i) => {
      const g = this.snakeGraphics[i]
      if (g) {
        g.clear()
        const sRaw = (theme.category === 'simple' && this.props.appearance.snakeColor) ? this.props.appearance.snakeColor : theme.colors.engineSnake
        const sColorObj = this.normalizeColor(sRaw, theme.colors.engineSnake || 0x00FF00)
        
        let color = i === 0 ? sColorObj : { primary: sColorObj.primary, secondary: sColorObj.secondary }
        let alpha = 1.0

        // Efeito visual de paralisia na cabeça
        if (i === 0 && this.isStunned) {
          const stunColor = theme.isRetro ? theme.colors.engineBg : 0x888888
          color = { primary: stunColor, secondary: stunColor }
          alpha = 0.6 + Math.sin(performance.now() / 50) * 0.4
        }

        const isBulging = this.foodIndices.includes(i)

        // Calcular direção REAL do gomo para rotacionar o padrão
        let segmentDir = new Point(0, -1) // Default para Cima

        if (i === 0) {
          segmentDir = this.direction // Cabeça segue o input
        } else {
          // Segmento i segue o rastro do segmento anterior (i-1)
          const prev = this.snake[i - 1]
          const dx = prev.x - pos.x
          const dy = prev.y - pos.y

          // Lógica Toroidal: se a distância for enorme, houve wrap-around
          if (Math.abs(dx) < GAME_WIDTH / 2 && Math.abs(dy) < GAME_HEIGHT / 2) {
            segmentDir = new Point(
              dx !== 0 ? Math.sign(dx) * GRID_SIZE : 0,
              dy !== 0 ? Math.sign(dy) * GRID_SIZE : 0
            )
          } else {
            // Se houve wrap, a direção é invertida
            segmentDir = new Point(
              dx !== 0 ? -Math.sign(dx) * GRID_SIZE : 0,
              dy !== 0 ? -Math.sign(dy) * GRID_SIZE : 0
            )
          }
        }

        const isHead = i === 0
        const isVertical = segmentDir.x === 0
        this.drawShape(g, theme.isRetro ? 'square' : this.props.appearance.snakeShape, color, alpha, isBulging, isVertical, isHead, this.isMouthOpen, segmentDir)
        g.x = pos.x
        g.y = pos.y
      }
    })

    // Desenhar Cobra Secundária (Fúria)
    this.secondarySnake.forEach((pos, i) => {
      const g = this.secondarySnakeGraphics[i]
      if (g) {
        g.clear()
        const sRaw = (theme.category === 'simple' && this.props.appearance.snakeColor) ? this.props.appearance.snakeColor : theme.colors.engineSnake
        const sColorObj = this.normalizeColor(sRaw, theme.colors.engineSnake || 0x00FF00)
        
        let color = sColorObj
        let segmentDir = new Point(0, -1)

        if (i === 0) {
          segmentDir = this.secondaryDirection
        } else {
          const prev = this.secondarySnake[i - 1]
          const dx = prev.x - pos.x
          const dy = prev.y - pos.y
          if (Math.abs(dx) < GAME_WIDTH / 2 && Math.abs(dy) < GAME_HEIGHT / 2) {
            segmentDir = new Point(dx !== 0 ? Math.sign(dx) * GRID_SIZE : 0, dy !== 0 ? Math.sign(dy) * GRID_SIZE : 0)
          } else {
            segmentDir = new Point(dx !== 0 ? -Math.sign(dx) * GRID_SIZE : 0, dy !== 0 ? -Math.sign(dy) * GRID_SIZE : 0)
          }
        }

        const isHead = i === 0
        const isVertical = segmentDir.x === 0
        this.drawShape(g, theme.isRetro ? 'square' : this.props.appearance.snakeShape, color, 0.8, false, isVertical, isHead, false, segmentDir)
        g.x = pos.x
        g.y = pos.y
      }
    })
  }

  private getLighterColor(hex: number): number {
    // Simplificado: Reduz brilho levemente
    return hex // Para agora, mantém a mesma cor ou implementa extração de canais se precisar
  }

  private drawGrid() {
    this.gridGraphics.clear()
    const themeId = this.props.appearance.theme
    const theme = THEMES[themeId] || THEMES.neon

    // NO GRID in Nokia/Gameboy mode (as requested)
    if (theme.isRetro) return

    const color = theme.colors.engineGrid
    const alpha = theme.colors.engineGridAlpha

    this.gridGraphics.setStrokeStyle({ width: 1, color, alpha })

    // Linhas Verticais
    for (let x = 0; x <= GAME_WIDTH; x += GRID_SIZE) {
      this.gridGraphics.moveTo(x, 0)
      this.gridGraphics.lineTo(x, GAME_HEIGHT)
    }

    // Linhas Horizontais
    for (let y = 0; y <= GAME_HEIGHT; y += GRID_SIZE) {
      this.gridGraphics.moveTo(0, y)
      this.gridGraphics.lineTo(GAME_WIDTH, y)
    }
    this.gridGraphics.stroke()
  }

  private drawShape(
    g: Graphics, 
    shape: string, 
    color: { primary: number; secondary: number }, 
    alpha: number = 1.0, 
    isBulging: boolean = false, 
    isVertical: boolean = false, 
    isHead: boolean = false, 
    isMouthOpen: boolean = false, 
    segmentDir?: Point, 
    customRotation?: number, 
    withGlow: boolean = false
  ) {
    const themeId = this.props.appearance.theme
    const theme = THEMES[themeId] || THEMES.neon

    const half = GRID_SIZE / 2
    const isNokia = themeId === 'nokia'
    const isRetro = theme.isRetro

    // No modo retro, ocupamos o quadrado INTEIRO (sem offset) para parecer contínuo
    const size = isRetro ? GRID_SIZE : GRID_SIZE - 2
    const offset = isRetro ? 0 : 1

    g.setStrokeStyle({ width: 0 })

    if (isNokia) {
      // NOKIA LOGIC REMAINS MONOCHROMATIC (STRETCHED LCD COLORS)
      const drawColor = 0x0f380f
      this.drawNokiaShape(g, isBulging, isHead, isMouthOpen, isVertical, drawColor, alpha)
      return
    }

    if (isRetro && themeId === 'gameboy') {
      // GAMEBOY LOGIC
      this.drawSimpleShape(g, shape, size, offset, half, segmentDir, customRotation)
      g.fill({ color: color.primary, alpha })
      return
    }

    // MODERN DUAL-COLOR RENDERING
    
    // Pass 0: Outer Glow (Efeito Aura)
    if (withGlow && !isRetro) {
      const glowSize = size + 4
      const glowOffset = offset - 2
      this.drawSimpleShape(g, shape, glowSize, glowOffset, half, segmentDir, customRotation)
      g.fill({ color: color.primary, alpha: 0.15 * alpha })
    }

    // Pass 1: Outer Shape (Base Principal)
    this.drawSimpleShape(g, shape, size, offset, half, segmentDir, customRotation)
    g.fill({ color: color.primary, alpha: alpha })

    // Pass 2: Inner Core (Miolo) - Agora desenha SEMPRE se houver cor secundária
    if (color.primary !== color.secondary) {
      const innerSize = size * 0.55
      const innerOffset = offset + (size - innerSize) / 2
      this.drawSimpleShape(g, shape, innerSize, innerOffset, half, segmentDir, customRotation)
      g.fill({ color: color.secondary, alpha: alpha })
    }

    // Aplicar rotação personalizada
    if (customRotation !== undefined) {
      g.pivot.set(0, 0)
      g.rotation = customRotation
    } else {
      g.pivot.set(0, 0)
      g.rotation = 0
    }
  }

  // Helper para isolar a lógica de desenho Nokia que é complexa
  private drawNokiaShape(g: Graphics, isBulging: boolean, isHead: boolean, isMouthOpen: boolean, isVertical: boolean, drawColor: number, alpha: number) {
    const p = Math.floor(GRID_SIZE / 5)
    if (isBulging) {
      g.rect(0, 0, GRID_SIZE, GRID_SIZE)
      g.fill({ color: drawColor, alpha })
      return
    }
    if (isHead && isMouthOpen) {
      if (this.direction.x > 0) { g.rect(0, 0, p * 3, GRID_SIZE); g.rect(p * 3, 0, p, p); g.rect(p * 3, p * 4, p, p); }
      else if (this.direction.x < 0) { g.rect(p * 2, 0, p * 3, GRID_SIZE); g.rect(p, 0, p, p); g.rect(p, p * 4, p, p); }
      else if (this.direction.y > 0) { g.rect(0, 0, GRID_SIZE, p * 3); g.rect(0, p * 3, p, p); g.rect(p * 4, p * 3, p, p); }
      else { g.rect(0, p * 2, GRID_SIZE, p * 3); g.rect(0, p, p, p); g.rect(p * 4, p, p, p); }
      g.fill({ color: drawColor, alpha })
      return
    }
    if (isVertical) { g.rect(p, 0, p * 2, p * 4); g.rect(p * 3, p, p * 2, p * 4); g.rect(p * 2, p * 2, p, p); }
    else { g.rect(0, p, p * 4, p * 2); g.rect(p, p * 3, p * 4, p * 2); g.rect(p * 2, p * 2, p, p); }
    g.fill({ color: drawColor, alpha })
  }

  // Helper para desenhar a geometria básica
  private drawSimpleShape(g: Graphics, shape: string, size: number, offset: number, half: number, segmentDir?: Point, customRotation?: number) {
    switch (shape) {
      case 'square': g.rect(offset, offset, size, size); break;
      case 'circle': g.circle(half, half, size / 2); break;
      case 'triangle':
        if (customRotation !== undefined) {
          g.poly([0, -12, 9, 6, -9, 6])
        } else {
          const dir = segmentDir || this.direction
          if (dir.y < 0) { g.poly([half, offset, size + offset, size + offset, offset, size + offset]) }
          else if (dir.y > 0) { g.poly([half, size + offset, size + offset, offset, offset, offset]) }
          else if (dir.x > 0) { g.poly([size + offset, half, offset, offset, offset, size + offset]) }
          else { g.poly([offset, half, size + offset, offset, size + offset, size + offset]) }
        }
        break;
      case 'rhombus': g.poly([half, offset, size + offset, half, half, size + offset, offset, half]); break;
      case 'rounded':
      default: g.roundRect(offset, offset, size, size, 8); break;
    }
  }

  private drawDot(
    g: Graphics, 
    pos: Point, 
    color: number | { primary: number; secondary: number }, 
    glow: boolean, 
    isTNT: boolean = false, 
    isHollow: boolean = false, 
    shape: string = 'rounded', 
    customRotation?: number
  ) {
    g.clear()

    const themeId = this.props.appearance.theme
    const theme = THEMES[themeId] || THEMES.neon

    // Normalizar cor de forma ultra robusta
    const cObj = this.normalizeColor(color, 0xFFFFFF)
    const drawColor = cObj.primary

    if (theme.isRetro) {
      // Sprites Pixelados (Nokia/Gameboy style): Cruz 3x3 ou bloco centralizado
      const pSize = Math.floor(GRID_SIZE / 5)
      const center = (GRID_SIZE - pSize) / 2

      if (glow) {
        // Player retro (X ou Plus)
        g.rect(center, center, pSize, pSize)
        g.rect(center - pSize, center, pSize, pSize)
        g.rect(center + pSize, center, pSize, pSize)
        g.rect(center, center - pSize, pSize, pSize)
        g.rect(center, center + pSize, pSize, pSize)
      } else {
        // Isca retro (Bloco central mais grosso ou forminha)
        g.rect(center, center, pSize, pSize)
        g.rect(center - pSize, center - pSize, pSize, pSize)
        g.rect(center + pSize, center - pSize, pSize, pSize)
        g.rect(center - pSize, center + pSize, pSize, pSize)
        g.rect(center + pSize, center + pSize, pSize, pSize)
      }
      g.fill(drawColor)
    } else {
      if (isTNT) {
        // Visual de TNT (Simplificado em retro)
        // Note: isRetro check moved to top level but logic kept for non-retro
        g.rect(0, 0, GRID_SIZE, GRID_SIZE)
        g.fill(0xEF4444) // Vermelho explosivo
        g.rect(0, GRID_SIZE * 0.4, GRID_SIZE, GRID_SIZE * 0.2)
        g.fill(0xFFFFFF) // Faixa branca do TNT
        // Pavio
        g.moveTo(GRID_SIZE / 2, 0)
        g.lineTo(GRID_SIZE / 2, -4)
        g.stroke({ width: 2, color: 0xFFFF00 })
      } else if (isHollow) {
        g.circle(GRID_SIZE / 2, GRID_SIZE / 2, GRID_SIZE / 2 - 2)
        g.stroke({ width: 4, color: drawColor, alpha: 1.0 })
      } else {
        // MODERN DUAL-COLOR RENDERING FOR DOTS (Food/Isca)
        this.drawShape(g, shape, cObj, 1.0, false, false, false, false, undefined, customRotation, glow)
      }
    }

    if (customRotation !== undefined) {
      const half = GRID_SIZE / 2
      g.x = pos.x + half
      g.y = pos.y + half
    } else {
      g.x = pos.x
      g.y = pos.y
    }
  }

  private drawObstacles() {
    this.blockGraphic.clear()
    this.phantomBlocks.forEach(pos => {
      this.blockGraphic.roundRect(pos.x + 2, pos.y + 2, GRID_SIZE - 4, GRID_SIZE - 4, 4)
      this.blockGraphic.fill({ color: 0x94A3B8, alpha: 0.8 })
      this.blockGraphic.stroke({ width: 2, color: 0xFFFFFF, alpha: 0.4 })
    })
  }

  private drawClones() {
    const themeId = this.props.appearance.theme
    const theme = THEMES[themeId] || THEMES.neon
    this.clones.forEach((pos, i) => {
      const g = this.cloneGraphics[i]
      if (g) {
        this.drawDot(g, pos, theme.colors.enginePlayer, false)
        g.alpha = 0.7
      }
    })
  }

  private drawGainZone() {
    this.gainZoneGraphic.clear()
    if (!this.isGainZoneActive) return

    const r = this.gainZoneRadius * GRID_SIZE
    const cx = this.playerPos.x + GRID_SIZE / 2
    const cy = this.playerPos.y + GRID_SIZE / 2

    // Área quadrada no grid
    const steps = this.gainZoneRadius
    for (let dx = -steps; dx <= steps; dx++) {
      for (let dy = -steps; dy <= steps; dy++) {
        const x = this.playerPos.x + dx * GRID_SIZE
        const y = this.playerPos.y + dy * GRID_SIZE

        const dist = Math.abs(dx) + Math.abs(dy)
        const alpha = 0.15 * (1 - dist / (steps * 2))

        this.gainZoneGraphic.rect(x, y, GRID_SIZE, GRID_SIZE)
        this.gainZoneGraphic.fill({ color: 0xFBBF24, alpha })
        this.gainZoneGraphic.stroke({ width: 1, color: 0xFFD700, alpha: alpha * 2 })
      }
    }
  }

  private drawFrostAura() {
    this.frostAuraGraphic.clear()

    const rangeInTiles = Math.floor(this.AURA_RANGE / GRID_SIZE)
    const centerX = this.playerPos.x
    const centerY = this.playerPos.y

    // Intensidade pulsa levemente
    const pulse = (Math.sin(performance.now() / 200) + 1) / 2
    const baseAlpha = 0.2 + pulse * 0.15

    for (let dx = -rangeInTiles; dx <= rangeInTiles; dx++) {
      for (let dy = -rangeInTiles; dy <= rangeInTiles; dy++) {
        const x = centerX + dx * GRID_SIZE
        const y = centerY + dy * GRID_SIZE

        // Calcular distância para fade-out suave nas bordas
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > rangeInTiles) continue

        const alpha = baseAlpha * (1 - dist / rangeInTiles)

        // Quadradinho de gelo
        this.frostAuraGraphic.roundRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4, 4)
        this.frostAuraGraphic.fill({ color: 0x00E1FF, alpha })
        this.frostAuraGraphic.stroke({ width: 1, color: 0x00FFFF, alpha: alpha * 1.5 })
      }
    }

    // Brilho central e contorno da aura
    this.frostAuraGraphic.circle(centerX + GRID_SIZE / 2, centerY + GRID_SIZE / 2, this.AURA_RANGE)
    this.frostAuraGraphic.fill({ color: 0x00C8FF, alpha: 0.08 })
    this.frostAuraGraphic.stroke({ width: 3, color: 0x00FFFF, alpha: 0.3 * pulse })
  }

  private normalizeColor(color: any, fallback: number): { primary: number; secondary: number } {
    if (color === null || color === undefined) {
      return { primary: fallback, secondary: fallback };
    }
    if (typeof color === 'number') {
      return { primary: color, secondary: color };
    }
    const p = typeof color.primary === 'number' ? color.primary : fallback;
    const s = typeof color.secondary === 'number' ? color.secondary : p;
    return { primary: p, secondary: s };
  }
}
