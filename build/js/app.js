var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Objects;
(function (Objects) {
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite() {
            _super.apply(this, arguments);
            this.tag = null;
        }
        return Sprite;
    })(Phaser.Sprite);
    var Snake = (function (_super) {
        __extends(Snake, _super);
        function Snake(game, x, y, key, frame) {
            if (frame === void 0) { frame = null; }
            _super.call(this, game, x, y, key, frame);
            this._direction = 'right';
            this._updateDelay = 0;
            this.cell = [];
            this.addNew = false;
            this._input = this.game.input.keyboard.createCursorKeys();
            for (var i = 0; i < 10; i++) {
                this.cell[i] = this.game.add.sprite(150 + i * 15, 150, 'snake');
            }
        }
        Snake.prototype.firstCell = function () {
            return this.cell[this.cell.length - 1];
        };
        Snake.prototype.lastCell = function () {
            return this.cell.shift();
        };
        Snake.prototype._getNewDirection = function () {
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
        };
        Snake.prototype._selfCollision = function () {
            var head = this.firstCell();
            for (var i = 0; i < this.cell.length - 1; i++) {
                if (head.x == this.cell[i].x && head.y == this.cell[i].y) {
                    return true;
                }
            }
            return false;
        };
        Snake.prototype._wallCollision = function () {
            var head = this.firstCell();
            return (head.x >= this.game.width || head.x < 0
                || head.y >= this.game.height || head.y < 0);
        };
        Snake.prototype.checkCollision = function () {
            return (this._selfCollision() || this._wallCollision());
        };
        Snake.prototype.increase = function (lastCell) {
            this.cell.unshift(this.game.add.sprite(lastCell.x, lastCell.y, 'snake'));
        };
        Snake.prototype.update = function () {
            var new_direction = this._getNewDirection();
            var speed = Math.min(10, Math.floor(this.game.score / 5));
            this._updateDelay++;
            if (this._updateDelay % (10 - speed) == 0) {
                var firstCell = this.firstCell(), lastCell = this.lastCell();
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
        };
        return Snake;
    })(Sprite);
    Objects.Snake = Snake;
    var Apple = (function (_super) {
        __extends(Apple, _super);
        function Apple() {
            _super.apply(this, arguments);
            this.tag = 'collectable';
        }
        Apple.prototype.spawn = function () {
            this.reset(Math.floor(Math.random() * 40) * 15, Math.floor(Math.random() * 30) * 15);
        };
        return Apple;
    })(Sprite);
    Objects.Apple = Apple;
})(Objects || (Objects = {}));
var Scenes;
(function (Scenes) {
    var State = (function (_super) {
        __extends(State, _super);
        function State(game) {
            _super.call(this);
            this.game = game;
        }
        State.prototype.preload = function () {
            this.game.load.image('menu', 'images/menu.png');
            this.game.load.image('gameover', 'images/gameover.png');
            this.game.load.image('snake', 'images/snake.png');
            this.game.load.image('apple', 'images/apple.png');
        };
        return State;
    })(Phaser.State);
    var Menu = (function (_super) {
        __extends(Menu, _super);
        function Menu() {
            _super.apply(this, arguments);
        }
        Menu.prototype.create = function () {
            this.game.add.button(0, 0, 'menu', this.startGame, this);
        };
        Menu.prototype.startGame = function () {
            this.game.state.start('Game');
        };
        return Menu;
    })(State);
    Scenes.Menu = Menu;
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.apply(this, arguments);
        }
        Game.prototype.create = function () {
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
        };
        Game.prototype.update = function () {
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
        };
        return Game;
    })(State);
    Scenes.Game = Game;
    var GameOver = (function (_super) {
        __extends(GameOver, _super);
        function GameOver() {
            _super.apply(this, arguments);
        }
        GameOver.prototype.create = function () {
            this.game.add.button(0, 0, 'gameover', this.startGame, this);
            // create gui
            var scoreStyle = {
                font: 'bold 14px sans-serif',
                fill: '#46c0f9',
                align: 'center'
            };
            this.game.add.text(235, 350, 'LAST SCORE', {
                font: 'bold 16px sans-serif',
                fill: '#46c0f9',
                align: 'center'
            });
            this.game.add.text(350, 348, this.game.score.toString(), {
                font: 'bold 20px sans-serif',
                fill: '#fff',
                align: 'center'
            });
        };
        GameOver.prototype.startGame = function () {
            this.game.state.start('Game');
        };
        return GameOver;
    })(State);
    Scenes.GameOver = GameOver;
})(Scenes || (Scenes = {}));
var MyGame = (function (_super) {
    __extends(MyGame, _super);
    function MyGame() {
        _super.call(this, 600, 450, Phaser.AUTO, 'content');
        this.score = 0;
        this.speed = 0;
        this.state.add('Menu', new Scenes.Menu(this), true);
        this.state.add('Game', new Scenes.Game(this));
        this.state.add('GameOver', new Scenes.GameOver(this));
    }
    return MyGame;
})(Phaser.Game);
window.onload = function () {
    var gm = new MyGame();
};
