# WebSPH
This project aims to bring an interactive fluid simulation based on the Smoothed Particle Hydrodynamics (SPH) method to the web. 

## Web demo
A running simulation can be tested here: http://websph.azurewebsites.net/

## How to run locally
1. You need following software installed:
 - Git
 - Node.js with npm
 - Yarn
2. Clone this repository with `git clone https://github.com/nbasargin/WebSPH.git`
3. Install dependencies with `yarn install`
4. Build the project with `npm run buildNew`, the generated code will be saved in the `dist` folder
5. Open `dist/index.html` in browser