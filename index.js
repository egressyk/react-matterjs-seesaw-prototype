import React, { Component } from 'react';
import { render } from 'react-dom';
import Game from './Game'
import './style.css';

class App extends Component {
  myGameSettings = {
    showBallsLost: true,
    showTimeOnSpot: true,
    roundTime: 10
  }

  constructor() {
    super();
    this.state = {
      name: 'React'
    };
  }

  componentDidMount() {
    // Don't copy this it's just for testing usage of refs.game for child function call
    document.addEventListener('keydown', (event) => {
      if (event.keyCode === 13) {
        this.refs.game.startLevel(1);
      }
    });
  }

  myOnGameEndFunction(results) {
    console.log(results);
  }

  render() {
    return (
      <div>
        <Game ref="game" 
          gameSettings={this.myGameSettings}
          onGameEnd={this.myOnGameEndFunction}
        />
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
