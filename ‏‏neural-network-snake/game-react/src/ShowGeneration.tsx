import React from 'react';
import { NumbersNeuralNetwork } from './logic/NeuralNetwork';
import { SnakeWithNeuralNetworks } from './logic/SnakeWithNeuralNetworks';
import { cellType } from './logic/SnakeGame';
import { runSnakeGenerations } from './logic/index';

let counter = 0;

type IColorToNumber = {
  color: string;
  number: number;
}

type IAppState = {
  numberOfGeneration: number;
  numberOfGenerationsToRun: number;
  gameGroundToRunHeight: number;
  gameGroundToRunWidth: number;
  gameGroundHeight: number;
  gameGroundWidth: number;
  gameGroundComponent: JSX.Element;
}

export class ShowGeneration extends React.Component<{}, IAppState> {
  constructor(props: any) {
    super(props);
  }

  state = {
    numberOfGeneration: -1,
    numberOfGenerationsToRun: 0,
    gameGroundToRunHeight: 0,
    gameGroundToRunWidth: 0,
    gameGroundHeight: 0,
    gameGroundWidth: 0,
    gameGroundComponent: <></>,
  }

  changeNumberOfGenerationsToRun = (event: any) => {
    this.setState({
      numberOfGenerationsToRun: parseInt(event.target.value)
    });
  }

  changeNumberOfGeneration = (event: any) => {
    this.setState({
      numberOfGeneration: parseInt(event.target.value)
    });
  }

  changeGameGroundToRunHeight = (event: any) => {
    this.setState({
      gameGroundToRunHeight: parseInt(event.target.value)
    });
  }

  changeGameGroundToRunWidth = (event: any) => {
    this.setState({
      gameGroundToRunWidth: parseInt(event.target.value)
    });
  }

  changeGameGroundHeight = (event: any) => {
    this.setState({
      gameGroundHeight: parseInt(event.target.value)
    });
  }

  changeGameGroundWidth = (event: any) => {
    this.setState({
      gameGroundWidth: parseInt(event.target.value)
    });
  }
  

  generateGameGround = (gameGroundSize: number, colorToNumber: IColorToNumber[]) => (numbers: number[][]): Promise<void> => {
    return new Promise((resolve, reject) => {
      const gameGroundComponent =
        <div>{
          numbers.map((rowNumbers, row) => {
            return <div style={{ display: 'flex', flexDirection: 'row' }}>
              {
                rowNumbers.map((number, col) => {
                  const size = gameGroundSize / rowNumbers.length;
                  const colorAndNumber = colorToNumber.find(({ number: colorNumber }) => colorNumber === number);
                  return <div key={`${row}-${col}-${counter++}`} style={{ width: size, height: size, backgroundColor: colorAndNumber?.color, border: '1px solid black' }} />
                })
              }
            </div>
          })
        }
        </div>
      this.setState({
        gameGroundComponent
      }, () => {
        setTimeout(() => {
          resolve();
        }, 10)
      });
    });
  }

  playGameWithCreator = () => {
    const { gameGroundHeight, gameGroundWidth, numberOfGeneration } = this.state;
    const creator = new NumbersNeuralNetwork();
    creator.initNetworkFromLocalStorage(`creator${numberOfGeneration}`);
    const snakeNeuralNetworks = new SnakeWithNeuralNetworks();
    const snakeColor = 'green';
    const appleColor = 'red';
    const emptyColor = 'white';
    snakeNeuralNetworks.playSnakeAsync(gameGroundHeight, gameGroundWidth, 300, this.generateGameGround(560,
      [{ number: cellType.snake, color: snakeColor },
      { number: cellType.apple, color: appleColor },
      { number: cellType.none, color: emptyColor }]))(creator);
  }

  clearGenerations = () => {
    localStorage.clear();
  }

  runGenerations = () => {
    const { numberOfGenerationsToRun, gameGroundToRunHeight, gameGroundToRunWidth } = this.state;
    runSnakeGenerations(numberOfGenerationsToRun, gameGroundToRunHeight, gameGroundToRunWidth);
  }

  render = () => {
    const currentGenerationString = localStorage.getItem(`creator${this.state.numberOfGeneration}`);
    const currentGenerationFitness = JSON.parse(currentGenerationString? currentGenerationString: '{}').fitness;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button onClick={this.clearGenerations}>clear generations</button>
        <div>game ground height:</div>
          <input onChange={this.changeGameGroundToRunHeight}></input>
          <div>game ground width:</div>
          <input onChange={this.changeGameGroundToRunWidth}></input>
          <div>number of generations:</div>
          <input onChange={this.changeNumberOfGenerationsToRun}></input>
          <button onClick={this.runGenerations}>run generations</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div>number of generation:</div>
          <input onChange={this.changeNumberOfGeneration}></input>
          <div>game ground height:</div>
          <input onChange={this.changeGameGroundHeight}></input>
          <div>game ground width:</div>
          <input onChange={this.changeGameGroundWidth}></input>
          <button onClick={this.playGameWithCreator}>play</ button>
        </div>
        <div>
          {currentGenerationFitness ? <div>{`fitness: ${currentGenerationFitness}`}</div> : <></>}
          {this.state.gameGroundComponent}
        </div>
      </div >
    );
  }
}
