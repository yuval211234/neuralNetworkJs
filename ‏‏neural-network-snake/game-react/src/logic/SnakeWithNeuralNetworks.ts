import { NumbersNeuralNetwork } from "./NeuralNetwork";
import { NTuple } from "./NTuple";
import { EvolutionNeuralNetworks, CreatorAndFitness } from "./EvolutionNeuralNetwork";
import { SnakeGame, cellType } from "./SnakeGame";


interface cell {
    row: number;
    col: number;
}

enum inputDirection {
    left = -1,
    forward = 0,
    right = 1
}

export class SnakeWithNeuralNetworks {

    createFirstGeneration = (hiddenLayersNumbers: number[], numberOfCreatorsPerGeneration: number): { creators: NumbersNeuralNetwork[] } => {
        const creators: NumbersNeuralNetwork[] = [];
        for (let creatorLocation = 0; creatorLocation < numberOfCreatorsPerGeneration; creatorLocation++) {
            const neuralNetwork = new NumbersNeuralNetwork();
            neuralNetwork.initNetwork(19, hiddenLayersNumbers, -1, 1, 1);
            creators.push(neuralNetwork);
        }

        return {
            creators
        };
    }

    initFirstGenerationFromCreator = (creator: NumbersNeuralNetwork, changeRate: number, numberOfCreatorsPerGeneration: number): { creators: NumbersNeuralNetwork[] } => {
        const evolutionNeuralNetwork = new EvolutionNeuralNetworks();
        const creators = evolutionNeuralNetwork.mutateCreators([creator], changeRate, numberOfCreatorsPerGeneration);

        return {
            creators
        }
    }

    playSnakeWithGenerations = (gameHeight: number, gameWidth: number, creators: NumbersNeuralNetwork[], numberOfGenerations: number, numberOfCreatorsToBreedToNextGeneration: number, maxNumberOfTurnsWithNoApple: number, changeRate: number): { newGeneration: NumbersNeuralNetwork[], bestCreatorsOfAllGenerationsAndThierFitness: CreatorAndFitness[] } => {
        let currGeneration = creators;
        let bestCreatorsOfAllGenerationsAndThierFitness: CreatorAndFitness[] = [];

        for (let generationNumber = 0; generationNumber < numberOfGenerations; generationNumber++) {
            console.log(`starting generation : ${generationNumber}`);
            const evolutionNeuralNetwork = new EvolutionNeuralNetworks();
            const { newCreators, bestCreatorOfGeneration, bestFitness } = evolutionNeuralNetwork.runGeneration(currGeneration, this.playSnake(gameHeight, gameWidth, maxNumberOfTurnsWithNoApple), numberOfCreatorsToBreedToNextGeneration, changeRate);
            currGeneration = newCreators;
            bestCreatorsOfAllGenerationsAndThierFitness.push({
                creator: bestCreatorOfGeneration,
                fitness: bestFitness
            });
            console.log(`end generation : ${generationNumber}`);
        }

        return {
            newGeneration: currGeneration,
            bestCreatorsOfAllGenerationsAndThierFitness
        };
    }

    playSnake = (gameHeight: number, gameWidth: number, maxNumberOfTurnsWithNoApple: number, drawFunction?: Function) => (creator: NumbersNeuralNetwork) => {
        const snakeGame = new SnakeGame(gameWidth, gameHeight);
        let currNumberOfTurnsWithNoApple = maxNumberOfTurnsWithNoApple;
        if (drawFunction) {
            drawFunction(snakeGame.generateGameGroundNumbers());
        }
        while (!snakeGame.isGameOver && currNumberOfTurnsWithNoApple) {
            const prevScore = snakeGame.score;
            const inputNTuple = this.makeSnakeInputNTuple(snakeGame);
            const directionDouble = creator.calculateLayersInNetwork(inputNTuple, Math.tanh).calculatedActivationLayers[creator.numberOfLayers - 1].nTupleValues[0];
            const direction = Math.round(directionDouble);
            snakeGame.calculateNewGameState(direction);

            if (snakeGame.score === prevScore) {
                currNumberOfTurnsWithNoApple--;
            }
            else {
                currNumberOfTurnsWithNoApple = maxNumberOfTurnsWithNoApple;
            }

            if (drawFunction) {
                drawFunction(snakeGame.generateGameGroundNumbers());
            }
        }

        const fitness = this.fitnessCalculators(snakeGame.numberOfTurns, snakeGame.score);

        return fitness;
    }

