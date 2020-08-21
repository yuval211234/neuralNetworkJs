import { Matrix } from "./Matrix";
import { NTuple } from "./NTuple";
import fileSystem from 'file-system';

export class NumbersNeuralNetwork {
    public weightsMatrixsBetweenLayers: Matrix[] = [];
    public biasesNTuplesBetweenLayers: NTuple[] = [];
    public numberOfLayers: number = 0;

    initNetworkFromMatrixAndBiasses = (weightsMatrixsBetweenLayers: Matrix[], biasesNTuplesBetweenLayers: NTuple[]) => {
        this.weightsMatrixsBetweenLayers = weightsMatrixsBetweenLayers;
        this.biasesNTuplesBetweenLayers = biasesNTuplesBetweenLayers;
        this.numberOfLayers = weightsMatrixsBetweenLayers.length + 1;
    }

    initNetwork = (numberOfInputs: number, numberOfNodesInHiddenLayers: number[], minRandomNumbers: number, maxRandomNumbers: number, numberOfResualts: number) => {
        const weightsMatrixsBetweenLayers = NumbersNeuralNetwork.generateRandomWeightsMatrixs(numberOfInputs, numberOfNodesInHiddenLayers, minRandomNumbers, maxRandomNumbers, numberOfResualts);
        const biasesNTuplesBetweenLayers = NumbersNeuralNetwork.generateRandomBiasesNTuples(numberOfNodesInHiddenLayers, minRandomNumbers, maxRandomNumbers, numberOfResualts);
        this.initNetworkFromMatrixAndBiasses(weightsMatrixsBetweenLayers, biasesNTuplesBetweenLayers);
    }

    saveNetworkToFile = (fileName: string) => {
        const allMatrixNumbersTogether: number[][][] = this.weightsMatrixsBetweenLayers.map(matrix => matrix.matrixValues);
        const allBiasNumbersTogether: number[][] = this.biasesNTuplesBetweenLayers.map(nTuple => nTuple.nTupleValues);
        fileSystem.writeFileSync(fileName, JSON.stringify({
            weightsMatrixsBetweenLayers: allMatrixNumbersTogether,
            biasesNTuplesBetweenLayers: allBiasNumbersTogether
        }));
    }

    saveNetworkToLocalStorage = (key: string) => {
        const allMatrixNumbersTogether: number[][][] = this.weightsMatrixsBetweenLayers.map(matrix => matrix.matrixValues);
        const allBiasNumbersTogether: number[][] = this.biasesNTuplesBetweenLayers.map(nTuple => nTuple.nTupleValues);
        localStorage.setItem(key, JSON.stringify({
            weightsMatrixsBetweenLayers: allMatrixNumbersTogether,
            biasesNTuplesBetweenLayers: allBiasNumbersTogether
        }));
    }

    initNetworkFromLocalStorage = (key: string) => {
        const content = localStorage.getItem(key);
        const matrixAndBiases = (JSON.parse(content ? content : '{}')) as { weightsMatrixsBetweenLayers: number[][][], biasesNTuplesBetweenLayers: number[][] };
        const weightsMatrixsBetweenLayers = matrixAndBiases.weightsMatrixsBetweenLayers.map(matrixNumbers => new Matrix(matrixNumbers));
        const biasesNTuplesBetweenLayers = matrixAndBiases.biasesNTuplesBetweenLayers.map(biasNumbers => new NTuple(biasNumbers));
        this.initNetworkFromMatrixAndBiasses(weightsMatrixsBetweenLayers, biasesNTuplesBetweenLayers);
    }

    initNetworkFromFile = async (fileName: string) => {
        return new Promise((resolve, reject) => {
            fileSystem.readFile(fileName, (err: any, content: any) => {
                if (err) reject(err);
                const matrixAndBiases = (JSON.parse(content)) as { weightsMatrixsBetweenLayers: number[][][], biasesNTuplesBetweenLayers: number[][] };
                const weightsMatrixsBetweenLayers = matrixAndBiases.weightsMatrixsBetweenLayers.map(matrixNumbers => new Matrix(matrixNumbers));
                const biasesNTuplesBetweenLayers = matrixAndBiases.biasesNTuplesBetweenLayers.map(biasNumbers => new NTuple(biasNumbers));
                this.initNetworkFromMatrixAndBiasses(weightsMatrixsBetweenLayers, biasesNTuplesBetweenLayers);
                resolve();
            });
        });

    }

