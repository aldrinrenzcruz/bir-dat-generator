const email_recipient = "esubmission@bir.gov.ph";
const form_name = "1701Q";

const UI = {
  first_name: document.querySelector("#first-name"),
  middle_name: document.querySelector("#middle-name"),
  last_name: document.querySelector("#last-name"),
  registered_address: document.querySelector("#registered-address"),
  tin: document.querySelector("#tin"),
  rdo: document.querySelector("#rdo"),
  year: document.querySelector("#year"),
  quarter_filing: document.querySelector("#quarter-filing"),
  first_month_income: document.querySelector("#first-month-income"),
  second_month_income: document.querySelector("#second-month-income"),
  third_month_income: document.querySelector("#third-month-income"),
  generate_preview_btn: document.querySelector("#generate-preview-btn"),

  first_month_section: document.querySelector("#first-month-section"),
  first_dat_file_name: document.querySelector("#first-dat-file-name"),
  first_dat_file_content: document.querySelector("#first-dat-file-content"),

  second_month_section: document.querySelector("#second-month-section"),
  second_dat_file_name: document.querySelector("#second-dat-file-name"),
  second_dat_file_content: document.querySelector("#second-dat-file-content"),

  third_month_section: document.querySelector("#third-month-section"),
  third_dat_file_name: document.querySelector("#third-dat-file-name"),
  third_dat_file_content: document.querySelector("#third-dat-file-content"),
  third_email_subject: document.querySelector("#third-email-subject"),
  third_email_content: document.querySelector("#third-email-content")
}

// Auto Select Current Quarter
window.addEventListener("DOMContentLoaded", () => {
  const savableElements = document.querySelectorAll("[data-save-local='true']");
  savableElements.forEach(el => {
    const id = el.id;
    if (!id) return;
    const savedValue = localStorage.getItem(id);
    if (savedValue !== null) {
      el.value = savedValue;
    }
    el.addEventListener("input", () => {
      localStorage.setItem(id, el.value);
    });
  });

  const quarterSelect = document.getElementById("quarter-filing");
  if (!quarterSelect) return;
  const month = new Date().getMonth();   // 0 = Jan, 11 = Dec
  let quarter;
  if (month <= 2) quarter = "4th";       // Jan–Mar → File for Q4
  else if (month <= 5) quarter = "1st";  // Apr–Jun → File for Q1
  else if (month <= 8) quarter = "2nd";  // Jul–Sep → File for Q2
  else quarter = "3rd";                  // Oct–Dec → File for Q3
  quarterSelect.value = quarter;

  // Auto Populate Year
  if (UI.year.value === "") {
    UI.year.value = new Date().getFullYear();
  }

  updatePreviewButtonState();
});

// Auto Format TIN Number
document.addEventListener("DOMContentLoaded", function () {
  UI.tin.addEventListener("paste", function (e) {
    setTimeout(formatTIN, 0);
  });
  UI.tin.addEventListener("blur", formatTIN);

  function formatTIN() {
    let value = UI.tin.value.replace(/\D/g, "");

    // If less than 13 digits, pad with zeros
    if (value.length < 13) {
      value = value.padEnd(13, "0");
    } else if (value.length > 13) {
      // If more than 13 digits, trim to 13
      value = value.slice(0, 13);
    }

    // Format with dashes: 111-111-111-0000
    const formattedValue = value.replace(/(\d{3})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4");

    // Only update if the value is different to avoid cursor jumping
    if (UI.tin.value !== formattedValue) {
      UI.tin.value = formattedValue;
    }
  }

  // Initial format if there's a value already
  if (UI.tin.value) {
    formatTIN();
  }
});

function validateRequiredFields() {
  let requiredFields = ["first-name", "middle-name", "last-name", "registered-address", "tin", "rdo", "year"];
  let allFieldsValid = true;
  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      allFieldsValid = false;
    }
  });
  const firstMonthIncome = UI.first_month_income.value.trim();
  const secondMonthIncome = UI.second_month_income.value.trim();
  const thirdMonthIncome = UI.third_month_income.value.trim();
  if (!firstMonthIncome && !secondMonthIncome && !thirdMonthIncome) {
    allFieldsValid = false;
  }
  return allFieldsValid;
}

