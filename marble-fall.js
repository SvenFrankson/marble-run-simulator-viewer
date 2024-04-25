class ChallengeStep {
    constructor(challenge) {
        this.challenge = challenge;
    }
    static Wait(challenge, duration) {
        let step = new ChallengeStep(challenge);
        step.doStep = () => {
            return new Promise(resolve => {
                setTimeout(resolve, duration * 1000);
            });
        };
        return step;
    }
    static Text(challenge, text, duration) {
        let step = new ChallengeStep(challenge);
        step.doStep = () => {
            step.challenge.tutoPopup.setAttribute("duration", duration.toFixed(3));
            step.challenge.tutoText.innerHTML = text;
            return step.challenge.tutoPopup.show(0.5);
        };
        return step;
    }
    static Arrow(challenge, position, duration) {
        let step = new ChallengeStep(challenge);
        step.doStep = () => {
            let p;
            if (position instanceof BABYLON.Vector3) {
                p = position;
            }
            else {
                p = position();
            }
            let dir = new BABYLON.Vector3(0, -1, 0);
            let arrow = new HighlightArrow("challenge-step-arrow", challenge.game, 0.07, 0.02, dir);
            arrow.position = p;
            return new Promise(resolve => {
                arrow.instantiate().then(async () => {
                    await arrow.show(0.5);
                    await challenge.WaitAnimation(duration);
                    await arrow.hide(0.5);
                    arrow.dispose();
                    resolve();
                });
            });
        };
        return step;
    }
    static SvgArrow(challenge, element, dir, duration) {
        let step = new ChallengeStep(challenge);
        step.doStep = () => {
            let arrow = new SvgArrow("challenge-step-arrow", challenge.game, 0.3, 0.15, dir);
            return new Promise(resolve => {
                arrow.instantiate().then(async () => {
                    if (element instanceof HTMLElement) {
                        arrow.setTarget(element);
                    }
                    else {
                        arrow.setTarget(element());
                    }
                    await arrow.show(0.5);
                    await challenge.WaitAnimation(duration);
                    await arrow.hide(0.5);
                    arrow.dispose();
                    resolve();
                });
            });
        };
        return step;
    }
    static SvgArrowSlide(challenge, element, target, duration) {
        let step = new ChallengeStep(challenge);
        step.doStep = () => {
            let arrow = new SvgArrow("challenge-step-arrow", challenge.game, 0.3, 0.1, -45);
            return new Promise(resolve => {
                arrow.instantiate().then(async () => {
                    if (element instanceof HTMLElement) {
                        arrow.setTarget(element);
                    }
                    else {
                        arrow.setTarget(element());
                    }
                    await arrow.show(0.5);
                    await arrow.slide(target.x(), target.y(), target.dir, duration, Nabu.Easing.easeInOutSine);
                    await arrow.hide(0.5);
                    arrow.dispose();
                    resolve();
                });
            });
        };
        return step;
    }
}
class Challenge {
    constructor(game) {
        this.game = game;
        this.WaitAnimation = Mummu.AnimationFactory.EmptyVoidCallback;
        this.state = 0;
        this.delay = 2.5;
        this.steps = [];
        this.winZoneMin = BABYLON.Vector3.Zero();
        this.winZoneMax = BABYLON.Vector3.Zero();
        this.gridIMin = -4;
        this.gridIMax = 4;
        this.gridJMin = -10;
        this.gridJMax = 1;
        this.gridDepth = 0;
        this.currentIndex = 0;
        this.availableElements = [];
        this.completedChallenges = [];
        this._successTime = 0;
        this.WaitAnimation = Mummu.AnimationFactory.CreateWait(this.game);
        this.tutoPopup = document.getElementById("challenge-tuto");
        this.tutoText = this.tutoPopup.querySelector("div");
        this.tutoComplete = document.getElementById("challenge-next");
        let completedChallengesString = window.localStorage.getItem("completed-challenges");
        if (completedChallengesString) {
            let completedChallenges = JSON.parse(completedChallengesString);
            if (completedChallenges) {
                this.completedChallenges = completedChallenges.data;
            }
        }
        let challengePanels = document.querySelector("#challenge-menu").querySelectorAll("panel-element");
        for (let i = 0; i < challengePanels.length; i++) {
            let panel = challengePanels[i];
            if (this.completedChallenges[i + 1]) {
                panel.setAttribute("status", "completed");
            }
            let svgCompleteCheck = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgCompleteCheck.classList.add("check");
            svgCompleteCheck.setAttribute("viewBox", "0 0 100 100");
            svgCompleteCheck.innerHTML = `
                <path d="M31 41 L51 61 L93 20" stroke-width="12" fill="none"></path>
                <path d="M71 15 A42 42 0 1 0 91 48" stroke-width="8" fill="none"></path>
            `;
            panel.appendChild(svgCompleteCheck);
        }
    }
    completeChallenge(index) {
        this.completedChallenges[index] = 1;
        window.localStorage.setItem("completed-challenges", JSON.stringify({ data: this.completedChallenges }));
        let challengePanels = document.querySelector("#challenge-menu").querySelectorAll("panel-element");
        let panel = challengePanels[index - 1];
        if (panel) {
            panel.setAttribute("status", "completed");
        }
    }
    initialize(data) {
        this.currentIndex = data.index;
        this.steps = ChallengeSteps.GetSteps(this, data.index);
        this.state = 0;
        let arrival = this.game.machine.parts.find(part => { return part.partName === "end"; });
        if (arrival) {
            let p = arrival.position.clone();
            let x0 = Core.tileWidth * 0.15;
            let y0 = -1.4 * Core.tileHeight - 0.005;
            p.x += x0;
            p.y += y0;
            this.winZoneMin.copyFrom(p);
            this.winZoneMin.x -= 0.04;
            this.winZoneMin.z -= 0.01;
            this.winZoneMax.copyFrom(p);
            this.winZoneMax.x += 0.04;
            this.winZoneMax.y += 0.02;
            this.winZoneMax.z += 0.01;
        }
        this.game.machineEditor.grid.position.copyFromFloats(0, 0, 0);
        this.gridIMin = data.gridIMin;
        this.gridIMax = data.gridIMax;
        this.gridJMin = data.gridJMin;
        this.gridJMax = data.gridJMax;
        this.gridDepth = data.gridDepth;
        for (let i = 0; i < this.availableElements.length; i++) {
            this.game.machineEditor.setItemCount(this.availableElements[i], 1);
        }
    }
    update(dt) {
        if (this.state < 100) {
            let ballsIn = true;
            for (let i = 0; i < this.game.machine.balls.length; i++) {
                let ball = this.game.machine.balls[i];
                ballsIn = ballsIn && ball && Mummu.SphereAABBCheck(ball.position, ball.radius, this.winZoneMin, this.winZoneMax);
            }
            if (ballsIn) {
                this._successTime += dt;
            }
            else {
                this._successTime = 0;
            }
            if (this._successTime > 1) {
                this.state = 101;
            }
        }
        if (this.state != -1 && this.state < 100) {
            let next = this.state + 1;
            let step = this.steps[this.state];
            if (step instanceof ChallengeStep) {
                this.state = -1;
                step.doStep().then(() => { this.state = next; });
            }
            else if (step) {
                let count = step.length;
                this.state = -1;
                for (let i = 0; i < step.length; i++) {
                    step[i].doStep().then(() => { count--; });
                }
                let checkAllDone = setInterval(() => {
                    if (count === 0) {
                        this.state = next;
                        clearInterval(checkAllDone);
                    }
                }, 15);
            }
        }
        else if (this.state > 100) {
            this.state = 100;
            let doFinalStep = async () => {
                this.tutoText.innerText = "Challenge completed - Well done !";
                this.tutoPopup.setAttribute("duration", "0");
                this.completeChallenge(this.currentIndex);
                this.tutoPopup.show(0.5);
                await this.WaitAnimation(0.5);
                if (this.game.mode === GameMode.Challenge) {
                    this.tutoComplete.show(0.5);
                }
            };
            doFinalStep();
        }
    }
}
class ChallengeSteps {
    static GetSteps(challenge, index) {
        if (index === 1) {
            return [
                ChallengeStep.Wait(challenge, challenge.delay * 0.5),
                ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-1-title"></i18n-text> - <i18n-text text-key="challenge-1-subtitle"></i18n-text>', challenge.delay),
                ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-step-1.1"></i18n-text>', challenge.delay),
                [
                    ChallengeStep.Arrow(challenge, () => {
                        let ball = challenge.game.machine.balls[0];
                        if (ball) {
                            return ball.position;
                        }
                        return BABYLON.Vector3.Zero();
                    }, challenge.delay),
                    ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-step-1.2"></i18n-text>', challenge.delay),
                ],
                [
                    ChallengeStep.Arrow(challenge, () => {
                        let arrival = challenge.game.machine.parts.find(part => { return part.partName === "end"; });
                        if (arrival) {
                            let p = arrival.position.clone();
                            let x0 = Core.tileWidth * 0.15;
                            let y0 = -1.4 * Core.tileHeight - 0.005;
                            p.x += x0;
                            p.y += y0;
                            return p;
                        }
                        return BABYLON.Vector3.Zero();
                    }, challenge.delay),
                    ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-step-1.3"></i18n-text>', challenge.delay),
                ],
                [
                    ChallengeStep.SvgArrowSlide(challenge, () => { return document.querySelector(".machine-editor-item"); }, { x: () => { return window.innerWidth * 0.5; }, y: () => { return window.innerHeight * 0.5; }, dir: -135 }, challenge.delay),
                    ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-step-1.4"></i18n-text>', challenge.delay),
                ],
                [
                    ChallengeStep.SvgArrow(challenge, () => { return document.querySelector("#toolbar-play"); }, -155, challenge.delay),
                    ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-step-1.5"></i18n-text>', challenge.delay),
                ]
            ];
        }
        else if (index === 2) {
            return [
                ChallengeStep.Wait(challenge, challenge.delay * 0.5),
                ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-2-title"></i18n-text> - <i18n-text text-key="challenge-2-subtitle"></i18n-text>', challenge.delay),
                ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-step-2.1"></i18n-text>', challenge.delay),
                ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-step-2.2"></i18n-text>', challenge.delay)
            ];
        }
        else if (index === 3) {
            return [
                ChallengeStep.Wait(challenge, challenge.delay * 0.5),
                ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-3-title"></i18n-text> - <i18n-text text-key="challenge-3-subtitle"></i18n-text>', challenge.delay),
                ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-step-3.1"></i18n-text>', challenge.delay),
                ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-step-3.2"></i18n-text>', challenge.delay)
            ];
        }
        else if (index === 4) {
            return [
                ChallengeStep.Wait(challenge, challenge.delay * 0.5),
                ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-4-title"></i18n-text> - <i18n-text text-key="challenge-4-subtitle"></i18n-text>', challenge.delay),
                ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-step-4.1"></i18n-text>', challenge.delay),
                ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-step-4.2"></i18n-text>', challenge.delay)
            ];
        }
        else if (index === 5) {
            return [
                ChallengeStep.Wait(challenge, challenge.delay * 0.5),
                ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-5-title"></i18n-text> - <i18n-text text-key="challenge-5-subtitle"></i18n-text>', challenge.delay),
                ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-step-5.1"></i18n-text>', challenge.delay),
                ChallengeStep.Text(challenge, '<i18n-text text-key="challenge-step-5.2"></i18n-text>', challenge.delay)
            ];
        }
    }
}
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
        { name: "gravity-well", i: 0, j: -1, k: 0, mirrorZ: false, color: 0 },
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
var Core = MarbleRunSimulatorCore;
function addLine(text) {
    let e = document.createElement("div");
    e.classList.add("debug-log");
    e.innerText = text;
    document.body.appendChild(e);
}
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
    CameraMode[CameraMode["None"] = 0] = "None";
    CameraMode[CameraMode["Ball"] = 1] = "Ball";
    CameraMode[CameraMode["Landscape"] = 2] = "Landscape";
    CameraMode[CameraMode["Selected"] = 3] = "Selected";
    CameraMode[CameraMode["Focusing"] = 4] = "Focusing";
    CameraMode[CameraMode["FocusingSelected"] = 5] = "FocusingSelected";
    CameraMode[CameraMode["Transition"] = 6] = "Transition";
})(CameraMode || (CameraMode = {}));
class Game {
    constructor(canvasElement) {
        this.DEBUG_MODE = false;
        this.DEBUG_USE_LOCAL_STORAGE = true;
        this.screenRatio = 1;
        this.cameraMode = CameraMode.None;
        this.menuCameraMode = CameraMode.Ball;
        this.targetCamTarget = BABYLON.Vector3.Zero();
        this.targetCamAlpha = -Math.PI * 0.5;
        this.targetCamBeta = Math.PI * 0.4;
        this.targetCamRadius = 0.3;
        this._trackTargetCamSpeed = 0;
        this.cameraOrtho = false;
        this.animateCamera = Mummu.AnimationFactory.EmptyNumbersCallback;
        this.animateCameraTarget = Mummu.AnimationFactory.EmptyVector3Callback;
        this.mainVolume = 0;
        this.targetTimeFactor = 0.8;
        this.timeFactor = 0.1;
        this.physicDT = 0.0005;
        this.averagedFPS = 0;
        this.updateConfigTimeout = -1;
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
        };
        this.onWheelEvent = (event) => {
            if (this.cameraMode === CameraMode.Ball || this.cameraMode === CameraMode.Landscape) {
                this.setCameraMode(CameraMode.None);
            }
        };
        Game.Instance = this;
        this.canvas = document.getElementById(canvasElement);
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
        this.engine = new BABYLON.Engine(this.canvas, true);
        BABYLON.Engine.ShadersRepository = "./shaders/";
        I18NText.LangFilesDir = "./datas/i18n/";
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
    get currentTimeFactor() {
        return this.timeFactor * (this.mode === GameMode.Home ? 0.5 : 1);
    }
    getGraphicQ() {
        return 2;
    }
    async createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.config = new MarbleConfiguration("marble-configuration", this);
        this.inputManager = new Nabu.InputManager(this.canvas, this.config);
        this.config.initialize();
        this.config.saveToLocalStorage();
        this.config.getElement("lang").forceInit();
        this.screenRatio = this.engine.getRenderWidth() / this.engine.getRenderHeight();
        this.vertexDataLoader = new Mummu.VertexDataLoader(this.scene);
        this.materials = new Core.MainMaterials(this);
        if (this.DEBUG_MODE) {
            this.scene.clearColor = BABYLON.Color4.FromHexString("#00ff0000");
        }
        else {
            this.scene.clearColor = BABYLON.Color4.FromHexString("#272B2EFF");
        }
        this.spotLight = new BABYLON.SpotLight("spot-light", new BABYLON.Vector3(0, 0.5, 0), new BABYLON.Vector3(0, -1, 0), Math.PI / 3, 1, this.scene);
        this.spotLight.shadowMinZ = 1;
        this.spotLight.shadowMaxZ = 3;
        this.skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", { diameter: 20, sideOrientation: BABYLON.Mesh.BACKSIDE }, this.scene);
        this.skybox.layerMask = 0x10000000;
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        let skyTexture = new BABYLON.Texture("./datas/skyboxes/city_night_low_res.png");
        skyboxMaterial.diffuseTexture = skyTexture;
        skyboxMaterial.diffuseColor.copyFromFloats(0.25, 0.25, 0.25);
        skyboxMaterial.emissiveColor.copyFromFloats(0.25, 0.25, 0.25);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        this.skybox.material = skyboxMaterial;
        this.skybox.rotation.y = 0.16 * Math.PI;
        this.camera = new BABYLON.ArcRotateCamera("camera", this.targetCamAlpha, this.targetCamBeta, this.targetCamRadius, this.targetCamTarget.clone());
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
                let target = JSON.parse(window.localStorage.getItem("camera-target"));
                this.camera.target.x = target.x;
                this.camera.target.y = target.y;
                this.camera.target.z = target.z;
            }
            if (window.localStorage.getItem("camera-position")) {
                let positionItem = JSON.parse(window.localStorage.getItem("camera-position"));
                let position = new BABYLON.Vector3(positionItem.x, positionItem.y, positionItem.z);
                this.camera.setPosition(position);
            }
        }
        this.camera.attachControl();
        this.camera.getScene();
        if (this.config.getValue("graphicQ") > 0) {
            this.room = new Core.Room(this);
        }
        this.machine = new Core.Machine(this);
        this.machineEditor = new MachineEditor(this);
        if (this.DEBUG_USE_LOCAL_STORAGE) {
            let dataString = localStorage.getItem("last-saved-machine");
            if (dataString) {
                let data = JSON.parse(dataString);
                if (data) {
                    this.machine.deserialize(data);
                }
                else {
                    this.machine.deserialize(testChallenge);
                }
            }
            else {
                this.machine.deserialize(testChallenge);
            }
        }
        else {
            let dataResponse = await fetch("./datas/demos/demo-6.json");
            if (dataResponse) {
                let data = await dataResponse.json();
                if (data) {
                    this.machine.deserialize(myTest);
                }
            }
        }
        let screenshotButton = document.querySelector("#toolbar-screenshot");
        screenshotButton.addEventListener("click", () => {
            this.makeCircuitScreenshot();
        });
        this.mode = GameMode.Home;
        this.logo = new Logo(this);
        this.logo.initialize();
        this.logo.hide();
        this.creditsPage = new CreditsPage(this);
        this.creditsPage.hide();
        this.topbar = new Topbar(this);
        this.topbar.initialize();
        this.topbar.resize();
        this.toolbar = new Toolbar(this);
        this.toolbar.initialize();
        this.toolbar.resize();
        this.challenge = new Challenge(this);
        await this.machine.generateBaseMesh();
        await this.machine.instantiate();
        if (this.room) {
            await this.room.instantiate();
        }
        this.router = new MarbleRouter(this);
        this.router.initialize();
        this.router.optionsPage.setConfiguration(this.config);
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
        if (this.DEBUG_MODE) {
            document.addEventListener("keydown", async (event) => {
                //await this.makeScreenshot("wall-3.3");
                //await this.makeScreenshot("split");
                if (event.code === "KeyP") {
                    let doTrackMini = false;
                    let e = document.getElementById("screenshot-frame");
                    if (e.style.display != "block") {
                        e.style.display = "block";
                    }
                    else {
                        if (doTrackMini) {
                            let parts = [
                                "ramp-1.1.1",
                                "ramp-1.1.1_X", "ramp-1.0.1", "ramp-1.2.1",
                                "uturn-0.2_X", "ramp-2.1.1", "uturn-0.3",
                                "spiral-1.3.2", "join",
                                "uturn-0.2", "ramp-1.5.1_X", "ramp-2.6.1"
                            ];
                            parts = Core.TrackNames;
                            for (let i = 0; i < parts.length; i++) {
                                await this.makeScreenshot(parts[i]);
                            }
                        }
                        else {
                            this.makeCircuitScreenshot();
                        }
                    }
                }
            });
        }
        this.canvas.addEventListener("pointerdown", this.onPointerDown);
        this.canvas.addEventListener("pointerup", this.onPointerUp);
        this.canvas.addEventListener("wheel", this.onWheelEvent);
    }
    animate() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
            this.update();
        });
        window.onresize = () => {
            this.screenRatio = this.engine.getRenderWidth() / this.engine.getRenderHeight();
            this.engine.resize();
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.screenRatio = this.engine.getRenderWidth() / this.engine.getRenderHeight();
                    this.engine.resize();
                    this.topbar.resize();
                    this.toolbar.resize();
                    if (this.router) {
                        if (this.router.homePage) {
                            this.router.homePage.resize();
                        }
                        if (this.router.challengePage) {
                            this.router.challengePage.resize();
                        }
                    }
                });
            });
        };
    }
    async initialize() {
    }
    update() {
        let dt = this.scene.deltaTime / 1000;
        if (this.DEBUG_MODE) {
            let camPos = this.camera.position;
            let camTarget = this.camera.target;
            window.localStorage.setItem("camera-position", JSON.stringify({ x: camPos.x, y: camPos.y, z: camPos.z }));
            window.localStorage.setItem("camera-target", JSON.stringify({ x: camTarget.x, y: camTarget.y, z: camTarget.z }));
        }
        if (this.cameraMode != CameraMode.None && this.cameraMode != CameraMode.Selected && isFinite(dt)) {
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
            let target = BABYLON.Vector3.Lerp(this.camera.target, camTarget, this._trackTargetCamSpeed * dt);
            let alpha = Nabu.Step(this.camera.alpha, this.targetCamAlpha, Math.PI * speed * dt);
            let beta = Nabu.Step(this.camera.beta, this.targetCamBeta, Math.PI * speed * dt);
            let radius = Nabu.Step(this.camera.radius, this.targetCamRadius, 10 * speed * dt);
            this.camera.target.copyFrom(target);
            this.camera.alpha = alpha;
            this.camera.beta = beta;
            this.camera.radius = radius;
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
        if (this.cameraMode === CameraMode.None) {
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
        if (this.machineEditor) {
            this.machineEditor.update();
        }
        if (this.machine) {
            this.machine.update();
        }
        if (this.challenge && this.mode === GameMode.Challenge) {
            this.challenge.update(dt);
        }
        let fps = 1 / dt;
        if (isFinite(fps)) {
            if (fps < 24 && this.timeFactor > this.targetTimeFactor / 2) {
                this.timeFactor *= 0.9;
            }
            else {
                this.timeFactor = this.timeFactor * 0.9 + this.targetTimeFactor * 0.1;
            }
            if (this.config.getValue("autoGraphicQ") && (this.mode === GameMode.Home || this.mode === GameMode.Demo)) {
                this.averagedFPS = 0.99 * this.averagedFPS + 0.01 * fps;
                if (this.averagedFPS < 24 && this.config.getValue("graphicQ") > 0) {
                    if (this.updateConfigTimeout === -1) {
                        this.updateConfigTimeout = setTimeout(() => {
                            if (this.config.getValue("autoGraphicQ") && (this.mode === GameMode.Home || this.mode === GameMode.Demo)) {
                                let newConfig = this.config.getValue("graphicQ") - 1;
                                this.config.setValue("graphicQ", newConfig, true);
                                this.showGraphicAutoUpdateAlert();
                            }
                            this.updateConfigTimeout = -1;
                        }, 5000);
                    }
                }
                else if (this.averagedFPS > 58 && this.config.getValue("graphicQ") < 2) {
                    if (this.updateConfigTimeout === -1) {
                        this.updateConfigTimeout = setTimeout(() => {
                            if (this.config.getValue("autoGraphicQ") && (this.mode === GameMode.Home || this.mode === GameMode.Demo)) {
                                let newConfig = this.config.getValue("graphicQ") + 1;
                                this.config.setValue("graphicQ", newConfig, true);
                                this.showGraphicAutoUpdateAlert();
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
        }
    }
    async makeScreenshot(objectName) {
        this.machine.setBaseIsVisible(false);
        this.skybox.isVisible = false;
        if (this.room) {
            this.room.ground.position.y = 100;
        }
        this.scene.clearColor = BABYLON.Color4.FromHexString("#272B2EFF");
        this.camera.alpha = -0.9 * Math.PI / 2;
        this.camera.beta = 0.85 * Math.PI / 2;
        return new Promise(resolve => {
            requestAnimationFrame(async () => {
                this.machine.dispose();
                let track;
                let ball;
                if (objectName === "ball") {
                    ball = new Core.Ball(BABYLON.Vector3.Zero(), this.machine);
                    this.camera.target.copyFromFloats(0, 0, 0);
                    this.camera.radius = 0.1;
                }
                else {
                    let mirrorX = false;
                    if (objectName.startsWith("wall")) {
                        mirrorX = true;
                    }
                    track = this.machine.trackFactory.createTrack(objectName, {
                        i: 0,
                        j: 0,
                        k: 0,
                        mirrorX: mirrorX
                    });
                    track.sleepersMeshProp = {};
                }
                if (objectName.startsWith("spiral") || objectName.startsWith("wall")) {
                    this.camera.target.x -= Core.tileWidth * 0.1;
                    this.camera.target.y -= Core.tileHeight * 0.6;
                    this.camera.radius += 0.1;
                }
                if (track) {
                    this.machine.parts = [track];
                }
                if (ball) {
                    this.machine.balls = [ball];
                }
                await this.machine.instantiate();
                let w = track.w * Core.tileWidth;
                let h = (track.h + 1) * Core.tileHeight;
                let d = track.d * Core.tileDepth;
                let x0 = -Core.tileWidth * 0.5;
                let y1 = Core.tileHeight * 0.5;
                let z1 = Core.tileDepth * 0.5;
                let x1 = x0 + w;
                let y0 = y1 - h;
                let z0 = z1 - d;
                let lines = [];
                lines.push([new BABYLON.Vector3(x0, y0, z0), new BABYLON.Vector3(x1, y0, z0)]);
                lines.push([new BABYLON.Vector3(x0, y0, z1), new BABYLON.Vector3(x1, y0, z1)]);
                lines.push([new BABYLON.Vector3(x0, y0, z0), new BABYLON.Vector3(x0, y1, z0)]);
                lines.push([new BABYLON.Vector3(x0, y0, z1), new BABYLON.Vector3(x0, y1, z1)]);
                for (let y = y0; y <= y1; y += Core.tileHeight) {
                    lines.push([new BABYLON.Vector3(x0, y, z0), new BABYLON.Vector3(x0, y, z1)]);
                }
                for (let x = x0 + Core.tileWidth; x <= x1; x += Core.tileWidth) {
                    lines.push([new BABYLON.Vector3(x, y0, z0), new BABYLON.Vector3(x, y0, z1)]);
                }
                let encloseMesh = new BABYLON.Mesh("test");
                encloseMesh.parent = track;
                let shape = [];
                for (let i = 0; i < 8; i++) {
                    let a = i / 8 * 2 * Math.PI;
                    let cosa = Math.cos(a);
                    let sina = Math.sin(a);
                    shape[i] = new BABYLON.Vector3(cosa * 0.001, sina * 0.001, 0);
                }
                for (let i = 0; i < lines.length; i++) {
                    let wire = BABYLON.ExtrudeShape("wire", { shape: shape, path: lines[i], closeShape: true, cap: BABYLON.Mesh.CAP_ALL });
                    wire.material = this.materials.ghostMaterial;
                    wire.parent = encloseMesh;
                }
                let diag = Math.sqrt(w * w + h * h + d * d);
                this.camera.radius = 0 + Math.sqrt(diag) * 0.8;
                this.camera.target.copyFromFloats(0.5 * x0 + 0.5 * x1, 0.7 * y0 + 0.3 * y1, (z0 + z1) * 0.5);
                requestAnimationFrame(async () => {
                    await Mummu.MakeScreenshot({ miniatureName: objectName, size: 256 });
                    resolve();
                });
            });
        });
    }
    async makeCircuitScreenshot() {
        this.machine.setBaseIsVisible(false);
        this.skybox.isVisible = false;
        if (this.room) {
            this.room.ground.position.y = 100;
        }
        this.scene.clearColor.copyFromFloats(0, 0, 0, 0);
        this.machine.parts.forEach(part => {
            part.sleepersMeshProp = {};
            part.doSleepersMeshUpdate();
        });
        return new Promise(resolve => {
            requestAnimationFrame(async () => {
                await Mummu.MakeScreenshot({ miniatureName: "circuit", size: 512, outlineWidth: 2 });
                this.machine.setBaseIsVisible(true);
                this.skybox.isVisible = true;
                this.scene.clearColor = BABYLON.Color4.FromHexString("#272b2e");
                resolve();
            });
        });
    }
    updateCameraLayer() {
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
            if (this.config.getValue("graphicQ") > 0) {
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
    updateShadowGenerator() {
        if (this.camera) {
            if (this.config.getValue("graphicQ") > 1 && !this.shadowGenerator) {
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
        let f = 1 - (this.camera.radius - this.camera.lowerRadiusLimit) / (this.camera.upperRadiusLimit - this.camera.lowerRadiusLimit);
        return f * f;
    }
    setCameraZoomFactor(v) {
        let f = Math.sqrt(v);
        this.camera.radius = (1 - f) * (this.camera.upperRadiusLimit - this.camera.lowerRadiusLimit) + this.camera.lowerRadiusLimit;
    }
    setCameraMode(camMode) {
        if (camMode >= CameraMode.None && camMode <= CameraMode.Landscape) {
            this.cameraMode = camMode;
            if (this.cameraMode == CameraMode.None) {
            }
            else {
                if (this.cameraMode === CameraMode.Ball) {
                    this.targetCamRadius = 0.3;
                }
                else {
                    let encloseStart = this.machine.getEncloseStart();
                    let encloseEnd = this.machine.getEncloseEnd();
                    let size = BABYLON.Vector3.Distance(encloseStart, encloseEnd);
                    this.targetCamTarget.copyFrom(encloseStart.add(encloseEnd).scale(0.5));
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
            distW *= 3.5;
            distH *= 2.5;
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
        else if (this.config.getValue("graphicQ") === 0) {
            alert.innerText = "Graphic Quality set to LOW";
        }
        else if (this.config.getValue("graphicQ") === 1) {
            alert.innerText = "Graphic Quality set to MEDIUM";
        }
        else if (this.config.getValue("graphicQ") === 2) {
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
}
window.addEventListener("DOMContentLoaded", async () => {
    //addLine("Kulla Test Scene");
    let main = new Game("render-canvas");
    await main.createScene();
    main.initialize().then(() => {
        main.animate();
    });
});
class MainMaterials {
    constructor(game) {
        this.game = game;
        this.metalMaterials = [];
        this.handleMaterial = new BABYLON.StandardMaterial("handle-material");
        this.handleMaterial.diffuseColor.copyFromFloats(0, 0, 0);
        this.handleMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.handleMaterial.alpha = 1;
        this.ghostMaterial = new BABYLON.StandardMaterial("ghost-material");
        this.ghostMaterial.diffuseColor.copyFromFloats(0.8, 0.8, 1);
        this.ghostMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.ghostMaterial.alpha = 0.3;
        this.gridMaterial = new BABYLON.StandardMaterial("grid-material");
        this.gridMaterial.diffuseColor.copyFromFloats(0, 0, 0);
        this.gridMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.gridMaterial.alpha = this.game.config.getValue("gridOpacity");
        this.cyanMaterial = new BABYLON.StandardMaterial("cyan-material");
        this.cyanMaterial.diffuseColor = BABYLON.Color3.FromHexString("#00FFFF");
        this.cyanMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.redMaterial = new BABYLON.StandardMaterial("red-material");
        this.redMaterial.diffuseColor = BABYLON.Color3.FromHexString("#bf212f");
        this.redMaterial.emissiveColor = BABYLON.Color3.FromHexString("#bf212f");
        this.redMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.greenMaterial = new BABYLON.StandardMaterial("green-material");
        this.greenMaterial.diffuseColor = BABYLON.Color3.FromHexString("#006f3c");
        this.greenMaterial.emissiveColor = BABYLON.Color3.FromHexString("#006f3c");
        this.greenMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.blueMaterial = new BABYLON.StandardMaterial("blue-material");
        this.blueMaterial.diffuseColor = BABYLON.Color3.FromHexString("#264b96");
        this.blueMaterial.emissiveColor = BABYLON.Color3.FromHexString("#264b96");
        this.blueMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.whiteAutolitMaterial = new BABYLON.StandardMaterial("white-autolit-material");
        this.whiteAutolitMaterial.diffuseColor = BABYLON.Color3.FromHexString("#baccc8");
        this.whiteAutolitMaterial.emissiveColor = BABYLON.Color3.FromHexString("#baccc8").scaleInPlace(0.5);
        this.whiteAutolitMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.whiteFullLitMaterial = new BABYLON.StandardMaterial("white-autolit-material");
        this.whiteFullLitMaterial.diffuseColor = BABYLON.Color3.FromHexString("#baccc8");
        this.whiteFullLitMaterial.emissiveColor = BABYLON.Color3.FromHexString("#baccc8");
        this.whiteFullLitMaterial.specularColor.copyFromFloats(0, 0, 0);
        let steelMaterial = new BABYLON.PBRMetallicRoughnessMaterial("pbr", this.game.scene);
        steelMaterial.baseColor = new BABYLON.Color3(0.5, 0.75, 1.0);
        steelMaterial.metallic = 1.0;
        steelMaterial.roughness = 0.15;
        steelMaterial.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./datas/environment/environmentSpecular.env", this.game.scene);
        let copperMaterial = new BABYLON.PBRMetallicRoughnessMaterial("pbr", this.game.scene);
        copperMaterial.baseColor = BABYLON.Color3.FromHexString("#B87333");
        copperMaterial.metallic = 1.0;
        copperMaterial.roughness = 0.15;
        copperMaterial.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./datas/environment/environmentSpecular.env", this.game.scene);
        this.metalMaterials = [steelMaterial, copperMaterial];
        this.velvetMaterial = new BABYLON.StandardMaterial("velvet-material");
        this.velvetMaterial.diffuseColor.copyFromFloats(0.75, 0.75, 0.75);
        this.velvetMaterial.diffuseTexture = new BABYLON.Texture("./lib/marble-run-simulator-core/datas/textures/velvet.jpg");
        this.velvetMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.logoMaterial = new BABYLON.StandardMaterial("logo-material");
        this.logoMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.logoMaterial.diffuseTexture = new BABYLON.Texture("./datas/icons/logo-white-no-bg.png");
        this.logoMaterial.diffuseTexture.hasAlpha = true;
        this.logoMaterial.useAlphaFromDiffuseTexture = true;
        this.logoMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
        this.logoMaterial.alpha = 0.3;
        this.baseAxisMaterial = new BABYLON.StandardMaterial("logo-material");
        this.baseAxisMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.baseAxisMaterial.diffuseTexture = new BABYLON.Texture("./lib/marble-run-simulator-core/datas/textures/axis.png");
        this.baseAxisMaterial.diffuseTexture.hasAlpha = true;
        this.baseAxisMaterial.useAlphaFromDiffuseTexture = true;
        this.baseAxisMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
        this.leatherMaterial = new BABYLON.StandardMaterial("leather-material");
        this.leatherMaterial.diffuseColor.copyFromFloats(0.05, 0.02, 0.02);
        this.leatherMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
        this.whiteMaterial = new BABYLON.StandardMaterial("white-material");
        this.whiteMaterial.diffuseColor.copyFromFloats(0.9, 0.95, 1).scaleInPlace(0.9);
        this.whiteMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
        this.paintingLight = new BABYLON.StandardMaterial("autolit-material");
        this.paintingLight.diffuseColor.copyFromFloats(1, 1, 1);
        this.paintingLight.emissiveTexture = new BABYLON.Texture("./lib/marble-run-simulator-core/datas/textures/painting-light.png");
        this.paintingLight.specularColor.copyFromFloats(0.1, 0.1, 0.1);
    }
    getMetalMaterial(colorIndex) {
        return this.metalMaterials[colorIndex % this.metalMaterials.length];
    }
}
class MarbleConfiguration extends Nabu.Configuration {
    constructor(configName, game) {
        super(configName);
        this.game = game;
        this.overrideConfigurationElementCategoryName = [
            '<i18n-text text-key="option-cat-gameplay"></i18n-text>',
            '<i18n-text text-key="option-cat-graphic"></i18n-text>',
            '<i18n-text text-key="option-cat-control"></i18n-text>',
            '<i18n-text text-key="option-cat-ui"></i18n-text>',
            '<i18n-text text-key="option-cat-dev"></i18n-text>'
        ];
    }
    _buildElementsArray() {
        this.configurationElements = [
            new Nabu.ConfigurationElement("lang", Nabu.ConfigurationElementType.Enum, I18NTextLangs.English, Nabu.ConfigurationElementCategory.UI, {
                displayName: '<i18n-text text-key="option-lang"></i18n-text>',
                min: I18NTextLangs.English,
                max: I18NTextLangs.MAXIMUM - 1,
                toString: (v) => {
                    return I18NTextLangNames[v].toLocaleUpperCase();
                }
            }, (newValue) => {
                I18NText.SetCurrentLang(newValue);
            }),
            new Nabu.ConfigurationElement("handleSize", Nabu.ConfigurationElementType.Number, 1, Nabu.ConfigurationElementCategory.UI, {
                displayName: '<i18n-text text-key="option-handleSize"></i18n-text>',
                min: 0,
                max: 3,
                step: 0.1,
                toString: (v) => {
                    return v.toFixed(1);
                }
            }, (newValue) => {
                if (this.game.machineEditor) {
                    this.game.machineEditor.handles.forEach(handle => {
                        handle.size = newValue;
                    });
                }
            }),
            new Nabu.ConfigurationElement("uiSize", Nabu.ConfigurationElementType.Number, 1, Nabu.ConfigurationElementCategory.UI, {
                displayName: '<i18n-text text-key="option-uiSize"></i18n-text>',
                min: 0.8,
                max: 2,
                step: 0.05,
                toString: (v) => {
                    return v.toFixed(2);
                }
            }, (newValue) => {
                var r = document.querySelector(':root');
                r.style.setProperty("--ui-size", (newValue * 100).toFixed(0) + "%");
            }),
            new Nabu.ConfigurationElement("gridOpacity", Nabu.ConfigurationElementType.Number, 0.5, Nabu.ConfigurationElementCategory.UI, {
                displayName: '<i18n-text text-key="option-gridOpacity"></i18n-text>',
                min: 0,
                max: 1,
                step: 0.1,
                toString: (v) => {
                    return v.toFixed(1);
                }
            }, (newValue) => {
                if (this.game.materials && this.game.materials.gridMaterial) {
                    this.game.materials.gridMaterial.alpha = newValue;
                }
            }),
            new Nabu.ConfigurationElement("autoGraphicQ", Nabu.ConfigurationElementType.Boolean, 0, Nabu.ConfigurationElementCategory.Graphic, {
                displayName: '<i18n-text text-key="option-autoGraphicQ"></i18n-text>',
            }),
            new Nabu.ConfigurationElement("graphicQ", Nabu.ConfigurationElementType.Enum, 0, Nabu.ConfigurationElementCategory.Graphic, {
                displayName: '<i18n-text text-key="option-graphicQ"></i18n-text>',
                min: 0,
                max: 2,
                toString: (v) => {
                    if (v === 0) {
                        return "LOW";
                    }
                    if (v === 1) {
                        return "MEDIUM";
                    }
                    if (v === 2) {
                        return "HIGH";
                    }
                }
            }, (newValue, oldValue, fromUI) => {
                if (this.game.machine) {
                    let data = this.game.machine.serialize();
                    this.game.machine.dispose();
                    this.game.machine.deserialize(data);
                    this.game.machine.instantiate();
                }
                if (this.game.room) {
                    this.game.room.dispose();
                }
                if (newValue > 0) {
                    this.game.room = new Core.Room(this.game);
                    this.game.room.instantiate();
                }
                this.game.updateCameraLayer();
                this.game.updateShadowGenerator();
                if (fromUI) {
                    this.setValue("autoGraphicQ", 0, true);
                }
            })
        ];
    }
    getValue(property) {
        let configElement = this.configurationElements.find(e => { return e.property === property; });
        if (configElement) {
            return configElement.value;
        }
    }
}
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
        this.style.zIndex = "10";
    }
    async show(duration = 1) {
        return new Promise(resolve => {
            if (!this._shown) {
                clearInterval(this._animateOpacityInterval);
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
                            setTimeout(() => {
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
        return new Promise(resolve => {
            if (this._shown) {
                clearInterval(this._animateOpacityInterval);
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
class MachineEditor {
    constructor(game) {
        this.game = game;
        this.items = new Map();
        this.showManipulators = false;
        this.showDisplacers = true;
        this.handles = [];
        this.smallHandleSize = 0.02;
        this._selectedItem = "";
        this._dragOffset = BABYLON.Vector3.Zero();
        this._majDown = false;
        this._ctrlDown = false;
        this.selectedObjects = [];
        this._pointerDownX = 0;
        this._pointerDownY = 0;
        this.pointerDown = (event) => {
            this._pointerDownX = this.game.scene.pointerX;
            this._pointerDownY = this.game.scene.pointerY;
            // First, check for handle pick
            if (!this.draggedObject) {
                let pickHandle = this.game.scene.pick(this.game.scene.pointerX, this.game.scene.pointerY, (mesh) => {
                    if (mesh instanceof Arrow && mesh.isVisible) {
                        return true;
                    }
                    return false;
                });
                if (pickHandle.hit && pickHandle.pickedMesh instanceof Arrow) {
                    return;
                }
            }
            if (this.selectedObject) {
                let pick = this.game.scene.pick(this.game.scene.pointerX, this.game.scene.pointerY, (mesh) => {
                    if (mesh instanceof Core.MachinePartSelectorMesh && mesh.part === this.selectedObject) {
                        return true;
                    }
                    return false;
                });
                if (!pick.hit) {
                    pick = this.game.scene.pick(this.game.scene.pointerX, this.game.scene.pointerY, (mesh) => {
                        if (!this.challengeMode && mesh instanceof Core.BallGhost) {
                            return true;
                        }
                        return false;
                    });
                }
                if (!pick.hit) {
                    pick = this.game.scene.pick(this.game.scene.pointerX, this.game.scene.pointerY, (mesh) => {
                        if (mesh instanceof Core.MachinePartSelectorMesh && !(this.challengeMode && !mesh.part.isSelectable)) {
                            return true;
                        }
                        return false;
                    });
                }
                if (pick.hit) {
                    let pickedObject;
                    if (pick.pickedMesh instanceof Core.BallGhost) {
                        pickedObject = pick.pickedMesh.ball;
                    }
                    else if (pick.pickedMesh instanceof Core.MachinePartSelectorMesh) {
                        pickedObject = pick.pickedMesh.part;
                    }
                    if (!this._majDown && this.selectedObjects.indexOf(pickedObject) != -1) {
                        pick = this.game.scene.pick(this.game.scene.pointerX, this.game.scene.pointerY, (mesh) => {
                            if (mesh === this.grid.opaquePlane) {
                                return true;
                            }
                        });
                        if (pick.hit && pick.pickedPoint) {
                            if (pickedObject instanceof Core.MachinePart) {
                                this._dragOffset.copyFrom(pickedObject.position).subtractInPlace(pick.pickedPoint);
                            }
                            else if (pickedObject instanceof Core.Ball) {
                                this._dragOffset.copyFrom(pickedObject.positionZero).subtractInPlace(pick.pickedPoint);
                            }
                        }
                        else {
                            this._dragOffset.copyFromFloats(0, 0, 0);
                        }
                        this.setDraggedObject(pickedObject);
                    }
                }
            }
        };
        this.pointerMove = (event) => {
            if (this.draggedObject) {
                let pick = this.game.scene.pick(this.game.scene.pointerX, this.game.scene.pointerY, (mesh) => {
                    if (mesh === this.grid.opaquePlane) {
                        return true;
                    }
                });
                if (pick.hit && pick.pickedMesh === this.grid.opaquePlane) {
                    let point = pick.pickedPoint.add(this._dragOffset);
                    if (this.draggedObject instanceof Core.MachinePart) {
                        let i = Math.round(point.x / Core.tileWidth);
                        let j = Math.floor((-point.y + 0.25 * Core.tileHeight) / Core.tileHeight);
                        let k = Math.round(-point.z / Core.tileDepth);
                        let di = i - this.draggedObject.i;
                        let dj = j - this.draggedObject.j;
                        let dk = k - this.draggedObject.k;
                        if (di != 0 || dj != 0 || dk != 0) {
                            for (let n = 0; n < this.selectedObjects.length; n++) {
                                let selectedObject = this.selectedObjects[n];
                                if (selectedObject instanceof Core.MachinePart && selectedObject != this.draggedObject) {
                                    selectedObject.setI(selectedObject.i + di);
                                    selectedObject.setJ(selectedObject.j + dj);
                                    selectedObject.setK(selectedObject.k + dk);
                                }
                            }
                            this.draggedObject.setI(i);
                            this.draggedObject.setJ(j);
                            this.draggedObject.setK(k);
                            this.draggedObject.setIsVisible(true);
                            this.updateFloatingElements();
                            if (this._dragOffset.lengthSquared() > 0) {
                                this.grid.position.copyFrom(this.draggedObject.position);
                            }
                        }
                    }
                    else if (this.draggedObject instanceof Core.Ball) {
                        let p = point.clone();
                        this.draggedObject.setPositionZero(p);
                        this.draggedObject.setIsVisible(true);
                        this.updateFloatingElements();
                        if (!this.machine.playing) {
                            this.draggedObject.reset();
                        }
                    }
                }
                else if (pick.hit && pick.pickedMesh instanceof Core.MachinePartSelectorMesh && this.draggedObject instanceof Core.MachinePart) {
                    // Not working
                    let n = pick.getNormal(true);
                    if (Math.abs(n.x) > 0) {
                        let point = pick.pickedPoint;
                        let i = Math.round(point.x / Core.tileWidth);
                        let j = Math.floor((-point.y + 0.25 * Core.tileHeight) / Core.tileHeight);
                        if (i != this.draggedObject.i || j != this.draggedObject.j) {
                            this.draggedObject.setI(i);
                            this.draggedObject.setJ(j);
                            this.draggedObject.setK(pick.pickedMesh.part.k);
                            this.draggedObject.setIsVisible(true);
                            this.updateFloatingElements();
                        }
                    }
                }
                else {
                    this.draggedObject.setIsVisible(false);
                }
            }
        };
        this.pointerUp = (event) => {
            // First, check for handle pick
            let dx = (this._pointerDownX - this.game.scene.pointerX);
            let dy = (this._pointerDownY - this.game.scene.pointerY);
            let clickInPlace = dx * dx + dy * dy < 10;
            if (!this.draggedObject) {
                let pickHandle = this.game.scene.pick(this.game.scene.pointerX, this.game.scene.pointerY, (mesh) => {
                    if (mesh instanceof Arrow && mesh.isVisible) {
                        return true;
                    }
                    return false;
                });
                if (pickHandle.hit && pickHandle.pickedMesh instanceof Arrow) {
                    pickHandle.pickedMesh.onClick();
                    return;
                }
            }
            let pick = this.game.scene.pick(this.game.scene.pointerX, this.game.scene.pointerY, (mesh) => {
                if (!this.challengeMode && !this.draggedObject && mesh instanceof Core.BallGhost) {
                    return true;
                }
                else if (this.draggedObject && mesh === this.grid.opaquePlane) {
                    return true;
                }
                return false;
            });
            if (!pick.hit) {
                pick = this.game.scene.pick(this.game.scene.pointerX, this.game.scene.pointerY, (mesh) => {
                    if (!this.draggedObject && mesh instanceof Core.MachinePartSelectorMesh && !(this.challengeMode && !mesh.part.isSelectable)) {
                        return true;
                    }
                    else if (this.draggedObject && mesh === this.grid.opaquePlane) {
                        return true;
                    }
                    return false;
                });
            }
            if (pick.hit) {
                if (this.draggedObject instanceof Core.MachinePart) {
                    let draggedTrack = this.draggedObject;
                    for (let i = 0; i < this.selectedObjects.length; i++) {
                        let selectedObject = this.selectedObjects[i];
                        if (selectedObject instanceof Core.MachinePart && selectedObject != draggedTrack) {
                            selectedObject.generateWires();
                            selectedObject.instantiate(true).then(() => {
                                selectedObject.recomputeAbsolutePath();
                            });
                        }
                    }
                    if (this.machine.parts.indexOf(draggedTrack) === -1) {
                        this.machine.parts.push(draggedTrack);
                    }
                    draggedTrack.setIsVisible(true);
                    draggedTrack.generateWires();
                    draggedTrack.instantiate(true).then(() => {
                        draggedTrack.recomputeAbsolutePath();
                        this.setSelectedObject(draggedTrack);
                        this.setDraggedObject(undefined);
                        this.setSelectedItem("");
                    });
                    this.machine.generateBaseMesh();
                }
                else if (this.draggedObject instanceof Core.Ball) {
                    if (this.machine.balls.indexOf(this.draggedObject) === -1) {
                        this.machine.balls.push(this.draggedObject);
                    }
                    this.draggedObject.setIsVisible(true);
                    this.draggedObject.reset();
                    this.setSelectedObject(this.draggedObject);
                    this.setDraggedObject(undefined);
                    this.setSelectedItem("");
                }
                else {
                    if (clickInPlace) {
                        if (pick.pickedMesh instanceof Core.BallGhost) {
                            this.setSelectedObject(pick.pickedMesh.ball);
                        }
                        else if (pick.pickedMesh instanceof Core.MachinePartSelectorMesh) {
                            if (this._majDown) {
                                this.addOrRemoveSelectedObjects(pick.pickedMesh.part);
                            }
                            else {
                                this.setSelectedObject(pick.pickedMesh.part);
                            }
                        }
                    }
                }
            }
            else {
                let dx = (this._pointerDownX - this.game.scene.pointerX);
                let dy = (this._pointerDownY - this.game.scene.pointerY);
                if (clickInPlace) {
                    this.setSelectedObject(undefined);
                }
            }
        };
        this.actionTileSize = 0.018;
        this._onKeyDown = (event) => {
            if (event.code === "ShiftLeft") {
                this._majDown = true;
            }
            else if (event.code === "ControlLeft") {
                this._ctrlDown = true;
            }
            else if (this._ctrlDown && event.key === "a") {
                this.setSelectedObject(undefined);
                this.addOrRemoveSelectedObjects(...this.machine.parts);
            }
            else if (event.key === "x" || event.key === "Delete") {
                this._onDelete();
            }
            else if (event.key === "m") {
                if (this.draggedObject && this.draggedObject instanceof Core.MachinePart) {
                    this.mirrorXTrackInPlace(this.draggedObject).then(track => {
                        this.setDraggedObject(track);
                    });
                }
                else if (this.selectedObject && this.selectedObject instanceof Core.MachinePart) {
                    this.mirrorXTrackInPlace(this.selectedObject).then(track => {
                        this.setSelectedObject(track);
                    });
                }
            }
            else if (event.code === "KeyW") {
                this._onJMinus();
            }
            else if (event.code === "KeyA") {
                this._onIMinus();
            }
            else if (event.code === "KeyS") {
                this._onJPlus();
            }
            else if (event.code === "KeyD") {
                this._onIPlus();
            }
            else if (event.code === "KeyQ") {
                this._onKMinus();
            }
            else if (event.code === "KeyE") {
                this._onKPlus();
            }
            else if (event.code === "Space") {
                this._onFocus();
            }
        };
        this._onKeyUp = (event) => {
            if (event.code === "ShiftLeft") {
                this._majDown = false;
            }
            else if (event.code === "ControlLeft") {
                this._ctrlDown = false;
            }
        };
        this._onHPlusTop = async () => {
            let track = this.selectedObject;
            if (track instanceof Core.MachinePart && track.yExtendable) {
                let h = track.h + 1;
                let j = track.j - 1;
                let editedTrack = await this.editTrackInPlace(track, { j: j });
                this.setSelectedObject(editedTrack);
            }
        };
        this._onHMinusTop = async () => {
            let track = this.selectedObject;
            if (track instanceof Core.MachinePart && track.yExtendable) {
                let h = track.h - 1;
                let j = track.j + 1;
                if (h >= 0) {
                    let editedTrack = await this.editTrackInPlace(track, { j: j });
                    this.setSelectedObject(editedTrack);
                }
            }
        };
        this._onWPlusRight = async () => {
            let track = this.selectedObject;
            if (track instanceof Core.MachinePart && track.xExtendable) {
                let w = track.w + 1;
                let editedTrack = await this.editTrackInPlace(track, { w: w });
                this.setSelectedObject(editedTrack);
            }
        };
        this._onWMinusRight = async () => {
            let track = this.selectedObject;
            if (track instanceof Core.MachinePart && track.xExtendable) {
                let w = track.w - 1;
                if (w >= 1) {
                    let editedTrack = await this.editTrackInPlace(track, { w: w });
                    this.setSelectedObject(editedTrack);
                }
            }
        };
        this._onHPlusBottom = async () => {
            let track = this.selectedObject;
            if (track instanceof Core.MachinePart && track.yExtendable) {
                let h = track.h + 1;
                let editedTrack = await this.editTrackInPlace(track, { h: h });
                this.setSelectedObject(editedTrack);
            }
        };
        this._onHMinusBottom = async () => {
            let track = this.selectedObject;
            if (track instanceof Core.MachinePart && track.yExtendable) {
                let h = track.h - 1;
                if (h >= 0) {
                    let editedTrack = await this.editTrackInPlace(track, { h: h });
                    this.setSelectedObject(editedTrack);
                }
            }
        };
        this._onWPlusLeft = async () => {
            let track = this.selectedObject;
            if (track instanceof Core.MachinePart && track.xExtendable) {
                let i = track.i - 1;
                let w = track.w + 1;
                let editedTrack = await this.editTrackInPlace(track, { i: i });
                this.setSelectedObject(editedTrack);
            }
        };
        this._onWMinusLeft = async () => {
            let track = this.selectedObject;
            if (track instanceof Core.MachinePart && track.xExtendable) {
                let i = track.i + 1;
                let w = track.w - 1;
                if (w >= 1) {
                    let editedTrack = await this.editTrackInPlace(track, { i: i });
                    this.setSelectedObject(editedTrack);
                }
            }
        };
        this._onDPlus = async () => {
            let track = this.selectedObject;
            if (track instanceof Core.MachinePart && track.zExtendable) {
                let d = track.d + 1;
                let editedTrack = await this.editTrackInPlace(track, { d: d });
                this.setSelectedObject(editedTrack);
            }
        };
        this._onDMinus = async () => {
            let track = this.selectedObject;
            if (track instanceof Core.MachinePart && track.zExtendable) {
                let d = track.d - 1;
                if (d >= 1) {
                    let editedTrack = await this.editTrackInPlace(track, { d: d });
                    this.setSelectedObject(editedTrack);
                }
            }
        };
        this._onDelete = async () => {
            this.selectedObjects.forEach(obj => {
                obj.dispose();
            });
            this.setSelectedObject(undefined);
            this.setDraggedObject(undefined);
            this.machine.generateBaseMesh();
        };
        this._onMirrorX = async () => {
            let track = this.selectedObject;
            if (track instanceof Core.MachinePart) {
                let editedTrack = await this.mirrorXTrackInPlace(track);
                this.setSelectedObject(editedTrack);
            }
        };
        this._onMirrorZ = async () => {
            let track = this.selectedObject;
            if (track instanceof Core.MachinePart) {
                let editedTrack = await this.mirrorZTrackInPlace(track);
                this.setSelectedObject(editedTrack);
            }
        };
        this._onOriginIPlus = async () => {
            if (this.selectedObject instanceof Core.MachinePartWithOriginDestination) {
                this.setSelectedObject(await this.editPartOriginDestInPlace(this.selectedObject, { i: 1, j: 0, k: 0 }, { i: 0, j: 0, k: 0 }));
            }
        };
        this._onOriginIMinus = async () => {
            if (this.selectedObject instanceof Core.MachinePartWithOriginDestination) {
                this.setSelectedObject(await this.editPartOriginDestInPlace(this.selectedObject, { i: -1, j: 0, k: 0 }, { i: 0, j: 0, k: 0 }));
            }
        };
        this._onOriginJPlus = async () => {
            if (this.selectedObject instanceof Core.MachinePartWithOriginDestination) {
                this.setSelectedObject(await this.editPartOriginDestInPlace(this.selectedObject, { i: 0, j: 1, k: 0 }, { i: 0, j: 0, k: 0 }));
            }
        };
        this._onOriginJMinus = async () => {
            if (this.selectedObject instanceof Core.MachinePartWithOriginDestination) {
                this.setSelectedObject(await this.editPartOriginDestInPlace(this.selectedObject, { i: 0, j: -1, k: 0 }, { i: 0, j: 0, k: 0 }));
            }
        };
        this._onOriginKPlus = async () => {
            if (this.selectedObject instanceof Core.MachinePartWithOriginDestination) {
                this.setSelectedObject(await this.editPartOriginDestInPlace(this.selectedObject, { i: 0, j: 0, k: 1 }, { i: 0, j: 0, k: 0 }));
            }
        };
        this._onOriginKMinus = async () => {
            if (this.selectedObject instanceof Core.MachinePartWithOriginDestination) {
                this.setSelectedObject(await this.editPartOriginDestInPlace(this.selectedObject, { i: 0, j: 0, k: -1 }, { i: 0, j: 0, k: 0 }));
            }
        };
        this._onDestinationIPlus = async () => {
            if (this.selectedObject instanceof Core.MachinePartWithOriginDestination) {
                this.setSelectedObject(await this.editPartOriginDestInPlace(this.selectedObject, { i: 0, j: 0, k: 0 }, { i: 1, j: 0, k: 0 }));
            }
        };
        this._onDestinationIMinus = async () => {
            if (this.selectedObject instanceof Core.MachinePartWithOriginDestination) {
                this.setSelectedObject(await this.editPartOriginDestInPlace(this.selectedObject, { i: 0, j: 0, k: 0 }, { i: -1, j: 0, k: 0 }));
            }
        };
        this._onDestinationJPlus = async () => {
            if (this.selectedObject instanceof Core.MachinePartWithOriginDestination) {
                this.setSelectedObject(await this.editPartOriginDestInPlace(this.selectedObject, { i: 0, j: 0, k: 0 }, { i: 0, j: 1, k: 0 }));
            }
        };
        this._onDestinationJMinus = async () => {
            if (this.selectedObject instanceof Core.MachinePartWithOriginDestination) {
                this.setSelectedObject(await this.editPartOriginDestInPlace(this.selectedObject, { i: 0, j: 0, k: 0 }, { i: 0, j: -1, k: 0 }));
            }
        };
        this._onDestinationKPlus = async () => {
            if (this.selectedObject instanceof Core.MachinePartWithOriginDestination) {
                this.setSelectedObject(await this.editPartOriginDestInPlace(this.selectedObject, { i: 0, j: 0, k: 0 }, { i: 0, j: 0, k: 1 }));
            }
        };
        this._onDestinationKMinus = async () => {
            if (this.selectedObject instanceof Core.MachinePartWithOriginDestination) {
                this.setSelectedObject(await this.editPartOriginDestInPlace(this.selectedObject, { i: 0, j: 0, k: 0 }, { i: 0, j: 0, k: -1 }));
            }
        };
        this._onIPlus = async () => {
            for (let i = 0; i < this.selectedObjects.length; i++) {
                let selectedTrack = this.selectedObjects[i];
                if (selectedTrack instanceof Core.MachinePart) {
                    selectedTrack.setI(selectedTrack.i + 1);
                    selectedTrack.recomputeAbsolutePath();
                    selectedTrack.generateWires();
                    this.machine.generateBaseMesh();
                    await selectedTrack.instantiate(true);
                    this.grid.position.copyFrom(selectedTrack.position);
                    selectedTrack.recomputeAbsolutePath();
                    selectedTrack.select();
                    if (this.game.cameraMode === CameraMode.Selected) {
                        this._onFocus();
                    }
                }
            }
            this.setDraggedObject(undefined);
            this.setSelectedItem("");
            this.updateFloatingElements();
        };
        this._onIMinus = async () => {
            for (let i = 0; i < this.selectedObjects.length; i++) {
                let selectedTrack = this.selectedObjects[i];
                if (selectedTrack instanceof Core.MachinePart) {
                    selectedTrack.setI(selectedTrack.i - 1);
                    selectedTrack.recomputeAbsolutePath();
                    selectedTrack.generateWires();
                    this.machine.generateBaseMesh();
                    await selectedTrack.instantiate(true);
                    this.grid.position.copyFrom(selectedTrack.position);
                    selectedTrack.recomputeAbsolutePath();
                    selectedTrack.select();
                    if (this.game.cameraMode === CameraMode.Selected) {
                        this._onFocus();
                    }
                }
            }
            this.setDraggedObject(undefined);
            this.setSelectedItem("");
            this.updateFloatingElements();
        };
        this._onJPlus = async () => {
            for (let i = 0; i < this.selectedObjects.length; i++) {
                let selectedTrack = this.selectedObjects[i];
                if (selectedTrack instanceof Core.MachinePart) {
                    selectedTrack.setJ(selectedTrack.j + 1);
                    selectedTrack.recomputeAbsolutePath();
                    selectedTrack.generateWires();
                    this.machine.generateBaseMesh();
                    await selectedTrack.instantiate(true);
                    this.grid.position.copyFrom(selectedTrack.position);
                    selectedTrack.recomputeAbsolutePath();
                    selectedTrack.select();
                    if (this.game.cameraMode === CameraMode.Selected) {
                        this._onFocus();
                    }
                }
            }
            this.setDraggedObject(undefined);
            this.setSelectedItem("");
            this.updateFloatingElements();
        };
        this._onJMinus = async () => {
            for (let i = 0; i < this.selectedObjects.length; i++) {
                let selectedTrack = this.selectedObjects[i];
                if (selectedTrack instanceof Core.MachinePart) {
                    selectedTrack.setJ(selectedTrack.j - 1);
                    selectedTrack.recomputeAbsolutePath();
                    selectedTrack.generateWires();
                    this.machine.generateBaseMesh();
                    await selectedTrack.instantiate(true);
                    this.grid.position.copyFrom(selectedTrack.position);
                    selectedTrack.recomputeAbsolutePath();
                    selectedTrack.select();
                    if (this.game.cameraMode === CameraMode.Selected) {
                        this._onFocus();
                    }
                }
            }
            this.setDraggedObject(undefined);
            this.setSelectedItem("");
            this.updateFloatingElements();
        };
        this._onKPlus = async () => {
            if (this.selectedObject instanceof Core.MachinePart) {
                for (let i = 0; i < this.selectedObjects.length; i++) {
                    let selectedTrack = this.selectedObjects[i];
                    if (selectedTrack instanceof Core.MachinePart) {
                        selectedTrack.setK(selectedTrack.k + 1);
                        selectedTrack.recomputeAbsolutePath();
                        selectedTrack.generateWires();
                        this.machine.generateBaseMesh();
                        await selectedTrack.instantiate(true);
                        this.grid.position.copyFrom(selectedTrack.position);
                        selectedTrack.recomputeAbsolutePath();
                        selectedTrack.select();
                        if (this.game.cameraMode === CameraMode.Selected) {
                            this._onFocus();
                        }
                    }
                }
                this.setDraggedObject(undefined);
                this.setSelectedItem("");
                this.updateFloatingElements();
            }
            else if (this.selectedObject instanceof Core.Ball) {
                this.selectedObject.k = this.selectedObject.k + 1;
                this.setSelectedObject(this.selectedObject);
                this.updateFloatingElements();
                if (!this.machine.playing) {
                    this.selectedObject.reset();
                }
            }
        };
        this._onKMinus = async () => {
            if (this.selectedObject instanceof Core.MachinePart) {
                for (let i = 0; i < this.selectedObjects.length; i++) {
                    let selectedTrack = this.selectedObjects[i];
                    if (selectedTrack instanceof Core.MachinePart) {
                        selectedTrack.setK(selectedTrack.k - 1);
                        selectedTrack.recomputeAbsolutePath();
                        selectedTrack.generateWires();
                        this.machine.generateBaseMesh();
                        await selectedTrack.instantiate(true);
                        this.grid.position.copyFrom(selectedTrack.position);
                        selectedTrack.recomputeAbsolutePath();
                        selectedTrack.select();
                        if (this.game.cameraMode === CameraMode.Selected) {
                            this._onFocus();
                        }
                    }
                }
                this.setDraggedObject(undefined);
                this.setSelectedItem("");
                this.updateFloatingElements();
            }
            else if (this.selectedObject instanceof Core.Ball) {
                this.selectedObject.k = this.selectedObject.k - 1;
                this.setSelectedObject(this.selectedObject);
                this.updateFloatingElements();
                if (!this.machine.playing) {
                    this.selectedObject.reset();
                }
            }
        };
        this._onFill = () => {
            if (this.selectedObject instanceof Core.Elevator) {
                let elevator = this.selectedObject;
                // Remove all balls located in the Elevator vicinity.
                let currentBallsInElevator = [];
                for (let i = 0; i < this.machine.balls.length; i++) {
                    let ball = this.machine.balls[i];
                    let posLocal = ball.positionZero.subtract(elevator.position);
                    if (elevator.encloseStart.x < posLocal.x && posLocal.x < elevator.encloseEnd.x) {
                        if (elevator.encloseEnd.y < posLocal.y && posLocal.y < elevator.encloseStart.y) {
                            if (elevator.encloseEnd.z < posLocal.z && posLocal.z < elevator.encloseStart.z) {
                                currentBallsInElevator.push(ball);
                            }
                        }
                    }
                }
                for (let i = 0; i < currentBallsInElevator.length; i++) {
                    currentBallsInElevator[i].dispose();
                }
                elevator.reset();
                requestAnimationFrame(() => {
                    let nBalls = Math.floor(elevator.boxesCount / 2);
                    for (let i = 0; i < nBalls; i++) {
                        let box = elevator.boxes[i];
                        let pos = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(-0.011 * (elevator.mirrorX ? -1 : 1), 0.009, 0), box.getWorldMatrix());
                        let ball = new Core.Ball(pos, this.machine);
                        ball.instantiate().then(() => {
                            ball.setShowPositionZeroGhost(true);
                            ball.setIsVisible(true);
                        });
                        this.machine.balls.push(ball);
                    }
                });
            }
        };
        this._onFocus = () => {
            if (this.selectedObjectsCount > 0) {
                this.game.focusMachineParts(false, ...this.selectedObjects);
            }
        };
        this.container = document.getElementById("machine-editor-objects");
        this.itemContainer = this.container.querySelector("#machine-editor-item-container");
        this.grid = new MachineEditorGrid(this);
        this.machinePartEditorMenu = new MachinePartEditorMenu(this);
    }
    get machine() {
        return this.game.machine;
    }
    get hoveredObject() {
        return this._hoveredObject;
    }
    set hoveredObject(o) {
        if (o != this._hoveredObject) {
            if (this._hoveredObject) {
                this._hoveredObject.unlit();
            }
            this._hoveredObject = o;
            if (this._hoveredObject) {
                this._hoveredObject.highlight();
            }
        }
    }
    get selectedItem() {
        return this._selectedItem;
    }
    setSelectedItem(s) {
        if (s != this._selectedItem) {
            let e = this.getCurrentItemElement();
            if (e) {
                e.classList.remove("selected");
            }
            this._selectedItem = s;
            e = this.getCurrentItemElement();
            if (e) {
                e.classList.add("selected");
            }
        }
    }
    get draggedObject() {
        return this._draggedObject;
    }
    setDraggedObject(s) {
        if (s != this._draggedObject) {
            this._draggedObject = s;
            if (this._draggedObject) {
                this.game.camera.detachControl();
                //this.showCurrentLayer();
            }
            else {
                this.game.camera.attachControl();
                //this.hideCurrentLayer();
            }
        }
    }
    get selectedObjectsCount() {
        return this.selectedObjects.length;
    }
    get selectedObject() {
        return this.selectedObjects[0];
    }
    setSelectedObject(s, skipUpdateGridPosition) {
        if (this.selectedObjects) {
            this.selectedObjects.forEach(obj => {
                obj.unselect();
            });
        }
        if (s) {
            this.selectedObjects = [s];
            if (this.game.cameraMode === CameraMode.Selected) {
                this._onFocus();
            }
        }
        else {
            this.selectedObjects = [];
        }
        if (this.selectedObjects[0]) {
            if (!skipUpdateGridPosition) {
                this.grid.position.copyFrom(this.selectedObjects[0].position);
            }
            this.selectedObjects[0].select();
            this.machinePartEditorMenu.currentObject = this.selectedObjects[0];
        }
        else {
            this.machinePartEditorMenu.currentObject = undefined;
        }
        this.updateFloatingElements();
    }
    addOrRemoveSelectedObjects(...objects) {
        for (let i = 0; i < objects.length; i++) {
            let object = objects[i];
            if (!(this.challengeMode && object instanceof Core.MachinePart && !object.isSelectable)) {
                let index = this.selectedObjects.indexOf(object);
                if (index === -1) {
                    this.selectedObjects.push(object);
                    object.select();
                }
                else {
                    this.selectedObjects.splice(index, 1);
                    object.unselect();
                }
            }
        }
        if (this.game.cameraMode === CameraMode.Selected) {
            this._onFocus();
        }
        if (this.selectedObjectsCount === 1) {
            this.machinePartEditorMenu.currentObject = this.selectedObject;
        }
        if (this.selectedObjectsCount > 1) {
            this.machinePartEditorMenu.currentObject = undefined;
        }
        this.updateFloatingElements();
    }
    get challengeMode() {
        return this.game.mode === GameMode.Challenge;
    }
    getItemCount(trackName) {
        if (this.itemsCounts) {
            return this.itemsCounts.get(trackName);
        }
        return 0;
    }
    setItemCount(trackName, c) {
        if (this.itemsCounts) {
            this.itemsCounts.set(trackName, c);
            let e = document.querySelector("#machine-editor-objects");
            if (e) {
                e = e.querySelector("[track='" + trackName + "']");
                if (e) {
                    e = e.querySelector("div");
                    if (e instanceof HTMLDivElement) {
                        if (isFinite(c)) {
                            e.innerHTML = c.toFixed(0);
                        }
                        else {
                            e.innerHTML = "&#8734;";
                        }
                    }
                }
            }
        }
    }
    async instantiate() {
        document.getElementById("machine-editor-objects").style.display = "block";
        this.game.toolbar.resize();
        this.machinePartEditorMenu.initialize();
        this.itemsCounts = new Map();
        if (!this.challengeMode) {
            let ballItem = document.createElement("div");
            ballItem.classList.add("machine-editor-item");
            ballItem.style.backgroundImage = "url(./datas/icons/ball.png)";
            ballItem.style.backgroundSize = "cover";
            ballItem.innerText = "ball";
            this.itemContainer.appendChild(ballItem);
            this.items.set("ball", ballItem);
            ballItem.addEventListener("pointerdown", () => {
                if (this.draggedObject) {
                    this.draggedObject.dispose();
                    this.setDraggedObject(undefined);
                }
                if (this.selectedItem === "ball") {
                    this.setSelectedItem("");
                }
                else {
                    this.setSelectedItem("ball");
                    let ball = new Core.Ball(BABYLON.Vector3.Zero(), this.machine);
                    ball.instantiate().then(() => {
                        ball.setShowPositionZeroGhost(true);
                        ball.setIsVisible(false);
                    });
                    this.setDraggedObject(ball);
                    this.setSelectedObject(ball, true);
                    this._dragOffset.copyFromFloats(0, 0, 0);
                }
            });
        }
        let availableTracks = Core.TrackNames;
        if (this.challengeMode) {
            availableTracks = this.game.challenge.availableElements;
        }
        for (let i = 0; i < availableTracks.length; i++) {
            let trackname = availableTracks[i];
            this.setItemCount(trackname, Infinity);
            let item = document.createElement("div");
            item.classList.add("machine-editor-item");
            item.setAttribute("track", trackname);
            item.style.backgroundImage = "url(./datas/icons/" + trackname + ".png)";
            item.style.backgroundSize = "cover";
            item.innerText = trackname.split("-")[0];
            this.itemContainer.appendChild(item);
            this.items.set(trackname, item);
            let itemCountElement = document.createElement("div");
            itemCountElement.classList.add("machine-editor-item-count");
            itemCountElement.innerHTML = "&#8734;";
            item.appendChild(itemCountElement);
            item.addEventListener("pointerdown", () => {
                if (this.getItemCount(trackname) <= 0) {
                    return;
                }
                if (this.draggedObject) {
                    this.draggedObject.dispose();
                    this.setDraggedObject(undefined);
                }
                if (this.selectedItem === trackname) {
                    this.setSelectedItem("");
                }
                else {
                    this.setSelectedItem(trackname);
                    let track = this.machine.trackFactory.createTrack(this._selectedItem, {
                        fullPartName: trackname,
                        i: 0,
                        j: 0,
                        k: 0
                    });
                    track.isPlaced = false;
                    if (this.challengeMode) {
                        track.sleepersMeshProp = { drawGroundAnchors: true, groundAnchorsRelativeMaxY: 1 };
                    }
                    this.setDraggedObject(track);
                    this.setSelectedObject(track, true);
                    this._dragOffset.copyFromFloats(0, 0, 0);
                    track.instantiate(true).then(() => {
                        track.setIsVisible(false);
                        requestAnimationFrame(() => {
                            track.setIsVisible(false);
                        });
                        this.setItemCount(trackname, this.getItemCount(trackname) - 1);
                    });
                }
            });
        }
        var r = document.querySelector(':root');
        r.style.setProperty("--machine-editor-item-container-width", (Math.ceil(Core.TrackNames.length / 2 + 1) * 16.7).toFixed(0) + "vw");
        document.addEventListener("keydown", this._onKeyDown);
        document.addEventListener("keyup", this._onKeyUp);
        this.game.canvas.addEventListener("pointerdown", this.pointerDown);
        this.game.canvas.addEventListener("pointermove", this.pointerMove);
        this.game.canvas.addEventListener("pointerup", this.pointerUp);
        for (let i = 0; i < this.machine.balls.length; i++) {
            this.machine.balls[i].setShowPositionZeroGhost(true);
        }
        this.floatingButtons = [];
        if (this.showManipulators) {
            this.floatingElementTop = FloatingElement.Create(this.game);
            this.floatingElementTop.anchor = FloatingElementAnchor.BottomCenter;
            this.HPlusTopButton = this._createButton("machine-editor-h-plus-top", this.floatingElementTop);
            this.HPlusTopButton.innerHTML = `
                <svg class="label" viewBox="0 0 100 100">
                    <path d="M25 70 L50 20 L80 70" fill="none" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            `;
            this.HPlusTopButton.onclick = this._onHPlusTop;
            this.HMinusTopButton = this._createButton("machine-editor-h-minus-top", this.floatingElementTop);
            this.HMinusTopButton.innerHTML = `
                <svg class="label" viewBox="0 0 100 100">
                    <path d="M25 30 L50 80 L80 30" fill="none" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            `;
            this.HMinusTopButton.onclick = this._onHMinusTop;
            this.floatingElementRight = FloatingElement.Create(this.game);
            this.floatingElementRight.anchor = FloatingElementAnchor.LeftMiddle;
            this.WMinusRightButton = this._createButton("machine-editor-w-minus-right", this.floatingElementRight);
            this.WMinusRightButton.innerHTML = `
                <svg class="label" viewBox="0 0 100 100">
                    <path d="M70 25 L20 50 L70 80" fill="none" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            `;
            this.WMinusRightButton.onclick = this._onWMinusRight;
            this.WPlusRightButton = this._createButton("machine-editor-w-plus-right", this.floatingElementRight);
            this.WPlusRightButton.innerHTML = `
                <svg class="label" viewBox="0 0 100 100">
                    <path d="M30 25 L80 50 L30 80" fill="none" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            `;
            this.WPlusRightButton.onclick = this._onWPlusRight;
            this.floatingElementBottom = FloatingElement.Create(this.game);
            this.floatingElementBottom.anchor = FloatingElementAnchor.TopCenter;
            this.HMinusBottomButton = this._createButton("machine-editor-h-minus-bottom", this.floatingElementBottom);
            this.HMinusBottomButton.innerHTML = `
                <svg class="label" viewBox="0 0 100 100">
                    <path d="M25 70 L50 20 L80 70" fill="none" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            `;
            this.HMinusBottomButton.onclick = this._onHMinusBottom;
            this.HPlusBottomButton = this._createButton("machine-editor-h-plus-bottom", this.floatingElementBottom);
            this.HPlusBottomButton.innerHTML = `
                <svg class="label" viewBox="0 0 100 100">
                    <path d="M25 30 L50 80 L80 30" fill="none" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            `;
            this.HPlusBottomButton.onclick = this._onHPlusBottom;
            this.floatingElementLeft = FloatingElement.Create(this.game);
            this.floatingElementLeft.anchor = FloatingElementAnchor.RightMiddle;
            this.WPlusLeftButton = this._createButton("machine-editor-w-plus-left", this.floatingElementLeft);
            this.WPlusLeftButton.innerHTML = `
                <svg class="label" viewBox="0 0 100 100">
                    <path d="M70 25 L20 50 L70 80" fill="none" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            `;
            this.WPlusLeftButton.onclick = this._onWPlusLeft;
            this.WMinusLeftButton = this._createButton("machine-editor-w-minus-left", this.floatingElementLeft);
            this.WMinusLeftButton.innerHTML = `
                <svg class="label" viewBox="0 0 100 100">
                    <path d="M30 25 L80 50 L30 80" fill="none" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            `;
            this.WMinusLeftButton.onclick = this._onWMinusLeft;
            this.floatingElementBottomRight = FloatingElement.Create(this.game);
            this.floatingElementBottomRight.anchor = FloatingElementAnchor.LeftTop;
            this.tileMirrorXButton = this._createButton("machine-editor-mirror-x", this.floatingElementBottomRight);
            this.tileMirrorXButton.innerHTML = `
                <svg class="label" viewBox="0 0 100 100">
                    <path d="M25 30 L10 50 L25 70 Z" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M75 30 L90 50 L75 70 Z" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M15 50 L85 50" fill="none" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            `;
            this.tileMirrorXButton.onclick = this._onMirrorX;
            this.tileMirrorZButton = this._createButton("machine-editor-mirror-z", this.floatingElementBottomRight);
            this.tileMirrorZButton.innerHTML = `
                <svg class="label" viewBox="0 0 100 100">
                    <path d="M30 25 L50 10 L70 25 Z" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M30 75 L50 90 L70 75 Z" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M50 15 L50 85"  fill="none" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            `;
            this.tileMirrorZButton.onclick = this._onMirrorZ;
            this.floatingElementBottomLeft = FloatingElement.Create(this.game);
            this.floatingElementBottomLeft.style.width = "10px";
            this.floatingElementBottomLeft.anchor = FloatingElementAnchor.RightTop;
            this.DMinusButton = this._createButton("machine-editor-d-minus", this.floatingElementBottomLeft);
            this.DMinusButton.innerHTML = `
                <svg class="label" viewBox="0 0 100 100">
                <path d="M10 70 L50 20 L90 70 Z" fill="none" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            `;
            this.DMinusButton.onclick = this._onDMinus;
            this.DPlusButton = this._createButton("machine-editor-d-plus", this.floatingElementBottomLeft);
            this.DPlusButton.innerHTML = `
                <svg class="label" viewBox="0 0 100 100">
                    <path d="M10 30 L50 80 L90 30 Z" fill="none" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            `;
            this.DPlusButton.onclick = this._onDPlus;
            this.floatingButtons.push(this.HPlusTopButton, this.HMinusTopButton, this.WMinusRightButton, this.WPlusRightButton, this.HMinusBottomButton, this.HPlusBottomButton, this.WPlusLeftButton, this.WMinusLeftButton, this.tileMirrorXButton, this.tileMirrorZButton, this.DPlusButton, this.DMinusButton);
        }
        // Ramp Origin UI
        this.originIPlusHandle = new Arrow("", this.game, this.smallHandleSize);
        this.originIPlusHandle.material = this.game.materials.redMaterial;
        this.originIPlusHandle.rotation.z = -Math.PI / 2;
        this.originIPlusHandle.instantiate();
        this.originIPlusHandle.onClick = this._onOriginIPlus;
        this.originIMinusHandle = new Arrow("", this.game, this.smallHandleSize);
        this.originIMinusHandle.material = this.game.materials.redMaterial;
        this.originIMinusHandle.rotation.z = Math.PI / 2;
        this.originIMinusHandle.instantiate();
        this.originIMinusHandle.onClick = this._onOriginIMinus;
        this.originJPlusHandle = new Arrow("", this.game, this.smallHandleSize);
        this.originJPlusHandle.material = this.game.materials.greenMaterial;
        this.originJPlusHandle.rotation.z = Math.PI;
        this.originJPlusHandle.instantiate();
        this.originJPlusHandle.onClick = this._onOriginJPlus;
        this.originJMinusHandle = new Arrow("", this.game, this.smallHandleSize);
        this.originJMinusHandle.material = this.game.materials.greenMaterial;
        this.originJMinusHandle.instantiate();
        this.originJMinusHandle.onClick = this._onOriginJMinus;
        this.originKPlusHandle = new Arrow("", this.game, this.smallHandleSize);
        this.originKPlusHandle.material = this.game.materials.blueMaterial;
        this.originKPlusHandle.rotation.x = -Math.PI / 2;
        this.originKPlusHandle.instantiate();
        this.originKPlusHandle.onClick = this._onOriginKPlus;
        this.originKMinusHandle = new Arrow("", this.game, this.smallHandleSize);
        this.originKMinusHandle.material = this.game.materials.blueMaterial;
        this.originKMinusHandle.rotation.x = Math.PI / 2;
        this.originKMinusHandle.instantiate();
        this.originKMinusHandle.onClick = this._onOriginKMinus;
        // Ramp Destination UI
        this.destinationIPlusHandle = new Arrow("", this.game, this.smallHandleSize);
        this.destinationIPlusHandle.material = this.game.materials.redMaterial;
        this.destinationIPlusHandle.rotation.z = -Math.PI / 2;
        this.destinationIPlusHandle.instantiate();
        this.destinationIPlusHandle.onClick = this._onDestinationIPlus;
        this.destinationIMinusHandle = new Arrow("", this.game, this.smallHandleSize);
        this.destinationIMinusHandle.material = this.game.materials.redMaterial;
        this.destinationIMinusHandle.rotation.z = Math.PI / 2;
        this.destinationIMinusHandle.instantiate();
        this.destinationIMinusHandle.onClick = this._onDestinationIMinus;
        this.destinationJPlusHandle = new Arrow("", this.game, this.smallHandleSize);
        this.destinationJPlusHandle.material = this.game.materials.greenMaterial;
        this.destinationJPlusHandle.rotation.z = Math.PI;
        this.destinationJPlusHandle.instantiate();
        this.destinationJPlusHandle.onClick = this._onDestinationJPlus;
        this.destinationJMinusHandle = new Arrow("", this.game, this.smallHandleSize);
        this.destinationJMinusHandle.material = this.game.materials.greenMaterial;
        this.destinationJMinusHandle.instantiate();
        this.destinationJMinusHandle.onClick = this._onDestinationJMinus;
        this.destinationKPlusHandle = new Arrow("", this.game, this.smallHandleSize);
        this.destinationKPlusHandle.material = this.game.materials.blueMaterial;
        this.destinationKPlusHandle.rotation.x = -Math.PI / 2;
        this.destinationKPlusHandle.instantiate();
        this.destinationKPlusHandle.onClick = this._onDestinationKPlus;
        this.destinationKMinusHandle = new Arrow("", this.game, this.smallHandleSize);
        this.destinationKMinusHandle.material = this.game.materials.blueMaterial;
        this.destinationKMinusHandle.rotation.x = Math.PI / 2;
        this.destinationKMinusHandle.instantiate();
        this.destinationKMinusHandle.onClick = this._onDestinationKMinus;
        // Machine Part displacer UI.
        this.IPlusHandle = new Arrow("IPlusHandle", this.game, 0.03);
        this.IPlusHandle.material = this.game.materials.redMaterial;
        this.IPlusHandle.rotation.z = -Math.PI / 2;
        this.IPlusHandle.instantiate();
        this.IPlusHandle.onClick = this._onIPlus;
        this.IMinusHandle = new Arrow("IMinusHandle", this.game, 0.03);
        this.IMinusHandle.material = this.game.materials.redMaterial;
        this.IMinusHandle.rotation.z = Math.PI / 2;
        this.IMinusHandle.instantiate();
        this.IMinusHandle.onClick = this._onIMinus;
        this.JPlusHandle = new Arrow("JPlusHandle", this.game, 0.03);
        this.JPlusHandle.material = this.game.materials.greenMaterial;
        this.JPlusHandle.rotation.z = Math.PI;
        this.JPlusHandle.instantiate();
        this.JPlusHandle.onClick = this._onJPlus;
        this.JMinusHandle = new Arrow("JMinusHandle", this.game, 0.03);
        this.JMinusHandle.material = this.game.materials.greenMaterial;
        this.JMinusHandle.instantiate();
        this.JMinusHandle.onClick = this._onJMinus;
        this.KPlusHandle = new Arrow("KPlusHandle", this.game, 0.03);
        this.KPlusHandle.material = this.game.materials.blueMaterial;
        this.KPlusHandle.rotation.x = -Math.PI / 2;
        this.KPlusHandle.instantiate();
        this.KPlusHandle.onClick = this._onKPlus;
        this.KMinusHandle = new Arrow("KMinusHandle", this.game, 0.03);
        this.KMinusHandle.material = this.game.materials.blueMaterial;
        this.KMinusHandle.rotation.x = Math.PI / 2;
        this.KMinusHandle.instantiate();
        this.KMinusHandle.onClick = this._onKMinus;
        this.handles = [
            this.IPlusHandle,
            this.IMinusHandle,
            this.JPlusHandle,
            this.JMinusHandle,
            this.KPlusHandle,
            this.KMinusHandle,
            this.originIPlusHandle,
            this.originIMinusHandle,
            this.originJPlusHandle,
            this.originJMinusHandle,
            this.originKPlusHandle,
            this.originKMinusHandle,
            this.destinationIPlusHandle,
            this.destinationIMinusHandle,
            this.destinationJPlusHandle,
            this.destinationJMinusHandle,
            this.destinationKPlusHandle,
            this.destinationKMinusHandle
        ];
        this.handles.forEach(handle => {
            handle.size = this.game.config.getValue("handleSize");
        });
        this.updateFloatingElements();
    }
    _createButton(id, parent, spacer = false) {
        let button = document.createElement("button");
        if (id != "") {
            button.id = id;
        }
        button.classList.add("btn");
        button.classList.add("xs");
        if (spacer) {
            button.style.visibility = "hidden";
        }
        parent.appendChild(button);
        return button;
    }
    dispose() {
        document.getElementById("machine-editor-objects").style.display = "none";
        this.setSelectedObject(undefined);
        this.game.toolbar.resize();
        if (this.machinePartEditorMenu) {
            this.machinePartEditorMenu.dispose();
        }
        if (this.showManipulators) {
            this.floatingElementTop.dispose();
            this.floatingElementRight.dispose();
            this.floatingElementBottom.dispose();
            this.floatingElementLeft.dispose();
            this.floatingElementBottomRight.dispose();
            this.floatingElementBottomLeft.dispose();
        }
        this.handles.forEach(handle => {
            handle.dispose();
        });
        if (this.itemContainer) {
            this.itemContainer.innerHTML = "";
        }
        this.items = new Map();
        document.removeEventListener("keydown", this._onKeyDown);
        document.removeEventListener("keyup", this._onKeyUp);
        this.game.canvas.removeEventListener("pointerdown", this.pointerDown);
        this.game.canvas.removeEventListener("pointermove", this.pointerMove);
        this.game.canvas.removeEventListener("pointerup", this.pointerUp);
        for (let i = 0; i < this.machine.balls.length; i++) {
            this.machine.balls[i].setShowPositionZeroGhost(false);
        }
    }
    update() {
        let ratio = this.game.engine.getRenderWidth() / this.game.engine.getRenderHeight();
        if (ratio > 1) {
            this.container.classList.add("left");
            this.container.classList.remove("bottom");
        }
        else {
            this.container.classList.add("bottom");
            this.container.classList.remove("left");
        }
        let pick = this.game.scene.pick(this.game.scene.pointerX, this.game.scene.pointerY, (mesh) => {
            if (mesh instanceof Arrow && mesh.isVisible) {
                return true;
            }
            return false;
        });
        if (pick.hit && pick.pickedMesh instanceof Arrow) {
            this.hoveredObject = pick.pickedMesh;
        }
        else {
            this.hoveredObject = undefined;
        }
        this.grid.update();
    }
    async editTrackInPlace(track, props) {
        if (!props) {
            props = {};
        }
        if (!isFinite(props.i)) {
            props.i = track.i;
        }
        if (!isFinite(props.j)) {
            props.j = track.j;
        }
        if (!isFinite(props.k)) {
            props.k = track.k;
        }
        if (!isFinite(props.w) && track.xExtendable) {
            props.w = track.w;
        }
        if (!isFinite(props.h) && track.yExtendable) {
            props.h = track.h;
        }
        if (!isFinite(props.d) && track.zExtendable) {
            props.d = track.d;
        }
        if (!isFinite(props.n) && track.nExtendable) {
            props.n = track.n;
        }
        if (!props.c && !(track.colors.length === 1 && track.colors[0] === 0)) {
            props.c = track.colors;
            console.log("use existing color");
        }
        console.log(props.c);
        props.mirrorX = track.mirrorX;
        props.mirrorZ = track.mirrorZ;
        let editedTrack = this.machine.trackFactory.createTrackWHDN(track.partName, props);
        track.dispose();
        this.machine.parts.push(editedTrack);
        editedTrack.setIsVisible(true);
        editedTrack.generateWires();
        this.machine.generateBaseMesh();
        await editedTrack.instantiate(true);
        editedTrack.recomputeAbsolutePath();
        return editedTrack;
    }
    async editPartOriginDestInPlace(part, dOrigin, dDestination) {
        let origin = part.getOrigin();
        origin.i += dOrigin.i;
        origin.j += dOrigin.j;
        origin.k += dOrigin.k;
        let destination = part.getDestination();
        destination.i += dDestination.i;
        destination.j += dDestination.j;
        destination.k += dDestination.k;
        if (origin.i >= destination.i) {
            return part;
        }
        let editedPart = part.recreateFromOriginDestination(origin, destination, this.machine);
        part.dispose();
        this.machine.parts.push(editedPart);
        editedPart.setIsVisible(true);
        editedPart.generateWires();
        this.machine.generateBaseMesh();
        await editedPart.instantiate(true);
        editedPart.recomputeAbsolutePath();
        return editedPart;
    }
    async mirrorXTrackInPlace(track) {
        let mirroredTrack = this.machine.trackFactory.createTrack(track.partName, {
            i: track.i,
            j: track.j,
            k: track.k,
            mirrorX: !track.mirrorX,
            mirrorZ: track.mirrorZ
        });
        track.dispose();
        this.machine.parts.push(mirroredTrack);
        mirroredTrack.setIsVisible(true);
        mirroredTrack.generateWires();
        await mirroredTrack.instantiate(true);
        mirroredTrack.recomputeAbsolutePath();
        return mirroredTrack;
    }
    async mirrorZTrackInPlace(track) {
        let mirroredTrack = this.machine.trackFactory.createTrack(track.partName, {
            i: track.i,
            j: track.j,
            k: track.k,
            mirrorX: track.mirrorX,
            mirrorZ: !track.mirrorZ
        });
        track.dispose();
        this.machine.parts.push(mirroredTrack);
        mirroredTrack.setIsVisible(true);
        mirroredTrack.generateWires();
        await mirroredTrack.instantiate(true);
        mirroredTrack.recomputeAbsolutePath();
        return mirroredTrack;
    }
    getCurrentItemElement() {
        return this.items.get(this._selectedItem);
    }
    updateFloatingElements() {
        if (this.floatingButtons) {
            this.floatingButtons.forEach(button => {
                button.style.display = "none";
            });
        }
        if (this.handles) {
            this.handles.forEach(handle => {
                handle.isVisible = false;
            });
        }
        if (this.selectedObject) {
            let s = this.actionTileSize;
            if (this.selectedObject instanceof Core.Ball) {
                this.KPlusHandle.position.copyFrom(this.selectedObject.positionZeroGhost.position);
                this.KPlusHandle.position.y -= 0.04;
                this.KPlusHandle.position.z -= 0.03;
                this.KPlusHandle.isVisible = true;
                this.KMinusHandle.position.copyFrom(this.selectedObject.positionZeroGhost.position);
                this.KMinusHandle.position.y -= 0.04;
                this.KMinusHandle.position.z += 0.03;
                this.KMinusHandle.isVisible = true;
            }
            else if (this.selectedObject instanceof Core.MachinePart) {
                if (!this.challengeMode && this.selectedObject instanceof Core.MachinePartWithOriginDestination && this.selectedObjectsCount === 1) {
                    let origin = this.selectedObject.getOrigin();
                    let pOrigin = new BABYLON.Vector3(origin.i * Core.tileWidth - 0.5 * Core.tileWidth, -origin.j * Core.tileHeight, -origin.k * Core.tileDepth);
                    this.originIPlusHandle.position.copyFrom(pOrigin);
                    this.originIPlusHandle.position.x += this.smallHandleSize * 1.5;
                    this.originIMinusHandle.position.copyFrom(pOrigin);
                    this.originIMinusHandle.position.x -= this.smallHandleSize * 1.5;
                    this.originJPlusHandle.position.copyFrom(pOrigin);
                    this.originJPlusHandle.position.y -= this.smallHandleSize * 1.5;
                    this.originJMinusHandle.position.copyFrom(pOrigin);
                    this.originJMinusHandle.position.y += this.smallHandleSize * 1.5;
                    this.originKPlusHandle.position.copyFrom(pOrigin);
                    this.originKPlusHandle.position.z -= this.smallHandleSize * 1.5;
                    this.originKMinusHandle.position.copyFrom(pOrigin);
                    this.originKMinusHandle.position.z += this.smallHandleSize * 1.5;
                    let destination = this.selectedObject.getDestination();
                    let pDestination = new BABYLON.Vector3(destination.i * Core.tileWidth - 0.5 * Core.tileWidth, -destination.j * Core.tileHeight, -destination.k * Core.tileDepth);
                    this.destinationIPlusHandle.position.copyFrom(pDestination);
                    this.destinationIPlusHandle.position.x += this.smallHandleSize * 1.5;
                    this.destinationIMinusHandle.position.copyFrom(pDestination);
                    this.destinationIMinusHandle.position.x -= this.smallHandleSize * 1.5;
                    this.destinationJPlusHandle.position.copyFrom(pDestination);
                    this.destinationJPlusHandle.position.y -= this.smallHandleSize * 1.5;
                    this.destinationJMinusHandle.position.copyFrom(pDestination);
                    this.destinationJMinusHandle.position.y += this.smallHandleSize * 1.5;
                    this.destinationKPlusHandle.position.copyFrom(pDestination);
                    this.destinationKPlusHandle.position.z -= this.smallHandleSize * 1.5;
                    this.destinationKMinusHandle.position.copyFrom(pDestination);
                    this.destinationKMinusHandle.position.z += this.smallHandleSize * 1.5;
                    this.originIPlusHandle.isVisible = true;
                    this.originIMinusHandle.isVisible = true;
                    this.originJPlusHandle.isVisible = true;
                    this.originJMinusHandle.isVisible = true;
                    this.originKPlusHandle.isVisible = true;
                    this.originKMinusHandle.isVisible = true;
                    this.destinationIPlusHandle.isVisible = true;
                    this.destinationIMinusHandle.isVisible = true;
                    this.destinationJPlusHandle.isVisible = true;
                    this.destinationJMinusHandle.isVisible = true;
                    this.destinationKPlusHandle.isVisible = true;
                    this.destinationKMinusHandle.isVisible = true;
                }
                else {
                    if (this.selectedObjectsCount === 1) {
                        this.IPlusHandle.position.copyFrom(this.selectedObject.position);
                        this.IPlusHandle.position.x += this.selectedObject.encloseEnd.x + this.IPlusHandle.baseSize * 0.5;
                        this.IPlusHandle.position.y += this.selectedObject.encloseEnd.y;
                        this.IPlusHandle.position.z += this.selectedObject.encloseMid.z;
                        this.IMinusHandle.position.copyFrom(this.selectedObject.position);
                        this.IMinusHandle.position.x += this.selectedObject.encloseStart.x - this.IMinusHandle.baseSize * 0.5;
                        this.IMinusHandle.position.y += this.selectedObject.encloseEnd.y;
                        this.IMinusHandle.position.z += this.selectedObject.encloseMid.z;
                        this.JPlusHandle.position.copyFrom(this.selectedObject.position);
                        this.JPlusHandle.position.x += this.selectedObject.encloseMid.x;
                        this.JPlusHandle.position.y += this.selectedObject.encloseEnd.y - this.JPlusHandle.baseSize * 0.5;
                        this.JPlusHandle.position.z += this.selectedObject.encloseMid.z;
                        this.JMinusHandle.position.copyFrom(this.selectedObject.position);
                        this.JMinusHandle.position.x += this.selectedObject.encloseMid.x;
                        this.JMinusHandle.position.y += this.selectedObject.encloseStart.y + this.JMinusHandle.baseSize * 0.5;
                        this.JMinusHandle.position.z += this.selectedObject.encloseMid.z;
                        this.KPlusHandle.position.copyFrom(this.selectedObject.position);
                        this.KPlusHandle.position.x += this.selectedObject.encloseMid.x;
                        this.KPlusHandle.position.y += this.selectedObject.encloseEnd.y;
                        this.KPlusHandle.position.z += this.selectedObject.encloseEnd.z - this.KPlusHandle.baseSize * 0.5;
                        this.KMinusHandle.position.copyFrom(this.selectedObject.position);
                        this.KMinusHandle.position.x += this.selectedObject.encloseMid.x;
                        this.KMinusHandle.position.y += this.selectedObject.encloseEnd.y;
                        this.KMinusHandle.position.z += this.selectedObject.encloseStart.z + this.KMinusHandle.baseSize * 0.5;
                    }
                    else if (this.selectedObjectsCount > 1) {
                        let encloseStart = new BABYLON.Vector3(Infinity, -Infinity, -Infinity);
                        let encloseEnd = new BABYLON.Vector3(-Infinity, Infinity, Infinity);
                        this.selectedObjects.forEach(obj => {
                            if (obj instanceof Core.MachinePart) {
                                encloseStart.x = Math.min(encloseStart.x, obj.position.x + obj.encloseStart.x);
                                encloseStart.y = Math.max(encloseStart.y, obj.position.y + obj.encloseStart.y);
                                encloseStart.z = Math.max(encloseStart.z, obj.position.z + obj.encloseStart.z);
                                encloseEnd.x = Math.max(encloseEnd.x, obj.position.x + obj.encloseEnd.x);
                                encloseEnd.y = Math.min(encloseEnd.y, obj.position.y + obj.encloseEnd.y);
                                encloseEnd.z = Math.min(encloseEnd.z, obj.position.z + obj.encloseEnd.z);
                            }
                        });
                        let enclose13 = encloseStart.clone().scaleInPlace(2 / 3).addInPlace(encloseEnd.scale(1 / 3));
                        let encloseMid = encloseStart.clone().addInPlace(encloseEnd).scaleInPlace(0.5);
                        let enclose23 = encloseStart.clone().scaleInPlace(1 / 3).addInPlace(encloseEnd.scale(2 / 3));
                        this.IPlusHandle.position.x = encloseEnd.x + this.IPlusHandle.baseSize * 0.5;
                        this.IPlusHandle.position.y = encloseMid.y;
                        this.IPlusHandle.position.z = encloseStart.z - Core.tileDepth * 0.5;
                        this.IMinusHandle.position.x = encloseStart.x - this.IMinusHandle.baseSize * 0.5;
                        this.IMinusHandle.position.y = encloseMid.y;
                        this.IMinusHandle.position.z = encloseStart.z - Core.tileDepth * 0.5;
                        this.JPlusHandle.position.x = enclose13.x;
                        this.JPlusHandle.position.y = encloseEnd.y - this.JMinusHandle.baseSize * 0.5;
                        this.JPlusHandle.position.z = encloseStart.z - Core.tileDepth * 0.5;
                        this.JMinusHandle.position.x = enclose13.x;
                        this.JMinusHandle.position.y = encloseStart.y + this.JMinusHandle.baseSize * 0.5;
                        this.JMinusHandle.position.z = encloseStart.z - Core.tileDepth * 0.5;
                        this.KPlusHandle.position.x = enclose23.x;
                        this.KPlusHandle.position.y = encloseEnd.y;
                        this.KPlusHandle.position.z = encloseEnd.z - this.KPlusHandle.baseSize * 0.5;
                        this.KMinusHandle.position.x = enclose23.x;
                        this.KMinusHandle.position.y = encloseEnd.y;
                        this.KMinusHandle.position.z = encloseStart.z + this.KMinusHandle.baseSize * 0.5;
                    }
                    this.IPlusHandle.isVisible = true;
                    this.IMinusHandle.isVisible = true;
                    this.JPlusHandle.isVisible = true;
                    this.JMinusHandle.isVisible = true;
                    this.KPlusHandle.isVisible = true;
                    this.KMinusHandle.isVisible = true;
                }
            }
        }
    }
}
class MachineEditorGrid extends BABYLON.Mesh {
    constructor(editor) {
        super("machine-editor-grid");
        this.editor = editor;
        this.closestAxis = BABYLON.Vector3.Forward();
        this._lastSelectedObjectsCount = 0;
        this._lastPosition = BABYLON.Vector3.Zero();
        this._lastCamDir = BABYLON.Vector3.One();
        this.opaquePlane = BABYLON.MeshBuilder.CreatePlane("machine-editor-opaque-grid", { size: 100 });
        this.opaquePlane.material = this.editor.game.materials.gridMaterial;
        this.opaquePlane.rotationQuaternion = BABYLON.Quaternion.Identity();
        let count = 20;
        let xLines = [];
        let color = new BABYLON.Color4(1, 1, 1, 0.2);
        let colors = [];
        for (let j = -count; j <= count; j++) {
            xLines.push([
                new BABYLON.Vector3(0, j * Core.tileHeight - 0.5 * Core.tileHeight, -count * Core.tileDepth),
                new BABYLON.Vector3(0, j * Core.tileHeight - 0.5 * Core.tileHeight, count * Core.tileDepth),
            ]);
            colors.push([color, color]);
        }
        for (let k = -count; k <= count; k++) {
            xLines.push([
                new BABYLON.Vector3(0, -count * Core.tileHeight - 0.5 * Core.tileHeight, k * Core.tileDepth - 0.5 * Core.tileDepth),
                new BABYLON.Vector3(0, count * Core.tileHeight - 0.5 * Core.tileHeight, k * Core.tileDepth - 0.5 * Core.tileDepth),
            ]);
            colors.push([color, color]);
        }
        this.xGrid = BABYLON.MeshBuilder.CreateLineSystem("machine-editor-x-grid", { lines: xLines, colors: colors }, editor.game.scene);
        let yLines = [];
        for (let i = -count; i <= count; i++) {
            yLines.push([
                new BABYLON.Vector3(i * Core.tileWidth - 0.5 * Core.tileWidth, 0, -count * Core.tileDepth),
                new BABYLON.Vector3(i * Core.tileWidth - 0.5 * Core.tileWidth, 0, count * Core.tileDepth),
            ]);
        }
        for (let k = -count; k <= count; k++) {
            yLines.push([
                new BABYLON.Vector3(-count * Core.tileWidth - 0.5 * Core.tileWidth, 0, k * Core.tileDepth - 0.5 * Core.tileDepth),
                new BABYLON.Vector3(count * Core.tileWidth - 0.5 * Core.tileWidth, 0, k * Core.tileDepth - 0.5 * Core.tileDepth),
            ]);
        }
        this.yGrid = BABYLON.MeshBuilder.CreateLineSystem("machine-editor-y-grid", { lines: yLines, colors: colors }, editor.game.scene);
        let zLines = [];
        for (let j = -count; j <= count; j++) {
            zLines.push([
                new BABYLON.Vector3(-count * Core.tileWidth - 0.5 * Core.tileWidth, j * Core.tileHeight - 0.5 * Core.tileHeight, 0),
                new BABYLON.Vector3(count * Core.tileWidth - 0.5 * Core.tileWidth, j * Core.tileHeight - 0.5 * Core.tileHeight, 0),
            ]);
        }
        for (let i = -count; i <= count; i++) {
            zLines.push([
                new BABYLON.Vector3(i * Core.tileWidth - 0.5 * Core.tileWidth, -count * Core.tileHeight - 0.5 * Core.tileHeight, 0),
                new BABYLON.Vector3(i * Core.tileWidth - 0.5 * Core.tileWidth, count * Core.tileHeight - 0.5 * Core.tileHeight, 0),
            ]);
        }
        this.zGrid = BABYLON.MeshBuilder.CreateLineSystem("machine-editor-z-grid", { lines: zLines, colors: colors }, editor.game.scene);
        this.opaquePlane.isVisible = false;
        this.xGrid.isVisible = false;
        this.yGrid.isVisible = false;
        this.zGrid.isVisible = false;
    }
    update() {
        let camDir = this.editor.game.camera.getDirection(BABYLON.Axis.Z);
        if (this.editor.selectedObjectsCount != this._lastSelectedObjectsCount ||
            this.editor.selectedObject != this._lastSelectedObject ||
            Mummu.Angle(camDir, this._lastCamDir) > Math.PI / 180 ||
            BABYLON.Vector3.DistanceSquared(this.position, this._lastPosition) > 0.001 * 0.001) {
            this.xGrid.isVisible = false;
            this.yGrid.isVisible = false;
            this.zGrid.isVisible = false;
            this.opaquePlane.isVisible = false;
            this.xGrid.position.copyFrom(this.position);
            this.yGrid.position.copyFrom(this.position);
            this.zGrid.position.copyFrom(this.position);
            let minIJK = new BABYLON.Vector3(-Infinity, -Infinity, -Infinity);
            let maxIJK = new BABYLON.Vector3(Infinity, Infinity, Infinity);
            let worldEncloseStart = new BABYLON.Vector3(Infinity, -Infinity, -Infinity);
            let worldEncloseEnd = new BABYLON.Vector3(-Infinity, Infinity, Infinity);
            if (this.editor.selectedObjects.length > 0) {
                this.opaquePlane.isVisible = true;
                this.editor.selectedObjects.forEach(obj => {
                    if (obj instanceof Core.MachinePart) {
                        worldEncloseStart.x = Math.min(worldEncloseStart.x, obj.position.x + obj.encloseStart.x);
                        worldEncloseStart.y = Math.max(worldEncloseStart.y, obj.position.y + obj.encloseStart.y);
                        worldEncloseStart.z = Math.max(worldEncloseStart.z, obj.position.z + obj.encloseStart.z);
                        worldEncloseEnd.x = Math.max(worldEncloseEnd.x, obj.position.x + obj.encloseEnd.x);
                        worldEncloseEnd.y = Math.min(worldEncloseEnd.y, obj.position.y + obj.encloseEnd.y);
                        worldEncloseEnd.z = Math.min(worldEncloseEnd.z, obj.position.z + obj.encloseEnd.z);
                    }
                });
                Mummu.GetClosestAxisToRef(camDir, this.closestAxis);
                Mummu.QuaternionFromZYAxisToRef(this.closestAxis, BABYLON.Vector3.One(), this.opaquePlane.rotationQuaternion);
                if (this.closestAxis.x != 0) {
                    this.xGrid.isVisible = this.isVisible;
                    if (this.editor.selectedObject instanceof Core.MachinePart && this.editor.selectedObject.isPlaced) {
                        if (this.closestAxis.x > 0) {
                            maxIJK.x = this.editor.selectedObject.i;
                            this.xGrid.position.x = worldEncloseEnd.x;
                        }
                        else {
                            minIJK.x = this.editor.selectedObject.i;
                            this.xGrid.position.x = worldEncloseStart.x;
                        }
                    }
                    this.opaquePlane.position.copyFrom(this.xGrid.position);
                }
                if (this.closestAxis.y != 0) {
                    this.yGrid.isVisible = this.isVisible;
                    if (this.editor.selectedObject instanceof Core.MachinePart && this.editor.selectedObject.isPlaced) {
                        if (this.closestAxis.y > 0) {
                            minIJK.y = this.editor.selectedObject.j;
                            this.yGrid.position.y = worldEncloseStart.y;
                        }
                        else {
                            maxIJK.y = this.editor.selectedObject.j;
                            this.yGrid.position.y = worldEncloseEnd.y;
                        }
                    }
                    this.opaquePlane.position.copyFrom(this.yGrid.position);
                }
                if (this.closestAxis.z != 0) {
                    this.zGrid.isVisible = this.isVisible;
                    if (this.editor.selectedObject instanceof Core.MachinePart && this.editor.selectedObject.isPlaced) {
                        if (this.closestAxis.z > 0) {
                            minIJK.z = this.editor.selectedObject.k;
                            this.zGrid.position.z = worldEncloseStart.z;
                        }
                        else {
                            maxIJK.z = this.editor.selectedObject.k;
                            this.zGrid.position.z = worldEncloseEnd.z;
                        }
                    }
                    this.opaquePlane.position.copyFrom(this.zGrid.position);
                }
            }
            /*
            this.editor.machine.parts.forEach(part => {
                if (
                    part.i <= maxIJK.x && part.i >= minIJK.x &&
                    part.j <= maxIJK.y && part.j >= minIJK.y &&
                    part.k <= maxIJK.z && part.k >= minIJK.z
                ) {
                    part.partVisibilityMode = PartVisibilityMode.Default;
                }
                else {
                    part.partVisibilityMode = PartVisibilityMode.Ghost;
                }
            })
            */
            this._lastSelectedObjectsCount = this.editor.selectedObjects.length;
            this._lastSelectedObject = this.editor.selectedObject;
            this._lastPosition.copyFrom(this.position);
            this._lastCamDir.copyFrom(camDir);
        }
    }
}
class MachinePartEditorMenu {
    constructor(machineEditor) {
        this.machineEditor = machineEditor;
        this.colorLines = [];
        this.colorPlusButtons = [];
        this.colorMinusButtons = [];
        this.colorValues = [];
        this._shown = true;
    }
    get currentObject() {
        return this._currentObject;
    }
    set currentObject(part) {
        this._currentObject = part;
        this.update();
    }
    initialize() {
        this.container = document.getElementById("machine-editor-part-menu");
        this.titleElement = document.querySelector("#machine-editor-part-menu-title span");
        this.showButton = document.querySelector("#machine-editor-part-menu-show");
        this.showButton.onclick = () => {
            this._shown = true;
            this.update();
        };
        this.hideButton = document.querySelector("#machine-editor-part-menu-hide");
        this.hideButton.onclick = () => {
            this._shown = false;
            this.update();
        };
        this.ijkLine = document.getElementById("machine-editor-part-menu-ijk");
        this.ijkIElement = this.ijkLine.querySelector(".value.i");
        this.ijkJElement = this.ijkLine.querySelector(".value.j");
        this.ijkKElement = this.ijkLine.querySelector(".value.k");
        this.kLine = document.getElementById("machine-editor-part-menu-k");
        this.kElement = this.kLine.querySelector(".value.k");
        this.widthLine = document.getElementById("machine-editor-part-menu-width");
        this.wPlusButton = document.querySelector("#machine-editor-part-menu-width button.plus");
        this.wPlusButton.onclick = async () => {
            if (this.currentObject instanceof Core.MachinePart && this.currentObject.xExtendable) {
                let w = this.currentObject.w + 1;
                let editedTrack = await this.machineEditor.editTrackInPlace(this.currentObject, { w: w });
                this.machineEditor.setSelectedObject(editedTrack);
            }
        };
        this.wMinusButton = document.querySelector("#machine-editor-part-menu-width button.minus");
        this.wMinusButton.onclick = async () => {
            if (this.currentObject instanceof Core.MachinePart && this.currentObject.xExtendable) {
                let w = this.currentObject.w - 1;
                if (w >= 1) {
                    let editedTrack = await this.machineEditor.editTrackInPlace(this.currentObject, { w: w });
                    this.machineEditor.setSelectedObject(editedTrack);
                }
            }
        };
        this.wValue = document.querySelector("#machine-editor-part-menu-width .value");
        this.heightLine = document.getElementById("machine-editor-part-menu-height");
        this.hPlusButton = document.querySelector("#machine-editor-part-menu-height button.plus");
        this.hPlusButton.onclick = async () => {
            if (this.currentObject instanceof Core.MachinePart && this.currentObject.yExtendable) {
                let h = this.currentObject.h + 1;
                let editedTrack = await this.machineEditor.editTrackInPlace(this.currentObject, { h: h });
                this.machineEditor.setSelectedObject(editedTrack);
            }
        };
        this.hMinusButton = document.querySelector("#machine-editor-part-menu-height button.minus");
        this.hMinusButton.onclick = async () => {
            if (this.currentObject instanceof Core.MachinePart && this.currentObject.yExtendable) {
                let h = this.currentObject.h - 1;
                if (h >= this.currentObject.minH) {
                    let editedTrack = await this.machineEditor.editTrackInPlace(this.currentObject, { h: h });
                    this.machineEditor.setSelectedObject(editedTrack);
                }
            }
        };
        this.hValue = document.querySelector("#machine-editor-part-menu-height .value");
        this.depthLine = document.getElementById("machine-editor-part-menu-depth");
        this.dPlusButton = document.querySelector("#machine-editor-part-menu-depth button.plus");
        this.dPlusButton.onclick = async () => {
            if (this.currentObject instanceof Core.MachinePart && this.currentObject.zExtendable) {
                let d = this.currentObject.d + 1;
                if (d <= this.currentObject.maxD) {
                    let editedTrack = await this.machineEditor.editTrackInPlace(this.currentObject, { d: d });
                    this.machineEditor.setSelectedObject(editedTrack);
                }
            }
        };
        this.dMinusButton = document.querySelector("#machine-editor-part-menu-depth button.minus");
        this.dMinusButton.onclick = async () => {
            if (this.currentObject instanceof Core.MachinePart && this.currentObject.zExtendable) {
                let d = this.currentObject.d - 1;
                if (d >= this.currentObject.minD) {
                    let editedTrack = await this.machineEditor.editTrackInPlace(this.currentObject, { d: d });
                    this.machineEditor.setSelectedObject(editedTrack);
                }
            }
        };
        this.dValue = document.querySelector("#machine-editor-part-menu-depth .value");
        this.countLine = document.getElementById("machine-editor-part-menu-count");
        this.nPlusButton = document.querySelector("#machine-editor-part-menu-count button.plus");
        this.nPlusButton.onclick = async () => {
            if (this.currentObject instanceof Core.MachinePart && this.currentObject.nExtendable) {
                let n = this.currentObject.n + 1;
                let editedTrack = await this.machineEditor.editTrackInPlace(this.currentObject, { n: n });
                this.machineEditor.setSelectedObject(editedTrack);
            }
        };
        this.nMinusButton = document.querySelector("#machine-editor-part-menu-count button.minus");
        this.nMinusButton.onclick = async () => {
            if (this.currentObject instanceof Core.MachinePart && this.currentObject.nExtendable) {
                let n = this.currentObject.n - 1;
                if (n > 0) {
                    let editedTrack = await this.machineEditor.editTrackInPlace(this.currentObject, { n: n });
                    this.machineEditor.setSelectedObject(editedTrack);
                }
            }
        };
        this.nValue = document.querySelector("#machine-editor-part-menu-count .value");
        for (let i = 0; i < Core.colorSlotsCount; i++) {
            let colorIndex = i;
            this.colorLines[i] = document.getElementById("machine-editor-part-menu-color-" + i.toFixed(0));
            this.colorPlusButtons[i] = document.querySelector("#machine-editor-part-menu-color-" + i.toFixed(0) + " button.plus");
            this.colorPlusButtons[i].onclick = async () => {
                if (this.currentObject instanceof Core.MachinePart) {
                    let colors = [...this.currentObject.colors];
                    colors[colorIndex] = (colors[colorIndex] + 1) % this.currentObject.game.materials.metalMaterials.length;
                    let editedTrack = await this.machineEditor.editTrackInPlace(this.currentObject, { c: colors });
                    this.machineEditor.setSelectedObject(editedTrack);
                }
            };
            this.colorMinusButtons[i] = document.querySelector("#machine-editor-part-menu-color-" + i.toFixed(0) + " button.minus");
            this.colorMinusButtons[i].onclick = async () => {
                if (this.currentObject instanceof Core.MachinePart) {
                    let colors = [...this.currentObject.colors];
                    colors[colorIndex] = (colors[colorIndex] + this.currentObject.game.materials.metalMaterials.length - 1) % this.currentObject.game.materials.metalMaterials.length;
                    let editedTrack = await this.machineEditor.editTrackInPlace(this.currentObject, { c: colors });
                    this.machineEditor.setSelectedObject(editedTrack);
                }
            };
            this.colorValues[i] = document.querySelector("#machine-editor-part-menu-color-" + i.toFixed(0) + " .value");
        }
        this.mirrorXLine = document.getElementById("machine-editor-part-menu-mirrorX");
        this.mirrorXButton = document.querySelector("#machine-editor-part-menu-mirrorX button");
        this.mirrorXButton.onclick = async () => {
            if (this.currentObject instanceof Core.MachinePart) {
                let editedTrack = await this.machineEditor.mirrorXTrackInPlace(this.currentObject);
                this.machineEditor.setSelectedObject(editedTrack);
            }
        };
        this.mirrorZLine = document.getElementById("machine-editor-part-menu-mirrorZ");
        this.mirrorZButton = document.querySelector("#machine-editor-part-menu-mirrorZ button");
        this.mirrorZButton.onclick = async () => {
            if (this.currentObject instanceof Core.MachinePart) {
                let editedTrack = await this.machineEditor.mirrorZTrackInPlace(this.currentObject);
                this.machineEditor.setSelectedObject(editedTrack);
            }
        };
        this.fillLine = document.getElementById("machine-editor-part-menu-fill");
        this.fillButton = document.querySelector("#machine-editor-part-menu-fill button");
        this.fillButton.onclick = this.machineEditor._onFill;
        this.focusLine = document.getElementById("machine-editor-part-menu-focus");
        this.focusButton = document.querySelector("#machine-editor-part-menu-focus button");
        this.focusButton.onclick = this.machineEditor._onFocus;
        this.deleteLine = document.getElementById("machine-editor-part-menu-delete");
        this.deleteButton = document.querySelector("#machine-editor-part-menu-delete button");
        this.deleteButton.onclick = async () => {
            this.currentObject.dispose();
            this.machineEditor.setSelectedObject(undefined);
            this.machineEditor.setDraggedObject(undefined);
        };
    }
    dispose() {
        this.currentObject = undefined;
    }
    update() {
        if (this.container && this.machineEditor.game.mode === GameMode.Create) {
            if (!this.currentObject) {
                this.container.style.display = "none";
            }
            else {
                this.container.style.display = "";
                this.showButton.style.display = this._shown ? "none" : "";
                this.hideButton.style.display = this._shown ? "" : "none";
                this.ijkLine.style.display = "none";
                this.kLine.style.display = this._shown && this.currentObject instanceof Core.Ball ? "" : "none";
                this.widthLine.style.display = this._shown && this.currentObject instanceof Core.MachinePart && this.currentObject.xExtendable ? "" : "none";
                this.heightLine.style.display = this._shown && this.currentObject instanceof Core.MachinePart && this.currentObject.yExtendable ? "" : "none";
                this.depthLine.style.display = this._shown && this.currentObject instanceof Core.MachinePart && this.currentObject.zExtendable ? "" : "none";
                this.countLine.style.display = this._shown && this.currentObject instanceof Core.MachinePart && this.currentObject.nExtendable ? "" : "none";
                this.colorLines[0].style.display = this._shown ? "" : "none";
                for (let i = 1; i < Core.colorSlotsCount; i++) {
                    this.colorLines[i].style.display = this._shown && this.currentObject instanceof Core.MachinePart && this.currentObject.colors.length > i ? "" : "none";
                }
                this.mirrorXLine.style.display = this._shown && this.currentObject instanceof Core.MachinePart && this.currentObject.xMirrorable ? "" : "none";
                this.mirrorZLine.style.display = this._shown && this.currentObject instanceof Core.MachinePart && this.currentObject.zMirrorable ? "" : "none";
                this.fillLine.style.display = this._shown && this.currentObject instanceof Core.Elevator ? "" : "none";
                this.focusLine.style.display = this._shown ? "" : "none";
                this.deleteLine.style.display = this._shown ? "" : "none";
                if (this.currentObject instanceof Core.MachinePart) {
                    this.titleElement.innerText = this.currentObject.partName;
                    this.ijkIElement.innerText = this.currentObject.i.toFixed(0);
                    this.ijkJElement.innerText = this.currentObject.j.toFixed(0);
                    this.ijkKElement.innerText = this.currentObject.k.toFixed(0);
                    this.wValue.innerText = this.currentObject.w.toFixed(0);
                    this.hValue.innerText = this.currentObject.h.toFixed(0);
                    this.dValue.innerText = this.currentObject.d.toFixed(0);
                    this.nValue.innerText = this.currentObject.n.toFixed(0);
                    for (let i = 0; i < this.currentObject.colors.length; i++) {
                        this.colorValues[i].innerText = this.currentObject.colors[i].toFixed(0);
                    }
                }
                else if (this.currentObject instanceof Core.Ball) {
                    this.titleElement.innerText = "Marble";
                    this.kElement.innerText = this.currentObject.k.toFixed(0);
                }
            }
        }
    }
}
class Arrow extends BABYLON.Mesh {
    constructor(name, game, baseSize = 0.1, dir) {
        super(name);
        this.game = game;
        this.baseSize = baseSize;
        this.dir = dir;
        this._update = () => {
            if (this.dir && this.isVisible) {
                let z = this.position.subtract(this.game.camera.globalPosition);
                Mummu.QuaternionFromYZAxisToRef(this.dir, z, this.rotationQuaternion);
            }
        };
        this.material = game.materials.handleMaterial;
        this.scaling.copyFromFloats(this.baseSize, this.baseSize, this.baseSize);
        if (this.dir) {
            this.rotationQuaternion = BABYLON.Quaternion.Identity();
        }
    }
    get size() {
        return this.scaling.x / this.baseSize;
    }
    set size(v) {
        let s = v * this.baseSize;
        this.scaling.copyFromFloats(s, s, s);
    }
    async instantiate() {
        let datas = await this.game.vertexDataLoader.get("./meshes/arrow.babylon");
        if (datas && datas[0]) {
            let data = datas[0];
            data.applyToMesh(this);
        }
        this.game.scene.onBeforeRenderObservable.add(this._update);
    }
    highlight() {
        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.White();
        this.outlineWidth = 0.05 * this.size;
    }
    unlit() {
        this.renderOutline = false;
    }
    dispose() {
        super.dispose();
        this.game.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
}
class CreditsPage {
    constructor(game) {
        this.game = game;
        this.container = document.getElementById("credits");
        this.container.style.display = "none";
        this.updateNode = new BABYLON.Node("credits-update-node");
    }
    async show() {
        if (this.container.style.display === "") {
            this.container.style.pointerEvents = "";
            return;
        }
        let anim = Mummu.AnimationFactory.CreateNumber(this.updateNode, this.container.style, "opacity", undefined, undefined, Nabu.Easing.easeInOutSine);
        this.container.style.display = "";
        await anim(1, 0.5);
        this.container.style.pointerEvents = "";
    }
    async hide() {
        if (this.container.style.display === "none") {
            this.container.style.pointerEvents = "none";
            return;
        }
        let anim = Mummu.AnimationFactory.CreateNumber(this.updateNode, this.container.style, "opacity", undefined, undefined, Nabu.Easing.easeInOutSine);
        this.container.style.display = "";
        await anim(0, 0.5);
        this.container.style.display = "none";
        this.container.style.pointerEvents = "none";
    }
}
var FloatingElementAnchor;
(function (FloatingElementAnchor) {
    FloatingElementAnchor[FloatingElementAnchor["CenterMiddle"] = 0] = "CenterMiddle";
    FloatingElementAnchor[FloatingElementAnchor["BottomCenter"] = 1] = "BottomCenter";
    FloatingElementAnchor[FloatingElementAnchor["LeftMiddle"] = 2] = "LeftMiddle";
    FloatingElementAnchor[FloatingElementAnchor["TopCenter"] = 3] = "TopCenter";
    FloatingElementAnchor[FloatingElementAnchor["RightMiddle"] = 4] = "RightMiddle";
    FloatingElementAnchor[FloatingElementAnchor["LeftBottom"] = 5] = "LeftBottom";
    FloatingElementAnchor[FloatingElementAnchor["LeftTop"] = 6] = "LeftTop";
    FloatingElementAnchor[FloatingElementAnchor["RightTop"] = 7] = "RightTop";
})(FloatingElementAnchor || (FloatingElementAnchor = {}));
class FloatingElement extends HTMLElement {
    constructor() {
        super();
        this._initialized = false;
        this.anchor = FloatingElementAnchor.BottomCenter;
        this.anchorMargin = 10;
        this._update = () => {
            if (!this._targetMesh && !this._targetPosition) {
                return;
            }
            if (this.style.display === "none") {
                return;
            }
            let p = this._targetPosition;
            if (!p) {
                p = this._targetMesh.absolutePosition;
            }
            let screenPos = BABYLON.Vector3.Project(p, BABYLON.Matrix.Identity(), this.game.scene.getTransformMatrix(), this.game.camera.viewport.toGlobal(1, 1));
            let dLeft = 0;
            let dBottom = 0;
            if (this.anchor === FloatingElementAnchor.CenterMiddle) {
                dLeft = -0.5 * this.clientWidth;
                dBottom = -0.5 * this.clientHeight;
            }
            if (this.anchor === FloatingElementAnchor.TopCenter) {
                dLeft = -0.5 * this.clientWidth;
                dBottom = -this.clientHeight - this.anchorMargin;
            }
            if (this.anchor === FloatingElementAnchor.LeftMiddle) {
                dLeft = this.anchorMargin;
                dBottom = -0.5 * this.clientHeight;
            }
            if (this.anchor === FloatingElementAnchor.BottomCenter) {
                dLeft = -0.5 * this.clientWidth;
                dBottom = this.anchorMargin;
            }
            if (this.anchor === FloatingElementAnchor.RightMiddle) {
                dLeft = -this.clientWidth - this.anchorMargin;
                dBottom = -0.5 * this.clientHeight;
            }
            if (this.anchor === FloatingElementAnchor.LeftBottom) {
                dLeft = this.anchorMargin;
                dBottom = this.anchorMargin;
            }
            if (this.anchor === FloatingElementAnchor.LeftTop) {
                dLeft = this.anchorMargin;
                dBottom = -this.clientHeight - this.anchorMargin;
            }
            if (this.anchor === FloatingElementAnchor.RightTop) {
                dLeft = -this.clientWidth - this.anchorMargin;
                dBottom = -this.clientHeight - this.anchorMargin;
            }
            this.style.left = (screenPos.x * this.game.canvas.width + dLeft).toFixed(0) + "px";
            this.style.bottom = ((1 - screenPos.y) * this.game.canvas.height + dBottom).toFixed(0) + "px";
        };
    }
    static Create(game) {
        let panel = document.createElement("floating-element");
        panel.game = game;
        document.body.appendChild(panel);
        return panel;
    }
    connectedCallback() {
        if (this._initialized) {
            return;
        }
        this._initialized = true;
    }
    dispose() {
        if (this._targetMesh) {
            this._targetMesh.getScene().onBeforeRenderObservable.removeCallback(this._update);
        }
        document.body.removeChild(this);
    }
    show() {
        this.style.display = "block";
    }
    hide() {
        this.style.display = "none";
    }
    setTarget(target) {
        this.style.position = "fixed";
        if (target instanceof BABYLON.Mesh) {
            this._targetMesh = target;
            this._targetPosition = undefined;
        }
        else if (target instanceof BABYLON.Vector3) {
            this._targetPosition = target;
            this._targetMesh = undefined;
        }
        this.game.scene.onAfterRenderObservable.add(this._update);
    }
}
window.customElements.define("floating-element", FloatingElement);
class HighlightArrow extends BABYLON.Mesh {
    constructor(name, game, baseSize = 0.1, distanceFromTarget = 0, dir) {
        super(name);
        this.game = game;
        this.baseSize = baseSize;
        this.dir = dir;
        this.AlphaAnimation = Mummu.AnimationFactory.EmptyNumberCallback;
        this._update = () => {
            if (this.dir && this.isVisible) {
                let y = this.position.subtract(this.game.camera.globalPosition);
                Mummu.QuaternionFromYZAxisToRef(y, this.dir, this.rotationQuaternion);
            }
        };
        this.arrowMesh = new BABYLON.Mesh("arrow");
        this.arrowMesh.parent = this;
        this.arrowMesh.position.z = -distanceFromTarget;
        this.arrowMesh.material = game.materials.whiteFullLitMaterial;
        this.arrowMesh.scaling.copyFromFloats(this.baseSize, this.baseSize, this.baseSize);
        this.arrowMesh.visibility = 0;
        if (this.dir) {
            this.rotationQuaternion = BABYLON.Quaternion.Identity();
        }
        this.AlphaAnimation = Mummu.AnimationFactory.CreateNumber(this.arrowMesh, this.arrowMesh, "visibility");
    }
    get size() {
        return this.arrowMesh.scaling.x / this.baseSize;
    }
    set size(v) {
        let s = v * this.baseSize;
        this.arrowMesh.scaling.copyFromFloats(s, s, s);
    }
    async instantiate() {
        let datas = await this.game.vertexDataLoader.get("./meshes/highlight-arrow.babylon");
        if (datas && datas[0]) {
            let data = datas[0];
            data.applyToMesh(this.arrowMesh);
        }
        this.game.scene.onBeforeRenderObservable.add(this._update);
    }
    show(duration) {
        return this.AlphaAnimation(0.7, duration);
    }
    hide(duration) {
        return this.AlphaAnimation(0, duration);
    }
    dispose() {
        super.dispose();
        this.game.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
}
var I18NTextLangs;
(function (I18NTextLangs) {
    I18NTextLangs[I18NTextLangs["English"] = 0] = "English";
    I18NTextLangs[I18NTextLangs["French"] = 1] = "French";
    I18NTextLangs[I18NTextLangs["Portuguese"] = 2] = "Portuguese";
    I18NTextLangs[I18NTextLangs["MAXIMUM"] = 3] = "MAXIMUM";
})(I18NTextLangs || (I18NTextLangs = {}));
var I18NTextLangNames = [
    "english",
    "français",
    "português"
];
var I18NTextLangFileNames = [
    "english",
    "french",
    "portuguese"
];
var I18NTextLangAttr = [
    "en",
    "fr",
    "pt"
];
class I18NText extends HTMLElement {
    constructor() {
        super(...arguments);
        this._attemps = 0;
    }
    static async GetMapForLang(lang) {
        let map = I18NText.LoadedLangs.get(lang);
        if (!map) {
            let dataResponse = await fetch(I18NText.LangFilesDir + "/" + I18NTextLangFileNames[lang] + ".json");
            if (dataResponse) {
                map = await dataResponse.json();
            }
            I18NText.LoadedLangs.set(lang, map);
        }
        return map;
    }
    static async GetTextForLang(lang, textKey) {
        let map = await this.GetMapForLang(lang);
        if (map) {
            let text = map[textKey];
            if (text) {
                return text;
            }
        }
        let fallbackMap = await this.GetMapForLang(I18NText.FallbackLang);
        if (fallbackMap) {
            let fallbackText = fallbackMap[textKey];
            if (fallbackText) {
                return fallbackText;
            }
        }
        return undefined;
    }
    static async SetCurrentLang(lang) {
        I18NText.CurrentLang = lang;
        let allTexts = document.querySelectorAll("i18n-text");
        await I18NText.GetMapForLang(lang);
        allTexts.forEach(text => {
            if (text instanceof I18NText) {
                text.setAttribute("lang", I18NTextLangAttr[lang]);
            }
        });
    }
    static get observedAttributes() {
        return [
            "lang",
            "text-key"
        ];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "lang") {
            let prevLang = this._lang;
            if (newValue === "en") {
                this._lang = I18NTextLangs.English;
            }
            else if (newValue === "fr") {
                this._lang = I18NTextLangs.French;
            }
            else if (newValue === "pt") {
                this._lang = I18NTextLangs.Portuguese;
            }
            if (this._lang != prevLang) {
                this.updateContent();
            }
        }
        else if (name === "text-key") {
            if (newValue != this._textKey) {
                this._textKey = newValue;
                this.updateContent();
            }
        }
    }
    connectedCallback() {
        if (!this.hasAttribute("lang")) {
            this.setAttribute("lang", I18NTextLangAttr[I18NText.CurrentLang]);
        }
    }
    async updateContent() {
        if (this._textKey && this._lang >= 0) {
            clearTimeout(this._retryTimeout);
            let text = await I18NText.GetTextForLang(this._lang, this._textKey);
            if (text === undefined) {
                this.innerHTML = "no text";
                this._attemps++;
                setTimeout(() => {
                    this.updateContent();
                }, this._attemps * 1000);
            }
            else {
                this.innerHTML = text;
                this._attemps = 0;
            }
        }
    }
}
I18NText.FallbackLang = I18NTextLangs.English;
I18NText.CurrentLang = I18NTextLangs.English;
I18NText.LoadedLangs = new Map();
customElements.define("i18n-text", I18NText);
class Logo {
    constructor(game) {
        this.game = game;
        this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.container.id = "logo";
        this.container.setAttribute("viewBox", "0 0 1000 350");
        this.container.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        this.container.style.opacity = "0";
        this.container.style.pointerEvents = "none";
        document.body.appendChild(this.container);
        this.fullScreenBanner = document.createElement("div");
        this.fullScreenBanner.id = "logo-banner";
        this.fullScreenBanner.style.opacity = "0";
        this.fullScreenBanner.style.pointerEvents = "none";
        document.body.appendChild(this.fullScreenBanner);
        this.updateNode = new BABYLON.Node("main-menu-update-node-logo");
        this.updateNodeBanner = new BABYLON.Node("main-menu-update-node-banner");
    }
    async show() {
        if (this.container.style.visibility === "visible") {
            if (this.fullScreenBanner.style.visibility === "visible") {
                return;
            }
        }
        let animContainer = Mummu.AnimationFactory.CreateNumber(this.updateNode, this.container.style, "opacity", undefined, undefined, Nabu.Easing.easeInOutSine);
        let animBanner = Mummu.AnimationFactory.CreateNumber(this.updateNodeBanner, this.fullScreenBanner.style, "opacity", undefined, undefined, Nabu.Easing.easeInOutSine);
        this.fullScreenBanner.style.visibility = "visible";
        this.container.style.visibility = "visible";
        animBanner(1, 1);
        await animContainer(1, 1);
    }
    async hide() {
        if (this.container.style.visibility === "hidden") {
            if (this.fullScreenBanner.style.visibility === "hidden") {
                return;
            }
        }
        let animContainer = Mummu.AnimationFactory.CreateNumber(this.updateNode, this.container.style, "opacity", undefined, undefined, Nabu.Easing.easeInOutSine);
        let animBanner = Mummu.AnimationFactory.CreateNumber(this.updateNodeBanner, this.fullScreenBanner.style, "opacity", undefined, undefined, Nabu.Easing.easeInOutSine);
        this.fullScreenBanner.style.visibility = "visible";
        this.container.style.visibility = "visible";
        animBanner(0, 0.5);
        await animContainer(0, 0.5);
        this.fullScreenBanner.style.visibility = "hidden";
        this.container.style.visibility = "hidden";
    }
    initialize() {
        this.container.innerHTML = `
            <linearGradient id="steel-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#313a42" />
                <stop offset="50%" stop-color="#abc3d6"/>
                <stop offset="100%" stop-color="#313a42" />
            </linearGradient>
            <linearGradient id="copper-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#633204" />
                <stop offset="50%" stop-color="#dec3ab"/>
                <stop offset="100%" stop-color="#633204" />
            </linearGradient>
        `;
        let img = document.createElementNS("http://www.w3.org/2000/svg", "image");
        img.setAttribute("x", "100");
        img.setAttribute("y", "-200");
        img.setAttribute("width", "800");
        img.setAttribute("height", "800");
        img.setAttribute("href", "./lib/marble-run-simulator-core/datas/textures/edited-background.png");
        this.container.appendChild(img);
        let titleBack = document.createElementNS("http://www.w3.org/2000/svg", "text");
        titleBack.id = "logo-title-back";
        titleBack.classList.add("logo-title");
        titleBack.setAttribute("text-anchor", "middle");
        titleBack.setAttribute("x", "500");
        titleBack.setAttribute("y", "200");
        titleBack.setAttribute("transform-origin", "500 200");
        titleBack.setAttribute("transform", "scale(1 1.2)");
        titleBack.innerHTML = "MARBLE RUN";
        this.container.appendChild(titleBack);
        let title = document.createElementNS("http://www.w3.org/2000/svg", "text");
        title.id = "logo-title";
        title.classList.add("logo-title");
        title.setAttribute("text-anchor", "middle");
        title.setAttribute("x", "500");
        title.setAttribute("y", "200");
        title.setAttribute("transform-origin", "500 200");
        title.setAttribute("transform", "scale(1 1.2)");
        title.innerHTML = "MARBLE RUN";
        this.container.appendChild(title);
        let subtitleBack = document.createElementNS("http://www.w3.org/2000/svg", "text");
        subtitleBack.id = "logo-subtitle-back";
        subtitleBack.classList.add("logo-subtitle");
        subtitleBack.setAttribute("text-anchor", "middle");
        subtitleBack.setAttribute("x", "600");
        subtitleBack.setAttribute("y", "270");
        subtitleBack.innerHTML = "SIMULATOR";
        this.container.appendChild(subtitleBack);
        let subtitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
        subtitle.id = "logo-subtitle";
        subtitle.classList.add("logo-subtitle");
        subtitle.setAttribute("text-anchor", "middle");
        subtitle.setAttribute("x", "600");
        subtitle.setAttribute("y", "270");
        subtitle.innerHTML = "SIMULATOR";
        this.container.appendChild(subtitle);
        let earlyAccessDisclaimer = document.createElementNS("http://www.w3.org/2000/svg", "text");
        earlyAccessDisclaimer.setAttribute("text-anchor", "end");
        earlyAccessDisclaimer.setAttribute("x", "340");
        earlyAccessDisclaimer.setAttribute("y", "260");
        earlyAccessDisclaimer.setAttribute("fill", "white");
        earlyAccessDisclaimer.setAttribute("font-family", "Consolas");
        earlyAccessDisclaimer.setAttribute("font-size", "26px");
        earlyAccessDisclaimer.innerHTML = "> v0.2.1 early access";
        this.container.appendChild(earlyAccessDisclaimer);
        this.fullScreenBanner.style.visibility = "hidden";
        this.container.style.visibility = "hidden";
    }
}
class MarbleRouter extends Nabu.Router {
    constructor(game) {
        super();
        this.game = game;
    }
    onFindAllPages() {
        this.homePage = document.getElementById("main-menu");
        this.challengePage = document.getElementById("challenge-menu");
        this.creditsPage = this.game.creditsPage;
        this.optionsPage = document.getElementById("option-page");
        this.pages.push(this.creditsPage);
        this.pages.push(this.optionsPage);
        this.pages.push(this.game.challenge.tutoPopup);
        this.pages.push(this.game.challenge.tutoComplete);
    }
    onUpdate() {
    }
    async onHRefChange(page) {
        this.game.machineEditor.dispose();
        if (page.startsWith("#options")) {
            this.game.machine.play();
            this.game.mode = GameMode.Page;
            this.game.setCameraMode(this.game.menuCameraMode);
            this.game.logo.show();
            this.show(this.optionsPage);
        }
        else if (page.startsWith("#credits")) {
            this.game.machine.play();
            this.game.mode = GameMode.Page;
            this.game.setCameraMode(this.game.menuCameraMode);
            this.game.logo.show();
            this.show(this.creditsPage);
        }
        else if (page.startsWith("#challenge-menu")) {
            this.game.machine.play();
            this.game.mode = GameMode.Page;
            this.game.setCameraMode(this.game.menuCameraMode);
            this.game.logo.show();
            this.show(this.challengePage);
        }
        else if (page.startsWith("#editor")) {
            this.game.mode = GameMode.Create;
            this.game.setCameraMode(CameraMode.None);
            this.game.machine.stop();
            this.game.machine.setAllIsSelectable(true);
            this.game.logo.hide();
            this.hideAll();
            this.game.machineEditor.instantiate();
        }
        else if (page.startsWith("#demo-")) {
            let index = parseInt(page.replace("#demo-", ""));
            this.game.mode = GameMode.Demo;
            this.game.setCameraMode(CameraMode.Landscape);
            this.game.logo.hide();
            this.hideAll();
            let dataResponse = await fetch("./datas/demos/demo-" + index.toFixed() + ".json");
            if (dataResponse) {
                let data = await dataResponse.json();
                if (data) {
                    this.game.machine.dispose();
                    this.game.machine.deserialize(data);
                    this.game.machine.generateBaseMesh();
                    this.game.machine.instantiate().then(() => { this.game.machine.play(); });
                }
            }
        }
        else if (page.startsWith("#challenge-")) {
            let index = parseInt(page.replace("#challenge-", ""));
            this.game.mode = GameMode.Challenge;
            let dataResponse = await fetch("./datas/challenges/challenge-" + index.toFixed() + ".json");
            if (dataResponse) {
                let data = await dataResponse.json();
                if (data) {
                    data.index = index;
                    let ratio = this.game.engine.getRenderWidth() / this.game.engine.getRenderHeight();
                    let radiusFactor = Math.max(1, 1 / ratio) * 1.1;
                    this.game.animateCamera([data.camAlpha, data.camBeta, data.camRadius * radiusFactor], 3);
                    this.game.animateCameraTarget(new BABYLON.Vector3(data.camTarget.x, data.camTarget.y, data.camTarget.z), 3);
                    this.game.setCameraMode(CameraMode.None);
                    this.game.logo.hide();
                    this.hideAll();
                    this.game.machine.stop();
                    this.game.machine.dispose();
                    this.game.machine.deserialize(data.machine);
                    this.game.machine.generateBaseMesh();
                    this.game.machine.instantiate().then(() => { this.game.machine.setAllIsSelectable(false); });
                    this.game.challenge.availableElements = data.elements;
                    this.game.machineEditor.instantiate();
                    this.game.challenge.initialize(data);
                }
            }
        }
        else if (page.startsWith("#home") || true) {
            this.game.machine.play();
            this.game.mode = GameMode.Home;
            this.game.logo.show();
            this.show(this.homePage);
        }
        this.game.toolbar.closeAllDropdowns();
        this.game.topbar.resize();
        this.game.toolbar.resize();
        this.game.machine.regenerateBaseAxis();
    }
}
class SvgArrow {
    constructor(name, game, baseSize = 0.1, distanceFromTarget = 0, dirInDegrees) {
        this.game = game;
        this.baseSize = baseSize;
        this.distanceFromTarget = distanceFromTarget;
        this.dirInDegrees = dirInDegrees;
        this._animationSlideInterval = 0;
        this.image = document.createElement("nabu-popup");
        this.image.style.position = "fixed";
        this.image.style.transformOrigin = "center";
        this.image.style.transform = "rotate(" + this.dirInDegrees + "deg)";
        this.image.style.pointerEvents = "none";
        document.body.appendChild(this.image);
    }
    setTarget(e) {
        let rect = e.getBoundingClientRect();
        this.image.style.top = (rect.top + rect.height * 0.5 - this._w * 1.5 * 0.5).toFixed(1) + "px";
        this.image.style.left = (rect.left + rect.width * 0.5 - this._w * 0.5).toFixed(1) + "px";
    }
    setTargetXY(x, y) {
        this.image.style.left = x.toFixed(1) + "px";
        this.image.style.top = y.toFixed(1) + "px";
    }
    async instantiate() {
        this.image.innerHTML = `
            <svg viewBox="0 0 200 300">
                <path d="M100 150 L125 200 L109 200 L109 250 L91 250 L91 200 L75 200 Z" fill="#baccc8" stroke="#baccc8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        `;
        let svg = this.image.querySelector("svg");
        this._w = (Math.min(window.innerWidth, window.innerHeight) * this.baseSize);
        svg.style.width = this._w.toFixed(1) + "px";
        let d = (Math.min(window.innerWidth, window.innerHeight) * this.baseSize * this.distanceFromTarget);
        svg.style.transform = "translate(0px, " + d.toFixed(1) + "px)";
    }
    show(duration) {
        return this.image.show(duration);
    }
    hide(duration) {
        return this.image.hide(duration);
    }
    async slide(x, y, targetDir, duration = 1, easing) {
        return new Promise(resolve => {
            clearInterval(this._animationSlideInterval);
            let x0 = parseFloat(this.image.style.left);
            let y0 = parseFloat(this.image.style.top);
            let x1 = x - this._w * 0.5;
            let y1 = y - this._w * 1.5 * 0.5;
            let dir0 = this.dirInDegrees;
            let t0 = performance.now() / 1000;
            this._animationSlideInterval = setInterval(() => {
                let t = performance.now() / 1000 - t0;
                if (t >= duration) {
                    clearInterval(this._animationSlideInterval);
                    this.dirInDegrees = targetDir;
                    this.image.style.transform = "rotate(" + this.dirInDegrees + "deg)";
                    this.image.style.left = x1.toFixed(1) + "px";
                    this.image.style.top = y1.toFixed(1) + "px";
                    resolve();
                }
                else {
                    let f = t / duration;
                    if (easing) {
                        f = easing(f);
                    }
                    this.dirInDegrees = (1 - f) * dir0 + f * targetDir;
                    this.image.style.transform = "rotate(" + this.dirInDegrees + "deg)";
                    this.image.style.left = ((1 - f) * x0 + f * x1).toFixed(1) + "px";
                    this.image.style.top = ((1 - f) * y0 + f * y1).toFixed(1) + "px";
                }
            }, 15);
        });
    }
    dispose() {
        document.body.removeChild(this.image);
    }
}
class Toolbar {
    constructor(game) {
        this.game = game;
        this.camModeInputShown = false;
        this.timeFactorInputShown = false;
        this.loadInputShown = false;
        this.soundInputShown = false;
        this.zoomInputShown = false;
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
            if (this.zoomInputShown) {
                this.zoomInput.value = this.game.getCameraZoomFactor().toFixed(3);
            }
            if (this.camModeInputShown) {
                if (this.game.cameraMode === CameraMode.None) {
                    this.camValue.innerText = "None";
                }
                else if (this.game.cameraMode === CameraMode.Ball) {
                    this.camValue.innerText = "Ball";
                }
                else if (this.game.cameraMode === CameraMode.Landscape) {
                    this.camValue.innerText = "Landscape";
                }
                else if (this.game.cameraMode === CameraMode.Selected) {
                    this.camValue.innerText = "Selected";
                }
            }
        };
        this.onPlay = () => {
            this.game.machine.playing = true;
            if (this.game.machineEditor) {
                this.game.machineEditor.setSelectedObject(undefined);
            }
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
        this.onCamButton = () => {
            this.camModeInputShown = !this.camModeInputShown;
            this.resize();
        };
        this.onCamPrevButton = () => {
            this.game.setCameraMode(this.game.cameraMode - 1);
            this.resize();
        };
        this.onCamNextButton = () => {
            this.game.setCameraMode(this.game.cameraMode + 1);
            this.resize();
        };
        this.onSave = () => {
            let data = this.game.machine.serialize();
            window.localStorage.setItem("last-saved-machine", JSON.stringify(data));
            Nabu.download("my-marble-machine.json", JSON.stringify(data));
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
                reader.addEventListener('load', (event) => {
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
        this.onZoomButton = () => {
            this.zoomInputShown = !this.zoomInputShown;
            this.resize();
        };
        this.onZoomInput = (e) => {
            this.game.setCameraZoomFactor(parseFloat(e.target.value));
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
            if (this.camModeInputShown || this.timeFactorInputShown || this.loadInputShown || this.soundInputShown || this.zoomInputShown) {
                this.camModeInputShown = false;
                this.timeFactorInputShown = false;
                this.loadInputShown = false;
                this.soundInputShown = false;
                this.zoomInputShown = false;
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
        this.camButton = document.querySelector("#toolbar-cam-mode");
        this.camButton.addEventListener("click", this.onCamButton);
        this.camButtonPrev = document.querySelector("#toolbar-cam-mode-prev");
        this.camButtonPrev.addEventListener("click", this.onCamPrevButton);
        this.camValue = document.querySelector("#toolbar-cam-mode-value");
        this.camButtonNext = document.querySelector("#toolbar-cam-mode-next");
        this.camButtonNext.addEventListener("click", this.onCamNextButton);
        this.camInputContainer = this.camValue.parentElement;
        this.timeFactorInput = document.querySelector("#time-factor-value");
        this.timeFactorInput.value = this.game.targetTimeFactor.toFixed(2);
        this.timeFactorInput.addEventListener("input", this.onTimeFactorInput);
        this.timeFactorInputContainer = this.timeFactorInput.parentElement;
        this.saveButton = document.querySelector("#toolbar-save");
        this.saveButton.addEventListener("click", this.onSave);
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
        this.zoomButton = document.querySelector("#toolbar-zoom");
        this.zoomButton.addEventListener("click", this.onZoomButton);
        this.zoomInput = document.querySelector("#zoom-value");
        this.zoomInput.value = this.game.getCameraZoomFactor().toFixed(3);
        this.zoomInput.addEventListener("input", this.onZoomInput);
        this.zoomInputContainer = this.zoomInput.parentElement;
        this.layerButton = document.querySelector("#toolbar-layer");
        this.layerButton.addEventListener("click", this.onLayer);
        this.backButton = document.querySelector("#toolbar-back");
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
            this.loadButton.style.display = "none";
            this.loadInputShown = false;
            this.backButton.style.display = "none";
        }
        else if (this.game.mode === GameMode.Page) {
            this.saveButton.style.display = "none";
            this.loadButton.style.display = "none";
            this.loadInputShown = false;
            this.backButton.style.display = "";
        }
        else if (this.game.mode === GameMode.Create) {
            this.saveButton.style.display = "";
            this.loadButton.style.display = "";
            this.backButton.style.display = "";
        }
        else if (this.game.mode === GameMode.Challenge) {
            this.saveButton.style.display = "none";
            this.loadButton.style.display = "none";
            this.loadInputShown = false;
            this.backButton.style.display = "";
        }
        else if (this.game.mode === GameMode.Demo) {
            this.saveButton.style.display = "none";
            this.loadButton.style.display = "none";
            this.loadInputShown = false;
            this.backButton.style.display = "";
        }
        this.camButton.style.display = "none";
    }
    resize() {
        this.updateButtonsVisibility();
        let margin = 10;
        this.container.style.bottom = "10px";
        if (this.game.screenRatio < 1) {
            let objectsElement = document.getElementById("machine-editor-objects");
            if (objectsElement.style.display != "none") {
                let h = objectsElement.getBoundingClientRect().height;
                this.container.style.bottom = (h + 10).toFixed(0) + "px";
            }
        }
        let containerWidth = this.container.clientWidth;
        this.container.style.left = ((this.game.engine.getRenderWidth() - containerWidth) * 0.5) + "px";
        this.camInputContainer.style.display = this.camModeInputShown ? "" : "none";
        let rectButton = this.camButton.getBoundingClientRect();
        let rectContainer = this.camInputContainer.getBoundingClientRect();
        this.camInputContainer.style.left = (rectButton.left).toFixed(0) + "px";
        this.camInputContainer.style.top = (rectButton.top - rectContainer.height - margin).toFixed(0) + "px";
        this.timeFactorInputContainer.style.display = this.timeFactorInputShown ? "" : "none";
        rectButton = this.timeFactorButton.getBoundingClientRect();
        rectContainer = this.timeFactorInputContainer.getBoundingClientRect();
        this.timeFactorInputContainer.style.left = (rectButton.left).toFixed(0) + "px";
        this.timeFactorInputContainer.style.top = (rectButton.top - rectContainer.height - margin).toFixed(0) + "px";
        this.loadInputContainer.style.display = this.loadInputShown ? "" : "none";
        rectButton = this.loadButton.getBoundingClientRect();
        rectContainer = this.loadInputContainer.getBoundingClientRect();
        this.loadInputContainer.style.left = (rectButton.left).toFixed(0) + "px";
        this.loadInputContainer.style.top = (rectButton.top - rectContainer.height - margin).toFixed(0) + "px";
        this.soundInputContainer.style.display = this.soundInputShown ? "" : "none";
        rectButton = this.soundButton.getBoundingClientRect();
        rectContainer = this.soundInputContainer.getBoundingClientRect();
        this.soundInputContainer.style.left = (rectButton.left).toFixed(0) + "px";
        this.soundInputContainer.style.top = (rectButton.top - rectContainer.height - margin).toFixed(0) + "px";
        this.zoomInputContainer.style.display = this.zoomInputShown ? "" : "none";
        rectButton = this.zoomButton.getBoundingClientRect();
        rectContainer = this.zoomInputContainer.getBoundingClientRect();
        this.zoomInputContainer.style.left = (rectButton.left).toFixed(0) + "px";
        this.zoomInputContainer.style.top = (rectButton.top - rectContainer.height - margin).toFixed(0) + "px";
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
        for (let i = 0; i < this.camModeButtons.length; i++) {
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
        if (this.game.screenRatio > 1) {
            let objectsElement = document.getElementById("machine-editor-objects");
            if (objectsElement.style.display != "none") {
                let w = objectsElement.getBoundingClientRect().width;
                this.container.style.left = w.toFixed(0) + "px";
                this.container.style.width = "";
            }
            else {
                this.container.style.left = "0";
            }
        }
        else {
            this.container.style.left = "0px";
            this.container.style.width = "13.5vh";
        }
        this.camModeButtons.forEach(button => {
            button.classList.remove("active");
        });
        if (this.camModeButtons[this.game.cameraMode]) {
            this.camModeButtons[this.game.cameraMode].classList.add("active");
        }
    }
}
