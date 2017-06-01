import {Particle} from "../sph/Particle";
export class Coloring {

    public static speedColoring(particles : Array<Particle>) {
        let maxSpeed = Number.MIN_VALUE;
        let minSpeed = Number.MAX_VALUE;
        for (let i = 0; i < particles.length; i++) {
            let speed = Math.abs(particles[i].speed[0]);

            maxSpeed = Math.max(maxSpeed, speed);
            minSpeed = Math.min(minSpeed, speed);
        }

        // update COLOR based on speed
        let speedDiff = maxSpeed - minSpeed;
        if (speedDiff > 0) {
            for (let i = 0; i < particles.length; i++) {
                let speed = Math.abs(particles[i].speed[0]);
                let col = Math.sqrt((speed - minSpeed) / speedDiff);

                // distinguish direction
                if (particles[i].speed[0] > 0) {
                    particles[i].color = [col,0,0,1];
                } else {
                    particles[i].color = [0,col,0,1];
                }

            }
        } else {
            // no speed difference - all black
            for (let i = 0; i < particles.length; i++) {
                particles[i].color = [0,0,0,1];
            }
        }
    }

}