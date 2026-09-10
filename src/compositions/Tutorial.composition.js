export const tutorialComposition = {
  showTutorial(tutorialStore, tooltip) {
    tutorialStore.tutorial.push(tooltip);
  },

  showTooltip(tutorialStore, tooltip) {
    const exists = tutorialStore.tooltips.some((item) => item.id === tooltip.id);
    if (!exists) {
      tutorialStore.tooltips.push(tooltip);
    }
  },

  hideTooltip(tutorialStore, tooltip) {
    const id = typeof tooltip === "string" ? tooltip : tooltip?.id;
    const index = tutorialStore.tooltips.findIndex((item) => item.id === id);
    if (index !== -1) {
      tutorialStore.tooltips.splice(index, 1);
    }
  },
};