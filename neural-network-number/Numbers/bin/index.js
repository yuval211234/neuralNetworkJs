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
Object.defineProperty(exports, "__esModule", { value: true });
const PictureNeuralNetwork_1 = require("./PictureNeuralNetwork");
const NeuralNetwork_1 = require("./NeuralNetwork");
const train = () => __awaiter(void 0, void 0, void 0, function* () {
    const pictureNeuralNetwork = new PictureNeuralNetwork_1.PictureNeuralNetwork();
    const neuralNetwork = new NeuralNetwork_1.NumbersNeuralNetwork();
    yield neuralNetwork.initNetworkFromFile('./network2.json');
    yield pictureNeuralNetwork.trainNetworkInBatches(neuralNetwork, 0.1, 100000, 1, 100, './network2.json');
});
const calculate = () => __awaiter(void 0, void 0, void 0, function* () {
    const pictureNeuralNetwork = new PictureNeuralNetwork_1.PictureNeuralNetwork();
    const number = yield pictureNeuralNetwork.testNeuralNetwork(100, 'training', './network2.json');
    console.log((number / 1000) * 10);
});
const calculateNumber = () => __awaiter(void 0, void 0, void 0, function* () {
    const pictureNeuralNetwork = new PictureNeuralNetwork_1.PictureNeuralNetwork();
    const number = yield pictureNeuralNetwork.calculateNumberFromPicture('./pic1.png', './network2.json');
    console.log(number);
});
calculateNumber();
//# sourceMappingURL=index.js.map