import { RendererOptions } from '../rendering/renderer-options';
import { SimulationOptions } from '../simulation/simulation-options';

export abstract class Scenario {

    public abstract getName(): string;

    public abstract getDescription(): string;

    public abstract getSimulationOptions(): SimulationOptions;

    public abstract getRenderOptions(): RendererOptions;


}
