import Parser from "../src";

const textForTest = `public class Address
{
    public int Id {get; set;}
    public string Street { get; set; }
    public string City { get; set; }
}`;

const textForResult = `export interface Address
{
    Id: number;
    Street: string;
    City: string;
}`;

describe("Simple tests", () => {
	const parser = new Parser();

	test("Init Parser class", () => {
		expect(parser).toBeInstanceOf(Parser);
	});

	test("Parse easy model", () => {
		expect(parser.parse(textForTest)).toBe(textForResult);
	});
});
