// Gardineroseris info popup component
function registerGardineroserisInfoPopup() {
  AFRAME.registerComponent('gardineroseris-info-popup', {
    init: function () {
      const self = this;

      self.el.addEventListener('click', () => {
        self.showInfoPopup();
      });
    },

    showInfoPopup: function () {
      const existingPopup = document.getElementById('gardineroseris-info-popup');
      if (existingPopup) {
        existingPopup.remove();
      }

      const popup = document.createElement('div');
      popup.id = 'gardineroseris-info-popup';
      popup.innerHTML = `
        <div class="popup-content">
          <button class="popup-close">&times;</button>
          <h2>🪸 Gardineroseris</h2>

          <div class="info-section">
            <h3>🌊 About Gardineroseris</h3>
            <p>Gardineroseris planulata is a species of stony coral known for forming broad, flat, plate-like colonies that maximize sunlight exposure. Found on tropical coral reefs throughout the Indo-Pacific region, this coral contributes to reef-building ecosystems and provides habitat for countless marine organisms</p>
          </div>

          <div class="info-section">
            <h3>💡 Quick Facts</h3>
            <ul>
              <li><strong>Scientific Name:</strong> Gardineroseris planulata</li>
              <li><strong>Type:</strong> Reef-building stony coral (Scleractinian coral)</li>
              <li><strong>Size:</strong> Colonies can grow over 1 meter (3+ feet) across</li>
              <li><strong>Lifespan:</strong> Potentially several decades to centuries</li>
              <li><strong>Habitat:</strong> Tropical coral reefs, especially reef slopes and deeper reef environments throughout the Indo-Pacific</li>
              </ul>
          </div>

          <div class="info-section">
            <h3>☀️ Symbiotic Partnership</h3>
            <p>Like many reef-building corals, Gardineroseris planulata lives in partnership with microscopic algae called zooxanthellae. These algae perform photosynthesis and provide nutrients to the coral, while the coral offers shelter and access to sunlight. This relationship is essential for the coral's growth and reef-building ability.</p>
          </div>

          <div class="info-section">
            <h3>🤯 Did You Know?</h3>
            <p>Although it looks like a single organism, a colony of Gardineroseris planulata is actually made up of thousands of tiny coral polyps working together. Each polyp is an individual animal, but together they build the large plate-shaped structure seen on the reef.</p>
          </div>
        </div>
      `;

      if (!document.getElementById('gardineroseris-popup-styles')) {
        const style = document.createElement('style');
        style.id = 'gardineroseris-popup-styles';
        style.textContent = `
          #gardineroseris-info-popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 8, 20, 0.82);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: 'Arial', sans-serif;
            animation: gardenFadeIn 0.25s ease-in;
          }

          @keyframes gardenFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

            .popup-content {
            background: linear-gradient(135deg, #0a3d5c 0%, #08506b 100%);
            border: 2px solid #00ffff;
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0, 255, 136, 0.2);
            color: #ffffff;
            position: relative;
          }

          .popup-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: #00ffff;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 28px;
            cursor: pointer;
            color: #0a3d5c;
            font-weight: bold;
            transition: all 0.3s ease;
          }

          .popup-close:hover {
            background: #00ff88;
            transform: scale(1.1);
          }

          .popup-content h2 {
            margin: 0 0 20px 0;
            font-size: 28px;
            text-align: center;
            color: #00ffff;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
          }

          .info-section {
            margin: 20px 0;
            padding: 15px;
            background: rgba(0, 255, 255, 0.1);
            border-left: 4px solid #00ffff;
            border-radius: 5px;
          }

          .info-section h3 {
            margin: 0 0 10px 0;
            color: #00ffff;
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
            color: #00ffff;
          }

          /* Scrollbar styling */
          .popup-content::-webkit-scrollbar {
            width: 8px;
          }

          .popup-content::-webkit-scrollbar-track {
            background: rgba(0, 255, 255, 0.1);
            border-radius: 10px;
          }

          .popup-content::-webkit-scrollbar-thumb {
            background: #00ffff;
            border-radius: 10px;
          }

          .popup-content::-webkit-scrollbar-thumb:hover {
            background: #00ff88;
          }

          @media (max-width: 600px) {
            .popup-content {
              max-width: 90%;
              padding: 20px;
            }

            .popup-content h2 {
              font-size: 24px;
            }

            .info-section {
              padding: 12px;
            }

            .info-section h3 {
              font-size: 16px;
            }

            .info-section p,
            .info-section li {
              font-size: 13px;
            }
          }
        `;
        document.head.appendChild(style);
      }

      document.body.appendChild(popup);

      // Close button handler
      const closeBtn = popup.querySelector('.popup-close');
      closeBtn.addEventListener('click', () => {
        popup.style.animation = 'fadeIn 0.3s ease-out reverse';
        setTimeout(() => {
          popup.remove();
        }, 300);
      });

      // Click outside to close
      popup.addEventListener('click', (e) => {
        if (e.target === popup) {
          popup.style.animation = 'fadeIn 0.3s ease-out reverse';
          setTimeout(() => {
            popup.remove();
          }, 300);
        }
      });

      // Close on Escape key
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          popup.style.animation = 'fadeIn 0.3s ease-out reverse';
          setTimeout(() => {
            popup.remove();
          }, 300);
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);
    }
  });
}