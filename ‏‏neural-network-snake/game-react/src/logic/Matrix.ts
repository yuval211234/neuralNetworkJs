import { NTuple } from './NTuple';
export class Matrix {
    public width: number;
    public height: number;
    public matrixValues: number[][];
    constructor(numbers: number[][]) {
        this.width = numbers[0].length;
        this.height = numbers.length;
        this.matrixValues = numbers;
    }

    calculateFlippedMatrix = (): Matrix => {
        const newMatrixValues: number[][] = [];
        for (let col = 0; col < this.width; col++) {
            const newValuesRow: number[] = [];
            for (let row = 0; row < this.height; row++) {
                newValuesRow.push(this.matrixValues[row][col]);
            }
            newMatrixValues.push(newValuesRow);
        }
        return new Matrix(newMatrixValues);
    }

    multiplayByNTuple = (nTuple: NTuple): NTuple => {
        if (this.width === nTuple.length) {
            const newNTupleValues: number[] = [];
            for (let row = 0; row < this.height; row++) {
                let newValueInNTuple = 0;
                for (let col = 0; col < this.width; col++) {
                    const newValue = this.matrixValues[row][col] * nTuple.nTupleValues[col];
                    newValueInNTuple += newValue;
                }
                newNTupleValues.push(newValueInNTuple);
            }
            return new NTuple(newNTupleValues);
        }
        else {
            throw ('the width of the matrix most be equal to the length of the ntuple');
        }
    }

    multiplayByNumber = (number: number): Matrix => {
        const newMatrixValues: number[][] = [];
        for (let row = 0; row < this.height; row++) {
            const newValuesRow: number[] = [];
            for (let col = 0; col < this.width; col++) {
                const newValue = this.matrixValues[row][col] * number;
                newValuesRow.push(newValue);
            }
            newMatrixValues.push(newValuesRow);
        }
        return new Matrix(newMatrixValues);
    }

    addMatrix = (matrix: Matrix): Matrix => {
        if (this.height === matrix.height && this.width === matrix.width) {
            const newMatrixValues: number[][] = [];
            for (let row = 0; row < this.height; row++) {
                const newValuesRow: number[] = [];
                for (let col = 0; col < this.width; col++) {
                    const newValue = this.matrixValues[row][col] + matrix.matrixValues[row][col];
                    newValuesRow.push(newValue);
                }
                newMatrixValues.push(newValuesRow);
            }
            return new Matrix(newMatrixValues);
        }
        else {
            throw ('the width and height of the matrix most be equal to the width and height of the other matrix');
        }
    }
}