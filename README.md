# ClearHealth AI: Making Healthcare Prices Agent-Ready | WebMCP
## Overview

ClearHealth AI is a healthcare price-transparency application enhanced with WebMCP, allowing AI agents to interact directly with structured healthcare claims data through well-defined tools.

The project originally began as a healthcare claims and Machine-Readable File (MRF) coding challenge. It has been extended for the WebMCP Challenge to demonstrate how an existing healthcare application can become more useful when both people and AI agents can interact with the same underlying healthcare data.

Instead of requiring an AI agent to navigate the user interface, guess which controls to use, or extract information from the page, the application exposes structured healthcare capabilities through WebMCP.

## Live Application

Production:
[Live App](https://frontend-challenge-1-delta.vercel.app/)

The application is deployed on Vercel and can be tested using a WebMCP-enabled browser.

---

## Why WebMCP is a Strong Fit

Healthcare price transparency is a strong fit for WebMCP because users often need to search, compare, and summarize structured pricing information rather than simply browse a webpage. Traditional web interfaces are designed primarily for humans, requiring an AI agent to understand the interface and determine how to perform these tasks.

This project exposes three meaningful healthcare capabilities through WebMCP: searching claims, comparing procedure prices, and summarizing provider claims. These operations have clearly defined inputs and structured outputs, making them natural capabilities for an AI agent to invoke.

For example, instead of an agent navigating the application to compare prices for a procedure, it can call `compare_healthcare_prices` with a procedure code and receive the relevant billed, allowed, and paid statistics. Similarly, an agent can search claims or obtain a provider summary without relying on UI navigation or screen scraping.

This creates a human-and-agent experience where people can continue using the visual healthcare application while agents can directly access the application's meaningful capabilities. WebMCP therefore turns the website from a human-only interface into an interface that can be used by both humans and AI agents.


# What People and Agents Can Do Together

The application is designed around a shared human-and-agent experience.

## People can

- Explore healthcare claims through the web interface.
- Search healthcare information.
- Compare procedure prices.
- Review billed, allowed, and paid amounts.
- Examine provider-level information.
- Understand differences between billed, allowed, and paid amounts.

## AI agents can

- Search healthcare claims programmatically.
- Search by provider.
- Search by procedure code.
- Search by place of service.
- Compare healthcare prices for a procedure.
- Calculate aggregate billed, allowed, and paid amounts.
- Calculate differences between billed, allowed, and paid amounts.
- Summarize claims for a provider.

This allows a user to ask an AI agent a healthcare price question while the agent uses the website's structured capabilities to retrieve and analyze the underlying claims data.



# WebMCP Tools

The application currently exposes three WebMCP tools.

## 1. Search Healthcare Claims

### Tool Name

`search_healthcare_claims`

### Purpose

Search the healthcare claims dataset using one or more optional filters.

### Inputs

- `providerName`
- `procedureCode`
- `placeOfService`

### Example

```json
{
  "providerName": "Michael Poole"
}
```
Here is your text converted into cleanly structured, highly scannable Markdown format.
### Returns
The tool returns matching claims including:

* Claim ID
* Provider name
* Procedure code
* Billed amount
* Allowed amount
* Paid amount
* Place of service
* Service date
* Claim status

The tool reports the total number of matches and returns up to 50 matching claim records.
## 2. Compare Healthcare Prices
### Tool Name
```
compare_healthcare_prices
```
### Purpose
Compare healthcare prices for a specific procedure code.
### Input

* procedureCode

Example:
```json
{
  "procedureCode": "s5301"
}
```
### Returns
The tool calculates:

* Number of matching claims
* Billed amounts: Average, Minimum, Maximum, and Total
* Allowed amounts: Average, Minimum, Maximum, and Total
* Paid amounts: Average, Minimum, Maximum, and Total

It also calculates:

* Billed minus allowed
* Allowed minus paid
* Billed minus paid

The tool returns the providers associated with the procedure.

## 3. Summarize Provider Claims## Tool Name
```
summarize_provider_claims
```

### Purpose
Provide an aggregate summary of healthcare claims for a provider.
### Input

* providerName

Example:
```json
{
  "providerName": "Michael Poole"
}
```
### Returns

* Provider name
* Claim count
* Total billed amount
* Total allowed amount
* Total paid amount
* Average allowed amount
* Procedures associated with the provider

## WebMCP Implementation
The WebMCP implementation is located at:
```
 frontend/src/webmcp/tools.ts
 ```
The application registers the tools through: 
```typescript
document.modelContext.registerTool(...)
```
Each tool defines:

* A unique tool name
* A human-readable title
* A description
* A structured input schema
* A read-only annotation
* An asynchronous execution function

The application first checks whether WebMCP is available:
```typescript
if (!("modelContext" in document)) {
  console.warn("WebMCP is not available in this browser.");
  return;
}
```

* Data Layer: The healthcare claims data is loaded through the application's claims data layer and reused across tool calls.
* Read-Only: The tools are read-only and do not modify the underlying healthcare claims dataset.

## Example Agent Workflow
A user could ask an agent: "Find the claims for Michael Poole."

* The agent can use: search_healthcare_claims

The user could then ask: "How much was billed versus allowed versus paid for procedure s5301?"

* The agent can use: compare_healthcare_prices

The user could then ask: "Give me a summary of Michael Poole's claims."

* The agent can use: summarize_provider_claims

Key Difference: The agent does not have to infer these operations from the user interface. The website explicitly exposes these capabilities as structured tools.

## Healthcare Price Transparency
The application works with healthcare claims information including:

* Provider
* Procedure code
* Place of service
* Billed amount
* Allowed amount
* Paid amount
* Service date
* Claim status

Example Claim Instance:

* Provider: Michael Poole
* Procedure: s5301
* Place of Service: Outpatient Hospital
* Billed: $4,703.20
* Allowed: $2,383.32
* Paid: $1,054.56

The application calculates financial differences to provide extra context:

* Billed - Allowed
* Allowed - Paid
* Billed - Paid

## Original ClearHealth Challenge
This project originated from a ClearHealth coding challenge focused on healthcare claims and Machine-Readable Files (MRFs).
The original challenge focuses on:

* Claims CSV upload
* CSV parsing
* Claims validation
* Claims approval
* Healthcare claims presentation
* MRF generation
* MRF file listing
* Public MRF access
* Application architecture and documentation

Documentation Links:

* The original challenge documentation remains available in: [RUBRIC.md](./RUBRIC.md)
* The application design documentation is available in: [DESIGN.md](./DESIGN.md)

Note: The WebMCP functionality was added as an extension of the original healthcare claims application for the WebMCP Challenge.

## Technology Stack

| Layer | Technologies Used |
|---|---|
| Frontend | React, TypeScript, Vite, React Router, Mantine, Tailwind CSS |
| Healthcare Data | Structured healthcare claims data, CSV-based sample claims data, PapaParse |
| WebMCP | WebMCP, document.modelContext, document.modelContext.registerTool() |
| Deployment | Vercel |

## Project Structure
```
frontend-challenge-1/
│
├── backend/
│
├── data/
│
├── frontend/
│   ├── public/
│   │   └── sample.csv
│   │
│   └── src/
│       ├── data/
│       │   └── claims.ts
│       │
│       ├── pages/
│       │
│       ├── webmcp/
│       │   └── tools.ts
│       │
│       ├── App.tsx
│       └── routes.tsx
│
├── DESIGN.md
├── LICENSE
├── README.md
└── RUBRIC.md
```

## Running Locally## Prerequisites

* Node.js
* npm

## Install Dependencies
From the repository root:
```
npm install
```
Then install the frontend dependencies:
```
cd frontend
npm install
```
## Start the Frontend
From the frontend directory:
```
npm run dev
```
Vite will provide a local development URL.
## Production Build
From the frontend directory:
```
npm run build
```

* The production build is generated in: frontend/build/
* The build configuration is defined in: frontend/vite.config.ts

## Testing WebMCP
WebMCP can be tested using a browser that supports WebMCP. The application registers its tools through:
```typescript
await document.modelContext.getTools()
```
The available tools should include:

   1. search_healthcare_claims
   2. compare_healthcare_prices
   3. summarize_provider_claims

The tools can then be executed through the browser's WebMCP testing capabilities. For Google Chrome testing, enable WebMCP using the appropriate WebMCP testing configuration.

## Production Verification
The deployed application has been tested on the public Vercel deployment. The following WebMCP capabilities have been verified:

## 1. Search Healthcare Claims (search_healthcare_claims)
Successfully returned a healthcare claim for a provider.

* Provider: Michael Poole
* Procedure: s5301
* Billed: $4,703.20
* Allowed: $2,383.32
* Paid: $1,054.56
* Place of Service: Outpatient Hospital
* Claim Status: Payable

## 2. Compare Healthcare Prices (compare_healthcare_prices)
Successfully returned: Billed/Allowed/Paid amounts, Average/Minimum/Maximum/Total values, payment-difference calculations, and associated providers.
## 3. Summarize Provider Claims (summarize_provider_claims)
Successfully returned: Provider information, claim count, total billed, total allowed, total paid, average allowed, and procedure information.

## Design Documentation
For a detailed explanation of the application's architecture and functionality, see [DESIGN.md](./DESIGN.md)

* Application architecture & flow
* Frontend structure & routing
* Data handling
* WebMCP integration & tool responsibilities
* Error handling
* Deployment & future enhancements

## Open Source
This project is released under the MIT License. See [LICENSE](./LICENSE)

## Hackathon Goal
This project explores how healthcare applications can become more useful when they are designed for both humans and AI agents. The goal is not simply to add an AI interface to an existing healthcare application.
Instead, the application exposes meaningful healthcare capabilities directly to AI agents through WebMCP. This allows agents to interact with structured healthcare claims data while people remain in control of the overall experience.

## Why This Matters

Healthcare price transparency produces valuable data, but valuable data is only useful when people and systems can efficiently access and understand it. WebMCP creates an interface between the healthcare application and AI agents.
Instead of forcing an agent to navigate a visual interface, the website provides explicit capabilities for searching claims, comparing prices, and summarizing providers. This makes the application more suitable for agent-assisted healthcare information discovery.

## Limitations
This project is a demonstration of WebMCP-enabled healthcare price transparency. The current claims dataset is sample/demo data and should not be interpreted as a complete representation of real-world healthcare pricing.

Production implementations would require additional considerations including:

* Authentication and authorization
* Data privacy
* Access controls
* Secure API communication
* Data minimization
* Audit logging
* Healthcare regulatory requirements
* Larger-scale data processing
* Production monitoring

## Disclaimer

This project uses sample healthcare claims data for demonstration purposes.

It is a technical demonstration and should not be used as a source for real-world medical, insurance, billing, or financial decisions.


## Live Demo

[Live Demo](https://youtu.be/iwQJJwHI-lQ)

## License
MIT

