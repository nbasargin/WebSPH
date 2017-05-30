export class SmoothingKernel {

    // most frequently used smoothing function:
    // cubic1Dabs B-spline function, originally used by Monaghan and Lattanzio
    public static cubic1Dabs(dist : number, smoothingLength : number) {
        let R = dist / smoothingLength;

        if (0 <= R && R < 1) return 1/smoothingLength * (2/3 - R*R + 1/2 * R*R*R);
        if (1 <= R && R < 2) return 1/smoothingLength * (1/6 * (2-R)*(2-R)*(2-R));
        return 0; // (R >= 2) or (R < 0)
    }

    // HIGHLY EXPERIMENTAL
    // assuming nabla = d / dx (in 1D);   dist = x - x' (leaving out abs operation: |n| )
    public static dCubic1Dabs(dist : number, smoothingLength : number) {
        let R = dist / smoothingLength;

        if (0 <= R && R < 1) return 1/smoothingLength * (2 * R / smoothingLength + 1/2 * 3 * R * R / smoothingLength );
        if (1 <= R && R < 2) return 1/smoothingLength * (1/6 * (3 * (2-R)*(2-R) -  1 / smoothingLength));
        return 0; // (R >= 2) or (R < 0)
    }

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