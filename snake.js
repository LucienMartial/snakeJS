"use strict";

/**
 *  SNAKE - version 2022 pour les L3 INFO
 */

class Coordinates {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

class SnakePoint {
    constructor(x, y, vecX, vecY) {
        this.coordinates = new Coordinates(x, y);
        this.vecX = vecX;
        this.vecY = vecY;
    }
}

class Fruit {
    constructor(snake) {
        this.radius = 15;
        this.color = "red";
        this.respawn(snake);
    }

    getRandCoord(width, height) {
        let x = Math.floor(Math.random() * (width - 2 * this.radius)) + this.radius;
        let y = Math.floor(Math.random() * (height - 2 * this.radius)) + this.radius;

        return new Coordinates(x, y);
    }

    respawn(snake) {
        do {
            let randomCoordinates = this.getRandCoord(snake.WIDTH, snake.HEIGHT);
            this.coordinates = randomCoordinates;
        } while (collisionSnakeFruit(snake, this));
    }
}

class Snake {
    constructor(width, height) {
        this.WIDTH = width;
        this.HEIGHT = height;
        this.headCoordinates = new Coordinates(this.WIDTH / 2, this.HEIGHT / 30);

        this.vecX = 0;
        this.vecY = 1;

        this.points = [];
        this.points.push(new SnakePoint(this.headCoordinates.x, this.headCoordinates.y, this.vecX, this.vecY));

        this.bodyLength = 250;
        this.size = 25;
        this.speed = 0.4;
        this.color = "green";

        this.turbo = 3;
        this.turboEngaged = false;
        this.score = 0;
    }

    firstSegmentLength() {
        let pointsLength = this.points.length;

        if (pointsLength > 1) {
            let x = this.points[0].coordinates.x - this.points[1].coordinates.x;
            let y = this.points[0].coordinates.y - this.points[1].coordinates.y;

            return Math.sqrt(x * x + y * y);
        }

        return 0;
    }

    isBackOnHimself() {
        if (this.points.length < 3) {
            return false;
        }

        if (this.vecX !== 0 && this.vecX === -this.points[2].vecX && this.firstSegmentLength() <= this.size) {
            return true;
        }

        if (this.vecY !== 0 && this.vecY === -this.points[2].vecY && this.firstSegmentLength() <= this.size) {
            return true;
        }

        return false;
    }

    turn() {
        this.points.unshift(new SnakePoint(this.headCoordinates.x, this.headCoordinates.y, this.vecX, this.vecY));
    }


    eatFruit() {
        this.bodyLength += 150;

        if (this.turboEngaged) {
            this.score += 200;
        } else {
            this.score += 100;
        }
    }

    movePoints(dt) {
        let pointsLength = this.points.length;

        if (pointsLength > 1) {
            if (this.points[pointsLength - 1].vecX === -1) {
                if (this.points[pointsLength - 1].coordinates.x <= this.points[pointsLength - 2].coordinates.x) {
                    this.points.pop();
                }
            } else if (this.points[pointsLength - 1].vecX === 1) {
                if (this.points[pointsLength - 1].coordinates.x >= this.points[pointsLength - 2].coordinates.x) {
                    this.points.pop();
                }
            } else if (this.points[pointsLength - 1].vecY === -1) {
                if (this.points[pointsLength - 1].coordinates.y <= this.points[pointsLength - 2].coordinates.y) {
                    this.points.pop();
                }
            } else if (this.points[pointsLength - 1].vecY === 1) {
                if (this.points[pointsLength - 1].coordinates.y >= this.points[pointsLength - 2].coordinates.y) {
                    this.points.pop();
                }
            }
        }

        let sumOfSnake = sumOfDistances(this);

        pointsLength = this.points.length;

        if (sumOfSnake >= this.bodyLength) {
            this.points[pointsLength - 1].coordinates.x += this.points[pointsLength - 1].vecX * dt * this.speed;
            this.points[pointsLength - 1].coordinates.y += this.points[pointsLength - 1].vecY * dt * this.speed;
        }
    }

