export type HashRoutingMode = 'single' | 'multi';

const defaultRoutingMode = 'single' satisfies HashRoutingMode;
const routingModeKey = 'routingMode';

export const routingMode = globalThis.window.sessionStorage.getItem(routingModeKey) as HashRoutingMode || defaultRoutingMode;

export function toggleRoutingMode() {
    const newMode: HashRoutingMode = routingMode === 'single' ? 'multi' : 'single';
    globalThis.window.sessionStorage.setItem(routingModeKey, newMode);
    globalThis.window.location.reload();
}
