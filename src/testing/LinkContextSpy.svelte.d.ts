import { type ILinkContext } from "../lib/LinkContext/LinkContext.svelte";
interface Props {
    linkCtx?: ILinkContext;
}
declare const LinkContextSpy: import("svelte").Component<Props, {}, "linkCtx">;
type LinkContextSpy = ReturnType<typeof LinkContextSpy>;
export default LinkContextSpy;
