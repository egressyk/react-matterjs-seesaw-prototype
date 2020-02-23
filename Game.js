import React from "react";
import ReactDOM from "react-dom";
import Matter from "matter-js";

const Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Events = Matter.Events,
      Composite = Matter.Composite,
      Composites = Matter.Composites,
      Constraint = Matter.Constraint,
      Vector = Matter.Vector;

class Game extends React.Component {
  
  gameSettings = {
    palette: {
      background: '#32343E',
      ball: '#ff502f',
      seesaw: '#004d61',
      goalAreaInactive: '#348498',
      goalAreaActive: '#5bd1d7',
    },
    canvasHeigth: 600,
    canvasWidth: 600,
    seesawBlockSize: 50,
    seesawPosY: 400,
    seesawAngularVelocity: Math.PI/180,
    ballSize: 20,
    ballDensity: 0.0002,
    ballRestitution: 0.3,
    ballPosY: 100,
  }
  
  gameState = {
    currentLevel: 1,
    currentTimeSpentOnSpot: 0,
    currentTimeLeft: 0,
    currentBallsLost: 0,
    engine: null,
    render: null
  }

  gameObjects = {
    seesaw: null,
    balls: []
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  initializeMatterJS() {
    this.gameState.engine = Engine.create();
    this.gameState.render = Render.create({
      element: this.refs.game,
      engine: this.gameState.engine,
      options: {
        width: this.gameSettings.canvasWidth,
        height: this.gameSettings.canvasHeigth,
        wireframes: false,
        background: this.gameSettings.palette.background
      }
    });
  }

  createSeesaw() {
    const seesawStartPosX = (this.gameSettings.canvasWidth - (this.gameSettings.seesawBlockSize * 7)) / 2;
    const stack = Composites.stack(seesawStartPosX, this.gameSettings.seesawPosY, 7, 1, 0, 0, (x, y, col, row, lastBody, i) => {
      return Bodies.rectangle(x, y - 10, this.gameSettings.seesawBlockSize, 20, {
        render: {
          fillStyle: this.gameSettings.palette.seesaw
        }
      });
    });

    const backgroundBody = Bodies.rectangle(
      this.gameSettings.canvasWidth / 2, 
      this.gameSettings.seesawPosY, 
      this.gameSettings.seesawBlockSize * 7,
      20,
      {
        render: {
          fillStyle: this.gameSettings.palette.seesaw
      }
    });

    return Body.create({parts: [
      backgroundBody,
      stack.bodies[0],
      stack.bodies[1],
      stack.bodies[2],
      stack.bodies[3],
      stack.bodies[4],
      stack.bodies[5],
      stack.bodies[6],
    ]});
  }

  addSeesawToWorld(seesaw) {
    World.add(this.gameState.engine.world, [ 
      seesaw, 
      Constraint.create({ 
        bodyA: seesaw, 
        pointB: Vector.clone(seesaw.position),
        stiffness: 1,
        length: 0
      })]
    );
  }

  setupControl(seesaw) {
    document.addEventListener('keydown', (event) => {
      if (event.keyCode === 37) {
        Body.setAngularVelocity( seesaw, seesaw.angularVelocity - this.gameSettings.seesawAngularVelocity);
      }
      if (event.keyCode === 39) {
        Body.setAngularVelocity( seesaw, seesaw.angularVelocity + this.gameSettings.seesawAngularVelocity);
      }
      if (event.keyCode === 32) {
        // addBall();
      }
    });
  }

  setGoalBlock(seesaw) {
    let goalBlockIndex;
    switch(this.gameState.currentLevel) {
      case 1: {
        goalBlockIndex = 5;
        break;
      }
      case 2: {
        goalBlockIndex = Math.round(Math.random()) ? 4 : 6;
        break;
      }
      case 3: {
        goalBlockIndex = Math.round(Math.random()) ? 3 : 7;
        break;
      }
      case 4: {
        goalBlockIndex = Math.round(Math.random()) ? 2 : 8;
        break;
      }
      default: {
        break;
      }
    }
    seesaw.parts[goalBlockIndex].render.fillStyle = this.gameSettings.palette.goalAreaActive;
  }

  componentDidMount() {
    let measureTimeStart = null;
    let measureTimeEnd = null;
    let timeSpentOnGoalArea = 0;
    const goalAreaIndex = Math.round(Math.random()*4);

    this.initializeMatterJS();

    this.gameObjects.seesaw = this.createSeesaw();
    this.addSeesawToWorld(this.gameObjects.seesaw);
    this.setGoalBlock(this.gameObjects.seesaw);
    this.setupControl(this.gameObjects.seesaw)

    // const canvas = render.canvas;
    // const ctx = render.context;
    

    // function addBall() {
    //   const randXPos = Math.round(Math.random()) > 0 ? 260 : 340;
    //   const ball = Bodies.circle(randXPos, 100, 20, { 
    //     restitution: 0.3,
    //     density: 0.0002,
    //     render: {
    //       fillSytle: palette.ball 
    //     }
    //   });
    //   World.add(this.gameState.engine.world, ball);
    // }

    // Seesaw
    

  // stack.bodies[goalAreaIndex].render.fillStyle = palette.goalAreaInactive;

    // Events.on(render, "afterRender", function(event) {
    //   ctx.font = "30px Arial";
    //   ctx.fillStyle = "orange";
    //   ctx.textAlign = "center";
    //   const displayMessage = `${timeSpentOnGoalArea.toFixed()} millisec`;
    //   ctx.fillText(displayMessage, canvas.width/2, canvas.height/10);
    // });


    // // an example of using collisionStart event on an engine
    // Events.on(engine, 'collisionStart', function(event) {
    //     var pairs = event.pairs;

    //     // change object colours to show those starting a collision
    //     for (var i = 0; i < pairs.length; i++) {
    //       if (pairs[i].bodyA == stack.bodies[goalAreaIndex] ||
    //       pairs[i].bodyB == stack.bodies[goalAreaIndex]) {
    //         stack.bodies[goalAreaIndex].render.fillStyle = palette.goalAreaActive;
    //       }
    //     }
    // });

    // Events.on(engine, 'collisionActive', function(event) {
    //     var pairs = event.pairs;

    //     // change object colours to show those ending a collision
    //     for (var i = 0; i < pairs.length; i++) {
    //       if (pairs[i].bodyA == stack.bodies[goalAreaIndex] || 
    //       pairs[i].bodyB == stack.bodies[goalAreaIndex]) {
    //         measureTimeEnd = event.source.timing.timestamp;
    //         if (measureTimeStart && measureTimeEnd) {
    //           timeSpentOnGoalArea += measureTimeEnd - measureTimeStart;
    //         }
    //         measureTimeStart = measureTimeEnd;
    //       }
    //     }
    // }); 

    // // an example of using collisionEnd event on an engine
    // Events.on(engine, 'collisionEnd', function(event) {
    //     var pairs = event.pairs;

    //     // change object colours to show those ending a collision
    //     for (var i = 0; i < pairs.length; i++) {
    //       if (pairs[i].bodyA == stack.bodies[goalAreaIndex] ||
    //       pairs[i].bodyB == stack.bodies[goalAreaIndex]) {
    //         stack.bodies[goalAreaIndex].render.fillStyle = palette.goalAreaInactive;
    //       }
    //     }
    // });

    // addBall();

    // Add control


    Engine.run(this.gameState.engine);

    Render.run(this.gameState.render);
  }

  render() {
    return <div ref="game" />;
  }
}
export default Game;