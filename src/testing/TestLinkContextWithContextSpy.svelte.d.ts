import { type ILinkContext } from "../lib/LinkContext/LinkContext.svelte";
interface Props extends ILinkContext {
    linkCtx?: ILinkContext;
}
declare const TestLinkContextWithContextSpy: import("svelte").Component<Props, {}, "linkCtx">;
type TestLinkContextWithContextSpy = ReturnType<typeof TestLinkContextWithContextSpy>;
export default TestLinkContextWithContextSpy;
