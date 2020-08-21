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
const NTuple_1 = require("./NTuple");
const file_system_1 = __importDefault(require("file-system"));
const image_pixels_1 = __importDefault(require("image-pixels"));
const NeuralNetwork_1 = require("./NeuralNetwork");
class PictureNeuralNetwork {
    constructor() {
        this.calculateNumberFromPicture = (pictureFileName, matrixFileName) => __awaiter(this, void 0, void 0, function* () {
            const { data, width, height } = yield image_pixels_1.default(pictureFileName);
            const numbersOfColors = this.transformPixelsToNumbers(data);
            const neuralNetwork = new NeuralNetwork_1.NumbersNeuralNetwork();
            yield neuralNetwork.initNetworkFromFile(matrixFileName);
            const imagePixelsNTuple = new NTuple_1.NTuple(numbersOfColors);
            const { calculatedActivationLayers } = neuralNetwork.calculateLayersInNetwork(imagePixelsNTuple, this.sigmoidFunction);
            return calculatedActivationLayers[calculatedActivationLayers.length - 1].getMaxNumberIndex();
        });
        this.testNeuralNetwork = (numberOfPictures, dir, matrixFileName) => __awaiter(this, void 0, void 0, function* () {
            const { fileNames, nTupleResualts } = this.getRandomPicturesWithResualts(numberOfPictures, dir);
            let success = 0;
            let sumPerTen = 0;
            for (let pictureNumber = 0; pictureNumber < numberOfPictures; pictureNumber++) {
                const fileName = fileNames[pictureNumber];
                const currectNumber = nTupleResualts[pictureNumber].nTupleValues.findIndex(number => number === 1);
                const number = yield this.calculateNumberFromPicture(fileName, matrixFileName);
                if (currectNumber === number) {
                    success++;
                    sumPerTen++;
                }
                if ((pictureNumber + 1) % 10 === 0) {
                    console.log(`${sumPerTen}\\10`);
                    sumPerTen = 0;
                }
            }
            return success;
        });
        this.trainNetworkInBatches = (neuralNetwork, learnRate, numberOfBatches, numberOfImagesPerBatch, numberOfBatchesPerSave, networkFileName) => __awaiter(this, void 0, void 0, function* () {
            neuralNetwork.saveNetworkToFile(networkFileName);
            for (let currBatchLocation = 0; currBatchLocation < numberOfBatches; currBatchLocation++) {
                console.log(`batch ${currBatchLocation}:`);
                console.log('');
                const { fileNames, nTupleResualts } = this.getRandomPicturesWithResualts(numberOfImagesPerBatch, 'training');
                yield this.trainNetworkForBatch(neuralNetwork, learnRate, fileNames, nTupleResualts);
                if ((currBatchLocation + 1) % numberOfBatchesPerSave === 0) {
                    neuralNetwork.saveNetworkToFile(networkFileName);
                }
                console.log('');
            }
        });
        this.trainNetworkForBatch = (neuralNetwork, learnRate, picturesFileNames, resaults) => __awaiter(this, void 0, void 0, function* () {
            console.log(`learning ${picturesFileNames.length} images...`);
            const allPicturesData = yield image_pixels_1.default.all(picturesFileNames);
            const numbersOfColors = allPicturesData.map(({ data }) => new NTuple_1.NTuple(this.transformPixelsToNumbers(data)));
            neuralNetwork.updateMiniBatch(numbersOfColors, resaults, this.sigmoidFunction, this.derivitiveOfSigmoidFunction, learnRate);
            console.log(`learning of batch done`);
        });
        this.getRandomPicturesWithResualts = (numberOfRandomPictures, dir) => {
            const resualts = [];
            const fileNames = [];
            for (let index = 0; index < numberOfRandomPictures; index++) {
                const randomResualt = Math.floor(Math.random() * 10);
                const fileName = this.getRandomPictureByNumber(randomResualt, dir);
                resualts.push(randomResualt);
                fileNames.push(fileName);
            }
            const nTupleResualts = this.generateResualts(resualts);
            return {
                nTupleResualts,
                fileNames
            };
        };
        this.getRandomPictureByNumber = (number, dir) => {
            const files = file_system_1.default.readdirSync(`${dir}\\${number}`);
            const chosenFile = files[Math.floor(Math.random() * files.length)];
            const fullFileUrl = `${dir}\\${number}\\${chosenFile}`;
            return fullFileUrl;
        };
        this.generateResualts = (resualts) => {
            return resualts.map(resualt => {
                const numbersToReturn = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                numbersToReturn[resualt] = 1;
                return new NTuple_1.NTuple(numbersToReturn);
            });
        };
        this.sigmoidFunction = (numberToChange) => {
            return 1 / (1 + Math.pow(Math.E, -numberToChange));
        };
        this.derivitiveOfSigmoidFunction = (numberToChange) => {
            return this.sigmoidFunction(numberToChange) * (1 - this.sigmoidFunction(numberToChange));
        };
        this.transformPixelsToNumbers = (pixels) => {
            const newNumbersFromPixels = [];
            for (let pixel = 0; pixel < pixels.length; pixel += 4) {
                const colorNumber = pixels[pixel];
                newNumbersFromPixels.push(colorNumber / 255);
            }
            return newNumbersFromPixels;
        };
    }
}
exports.PictureNeuralNetwork = PictureNeuralNetwork;
//# sourceMappingURL=PictureNeuralNetwork.js.map