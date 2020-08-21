import { NumbersNeuralNetwork } from "./NeuralNetwork";
import { Matrix } from "./Matrix";
import { NTuple } from "./NTuple";

export interface CreatorAndFitness {
    creator: NumbersNeuralNetwork;
    fitness: number;
}

export class EvolutionNeuralNetworks {
    runGeneration = (creators: NumbersNeuralNetwork[], creatorActivityFunction: (creator: NumbersNeuralNetwork) => number, numberOfCreatorsToBreedToNextGeneration: number, mutationFactor: number): { newCreators: NumbersNeuralNetwork[], bestCreatorOfGeneration: NumbersNeuralNetwork, bestFitness: number } => {
        const creatorsWithThierFitness = creators.map((creator): CreatorAndFitness => {
            const creatorFitness = creatorActivityFunction(creator);
            return {
                creator: creator,
                fitness: creatorFitness
            };
        });

        const creatorsWithFitnessOrderFromHighToLow = creatorsWithThierFitness.sort(({ fitness: currFitness }, { fitness: nextFitness }) => {
            return nextFitness - currFitness;
        });

        const bestCreators = creatorsWithFitnessOrderFromHighToLow.map(({ creator }) => creator).slice(0, numberOfCreatorsToBreedToNextGeneration);

        const {creator: bestCreatorOfGeneration, fitness: bestFitness} = creatorsWithFitnessOrderFromHighToLow[0];
        
        const newCreators = this.mutateCreators(bestCreators, mutationFactor, creators.length);
        newCreators[newCreators.length - 1] = bestCreatorOfGeneration;

        return {
            newCreators,
            bestCreatorOfGeneration,
            bestFitness
        };
    }

    mutateCreators = (creators: NumbersNeuralNetwork[], mutationFactor: number, numberOfMutations: number): NumbersNeuralNetwork[] => {
        const numberOfMutationsPerCreators = Math.floor(numberOfMutations / creators.length);
        const mutatedCreators: NumbersNeuralNetwork[] = [];
        creators.forEach(creator => {
            for (let mutationNumber = 0; mutationNumber < numberOfMutationsPerCreators; mutationNumber++) {
                const mutatedCreator = this.mutateCreator(creator, mutationFactor);
                mutatedCreators.push(mutatedCreator);
            }
        });

        const remainingNumber = numberOfMutations % creators.length;

        for (let mutationNumber = 0; mutationNumber < remainingNumber; mutationNumber++) {
            const mutatedCreator = this.mutateCreator(creators[0], mutationFactor);
            mutatedCreators.push(mutatedCreator);
        }

        return mutatedCreators;
    }

    private mateCreators = (creators: NumbersNeuralNetwork[]) => {
        const children = creators.map((creator, creatorIndex, creators) => {
            const randomCreatorToBreedWithNumber = Math.floor((Math.random() * creators.length));
            const randomCreatorToBreedWith = creators[randomCreatorToBreedWithNumber];
            return this.mateTwoCreators(creator, randomCreatorToBreedWith);
        });

        children.unshift(creators[0]);

        return children;
    }

    private mateTwoCreators = (firstCreator: NumbersNeuralNetwork, secondCreator: NumbersNeuralNetwork): NumbersNeuralNetwork => {
        const howMuchToTakeOfFirstCreator = Math.random();
        const childNumberNeuralNetwork = firstCreator.mergeWithNumberNeuralNetwork(secondCreator, howMuchToTakeOfFirstCreator);
        return childNumberNeuralNetwork;
    }



    private mutateCreator = (creator: NumbersNeuralNetwork, mutationFactor: number): NumbersNeuralNetwork => {
        const mutationWieghts = creator.weightsMatrixsBetweenLayers.map(weightsMatrix => {
            const randomFactorNumbersMatrix = this.fillMatrixWithNumberByChance(NumbersNeuralNetwork.generateRandomWeightsMatrix(-1, 1, weightsMatrix.width, weightsMatrix.height), 0, mutationFactor);
            const mutatedMatrix = weightsMatrix.addMatrix(randomFactorNumbersMatrix);
            return mutatedMatrix;
        });

        const mutationBiases = creator.biasesNTuplesBetweenLayers.map(biasesNTuple => {
            const randomFactorNumbersNTuple = this.fillBiasesWithNumberByChance(NumbersNeuralNetwork.generateRandomBiasesNTuple(-1, 1, biasesNTuple.length), 0, mutationFactor);
            const mutatedNtuple = biasesNTuple.addNTuple(randomFactorNumbersNTuple);
            return mutatedNtuple;
        });

        const creatorAfterChanges = new NumbersNeuralNetwork();
        creatorAfterChanges.initNetworkFromMatrixAndBiasses(mutationWieghts, mutationBiases);

        return creatorAfterChanges;
    }

    private fillMatrixWithNumberByChance = (matrix: Matrix, number: number, chance: number) => {
        const newWeightsMatrix: number[][] = [];
        for (let row = 0; row < matrix.height; row++) {
            const newValuesRow: number[] = [];
            for (let col = 0; col < matrix.width; col++) {
                const isPutNumber = NumbersNeuralNetwork.generateRandomFloatInRange(0, 1) > chance;
                const newValue = isPutNumber? number : matrix.matrixValues[row][col];
                newValuesRow.push(newValue);
            }
            newWeightsMatrix.push(newValuesRow);
        }
        return new Matrix(newWeightsMatrix);
    }

    private fillBiasesWithNumberByChance = (bias: NTuple, number: number, chance: number) => {
        const newBiasValues: number[] = [];
        for (let col = 0; col < bias.length; col++) {
            const isPutNumber = NumbersNeuralNetwork.generateRandomFloatInRange(0, 1) > chance;
            const newValue = isPutNumber? number : bias.nTupleValues[col];
            newBiasValues.push(newValue);
        }
        return new NTuple(newBiasValues);
    }
}