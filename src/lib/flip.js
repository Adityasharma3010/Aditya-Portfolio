// Hand-off between the project card (PageTransition) and the case-study page (ProjectPage):
// the card's image frame is cloned and expanded, then the case-study page shrinks it into its own cover.
let pending = null;
export const setFlip = (clone) => { pending = clone; };
export const takeFlip = () => {
  const c = pending;
  pending = null;
  return c;
};
