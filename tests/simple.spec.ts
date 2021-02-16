import Parser from '../src';


describe('Simple tests', () => {
    const parser = new Parser();

    test('Init Parser class', () => {
        expect(parser).toBeInstanceOf(Parser);
    });
});