    turboMode(engaged, animation, style) {
        if (engaged) {
            this.speed = 0.4 * this.turbo;
            if (!this.turboEngaged || animation === 0) {
                this.color = style[Math.floor(Math.random() * style.length)];
            }
            this.turboEngaged = true;
        } else {
            this.speed = 0.4;
            this.color = "green";
            this.turboEngaged = false;
        }
    }
}

function sumOfDistances(snake) {
    let sum = 0;
    let pointsLength = snake.points.length;

    sum += distanceBetweenCoordinates(snake.headCoordinates, snake.points[0].coordinates);

    for (let i = 0; i < pointsLength - 1; i++) {
        sum += distanceBetweenCoordinates(snake.points[i].coordinates, snake.points[i + 1].coordinates);
    }

    return sum;
}

function distanceBetweenCoordinates(point1, point2) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

function collisionCircleRectangle(circle, rectangle) {
    let circleDistanceX = Math.abs(circle.coordinates.x - rectangle.x - rectangle.width / 2);
    let circleDistanceY = Math.abs(circle.coordinates.y - rectangle.y - rectangle.height / 2);

    if (circleDistanceX > (rectangle.width / 2 + circle.radius)) { return false; }
    if (circleDistanceY > (rectangle.height / 2 + circle.radius)) { return false; }

    if (circleDistanceX <= (rectangle.width / 2)) { return true; }
    if (circleDistanceY <= (rectangle.height / 2)) { return true; }

    let dx = circleDistanceX - rectangle.width / 2;
    let dy = circleDistanceY - rectangle.height / 2;

    return (dx * dx + dy * dy <= (circle.radius * circle.radius));
}

function makeRectangleWithSegements(snakeSize, snakePoint0, snakePoint1) {
    let segement = {
        x1: 0,
        x2: 0
    }

    let rectangle = new Rectangle(0, 0, 0, 0);

    if (snakePoint1.vecX !== 0) {
        segement.x1 = snakePoint1.coordinates.x;
        segement.x2 = snakePoint0.coordinates.x;

        let temp = 0;

        if (segement.x1 > segement.x2) {
            temp = segement.x1;
            segement.x1 = segement.x2;
            segement.x2 = temp;
        }

        rectangle.x = segement.x1;
        rectangle.y = snakePoint1.coordinates.y - snakeSize / 2;
        rectangle.width = segement.x2 - segement.x1;
        rectangle.height = snakeSize;
    } else {
        segement.x1 = snakePoint1.coordinates.y;
        segement.x2 = snakePoint0.coordinates.y;

        let temp = 0;

        if (segement.x1 > segement.x2) {
            temp = segement.x1;
            segement.x1 = segement.x2;
            segement.x2 = temp;
        }

        rectangle.x = snakePoint1.coordinates.x - snakeSize / 2;
        rectangle.y = segement.x1;
        rectangle.width = snakeSize;
        rectangle.height = segement.x2 - segement.x1;
    }

    return rectangle;
}

function collisionSnakeFruit(snake, fruit) {
    let pointsLength = snake.points.length;

    let snakeHeadPoint = new SnakePoint(snake.headCoordinates.x, snake.headCoordinates.y, snake.vecX, snake.vecY);

    let rectangle = makeRectangleWithSegements(snake.size, snakeHeadPoint, snake.points[0]);

    if (collisionCircleRectangle(fruit, rectangle)) {
        return true;
    }

    for (let i = 1; i < pointsLength; i++) {
        rectangle = makeRectangleWithSegements(snake.size, snake.points[i - 1], snake.points[i]);

        if (collisionCircleRectangle(fruit, rectangle)) {
            return true;
        }
    }

    return false;
}

function collisionSnakeHeadFruit(snake, fruit) {
    let snakeHeadRadius = snake.size / 2;

    let distanceX = Math.abs(fruit.coordinates.x - snake.headCoordinates.x);
    let distanceY = Math.abs(fruit.coordinates.y - snake.headCoordinates.y);

    return (distanceX * distanceX + distanceY * distanceY <= (snakeHeadRadius + fruit.radius) * (snakeHeadRadius + fruit.radius));
}

function collisionSnakeHeadWall(snake, nextHeadCoordinates) {
    if (nextHeadCoordinates.x - snake.size / 2 < 0 || nextHeadCoordinates.x + snake.size / 2 > snake.WIDTH) {
        return true;
    }

    if (nextHeadCoordinates.y - snake.size / 2 < 0 || nextHeadCoordinates.y + snake.size / 2 > snake.HEIGHT) {
        return true;
    }

    return false;
}

function collisionSnakeHeadRectangle(snake, rectangle) {
    let snakeHeadRadius = snake.size / 2;

    let distanceX = Math.abs(snake.headCoordinates.x - rectangle.x - rectangle.width / 2);
    let distanceY = Math.abs(snake.headCoordinates.y - rectangle.y - rectangle.height / 2);

    if (distanceX > (rectangle.width / 2 + snakeHeadRadius)) { return false; }
    if (distanceY > (rectangle.height / 2 + snakeHeadRadius)) { return false; }

    if (distanceX <= (rectangle.width / 2)) { return true; }
    if (distanceY <= (rectangle.height / 2)) { return true; }

    let dx = distanceX - rectangle.width / 2;
    let dy = distanceY - rectangle.height / 2;

    return (dx * dx + dy * dy <= (snakeHeadRadius * snakeHeadRadius));
}

function collisionSnakeHeadSnake(snake) {
    let pointsLength = snake.points.length;

    let segement = {
        x1: 0,
        x2: 0
    }

    let rectangle = new Rectangle(0, 0, 0, 0);

    for (let i = 2; i < pointsLength; i++) {
        rectangle = makeRectangleWithSegements(snake.size, snake.points[i - 1], snake.points[i]);

        if ((collisionSnakeHeadRectangle(snake, rectangle) && snake.firstSegmentLength() >= snake.size) || snake.isBackOnHimself()) {
            return true;
        }
    }

    return false;
}

function addScore(snake, MAX_PLAYER_NAME) {
    let item = window.localStorage.getItem("bestScores");

    let list = [];
    let listLength = 0;

    if (item !== null) {
        list = JSON.parse(item);
        listLength = list.length;
    }

    if (listLength < 10 || snake.score > list[listLength - 1].score) {
        let pName = prompt("Enter your name");

        if (pName === null || pName.length < 2 || pName.length > MAX_PLAYER_NAME) {
            return;
        }

        let player = {
            name: pName,
            score: snake.score
        }

        list.push(player);
        
        list.sort((a, b) => {
            return b.score - a.score;
        });

        while (list.length > 10) {
            list.pop();
        }

        window.localStorage.setItem("bestScores", JSON.stringify(list));
    }
}

let styles = {
    "blue": ["royalblue", "blue", "darkblue", "navy", "midnightblue"],
    "green": ["limegreen", "green", "darkgreen", "forestgreen", "darkolivegreen"],
    "red": ["red", "darkred", "firebrick", "crimson", "maroon"],
    "yellow": ["yellow", "gold", "goldenrod", "darkgoldenrod", "darkkhaki"],
    "purple": ["purple", "darkmagenta", "darkviolet", "indigo", "darkslateblue"],
    "orange": ["orange", "darkorange", "orangered", "tomato", "coral"],
    "pink": ["pink", "hotpink", "deeppink", "mediumvioletred", "palevioletred"],
}

document.addEventListener("DOMContentLoaded", function () {

    /** Récupération des informations liées au canvas */
    let canvas = document.getElementById("cvs");
    const WIDTH = canvas.width = window.innerWidth;
    const HEIGHT = canvas.height = window.innerHeight;
    let ctx = canvas.getContext("2d");

    let snake = new Snake(WIDTH, HEIGHT);
    let apple = new Fruit(snake);

    const MAX_PLAYER_NAME = 60;

    let game = true;
    let pause = false;

    let enterKey = false;
    let spaceKey = false;

    document.addEventListener("keydown", function (e) {
        switch (e.key) {
            case "ArrowRight": {
                if (snake.vecX === 0 && !pause) {
                    snake.vecX = 1;
                    snake.vecY = 0;
                    snake.turn();
                }
                break;
            }
            case "ArrowLeft": {
                if (snake.vecX === 0 && !pause) {
                    snake.vecX = -1;
                    snake.vecY = 0;
                    snake.turn();
                }
                break;
            }
            case "ArrowUp": {
                if (snake.vecY === 0 && !pause) {
                    snake.vecX = 0;
                    snake.vecY = -1;
                    snake.turn();
                }
                break;
            }
            case "ArrowDown": {
                if (snake.vecY === 0 && !pause) {
                    snake.vecX = 0;
                    snake.vecY = 1;
                    snake.turn();
                }
                break;
            }
            case "Enter": {
                enterKey ? enterKey = false : enterKey = true;
                break;
            }
            case " ": {
                spaceKey = true;
                break;
            }
            default: {
                break;
            }
        }
    });

    document.addEventListener("keyup", function (e) {
        switch (e.key) {
            case " ": {
                spaceKey = false;
                break;
            }
            default: {
                break;
            }
        }
    });

    /** Dernière mise à jour de l'affichage */
    let last = Date.now();
    let animation = 0;

    /** Dernière mise à jour */
    function update(now) {
        // delta de temps entre deux mises à jour 
        let dt = now - last;
        last = now;
        animation = (animation >= 200) ? 0 : animation + dt;

        if (enterKey && game) {
            pause = !pause;
            enterKey = false;
        }

        if (game && !pause) {
            let nextHeadCoordinates = {
                x: snake.headCoordinates.x + snake.vecX * dt * snake.speed,
                y: snake.headCoordinates.y + snake.vecY * dt * snake.speed
            }

            if (collisionSnakeHeadWall(snake, nextHeadCoordinates) || collisionSnakeHeadSnake(snake)) {
                addScore(snake, MAX_PLAYER_NAME);
                game = false;
            }

            let style = Object.values(styles)[Math.floor(Math.random() * Object.values(styles).length)];

            if (spaceKey) {
                snake.turboMode(true, animation, style);
            } else {
                snake.turboMode(false, animation, style);
            }

            snake.headCoordinates.x += snake.vecX * dt * snake.speed;
            snake.headCoordinates.y += snake.vecY * dt * snake.speed;


            if (collisionSnakeHeadFruit(snake, apple)) {
                snake.eatFruit();
                apple.respawn(snake);
            }

            snake.movePoints(dt);
        } else {
            // button to start a new game
        }
    }

    /** Réaffichage du contenu du canvas */
    function render() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        if (game || pause) {
            ctx.beginPath();
            ctx.strokeStyle = snake.color;
            ctx.lineWidth = snake.size;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            ctx.moveTo(snake.headCoordinates.x, snake.headCoordinates.y);

            for (let i = 0; i < snake.points.length; i++) {
                ctx.lineTo(snake.points[i].coordinates.x, snake.points[i].coordinates.y);
            }

            ctx.stroke();
            ctx.closePath();


            ctx.beginPath();
            ctx.fillStyle = apple.color;
            ctx.arc(apple.coordinates.x, apple.coordinates.y, apple.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = "green";
            ctx.ellipse(apple.coordinates.x + apple.radius / 3, apple.coordinates.y - apple.radius, apple.radius / 2, apple.radius / 4, 15, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = "#6E260E";
            ctx.ellipse(apple.coordinates.x, apple.coordinates.y - apple.radius, apple.radius / 3 + apple.radius / 4, apple.radius / 4, -5, 0, Math.PI);
            ctx.fill();
            ctx.closePath();


            ctx.beginPath();
            ctx.fillStyle = "white";

            if (snake.vecX !== 0) {
                if (snake.vecX === 1) {
                    ctx.arc(snake.headCoordinates.x - snake.size / 3, snake.headCoordinates.y - snake.size / 4, snake.size / 5, 0, 2 * Math.PI);
                    ctx.arc(snake.headCoordinates.x - snake.size / 3, snake.headCoordinates.y + snake.size / 4, snake.size / 5, 0, 2 * Math.PI);
                } else {
                    ctx.arc(snake.headCoordinates.x + snake.size / 3, snake.headCoordinates.y - snake.size / 4, snake.size / 5, 0, 2 * Math.PI);
                    ctx.arc(snake.headCoordinates.x + snake.size / 3, snake.headCoordinates.y + snake.size / 4, snake.size / 5, 0, 2 * Math.PI);
                }
            } else {
                if (snake.vecY === 1) {
                    ctx.arc(snake.headCoordinates.x - snake.size / 4, snake.headCoordinates.y - snake.size / 3, snake.size / 5, 0, 2 * Math.PI);
                    ctx.arc(snake.headCoordinates.x + snake.size / 4, snake.headCoordinates.y - snake.size / 3, snake.size / 5, 0, 2 * Math.PI);
                } else {
                    ctx.arc(snake.headCoordinates.x - snake.size / 4, snake.headCoordinates.y + snake.size / 3, snake.size / 5, 0, 2 * Math.PI);
                    ctx.arc(snake.headCoordinates.x + snake.size / 4, snake.headCoordinates.y + snake.size / 3, snake.size / 5, 0, 2 * Math.PI);
                }
            }

            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = "black";

            if (snake.vecX !== 0) {
                if (snake.vecX === 1) {
                    ctx.arc(snake.headCoordinates.x - snake.size / 3, snake.headCoordinates.y - snake.size / 4, snake.size / 10, 0, 2 * Math.PI);
                    ctx.arc(snake.headCoordinates.x - snake.size / 3, snake.headCoordinates.y + snake.size / 4, snake.size / 10, 0, 2 * Math.PI);
                } else {
                    ctx.arc(snake.headCoordinates.x + snake.size / 3, snake.headCoordinates.y - snake.size / 4, snake.size / 10, 0, 2 * Math.PI);
                    ctx.arc(snake.headCoordinates.x + snake.size / 3, snake.headCoordinates.y + snake.size / 4, snake.size / 10, 0, 2 * Math.PI);
                }
            } else {
                if (snake.vecY === 1) {
                    ctx.arc(snake.headCoordinates.x - snake.size / 4, snake.headCoordinates.y - snake.size / 3, snake.size / 10, 0, 2 * Math.PI);
                    ctx.arc(snake.headCoordinates.x + snake.size / 4, snake.headCoordinates.y - snake.size / 3, snake.size / 10, 0, 2 * Math.PI);
                } else {
                    ctx.arc(snake.headCoordinates.x - snake.size / 4, snake.headCoordinates.y + snake.size / 3, snake.size / 10, 0, 2 * Math.PI);
                    ctx.arc(snake.headCoordinates.x + snake.size / 4, snake.headCoordinates.y + snake.size / 3, snake.size / 10, 0, 2 * Math.PI);
                }
            }

            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.strokeStyle = "red";
            ctx.lineWidth = snake.size / 5;

            if (snake.vecX !== 0) {
                if (snake.vecX === 1) {
                    ctx.moveTo(snake.headCoordinates.x + snake.size / 3, snake.headCoordinates.y);
                    ctx.lineTo(snake.headCoordinates.x + snake.size / 2, snake.headCoordinates.y);
                } else {
                    ctx.moveTo(snake.headCoordinates.x - snake.size / 3, snake.headCoordinates.y);
                    ctx.lineTo(snake.headCoordinates.x - snake.size / 2, snake.headCoordinates.y);
                }
            } else {
                if (snake.vecY === 1) {
                    ctx.moveTo(snake.headCoordinates.x, snake.headCoordinates.y + snake.size / 3);
                    ctx.lineTo(snake.headCoordinates.x, snake.headCoordinates.y + snake.size / 2);
                } else {
                    ctx.moveTo(snake.headCoordinates.x, snake.headCoordinates.y - snake.size / 3);
                    ctx.lineTo(snake.headCoordinates.x, snake.headCoordinates.y - snake.size / 2);
                }
            }

            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.font = "20px monospace";
            ctx.fillStyle = "white";
            ctx.textAlign = "right";

            if (snake.turboEngaged) {
                ctx.fillStyle = "hotpink";
                ctx.fillText("Score (X2) : " + snake.score, WIDTH - 15, 30);
            } else {
                ctx.fillText("Score: " + snake.score, WIDTH - 15, 30);
            }

            ctx.closePath();

            if (pause) {
                ctx.beginPath();
                ctx.font = "40px monospace";
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.fillText("PAUSE", WIDTH / 2, HEIGHT / 2);
                ctx.closePath();
            }
        } else {
            let item = window.localStorage.getItem("bestScores");
            
            let list = [];
            let listLength = 0;

            if (item !== null) {
                list = JSON.parse(item);
                listLength = list.length;
            }

            ctx.beginPath();
            ctx.font = "50px monospace";
            ctx.fillStyle = "red";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 8);
            ctx.font = "30px monospace";

            if (listLength === 0) {
                ctx.fillStyle = "white";
                let dispText = "There will soon be a list of records here ;)";
                let pPoints = MAX_PLAYER_NAME - dispText.length;
                let text = "";

                for (let i = 0 ; i <= pPoints ; i++) {
                    text += ".";

                    if (i == pPoints / 2) {
                        text += dispText;

                        if (pPoints % 2 == 0) {
                            text += ".";
                        }
                    }
                }

                ctx.fillText(text, WIDTH / 2, (HEIGHT / 2));
                ctx.closePath();
            } else {
                for (let i = 0 ; i < listLength ; i++) {
                    switch (i) {
                        case 0: {
                            ctx.fillStyle = "gold";
                            break;
                        }
                        case 1: {
                            ctx.fillStyle = "silver";
                            break;
                        }
                        case 2: {
                            ctx.fillStyle = "#CD7F32";
                            break;
                        }
                        case 3: {
                            ctx.fillStyle = "crimson";
                            break;
                        }
                        case 4: {
                            ctx.fillStyle = "hotpink";
                            break;
                        }
                        case 5: {
                            ctx.fillStyle = "forestgreen";
                            break;
                        }
                        case 6: {
                            ctx.fillStyle = "darkmagenta";
                            break;
                        }
                        case 7: {
                            ctx.fillStyle = "saddlebrown";
                            break;
                        }
                        case 8: {
                            ctx.fillStyle = "grey";
                            break;
                        }
                        case 9: {
                            ctx.fillStyle = "royalblue";
                            break;
                        }
                        default: {
                            ctx.fillStyle = "red";
                            break;
                        }
                    }
                    let text = list[i].name + " ";
                    let textCat = list[i].name + list[i].score + "  ";
                    let pPoints = MAX_PLAYER_NAME - textCat.length;
                    
                    for (let j = 0 ; j <= pPoints ; j++) {
                        text += ".";
                    }

                    text += " " + list[i].score;
                    ctx.fillText(text, WIDTH / 2, (HEIGHT / 14) * (i + 3));
                }
            }

            ctx.closePath();
        }
    }

    /** Boucle de jeu */
    (function loop() {
        // précalcul de la prochaine image
        requestAnimationFrame(loop);
        // mise à jour du modèle de données
        update(Date.now());
        // affichage de la nouvelle image 
        render();
    })();


});
