import { PictureNeuralNetwork } from "./PictureNeuralNetwork";
import { NumbersNeuralNetwork } from "./NeuralNetwork";

const train = async () => {
    const pictureNeuralNetwork = new PictureNeuralNetwork();
    const neuralNetwork = new NumbersNeuralNetwork();
    await neuralNetwork.initNetworkFromFile('./network2.json');
    await pictureNeuralNetwork.trainNetworkInBatches(neuralNetwork, 0.1, 100000, 1, 100, './network2.json');
}

const calculate = async () => {
    const pictureNeuralNetwork = new PictureNeuralNetwork();
    const number = await pictureNeuralNetwork.testNeuralNetwork(100, 'training', './network2.json');
    console.log((number / 1000) * 10);
}

const calculateNumber = async () => {
    const pictureNeuralNetwork = new PictureNeuralNetwork();
    const number = await pictureNeuralNetwork.calculateNumberFromPicture('./pic1.png', './network2.json');
    console.log(number);
}
calculateNumber()