/// <reference path="../lib/babylon.d.ts"/>
/// <reference path="../../nabu/nabu.d.ts"/>
/// <reference path="../../mummu/mummu.d.ts"/>
/// <reference path="../../marble-run-simulator-core/marble-run-simulator-core.d.ts"/>

var observed_progress_speed_percent_second;

var PlayerHasInteracted = false;
var IsTouchScreen = - 1;

async function WaitPlayerInteraction(): Promise<void> {
    return new Promise<void>(resolve => {
        let wait = () => {
            if (PlayerHasInteracted) {
                resolve();
            }
            else {
                requestAnimationFrame(wait);
            }
        }
        wait();
    })
}

let onFirstPlayerInteractionTouch = (ev: Event) => {
    console.log("onFirstPlayerInteractionTouch");
    ev.stopPropagation();
    IsTouchScreen = 1;
    PlayerHasInteracted = true;
    document.body.removeEventListener("touchstart", onFirstPlayerInteractionTouch);
    document.body.removeEventListener("click", onFirstPlayerInteractionClic);
    document.body.removeEventListener("keydown", onFirstPlayerInteractionKeyboard);
    //Game.Instance.showGraphicAutoUpdateAlert("Touch");
    document.getElementById("click-anywhere-screen").style.display = "none";
}

let onFirstPlayerInteractionClic = (ev: Event) => {
    console.log("onFirstPlayerInteractionClic");
    ev.stopPropagation();
    IsTouchScreen = 0;
    PlayerHasInteracted = true;
    document.body.removeEventListener("touchstart", onFirstPlayerInteractionTouch);
    document.body.removeEventListener("click", onFirstPlayerInteractionClic);
    document.body.removeEventListener("keydown", onFirstPlayerInteractionKeyboard);
    //Game.Instance.showGraphicAutoUpdateAlert("Clic");
    document.getElementById("click-anywhere-screen").style.display = "none";
}

let onFirstPlayerInteractionKeyboard = (ev: Event) => {
    console.log("onFirstPlayerInteractionKeyboard");
    ev.stopPropagation();
    IsTouchScreen = 0;
    PlayerHasInteracted = true;
    document.body.removeEventListener("touchstart", onFirstPlayerInteractionTouch);
    document.body.removeEventListener("click", onFirstPlayerInteractionClic);
    document.body.removeEventListener("keydown", onFirstPlayerInteractionKeyboard);
    //Game.Instance.showGraphicAutoUpdateAlert("Keyboard");
    document.getElementById("click-anywhere-screen").style.display = "none";
}

var SHARE_SERVICE_PATH: string = "https://tiaratum.com/index.php/";

import Core = MarbleRunSimulatorCore;

enum GameMode {
    Home,
    Page,
    Create,
    Challenge,
    Demo
}

enum CameraMode {
    Dev,
    None,
    Ball,
    Landscape,
    Selected,
    Focusing,
    FocusingSelected,
    Transition
}

class Game {
    
    public static Instance: Game;
    public DEBUG_MODE: boolean = false;
    public DEBUG_USE_LOCAL_STORAGE: boolean = false;
    public DEBUG_RANDOM_GRAPHIC_Q_UPDATE: number = 0;

	public canvas: HTMLCanvasElement;
	public engine: BABYLON.Engine;
    public scene: BABYLON.Scene;
    public getScene(): BABYLON.Scene {
        return this.scene;
    }
    public screenRatio: number = 1;

    public camera: BABYLON.FreeCamera;
    //public camera: BABYLON.ArcRotateCamera;
    public camBackGround: BABYLON.FreeCamera;
    public horizontalBlur: BABYLON.BlurPostProcess;
    public verticalBlur: BABYLON.BlurPostProcess;
    public cameraMode: CameraMode = CameraMode.None;
    public menuCameraMode: CameraMode = CameraMode.Ball;
    public targetCamTarget: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public targetCamAlpha: number = - Math.PI * 0.5;
    public targetCamBeta: number = Math.PI * 0.4;
    public targetCamRadius: number = 0.8;
    public targetCamRadiusFromWheel: boolean = false;
    public onFocusCallback: () => void;

    public vertexDataLoader: Mummu.VertexDataLoader;
    public roomMeshes: BABYLON.AbstractMesh[] = [];

    public soonView: SoonView;
    public musicDisplay: MusicDisplay;

