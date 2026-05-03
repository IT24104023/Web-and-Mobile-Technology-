import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import RoleTabs from "../components/RoleTabs.jsx";
import { registerUser } from "../services/api.js";

const initialCommon = {
  full_name: "",
  email: "",
  password: "",
  confirm_password: "",
  phone: "",
};

const initialPatient = {
  date_of_birth: "",
  gender: "prefer_not_to_say",
  blood_group: "",
  address: "",
  allergies: "",
  medical_notes: "",
};

const initialDoctor = {
  specialization: "",
  license_number: "",
  qualification: "",
  experience: "",
  clinic_name: "",
  working_hours_start: "",
  working_hours_end: "",
};

function RegisterPage() {
  const [role, setRole] = useState("patient");
  const [common, setCommon] = useState(initialCommon);
  const [patient, setPatient] = useState(initialPatient);
  const [doctor, setDoctor] = useState(initialDoctor);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const roleHint = useMemo(() => {
    if (role === "patient") return "Patient profile details";
    if (role === "doctor") return "Doctor profile details";
    return "";
  }, [role]);

  const onCommon = (event) => {
    setCommon((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onPatient = (event) => {
    setPatient((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onDoctor = (event) => {
    setDoctor((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onProfileImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (profileImagePreview) {
      URL.revokeObjectURL(profileImagePreview);
    }

    setProfileImageFile(file);
    setProfileImagePreview(file ? URL.createObjectURL(file) : "");
  };

  useEffect(() => {
    return () => {
      if (profileImagePreview) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (common.password !== common.confirm_password) {
      setError("Passwords do not match. Please confirm your password again.");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("full_name", common.full_name);
      payload.append("email", common.email);
      payload.append("password", common.password);
      payload.append("confirm_password", common.confirm_password);
      payload.append("phone", common.phone);
      payload.append("role", role);

      if (role === "patient") {
        payload.append("patient", JSON.stringify(patient));
        if (profileImageFile) {
          payload.append("profile_image", profileImageFile);
        }
      }

      if (role === "doctor") {
        payload.append("doctor", JSON.stringify(doctor));
      }

      const { data } = await registerUser(payload);
      localStorage.setItem("dent_ai_token", data.token);
      localStorage.setItem("dent_ai_user", JSON.stringify(data.user));
      setMessage(`Registration successful for ${data.user.role}.`);
      setCommon(initialCommon);
      setPatient(initialPatient);
      setDoctor(initialDoctor);
      setProfileImageFile(null);
      setProfileImagePreview("");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join Dent AI">
      <RoleTabs selectedRole={role} onChange={setRole} />
      <p className="role-hint">{roleHint}</p>

      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Full Name
          <input name="full_name" value={common.full_name} onChange={onCommon} required />
        </label>

        <label>
          Email
          <input type="email" name="email" value={common.email} onChange={onCommon} required />
        </label>

        <label>
          Password
          <input type="password" name="password" value={common.password} onChange={onCommon} required />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            name="confirm_password"
            value={common.confirm_password}
            onChange={onCommon}
            required
          />
        </label>

        <label>
          Phone
          <input name="phone" value={common.phone} onChange={onCommon} />
        </label>

        {role === "patient" && (
          <>
            <label>
              Profile Image
              <input type="file" name="profile_image" accept="image/*" onChange={onProfileImageChange} />
            </label>

            {profileImagePreview && (
              <div className="profile-image-preview">
                <span>Selected image preview</span>
                <img src={profileImagePreview} alt="Selected profile preview" />
              </div>
            )}

            <label>
              Date of Birth
              <input type="date" name="date_of_birth" value={patient.date_of_birth} onChange={onPatient} />
            </label>
            <label>
              Gender
              <select name="gender" value={patient.gender} onChange={onPatient}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </label>
            <label>
              Blood Group
              <input name="blood_group" value={patient.blood_group} onChange={onPatient} />
            </label>
            <label>
              Address
              <input name="address" value={patient.address} onChange={onPatient} />
            </label>
            <label>
              Allergies
              <input name="allergies" value={patient.allergies} onChange={onPatient} />
            </label>
            <label>
              Medical Notes
              <textarea name="medical_notes" value={patient.medical_notes} onChange={onPatient} rows="3" />
            </label>
          </>
        )}

        {role === "doctor" && (
          <>
            <label>
              Specialization
              <input name="specialization" value={doctor.specialization} onChange={onDoctor} />
            </label>
            <label>
              License Number
              <input name="license_number" value={doctor.license_number} onChange={onDoctor} />
            </label>
            <label>
              Qualification
              <input name="qualification" value={doctor.qualification} onChange={onDoctor} />
            </label>
            <label>
              Experience (years)
              <input type="number" name="experience" min="0" value={doctor.experience} onChange={onDoctor} />
            </label>
            <label>
              Clinic Name
              <input name="clinic_name" value={doctor.clinic_name} onChange={onDoctor} />
            </label>
            <label>
              Working Hours Start
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <small style={{ color: "#666", fontSize: "11px" }}>Hour</small>
                  <select 
                    value={doctor.working_hours_start.split(":")[0] || ""} 
                    onChange={(e) => {
                      const hour = e.target.value;
                      const minute = doctor.working_hours_start.split(":")[1] || "00";
                      onDoctor({ target: { name: "working_hours_start", value: `${hour}:${minute}` } });
                    }}
                    required
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  >
                    <option value="">Select</option>
                    {Array.from({ length: 14 }, (_, i) => {
                      const hour = String(9 + i).padStart(2, "0");
                      return <option key={hour} value={hour}>{hour}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <small style={{ color: "#666", fontSize: "11px" }}>Minute</small>
                  <select 
                    value={doctor.working_hours_start.split(":")[1] || ""} 
                    onChange={(e) => {
                      const hour = doctor.working_hours_start.split(":")[0] || "09";
                      const minute = e.target.value;
                      onDoctor({ target: { name: "working_hours_start", value: `${hour}:${minute}` } });
                    }}
                    required
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  >
                    <option value="">Select</option>
                    {Array.from({ length: 60 }, (_, i) => {
                      const minute = String(i).padStart(2, "0");
                      return <option key={minute} value={minute}>{minute}</option>;
                    })}
                  </select>
                </div>
              </div>
              <small style={{ color: "#666", fontSize: "12px", marginTop: "4px", display: "block" }}>24-hour format | Clinic: 09:00 - 22:00</small>
            </label>
            <label>
              Working Hours End
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <small style={{ color: "#666", fontSize: "11px" }}>Hour</small>
                  <select 
                    value={doctor.working_hours_end.split(":")[0] || ""} 
                    onChange={(e) => {
                      const hour = e.target.value;
                      const minute = doctor.working_hours_end.split(":")[1] || "00";
                      onDoctor({ target: { name: "working_hours_end", value: `${hour}:${minute}` } });
                    }}
                    required
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  >
                    <option value="">Select</option>
                    {Array.from({ length: 14 }, (_, i) => {
                      const hour = String(9 + i).padStart(2, "0");
                      return <option key={hour} value={hour}>{hour}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <small style={{ color: "#666", fontSize: "11px" }}>Minute</small>
                  <select 
                    value={doctor.working_hours_end.split(":")[1] || ""} 
                    onChange={(e) => {
                      const hour = doctor.working_hours_end.split(":")[0] || "09";
                      const minute = e.target.value;
                      onDoctor({ target: { name: "working_hours_end", value: `${hour}:${minute}` } });
                    }}
                    required
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  >
                    <option value="">Select</option>
                    {Array.from({ length: 60 }, (_, i) => {
                      const minute = String(i).padStart(2, "0");
                      return <option key={minute} value={minute}>{minute}</option>;
                    })}
                  </select>
                </div>
              </div>
              <small style={{ color: "#666", fontSize: "12px", marginTop: "4px", display: "block" }}>24-hour format | Clinic: 09:00 - 22:00</small>
            </label>
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : `Register as ${role}`}
        </button>

        {message && <p className="message success">{message}</p>}
        {error && <p className="message error">{error}</p>}

        <p className="switch-link">
          Already registered? <Link to="/login">Back to Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
