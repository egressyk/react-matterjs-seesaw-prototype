import React, { Component } from 'react';
import { render } from 'react-dom';
import Game from './Game'
import './style.css';

class App extends Component {
  myGameSettings = {
    showBallsLost: true,
    showTimeOnSpot: true
  }

  constructor() {
    super();
    this.state = {
      name: 'React'
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', (event) => {
      if (event.keyCode === 13) {
        this.refs.game.startLevel(4);
      }
    });
  }

  render() {
    return (
      <div>
        <Game ref="game" gameSettings={this.myGameSettings}/>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
