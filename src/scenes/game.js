import Phaser from '../lib/phaser.js'
import Star from '../game/Star.js'


export default class Game extends Phaser.Scene
{
    platforms
    player
    cursors
    stars
    starsCollected = 0
    starsCollectedText
    difficultyfactor = 1


    constructor() 
    {
    super('game')
    }

    init()
    {
        this.starsCollected = 0
    }

    preload()
    {
        this.load.image('background', './src/assets/Background/bg_layer1.png')
        this.load.image('platform', './src/assets/Environment/ground.png')
        this.load.image('player', './src/assets/Players/player.png')
        this.load.image('player-jump', './src/assets/Players/player-jump.png')
        this.load.image('star', './src/assets/Items/star.png')

    }

    create()
    {
        this.add.image(240, 320, 'background').setScrollFactor(1, 0)
        this.platforms = this.physics.add.staticGroup()

        
        for(let i=0; i<5; i++){
            const x = Phaser.Math.Between(80, 400)
            const y = 150 * i

            const platform = this.platforms.create(x, y, 'platform')
            platform.scale = 0.5

            const body = platform.body
            body.updateFromGameObject()

        }

        this.player = this.physics.add.sprite(240, 320, 'player').setScale(0.4)
        this.physics.add.collider(this.platforms, this.player)
        this.player.body.checkCollision.up = false
        this.player.body.checkCollision.left = false
        this.player.body.checkCollision.right = false
        this.player.body.checkCollision.down = true

        this.cameras.main.startFollow(this.player)
        this.cameras.main.setDeadzone(this.scale.width * 1.5)

        this.cursors = this.input.keyboard.createCursorKeys()

        this.stars = this.physics.add.group({
            classType: Star
        })
        this.physics.add.collider(this.platforms, this.stars)

        this.physics.add.overlap(this.player, this.stars, this.handleCollectStar, undefined, this)

        const style = { color: '#fff', fontSize: 24 }
        this.starsCollectedText = this.add.text(240,10,'0', style).setScrollFactor(0).setOrigin(0.5, 0)


    }


    update()
    {

        // platform reuse code 

        this.platforms.children.iterate(child => {
            const platform = child
            const scrollY = this.cameras.main.scrollY
            if (platform.y >= scrollY + 700) {
                platform.y = scrollY - Phaser.Math.Between(50, 70)
                platform.body.updateFromGameObject()
                platform.scale = 0.5* this.difficultyfactor
                this.addStarAbove(platform)

            }

        })

        // player movement code
        const touchingDown = this.player.body.touching.down

        if (touchingDown) {
            this.player.setVelocityY(-300)
            this.player.setTexture('player-jump')

        }

        if(this.cursors.left.isDown && !touchingDown)
        {
            this.player.setVelocityX(-200)
        } 
        else if (this.cursors.right.isDown && !touchingDown)
        {
            this.player.setVelocityX(200)
        }
        else
        {
            this.player.setVelocityX(0)
            
        }

        const vy = this.player.body.velocity.y
        if (vy > 0 && this.player.texture.key !== 'player')
        {
        // switch back to jump when falling
        this.player.setTexture('player')
        }

        // horizontal wrap code
        this.horizontalWrap(this.player)
        
        const bottomPlatform = this.findBottommostPlatform()
        if (this.player.y > bottomPlatform.y + 1000){
            // console.log("GAME OVER MAN")
            this.scene.start('game-over')
        }

    }

    horizontalWrap(sprite)
    {
        const halfWidth = sprite.displayWidth * 0.5
        const gameWidth = this.scale.width
        if (sprite.x < -halfWidth)
        {
            sprite.x = gameWidth + halfWidth
        }
        else if (sprite.x > gameWidth + halfWidth)
        {
            sprite.x = -halfWidth
        }

    }

    addStarAbove(sprite)
            {
        
                // const y = sprite.y - sprite.displayHeight
                const y = sprite.y - 100
                const star = this.stars.get(sprite.x, y, 'star')
                star.setActive(true)
                star.setVisible(true)
                this.add.existing(star)

                star.body.setSize(star.width, star.height)
                this.physics.world.enable(star)

                return star
            }

    handleCollectStar(player, star)
    {
        this.stars.killAndHide(star)
        this.physics.world.disableBody(star.body)
        this.starsCollected ++
        this.starsCollectedText.text = this.starsCollected
        if(this.difficultyfactor>0.5){
            this.difficultyfactor = this.difficultyfactor*0.98
        }
        

    }

    findBottommostPlatform()
    {
        const platforms = this.platforms.getChildren()
        let bottomPlatform = platforms[0]

        for(let i=0; i<platforms.length; ++i){
            const platform = platforms[i]
            if(platform.y < bottomPlatform) {
                continue
            } 
            
            bottomPlatform = platform
        }

        return bottomPlatform
    }

}


