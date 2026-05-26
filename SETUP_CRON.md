**Automating GitHub secrets + workflow (safe, local steps)**

- What these scripts do:
  - Generate a cryptographically secure `CRON_SECRET` locally.
  - Set GitHub Actions repository secrets `DEPLOYMENT_URL` and `CRON_SECRET` using the `gh` CLI.
  - Optionally trigger the `cron-release-expired` workflow.

- Files added:
  - `scripts/setup-cron-secrets.ps1` - PowerShell script for Windows.
  - `scripts/setup-cron-secrets.sh` - Bash script for macOS/Linux/WSL.

- Prerequisites:
  - `node` installed for generating a random secret.
  - `gh` installed and authenticated with `gh auth login`.
  - Optional: `vercel` CLI for adding the Vercel env var, or use the Vercel Dashboard.

- Usage (Windows PowerShell):
  - Open PowerShell in the repository root and run:
    - `.\scripts\setup-cron-secrets.ps1`

- Usage (macOS/Linux/WSL):
  - Make script executable and run:
    - `chmod +x scripts/setup-cron-secrets.sh`
    - `./scripts/setup-cron-secrets.sh`

- Vercel env var (manual step):
  - After the scripts set GitHub secrets, add the same `CRON_SECRET` to Vercel:
    - Using Vercel CLI: `vercel env add CRON_SECRET production` and paste the secret when prompted.
    - Using the Dashboard: Project > Settings > Environment Variables > Add `CRON_SECRET`.

Run the appropriate setup script, then trigger `cron-release-expired-debug` from GitHub Actions to verify the endpoint returns HTTP 200.
