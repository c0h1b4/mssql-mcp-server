//evals.ts

import { EvalConfig } from 'mcp-evals';
import { openai } from "@ai-sdk/openai";
import { grade, EvalFunction } from "mcp-evals";

const queryToolEvaluation: EvalFunction = {
    name: 'query tool evaluation',
    description: 'Evaluates the usage of the MSSQL query tool',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please use the 'query' tool to select the top 5 rows from the Person.Person table in the AdventureWorks database. Explain how to properly configure and use the tool to execute this query.");
        return JSON.parse(result);
    }
};

const mssqlServerEval: EvalFunction = {
    name: 'mssql-server Evaluation',
    description: 'Evaluates the mssql-server tool for query functionality',
    run: async () => {
        const result = await grade(openai("gpt-4"), "How do I use the 'query' tool in mssql-server to connect to a database at 'mydb.example.com' with user 'sa', password 'mySecretPass!' and run 'SELECT * FROM Employees'?");
        return JSON.parse(result);
    }
};

const config: EvalConfig = {
    model: openai("gpt-4"),
    evals: [queryToolEvaluation, mssqlServerEval]
};
  
export default config;
  
export const evals = [queryToolEvaluation, mssqlServerEval];