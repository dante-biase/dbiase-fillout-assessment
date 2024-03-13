import axios from "axios";
import dotenv from "dotenv";
import express, { Request, Response, Application } from "express";
import Joi from "joi";

import {
	URLParams,
	QueryParams,
	ResponseBody,
	ErrorResponse,
	FormResponse,
	FilterClause,
} from "./types";
import { isDateTimeInput, isNumberInput } from "./utils";

dotenv.config();

const app: Application = express();

/**
 * Joi schema for validating and parsing query parameters.
 */
const querySchema = Joi.object({
	limit: Joi.number().integer().min(1).max(150).default(150),
	afterDate: Joi.date().iso(),
	beforeDate: Joi.date().iso(),
	offset: Joi.number().integer().min(0).default(0),
	status: Joi.string().valid("in_progress"),
	includeEditLink: Joi.boolean(),
	sort: Joi.string().valid("asc", "desc").default("asc"),
	filters: Joi.string().custom((value, helpers) => {
		try {
			const filters = JSON.parse(value);
			const { error } = Joi.array()
				.items(
					Joi.object({
						id: Joi.string().required(),
						condition: Joi.string()
							.valid(
								"equals",
								"does_not_equal",
								"greater_than",
								"less_than"
							)
							.required(),
						value: Joi.alternatives()
							.try(Joi.number(), Joi.string())
							.required(),
					})
				)
				.validate(filters);
			if (error) {
				throw error;
			}
			return filters;
		} catch (error) {
			throw helpers.error("any.invalid");
		}
	}),
});

/**
 * GET /:formId/filteredResponses
 *
 * Fetches responses from the Fillout API.
 * If provided, filters the responses based on the query parameters and finally returns the re-paginated responses.
 * 
 * TODO: caching opportunities?
 */
app.get(
	"/:formId/filteredResponses",
	async (
		req: Request<URLParams, ResponseBody | ErrorResponse, {}, QueryParams>,
		res: Response<ResponseBody | ErrorResponse>
	) => {
		const { error, value: params } = querySchema.validate(req.query);
		if (error) {
			res.status(400).json({ error: error.details[0].message });
			return;
		}

		const filters = params.filters;
		delete params.filters;

		// 1. Fetch the responses from the Fillout API
		const formId = req.params.formId;
		const url = `${process.env.BASE_URL}/${formId}/submissions`;
		let response;

		try {
			response = await axios.get(url, {
				params,
				headers: {
					Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
					"Content-Type": "application/json",
				},
			});
		} catch (error) {
			res.status(500).json({ error: "Failed to fetch data" });
			console.error(error);
			return;
		}

		const data = response.data;
		if (!filters) {
			res.json(data);
			return;
		}

		// 2. Filter the responses based on the query parameters
		const filteredResponses = data.responses.filter(
			(response: FormResponse) => {
				return filters.every((filter: FilterClause) => {
					const question = response.questions.find(
						(question) => question.id === filter.id
					);

					if (!question) {
						return false;
					}

					switch (filter.condition) {
						case "equals":
							return question.value === filter.value;
						case "does_not_equal":
							return question.value !== filter.value;
						case "greater_than":
							if (
								isNumberInput(question, filter) &&
								question.value! > filter.value
							) {
								return true;
							}
							if (
								// TODO: redundant parsing of date, should be refactored, use a library, or different approach
								isDateTimeInput(question, filter) &&
								Date.parse(question.value as string) >
									Date.parse(filter.value as string)
							) {
								return true;
							}
							return false;
						case "less_than":
							if (
								isNumberInput(question, filter) &&
								question.value! < filter.value
							) {
								return true;
							}
							if (
								// TODO: redundant parsing of date, should be refactored, use a library, or different approach
								isDateTimeInput(question, filter) &&
								Date.parse(question.value as string) <
									Date.parse(filter.value as string)
							) {
								return true;
							}
							return false;
					}
				});
			}
		);

		// 3. Paginate the filtered responses and recalculate the total responses and page count
		const { offset, limit } = params;
		const paginatedResponses = filteredResponses.slice(
			offset,
			offset + limit
		);

		res.json({
			responses: paginatedResponses,
			totalResponses: filteredResponses.length,
			pageCount: Math.ceil(filteredResponses.length / limit),
		});
	}
);

export default app;
