import BaseScene from './BaseScene'

class ScoreScene extends BaseScene {
  constructor(config) {
    super('ScoreScene', { ...config, canGoBack: true })
  }

  create() {
    super.create()
    const bestScore = localStorage.getItem('bestScore')
    this.add.text(...this.screenCentered, `Best Score: ${bestScore || 0 }`, this.fontStyles)
      .setOrigin(0.5)
  }
}

export default ScoreScene