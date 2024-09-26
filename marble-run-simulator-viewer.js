class DebugPerf {
    constructor(main, _showLayer = false) {
        this.main = main;
        this._showLayer = _showLayer;
        this._initialized = false;
        this._counter = 0;
        this._update = () => {
            this._frameRate.addValue(this.main.engine.getFps());
            this._meshesCount.setText(this.main.scene.meshes.length.toFixed(0));
            this._counter++;
            if (this._counter > 60) {
                this._counter = 0;
                let globalTriCount = 0;
                this.main.scene.meshes.forEach(mesh => {
                    let indices = mesh.getIndices();
                    if (indices) {
                        globalTriCount += indices.length / 3;
                    }
                });
                this._trianglesCount.setText(globalTriCount.toFixed(0));
            }
        };
    }
    get initialized() {
        return this._initialized;
    }
    get scene() {
        return this.main.scene;
    }
    initialize() {
        this.debugContainer = document.querySelector("#debug-container");
        if (!this.debugContainer) {
            this.debugContainer = document.createElement("div");
            this.debugContainer.id = "debug-container";
            document.body.appendChild(this.debugContainer);
        }
        this.container = document.querySelector("#debug-terrain-perf");
        if (!this.container) {
            this.container = document.createElement("div");
            this.container.id = "debug-terrain-perf";
            this.container.classList.add("debug", "hidden");
            this.debugContainer.appendChild(this.container);
        }
        let frameRateId = "#frame-rate";
        this._frameRate = document.querySelector(frameRateId);
        if (!this._frameRate) {
            this._frameRate = document.createElement("debug-display-frame-value");
            this._frameRate.id = frameRateId;
            this._frameRate.setAttribute("label", "Frame Rate");
            this._frameRate.setAttribute("min", "0");
            this._frameRate.setAttribute("max", "144");
            this.container.appendChild(this._frameRate);
        }
        let meshesCountId = "#meshes-count";
        this._meshesCount = document.querySelector(meshesCountId);
        if (!this._meshesCount) {
            this._meshesCount = document.createElement("debug-display-text-value");
            this._meshesCount.id = meshesCountId;
            this._meshesCount.setAttribute("label", "Meshes Count");
            this.container.appendChild(this._meshesCount);
        }
        let trianglesCountId = "#triangles-count";
        this._trianglesCount = document.querySelector(trianglesCountId);
        if (!this._trianglesCount) {
            this._trianglesCount = document.createElement("debug-display-text-value");
            this._trianglesCount.id = trianglesCountId;
            this._trianglesCount.setAttribute("label", "Tris Count");
            this.container.appendChild(this._trianglesCount);
        }
        this._initialized = true;
    }
    show() {
        if (!this.initialized) {
            this.initialize();
        }
        this.container.classList.remove("hidden");
        this.scene.onBeforeRenderObservable.add(this._update);
    }
    hide() {
        this.container.classList.add("hidden");
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
}
var fallbackMachine = { "n": "Missing Machine", "a": "Tiaratum Games", "v": 3, "d": "01i57hz4i1o0706hwi1hz203111000hyi1hz403121000hyi0hz211111006i0hzhz314121006hxhzhz304111000i0hzhz20110100bi2hyhz2311010" };
var demo2 = { "n": "Simples Curves", "a": "Sven", "v": 6, "d": "03i9ihzzi0002i9ii48i0003i9ii8ii00040f08hvi0i11111120000hwhzi0622111000i2hzi0211101000hyhwi0441111009hwhwi0242121006i2hvi0213121000hwhui2611101006huhui0203111000hwhsi0621111006i2hsi0102101001hwhqi1621101006hvhqi0102111000hwhpi0611111000i2hpi020110100bi4hoi02c11010" };
var controller = { "n": "Controller", "a": "Sven", "v": 6, "d": "05i06i05i1o01hoghz4hyc02hogi1ghyc03hogi3rhyc04hogi62hyc050z00hwi0i1511111006i1i0i1203101000hxhzi0311101104i0hzi311110301100hwhzhz411101006i5hzi2203101100i0hzi4501101106hzhzi3102111106hvhzhz102111000hxhyi3321101006hzhyhz102101006hvhyi1203111000hxhyi0201101006hzhyhw102101006hxhyhx203111005hwhyi011111600011008hyhxhw1111121000hxhxi1211111000hxhxi3201101006hzhxi1203101008hzhwhw1111020109i3hvi1242201108hyhvhw1111121000i0hui1351101100hxhui1231111007hvhui1233111008hzhuhw1111020106hvhuhw40511100jhzhti011210601011000hzhthz101101006hyhthz102111000hwhti130110100ii0hshz1a110400000ii0hsi01a110410110bhuhsi12911110" };
class HelperShape {
    constructor() {
        this.show = true;
        this.showCircle = false;
        this.showGrid = false;
        this.circleRadius = 350;
        this.gridSize = 100;
    }
    setShow(b) {
        this.show = b;
        this.update();
    }
    setShowCircle(b) {
        this.showCircle = b;
        this.update();
    }
    setCircleRadius(r) {
        this.circleRadius = Math.max(Math.min(r, 500), 50);
        this.update();
    }
    setShowGrid(b) {
        this.showGrid = b;
        this.update();
    }
    setGridSize(s) {
        this.gridSize = Math.max(Math.min(s, 500), 50);
        this.gridSize = s;
        this.update();
    }
    update() {
        if (!this.svg) {
            this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.svg.setAttribute("width", "1000");
            this.svg.setAttribute("height", "1000");
            this.svg.setAttribute("viewBox", "0 0 1000 1000");
            this.svg.style.position = "fixed";
            this.svg.style.width = "min(100vw, 100vh)";
            this.svg.style.height = "min(100vw, 100vh)";
            this.svg.style.left = "calc((100vw - min(100vw, 100vh)) * 0.5)";
            this.svg.style.top = "calc((100vh - min(100vw, 100vh)) * 0.5)";
            this.svg.style.zIndex = "1";
            this.svg.style.pointerEvents = "none";
            document.body.appendChild(this.svg);
        }
        this.svg.innerHTML = "";
        if (this.show && this.showCircle) {
            let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("fill", "none");
            circle.setAttribute("stroke", "black");
            circle.setAttribute("stroke-width", "1");
            circle.setAttribute("cx", "500");
            circle.setAttribute("cy", "500");
            circle.setAttribute("r", this.circleRadius.toFixed(1));
            this.svg.appendChild(circle);
            for (let i = 0; i < 32; i++) {
                let graduation = document.createElementNS("http://www.w3.org/2000/svg", "line");
                graduation.setAttribute("stroke", "black");
                graduation.setAttribute("stroke-width", "1");
                graduation.setAttribute("x1", (500 + this.circleRadius - 20).toFixed(1));
                graduation.setAttribute("y1", "500");
                graduation.setAttribute("x2", (500 + this.circleRadius + 20).toFixed(1));
                graduation.setAttribute("y2", "500");
                graduation.setAttribute("transform", "rotate(" + (i * 360 / 32).toFixed(1) + " 500 500)");
                this.svg.appendChild(graduation);
            }
        }
        if (this.show && this.showGrid) {
            let count = Math.round(500 / this.gridSize);
            for (let i = 1; i < count; i++) {
                let d = i * this.gridSize;
                let lineTop = document.createElementNS("http://www.w3.org/2000/svg", "line");
                lineTop.setAttribute("stroke", "black");
                lineTop.setAttribute("stroke-width", "1");
                lineTop.setAttribute("x1", "0");
                lineTop.setAttribute("y1", (500 - d).toFixed(1));
                lineTop.setAttribute("x2", "1000");
                lineTop.setAttribute("y2", (500 - d).toFixed(1));
                this.svg.appendChild(lineTop);
                let lineBottom = document.createElementNS("http://www.w3.org/2000/svg", "line");
                lineBottom.setAttribute("stroke", "black");
                lineBottom.setAttribute("stroke-width", "1");
                lineBottom.setAttribute("x1", "0");
                lineBottom.setAttribute("y1", (500 + d).toFixed(1));
                lineBottom.setAttribute("x2", "1000");
                lineBottom.setAttribute("y2", (500 + d).toFixed(1));
                this.svg.appendChild(lineBottom);
                let lineLeft = document.createElementNS("http://www.w3.org/2000/svg", "line");
                lineLeft.setAttribute("stroke", "black");
                lineLeft.setAttribute("stroke-width", "1");
                lineLeft.setAttribute("x1", (500 - d).toFixed(1));
                lineLeft.setAttribute("y1", "0");
                lineLeft.setAttribute("x2", (500 - d).toFixed(1));
                lineLeft.setAttribute("y2", "1000");
                this.svg.appendChild(lineLeft);
                let lineRight = document.createElementNS("http://www.w3.org/2000/svg", "line");
                lineRight.setAttribute("stroke", "black");
                lineRight.setAttribute("stroke-width", "1");
                lineRight.setAttribute("x1", (500 + d).toFixed(1));
                lineRight.setAttribute("y1", "0");
                lineRight.setAttribute("x2", (500 + d).toFixed(1));
                lineRight.setAttribute("y2", "1000");
                this.svg.appendChild(lineRight);
            }
        }
        if (this.show && (this.showCircle || this.showGrid)) {
            let centerLineH = document.createElementNS("http://www.w3.org/2000/svg", "line");
            centerLineH.setAttribute("stroke", "black");
            centerLineH.setAttribute("stroke-width", "1");
            centerLineH.setAttribute("x1", "0");
            centerLineH.setAttribute("y1", "500");
            centerLineH.setAttribute("x2", "1000");
            centerLineH.setAttribute("y2", "500");
            this.svg.appendChild(centerLineH);
            let centerLineV = document.createElementNS("http://www.w3.org/2000/svg", "line");
            centerLineV.setAttribute("stroke", "black");
            centerLineV.setAttribute("stroke-width", "1");
            centerLineV.setAttribute("x1", "500");
            centerLineV.setAttribute("y1", "0");
            centerLineV.setAttribute("x2", "500");
            centerLineV.setAttribute("y2", "1000");
            this.svg.appendChild(centerLineV);
        }
    }
}
/// <reference path="../lib/babylon.d.ts"/>
/// <reference path="../../nabu/nabu.d.ts"/>
/// <reference path="../../mummu/mummu.d.ts"/>
/// <reference path="../../marble-run-simulator-core/marble-run-simulator-core.d.ts"/>
var observed_progress_speed_percent_second;
var PlayerHasInteracted = false;
var IsTouchScreen = -1;
async function WaitPlayerInteraction() {
    return new Promise(resolve => {
        let wait = () => {
            if (PlayerHasInteracted) {
                resolve();
            }
            else {
                requestAnimationFrame(wait);
            }
        };
        wait();
    });
}
let onFirstPlayerInteractionTouch = (ev) => {
    console.log("onFirstPlayerInteractionTouch");
    ev.stopPropagation();
    IsTouchScreen = 1;
    PlayerHasInteracted = true;
    document.body.removeEventListener("touchstart", onFirstPlayerInteractionTouch);
    document.body.removeEventListener("click", onFirstPlayerInteractionClic);
    document.body.removeEventListener("keydown", onFirstPlayerInteractionKeyboard);
    //Game.Instance.showGraphicAutoUpdateAlert("Touch");
    document.getElementById("click-anywhere-screen").style.display = "none";
};
let onFirstPlayerInteractionClic = (ev) => {
    console.log("onFirstPlayerInteractionClic");
    ev.stopPropagation();
    IsTouchScreen = 0;
    PlayerHasInteracted = true;
    document.body.removeEventListener("touchstart", onFirstPlayerInteractionTouch);
    document.body.removeEventListener("click", onFirstPlayerInteractionClic);
    document.body.removeEventListener("keydown", onFirstPlayerInteractionKeyboard);
    //Game.Instance.showGraphicAutoUpdateAlert("Clic");
    document.getElementById("click-anywhere-screen").style.display = "none";
};
let onFirstPlayerInteractionKeyboard = (ev) => {
    console.log("onFirstPlayerInteractionKeyboard");
    ev.stopPropagation();
    IsTouchScreen = 0;
    PlayerHasInteracted = true;
    document.body.removeEventListener("touchstart", onFirstPlayerInteractionTouch);
    document.body.removeEventListener("click", onFirstPlayerInteractionClic);
    document.body.removeEventListener("keydown", onFirstPlayerInteractionKeyboard);
    //Game.Instance.showGraphicAutoUpdateAlert("Keyboard");
    document.getElementById("click-anywhere-screen").style.display = "none";
};
var SHARE_SERVICE_PATH = "https://tiaratum.com/index.php/";
var Core = MarbleRunSimulatorCore;
var GameMode;
(function (GameMode) {
    GameMode[GameMode["Home"] = 0] = "Home";
    GameMode[GameMode["Page"] = 1] = "Page";
    GameMode[GameMode["Create"] = 2] = "Create";
    GameMode[GameMode["Challenge"] = 3] = "Challenge";
    GameMode[GameMode["Demo"] = 4] = "Demo";
})(GameMode || (GameMode = {}));
var CameraMode;
(function (CameraMode) {
    CameraMode[CameraMode["Dev"] = 0] = "Dev";
    CameraMode[CameraMode["None"] = 1] = "None";
    CameraMode[CameraMode["Ball"] = 2] = "Ball";
    CameraMode[CameraMode["Landscape"] = 3] = "Landscape";
    CameraMode[CameraMode["Selected"] = 4] = "Selected";
    CameraMode[CameraMode["Focusing"] = 5] = "Focusing";
    CameraMode[CameraMode["FocusingSelected"] = 6] = "FocusingSelected";
    CameraMode[CameraMode["Transition"] = 7] = "Transition";
})(CameraMode || (CameraMode = {}));
class Game {
    constructor(canvasElement) {
        this.DEBUG_MODE = false;
        this.DEBUG_USE_LOCAL_STORAGE = false;
        this.DEBUG_RANDOM_GRAPHIC_Q_UPDATE = 0;
        this.screenRatio = 1;
        this.cameraMode = CameraMode.None;
        this.menuCameraMode = CameraMode.Ball;
        this.targetCamTarget = BABYLON.Vector3.Zero();
        this.targetCamAlpha = -Math.PI * 0.5;
        this.targetCamBeta = Math.PI * 0.4;
        this.targetCamRadius = 0.8;
        this.targetCamRadiusFromWheel = false;
        this.roomMeshes = [];
        this.mainVolume = 0;
        this._targetTimeFactor = 0.8;
        this.timeFactor = 0.1;
        this.physicDT = 0.0005;
        this.machines = [];
        this._graphicQ = Core.GraphicQuality.High;
        this.sortedTiles = [];
        this.tiles = new Map();
        this.factoredTimeSinceGameStart = 0;
        this.averagedFPS = 0;
        this.updateConfigTimeout = -1;
        this.machineEditorContainerIsDisplayed = false;
        this.machineEditorContainerHeight = -1;
        this.canvasLeft = 0;
        Game.Instance = this;
        this.canvas = document.getElementById(canvasElement);
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
        this.engine = new BABYLON.Engine(this.canvas, true);
        BABYLON.Engine.ShadersRepository = "./shaders/";
        BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;
        window.addEventListener("click", () => {
            if (!BABYLON.Engine.audioEngine.unlocked) {
                BABYLON.Engine.audioEngine.unlock();
            }
        }, { once: true });
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
    getScene() {
        return this.scene;
    }
    get targetTimeFactor() {
        return this._targetTimeFactor;
    }
    set targetTimeFactor(v) {
        this._targetTimeFactor = Nabu.MinMax(v, 1 / 32, 1);
    }
    get currentTimeFactor() {
        return 0.8;
    }
    getGraphicQ() {
        return this._graphicQ;
    }
    async setGraphicQ(q) {
        this._graphicQ = q;
        this.updateShadowGenerator();
        if (this.machine) {
            await this.machine.instantiate(true);
        }
    }
    getGeometryQ() {
        let graphicQ = this.getGraphicQ();
        if (graphicQ === Core.GraphicQuality.Low) {
            return Core.GeometryQuality.Medium;
        }
        else if (graphicQ >= Core.GraphicQuality.Medium) {
            return Core.GeometryQuality.High;
        }
        return Core.GeometryQuality.Low;
    }
    getMaterialQ() {
        let graphicQ = this.getGraphicQ();
        if (graphicQ >= Core.GraphicQuality.High) {
            return Core.MaterialQuality.PBR;
        }
        return Core.MaterialQuality.Standard;
    }
    getTile(i, j) {
        if (this.tiles.get(i)) {
            return this.tiles.get(i).get(j);
        }
    }
    setTile(i, j, tile) {
        if (!this.tiles.get(i)) {
            this.tiles.set(i, new Map());
        }
        this.tiles.get(i).set(j, tile);
    }
    getTileAtPos(x, z) {
        let i = Math.round(x / (1.5 * Tile.SIZE));
        let j = Math.round((z - i * Tile.S_SIZE) / (2 * Tile.S_SIZE));
        return this.getTile(i, j);
    }
    async createScene() {
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
                    let color = new BABYLON.Color3(0.8 + 0.2 * Math.random(), 0.8 + 0.2 * Math.random(), 0.8 + 0.2 * Math.random());
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
        });
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
        };
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
        };
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
                let data = await dataResponse.json();
                machine.deserialize(data);
                machine.generateBaseMesh();
                machine.instantiate().then(() => {
                    machine.play();
                });
            }
        }
        this.mode = GameMode.Home;
        this.soonView = document.getElementsByTagName("soon-menu")[0];
        this.soonView.setGame(this);
        this.musicDisplay = new MusicDisplay(document.getElementById("music-display"), this);
        this.musicDisplay.reset();
        this.machine.onPlayCallbacks.push(() => {
            this.musicDisplay.reset();
            let xylophones = this.machine.decors.filter(decor => { return decor instanceof Core.Xylophone; });
            xylophones.forEach(xylophone => {
                xylophone.onSoundPlay = () => {
                    this.musicDisplay.drawNote(xylophone);
                };
            });
        });
    }
    animate() {
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
            });
        };
        window.onresize = onResize;
        screen.orientation.onchange = onResize;
    }
    async initialize() {
    }
    update() {
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
        });
    }
    resizeCanvas() {
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvasLeft = 0;
        this.engine.resize();
        requestAnimationFrame(() => {
            this.engine.resize();
        });
    }
    updateShadowGenerator() {
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
function LogTracksBarycenter() {
    let machine = Game.Instance.machine;
    let center = new BABYLON.Vector3((machine.tracksMinX + machine.tracksMaxX) * 0.5, (machine.tracksMinY + machine.tracksMaxY) * 0.5, (machine.tracksMinZ + machine.tracksMaxZ) * 0.5);
    //"x": 0.038, "y": 0.075, "z": 0.090
    console.log("x: " + center.x.toFixed(3) + ", y: " + center.y.toFixed(3) + ", z: " + center.z.toFixed(3));
}
let createAndInit = async () => {
    let main = new Game("render-canvas");
    await main.createScene();
    main.initialize().then(() => {
        main.animate();
    });
};
requestAnimationFrame(() => {
    createAndInit();
});
class Popup extends HTMLElement {
    constructor() {
        super(...arguments);
        this._shown = false;
        this._duration = 0;
        this._update = () => {
            if (!this.isConnected) {
                clearInterval(this._updateInterval);
            }
        };
    }
    static get observedAttributes() {
        return [
            "duration"
        ];
    }
    connectedCallback() {
        this.initialize();
        this._updateInterval = setInterval(this._update, 100);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "duration") {
            let value = parseFloat(newValue);
            if (isFinite(value)) {
                this._duration = value;
            }
        }
    }
    initialize() {
        this.style.opacity = "0";
        this.style.display = "none";
        this.style.position = "fixed";
        this.style.zIndex = "2";
    }
    async show(duration = 1) {
        clearInterval(this._animateOpacityInterval);
        clearTimeout(this._waitToHideAfterShowTimeout);
        return new Promise(resolve => {
            if (!this._shown) {
                this._shown = true;
                this.style.display = "block";
                let opacity0 = parseFloat(this.style.opacity);
                let t0 = performance.now() / 1000;
                this._animateOpacityInterval = setInterval(() => {
                    let t = performance.now() / 1000 - t0;
                    if (t >= duration) {
                        clearInterval(this._animateOpacityInterval);
                        this.style.opacity = "1";
                        if (this._duration > 0) {
                            console.log("!!!");
                            this._waitToHideAfterShowTimeout = setTimeout(() => {
                                this.hide(duration).then(resolve);
                            }, this._duration * 1000);
                        }
                        else {
                            resolve();
                        }
                    }
                    else {
                        let f = t / duration;
                        this.style.opacity = ((1 - f) * opacity0 + f * 1).toFixed(3);
                    }
                }, 15);
            }
        });
    }
    async hide(duration = 1) {
        clearInterval(this._animateOpacityInterval);
        clearTimeout(this._waitToHideAfterShowTimeout);
        return new Promise(resolve => {
            if (this._shown) {
                this._shown = false;
                this.style.display = "block";
                let opacity0 = parseFloat(this.style.opacity);
                let t0 = performance.now() / 1000;
                this._animateOpacityInterval = setInterval(() => {
                    let t = performance.now() / 1000 - t0;
                    if (t >= duration) {
                        clearInterval(this._animateOpacityInterval);
                        this.style.opacity = "0";
                        this.style.display = "none";
                        resolve();
                    }
                    else {
                        let f = t / duration;
                        this.style.opacity = ((1 - f) * opacity0).toFixed(3);
                    }
                }, 15);
            }
        });
    }
}
customElements.define("nabu-popup", Popup);
var TileStatus;
(function (TileStatus) {
    TileStatus[TileStatus["Active"] = 0] = "Active";
    TileStatus[TileStatus["Next"] = 1] = "Next";
    TileStatus[TileStatus["Inactive"] = 2] = "Inactive";
    TileStatus[TileStatus["Minimal"] = 3] = "Minimal";
})(TileStatus || (TileStatus = {}));
class Tile extends BABYLON.Mesh {
    constructor(i, j, game) {
        super("tile-" + i.toFixed(0) + "_" + j.toFixed(0));
        this.i = i;
        this.j = j;
        this.game = game;
        this.d = 0;
        this.a = 0;
        let x = i * 1.5 * Tile.SIZE;
        let z = j * 2 * Tile.S_SIZE + i * Tile.S_SIZE;
        this.position.x = x;
        this.position.z = z;
        this.d = Math.sqrt(x * x + z * z);
        this.a = Mummu.AngleFromToAround(BABYLON.Axis.Z, this.position, BABYLON.Axis.Y);
        while (this.a < 0) {
            this.a += 2 * Math.PI;
        }
        this.position.y = (this.d / (2 * Tile.S_SIZE) + this.a / (2 * Math.PI)) * 0.3;
    }
}
Tile.SIZE = 3;
Tile.S_SIZE = Math.sqrt(Tile.SIZE * Tile.SIZE - (Tile.SIZE * 0.5) * (Tile.SIZE * 0.5));
class MusicDisplay {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.game = game;
        this.w = 1600;
        this.h = 100;
        this.hideTimeout = -1;
        this.t0 = -1;
        this.tMax = 16;
        this.abcdefg = "ABCDEFG";
        this.context = canvas.getContext("2d");
        canvas.width = this.w;
        canvas.height = this.h;
    }
    show() {
        this.canvas.style.display = "block";
    }
    hide() {
        this.canvas.style.display = "none";
    }
    reset() {
        this.context.clearRect(0, 0, this.w, this.h);
        this.context.fillStyle = "white";
        for (let n = 0; n < 5; n++) {
            this.context.fillRect(this.w * 0.05, 30 + n * 10, this.w * 0.9, 1);
        }
        /*
        let x0 = Math.floor(this.w * 0.1);
        for (let n = 0; n <= 4; n++) {
            let x = Math.floor(x0 + n * this.w * 0.2);
            this.context.fillStyle = "white";
            this.context.fillRect(x, 40, 1, 120);
            if (n < 4) {
                for (let n2 = 0.25; n2 <= 0.75; n2 += 0.25) {
                    this.context.fillStyle = "gray";
                    this.context.fillRect(x0 + (n + n2) * this.w * 0.2, 40, 1, 120);
                }
            }
        }
            */
        this.t0 = -1;
        this.firstXylophone = undefined;
    }
    drawNote(xylophone) {
        this.show();
        if (this.t0 < 0 || xylophone === this.firstXylophone) {
            this.reset();
            this.t0 = this.game.factoredTimeSinceGameStart;
            this.firstXylophone = xylophone;
        }
        let noteName = Core.Xylophone.NotesName[xylophone.n];
        let letter = noteName[0];
        let octave = parseInt(noteName[1]);
        let y = this.h - (10 + 5 * this.abcdefg.indexOf(letter) + 35 * (octave - 5));
        let hashtag = noteName[2] === "#";
        let t = (this.game.factoredTimeSinceGameStart - this.t0);
        if (t > this.tMax) {
            this.reset();
            this.drawNote(xylophone);
            return;
        }
        let x = Math.floor((t / this.tMax) * this.w * 0.8 + this.w * 0.1);
        this.context.fillStyle = "white";
        this.context.beginPath();
        this.context.arc(x, y, 1, 0, 2 * Math.PI);
        this.context.closePath();
        this.context.fill();
        this.context.strokeStyle = "white";
        this.context.beginPath();
        this.context.arc(x, y, 4, 0, 2 * Math.PI);
        this.context.closePath();
        this.context.fill();
        clearTimeout(this.hideTimeout);
        this.hideTimeout = setTimeout(() => {
            this.hide();
        }, this.tMax * 1000 / this.game.currentTimeFactor);
    }
}
class SoonView extends HTMLElement {
    constructor() {
        super(...arguments);
        this._loaded = false;
        this._shown = false;
        this.currentPointers = 0;
        this.generatedUrl = "";
        this.isShared = false;
        this._timer = 0;
    }
    static get observedAttributes() {
        return [];
    }
    get loaded() {
        return this._loaded;
    }
    get shown() {
        return this._shown;
    }
    get onLoad() {
        return this._onLoad;
    }
    set onLoad(callback) {
        this._onLoad = callback;
        if (this._loaded) {
            this._onLoad();
        }
    }
    currentPointerUp() {
        if (this._options.length > 0) {
            this.setPointer((this.currentPointers - 1 + this._options.length) % this._options.length);
        }
    }
    currentPointerDown() {
        if (this._options.length > 0) {
            this.setPointer((this.currentPointers + 1) % this._options.length);
        }
    }
    setPointer(n) {
        if (this._options[this.currentPointers]) {
            this._options[this.currentPointers].classList.remove("highlit");
        }
        this.currentPointers = n;
        if (this._options[this.currentPointers]) {
            this._options[this.currentPointers].classList.add("highlit");
        }
    }
    connectedCallback() {
        this.style.display = "none";
        this.style.opacity = "0";
        this._title = document.createElement("h1");
        this._title.classList.add("soon-menu-title");
        this._title.innerHTML = "Coming soon !";
        this.appendChild(this._title);
        let categoriesContainer;
        categoriesContainer = document.createElement("div");
        this.appendChild(categoriesContainer);
        this._shareInfo = document.createElement("div");
        this._shareInfo.innerHTML = `
            <p>Full edition mode of <b>Marble Run Simulator</b> is coming soon <b>(June 2024)</b> for free on <a href='https://poki.com/'>Poki.com</a>, featuring dozens of parameterizable track elements&nbsp;!</p>
        `;
        categoriesContainer.appendChild(this._shareInfo);
        this._saveInfo = document.createElement("div");
        this._saveInfo.innerHTML = `
            <p>Make sure you don't miss the release by <a href='https://twitter.com/tiaratumgames'>following me on X</a></p>
            <p>See you :)</p>
            <p style='font-style: italic;'>Sven Frankson</p>
        `;
        categoriesContainer.appendChild(this._saveInfo);
        this._returnBtn = document.createElement("button");
        this._returnBtn.innerHTML = "RETURN";
        categoriesContainer.appendChild(this._returnBtn);
        this._returnBtn.onclick = () => {
            this.hide(0.1);
        };
        this._options = [
            this._returnBtn
        ];
        this._loaded = true;
    }
    attributeChangedCallback(name, oldValue, newValue) { }
    async show(duration = 1) {
        return new Promise((resolve) => {
            if (!this._shown) {
                this._shown = true;
                this.style.display = "block";
                let opacity0 = parseFloat(this.style.opacity);
                let opacity1 = 1;
                let t0 = performance.now();
                let step = () => {
                    let t = performance.now();
                    let dt = (t - t0) / 1000;
                    if (dt >= duration) {
                        this.style.opacity = "1";
                        resolve();
                    }
                    else {
                        let f = dt / duration;
                        this.style.opacity = ((1 - f) * opacity0 + f * opacity1).toFixed(2);
                        requestAnimationFrame(step);
                    }
                };
                step();
            }
        });
    }
    async hide(duration = 1) {
        if (duration === 0) {
            this._shown = false;
            this.style.display = "none";
            this.style.opacity = "0";
        }
        else {
            return new Promise((resolve) => {
                if (this._shown) {
                    this._shown = false;
                    this.style.display = "block";
                    let opacity0 = parseFloat(this.style.opacity);
                    let opacity1 = 0;
                    let t0 = performance.now();
                    let step = () => {
                        let t = performance.now();
                        let dt = (t - t0) / 1000;
                        if (dt >= duration) {
                            this.style.display = "none";
                            this.style.opacity = "0";
                            if (this.onNextHide) {
                                this.onNextHide();
                                this.onNextHide = undefined;
                            }
                            resolve();
                        }
                        else {
                            let f = dt / duration;
                            this.style.opacity = ((1 - f) * opacity0 + f * opacity1).toFixed(2);
                            requestAnimationFrame(step);
                        }
                    };
                    step();
                }
            });
        }
    }
    setGame(game) {
        this.game = game;
    }
    update(dt) {
        if (this._timer > 0) {
            this._timer -= dt;
        }
        let gamepads = navigator.getGamepads();
        let gamepad = gamepads[0];
        if (gamepad) {
            let axis1 = -Nabu.InputManager.DeadZoneAxis(gamepad.axes[1]);
            if (axis1 > 0.5) {
                if (this._timer <= 0) {
                    this.currentPointerUp();
                    this._timer = 0.5;
                }
            }
            else if (axis1 < -0.5) {
                if (this._timer <= 0) {
                    this.currentPointerDown();
                    this._timer = 0.5;
                }
            }
            else {
                this._timer = 0;
            }
        }
    }
}
customElements.define("soon-menu", SoonView);
