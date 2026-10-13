import { addSubmission } from "./storage.js";

export function initSubmit() {
  const form = document.querySelector("#submit-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    const data = new FormData(form);
    const submission = {
      type: data.get("type"),
      message: data.get("message"),
      name: data.get("name") || "Anonymous",
      date: new Date().toISOString(),
    };

    addSubmission(submission);
  });
}
