export class RingBuffer {

    private capacity : number;
    private buffer : Array<number>;
    private nextPos : number;

    public constructor(capacity : number) {
        this.capacity = capacity;
        this.buffer = [];
        this.nextPos = 0;
    }

    public push(value : number) {
        this.buffer[this.nextPos] = value;
        this.nextPos = (this.nextPos + 1) % this.capacity;
    }

    public avg() : number {
        if (this.buffer.length == 0) return 0;

        let sum = 0;
        for (let i = 0; i < this.buffer.length; i++) sum += this.buffer[i];
        return sum / this.buffer.length;
    }

    public toString() : string {
        return this.buffer.toString();
    }


}