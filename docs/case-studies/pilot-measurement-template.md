# MenusQR Pilot Measurement Protocol & Audit Template

**Standard Field Instrumentation Sheet for Restaurant Pilot Programs**
*Document Ref: MQR-PILOT-LOG-V2*

---

## 1. Pilot Overview & Restaurant Intake Form

| Field | Detail |
| :--- | :--- |
| **Restaurant Name** | |
| **Outlet Location / City** | |
| **Owner / General Manager** | |
| **Contact Phone / Email** | |
| **Service Model** | [ ] Dine-In Casual &nbsp; [ ] Fine Dining &nbsp; [ ] Dhaba &nbsp; [ ] Café / QSR |
| **Total Table Count / Seats** | Tables: ______ &nbsp; Seats: ______ |
| **Active MenusQR Plan** | [ ] Basic (₹199/mo) &nbsp; [ ] Intermediate (₹299/mo) &nbsp; [ ] Premium (₹899/mo) |
| **Selected Signature Theme** | |
| **Pilot Duration** | 4 Weeks (Start Date: ___________ &nbsp; End Date: ___________) |

---

## 2. Pre-Pilot Operational Baseline (Pre-MenusQR)

Capture historical data prior to digital menu deployment to establish a verified baseline:

1. **Physical Menu Economics:**
   * Number of physical menu cards/booklets maintained: _________ copies.
   * Average reprint frequency: [ ] Monthly &nbsp; [ ] Quarterly &nbsp; [ ] Biannual &nbsp; [ ] Ad-hoc.
   * Average cost per reprint batch (Printing + Gloss/Matt Lamination): ₹____________.
   * Annualized menu printing expenditure: ₹____________.
2. **Menu Maintenance Agility:**
   * Time required to change a dish price on paper menus: [ ] Pen scribble (Instant but untidy) &nbsp; [ ] Sticker/Tape patch (1–2 days) &nbsp; [ ] Full Reprint (5–10 days).
   * Frequency of temporary dish stock-outs (items unavailable): ________ times/week.
   * Method of notifying diners of 86'd (sold out) items: ____________________________________.
3. **Service Friction & Guest Interaction:**
   * Average waiter trips per table strictly to hand over and collect menus: ________ trips.
   * Frequency of portion inquiries ("Quarter/Half/Full plate kitna hai?"): ________ per shift.
   * Average wait time for guest to receive bill after requesting: ________ minutes.

---

## 3. Four-Week Staged Pilot Protocol

```
+---------------------------------------------------------------------------------+
| Week 0: Provisioning & Staff Setup                                              |
| - Excel/CSV import of dishes, dietary tags (Veg/Non-Veg, Jain), portion options |
| - 24K gold brushed QR standees affixed to tables with corresponding table codes |
| - Staff 15-minute walkthrough: explaining scan flow to diners                   |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
| Week 1: Soft Launch (Digital Menu Viewing)                                      |
| - Diners scan QR with native phone camera (zero app download)                   |
| - Track scan volume in MenusQR Analytics (/api/app/analytics)                   |
| - Monitor staff feedback on table handovers                                    |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
| Week 2: Feature Activation & Operations                                         |
| - Test "Sold Out Today" toggle during peak evening service                      |
| - Test instant price adjustment via Owner Mobile Web Portal                     |
| - Activate Google Reviews footer integration (if add-on selected)               |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
| Week 3: Ordering & Reception Integration (Premium Plan Only)                    |
| - Enable Direct Table Ordering with table codes                                 |
| - Connect kitchen reception tablet/screen with audio chime alert                |
| - Route "Call Waiter" and "Request Bill" requests to reception                  |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
| Week 4: Audit Reconciliation & ROI Summary                                      |
| - Calculate direct printing savings                                             |
| - Measure update speed and menu visit analytics                                 |
| - Complete Owner & Staff Qualitative Questionnaire                              |
+---------------------------------------------------------------------------------+
```

---

## 4. Weekly Pilot Log & Metrics Tracking

| Week | Total Menu Scans | Instant Menu Edits Made | Out-of-Stock Toggles | Online Orders Placed (Premium) | Average Service Latency | Incident / Issue Notes |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **W1** | | | | | | |
| **W2** | | | | | | |
| **W3** | | | | | | |
| **W4** | | | | | | |

---

## 5. Quantitative Verification Ledger

At the end of the 30-day pilot period, complete this verified financial comparison:

| Metric Category | Pre-Pilot Baseline | Post-Pilot (MenusQR) | Delta / Verifiable Net Benefit |
| :--- | :--- | :--- | :--- |
| **Monthly Menu Printing & Lamination** | ₹_______________ | ₹0.00 | Saved: ₹_______________ |
| **Price Update Latency** | _____ Days | ~10 Seconds | Latency reduced by _____% |
| **Unserved "Sold Out" Orders** | _____ per week | 0 (Hidden instantly) | Prevents diner disappointment |
| **Physical Menu Maintenance Time** | _____ Hours/month | ~15 Mins/month | Staff redeployed to hospitality |
| **Total Software Cost Incurred** | N/A | Basic: ₹199 / Inter: ₹299 / Prem: ₹899 | Net Monthly Financial Impact: +₹_________ |

---

## 6. Qualitative Staff & Customer Feedback Checklist

### Owner / Manager Interview
* **Menu Agility:** "How quickly were you able to update seasonal dishes or market price changes?"
  *Rating (1–5):* [ ] 1 &nbsp; [ ] 2 &nbsp; [ ] 3 &nbsp; [ ] 4 &nbsp; [ ] 5
  *Notes:* _________________________________________________________________________
* **Aesthetic Presentation:** "Did the selected signature theme align with your restaurant's interior brand?"
  *Rating (1–5):* [ ] 1 &nbsp; [ ] 2 &nbsp; [ ] 3 &nbsp; [ ] 4 &nbsp; [ ] 5
  *Notes:* _________________________________________________________________________

### Service Staff Interview
* **Customer Friction:** "Did guests experience any difficulty scanning the QR code or browsing without an app?"
  *Observations:* __________________________________________________________________
* **Clarity of Portions:** "Did the Half/Full portion buttons reduce order confusion at the table?"
  *Observations:* __________________________________________________________________

---

## 7. Pilot Sign-Off & Consent

We confirm that the metrics recorded above represent genuine operational observations from the pilot deployment of MenusQR.

* **Restaurateur Signature:** __________________________________ &nbsp;&nbsp;&nbsp;&nbsp; **Date:** _______________
* **MenusQR Field Representative:** _________________________ &nbsp;&nbsp;&nbsp;&nbsp; **Date:** _______________
