export class SmoothingKernel {

    // most frequently used smoothing function:
    // cubic B-spline function, originally used by Monaghan and Lattanzio
    public static cubic(dist : number, smoothingLength : number) {
        let R = dist / smoothingLength;

        if (0 <= R && R < 1) return 1/smoothingLength * (2/3 - R*R + 1/2 * R*R*R);
        if (1 <= R && R < 2) return 1/smoothingLength * (1/6 * (2-R)*(2-R)*(2-R));
        return 0; // (R >= 2) or (R < 0)
    }

}