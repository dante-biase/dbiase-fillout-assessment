import { Server } from "http";

import dotenv from "dotenv";
import nock from "nock";
import request from "supertest";

import app from "../src/server";
import mockResponse from "./testData";

dotenv.config();

describe("GET /:formId/filteredResponses", () => {
	// ------------------------------------------
	// TEST SETUP
	//------------------------------------------

	let server: Server;

	beforeEach(() => {
		server = app.listen(); // start the server before each test
	});

	afterEach((done) => {
		server.close(done); // close the server after each test
		nock.cleanAll(); // clean up all nock mocks as well
	});

	// ------------------------------------------
	// HELPER FUNCTIONS
	//------------------------------------------

	// Mock response from Fillout API with test data to ensure tests are idempotent
	const formId = process.env.FORM_ID;
	const mockRequest = () => {
		nock(process.env.BASE_URL!)
			.get(`/${formId}/submissions`)
			.query(true) // Ignore query parameters
			.reply(200, mockResponse);
	};

	// ------------------------------------------
	// TEST CASES
	//------------------------------------------

	/* Test case 1 */
	it("responds with json", async () => {
		mockRequest();
		const response = await request(server)
			.get(`/${formId}/filteredResponses`)
			.set("Accept", "application/json")
			.expect("Content-Type", /json/)
			.expect(200);

		// Assert the structure of the response
		expect(response.body).toHaveProperty("responses");
		expect(response.body).toHaveProperty("totalResponses");
		expect(response.body).toHaveProperty("pageCount");
	});

	/* Test case 2 */
	it("filters responses correctly", async () => {
		mockRequest();
		const response = await request(server)
			.get(`/${formId}/filteredResponses`)
			.query({
				filters: JSON.stringify([
					{
						id: "4KC356y4M6W8jHPKx9QfEy", // --> "Anything else you'd like to share before your call?"
						condition: "equals",
						value: "Nope",
					},
					{
						id: "dSRAe3hygqVwTpPK69p5td", // --> "Please select a date to schedule your yearly check-in."
						condition: "less_than",
						value: "2024-02-25",
					},
					{
						id: "fFnyxwWa3KV6nBdfBDCHEA", // --> "How many employees work under you?"
						condition: "greater_than",
						value: 49,
					},
				]),
			})
			.set("Accept", "application/json")
			.expect(200);

		expect(response.body.totalResponses).toBe(1);
		expect(response.body.responses.length).toBe(1);
		// ... More assertions with simple to complex filters ensuring the responses are filtered correctly
	});

	/* Test case 3 */
	it("paginates responses correctly", async () => {
		// helper function to test route with different combinations of limit and offset
		const testPagination = async ({
			limit,
			offset,
			expectedLength,
			expectedPageCount,
		}: {
			limit: number | undefined;
			offset: number | undefined;
			expectedLength: number;
			expectedPageCount: number;
		}) => {
			mockRequest();
			const response = await request(server)
				.get(`/${formId}/filteredResponses`)
				.query({
					limit,
					offset,
					filters: JSON.stringify([
						{
							id: "fFnyxwWa3KV6nBdfBDCHEA", // --> "How many employees work under you?"
							condition: "greater_than",
							value: 1,
						},
					]),
				})
				.set("Accept", "application/json")
				.expect(200);

			// Assert the response is paginated correctly
			expect(response.body.responses.length).toBe(expectedLength);
			expect(response.body.pageCount).toBe(expectedPageCount);
		};

		// With no limit and offset, the filter should return 5 total responses and a page count of 1
		await testPagination({
			limit: undefined,
			offset: undefined,
			expectedLength: 5,
			expectedPageCount: 1,
		});

		// With no limit and an offset of 4, the filter should return 1 total response with the same page count
		await testPagination({
			limit: undefined,
			offset: 4,
			expectedLength: 1,
			expectedPageCount: 1,
		});

		// With a limit of 2 and an offset of 0, the filter should return 2 total responses and a page count of 3
		await testPagination({
			limit: 2,
			offset: 0,
			expectedLength: 2,
			expectedPageCount: 3,
		});

		// With a limit of 2 and an offset of 4, the filter should return 1 total response with the same page count of 3
		await testPagination({
			limit: 2,
			offset: 4,
			expectedLength: 1,
			expectedPageCount: 3,
		});
	});

	// Add more test cases to cover parameter validation, edge cases, error handling, and other scenarios
});
