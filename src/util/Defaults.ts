import { version } from '../../package.json';
import { RendererOptions } from '../rendering/RendererOptions';
import { SimulationOptions } from '../simulation/SimulationOptions';
import { WetDamBreak } from './scenarios/WetDamBreak';

export class Defaults {

    public static readonly VERSION: string = version;

    public static getDefaultSimulationOptions(): SimulationOptions {
        return new WetDamBreak().getSimulationOptions();
    }

    public static getDefaultRendererOptions(): RendererOptions {
        return new WetDamBreak().getRenderOptions();
    }

}
