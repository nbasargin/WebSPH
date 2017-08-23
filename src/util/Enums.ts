
export enum IntegratorType {
	EULER = "euler",
	HEUN_NAIVE = "heunNaive",
	HEUN_STD = "heunStd",
	HEUN_FAST = "heunFast"
}


export enum BoundaryType {
	CYCLIC = "cyclic",
	SOLID = "solid"
}



export enum ParticleDistributionPreset {
	UNIFORM = "uniform",
	DAM_BREAK = "damBreak",
	WATER_DROP = "waterDrop"
}

export enum TimeSteppingMode {
	FIXED = "fixed",
	STABLE = "dynStable",
	FAST = "dynFast"
}

export enum GroundPreset {
	CONST_ZERO,
	CONST_SINE,
	CONST_SLOPE,
	DYN_SLOPE,
	DYN_SMOOTHING_KERNEL
}
