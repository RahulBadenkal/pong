<!-- Typescript -->
<script lang="ts">
  import Tailwind from "./Tailwind.svelte";

  import { Application, Graphics, Text, TextStyle } from 'pixi.js';

  const runApp = () => {
    const [width, height] = [640, 480];
    const app = new Application({
      view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: 0x000000,
      width: width,
      height: height,
    });

    const lightGray = 0xe2e8f0
    
    /* Top padding */
    const verticalPaddingSize = 15
    const verticalPadding = new Graphics()
    verticalPadding.beginFill(lightGray);
    // Add top padding
    verticalPadding.drawRect(
        0,
        0,
        width,
        verticalPaddingSize,
    );
    // Add bottom padding
    verticalPadding.drawRect(
        0,
        height - verticalPaddingSize,
        width,
        verticalPaddingSize,
    );
    verticalPadding.endFill();
    // Add to screen
    app.stage.addChild(verticalPadding);

    const screenHeight = height - 2*verticalPaddingSize
    const [startYPoint, endYPoint] = [verticalPaddingSize, height - verticalPaddingSize]

    /* Divider */
    const dividerSize = 15
    const dividerCount = Math.ceil(Math.floor(screenHeight/ dividerSize) / 2)
    const dividers = new Graphics()
    dividers.beginFill(lightGray);
    for (let i=0; i<dividerCount; i++) {
      dividers.drawRect(
        (width/2 - dividerSize/2), 
        startYPoint + (2*i)*dividerSize,
        dividerSize,
        dividerSize,  
      )
    }
    dividers.endFill();
    app.stage.addChild(dividers)

    /* Pads */
    const padding = 20
    const [padWidth, padHeight] = [15, 100];
    const pads = new Graphics()
    // Add player 1 pad
    pads.beginFill(lightGray);
    pads.drawRect(
        padding,
        height/2 - padHeight/2,
        padWidth,
        padHeight,
    );
    pads.endFill();
    // Add player 2 pad
    pads.beginFill(lightGray);
    pads.drawRect(
        width - padding - padWidth,
        height/2 - padHeight/2,
        padWidth,
        padHeight,
    );
    pads.endFill();
    // Add pads to screen
    app.stage.addChild(pads);

    /* Ball */
    const ball = new Graphics()
    ball.beginFill(lightGray);
    ball.drawCircle(width/2, height/2, 8)
    ball.endFill()
    app.stage.addChild(ball)

    /* Score */
    const [fontSize, yOffset, xOffset] = [56, 20, 48]
    const textOptions: Partial<TextStyle> = {fontFamily : 'Arial', fontSize: fontSize, fill : lightGray, align : 'center', fontWeight: "bold"}
    // Player 1 score
    let player1ScoreText = new Text('10', textOptions);
    player1ScoreText.position.x = width/2 - player1ScoreText.width - xOffset
    player1ScoreText.position.y = startYPoint + yOffset
    // Player 2 score
    let player2ScoreText = new Text('2', textOptions);
    player2ScoreText.position.x = width/2 + xOffset
    player2ScoreText.position.y = startYPoint + yOffset

    app.stage.addChild(player1ScoreText)
    app.stage.addChild(player2ScoreText)

    
        
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
