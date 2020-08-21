import { NumbersNeuralNetwork } from "./NeuralNetwork";
import { NTuple } from "./NTuple";
import { EvolutionNeuralNetworks } from "./EvolutionNeuralNetwork";

export enum cellType {
    snake = 1,
    none = 0,
    apple = -1
}

interface cell {
    row: number;
    col: number;
}

interface direction {
    x: number;
    y: number;
};

enum inputDirection {
    left = -1,
    forward = 0,
    right = 1
}

export class SnakeGame {
    gameWidth: number;
    gameHeight: number;
    snake: cell[];
    snakeDirection: direction;
    appleLocation: cell;
    score: number;
    isGameOver: boolean;
    numberOfTurns: number;

    constructor(gameWidth: number, gameHeight: number) {
        this.gameHeight = gameHeight;
        this.gameWidth = gameWidth;
        const snakeStartingCell: cell = this.getSnakeCellStartingPosition();
        this.snake = [snakeStartingCell];
        this.snakeDirection = {
            x: 0,
            y: 1
        };
        this.appleLocation = this.getNewAppleLocation();
        this.score = 0;
        this.isGameOver = false;
        this.numberOfTurns = 0;
    }

    calculateNewGameState = (direction: inputDirection) => {
        this.numberOfTurns++;
        const head = this.snake[0];
        this.snakeDirection = this.getNewDirection(direction);
        const newHeadRow = head.row + this.snakeDirection.y;
        const newHeadCol = head.col + this.snakeDirection.x;
        const newHead: cell = {
            row: newHeadRow,
            col: newHeadCol
        };

        if(!this.isSnakeOutOfBounds(newHead)) {
            if(this.checkEqualityBetweenTwoCells(newHead, this.appleLocation)){
                this.score++;
                this.snake.unshift(newHead);
                if(this.snake.length === this.gameHeight * this.gameWidth){
                    this.isGameOver = true;
                }
                else{
                  this.appleLocation = this.getNewAppleLocation();
                } 
            }
            else {
                this.snake = this.calculateNewSnakeCells();
                this.snake[0] = newHead;
                if(this.checkIfSnakeGotStuckInTail(newHead)){
                    this.isGameOver = true;
                }
            }
        }
        else {
            this.isGameOver = true;
        }
    }

    generateGameGroundNTuple = (): NTuple => {
        const gameGroundNTupleValues: number[] = [];
        for (let cellLocation = 0; cellLocation < this.gameHeight * this.gameWidth; cellLocation++) {
            const cellTrueLocation: cell = {
                col: cellLocation % this.gameWidth,
                row: Math.floor(cellLocation / this.gameWidth)
            }

            const isCellSnake = !!this.snake.find(cell => {
                return this.checkEqualityBetweenTwoCells(cellTrueLocation, cell);
            });

            const isCellApple = this.checkEqualityBetweenTwoCells(cellTrueLocation, this.appleLocation);
            
            const newCellValue =  isCellSnake? cellType.snake : isCellApple? cellType.apple : cellType.none;

            gameGroundNTupleValues.push(newCellValue);
        }

        return new NTuple(gameGroundNTupleValues);
    }

    checkIfSnakeGotStuckInTail = (head: cell): boolean => {
        return !!this.snake.find((cell, cellLocation) => {
            return cellLocation !== 0 && this.checkEqualityBetweenTwoCells(head, cell);
        });
    }

    generateGameGroundNumbers = (): number[][] => {
        const gameGroundNumbers: number[][] = [];
        for (let row = 0; row < this.gameHeight; row++) {
            const gameGroundRowNumbers: number[] = [];
            for (let col = 0; col < this.gameWidth; col++) {
                const isCellApple = this.checkEqualityBetweenTwoCells({col, row}, this.appleLocation);

                const isCellSnake = !!this.snake.find(cell => {
                    return this.checkEqualityBetweenTwoCells({col, row}, cell);
                });
            
                const number = isCellSnake? cellType.snake : isCellApple? cellType.apple : cellType.none;
                gameGroundRowNumbers.push(number);
            }
            gameGroundNumbers.push(gameGroundRowNumbers);
        }

        return gameGroundNumbers;
    }

    private getNewAppleLocation = () => {
        let row = Math.floor(Math.random() * this.gameHeight);
        let col = Math.floor(Math.random() * this.gameWidth);
        while (this.snake.find(cell => this.checkEqualityBetweenTwoCells(cell, {row,col}))) {
            row = Math.floor(Math.random() * this.gameHeight);
            col = Math.floor(Math.random() * this.gameWidth);
        }

        return {
            row,
            col
        }
    }

    checkEqualityBetweenTwoCells = (cell: cell, otherCell: cell) => {
        return cell.row === otherCell.row && cell.col === otherCell.col;
    }

    private calculateNewSnakeCells = (): cell[] => {
        const newSnake = this.snake.map((cell, cellLocation, snakeCells) => {
            let newCell = cell;
            if(cellLocation !== 0){
                newCell = snakeCells[cellLocation - 1];
            }
            
            return newCell;
        });

        return newSnake;
    }

    isSnakeOutOfBounds = (headCell: cell): boolean => {
        return headCell.row >= this.gameHeight || headCell.col >= this.gameWidth || headCell.row < 0 || headCell.col < 0;
    }

    getNewDirection = (direction: inputDirection): direction => {
        const newDirection: direction = {
            x: this.snakeDirection.x,
            y: this.snakeDirection.y
        };
        if (direction !== 0) {
            if (this.snakeDirection.x !== 0) {
                newDirection.x = 0;
                newDirection.y = this.snakeDirection.x * direction;
            }
            else {
                newDirection.y = 0;
                newDirection.x = this.snakeDirection.y * -direction;
            }
        }

        return newDirection;
    }

    private getSnakeCellStartingPosition = (): cell => {
        const row = Math.floor(this.gameHeight / 2);
        const col = Math.floor(this.gameWidth / 2);
        return {
            row,
            col
        }
    }
}