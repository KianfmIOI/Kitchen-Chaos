import { createItem, hasTag } from "../obj/createItem.js";

// One function per interactionType (see kitchenSettings.js).
// Each gets the counter that was used, and the interaction api.
export const counterActions = {
  spawn(counter, { getHeldItem, holdItem }) {
    if (getHeldItem()) return; // hands are full

    holdItem(createItem(counter.userData.item));
  },

  chop(counter, { getHeldItem }) {
    const item = getHeldItem();
    if (!item) return;

    if (!hasTag(item, "choppable")) {
      console.log(`${item.name} can't be chopped`);
      return;
    }

    console.log(`chopping ${item.name}...`); // real chopping comes next
  },
};
