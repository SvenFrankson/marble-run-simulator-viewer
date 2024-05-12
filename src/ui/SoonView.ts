class SoonView extends HTMLElement implements Nabu.IPage {

    public static get observedAttributes() {
        return [];
    }

    public game: Game;

    private _loaded: boolean = false;
    private _shown: boolean = false;
    public get shown(): boolean {
        return this._shown;
    }

    private _title: HTMLHeadingElement;
    private _shareInfo: HTMLDivElement;
    private _saveInfo: HTMLDivElement;
    private _returnBtn: HTMLButtonElement;
    private _options: HTMLButtonElement[];

    private _onLoad: () => void;
    public get onLoad(): () => void {
        return this._onLoad;
    }
    public set onLoad(callback: () => void) {
        this._onLoad = callback;
        if (this._loaded) {
            this._onLoad();
        }
    }

    public currentPointers: number = 0;
    public currentPointerUp(): void {
        if (this._options.length > 0) {
            this.setPointer((this.currentPointers - 1 + this._options.length) % this._options.length);
        }
    }
    public currentPointerDown(): void {
        if (this._options.length > 0) {
            this.setPointer((this.currentPointers + 1) % this._options.length);
        }
    }
    public setPointer(n: number): void {
        if (this._options[this.currentPointers]) {
            this._options[this.currentPointers].classList.remove("highlit");
        }
        this.currentPointers = n;
        if (this._options[this.currentPointers]) {
            this._options[this.currentPointers].classList.add("highlit");
        }
    }

    public connectedCallback(): void {
        this.style.display = "none";
        this.style.opacity = "0";

        this._title = document.createElement("h1");
        this._title.classList.add("soon-menu-title");
        this._title.innerHTML = "Coming soon !";
        this.appendChild(this._title);

        let categoriesContainer: HTMLDivElement;
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
        }

        this._options = [
            this._returnBtn
        ]
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string) {}

    public onNextHide: () => void;

    public async show(duration: number = 1): Promise<void> {
        return new Promise<void>((resolve) => {
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
                    } else {
                        let f = dt / duration;
                        this.style.opacity = ((1 - f) * opacity0 + f * opacity1).toFixed(2);
                        requestAnimationFrame(step);
                    }
                };
                step();
            }
        });
    }

    public async hide(duration: number = 1): Promise<void> {
        if (duration === 0) {
            this._shown = false;
            this.style.display = "none";
            this.style.opacity = "0";
        } else {
            return new Promise<void>((resolve) => {
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
                        } else {
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

    public generatedUrl: string = "";
    public isShared: boolean = false;

    public setGame(game: Game): void {
        this.game = game;
    }

    private _timer: number = 0;
    public update(dt: number): void {
        if (this._timer > 0) {
            this._timer -= dt;
        }
        let gamepads = navigator.getGamepads();
        let gamepad = gamepads[0];
        if (gamepad) {
            let axis1 = - Nabu.InputManager.DeadZoneAxis(gamepad.axes[1]);
            if (axis1 > 0.5) {
                if (this._timer <= 0) {
                    this.currentPointerUp();
                    this._timer = 0.5;
                }
            }
            else if (axis1 < - 0.5) {
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
