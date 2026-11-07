const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d')
const canvascontainer = document.getElementById('canvascontainer')
const fullscreenButton = document.getElementById('fullscreen')

fullscreenButton.addEventListener('click', () => {
    canvascontainer.requestFullscreen()
})

// Canvas is 800px * 300px
let cWidth = 800
let cHeight = 300

canvas.width = cWidth
canvas.height = cHeight

let gameLost = false
let displayingGameLost = false

const reset = (things) => {
    things.forEach(thing => {
        if (thing.reset) {
            displayingGameLost = false
            thing.reset()
        }
    });
}

let highscoreSet = false
let highscore = window.localStorage.getItem("highscore")

const gameLose = (score) => {
    if (gameLost || displayingGameLost) {
        if (!highscore || score > highscore) {
            window.localStorage.setItem("highscore", Math.round(score * 10)/10)
            highscore = window.localStorage.getItem("highscore")
        }
        ctx.fillStyle = '#ff0000'
        ctx.font = "30px monospace";
        ctx.fillText("Game Over. Press Any Key to Restart.", 5, 30)
        ctx.fillStyle = "#ffffff"
        ctx.font = "20px monospace"
        ctx.fillText("High Score: " + window.localStorage.getItem("highscore"), 5, 80)
        displayingGameLost = true
    }
}

const playerImage = new Image()
playerImage.src = './apple.svg'
class player {
    constructor() {
        this.resetStats = {
            y: cHeight/2,
            speed: 4,
            direction: 'up',
            moving: true
        }
        this.startY = cHeight/2
        this.x = 0
        this.y = cHeight/2
        this.width = 50
        this.height = 50
        this.speed = 4
        this.moving = true
        this.direction = 'up'
    }
    drawPlayer() {
        // ctx.drawImage(playerImage, this.x, this.y, this.width, this.height)
        ctx.fillStyle = 'rgb(0, 140, 255)'
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
    setMoving(bool) {
        this.moving = bool
    }
    setDirection(d) {
        this.direction = d
    }
    changeDirection() {
        if (this.y > cHeight - this.height) {
            this.direction = 'up'
        } else if (this.y < 0) {
            this.direction = 'down'
        }
    }
    movePlayer() {
        if (this.y < 0 && gameLost == false) {
            gameLost = true
        }
        if (this.y > cHeight - this.height && gameLost == false) {
            gameLost = true
        }
        if (this.moving && this.y >= 0 && this.y <= cHeight - this.height && !gameLost) {
            if (this.direction == 'up') {
                this.y -= this.speed
            } else if (this.direction == 'down') {
                this.y += this.speed
            }
        }
    }
    checkCollisions(mesh) {
        if (
            this.x < mesh.x + mesh.width &&
            this.x + mesh.width > mesh.x &&
            this.y < mesh.y + mesh.height &&
            this.y + this.height > mesh.y &&
            !gameLost
        ) {
            if (gameLost == false) {
                gameLost = true
            }
        }
    }
    draw() {
        this.drawPlayer()
        this.changeDirection()
        this.movePlayer()
    }
    reset() {
        this.y = this.resetStats.y
        this.speed = this.resetStats.speed
        this.moving = this.resetStats.moving
        this.direction = this.resetStats.direction
    }
}


const blockImage = new Image()
blockImage.src = './doctor.jpg'
class block {
    constructor() {
        this.resetStats = {
            y: cHeight/2,
            x: cWidth,
            speed: 10,
            width: 50,
            height: 50
        }
        this.x = cWidth
        this.y = cHeight/2
        this.width = 50
        this.height = 50
        this.speed = 10
        this.maxSize = 60
    }
    drawBlock(){
        // ctx.drawImage(blockImage, this.x, this.y, this.width, this.height)
        ctx.fillStyle = '#d400ff'
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
    moveBlock(){
        if (this.x > -this.width && !gameLost) {
            this.x -= this.speed
        }
    }
    checkRestart(){
        if (this.x <= - this.width) {
            this.restart()
        }
    }
    restart(){
        this.x = 800
        let newSize = Math.floor(Math.random() * this.maxSize) + 10
        this.height = newSize
        this.width = newSize
        this.y = Math.floor(Math.random() * (cHeight - this.height))
    }
    draw(){
        this.drawBlock()
        this.moveBlock()
        this.checkRestart()
    }
    reset(){
        this.y = this.resetStats.y
        this.x = this.resetStats.x
        this.speed = this.resetStats.speed
        this.width = this.resetStats.width
        this.height = this.resetStats.height
    }
}

class scoreBoard {
    constructor() {
        this.score = 0
        this.x = 10
        this.y = cHeight - 30
    }
    draw() {
        ctx.fillStyle = "white"
        ctx.font = "20px monospace"
        ctx.fillText("Score: " + Math.round(this.score * 10) / 10, this.x, this.y)
    }
    updateScore(newScore) {
        this.score = newScore
    }
    reset() {
        this.score = 0
    }
}

let b1 = new block()
let p = new player()
let s = new scoreBoard()
const draw = () => {
    ctx.clearRect(0, 0, cWidth, cHeight)
    s.draw()
    if (!gameLost) {
        p.draw()
        b1.draw()
        p.checkCollisions(b1)
    }
    if (gameLost) {
        setTimeout(() => {
            document.addEventListener('keydown', () => {
                if (gameLost) {
                    reset([p,b1,s])
                    gameLost = false
                }
            }, {once: true})
            canvas.addEventListener('click', () => {
                if (gameLost) {
                    reset([p, b1, s])
                    gameLost = false
                }
            },{once: true})
        }, 500)
        if (gameLost) {
            gameLose(s.score)
        }
    }
    
    requestAnimationFrame(draw)
}

setInterval(() => {
    if (!gameLost && document.hasFocus()) {
        s.updateScore(s.score + 0.1)
    }
}, 100)

document.addEventListener('keydown', (ev) => {
    switch (ev.key) {
        case "ArrowUp":
            p.setDirection('up')
        break
        case "ArrowDown":
            p.setDirection('down')
        break
        case " ":
            if (p.direction == 'up') {
                p.setDirection('down')
            } else {
                p.setDirection('up')
            }
    }
})

canvas.addEventListener('click', () => {
    if (p.direction == 'up') {
        p.setDirection('down')
    } else {
        p.setDirection('up')
    }
})
    
draw()
