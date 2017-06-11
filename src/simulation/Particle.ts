export class Particle {

    public pos : Array<number>;
    public speed : Array<number>;
    public acceleration : number;

    public color : Array<number>;

    public constructor() {
        this.pos = [0, 0, 0];
        this.speed = [0, 0, 0];
        this.acceleration = 0;

        this.color = [0, 0, 0, 0];
    }

}