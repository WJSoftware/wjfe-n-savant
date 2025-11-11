import type { Snippet } from "svelte";
interface Props {
    hash?: boolean | string;
    routeKey?: string;
    routePath?: string | RegExp;
    routeAnd?: (params: any) => boolean;
    ignoreForFallback?: boolean;
    caseSensitive?: boolean;
    children?: Snippet;
    routeChildren?: Snippet<[any, any, any]>;
    routerInstance?: any;
    params?: any;
}
declare const TestRouteWithRouter: import("svelte").Component<Props, {}, "params" | "routerInstance">;
type TestRouteWithRouter = ReturnType<typeof TestRouteWithRouter>;
export default TestRouteWithRouter;