    public mainVolume: number = 0;
    private _targetTimeFactor: number = 0.8;
    public get targetTimeFactor(): number {
        return this._targetTimeFactor;
    }
    public set targetTimeFactor(v: number) {
        this._targetTimeFactor = Nabu.MinMax(v, 1 / 32, 1);
    }
    public timeFactor: number = 0.1;
    public get currentTimeFactor(): number {
        return 0.8; 
    }
    public physicDT: number = 0.0005;

    public materials: Core.MainMaterials;
    public machine: Core.Machine;
    public machines: Core.Machine[] = [];
    public spotLight: BABYLON.SpotLight;
    public shadowGenerator: BABYLON.ShadowGenerator;

    public helperShape: HelperShape;

    private _graphicQ: number = Core.GraphicQuality.High;
    public getGraphicQ(): Core.GraphicQuality {
        return this._graphicQ;
    }
    public async setGraphicQ(q: Core.GraphicQuality): Promise<void> {
        this._graphicQ = q;
        this.updateShadowGenerator();
        if (this.machine) {
            await this.machine.instantiate(true);
        }
    }

    public getGeometryQ(): Core.GeometryQuality {
        let graphicQ = this.getGraphicQ();
        if (graphicQ === Core.GraphicQuality.Low) {
            return Core.GeometryQuality.Medium;
        }
        else if (graphicQ >= Core.GraphicQuality.Medium) {
            return Core.GeometryQuality.High
        }
        return Core.GeometryQuality.Low;
    }

    public getMaterialQ(): Core.MaterialQuality {
        let graphicQ = this.getGraphicQ();
        if (graphicQ >= Core.GraphicQuality.High) {
            return Core.MaterialQuality.PBR
        }
        return Core.MaterialQuality.Standard;
    }

    public gridIMin: number;
    public gridIMax: number;
    public gridJMin: number;
    public gridJMax: number;
    public gridKMin: number;
    public gridKMax: number;

    public sortedTiles: Tile[] = [];
    public tiles: Map<number, Map<number, Tile>> = new Map<number, Map<number, Tile>>();
    public getTile(i: number, j: number): Tile {
        if (this.tiles.get(i)) {
            return this.tiles.get(i).get(j);
        }
    }

    public setTile(i: number, j: number, tile: Tile): void {
        if (!this.tiles.get(i)) {
            this.tiles.set(i, new Map<number, Tile>());
        }
        this.tiles.get(i).set(j, tile);
    }

    public getTileAtPos(x: number, z: number): Tile {
        let i = Math.round(x / (1.5 * Tile.SIZE));
        let j = Math.round((z - i * Tile.S_SIZE) / (2 * Tile.S_SIZE));

        return this.getTile(i, j);
    }

    constructor(canvasElement: string) {
        Game.Instance = this;
        
		this.canvas = document.getElementById(canvasElement) as unknown as HTMLCanvasElement;
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
		this.engine = new BABYLON.Engine(this.canvas, true);
		BABYLON.Engine.ShadersRepository = "./shaders/";
        BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;

        window.addEventListener(
            "click",
            () => {
              if (!BABYLON.Engine.audioEngine.unlocked) {
                BABYLON.Engine.audioEngine.unlock();
              }
            },
            { once: true },
        );

        let savedMainSound = window.localStorage.getItem("saved-main-volume");
        if (savedMainSound) {
            let v = parseFloat(savedMainSound);
            if (isFinite(v)) {
                this.mainVolume = Math.max(Math.min(v, 1), 0);
            }
        }
        let savedTimeFactor = window.localStorage.getItem("saved-time-factor");
        if (savedTimeFactor) {
            let v = parseFloat(savedTimeFactor);
            if (isFinite(v)) {
                this.targetTimeFactor = Math.max(Math.min(v, 1), 0);
            }
        }
	}

