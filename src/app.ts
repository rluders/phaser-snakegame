module Objects {

    class Sprite extends Phaser.Sprite {
        game: MyGame;
        public tag: string = null;
    }

    export class Snake extends Sprite {

        private _input: Phaser.CursorKeys;
        private _direction: string = 'right';

        private _updateDelay: any = 0;

        public cell: Array<Phaser.Sprite> = [];
        public addNew: boolean = false;

        constructor(game, x, y, key, frame = null) {
            super(game, x, y, key, frame);

            this._input = this.game.input.keyboard.createCursorKeys();

            for (var i = 0; i < 10; i++) {
                this.cell[i] = this.game.add.sprite(150 + i * 15, 150, 'snake');
            }
        }

        public firstCell(): any {
            return this.cell[this.cell.length - 1];
        }

        public lastCell(): any {
            return this.cell.shift();
        }

        private _getNewDirection() : string {
            if (this._input.right.isDown && this._direction != 'left') {
                return 'right';
            }
            else if (this._input.left.isDown && this._direction != 'right') {
                return 'left';
            }
            else if (this._input.up.isDown && this._direction != 'down') {
                return 'up';
            }
            else if (this._input.down.isDown && this._direction != 'up') {
                return 'down';
            }
            return null;
        }

        private _selfCollision() : boolean {
            var head: any = this.firstCell();

            for (var i = 0; i < this.cell.length - 1; i++) {
                if (head.x == this.cell[i].x && head.y == this.cell[i].y) {
                    return true;
                }
            }

            return false;
        }

        private _wallCollision() : boolean {
            var head: any = this.firstCell();
            return (head.x >= this.game.width || head.x < 0
                        || head.y >= this.game.height || head.y < 0);
        }

        public checkCollision() : boolean {
            return (this._selfCollision() || this._wallCollision());
        }

        public increase(lastCell) {
            this.cell.unshift(this.game.add.sprite(lastCell.x, lastCell.y, 'snake'));
        }

        update() {
            var new_direction: string = this._getNewDirection();
            var speed: any = Math.min(10, Math.floor(this.game.score / 5));

            this._updateDelay++;

            if (this._updateDelay % (10 - speed) == 0) {

                var firstCell = this.firstCell(),
                    lastCell = this.lastCell();

                if (this.addNew) {
                    this.increase(lastCell);
                    this.addNew = false;
                }

                this._direction = (new_direction) ? new_direction : this._direction;

                switch (this._direction) {
                    case 'right':
                        lastCell.x = firstCell.x + 15;
                        lastCell.y = firstCell.y;
                        break;
                    case 'left':
                        lastCell.x = firstCell.x - 15;
                        lastCell.y = firstCell.y;
                        break;
                    case 'up':
                        lastCell.x = firstCell.x;
                        lastCell.y = firstCell.y - 15;
                        break;
                    case 'down':
                        lastCell.x = firstCell.x;
                        lastCell.y = firstCell.y + 15;
                        break;
                }
                this.cell.push(lastCell);
            }

            if (this.checkCollision()) {
                this.game.state.start('GameOver');
            }
        }

    }

    export class Apple extends Sprite {

        public tag: string = 'collectable';

        public spawn() {
            this.reset(
                Math.floor(Math.random() * 40) * 15,
                Math.floor(Math.random() * 30) * 15
            );
        }

    }

}

module Scenes {

    class State extends Phaser.State {

        game: MyGame;

        constructor(game: MyGame) {
            super();
            this.game = game;
        }

        preload() {
            this.game.load.image('menu', 'images/menu.png');
            this.game.load.image('gameover', 'images/gameover.png');
            this.game.load.image('snake', 'images/snake.png');
            this.game.load.image('apple', 'images/apple.png');
        }

    }

    export class Menu extends State {

        create() {
            this.game.add.button(0, 0, 'menu', this.startGame, this);
        }

        startGame() {
            this.game.state.start('Game');
        }

    }

    export class Game extends State {

        private _apple: Objects.Apple;
        private _snake: Objects.Snake;
        private _scoreValue: Phaser.Text;

        create() {
            this.reset();
            // create the scene
            this.game.stage.backgroundColor = '#061f27';

            var snake = new Objects.Snake(this.game, 0, 0, '');
            this._snake = this.world.add(snake);

            var apple = new Objects.Apple(this.game, 0, 0, 'apple');
            apple.spawn();
            this._apple = this.world.add(apple);

            // create gui
            var scoreStyle = {
                font: 'bold 14px sans-serif',
                fill: '#46c0f9',
                align: 'center'
            };

            this.game.add.text(30, 20, 'SCORE', scoreStyle);
            this._scoreValue = this.game.add.text(90, 20, this.game.score.toString(), scoreStyle);
        }

        update() {
            for (var i = 0; i < this._snake.cell.length; i++) {
                if (this._snake.cell[i].x == this._apple.x
                    && this._snake.cell[i].y == this._apple.y) {
                    if (this._apple) {
                        // new apple
                        this._apple.spawn();
                        // update score
                        this.game.score++;
                        this._scoreValue.text = this.game.score.toString();
                        // snake grows
                        this._snake.addNew = true;
                    }
                }
            }
        }

        reset() {
            this.game.score = 0;
            this.game.speed = 0;
        }

    }

    export class GameOver extends State {

        create() {
            this.game.add.button(0, 0, 'gameover', this.startGame, this);

            // create gui
            var scoreStyle = {
                font: 'bold 14px sans-serif',
                fill: '#46c0f9',
                align: 'center'
            };

            this.game.add.text(
                235,
                350,
                'LAST SCORE',
                {
                    font: 'bold 16px sans-serif',
                    fill: '#46c0f9',
                    align: 'center'
                }
            );
            this.game.add.text(
                350,
                348,
                this.game.score.toString(),
                {
                    font: 'bold 20px sans-serif',
                    fill: '#fff',
                    align: 'center'
                }
            );
        }

        startGame() {
            this.game.state.start('Game');
        }

    }

}

class MyGame extends Phaser.Game {

    public score: any = 0;
    public speed: any = 0;

    constructor() {
        super(
            600,
            450,
            Phaser.AUTO,
            'content'
        );

        this.state.add('Menu', new Scenes.Menu(this), true);
        this.state.add('Game', new Scenes.Game(this));
        this.state.add('GameOver', new Scenes.GameOver(this));
    }

}

window.onload = () => {
    var gm = new MyGame();
}