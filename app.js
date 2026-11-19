(function () {
  "use strict";

  const state = {
    ageValue: "",
    ageUnit: "months",
    le: "neg",
    nitrite: "neg",
    freshSample: true,
    goodClinical: false,
    outOfScope: false,
    triggers: []
  };

  const els = {
    ageValue: document.getElementById("ageValue"),
    ageUnit: document.getElementById("ageUnit"),
    ageBracketBadge: document.getElementById("ageBracketBadge"),
    outOfScopeCheck: document.getElementById("outOfScopeCheck"),
    scopeAlert: document.getElementById("scopeAlert"),
    dipstickCard: document.getElementById("dipstickCard"),
    dipstickRecTag: document.getElementById("dipstickRecTag"),
    table2Modifiers: document.getElementById("table2Modifiers"),
    freshSampleRow: document.getElementById("freshSampleRow"),
    freshSampleCheck: document.getElementById("freshSampleCheck"),
    goodClinicalRow: document.getElementById("goodClinicalRow"),
    goodClinicalCheck: document.getElementById("goodClinicalCheck"),
    prevUtiRow: document.getElementById("prevUtiRow"),
    verdictCard: document.getElementById("verdictCard"),
    verdictSeverity: document.getElementById("verdictSeverity"),
    verdictCitations: document.getElementById("verdictCitations"),
    verdictTitle: document.getElementById("verdictTitle"),
    verdictSummary: document.getElementById("verdictSummary"),
    verdictActions: document.getElementById("verdictActions"),
    verdictNotePreview: document.getElementById("verdictNotePreview"),
    copyNoteBtn: document.getElementById("copyNoteBtn"),
    copyFeedback: document.getElementById("copyFeedback"),
    resetBtn: document.getElementById("resetBtn")
  };

  function getAgeInMonths() {
    const raw = parseFloat(state.ageValue);
    if (isNaN(raw) || raw < 0) return null;
    switch (state.ageUnit) {
      case "days":
        return raw / 30.4375;
      case "weeks":
        return (raw * 7) / 30.4375;
      case "months":
        return raw;
      case "years":
        return raw * 12;
      default:
        return null;
    }
  }

  function getAgeInDays() {
    const raw = parseFloat(state.ageValue);
    if (isNaN(raw) || raw < 0) return null;
    switch (state.ageUnit) {
      case "days":
        return raw;
      case "weeks":
        return raw * 7;
      case "months":
        return raw * 30.4375;
      case "years":
        return raw * 365.25;
      default:
        return null;
    }
  }

  function evaluate() {
    const months = getAgeInMonths();
    const days = getAgeInDays();
    const triggers = Array.from(document.querySelectorAll(".culture-trigger:checked")).map((cb) => cb.value);
    state.triggers = triggers;

    els.scopeAlert.classList.toggle("hidden", !state.outOfScope);

    if (months === null) {
      els.ageBracketBadge.textContent = "Enter age";
      els.dipstickCard.classList.add("hidden");
      renderVerdict({
        theme: "verdict-neutral",
        severity: "AWAITING INPUT",
        citations: "NICE NG224",
        title: "Enter the child's age above to view NG224 testing rules",
        summary: "Select days, weeks, months, or years, or tap a quick age bracket preset.",
        actions: [],
        noteText: ""
      });
      return;
    }

    const ageDisplay = `${state.ageValue} ${state.ageUnit}`;

    // Upper age boundary (>= 16 years)
    if (months >= 192) {
      els.ageBracketBadge.textContent = "≥ 16 Years (Adult)";
      els.dipstickCard.classList.add("hidden");
      renderVerdict({
        theme: "verdict-amber",
        severity: "OUTSIDE PAEDIATRIC GUIDELINE",
        citations: "NICE NG224 Scope / SIGN 160 / NG109",
        title: "Age ≥16 years: Apply adult UTI guidelines",
        summary: "NICE NG224 covers babies, children, and young people from birth up to 16 years.",
        actions: [
          "Switch to adult UTI pathways (SIGN 160 / NICE NG109 / UKHSA Adult Quick Reference Tools).",
          "Check pregnancy status and local empirical antimicrobial guidance."
        ],
        noteText: `UTI Assessment (${ageDisplay}): Patient aged ≥16y — outside NICE NG224 paediatric scope; apply adult UTI pathway.`
      });
      return;
    }

    // Group 1: Under 3 months
    if (months < 3) {
      const isNeonate = days !== null && days <= 28;
      els.ageBracketBadge.textContent = isNeonate ? "Neonate (≤28 days)" : "Infant < 3 Months";
      els.dipstickCard.classList.add("hidden");

      const actions = [
        "DO NOT rely on urine dipstick testing to exclude or diagnose UTI in infants <3 months.",
        "Immediately refer to paediatric specialist care (Recs 1.1.3 & 1.2.2).",
        "Obtain a clean-catch urine specimen (or SPA/catheter if indicated) and send for URGENT microscopy and culture before antibiotics (Recs 1.1.3 & 1.1.21).",
        "Manage in line with NICE Fever in Under 5s (NG143) and suspected sepsis guidance (NG51 / Rec 1.1.8)."
      ];
      if (isNeonate) {
        actions.unshift("NEONATAL ALERT (≤28 days corrected gestational age): Assess and manage in line with NICE Neonatal Infection guideline NG195 (Rec 1.1.9).");
      }

      renderVerdict({
        theme: "verdict-red",
        severity: "URGENT PAEDIATRIC REFERRAL",
        citations: isNeonate ? "NICE NG224 Recs 1.1.3, 1.1.9, 1.1.21, 1.2.2" : "NICE NG224 Recs 1.1.3, 1.1.21, 1.2.2",
        title: "Infant <3 months: Do NOT dipstick — Refer immediately & send urgent culture",
        summary: "Dipstick urinalysis is unreliable in infants under 3 months and carries a high risk of invasive bacterial infection/urosepsis.",
        actions,
        noteText: `Paediatric UTI Triage (NICE NG224) | Age: ${ageDisplay} (<3 months${isNeonate ? ", neonate ≤28d" : ""})
• Dipstick: Not indicated (<3m)
• Action: Immediate paediatric specialist referral + urgent pre-antibiotic urine microscopy & culture (Recs 1.1.3, 1.1.21, 1.2.2).`
      });
      return;
    }

    // Show dipstick card for 3 months to < 16 years
    els.dipstickCard.classList.remove("hidden");
    const isUnder3Years = months < 36;
    const lePos = state.le === "pos";
    const nitPos = state.nitrite === "pos";

    if (isUnder3Years) {
      els.ageBracketBadge.textContent = "3 Months to < 3 Years";
      els.dipstickRecTag.textContent = "Rec 1.1.19";
      els.table2Modifiers.classList.add("hidden");
      els.prevUtiRow.classList.add("hidden");

      if (lePos || nitPos) {
        const dipLabel = `LE ${lePos ? "+" : "−"} / Nitrite ${nitPos ? "+" : "−"}`;
        renderVerdict({
          theme: "verdict-red",
          severity: "TREAT & SEND CULTURE",
          citations: "NICE NG224 Recs 1.1.19 & 1.1.21",
          title: `Positive dipstick (${dipLabel}): Start antibiotics AND send culture`,
          summary: "In children aged 3 months to <3 years, a positive result for either leukocyte esterase OR nitrite warrants empirical antibiotic treatment and laboratory culture.",
          actions: [
            "Send urine sample for microscopy and culture BEFORE starting antibiotics (Recs 1.1.11, 1.1.19, 1.1.21).",
            "Initiate empirical antibiotics according to upper vs lower UTI clinical differentiation (Recs 1.1.25–1.1.26, 1.2.5–1.2.6) and local formulary.",
            "Consider paediatric specialist referral if acute upper UTI (pyelonephritis) or high/intermediate risk of serious illness (Recs 1.2.1, 1.2.4)."
          ],
          noteText: `Paediatric UTI Triage (NICE NG224) | Age: ${ageDisplay} (3m to <3y) | Dipstick: ${dipLabel}
• Action: Empirical antibiotics started + pre-treatment urine sent for microscopy & culture (Recs 1.1.19, 1.1.21).`
        });
      } else {
        const hasTrigger = triggers.length > 0;
        renderVerdict({
          theme: hasTrigger ? "verdict-amber" : "verdict-green",
          severity: hasTrigger ? "NO EMPIRICAL ANTIBIOTICS • SEND CULTURE" : "DO NOT TREAT OR CULTURE",
          citations: hasTrigger ? "NICE NG224 Recs 1.1.19 & 1.1.21" : "NICE NG224 Rec 1.1.19",
          title: hasTrigger
            ? "Dipstick negative (LE − / Nitrite −), but Rec 1.1.21 trigger present: Send culture"
            : "Dipstick negative (LE − / Nitrite −): Do NOT give antibiotics or send culture",
          summary: hasTrigger
            ? "Although both dipstick markers are negative, at least one clinical culture trigger in Recommendation 1.1.21 applies."
            : "When both leukocyte esterase and nitrite are negative in a child aged 3 months to <3 years without Rec 1.1.21 risk triggers, UTI is unlikely.",
          actions: hasTrigger
            ? [
                `Send urine sample for microscopy and culture due to: ${triggers.join("; ")} (Rec 1.1.21).`,
                "Withhold routine lower-UTI antibiotics unless clinical criteria strongly indicate serious illness/pyelonephritis (Rec 1.1.23).",
                "Assess for alternative non-urinary causes of illness."
              ]
            : [
                "Do NOT prescribe antibiotics for UTI (Rec 1.1.19).",
                "Do NOT send urine for microscopy and culture (Rec 1.1.19).",
                "Explore alternative causes of fever/illness (NICE Fever in Under 5s NG143) and provide safety-netting advice."
              ],
          noteText: `Paediatric UTI Triage (NICE NG224) | Age: ${ageDisplay} (3m to <3y) | Dipstick: LE − / Nitrite −
• Action: ${hasTrigger ? `No routine antibiotics; urine sent for culture per Rec 1.1.21 (${triggers.join(", ")}).` : "No UTI antibiotics and no urine culture required (Rec 1.1.19)."}`
        });
      }
      return;
    }

    // Group 3: 3 Years to < 16 Years (Table 2)
    els.ageBracketBadge.textContent = "≥ 3 Years (< 16y)";
    els.dipstickRecTag.textContent = "Rec 1.1.20 (Table 2)";
    els.prevUtiRow.classList.remove("hidden");

    const showFresh = !lePos && nitPos;
    const showGoodClin = lePos && !nitPos;
    els.table2Modifiers.classList.toggle("hidden", !(showFresh || showGoodClin));
    els.freshSampleRow.classList.toggle("hidden", !showFresh);
    els.goodClinicalRow.classList.toggle("hidden", !showGoodClin);

    // Case 3A: LE+ and Nitrite+
    if (lePos && nitPos) {
      const needCulture = triggers.length > 0;
      renderVerdict({
        theme: "verdict-red",
        severity: needCulture ? "ASSUME UTI • TREAT & CULTURE" : "ASSUME UTI • TREAT (NO CULTURE NEEDED)",
        citations: "NICE NG224 Rec 1.1.20 (Table 2) & Rec 1.1.21",
        title: "LE + and Nitrite +: Assume UTI and prescribe antibiotics",
        summary: needCulture
          ? "Both leukocyte esterase and nitrite are positive, and a culture trigger is present."
          : "In children ≥3 years with both LE and nitrite positive and no high-risk/recurrent triggers, dipstick testing is diagnostically as useful as microscopy and culture.",
        actions: needCulture
          ? [
              "Start empirical antibiotics per upper vs lower UTI guidance (Recs 1.2.5–1.2.6).",
              `Send pre-treatment urine for culture due to: ${triggers.join("; ")} (Table 2 / Rec 1.1.21).`
            ]
          : [
              "Start empirical antibiotics per upper vs lower UTI guidance (Recs 1.2.5–1.2.6).",
              "Routine urine culture is NOT required unless high/intermediate risk of serious illness, previous/recurrent UTI, or upper UTI is present (Table 2)."
            ],
        noteText: `Paediatric UTI Triage (NICE NG224) | Age: ${ageDisplay} (≥3y) | Dipstick: LE + / Nitrite +
• Action: Assume UTI and start empirical antibiotics (Table 2). ${needCulture ? `Culture sent (${triggers.join(", ")}).` : "Culture not routinely required."}`
      });
      return;
    }

    // Case 3B: LE- and Nitrite+
    if (!lePos && nitPos) {
      const isFresh = state.freshSample;
      renderVerdict({
        theme: isFresh ? "verdict-red" : "verdict-amber",
        severity: isFresh ? "TREAT & SEND CULTURE" : "SEND CULTURE • REPEAT FRESH SAMPLE",
        citations: "NICE NG224 Rec 1.1.20 (Table 2) & Rec 1.1.21",
        title: isFresh
          ? "LE − and Nitrite + (Fresh sample): Start antibiotics AND send culture"
          : "LE − and Nitrite + (Not confirmed fresh): Send culture; verify fresh specimen",
        summary: isFresh
          ? "Isolated nitrite positivity on a fresh urine sample indicates bacterial nitrate reduction; treat empirically and confirm with culture."
          : "Nitrite positivity on a non-fresh/stored sample may reflect bacterial overgrowth after voiding.",
        actions: isFresh
          ? [
              "Give empirical antibiotics (fresh urine sample tested) (Table 2).",
              "Send urine sample for microscopy and culture; adjust therapy once sensitivities return (Table 2 / Rec 1.1.21)."
            ]
          : [
              "Send urine sample for microscopy and culture (Rec 1.1.21).",
              "Obtain a fresh clean-catch specimen before initiating empirical antibiotics unless clinically unwell."
            ],
        noteText: `Paediatric UTI Triage (NICE NG224) | Age: ${ageDisplay} (≥3y) | Dipstick: LE − / Nitrite + (${isFresh ? "fresh sample" : "not fresh"})
• Action: ${isFresh ? "Empirical antibiotics started + urine sent for culture (Table 2)." : "Send culture and obtain fresh specimen (Table 2)."}`
      });
      return;
    }

    // Case 3C: LE+ and Nitrite-
    if (lePos && !nitPos) {
      const hasGoodClin = state.goodClinical;
      renderVerdict({
        theme: hasGoodClin ? "verdict-amber" : "verdict-blue",
        severity: hasGoodClin ? "SEND CULTURE • TREAT ON CLINICAL EVIDENCE" : "SEND CULTURE • WITHHOLD ANTIBIOTICS",
        citations: "NICE NG224 Rec 1.1.20 (Table 2) & Rec 1.1.21",
        title: hasGoodClin
          ? "LE + and Nitrite − (Good clinical evidence): Send culture & start antibiotics"
          : "LE + and Nitrite −: Send culture — Do NOT give antibiotics unless clear UTI signs",
        summary: "Isolated pyuria (LE+) without nitrites may represent a UTI (e.g. non-nitrate-reducing organism or short bladder dwell time) OR inflammation/infection outside the urinary tract.",
        actions: hasGoodClin
          ? [
              "Send urine sample for microscopy and culture (Table 2 / Rec 1.1.21).",
              "Start empirical antibiotics based on good clinical evidence of UTI (Table 2)."
            ]
          : [
              "Send urine sample for microscopy and culture (Table 2 / Rec 1.1.21).",
              "Do NOT start empirical antibiotics unless there is good clinical evidence of a UTI (Table 2).",
              "Evaluate for alternative extra-urinary causes of pyuria/fever (e.g. vulvovaginitis, appendicitis, viral illness)."
            ],
        noteText: `Paediatric UTI Triage (NICE NG224) | Age: ${ageDisplay} (≥3y) | Dipstick: LE + / Nitrite −
• Action: Urine sent for microscopy & culture (Table 2). ${hasGoodClin ? "Empirical antibiotics started due to good clinical evidence of UTI." : "Antibiotics withheld pending culture; assess extra-urinary causes."}`
      });
      return;
    }

    // Case 3D: LE- and Nitrite- in >= 3 years
    const hasTrigger = triggers.length > 0;
    renderVerdict({
      theme: hasTrigger ? "verdict-amber" : "verdict-green",
      severity: hasTrigger ? "NO EMPIRICAL ANTIBIOTICS • SEND CULTURE" : "ASSUME NO UTI • DO NOT TREAT OR CULTURE",
      citations: hasTrigger ? "NICE NG224 Rec 1.1.20 (Table 2) & Rec 1.1.21" : "NICE NG224 Rec 1.1.20 (Table 2)",
      title: hasTrigger
        ? "LE − and Nitrite −, but Rec 1.1.21 trigger present: Send culture"
        : "LE − and Nitrite −: Assume no UTI — Do NOT treat or culture",
      summary: hasTrigger
        ? "Dipstick is negative, but a Recommendation 1.1.21 clinical trigger requires laboratory culture."
        : "In children ≥3 years, negative leukocyte esterase and negative nitrite reliably exclude UTI in the absence of Rec 1.1.21 triggers.",
      actions: hasTrigger
        ? [
            `Send urine sample for microscopy and culture due to: ${triggers.join("; ")} (Rec 1.1.21).`,
            "Do not start routine empirical lower-UTI antibiotics; explore alternative diagnoses."
          ]
        : [
            "Assume the child does NOT have a UTI (Table 2).",
            "Do NOT prescribe antibiotics for UTI and do NOT send a urine culture (Table 2).",
            "Explore other possible causes of the child's symptoms."
          ],
      noteText: `Paediatric UTI Triage (NICE NG224) | Age: ${ageDisplay} (≥3y) | Dipstick: LE − / Nitrite −
• Action: ${hasTrigger ? `No routine antibiotics; urine sent for culture per Rec 1.1.21 (${triggers.join(", ")}).` : "Assume no UTI; no antibiotics and no culture required (Table 2)."}`
    });
  }

  function renderVerdict({ theme, severity, citations, title, summary, actions, noteText }) {
    els.verdictCard.className = `verdict-card ${theme}`;
    els.verdictSeverity.textContent = severity;
    els.verdictCitations.textContent = citations;
    els.verdictTitle.textContent = title;
    els.verdictSummary.textContent = summary;

    els.verdictActions.innerHTML = "";
    actions.forEach((act) => {
      const li = document.createElement("li");
      li.textContent = act;
      els.verdictActions.appendChild(li);
    });

    if (noteText) {
      els.verdictNotePreview.textContent = noteText;
      els.verdictNotePreview.classList.remove("hidden");
      els.copyNoteBtn.disabled = false;
    } else {
      els.verdictNotePreview.textContent = "";
      els.verdictNotePreview.classList.add("hidden");
      els.copyNoteBtn.disabled = true;
    }
    els.copyFeedback.textContent = "";
  }

  // Event Listeners
  els.ageValue.addEventListener("input", (e) => {
    state.ageValue = e.target.value;
    evaluate();
  });

  els.ageUnit.addEventListener("change", (e) => {
    state.ageUnit = e.target.value;
    evaluate();
  });

  els.outOfScopeCheck.addEventListener("change", (e) => {
    state.outOfScope = e.target.checked;
    evaluate();
  });

  els.freshSampleCheck.addEventListener("change", (e) => {
    state.freshSample = e.target.checked;
    evaluate();
  });

  els.goodClinicalCheck.addEventListener("change", (e) => {
    state.goodClinical = e.target.checked;
    evaluate();
  });

  document.querySelectorAll(".culture-trigger").forEach((cb) => {
    cb.addEventListener("change", evaluate);
  });

  document.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const field = btn.dataset.field;
      const val = btn.dataset.val;
      state[field] = val;
      document.querySelectorAll(`.seg-btn[data-field="${field}"]`).forEach((b) => {
        b.classList.toggle("active", b === btn);
      });
      evaluate();
    });
  });

  document.querySelectorAll(".preset-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.ageValue = chip.dataset.val;
      state.ageUnit = chip.dataset.unit;
      els.ageValue.value = state.ageValue;
      els.ageUnit.value = state.ageUnit;
      evaluate();
    });
  });

  // Tab navigation
  document.querySelectorAll(".tab-btn").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      document.querySelectorAll(".tab-btn").forEach((t) => {
        const active = t === tab;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.toggle("hidden", panel.id !== `tab-${target}`);
      });
    });
  });

  // Copy clinical note
  els.copyNoteBtn.addEventListener("click", async () => {
    const text = els.verdictNotePreview.textContent;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      els.copyFeedback.textContent = "Copied to clipboard";
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      els.copyFeedback.textContent = "Copied to clipboard";
    }
  });

  // Reset
  els.resetBtn.addEventListener("click", () => {
    state.ageValue = "";
    state.ageUnit = "months";
    state.le = "neg";
    state.nitrite = "neg";
    state.freshSample = true;
    state.goodClinical = false;
    state.outOfScope = false;

    els.ageValue.value = "";
    els.ageUnit.value = "months";
    els.outOfScopeCheck.checked = false;
    els.freshSampleCheck.checked = true;
    els.goodClinicalCheck.checked = false;
    document.querySelectorAll(".culture-trigger").forEach((cb) => {
      cb.checked = false;
    });
    document.querySelectorAll(".seg-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.val === "neg");
    });
    evaluate();
  });

  // Register Service Worker for offline PWA support
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  evaluate();
})();
