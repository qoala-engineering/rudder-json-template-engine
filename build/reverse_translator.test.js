"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("./engine");
const types_1 = require("./types");
describe('reverse_translator', () => {
    it('should reverse translate with indentation', () => {
        const template = engine_1.JsonTemplateEngine.reverseTranslate(engine_1.JsonTemplateEngine.parse(`{a: {b: {c: 1}}}`));
        expect(template).toEqual('{\n    "a": {\n        "b": {\n            "c": 1\n        }\n    }\n}');
    });
    it('should reverse translate json mappings', () => {
        const template = engine_1.JsonTemplateEngine.reverseTranslate([
            {
                input: '$.userId',
                output: '$.user.id',
            },
            {
                input: '$.discount',
                output: '$.events[0].items[*].discount',
            },
            {
                input: '$.products[?(@.category)].id',
                output: '$.events[0].items[*].product_id',
            },
            {
                input: '$.events[0]',
                output: '$.events[0].name',
            },
            {
                input: '$.products[?(@.category)].variations[*].size',
                output: '$.events[0].items[*].options[*].s',
            },
            {
                input: '$.products[?(@.category)].(@.price * @.quantity * (1 - $.discount / 100))',
                output: '$.events[0].items[*].value',
            },
            {
                input: '$.products[?(@.category)].(@.price * @.quantity * (1 - $.discount / 100)).sum()',
                output: '$.events[0].revenue',
            },
        ], { defaultPathType: types_1.PathType.JSON });
        expect(template).toEqual('{\n    "user": {\n        "id": $.userId\n    },\n    "events": [{\n        "items": $.products[?(@.category)].({\n            "discount": $.discount,\n            "product_id": @.id,\n            "options": @.variations[*].({\n                "s": @.size\n            })[],\n            "value": @.price * @.quantity * (1 - $.discount / 100)\n        })[],\n        "name": $.events[0],\n        "revenue": $.products[?(@.category)].(@.price * @.quantity * (1 - $.discount / 100)).sum()\n    }]\n}');
    });
});
