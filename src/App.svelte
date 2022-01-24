<!-- Typescript -->
<script lang="ts">
  import Tailwind from "./Tailwind.svelte";

  import { Application, Graphics, Text, TextStyle } from 'pixi.js';

  // All velocities are in px/second
  type Game = {
    fps: number,
    pixiApp: Application;
    geometry: {
      container: { width: number; height: number };
      verticalPaddingSize: number; dividerSize: number; padding: number; padWidth: number; padHeight: number;
      fontSize: number; yOffset: number; xOffset: number; padSpeed: number, ballRadius: number,
      startYPoint?: number; endYPoint?: number;
    };
    lastFrameTimeMs: number;
    colors: { lightGray: number }
    keyMap: {[key in string]: boolean};
    player1?: { position: { x: number, y: number }; velocity: { x: number; y: number } };
    player2?: { position: { x: number, y: number }; velocity: { x: number; y: number } };
    ball?: { position: { x: number; y: number }, velocity: { x: number; y: number }}
  }

  const setup = (): Game => {
    const game: Game = {
      fps: 60,
      pixiApp: null,
      geometry: { container: { width: 640, height: 480 }, 
        verticalPaddingSize: 15, dividerSize: 15, padding: 20, padWidth: 15, padHeight: 80,
        fontSize: 56, yOffset: 20, xOffset: 48, padSpeed: 0.4, ballRadius: 8,
      },
      lastFrameTimeMs: Date.now(),
      colors: { lightGray: 0xe2e8f0 },
      keyMap: {},
      player1: { position: { x: 20, y: 480/2 }, velocity: { x: 0, y: 0.4 } },  // x: padding
      player2: { position: { x: 640 - 20 - 15, y: 480/2 }, velocity: { x: 0, y: 0.4 } },  // x: WIDTH - padding - padWidth,
      ball: { position: { x: 640/2, y: 480/2 }, velocity: { x: 0.1, y: 0 } }
    }

    // Add keyboard listeners
    window.addEventListener("keydown", (event: KeyboardEvent) => {
      game.keyMap = downListener(event, game.keyMap)
    }, false);
    window.addEventListener("keyup", (event: KeyboardEvent) => {
      game.keyMap = upListener(event, game.keyMap)
    }, false);

    // Setup pixi app
    const pixiApp = new Application({
      view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: 0x000000,
      width: game.geometry.container.width,
      height: game.geometry.container.height,
    });
    game.pixiApp = pixiApp

    return game
  }
  
  // This doesn't change frequently
  const drawBackground = (game: Game): Game => {
    const { pixiApp: app, colors } = game
    const { container, verticalPaddingSize, dividerSize } = game.geometry
    const { width: WIDTH, height: HEIGHT } = container
    const { lightGray } = colors

     /* Top padding */
    const verticalPadding = new Graphics()
    verticalPadding.beginFill(lightGray);
    // Add top padding
    verticalPadding.drawRect(
        0,
        0,
        WIDTH,
        verticalPaddingSize,
    );
    // Add bottom padding
    verticalPadding.drawRect(
        0,
        HEIGHT - verticalPaddingSize,
        WIDTH,
        verticalPaddingSize,
    );
    verticalPadding.endFill();
    // Add to screen
    app.stage.addChild(verticalPadding);

    const screenHeight = HEIGHT - 2*verticalPaddingSize
    const [startYPoint, endYPoint] = [verticalPaddingSize, HEIGHT - verticalPaddingSize]

    /* Divider */
    const dividerCount = Math.ceil(Math.floor(screenHeight/ dividerSize) / 2)
    const dividers = new Graphics()
    dividers.beginFill(lightGray);
    for (let i=0; i<dividerCount; i++) {
      dividers.drawRect(
        (WIDTH/2 - dividerSize/2), 
        startYPoint + (2*i)*dividerSize,
        dividerSize,
        dividerSize,  
      )
    }
    dividers.endFill();
    app.stage.addChild(dividers)

    game.geometry = { ...game.geometry, startYPoint, endYPoint }
    return game
  }

  const update = (game: Game) => {
    const { geometry, player1, player2, ball, keyMap, lastFrameTimeMs } = game
    const { container, verticalPaddingSize, padWidth, padHeight, padSpeed, ballRadius } = geometry
    const { height: HEIGHT, width: WIDTH } = container
    game.lastFrameTimeMs = Date.now()
    const delta = game.lastFrameTimeMs - lastFrameTimeMs

    // Determine player 2 velocity by reding user input 
    // Only one key is processed at any time
    if (keyMap["ArrowUp"]) {
      player2.velocity = { x: 0, y: -1 * padSpeed }
    }
    else if (keyMap["ArrowDown"]) {
      player2.velocity = { x: 0, y: 1 * padSpeed }
    }
    else {
      player2.velocity = { x: 0, y: 0 }
    }

    // Determine player 1 (AI logic)
    player1.velocity = { x: 0, y: 0 }

    // Calculate player 1 pad position
    player1.position = { 
      x: player1.position.x + player1.velocity.x * delta, 
      y: player1.position.y + player1.velocity.y * delta 
    }

    // Calculate player 2 pad position
    player2.position = { 
      x: player2.position.x + player2.velocity.x * delta, 
      y: player2.position.y + player2.velocity.y * delta 
    }

    // Calculate ball position
    ball.position = {
      x: ball.position.x + ball.velocity.x * delta, 
      y: ball.position.y + ball.velocity.y * delta
    }

    // Handle collision
    const _handlePadCollisionWithWall = (position: { x: number, y: number }) => {
      position.y = Math.max(0 + verticalPaddingSize, position.y)
      position.y = Math.min(HEIGHT - verticalPaddingSize - padHeight, position.y)
      return position
    }

    const _isNumBetween = (num: number, num1: number, num2: number) => {
      return num >= num1 && num <= num2
    }

    const _doBoundingBoxCollide = (obj1: { x1: number; x2: number; y1: number; y2: number }, obj2: { x1: number; x2: number; y1: number, y2: number}) => {
      [obj1, obj2] = obj1.x1 <= obj2.x1 ? [obj1, obj2] : [obj2, obj1];
      const collideInX = _isNumBetween(obj2.x1, obj1.x1, obj1.x2) ||_isNumBetween(obj2.x2, obj1.x1, obj1.x2);

      [obj1, obj2] = obj1.y1 <= obj2.y1 ? [obj1, obj2] : [obj2, obj1];
      const collideInY = _isNumBetween(obj2.y1, obj1.y1, obj1.y2) ||_isNumBetween(obj2.y2, obj1.y1, obj1.y2);

      return collideInX && collideInY
    }

    const _getBallBoundingBox = (ballRadius: number, position: { x: number; y: number }) => {
      return {
        x1: position.x - ballRadius, x2: position.x + ballRadius,
        y1: position.y - ballRadius, y2: position.y + ballRadius
      }
    }

    const _getPadBoundingBox = (padWidth: number, padHeight: number, position: { x: number; y: number }) => {
      return {
        x1: position.x, x2: position.x + padWidth,
        y1: position.y, y2: position.y + padHeight
      }
    }

    const _isBallCollidingWithPad = (ballRadius: number, padWidth: number, padHeight: number, ballPostion: { x: number; y: number }, padPosition: {x: number; y: number }) => {
      return _doBoundingBoxCollide(
        _getBallBoundingBox(ballRadius, ballPostion), 
        _getPadBoundingBox(padWidth, padHeight, padPosition)
        )
    }

    const _handleBallCollisionWithPad = (ballRadius: number, padWidth: number, padHeight: number, ball: { position: { x: number; y: number }, velocity: { x: number; y: number } }, pad: { position: { x: number; y: number }, velocity: {x: number; y: number }}) => {
      if (_isBallCollidingWithPad(ballRadius, padWidth, padHeight, ball.position, pad.position)) {
        return { x: -1 * ball.velocity.x, y: ball.velocity.y + pad.velocity.y }
      }
      else {
        return ball.velocity
      }
    }

    const _handleBallCollisionWithWall = (ballRadius: number, ball: { position: { x: number; y: number }, velocity: { x: number; y: number }}) => {
      const ballBoundingBox = _getBallBoundingBox(ballRadius, ball.position)
      const initialBallConfig = {
        position: { x: WIDTH / 2, y: HEIGHT / 2 },
        velocity: { x: 0.4, y: 0 },
      }
      
      // Horizontal collision
      if (ballBoundingBox.x1 <= 0 || ballBoundingBox.x2 >= WIDTH) {
        return initialBallConfig
      }

      // Vertical collision
      if (ballBoundingBox.y1 <= 0 || ballBoundingBox.y2 >= HEIGHT) {
        return {
          position: ball.position,
          velocity: { x: ball.velocity.x, y: -1 * ball.velocity.y }
        }
      }

      return ball
    }

    // Pad collision with surface
    player1.position = _handlePadCollisionWithWall(player1.position)
    player2.position = _handlePadCollisionWithWall(player2.position)

    // Ball collision with pad
    ball.velocity = _handleBallCollisionWithPad(ballRadius, padWidth, padHeight, ball, player1)
    ball.velocity = _handleBallCollisionWithPad(ballRadius, padWidth, padHeight, ball, player2)

    // Ball collision with wall
    let newBall = _handleBallCollisionWithWall(ballRadius, ball)
    ball.position = newBall.position;
    ball.velocity = newBall.velocity

    return { ...game, player1, player2, ball }
  }

  // This changes frequently
  const renderGameScene = (game: Game): Game => {
    const { pixiApp: app, colors, geometry, player1: player1Setting, player2: player2Setting, ball: ballSetting } = game
    const { container, padding, padWidth, padHeight, startYPoint, fontSize, xOffset, yOffset, ballRadius } = geometry
    const { width: WIDTH, height: HEIGHT } = container
    const { lightGray } = colors

    const _getGraphicsObj = (app: Application, name: string): Graphics => {
      let graphicsObj = app.stage.getChildByName(name) as Graphics
      if (!graphicsObj) {
        graphicsObj = new Graphics()
        graphicsObj.name = name
      }
      else {
        graphicsObj.clear()
      }
      return graphicsObj
    }

    /* Pads */
    const pads = _getGraphicsObj(app, "pads")
    // Add player 1 pad
    pads.beginFill(lightGray);
    pads.drawRect(
        player1Setting.position.x,
        player1Setting.position.y,
        padWidth,
        padHeight,
    );
    pads.endFill();
    // Add player 2 pad
    pads.beginFill(lightGray);
    pads.drawRect(
        player2Setting.position.x,
        player2Setting.position.y,
        padWidth,
        padHeight,
    );
    pads.endFill();
    // Add pads to screen
    app.stage.addChild(pads);

    /* Ball */
    const ball = _getGraphicsObj(app, "ball")
    ball.beginFill(lightGray);
    ball.drawCircle(ballSetting.position.x, ballSetting.position.y, ballRadius)
    ball.endFill()
    app.stage.addChild(ball)

    /* Score */
    const textOptions: Partial<TextStyle> = {fontFamily : 'Arial', fontSize: fontSize, fill : lightGray, align : 'center', fontWeight: "bold"}
    // Player 1 score
    let player1ScoreText = new Text('10', textOptions);
    player1ScoreText.position.x = WIDTH/2 - player1ScoreText.width - xOffset
    player1ScoreText.position.y = startYPoint + yOffset
    // Player 2 score
    let player2ScoreText = new Text('2', textOptions);
    player2ScoreText.position.x = WIDTH/2 + xOffset
    player2ScoreText.position.y = startYPoint + yOffset

    app.stage.addChild(player1ScoreText)
    app.stage.addChild(player2ScoreText)

    return game
  }

  const downListener = (event: KeyboardEvent, keyMap) => {
    event.preventDefault()
    keyMap[event.key] = true
    return keyMap
  }

  const upListener = (event: KeyboardEvent, keyMap) => {
    event.preventDefault()
    keyMap[event.key] = false
    return keyMap
  }

  const runApp = () => { 
    let game = setup()

    game = drawBackground(game)
    renderGameScene(game)

    setInterval(() => {
      game = update(game)
      game = renderGameScene(game)
    }, 1000 / game.fps )

  };

  window.onload = () => {
    runApp()
   
  };

</script>

<!-- Lib imports -->
<Tailwind />


<!-- Template -->
<div class="flex justify-center mt-32">
  <canvas id="pixi-canvas" />
</div>



<!-- Styles -->
<style>
</style>
