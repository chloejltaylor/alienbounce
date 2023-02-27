import Phaser from './lib/phaser.js'
import Game from './scenes/game.js'
import GameOver from './scenes/gameOver.js'

export default new Phaser.Game({
type: Phaser.AUTO,
width: 640,
height: 480,
scene: [Game, GameOver],
physics: {
        default: 'arcade',
        arcade: {
            gravity: {
            y: 200
            },
            debug: false
        }
    }
})