    calculateLayersInNetwork = (inputNTuple: NTuple, reductionFuction: Function): { calculatedActivationLayers: NTuple[], calculatedActivationBeforeReductionLayers: NTuple[] } => {
        const calculatedActivationLayers: NTuple[] = [inputNTuple];
        const calculatedActivationBeforeReductionLayers: NTuple[] = [];
        const nextActivationBeforeReductionLayer = this.weightsMatrixsBetweenLayers[0]
            .multiplayByNTuple(inputNTuple)
            .addNTuple(this.biasesNTuplesBetweenLayers[0]);

        const nextActivationLayer = nextActivationBeforeReductionLayer.applyFunction(reductionFuction);

        calculatedActivationBeforeReductionLayers.push(nextActivationBeforeReductionLayer);
        calculatedActivationLayers.push(nextActivationLayer);

        for (let layerNumber = 1; layerNumber < this.numberOfLayers - 1; layerNumber++) {
            const nextActivationBeforeReductionLayer = this.weightsMatrixsBetweenLayers[layerNumber]
                .multiplayByNTuple(calculatedActivationLayers[layerNumber])
                .addNTuple(this.biasesNTuplesBetweenLayers[layerNumber]);

            const nextActivationLayer = nextActivationBeforeReductionLayer.applyFunction(reductionFuction);

            calculatedActivationBeforeReductionLayers.push(nextActivationBeforeReductionLayer);
            calculatedActivationLayers.push(nextActivationLayer);
        }

        return {
            calculatedActivationLayers,
            calculatedActivationBeforeReductionLayers
        };
    }

    backPropegation = (layersActivations: NTuple[], layersActivationsBeforeReduction: NTuple[], derivativeOfReductionFunction: Function, expectedResualt: NTuple): { weightsDeltaMatrixsBetweenLayers: Matrix[], biasesDeltaNTuplesBetweenLayers: NTuple[] } => {
        const weightsDeltaMatrixsBetweenLayers: Matrix[] = [];
        const biasesDeltaNTuplesBetweenLayers: NTuple[] = [];
        const derivativeOfReductionOfActivationBeforeReduction = layersActivationsBeforeReduction[layersActivationsBeforeReduction.length - 1].applyFunction(derivativeOfReductionFunction);
        const error = layersActivations[layersActivations.length - 1].addNTuple(expectedResualt.multiplayByNumber(-1))
        let delta: NTuple = error.multiplayByNTuple(derivativeOfReductionOfActivationBeforeReduction);
        biasesDeltaNTuplesBetweenLayers.unshift(delta);
        weightsDeltaMatrixsBetweenLayers.unshift(delta.multiplayByNTupleToMatrix(layersActivations[layersActivations.length - 2]));
        for (let layerLocation = layersActivations.length - 2; layerLocation > 0; layerLocation--) {
            const derivativeOfReductionOfActivationBeforeReduction = layersActivationsBeforeReduction[layerLocation - 1].applyFunction(derivativeOfReductionFunction);
            const error = this.weightsMatrixsBetweenLayers[layerLocation]
                .calculateFlippedMatrix()
                .multiplayByNTuple(delta);
            delta = error.multiplayByNTuple(derivativeOfReductionOfActivationBeforeReduction);
            biasesDeltaNTuplesBetweenLayers.unshift(delta);
            weightsDeltaMatrixsBetweenLayers.unshift(delta.multiplayByNTupleToMatrix(layersActivations[layerLocation - 1]));
        }

        return {
            weightsDeltaMatrixsBetweenLayers,
            biasesDeltaNTuplesBetweenLayers
        };
    }

