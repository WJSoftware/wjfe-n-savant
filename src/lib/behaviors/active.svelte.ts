import type { Attachment } from "svelte/attachments";
import type { ActiveState, RouteStatus } from "../types.js";
import { joinStyles } from "$lib/utils.js";
import { isRouteActive } from "$lib/public-utils.js";
import type { RouterEngine } from "$lib/kernel/RouterEngine.svelte.js";
import { clsx } from "clsx";

/**
 * Svelte attachment factory that creates attachments that apply active styles and `aria-` attributes to an element 
 * based on the current route status.
 * 
 * This is built-in in the `Link` component, so it is not needed there.  Use it anywhere else that is needed.
 * For example, the [Bulma Tabs component](https://bulma.io/documentation/components/tabs/) (Bulma is a CSS library) 
 * requires that the `is-active` class be applied to the `<li>` element, not the `<a>` element.
 * 
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { activeBehavior, Router } from '@svelte-router/core';
 * </script>
 * <Router>
 *   {#snippet children(_, rs)}
 *     <ul class="tabs">
 *       <li {@attach activeBehavior(rs, { key: 'home', class: 'is-active' })}>
 *         <a href="/">Home</a>
 *       </li>
 *       <li {@attach activeBehavior(rs, { key: 'about', class: 'is-active' })}>
 *         <a href="/about">About</a>
 *       </li>
 *     </ul>
 *   {/snippet}
 *   ... <!-- Routes and stuff. -->
 * </Router>
 * ```
 * 
 * @param rsOrRouter Router or route status record object.
 * @param activeState Desired route and its active state (style/class/aria).
 * @param baseStyle Any base style to retain when active style is removed.
 * @returns The Svelte attachment function.
 */
export function activeBehavior(
    rsOrRouter: Record<string, RouteStatus> | RouterEngine | null | undefined,
    activeState: ActiveState & { key: string },
    baseStyle: string = '',
): Attachment<HTMLElement> {
    return function (el: HTMLElement) {
        if (isRouteActive(rsOrRouter, activeState.key)) {
            el.setAttribute('style', joinStyles(baseStyle, activeState.style) ?? '');
            const activeClass = clsx(activeState.class).split(' ').filter(c => c.trim().length > 0);
            if (activeClass.length) {
                el.classList.add(...activeClass);
            }
            if (activeState.aria) {
                for (let [attr, value] of Object.entries(activeState.aria)) {
                    el.setAttribute(attr, value);
                }
            }
            return () => {
                el.setAttribute('style', baseStyle ?? '');
                if (activeClass.length) {
                    el.classList.remove(...activeClass);
                }
                if (activeState.aria) {
                    for (let attr of Object.keys(activeState.aria)) {
                        el.removeAttribute(attr);
                    }
                }
            };
        }
    }
}
