"use server";

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export async function analyzeJobDescription(text: string) {
  if (!text) {
    throw new Error("Job description is required");
  }

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      summary: z.string().describe("A concise 1-2 sentence summary of the product or service extracted from the job description."),
      audience: z.array(z.string()).describe("A list of 3 to 4 specific target audiences for the product/service."),
      competitors: z.array(z.string()).describe("A list of 2 to 3 main competitors for the product/service if applicable or inferred.")
    }),
    prompt: `Analyze the following job description and provide a strategic breakdown for a social media manager. Extract the core product/service summary, the primary target audiences, and the inferred or stated competitors.\n\nJob Description:\n${text}`,
  });

  return object;
}
