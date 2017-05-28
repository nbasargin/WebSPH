export class Particle {

    public pos : Array<number>;
    public speed : Array<number>;
    public speedNew : Array<number>;
    public mass : number;
    public color : Array<number>;

    public constructor() {
        this.pos = [0, 0, 0];
        this.speed = [0, 0, 0];
        this.speedNew = [0, 0, 0];
        this.mass = 1;
        this.color = [0, 0, 0, 0];
    }




}