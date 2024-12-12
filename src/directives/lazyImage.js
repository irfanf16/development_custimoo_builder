export default {
  bind(el, binding) {

    const shouldUnload = binding.arg !== 'noUnload'; // 'noUnload' will disable unloading

    // Create an IntersectionObserver to detect when the image is in the viewport
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        // Check if the image is in the viewport
        if (entry.isIntersecting) {
          el.src = binding.value; 
          observer.unobserve(el); // Stop observing once the image has been loaded
        }
        else if (shouldUnload) {
          el.src = '';  // Unload the image when it goes out of the viewport (optional)
        }
      });
    }, {
      rootMargin: '0px',
      threshold: 0.1,
    });

    // Start observing the element (image)
    observer.observe(el);
  }
};