    public async createScene(): Promise<void> {
        this.scene = new BABYLON.Scene(this.engine);
        this.screenRatio = this.engine.getRenderWidth() / this.engine.getRenderHeight();
        this.vertexDataLoader = new Mummu.VertexDataLoader(this.scene);
        
        let hexaTileData = await this.vertexDataLoader.getAtIndex("./datas/meshes/hexa-tile.babylon");

        
        for (let i = -10; i <= 10; i++) {
            for (let j = -10; j <= 10; j++) {
                let x = i * 1.5 * Tile.SIZE;
                let z = j * 2 * Tile.S_SIZE + i * Tile.S_SIZE;
                let d = Math.sqrt(x * x + z * z);
                if (d < 30) {
                    let tile = new Tile(i, j, this);
                    this.setTile(i, j, tile);
                    this.sortedTiles.push(tile);

                    let colorizedData = Mummu.CloneVertexData(hexaTileData);
                    let color = new BABYLON.Color3(
                        0.8 + 0.2 * Math.random(),
                        0.8 + 0.2 * Math.random(),
                        0.8 + 0.2 * Math.random()
                    );
                    Mummu.ColorizeVertexDataInPlace(colorizedData, color);
                    colorizedData.applyToMesh(tile);
                }
            }
        }

        this.sortedTiles.sort((t1, t2) => {
            if (t1.d === t2.d) {
                return t1.a - t2.a;
            }
            return t1.d - t2.d;
        })

        this.materials = new Core.MainMaterials(this);

        this.spotLight = new BABYLON.SpotLight("spot-light", new BABYLON.Vector3(0, 0.5, 0), new BABYLON.Vector3(0, -1, 0), Math.PI / 3, 1, this.scene);
        this.spotLight.shadowMinZ = 1;
        this.spotLight.shadowMaxZ = 3;
        this.spotLight.intensity = 0;

        let ambientLight = new BABYLON.HemisphericLight("ambient-light", new BABYLON.Vector3(0, 1, 0), this.scene);
        ambientLight.intensity = 0.7;
        ambientLight.groundColor.copyFromFloats(0, 0, 0);

        let skybox = BABYLON.MeshBuilder.CreateSphere("room-skybox", { diameter: 1000, sideOrientation: BABYLON.Mesh.BACKSIDE, segments: 4 }, this.scene);
        let skyboxMaterial = new BABYLON.StandardMaterial("room-skybox-material", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.diffuseColor.copyFromFloats(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        let skyTexture = new BABYLON.Texture("./lib/marble-run-simulator-core/datas/skyboxes/sky.jpeg");
        skyboxMaterial.diffuseTexture = skyTexture;
        skyboxMaterial.emissiveTexture = skyTexture;
        skybox.material = skyboxMaterial;
        skybox.rotation.y = 0.16 * Math.PI;

        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 1.6, -2));
        this.camera.minZ = 0.1;
        this.camera.speed = 0.2;

        this.updateShadowGenerator();

        this.camera.attachControl();
        this.camera.getScene();
        
        this.machine = new Core.Machine(this);
        this.machine.root.position.copyFrom(this.sortedTiles[0].position).addInPlaceFromFloats(0, 0.7, 0);
        this.machine.root.computeWorldMatrix(true);
        
        this.machines[0] = this.machine;
        for (let i = 1; i <= 2; i++) {
            let machine = new Core.Machine(this);
            machine.root.position.copyFrom(this.sortedTiles[i].position).addInPlaceFromFloats(0, 0.7, 0);
            machine.root.computeWorldMatrix(true);
            this.machines.push(machine);
        }

        let waitForMachineReady = () => {
            if (this.machine && this.machine.ready) {
                
            }
            else {
                requestAnimationFrame(waitForMachineReady);
            }
        }
        waitForMachineReady();
        let waitForMachineInstantiated = () => {
            if (this.machine && this.machine.ready && this.machine.instantiated) {
                document.body.addEventListener("touchstart", onFirstPlayerInteractionTouch);
                document.body.addEventListener("click", onFirstPlayerInteractionClic);
                document.body.addEventListener("keydown", onFirstPlayerInteractionKeyboard);
            }
            else {
                requestAnimationFrame(waitForMachineInstantiated);
            }
        }
        waitForMachineInstantiated();

        this.machine.deserialize(fallbackMachine);
        this.machine.generateBaseMesh();
        this.machine.instantiate().then(() => {
            this.machine.play();
        });

        for (let i = 1; i <= 2; i++) {
            let machine = this.machines[i];

            let dataResponse = await fetch("./datas/demos/demo-" + i.toFixed(0) + ".json");
            if (dataResponse) {
                let data = await dataResponse.json() as Core.IMachineData;
                machine.deserialize(data);
                machine.generateBaseMesh();
                machine.instantiate().then(() => {
                    machine.play();
                });
            }
        }

        this.mode = GameMode.Home;

        this.soonView = document.getElementsByTagName("soon-menu")[0] as SoonView;
        this.soonView.setGame(this);

        this.musicDisplay = new MusicDisplay(document.getElementById("music-display") as unknown as HTMLCanvasElement, this);
        this.musicDisplay.reset();
        this.machine.onPlayCallbacks.push(() => {
            this.musicDisplay.reset();
            let xylophones = this.machine.decors.filter(decor => { return decor instanceof Core.Xylophone; });
            xylophones.forEach(xylophone => {
                (xylophone as Core.Xylophone).onSoundPlay = () => {
                    this.musicDisplay.drawNote(xylophone as Core.Xylophone);
                }
            })
        })
	}

