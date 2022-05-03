import Phaser from "phaser"

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true
    }
  },
  scene: {
    preload,
    create,
    update,
  }
}

let bird = null
let pipes = null
let lowerPipe = null
let upperPipe = null
let pipeHorizontalDistance = 0
const VELOCITY = 200
const PIPES_TO_RENDER = 4
const verticalRange = { from: 150, to: 250 }
const horizontalRange = { from: 500, to: 550 }
const flapVelocity = 250
const initialBirdPosition = { x: config.width / 10, y: config.height / 2 }

function preload() {
  this.load.image('sky', 'assets/sky.png')
  this.load.image('bird', 'assets/bird.png')
  this.load.image('pipe', 'assets/pipe.png')
}

function create() {
  this.add.image(0,0,'sky').setOrigin(0)
  bird = this.physics.add.sprite(initialBirdPosition.x, initialBirdPosition.y, 'bird').setOrigin(0)
  bird.body.gravity.y = 400

  pipes = this.physics.add.group()

  Array.from(Array(PIPES_TO_RENDER)).map(() => {
    upperPipe = pipes.create(0, 0, 'pipe').setOrigin(0, 1)
    lowerPipe = pipes.create(0, 0, 'pipe').setOrigin(0, 0)

    placePipes(upperPipe, lowerPipe)
  })

  pipes.setVelocityX(-200)
  
  this.input.on('pointerdown', doFlap)
  this.input.keyboard.on('keydown_SPACE', doFlap)
}

function update(time, delta) {
  if(bird.y > config.height || bird.y < -bird.height) {
    restartBirdPosition()
  }
}

const placePipes = (uPipe, lPipe) => {
  // pipeHorizontalDistance += 400
  const rightMostX = getRightMostPipe()
  const verticalDistance = Phaser.Math.Between(verticalRange.from, verticalRange.to)
  const verticalPosition = Phaser.Math.Between(20, config.height - 20 - verticalDistance)
  const horizontalDistance = Phaser.Math.Between(horizontalRange.from, horizontalRange.to)

  uPipe.x = rightMostX + horizontalDistance
  uPipe.y = verticalPosition

  lPipe.x = uPipe.x
  lPipe.y = uPipe.y + verticalDistance
}

const getRightMostPipe = () => {
  let rightMostX = 0

  pipes.getChildren().forEach((pipe) => {
    rightMostX = Math.max(pipe.x, rightMostX)
  })

  return rightMostX
}

const doFlap = () => {
  bird.body.velocity.y = -flapVelocity
}

const restartBirdPosition = () => {
  bird.x = initialBirdPosition.x
  bird.y = initialBirdPosition.y
  bird.body.velocity.y = 0
}

new Phaser.Game(config)