<!-- Typescript -->
<script lang="ts">
  import Tailwind from "./Tailwind.svelte";

  import { Application, Sprite } from 'pixi.js';

  const runApp = () => {
    const app = new Application({
      view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: 0x6495ed,
      width: 640,
      height: 480,
    });

    const clampy: Sprite = Sprite.from("images/clampy.png");

    clampy.anchor.set(0.5);

    clampy.x = app.screen.width / 2;
    clampy.y = app.screen.height / 2;

    app.stage.addChild(clampy);
  };

  window.onload = () => {
    runApp()
  };

</script>

<!-- Template -->
<canvas id="pixi-canvas" />
<div class="bg-gray-200 px-4 py-2 rounded">Hello Tailwind!</div>





<Tailwind />

<!-- Styles -->
<style>
</style>
