export class AnalyticalDamBreak {

    private g: number;

    private S = 2.957918120187525;
    private u2: number;
    private c2: number;

    public constructor(gAcc: number) {
        this.g = gAcc;

        let S = this.S;
        this.u2 = S - (gAcc / (8 * S) * (1 + Math.sqrt(1 + 16 * S * S / gAcc)));
        this.c2 = Math.sqrt(gAcc / 4 * (Math.sqrt(1 + 16 * S * S / gAcc) - 1));
    }

    public h(x: number, t: number): number {
        if (x < 0.5 - t * Math.sqrt(this.g)) {
            return 1;
        } else if (x <= (this.u2 - this.c2) * t + 0.5) {
            let term = 2 * Math.sqrt(this.g) - (2 * x - 1) / (2 * t);
            return term * term / (9 * this.g);
        } else if (x <= this.S * t + 0.5) {
            return 0.25 * (Math.sqrt(1 + 16 * this.S * this.S / this.g) - 1)
        } else {
            return 0.5;
        }
    }


}
