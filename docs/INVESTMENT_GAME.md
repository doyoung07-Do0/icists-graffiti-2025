# Investment Game Overview

The Investment Game is a core component of GRAFFITI 2025, designed to match AI startups with student teams through a simulated investment process. The game consists of four rounds (Pre-seed, Seed, Series A, Series B) where student teams listen to startup pitches and submit investment portfolios. At the end of each round, investment returns for each startup are determined, and the teams with the highest total investment amounts gain priority for matching.

## Example of Progression

- Startups: 4 total (Startup1~Startup4)
- Student Teams: 16 total (Team1~Team16)

### Capital Raise

- Initial investment capital is distributed based on a quiz from the VC educational session.

---

## 1. Pre-seed (R1)

**Startup Pitching**
- Each startup presents key keywords (5~6) about the problem they aim to solve.

**Portfolio Submission**
- Teams distribute their initial capital into investment portfolios.
- Example: If Team1 has an initial capital of 100, their portfolio could be: (Startup1, Startup2, Startup3, Startup4, Total) = (10, 30, 20, 40, Total: 100)

**Investment Returns Determination**
- After portfolio submissions, investment returns are randomly determined based on the market size for each startup.
- Example: Team1: (10, 30, 20, 40, Total: 100) → (11, 40, 20, 35, Total: 106)

---

## 2. Seed (R2)

**Startup Pitching**
- Background on problem recognition and the necessity of solving the problem.
- Introduction of products/services addressing the problem.
- Overview of business model and revenue structure, future vision.
- Reasons for growth as a key problem-solving entity in the market.

**Portfolio Submission**
- Teams rebalance their previous round's portfolios.
- Example: Team1: (11, 40, 20, 35, Total: 106) → (5, 20, 40, 41, Total: 106)

**Investment Returns Determination**
- Determined in the same manner as above.
- Example: Team1: (5, 20, 40, 41, Total: 106) → (10, 10, 75, 50, Total: 145)

---

## 3. Series A (R3)

**Startup Pitching**
- Balance between social and commercial values and the startup's stance.
- Initial values pursued at startup foundation.
- Challenges and conflicts between initial vision and actual operations.
- Real-world challenges and the current direction pursued.
- Role of the startup in the social problem-solving ecosystem.

**Portfolio Submission**
- Rebalanced submission as above.

**Investment Returns Determination**
- Determined in the same manner as above.

---

## 4. Series B (R4)

**Startup Pitching (Q&A)**
- Participants are divided into 16 groups, with startups spending 5 minutes answering questions from each group.

**Portfolio Submission**
- Rebalanced submission as above.

**Investment Returns Determination**
- Determined in the same manner as above.

---

## Final Startup-Student Team Matching

- Teams select startups for matching in order of highest final investment capital.

---

## Notes on Investment Return Determination Algorithm

- **Market Size**
    - Larger market size means lower expected returns and volatility (stable investments).
    - Smaller market size means higher expected returns and volatility (high-risk, high-return).
- **Mean Reversion**
    - If returns are negative in the previous round, there is a higher probability of positive returns in the next round, and vice versa.
