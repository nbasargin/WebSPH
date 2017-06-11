export class SmoothingKernel {

    public static cubic1D(xDist : number, smoothingLength : number) {
        let R = Math.abs(xDist) / smoothingLength;
        if (R < 1) return 1/smoothingLength * (2/3 - R*R + 1/2 * R*R*R);
        if (R < 2) return 1/smoothingLength * (1/6 * (2-R)*(2-R)*(2-R));
        return 0;
    }

    public static dCubic1D(xDist : number, smoothingLength : number) {
        let abs = Math.abs(xDist) / smoothingLength;
        let sgn = Math.sign(xDist) / smoothingLength;
        if (abs < 1) return ( 2 * sgn * abs - 3/2 * sgn * abs * abs ) / smoothingLength;
        if (abs < 2) return ( 1/2 * sgn * (2 - abs) * (2-abs) ) / smoothingLength;
        return 0;
    }




}