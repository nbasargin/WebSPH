export class IntegratorHeun {

    // prediction : Array <Particle>
    // constructor takes n : number of particles (for prediction)

    // integrationStep( particles, dt )
    // check if prediction has the same size as particles
    // given: pos_0, speed_0
    // calc: acc_0          = ShallowWaterPhysics1D.getAcc (particles)
    // calc: pos_1          = pos_0 * dt                                     // (stored in prediction)
    // calc: acc_1          = ShallowWaterPhysics1D.getAcc ( prediction )    // (stored in prediction)
    // calc: NEW speed_0    = OLD speed_0  +  1/2 * (acc_0 + acc_1) * dt
    // calc: NEW pos_0      = OLD pos_0  +  NEW speed_0 * dt

}