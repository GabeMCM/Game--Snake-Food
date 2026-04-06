import { Application, Container, Graphics, Point, Ticker, Rectangle } from 'pixi.js'

export const GAME_WIDTH = 640
export const GAME_HEIGHT = 640
export const GRID_SIZE = 20
export const SNAKE_SPEED = 10 // Mais quadradinhos = cobra parece mais rápida

export interface GameProps {
  onCoinCollect: (amt: number) => void
  onHit: (dmg: number) => void
  onHeal: (amt: number) => void
  onTimeUpdate: (time: number) => void
  health: number
  maxHealth: number
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
  
  // Gráficos
  private snakeGraphics: Graphics[] = []
  private playerGraphic: Graphics
  private fakeGraphic: Graphics
  private gridGraphics: Graphics
  private frostAuraGraphic: Graphics
  
  // De controle
  private lastMoveTime: number = 0
  private startTime: number = 0
  private isRunning: boolean = false

  // Habilidades
  private isInvisible: boolean = false
  private invisTimer: number = 0
  private isFrostAuraActive: boolean = false
  private readonly AURA_RANGE = 200 // Reduzido proporcionalmente (10 blocos de 20px)

  private isSacrificeActive: boolean = false
  private sacrificeTimer: number = 0

  constructor(app: Application, props: GameProps) {
    this.app = app
    this.props = props
    this.container = new Container()
    this.app.stage.addChild(this.container)

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
    
    this.container.addChild(this.fakeGraphic)
    this.container.addChild(this.playerGraphic)
    
    // Interatividade Local (Removida em favor do container React para maior compatibilidade)
    this.app.stage.eventMode = 'none'
    
    this.reset()
  }

  public triggerSwap() {
    this.swapPositions()
  }