    updateMiniBatch = (inputs: NTuple[], expectedResualts: NTuple[], reductionFuction: Function, derivativeOfReductionFunction: Function, learnRate: number) => {
        const firstInput = inputs[0];
        const firstExpectedResualt = expectedResualts[0];
        const { calculatedActivationLayers, calculatedActivationBeforeReductionLayers } = this.calculateLayersInNetwork(firstInput, reductionFuction);
        const { weightsDeltaMatrixsBetweenLayers, biasesDeltaNTuplesBetweenLayers } = this.backPropegation(calculatedActivationLayers, calculatedActivationBeforeReductionLayers, derivativeOfReductionFunction, firstExpectedResualt);
        let newBiases = biasesDeltaNTuplesBetweenLayers;
        let newWeightsDeltaMatrixsBetweenLayers = weightsDeltaMatrixsBetweenLayers;
        for (let currentInputLocation = 1, currentExpectedResualtLocation = 1; currentInputLocation < inputs.length; currentInputLocation++, currentExpectedResualtLocation++) {
            const currentInput = inputs[currentInputLocation];
            const currentExpectedResualt = expectedResualts[currentExpectedResualtLocation];
            const { calculatedActivationLayers, calculatedActivationBeforeReductionLayers } = this.calculateLayersInNetwork(currentInput, reductionFuction);
            const { weightsDeltaMatrixsBetweenLayers, biasesDeltaNTuplesBetweenLayers } = this.backPropegation(calculatedActivationLayers, calculatedActivationBeforeReductionLayers, derivativeOfReductionFunction, currentExpectedResualt);
            newBiases = newBiases.map((biasesNTuplesBetweenLayers, currLayerLocation) => biasesNTuplesBetweenLayers.addNTuple(biasesDeltaNTuplesBetweenLayers[currLayerLocation]));
            newWeightsDeltaMatrixsBetweenLayers = newWeightsDeltaMatrixsBetweenLayers.map((weightsMatrixsBetweenLayers, currLayerLocation) => weightsMatrixsBetweenLayers.addMatrix(weightsDeltaMatrixsBetweenLayers[currLayerLocation]));
        }

        this.weightsMatrixsBetweenLayers = this.weightsMatrixsBetweenLayers.map((weightsMatrixsBetweenLayers, currLayerLocation) => weightsMatrixsBetweenLayers.addMatrix(newWeightsDeltaMatrixsBetweenLayers[currLayerLocation].multiplayByNumber(-1 * learnRate * inputs.length)));
        this.biasesNTuplesBetweenLayers = this.biasesNTuplesBetweenLayers.map((biasesNTuplesBetweenLayers, currLayerLocation) => biasesNTuplesBetweenLayers.addNTuple(newBiases[currLayerLocation].multiplayByNumber(-1 * learnRate * inputs.length)));
    }

    mergeWithNumberNeuralNetwork = (numbersNeuralNetwork: NumbersNeuralNetwork, howMuchToTakeFromThisNeuralNetwork: number): NumbersNeuralNetwork => {
        if (this.checkSameEqualityOfNumberNeuralNetworks(numbersNeuralNetwork)) {
            const mergedMatrixes = this.weightsMatrixsBetweenLayers.map((currWeightsMatrixsBetweenLayers, matrixIndex) => {
                return currWeightsMatrixsBetweenLayers
                    .multiplayByNumber(howMuchToTakeFromThisNeuralNetwork)
                    .addMatrix(numbersNeuralNetwork.weightsMatrixsBetweenLayers[matrixIndex]
                        .multiplayByNumber(1 - howMuchToTakeFromThisNeuralNetwork));
            });

            const mergedBiases = this.biasesNTuplesBetweenLayers.map((currBiasesNTuplesBetweenLayers, biassIndex) => {
                return currBiasesNTuplesBetweenLayers
                    .multiplayByNumber(howMuchToTakeFromThisNeuralNetwork)
                    .addNTuple(numbersNeuralNetwork.biasesNTuplesBetweenLayers[biassIndex]
                        .multiplayByNumber(1 - howMuchToTakeFromThisNeuralNetwork));
            })

            const newNumberNeuralNetwork = new NumbersNeuralNetwork();
            newNumberNeuralNetwork.initNetworkFromMatrixAndBiasses(mergedMatrixes, mergedBiases);

            return newNumberNeuralNetwork;
        }
        else {
            throw ('matrixs sizes must be the same');
        }

    }

    private checkSameEqualityOfNumberNeuralNetworks = (NumbersNeuralNetwork: NumbersNeuralNetwork): boolean => {
        let sameNumberOfWeightsAndBiasses = this.numberOfLayers === NumbersNeuralNetwork.numberOfLayers;
        if (sameNumberOfWeightsAndBiasses) {
            const sameMatrixesSize = !this.weightsMatrixsBetweenLayers.find((matrix, layerNumber) => {
                const otherMatrix = NumbersNeuralNetwork.weightsMatrixsBetweenLayers[layerNumber];
                return matrix.height != otherMatrix.height || matrix.width != otherMatrix.width;
            });

            const sameBiasesSize = !this.biasesNTuplesBetweenLayers.find((biass, layerNumber) => {
                const otherBiass = NumbersNeuralNetwork.biasesNTuplesBetweenLayers[layerNumber];
                return biass.length != otherBiass.length;
            });

            sameNumberOfWeightsAndBiasses = sameMatrixesSize && sameBiasesSize;
        }

        return sameNumberOfWeightsAndBiasses;
    }

