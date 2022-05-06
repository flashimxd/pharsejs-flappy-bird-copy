import BaseScene from './BaseScene'

class PauseScene extends BaseScene {
  constructor(config) {
    super('PauseScene', config)

    this.menu = [
      { id: 1, scene: 'PlayScene', text: 'Continue'},
      { id: 2, scene: 'MenuScene', text: 'Exit'},
    ]
  }

  create() {
    super.create()
    this.createMenu(this.menu, (menuItem) => this.handleMenuEvents(menuItem))
  }

  handleMenuEvents(menuItem) {
    const { textGO } = menuItem
    textGO.setInteractive()

    textGO.on('pointerover', () => textGO.setStyle({ fill: '#ff0' }))
    textGO.on('pointerout', () => textGO.setStyle({ fill: '#fff' }))

    textGO.on('pointerup', () => {
      console.log('clicked')
      if(menuItem.id === 2) {
        this.scene.stop('PlayScene')
        this.scene.start(menuItem.scene)
        console.log('exit, back to menu')
        return
      }

      console.log('btween ifs')

      if(menuItem.scene && menuItem.id === 1) {
        console.log('enter play scene')
        // STOP the current scene (pause in this case)
        this.scene.stop()
        // RESUME the scenes which is running in parallel
        this.scene.resume(menuItem.scene)
      }
    })
  }
}

export default PauseScene