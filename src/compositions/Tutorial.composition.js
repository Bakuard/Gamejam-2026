export const tutorialComposition = {
  showTutorial(tutorialStore, tooltip) {
    tutorialStore.tutorial.push(tooltip);
  },
};