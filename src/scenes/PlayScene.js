import BaseScene from './BaseScene'

const PIPES_TO_RENDER = 4
const VELOCITY = 280
class PlayScene extends BaseScene {
  constructor(config) {
    super('PlayScene', config)

    this.bird = null
    this.pipes = null
    this.isPaused = false

    // this.verticalRange = { from: 150, to: 250 }
    // this.horizontalRange = { from: 500, to: 550 }
    this.flapVelocity = 300
    this.score = {
      label: '',
      points: 0,
      best: 0
    }

    this.levels = {
      active: 'easy',
      dificulties: {
        easy: {
          horizontalRange: { from: 500, to: 550 },
          verticalRange: { from: 150, to: 200 }
        },
        normal: {
          horizontalRange: { from: 280, to: 330 },
          verticalRange: { from: 140, to: 190 }
        },
        hard: {
          horizontalRange: { from: 250, to: 310 },
          verticalRange: { from: 120, to: 170 }
        },
      }
    }
  }

  create() {
    this.levels.active = 'easy'
    super.create()
    this.createBird()
    this.createPipes()
    this.createColliders()
    this.createScore()
    this.createPause()
    this.handleInputs()
    this.eventListeners()

    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('bird', {
        start: 8,
        end: 15
      }),
      frameRate: 8,
      repeat: -1
    })

    this.bird.play('fly')
  }

  eventListeners() {
    if( this.pauseEvent) return
    this.pauseEvent = this.events.on('resume', () => {
      this.counter = 3
      this.countDownText = this.add.text(
        ...this.screenCentered,
        `Fly In: ${this.counter}`,
        this.fontStyles
      ).setOrigin(0.5)

      this.timedDecreaseCounterEvent = this.time.addEvent({
        delay: 1000,
        callback: this.decreaseCounter,
        callbackScope: this,
        loop: true
      })
    })
  }

  decreaseCounter() {
    this.counter--
    this.countDownText.setText(`Fly in: ${this.counter}`)
    console.log('decreaseCounter counter', this.counter)
    if(this.counter <= 0) {
      this.isPaused = false
      this.countDownText.setText('')
      this.physics.resume()
      this.timedDecreaseCounterEvent.remove()
      console.log('flush counter')
    }
  }

  update() {
    this.checkGameStatus()
    this.recyclePipes()
  }

  createBird() {
    this.bird = this.physics
      .add.sprite(this.config.startPosition.x, this.config.startPosition.y, 'bird')
      .setScale(3)
      .setFlipX(true)
      .setOrigin(0)
      
    this.bird.setBodySize(this.bird.width, this.bird.height - 8)

    this.bird.body.gravity.y = 600
    this.bird.setCollideWorldBounds(true)
  }

  createPipes() {
    this.pipes = this.physics.add.group()

    Array.from(Array(PIPES_TO_RENDER)).map(() => {
      const upperPipe = this.pipes
        .create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 1)

      const lowerPipe = this.pipes
        .create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 0)

      this.placePipes(upperPipe, lowerPipe)
    })

    this.pipes.setVelocityX(-VELOCITY)
  }

  createScore() {
    this.score.points = 0
    const bestScore = localStorage.getItem('bestScore')
    this.score.label = this.add.text(16, 16, `Score: ${this.score.points}`, { fontSize: '32px', fill: '#000'})
    this.score.best = this.add.text(16, 52, `Best Score: ${bestScore || 0}`, { fontSize: '18px', fill: '#000'})
  }

  createPause() {
    this.isPaused = false
    this.add.image(this.config.width - 10 , this.config.height - 10, 'pause')
      .setScale(2)
      .setOrigin(1)
      .setInteractive()
      .on('pointerdown', () => {
        this.isPaused = true
        this.physics.pause()
        this.scene.pause()
        this.scene.launch('PauseScene')
      })
  }

  handleInputs() {
    this.input.on('pointerdown', this.doFlap, this)
    this.input.keyboard.on('keydown_SPACE', this.doFlap, this)
  }

  createColliders() {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this)
  }

  checkGameStatus() {
    if(this.bird.getBounds().bottom >= this.config.height || this.bird.y <= 0) {
      this.gameOver()
    }
  }

  doFlap() {
    if(this.isPaused) return
    this.bird.body.velocity.y = -this.flapVelocity
  }

  increaseScore() {
    this.score.points++
    this.score.label.setText(`Score: ${this.score.points}`)
  }

  saveBestScore() {
    const bestScoreText = localStorage.getItem('bestScore')
    const bestScore = bestScoreText && parseInt(bestScoreText, 10)

    if(!bestScore || this.score.points > bestScore) {
      localStorage.setItem('bestScore', this.score.points)
    }
  }

  gameOver() {
    this.physics.pause()
    this.bird.setTint(0xEE4824)
  
    this.saveBestScore()

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart()
      },
      loop: false
    })
  }

  placePipes(uPipe, lPipe) {
    const level = this.levels.dificulties[this.levels.active]
    console.log('level', level)
    console.log('lvl obj', this.levels)
    const rightMostX = this.getRightMostPipe()
    const verticalDistance = Phaser.Math.Between(level.verticalRange.from, level.verticalRange.to)
    const verticalPosition = Phaser.Math.Between(20, this.config.height - 20 - verticalDistance)
    const horizontalDistance = Phaser.Math.Between(level.horizontalRange.from, level.horizontalRange.to)
  
    uPipe.x = rightMostX + horizontalDistance
    uPipe.y = verticalPosition
  
    lPipe.x = uPipe.x
    lPipe.y = uPipe.y + verticalDistance
  }

  recyclePipes() {
    const tempPipes = []
    this.pipes.getChildren().forEach(pipe => {
      if(pipe.getBounds().right <= 0) {
        tempPipes.push(pipe)
        if(tempPipes.length === 2) {
          this.placePipes(...tempPipes)
          this.increaseScore()
          this.saveBestScore()
          this.increaseLevel()
        }
      }
    })
  }

  increaseLevel() {
    if(this.score.points > 10) {
      this.levels.active = 'normal'
    }

    if(this.score.points > 20) {
      this.levels.active = 'hard'
    }
  }

  getRightMostPipe() {
    let rightMostX = 0
  
    this.pipes.getChildren().forEach((pipe) => {
      rightMostX = Math.max(pipe.x, rightMostX)
    })
  
    return rightMostX
  }
}

export default PlayScene