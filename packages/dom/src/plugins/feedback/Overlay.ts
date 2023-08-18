import {effect} from '@dnd-kit/state';
import type {CleanupFunction} from '@dnd-kit/state';
import {
  isKeyboardEvent,
  DOMRectangle,
  scheduler,
  createPlaceholder,
} from '@dnd-kit/dom-utilities';

import {DragDropManager} from '../../manager';
import {Rectangle} from '@dnd-kit/geometry';

const ATTRIBUTE = 'data-dnd-kit-overlay';

const css = `
  [${ATTRIBUTE}] {
    all: initial;
    position: fixed;
    pointer-events: none;
    touch-action: none;
    z-index: 999999;
  }
  [${ATTRIBUTE}] > * {
    width: 100%;
    height: 100%;
    margin: 0;
  }
  dialog[${ATTRIBUTE}]::backdrop {
    display: none
  }
`
  .trim()
  .replace(/\n|\s/g, '');

const INSIGNIFICANT_DELTA = 1;

export class Overlay {
  constructor(
    private manager: DragDropManager,
    anchor: Element,
    boundingRectangle = new DOMRectangle(anchor),
    tagName = 'dialog'
  ) {
    const {top, left, width, height} = boundingRectangle;
    const element = document.createElement(tagName);
    const style = document.createElement('style');
    style.innerText = css;

    element.style.setProperty('top', `${top}px`);
    element.style.setProperty('left', `${left}px`);

    element.style.setProperty('width', `${width}px`);
    element.style.setProperty('height', `${height}px`);

    if (isKeyboardEvent(manager.dragOperation.activatorEvent)) {
      element.style.setProperty('transition', 'transform 150ms ease');
    }

    document.head.appendChild(style);
    element.setAttribute(ATTRIBUTE, '');

    this.element = element;

    effect(() => {
      const {source} = manager.dragOperation;

      if (!source || !source.element) {
        return;
      }

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const {target} = entry;
          const {width, height} = new DOMRectangle(target, true);

          element.style.setProperty('width', `${width}px`);
          element.style.setProperty('height', `${height}px`);

          updatePosition();
        }
      });
      resizeObserver.observe(source.element);

      return () => {
        resizeObserver.disconnect();
      };
    });

    const updatePosition = () => {
      const {x, y} = this.transform;

      manager.dragOperation.shape = new DOMRectangle(element, true).translate(
        x,
        y
      );
      element.style.setProperty('transform', `translate3d(${x}px, ${y}px, 0)`);
    };

    this.destroy = effect(() => {
      const {dragOperation} = manager;
      const {status, transform} = dragOperation;

      if (status.initialized) {
        this.transform = transform;

        scheduler.schedule(updatePosition);
      }
    });
  }

  public isConnected = false;

  private element: HTMLElement;

  private destroy: CleanupFunction;

  private transform = {
    x: 0,
    y: 0,
  };

  private connectedCallback() {
    this.isConnected = true;

    if (this.element instanceof HTMLDialogElement) {
      this.element.showModal();
    }

    this.manager.dragOperation.shape = new DOMRectangle(this.element);
  }

  public appendTo(parentElement: Element) {
    parentElement.appendChild(this.element);
    this.connectedCallback();
  }

  public set children(element: Element) {
    if (this.element.firstElementChild === element) {
      return;
    }

    this.element.replaceChildren(element);
  }

  public contains(element: Element) {
    return this.element.contains(element);
  }

  public dropAnimation() {
    return new Promise<void>((resolve) => {
      const {manager} = this;
      const {source} = manager.dragOperation;
      const unmount = () => {
        this.element.remove();
        resolve();
      };

      if (!source || !manager.dragOperation.status.dropping) {
        unmount();
        return;
      }

      const {id} = source;
      const draggable = id != null ? manager.registry.draggables.get(id) : null;
      const element = draggable?.element;
      const currentShape = manager.dragOperation.shape;

      if (element && currentShape) {
        const shape = new DOMRectangle(element, true);
        const {center} = new Rectangle(
          currentShape.boundingRectangle.left,
          currentShape.boundingRectangle.top,
          shape.width,
          shape.height
        );
        const delta = {
          x: center.x - shape.center.x,
          y: center.y - shape.center.y,
        };

        if (
          Math.abs(delta.x) > INSIGNIFICANT_DELTA ||
          Math.abs(delta.y) > INSIGNIFICANT_DELTA
        ) {
          const finalTransform = {
            x: this.transform.x - delta.x,
            y: this.transform.y - delta.y,
          };
          const placeholder = createPlaceholder(
            element,
            shape,
            draggable.feedback === 'clone'
          );

          element.replaceWith(placeholder);
          this.element.appendChild(element);

          this.element
            .animate(
              {
                transform: [
                  this.element.style.transform,
                  `translate3d(${finalTransform.x}px, ${finalTransform.y}px, 0)`,
                ],
              },
              {
                duration: 250,
                easing: 'ease',
              }
            )
            .finished.then(() => {
              placeholder.replaceWith(element);
              unmount();
            });
          return;
        }
      }

      unmount();
    });
  }

  public remove() {
    this.destroy();

    return this.dropAnimation();
  }
}
