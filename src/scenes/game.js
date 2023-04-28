import Phaser from '../lib/phaser.js'
import Star from '../game/Star.js'
import StarBad from '../game/StarBad.js'


export default class Game extends Phaser.Scene
{
    platforms
    player
    cursors
    stars
    deathstar
    starsbad
    numberofbounces = 0
    starsCollected = 0
    starsCollectedText
    difficultyfactor = 1
    activeBadstars = 0


    constructor() 
    {
    super('game')
    }

    init()
    {
        this.starsCollected = 0
        this.difficultyfactor = 1
    }

    preload()
    {
        this.load.image('background', './src/assets/Background/bg_layer1.png')
        this.load.image('platform', './src/assets/Environment/ground.png')
        this.load.image('player', './src/assets/Players/player.png')
        this.load.image('player-jump', './src/assets/Players/player-jump.png')
        this.load.image('player-hurt-right', './src/assets/Players/player-hurt-right.png')
        this.load.image('player-hurt-left', './src/assets/Players/player-hurt-left.png')
        this.load.image('player-hurt-middle', './src/assets/Players/player-hurt-middle.png')
        this.load.image('player-zoom', './src/assets/Players/player-zoom.png')
        this.load.image('player-dead', './src/assets/Players/player-dead.png')
        this.load.image('star-death','./src/assets/Items/star-death-right.png' )
        this.load.image('star', './src/assets/Items/star.png')
        // this.load.image('star-bad', './src/assets/Items/star-bad.png')
        this.load.spritesheet("star-bad", "./src/assets/Items/star-bad-spritesheet.png", {
            frameWidth: 76,
            frameHeight: 74
        });
        this.load.audio('boing', './src/assets/Sounds/cartoonboing.mp3')
        this.load.audio('pop', './src/assets/Sounds/cartoonbubblepop.mp3')


    }

    create()
    {
        this.add.image(240, 320, 'background').setScrollFactor(1, 0)


        // PLatform creation 
        this.platforms = this.physics.add.staticGroup()


        for(let i=0; i<5; i++){
            const x = Phaser.Math.Between(0, 500)
            const y = 150 * i
            const platform = this.platforms.create(x, y, 'platform')
            platform.body.checkCollision.down = false
            platform.body.checkCollision.left = false
            platform.body.checkCollision.right = false

            platform.scale = 1
        
        // Make bottom platform central and next one up to the side
            const platformsList = this.platforms.getChildren()
            if(i==4){
                platformsList[4].x = 240
            }
            if(i==3){
                let rand01 = Phaser.Math.Between(0, 1);
                let startingpositionplatform2array = [100,400]
                platformsList[3].x = startingpositionplatform2array[rand01]
            }
           
            const body = platform.body
            body.updateFromGameObject()

        }

    
    // Create player

        this.player = this.physics.add.sprite(240, 320, 'player').setScale(0.4)
        console.log(this.player)
        this.physics.add.collider(this.platforms, this.player, this.handleBounce, undefined, this)
        this.cameras.main.startFollow(this.player)
        this.cameras.main.setDeadzone(this.scale.width * 1.5)

        this.cursors = this.input.keyboard.createCursorKeys()


    // Create collector stars
        this.stars = this.physics.add.group({
            classType: Star
        })

        this.physics.add.collider(this.platforms, this.stars)

        this.physics.add.overlap(this.stars, this.player, this.handleCollectStar, undefined, this)

        const style = { color: '#fff', fontSize: 24 }
        this.starsCollectedText = this.add.text(240,10,'0', style).setScrollFactor(0).setOrigin(0.5, 0)

    // Create bad stars
        this.starsbad = this.physics.add.staticGroup({
            classType: StarBad
        }

        )

        this.anims.create({
            key: "starbadflash",
            frames: this.anims.generateFrameNumbers("star-bad", {
                start: 0,
                end: 1
            }),
            frameRate: 3,
            yoyo: true,
            repeat: -1
        });

        this.physics.add.collider(this.starsbad, this.player, this.handleHitStarBad, undefined, this)
        
        const starbaddy = this.starsbad.create(300, -2000, 'star-bad')
        starbaddy.anims.play("starbadflash");
        const starbaddybody = starbaddy.body
        starbaddybody.updateFromGameObject()

    //Create death stars

    // this.starsdeath = this.physics.add.staticGroup()

    // const deathstar = this.starsdeath.create(400, -1000, 'star-death')
    // this.physics.add.collider(this.starsdeath, this.player, this.handleHitStarDeath, undefined, this)



    }




