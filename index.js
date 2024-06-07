var THE_ORIGIN_OF_TIME_ms = 0;
var last_step_t = 0;
var displayed_progress = 0;
var real_progress = 0;
var next_progress = 0;
var observed_progress_speed = 1;

async function loadScript(src) {
    let t0 = performance.now();
    return new Promise((resolve) => {
        let script = document.createElement('script');
        script.src = src;
        document.body.append(script);
        script.onload = () => {
            let t = performance.now();
            let t_load_this_script = (t - t0);
            let t_since_start = (t - THE_ORIGIN_OF_TIME_ms);
            console.log(src + " loaded at " + t_since_start.toFixed(3) + " ms. (in " + t_load_this_script.toFixed(3) + " ms)");
            resolve();
        };
    });
}

async function mainMachineReady() {
    let t0 = performance.now();
    return new Promise((resolve) => {
        let wait = () => {
            if (Game) {
                if (Game.Instance) {
                    if (Game.Instance.machine) {
                        if (Game.Instance.machine.ready) {
                            let t = performance.now();
                            let t_wait_this_step = (t - t0);
                            let t_since_start = (t - THE_ORIGIN_OF_TIME_ms);
                            console.log("machine ready at " + t_since_start.toFixed(3) + " ms. (in " + t_wait_this_step.toFixed(3) + " ms)");
                            resolve();
                            return;
                        }
                    }
                }
            }
            requestAnimationFrame(wait);
        }
        wait();
    });
}

async function mainMachineInstantiated() {
    let t0 = performance.now();
    return new Promise((resolve) => {
        let wait = () => {
            if (Game) {
                if (Game.Instance) {
                    if (Game.Instance.machine) {
                        if (Game.Instance.machine.ready && Game.Instance.machine.instantiated) {
                            let t = performance.now();
                            let t_wait_this_step = (t - t0);
                            let t_since_start = (t - THE_ORIGIN_OF_TIME_ms);
                            console.log("machine instantiated at " + t_since_start.toFixed(3) + " ms. (in " + t_wait_this_step.toFixed(3) + " ms)");
                            resolve();
                            return;
                        }
                    }
                }
            }
            requestAnimationFrame(wait);
        }
        wait();
    });
}

var total_observed = 72000;
var steps = [
    0,
    600 / total_observed,
    4000 / total_observed,
    36000 / total_observed,
    40000 / total_observed,
    42000 / total_observed,
    44000 / total_observed,
    47000 / total_observed,
    68000 / total_observed,
    72000 / total_observed,
    1
]

function setProgressIndex(i) {
    let t = performance.now();
    let t_since_start = (t - THE_ORIGIN_OF_TIME_ms);
    real_progress = steps[i];
    next_progress = steps[i + 1];
    observed_progress_speed_percent_second = real_progress / (t_since_start / 1000);
}

function loadStep() {
    if (real_progress < 1) {
        let f = 0.001;
        if (observed_progress_speed > 0.1) {
            f = 0.05;
        }
        else if (observed_progress_speed > 0.5) {
            f = 0.1;
        }
        displayed_progress = displayed_progress * (1 - f) + next_progress * f;

        document.querySelector("#click-anywhere-screen .white-track").style.opacity = displayed_progress;
        document.querySelector("#click-anywhere-screen .message-bottom").innerHTML = "loading... " + (displayed_progress * 100).toFixed(0) + "%";
        requestAnimationFrame(loadStep);
    }
    else {
        document.querySelector("#click-anywhere-screen .white-track").style.opacity = "1";
        document.querySelector("#click-anywhere-screen .message-bottom").innerHTML = "Click or press anywhere to Enter";
    }
}

async function doLoad() {
    setProgressIndex(0);
    updateLoadingText();
    loadStep();
    setProgressIndex(1);
    await loadScript("./lib/nabu/nabu.js");
    setProgressIndex(2);
    await loadScript("./lib/babylon.js");
    setProgressIndex(3);
    await loadScript("./lib/babylonjs.loaders.js");
    setProgressIndex(4);
    await loadScript("./lib/mummu/mummu.js");
    setProgressIndex(5);
    await loadScript("./lib/marble-run-simulator-core/marble-run-simulator-core.js");
    setProgressIndex(6);
    await loadScript("./marble-run-simulator-viewer.js");
    setProgressIndex(7);
    await mainMachineReady();
    setProgressIndex(8);
    await mainMachineInstantiated();
    setProgressIndex(9);
}

function updateLoadingText() {
    let d = 350;
    let text = "> " + loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
    let e = document.getElementById("loading-info");
    e.innerText = text;
    if (real_progress < 1) {
        setTimeout(() => {
            text += ".";
            e.innerText = text;
            setTimeout(() => {
                text += ".";
                e.innerText = text;
                setTimeout(() => {
                    text += ".";
                    e.innerText = text;
                    setTimeout(() => {
                        updateLoadingText();
                    }, d);
                }, d);
            }, d);
        }, d);
    }
    else {
        e.innerText = "";
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    THE_ORIGIN_OF_TIME_ms = performance.now();
    last_step_t = THE_ORIGIN_OF_TIME_ms;
    doLoad();
});

const loadingTexts = [
    "computing g first thousand digits",
    "waiting for wikipedia 'Isaac Newton' page to load",
    "implementing CNRS latest researches on point dynamic",
    "recalculating Pi 56th decimal",
    "calibrating pixels #3, #71, #99 and #204",
    "baking lightmaps temp 7",
    "indexing the vertices by size",
    "verticing the indexes by color",
    "checking procedural generation procedures",
    "running 1 (one) unitary unit test",
    "please do not touch screen while loading",
    "initializing the initializer",
    "managing master manager disposal",
    "thanking user for his patience",
    "waiting for loading screen to update",
    "updating loading screen offscreen features",
    "running last minute bug removal script",
    "cleaning up unused assets at runtime",
    "cleaning up unused assets at runtime",
    "pretending to do something useful",
    "allowing the loader to take a short break"
]