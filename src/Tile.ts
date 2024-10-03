enum TileStatus {
    Active,
    Next,
    Inactive,
    Proxy,
    Unset
}

class TileManager {

    public setActiveTasks: Nabu.UniqueList<Tile> = new Nabu.UniqueList<Tile>();
    public setNextTasks: Nabu.UniqueList<Tile> = new Nabu.UniqueList<Tile>();
    public setInactiveTasks: Nabu.UniqueList<Tile> = new Nabu.UniqueList<Tile>();
    public setProxyTasks: Nabu.UniqueList<Tile> = new Nabu.UniqueList<Tile>();

    private async taskStatusActive(tile: Tile): Promise<void> {
        if (!tile.deserialize) {
            return;
        }
        if (tile.status === TileStatus.Active) {
            return;
        }

        if (!tile.machine) {
            tile.machine = new Core.Machine(tile.game);
            tile.machine.baseColor = tile.machineBaseColor;
            tile.machine.root.position.copyFrom(tile.position).addInPlaceFromFloats(0, 0.7, 0);
            tile.machine.root.computeWorldMatrix(true);
        }

        if (tile.machine.parts.length === 0) {
            await tile.deserialize();
        }
        
        if (!tile.machine.ready) {
            tile.machine.generateBaseMesh();
        }
        tile.machine.root.position.copyFrom(tile.position).addInPlaceFromFloats(0, 0.7 - tile.machine.baseMeshMinY, 0);
        tile.machine.root.computeWorldMatrix(true);

        tile.machine.graphicQ = Core.GraphicQuality.High;
        await tile.machine.instantiate();
        tile.machine.reset();
        tile.machine.play();
        
        tile.status = TileStatus.Active;
    }

    private async taskStatusNext(tile: Tile): Promise<void> {
        if (!tile.deserialize) {
            return;
        }
        if (tile.status === TileStatus.Next) {
            return;
        }

        if (!tile.machine) {
            tile.machine = new Core.Machine(tile.game);
            tile.machine.baseColor = tile.machineBaseColor;
            tile.machine.root.position.copyFrom(tile.position).addInPlaceFromFloats(0, 0.7, 0);
            tile.machine.root.computeWorldMatrix(true);
        }

        if (tile.machine.graphicQ === Core.GraphicQuality.High) {
            tile.machine.dispose();
        }
        
        if (tile.machine.parts.length === 0) {
            await tile.deserialize();
        }
        
        if (!tile.machine.ready) {
            tile.machine.generateBaseMesh();
        }
        tile.machine.root.position.copyFrom(tile.position).addInPlaceFromFloats(0, 0.7 - tile.machine.baseMeshMinY, 0);
        tile.machine.root.computeWorldMatrix(true);

        tile.machine.graphicQ = Core.GraphicQuality.Proxy;
        await tile.machine.instantiate();
        
        tile.status = TileStatus.Next;
    }

    private async taskStatusInactive(tile: Tile): Promise<void> {
        if (!tile.deserialize) {
            return;
        }
        if (tile.status === TileStatus.Inactive) {
            return;
        }

        if (!tile.machine) {
            tile.machine = new Core.Machine(tile.game);
            tile.machine.baseColor = tile.machineBaseColor;
            tile.machine.root.position.copyFrom(tile.position).addInPlaceFromFloats(0, 0.7, 0);
            tile.machine.root.computeWorldMatrix(true);
        }

        if (tile.machine.parts.length === 0) {
            await tile.deserialize();
        }

        if (!tile.machine.ready) {
            tile.machine.generateBaseMesh();
        }
        tile.machine.root.position.copyFrom(tile.position).addInPlaceFromFloats(0, 0.7 - tile.machine.baseMeshMinY, 0);
        tile.machine.root.computeWorldMatrix(true);

        tile.machine.dispose();
        tile.status = TileStatus.Inactive;
    }

    private async taskStatusProxy(tile: Tile): Promise<void> {
        if (!tile.deserialize) {
            return;
        }
        if (tile.status === TileStatus.Proxy) {
            return;
        }

        tile.status = TileStatus.Proxy;
    }

