import {effect, untracked, type CleanupFunction} from '@dnd-kit/state';
import {configurator, Plugin} from '@dnd-kit/abstract';
import {
  animateTransform,
  cloneElement,
  isKeyboardEvent,
  showPopover,
  getComputedStyles,
  supportsPopover,
  supportsStyle,
  Styles,
  parseTranslate,
  ProxiedElements,
  getWindow,
  generateUniqueId,
  getDocument,
  getFrameTransform,
  DOMRectangle,
  getFrameElement,
} from '@dnd-kit/dom/utilities';
import {Coordinates} from '@dnd-kit/geometry';

import type {DragDropManager} from '../../manager/index.ts';
import type {Draggable, Droppable} from '../../entities/index.ts';

const ATTR_PREFIX = 'data-dnd-';
const CSS_PREFIX = '--dnd-';
const ATTRIBUTE = `${ATTR_PREFIX}dragging`;
const cssRules = `[${ATTRIBUTE}] {position: fixed !important;pointer-events: none !important;touch-action: none !important;z-index: calc(infinity);will-change: translate;top: var(${CSS_PREFIX}top, 0px) !important;left: var(${CSS_PREFIX}left, 0px) !important;width: var(${CSS_PREFIX}width, auto) !important;height: var(${CSS_PREFIX}height, auto) !important;box-sizing:border-box;}[${ATTRIBUTE}] *{pointer-events: none !important;}[${ATTRIBUTE}][style*="${CSS_PREFIX}translate"] {translate: var(${CSS_PREFIX}translate) !important;}[style*="${CSS_PREFIX}transition"] {transition: var(${CSS_PREFIX}transition) !important;}*:where([${ATTRIBUTE}][popover]){overflow:visible;background:var(${CSS_PREFIX}background);border:var(${CSS_PREFIX}border);margin:unset;padding:unset;color:inherit;}[${ATTRIBUTE}]::backdrop {display: none}html:has([${ATTRIBUTE}]) * {user-select:none;-webkit-user-select:none;}`;
const PLACEHOLDER_ATTRIBUTE = `${ATTR_PREFIX}placeholder`;
const IGNORED_ATTRIBUTES = [ATTRIBUTE, PLACEHOLDER_ATTRIBUTE, 'popover'];
const IGNORED_STYLES = ['view-transition-name'];

export interface FeedbackOptions {
  rootElement?: Element | ((source: Draggable) => Element);
}