function updatePreviewButtonState() {
  if (validateRequiredFields()) {
    UI.generate_preview_btn.disabled = false;
    UI.generate_preview_btn.classList.remove("bg-blue-300", "cursor-not-allowed");
    UI.generate_preview_btn.classList.add("bg-blue-600", "hover:bg-blue-700");
  } else {
    UI.generate_preview_btn.disabled = true;
    UI.generate_preview_btn.classList.remove("bg-blue-600", "hover:bg-blue-700");
    UI.generate_preview_btn.classList.add("bg-blue-300", "cursor-not-allowed");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updatePreviewButtonState();
  document.querySelectorAll("input, select").forEach(input => {
    input.addEventListener("input", updatePreviewButtonState);
    input.addEventListener("change", updatePreviewButtonState);
  });
  if (!validateRequiredFields()) {
    UI.generate_preview_btn.disabled = true;
    UI.generate_preview_btn.classList.remove("bg-blue-600", "hover:bg-blue-700");
    UI.generate_preview_btn.classList.add("bg-blue-300", "cursor-not-allowed");
  }
});

UI.generate_preview_btn.addEventListener("click", function () {
  document.querySelectorAll("input").forEach(input => input.value = input.value.trim());
  document.querySelector("#email-template-section").classList.remove("hidden");

  let tin_without_dashes = UI.tin.value.replaceAll("-", "");
  let actual_tin = tin_without_dashes.substring(0, 9);
  // Check if there are meaningful digits after position 9
  if (tin_without_dashes.length > 9) {
    const remaining = tin_without_dashes.substring(9);
    // Find the last significant digit (non-zero) in the remaining part
    let lastSignificantIndex = -1;
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i] !== '0') {
        lastSignificantIndex = i;
      }
    }
    // If there are significant digits after position 9, include them
    if (lastSignificantIndex !== -1) {
      actual_tin += remaining.substring(0, lastSignificantIndex + 1);
    }
  }

  let year = UI.year.value;
  let first_month = getMonth(1);
  let second_month = getMonth(2);
  let third_month = getMonth(3);
  let first_month_income = UI.first_month_income.value;
  let second_month_income = UI.second_month_income.value;
  let third_month_income = UI.third_month_income.value;

  first_month_income ? UI.first_month_section.classList.remove("hidden") : UI.first_month_section.classList.add("hidden");
  second_month_income ? UI.second_month_section.classList.remove("hidden") : UI.second_month_section.classList.add("hidden");
  third_month_income ? UI.third_month_section.classList.remove("hidden") : UI.third_month_section.classList.add("hidden");

  UI.first_dat_file_name.innerHTML = `${tin_without_dashes}${first_month}${year}${form_name}.DAT`
  UI.first_dat_file_content.innerHTML =
    `HSAWT,H1701Q,${actual_tin},0000,"","${UI.last_name.value.toUpperCase()}","${UI.first_name.value.toUpperCase()}","${UI.middle_name.value.toUpperCase()}",${first_month}/${year},${UI.rdo.value}
DSAWT,D1701Q,1,000352232,0000,"PHILIPPINE PORTS AUTHORITY",,,,${first_month}/${year},,WI010,5.00,${first_month_income},${(first_month_income * 0.05).toFixed(2)}
CSAWT,C1701Q,${actual_tin},0000,${first_month}/${year},${first_month_income},${(first_month_income * 0.05).toFixed(2)}`;

  UI.second_dat_file_name.innerHTML = `${tin_without_dashes}${second_month}${year}${form_name}.DAT`
  UI.second_dat_file_content.innerHTML =
    `HSAWT,H1701Q,${actual_tin},0000,"","${UI.last_name.value.toUpperCase()}","${UI.first_name.value.toUpperCase()}","${UI.middle_name.value.toUpperCase()}",${second_month}/${year},${UI.rdo.value}
DSAWT,D1701Q,1,000352232,0000,"PHILIPPINE PORTS AUTHORITY",,,,${second_month}/${year},,WI010,5.00,${second_month_income},${(second_month_income * 0.05).toFixed(2)}
CSAWT,C1701Q,${actual_tin},0000,${second_month}/${year},${second_month_income},${(second_month_income * 0.05).toFixed(2)}`;

  UI.third_dat_file_name.innerHTML = `${tin_without_dashes}${third_month}${year}${form_name}.DAT`
  UI.third_dat_file_content.innerHTML =
    `HSAWT,H1701Q,${actual_tin},0000,"","${UI.last_name.value.toUpperCase()}","${UI.first_name.value.toUpperCase()}","${UI.middle_name.value.toUpperCase()}",${third_month}/${year},${UI.rdo.value}
DSAWT,D1701Q,1,000352232,0000,"PHILIPPINE PORTS AUTHORITY",,,,${third_month}/${year},,WI010,5.00,${third_month_income},${(third_month_income * 0.05).toFixed(2)}
CSAWT,C1701Q,${actual_tin},0000,${third_month}/${year},${third_month_income},${(third_month_income * 0.05).toFixed(2)}`;

  UI.third_email_subject.innerHTML = `<strong>Subject:</strong> <span class="uppercase">SAWT ${form_name} ${actual_tin}, ${UI.rdo.value}, ${UI.last_name.value}, ${UI.first_name.value} ${UI.middle_name.value}, ${UI.quarter_filing.value} QUARTER OF ${year}</span>`;
  UI.third_email_content.innerHTML =
    `<div class="uppercase"><strong>TIN:</strong> ${UI.tin.value}
<strong>NAME OF TAXPAYER:</strong> ${UI.last_name.value.toUpperCase()}, ${UI.first_name.value.toUpperCase()} ${UI.middle_name.value.toUpperCase()}
<strong>REGISTERED ADDRESS:</strong> ${UI.registered_address.value}
<strong>FORM TYPE:</strong> ${form_name}
<strong>QUARTER FILING:</strong> ${UI.quarter_filing.value.toUpperCase()} QUARTER OF ${year}
<strong>RDO:</strong> ${UI.rdo.value}
</div>
Best regards,
${UI.first_name.value} ${UI.last_name.value}`;

  function getMonth(month_num) {
    let quarter = UI.quarter_filing.value;
    if (quarter === "1st") {
      if (month_num === 1) {
        return "01"
      } else if (month_num === 2) {
        return "02"
      } else if (month_num === 3) {
        return "03"
      }
    } else if (quarter === "2nd") {
      if (month_num === 1) {
        return "04"
      } else if (month_num === 2) {
        return "05"
      } else if (month_num === 3) {
        return "06"
      }
    } else if (quarter === "3rd") {
      if (month_num === 1) {
        return "07"
      } else if (month_num === 2) {
        return "08"
      } else if (month_num === 3) {
        return "09"
      }
    } else if (quarter === "4th") {
      if (month_num === 1) {
        return "10"
      } else if (month_num === 2) {
        return "11"
      } else if (month_num === 3) {
        return "12"
      }
    }
  }
});

function downloadDAT(nameId, contentId) {
  const nameEl = document.getElementById(nameId);
  const contentEl = document.getElementById(contentId);

  if (!nameEl || !contentEl) return;

  const fileName = nameEl.textContent.trim() || 'output.DAT';
  const fileContent = contentEl.textContent;

  const blob = new Blob([fileContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.DAT') ? fileName : `${fileName}.DAT`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function confirmReset() {
  const confirmResult = confirm("Are you sure you want to reset all data?");
  if (confirmResult) {
    localStorage.clear();
    location.reload();
    return true;
  }
}