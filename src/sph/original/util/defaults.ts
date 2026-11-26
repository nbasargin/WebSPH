import { version } from '../../../../package.json';
import { RendererOptions } from '../rendering/renderer-options';
import { SimulationOptions } from '../simulation/simulation-options';
import { WetDamBreak } from '../scenarios/wet-dam-break';

export class Defaults {
  public static readonly VERSION: string = version;

  public static getDefaultSimulationOptions(): SimulationOptions {
    return new WetDamBreak().getSimulationOptions();
  }

  public static getDefaultRendererOptions(): RendererOptions {
    return new WetDamBreak().getRenderOptions();
  }
}