  public updateProps(props: GameProps) {
    this.props = props
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

  public activateSacrifice(durationMs: number) {
    this.isSacrificeActive = true
    this.sacrificeTimer = durationMs
    this.playerGraphic.tint = 0xFF3C50 // Avermelhado para indicar perigo/sacrifício
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

  public destroy() {
    this.stop()
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

    // Posicionar comida aleatória (longe do centro)
    this.playerPos = this.getRandomPos(true)
    // Garantir que a isca não nasça em cima nem muito perto do jogador (min 3 quadrados)
    this.fakePos = this.getRandomPos(true, this.playerPos, 3 * GRID_SIZE)

    this.updateGraphics()
  }

  private getRandomPos(excludeCenter = false, minDistFrom?: Point, minDist: number = 0): Point {
    const cols = GAME_WIDTH / GRID_SIZE
    const rows = GAME_HEIGHT / GRID_SIZE
    
    let x, y, pos: Point
    let isOccupied = false
    
    let attempts = 0
    do {
      attempts++
      // Margem de 2 blocos para evitar ficar grudado na borda/fora da tela
      x = Math.floor(Math.random() * (cols - 4) + 2) * GRID_SIZE
      y = Math.floor(Math.random() * (rows - 4) + 2) * GRID_SIZE
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

    // Gerenciar Invisibilidade (Existente)
    if (this.isInvisible) {
      this.invisTimer -= dt
      if (this.invisTimer <= 0) {
        this.isInvisible = false
        this.playerGraphic.alpha = 1
      }
    }

    // Gerenciar Sacrifício
    if (this.isSacrificeActive) {
      this.sacrificeTimer -= dt
      if (this.sacrificeTimer <= 0) {
        this.isSacrificeActive = false
        this.playerGraphic.tint = 0xFFFFFF
      }
    }

    // Gerenciar Aura de Gelo (Visual)
    if (this.isFrostAuraActive) {
      this.drawFrostAura()
    }

    // Controle de velocidade da cobra (com Aura de Gelo)
    let speedMult = 1.0
    if (this.isFrostAuraActive) {
      const head = this.snake[0]
      const distToPlayer = this.getToroidalDistance(head, this.playerPos)
      if (distToPlayer < this.AURA_RANGE) {
        speedMult = 0.5 // 50% de lentidão
      }
    }

    const moveInterval = 1000 / ((SNAKE_SPEED + this.snake.length * 0.2) * speedMult)
    if (now - this.lastMoveTime > moveInterval) {
      this.moveSnake()
      this.lastMoveTime = now
    }
  }

  private getNearestTarget(): Point {
    const head = this.snake[0]
    // Se estiver invisível, ignora o jogador
    const targets = this.isInvisible ? [this.fakePos] : [this.playerPos, this.fakePos]
    
    return targets.reduce((prev, curr) => {
      const distPrev = this.getToroidalDistance(head, prev)
      const distCurr = this.getToroidalDistance(head, curr)
      return distCurr < distPrev ? curr : prev
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

      const score = this.getToroidalDistance(nextPos, target)
      if (score < minScore) {
        minScore = score
        bestDir = dir
      }
    }
    return bestDir
  }

  private moveSnake() {
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
    
    // Verificações de Colisão
    if (newHead.equals(this.playerPos)) {
      if (this.isSacrificeActive) {
        // SACRIFÍCIO: Cobra perde um gomo e player cura
        if (this.snake.length > 1) {
          const removedPart = this.snake.pop()
          const g = this.snakeGraphics.pop()
          if (g) g.destroy()
        }
        this.props.onHeal(30)
        this.isSacrificeActive = false // Reseta após o toque
        this.playerGraphic.tint = 0xFFFFFF
        console.log("💉 Sacrifício bem sucedido! Cobra encolheu e você curou.")
      } else {
        // Dano normal
        this.props.onHit(20)
        this.reset() 
        return
      }
    }

    this.snake.unshift(newHead)

    if (newHead.equals(this.fakePos)) {
      // Comeu isca: ganha recompensa e cresce
      this.props.onCoinCollect(1)
      this.fakePos = this.getRandomPos(false, this.playerPos, 3 * GRID_SIZE)
      // Mantém a cauda (cresce)
      
      // Adicionar nova parte gráfica
      const part = new Graphics()
      this.container.addChild(part)
      this.snakeGraphics.push(part)
    } else {
      // Movimento normal: remove cauda
      this.snake.pop()
    }

    this.updateGraphics()
  }

  private updateGraphics() {
    const colors = {
      player: 0x00A0FF,
      fake: 0xF0F0F5,
      snakeHead: 0x00FF82,
      snakeBody: 0x00B464
    }

    // Desenhar Comidas
    this.drawDot(this.playerGraphic, this.playerPos, colors.player, true)
    this.drawDot(this.fakeGraphic, this.fakePos, colors.fake, false)

    // Desenhar Cobra
    this.snake.forEach((pos, i) => {
      const g = this.snakeGraphics[i]
      if (g) {
        g.clear()
        const color = i === 0 ? colors.snakeHead : colors.snakeBody
        g.roundRect(0, 0, GRID_SIZE - 2, GRID_SIZE - 2, 8)
        g.fill(color)
        g.x = pos.x + 1
        g.y = pos.y + 1
      }
    })
  }

  private drawGrid() {
    this.gridGraphics.clear()
    this.gridGraphics.setStrokeStyle({ width: 1, color: 0xFFFFFF, alpha: 0.05 })
    
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

  private drawDot(g: Graphics, pos: Point, color: number, glow: boolean) {
    g.clear()
    if (glow) {
      g.circle(GRID_SIZE / 2, GRID_SIZE / 2, GRID_SIZE * 0.7)
      g.fill({ color, alpha: 0.2 })
    }
    g.roundRect(0, 0, GRID_SIZE, GRID_SIZE, 10)
    g.fill(color)
    g.x = pos.x
    g.y = pos.y
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
    this.frostAuraGraphic.circle(centerX + GRID_SIZE/2, centerY + GRID_SIZE/2, this.AURA_RANGE)
    this.frostAuraGraphic.fill({ color: 0x00C8FF, alpha: 0.08 })
    this.frostAuraGraphic.stroke({ width: 3, color: 0x00FFFF, alpha: 0.3 * pulse })
  }
}
