import { type Expression, type StatementsExpression, BlockExpression, FlatMappingPaths } from '../types';
export declare function toArray<T>(val: T | T[] | undefined): T[] | undefined;
export declare function getLastElement<T>(arr: T[]): T | undefined;
export declare function createBlockExpression(expr: Expression): BlockExpression;
export declare function convertToStatementsExpr(...expressions: Expression[]): StatementsExpression;
export declare function CreateAsyncFunction(...args: any[]): any;
export declare function isExpression(val: string | Expression | FlatMappingPaths[]): boolean;
export declare function escapeStr(s?: string): string;
//# sourceMappingURL=common.d.ts.map