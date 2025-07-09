import { fetchNui } from "./fetchNui.js";

const optionsWrapper = document.getElementById("options-wrapper");

function onClick() {
  // when nuifocus is disabled after a click, the hover event is never released
  this.style.pointerEvents = "none";

  fetchNui("select", [this.targetType, this.targetId, this.zoneId]);
  // is there a better way to handle this? probably
  setTimeout(() => (this.style.pointerEvents = "auto"), 100);
}

export function createOptions(type, data, id, zoneId, side = 'right', isSubMenu = false, parentElement = null) {
  if (data.hide) return;

  const option = document.createElement("div");
  const iconElement = `<i class="fa-fw ${data.icon} option-icon" ${
    data.iconColor ? `style = color:${data.iconColor} !important` : null
  }"></i>`;

  option.innerHTML = `${iconElement}<p class="option-label">${data.label}</p>`;
  
  // Add submenu indicator if this option has a submenu
  if (data.subMenu) {
    const submenuIndicator = side === 'left' ? 
      '<i class="fa-solid fa-chevron-left submenu-indicator"></i>' : 
      '<i class="fa-solid fa-chevron-right submenu-indicator"></i>';
    option.innerHTML += submenuIndicator;
  }

  option.className = `option-container ${isSubMenu ? 'submenu-option' : ''} side-${side}`;
  option.targetType = type;
  option.targetId = id;
  option.zoneId = zoneId;
  option.side = side;
  option.isSubMenu = isSubMenu;
  option.subMenuData = data.subMenu;

  option.addEventListener("click", onClick);
  
  if (parentElement) {
    parentElement.appendChild(option);
  } else {
    optionsWrapper.appendChild(option);
  }

  return option;
}

export function createSubMenu(parentOption, subMenuData, side) {
  // Remove existing submenu if any
  const existingSubmenu = document.querySelector('.submenu-container');
  if (existingSubmenu) {
    existingSubmenu.remove();
  }

  const submenuContainer = document.createElement("div");
  submenuContainer.className = `submenu-container side-${side}`;
  
  // Position submenu relative to parent
  const parentRect = parentOption.getBoundingClientRect();
  const wrapperRect = optionsWrapper.getBoundingClientRect();
  
  if (side === 'left') {
    submenuContainer.style.right = `${optionsWrapper.offsetWidth}px`;
  } else {
    submenuContainer.style.left = `${optionsWrapper.offsetWidth}px`;
  }
  
  submenuContainer.style.top = `${parentRect.top - wrapperRect.top}px`;

  // Create submenu options
  subMenuData.forEach((data, index) => {
    createOptions('submenu', data, index + 1, null, side, true, submenuContainer);
  });

  optionsWrapper.appendChild(submenuContainer);
  
  // Add click outside to close submenu
  const closeSubmenu = (e) => {
    if (!submenuContainer.contains(e.target) && !parentOption.contains(e.target)) {
      submenuContainer.remove();
      document.removeEventListener('click', closeSubmenu);
    }
  };
  
  setTimeout(() => {
    document.addEventListener('click', closeSubmenu);
  }, 100);

  return submenuContainer;
}