    playSnakeAsync = (gameHeight: number, gameWidth: number, maxNumberOfTurnsWithNoApple: number, drawFunction?: Function) => async (creator: NumbersNeuralNetwork) => {
        const snakeGame = new SnakeGame(gameWidth, gameHeight);
        let currNumberOfTurnsWithNoApple = maxNumberOfTurnsWithNoApple;
        if (drawFunction) {
            await drawFunction(snakeGame.generateGameGroundNumbers());
        }
        while (!snakeGame.isGameOver && currNumberOfTurnsWithNoApple) {
            const prevScore = snakeGame.score;
            const inputNTuple = this.makeSnakeInputNTuple(snakeGame);
            const directionDouble = creator.calculateLayersInNetwork(inputNTuple, Math.tanh).calculatedActivationLayers[creator.numberOfLayers - 1].nTupleValues[0];
            const direction = Math.round(directionDouble);
            snakeGame.calculateNewGameState(direction);

            if (snakeGame.score === prevScore) {
                currNumberOfTurnsWithNoApple--;
            }
            else {
                currNumberOfTurnsWithNoApple = maxNumberOfTurnsWithNoApple;
            }

            if (drawFunction) {
                await drawFunction(snakeGame.generateGameGroundNumbers());
            }
        }

        const fitness = this.fitnessCalculators(snakeGame.numberOfTurns, snakeGame.score);

        return fitness;
    }

    private makeSnakeInputNTuple = (snakeGame: SnakeGame) => {
        const head = snakeGame.snake[0];
        const directionValues: number[] = [];
        for (let row = -1; row <= 1; row++) {
            for (let col = -1; col <= 1; col++) {
                if (row !== 0 || col !== 0) {
                    const runner = { ...head };
                    let counter = 0;
                    let distanceToWall = 0;
                    let distanceToSnake = 1;
                    let distanceLength = 0;
                    while (!snakeGame.isSnakeOutOfBounds(runner)) {
                        counter++;
                        runner.col += col;
                        runner.row += row;
                        const fullLength = col === 0 ? snakeGame.gameHeight : row === 0 ? snakeGame.gameWidth : Math.sqrt(Math.pow(snakeGame.gameHeight, 2) + Math.pow(snakeGame.gameWidth, 2));
                        distanceLength = (counter - 1) / fullLength;
                        if (snakeGame.snake.find(snakeCell => snakeGame.checkEqualityBetweenTwoCells(runner, snakeCell))) {
                            if (distanceToSnake === -1) {
                                distanceToSnake = distanceLength;
                            }
                        }
                    }

                    distanceToWall = distanceLength;

                    directionValues.push(distanceToWall, distanceToSnake);
                }

            }

        }
        const angleToApple = this.calcAngle(head.col, head.row, snakeGame.appleLocation.col, snakeGame.appleLocation.row) / 180;
        return new NTuple([...directionValues, angleToApple, snakeGame.snakeDirection.x, snakeGame.snakeDirection.y]);
    }

    // private makeSnakeInputNTuple = (snakeGame: SnakeGame) => {
    //     const head = snakeGame.snake[0];
    //     const headRight: cell = {
    //         col: head.col + snakeGame.getNewDirection(inputDirection.right).x,
    //         row: head.row + snakeGame.getNewDirection(inputDirection.right).y,
    //     }
    //     const headForward: cell = {
    //         col: head.col + snakeGame.getNewDirection(inputDirection.forward).x,
    //         row: head.row + snakeGame.getNewDirection(inputDirection.forward).y,
    //     }
    //     const headLeft: cell = {
    //         col: head.col + snakeGame.getNewDirection(inputDirection.left).x,
    //         row: head.row + snakeGame.getNewDirection(inputDirection.left).y,
    //     }
    //     const cellTypeRight: cellType = snakeGame.isSnakeOutOfBounds(headRight) || snakeGame.checkIfSnakeGotStuckInTail(headRight)? cellType.snake : snakeGame.checkEqualityBetweenTwoCells(headRight, snakeGame.appleLocation)? cellType.apple: cellType.none;
    //     const cellTypeForward: cellType = snakeGame.isSnakeOutOfBounds(headForward) || snakeGame.checkIfSnakeGotStuckInTail(headForward)? cellType.snake : snakeGame.checkEqualityBetweenTwoCells(headForward, snakeGame.appleLocation)? cellType.apple: cellType.none;
    //     const cellTypeLeft: cellType = snakeGame.isSnakeOutOfBounds(headLeft) || snakeGame.checkIfSnakeGotStuckInTail(headLeft)? cellType.snake : snakeGame.checkEqualityBetweenTwoCells(headLeft, snakeGame.appleLocation)? cellType.apple: cellType.none;
    //     const angleToApple = this.calcAngle(head.col, head.row, snakeGame.appleLocation.col, snakeGame.appleLocation.row) / 180;
    //     const angleToTail = this.calcAngle(head.col, head.row, snakeGame.snake[snakeGame.snake.length - 1].col, snakeGame.snake[snakeGame.snake.length - 1].row) / 180;
    //     return new NTuple([cellTypeRight, cellTypeForward, cellTypeLeft, angleToApple, angleToTail, snakeGame.snakeDirection.x, snakeGame.snakeDirection.y]);
    // }

    private calcAngle(vectorX: number, vectorY: number, otherVectorX: number, otherVectorY: number) {
        const angle = Math.atan2(otherVectorX - vectorX, vectorY - otherVectorY) / (2 * Math.PI) * 360;
        return angle;
    }

    private fitnessCalculators = (numberOfTurns: number, score: number) => {
        return numberOfTurns + Math.pow(2, score) + Math.pow(score, 2.1) * 500 - Math.pow(score, 1.2) * Math.pow(0.25 * numberOfTurns, 1.3);
    }
}