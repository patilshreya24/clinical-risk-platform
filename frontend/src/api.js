const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("clinicToken");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

// =========================
// Patients
// =========================

export async function getPatients() {
  const response = await fetch(
    `${API_BASE_URL}/patients`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch patients");
  }

  return response.json();
}


export async function getPatient(patientId) {
  const response = await fetch(
    `${API_BASE_URL}/patients/${patientId}`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch patient: ${response.status}`
    );
  }

  return response.json();
}


export async function createPatient(patientData) {
  const response = await fetch(
    `${API_BASE_URL}/patients`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(patientData),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.detail ||
        `Failed to create patient: ${response.status}`
    );
  }

  return response.json();
}


// =========================
// Risk Predictions
// =========================

export async function getRiskPredictions() {
  const response = await fetch(
    `${API_BASE_URL}/risk-predictions`,{headers: {
  ...getAuthHeaders(),
},}
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch risk predictions: ${response.status}`
    );
  }

  return response.json();
}


export async function getPatientRiskPredictions(
  patientId
) {
  const response = await fetch(
    `${API_BASE_URL}/patients/${patientId}/risk-predictions`,{headers: {
  ...getAuthHeaders(),
},}
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch patient risk predictions: ${response.status}`
    );
  }

  return response.json();
}


export async function getLatestRiskAssessment(
  patientId
) {
  const response = await fetch(
    `${API_BASE_URL}/patients/${patientId}/risk-assessment`,{headers: {
  ...getAuthHeaders(),
},}
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch risk assessment: ${response.status}`
    );
  }

  return response.json();
}


export async function predictRisk(assessmentData) {
  const response = await fetch(
    `${API_BASE_URL}/predict-risk`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(assessmentData),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.detail ||
        `Risk prediction failed: ${response.status}`
    );
  }

  return response.json();
}


// =========================
// Anomaly Detection
// =========================

export async function detectAnomaly(patientId) {
  const response = await fetch(
    `${API_BASE_URL}/detect-anomaly`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        patient_id: patientId,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.detail ||
        `Anomaly detection failed: ${response.status}`
    );
  }

  return response.json();
}


export async function getPatientAnomalies(
  patientId
) {
  const response = await fetch(
    `${API_BASE_URL}/patients/${patientId}/anomalies`,{headers: {
  ...getAuthHeaders(),
},}
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch anomalies: ${response.status}`
    );
  }

  return response.json();
}


// =========================
// SHAP Explainability
// =========================

export async function explainRisk(patientId) {
  const response = await fetch(
    `${API_BASE_URL}/explain-risk`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        patient_id: patientId,
      }),
    }
  );

  if (!response.ok) {
    const errorData =
      await response.json().catch(() => ({}));

    throw new Error(
      errorData.detail ||
        `Explanation failed: ${response.status}`
    );
  }

  return response.json();
}


// =========================
// Backward-compatible aliases
// =========================

// These keep existing pages working
// without changing their imports.

export const detectPatientAnomaly =
  detectAnomaly;

export const explainPatientRisk =
  explainRisk;

// =========================
// Clinic Authentication
// =========================

export async function clinicLogin(email, password) {
  const response = await fetch(
    `${API_BASE_URL}/clinic/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.detail ||
        `Login failed: ${response.status}`
    );
  }

  return response.json();
}

export async function clinicRegister(registrationData) {
  const response = await fetch(
    `${API_BASE_URL}/clinic/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrationData),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.detail ||
        `Registration failed: ${response.status}`
    );
  }

  return response.json();
}