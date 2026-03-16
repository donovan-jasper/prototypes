# App Name
Animata

# One-line pitch
Animata is a lightweight, dependency-free animation library that enables CSS animations through HTML data attributes, simplifying the process of adding animations to web pages.

# Tech stack
* Frontend: Vanilla HTML/CSS/JS
* Backend: Node/Express (for demo purposes only)
* Database: None required (static HTML files)

# Core features
1. **Declarative animation**: Define animations using HTML data attributes, eliminating the need for custom JavaScript code.
2. **Scroll detection**: Automatically trigger animations when elements come into view.
3. **Anti-FOUC (Flash of Unstyled Content) mechanism**: Ensure a smooth user experience by preventing unstyled content from being displayed.

# File structure
* `index.html`: Demo page showcasing Animata's capabilities
* `animata.js`: Core animation library
* `animata.css`: Styles for demo page and animation examples
* `package.json`: Node/Express project configuration

# Implementation steps
1. **Create the core animation library (animata.js)**:
	* Define a function to parse HTML data attributes and generate corresponding CSS animation styles.
	* Implement scroll detection using the IntersectionObserver API.
	* Develop an anti-FOUC mechanism using CSS classes and JavaScript event listeners.
2. **Implement declarative animation (animata.js)**:
	* Create a function to parse HTML data attributes (e.g., `data-anim-duration`, `data-anim-delay`, `data-anim-type`) and generate corresponding CSS animation styles.
	* Use the `CSSOM` API to dynamically add and remove CSS classes for animation triggering.
3. **Develop the demo page (index.html)**:
	* Create a basic HTML structure with examples of different animation types (e.g., fade, slide, scale).
	* Add HTML data attributes to define animation properties (e.g., duration, delay, type).
4. **Style the demo page (animata.css)**:
	* Define basic styles for the demo page layout and animation examples.
	* Create CSS classes for different animation types and states (e.g., `.anim-fade`, `.anim-slide`, `.anim-scale`).
5. **Set up the Node/Express project (package.json)**:
	* Initialize a new Node/Express project using `npm init`.
	* Install required dependencies (none, since Animata is dependency-free).
6. **Integrate the animation library with the demo page**:
	* Include the `animata.js` script in the `index.html` file.
	* Initialize the animation library by calling the main function (e.g., `animata.init()`).

# How to test it works
1. Open the `index.html` file in a web browser to view the demo page.
2. Verify that animations are triggered when elements come into view.
3. Test different animation types and properties (e.g., duration, delay, type) by modifying the HTML data attributes.
4. Inspect the browser console for any errors or warnings.
5. Use the browser's DevTools to inspect the generated CSS animation styles and verify that they match the expected output.