	public animate(): void {
		this.engine.runRenderLoop(() => {
			this.scene.render();
			this.update();
		});

        let onResize = () => {
            this.screenRatio = window.innerWidth / window.innerHeight;
            this.engine.resize();
            requestAnimationFrame(() => {
                this.screenRatio = window.innerWidth / window.innerHeight;
                this.engine.resize();
            })
        }
		window.onresize = onResize;
        screen.orientation.onchange = onResize;
	}

    public async initialize(): Promise<void> {
        
    }

    public factoredTimeSinceGameStart: number = 0;
    public averagedFPS: number = 0;
    public updateConfigTimeout: number = - 1;
    public update(): void {
        let rawDT = this.scene.deltaTime / 1000;
        let timeFactoredDT = rawDT * this.currentTimeFactor;
        if (isFinite(timeFactoredDT)) {
            this.factoredTimeSinceGameStart += timeFactoredDT;
        }

        if (isFinite(rawDT)) {
            let tile = this.getTileAtPos(this.camera.position.x, this.camera.position.z);
            if (tile) {
                this.camera.position.y = this.camera.position.y * 0.9 + (tile.position.y + 1) * 0.1;
                console.log(tile.a.toFixed(3));
            }
        }

        if (this.DEBUG_MODE) {
            let camPos = this.camera.position;
            let camTarget = this.camera.target;
            window.localStorage.setItem("camera-position", JSON.stringify({ x: camPos.x, y: camPos.y, z: camPos.z }));
            window.localStorage.setItem("camera-target", JSON.stringify({ x: camTarget.x, y: camTarget.y, z: camTarget.z }));
        }

        if (!this.DEBUG_MODE) {
            this.camera.target.x = Nabu.MinMax(this.camera.target.x, this.machine.baseMeshMinX, this.machine.baseMeshMaxX);
            this.camera.target.y = Nabu.MinMax(this.camera.target.y, this.machine.baseMeshMinY, this.machine.baseMeshMaxY);
            this.camera.target.z = Nabu.MinMax(this.camera.target.z, this.machine.baseMeshMinZ, this.machine.baseMeshMaxZ);
        }

        window.localStorage.setItem("saved-main-volume", this.mainVolume.toFixed(2));
        window.localStorage.setItem("saved-time-factor", this.targetTimeFactor.toFixed(2));

        this.machines.forEach(machine => {
            machine.update();
        })
    }

    public machineEditorContainerIsDisplayed: boolean = false;
    public machineEditorContainerHeight: number = - 1;
    public canvasLeft: number = 0;

    public resizeCanvas(): void {
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvasLeft = 0;
        this.engine.resize();
        requestAnimationFrame(() => {
            this.engine.resize();
        });
    }

    public mode: GameMode;

    public updateShadowGenerator(): void {
        if (this.camera) {
            if (this.getGraphicQ() >= Core.GraphicQuality.VeryHigh && !this.shadowGenerator) {
                this.shadowGenerator = new BABYLON.ShadowGenerator(2048, this.spotLight);
                this.shadowGenerator.useBlurExponentialShadowMap = true;
                this.shadowGenerator.depthScale = 0.01;
                this.shadowGenerator.blurScale = 1;
                this.shadowGenerator.useKernelBlur = true;
                this.shadowGenerator.blurKernel = 4;
                this.shadowGenerator.setDarkness(0.8);
            }
            else {
                if (this.shadowGenerator) {
                    this.shadowGenerator.dispose();
                    delete this.shadowGenerator;
                }
            }
        }
    }
}

function LogTracksBarycenter(): void {
    let machine = Game.Instance.machine;
    let center = new BABYLON.Vector3(
        (machine.tracksMinX + machine.tracksMaxX) * 0.5,
        (machine.tracksMinY + machine.tracksMaxY) * 0.5,
        (machine.tracksMinZ + machine.tracksMaxZ) * 0.5
    );
    //"x": 0.038, "y": 0.075, "z": 0.090
    console.log("x: " + center.x.toFixed(3) + ", y: " + center.y.toFixed(3) + ", z: " + center.z.toFixed(3));
}

let createAndInit = async () => {
    let main: Game = new Game("render-canvas");
    await main.createScene();
    main.initialize().then(() => {
        main.animate();
    });
}

requestAnimationFrame(() => {
    createAndInit();
});