import {ConstLinearGround} from "./ConstLinearGround";
import {ConstSineGround} from "./ConstSineGround";
import {DynamicLinearGround} from "./DynamicLinearGround";
import {DynamicSmoothingKernelGround} from "./DynamicSmoothingKernelGround";
/**
 * Contains a few presets for grounds.
 */
export class GroundPresets {

	public static CONST_ZERO() {
		return new ConstLinearGround(0 /*slope*/, 0 /*yIntercept*/);
	}

	public static CONST_SLOPE() {
		return new ConstLinearGround(0.5 /*slope*/, 0 /*yIntercept*/);
	}

	public static CONST_SINE() {
		return new ConstSineGround(0.2 /*scale*/, 10 /*period*/, 0 /*phase*/);
	}

	public static DYN_SLOPE() {
		return new DynamicLinearGround( 0 /*yIntercept*/, 0.2 /*maxSlope*/, 4 /*slopeChangeSpeed*/);
	}

	public static DYN_SMOOTHING_KERNEL() {
		return new DynamicSmoothingKernelGround(0.75 /*maxScale*/, 3 /*growSpeed*/, 0.4 /*groundSmoothingLength*/);
	}

}
