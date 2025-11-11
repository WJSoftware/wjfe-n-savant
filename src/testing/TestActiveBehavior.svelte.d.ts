import type { ActiveState, RouteStatus } from "$lib/types.js";
type Props = {
    routeStatus: Record<string, RouteStatus>;
    key: string;
    activeState?: ActiveState;
    style?: string;
};
declare const TestActiveBehavior: import("svelte").Component<Props, {}, "">;
type TestActiveBehavior = ReturnType<typeof TestActiveBehavior>;
export default TestActiveBehavior;