export class Feedback extends Plugin<DragDropManager, FeedbackOptions> {
  constructor(manager: DragDropManager, options?: FeedbackOptions) {
    super(manager);

    const styleTags = new Map<Document, HTMLStyleElement>();

    let initialSize: {width: number; height: number} | undefined;
    let initialCoordinates: Coordinates | undefined;
    let initialFrameTransform:
      | {x: number; y: number; scaleX: number; scaleY: number}
      | undefined;
    let initialTranslate: Coordinates = {x: 0, y: 0};
    let currentTranslate: Coordinates | undefined;
    let transformOrigin: Coordinates | undefined;
    let moved = false;

    const styleInjectionCleanup = effect(() => {
      const {status, source, target} = manager.dragOperation;

      if (status.initialized) {
        const sourceDocument = getDocument(source?.element ?? null);
        const targetDocument = getDocument(target?.element ?? null);
        const documents = new Set([sourceDocument, targetDocument]);

        for (const doc of documents) {
          if (!styleTags.has(doc)) {
            const style = document.createElement('style');
            style.innerText = cssRules;
            doc.head.prepend(style);
            styleTags.set(doc, style);
          }
        }

        return styleInjectionCleanup;
      }
    });

    const cleanupEffect = effect(() => {
      const {dragOperation} = manager;
      const {position, source, status} = dragOperation;

      if (status.idle) {
        currentTranslate = undefined;
        initialCoordinates = undefined;
        initialSize = undefined;
        initialFrameTransform = undefined;
        initialTranslate = {x: 0, y: 0};
        transformOrigin = undefined;
        return;
      }

      if (!source) return;

      const {element, feedback} = source;

      if (!element || feedback === 'none') {
        return;
      }

      let cleanup: CleanupFunction | undefined;

      const frameTransform = getFrameTransform(element);
      const shape = new DOMRectangle(element, {
        frameTransform: null,
        ignoreTransforms: true,
      });
      const {width, height, top, left} = shape;
      const styles = new Styles(element);
      const {background, border, transition, translate} =
        getComputedStyles(element);
      const clone = feedback === 'clone';

      const placeholder =
        feedback !== 'move' ? createPlaceholder(source) : null;
      const isKeyboardOperation = untracked(() =>
        isKeyboardEvent(manager.dragOperation.activatorEvent)
      );

      if (translate !== 'none') {
        const parsedTranslate = parseTranslate(translate);

        if (parsedTranslate) {
          initialTranslate = parsedTranslate;
        }
      }

      const relativeTop = top * frameTransform.scaleY + frameTransform.y;
      const relativeLeft = left * frameTransform.scaleX + frameTransform.x;

      if (!initialCoordinates) {
        initialCoordinates = {x: relativeLeft, y: relativeTop};
      }

      if (!initialSize) {
        initialSize = {width, height};
      }

      if (!initialFrameTransform) {
        initialFrameTransform = frameTransform;
      }

      if (!transformOrigin) {
        const current = untracked(() => position.current);

        transformOrigin = {
          x:
            (current.x - left * frameTransform.scaleX - frameTransform.x) /
            (width * frameTransform.scaleX),
          y:
            (current.y - top * frameTransform.scaleY - frameTransform.y) /
            (height * frameTransform.scaleY),
        };
      }

      const coordinatesDelta = {
        x: initialCoordinates.x - relativeLeft,
        y: initialCoordinates.y - relativeTop,
      };
      const sizeDelta = {
        width:
          (initialSize.width / initialFrameTransform.scaleX -
            width / frameTransform.scaleX) *
          transformOrigin.x,
        height:
          (initialSize.height / initialFrameTransform.scaleY -
            height / frameTransform.scaleY) *
          transformOrigin.y,
      };
      const delta = {
        x: coordinatesDelta.x / frameTransform.scaleX - sizeDelta.width,
        y: coordinatesDelta.y / frameTransform.scaleY - sizeDelta.height,
      };
      const projected = {
        left: left + delta.x,
        top: top + delta.y,
      };

      element.setAttribute(ATTRIBUTE, 'true');

      const transform = untracked(() => dragOperation.transform);
      const translateString = `${transform.x * frameTransform.scaleX + initialTranslate.x}px ${transform.y * frameTransform.scaleY + initialTranslate.y}px 0`;

      styles.set(
        {
          width: width,
          height: height,
          top: projected.top,
          left: projected.left,
          background,
          border,
          translate: translateString,
        },
        CSS_PREFIX
      );

      if (placeholder) {
        element.insertAdjacentElement('afterend', placeholder);

        if (options?.rootElement) {
          const root =
            typeof options.rootElement === 'function'
              ? options.rootElement(source)
              : options.rootElement;

          root.appendChild(element);
        }
      }

      if (supportsPopover(element)) {
        if (!element.hasAttribute('popover')) {
          element.setAttribute('popover', '');
        }
        showPopover(element);
      }

      const actual = new DOMRectangle(element, {
        ignoreTransforms: true,
      });
      const offset = {
        top: projected.top - actual.top,
        left: projected.left - actual.left,
      };

      if (Math.abs(offset.left) > 0.01 || Math.abs(offset.top) > 0.01) {
        styles.set(
          {
            top: actual.top + offset.top,
            left: actual.left + offset.left,
          },
          CSS_PREFIX
        );
      } else {
        // Ignore sub-pixel offsets
        offset.left = 0;
        offset.top = 0;
      }

      const resizeObserver = new ResizeObserver(() => {
        if (!placeholder) return;

        const placeholderShape = new DOMRectangle(placeholder, {
          ignoreTransforms: true,
        });
        const origin = transformOrigin ?? {x: 1, y: 1};
        const dX = (width - placeholderShape.width) * origin.x + delta.x;
        const dY = (height - placeholderShape.height) * origin.y + delta.y;

        styles.set(
          {
            width: placeholderShape.width,
            height: placeholderShape.height,
            top: top + dY,
            left: left + dX,
          },
          CSS_PREFIX
        );

        const window = getWindow(element);

        /* Table cells need to have their width set explicitly because the feedback element is position fixed */
        if (
          element instanceof window.HTMLTableRowElement &&
          placeholder instanceof window.HTMLTableRowElement
        ) {
          const cells = Array.from(element.cells);
          const placeholderCells = Array.from(placeholder.cells);

          for (const [index, cell] of cells.entries()) {
            const placeholderCell = placeholderCells[index];

            cell.style.width = `${placeholderCell.offsetWidth}px`;
          }
        }

        dragOperation.shape = new DOMRectangle(element);
      });

      /* Initialize drag operation shape */
      dragOperation.shape = new DOMRectangle(element);
      source.status = 'dragging';

      let elementMutationObserver: MutationObserver | undefined;
      let documentMutationObserver: MutationObserver | undefined;

      if (placeholder) {
        resizeObserver.observe(placeholder);

        elementMutationObserver = new MutationObserver(() => {
          for (const attribute of Array.from(element.attributes)) {
            if (
              attribute.name.startsWith('aria-') ||
              IGNORED_ATTRIBUTES.includes(attribute.name)
            ) {
              continue;
            }

            if (attribute.name === 'style') {
              if (supportsStyle(element) && supportsStyle(placeholder)) {
                placeholder.setAttribute('style', clone ? '' : 'opacity: 0;');
                placeholder.style.setProperty('transition', 'none');

                for (const key of Object.values(element.style)) {
                  if (
                    key.startsWith(CSS_PREFIX) ||
                    IGNORED_STYLES.includes(key)
                  ) {
                    continue;
                  }

                  placeholder.style.setProperty(
                    key,
                    element.style.getPropertyValue(key)
                  );
                }
              }
              continue;
            }

            placeholder.setAttribute(attribute.name, attribute.value);
          }

          if (clone) {
            placeholder.innerHTML = element.innerHTML;
          }
        });

        elementMutationObserver.observe(element, {
          attributes: true,
          subtree: true,
        });

        documentMutationObserver = new MutationObserver((entries) => {
          for (const entry of entries) {
            const {addedNodes} = entry;

            if (
              addedNodes.length > 0 &&
              Array.from(addedNodes).some((node) => node.contains(element))
            ) {
              /* Update the position of the placeholder when the source element is moved */
              element.insertAdjacentElement('afterend', placeholder);

              /*
               * Any update in DOM order that affects the source element hides the popover
               * so we need to force the source element to be promoted to the top layer again
               */
              showPopover(element);
              return;
            }
          }
        });

        /* Observe mutations on the element's owner document body */
        documentMutationObserver.observe(element.ownerDocument.body, {
          childList: true,
          subtree: true,
        });
      }

      const cleanupEffect = effect(function updateTransform() {
        const {transform, status} = dragOperation;

        if (!transform.x && !transform.y && !moved) {
          return;
        }

        if (!moved) {
          moved = true;
        }

        if (status.dragging) {
          const translateTransition = isKeyboardOperation
            ? '250ms cubic-bezier(0.25, 1, 0.5, 1)'
            : '0ms linear';

          const x = transform.x / frameTransform.scaleX + initialTranslate.x;
          const y = transform.y / frameTransform.scaleY + initialTranslate.y;

          styles.set(
            {
              transition: `${transition}, translate ${translateTransition}`,
              translate: `${x}px ${y}px 0`,
            },
            CSS_PREFIX
          );

          dragOperation.shape = new DOMRectangle(element);

          currentTranslate = {
            x,
            y,
          };
        }
      });

      const id = manager.dragOperation.source?.id;

      const restoreFocus = () => {
        if (!isKeyboardOperation || id == null) {
          return;
        }

        const draggable = manager.registry.draggables.get(id);
        const element = draggable?.handle ?? draggable?.element;

        if (element instanceof HTMLElement) {
          element.focus();
        }
      };

      let dropEffectCleanup: CleanupFunction | undefined;
      cleanup = () => {
        elementMutationObserver?.disconnect();
        documentMutationObserver?.disconnect();
        resizeObserver.disconnect();

        styles.reset();

        if (
          placeholder &&
          (moved || placeholder.parentElement !== element.parentElement) &&
          element.isConnected
        ) {
          placeholder.replaceWith(element);
        }

        placeholder?.remove();
        element.removeAttribute(ATTRIBUTE);

        if (supportsPopover(element)) {
          element.removeAttribute('popover');
        }

        cleanupEffect();
        dropEffectCleanup?.();

        source.status = 'idle';
        moved = false;
      };

      dropEffectCleanup = effect(function dropAnimation() {
        if (dragOperation.status.dropped) {
          const onComplete = cleanup;
          cleanup = undefined;

          source.status = 'dropping';

          const transform = currentTranslate;

          if (!transform) {
            onComplete?.();
            return;
          }

          manager.renderer.rendering.then(() => {
            /* Force the source element to be promoted to the top layer before animating it */
            showPopover(element);

            const target = placeholder ?? element;

            const animations = element.getAnimations();

            if (animations.length) {
              animations.forEach((animation) => {
                const {effect} = animation;

                if (effect instanceof KeyframeEffect) {
                  if (
                    effect.getKeyframes().some((keyframe) => keyframe.translate)
                  ) {
                    animation.finish();
                  }
                }
              });
            }

            const sameFrame =
              getFrameElement(element) === getFrameElement(target);
            const options = {
              frameTransform: sameFrame ? null : undefined,
            };
            const current = new DOMRectangle(element, options);
            const final = new DOMRectangle(target, options);
            const delta = {
              x: current.center.x - final.center.x,
              y: current.center.y - final.center.y,
            };
            const finalTransform = {
              x: transform.x - delta.x,
              y: transform.y - delta.y,
            };
            const heightKeyframes =
              Math.round(current.height) !== Math.round(final.height)
                ? {
                    minHeight: [`${current.height}px`, `${final.height}px`],
                    maxHeight: [`${current.height}px`, `${final.height}px`],
                  }
                : {};
            const widthKeyframes =
              Math.round(current.width) !== Math.round(final.width)
                ? {
                    minWidth: [`${current.width}px`, `${final.width}px`],
                    maxWidth: [`${current.width}px`, `${final.width}px`],
                  }
                : {};

            animateTransform({
              element,
              keyframes: {
                ...heightKeyframes,
                ...widthKeyframes,
                translate: [
                  `${transform.x}px ${transform.y}px 0`,
                  `${finalTransform.x}px ${finalTransform.y}px 0`,
                ],
              },
              options: {
                duration: moved ? 250 : 0,
                easing: 'ease',
              },
              onReady() {
                styles.remove(['translate'], CSS_PREFIX);
              },
              onFinish() {
                requestAnimationFrame(restoreFocus);
                onComplete?.();
              },
            });
          });
        }
      });

      return () => cleanup?.();
    });

    this.destroy = () => {
      styleInjectionCleanup();
      cleanupEffect();
      styleTags.forEach((style) => style.remove());
    };
  }

