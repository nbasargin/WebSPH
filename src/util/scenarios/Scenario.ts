import { RendererOptions } from '../../rendering/RendererOptions';
import { SimulationOptions } from '../../simulation/SimulationOptions';

export abstract class Scenario {

    public abstract getName(): string;

    public abstract getDescription(): string;

    public abstract getSimulationOptions(): SimulationOptions;

    public abstract getRenderOptions(): RendererOptions;


}
