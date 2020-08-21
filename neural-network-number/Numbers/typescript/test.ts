import { Matrix } from './Matrix';
import { NTuple } from './NTuple';
import { NumbersNeuralNetwork } from './NeuralNetwork';
import { PictureNeuralNetwork } from './PictureNeuralNetwork';

test('multiplays a matrix [[1,2],[3,4],[5,6]] by ntuple [1,2]', () => {
    const matrix = new Matrix([[1,2],[3,4],[5,6]]);
    const nTuple = new NTuple([1,2]);
    expect(matrix.multiplayByNTuple(nTuple).nTupleValues).toStrictEqual([5,11,17]);
});

test('add a ntuple [[5,6,8]] to ntuple [1,2,3]', () => {
    const nTuple1 = new NTuple([5,6,8]);
    const nTuple2 = new NTuple([1,2,3]);
    expect(nTuple1.addNTuple(nTuple2).nTupleValues).toStrictEqual([6,8,11]);
});

test('read from file', () => {
    // const neuralNetwork = new NumbersNeuralNetwork();
    // await neuralNetwork.initNetworkFromFile('./network.json');
    // const pictureNeuralNetwork = new PictureNeuralNetwork();
    // const { fileNames, nTupleResualts } = pictureNeuralNetwork.getRandomPicturesWithResualts(100, 'training');
    // expect(true).toBe(true);
});

test('train network', async () => {
    // const pictureNeuralNetwork = new PictureNeuralNetwork();
    // await pictureNeuralNetwork.trainNetworkInBatches(1000, 100);
    // expect(true).toBe(true);
});

test('calculate number', async () => {
    // const pictureNeuralNetwork = new PictureNeuralNetwork();
    // const number = await pictureNeuralNetwork.calculateNumberFromPicture('./training/7/29.png', './network.json');
    // expect(number).toBeLessThan(10);
});