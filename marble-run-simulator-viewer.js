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
var testChallenge = {
    balls: [{ x: -0.253072613110704, y: 0.04504040380131484, z: 5.551115123125783e-17 }],
    parts: [
        { name: "end", i: 0, j: 0, k: 0, mirrorZ: false, color: 0 },
        { name: "start", i: -2, j: -1, k: 0, mirrorZ: false, color: 0 },
    ],
};
var currentTest = {
    balls: [
        { x: -0.0421983410139945, y: 0.04355721865963, z: 1.1102230246251565e-16 },
        { x: -0.16477541216952107, y: 0.03441816972081398, z: -0.18000000000000022 },
        { x: -0.12211384583885848, y: 0.02594399399776657, z: -0.17999999999999994 },
        { x: -0.08103597508125635, y: 0.013511197286796714, z: -0.18000000000000005 },
        { x: -0.04157082726142615, y: 0.002664879873240697, z: -0.1800000000000001 },
        { x: -0.001549444922861784, y: -0.007272509636327362, z: -0.17999999999999988 },
    ],
    parts: [
        { name: "uturn-0.3", i: 2, j: 3, k: 1, color: 0 },
        { name: "ramp-1.1.1", i: 1, j: 2, k: 1, color: 0 },
        { name: "gravitywell", i: 0, j: -1, k: 0, mirrorZ: false, color: 0 },
        { name: "uturn-0.4", i: -3, j: -1, k: 0, mirrorX: true, color: 0 },
        { name: "ramp-1.0.1", i: -1, j: -1, k: 0, mirrorX: false, mirrorZ: false, color: 0 },
        { name: "stairway-3.6", i: -1, j: -1, k: 3, mirrorX: true, mirrorZ: false, color: 0 },
    ],
};
var jumperTest = {
    balls: [
        { x: -0.4539999737739563, y: -0.03150000011920929, z: 0 },
        { x: -0.4539999737739563, y: 0.051655959725379945, z: 0 },
        { x: -0.4539999737739563, y: 0.13481193447113038, z: 0 },
        { x: -0.4539999737739563, y: 0.2179679092168808, z: 0 },
    ],
    parts: [
        { name: "ramp-4.2.2", i: -2, j: -1, k: -1, mirrorX: true, mirrorZ: false, color: 0 },
        { name: "jumper-1", i: 2, j: -1, k: 0, mirrorX: true, mirrorZ: false, color: 0 },
        { name: "jumper-1", i: 0, j: -2, k: 0, mirrorZ: false, color: 0 },
        { name: "uturn-0.2", i: 5, j: -3, k: -1, color: 0 },
        { name: "spiral-1.2.2", i: 2, j: -3, k: -1, mirrorX: true, color: 0 },
        { name: "ramp-2.0.1", i: 3, j: -3, k: -1, mirrorX: false, mirrorZ: false, color: 0 },
        { name: "ramp-2.3.1", i: 3, j: -3, k: 0, mirrorX: true, mirrorZ: false, color: 0 },
        { name: "ramp-2.6.1", i: -2, j: -7, k: 0, mirrorX: false, mirrorZ: false, color: 0 },
        { name: "elevator-9", i: -3, j: -8, k: 0, mirrorX: true, mirrorZ: false, color: 0 },
    ],
};
var leaps = {
    balls: [
        { x: -0.4539999737739563, y: -0.09150000250339509, z: 0 },
        { x: -0.4539999737739563, y: -0.012975234150886536, z: 0 },
        { x: -0.4539999737739563, y: 0.0655495491027832, z: 0 },
        { x: -0.4539999737739563, y: 0.14407431745529176, z: 0 },
        { x: -0.4539999737739563, y: 0.2225991007089615, z: 0 },
    ],
    parts: [
        { name: "uturn-0.3", i: -2, j: 4, k: 0, mirrorX: true, mirrorZ: true, color: 0 },
        { name: "uturn-0.3", i: 3, j: 4, k: 0, color: 0 },
        { name: "ramp-2.0.1", i: 1, j: 4, k: 2, mirrorX: false, mirrorZ: false, color: 0 },
        { name: "ramp-2.1.1", i: -1, j: 3, k: 0, mirrorX: true, mirrorZ: false, color: 0 },
        { name: "jumper-1", i: 2, j: 3, k: 0, mirrorX: true, mirrorZ: false, color: 0 },
        { name: "ramp-3.1.3", i: -2, j: 3, k: 0, mirrorX: false, mirrorZ: false, color: 0 },
        { name: "jumper-1", i: 1, j: 2, k: 0, mirrorZ: false, color: 0 },
        { name: "ramp-2.4.1", i: -1, j: 0, k: 2, mirrorX: true, mirrorZ: false, color: 0 },
        { name: "jumper-1", i: 2, j: -1, k: 0, mirrorX: true, mirrorZ: false, color: 0 },
        { name: "jumper-1", i: 2, j: -1, k: 2, mirrorX: true, mirrorZ: false, color: 0 },
        { name: "jumper-1", i: 1, j: -1, k: 2, mirrorZ: false, color: 0 },
        { name: "jumper-1", i: 0, j: -2, k: 0, mirrorZ: false, color: 0 },
        { name: "wall-3.3", i: 3, j: -3, k: 0, mirrorZ: false, color: 0 },
        { name: "ramp-2.6.1", i: -2, j: -7, k: 0, mirrorX: false, mirrorZ: false, color: 0 },
        { name: "elevator-11", i: -3, j: -8, k: 0, mirrorX: true, mirrorZ: false, color: 0 },
    ],
};
var screw = {
    balls: [{ x: -0.07531240703587543, y: -0.02232514866787129, z: -0.05999999865889566 }],
    parts: [
        { name: "uturn-1.3", i: -1, j: 0, k: -1, mirrorX: true, mirrorZ: false, c: 0 },
        { name: "ramp-1.1.1", i: 0, j: -1, k: -1, mirrorX: true, mirrorZ: false, c: 0 },
        { name: "screw-1.3", i: 0, j: -2, k: 1, mirrorZ: false, c: 0 },
        { name: "uturn-1.3", i: 1, j: -2, k: -1, mirrorZ: true, c: 0 },
    ],
};
var longScrew = {
    balls: [{ x: -0.17944236995914156, y: -0.05884189935798628, z: -0.059999998658895576 }],
    parts: [
        { name: "ramp-1.1.1", i: -1, j: 2, k: 1, c: 0 },
        { name: "uturn-0.2", i: -2, j: 2, k: 0, mirrorX: true, mirrorZ: false, c: 0 },
        { name: "ramp-1.0.1", i: -1, j: 2, k: 0, mirrorX: false, mirrorZ: false, c: 0 },
        { name: "join", i: 0, j: 1, k: 0, mirrorX: true, mirrorZ: false, c: 0 },
        { name: "uturn-0.3", i: 1, j: -1, k: -1, mirrorZ: true, c: 0 },
        { name: "jumper-8", i: 1, j: -1, k: 0, mirrorZ: false, c: 0 },
        { name: "screw-1.4", i: 0, j: -1, k: 1, mirrorZ: false, c: 0 },
        { name: "ramp-2.2.1", i: -2, j: -1, k: 0, mirrorX: false, mirrorZ: false, c: 0 },
        { name: "uturn-0.2", i: -3, j: -1, k: -1, mirrorX: true, mirrorZ: false, c: 0 },
        { name: "stairway-1.4", i: 0, j: -3, k: -1, mirrorX: true, mirrorZ: false, c: 0 },
        { name: "ramp-2.2.1", i: -2, j: -3, k: -1, mirrorX: true, mirrorZ: false, c: 0 },
    ],
};
var relax = {
    balls: [
        { x: -0.030297282196921807, y: 0.06289056178229195, z: -0.06 },
        { x: 0.17969462776441614, y: 0.005141302622776172, z: -0.06 },
        { x: 0.14770485667050623, y: 0.005141302622776172, z: -0.06 },
        { x: 0.16373458031581783, y: 0.005141302622776172, z: -0.06 },
    ],
    parts: [
        { name: "ramp-1.0.1", i: 1, j: 0, k: 1, mirrorX: false, mirrorZ: false, c: 0 },
        { name: "jumper-6", i: 2, j: -2, k: 1, mirrorZ: false, c: 0 },
        { name: "jumper-6", i: 0, j: -2, k: 1, mirrorX: true, mirrorZ: false, c: 0 },
    ],
};
var infinityMachine = {
    balls: [
        { x: -0.06379543506766659, y: 0.09792443939048934, z: -0.06 },
        { x: 0.17969462776441614, y: 0.005141302622776172, z: -0.06 },
        { x: 0.14770485667050623, y: 0.005141302622776172, z: -0.06 },
        { x: 0.16373458031581783, y: 0.005141302622776172, z: -0.06 },
    ],
    parts: [
        { name: "ramp-1.0.1", i: 1, j: 0, k: 1, mirrorX: false, mirrorZ: false, c: 0 },
        { name: "uturn-0.2", i: 3, j: -2, k: 0, c: 0 },
        { name: "ramp-1.2.1", i: 2, j: -2, k: 1, mirrorX: true, mirrorZ: false, c: 0 },
        { name: "ramp-1.0.1", i: 2, j: -2, k: 0, mirrorX: false, mirrorZ: false, c: 0 },
        { name: "ramp-1.3.1", i: 0, j: -3, k: 1, mirrorX: false, mirrorZ: false, c: 0 },
        { name: "uturn-0.2", i: -1, j: -3, k: 0, mirrorX: true, c: 0 },
        { name: "stairway-1.3", i: 1, j: -3, k: 0, mirrorX: true, mirrorZ: false, c: 0 },
        { name: "ramp-1.0.1", i: 0, j: -3, k: 0, mirrorX: false, mirrorZ: false, c: 0 },
    ],
};
var myTest = {
    balls: [{ x: -0.030297282196921807, y: 0.06289056178229195, z: -0.06 }],
    parts: [
        { name: "ramp-1.0.1", i: 1, j: 0, k: 1, mirrorX: false, mirrorZ: false, c: [0] },
        { name: "jumper-6", i: 0, j: -2, k: 1, mirrorX: true, mirrorZ: false, c: [0] },
        { name: "screw-1.2", i: 2, j: -2, k: 1, mirrorZ: false, c: [0, 1, 1, 0, 0] },
    ],
};
var reworkingGoldenLoops = {
    n: "Golden Loops",
    a: "Sven Frankson",
    v: 4,
    d: "06hk9huzi0004hk9hx5i0006hk9hzci0003hk9i1ji0008hk9i3qi0005hk9i5xi00040q04hui5i011111301100hvi5i0911111000i4i4i0211111006i6i4i0202101006i0i3hz415121006hxi3i0304111009hvi1i024220110hi4i1i0233101007hyi1hz234111000i0i1i0221111000i2i1i0201101000hxi1i1741111100i2i0hz211101100i0hzi2451111007i4hyhz23310110ai0hxhz23330110ai4hxi2223211006i6hxi0203101000i4hxi0201101000i1hxi0341111000huhti1441101109hyhthz243121106hshti0202111100hvhti0681101005huhsi01111060010100bhshri02f11110",
};
var reworkingLargeTornado = {
    n: "Large Tornado",
    a: "Tiaratum Games",
    v: 3,
    d: "06i5ci0si50i5ci2zi50i5ci56i50i5ci7di50i5ci9ki50i5cibri500i06hsi1hx405131000hwhzhx421111000i0hzhx201101000hyhxi2441111009hwhxi1242101006i2hwhy415101006hzhvhy314131006i2huhy314101006hyhthy415131006i2hshy415101006hyhrhy416131006i2hqhy416101006hxhphy517131006i2hohy517101006hwhnhy618131006i2hmi1415101006hyhlhx41511100bi2hkhx2f11010",
};
var reworkingSkyScrew = {
    n: "Sky Screw",
    a: "Sven",
    v: 3,
    d: "05i3vi7jhyci3ti2jhyci6oi52hv0i6ni00hv0i71ia9hyc0i06i4i0i0304101000i0hzi0411101006hyhzi0202111001i0hyi181111100di2hxi32311151000006i0hxi1203111107i8hvi1233101000i1hvi4531101009i6hui324212100di2hui12311051000006i4hui1203101107hzhsi223311100di2hri32311151000006i0hri1203111106i6hqi1202101000i1hqi255111100di2hoi1231105100000ai4hoi12232010",
};
var reworkingJumping = {
    n: "Jumping",
    a: "Sven",
    v: 3,
    d: "07hk9huzi00hk9hx4i00hk9hzai00hk9i1fi00hk9i3li00hk9i5qi00hk9i7wi000m00hwi5i0612131004hui5i021111301106i5i3hz20310100ai2i3i1323311000i0i3hz501101009hwi1i024220110gi0i1i2221501007hyi0hz234111000i3hzhz201101100hyhzi176111110gi4hzi222141100gi4hzi0221711006i5hzhz203101107i6hyi023310100gi1hyi022170100ai0hxhz323201109hyhthz243121100huhti1441101106hshti0202111100hwhti0571101005huhri02211060010100bhshqi02g11110",
};
var testSnake = {
    n: "Two in One",
    a: "Tiaratum Games",
    v: 3,
    d: "06i5chz4i1oi5ci1ai1oi5ci3gi1ohtci0ri50hyai37i50i22i54i500q00hzi1hz301101000hxi0hz211101006hvi0hz202111006i4i0i0202101000hxi0i0101101002hyi0hz403101000i2i0i0201101000hwhzi1231111000i1hzi1311101002hyhzi0303101006hvhzhx202111100huhyi1241101000hxhyhy211111100huhyi2511111106hshyhz203111000huhyhz101101006hzhyhy405101107hshwi023311110ahvhwhz223211002hxhwhy30310100ai0hvhz21311100bi2huhz27110100dhxhuhx5511051000000huhui0551111106i2huhx304101100hzhui03011011",
};
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
        this._trackTargetCamSpeed = 0;
        this.cameraOrtho = false;
        this.animateCamera = Mummu.AnimationFactory.EmptyNumbersCallback;
        this.animateCameraTarget = Mummu.AnimationFactory.EmptyVector3Callback;
        this.mainVolume = 0;
        this._targetTimeFactor = 0.8;
        this.timeFactor = 0.1;
        this.physicDT = 0.0005;
        this._graphicQ = Core.GraphicQuality.Medium;
        this.averagedFPS = 0;
        this.updateConfigTimeout = -1;
        this.machineEditorContainerIsDisplayed = false;
        this.machineEditorContainerHeight = -1;
        this.canvasLeft = 0;
        this._showGraphicAutoUpdateAlertInterval = 0;
        this._pointerDownX = 0;
        this._pointerDownY = 0;
        this.onPointerDown = (event) => {
            this._pointerDownX = this.scene.pointerX;
            this._pointerDownY = this.scene.pointerY;
        };
        this.onPointerUp = (event) => {
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
        };
        this.onWheelEvent = (event) => {
            if (this.cameraMode === CameraMode.Ball || this.cameraMode === CameraMode.Landscape) {
                this.targetCamRadiusFromWheel = true;
            }
        };
        this.editMachineNameActive = false;
        this.editMachineAuthorActive = false;
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
        return this.timeFactor * (this.mode === GameMode.Home ? 0.5 : 1);
    }
    getGraphicQ() {
        return this._graphicQ;
    }
    async setGraphicQ(q) {
        this._graphicQ = q;
        this.updateShadowGenerator();
        if (this.machine) {
            await this.machine.instantiate(true);
            this.updateMachineAuthorAndName();
        }
        await this.room.setRoomIndex(this.room.contextualRoomIndex(this.room.currentRoomIndex));
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
        if (graphicQ >= Core.GraphicQuality.Medium) {
            return Core.MaterialQuality.PBR;
        }
        return Core.MaterialQuality.Standard;
    }
    async createScene() {
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
        this.soonView = document.getElementsByTagName("soon-menu")[0];
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
        };
        alternateMenuCamMode();
        this.canvas.addEventListener("pointerdown", this.onPointerDown);
        this.canvas.addEventListener("pointerup", this.onPointerUp);
        this.canvas.addEventListener("wheel", this.onWheelEvent);
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
                this.topbar.resize();
                this.toolbar.resize();
                if (this.router) {
                    if (this.router.homePage) {
                        this.router.homePage.resize();
                    }
                }
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
                    this.targetCamAlpha = -0.2 * Math.PI - Math.random() * Math.PI * 0.6;
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
            this.camera.orthoBottom = -1 * f;
            this.camera.orthoLeft = -this.screenRatio * f;
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
                if ((this.averagedFPS < 24 || imposedTimeFactorRatio < 0.8 || this.DEBUG_RANDOM_GRAPHIC_Q_UPDATE === -1) && this.getGraphicQ() > Core.GraphicQuality.VeryLow) {
                    if (this.updateConfigTimeout === -1) {
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
                    if (this.updateConfigTimeout === -1) {
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
    resizeCanvas() {
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
    updateCameraLayer() {
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
                    this.horizontalBlur = new BABYLON.BlurPostProcess("blurH", new BABYLON.Vector2(1, 0), 16, 1, this.camBackGround);
                    this.verticalBlur = new BABYLON.BlurPostProcess("blurV", new BABYLON.Vector2(0, 1), 16, 1, this.camBackGround);
                }
                else {
                    this.scene.activeCameras = [this.camera];
                }
            }
        }
    }
    updateShadowGenerator() {
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
    getCameraMinFOV() {
        let ratio = this.engine.getRenderWidth() / this.engine.getRenderHeight();
        let fov = this.camera.fov;
        if (ratio > 1) {
            return fov;
        }
        return fov * ratio;
    }
    getCameraHorizontalFOV() {
        return 2 * Math.atan(this.screenRatio * Math.tan(this.camera.fov / 2));
    }
    getCameraZoomFactor() {
        let f = 1;
        if (this.cameraMode === CameraMode.Ball || this.cameraMode === CameraMode.Landscape) {
            f = 1 - (this.targetCamRadius - this.camera.lowerRadiusLimit) / (this.camera.upperRadiusLimit - this.camera.lowerRadiusLimit);
        }
        else {
            f = 1 - (this.camera.radius - this.camera.lowerRadiusLimit) / (this.camera.upperRadiusLimit - this.camera.lowerRadiusLimit);
        }
        return f * f;
    }
    setCameraZoomFactor(v) {
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
    setCameraMode(camMode, lockRotation, lockPanning) {
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
                this.targetCamAlpha = -0.2 * Math.PI - Math.random() * Math.PI * 0.6;
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
    getCameraRadiusToFocusMachineParts(...machineParts) {
        let start = new BABYLON.Vector3(Infinity, -Infinity, -Infinity);
        let end = new BABYLON.Vector3(-Infinity, Infinity, Infinity);
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
    async focusMachineParts(updateAlphaBetaRadius, ...machineParts) {
        let start = new BABYLON.Vector3(Infinity, -Infinity, -Infinity);
        let end = new BABYLON.Vector3(-Infinity, Infinity, Infinity);
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
            this.targetCamAlpha = -Math.PI / 2;
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
    showGraphicAutoUpdateAlert(message) {
        let alert = document.getElementById("auto-update-graphic-alert");
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
                    n--;
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
        }, 8);
    }
    updateMachineAuthorAndName() {
        if (this.machine) {
            document.querySelector("#machine-name .value").innerHTML = this.machine.name;
            document.querySelector("#machine-author .value").innerHTML = this.machine.author;
        }
        this.updateMachineAuthorAndNameVisibility();
    }
    updateMachineAuthorAndNameVisibility() {
        if (this.mode <= GameMode.Page) {
            document.querySelector("#machine-title").style.display = "none";
        }
        else {
            document.querySelector("#machine-title").style.display = "block";
        }
    }
    setEditMachineName(active) {
        this.editMachineNameActive = active;
        if (active) {
            document.querySelector("#machine-name").style.display = "none";
            document.querySelector("#machine-name-edit").style.display = "block";
            document.querySelector("#machine-name-edit").setAttribute("value", this.machine.name);
        }
        else {
            this.updateMachineAuthorAndName();
            document.querySelector("#machine-name").style.display = "block";
            document.querySelector("#machine-name-edit").style.display = "none";
        }
    }
    setEditMachineAuthor(active) {
        this.editMachineAuthorActive = active;
        if (active) {
            document.querySelector("#machine-author").style.display = "none";
            document.querySelector("#machine-author-edit").style.display = "inline-block";
            document.querySelector("#machine-author-edit").setAttribute("value", this.machine.author);
        }
        else {
            this.updateMachineAuthorAndName();
            document.querySelector("#machine-author").style.display = "inline-block";
            document.querySelector("#machine-author-edit").style.display = "none";
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
setTimeout(() => {
    createAndInit();
}, 500);
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
class MarbleRouter extends Nabu.Router {
    constructor(game) {
        super();
        this.game = game;
    }
    onFindAllPages() {
        this.homePage = document.getElementById("main-menu");
        this.homeButton = document.getElementById("home-button");
        this.pages.push(this.game.soonView);
    }
    onUpdate() { }
    async onHRefChange(page, previousPage) {
        this.homeButton.style.display = "none";
        if (page.indexOf("?machineId=") != -1 || page.startsWith("#machine")) {
            let index;
            if (page.indexOf("?machineId=") != -1) {
                index = parseInt(page.split("?machineId=")[1]);
            }
            else {
                index = parseInt(page.replace("#machine?id=", ""));
            }
            if (isFinite(index)) {
                this.game.mode = GameMode.Demo;
                this.game.setCameraMode(CameraMode.Landscape);
                this.hideAll();
                this.homeButton.style.display = "block";
                let dataResponse = await fetch(SHARE_SERVICE_PATH + "machine/" + index.toFixed(0));
                if (dataResponse) {
                    let data = await dataResponse.json();
                    if (data) {
                        this.game.machine.dispose();
                        this.game.machine.deserialize(data);
                        this.game.machine.generateBaseMesh();
                        this.game.machine.instantiate().then(() => {
                            this.game.updateMachineAuthorAndName();
                            this.game.machine.play();
                            this.game.setCameraMode(CameraMode.Landscape);
                            document.getElementById("click-anywhere-screen").style.display = "none";
                        });
                    }
                }
            }
            else {
                location.hash = "#home";
                return;
            }
        }
        else if (page.startsWith("#home")) {
            if (this.game.machine.parts.length === 0) {
                this.game.machine.dispose();
                this.game.machine.deserialize(fallbackMachine);
            }
            if (!this.game.machine.instantiated) {
                await this.game.machine.generateBaseMesh();
                this.game.setCameraMode(CameraMode.Landscape);
                await this.game.machine.instantiate();
                document.getElementById("click-anywhere-screen").style.display = "none";
            }
            else {
                this.game.setCameraMode(CameraMode.Landscape);
            }
            this.show(this.homePage);
            this.game.mode = GameMode.Home;
            this.game.machine.play();
            this.game.updateMachineAuthorAndName();
        }
        else {
            location.hash = "#home";
            return;
        }
        this.game.toolbar.closeAllDropdowns();
        this.game.topbar.resize();
        this.game.toolbar.resize();
        this.game.machine.regenerateBaseAxis();
        this.game.updateMachineAuthorAndName();
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
class Toolbar {
    constructor(game) {
        this.game = game;
        this.timeFactorInputShown = false;
        this.loadInputShown = false;
        this.soundInputShown = false;
        this._udpate = () => {
            if (this.game.machine) {
                if (this.game.machine.playing != this._lastPlaying) {
                    if (this.game.machine.playing) {
                        this.playButton.style.display = "none";
                        this.pauseButton.style.display = "";
                    }
                    else {
                        this.playButton.style.display = "";
                        this.pauseButton.style.display = "none";
                    }
                    this._lastPlaying = this.game.machine.playing;
                    this.resize();
                }
                this.timeFactorValue.innerText = this.game.currentTimeFactor.toFixed(2);
            }
        };
        this.onPlay = () => {
            this.game.machine.playing = true;
        };
        this.onPause = () => {
            this.game.machine.playing = false;
        };
        this.onStop = () => {
            this.game.machine.stop();
        };
        this.onTimeFactorButton = () => {
            this.timeFactorInputShown = !this.timeFactorInputShown;
            this.resize();
        };
        this.onTimeFactorInput = (e) => {
            this.game.targetTimeFactor = parseFloat(e.target.value);
        };
        this.onCamPrevButton = () => {
            this.game.setCameraMode(this.game.cameraMode - 1);
            this.resize();
        };
        this.onCamNextButton = () => {
            this.game.setCameraMode(this.game.cameraMode + 1);
            this.resize();
        };
        this.onSave = async () => {
            let data = this.game.machine.serialize();
            let dataString = JSON.stringify(data);
            window.localStorage.setItem("last-saved-machine", dataString);
            Nabu.download(this.game.machine.name + ".json", dataString);
        };
        this.onShare = async () => {
            this.game.soonView.show();
        };
        this.onLoad = () => {
            this.loadInputShown = !this.loadInputShown;
            this.resize();
        };
        this.onLoadInput = (event) => {
            let files = event.target.files;
            let file = files[0];
            if (file) {
                const reader = new FileReader();
                reader.addEventListener("load", (event) => {
                    this.game.machine.dispose();
                    this.game.machine.deserialize(JSON.parse(event.target.result));
                    this.game.machine.instantiate();
                    this.game.machine.generateBaseMesh();
                    for (let i = 0; i < this.game.machine.balls.length; i++) {
                        this.game.machine.balls[i].setShowPositionZeroGhost(true);
                    }
                    this.loadInputShown = false;
                    this.resize();
                });
                reader.readAsText(file);
            }
        };
        this.onSoundButton = () => {
            this.soundInputShown = !this.soundInputShown;
            this.resize();
        };
        this.onSoundInput = (e) => {
            this.game.mainVolume = parseFloat(e.target.value);
        };
        this.onZoomOutButton = () => {
            this.game.setCameraZoomFactor(this.game.getCameraZoomFactor() - 0.05);
        };
        this.onZoomInButton = () => {
            this.game.setCameraZoomFactor(this.game.getCameraZoomFactor() + 0.05);
        };
        this.onLayer = (e) => {
            let rect = this.layerButton.getBoundingClientRect();
            let centerY = rect.top + rect.height * 0.5;
            if (e.y > centerY) {
                //this.game.machineEditor.currentLayer++;
            }
            else {
                //this.game.machineEditor.currentLayer--;
            }
        };
        this.closeAllDropdowns = () => {
            if (this.timeFactorInputShown || this.loadInputShown || this.soundInputShown) {
                this.timeFactorInputShown = false;
                this.loadInputShown = false;
                this.soundInputShown = false;
                this.resize();
            }
        };
    }
    initialize() {
        this.container = document.querySelector("#toolbar");
        this.container.style.display = "block";
        this.playButton = document.querySelector("#toolbar-play");
        this.playButton.addEventListener("click", this.onPlay);
        this.pauseButton = document.querySelector("#toolbar-pause");
        this.pauseButton.addEventListener("click", this.onPause);
        this.stopButton = document.querySelector("#toolbar-stop");
        this.stopButton.addEventListener("click", this.onStop);
        this.timeFactorButton = document.querySelector("#toolbar-time-factor");
        this.timeFactorButton.addEventListener("click", this.onTimeFactorButton);
        this.timeFactorValue = document.querySelector("#toolbar-time-factor .value");
        this.timeFactorInput = document.querySelector("#time-factor-value");
        this.timeFactorInput.value = this.game.targetTimeFactor.toFixed(2);
        this.timeFactorInput.addEventListener("input", this.onTimeFactorInput);
        this.timeFactorInputContainer = this.timeFactorInput.parentElement;
        this.saveButton = document.querySelector("#toolbar-save");
        this.saveButton.addEventListener("click", this.onSave);
        this.shareButton = document.querySelector("#toolbar-share");
        this.shareButton.addEventListener("click", this.onShare);
        this.loadButton = document.querySelector("#toolbar-load");
        this.loadButton.addEventListener("click", this.onLoad);
        this.loadInput = document.querySelector("#load-input");
        this.loadInput.addEventListener("input", this.onLoadInput);
        this.loadInputContainer = this.loadInput.parentElement;
        this.soundButton = document.querySelector("#toolbar-sound");
        this.soundButton.addEventListener("click", this.onSoundButton);
        this.soundInput = document.querySelector("#sound-value");
        this.soundInput.value = this.game.mainVolume.toFixed(2);
        this.soundInput.addEventListener("input", this.onSoundInput);
        this.soundInputContainer = this.soundInput.parentElement;
        this.zoomOutButton = document.querySelector("#toolbar-zoom-out");
        this.zoomOutButton.addEventListener("click", this.onZoomOutButton);
        this.zoomInButton = document.querySelector("#toolbar-zoom-in");
        this.zoomInButton.addEventListener("click", this.onZoomInButton);
        this.layerButton = document.querySelector("#toolbar-layer");
        this.layerButton.addEventListener("click", this.onLayer);
        this.editButton = document.querySelector("#toolbar-edit");
        this.editButton.addEventListener("click", () => {
            this.game.soonView.show();
        });
        this.resize();
        this.game.canvas.addEventListener("pointerdown", this.closeAllDropdowns);
        this.game.scene.onBeforeRenderObservable.add(this._udpate);
    }
    dispose() {
        this.game.canvas.removeEventListener("pointerdown", this.closeAllDropdowns);
        this.game.scene.onBeforeRenderObservable.removeCallback(this._udpate);
    }
    updateButtonsVisibility() {
        if (this.game.mode === GameMode.Home) {
            this.saveButton.style.display = "none";
            this.shareButton.style.display = "none";
            this.loadButton.style.display = "none";
            this.loadInputShown = false;
            this.editButton.style.display = "none";
        }
        else if (this.game.mode === GameMode.Page) {
            this.saveButton.style.display = "none";
            this.shareButton.style.display = "none";
            this.loadButton.style.display = "none";
            this.loadInputShown = false;
            this.editButton.style.display = "none";
        }
        else if (this.game.mode === GameMode.Create) {
            this.saveButton.style.display = "";
            this.shareButton.style.display = "";
            this.loadButton.style.display = "";
            this.editButton.style.display = "none";
        }
        else if (this.game.mode === GameMode.Challenge) {
            this.saveButton.style.display = "none";
            this.shareButton.style.display = "none";
            this.loadButton.style.display = "none";
            this.loadInputShown = false;
            this.editButton.style.display = this.game.DEBUG_MODE ? "" : "none";
        }
        else if (this.game.mode === GameMode.Demo) {
            this.saveButton.style.display = "none";
            this.shareButton.style.display = "none";
            this.loadButton.style.display = "none";
            this.loadInputShown = false;
            this.editButton.style.display = "";
        }
    }
    resize() {
        this.updateButtonsVisibility();
        let margin = Math.min(window.innerWidth, window.innerHeight) * 0.02;
        let containerWidth = this.container.clientWidth;
        this.container.style.left = (this.game.canvasLeft + (this.game.engine.getRenderWidth() - containerWidth) * 0.5) + "px";
        this.container.style.bottom = ((window.innerHeight - this.game.canvas.getBoundingClientRect().height) + margin) + "px";
        requestAnimationFrame(() => {
            this.timeFactorInputContainer.style.display = this.timeFactorInputShown ? "" : "none";
            let rectButton = this.timeFactorButton.getBoundingClientRect();
            let rectContainer = this.timeFactorInputContainer.getBoundingClientRect();
            this.timeFactorInputContainer.style.left = rectButton.left.toFixed(0) + "px";
            this.timeFactorInputContainer.style.top = (rectButton.top - rectContainer.height - margin).toFixed(0) + "px";
            this.loadInputContainer.style.display = this.loadInputShown ? "" : "none";
            rectButton = this.loadButton.getBoundingClientRect();
            rectContainer = this.loadInputContainer.getBoundingClientRect();
            this.loadInputContainer.style.left = rectButton.left.toFixed(0) + "px";
            this.loadInputContainer.style.top = (rectButton.top - rectContainer.height - margin).toFixed(0) + "px";
            this.soundInputContainer.style.display = this.soundInputShown ? "" : "none";
            rectButton = this.soundButton.getBoundingClientRect();
            rectContainer = this.soundInputContainer.getBoundingClientRect();
            this.soundInputContainer.style.left = rectButton.left.toFixed(0) + "px";
            this.soundInputContainer.style.top = (rectButton.top - rectContainer.height - margin).toFixed(0) + "px";
        });
    }
}
class Topbar {
    constructor(game) {
        this.game = game;
        this._shown = true;
        this.camModeButtons = [];
        this._udpate = () => {
        };
    }
    initialize() {
        this.container = document.querySelector("#topbar");
        this.container.style.display = "block";
        this.showHideButton = this.container.querySelector(".cam-mode");
        this.camModeButtons[CameraMode.None] = this.container.querySelector(".cam-mode-none");
        this.camModeButtons[CameraMode.Landscape] = this.container.querySelector(".cam-mode-landscape");
        this.camModeButtons[CameraMode.Ball] = this.container.querySelector(".cam-mode-ball");
        this.camModeButtons[CameraMode.Selected] = this.container.querySelector(".cam-mode-selected");
        this.showHideButton.onclick = () => {
            this._shown = !this._shown;
            this.resize();
        };
        for (let i = CameraMode.None; i <= CameraMode.Selected; i++) {
            let mode = i;
            this.camModeButtons[mode].onclick = () => {
                this.game.setCameraMode(mode);
                this.resize();
            };
        }
        this.game.scene.onBeforeRenderObservable.add(this._udpate);
    }
    dispose() {
        this.game.scene.onBeforeRenderObservable.removeCallback(this._udpate);
    }
    updateButtonsVisibility() {
        for (let i = CameraMode.None; i < this.camModeButtons.length; i++) {
            this.camModeButtons[i].style.display = this._shown ? "" : "none";
        }
        if (this.game.mode === GameMode.Create || this.game.mode === GameMode.Demo) {
            this.container.style.display = "block";
            if (this._shown) {
                if (this.game.mode === GameMode.Create) {
                    this.camModeButtons[CameraMode.Selected].style.display = "";
                }
                else {
                    this.camModeButtons[CameraMode.Selected].style.display = "none";
                }
            }
        }
        else {
            this.container.style.display = "none";
        }
    }
    resize() {
        this.updateButtonsVisibility();
        if (this.game.screenRatio >= 1) {
            this.container.style.left = "0";
            this.container.style.width = "";
        }
        else {
            this.container.style.left = "0px";
            this.container.style.width = "calc(var(--button-l-size) * 1.2)";
        }
        this.camModeButtons.forEach(button => {
            button.classList.remove("active");
        });
        if (this.camModeButtons[this.game.cameraMode]) {
            this.camModeButtons[this.game.cameraMode].classList.add("active");
        }
    }
}
