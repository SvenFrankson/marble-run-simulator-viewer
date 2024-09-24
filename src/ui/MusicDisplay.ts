class MusicDisplay {
    
    public w: number = 1600;
    public h: number = 100;
    private context: CanvasRenderingContext2D;

    constructor(public canvas: HTMLCanvasElement, public game: Game) {
        this.context = canvas.getContext("2d");
        canvas.width = this.w;
        canvas.height = this.h;
    }

    public show(): void {
        this.canvas.style.display = "block";
    }

    public hide(): void {
        this.canvas.style.display = "none";
    }

    public reset(): void {
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

    public hideTimeout: number = -1;
    public t0: number = -1;
    public firstXylophone: Core.Xylophone;
    public tMax = 16;
    public abcdefg = "ABCDEFG";
    public drawNote(xylophone: Core.Xylophone): void {
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
        this.hideTimeout = setTimeout(
            () => {
                this.hide();
            },
            this.tMax * 1000 / this.game.currentTimeFactor
        );
    }
}