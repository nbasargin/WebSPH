export class Particle {

    //public pos : Array<number>;
    public posX : number;
    public posY : number;
    //public speed : Array<number>;
    public speedX : number;
    public accX : number;

    public color : Array<number>;

    public constructor() {
        //this.pos = [0, 0, 0];
        this.posX = 0;
        this.posY = 0;
        //this.speed = [0, 0, 0];
        this.speedX = 0;
        this.accX = 0;

        this.color = [0, 0, 0, 0];
    }

}