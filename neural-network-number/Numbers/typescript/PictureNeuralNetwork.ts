import { Matrix } from "./Matrix";
import { NTuple } from "./NTuple";
import fs from 'file-system';
import pixels from 'image-pixels';
import { NumbersNeuralNetwork } from "./NeuralNetwork";

export class PictureNeuralNetwork {
    calculateNumberFromPicture = async (pictureFileName: string, matrixFileName: string): Promise<number> => {
        const { data, width, height } = await pixels(pictureFileName);
        const numbersOfColors = this.transformPixelsToNumbers(data);
        const neuralNetwork = new NumbersNeuralNetwork();
        await neuralNetwork.initNetworkFromFile(matrixFileName);
        const imagePixelsNTuple = new NTuple(numbersOfColors);
        const { calculatedActivationLayers } = neuralNetwork.calculateLayersInNetwork(imagePixelsNTuple, this.sigmoidFunction);
        return calculatedActivationLayers[calculatedActivationLayers.length - 1].getMaxNumberIndex();
    }

    testNeuralNetwork = async (numberOfPictures: number, dir: string, matrixFileName: string) => {
        const { fileNames, nTupleResualts } = this.getRandomPicturesWithResualts(numberOfPictures, dir);
        let success = 0;
        let sumPerTen = 0;
        for (let pictureNumber = 0; pictureNumber < numberOfPictures; pictureNumber++) {
            const fileName = fileNames[pictureNumber];
            const currectNumber = nTupleResualts[pictureNumber].nTupleValues.findIndex(number => number === 1);
            const number = await this.calculateNumberFromPicture(fileName, matrixFileName);
            if(currectNumber === number){
                success++;
                sumPerTen++;
            }
            if((pictureNumber + 1) % 10 === 0){
                console.log(`${sumPerTen}\\10`);
                sumPerTen = 0;
            }
            
        }
        
        return success;
    }

    trainNetworkInBatches = async (neuralNetwork: NumbersNeuralNetwork, learnRate: number, numberOfBatches: number, numberOfImagesPerBatch: number, numberOfBatchesPerSave: number, networkFileName: string) => {
        neuralNetwork.saveNetworkToFile(networkFileName);
        for (let currBatchLocation = 0; currBatchLocation < numberOfBatches; currBatchLocation++) {
            console.log(`batch ${currBatchLocation}:`)
            console.log('');
            const { fileNames, nTupleResualts } = this.getRandomPicturesWithResualts(numberOfImagesPerBatch, 'training');
            await this.trainNetworkForBatch(neuralNetwork, learnRate, fileNames, nTupleResualts);
            if((currBatchLocation + 1) % numberOfBatchesPerSave === 0)
            {
                neuralNetwork.saveNetworkToFile(networkFileName);
            }
            console.log('');
        }

    }

    trainNetworkForBatch = async (neuralNetwork: NumbersNeuralNetwork, learnRate: number, picturesFileNames: string[], resaults: NTuple[]) => {
        console.log(`learning ${picturesFileNames.length} images...`);
        const allPicturesData = await pixels.all(picturesFileNames) as { data: number[], width: number, height: number }[];
        const numbersOfColors = allPicturesData.map(({ data }) => new NTuple(this.transformPixelsToNumbers(data)));
        neuralNetwork.updateMiniBatch(numbersOfColors, resaults, this.sigmoidFunction, this.derivitiveOfSigmoidFunction, learnRate);
        console.log(`learning of batch done`);
    }

    getRandomPicturesWithResualts = (numberOfRandomPictures: number, dir: string): { nTupleResualts: NTuple[], fileNames: string[] } => {
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
        }
    }

    private getRandomPictureByNumber = (number: number, dir: string) => {
        const files = fs.readdirSync(`${dir}\\${number}`);
        const chosenFile = files[Math.floor(Math.random() * files.length)]
        const fullFileUrl = `${dir}\\${number}\\${chosenFile}`;

        return fullFileUrl;
    }

    private generateResualts = (resualts) => {
        return (resualts as number[]).map(resualt => {
            const numbersToReturn = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            numbersToReturn[resualt] = 1;

            return new NTuple(numbersToReturn);
        })
    }

    private sigmoidFunction = (numberToChange): number => {
        return 1 / (1 + Math.pow(Math.E, -numberToChange));
    }

    private derivitiveOfSigmoidFunction = (numberToChange): number => {
        return this.sigmoidFunction(numberToChange) * (1 - this.sigmoidFunction(numberToChange));
    }

    private transformPixelsToNumbers = (pixels: number[]): number[] => {
        const newNumbersFromPixels = [];
        for (let pixel = 0; pixel < pixels.length; pixel += 4) {
            const colorNumber = pixels[pixel];
            newNumbersFromPixels.push(colorNumber / 255);
        }

        return newNumbersFromPixels;
    }
}