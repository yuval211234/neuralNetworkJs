import { Matrix } from "./Matrix";

export class NTuple {
    public length: number;
    public nTupleValues: number[];
    constructor(numbers: number[]) {
        this.length = numbers.length;
        this.nTupleValues = numbers;
    }

    addNTuple = (nTuple: NTuple) => {
        if (nTuple.length === this.length) {
            const newNTupleValues = this.nTupleValues.map((number, index) => {
                return number + nTuple.nTupleValues[index];
            })

            return new NTuple(newNTupleValues);
        }
        else {
            throw ('the tuples most be the same length');
        }
    }

    getDiffernceNTuple = (nTuple: NTuple): NTuple => {
        if (this.length === nTuple.length) {
            const differenceTuple = this.nTupleValues.map((number, index) => {
                return Math.pow(number - nTuple.nTupleValues[index], 2);
            })

            return new NTuple(differenceTuple);
        }
        else {
            throw ('ntuple must have the same length');
        }
    }

    multiplayByNTuple = (nTuple: NTuple): NTuple => {
        if (this.length === nTuple.length) {
            const newNTupleValues = this.nTupleValues.map((numberToMultiplay, location) => numberToMultiplay * nTuple.nTupleValues[location]);
            return new NTuple(newNTupleValues);
        }
        else {
            throw ('ntuple must have the same length');
        }

    }

    multiplayByNTupleToMatrix = (nTuple: NTuple): Matrix => {
        const newMatrixValues: number[][] = [];
        for (let row = 0; row < this.length; row++) {
            const newRow: number[] = [];
            for (let col = 0; col < nTuple.length; col++) {
                newRow.push(this.nTupleValues[row] * nTuple.nTupleValues[col]);
            }
            newMatrixValues.push(newRow);
        }

        return new Matrix(newMatrixValues);

    }

    multiplayByNumber = (number: number): NTuple => {
        const newNTupleValues = this.nTupleValues.map(numberToMultiplay => numberToMultiplay * number);
        return new NTuple(newNTupleValues);
    }

    applyFunction = (functionToApply: Function): NTuple => {
        const newNTupleValues = this.nTupleValues.map(number => functionToApply(number));
        return new NTuple(newNTupleValues);
    }

    getMaxNumberIndex = () => {
        const tuple = new NTuple([...this.nTupleValues]);
        const maxNumber = tuple.nTupleValues.sort((prev, current) => current - prev)[0];
        return this.nTupleValues.findIndex(number => number === maxNumber);
    }
}