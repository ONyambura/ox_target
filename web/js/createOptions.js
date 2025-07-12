import { fetchNui } from "./fetchNui.js";

const optionsWrapper = document.getElementById("options-wrapper");
let currentSubmenu = null;

function onClick(event) {
  const option = event.currentTarget;
  
  // Handle submenu toggle
  if (option.subMenuData && option.subMenuData.length > 0) {
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
      currentSubmenu = null;
    }
    
    // Create new submenu
    currentSubmenu = createSubMenu(option, option.subMenuData, option.side);
    currentSubmenu.parentOption = option;
    return;
  }
  
  // Handle regular option click
  option.style.pointerEvents = "none";
  
  // Only call fetchNui if we're in FiveM environment
  if (typeof GetParentResourceName !== 'undefined') {
    fetchNui("select", [option.targetType, option.targetId, option.zoneId, option.subMenuData.subMenuId]);
  } else {
    console.log('Option selected:', option.querySelector('.option-label').textContent);
  }
  
  setTimeout(() => (option.style.pointerEvents = "auto"), 100);
}

export function createOptions(type, data, id, zoneId, side = 'right', isSubMenu = false, parentElement = null) {
  if (data.hide) return null;

  const option = document.createElement("div");
  const iconElement = `<i class="fa-fw ${data.icon} option-icon" ${
    data.iconColor ? `style = color:${data.iconColor} !important` : null
  }"></i>`;

  const labelElement = `<p class="option-label">${data.label}</p>`;
  
  // Add submenu indicator if this option has a submenu
  let submenuIndicator = '';
  if (data.subMenu && data.subMenu.length > 0) {
    submenuIndicator = side === 'left' ? 
      '<i class="fa-solid fa-chevron-left submenu-indicator"></i>' : 
      '<i class="fa-solid fa-chevron-right submenu-indicator"></i>';
  }

  // Arrange elements based on side
  if (side === 'left') {
    option.innerHTML = submenuIndicator + labelElement + iconElement;
  } else {
    option.innerHTML = iconElement + labelElement + submenuIndicator;
  }

  option.className = `option-container ${isSubMenu ? 'submenu-option' : ''} side-${side}`;
  option.targetType = type;
  option.targetId = id;
  option.zoneId = zoneId;
  option.side = side;
  option.isSubMenu = isSubMenu;
  option.subMenuData = data.subMenu ?? data;

    // console.log(JSON.stringify(option.subMenuData, null, 2));

  option.addEventListener("click", onClick);
  
  if (parentElement) {
    parentElement.appendChild(option);
  } else {
    // Determine which container to append to based on side
    const container = side === 'left' ? 
      document.getElementById('options-left') : 
      document.getElementById('options-right');
    
    if (container) {
      container.appendChild(option);
    } else {
      optionsWrapper.appendChild(option);
    }
  }

  return option;
}

export function createSubMenu(parentOption, subMenuData, side) {
  // Remove existing submenu if any
  if (currentSubmenu) {
    currentSubmenu.remove();
    currentSubmenu = null;
  }
  
  // console.log(JSON.stringify(parentOption, null, 2));

  const submenuContainer = document.createElement("div");
  submenuContainer.className = `submenu-container side-${side}`;
  
  // Position submenu relative to parent
  const parentRect = parentOption.getBoundingClientRect();
  const wrapperRect = optionsWrapper.getBoundingClientRect();
  
  if (side === 'left') {
    submenuContainer.style.right = `160px`; // Width of option + margin
  } else {
    submenuContainer.style.left = `160px`; // Width of option + margin
  }
  
  submenuContainer.style.top = `${parentRect.top - wrapperRect.top}px`;

  // Create submenu options
  subMenuData.forEach((data, index) => {
    if (!data.hide) {
  
      data.subMenuId = index + 1;
      data.targetId = parentOption.targetId;
      createOptions('submenu', data, parentOption.targetId, parentOption.zoneId, side, true, submenuContainer);
    }
  });

  // Append to the same container as parent
  const parentContainer = parentOption.closest('#options-left, #options-right, #options-wrapper');
  if (parentContainer) {
    parentContainer.appendChild(submenuContainer);
  } else {
    optionsWrapper.appendChild(submenuContainer);
  }
  
  // Add click outside to close submenu
  const closeSubmenu = (e) => {
    if (!submenuContainer.contains(e.target) && !parentOption.contains(e.target)) {
      submenuContainer.remove();
      currentSubmenu = null;
      document.removeEventListener('click', closeSubmenu);
    }
  };
  
  setTimeout(() => {
    document.addEventListener('click', closeSubmenu);
  }, 100);

  return submenuContainer;
}

// Export function to close current submenu
export function closeCurrentSubmenu() {
  if (currentSubmenu) {
    currentSubmenu.remove();
    currentSubmenu = null;
  }
}