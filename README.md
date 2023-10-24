# fireSim
Simulation of a burning forest

## Presentation of the app:

This app is a simulation of a burning forest. The grid displayed is the representation of the forest, each green tile is a living tree. When the simulation starts, some trees will catch fire and the tile will turn red on the first round. On the round n+1 there is a probability thath all the trees around the previously burning trees catch fire. If so they will turn red and at the same time, the previously burning trees will turn grey, which means that these trees are already burned and dead.

The following parameters can be changed in the `/public/config.json` file: number of rows, number of columns, the probability for a tree to catch fire and the initial position.s of the fire.

The simulation can be started, stopped and reseted anytime by clicking on the corresponding buttons.

## To access the app:
- Open a terminal and pull this repository
- Navigate to the repository
- Make sure you have installed Node.js and its framework Express.
- Enter the command `node server.js`
- The server should now be launched, you can access it by opening your web browser to the address `localhost:3000/main.html`
