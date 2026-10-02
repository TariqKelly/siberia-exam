# Siberian Induction Exam

The exam page plus one small server function that stores the question bank.

- `public/index.html` — the exam
- `netlify/functions/bank.mjs` — loads and saves the question bank, checks the admin password
- `netlify.toml`, `package.json` — Netlify settings

## Put it online

1. **GitHub:** open your empty repo and click **uploading an existing file**. Drag in everything from this folder (`public`, `netlify`, `netlify.toml`, `package.json`, `README.md`), then click **Commit changes**.
2. **Netlify:** **Add new project → Import an existing project → GitHub**, and pick the repo. Leave the build settings as they are; `netlify.toml` fills them in.
3. **Admin password:** before deploying, open **Add environment variables** on the same screen. Add the key `ADMIN_PASSWORD` with your password as the value. (If you already deployed: **Project configuration → Environment variables**, add it, then **Deploys → Trigger deploy**.)
4. **Deploy.** When it finishes, open the site link.
5. **Nicer link (optional):** **Project configuration → Change project name**, for example `siberia-exam` → `siberia-exam.netlify.app`. Custom domains are under **Domain management**.

## Check it before exam day

1. On the start screen, tap **The Great Republic of Siberia** 4 times and enter your admin password.
2. Change one question's points, then press **Save changes**.
3. Open the site in a private window. The start screen's question count and password question should match your edit.

## Good to know

- Until you save once, cubs get the built-in questions. After that they get whatever you last saved.
- A cub who has already started keeps the questions he started with. Everyone who starts afterwards gets your latest save.
- To change the admin password, update `ADMIN_PASSWORD` in Netlify and trigger a new deploy.
- Each device keeps one cub's attempt. Between cubs, the invigilator holds **reset for next cub** on the result screen.
