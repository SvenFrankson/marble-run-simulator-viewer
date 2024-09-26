enum TileStatus {
    Active,
    Next,
    Inactive,
    Minimal
}

class Tile extends BABYLON.Mesh {

    public static SIZE = 3;
    public static S_SIZE = Math.sqrt(Tile.SIZE * Tile.SIZE - (Tile.SIZE * 0.5) * (Tile.SIZE * 0.5));

    public machine: Core.Machine;
    public status: TileStatus;
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
}