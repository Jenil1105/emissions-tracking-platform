# AI Agent Workflow Log

## Agents Used

* **OpenAI Codex**: Primary agent for code generation, refactoring, and restructuring into hexagonal architecture.
* **ChatGPT**: Used for understanding domain concepts (Compliance Balance, Banking, Pooling) and validating system design decisions.

---

## Prompts & Outputs

### Example 1: Refactoring to Hexagonal Architecture

**Prompt**:

> "Refactor this Node.js REST API into hexagonal architecture with clear separation of core, ports, and adapters without changing functionality."

**Output**:
Codex reorganized the codebase into:

* `core/domain` → entities and business rules
* `core/application` → use cases (ComputeCB, Banking, Pooling)
* `ports` → interfaces
* `adapters/inbound/http` → controllers
* `adapters/outbound` → database implementations

**My Role**:
I had initially implemented all features in a monolithic REST structure. The agent helped restructure it, after which I manually verified that business logic remained inside the core layer.

---

### Example 2: Fixing Banking & Pooling Logic (Critical Debugging)

**Prompt**:

> "Implement banking and pooling logic for FuelEU compliance using given schema."

**Output**:

* Banking was incorrectly implemented at a **ship-to-ship level** instead of aggregating at **ship-year level**
* Banked credits were not reusable globally across years
* Pooling logic ignored banked adjustments and operated independently

**Issues Identified**:

* No aggregation of CB across routes → wrong banking granularity
* Banking and pooling were **disconnected systems**
* Applying banking did not affect pooling inputs

**Corrections (Manual Intervention)**:

* Redesigned banking to operate on **ship-year aggregated CB**
* Ensured banked credits are stored and applied **globally per ship**
* Integrated flow:

  ```
  Routes → CB → Banking Adjustment → Adjusted CB → Pooling
  ```
* Updated pooling logic to use **adjusted CB after banking**, ensuring realistic compliance flow

---

### Example 3: Frontend Structure Generation (Detailed Prompt)

**Prompt**:

> "Create a React + TypeScript + TailwindCSS dashboard following hexagonal architecture.
> Requirements:
>
> - 4 tabs: Routes, Compare, Banking, Pooling
> - Routes: table with filters (vesselType, fuelType, year) and baseline selection
> - Compare: show baseline vs other routes, percent difference, compliance status, and a chart
> - Banking: show CB before, applied amount, CB after, and disable actions when CB ≤ 0
> - Pooling: allow selecting ships, validate pool (sum ≥ 0), show before/after CB
> - Keep UI components modular and reusable
> - Use Tailwind for clean, responsive UI
> - Keep business logic outside components (follow adapter pattern)"

**Output**:

* Generated tab-based navigation system
* Created reusable table and card components
* Structured pages corresponding to assignment requirements
* Applied Tailwind styling for responsiveness and layout

**My Role**:

* Ensured UI aligns with backend data flow
* Adjusted component boundaries to match adapter-based architecture
* Verified that no business logic leaked into UI components

---

### Example 4: Tailwind Styling Optimization

**Prompt**:

> "Enhance this dashboard UI using Tailwind CSS with better spacing, modern cards, and responsive layout."

**Output**:

* Improved spacing, typography, and alignment
* Added hover states and visual hierarchy
* Converted raw tables into clean card-based layouts

**My Role**:

* Fine-tuned spacing and responsiveness
* Ensured consistency across all pages

---

## Validation / Corrections

1. **Banking Logic Bug**

   * Agent implemented banking per route/ship incorrectly
   * **Fix**: Converted to ship-year aggregation model

2. **Pooling Disconnection**

   * Pooling ignored banking adjustments
   * **Fix**: Introduced adjusted CB as input to pooling

3. **Architecture Violations**

   * Business logic placed in controllers
   * **Fix**: Moved logic to `core/application` layer

4. **Frontend Logic Leakage**

   * Some calculations suggested inside React components
   * **Fix**: Ensured all calculations are backend-driven

---

## Observations

* **Where agent saved time**

  * Large-scale refactoring into hexagonal architecture
  * Rapid UI scaffolding and Tailwind styling
  * Boilerplate generation for APIs and components

* **Where it failed or hallucinated**

  * Misinterpreted domain rules (banking granularity, pooling constraints)
  * Generated logically incorrect flows for financial-like operations
  * Occasionally over-engineered simple components

* **How I combined tools effectively**

  * Used ChatGPT to deeply understand system behavior and domain rules
  * Used Codex for implementation and restructuring
  * Iteratively validated outputs instead of direct acceptance

---

## Best Practices Followed

* **Build First, Refactor Later**

  * Implemented working REST APIs first, then refactored into hexagonal architecture

* **Strict Separation of Concerns**

  * Ensured domain logic resides only in core layers

* **Targeted Prompting**

  * Used precise prompts for specific tasks (refactor, UI, logic)

* **Manual Domain Validation**

  * Verified CB, banking, and pooling logic independently

* **Iterative Refinement**

  * Treated agent output as a draft, not final code
