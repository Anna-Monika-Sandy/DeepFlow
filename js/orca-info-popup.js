// Orca info popup component
function registerOrcaInfoPopup() {
  AFRAME.registerComponent('orca-info-popup', {
    init: function () {
      const self = this;
      
      console.log('orca-info-popup init called');
      
      // Listen for egg-clicked event on this entity
      self.el.addEventListener('egg-clicked', (event) => {
        console.log('🐋 Orca egg clicked! Event:', event);
        self.showInfoPopup();
      });
      
      // Also set up a listener for direct clicks
      self.el.addEventListener('click', (event) => {
        console.log('Orca entity clicked');
        self.showInfoPopup();
      });
    },

    showInfoPopup: function () {
      // Remove existing popup if any
      const existingPopup = document.getElementById('orca-info-popup');
      if (existingPopup) {
        existingPopup.remove();
      }

      // Create popup container
      const popup = document.createElement('div');
      popup.id = 'orca-info-popup';
      popup.innerHTML = `
        <div class="popup-content">
          <button class="popup-close">&times;</button>
          <h2>🐋 Orca (Killer Whale)</h2>
          
          <div class="info-section">
            <h3>About the Orca</h3>
            <p>Orcas are the largest members of the dolphin family and are highly intelligent marine mammals. They are found in all oceans, from the Arctic to the Antarctic.</p>
          </div>

          <div class="info-section">
            <h3>🌊 Facts</h3>
            <ul>
              <li><strong>Size:</strong> Up to 32 feet (10 meters) long</li>
              <li><strong>Weight:</strong> Up to 6 tons</li>
              <li><strong>Diet:</strong> Fish, seals, and other marine mammals</li>
              <li><strong>Lifespan:</strong> 50-80+ years in the wild</li>
              <li><strong>Social:</strong> Live in family groups called pods</li>
            </ul>
          </div>

          <div class="info-section">
            <h3>🧠 Intelligence</h3>
            <p>Orcas are apex predators with complex hunting strategies, complex social structures, and even distinctive "dialects" within their pods. They are considered one of the most intelligent animals on Earth.</p>
          </div>

          <div class="info-section">
            <h3>🌍 Conservation</h3>
            <p>Some orca populations are endangered due to pollution, climate change, and prey depletion. Organizations worldwide work to protect these magnificent creatures.</p>
          </div>
        </div>
      `;

      // Add styles if not already added
      if (!document.getElementById('orca-popup-styles')) {
        const style = document.createElement('style');
        style.id = 'orca-popup-styles';
        style.textContent = `
          #orca-info-popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: 'Arial', sans-serif;
            animation: fadeIn 0.3s ease-in;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
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