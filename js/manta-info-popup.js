// Manta Ray info popup component
function registerMantaInfoPopup() {
  AFRAME.registerComponent('manta-info-popup', {
    init: function () {
      const self = this;
      
      console.log('manta-info-popup init called');
      
      // Listen for click interactions channeled from the glowy egg
      self.el.addEventListener('egg-clicked', (event) => {
        console.log('🌊 Manta egg clicked! Event:', event);
        self.showInfoPopup();
      });
      
      self.el.addEventListener('click', (event) => {
        console.log('Manta entity clicked');
        self.showInfoPopup();
      });
    },

    showInfoPopup: function () {
      // Remove existing popup if any
      const existingPopup = document.getElementById('manta-info-popup');
      if (existingPopup) {
        existingPopup.remove();
      }

      // Create popup container
      const popup = document.createElement('div');
      popup.id = 'manta-info-popup';
      popup.innerHTML = `
        <div class="popup-content">
          <button class="popup-close">&times;</button>
          <h2>🌊 Manta Ray (Giant Oceanic Manta)</h2>
          
          <div class="info-section">
            <h3>About the Manta Ray</h3>
            <p>Manta rays are majestic, gentle giants of the sea. Unlike many other rays, they do not possess a stinging spine and are completely harmless to humans, gliding through temperate waters as filter feeders.</p>
          </div>

          <div class="info-section">
            <h3>🐟 Quick Facts</h3>
            <ul>
              <li><strong>Wingspan:</strong> Up to 29 feet (8.8 meters) wide</li>
              <li><strong>Weight:</strong> Up to 3,000 lbs (1,350 kg)</li>
              <li><strong>Diet:</strong> Microscopic zooplankton and tiny fish</li>
              <li><strong>Lifespan:</strong> Around 40 years in the wild</li>
              <li><strong>Habitat:</strong> Tropical, subtropical, and warm temperate oceans</li>
            </ul>
          </div>

          <div class="info-section">
            <h3>🧠 High Intelligence</h3>
            <p>Manta rays possess the largest brain-to-body weight ratio of any cold-blooded fish. They exhibit exceptional curiosity, playfulness, and have even passed mirror self-recognition tests, demonstrating self-awareness.</p>
          </div>

          <div class="info-section">
            <h3>🛡️ Conservation</h3>
            <p>Manta rays are classified as Vulnerable. They face continuous threats from commercial fishing, gill net entanglements, and plastic pollution disrupting their feeding waters.</p>
          </div>
        </div>
      `;

      // Inject custom scoped CSS styles for this modal layout if missing
      if (!document.getElementById('manta-popup-styles')) {
        const style = document.createElement('style');
        style.id = 'manta-popup-styles';
        style.textContent = `
          #manta-info-popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 5, 15, 0.75);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: 'Arial', sans-serif;
            animation: mantaFadeIn 0.3s ease-in;
          }

          @keyframes mantaFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .popup-content {
            background: linear-gradient(135deg, #062b43 0%, #033a52 100%);
            border: 2px solid #00bfff;
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0, 191, 255, 0.25);
            color: #ffffff;
            position: relative;
          }

          .popup-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: #00bfff;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 28px;
            cursor: pointer;
            color: #062b43;
            font-weight: bold;
            transition: all 0.3s ease;
          }

          .popup-close:hover {
            background: #00ffff;
            transform: scale(1.1);
          }

          .popup-content h2 {
            margin: 0 0 20px 0;
            font-size: 26px;
            text-align: center;
            color: #00bfff;
            text-shadow: 0 0 10px rgba(0, 191, 255, 0.5);
          }

          .info-section {
            margin: 20px 0;
            padding: 15px;
            background: rgba(0, 191, 255, 0.08);
            border-left: 4px solid #00bfff;
            border-radius: 5px;
          }

          .info-section h3 {
            margin: 0 0 10px 0;
            color: #00bfff;
            font-size: 18px;
          }

          .info-section p {
            margin: 0;
            line-height: 1.6;
            font-size: 14px;
          }

          .info-section ul {
            margin: 0;
            padding-left: 20px;
          }

          .info-section li {
            margin: 8px 0;
            line-height: 1.5;
            font-size: 14px;
          }

          .info-section strong {
            color: #00bfff;
          }

          .popup-content::-webkit-scrollbar {
            width: 8px;
          }

          .popup-content::-webkit-scrollbar-track {
            background: rgba(0, 191, 255, 0.1);
            border-radius: 10px;
          }

          .popup-content::-webkit-scrollbar-thumb {
            background: #00bfff;
            border-radius: 10px;
          }

          .popup-content::-webkit-scrollbar-thumb:hover {
            background: #00ffff;
          }

          @media (max-width: 600px) {
            .popup-content {
              max-width: 90%;
              padding: 20px;
            }
            .popup-content h2 { font-size: 22px; }
          }
        `;
        document.head.appendChild(style);
      }

      document.body.appendChild(popup);

      // Close handlers
      const closeBtn = popup.querySelector('.popup-close');
      closeBtn.addEventListener('click', () => {
        popup.remove();
      });

      popup.addEventListener('click', (e) => {
        if (e.target === popup) popup.remove();
      });

      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          popup.remove();
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);
    }
  });
}