import { Matrix } from "./Matrix";
import { NTuple } from "./NTuple";
import fs from 'file-system';

export class NumbersNeuralNetwork {
    public weightsMatrixsBetweenLayers: Matrix[];
    public biasesNTuplesBetweenLayers: NTuple[];
    public numberOfLayers: number;
    initNetwork = (numberOfInputs: number, numberOfNodesInHiddenLayers: number[], minRandomNumbers: number, maxRandomNumbers: number, numberOfResualts: number) => {
        this.weightsMatrixsBetweenLayers = this.generateRandomWeightsMatrixs(numberOfInputs, numberOfNodesInHiddenLayers, minRandomNumbers, maxRandomNumbers, numberOfResualts);
        this.biasesNTuplesBetweenLayers = this.generateRandomBiasesNTuples(numberOfNodesInHiddenLayers, minRandomNumbers, maxRandomNumbers, numberOfResualts);
        this.numberOfLayers = numberOfNodesInHiddenLayers.length + 2;
    }

    saveNetworkToFile = (fileName: string) => {
        const allMatrixNumbersTogether: number[][][] = this.weightsMatrixsBetweenLayers.map(matrix => matrix.matrixValues);
        const allBiasNumbersTogether: number[][] = this.biasesNTuplesBetweenLayers.map(nTuple => nTuple.nTupleValues);
        fs.writeFileSync(fileName, JSON.stringify({
            weightsMatrixsBetweenLayers: allMatrixNumbersTogether,
            biasesNTuplesBetweenLayers: allBiasNumbersTogether
        }));
    }

    initNetworkFromFile = async (fileName: string) => {
        return new Promise((resolve, reject) => {
            fs.readFile(fileName, (err, content) => {
                if (err) reject(err);
                const matrixAndBiases = (JSON.parse(content)) as { weightsMatrixsBetweenLayers: number[][][], biasesNTuplesBetweenLayers: number[][] };
                this.weightsMatrixsBetweenLayers = matrixAndBiases.weightsMatrixsBetweenLayers.map(matrixNumbers => new Matrix(matrixNumbers));
                this.biasesNTuplesBetweenLayers = matrixAndBiases.biasesNTuplesBetweenLayers.map(biasNumbers => new NTuple(biasNumbers));
                this.numberOfLayers = this.weightsMatrixsBetweenLayers.length + 1;
                resolve();
            });
        });

    }