  static configure = configurator(Feedback);
}

function createPlaceholder(source: Draggable) {
  return untracked(() => {
    const {element, manager} = source;

    if (!element || !manager) return;

    const {droppables} = manager.registry;
    const containedDroppables = new Map<Droppable, string>();

    for (const droppable of droppables) {
      if (!droppable.element) continue;

      if (
        element === droppable.element ||
        element.contains(droppable.element)
      ) {
        const identifierAttribute = `${ATTR_PREFIX}${generateUniqueId('dom-id')}`;

        droppable.element.setAttribute(identifierAttribute, '');

        containedDroppables.set(droppable, identifierAttribute);
      }
    }

    const cleanup: CleanupFunction[] = [];
    const placeholder = cloneElement(element);
    const {remove} = placeholder;

    for (const [droppable, identifierAttribute] of containedDroppables) {
      if (!droppable.element) continue;

      const selector = `[${identifierAttribute}]`;
      const clonedElement = placeholder.matches(selector)
        ? placeholder
        : placeholder.querySelector(selector);

      droppable.element?.removeAttribute(identifierAttribute);

      if (!clonedElement) continue;

      let current = droppable.element;

      droppable.proxy = clonedElement;
      clonedElement.removeAttribute(identifierAttribute);

      ProxiedElements.set(current, clonedElement);

      cleanup.push(() => {
        ProxiedElements.delete(current);
        droppable.proxy = undefined;
      });
    }

    placeholder.setAttribute('inert', 'true');
    placeholder.setAttribute('tab-index', '-1');
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.setAttribute(PLACEHOLDER_ATTRIBUTE, '');
    placeholder.remove = () => {
      cleanup.forEach((fn) => fn());
      remove.call(placeholder);
    };

    return placeholder;
  });
}
