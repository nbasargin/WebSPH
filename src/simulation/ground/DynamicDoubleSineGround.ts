import {GroundProfile} from "./GroundProfile";


export class DynamicDoubleSineGround extends GroundProfile {

	// factors
	private x1Factor : number = 4;
	private x2Factor : number = 0.4;
	private tFactor : number = 0.6;
	private tShift : number = 3.2;
	private yScale : number = 0.35;


	getGroundHeight(x: number, t: number) : number {

		let scale = Math.min(this.yScale, t * 0.1);
		let a = this.x1Factor;
		let b = this.x2Factor;
		let c = this.tFactor * t + this.tShift;

		// if (c > 10) c = 10;

		return scale * (Math.sin(a * x) + 1) * (Math.sin(b * x + c) + 1);

	}

	getGroundSlope(x: number, t: number) : number {
		let scale = Math.min(this.yScale, t * 0.1);
		let a = this.x1Factor;
		let b = this.x2Factor;
		let c = this.tFactor * t + this.tShift;

		// if (c > 10) c = 10;


		return scale * (
				b * (Math.sin(a * x) + 1) * Math.cos(b * x + c) +
				a * Math.cos(a * x) * (Math.sin(b * x + c) + 1)
			);
	}

}
