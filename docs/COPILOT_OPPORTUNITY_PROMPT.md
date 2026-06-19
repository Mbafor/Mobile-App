# Copilot Prompt — Generate Opportunity JSON

Paste the prompt below into Copilot Chat (or any AI assistant), replacing the `[DESCRIPTION]` placeholder with a short description of the opportunity. Copilot will return a ready-to-paste JSON block for the **Paste opportunities** screen.

---

## Prompt

```
Generate a JSON object for the following opportunity and return it inside a JSON array.

Opportunity: [DESCRIPTION]

Use exactly these fields:

{
  "title": "",           // full opportunity name
  "organization": "",    // issuing body / company / institution
  "description": "",     // 2-3 sentence summary of what it is and who it's for
  "deadline": "",        // application deadline in YYYY-MM-DD format
  "applyUrl": "",        // direct application URL
  "imageUrl": "",        // banner or logo image URL (leave "" if unknown)
  "category": "",        // pick ONE: Internship | Scholarship | Fellowship | Graduate Programme | Job (Full-time) | Job (Part-time) | Volunteer | Research Opportunity | Exchange Programme | Bootcamp & Training | Grant & Funding | Competition & Award
  "country": "",         // host country name (e.g. "South Africa") or "Global" for worldwide
  "tags": [],            // 1-3 items from: Technology & Innovation | Research & Academia | Entrepreneurship | Leadership & Management | Creative Arts & Design | Community & Social Impact | Finance & Investment | Healthcare & Wellness | Sustainability & Environment | Data & Analytics | Policy & Governance | Marketing & Branding
  "fundingType": "",     // fully_funded | partially_funded | self_funded
  "degreeLevels": [],    // any of: high_school | bachelors | masters | phd | professional
  "locationType": ""     // remote | onsite | hybrid
}

Return only the JSON array, no explanation.
```

---

## Example output

```json
[
  {
    "title": "Mastercard Foundation Scholars Program",
    "organization": "Mastercard Foundation",
    "description": "A fully funded scholarship for academically talented yet financially disadvantaged young Africans to study at leading universities. Scholars receive tuition, accommodation, mentorship, and leadership development.",
    "deadline": "2026-03-31",
    "applyUrl": "https://mastercardfdn.org/scholars",
    "imageUrl": "",
    "category": "Scholarship",
    "country": "Global",
    "tags": ["Leadership & Management", "Research & Academia", "Community & Social Impact"],
    "fundingType": "fully_funded",
    "degreeLevels": ["bachelors", "masters"],
    "locationType": "onsite"
  }
]
```

Copy the output and paste it directly into the **Admin → Paste opportunities (JSON)** screen.
