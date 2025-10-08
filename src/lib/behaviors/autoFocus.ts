import type { AutoFocusOptions } from "$lib/types.js";
import type { Attachment } from "svelte/attachments";

const querySelectors = [
    'button',
    '[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])'
];

export const querySelector = querySelectors.reduce((acc, cur) => {
    return acc + `,${cur}:not([disabled]):not([data-avoid-autofocus])`;
}, '').substring(1);

function isAutoFocusOptions(obj: unknown): obj is AutoFocusOptions {
    return typeof obj === 'object' && obj !== null && 'selector' in obj;
}

/**
 * Svelte attachment factory function that creates an attachment that automatically focuses the first focusable
 * element within the given node, or the node itself if none found.
 * 
 * @param options Optional settings.
 * - `selector`: Custom query selector string to find focusable elements. The default is a sensible list of common 
 *   focusable, enabled elements.
 * @returns The Svelte attachment function.
 */
export function autoFocusBehavior(options: AutoFocusOptions): Attachment<HTMLElement>;
/**
 * Svelte attachment that automatically focuses the first focusable element within the given node, or the node itself 
 * if none found.
 * 
 * ### Avoiding Auto-Focus
 * 
 * If you want to avoid auto-focusing an element, you can add the `data-avoid-autofocus` attribute.
 * 
 * @param node The HTML element to focus within.
 */
export function autoFocusBehavior(node: HTMLElement): void;
export function autoFocusBehavior(arg: HTMLElement | AutoFocusOptions) {
    let qs = querySelector;
    const att = (node: HTMLElement) => {
        const firstFocusable = node.querySelector<HTMLElement>(qs);
        (firstFocusable ?? node).focus();
    };
    if (isAutoFocusOptions(arg)) {
        qs = arg.selector ?? querySelector;
        return att;
    }
    att(arg);
}
