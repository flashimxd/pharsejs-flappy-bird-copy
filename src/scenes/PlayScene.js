import BaseScene from './BaseScene'

const PIPES_TO_RENDER = 4
const VELOCITY = 280
class PlayScene extends BaseScene {
  constructor(config) {
    super('PlayScene', config)

    this.bird = null
    this.pipes = null

    this.verticalRange = { from: 150, to: 250 }
    this.horizontalRange = { from: 500, to: 550 }
    this.flapVelocity = 300
    this.score = {
      label: '',
      points: 0,
      best: 0
    }
  }

  create() {
    super.create()
    this.createBird()
    this.createPipes()
    this.createColliders()
    this.createScore()
    this.createPause()
    this.handleInputs()
  }

  update() {
    this.checkGameStatus()
    this.recyclePipes()
  }

  createBird() {
    this.bird = this.physics.add.sprite(this.config.startPosition.x, this.config.startPosition.y, 'bird').setOrigin(0)
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
    this.add.image(this.config.width - 10 , this.config.height - 10, 'pause')
      .setScale(2)
      .setOrigin(1)
      .setInteractive()
      .on('pointerdown', () => {
        this.physics.pause()
        this.scene.pause()
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
    console.log('do flap', this)
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
    const rightMostX = this.getRightMostPipe()
    const verticalDistance = Phaser.Math.Between(this.verticalRange.from, this.verticalRange.to)
    const verticalPosition = Phaser.Math.Between(20, this.config.height - 20 - verticalDistance)
    const horizontalDistance = Phaser.Math.Between(this.horizontalRange.from, this.horizontalRange.to)
  
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
        }
      }
    })
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