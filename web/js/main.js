import { createOptions, createSubMenu } from "./createOptions.js";

const optionsWrapper = document.getElementById("options-wrapper");
const body = document.body;
const eye = document.getElementById("eyeSvg");

// Developer mode flag - set to true for web testing, false for production
const DEVELOPER_MODE = typeof GetParentResourceName === 'undefined';

let currentSubmenu = null;
let currentSide = 'right'; // Default side

// Test data for developer mode
const testData = {
  options: {
    __global: [
      {
        icon: 'fa-solid fa-hand',
        label: 'Interact',
        hide: false
      },
      {
        icon: 'fa-solid fa-cog',
        label: 'Settings',
        hide: false,
        subMenu: [
          {
            icon: 'fa-solid fa-volume-up',
            label: 'Audio Settings',
            hide: false
          },
          {
            icon: 'fa-solid fa-display',
            label: 'Display Settings',
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
      }
    ]
  },
  zones: [
    [
      {
        icon: 'fa-solid fa-door-open',
        label: 'Enter Building',
        hide: false
      }
    ]
  ]
};

// Handle option clicks with submenu support
function handleOptionClick(event) {
  const option = event.currentTarget;
  
  if (option.subMenuData) {
    event.stopPropagation();
    
    // If submenu is already open for this option, close it
    if (currentSubmenu && currentSubmenu.parentOption === option) {
      currentSubmenu.remove();
      currentSubmenu = null;
      return;
    }
    
    // Close any existing submenu
    if (currentSubmenu) {
      currentSubmenu.remove();
    }
    
    // Create new submenu
    currentSubmenu = createSubMenu(option, option.subMenuData, option.side);
    currentSubmenu.parentOption = option;
  }
}

// Add event delegation for option clicks
optionsWrapper.addEventListener('click', handleOptionClick);

window.addEventListener("message", (event) => {
  optionsWrapper.innerHTML = "";
  currentSubmenu = null;

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
      
      // Determine side from data or use default
      currentSide = event.data.side || 'right';
      optionsWrapper.className = `side-${currentSide}`;

      if (event.data.options) {
        for (const type in event.data.options) {
          event.data.options[type].forEach((data, id) => {
            createOptions(type, data, id + 1, null, currentSide);
          });
        }
      }

      if (event.data.zones) {
        for (let i = 0; i < event.data.zones.length; i++) {
          event.data.zones[i].forEach((data, id) => {
            createOptions("zones", data, id + 1, i + 1, currentSide);
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
      } else {
        // Show with test data
        body.style.visibility = 'visible';
        eye.classList.add("eye-hover");
        optionsWrapper.innerHTML = "";
        currentSubmenu = null;
        
        // Test both sides
        currentSide = Math.random() > 0.5 ? 'left' : 'right';
        optionsWrapper.className = `side-${currentSide}`;
        
        // Create test options
        for (const type in testData.options) {
          testData.options[type].forEach((data, id) => {
            createOptions(type, data, id + 1, null, currentSide);
          });
        }
        
        if (testData.zones) {
          for (let i = 0; i < testData.zones.length; i++) {
            testData.zones[i].forEach((data, id) => {
              createOptions("zones", data, id + 1, i + 1, currentSide);
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
      Click options to test functionality<br>
      Options with arrows have submenus
    </div>
  `;
  document.body.appendChild(instructions);
}