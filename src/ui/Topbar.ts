class Topbar {
    public container: HTMLDivElement;

    private _shown: boolean = true;
    public showHideButton: HTMLButtonElement;
    public camModeButtons: HTMLButtonElement[] = [];

    constructor(public game: Game) {}

    public initialize(): void {
        this.container = document.querySelector("#topbar") as HTMLDivElement;
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

    public dispose(): void {
        this.game.scene.onBeforeRenderObservable.removeCallback(this._udpate);
    }

    public updateButtonsVisibility(): void {
        for (let i = 0; i < this.camModeButtons.length; i++) {
            this.camModeButtons[i].style.display = this._shown ? "" : "none";
        }
        this.container.style.display = "block";
        if (this._shown) {
            this.camModeButtons[CameraMode.Selected].style.display = "none";
        }
    }

    public resize(): void {
        this.updateButtonsVisibility();
        if (this.game.screenRatio > 1) {
            this.container.style.left = "0";
        } else {
            this.container.style.left = "0px";
            this.container.style.width = "13.5vh";
        }

        this.camModeButtons.forEach((button) => {
            button.classList.remove("active");
        });
        if (this.camModeButtons[this.game.cameraMode]) {
            this.camModeButtons[this.game.cameraMode].classList.add("active");
        }
    }

    private _lastPlaying: boolean;
    public _udpate = () => {};
}
