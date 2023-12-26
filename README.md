# Three.js Boid Simulation

## Overview

This repository contains a Three.js-based simulation that emulates the flocking behavior of boids, autonomous agents that follow simple rules to replicate complex group dynamics observed in nature, like those of birds and fish.

Enhanced by Three.js's rendering capabilities, this simulation allows user interaction with real-time adjustments of parameters through dat.GUI.

## Features

- **Flocking Simulation**: Implements alignment, cohesion, and separation rules to mimic natural flocking patterns.
- **3D Visualization**: Employs Three.js for engaging, three-dimensional visual representation of boids' behavior.
- **Interactive Controls**: Enables dynamic modification of parameters such as boid speed and behavioral rules in real time using dat.GUI.

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your system.

### Installation and Running the Simulation

1. **Clone the Repository**:
   ```bash
   git clone [repository-url]
   ```
2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Run the Project**:
   ```bash
   npx vite
   ```

### Interacting with the Simulation

Use the dat.GUI panel to adjust simulation parameters in real-time. Experiment with different settings to observe how they influence the boids' behavior.

## Learn More

For a deeper understanding of the principles behind the simulation, refer to [Craig Reynolds' seminal paper on boids](https://cs.stanford.edu/people/eroberts/courses/soco/projects/2008-09/modeling-natural-systems/boids.html), which serves as the foundational inspiration for this project.
