<div align="center">

# ⚔️ Promptmon: AI Battle Arena

*A browser-based tournament where you create your own fictional creature and battle other players using nothing but your words.*

[**Live App**](https://promptmon.pages.dev) • [**Backend API**](https://promptmon.onrender.com)

---

Developed with ❤️ by [**Hrithvik**](https://github.com/hrithvikcodes)

</div>

<br />

##  What is this?

Promptmon tests two things: **your creativity** and **your ability to think and write strategically**.

First, you design your own creature — the **Promptmon**. Give it a name, a type, abilities, a backstory, whatever you imagine. There are no rules about being "balanced" or "fair." The only judge of your creature is an AI, and it's judging you purely on how original and imaginative it is.

Then the battles start. You don't click buttons or pick moves from a menu. You just **write a prompt describing what your Promptmon does**. An AI narrates what happens. At the end of the fight, another AI reads the whole battle and decides who played it smarter; better strategy, sharper prompts, better use of the scenario you were both given.

So the real skill being tested here is **prompt engineering** — how well you can describe an action, adapt to a situation, and outthink your opponent using just your words.

And it's not just "you win or you lose." After every battle, the AI judge explains its reasoning for **both** sides — so you can see exactly what your opponent did well, and what you could improve next time.

---

##  How a Tournament Works

| Stage | Format | Details |
| :--- | :--- | :--- |
| **Round 1** | **Create your Promptmon** | You design your creature. An AI scores its creativity out of 20. |
| **Round 2** | **Prompt Battle** | You're randomly paired with another player. Both of you get the same battle scenario. You each write a prompt describing your move. An AI narrates the outcome. Once both sides are done, an AI judge compares both performances and picks a winner with a full written explanation. |
| **Round 3** | **Twist Battle** | The winners from Round 2 get paired again, but this time there's a twist — like your strongest move getting disabled, or the weather suddenly changing. Same battle and judging process as Round 2. |
| **Final Round** | **AI Boss Battle** | Whoever wins Round 3 goes on to face a Legendary Promptmon — an AI opponent that has actually studied your past battles and adapts its strategy to counter you specifically. |
| **Leaderboard** | **Real-Time Tracking** | Everyone's scores from every round add up into one public leaderboard, visible to all players in real time. |

> **Note:** Both sides of a battle play at the same time, independently.

---

## 🛠️ Tech Stack

**Frontend**
* React.js (hosted on Cloudflare Pages)

**Backend**
* FastAPI (Python, fully async)
* PostgreSQL (hosted on Supabase)
* SQLAlchemy 2.0 + Alembic for database & migrations
* Groq (running `openai/gpt-oss-120b`) for narration and judging
* Hosted on Render (deployed via Docker)

*Kept deliberately simple — no logins/passwords for players, no WebSockets, no background job queues. Just a clean REST API.*

---

## 🔑 How You're Identified

There's no sign-up or password for players:
* You register with just a team name and get back a private code (`session_id`) that identifies you for the rest of the tournament.
* The admin has one shared password to manage the event (start rounds, end the tournament, etc.) — no separate login system.

---

## 📝 Honest Design Notes

* **Odd Player Counts:** If there's an odd number of players, one gets a "bye" (an automatic advance with no battle) instead of the round getting stuck.
* **One Prompt Limit:** Each battle currently allows just **one prompt per player**, to keep AI usage within rate limits during a live event.
* **No AI Images:** We removed AI-generated creature images — they added real cost per image with no real benefit to gameplay.
* **Race Condition Prevention:** Two players finishing at the exact same moment can't accidentally judge the same battle twice — the backend locks that safely.

---

## 💻 Running Locally

```bash
uv sync
cp .env.example .env   # add your DATABASE_URL, GROQ_API_KEY, ADMIN_PASSWORD, CORS_ALLOWED_ORIGINS
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```
## Deploying

```bash
docker build -t promptmon-backend .
docker run --env-file .env -p 8000:8000 promptmon-backend
```

The container runs database migrations automatically on every start, so
the live database always matches whatever code is deployed.

## 🔄 Resetting Before a Live Event

Old test data never mixes into a real tournament automatically  but if a test tournament was left open, real players could accidentally register into it.

Right before hosting an event:
1. Open the **Admin Dashboard** in your app.
2. Click **Reset for Event**.
3. Verify that the dashboard shows **0 registered teams** before sharing the join link.


---
<p align="center">Crafted with ❤️ by <a href="https://github.com/hrithvikcodes">Hrithvik</a></p>

