// Handles click on the meditation point — works for mouse (browser) and VR controllers.
function registerMeditationClick() {
  AFRAME.registerComponent('meditation-click', {
    init: function () {
      this.el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-pointer');
      });

      this.el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-pointer');
      });

      this.el.addEventListener('click', () => {
        console.log('meditation clicked');
      });
    }
  });
}
