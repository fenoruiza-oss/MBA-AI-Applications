E-commerce Operations and Supply Chain Or M&A Screening and Judgment

Option 1: E-Commerce Operations
Goal of the Project
The goal of this project is to design and build an operational e-commerce system that combines deterministic automation with agentic reasoning.
You must design a system that:
●	Monitors inventory counts and sales velocity
●	Tracks supplier lead times and reliability
●	Detects seasonality patterns and marketing impact
●	Flags stockout risk
●	Proposes operational actions such as expedited orders or delayed promotions
●	Places an order by sending an email to a supplier
The core purpose of this assignment is to force you to distinguish between:
●	Tasks that should be rule-based and automated
●	Tasks that require probabilistic reasoning and interpretation
●	Tasks that should not be given to an agent due to cost, risk, or determinism
This is a systems design exercise about operational intelligence under constraints.
Description
You will design an E-Commerce Operations System that integrates structured operational data and an AI agent.
The system must ingest:
●	Inventory counts by SKU
●	Daily sales velocity by SKU
●	Supplier lead times
●	Historical sales patterns
●	Marketing campaign schedules
●	Supplier performance history (late deliveries, variability, reliability issues)
The system must perform the following capabilities:
1.	Monitor inventory levels continuously
2.	Calculate days of inventory remaining
3.	Detect stockout risk
4.	Identify abnormal sales velocity shifts
5.	Adjust projections for seasonality
6.	Incorporate marketing campaign lift
7.	Evaluate supplier reliability
8.	Propose operational decisions such as:
○	Expedited purchase orders
○	Delaying or accelerating promotions
○	Switching suppliers (if modeled)
9.	Generate and send a supplier email to place or modify an order
You must clearly design the system architecture so that it includes:
●	Deterministic automation logic
●	A reasoning agent
●	Clear boundaries between the two
You are not allowed to assign all tasks to an agent. If you do, you must justify why that decision would not be operationally reckless.
The goal is to demonstrate judgment about cost, control, reliability, and scalability.
Option 2: M&A Screening and Judgment
Goal of the Project
The goal of this project is to design and build an M&A Screening System that combines deterministic financial automation with agentic strategic analysis.
You must build a system that:
●	Ingests structured company data
●	Calculates basic financial health metrics
●	Applies deterministic screening thresholds
●	Uses an agent to assess strategic alignment
●	Produces a structured screening report
●	Either sends the report forward or marks the company as rejected and stores it in a database
The objective is to demonstrate that you understand how to architect a decision-support system that blends quantitative rigor with qualitative reasoning under uncertainty.
This project tests your ability to distinguish between:
●	Tasks that must remain deterministic
●	Tasks that benefit from probabilistic interpretation
●	Tasks that should not be delegated to an agent
Description
You will design an M&A Screening System intended for a corporate development, VCs or investors, or a strategy team focused on mergers and acquisitions.
The system must ingest structured and semi-structured data about potential acquisition targets, including:
●	Financial statements (revenue, growth rate, EBITDA, margins, burn rate, cash position)
●	Industry classification
●	Geographic footprint
●	Business model
●	Customer segments
●	Funding history (if applicable)
●	Publicly available qualitative signals
The system must perform the following steps:
1.	Automate ingestion and normalization of company data
2.	Calculate basic financial health metrics (for example: growth rate trends, profitability status, runway, revenue concentration risk)
3.	Apply rule-based financial thresholds (e.g., minimum revenue, acceptable burn multiple, minimum growth rate)
4.	If thresholds are met, send structured data to an agent
5.	The agent evaluates strategic alignment, including:
○	Fit with acquiring company capabilities
○	Overlap or adjacency in product portfolio
○	Geographic expansion logic
○	Cultural or operational compatibility (based on available signals)
6.	The system generates a structured screening report
7.	The system either:
○	Sends the report forward for deeper diligence, or
○	Adds the company to a database marked as rejected with reason codes
You must clearly separate:
●	Financial screening logic (deterministic)
●	Strategic interpretation logic (agent-based)
The system must be inspectable and auditable.
The system should be realistic in terms of cost, scaling, and decision discipline.
Recommendations
-	For Option 1: A spreadsheet will suffice for tracking inventory, order times, etc. This should not be a complex project with integrations from shopify, amazon seller central, etc.
-	For Option 2: you can scrape data and put it into a spreadsheet, or a database if you prefer. We don’t need extensive data.
-	PLAN, PLAN, PLAN before you build anything. This is an exercise in architecture: what does an agent need to do, what can we automate using other tools or with code?
Deliverables
Your submission must be formatted in Markdown and include the following sections.
1. System Explanation
Provide a detailed explanation of how the system works end-to-end. This must include:
●	Data ingestion flow
●	Calculations performed deterministically
●	When and why the agent is invoked
●	What the agent receives as input
●	What the agent outputs
●	How decisions are executed
●	How supplier emails are triggered
You must describe the full operational loop, not isolated components.
2. Task Classification: Rule-Based vs Agent-Based
Provide a structured list that clearly separates:
Rule-based or automated tasks such as
●	Calculating days of inventory
●	Applying threshold-based stockout rules
●	Flagging SKUs below reorder points
●	Sending templated emails once decision is approved
Agent-based tasks such as:
●	Interpreting seasonality patterns
●	Adjusting for marketing campaign impact
●	Evaluating supplier reliability trends
●	Proposing expedited orders
●	Deciding whether to delay promotions
For each task assigned to the agent, you must explain:
●	Why deterministic logic is insufficient
●	Why probabilistic reasoning adds value
For each task kept deterministic, you must explain:
●	Why an agent would be unnecessary, risky, or wasteful
This section must demonstrate architectural judgment.
3. Why All Tasks Were Not Assigned to the Agent
You must explicitly explain:
●	The risks of giving full operational control to an agent
●	Cost implications
●	Latency implications
●	Error propagation risks
●	Auditability and compliance considerations
If your architecture assigns most tasks to the agent, you must defend that choice rigorously.
4. Estimated Token Calculation if All Tasks Were Agent-Based
You must estimate:
●	Number of tokens required per SKU per decision cycle
●	Estimated prompt size
●	Estimated reasoning steps
●	Total tokens per day if all operational tasks were handled by an agent
You must show your assumptions clearly.
You do not need exact pricing, but your calculation must be internally consistent and logically reasoned.
5. Estimated Token Calculation for Your Actual Design
Estimate the daily token usage for your implemented architecture.
You must demonstrate awareness of cost scaling as SKU count increases.
Submission Requirements
●	Submission must be in Markdown
●	All sections must be present
●	Calculations must show assumptions
●	Architecture must be explicit
●	Task separation must be clear
This assignment is not about building the most intelligent agent.
It is about designing an operationally sound system that uses intelligence only where it creates leverage and preserves determinism where precision, cost control, and reliability matter most.
Tools to Use
Depending on your level of technical ability, there are a variety of tools you can choose from for this project.
Those of you who have a coding background or have a comprehension of programming (even if you haven’t done it in a while) will be able to use and comprehend more complex tools than those who have not.
It is no matter which tools you use. This will not stop you from obtaining the learning objectives.
You can use multiple tools! You have freedom in this assignment to use whatever you wish!
Here is a list of tools to consider:

🖱️  No-Code / Low-Code Tools	💻  Tools Requiring Coding Knowledge
Relevance AI
Build the agent reasoning layer without code. Connect your automation output to an AI agent that interprets inventory signals, flags exceptions, or scores M&A targets — all from a visual builder.	LangChain / LangGraph
The core framework for building the agent reasoning layer in Python. Use LangChain to give the agent tools (search, calculator, email), memory, and decision logic. LangGraph adds stateful control flow for complex agent loops.
Dify.ai
Open-source visual agent builder. Define the agent's tools, memory, and reasoning steps in a canvas. Wire it to your rule-based automation as the intelligence layer that handles exceptions and judgment calls.	OpenAI Assistants API
Build a persistent agent with function calling, file retrieval, and threaded memory. Define tools like 'check_inventory_level' or 'score_ma_target' and let the agent decide when and how to use them.
Flowise
Drag-and-drop builder for LangChain-based agents. Good for building the agent component that receives structured data from your automation layer and responds with analysis or actions.	Anthropic Claude API (tool use)
Claude's tool use is ideal for structured judgment tasks: pass in a supplier report or financial summary and ask for a structured analysis with specific output fields. Strong at long-document reasoning.
Stack AI
No-code platform for building multi-step AI agents. Define what the agent receives, what tools it can call, and what it outputs — then connect it to Zapier or Make as the judgment layer.	Google Vertex AI Agent Builder
Build and deploy the agent component on GCP. Connect it to BigQuery or Cloud Storage as data sources, define tools as Cloud Functions, and deploy with Gemini as the reasoning engine.
Coze (ByteDance)
Visual agent builder with scheduling, memory, and plugin support. Good for building an M&A screening agent or inventory analyst agent that runs on a schedule and acts on structured data inputs.	AWS Bedrock Agents
Define the agent's action groups (tools), knowledge bases, and guardrails on AWS. The agent decides which actions to call based on the structured data it receives from your rule-based pipeline.
n8n (AI Agent nodes)
Low-code workflow tool with native AI Agent nodes. Build the full hybrid system in one canvas: rule-based logic on the left, an agent node in the middle for interpretation, actions on the right.	CrewAI
Use multiple specialized agents with defined roles: a Data Analyst agent that processes the rule-based output, a Strategist agent that makes recommendations, and a Reporter agent that formats the final output.
Zapier + AI steps
Handle the rule-based routing and triggers in Zapier, then hand off to an AI step for summarization, classification, or recommendation. Good for modeling the boundary between the two layers.	OpenAI API (structured outputs)
Use function calling or JSON mode to force the agent's output into a structured schema — critical for M&A fit scores, reorder recommendations, or supplier risk ratings that feed downstream systems.
Make (formerly Integromat)
Visual workflow builder for the deterministic layer — conditional routing, data transformation, and API calls. Connect to an external agent platform or AI module for the reasoning step.	tiktoken
Count tokens before sending data to the agent. Essential for this assignment's required calculations: how many tokens does the full dataset cost vs. only the flagged exceptions?
Airtable + AI Extensions
Structured database with AI fields. Automate data ingestion into Airtable with rules, then use AI extension fields to run the agent-style classification or scoring directly in the table.	Python (rule engine)
The deterministic layer: explicit if/elif logic that filters, scores, and routes data before it ever touches the agent. Keeps AI calls minimal and the rule-based boundary crystal clear.
Retool + AI
Low-code internal tools platform. Build a dashboard where the rule-based layer populates a table, and an AI component provides the agent's interpretation or recommendation on flagged rows.	Pandas
Process supply chain CSVs, financial datasets, or M&A target lists in the rule-based layer. Compute derived fields, flag anomalies, and pass only the relevant rows to the agent for interpretation.
Shopify Flow + external agent
Use Shopify Flow for all deterministic e-commerce rules (inventory thresholds, order routing), then send flagged events to an external AI agent via webhook for interpretation.	Prefect / Airflow
Orchestrate the full hybrid pipeline as a DAG. Each task is a discrete step — data ingestion, rule-based filtering, agent reasoning, action execution — making the boundary between layers explicit and auditable.
Parabola
Visual data pipeline for the ETL layer. Pull and transform supplier or financial data with no code, then route the structured output to your agent platform for AI reasoning.	SQLite / PostgreSQL
Persistent storage for the rule-based layer. Store transaction records, deal pipelines, or inventory snapshots; query with SQL to generate the structured context the agent receives.

