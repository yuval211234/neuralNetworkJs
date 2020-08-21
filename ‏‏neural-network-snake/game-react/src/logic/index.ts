import { SnakeWithNeuralNetworks } from "./SnakeWithNeuralNetworks";
import { NumbersNeuralNetwork } from "./NeuralNetwork";
import { NTuple } from "./NTuple";
import { Matrix } from "./Matrix";

const getLastCreatorFromLocalStorage = (): {
    creator: NumbersNeuralNetwork,
    fitness: number
} | null => {
    const creatorString = localStorage.getItem(`creator${localStorage.length - 1}`);
    if (creatorString) {
        const creatorInfo = (JSON.parse(creatorString)) as {
            weightsMatrixsBetweenLayers: number[][][],
            biasesNTuplesBetweenLayers: number[][],
            fitness: number
        };
        const newCreator = new NumbersNeuralNetwork();
        const creatorMatrixes = creatorInfo.weightsMatrixsBetweenLayers.map(matrixValues => new Matrix(matrixValues));
        const creatorBiasses = creatorInfo.biasesNTuplesBetweenLayers.map(biasValues => new NTuple(biasValues));
        newCreator.initNetworkFromMatrixAndBiasses(creatorMatrixes, creatorBiasses);
        return {
            creator: newCreator,
            fitness: creatorInfo.fitness
        };
    }
    else {
        return null;
    }
}

export const runSnakeGenerations = (numberOfGenerations: number, height: number, width: number) => {
    const snakeWithNeuralNetworks = new SnakeWithNeuralNetworks();
    const creatorInfo = getLastCreatorFromLocalStorage();
    let creators: NumbersNeuralNetwork[] = [];
    if (creatorInfo) {
        creators = snakeWithNeuralNetworks.initFirstGenerationFromCreator(creatorInfo.creator, 0.03, 500).creators;
    }
    else {
        creators = snakeWithNeuralNetworks.createFirstGeneration([20, 12], 500).creators;
    }
    const { newGeneration, bestCreatorsOfAllGenerationsAndThierFitness } = snakeWithNeuralNetworks.playSnakeWithGenerations(height, width, creators, numberOfGenerations, 10, 300, 0.03);
    bestCreatorsOfAllGenerationsAndThierFitness.forEach(({ creator, fitness }, creatorLocation) => {
        if (creatorLocation % 10 === 0 || creatorLocation === bestCreatorsOfAllGenerationsAndThierFitness.length - 1) {
            const allMatrixNumbersTogether: number[][][] = creator.weightsMatrixsBetweenLayers.map(matrix => matrix.matrixValues);
            const allBiasNumbersTogether: number[][] = creator.biasesNTuplesBetweenLayers.map(nTuple => nTuple.nTupleValues);
            localStorage.setItem(`creator${localStorage.length}`, JSON.stringify({
                weightsMatrixsBetweenLayers: allMatrixNumbersTogether,
                biasesNTuplesBetweenLayers: allBiasNumbersTogether,
                fitness
            }));
        }
    });

}