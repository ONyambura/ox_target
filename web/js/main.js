import { createOptions, closeCurrentSubmenu } from "./createOptions.js";

const optionsWrapper = document.getElementById("options-wrapper");
const body = document.body;
const eye = document.getElementById("eyeSvg");

// Developer mode flag - set to true for web testing, false for production
const DEVELOPER_MODE = typeof GetParentResourceName === 'undefined';

// Create left and right containers
function createSideContainers() {
  // Clear existing containers
  optionsWrapper.innerHTML = '';
  
  const leftContainer = document.createElement('div');
  leftContainer.id = 'options-left';
  leftContainer.className = 'options-side-container side-left';
  
  const rightContainer = document.createElement('div');
  rightContainer.id = 'options-right';
  rightContainer.className = 'options-side-container side-right';
  
  optionsWrapper.appendChild(leftContainer);
  optionsWrapper.appendChild(rightContainer);
}

// Test data for developer mode
const testData = {
  options: {
    __global: [
      {
        icon: 'fa-solid fa-hand',
        label: 'Interact',
        hide: false,
        side: 'right'
      },
      {
        icon: 'fa-solid fa-cog',
        label: 'Settings',
        hide: false,
        side: 'left',
        subMenu: [
          {
            icon: 'fa-solid fa-volume-up',
            label: 'Audio Settings',
            hide: false,
            subMenu: [
              {
                icon: 'fa-solid fa-music',
                label: 'Music Volume',
                hide: false
              },
              {
                icon: 'fa-solid fa-microphone',
                label: 'Voice Volume',
                hide: false
              }
            ]
          },
          {
            icon: 'fa-solid fa-display',
            label: 'Display Settings',
            hide: false
          }
        ]
      },
      {
        icon: 'fa-solid fa-user',
        label: 'Player Actions',
        hide: false,
        side: 'right',
        subMenu: [
          {
            icon: 'fa-solid fa-id-card',
            label: 'Show ID',
            hide: false
          },
          {
            icon: 'fa-solid fa-handshake',
            label: 'Greet',
            hide: false
          }
        ]
      }
    ],
    globalTarget: [
      {
        icon: 'fa-solid fa-car',
        label: 'Vehicle Options',
        hide: false,
        side: 'left',
        subMenu: [
          {
            icon: 'fa-solid fa-key',
            label: 'Lock/Unlock',
            hide: false
          },
          {
            icon: 'fa-solid fa-gas-pump',
            label: 'Refuel',
            hide: false
          }
        ]
      },
      {
        icon: 'fa-solid fa-wrench',
        label: 'Repair Vehicle',
        hide: false,
        side: 'right'
      }
    ]
  },
  zones: [
    [
      {
        icon: 'fa-solid fa-door-open',
        label: 'Enter Building',
        hide: false,
        side: 'right'
      },
      {
        icon: 'fa-solid fa-shopping-cart',
        label: 'Shop Menu',
        hide: false,
        side: 'left',
        subMenu: [
          {
            icon: 'fa-solid fa-apple-alt',
            label: 'Food',
            hide: false
          },
          {
            icon: 'fa-solid fa-tshirt',
            label: 'Clothing',
            hide: false
          }
        ]
      }
    ]
  ]
};

window.addEventListener("message", (event) => {
  createSideContainers();
  closeCurrentSubmenu();

  switch (event.data.event) {
    case "visible": {
      body.style.visibility = event.data.state ? "visible" : "hidden";
      eye.classList.remove("eye-hover");
      return;
    }

    case "leftTarget": {
      eye.classList.remove("eye-hover");
      return;
    }

    case "setTarget": {
      eye.classList.add("eye-hover");

      if (event.data.options) {
        for (const type in event.data.options) {
          event.data.options[type].forEach((data, id) => {
            const side = data.side || 'right'; // Default to right if no side specified
            createOptions(type, data, id + 1, null, side);
          });
        }
      }

      if (event.data.zones) {
        for (let i = 0; i < event.data.zones.length; i++) {
          event.data.zones[i].forEach((data, id) => {
            const side = data.side || 'right'; // Default to right if no side specified
            createOptions("zones", data, id + 1, i + 1, side);
          });
        }
      }
      break;
    }
  }
});

// Developer mode initialization
if (DEVELOPER_MODE) {
  console.log('Developer mode enabled - using test data');
  
  // Simulate the targeting system for testing
  document.addEventListener('keydown', (e) => {
    if (e.key === 'e' || e.key === 'E') {
      if (body.style.visibility === 'visible') {
        // Hide
        body.style.visibility = 'hidden';
        eye.classList.remove("eye-hover");
        closeCurrentSubmenu();
      } else {
        // Show with test data
        body.style.visibility = 'visible';
        eye.classList.add("eye-hover");
        createSideContainers();
        closeCurrentSubmenu();
        
        // Create test options
        for (const type in testData.options) {
          testData.options[type].forEach((data, id) => {
            const side = data.side || 'right';
            createOptions(type, data, id + 1, null, side);
          });
        }
        
        if (testData.zones) {
          for (let i = 0; i < testData.zones.length; i++) {
            testData.zones[i].forEach((data, id) => {
              const side = data.side || 'right';
              createOptions("zones", data, id + 1, i + 1, side);
            });
          }
        }
      }
    }
  });
  
  // Show instructions
  const instructions = document.createElement('div');
  instructions.innerHTML = `
    <div style="position: fixed; top: 10px; left: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-family: Arial; font-size: 12px; z-index: 1000;">
      <strong>Developer Mode</strong><br>
      Press 'E' to toggle targeting<br>
      <strong>Left side:</strong> Settings, Vehicle Options, Shop Menu<br>
      <strong>Right side:</strong> Interact, Player Actions, Repair, Enter Building<br>
      Click options with arrows to open submenus<br>
      Click outside submenu to close it
    </div>
  `;
  document.body.appendChild(instructions);
}