import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import "./PatientProfile.css";

const PatientProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    mobileNo: "",
    bloodGroup: "",
    gender: "",
    age: "",
    address: "",
    email: "",
  });
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId =
      localStorage.getItem("userId") || sessionStorage.getItem("userId");

    if (storedUserId) {
      setUserId(storedUserId);
      setFormData((prevData) => ({
        ...prevData,
        email: storedUserId,
      }));
    } else {
      setError("User ID not found. Please log in.");
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchPatientData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/patient/getPatientByEmail?email=${userId}`
        );

        if (response.data) {
          const patientId = response.data.patientId || "";
          localStorage.setItem("patientId", patientId);
          setProfileData(response.data);

          setFormData({
            patientId,
            patientName: response.data.patientName || "",
            mobileNo: response.data.mobileNo || "",
            bloodGroup: response.data.bloodGroup || "",
            gender: response.data.gender || "",
            age: response.data.age || "",
            address: response.data.address || "",
            email: response.data.email || "",
          });
        } else {
          setError("No patient found with this email.");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchPatientData();
  }, [userId]);

  const validateForm = () => {
    const errors = {};
    if (!formData.patientName) errors.patientName = "Name is required.";
    if (!formData.patientId) errors.patientId = "Patient ID is required.";
    if (!formData.mobileNo || !/^\d{10}$/.test(formData.mobileNo))
      errors.mobileNo = "Valid 10-digit mobile number is required.";
    if (!formData.bloodGroup) errors.bloodGroup = "Blood group is required.";
    if (!formData.gender) errors.gender = "Gender is required.";
    if (!formData.age || isNaN(formData.age) || formData.age <= 0)
      errors.age = "Valid age is required.";
    if (!formData.address) errors.address = "Address is required.";
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/patient/addPatient",
        {
          patientId: formData.patientId,
          patientName: formData.patientName,
          mobileNo: formData.mobileNo,
          bloodGroup: formData.bloodGroup,
          gender: formData.gender,
          age: formData.age,
          address: formData.address,
          users2: { email: formData.email },
        }
      );
      setProfileData(response.data);
      alert("Profile saved successfully!");
      navigate("/PatientDashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      setError("Error saving profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="patientProfile">
      <h2>{profileData ? "Edit Patient Profile" : "Create Patient Profile"}</h2>

      {error && <p className="error">{error}</p>}

      {!profileData && (
        <form onSubmit={handleSubmit}>
          <div>
            <input
              name="patientName"
              placeholder="Name"
              value={formData.patientName}
              onChange={handleChange}
            />
            {formErrors.patientName && <p className="error">{formErrors.patientName}</p>}
          </div>
          <div>
            <input
              name="patientId"
              placeholder="Patient ID"
              value={formData.patientId}
              onChange={handleChange}
            />
            {formErrors.patientId && <p className="error">{formErrors.patientId}</p>}
          </div>
          <div>
            <input
              name="mobileNo"
              placeholder="Mobile No"
              value={formData.mobileNo}
              onChange={handleChange}
            />
            {formErrors.mobileNo && <p className="error">{formErrors.mobileNo}</p>}
          </div>
          <div>
            <input
              name="bloodGroup"
              placeholder="Blood Group"
              value={formData.bloodGroup}
              onChange={handleChange}
            />
            {formErrors.bloodGroup && <p className="error">{formErrors.bloodGroup}</p>}
          </div>
          <div>
            <input
              name="gender"
              placeholder="Gender"
              value={formData.gender}
              onChange={handleChange}
            />
            {formErrors.gender && <p className="error">{formErrors.gender}</p>}
          </div>
          <div>
            <input
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
            />
            {formErrors.age && <p className="error">{formErrors.age}</p>}
          </div>
          <div>
            <input
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
            />
            {formErrors.address && <p className="error">{formErrors.address}</p>}
          </div>
          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            readOnly
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      )}

      {profileData && (
        <div className="profile">
          <h3>Patient Profile</h3>
          <p><strong>Name:</strong> {profileData.patientName}</p>
          <p><strong>Patient ID:</strong> {profileData.patientId}</p>
          <p><strong>Mobile No:</strong> {profileData.mobileNo}</p>
          <p><strong>Blood Group:</strong> {profileData.bloodGroup}</p>
          <p><strong>Gender:</strong> {profileData.gender}</p>
          <p><strong>Age:</strong> {profileData.age}</p>
          <p><strong>Address:</strong> {profileData.address}</p>
          <p><strong>Email:</strong> {profileData.email}</p>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