    static generateRandomWeightsMatrixs = (numberOfInputs: number, numberOfNodesInHiddenLayers: number[], minRandomNumbers: number, maxRandomNumbers: number, numberOfResualts: number): Matrix[] => {
        const weightsMatrixsBetweenLayersWithRandomNumbers: Matrix[] = [];
        const InputLayerAndFirstHiddenLayerWieghtsMatrix = NumbersNeuralNetwork.generateRandomWeightsMatrix(minRandomNumbers, maxRandomNumbers, numberOfInputs, numberOfNodesInHiddenLayers[0]);
        weightsMatrixsBetweenLayersWithRandomNumbers.push(InputLayerAndFirstHiddenLayerWieghtsMatrix);
        let hiddenLayer;
        for (hiddenLayer = 0; hiddenLayer < numberOfNodesInHiddenLayers.length - 1; hiddenLayer++) {
            const hiddenLayerToNextHiddenLayerWieghtsMatrix = NumbersNeuralNetwork.generateRandomWeightsMatrix(minRandomNumbers, maxRandomNumbers, numberOfNodesInHiddenLayers[hiddenLayer], numberOfNodesInHiddenLayers[hiddenLayer + 1]);
            weightsMatrixsBetweenLayersWithRandomNumbers.push(hiddenLayerToNextHiddenLayerWieghtsMatrix);
        }
        const LastHiddenLayerAndResaultLayerWieghtsMatrix = NumbersNeuralNetwork.generateRandomWeightsMatrix(minRandomNumbers, maxRandomNumbers, numberOfNodesInHiddenLayers[hiddenLayer], numberOfResualts);
        weightsMatrixsBetweenLayersWithRandomNumbers.push(LastHiddenLayerAndResaultLayerWieghtsMatrix);

        return weightsMatrixsBetweenLayersWithRandomNumbers;
    }

    static generateRandomBiasesNTuples = (numberOfNodesInHiddenLayers: number[], minRandomNumbers: number, maxRandomNumbers: number, numberOfResualts: number): NTuple[] => {
        const RandomBiasesNTuples: NTuple[] = [];
        for (let row = 0; row < numberOfNodesInHiddenLayers.length; row++) {
            const randomBiasesNTuple = NumbersNeuralNetwork.generateRandomBiasesNTuple(minRandomNumbers, maxRandomNumbers, numberOfNodesInHiddenLayers[row]);
            RandomBiasesNTuples.push(randomBiasesNTuple);
        }

        const lastRandomBiasesNTuple = NumbersNeuralNetwork.generateRandomBiasesNTuple(minRandomNumbers, maxRandomNumbers, numberOfResualts);
        RandomBiasesNTuples.push(lastRandomBiasesNTuple);

        return RandomBiasesNTuples;
    }

    static generateRandomWeightsMatrix = (minRandomNumbers: number, maxRandomNumbers: number, width: number, height: number): Matrix => {
        const weightsMatrixsBetweenLayersWithRandomNumbers: number[][] = [];
        for (let row = 0; row < height; row++) {
            const newColsInMatrix: number[] = [];
            for (let col = 0; col < width; col++) {
                newColsInMatrix.push(NumbersNeuralNetwork.generateRandomFloatInRange(minRandomNumbers, maxRandomNumbers));
            }
            weightsMatrixsBetweenLayersWithRandomNumbers.push(newColsInMatrix);
        }

        return new Matrix(weightsMatrixsBetweenLayersWithRandomNumbers);
    }

    static generateRandomBiasesNTuple = (minRandomNumbers: number, maxRandomNumbers: number, length: number): NTuple => {
        const RandomBiasesNTuple: number[] = [];
        for (let row = 0; row < length; row++) {
            RandomBiasesNTuple.push(NumbersNeuralNetwork.generateRandomFloatInRange(minRandomNumbers, maxRandomNumbers));
        }

        return new NTuple(RandomBiasesNTuple);
    }

    static generateRandomFloatInRange = (minRandomNumbers: number, maxRandomNumbers: number, ) => {
        const min = minRandomNumbers;
        const max = maxRandomNumbers;
        return Math.random() * (max - min) + min;
    }

}