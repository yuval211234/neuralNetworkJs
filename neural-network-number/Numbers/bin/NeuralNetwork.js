"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Matrix_1 = require("./Matrix");
const NTuple_1 = require("./NTuple");
const file_system_1 = __importDefault(require("file-system"));
class NumbersNeuralNetwork {
    constructor() {
        this.initNetwork = (numberOfInputs, numberOfNodesInHiddenLayers, minRandomNumbers, maxRandomNumbers, numberOfResualts) => {
            this.weightsMatrixsBetweenLayers = this.generateRandomWeightsMatrixs(numberOfInputs, numberOfNodesInHiddenLayers, minRandomNumbers, maxRandomNumbers, numberOfResualts);
            this.biasesNTuplesBetweenLayers = this.generateRandomBiasesNTuples(numberOfNodesInHiddenLayers, minRandomNumbers, maxRandomNumbers, numberOfResualts);
            this.numberOfLayers = numberOfNodesInHiddenLayers.length + 2;
        };
        this.saveNetworkToFile = (fileName) => {
            const allMatrixNumbersTogether = this.weightsMatrixsBetweenLayers.map(matrix => matrix.matrixValues);
            const allBiasNumbersTogether = this.biasesNTuplesBetweenLayers.map(nTuple => nTuple.nTupleValues);
            file_system_1.default.writeFileSync(fileName, JSON.stringify({
                weightsMatrixsBetweenLayers: allMatrixNumbersTogether,
                biasesNTuplesBetweenLayers: allBiasNumbersTogether
            }));
        };
        this.initNetworkFromFile = (fileName) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                file_system_1.default.readFile(fileName, (err, content) => {
                    if (err)
                        reject(err);
                    const matrixAndBiases = (JSON.parse(content));
                    this.weightsMatrixsBetweenLayers = matrixAndBiases.weightsMatrixsBetweenLayers.map(matrixNumbers => new Matrix_1.Matrix(matrixNumbers));
                    this.biasesNTuplesBetweenLayers = matrixAndBiases.biasesNTuplesBetweenLayers.map(biasNumbers => new NTuple_1.NTuple(biasNumbers));
                    this.numberOfLayers = this.weightsMatrixsBetweenLayers.length + 1;
                    resolve();
                });
            });
        });
        this.calculateLayersInNetwork = (inputNTuple, reductionFuction) => {
            const calculatedActivationLayers = [inputNTuple];
            const calculatedActivationBeforeReductionLayers = [];
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
        };
        this.backPropegation = (layersActivations, layersActivationsBeforeReduction, learnRate, derivativeOfReductionFunction, expectedResualt) => {
            const weightsDeltaMatrixsBetweenLayers = [];
            const biasesDeltaNTuplesBetweenLayers = [];
            const derivativeOfReductionOfActivationBeforeReduction = layersActivationsBeforeReduction[layersActivationsBeforeReduction.length - 1].applyFunction(derivativeOfReductionFunction);
            const error = layersActivations[layersActivations.length - 1].addNTuple(expectedResualt.multiplayByNumber(-1));
            let delta = error.multiplayByNTuple(derivativeOfReductionOfActivationBeforeReduction);
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
        };
        this.updateMiniBatch = (inputs, expectedResualts, reductionFuction, derivativeOfReductionFunction, learnRate) => {
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
        };
        this.generateRandomWeightsMatrixs = (numberOfInputs, numberOfNodesInHiddenLayers, minRandomNumbers, maxRandomNumbers, numberOfResualts) => {
            const weightsMatrixsBetweenLayersWithRandomNumbers = [];
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
        };
        this.generateRandomBiasesNTuples = (numberOfNodesInHiddenLayers, minRandomNumbers, maxRandomNumbers, numberOfResualts) => {
            const RandomBiasesNTuples = [];
            for (let row = 0; row < numberOfNodesInHiddenLayers.length; row++) {
                const randomBiasesNTuple = this.generateRandomBiasesNTuple(minRandomNumbers, maxRandomNumbers, numberOfNodesInHiddenLayers[row]);
                RandomBiasesNTuples.push(randomBiasesNTuple);
            }
            const lastRandomBiasesNTuple = this.generateRandomBiasesNTuple(minRandomNumbers, maxRandomNumbers, numberOfResualts);
            RandomBiasesNTuples.push(lastRandomBiasesNTuple);
            return RandomBiasesNTuples;
        };
        this.generateRandomWeightsMatrix = (minRandomNumbers, maxRandomNumbers, width, height) => {
            const weightsMatrixsBetweenLayersWithRandomNumbers = [];
            for (let row = 0; row < height; row++) {
                const newColsInMatrix = [];
                for (let col = 0; col < width; col++) {
                    newColsInMatrix.push(this.generateRandomFloatInRange(minRandomNumbers, maxRandomNumbers));
                }
                weightsMatrixsBetweenLayersWithRandomNumbers.push(newColsInMatrix);
            }
            return new Matrix_1.Matrix(weightsMatrixsBetweenLayersWithRandomNumbers);
        };
        this.generateRandomBiasesNTuple = (minRandomNumbers, maxRandomNumbers, length) => {
            const RandomBiasesNTuple = [];
            for (let row = 0; row < length; row++) {
                RandomBiasesNTuple.push(this.generateRandomFloatInRange(minRandomNumbers, maxRandomNumbers));
            }
            return new NTuple_1.NTuple(RandomBiasesNTuple);
        };
        this.generateRandomFloatInRange = (minRandomNumbers, maxRandomNumbers) => {
            const min = minRandomNumbers;
            const max = maxRandomNumbers;
            return Math.random() * (max - min) + min;
        };
    }
}
exports.NumbersNeuralNetwork = NumbersNeuralNetwork;
//# sourceMappingURL=NeuralNetwork.js.map