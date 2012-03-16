# DemoEngine

A simple engine for building creative JavaScript Demos

# Writing a new demo
Inside your JavaScript file, do the following:
* Push some entity objects to the render queue. They must implement a draw function that takes a canvas as a parameter. Set their remove property to true when they should be destroyed. The draw function will get called by the engine ~60 times per second.
* Set de.clear_canvas to true if you want the canvas cleared on each iteration of the engine loop.
* Set de.logic to a function that you want executed on each iteration.

# Running a new demo
* Put the file in js/
* Add the file name (before the ".js") to the scripts array in beginning of loader.js.
* Select your script from the dropdown and hit run.