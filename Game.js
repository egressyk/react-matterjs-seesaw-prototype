import React from "react";
import ReactDOM from "react-dom";
import Matter from "matter-js";


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    
  }

  componentDidMount() {
    let measureTimeStart = null;
    let measureTimeEnd = null;
    let timeSpentOnGoalArea = 0;
    const goalAreaIndex = Math.round(Math.random()*4);
    const palette = {
      ball: '#ff502f',
      seesaw: '#004d61',
      goalAreaInactive: '#348498',
      goalAreaActive: '#5bd1d7',
    }

    var Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Events = Matter.Events,
      Mouse = Matter.Mouse,
      Composite = Matter.Composite,
      Composites = Matter.Composites,
      Constraint = Matter.Constraint,
      MouseConstraint = Matter.MouseConstraint,
      Vector = Matter.Vector;

    var engine = Engine.create({
      // positionIterations: 20
    });

    var render = Render.create({
      element: this.refs.game,
      engine: engine,
      options: {
        width: 600,
        height: 600,
        wireframes: false
      }
    });

    const canvas = render.canvas;
    const ctx = render.context;
    

    function addBall() {
      const randXPos = Math.round(Math.random()) > 0 ? 260 : 340;
      const ball = Bodies.circle(randXPos, 100, 20, { 
        restitution: 0.3,
        density: 0.0002,
        render: {
          fillSytle: palette.ball 
        }
      });
      World.add(engine.world, ball);
    }

    // Seesaw
    const stack = Composites.stack(150, 400, 5, 1, 0, 0, function(x, y, col, row, lastBody, i) {
      return Bodies.rectangle(x, y - 10, 60, 20, {
        render: {
          fillStyle: palette.seesaw
        }
      });
    });

    const backgroundBody = Bodies.rectangle(300, 400, 300, 20, {
      render: {
        fillStyle: palette.seesaw
      }
    });

    const seesaw = Body.create({parts: [
      backgroundBody,
      stack.bodies[0],
      stack.bodies[1],
      stack.bodies[2],
      stack.bodies[3],
      stack.bodies[4],
    ]});

    stack.bodies[goalAreaIndex].render.fillStyle = palette.goalAreaInactive;

    Events.on(render, "afterRender", function(event) {
      ctx.font = "30px Arial";
      ctx.fillStyle = "orange";
      ctx.textAlign = "center";
      const displayMessage = `${timeSpentOnGoalArea.toFixed()} millisec`;
      ctx.fillText(displayMessage, canvas.width/2, canvas.height/10);
    });


    // an example of using collisionStart event on an engine
    Events.on(engine, 'collisionStart', function(event) {
        var pairs = event.pairs;

        // change object colours to show those starting a collision
        for (var i = 0; i < pairs.length; i++) {
          if (pairs[i].bodyA == stack.bodies[goalAreaIndex] ||
          pairs[i].bodyB == stack.bodies[goalAreaIndex]) {
            stack.bodies[goalAreaIndex].render.fillStyle = palette.goalAreaActive;
          }
        }
    });

    Events.on(engine, 'collisionActive', function(event) {
        var pairs = event.pairs;

        // change object colours to show those ending a collision
        for (var i = 0; i < pairs.length; i++) {
          if (pairs[i].bodyA == stack.bodies[goalAreaIndex] || 
          pairs[i].bodyB == stack.bodies[goalAreaIndex]) {
            measureTimeEnd = event.source.timing.timestamp;
            if (measureTimeStart && measureTimeEnd) {
              timeSpentOnGoalArea += measureTimeEnd - measureTimeStart;
            }
            measureTimeStart = measureTimeEnd;
          }
        }
    }); 

    // an example of using collisionEnd event on an engine
    Events.on(engine, 'collisionEnd', function(event) {
        var pairs = event.pairs;

        // change object colours to show those ending a collision
        for (var i = 0; i < pairs.length; i++) {
          if (pairs[i].bodyA == stack.bodies[goalAreaIndex] ||
          pairs[i].bodyB == stack.bodies[goalAreaIndex]) {
            stack.bodies[goalAreaIndex].render.fillStyle = palette.goalAreaInactive;
          }
        }
    });

    World.add(engine.world, [ 
      seesaw, 
      Constraint.create({ 
        bodyA: seesaw, 
        pointB: Vector.clone(seesaw.position),
        stiffness: 1,
        length: 0
      })]
    );

    addBall();

    // Add control

    document.addEventListener('keydown', function (event) {
      if (event.keyCode === 37) {
        Body.setAngularVelocity( seesaw, seesaw.angularVelocity + -Math.PI/180);
      }
      if (event.keyCode === 39) {
        Body.setAngularVelocity( seesaw, seesaw.angularVelocity + Math.PI/180);
      }
      if (event.keyCode === 32) {
        addBall();
      }
    });


    Engine.run(engine);

    Render.run(render);
  }

  render() {
    return <div ref="game" />;
  }
}
export default Game;