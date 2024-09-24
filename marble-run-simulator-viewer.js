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
        this.mainVolume = 0;
        this._targetTimeFactor = 0.8;
        this.timeFactor = 0.1;
        this.physicDT = 0.0005;
        this._graphicQ = Core.GraphicQuality.High;
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
        return 0.2;
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
        if (graphicQ >= Core.GraphicQuality.High) {
            return Core.MaterialQuality.PBR;
        }
        return Core.MaterialQuality.Standard;
    }
    async createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.screenRatio = this.engine.getRenderWidth() / this.engine.getRenderHeight();
        this.vertexDataLoader = new Mummu.VertexDataLoader(this.scene);
        BABYLON.SceneLoader.ImportMesh("", "./datas/meshes/room.babylon", undefined, undefined, (meshes) => {
        });
        this.materials = new Core.MainMaterials(this);
        this.spotLight = new BABYLON.SpotLight("spot-light", new BABYLON.Vector3(0, 0.5, 0), new BABYLON.Vector3(0, -1, 0), Math.PI / 3, 1, this.scene);
        this.spotLight.shadowMinZ = 1;
        this.spotLight.shadowMaxZ = 3;
        this.spotLight.intensity = 0;
        let ambientLight = new BABYLON.HemisphericLight("ambient-light", (new BABYLON.Vector3(1, 3, 2)).normalize(), this.scene);
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 1.6, -2));
        this.camera.minZ = 0.1;
        this.camera.speed = 0.5;
        this.updateShadowGenerator();
        this.camera.attachControl();
        this.camera.getScene();
        this.room = new Core.Room(this);
        this.machine = new Core.Machine(this);
        this.machine.root.position.y = 1.1;
        this.machine.root.computeWorldMatrix(true);
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
        if (this.getGraphicQ() === 0) {
            this.room.setRoomIndex(1, true);
        }
        else {
            this.room.setRoomIndex(0, true);
        }
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
        if (this.machine) {
            this.machine.update();
        }
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
