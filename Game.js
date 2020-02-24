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
    roundTime: 90,
    canvasHeigth: 600,
    canvasWidth: 600,
    seesawBlockSize: 50,
    seesawPosY: 400,
    seesawAngularVelocity: Math.PI/180,
    ballSize: 20,
    ballDensity: 0.002,
    ballRestitution: 0.3,
    ballPosY: 100,
    ballSpawnOffset: 70,
  }
  
  gameState = {
    currentLevel: 1,
    currentTimeSpentOnSpot: 0,
    currentTimeLeft: 0,
    currentBallsLost: 0,
    results: [],
    goalBlockIndex: null,
    measureTimeStart: null,
    measureTimeEnd: null,
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

  componentDidMount() {
    this.initializeMatterJS();

    // Setup game objects
    this.gameObjects.seesaw = this.createSeesaw();
    this.gameObjects.balls = this.createBalls();
    this.setGoalBlockIndex(this.gameObjects.seesaw);

    // Add game objects to world
    this.addSeesawToWorld(this.gameObjects.seesaw);
    
    // Initialize event handlers
    this.initDisplayResult();
    this.initControl(this.gameObjects.seesaw);
    this.initBallOnSpotDetection(this.gameObjects.seesaw)
    this.initBallLossHandling(this.gameObjects.balls)

    Engine.run(this.gameState.engine);
    Render.run(this.gameState.render);
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

  initControl(seesaw) {
    document.addEventListener('keydown', (event) => {
      if (event.keyCode === 37) {
        Body.setAngularVelocity( seesaw, seesaw.angularVelocity - this.gameSettings.seesawAngularVelocity);
      }
      if (event.keyCode === 39) {
        Body.setAngularVelocity( seesaw, seesaw.angularVelocity + this.gameSettings.seesawAngularVelocity);
      }
      if (event.keyCode === 32) {
        this.startBall();
      }
    });
  }

  setGoalBlockIndex(seesaw) {
    switch(this.gameState.currentLevel) {
      case 1: {
        this.gameState.goalBlockIndex= 5;
        break;
      }
      case 2: {
        this.gameState.goalBlockIndex = Math.round(Math.random()) ? 4 : 6;
        break;
      }
      case 3: {
        this.gameState.goalBlockIndex = Math.round(Math.random()) ? 3 : 7;
        break;
      }
      case 4: {
        this.gameState.goalBlockIndex = Math.round(Math.random()) ? 2 : 8;
        break;
      }
      default: {
        break;
      }
    }
    seesaw.parts[this.gameState.goalBlockIndex].render.fillStyle = this.gameSettings.palette.goalAreaInactive;
  }

  createBalls() {
    let balls = [];
    for (let i = 0; i < 10; i++) {
      const ball = Bodies.circle(
        this.gameSettings.canvasWidth / 2,
        this.gameSettings.ballPosY,
        this.gameSettings.ballSize, 
        { 
          restitution: this.gameSettings.ballRestitution,
          density: this.gameSettings.ballDensity,
          render: {
            fillSytle: this.gameSettings.palette.ball 
          }
        }
      );
      balls.push(ball);
    }
    return balls;
  }

  initDisplayResult() {
    // Display results just for debugging
    const ctx = this.gameState.render.context;
    Events.on(this.gameState.render, "afterRender", (event) => {
      ctx.font = "30px Arial";
      ctx.fillStyle = "orange";
      ctx.textAlign = "center";
      const displayMessage = `${this.gameState.currentTimeSpentOnSpot.toFixed()} millisec
      ${this.gameState.currentBallsLost} balls lost`;
      ctx.fillText(displayMessage, this.gameSettings.canvasWidth/2, this.gameSettings.canvasHeigth/10);
    });
  }

  initBallOnSpotDetection(seesaw) {
    const goalBlock = seesaw.parts[this.gameState.goalBlockIndex];
    const palette = this.gameSettings.palette;

    // Change color when collision starts
    Events.on(this.gameState.engine, 'collisionStart', (event) => {
        const pairs = event.pairs;
        for (var i = 0; i < pairs.length; i++) {
          if (pairs[i].bodyA == goalBlock ||
          pairs[i].bodyB == goalBlock) {
            goalBlock.render.fillStyle = palette.goalAreaActive;
          }
        }
    });

    // Detect time spent on the spot
    Events.on(this.gameState.engine, 'collisionActive', (event) => {
        const pairs = event.pairs;
        for (var i = 0; i < pairs.length; i++) {
          if (pairs[i].bodyA == goalBlock || 
          pairs[i].bodyB == goalBlock) {
            this.gameState.measureTimeEnd = event.source.timing.timestamp;
            if (this.gameState.measureTimeStart && this.gameState.measureTimeEnd) {
              
              this.gameState.currentTimeSpentOnSpot += this.gameState.measureTimeEnd - this.gameState.measureTimeStart;
            }
            this.gameState.measureTimeStart = this.gameState.measureTimeEnd;
          }
        }
    }); 

    // Change color when collision ends
    Events.on(this.gameState.engine, 'collisionEnd', (event) => {
        const pairs = event.pairs;
        for (var i = 0; i < pairs.length; i++) {
          if (pairs[i].bodyA == goalBlock ||
          pairs[i].bodyB == goalBlock) {
            goalBlock.render.fillStyle = palette.goalAreaInactive;
          }
        }
    });
  }

  initBallLossHandling(balls) {
    const outOfScreenPosY = this.gameSettings.canvasHeigth + this.gameSettings.ballSize;
    Events.on(this.gameState.render, "afterRender", (event) => {
      let ballsToRemove = Composite.allBodies(this.gameState.engine.world).filter( body => 
        balls.includes(body) &&  body.position.y > outOfScreenPosY)
      ballsToRemove.forEach( ball => {
          World.remove(this.gameState.engine.world, ball);
          this.resetBallValues(ball);
          this.gameState.currentBallsLost++;
      }) 
    });
  }

  resetBallValues(ball) {
    Body.setPosition(ball, {
      x: this.gameSettings.canvasWidth / 2,
      y: this.gameSettings.ballPosY
    });
    Body.setAngle(ball, 0);
    Body.setVelocity(ball, {x: 0, y: 0});
    Body.setAngularVelocity(ball, 0);
  }

  startBall() {
    const ball = this.gameObjects.balls.find( ball => ball.position.y === this.gameSettings.ballPosY);
    const ballSpawnPosXA = this.gameSettings.canvasWidth / 2 - this.gameSettings.ballSpawnOffset;
    const ballSpawnPosXB = this.gameSettings.canvasWidth / 2 + this.gameSettings.ballSpawnOffset;
    const randXPos = Math.round(Math.random()) > 0 ? ballSpawnPosXA : ballSpawnPosXB;
    Body.setPosition(ball, {x: randXPos, y: ball.position.y})
    World.add(this.gameState.engine.world, ball);
  }

  render() {
    return <div ref="game" />;
  }
}
export default Game;