    private _currentActiveTile: Tile;
    public setCurrentActiveTile(tile: Tile): void {
        if (tile === this._currentActiveTile) {
            return;
        }
        this._currentActiveTile = tile;
        let i = tile.i;
        let j = tile.j;
        this.addTask(tile, TileStatus.Active);
        
        this.addTask(tile.game.getTile(i + 1, j + 0), TileStatus.Next);
        this.addTask(tile.game.getTile(i + 0, j + 1), TileStatus.Next);
        this.addTask(tile.game.getTile(i - 1, j + 0), TileStatus.Next);
        this.addTask(tile.game.getTile(i + 0, j - 1), TileStatus.Next);
        this.addTask(tile.game.getTile(i + 1, j - 1), TileStatus.Next);
        this.addTask(tile.game.getTile(i - 1, j + 1), TileStatus.Next);
        
        this.addTask(tile.game.getTile(i + 0, j + 2), TileStatus.Inactive);
        this.addTask(tile.game.getTile(i + 1, j + 1), TileStatus.Inactive);
        this.addTask(tile.game.getTile(i + 2, j + 0), TileStatus.Inactive);
        this.addTask(tile.game.getTile(i + 2, j - 1), TileStatus.Inactive);
        this.addTask(tile.game.getTile(i + 2, j - 2), TileStatus.Inactive);
        this.addTask(tile.game.getTile(i + 1, j - 2), TileStatus.Inactive);
        this.addTask(tile.game.getTile(i + 0, j - 2), TileStatus.Inactive);
        this.addTask(tile.game.getTile(i - 1, j - 1), TileStatus.Inactive);
        this.addTask(tile.game.getTile(i - 2, j + 0), TileStatus.Inactive);
        this.addTask(tile.game.getTile(i - 2, j + 1), TileStatus.Inactive);
        this.addTask(tile.game.getTile(i - 2, j + 2), TileStatus.Inactive);
        this.addTask(tile.game.getTile(i - 1, j + 2), TileStatus.Inactive);
    }

    public busy: boolean;
    public update(): void {
        if (this.busy) {
            return;
        }
        
        if (this.setActiveTasks.length > 0) {
            this.busy = true;
            this.taskStatusActive(this.setActiveTasks.removeAt(0)).then( () => { this.busy = false; });
            return;
        }
        
        if (this.setNextTasks.length > 0) {
            this.busy = true;
            this.taskStatusNext(this.setNextTasks.removeAt(0)).then( () => { this.busy = false; });
            return;
        }
        
        if (this.setInactiveTasks.length > 0) {
            this.busy = true;
            this.taskStatusInactive(this.setInactiveTasks.removeAt(0)).then( () => { this.busy = false; });
            return;
        }
        
        if (this.setProxyTasks.length > 0) {
            this.busy = true;
            this.taskStatusProxy(this.setProxyTasks.removeAt(0)).then( () => { this.busy = false; });
            return;
        }
    }

    public addTask(tile: Tile, status: TileStatus): void {
        if (!tile) {
            return;
        }
        this.setActiveTasks.remove(tile);
        this.setNextTasks.remove(tile);
        this.setInactiveTasks.remove(tile);
        this.setProxyTasks.remove(tile);

        if (status === TileStatus.Active) {
            this.setActiveTasks.push(tile);
        }
        if (status === TileStatus.Next) {
            this.setNextTasks.push(tile);
        }
        if (status === TileStatus.Inactive) {
            this.setInactiveTasks.push(tile);
        }
        if (status === TileStatus.Proxy) {
            this.setProxyTasks.push(tile);
        }
    }
}

class Tile extends BABYLON.Mesh {

    public static SIZE = 3;
    public static S_SIZE = Math.sqrt(Tile.SIZE * Tile.SIZE - (Tile.SIZE * 0.5) * (Tile.SIZE * 0.5));

    public machine: Core.Machine;
    public machineBaseColor: string = "#ffffff";
    public status: TileStatus = TileStatus.Unset;
    public d: number = 0;
    public a: number = 0;

    constructor(public i: number, public j: number, public game: Game) {
        super("tile-" + i.toFixed(0) + "_" + j.toFixed(0));

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

    public async instantiate(): Promise<void> {
        let hexaTileData = await this.game.vertexDataLoader.getAtIndex("./datas/meshes/hexa-tile.babylon");
        let colorizedData = Mummu.CloneVertexData(hexaTileData);
        let v = 0.6 + 0.3 * Math.random();
        let color = new BABYLON.Color3(v + 0.1, v, v);
        Mummu.ColorizeVertexDataInPlace(colorizedData, color);
        colorizedData.applyToMesh(this);
    }

    public deserialize: () => Promise<void>;
}