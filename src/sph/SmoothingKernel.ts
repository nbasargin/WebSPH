export class SmoothingKernel {

    // most frequently used smoothing function:
    // cubic1D B-spline function, originally used by Monaghan and Lattanzio
    public static cubic1D(dist : number, smoothingLength : number) {
        let R = dist / smoothingLength;

        if (0 <= R && R < 1) return 1/smoothingLength * (2/3 - R*R + 1/2 * R*R*R);
        if (1 <= R && R < 2) return 1/smoothingLength * (1/6 * (2-R)*(2-R)*(2-R));
        return 0; // (R >= 2) or (R < 0)
    }

    // HIGHLY EXPERIMENTAL
    // assuming nabla = d / dx (in 1D);   dist = x - x' (leaving out abs operation: |n| )
    public static dCubic1D(dist : number, smoothingLength : number) {
        let R = dist / smoothingLength;

        if (0 <= R && R < 1) return 1/smoothingLength * (2 * R / smoothingLength + 1/2 * 3 * R * R / smoothingLength );
        if (1 <= R && R < 2) return 1/smoothingLength * (1/6 * (3 * (2-R)*(2-R) -  1 / smoothingLength));
        return 0; // (R >= 2) or (R < 0)
    }

}