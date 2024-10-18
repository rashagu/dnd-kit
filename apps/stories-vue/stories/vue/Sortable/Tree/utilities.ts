import {UniqueIdentifier} from '@dnd-kit/abstract';
import type {Item, FlattenedItem} from './types';

export function flattenTree(
  items: Item[],
  parentId: string | null = null,
  depth = 0
): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    return [
      ...acc,
      {...item, parentId, depth, index},
      ...flattenTree(item.children, item.id, depth + 1),
    ];
  }, []);
}

export function buildTree(flattenedItems: FlattenedItem[]): Item[] {
  const root: Item = {id: 'root', children: []};
  const nodes: Record<string, Item> = {[root.id]: root};
  const items = flattenedItems.map((item) => ({...item, children: []}));

  for (const item of items) {
    const {id, children} = item;
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId] ?? items.find(({id}) => id === parentId);

    nodes[id] = {id, children};
    parent.children.push(item);
  }

  return root.children;
}

export function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

export function getProjection(
  items: FlattenedItem[],
  targetId: UniqueIdentifier,
  projectedDepth: number
) {
  const targetItemIndex = items.findIndex(({id}) => id === targetId);
  const previousItem = items[targetItemIndex - 1];
  const nextItem = items[targetItemIndex + 1];
  const maxDepth = getMaxDepth(previousItem);
  const minDepth = getMinDepth(previousItem, nextItem);
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return {depth, maxDepth, minDepth, parentId: getParentId()};

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = items
      .slice(0, targetItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? null;
  }
}

function getMaxDepth(previousItem: FlattenedItem) {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
}

function getMinDepth(previousItem: FlattenedItem, nextItem: FlattenedItem) {
  if (previousItem && nextItem) {
    return Math.min(previousItem.depth, nextItem.depth);
  }

  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}
