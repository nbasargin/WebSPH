import {Bounds} from "../util/Bounds";

export class Domain implements Bounds {
    xMin : number;
    xMax : number;
    yMin : number;
    yMax : number;


    public constructor(bounds : Bounds) {
        this.xMin = bounds.xMin;
        this.xMax = bounds.xMax;
        this.yMin = bounds.yMin;
        this.yMax = bounds.yMax;
    }



    /**
     * Calculates the x distance between two given x positions. Cyclic field
     * is taken into account.
     * @param x1        first position
     * @param x2        second position
     * @returns {number}
     */
    public xDistCyclic(x1 : number, x2 : number) : number {

        let width = this.xMax - this.xMin;

        let distNormal = x1 - x2;
        let distCyclic;
        if (x1 < x2) {
            distCyclic = (x1 + width) - x2;
        } else {
            distCyclic = (x1 - width) - x2;
        }

        if (Math.abs(distNormal) < Math.abs(distCyclic)) {
            return distNormal;
        }
        return distCyclic;

    }

    /**
     * Check if x position is inside this domain.
     * If not, move x inside the domain (cyclic field).
     *
     * Note: will produce a valid position only if the
     * distance to the bounds of this domain is less than
     * the domain width (performance reasons).
     *
     * @param x             x position
     * @returns {number}    modified x position inside the domain
     */
    public mapXInsideDomainCyclic(x : number) : number {
        if (x > this.xMax) {
            x -= this.xMax - this.xMin;
        } else if (x < this.xMin) {
            x += this.xMax - this.xMin;
        }
        return x;
    }





}