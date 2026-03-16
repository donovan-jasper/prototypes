/**
 * Animata - A lightweight, dependency-free animation library.
 * Enables CSS animations through HTML data attributes with scroll detection.
 */
const Animata = (() => {
    const ANIM_SELECTOR = '[data-anim]';
    const ANIMATED_CLASS = 'animata-animated';
    const INITIALIZED_CLASS = 'animata-initialized';

    // Default animation properties
    const defaults = {
        type: 'fade-in',
        duration: '1s',
        delay: '0s',
        easing: 'ease-out',
        direction: 'normal',
        fillMode: 'forwards',
        iterations: '1',
        once: true, // Animate only once when it enters the viewport
        threshold: 0.1, // Percentage of element visible to trigger
        rootMargin: '0px', // Margin around the root element
    };

    /**
     * Parses data attributes from an element and returns an object of animation properties.
     * @param {HTMLElement} element The element to parse attributes from.
     * @returns {Object} An object containing animation properties.
     */
    const parseAttributes = (element) => {
        const attrs = {};
        for (const key in defaults) {
            const dataKey = `data-anim-${key.toLowerCase()}`;
            attrs[key] = element.getAttribute(dataKey) || defaults[key];
        }
        // Special handling for boolean 'once'
        attrs.once = attrs.once === 'true' || attrs.once === true;
        return attrs;
    };

    /**
     * Applies CSS custom properties to an element based on animation attributes.
     * @param {HTMLElement} element The element to apply styles to.
     * @param {Object} props Animation properties.
     */
    const applyCustomProperties = (element, props) => {
        element.style.setProperty('--animata-type', props.type);
        element.style.setProperty('--animata-duration', props.duration);
        element.style.setProperty('--animata-delay', props.delay);
        element.style.setProperty('--animata-easing', props.easing);
        element.style.setProperty('--animata-direction', props.direction);
        element.style.setProperty('--animata-fill-mode', props.fillMode);
        element.style.setProperty('--animata-iterations', props.iterations);
    };

    /**
     * Handles the intersection of an element with the viewport.
     * @param {Array<IntersectionObserverEntry>} entries An array of IntersectionObserverEntry objects.
     * @param {IntersectionObserver} observer The IntersectionObserver instance.
     */
    const handleIntersection = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const props = parseAttributes(element);

                // Apply custom properties and trigger animation
                applyCustomProperties(element, props);
                element.classList.add(ANIMATED_CLASS);

                // If 'once' is true, stop observing after animation
                if (props.once) {
                    observer.unobserve(element);
                }
            }
        });
    };

    /**
     * Initializes the Animata library.
     * Finds all elements with `data-anim` attribute and sets up IntersectionObserver.
     */
    const init = () => {
        // Anti-FOUC: Add a class to the html element to signal JS is loaded
        // This allows CSS to make elements visible (but still opaque)
        document.documentElement.classList.add(INITIALIZED_CLASS);

        const animatableElements = document.querySelectorAll(ANIM_SELECTOR);

        if (animatableElements.length === 0) {
            console.log('Animata: No elements with data-anim found.');
            return;
        }

        const observerOptions = {
            root: null, // Use the viewport as the root
            rootMargin: defaults.rootMargin,
            threshold: defaults.threshold,
        };

        const observer = new IntersectionObserver(handleIntersection, observerOptions);

        animatableElements.forEach(element => {
            // Pre-parse attributes to get threshold/rootMargin if they are defined per element
            // For simplicity, we'll use global defaults for observer options in this prototype.
            // A more advanced version might create multiple observers or update options dynamically.
            observer.observe(element);
        });

        console.log(`Animata: Initialized and observing ${animatableElements.length} elements.`);
    };

    // Expose the init function globally
    return {
        init: init,
    };
})();

// Initialize Animata when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', Animata.init);