    calculateLayersInNetwork = (inputNTuple: NTuple, reductionFuction): {calculatedActivationLayers: NTuple[], calculatedActivationBeforeReductionLayers: NTuple[]} => {
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

    backPropegation = (layersActivations: NTuple[], layersActivationsBeforeReduction: NTuple[], learnRate: number, derivativeOfReductionFunction, expectedResualt: NTuple): { weightsDeltaMatrixsBetweenLayers: Matrix[], biasesDeltaNTuplesBetweenLayers: NTuple[] } => {
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

    updateMiniBatch = (inputs: NTuple[], expectedResualts: NTuple[], reductionFuction, derivativeOfReductionFunction, learnRate: number) => {
        const firstInput = inputs[0];
        const firstExpectedResualt = expectedResualts[0];
        const { calculatedActivationLayers, calculatedActivationBeforeReductionLayers } = this.calculateLayersInNetwork(firstInput, reductionFuction);
        const { weightsDeltaMatrixsBetweenLayers, biasesDeltaNTuplesBetweenLayers } = this.backPropegation(calculatedActivationLayers, calculatedActivationBeforeReductionLayers, learnRate, derivativeOfReductionFunction, firstExpectedResualt);
        let newBiases = biasesDeltaNTuplesBetweenLayers;
        let newWeightsDeltaMatrixsBetweenLayers = weightsDeltaMatrixsBetweenLayers;
        for (let currentInputLocation = 1, currentExpectedResualtLocation = 1; currentInputLocation < inputs.length; currentInputLocation++, currentExpectedResualtLocation++) {
            const currentInput = inputs[currentInputLocation];
            const currentExpectedResualt = expectedResualts[currentExpectedResualtLocation];
            const { calculatedActivationLayers, calculatedActivationBeforeReductionLayers } = this.calculateLayersInNetwork(currentInput, reductionFuction);
            const { weightsDeltaMatrixsBetweenLayers, biasesDeltaNTuplesBetweenLayers } = this.backPropegation(calculatedActivationLayers, calculatedActivationBeforeReductionLayers, learnRate, derivativeOfReductionFunction, currentExpectedResualt);
            newBiases = newBiases.map((biasesNTuplesBetweenLayers, currLayerLocation) => biasesNTuplesBetweenLayers.addNTuple(biasesDeltaNTuplesBetweenLayers[currLayerLocation]));
            newWeightsDeltaMatrixsBetweenLayers = newWeightsDeltaMatrixsBetweenLayers.map((weightsMatrixsBetweenLayers, currLayerLocation) => weightsMatrixsBetweenLayers.addMatrix(weightsDeltaMatrixsBetweenLayers[currLayerLocation]));
        }

        this.weightsMatrixsBetweenLayers = this.weightsMatrixsBetweenLayers.map((weightsMatrixsBetweenLayers, currLayerLocation) => weightsMatrixsBetweenLayers.addMatrix(newWeightsDeltaMatrixsBetweenLayers[currLayerLocation].multiplayByNumber(-1 * learnRate * inputs.length)));
        this.biasesNTuplesBetweenLayers = this.biasesNTuplesBetweenLayers.map((biasesNTuplesBetweenLayers, currLayerLocation) => biasesNTuplesBetweenLayers.addNTuple(newBiases[currLayerLocation].multiplayByNumber(-1 * learnRate * inputs.length)));
    }

    private generateRandomWeightsMatrixs = (numberOfInputs: number, numberOfNodesInHiddenLayers: number[], minRandomNumbers: number, maxRandomNumbers: number, numberOfResualts: number): Matrix[] => {
        const weightsMatrixsBetweenLayersWithRandomNumbers: Matrix[] = [];
        const InputLayerAndFirstHiddenLayerWieghtsMatrix = this.generateRandomWeightsMatrix(minRandomNumbers, maxRandomNumbers, numberOfInputs, numberOfNodesInHiddenLayers[0]);
        weightsMatrixsBetweenLayersWithRandomNumbers.push(InputLayerAndFirstHiddenLayerWieghtsMatrix);
        let hiddenLayer;
        for (hiddenLayer = 0; hiddenLayer < numberOfNodesInHiddenLayers.length - 1; hiddenLayer++) {
            const hiddenLayerToNextHiddenLayerWieghtsMatrix = this.generateRandomWeightsMatrix(minRandomNumbers, maxRandomNumbers, numberOfNodesInHiddenLayers[hiddenLayer], numberOfNodesInHiddenLayers[hiddenLayer + 1]);
            weightsMatrixsBetweenLayersWithRandomNumbers.push(hiddenLayerToNextHiddenLayerWieghtsMatrix);
        }
        const LastHiddenLayerAndResaultLayerWieghtsMatrix = this.generateRandomWeightsMatrix(minRandomNumbers, maxRandomNumbers, numberOfNodesInHiddenLayers[hiddenLayer], numberOfResualts);
        weightsMatrixsBetweenLayersWithRandomNumbers.push(LastHiddenLayerAndResaultLayerWieghtsMatrix);

        return weightsMatrixsBetweenLayersWithRandomNumbers;
    }

    private generateRandomBiasesNTuples = (numberOfNodesInHiddenLayers: number[], minRandomNumbers: number, maxRandomNumbers: number, numberOfResualts: number): NTuple[] => {
        const RandomBiasesNTuples: NTuple[] = [];
        for (let row = 0; row < numberOfNodesInHiddenLayers.length; row++) {
            const randomBiasesNTuple = this.generateRandomBiasesNTuple(minRandomNumbers, maxRandomNumbers, numberOfNodesInHiddenLayers[row]);
            RandomBiasesNTuples.push(randomBiasesNTuple);
        }

        const lastRandomBiasesNTuple = this.generateRandomBiasesNTuple(minRandomNumbers, maxRandomNumbers, numberOfResualts);
        RandomBiasesNTuples.push(lastRandomBiasesNTuple);

        return RandomBiasesNTuples;
    }

    private generateRandomWeightsMatrix = (minRandomNumbers: number, maxRandomNumbers: number, width: number, height: number): Matrix => {
        const weightsMatrixsBetweenLayersWithRandomNumbers: number[][] = [];
        for (let row = 0; row < height; row++) {
            const newColsInMatrix = [];
            for (let col = 0; col < width; col++) {
                newColsInMatrix.push(this.generateRandomFloatInRange(minRandomNumbers, maxRandomNumbers));
            }
            weightsMatrixsBetweenLayersWithRandomNumbers.push(newColsInMatrix);
        }

        return new Matrix(weightsMatrixsBetweenLayersWithRandomNumbers);
    }

    private generateRandomBiasesNTuple = (minRandomNumbers: number, maxRandomNumbers: number, length: number): NTuple => {
        const RandomBiasesNTuple = [];
        for (let row = 0; row < length; row++) {
            RandomBiasesNTuple.push(this.generateRandomFloatInRange(minRandomNumbers, maxRandomNumbers));
        }

        return new NTuple(RandomBiasesNTuple);
    }

    private generateRandomFloatInRange = (minRandomNumbers: number, maxRandomNumbers: number, ) => {
        const min = minRandomNumbers;
        const max = maxRandomNumbers;
        return Math.random() * (max - min) + min;
    }

}