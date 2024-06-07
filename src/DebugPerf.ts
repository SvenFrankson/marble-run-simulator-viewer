class DebugPerf {
    
    private _initialized: boolean = false;
    public get initialized(): boolean {
        return this._initialized;
    }

    public debugContainer: HTMLDivElement;
    public container: HTMLDivElement;

    private _frameRate: Nabu.DebugDisplayFrameValue;
    private _meshesCount: Nabu.DebugDisplayTextValue;
    private _trianglesCount: Nabu.DebugDisplayTextValue;

    public get scene(): BABYLON.Scene {
        return this.main.scene;
    }

    constructor(public main: Game, private _showLayer: boolean = false) {

    }

    public initialize(): void {
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
        this._frameRate = document.querySelector(frameRateId) as Nabu.DebugDisplayFrameValue;
        if (!this._frameRate) {
            this._frameRate = document.createElement("debug-display-frame-value") as Nabu.DebugDisplayFrameValue;
            this._frameRate.id = frameRateId;
            this._frameRate.setAttribute("label", "Frame Rate");
            this._frameRate.setAttribute("min", "0");
            this._frameRate.setAttribute("max", "144");
            this.container.appendChild(this._frameRate);
        }

        let meshesCountId = "#meshes-count";
        this._meshesCount = document.querySelector(meshesCountId) as Nabu.DebugDisplayTextValue;
        if (!this._meshesCount) {
            this._meshesCount = document.createElement("debug-display-text-value") as Nabu.DebugDisplayTextValue;
            this._meshesCount.id = meshesCountId;
            this._meshesCount.setAttribute("label", "Meshes Count");
            this.container.appendChild(this._meshesCount);
        }

        let trianglesCountId = "#triangles-count";
        this._trianglesCount = document.querySelector(trianglesCountId) as Nabu.DebugDisplayTextValue;
        if (!this._trianglesCount) {
            this._trianglesCount = document.createElement("debug-display-text-value") as Nabu.DebugDisplayTextValue;
            this._trianglesCount.id = trianglesCountId;
            this._trianglesCount.setAttribute("label", "Tris Count");
            this.container.appendChild(this._trianglesCount);
        }

        this._initialized = true;
    }

    private _counter: number = 0;
    private _update = () => {
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
            })
            this._trianglesCount.setText(globalTriCount.toFixed(0));
        }
    }

    public show(): void {
        if (!this.initialized) {
            this.initialize();
        }
        this.container.classList.remove("hidden");
        this.scene.onBeforeRenderObservable.add(this._update);
    }

    public hide(): void {
        this.container.classList.add("hidden");
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
}