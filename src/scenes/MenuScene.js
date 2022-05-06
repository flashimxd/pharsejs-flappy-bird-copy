import BaseScene from './BaseScene'

class MenuScene extends BaseScene {
  constructor(config) {
    super('MenuScene', config)

    this.menu = [
      { id: 1, scene: 'PlayScene', text: 'Play'},
      { id: 2, scene: 'ScoreScene', text: 'Score'},
      { id: 3, scene: null, text: 'Exit'}
    ]
  }

  create() {
    super.create()
    this.createMenu(this.menu, (menuItem) => this.handleMenuEvents(menuItem))
    // this.scene.start('PlayScene')
  }

  handleMenuEvents(menuItem) {
    console.log({ menuItem })
    const { textGO } = menuItem
    textGO.setInteractive()

    textGO.on('pointerover', () => textGO.setStyle({ fill: '#ff0' }))
    textGO.on('pointerout', () => textGO.setStyle({ fill: '#fff' }))

    textGO.on('pointerup', () => {
      if(!menuItem.scene) {
        this.game.destroy(true)
        return
      }
      
      this.scene.start(menuItem.scene)
    })
  }
}

export default MenuScene