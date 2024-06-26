class Toolbar {
    public container: HTMLDivElement;
    public playButton: HTMLButtonElement;
    public pauseButton: HTMLButtonElement;
    public stopButton: HTMLButtonElement;

    public timeFactorButton: HTMLButtonElement;
    public timeFactorValue: HTMLSpanElement;
    public timeFactorInputContainer: HTMLDivElement;
    public timeFactorInput: HTMLInputElement;
    public saveButton: HTMLButtonElement;
    public shareButton: HTMLButtonElement;
    public loadButton: HTMLButtonElement;
    public loadInputContainer: HTMLDivElement;
    public loadInput: HTMLInputElement;
    public soundButton: HTMLButtonElement;
    public soundInputContainer: HTMLDivElement;
    public soundInput: HTMLInputElement;
    public zoomOutButton: HTMLButtonElement;
    public zoomInButton: HTMLButtonElement;
    public layerButton: HTMLButtonElement;
    public editButton: HTMLButtonElement;

    public timeFactorInputShown: boolean = false;
    public loadInputShown: boolean = false;
    public soundInputShown: boolean = false;

    constructor(public game: Game) {}

    public initialize(): void {
        this.container = document.querySelector("#toolbar") as HTMLDivElement;
        this.container.style.display = "block";

        this.playButton = document.querySelector("#toolbar-play") as HTMLButtonElement;
        this.playButton.addEventListener("click", this.onPlay);

        this.pauseButton = document.querySelector("#toolbar-pause") as HTMLButtonElement;
        this.pauseButton.addEventListener("click", this.onPause);

        this.stopButton = document.querySelector("#toolbar-stop") as HTMLButtonElement;
        this.stopButton.addEventListener("click", this.onStop);

        this.timeFactorButton = document.querySelector("#toolbar-time-factor") as HTMLButtonElement;
        this.timeFactorButton.addEventListener("click", this.onTimeFactorButton);

        this.timeFactorValue = document.querySelector("#toolbar-time-factor .value") as HTMLSpanElement;

        this.timeFactorInput = document.querySelector("#time-factor-value") as HTMLInputElement;
        this.timeFactorInput.value = this.game.targetTimeFactor.toFixed(2);
        this.timeFactorInput.addEventListener("input", this.onTimeFactorInput);

        this.timeFactorInputContainer = this.timeFactorInput.parentElement as HTMLDivElement;

        this.saveButton = document.querySelector("#toolbar-save") as HTMLButtonElement;
        this.saveButton.addEventListener("click", this.onSave);

        this.shareButton = document.querySelector("#toolbar-share") as HTMLButtonElement;
        this.shareButton.addEventListener("click", this.onShare);

        this.loadButton = document.querySelector("#toolbar-load") as HTMLButtonElement;
        this.loadButton.addEventListener("click", this.onLoad);

        this.loadInput = document.querySelector("#load-input") as HTMLInputElement;
        this.loadInput.addEventListener("input", this.onLoadInput);

        this.loadInputContainer = this.loadInput.parentElement as HTMLDivElement;

        this.soundButton = document.querySelector("#toolbar-sound") as HTMLButtonElement;
        this.soundButton.addEventListener("click", this.onSoundButton);

        this.soundInput = document.querySelector("#sound-value") as HTMLInputElement;
        this.soundInput.value = this.game.mainVolume.toFixed(2);
        this.soundInput.addEventListener("input", this.onSoundInput);

        this.soundInputContainer = this.soundInput.parentElement as HTMLDivElement;

        this.zoomOutButton = document.querySelector("#toolbar-zoom-out") as HTMLButtonElement;
        this.zoomOutButton.addEventListener("click", this.onZoomOutButton);

        this.zoomInButton = document.querySelector("#toolbar-zoom-in") as HTMLButtonElement;
        this.zoomInButton.addEventListener("click", this.onZoomInButton);

        this.layerButton = document.querySelector("#toolbar-layer") as HTMLButtonElement;
        this.layerButton.addEventListener("click", this.onLayer);

        this.editButton = document.querySelector("#toolbar-edit") as HTMLButtonElement;
        this.editButton.addEventListener("click", () => {
            this.game.soonView.show();
        })

        this.resize();

        this.game.canvas.addEventListener("pointerdown", this.closeAllDropdowns);
        this.game.scene.onBeforeRenderObservable.add(this._udpate);
    }

    public dispose(): void {
        this.game.canvas.removeEventListener("pointerdown", this.closeAllDropdowns);
        this.game.scene.onBeforeRenderObservable.removeCallback(this._udpate);
    }

    public updateButtonsVisibility(): void {
        if (this.game.mode === GameMode.Home) {
            this.saveButton.style.display = "none";
            this.shareButton.style.display = "none";
            this.loadButton.style.display = "none";
            this.loadInputShown = false;
            this.editButton.style.display = "none";
        } else if (this.game.mode === GameMode.Page) {
            this.saveButton.style.display = "none";
            this.shareButton.style.display = "none";
            this.loadButton.style.display = "none";
            this.loadInputShown = false;
            this.editButton.style.display = "none";
        } else if (this.game.mode === GameMode.Create) {
            this.saveButton.style.display = "";
            this.shareButton.style.display = "";
            this.loadButton.style.display = "";
            this.editButton.style.display = "none";
        } else if (this.game.mode === GameMode.Challenge) {
            this.saveButton.style.display = "none";
            this.shareButton.style.display = "none";
            this.loadButton.style.display = "none";
            this.loadInputShown = false;
            this.editButton.style.display = this.game.DEBUG_MODE ? "" : "none";
        } else if (this.game.mode === GameMode.Demo) {
            this.saveButton.style.display = "none";
            this.shareButton.style.display = "none";
            this.loadButton.style.display = "none";
            this.loadInputShown = false;
            this.editButton.style.display = "";
        }
    }

    public resize(): void {
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
        })
    }

    private _lastPlaying: boolean;
    public _udpate = () => {
        if (this.game.machine) {
            if (this.game.machine.playing != this._lastPlaying) {
                if (this.game.machine.playing) {
                    this.playButton.style.display = "none";
                    this.pauseButton.style.display = "";
                } else {
                    this.playButton.style.display = "";
                    this.pauseButton.style.display = "none";
                }
                this._lastPlaying = this.game.machine.playing;
                this.resize();
            }
            this.timeFactorValue.innerText = this.game.currentTimeFactor.toFixed(2);
        }
    };

    public onPlay = () => {
        this.game.machine.playing = true;
    };

    public onPause = () => {
        this.game.machine.playing = false;
    };

    public onStop = () => {
        this.game.machine.stop();
    };

    public onTimeFactorButton = () => {
        this.timeFactorInputShown = !this.timeFactorInputShown;
        this.resize();
    };

    public onTimeFactorInput = (e: InputEvent) => {
        this.game.targetTimeFactor = parseFloat((e.target as HTMLInputElement).value);
    };

    public onCamPrevButton = () => {
        this.game.setCameraMode(this.game.cameraMode - 1);
        this.resize();
    };

    public onCamNextButton = () => {
        this.game.setCameraMode(this.game.cameraMode + 1);
        this.resize();
    };

    public onSave = async () => {
        let data = this.game.machine.serialize();
        let dataString = JSON.stringify(data);
        window.localStorage.setItem("last-saved-machine", dataString);
        Nabu.download(this.game.machine.name + ".json", dataString);
    };

    public onShare = async () => {
        this.game.soonView.show();
    };

    public onLoad = () => {
        this.loadInputShown = !this.loadInputShown;
        this.resize();
    };

    public onLoadInput = (event: Event) => {
        let files = (event.target as HTMLInputElement).files;
        let file = files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener("load", (event) => {
                this.game.machine.dispose();
                this.game.machine.deserialize(JSON.parse(event.target.result as string));
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

    public onSoundButton = () => {
        this.soundInputShown = !this.soundInputShown;
        this.resize();
    };

    public onSoundInput = (e: InputEvent) => {
        this.game.mainVolume = parseFloat((e.target as HTMLInputElement).value);
    };

    public onZoomOutButton = () => {
        this.game.setCameraZoomFactor(this.game.getCameraZoomFactor() - 0.05);
    };

    public onZoomInButton = () => {
        this.game.setCameraZoomFactor(this.game.getCameraZoomFactor() + 0.05);
    };

    public onLayer = (e: PointerEvent) => {
        let rect = this.layerButton.getBoundingClientRect();
        let centerY = rect.top + rect.height * 0.5;
        if (e.y > centerY) {
            //this.game.machineEditor.currentLayer++;
        } else {
            //this.game.machineEditor.currentLayer--;
        }
    };

    public closeAllDropdowns = () => {
        if (this.timeFactorInputShown || this.loadInputShown || this.soundInputShown) {
            this.timeFactorInputShown = false;
            this.loadInputShown = false;
            this.soundInputShown = false;
            this.resize();
        }
    };
}
