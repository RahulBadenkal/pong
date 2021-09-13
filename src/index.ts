import { Container, Sprite } from "pixi.js";
import { Sound } from "@pixi/sound";


export class Scene extends Container {
    private readonly screenWidth: number;
    private readonly screenHeight: number;

    private clampy: Sprite;
    private clampyVelocity: number = 5;
    constructor(screenWidth: number, screenHeight: number) {
        super();

        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        this.clampy = Sprite.from("clampy.png");

        this.clampy.x = 0; // we start it at 0
        this.clampy.y = 0;
        this.addChild(this.clampy);

        console.log(this.clampy.getBounds())
        console.log(this.clampy.getLocalBounds())

        // Just like everything else, `from()` and then we are good to go
        debugger
        const whistly = Sound.from("james-bond-music-363.mp3");
        whistly.volume = 0.5;
        whistly.play();
      
    }
}

import { Application } from 'pixi.js'

const app = new Application({
    view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
    resolution: window.devicePixelRatio || 1,
    backgroundColor: 0x6495ed,
    width: 640,
    height: 480
});

// pass in the screen size to avoid "asking up"
const sceny: Scene = new Scene(640, 480);

app.stage.addChild(sceny)
