"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToObjectMapping = void 0;
/* eslint-disable no-param-reassign */
const mapping_1 = require("../errors/mapping");
const types_1 = require("../types");
const common_1 = require("./common");
function createObjectExpression() {
    return {
        type: types_1.SyntaxType.OBJECT_EXPR,
        props: [],
    };
}
function findOrCreateObjectPropExpression(props, key) {
    let match = props.find((prop) => prop.key === key);
    if (!match) {
        match = {
            type: types_1.SyntaxType.OBJECT_PROP_EXPR,
            key,
            value: createObjectExpression(),
        };
        props.push(match);
    }
    return match;
}
function processArrayIndexFilter(flatMapping, currrentOutputPropAST, filter, isLastPart) {
    const filterIndex = filter.indexes.elements[0].value;
    if (currrentOutputPropAST.value.type !== types_1.SyntaxType.ARRAY_EXPR) {
        const elements = [];
        elements[filterIndex] = isLastPart ? flatMapping.inputExpr : currrentOutputPropAST.value;
        currrentOutputPropAST.value = {
            type: types_1.SyntaxType.ARRAY_EXPR,
            elements,
        };
    }
    else if (!currrentOutputPropAST.value.elements[filterIndex]) {
        currrentOutputPropAST.value.elements[filterIndex] = isLastPart
            ? flatMapping.inputExpr
            : createObjectExpression();
    }
    return currrentOutputPropAST.value.elements[filterIndex];
}
function isPathWithEmptyPartsAndObjectRoot(expr) {
    return (expr.type === types_1.SyntaxType.PATH &&
        expr.parts.length === 0 &&
        expr.root?.type === types_1.SyntaxType.OBJECT_EXPR);
}
function getPathExpressionForAllFilter(currentInputAST, root, parts = []) {
    return {
        type: types_1.SyntaxType.PATH,
        root,
        pathType: currentInputAST.pathType || types_1.PathType.UNKNOWN,
        inferredPathType: currentInputAST.inferredPathType || types_1.PathType.UNKNOWN,
        parts,
        returnAsArray: true,
    };
}
function validateResultOfAllFilter(objectExpr, flatMapping) {
    if (!objectExpr?.props ||
        objectExpr.type !== types_1.SyntaxType.OBJECT_EXPR ||
        !Array.isArray(objectExpr.props)) {
        throw new mapping_1.JsonTemplateMappingError('Invalid mapping: invalid array mapping', flatMapping.input, flatMapping.output);
    }
}
function addToArrayToExpression(expr) {
    return {
        type: types_1.SyntaxType.PATH,
        root: expr,
        returnAsArray: true,
        parts: [],
    };
}
function mergeObjectFilterParts(existParts, newParts) {
    for (let index = 0; index < newParts.length; index++) {
        if (newParts[index].type === types_1.SyntaxType.OBJECT_FILTER_EXPR &&
            existParts[index].type === types_1.SyntaxType.OBJECT_FILTER_EXPR) {
            if (newParts[index].options?.index) {
                existParts[index].options = { ...existParts[index].options, ...newParts[index].options };
            }
            if (newParts[index].filter.type !== types_1.SyntaxType.ALL_FILTER_EXPR) {
                existParts[index].filter = newParts[index].filter;
            }
        }
    }
}
function handleAllFilterIndexFound(currentInputAST, currentOutputPropAST, filterIndex, isLastPart) {
    const matchedInputParts = currentInputAST.parts.splice(0, filterIndex + 1);
    if (isPathWithEmptyPartsAndObjectRoot(currentOutputPropAST.value)) {
        currentOutputPropAST.value = currentOutputPropAST.value.root;
    }
    if (currentOutputPropAST.value.type !== types_1.SyntaxType.PATH) {
        matchedInputParts.push((0, common_1.createBlockExpression)(isLastPart ? currentInputAST : currentOutputPropAST.value));
        currentOutputPropAST.value = getPathExpressionForAllFilter(currentInputAST, currentInputAST.root, matchedInputParts);
    }
    else {
        mergeObjectFilterParts(currentOutputPropAST.value.parts, matchedInputParts);
    }
    currentInputAST.root = undefined;
}
function findAllFilterIndex(expr) {
    let filterIndex = -1;
    if (expr.type === types_1.SyntaxType.PATH) {
        filterIndex = expr.parts.findIndex((part) => part.type === types_1.SyntaxType.OBJECT_FILTER_EXPR);
    }
    return filterIndex;
}
function handleAllFilterIndexNotFound(currentInputAST, currentOutputPropAST, isLastPart) {
    if (currentOutputPropAST.value.type === types_1.SyntaxType.OBJECT_EXPR) {
        const currObjectExpr = currentOutputPropAST.value;
        currentOutputPropAST.value = isLastPart
            ? addToArrayToExpression(currentInputAST)
            : getPathExpressionForAllFilter(currentInputAST, currObjectExpr);
        return currObjectExpr;
    }
    if (isPathWithEmptyPartsAndObjectRoot(currentOutputPropAST.value)) {
        return currentOutputPropAST.value.root;
    }
}
function getNextObjectExpressionForAllFilter(flatMapping, currentOutputPropAST, isLastPart) {
    const blockExpr = (0, common_1.getLastElement)(currentOutputPropAST.value.parts);
    const objectExpr = isLastPart ? createObjectExpression() : blockExpr?.statements?.[0];
    validateResultOfAllFilter(objectExpr, flatMapping);
    return objectExpr;
}
function processAllFilter(flatMapping, currentOutputPropAST, isLastPart) {
    const { inputExpr: currentInputAST } = flatMapping;
    const filterIndex = findAllFilterIndex(currentInputAST);
    if (filterIndex === -1) {
        const objectExpr = handleAllFilterIndexNotFound(currentInputAST, currentOutputPropAST, isLastPart);
        if (objectExpr) {
            return objectExpr;
        }
    }
    else {
        handleAllFilterIndexFound(currentInputAST, currentOutputPropAST, filterIndex, isLastPart);
    }
    return getNextObjectExpressionForAllFilter(flatMapping, currentOutputPropAST, isLastPart);
}
function isWildcardSelector(expr) {
    return expr.type === types_1.SyntaxType.SELECTOR && expr.prop?.value === '*';
}
function processWildCardSelector(flatMapping, currentOutputPropAST, isLastPart = false) {
    const currentInputAST = flatMapping.inputExpr;
    const filterIndex = currentInputAST.parts.findIndex(isWildcardSelector);
    if (filterIndex === -1) {
        throw new mapping_1.JsonTemplateMappingError('Invalid mapping: input should have wildcard selector', flatMapping.input, flatMapping.output);
    }
    const matchedInputParts = currentInputAST.parts.splice(0, filterIndex);
    currentInputAST.parts = currentInputAST.parts.slice(1);
    if (currentOutputPropAST.value.type !== types_1.SyntaxType.PATH) {
        matchedInputParts.push((0, common_1.createBlockExpression)(currentOutputPropAST.value));
        currentOutputPropAST.value = {
            type: types_1.SyntaxType.PATH,
            root: currentInputAST.root,
            pathType: currentInputAST.pathType,
            inferredPathType: currentInputAST.inferredPathType,
            parts: matchedInputParts,
        };
    }
    currentInputAST.root = 'e.value';
    const blockExpr = (0, common_1.getLastElement)(currentOutputPropAST.value.parts);
    const blockObjectExpr = blockExpr.statements[0];
    const objectExpr = createObjectExpression();
    blockObjectExpr.props.push({
        type: types_1.SyntaxType.OBJECT_PROP_EXPR,
        key: {
            type: types_1.SyntaxType.PATH,
            root: 'e',
            parts: [
                {
                    type: types_1.SyntaxType.SELECTOR,
                    selector: '.',
                    prop: {
                        type: types_1.TokenType.ID,
                        value: 'key',
                    },
                },
            ],
        },
        value: isLastPart ? currentInputAST : objectExpr,
        contextVar: 'e',
    });
    return objectExpr;
}
function handleNextPart(flatMapping, partNum, currentOutputPropAST) {
    const nextOutputPart = flatMapping.outputExpr.parts[partNum];
    if (nextOutputPart.filter?.type === types_1.SyntaxType.ALL_FILTER_EXPR) {
        const objectExpr = processAllFilter(flatMapping, currentOutputPropAST, partNum === flatMapping.outputExpr.parts.length - 1 && !nextOutputPart.options?.index);
        if (nextOutputPart.options?.index) {
            objectExpr.props.push({
                type: types_1.SyntaxType.OBJECT_PROP_EXPR,
                key: nextOutputPart.options?.index,
                value: {
                    type: types_1.SyntaxType.PATH,
                    root: nextOutputPart.options?.index,
                    parts: [],
                },
            });
        }
        return objectExpr;
    }
    if (nextOutputPart.filter?.type === types_1.SyntaxType.ARRAY_INDEX_FILTER_EXPR) {
        return processArrayIndexFilter(flatMapping, currentOutputPropAST, nextOutputPart.filter, partNum === flatMapping.outputExpr.parts.length - 1);
    }
    if (isWildcardSelector(nextOutputPart)) {
        return processWildCardSelector(flatMapping, currentOutputPropAST, partNum === flatMapping.outputExpr.parts.length - 1);
    }
}
function handleNextParts(flatMapping, partNum, currentOutputPropAST) {
    let objectExpr = currentOutputPropAST.value;
    let newPartNum = partNum;
    while (newPartNum < flatMapping.outputExpr.parts.length) {
        const nextObjectExpr = handleNextPart(flatMapping, newPartNum, currentOutputPropAST);
        if (!nextObjectExpr) {
            break;
        }
        newPartNum++;
        objectExpr = nextObjectExpr;
    }
    return objectExpr;
}
function isOutputPartRegularSelector(outputPart) {
    return (outputPart.type === types_1.SyntaxType.SELECTOR &&
        outputPart.prop?.value &&
        outputPart.prop.value !== '*');
}
function refineLeafOutputPropAST(inputExpr) {
    if (inputExpr.type === types_1.SyntaxType.PATH &&
        inputExpr.root === undefined &&
        inputExpr.parts.length === 1 &&
        inputExpr.parts[0].type === types_1.SyntaxType.BLOCK_EXPR) {
        return inputExpr.parts[0].statements[0];
    }
    return inputExpr;
}
function handleLastOutputPart(flatMapping, currentOutputPropsAST, key) {
    const outputPropAST = currentOutputPropsAST.find((prop) => prop.key === key);
    if (!outputPropAST) {
        currentOutputPropsAST.push({
            type: types_1.SyntaxType.OBJECT_PROP_EXPR,
            key,
            value: refineLeafOutputPropAST(flatMapping.inputExpr),
        });
    }
    else {
        outputPropAST.value = {
            type: types_1.SyntaxType.LOGICAL_OR_EXPR,
            op: '||',
            args: [outputPropAST.value, refineLeafOutputPropAST(flatMapping.inputExpr)],
        };
    }
}
function processFlatMappingPart(flatMapping, partNum, currentOutputPropsAST) {
    const outputPart = flatMapping.outputExpr.parts[partNum];
    if (!isOutputPartRegularSelector(outputPart)) {
        return currentOutputPropsAST;
    }
    const key = outputPart.prop.value;
    if (partNum === flatMapping.outputExpr.parts.length - 1) {
        handleLastOutputPart(flatMapping, currentOutputPropsAST, key);
        return currentOutputPropsAST;
    }
    const currentOutputPropAST = findOrCreateObjectPropExpression(currentOutputPropsAST, key);
    const objectExpr = handleNextParts(flatMapping, partNum + 1, currentOutputPropAST);
    return objectExpr.props;
}
function handleRootOnlyOutputMapping(flatMapping, outputAST) {
    outputAST.props.push({
        type: types_1.SyntaxType.OBJECT_PROP_EXPR,
        value: {
            type: types_1.SyntaxType.SPREAD_EXPR,
            value: flatMapping.inputExpr,
        },
    });
}
function validateMappingsForIndexVar(flatMapping, indexVar) {
    if (flatMapping.inputExpr.type !== types_1.SyntaxType.PATH) {
        throw new mapping_1.JsonTemplateMappingError('Invalid mapping: input should be path expression', flatMapping.input, flatMapping.output);
    }
    const foundIndexVar = flatMapping.inputExpr.parts.some((item) => item?.type === types_1.SyntaxType.OBJECT_FILTER_EXPR && item.options?.index === indexVar);
    if (!foundIndexVar) {
        throw new mapping_1.JsonTemplateMappingError(`Invalid mapping: index variable:${indexVar} not found in input path`, flatMapping.input, flatMapping.output);
    }
}
function validateMapping(flatMapping) {
    if (flatMapping.outputExpr.type !== types_1.SyntaxType.PATH) {
        throw new mapping_1.JsonTemplateMappingError('Invalid mapping: output should be a path expression', flatMapping.input, flatMapping.output);
    }
    const lastPart = (0, common_1.getLastElement)(flatMapping.outputExpr.parts);
    if (lastPart?.options?.index) {
        validateMappingsForIndexVar(flatMapping, lastPart.options.index);
    }
}
function processFlatMappingParts(flatMapping, objectExpr) {
    let currentOutputPropsAST = objectExpr.props;
    for (let i = 0; i < flatMapping.outputExpr.parts.length; i++) {
        currentOutputPropsAST = processFlatMappingPart(flatMapping, i, currentOutputPropsAST);
    }
}
/**
 * Convert Flat to Object Mappings
 */
function convertToObjectMapping(flatMappingASTs) {
    const outputAST = createObjectExpression();
    let pathAST;
    for (const flatMapping of flatMappingASTs) {
        validateMapping(flatMapping);
        let objectExpr = outputAST;
        if (flatMapping.outputExpr.parts.length > 0) {
            if (!isOutputPartRegularSelector(flatMapping.outputExpr.parts[0])) {
                const objectPropExpr = {
                    type: types_1.SyntaxType.OBJECT_PROP_EXPR,
                    key: '',
                    value: pathAST || objectExpr,
                };
                objectExpr = handleNextParts(flatMapping, 0, objectPropExpr);
                pathAST = objectPropExpr.value;
            }
            processFlatMappingParts(flatMapping, objectExpr);
        }
        else {
            handleRootOnlyOutputMapping(flatMapping, outputAST);
        }
    }
    return pathAST ?? outputAST;
}
exports.convertToObjectMapping = convertToObjectMapping;
