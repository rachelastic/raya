# Places — Circles

Clickable mobile prototype of **Circles**, a feature for Places (by Raya): small circles of members who share curated taste in restaurants, hotels, and travel.

## Run

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`). The UI renders in a 390×844 phone frame.

> **If `npm run dev` hangs** with no URL: this folder sits on **iCloud Desktop**, and Vite’s startup file scan can block for minutes. Use a local copy instead:
>
> ```bash
> cd ~/Projects/raya
> npm run dev
> ```

## Flow

1. **Intro** — Concentric-circle placement reveal → Enter  
2. **Circle Home** — Curator Drop + Noted carousel; Save toggles; Invite new members  
3. **Invite members** — Suggest someone → send to Curator for approval  
4. **Invite pending** — Awaiting Isabelle’s approval (required gate)  

Reveal clustering lives in `src/data/members.ts` and `src/data/conclaveMatching.ts`.