    update()
    {

        // platform reuse code 

        this.platforms.children.iterate(platform => {
            const scrollY = this.cameras.main.scrollY
            if (platform.y >= scrollY + 700) {
                platform.y = scrollY - Phaser.Math.Between(50, 70)
                platform.x = Phaser.Math.Between(0, 500)
                platform.body.updateFromGameObject()
                platform.scale = this.difficultyfactor
                this.addStarAbove(platform)
                

            }

        })

        //baddy reuse code

        this.starsbad.children.iterate(starbaddy => {
                const scrollY = this.cameras.main.scrollY
                if (starbaddy.y >= scrollY + 700) {
                    starbaddy.y = scrollY - Phaser.Math.Between(50, 70)
                    starbaddy.x = Phaser.Math.Between(0, 500)
                    starbaddy.body.updateFromGameObject()

                }
            

        })

   

        // player movement code


                if(this.input.activePointer.isDown && this.input.activePointer.position.x < 322) {
            this.player.setVelocityX(-200)
            console.log(this.input.activePointer.position.x)

        } 
        else
        if(this.input.activePointer.isDown && this.input.activePointer.position.x > 322) {
            this.player.setVelocityX(200)
            console.log(this.input.activePointer.position.x)

        } 
    
        else {
            this.player.setVelocityX(0)
        }
        // const touchingDown = this.player.body.touching.down

        


        //     if(this.player.texture.key == 'player' || this.player.texture.key == 'player-jump' || this.player.texture.key == 'player-zoom'){
    
        //         if(this.cursors.left.isDown && !touchingDown)
        //         {
        //             this.player.setVelocityX(-200)
        //         } 
        //         else if (this.cursors.right.isDown && !touchingDown)
        //         {
        //             this.player.setVelocityX(200)
        //         }
        //         else
        //         {
        //             this.player.setVelocityX(0)
                    
        //         }
        // }



        const vy = this.player.body.velocity.y
        if (vy > 0 && this.player.texture.key !== 'player-hurt-middle' && this.player.texture.key !== 'player-dead')
        {
        // switch back to player when falling
        this.player.setTexture('player')
        }

        // horizontal wrap code
        this.horizontalWrap(this.player)
        
        const bottomPlatform = this.findBottommostPlatform()
        if (this.player.y > bottomPlatform.y + 1000){
            this.scene.start('game-over')
        }

        // deathstar code





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


    addBaddies()
            {
                const y = 100
                const x = 300
                const baddy = this.starsbad.create(x, y, 'star-bad')
                baddy.setActive(true)
                baddy.setVisible(true)
                this.add.existing(baddy)

                baddy.body.setSize(baddy.width, baddy.height)
                this.physics.world.enable(baddy)

                return baddy
            }

    handleBounce(player, platform)
    {
        if(this.player.body.touching.down){
            this.player.setVelocityY(-300)
            if (this.player.texture.key == 'player' || this.player.texture.key == 'player-hurt-middle'){
                this.player.setTexture('player-jump')
                this.sound.play('pop')
                this.numberofbounces++
                // console.log(this.numberofbounces)
                
            }
        }

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

    handleHitStarBad(player, starbaddy)
    {
            this.sound.play('boing')
            this.activeBadstars = 0
            if(player.body.touching.left == true){
                console.log("right!")
                this.player.setTexture('player-hurt-right')
                this.player.setVelocityX(500)
                this.player.setVelocityY(-300)
            } else if(player.body.touching.right == true) {
                console.log("left!")
                this.player.setTexture('player-hurt-left')
                this.player.setVelocityX(-500)
                this.player.setVelocityY(-300)
            } else if(player.body.touching.down == true) {
                console.log("up!")
                this.player.setTexture('player-zoom')
                this.player.setVelocityX(0)
                this.player.setVelocityY(-500)
            } else if(player.body.touching.up == true) {
                console.log("down!")
                this.player.setTexture('player-hurt-middle')
                this.player.setVelocityX(0)
                this.player.setVelocityY(300)
            }

            // this.physics.world.disableBody(starbaddy.body)

            this.anims.create({
                key: "starbaddead",
                frames: this.anims.generateFrameNumbers("star-bad", {
                    start: 2,
                    end: 2
                }),
                frameRate: 3,
                yoyo: true,
                repeat: -1
            });
            // starbaddy.anims.play("starbaddead");


    }

    handleHitStarDeath()
    {
        this.player.setTexture('player-dead')
        this.player.setVelocityX(0)
        this.player.setVelocityY(800)
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


