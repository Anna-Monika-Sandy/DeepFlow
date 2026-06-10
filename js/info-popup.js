// One reusable info popup for all sea creatures.
// Usage: <a-entity info-popup="key: orca"></a-entity>
// Opens on `click` or on the `egg-clicked` event (from glowy-egg).

const INFO_POPUP_DATA = {
  orca: {
    accent: '#00ffff',
    title: '🐋 Orca (Killer Whale)',
    sections: [
      {
        heading: 'About the Orca',
        body: 'Orcas are the largest members of the dolphin family and are highly intelligent marine mammals. They are found in all oceans, from the Arctic to the Antarctic.'
      },
      {
        heading: '🌊 Facts',
        list: [
          '<strong>Size:</strong> Up to 32 feet (10 meters) long',
          '<strong>Weight:</strong> Up to 6 tons',
          '<strong>Diet:</strong> Fish, seals, and other marine mammals',
          '<strong>Lifespan:</strong> 50-80+ years in the wild',
          '<strong>Social:</strong> Live in family groups called pods'
        ]
      },
      {
        heading: '🧠 Intelligence',
        body: 'Orcas are apex predators with complex hunting strategies, complex social structures, and even distinctive "dialects" within their pods. They are considered one of the most intelligent animals on Earth.'
      },
      {
        heading: '🌍 Conservation',
        body: 'Some orca populations are endangered due to pollution, climate change, and prey depletion. Organizations worldwide work to protect these magnificent creatures.'
      }
    ]
  },

  manta: {
    accent: '#00bfff',
    title: '🌊 Manta Ray (Giant Oceanic Manta)',
    sections: [
      {
        heading: 'About the Manta Ray',
        body: 'Manta rays are majestic, gentle giants of the sea. Unlike many other rays, they do not possess a stinging spine and are completely harmless to humans, gliding through temperate waters as filter feeders.'
      },
      {
        heading: '🐟 Quick Facts',
        list: [
          '<strong>Wingspan:</strong> Up to 29 feet (8.8 meters) wide',
          '<strong>Weight:</strong> Up to 3,000 lbs (1,350 kg)',
          '<strong>Diet:</strong> Microscopic zooplankton and tiny fish',
          '<strong>Lifespan:</strong> Around 40 years in the wild',
          '<strong>Habitat:</strong> Tropical, subtropical, and warm temperate oceans'
        ]
      },
      {
        heading: '🧠 High Intelligence',
        body: 'Manta rays possess the largest brain-to-body weight ratio of any cold-blooded fish. They exhibit exceptional curiosity, playfulness, and have even passed mirror self-recognition tests, demonstrating self-awareness.'
      },
      {
        heading: '🛡️ Conservation',
        body: 'Manta rays are classified as Vulnerable. They face continuous threats from commercial fishing, gill net entanglements, and plastic pollution disrupting their feeding waters.'
      }
    ]
  },

  gardineroseris: {
    accent: '#00ffff',
    title: '🪸 Gardineroseris',
    sections: [
      {
        heading: '🌊 About Gardineroseris',
        body: 'Gardineroseris planulata is a species of stony coral known for forming broad, flat, plate-like colonies that maximize sunlight exposure. Found on tropical coral reefs throughout the Indo-Pacific region, this coral contributes to reef-building ecosystems and provides habitat for countless marine organisms.'
      },
      {
        heading: '💡 Quick Facts',
        list: [
          '<strong>Scientific Name:</strong> Gardineroseris planulata',
          '<strong>Type:</strong> Reef-building stony coral (Scleractinian coral)',
          '<strong>Size:</strong> Colonies can grow over 1 meter (3+ feet) across',
          '<strong>Lifespan:</strong> Potentially several decades to centuries',
          '<strong>Habitat:</strong> Tropical coral reefs throughout the Indo-Pacific'
        ]
      },
      {
        heading: '☀️ Symbiotic Partnership',
        body: 'Like many reef-building corals, Gardineroseris planulata lives in partnership with microscopic algae called zooxanthellae. These algae perform photosynthesis and provide nutrients to the coral, while the coral offers shelter and access to sunlight.'
      },
      {
        heading: '🤯 Did You Know?',
        body: 'Although it looks like a single organism, a colony of Gardineroseris planulata is actually made up of thousands of tiny coral polyps working together. Each polyp is an individual animal, but together they build the large plate-shaped structure seen on the reef.'
      }
    ]
  }
};

function registerInfoPopup() {
  AFRAME.registerComponent('info-popup', {
    schema: {
      key: { type: 'string' }
    },

    init: function () {
      this.show = this.show.bind(this);
      this.el.addEventListener('click', this.show);
      this.el.addEventListener('egg-clicked', this.show);
    },

    remove: function () {
      this.el.removeEventListener('click', this.show);
      this.el.removeEventListener('egg-clicked', this.show);
    },

    renderSection: function (section) {
      const inner = section.list
        ? `<ul>${section.list.map((li) => `<li>${li}</li>`).join('')}</ul>`
        : `<p>${section.body}</p>`;
      return `<div class="info-section"><h3>${section.heading}</h3>${inner}</div>`;
    },

    show: function () {
      const data = INFO_POPUP_DATA[this.data.key];
      if (!data) {
        console.warn(`info-popup: no data for key "${this.data.key}"`);
        return;
      }

      // Only one popup at a time
      const existing = document.querySelector('.info-popup-overlay');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.className = 'info-popup-overlay';
      overlay.style.setProperty('--accent', data.accent);
      overlay.innerHTML = `
        <div class="info-popup-card">
          <button class="info-popup-close" aria-label="Close">&times;</button>
          <h2>${data.title}</h2>
          ${data.sections.map((s) => this.renderSection(s)).join('')}
        </div>
      `;

      const close = () => {
        overlay.remove();
        document.removeEventListener('keydown', onKey);
      };
      const onKey = (e) => { if (e.key === 'Escape') close(); };

      overlay.querySelector('.info-popup-close').addEventListener('click', close);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
      document.addEventListener('keydown', onKey);

      document.body.appendChild(overlay);
    }
  });
}
