<!-- Typescript -->
<script lang="ts">
  import Tailwind from "./Tailwind.svelte";

  import { Application, Graphics, Text, TextStyle } from 'pixi.js';

  type Game = {
    pixiApp: Application;
    geometry?: {
      container: { width: number; height: number };
      verticalPaddingSize: number; dividerSize: number; padding: number; padWidth: number; padHeight: number;
      fontSize: number; yOffset: number; xOffset: number; stepMovement: number
      startYPoint?: number; endYPoint?: number;
    };
    colors: { lightGray: number }
    keyMap: {[key in string]: boolean};
    player1?: { y: number };
    player2?: { y: number };
    ball?: { x: number, y: number }
  }

  const setup = (): Game => {
    const game: Game = {
      pixiApp: null,
      geometry: { container: { width: 640, height: 480 }, 
        verticalPaddingSize: 15, dividerSize: 15, padding: 20, padWidth: 15, padHeight: 100,
        fontSize: 56, yOffset: 20, xOffset: 48, stepMovement: 10,
      },
      colors: { lightGray: 0xe2e8f0 },
      keyMap: {},
      player1: {
        y:  480/2 - 100/2 // height/2 - padHeight/2, 
      },
      player2: { 
        y:  480/2 - 100/2 // height/2 - padHeight/2, 
      }
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
    const { geometry, player1, player2, keyMap } = game
    const { container, verticalPaddingSize, padHeight, stepMovement } = geometry
    const { height: HEIGHT } = container

    if (keyMap["ArrowUp"] === true) {
      player2.y = Math.max(0 + verticalPaddingSize, player2.y - stepMovement); 
    }
    else if (keyMap["ArrowDown"] === false) {
      player2.y = Math.min(HEIGHT - verticalPaddingSize - padHeight, player2.y + stepMovement)
    }

    return game
  }

  // This changes frequently
  const renderGameScene = (game: Game): Game => {
    const { pixiApp: app, colors, geometry, player1: player1Setting, player2: player2Setting } = game
    const { container, padding, padWidth, padHeight, startYPoint, fontSize, xOffset, yOffset } = geometry
    const { width: WIDTH, height: HEIGHT } = container
    const { lightGray } = colors

    const _getGraphicsObj = (app: Application, name: string): Graphics => {
      let graphicsObj = app.stage.getChildByName(name) as Graphics
      if (!graphicsObj) {
        graphicsObj = new Graphics()
        graphicsObj.name = "pads"
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
        padding,
        player1Setting.y,
        padWidth,
        padHeight,
    );
    pads.endFill();
    // Add player 2 pad
    pads.beginFill(lightGray);
    pads.drawRect(
        WIDTH - padding - padWidth,
        player2Setting.y,
        padWidth,
        padHeight,
    );
    pads.endFill();
    // Add pads to screen
    app.stage.addChild(pads);

    /* Ball */
    const ball = new Graphics()
    ball.beginFill(lightGray);
    ball.drawCircle(WIDTH/2, HEIGHT/2, 8)
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
    console.log("keyDown", event.key)
    event.preventDefault()
    if (!keyMap.hasOwnProperty(event.key)) keyMap[event.key] = false  // Keydown pressed for the first time
    else if (keyMap[event.key])  delete keyMap[event.key]  // keydown pressed from releasing keyup
    else keyMap[event.key] = false
    return keyMap
  }

  const upListener = (event: KeyboardEvent, keyMap) => {
    console.log("keyUp", event.key)
    event.preventDefault()
    if (!keyMap.hasOwnProperty(event.key)) keyMap[event.key] = true  // keyup pressed for the first time
    else if (!keyMap[event.key])  delete keyMap[event.key]  // keyup pressed from releasing keydown
    else keyMap[event.key] = true
    return keyMap
  }

  const runApp = () => { 
    let game = setup()

    game = drawBackground(game)
    renderGameScene(game)

    setInterval(() => {
      game = update(game)
      game = renderGameScene(game)
    }, 1000 / 60)

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
