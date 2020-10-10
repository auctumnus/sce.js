export const changeConfig: {
    [x: number]: ((parser: any, pattern: any, content: any) => void) | ((parser: any, pattern: any, content: any) => void);
};
export function change(parser: any): Tree;
import { Tree } from "./node";
