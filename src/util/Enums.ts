
// Integrator
export enum IntegratorType {
	EULER = "euler",
	HEUN_NAIVE = "heunNaive",
	HEUN_STD = "heunStd",
	HEUN_FAST = "heunFast"
}

export class IntegratorTypeString {
	public static toEnum(enumString : string) : IntegratorType {
		switch(enumString) {
			case "euler": return IntegratorType.EULER;
			case "heunNaive": return IntegratorType.HEUN_NAIVE;
			case "heunStd": return IntegratorType.HEUN_STD;
			case "heunFast": return IntegratorType.HEUN_FAST;
		}
		return undefined;
	}
}


// Boundary
export enum BoundaryType {
	CYCLIC = "cyclic",
	SOLID = "solid"
}

export class BoundaryTypeString {
	public static toEnum(enumString : string) : BoundaryType {
		switch(enumString) {
			case "cyclic": return BoundaryType.CYCLIC;
			case "solid": return BoundaryType.SOLID;
		}
		return undefined;
	}
}



export enum ParticleDistribution {
	UNIFORM = "uniform",
	DAM_BREAK_WET = "damBreakWet",
	DAM_BREAK_DRY = "damBreakDry",
	WATER_DROP = "waterDrop"
}


// Time stepping
export enum TimeSteppingMode {
	FIXED = "fixed",
	STABLE = "dynStable",
	FAST = "dynFast"
}

export class TimeSteppingModeString {
	public static toEnum(enumString : string) : TimeSteppingMode {
		switch(enumString) {
			case "fixed": return TimeSteppingMode.FIXED;
			case "dynStable": return TimeSteppingMode.STABLE;
			case "dynFast": return TimeSteppingMode.FAST;
		}
		return undefined;
	}
}


// checks if the string is contained in the enum as value

export class EnumChecker {

	public static isValidValue(enumType, value) : boolean {
		let valid = false;

		for (let enumMember in enumType) {
			if (enumType.hasOwnProperty(enumMember)) {
				if (value == enumType[enumMember]) {
					valid = true;
					break;
				}
			}
		}

		return valid;
	};


}
