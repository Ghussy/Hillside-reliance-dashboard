# Google Sheets intake handoff

The public intake form writes each valid submission to a private Google Sheet.
Supabase remains a best-effort mirror for the existing case dashboard, so a
paused Supabase project does not prevent the Sheet from receiving submissions.

## Ownership

- Google account: `hillsideselfreliance@gmail.com`
- [Intake response spreadsheet](https://docs.google.com/spreadsheets/d/1OLC56VH3rFAgqLTz6SF2ErYeLD5mscUrYBaKJJWN_DE/edit)
- [Bound Apps Script project](https://script.google.com/d/1UOgdiUU2mw2LsgOYAPMi8sjFy5dfOB6tuvYSyImpS-CovCrLTsJ0gXyH/edit)
- Response tab: `Intake Responses`

The Sheet and script are owned by the dedicated account rather than a personal
account. To hand the system to another person, give them control of this Google
account and update its password and recovery settings together.

## Application configuration

The deployed application needs these server-only environment variables:

```env
GOOGLE_SHEETS_INTAKE_WEBHOOK_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
GOOGLE_SHEETS_INTAKE_WEBHOOK_SECRET=generated-secret
```

Do not prefix either variable with `NEXT_PUBLIC_`. The URL and secret must only
be used by the server route. The Apps Script stores the matching secret in the
`INTAKE_WEBHOOK_SECRET` script property.

## Normal operation

1. The website validates the submitted form.
2. The server sends the submission to the Apps Script webhook.
3. The script verifies the shared secret and appends a row to the Sheet.
4. The server attempts the existing Supabase write without blocking success if
   Supabase is paused or unavailable.

The webhook prevents formula injection, serializes simultaneous submissions,
and ignores duplicate submission IDs.

## Updating the Apps Script

The source of record is `Code.gs` and `appsscript.json` in this directory. After
updating the deployed script, create a new deployment version:

1. Open the bound Apps Script project.
2. Select **Deploy**, then **Manage deployments**.
3. Edit the web app deployment and choose **New version**.
4. Deploy it as the account owner, with access set to **Anyone**.

Updating an existing deployment keeps its `/exec` URL. If a replacement
deployment creates a new URL, update `GOOGLE_SHEETS_INTAKE_WEBHOOK_URL` in the
application host and redeploy the website.

## Rotating the secret

Generate a new random secret, update the Apps Script property and the
application's `GOOGLE_SHEETS_INTAKE_WEBHOOK_SECRET`, then redeploy the website.
Never put the secret in this repository or directly in `Code.gs`.

## Privacy

Keep the spreadsheet private to authorized ward leaders. The webhook itself is
reachable without Google sign-in so the website server can call it, but it
rejects requests without the shared secret.
