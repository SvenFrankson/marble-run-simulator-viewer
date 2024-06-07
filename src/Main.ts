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

    //public camera: BABYLON.FreeCamera;
    public camera: BABYLON.ArcRotateCamera;
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
    private _trackTargetCamSpeed: number = 0;
    public onFocusCallback: () => void;

    public vertexDataLoader: Mummu.VertexDataLoader;

    public topbar: Topbar;
    public toolbar: Toolbar;
    public soonView: SoonView;
    public router: MarbleRouter;

    public cameraOrtho: boolean = false;
    public animateCamera = Mummu.AnimationFactory.EmptyNumbersCallback;
    public animateCameraTarget = Mummu.AnimationFactory.EmptyVector3Callback;

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
        return this.timeFactor * (this.mode === GameMode.Home ? 0.5 : 1); 
    }
    public physicDT: number = 0.0005;

    public materials: Core.MainMaterials;
    public machine: Core.Machine;
    public room: Core.Room;
    public spotLight: BABYLON.SpotLight;
    public shadowGenerator: BABYLON.ShadowGenerator;

    public helperShape: HelperShape;

    private _graphicQ: number = Core.GraphicQuality.Medium;
    public getGraphicQ(): Core.GraphicQuality {
        return this._graphicQ;
    }
    public async setGraphicQ(q: Core.GraphicQuality): Promise<void> {
        this._graphicQ = q;
        this.updateShadowGenerator();
        if (this.machine) {
            await this.machine.instantiate(true);
            this.updateMachineAuthorAndName();
        }
        await this.room.setRoomIndex(this.room.contextualRoomIndex(this.room.currentRoomIndex));
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
        if (graphicQ >= Core.GraphicQuality.Medium) {
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

    constructor(canvasElement: string) {
        Game.Instance = this;
        
		this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
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
        
        this.materials = new Core.MainMaterials(this);

        this.spotLight = new BABYLON.SpotLight("spot-light", new BABYLON.Vector3(0, 0.5, 0), new BABYLON.Vector3(0, -1, 0), Math.PI / 3, 1, this.scene);
        this.spotLight.shadowMinZ = 1;
        this.spotLight.shadowMaxZ = 3;

        this.camera = new BABYLON.ArcRotateCamera("camera", this.targetCamAlpha, this.targetCamBeta, this.targetCamRadius, this.targetCamTarget.clone());
        this.camera.layerMask = 0;
        this.camera.minZ = 0.01;
        this.camera.maxZ = 25;
        this.camera.upperBetaLimit = Math.PI * 0.5;
        this.camera.lowerRadiusLimit = 0.05;
        this.camera.upperRadiusLimit = 2;
        this.camera.wheelPrecision = 1000;
        this.camera.panningSensibility = 4000;
        this.camera.panningInertia *= 0.5;
        this.camera.angularSensibilityX = 2000;
        this.camera.angularSensibilityY = 2000;
        this.camera.pinchPrecision = 5000;

        this.animateCamera = Mummu.AnimationFactory.CreateNumbers(this.camera, this.camera, ["alpha", "beta", "radius"], undefined, [true, true, false], Nabu.Easing.easeInOutSine);
        this.animateCameraTarget = Mummu.AnimationFactory.CreateVector3(this.camera, this.camera, "target", undefined, Nabu.Easing.easeInOutSine);

        this.updateCameraLayer();
        this.updateShadowGenerator();

        if (this.DEBUG_MODE) {
            if (window.localStorage.getItem("camera-target")) {
                let targetItem = JSON.parse(window.localStorage.getItem("camera-target"));
                let target = new BABYLON.Vector3(targetItem.x, targetItem.y, targetItem.z);
                if (Mummu.IsFinite(target)) {
                    this.camera.target.x = target.x;
                    this.camera.target.y = target.y;
                    this.camera.target.z = target.z;
                }
            }
            if (window.localStorage.getItem("camera-position")) {
                let positionItem = JSON.parse(window.localStorage.getItem("camera-position"));
                let position = new BABYLON.Vector3(positionItem.x, positionItem.y, positionItem.z);
                if (Mummu.IsFinite(position)) {
                    this.camera.setPosition(position);
                }
            }
        }
        
        this.camera.attachControl();
        this.camera.getScene();

        this.room = new Core.Room(this);
        this.room.onRoomJustInstantiated = () => { this.updateCameraLayer(); };
        
        this.machine = new Core.Machine(this);
        let waitForMachineReady = () => {
            if (this.machine && this.machine.ready) {
                this.camera.layerMask = 0x0FFFFFFF;
                this.updateCameraLayer();
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

        if (this.DEBUG_USE_LOCAL_STORAGE) {
            let dataString = localStorage.getItem("last-saved-machine");
            if (dataString) {
                let data = JSON.parse(dataString);
                if (data) {
                    this.machine.deserialize(data);
                }
                else {
                    this.machine.deserialize(fallbackMachine);
                }
            }
            else {
                this.machine.deserialize(fallbackMachine);
            }
        }
        else {
            this.machine.deserialize(fallbackMachine);
        }

        this.mode = GameMode.Home;

        this.topbar = new Topbar(this);
        this.topbar.initialize();
        this.topbar.resize();

        this.toolbar = new Toolbar(this);
        this.toolbar.initialize();
        this.toolbar.resize();

        this.soonView = document.getElementsByTagName("soon-menu")[0] as SoonView;
        this.soonView.setGame(this);

        if (this.getGraphicQ() === 0) {
            this.room.setRoomIndex(1, true);
        }
        else {
            this.room.setRoomIndex(0, true);
        }

        this.router = new MarbleRouter(this);
        this.router.initialize();

        /*
        let arrow = new SvgArrow("test", this, 0.3, 0.2, - 45);
        arrow.instantiate();
        setTimeout(() => {
            arrow.setTarget(document.querySelector("panel-element"));
            arrow.show();
        }, 2000);
        */
        
        let alternateMenuCamMode = () => {
            if (this.menuCameraMode === CameraMode.Ball) {
                this.menuCameraMode = CameraMode.Landscape;
            }
            else {
                this.menuCameraMode = CameraMode.Ball;
            }
            if (this.mode <= GameMode.Page) {
                this.setCameraMode(this.menuCameraMode);
            }
            setTimeout(alternateMenuCamMode, 10000 + 10000 * Math.random());
        }
        alternateMenuCamMode();

        this.canvas.addEventListener("pointerdown", this.onPointerDown);
        this.canvas.addEventListener("pointerup", this.onPointerUp);
        this.canvas.addEventListener("wheel", this.onWheelEvent);
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
                this.topbar.resize();
                this.toolbar.resize();
                if (this.router) {
                    if (this.router.homePage) {
                        this.router.homePage.resize();
                    }
                }
            })
        }
		window.onresize = onResize;
        screen.orientation.onchange = onResize;
	}

    public async initialize(): Promise<void> {
        
    }

    public averagedFPS: number = 0;
    public updateConfigTimeout: number = - 1;
    public update(): void {
        let rawDT = this.scene.deltaTime / 1000;
        let timeFactoredDT = rawDT * this.currentTimeFactor;

        if (this.DEBUG_MODE) {
            let camPos = this.camera.position;
            let camTarget = this.camera.target;
            window.localStorage.setItem("camera-position", JSON.stringify({ x: camPos.x, y: camPos.y, z: camPos.z }));
            window.localStorage.setItem("camera-target", JSON.stringify({ x: camTarget.x, y: camTarget.y, z: camTarget.z }));
        }

        if (this.cameraMode > CameraMode.None && this.cameraMode != CameraMode.Selected && isFinite(rawDT)) {
            let speed = 0.01;
            let camTarget = this.targetCamTarget;
            if (this.cameraMode === CameraMode.Ball && this.machine && this.machine.balls && this.machine.balls[0]) {
                this._trackTargetCamSpeed = this._trackTargetCamSpeed * 0.9995 + 30 * 0.0005;
                camTarget = this.machine.balls[0].position;
            }
            else if (this.cameraMode >= CameraMode.Focusing) {
                this._trackTargetCamSpeed = this._trackTargetCamSpeed * 0.995 + 20 * 0.005;
                speed = 0.2;
            }
            else {
                this._trackTargetCamSpeed = 0.2;
            }
            let target = BABYLON.Vector3.Lerp(this.camera.target, camTarget, this._trackTargetCamSpeed * rawDT);
            let alpha = Nabu.Step(this.camera.alpha, this.targetCamAlpha, Math.PI * speed * rawDT);
            let beta = Nabu.Step(this.camera.beta, this.targetCamBeta, Math.PI * speed * rawDT);
            let radius = Nabu.Step(this.camera.radius, this.targetCamRadius, 20 * speed * rawDT);
    
            this.camera.target.copyFrom(target);
            this.camera.alpha = alpha;
            this.camera.beta = beta;
            if (!this.targetCamRadiusFromWheel) {
                this.camera.radius = radius;
            }
            else {
                this.targetCamRadius = this.camera.radius;
            }

            if (this.cameraMode >= CameraMode.Focusing) {
                if (Math.abs(this.camera.alpha - this.targetCamAlpha) < Math.PI / 180) {
                    if (Math.abs(this.camera.beta - this.targetCamBeta) < Math.PI / 180) {
                        if (Math.abs(this.camera.radius - this.targetCamRadius) < 0.001) {
                            if (BABYLON.Vector3.Distance(this.camera.target, this.targetCamTarget) < 0.001) {
                                if (this.cameraMode === CameraMode.FocusingSelected) {
                                    this.cameraMode = CameraMode.Selected;
                                    this.camera.attachControl();
                                }
                                else {
                                    this.cameraMode = CameraMode.None;
                                    this.camera.attachControl();
                                }
                            }
                        }
                    }
                }
            }
            else if (this.cameraMode <= CameraMode.Landscape) {
                if (Math.abs(this.camera.alpha - this.targetCamAlpha) < Math.PI / 180) {
                    this.targetCamAlpha = - 0.2 * Math.PI - Math.random() * Math.PI * 0.6;
                }
                if (Math.abs(this.camera.beta - this.targetCamBeta) < Math.PI / 180) {
                    this.targetCamBeta = 0.15 * Math.PI + Math.random() * Math.PI * 0.35;
                }
            }
        }

        if (!this.DEBUG_MODE) {
            this.camera.target.x = Nabu.MinMax(this.camera.target.x, this.machine.baseMeshMinX, this.machine.baseMeshMaxX);
            this.camera.target.y = Nabu.MinMax(this.camera.target.y, this.machine.baseMeshMinY, this.machine.baseMeshMaxY);
            this.camera.target.z = Nabu.MinMax(this.camera.target.z, this.machine.baseMeshMinZ, this.machine.baseMeshMaxZ);
        }

        window.localStorage.setItem("saved-main-volume", this.mainVolume.toFixed(2));
        window.localStorage.setItem("saved-time-factor", this.targetTimeFactor.toFixed(2));

        if (this.cameraOrtho) {
            let f = this.camera.radius / 4;
            this.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
            this.camera.orthoTop = 1 * f;
            this.camera.orthoBottom = - 1 * f;
            this.camera.orthoLeft = - this.screenRatio * f;
            this.camera.orthoRight = this.screenRatio * f;
        }
        else {
            this.camera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
        }

        if (this.machine) {
            this.machine.update();
        }

        let fps = 1 / rawDT;
        if (isFinite(fps)) {
            if (fps < 24 && this.timeFactor > this.targetTimeFactor / 2) {
                this.timeFactor *= 0.99;
            }
            else {
                this.timeFactor = this.timeFactor * 0.99 + this.targetTimeFactor * 0.01;
            }

            let imposedTimeFactorRatio = this.timeFactor / this.targetTimeFactor;

            if (this.machine.instantiated && true) {
                this.averagedFPS = 0.99 * this.averagedFPS + 0.01 * fps;
                if ((this.averagedFPS < 24 || imposedTimeFactorRatio < 0.8 || this.DEBUG_RANDOM_GRAPHIC_Q_UPDATE === - 1) && this.getGraphicQ() > Core.GraphicQuality.VeryLow) {
                    if (this.updateConfigTimeout === - 1) {
                        this.updateConfigTimeout = setTimeout(() => {
                            let graphicQ = this.getGraphicQ();
                            if (true) {
                                this.machine.minimalAutoQualityFailed = graphicQ;
                                let newConfig = graphicQ - 1;
                                this.setGraphicQ(newConfig);
                                this.showGraphicAutoUpdateAlert();
                                this.DEBUG_RANDOM_GRAPHIC_Q_UPDATE = 0;
                            }
                            this.updateConfigTimeout = -1;
                        }, 5000);
                    }
                }
                else if ((this.averagedFPS > 59 && imposedTimeFactorRatio > 0.99 || this.DEBUG_RANDOM_GRAPHIC_Q_UPDATE === 1) && this.getGraphicQ() < this.machine.minimalAutoQualityFailed - 1) {
                    if (this.updateConfigTimeout === - 1) {
                        this.updateConfigTimeout = setTimeout(() => {
                            let graphicQ = this.getGraphicQ();
                            if (true) {
                                let newConfig = graphicQ + 1;
                                this.setGraphicQ(newConfig);
                                this.showGraphicAutoUpdateAlert();
                                this.DEBUG_RANDOM_GRAPHIC_Q_UPDATE = 0;
                            }
                            this.updateConfigTimeout = -1;
                        }, 5000);
                    }
                }
                else {
                    clearTimeout(this.updateConfigTimeout);
                    this.updateConfigTimeout = -1;
                }
            }
            else {
                clearTimeout(this.updateConfigTimeout);
                this.updateConfigTimeout = -1;
            }
        }
    }

    public machineEditorContainerIsDisplayed: boolean = false;
    public machineEditorContainerHeight: number = - 1;
    public canvasLeft: number = 0;

    public resizeCanvas(): void {
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvasLeft = 0;
        this.engine.resize();
        this.topbar.resize();
        this.toolbar.resize();
        requestAnimationFrame(() => {
            this.engine.resize();
            this.topbar.resize();
            this.toolbar.resize();
        });
    }

    public mode: GameMode;

    public updateCameraLayer(): void {
        if (this.machine && this.machine.ready) {
            if (this.camera) {
                if (this.horizontalBlur) {
                    this.horizontalBlur.dispose();
                }
                if (this.verticalBlur) {
                    this.verticalBlur.dispose();
                }
                if (this.camBackGround) {
                    this.camBackGround.dispose();
                }
    
                if (this.getGraphicQ() > 0 && this.room && this.room.isBlurred) {
                    this.camBackGround = new BABYLON.FreeCamera("background-camera", BABYLON.Vector3.Zero());
                    this.camBackGround.parent = this.camera;
                    this.camBackGround.layerMask = 0x10000000;
    
                    this.scene.activeCameras = [this.camBackGround, this.camera];
                    this.horizontalBlur = new BABYLON.BlurPostProcess("blurH", new BABYLON.Vector2(1, 0), 16, 1, this.camBackGround)
                    this.verticalBlur = new BABYLON.BlurPostProcess("blurV", new BABYLON.Vector2(0, 1), 16, 1, this.camBackGround)
                }
                else {
                    this.scene.activeCameras = [this.camera];
                }
            }
        }
    }

    public updateShadowGenerator(): void {
        if (this.camera) {
            if (this.getGraphicQ() >= Core.GraphicQuality.High && !this.shadowGenerator) {
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

    public getCameraMinFOV(): number {
        let ratio = this.engine.getRenderWidth() / this.engine.getRenderHeight();
        let fov = this.camera.fov;
        if (ratio > 1) {
            return fov;
        }
        return fov * ratio;
    }

    public getCameraHorizontalFOV(): number {
        return 2 * Math.atan(this.screenRatio * Math.tan(this.camera.fov / 2));
    }

    public getCameraZoomFactor(): number {
        let f = 1;
        if (this.cameraMode === CameraMode.Ball || this.cameraMode === CameraMode.Landscape) {
            f = 1 - (this.targetCamRadius - this.camera.lowerRadiusLimit) / (this.camera.upperRadiusLimit - this.camera.lowerRadiusLimit);
        }
        else {
            f = 1 - (this.camera.radius - this.camera.lowerRadiusLimit) / (this.camera.upperRadiusLimit - this.camera.lowerRadiusLimit);
        }
        return f * f;
    }

    public setCameraZoomFactor(v: number) {
        this.targetCamRadiusFromWheel = false;
        v = Nabu.MinMax(v, 0, 1);
        let f = Math.sqrt(v);
        if (this.cameraMode === CameraMode.Ball || this.cameraMode === CameraMode.Landscape) {
            this.targetCamRadius = (1 - f) * (this.camera.upperRadiusLimit - this.camera.lowerRadiusLimit) + this.camera.lowerRadiusLimit;
        }
        else {
            this.animateCamera([this.camera.alpha, this.camera.beta, (1 - f) * (this.camera.upperRadiusLimit - this.camera.lowerRadiusLimit) + this.camera.lowerRadiusLimit], 0.3);
        }
    }

    public setCameraMode(camMode: CameraMode, lockRotation?: boolean, lockPanning?: boolean): void {
        if (lockRotation) {
            this.camera.inputs.attached["pointers"]["angularSensibilityX"] = Infinity;
            this.camera.inputs.attached["pointers"]["angularSensibilityY"] = Infinity;
            this.camera.inputs.attached["keyboard"]["angularSpeed"] = 0;
        }
        else {
            this.camera.inputs.attached["pointers"]["angularSensibilityX"] = 2000;
            this.camera.inputs.attached["pointers"]["angularSensibilityY"] = 2000;
            this.camera.inputs.attached["keyboard"]["angularSpeed"] = 0.005;
        }

        if (lockPanning) {
            this.camera.inputs.attached["pointers"]["panningSensibility"] = Infinity;
        }
        else {
            this.camera.inputs.attached["pointers"]["panningSensibility"] = 4000;
        }

        if (camMode >= CameraMode.None && camMode <= CameraMode.Landscape) {
            this.cameraMode = camMode;
            if (this.cameraMode == CameraMode.None) {
    
            }
            else {
                this.targetCamRadiusFromWheel = false;
                if (this.cameraMode === CameraMode.Ball) {
                    this.targetCamRadius = 0.3;
                }
                else {
                    let baseMeshMin = new BABYLON.Vector3(this.machine.baseMeshMinX, this.machine.baseMeshMinY, this.machine.baseMeshMinZ);
                    let baseMeshMax = new BABYLON.Vector3(this.machine.baseMeshMaxX, this.machine.baseMeshMaxY, this.machine.baseMeshMaxZ);
                    let size = BABYLON.Vector3.Distance(baseMeshMin, baseMeshMax);
            
                    this.targetCamTarget.copyFrom(baseMeshMin.add(baseMeshMax).scale(0.5));
                    this.targetCamRadius = size * 0.7;
                }
                this.targetCamAlpha = - 0.2 * Math.PI - Math.random() * Math.PI * 0.6;
                this.targetCamBeta = 0.3 * Math.PI + Math.random() * Math.PI * 0.4;
            }
        }
        else if (camMode === CameraMode.Selected) {
            if (this.mode === GameMode.Create) {
                this.cameraMode = camMode;
                this.targetCamAlpha = this.camera.alpha;
                this.targetCamBeta = this.camera.beta;
                this.targetCamRadius = this.camera.radius;
                this.targetCamTarget.copyFrom(this.camera.target);
            }
        }
        else if (camMode === CameraMode.Transition) {
            this.cameraMode = camMode;
        }
        this.topbar.resize();
    }

    public getCameraRadiusToFocusMachineParts(...machineParts: Core.MachinePart[]): number {
        let start: BABYLON.Vector3 = new BABYLON.Vector3(Infinity, - Infinity, - Infinity);
        let end: BABYLON.Vector3 = new BABYLON.Vector3(- Infinity, Infinity, Infinity);
        machineParts.forEach(part => {
            if (part instanceof Core.MachinePart) {
                start.x = Math.min(start.x, part.position.x + part.encloseStart.x);
                start.y = Math.max(start.y, part.position.y + part.encloseStart.y);
                start.z = Math.max(start.z, part.position.z + part.encloseStart.z);
                
                end.x = Math.max(end.x, part.position.x + part.encloseEnd.x);
                end.y = Math.min(end.y, part.position.y + part.encloseEnd.y);
                end.z = Math.min(end.z, part.position.z + part.encloseEnd.z);
            }
        });

        if (!Mummu.IsFinite(start) || !Mummu.IsFinite(end)) {
            return 1;
        }

        let w = (end.x - start.x);
        let distW = 0.5 * w / (Math.tan(this.getCameraHorizontalFOV() * 0.5));
        let h = (start.y - end.y);
        let distH = 0.5 * h / (Math.tan(this.camera.fov * 0.5));

        if (this.screenRatio >= 1) {
            distW *= 1.5;
            distH *= 1.5;
        }
        else {
            distW *= 1.1;
            distH *= 1.1;
        }

        return Math.max(distW, distH);
    }

    public async focusMachineParts(updateAlphaBetaRadius: boolean, ...machineParts: Core.MachinePart[]): Promise<void> {
        let start: BABYLON.Vector3 = new BABYLON.Vector3(Infinity, - Infinity, - Infinity);
        let end: BABYLON.Vector3 = new BABYLON.Vector3(- Infinity, Infinity, Infinity);
        machineParts.forEach(part => {
            if (part instanceof Core.MachinePart) {
                start.x = Math.min(start.x, part.position.x + part.encloseStart.x);
                start.y = Math.max(start.y, part.position.y + part.encloseStart.y);
                start.z = Math.max(start.z, part.position.z + part.encloseStart.z);
                
                end.x = Math.max(end.x, part.position.x + part.encloseEnd.x);
                end.y = Math.min(end.y, part.position.y + part.encloseEnd.y);
                end.z = Math.min(end.z, part.position.z + part.encloseEnd.z);
            }
        });

        if (!Mummu.IsFinite(start) || !Mummu.IsFinite(end)) {
            return;
        }

        let center = start.add(end).scale(0.5);

        let w = (end.x - start.x);
        let distW = 0.5 * w / (Math.tan(this.getCameraHorizontalFOV() * 0.5));
        let h = (start.y - end.y);
        let distH = 0.5 * h / (Math.tan(this.camera.fov * 0.5));

        if (this.screenRatio > 1) {
            distW *= 2.5;
            distH *= 1.5;
        }
        else {
            distW *= 1.5;
            distH *= 2.5;
        }
        if (updateAlphaBetaRadius) {
            this.targetCamRadius = Math.max(distW, distH);
            this.targetCamAlpha = - Math.PI / 2;
            this.targetCamBeta = Math.PI / 2;
        }
        else {
            this.targetCamRadius = this.camera.radius;
            this.targetCamAlpha = this.camera.alpha;
            this.targetCamBeta = this.camera.beta;
        }

        this.targetCamTarget.copyFrom(center);

        if (this.cameraMode === CameraMode.Selected) {
            this.cameraMode = CameraMode.FocusingSelected;
        }
        else {
            this.cameraMode = CameraMode.Focusing;
        }
        this.camera.detachControl();
    }

    private _showGraphicAutoUpdateAlertInterval: number = 0;
    public showGraphicAutoUpdateAlert(message?: string): void {
        let alert = document.getElementById("auto-update-graphic-alert") as HTMLDivElement;
        if (message) {
            alert.innerText = message;
        }
        else if (this.getGraphicQ() === Core.GraphicQuality.VeryLow) {
            alert.innerText = "Graphic Quality set to VERY LOW";
        }
        else if (this.getGraphicQ() === Core.GraphicQuality.Low) {
            alert.innerText = "Graphic Quality set to LOW";
        }
        else if (this.getGraphicQ() === Core.GraphicQuality.Medium) {
            alert.innerText = "Graphic Quality set to MEDIUM";
        }
        else if (this.getGraphicQ() === Core.GraphicQuality.High) {
            alert.innerText = "Graphic Quality set to HIGH";
        }
        alert.style.opacity = "0";
        alert.style.display = "block";

        clearInterval(this._showGraphicAutoUpdateAlertInterval);
        let n = 0;
        this._showGraphicAutoUpdateAlertInterval = setInterval(() => {
            n++;
            if (n <= 100) {
                alert.style.opacity = n + "%";
            }
            else {
                clearInterval(this._showGraphicAutoUpdateAlertInterval);
                n = 100;
                this._showGraphicAutoUpdateAlertInterval = setInterval(() => {
                    n --;
                    if (n > 0) {
                        alert.style.opacity = n + "%";
                    }
                    else {
                        alert.style.opacity = "0";
                        alert.style.display = "none";
                        clearInterval(this._showGraphicAutoUpdateAlertInterval);
                    }
                }, 75);
            }
        }, 8)
    }

    private _pointerDownX: number = 0;
    private _pointerDownY: number = 0;
    public onPointerDown = (event: PointerEvent) => {
        this._pointerDownX = this.scene.pointerX;
        this._pointerDownY = this.scene.pointerY;
    }

    public onPointerUp = (event: PointerEvent) => {
        if (this.cameraMode === CameraMode.Ball || this.cameraMode === CameraMode.Landscape) {
            let dx = (this._pointerDownX - this.scene.pointerX);
            let dy = (this._pointerDownY - this.scene.pointerY);
            if (dx * dx + dy * dy > 10 * 10) {
                this.setCameraMode(CameraMode.None);
            }
        }
        if (this.editMachineNameActive) {
            this.setEditMachineName(false);
        }
        if (this.editMachineAuthorActive) {
            this.setEditMachineAuthor(false);
        }
    }

    public onWheelEvent = (event: WheelEvent) => {
        if (this.cameraMode === CameraMode.Ball || this.cameraMode === CameraMode.Landscape) {
            this.targetCamRadiusFromWheel = true;
        }
    }

    public updateMachineAuthorAndName(): void {
        if (this.machine) {
            (document.querySelector("#machine-name .value") as HTMLDivElement).innerHTML = this.machine.name;
            (document.querySelector("#machine-author .value") as HTMLDivElement).innerHTML = this.machine.author;
        }
        this.updateMachineAuthorAndNameVisibility();
    }

    public updateMachineAuthorAndNameVisibility(): void {
        if (this.mode <= GameMode.Page) {
            (document.querySelector("#machine-title") as HTMLDivElement).style.display = "none";
        }
        else {
            (document.querySelector("#machine-title") as HTMLDivElement).style.display = "block";
        }
    }

    public editMachineNameActive: boolean = false;
    public editMachineAuthorActive: boolean = false;
    
    public setEditMachineName(active: boolean): void {
        this.editMachineNameActive = active;
        if (active) {
            (document.querySelector("#machine-name") as HTMLDivElement).style.display = "none";
            (document.querySelector("#machine-name-edit") as HTMLInputElement).style.display = "block";
            (document.querySelector("#machine-name-edit") as HTMLInputElement).setAttribute("value", this.machine.name);
        }
        else {
            this.updateMachineAuthorAndName();
            (document.querySelector("#machine-name") as HTMLDivElement).style.display = "block";
            (document.querySelector("#machine-name-edit") as HTMLInputElement).style.display = "none";
        }
    }

    public setEditMachineAuthor(active: boolean): void {
        this.editMachineAuthorActive = active;
        if (active) {
            (document.querySelector("#machine-author") as HTMLDivElement).style.display = "none";
            (document.querySelector("#machine-author-edit") as HTMLInputElement).style.display = "inline-block";
            (document.querySelector("#machine-author-edit") as HTMLInputElement).setAttribute("value", this.machine.author);
        }
        else {
            this.updateMachineAuthorAndName();
            (document.querySelector("#machine-author") as HTMLDivElement).style.display = "inline-block";
            (document.querySelector("#machine-author-edit") as HTMLInputElement).style.display = "none";
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

setTimeout(() => {
    createAndInit();
}, 500);