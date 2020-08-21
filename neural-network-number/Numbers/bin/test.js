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
const Matrix_1 = require("./Matrix");
const NTuple_1 = require("./NTuple");
test('multiplays a matrix [[1,2],[3,4],[5,6]] by ntuple [1,2]', () => {
    const matrix = new Matrix_1.Matrix([[1, 2], [3, 4], [5, 6]]);
    const nTuple = new NTuple_1.NTuple([1, 2]);
    expect(matrix.multiplayByNTuple(nTuple).nTupleValues).toStrictEqual([5, 11, 17]);
});
test('add a ntuple [[5,6,8]] to ntuple [1,2,3]', () => {
    const nTuple1 = new NTuple_1.NTuple([5, 6, 8]);
    const nTuple2 = new NTuple_1.NTuple([1, 2, 3]);
    expect(nTuple1.addNTuple(nTuple2).nTupleValues).toStrictEqual([6, 8, 11]);
});
test('read from file', () => {
    // const neuralNetwork = new NumbersNeuralNetwork();
    // await neuralNetwork.initNetworkFromFile('./network.json');
    // const pictureNeuralNetwork = new PictureNeuralNetwork();
    // const { fileNames, nTupleResualts } = pictureNeuralNetwork.getRandomPicturesWithResualts(100, 'training');
    // expect(true).toBe(true);
});
test('train network', () => __awaiter(void 0, void 0, void 0, function* () {
    // const pictureNeuralNetwork = new PictureNeuralNetwork();
    // await pictureNeuralNetwork.trainNetworkInBatches(1000, 100);
    // expect(true).toBe(true);
}));
test('calculate number', () => __awaiter(void 0, void 0, void 0, function* () {
    // const pictureNeuralNetwork = new PictureNeuralNetwork();
    // const number = await pictureNeuralNetwork.calculateNumberFromPicture('./training/7/29.png', './network.json');
    // expect(number).toBeLessThan(10);
}));
//# sourceMappingURL=test.js.map