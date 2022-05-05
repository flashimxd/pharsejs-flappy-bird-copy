import Phaser from "phaser"

class BaseScene extends Phaser.Scene {
  constructor(key, config) {
    super(key)
    this.config = config
    this.screenCentered = [config.width / 2, config.height / 2]
    this.fontSize = 32
    this.lineHeight = 42
    this.fontStyles = { fontSize: `${this.fontSize}px`, fill: '#fff'}
  }

  create() {
    this.add.image(0,0,'sky').setOrigin(0)

    if(this.config.canGoBack) {
      this.add.image(this.config.width - 10, this.config.height - 10, 'back')
        .setOrigin(1)
        .setScale(2)
        .setInteractive()
        .on('pointerup', () => this.scene.start('MenuScene'))
    }    
  }

  createMenu(menu, handleMenuEvents) {
    let lastMenuPositionY = 0
    menu.forEach(menuItem => {
      const menuPostion = [this.screenCentered[0], this.screenCentered[1] + lastMenuPositionY]
      menuItem.textGO = this.add.text(...menuPostion, menuItem.text, this.fontStyles).setOrigin(0.5, 1)
      lastMenuPositionY += this.lineHeight
      handleMenuEvents(menuItem)
    })
  }
}

export default BaseScene